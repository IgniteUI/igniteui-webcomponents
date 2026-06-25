import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { isElement } from '../components/common/util.js';
import type { AnimationReferenceMetadata } from './types.js';

const LISTENER_OPTIONS = { once: true } as const;

/**
 * Checks the user's preference for reduced motion.
 */
export function getPrefersReducedMotion(): boolean {
  return globalThis?.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * A ReactiveController for managing Web Animation API (WA-API) playback
 * on a host element or a specified target element.
 *
 * It provides methods to play, stop, and coordinate animations, including
 * support for 'height: auto' transitions and reduced motion preference.
 */
class AnimationController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & HTMLElement;
  private readonly _ref?: Ref<HTMLElement> | HTMLElement;

  /**
   * The actual HTMLElement target for the animations.
   * Prioritizes a passed-in Ref value, then a direct HTMLElement, falling back to the host.
   */
  protected get _target(): HTMLElement {
    if (isElement(this._ref)) {
      return this._ref;
    }

    return this._ref?.value ?? this._host;
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    ref?: Ref<HTMLElement> | HTMLElement
  ) {
    this._host = host;
    this._ref = ref;
    this._host.addController(this);
  }

  /** Pre-processes keyframes, specifically resolving 'auto' height to the element's scrollHeight. */
  private _parseKeyframes(keyframes: Keyframe[]): Keyframe[] {
    const target = this._target;

    return keyframes.map((frame) => {
      return frame.height === 'auto'
        ? { ...frame, height: `${target.scrollHeight}px` }
        : frame;
    });
  }

  /** @internal */
  public hostConnected(): void {}

  /** Plays a sequence of keyframes, first cancelling all existing animations on the target. */
  public async playExclusive(
    animation: AnimationReferenceMetadata
  ): Promise<boolean> {
    await this.cancelAll();

    const event = await this.play(animation);
    return event.type === 'finish';
  }

  /**
   * Plays a sequence of keyframes using WA-API.
   * Automatically sets duration to 0 if 'prefers-reduced-motion' is set.
   */
  public async play(
    animation: AnimationReferenceMetadata
  ): Promise<AnimationPlaybackEvent> {
    const { steps, options } = animation;
    const duration = getPrefersReducedMotion() ? 0 : (options?.duration ?? 0);

    if (!Number.isFinite(duration)) {
      throw new Error('Promise-based animations must be finite.');
    }

    return new Promise<AnimationPlaybackEvent>((resolve) => {
      const animation = this._target.animate(this._parseKeyframes(steps), {
        ...options,
        duration,
      });

      animation.addEventListener('cancel', resolve, LISTENER_OPTIONS);
      animation.addEventListener('finish', resolve, LISTENER_OPTIONS);
    });
  }

  /** Cancels all active animations on the target element. */
  public cancelAll(): Promise<void> {
    for (const animation of this._target.getAnimations()) {
      animation.cancel();
    }

    return Promise.resolve();
  }
}

/**
 * Creates and attaches an animation player instance to the passed in `host` element.
 * The player will run animations on the passed in `target`, or if `target` is undefined,
 * the host element itself.
 */
export function addAnimationController(
  host: ReactiveControllerHost & HTMLElement,
  target?: Ref<HTMLElement> | HTMLElement
): AnimationController {
  return new AnimationController(host, target);
}

export type { AnimationController };

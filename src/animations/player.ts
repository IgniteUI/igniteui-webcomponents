import type { Ref } from 'lit/directives/ref.js';
import { isElement } from '#internals/utils/dom.js';
import type { AnimationReferenceMetadata } from './types.js';

const LISTENER_OPTIONS = { once: true } as const;

/**
 * Checks the user's preference for reduced motion.
 */
export function getPrefersReducedMotion(): boolean {
  return (
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );
}

/**
 * Manages Web Animation API (WA-API) playback on a host element or a specified target element,
 * including support for 'height: auto' transitions and reduced motion preference.
 * It uses no host lifecycle hooks, so it is not registered as a reactive controller.
 */
class AnimationController {
  private readonly _host: HTMLElement;
  private readonly _ref?: Ref<HTMLElement> | HTMLElement;

  /** The passed-in element, else the resolved Ref value, else the host. */
  protected get _target(): HTMLElement {
    if (isElement(this._ref)) {
      return this._ref;
    }

    return this._ref?.value ?? this._host;
  }

  constructor(host: HTMLElement, ref?: Ref<HTMLElement> | HTMLElement) {
    this._host = host;
    this._ref = ref;
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

  /**
   * Plays a sequence of keyframes, first cancelling all existing animations on the target.
   *
   * The cancellation must stay synchronous - awaiting before it would let an
   * animation started earlier in the same tick escape and run to completion.
   */
  public async playExclusive(
    animation: AnimationReferenceMetadata
  ): Promise<boolean> {
    this.cancelAll();

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

    if (
      !(Number.isFinite(duration) && Number.isFinite(options?.iterations ?? 1))
    ) {
      throw new Error('Promise-based animations must be finite.');
    }

    return new Promise<AnimationPlaybackEvent>((resolve) => {
      const player = this._target.animate(this._parseKeyframes(steps), {
        ...options,
        duration,
      });

      player.addEventListener('cancel', resolve, LISTENER_OPTIONS);
      player.addEventListener('finish', resolve, LISTENER_OPTIONS);
    });
  }

  /** Cancels all active animations on the target element. */
  public cancelAll(): void {
    for (const animation of this._target.getAnimations()) {
      animation.cancel();
    }
  }
}

/**
 * Creates an animation player for the passed in `host` element.
 * The player will run animations on the passed in `target`, or if `target` is undefined,
 * the host element itself.
 */
export function addAnimationController(
  host: HTMLElement,
  target?: Ref<HTMLElement> | HTMLElement
): AnimationController {
  return new AnimationController(host, target);
}

export type { AnimationController };

import type { Ref } from 'lit/directives/ref.js';
import { isElement } from '#internals/utils/dom.js';
import type { AnimationReferenceMetadata } from './types.js';

const LISTENER_OPTIONS = { once: true } as const;

export function getPrefersReducedMotion(): boolean {
  return (
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );
}

/**
 * Plays Web Animations API animations on the host or on a target element.
 * It supports 'height: auto' keyframes and reduced motion.
 * It uses no host lifecycle hooks, so it is not registered as a reactive controller.
 */
class AnimationController {
  private readonly _host: HTMLElement;
  private readonly _ref?: Ref<HTMLElement> | HTMLElement;

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

  /** Resolves an 'auto' height to the target's scrollHeight. */
  private _parseKeyframes(keyframes: Keyframe[]): Keyframe[] {
    const target = this._target;

    return keyframes.map((frame) => {
      return frame.height === 'auto'
        ? { ...frame, height: `${target.scrollHeight}px` }
        : frame;
    });
  }

  /**
   * Cancels all animations on the target, then plays the keyframes.
   * The cancel must stay synchronous: an await before it lets an animation
   * started earlier in the same tick run to completion.
   */
  public async playExclusive(
    animation: AnimationReferenceMetadata
  ): Promise<boolean> {
    this.cancelAll();

    const event = await this.play(animation);
    return event.type === 'finish';
  }

  /** Plays the keyframes. Reduced motion sets the duration to 0. */
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

  public cancelAll(): void {
    for (const animation of this._target.getAnimations()) {
      animation.cancel();
    }
  }
}

/**
 * Creates an animation player for `host`.
 * It animates `target`, or the host when `target` is undefined.
 */
export function addAnimationController(
  host: HTMLElement,
  target?: Ref<HTMLElement> | HTMLElement
): AnimationController {
  return new AnimationController(host, target);
}

export type { AnimationController };

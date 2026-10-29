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
   * Resolves `true` when the animation finishes and `signal` is not aborted.
   */
  public async playExclusive(
    animation: AnimationReferenceMetadata,
    signal?: AbortSignal
  ): Promise<boolean> {
    if (signal?.aborted) {
      return false;
    }

    this.cancelAll();

    const event = await this.play(animation, signal);
    return event.type === 'finish' && !signal?.aborted;
  }

  /**
   * Plays the keyframes. Reduced motion sets the duration to 0. An abort of
   * `signal` cancels the animation.
   */
  public async play(
    animation: AnimationReferenceMetadata,
    signal?: AbortSignal
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

      const cancel = () => player.cancel();
      const settle = (event: AnimationPlaybackEvent) => {
        signal?.removeEventListener('abort', cancel);
        resolve(event);
      };

      player.addEventListener('cancel', settle, LISTENER_OPTIONS);
      player.addEventListener('finish', settle, LISTENER_OPTIONS);

      if (signal?.aborted) {
        cancel();
      } else {
        signal?.addEventListener('abort', cancel, LISTENER_OPTIONS);
      }
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

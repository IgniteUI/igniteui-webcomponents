import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';

import { isElement } from '../components/common/util.js';
import type { AnimationReferenceMetadata } from './types.js';

const listenerOptions = { once: true };

function getPrefersReducedMotion() {
  return globalThis?.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class AnimationController implements ReactiveController {
  protected get target() {
    if (isElement(this._target)) {
      return this._target;
    }
    return this._target?.value ?? this.host;
  }

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private _target?: Ref<HTMLElement> | HTMLElement
  ) {
    this.host.addController(this);
  }

  private parseKeyframes(keyframes: Keyframe[]) {
    return keyframes.map((keyframe) => {
      if (!keyframe.height) return keyframe;

      return {
        ...keyframe,
        height:
          keyframe.height === 'auto'
            ? `${this.target.scrollHeight}px`
            : keyframe.height,
      };
    });
  }

  public async play(animation: AnimationReferenceMetadata) {
    const { steps, options } = animation;

    if (options?.duration === Number.POSITIVE_INFINITY) {
      throw new Error('Promise-based animations must be finite.');
    }

    return new Promise<AnimationPlaybackEvent>((resolve) => {
      const animation = this.target.animate(this.parseKeyframes(steps), {
        ...options,
        duration: getPrefersReducedMotion() ? 0 : options!.duration,
      });

      animation.addEventListener('cancel', resolve, listenerOptions);
      animation.addEventListener('finish', resolve, listenerOptions);
    });
  }

  public stopAll() {
    return Promise.all(
      this.target.getAnimations().map((animation) => {
        return new Promise((resolve) => {
          const resolver = () => requestAnimationFrame(resolve);
          animation.addEventListener('cancel', resolver, listenerOptions);
          animation.addEventListener('finish', resolver, listenerOptions);

          animation.cancel();
        });
      })
    );
  }

  public async playExclusive(animation: AnimationReferenceMetadata) {
    const [_, event] = await Promise.all([
      this.stopAll(),
      this.play(animation),
    ]);

    return event.type === 'finish';
  }

  public hostConnected() {}
}

/**
 * Creates and attaches an animation player instance to the passed in `host` element.
 * The player will run animations on the passed in `target`, or if `target` is undefined,
 * the host element itself.
 */
export function addAnimationController(
  host: ReactiveControllerHost & HTMLElement,
  target?: Ref<HTMLElement> | HTMLElement
) {
  return new AnimationController(host, target);
}

type ViewTransitionResult = {
  transition?: ViewTransition;
};

export function startViewTransition(
  callback?: ViewTransitionUpdateCallback
): ViewTransitionResult {
  /* c8 ignore next 4 */
  if (getPrefersReducedMotion() || !document.startViewTransition) {
    callback?.();
    return {};
  }

  return { transition: document.startViewTransition(callback) };
}

export type { AnimationController };

import { nothing } from 'lit';
import { AnimationReferenceMetadata } from './types.js';

export class AnimationPlayer {
  private _defaultCallback = () => nothing;

  private prefersReducedMotion() {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    return query.matches;
  }

  private parseKeyframes(el: HTMLElement, keyframes: Keyframe[]) {
    return keyframes.map((keyframe) => ({
      ...keyframe,
      height:
        keyframe.height === 'auto' ? `${el.scrollHeight}px` : keyframe.height,
    }));
  }

  public async animate(
    el: HTMLElement,
    animation: AnimationReferenceMetadata,
    onDone?: () => void
  ) {
    const { steps, options } = animation;

    // cancel all running animations, useful for togglable elements
    await this.stopAnimations(el);

    return new Promise((resolve) => {
      if (options?.duration === Infinity) {
        throw new Error('Promise-based animations must be finite.');
      }

      const parsedKeyframes = this.parseKeyframes(el, steps);
      const animation = el.animate(parsedKeyframes, {
        ...options,
        duration: this.prefersReducedMotion() ? 0 : options!.duration,
      });

      animation.addEventListener('cancel', resolve, { once: true });
      animation.addEventListener('finish', onDone || this._defaultCallback, {
        once: true,
      });
    });
  }

  private stopAnimations(el: HTMLElement) {
    return Promise.all(
      el.getAnimations().map((animation) => {
        return new Promise((resolve) => {
          const handleAnimationEvent = requestAnimationFrame(resolve);

          animation.addEventListener('cancel', () => handleAnimationEvent, {
            once: true,
          });
          animation.addEventListener('finish', () => handleAnimationEvent, {
            once: true,
          });
          animation.cancel();
        });
      })
    );
  }
}

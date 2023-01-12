import { AnimationReferenceMetadata } from './types.js';

export class AnimationPlayer {
  private target!: HTMLElement;

  constructor(target: HTMLElement) {
    this.target = target;
  }

  private prefersReducedMotion() {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    return query.matches;
  }

  private parseKeyframes(keyframes: Keyframe[]) {
    return keyframes.map((keyframe) => ({
      ...keyframe,
      height:
        keyframe.height === 'auto'
          ? `${this.target.scrollHeight}px`
          : keyframe.height,
    }));
  }

  public async play(animation: AnimationReferenceMetadata) {
    const { steps, options } = animation;

    return new Promise<AnimationPlaybackEvent>((resolve) => {
      if (options?.duration === Infinity) {
        throw new Error('Promise-based animations must be finite.');
      }

      const parsedKeyframes = this.parseKeyframes(steps);
      const animation = this.target.animate(parsedKeyframes, {
        ...options,
        duration: this.prefersReducedMotion() ? 0 : options!.duration,
      });

      animation.addEventListener('cancel', resolve, { once: true });
      animation.addEventListener('finish', resolve, { once: true });
    });
  }

  public stopAll() {
    return Promise.all(
      this.target.getAnimations().map((animation) => {
        return new Promise((resolve) => {
          const handleAnimationEvent = () => requestAnimationFrame(resolve);

          animation.addEventListener('cancel', handleAnimationEvent, {
            once: true,
          });
          animation.addEventListener('finish', handleAnimationEvent, {
            once: true,
          });
          animation.cancel();
        });
      })
    );
  }
}

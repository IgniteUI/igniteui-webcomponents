import { fadeIn, fadeOut } from '#animations/presets/fade/index.js';
import {
  noop,
  slideInHor,
  slideOutHor,
} from '#animations/presets/slide/index.js';
import {
  type AnimationReferenceMetadata,
  animation,
} from '#animations/types.js';
import type {
  HorizontalTransitionAnimation,
  StepperVerticalAnimation,
} from '../../types.js';

/** Plays a step transition. `height` is the collapsed height of a vertical body. */
type StepAnimation = (
  options: KeyframeAnimationOptions,
  height: string
) => AnimationReferenceMetadata;

type StepAnimations = Record<
  StepperVerticalAnimation | HorizontalTransitionAnimation,
  Record<'in' | 'out', StepAnimation>
>;

const growVerIn: StepAnimation = (options, height) =>
  animation(
    [
      { opacity: 1, height },
      { opacity: 1, height: 'auto' },
    ],
    options
  );

const growVerOut: StepAnimation = (options, height) =>
  animation(
    [
      { opacity: 1, height: 'auto' },
      { opacity: 1, height },
    ],
    options
  );

export const bodyAnimations: StepAnimations = {
  grow: { in: growVerIn, out: growVerOut },
  fade: { in: noop, out: noop },
  slide: { in: slideInHor, out: slideOutHor },
  none: { in: noop, out: noop },
};

export const contentAnimations: StepAnimations = {
  grow: { in: fadeIn, out: fadeOut },
  fade: { in: fadeIn, out: fadeOut },
  slide: { in: fadeIn, out: fadeOut },
  none: { in: noop, out: noop },
};

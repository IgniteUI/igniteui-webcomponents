import { EaseOut } from '../../animations/easings.js';
import {
  type AnimationReferenceMetadata,
  animation,
} from '../../animations/types.js';
import type {
  HorizontalTransitionAnimation,
  StepperVerticalAnimation,
} from '../types.js';

const baseOptions: KeyframeAnimationOptions = {
  duration: 320,
  easing: EaseOut.Quad,
};

export type Animation =
  | StepperVerticalAnimation
  | HorizontalTransitionAnimation;

export type AnimationOptions = {
  keyframe: KeyframeAnimationOptions;
  step?: object;
};

const fadeIn = (options: AnimationOptions = { keyframe: baseOptions }) =>
  animation([{ opacity: 0 }, { opacity: 1 }], options.keyframe);

const fadeOut = (options: AnimationOptions = { keyframe: baseOptions }) =>
  animation([{ opacity: 1 }, { opacity: 0 }], options.keyframe);

const slideInHor = (
  options: AnimationOptions = {
    keyframe: baseOptions,
  }
) =>
  animation(
    [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
    options.keyframe
  );

const slideOutHor = (
  options: AnimationOptions = {
    keyframe: baseOptions,
  }
) =>
  animation(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }],
    options.keyframe
  );

const growVerIn = (
  options: AnimationOptions = {
    keyframe: baseOptions,
    step: {},
  }
) =>
  animation(
    [
      { opacity: 1, ...options.step },
      { opacity: 1, height: 'auto' },
    ],
    options.keyframe
  );

const growVerOut = (
  options: AnimationOptions = {
    keyframe: baseOptions,
    step: {},
  }
) =>
  animation(
    [
      { opacity: 1, height: 'auto' },
      { opacity: 1, ...options.step },
    ],
    options.keyframe
  );

const noopAnimation = () => animation([], {});

const animationPair = (animations: {
  in: (options: AnimationOptions) => AnimationReferenceMetadata;
  out: (options: AnimationOptions) => AnimationReferenceMetadata;
}) => {
  return new Map(
    Object.entries({
      in: animations.in,
      out: animations.out,
    })
  );
};

export const bodyAnimations = new Map(
  Object.entries({
    grow: animationPair({
      in: growVerIn,
      out: growVerOut,
    }),
    fade: animationPair({
      in: noopAnimation,
      out: noopAnimation,
    }),
    slide: animationPair({
      in: slideInHor,
      out: slideOutHor,
    }),
    none: animationPair({
      in: noopAnimation,
      out: noopAnimation,
    }),
  })
);

export const contentAnimations = new Map(
  Object.entries({
    grow: animationPair({
      in: fadeIn,
      out: fadeOut,
    }),
    fade: animationPair({
      in: fadeIn,
      out: fadeOut,
    }),
    slide: animationPair({
      in: fadeIn,
      out: fadeOut,
    }),
    none: animationPair({
      in: noopAnimation,
      out: noopAnimation,
    }),
  })
);

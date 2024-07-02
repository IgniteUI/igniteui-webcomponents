import { EaseOut } from '../../animations/easings.js';
import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import {
  slideInHor,
  slideOutHor,
} from '../../animations/presets/slide/index.js';
import { animation } from '../../animations/types.js';

const baseOptions: KeyframeAnimationOptions = {
  duration: 350,
  easing: EaseOut.Quad,
};

const growVerIn = (options = baseOptions) =>
  animation(
    [
      { opacity: 1, height: '32px' },
      { opacity: 1, height: 'auto' },
    ],
    options
  );

const growVerOut = (options = baseOptions) =>
  animation(
    [
      { opacity: 1, height: 'auto' },
      { opacity: 1, height: '32px' },
    ],
    options
  );

const noopAnimation = () => animation([], {});
export type Animation = 'grow' | 'fade' | 'slide' | 'none';
export const animations = new Map(
  Object.entries({
    grow: new Map(
      Object.entries({
        in: growVerIn,
        out: growVerOut,
      })
    ),
    fade: new Map(
      Object.entries({
        in: noopAnimation,
        out: noopAnimation,
      })
    ),
    slide: new Map(
      Object.entries({
        in: slideInHor,
        out: slideOutHor,
      })
    ),
    none: new Map(
      Object.entries({
        in: noopAnimation,
        out: noopAnimation,
      })
    ),
  })
);

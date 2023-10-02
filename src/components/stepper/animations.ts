import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { growVerIn, growVerOut } from '../../animations/presets/grow/index.js';
import {
  slideInHor,
  slideOutHor,
} from '../../animations/presets/slide/index.js';
import { animation } from '../../animations/types.js';

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
        in: fadeIn,
        out: fadeOut,
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

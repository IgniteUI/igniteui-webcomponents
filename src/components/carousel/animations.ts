import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import {
  slideInHor,
  slideOutHor,
} from '../../animations/presets/slide/index.js';
import { animation } from '../../animations/types.js';

const noopAnimation = () => animation([], {});

export const animations = new Map(
  Object.entries({
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

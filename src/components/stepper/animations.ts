import {
  slideInHor,
  slideOutHor,
  fadeIn,
  fadeOut,
  growVerIn,
  growVerOut,
} from '../../animations/index.js';

const horizontalAnimations = new Map(
  Object.entries({
    slide: new Map(
      Object.entries({
        in: slideInHor,
        out: slideOutHor,
      })
    ),
    fade: new Map(
      Object.entries({
        in: fadeIn,
        out: fadeOut,
      })
    ),
  })
);

const verticalAnimations = new Map(
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
  })
);

export { horizontalAnimations, verticalAnimations };

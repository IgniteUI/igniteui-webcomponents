import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { animation } from '../../animations/types.js';

const noopAnimation = () => animation([], {});

const slideInHor = (options: KeyframeAnimationOptions) =>
  animation(
    [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
    options
  );

const slideOutHor = (options: KeyframeAnimationOptions) =>
  animation(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }],
    options
  );

const slideInVer = (options: KeyframeAnimationOptions) =>
  animation(
    [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
    options
  );

const slideOutVer = (options: KeyframeAnimationOptions) =>
  animation(
    [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
    options
  );

export const animations = new Map(
  Object.entries({
    fade: new Map(
      Object.entries({
        in: fadeIn,
        out: fadeOut,
      })
    ),
    slideHor: new Map(
      Object.entries({
        in: slideInHor,
        out: slideOutHor,
      })
    ),
    slideVer: new Map(
      Object.entries({
        in: slideInVer,
        out: slideOutVer,
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

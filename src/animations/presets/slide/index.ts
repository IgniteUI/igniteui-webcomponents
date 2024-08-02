import { EaseInOut } from '../../easings.js';
import { animation } from '../../types.js';

const baseOptions: KeyframeAnimationOptions = {
  duration: 350,
  easing: EaseInOut.Quad,
};

const slideInHor = (options = baseOptions) =>
  animation(
    [
      { transform: 'translateX(100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options
  );

const slideOutHor = (options = baseOptions) =>
  animation(
    [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(-100%)', opacity: 0 },
    ],
    options
  );

export { slideInHor, slideOutHor };

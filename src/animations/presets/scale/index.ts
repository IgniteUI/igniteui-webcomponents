import { EaseOut } from '../../easings.js';
import { animation } from '../../types.js';

const baseOptions: KeyframeAnimationOptions = {
  duration: 350,
  easing: EaseOut.Quad,
};

const scaleInCenter = (options = baseOptions) =>
  animation(
    [
      { transform: 'scale(0)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    options
  );

export { scaleInCenter };

import { EaseOut } from '../../easings.js';
import { animation } from '../../types.js';

const baseOptions: KeyframeAnimationOptions = {
  duration: 350,
  easing: EaseOut.Sine,
};

const fadeIn = (options = baseOptions) =>
  animation([{ opacity: 0 }, { opacity: 1 }], options);

const fadeOut = (options = baseOptions) =>
  animation([{ opacity: 1 }, { opacity: 0 }], options);

export { fadeIn, fadeOut };

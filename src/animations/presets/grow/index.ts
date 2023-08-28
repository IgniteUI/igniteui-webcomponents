import { EaseOut } from '../../easings.js';
import { animation } from '../../types.js';

const baseOptions: KeyframeAnimationOptions = {
  duration: 350,
  easing: EaseOut.Quad,
};

const growVerIn = (options = baseOptions) =>
  animation(
    [
      { opacity: 0, height: 0 },
      { opacity: 1, height: 'auto' },
    ],
    options
  );

const growVerOut = (options = baseOptions) =>
  animation(
    [
      { opacity: 1, height: 'auto' },
      { opacity: 0, height: 0 },
    ],
    options
  );

export { growVerIn, growVerOut };

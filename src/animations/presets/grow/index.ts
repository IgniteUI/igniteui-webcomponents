import { EaseOut } from '../../easings.js';
import { animation } from '../../types.js';

const growVerIn = animation(
  [
    { opacity: 0, height: 0 },
    { opacity: 1, height: 'auto' },
  ],
  {
    duration: 350,
    easing: EaseOut.Quad,
  }
);

const growVerOut = animation(
  [
    { opacity: 1, height: 'auto' },
    { opacity: 0, height: 0 },
  ],
  {
    duration: 350,
    easing: EaseOut.Quad,
  }
);

export { growVerIn, growVerOut };

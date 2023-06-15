import { EaseOut } from '../../easings.js';
import { animation } from '../../types.js';

const fadeIn = animation([{ opacity: 0 }, { opacity: 1 }], {
  duration: 350,
  easing: EaseOut.Sine,
});

const fadeOut = animation([{ opacity: 1 }, { opacity: 0 }], {
  duration: 350,
  easing: EaseOut.Sine,
});

export { fadeIn, fadeOut };

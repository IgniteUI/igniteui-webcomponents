import { EaseOut } from '../../easings.js';
import { animation } from '../../types.js';

const slideInLeft = animation(
  [
    { opacity: 0, transform: 'translateX(-500px)' },
    { opacity: 1, transform: 'translateX(0)' },
  ],
  {
    duration: 350,
    easing: EaseOut.Quad,
  }
);

const slideInRight = animation(
  [
    { opacity: 0, transform: 'translateX(500px)' },
    { opacity: 1, transform: 'translateX(0)' },
  ],
  {
    duration: 350,
    easing: EaseOut.Quad,
  }
);

export { slideInLeft, slideInRight };

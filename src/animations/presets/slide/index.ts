import { animation } from '../../types.js';

const slide =
  (axis: 'X' | 'Y', from: string, to: string) =>
  (options?: KeyframeAnimationOptions) =>
    animation(
      [
        { transform: `translate${axis}(${from})` },
        { transform: `translate${axis}(${to})` },
      ],
      options
    );

const slideInHor = slide('X', '100%', '0');
const slideOutHor = slide('X', '0', '-100%');
const slideInVer = slide('Y', '100%', '0');
const slideOutVer = slide('Y', '0', '-100%');

/** An animation without keyframes, for a disabled transition. */
const noop = () => animation([], {});

export { noop, slideInHor, slideInVer, slideOutHor, slideOutVer };

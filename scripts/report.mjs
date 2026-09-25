// @ts-check
import { stdout } from 'node:process';
import { styleText } from 'node:util';

export default {
  /** @param {string} s */
  error: (s) => console.error(styleText('red', s)),
  /** @param {string} s */
  success: (s) => console.log(styleText('green', s)),
  /** @param {string} s */
  warn: (s) => console.warn(styleText('yellow', s)),
  /** @param {string} s */
  info: (s) => console.log(styleText('cyan', s)),

  stdout: {
    isTTY: Boolean(stdout.isTTY),

    clearLine: () => {
      if (stdout.isTTY) {
        stdout.clearLine(0);
        stdout.cursorTo(0);
      }
    },

    /** @param {string} s */
    plain: (s) => stdout.write(s),
  },
};

import { stdout } from 'node:process';
import { styleText } from 'node:util';

export default {
  error: (s) => console.error(styleText('red', s)),
  success: (s) => console.log(styleText('green', s)),
  warn: (s) => console.warn(styleText('yellow', s)),
  info: (s) => console.log(styleText('cyan', s)),

  stdout: {
    clearLine: () => {
      if (stdout.isTTY) {
        stdout.clearLine(0);
        stdout.cursorTo(0);
      }
    },
    success: (s) => stdout.write(styleText('green', s)),
    warn: (s) => stdout.write(styleText('yellow', s)),
    info: (s) => stdout.write(styleText('cyan', s)),
  },
};

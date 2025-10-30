import { stdout } from 'node:process';
import { format, styleText } from 'node:util';

export default {
  error: (s) => console.error(styleText('red', s)),
  success: (s) => console.info(styleText('green', s)),
  warn: (s) => console.warn(styleText('yellow', s)),
  info: (s) => console.info(styleText('cyan', s)),

  stdout: {
    clearLine: () => {
      stdout.clearLine(0);
      stdout.cursorTo(0);
    },
    success: (s) => stdout.write(format(styleText('green', s))),
    warn: (s) => stdout.write(format(styleText('yellow', s))),
    info: (s) => stdout.write(format(styleText('cyan', s))),
  },
};

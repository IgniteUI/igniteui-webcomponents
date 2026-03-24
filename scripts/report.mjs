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
    plain: (s) => stdout.write(s),
  },
  format: {
    black: (s) => styleText('black', s),
    red: (s) => styleText('red', s),
    green: (s) => styleText('green', s),
    yellow: (s) => styleText('yellow', s),
    blue: (s) => styleText('blue', s),
    magenta: (s) => styleText('magenta', s),
    cyan: (s) => styleText('cyan', s),
    white: (s) => styleText('white', s),
    gray: (s) => styleText('gray', s),
    redBright: (s) => styleText('redBright', s),
    greenBright: (s) => styleText('greenBright', s),
    yellowBright: (s) => styleText('yellowBright', s),
    blueBright: (s) => styleText('blueBright', s),
    magentaBright: (s) => styleText('magentaBright', s),
    cyanBright: (s) => styleText('cyanBright', s),
    whiteBright: (s) => styleText('whiteBright', s),
  },
};

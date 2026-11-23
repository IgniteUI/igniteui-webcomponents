import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { formatColorName } from './color-name.js';
import type { RGB } from './converters.js';
import { type ColorPickerStrings, colorPickerI18nConfig } from './i18n.js';

const strings = colorPickerI18nConfig.defaultEN as ColorPickerStrings;

const byte = fc.integer({ min: 0, max: 255 });
const rgb = fc.tuple(byte, byte, byte);

const LIGHTNESS = ['very dark', 'dark', 'light', 'very light'];
const CHROMA = ['grayish', 'vibrant'];
const HUES = [
  'red',
  'orange',
  'brown',
  'yellow',
  'yellow green',
  'green',
  'cyan',
  'blue',
  'purple',
  'magenta',
  'pink',
  'black',
  'white',
  'gray',
];

const any = (words: string[]) => `(?:${words.join('|')})`;

/** The word orders of English, French and Japanese, and the names they allow. */
const ORDERS: [pattern: string, name: RegExp][] = [
  [
    '{0} {1} {2}',
    new RegExp(`^(?:${any(LIGHTNESS)} )?(?:${any(CHROMA)} )?${any(HUES)}$`),
  ],
  [
    '{2} {0} {1}',
    new RegExp(`^${any(HUES)}(?: ${any(LIGHTNESS)})?(?: ${any(CHROMA)})?$`),
  ],
  ['{0}{1}{2}', new RegExp(`^${any(LIGHTNESS)}?${any(CHROMA)}?${any(HUES)}$`)],
];

describe('Color name properties', () => {
  it('names every 8-bit color with the words in the order of the pattern', () => {
    fc.assert(
      fc.property(rgb, fc.constantFrom(...ORDERS), (color, [pattern, name]) => {
        expect(
          formatColorName(color as RGB, {
            ...strings,
            color_picker_name_pattern: pattern,
          })
        ).to.match(name);
      })
    );
  });

  it('names a color with equal channels black, white or a gray', () => {
    fc.assert(
      fc.property(byte, (channel) => {
        expect(formatColorName([channel, channel, channel], strings)).to.match(
          /^(?:(?:very )?(?:dark|light) )?gray$|^black$|^white$/
        );
      })
    );
  });
});

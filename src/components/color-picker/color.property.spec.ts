import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { expectCloseTo } from '#internals/testing/helpers.spec.js';
import type { ColorFormat } from '../types.js';
import { isValidColor, normalizeColor, parseColor } from './common.js';
import { converter, type RGB } from './converters.js';
import { ColorModel, getContext } from './model.js';

const EPSILON = 1e-6;

const channel = fc.double({ min: 0, max: 255, noNaN: true });
const byte = fc.integer({ min: 0, max: 255 });
const alpha = fc.double({ min: 0, max: 1, noNaN: true });
const rgb = fc.tuple(channel, channel, channel);
const hsl = fc.tuple(
  fc.double({ min: 0, max: 360, maxExcluded: true, noNaN: true }),
  fc.double({ min: 0, max: 100, noNaN: true }),
  fc.double({ min: 0, max: 100, noNaN: true })
);

const number = fc.double({ min: -1000, max: 1000, noNaN: true });

/** Strings shaped like the CSS color syntaxes, and arbitrary strings. */
const colorString = fc.oneof(
  fc.string({ unit: 'grapheme', maxLength: 30 }),
  fc.stringMatching(/^#?[0-9a-fA-F]{0,9}$/),
  fc
    .tuple(
      fc.constantFrom('rgb', 'rgba', 'hsl', 'hsla'),
      fc.array(number, { maxLength: 5 }),
      fc.constantFrom(', ', ' ', ' / ')
    )
    .map(([fn, args, sep]) => `${fn}(${args.join(sep)})`),
  fc.constantFrom('red', 'transparent', 'currentcolor', 'rebeccapurple', 'none')
);

const operation = fc.oneof(
  fc.record({
    key: fc.constantFrom('r', 'g', 'b', 'h', 's', 'l', 'v', 'alpha'),
    value: fc.oneof(number, fc.constantFrom(Infinity, -Infinity)),
  }),
  fc.record({ key: fc.constant('sv'), value: fc.tuple(number, number) })
);

function expectInRange(values: number[], max: number[]) {
  values.forEach((value, i) => {
    expect(Number.isNaN(value), `${values}`).to.be.false;
    expect(value, `${values}`).to.be.within(-EPSILON, max[i] + EPSILON);
  });
}

describe('Color properties', () => {
  const ctx = getContext();

  describe('Converters', () => {
    it('round-trips integer channels through hex exactly', () => {
      fc.assert(
        fc.property(fc.tuple(byte, byte, byte), (value) => {
          const hex = converter.rgb.hex(value);

          expect(hex).to.match(/^[0-9a-f]{6}$/);
          expect(parseColor(`#${hex}`, ctx).value).to.deep.equal(value);
        })
      );
    });

    it('round-trips through HSL and HSV', () => {
      fc.assert(
        fc.property(rgb, (value) => {
          expectCloseTo(
            converter.hsl.rgb(converter.rgb.hsl(value)),
            value,
            EPSILON
          );
          expectCloseTo(
            converter.hsv.rgb(converter.rgb.hsv(value)),
            value,
            EPSILON
          );
        })
      );
    });

    it('converts HSL to the same color directly and through HSV', () => {
      fc.assert(
        fc.property(hsl, (value) => {
          expectCloseTo(
            converter.hsv.rgb(converter.hsl.hsv(value)),
            converter.hsl.rgb(value),
            EPSILON
          );
        })
      );
    });

    it('keeps each converted channel in range', () => {
      fc.assert(
        fc.property(rgb, hsl, (rgbValue, hslValue) => {
          expectInRange(converter.rgb.hsl(rgbValue), [360, 100, 100]);
          expectInRange(converter.rgb.hsv(rgbValue), [360, 100, 100]);
          expectInRange(converter.hsl.rgb(hslValue), [255, 255, 255]);
          expectInRange(converter.hsl.hsv(hslValue), [360, 100, 100]);
        })
      );
    });
  });

  describe('Parsing', () => {
    it('never throws and returns channels in range for any string', () => {
      fc.assert(
        fc.property(colorString, (value) => {
          const { value: channels, alpha: a } = parseColor(value, ctx);

          expectInRange(channels, [255, 255, 255]);
          expectInRange([a], [1]);
        })
      );
    });

    it('returns opaque black for a string that is not a color', () => {
      fc.assert(
        fc.property(colorString, (value) => {
          fc.pre(!isValidColor(normalizeColor(value), ctx));

          expect(parseColor(value, ctx)).to.deep.equal({
            value: [0, 0, 0],
            alpha: 1,
          });
          expect(ColorModel.parse(value).isEmpty).to.be.true;
        })
      );
    });

    it('parses the string of a color model back to the same color', () => {
      const tolerance: Record<ColorFormat, number> = {
        hex: 0.5,
        rgb: 0.5,
        hsl: 5,
      };

      fc.assert(
        fc.property(
          rgb,
          alpha,
          fc.constantFrom<ColorFormat>('hex', 'rgb', 'hsl'),
          fc.boolean(),
          (value, a, format, forceAlpha) => {
            const model = new ColorModel(value as RGB, a);
            const parsed = ColorModel.parse(model.asString(format, forceAlpha));

            expect(parsed.isEmpty).to.be.false;
            expectCloseTo(parsed.toRGB(), model.toRGB(), tolerance[format]);
            expect(parsed.alpha).to.be.closeTo(model.alpha, 1 / 255 + EPSILON);
          }
        )
      );
    });
  });

  describe('Model', () => {
    it('keeps every color space in range for any sequence of writes', () => {
      fc.assert(
        fc.property(fc.array(operation, { maxLength: 10 }), (operations) => {
          const model = ColorModel.default();

          for (const { key, value } of operations) {
            if (key === 'sv') {
              const [s, v] = value as [number, number];
              model.setSaturationAndValue(s, v);
            } else {
              model[key as 'r'] = value as number;
            }

            expectInRange(model.toRGB(), [255, 255, 255]);
            expectInRange(model.toHSL(), [360, 100, 100]);
            expectInRange(model.toHSV(), [360, 100, 100]);
            expectInRange([model.alpha], [1]);
          }
        })
      );
    });

    it('keeps a clone equal to its source', () => {
      fc.assert(
        fc.property(rgb, alpha, (value, a) => {
          const model = new ColorModel(value as RGB, a);

          expect(model.clone().equals(model)).to.be.true;
          expect(model.equals(model.clone())).to.be.true;
        })
      );
    });
  });
});

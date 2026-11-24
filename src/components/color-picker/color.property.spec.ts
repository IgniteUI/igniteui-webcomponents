import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { expectCloseTo } from '#internals/testing/helpers.spec.js';
import type { ColorFormat } from '../types.js';
import { isValidColor, normalizeColor, parseColor } from './common.js';
import { converter, type RGB } from './converters.js';
import { ColorModel, colorFormats, getContext } from './model.js';

const EPSILON = 1e-6;

/** Tenths: `max` is the largest value times 10. */
const tenths = (max: number) =>
  fc.integer({ min: 0, max }).map((value) => value / 10);

/*
 * Colors on a 0.1 grid, with the hue below 360. Most `fc.double` samples are
 * near 0, which gives blacks and grays where the channels and the hue do not
 * show.
 */
const channel = tenths(2550);
const byte = fc.integer({ min: 0, max: 255 });
const bytes = fc.tuple(byte, byte, byte);
const alpha = fc.double({ min: 0, max: 1, noNaN: true });
const rgb = fc.tuple(channel, channel, channel);
const hsl = fc.tuple(tenths(3599), tenths(1000), tenths(1000));
const hsv = hsl;

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

/**
 * Whether the engine converts OKLCH with the CSS Color 4 matrices. Chromium
 * does not, so a channel near 0 can come back one step off there. This color
 * shows it.
 */
function hasSpecOklab(): boolean {
  const color = ColorModel.parse('oklch(67.93% 0.22066 143.91)');
  return color.asString('hex') === '#01b825';
}

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
        fc.property(bytes, (value) => {
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

    it('converts an HSV hue the same after any number of full turns', () => {
      fc.assert(
        fc.property(
          hsv,
          fc.integer({ min: -5, max: 5 }),
          ([h, s, v], turns) => {
            expectCloseTo(
              converter.hsv.rgb([h + 360 * turns, s, v]),
              converter.hsv.rgb([h, s, v]),
              EPSILON
            );
          }
        )
      );
    });

    it('keeps each converted channel in range', () => {
      fc.assert(
        fc.property(rgb, hsl, (rgbValue, hslValue) => {
          expectInRange(converter.rgb.hsl(rgbValue), [360, 100, 100]);
          expectInRange(converter.rgb.hsv(rgbValue), [360, 100, 100]);
          expectInRange(converter.hsl.rgb(hslValue), [255, 255, 255]);
          expectInRange(converter.hsl.hsv(hslValue), [360, 100, 100]);
          expectInRange(converter.rgb.oklch(rgbValue), [100, 0.33, 360]);
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

    it('reads any `color(srgb)` color as whole channels in range', () => {
      // A channel outside 0-1 is outside the gamut. Firefox may map it into
      // the gamut, not clip it, so only the range is checked there.
      const unit = fc.integer({ min: -500, max: 1500 }).map((v) => v / 1000);

      fc.assert(
        fc.property(fc.tuple(unit, unit, unit), alpha, (channels, a) => {
          const [r, g, b] = channels;
          const parsed = parseColor(`color(srgb ${r} ${g} ${b} / ${a})`, ctx);

          for (const channel of parsed.value) {
            expect(Number.isInteger(channel), `${parsed.value}`).to.be.true;
          }
          expectInRange(parsed.value, [255, 255, 255]);
          expect(parsed.alpha).to.be.closeTo(a, 1 / 255 + EPSILON);

          if (channels.every((channel) => channel >= 0 && channel <= 1)) {
            expectCloseTo(
              parsed.value,
              channels.map((channel) => channel * 255),
              0.5 + EPSILON
            );
          }
        })
      );
    });

    it('parses any color outside the legacy syntax into sRGB', () => {
      const unit = fc.integer({ min: 0, max: 1000 }).map((v) => v / 1000);
      const modernColor = fc.oneof(
        fc
          .tuple(
            fc.integer({ min: 0, max: 100 }),
            fc.integer({ min: 0, max: 400 }).map((v) => v / 1000),
            fc.integer({ min: 0, max: 360 })
          )
          .map(([l, c, h]) => `oklch(${l}% ${c} ${h})`),
        fc
          .tuple(
            fc.integer({ min: 0, max: 100 }),
            fc.integer({ min: -150, max: 150 }),
            fc.integer({ min: -150, max: 150 })
          )
          .map(([l, a, b]) => `lab(${l}% ${a} ${b})`),
        fc
          .tuple(
            fc.constantFrom(
              'display-p3',
              'rec2020',
              'a98-rgb',
              'prophoto-rgb',
              'srgb-linear',
              'xyz'
            ),
            unit,
            unit,
            unit
          )
          .map(([space, ...values]) => `color(${space} ${values.join(' ')})`)
      );

      fc.assert(
        fc.property(modernColor, (value) => {
          const model = ColorModel.parse(value);

          expect(model.isEmpty, value).to.be.false;
          expect(model.asString('hex'), value).to.match(/^#[0-9a-f]{6}$/);
        })
      );
    });

    it('parses the string of a color model back to the same color', () => {
      const tolerance: Record<ColorFormat, number> = {
        hex: 0.5,
        rgb: 0.5,
        hsl: 5,
        // Half a step to the whole channel, up to 0.46 of a step from the
        // decimals, and up to 0.47 more in Chromium.
        oklch: hasSpecOklab() ? 1 : 1.5,
      };

      fc.assert(
        fc.property(
          rgb,
          alpha,
          fc.constantFrom(...colorFormats),
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

    it('gives an 8-bit color back from its oklch string', () => {
      const tolerance = hasSpecOklab() ? 0 : 1;

      fc.assert(
        fc.property(bytes, (value) => {
          const text = new ColorModel(value).asString('oklch');
          expectCloseTo(ColorModel.parse(text).toRGB(), value, tolerance);
        })
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

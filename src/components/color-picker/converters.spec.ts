import { expect } from '@open-wc/testing';

import { converter, type HSL, type HSV, type RGB } from './converters.js';

/** Tolerance for the accumulated float error of a conversion round-trip. */
const EPSILON = 0.5;

function expectTupleCloseTo(
  actual: RGB | HSL | HSV,
  expected: RGB | HSL | HSV,
  epsilon = EPSILON
): void {
  for (const [index, value] of expected.entries()) {
    expect(actual[index], `component ${index}`).to.be.closeTo(value, epsilon);
  }
}

/** A hue sweep dense enough to cross every branch of the conversions. */
const hues = Array.from({ length: 24 }, (_, i) => i * 15);

describe('Color converters', () => {
  describe('rgb -> hex', () => {
    it('converts the primaries and grayscale', () => {
      expect(converter.rgb.hex([255, 0, 0])).to.equal('ff0000');
      expect(converter.rgb.hex([0, 255, 0])).to.equal('00ff00');
      expect(converter.rgb.hex([0, 0, 255])).to.equal('0000ff');
      expect(converter.rgb.hex([0, 0, 0])).to.equal('000000');
      expect(converter.rgb.hex([255, 255, 255])).to.equal('ffffff');
    });

    it('rounds and clamps out of range channels', () => {
      expect(converter.rgb.hex([127.6, -20, 300])).to.equal('8000ff');
    });
  });

  describe('rgb -> hsl', () => {
    it('converts known colors', () => {
      expectTupleCloseTo(converter.rgb.hsl([255, 0, 0]), [0, 100, 50]);
      expectTupleCloseTo(converter.rgb.hsl([0, 255, 0]), [120, 100, 50]);
      expectTupleCloseTo(converter.rgb.hsl([0, 0, 255]), [240, 100, 50]);
      expectTupleCloseTo(converter.rgb.hsl([128, 128, 128]), [0, 0, 50.2]);
    });
  });

  describe('rgb -> hsv', () => {
    it('converts red-dominant colors', () => {
      expectTupleCloseTo(converter.rgb.hsv([255, 0, 0]), [0, 100, 100]);
      expectTupleCloseTo(converter.rgb.hsv([200, 100, 50]), [20, 75, 78.43]);
    });

    // Regression: the green branch used `ONE_THIRD * rDiff` instead of
    // `ONE_THIRD + rDiff`, which skewed the hue of every green-dominant color
    // by roughly 80 degrees.
    it('converts green-dominant colors', () => {
      expectTupleCloseTo(converter.rgb.hsv([0, 255, 0]), [120, 100, 100]);
      expectTupleCloseTo(converter.rgb.hsv([0, 128, 0]), [120, 100, 50.2]);
      expectTupleCloseTo(converter.rgb.hsv([128, 255, 64]), [99.9, 74.9, 100]);
      expectTupleCloseTo(converter.rgb.hsv([100, 200, 50]), [100, 75, 78.43]);
    });

    it('converts blue-dominant colors', () => {
      expectTupleCloseTo(converter.rgb.hsv([0, 0, 255]), [240, 100, 100]);
      expectTupleCloseTo(converter.rgb.hsv([50, 100, 200]), [220, 75, 78.43]);
    });

    it('reports no hue or saturation for achromatic colors', () => {
      expectTupleCloseTo(converter.rgb.hsv([0, 0, 0]), [0, 0, 0]);
      expectTupleCloseTo(converter.rgb.hsv([255, 255, 255]), [0, 0, 100]);
      expectTupleCloseTo(converter.rgb.hsv([128, 128, 128]), [0, 0, 50.2]);
    });
  });

  describe('hsl -> hsv', () => {
    it('converts colors at or below 50% lightness', () => {
      expectTupleCloseTo(converter.hsl.hsv([120, 100, 50]), [120, 100, 100]);
      expectTupleCloseTo(converter.hsl.hsv([0, 100, 25]), [0, 100, 50]);
    });

    // Regression: the saturation scaling tested `lMin` - captured before the
    // doubling and therefore never above 1 - instead of the doubled `l`. The
    // `2 - l` branch was dead, so value overshot 100 above 50% lightness.
    it('converts colors above 50% lightness', () => {
      expectTupleCloseTo(converter.hsl.hsv([0, 100, 75]), [0, 50, 100]);
      expectTupleCloseTo(converter.hsl.hsv([210, 50, 80]), [210, 22.22, 90]);
      expectTupleCloseTo(converter.hsl.hsv([60, 100, 100]), [60, 0, 100]);
    });

    it('keeps saturation and value within range across the sweep', () => {
      for (const h of hues) {
        for (const s of [0, 25, 50, 75, 100]) {
          for (const l of [0, 10, 25, 50, 60, 75, 90, 100]) {
            const [, sv, v] = converter.hsl.hsv([h, s, l]);

            expect(sv, `saturation for hsl(${h} ${s}% ${l}%)`).to.be.within(
              0,
              100
            );
            expect(v, `value for hsl(${h} ${s}% ${l}%)`).to.be.within(0, 100);
          }
        }
      }
    });
  });

  describe('hsv -> hsl', () => {
    it('converts known colors', () => {
      expectTupleCloseTo(converter.hsv.hsl([0, 100, 100]), [0, 100, 50]);
      expectTupleCloseTo(converter.hsv.hsl([0, 50, 100]), [0, 100, 75]);
      expectTupleCloseTo(converter.hsv.hsl([120, 100, 50]), [120, 100, 25]);
    });
  });

  describe('hsl -> rgb', () => {
    it('converts known colors', () => {
      expectTupleCloseTo(converter.hsl.rgb([0, 100, 50]), [255, 0, 0]);
      expectTupleCloseTo(converter.hsl.rgb([120, 100, 50]), [0, 255, 0]);
      expectTupleCloseTo(converter.hsl.rgb([240, 100, 50]), [0, 0, 255]);
    });

    it('converts achromatic colors to gray', () => {
      expectTupleCloseTo(converter.hsl.rgb([0, 0, 50]), [127.5, 127.5, 127.5]);
    });
  });

  describe('hsv -> rgb', () => {
    it('converts known colors', () => {
      expectTupleCloseTo(converter.hsv.rgb([0, 100, 100]), [255, 0, 0]);
      expectTupleCloseTo(converter.hsv.rgb([120, 100, 100]), [0, 255, 0]);
      expectTupleCloseTo(converter.hsv.rgb([240, 100, 100]), [0, 0, 255]);
      expectTupleCloseTo(converter.hsv.rgb([0, 0, 0]), [0, 0, 0]);
    });
  });

  describe('round-trips', () => {
    it('rgb -> hsv -> rgb preserves the color across the hue sweep', () => {
      for (const h of hues) {
        for (const s of [20, 60, 100]) {
          for (const v of [20, 60, 100]) {
            const rgb = converter.hsv.rgb([h, s, v]);
            const result = converter.hsv.rgb(converter.rgb.hsv(rgb));

            expectTupleCloseTo(result, rgb);
          }
        }
      }
    });

    it('rgb -> hsl -> rgb preserves the color across the hue sweep', () => {
      for (const h of hues) {
        for (const s of [20, 60, 100]) {
          for (const l of [20, 50, 80]) {
            const rgb = converter.hsl.rgb([h, s, l]);
            const result = converter.hsl.rgb(converter.rgb.hsl(rgb));

            expectTupleCloseTo(result, rgb);
          }
        }
      }
    });

    it('hsl -> hsv -> hsl preserves the color across the hue sweep', () => {
      for (const h of hues) {
        for (const s of [20, 60, 100]) {
          for (const l of [20, 50, 80]) {
            const result = converter.hsv.hsl(converter.hsl.hsv([h, s, l]));

            expectTupleCloseTo(result, [h, s, l]);
          }
        }
      }
    });

    it('agrees on hue between the hsl and hsv conversions of the same color', () => {
      for (const h of hues) {
        const rgb = converter.hsl.rgb([h, 100, 50]);

        expect(converter.rgb.hsl(rgb)[0], `hsl hue for ${h}`).to.be.closeTo(
          h,
          EPSILON
        );
        expect(converter.rgb.hsv(rgb)[0], `hsv hue for ${h}`).to.be.closeTo(
          h,
          EPSILON
        );
      }
    });
  });
});

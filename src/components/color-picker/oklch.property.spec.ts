import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { expectCloseTo } from '#internals/testing/helpers.spec.js';
import { converter } from './converters.js';
import { gamutChroma } from './oklch.js';

const byte = fc.integer({ min: 0, max: 255 });
const lightness = fc.double({ min: 0, max: 100, noNaN: true });
const chroma = fc.double({ min: 0, max: 0.4, noNaN: true });
const hue = fc.double({ min: 0, max: 359.999, noNaN: true });

describe('OKLCH gamut properties', () => {
  it('cuts a chroma back into the sRGB gamut, never up', () => {
    fc.assert(
      fc.property(lightness, chroma, hue, (l, c, h) => {
        const cut = gamutChroma([l, c, h]);
        const rgb = converter.oklch.rgb([l, cut, h]);

        expect(cut).to.be.at.most(c);
        for (const channel of rgb) {
          expect(channel).to.be.within(-0.01, 255.01);
        }
      })
    );
  });

  it('keeps the chroma of every 8-bit color', () => {
    fc.assert(
      fc.property(byte, byte, byte, (r, g, b) => {
        const [l, c, h] = converter.rgb.oklch([r, g, b]);
        expect(gamutChroma([l, c, h])).to.be.closeTo(c, 1e-9);
      })
    );
  });

  it('converts an 8-bit color to OKLCH and back', () => {
    fc.assert(
      fc.property(byte, byte, byte, (r, g, b) => {
        const back = converter.oklch.rgb(converter.rgb.oklch([r, g, b]));
        expectCloseTo(back, [r, g, b], 1e-6);
      })
    );
  });
});

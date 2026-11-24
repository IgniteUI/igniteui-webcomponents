import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { contrastRatio } from './contrast.js';
import { ColorModel } from './model.js';

const byte = fc.integer({ min: 0, max: 255 });
const opaque = fc
  .tuple(byte, byte, byte)
  .map(([r, g, b]) => ColorModel.parse(`rgb(${r} ${g} ${b})`));

describe('Contrast ratio properties', () => {
  it('is from 1 to 21 and the same for both orders of two opaque colors', () => {
    fc.assert(
      fc.property(opaque, opaque, (a, b) => {
        const value = contrastRatio(a, b);

        expect(value).to.be.within(1, 21 + 1e-9);
        expect(contrastRatio(b, a)).to.be.closeTo(value, 1e-9);
      })
    );
  });
});

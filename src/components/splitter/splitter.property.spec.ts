import { expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '#internals/definitions/defineComponents.js';
import { fc } from '#internals/testing/fast-check-setup.spec.js';
import IgcSplitterComponent from './splitter.js';

const UNITS = ['%', 'px', 'em', 'rem', 'vw', 'vh', 'ch', 'pt', 'PX'];

/** A number as CSS writes it, without a sign or an exponent. */
const cssNumber = fc.stringMatching(/^(\d{1,4}(\.\d{1,3})?|\.\d{1,3})$/);

/** Strings near a length: a sign, a number with a trailing dot, an unknown unit, spaces. */
const lengthLike = fc
  .tuple(
    fc.constantFrom('', '+', '-'),
    fc.stringMatching(/^\d{0,4}\.?\d{0,3}$/),
    fc.constantFrom('', 'foo', ...UNITS),
    fc.constantFrom('', ' ', '\t')
  )
  .map(([sign, number, unit, pad]) => `${pad}${sign}${number}${unit}${pad}`);

/** A length that a pane size accepts. */
const validLength = fc
  .tuple(cssNumber, fc.constantFrom(...UNITS))
  .filter(([number, unit]) => unit !== '%' || Number(number) <= 100)
  .map(([number, unit]) => `${number}${unit}`);

describe('Splitter size properties', () => {
  let splitter: IgcSplitterComponent;

  before(async () => {
    defineComponents(IgcSplitterComponent);
    splitter = await fixture<IgcSplitterComponent>(
      html`<igc-splitter></igc-splitter>`
    );
  });

  it('accepts only sizes that CSS accepts as a flex basis', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), lengthLike), (value) => {
        splitter.startSize = value;
        const size = splitter.startSize!;

        expect([value.trim(), 'auto']).to.include(size);
        expect(CSS.supports('flex-basis', size), size).to.be.true;
      })
    );
  });

  it('accepts every non-negative length, and a percentage up to 100', () => {
    fc.assert(
      fc.property(validLength, (value) => {
        splitter.startSize = ` ${value} `;
        expect(splitter.startSize).to.equal(value);
      })
    );
  });

  it('validates the constraints as the sizes', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), lengthLike, validLength), (value) => {
        splitter.startSize = value;
        splitter.startMinSize = value;
        splitter.endMaxSize = value;

        expect(splitter.startMinSize ?? 'auto').to.equal(splitter.startSize);
        expect(splitter.endMaxSize ?? 'auto').to.equal(splitter.startSize);
      })
    );
  });
});

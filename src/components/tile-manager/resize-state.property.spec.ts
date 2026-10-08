import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { parseGridTrack } from './resize-state.js';

const line = fc.integer({ min: 1, max: 1000 });
const negativeLine = fc.integer({ min: -1000, max: -1 });
const anyLine = fc.oneof(line, negativeLine);
const tileSpan = fc.integer({ min: 1, max: 12 });

/** Placements from author CSS that are not `[start /] span n`. */
const otherPlacement = fc.oneof(
  fc.constant('auto'),
  anyLine.map(String),
  fc.tuple(anyLine, anyLine).map(([start, end]) => `${start} / ${end}`),
  fc
    .tuple(negativeLine, line)
    .map(([start, span]) => `${start} / span ${span}`),
  fc.tuple(line, anyLine).map(([span, end]) => `span ${span} / ${end}`),
  fc.tuple(line, line).map(([start, span]) => `${start} area / span ${span}`)
);

describe('Tile resize state properties', () => {
  let element: HTMLElement;

  /** The computed `grid-column` of `placement`, as the browser gives it. */
  const computed = (placement: string): string => {
    element.style.gridColumn = placement;
    return getComputedStyle(element).gridColumn;
  };

  before(() => {
    element = document.createElement('div');
    document.body.append(element);
  });

  after(() => {
    element.remove();
  });

  it('parses the start and the span of a computed placement', () => {
    fc.assert(
      fc.property(line, line, tileSpan, (start, span, fallback) => {
        const value = computed(`${start} / span ${span}`);

        expect(parseGridTrack(value, fallback)).to.eql({ start, span });
      })
    );
  });

  it('gives start -1 for a computed placement without a start', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('span', 'auto / span'),
        line,
        tileSpan,
        (prefix, span, fallback) => {
          const value = computed(`${prefix} ${span}`);

          expect(parseGridTrack(value, fallback)).to.eql({ start: -1, span });
        }
      )
    );
  });

  it('gives start -1 and the span of the tile for another computed placement', () => {
    fc.assert(
      fc.property(otherPlacement, tileSpan, (placement, fallback) => {
        const value = computed(placement);

        expect(parseGridTrack(value, fallback)).to.eql({
          start: -1,
          span: fallback,
        });
      })
    );
  });

  it('gives start -1 or a line, and a positive whole span, for any text', () => {
    fc.assert(
      fc.property(fc.string(), tileSpan, (value, fallback) => {
        const { start, span } = parseGridTrack(value, fallback);

        expect(start === -1 || (Number.isInteger(start) && start >= 1)).to.be
          .true;
        expect(Number.isInteger(span) && span >= 1).to.be.true;
      })
    );
  });
});

import { expect } from '@open-wc/testing';

import {
  fc,
  SLOW_PROPERTY_RUNS,
} from '#internals/testing/fast-check-setup.spec.js';
import type { QrErrorCorrectionLevel } from '../types.js';
import { EC_LEVEL_INDEX, encodeQR } from './encode.js';
import { EC_BLOCKS_TABLE, getDataCodewordsCount } from './error-correction.js';
import { generateQRCodeMatrix } from './matrix.js';

const EC_LEVELS = Object.keys(EC_LEVEL_INDEX) as QrErrorCorrectionLevel[];
const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

/**
 * Returns the total codewords of a version, from its module count (ISO/IEC 18004). The
 * oracle does not use `EC_BLOCKS_TABLE`.
 */
function totalCodewords(version: number): number {
  let modules = (16 * version + 128) * version + 64;

  if (version >= 2) {
    const alignments = Math.floor(version / 7) + 2;
    modules -= (25 * alignments - 10) * alignments - 55;
    if (version >= 7) {
      modules -= 36;
    }
  }

  return Math.floor(modules / 8);
}

const ecLevel = fc.constantFrom(...EC_LEVELS);
const version = fc.integer({ min: 1, max: 40 });

const data = fc.oneof(
  fc.stringMatching(/^\d{1,200}$/),
  fc
    .array(fc.constantFrom(...ALPHANUMERIC), { minLength: 1, maxLength: 200 })
    .map((chars) => chars.join('')),
  fc.string({ unit: 'grapheme', minLength: 1, maxLength: 100 }),
  fc.string({ unit: 'binary', minLength: 1, maxLength: 100 })
);

describe('QR model properties', () => {
  it('holds as many codewords per version as the symbol has room for', () => {
    fc.assert(
      fc.property(version, fc.nat(3), (v, ecIndex) => {
        const { ecPerBlock, groups } = EC_BLOCKS_TABLE[v - 1][ecIndex];
        const blocks = groups.reduce((sum, g) => sum + g.numBlocks, 0);

        expect(
          getDataCodewordsCount(v, ecIndex) + blocks * ecPerBlock
        ).to.equal(totalCodewords(v));
      })
    );
  });

  it('encodes any data that fits into the smallest version that holds it', () => {
    fc.assert(
      fc.property(data, ecLevel, (value, level) => {
        const result = encodeQR(value, level);

        expect(result.version).to.be.within(1, 40);
        expect(result.codewords).to.have.lengthOf(
          totalCodewords(result.version)
        );
        expect(result.codewords.every((c) => c >= 0 && c <= 255)).to.be.true;

        if (result.version > 1) {
          expect(() => encodeQR(value, level, result.version - 1)).to.throw(
            /Data too long/
          );
        }
        expect(encodeQR(value, level, result.version)).to.deep.equal(result);
      })
    );
  });

  it('picks the most compact mode for the characters of the data', () => {
    fc.assert(
      fc.property(data, (value) => {
        const { mode } = encodeQR(value, 'L');

        if (/^\d+$/.test(value)) {
          expect(mode).to.equal('numeric');
        } else if ([...value].every((c) => ALPHANUMERIC.includes(c))) {
          expect(mode).to.equal('alphanumeric');
        } else {
          expect(mode).to.equal('byte');
        }
      })
    );
  });

  it('builds a square matrix of the version size', () => {
    fc.assert(
      fc.property(data, ecLevel, (value, level) => {
        const { matrix, size, version: v } = generateQRCodeMatrix(value, level);

        expect(size).to.equal(17 + 4 * v);
        expect(matrix).to.have.lengthOf(size);
        expect(
          matrix.every(
            (row) =>
              row.length === size &&
              row.every((module) => typeof module === 'boolean')
          )
        ).to.be.true;
      }),
      { numRuns: SLOW_PROPERTY_RUNS }
    );
  });

  it('throws the capacity error, and no other error, for data that does not fit', () => {
    const oversized = fc
      .tuple(version, ecLevel, fc.integer({ min: 1, max: 50 }))
      .map(([v, level, extra]) => ({
        v,
        level,
        value: 'a'.repeat(
          getDataCodewordsCount(v, EC_LEVEL_INDEX[level]) + extra
        ),
      }));

    fc.assert(
      fc.property(oversized, ({ v, level, value }) => {
        expect(() => encodeQR(value, level, v)).to.throw(/Data too long/);
      })
    );
  });
});

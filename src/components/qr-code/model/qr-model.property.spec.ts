import { expect } from '@open-wc/testing';
import { readBarcodes } from 'zxing-wasm/reader';

import {
  fc,
  SLOW_PROPERTY_RUNS,
} from '#internals/testing/fast-check-setup.spec.js';
import { prepareQrDecoder } from '#internals/testing/qr-decoder.spec.js';
import type { QrErrorCorrectionLevel } from '../types.js';
import { EC_LEVEL_INDEX, encodeQR } from './encode.js';
import { EC_BLOCKS_TABLE, getDataCodewordsCount } from './error-correction.js';
import { generateQRCodeMatrix } from './matrix.js';

const EC_LEVELS = Object.keys(EC_LEVEL_INDEX) as QrErrorCorrectionLevel[];
const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const TEXT_ENCODER = new TextEncoder();

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

/** Runs that favor different modes, so that the encoder splits the value into segments. */
const mixedData = fc
  .array(
    fc.oneof(
      fc.stringMatching(/^\d{1,40}$/),
      fc
        .array(fc.constantFrom(...ALPHANUMERIC), {
          minLength: 1,
          maxLength: 40,
        })
        .map((chars) => chars.join('')),
      fc.string({ unit: 'grapheme', minLength: 1, maxLength: 20 })
    ),
    { minLength: 1, maxLength: 8 }
  )
  .map((runs) => runs.join(''));

const anyData = fc.oneof(data, mixedData);

const SINGLE_MODES = ['numeric', 'alphanumeric', 'byte'] as const;

/**
 * Returns the bits of `value` as one segment of `mode` in a code of `version`, or `Infinity`
 * when the mode cannot encode it (ISO/IEC 18004, 7.4). The oracle does not use the encoder.
 */
function singleModeBits(
  value: string,
  mode: (typeof SINGLE_MODES)[number],
  version: number
): number {
  const group = version < 10 ? 0 : version < 27 ? 1 : 2;
  const length = value.length;

  switch (mode) {
    case 'numeric':
      return /^\d+$/.test(value)
        ? 4 +
            [10, 12, 14][group] +
            10 * Math.floor(length / 3) +
            [0, 4, 7][length % 3]
        : Number.POSITIVE_INFINITY;
    case 'alphanumeric':
      return [...value].every((c) => ALPHANUMERIC.includes(c))
        ? 4 +
            [9, 11, 13][group] +
            11 * Math.floor(length / 2) +
            6 * (length % 2)
        : Number.POSITIVE_INFINITY;
    default:
      return 4 + [8, 16, 16][group] + 8 * TEXT_ENCODER.encode(value).length;
  }
}

/** Draws `matrix` with 4 pixels for each module and a quiet zone of 4 modules. */
function toImageData(matrix: boolean[][]): ImageData {
  const scale = 4;
  const offset = 4 * scale;
  const side = matrix.length * scale + 2 * offset;
  const image = new ImageData(side, side);
  image.data.fill(255);

  for (const [row, modules] of matrix.entries()) {
    for (const [col, dark] of modules.entries()) {
      if (!dark) continue;

      for (let y = 0; y < scale; y++) {
        const start = (offset + row * scale + y) * side + offset + col * scale;
        for (let x = start; x < start + scale; x++) {
          image.data.fill(0, x * 4, x * 4 + 3);
        }
      }
    }
  }

  return image;
}

describe('QR model properties', () => {
  before(prepareQrDecoder);

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

  it('encodes mixed data into the smallest version that holds it', () => {
    fc.assert(
      fc.property(mixedData, ecLevel, (value, level) => {
        const result = encodeQR(value, level);

        expect(result.codewords).to.have.lengthOf(
          totalCodewords(result.version)
        );
        if (result.version > 1) {
          expect(() => encodeQR(value, level, result.version - 1)).to.throw(
            /Data too long/
          );
        }
        expect(encodeQR(value, level, result.version)).to.deep.equal(result);
      })
    );
  });

  it('the segments never take more bits than the best single mode', () => {
    fc.assert(
      fc.property(anyData, ecLevel, (value, level) => {
        const { mode, dataBits, version: v } = encodeQR(value, level);
        const single = SINGLE_MODES.map((m) => singleModeBits(value, m, v));

        expect(dataBits).to.be.at.most(Math.min(...single));
        if (mode !== 'mixed') {
          expect(dataBits).to.equal(single[SINGLE_MODES.indexOf(mode)]);
        }
      })
    );
  });

  it('gives a decoder the bytes of the data back', async () => {
    await fc.assert(
      fc.asyncProperty(anyData, ecLevel, async (value, level) => {
        const { matrix } = generateQRCodeMatrix(value, level);
        const [result] = await readBarcodes(toImageData(matrix), {
          formats: ['QRCode'],
          maxNumberOfSymbols: 1,
        });

        expect(result?.bytes).to.deep.equal(TEXT_ENCODER.encode(value));
      }),
      { numRuns: SLOW_PROPERTY_RUNS }
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

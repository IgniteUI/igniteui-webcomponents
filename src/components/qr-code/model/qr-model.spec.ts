import { expect } from '@open-wc/testing';

import { encodeQR } from './encode.js';
import {
  calculateECC,
  getDataCodewordsCount,
  interleaveBlocks,
} from './error-correction.js';
import {
  applyMask,
  calculatePenalty,
  type MaskPattern,
  selectBestMask,
} from './mask.js';
import { generateQRCodeMatrix } from './matrix.js';

function makeMatrix(size: number, fill = false): boolean[][] {
  return Array.from({ length: size }, () => new Array(size).fill(fill));
}

describe('QR model - encodeQR', () => {
  describe('Mode detection', () => {
    it('detects numeric mode for digit-only strings', () => {
      const result = encodeQR('0123456789');
      expect(result.mode).to.equal('numeric');
    });

    it('detects alphanumeric mode for uppercase + allowed symbols', () => {
      const result = encodeQR('HELLO WORLD');
      expect(result.mode).to.equal('alphanumeric');
    });

    it('falls back to byte mode for lowercase strings', () => {
      const result = encodeQR('Hello World');
      expect(result.mode).to.equal('byte');
    });

    it('falls back to byte mode for mixed-case strings', () => {
      const result = encodeQR('Test123');
      expect(result.mode).to.equal('byte');
    });
  });

  describe('Auto version selection', () => {
    it('selects version 1 for short numeric data at level M', () => {
      const result = encodeQR('42', 'M');
      expect(result.version).to.equal(1);
    });

    it('selects version 1 for short byte data at level M', () => {
      const result = encodeQR('Hello World', 'M');
      expect(result.version).to.equal(1);
    });

    it('selects a higher version when data exceeds version-1 capacity', () => {
      // 152 digits exceed V1–L capacity (41 numeric chars max)
      const longNumeric = '1'.repeat(152);
      const result = encodeQR(longNumeric, 'L');
      expect(result.version).to.be.greaterThan(1);
    });

    it('selects version 1 for a single alphanumeric character', () => {
      const result = encodeQR('A', 'H');
      expect(result.version).to.equal(1);
    });
  });

  describe('EC level index', () => {
    const levels = [
      { level: 'L', index: 0 },
      { level: 'M', index: 1 },
      { level: 'Q', index: 2 },
      { level: 'H', index: 3 },
    ] as const;

    for (const { level, index } of levels) {
      it(`returns ecLevelIndex ${index} for level ${level}`, () => {
        const result = encodeQR('TEST', level);
        expect(result.ecLevelIndex).to.equal(index);
      });
    }
  });

  describe('Output shape', () => {
    it('returns a non-empty codewords array', () => {
      const result = encodeQR('Hello World', 'M');
      expect(result.codewords).to.be.an('array');
      expect(result.codewords.length).to.be.greaterThan(0);
    });

    it('all codewords are integers in 0-255', () => {
      const result = encodeQR('HELLO WORLD', 'M');
      for (const cw of result.codewords) {
        expect(cw).to.be.within(0, 255);
      }
    });

    it('uses requested version when explicitly provided', () => {
      const result = encodeQR('Hi', 'M', 3);
      expect(result.version).to.equal(3);
    });
  });

  describe('Error cases', () => {
    it('throws for empty string', () => {
      expect(() => encodeQR('')).to.throw();
    });

    it('throws for requestedVersion below 1', () => {
      expect(() => encodeQR('A', 'M', 0)).to.throw();
    });

    it('throws for requestedVersion above 40', () => {
      expect(() => encodeQR('A', 'M', 41)).to.throw();
    });

    it('throws when data is too long for the explicitly requested version', () => {
      // A 200-character lowercase string cannot fit in version 1 at any EC level
      expect(() => encodeQR('a'.repeat(200), 'M', 1)).to.throw();
    });
  });
});

describe('QR model - error correction', () => {
  describe('getDataCodewordsCount', () => {
    it('returns 19 for V1/L', () => {
      expect(getDataCodewordsCount(1, 0)).to.equal(19);
    });

    it('returns 16 for V1/M', () => {
      expect(getDataCodewordsCount(1, 1)).to.equal(16);
    });

    it('returns 13 for V1/Q', () => {
      expect(getDataCodewordsCount(1, 2)).to.equal(13);
    });

    it('returns 9 for V1/H', () => {
      expect(getDataCodewordsCount(1, 3)).to.equal(9);
    });
  });

  describe('calculateECC', () => {
    it('returns an array whose length equals the requested degree', () => {
      expect(calculateECC([1, 2, 3], 5).length).to.equal(5);
      expect(calculateECC([10, 20, 30, 40], 10).length).to.equal(10);
    });

    it('returns an empty array for degree 0', () => {
      expect(calculateECC([1, 2, 3], 0)).to.deep.equal([]);
    });

    it('is deterministic - same input always produces same output', () => {
      const data = [
        32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17,
      ];
      const ecc1 = calculateECC(data, 10);
      const ecc2 = calculateECC(data, 10);
      expect(ecc1).to.deep.equal(ecc2);
    });

    it('produces the correct ECC for the "HELLO WORLD" V1/M data codewords', () => {
      // Data codewords for "HELLO WORLD" at V1/M (from ISO 18004:2015 Annex I)
      const data = [
        32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17,
      ];
      const ecc = calculateECC(data, 10);
      expect(ecc).to.deep.equal([196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
    });
  });

  describe('interleaveBlocks', () => {
    describe('single-block version (V1/M)', () => {
      const data = Array.from({ length: 16 }, (_, i) => i);

      it('outputs length = data codewords + EC codewords', () => {
        const result = interleaveBlocks(data, 1, 1);
        expect(result.length).to.equal(26); // 16 data + 10 EC
      });

      it('starts with the data codewords in order', () => {
        const result = interleaveBlocks(data, 1, 1);
        expect(result.slice(0, 16)).to.deep.equal(data);
      });

      it('EC bytes equal calculateECC on the same data', () => {
        const result = interleaveBlocks(data, 1, 1);
        const ecc = calculateECC(data, 10);
        expect(result.slice(16)).to.deep.equal(ecc);
      });
    });

    describe('multi-block version (V5/M – 2 blocks of 43 data CW)', () => {
      // V5/M: EC_BLOCKS_TABLE[4][1] = { ecPerBlock: 24, groups: [{ numBlocks: 2, dataCW: 43 }] }
      const totalDataCW = 2 * 43; // 86
      const data = Array.from({ length: totalDataCW }, (_, i) => i % 256);

      it('outputs length = data codewords + total EC codewords', () => {
        const result = interleaveBlocks(data, 5, 1);
        expect(result.length).to.equal(totalDataCW + 2 * 24); // 86 + 48 = 134
      });

      it('interleaves data from block 0 and block 1 alternately', () => {
        const result = interleaveBlocks(data, 5, 1);
        // Block 0 starts at index 0, block 1 starts at index 43
        expect(result[0]).to.equal(data[0]); // block 0, codeword 0
        expect(result[1]).to.equal(data[43]); // block 1, codeword 0
        expect(result[2]).to.equal(data[1]); // block 0, codeword 1
        expect(result[3]).to.equal(data[44]); // block 1, codeword 1
      });
    });
  });
});

describe('QR model - masking', () => {
  describe('applyMask', () => {
    it('does not toggle function modules', () => {
      const matrix = makeMatrix(3, false);
      const functionModules = makeMatrix(3, false);
      functionModules[1][1] = true; // mark (1,1) as a function module

      // Pattern 0 toggles (row+col)%2===0 → (1,1) would normally be toggled
      const result = applyMask(matrix, functionModules, 0);
      expect(result[1][1]).to.equal(false); // untouched
    });

    it('toggles non-function modules according to pattern 0 condition', () => {
      const matrix = makeMatrix(3, false);
      const functionModules = makeMatrix(3, false);
      const result = applyMask(matrix, functionModules, 0);

      // Pattern 0: (row+col)%2===0 → these should be flipped to true
      expect(result[0][0]).to.equal(true);
      expect(result[0][2]).to.equal(true);
      expect(result[1][1]).to.equal(true);
      expect(result[2][0]).to.equal(true);
      expect(result[2][2]).to.equal(true);

      // Odd positions remain false
      expect(result[0][1]).to.equal(false);
      expect(result[1][0]).to.equal(false);
    });

    it('toggles non-function modules according to pattern 1 (even row)', () => {
      const matrix = makeMatrix(4, false);
      const functionModules = makeMatrix(4, false);
      const result = applyMask(matrix, functionModules, 1 as MaskPattern);

      // Pattern 1: row%2===0 → rows 0 and 2 are all-true, rows 1 and 3 are all-false
      for (let c = 0; c < 4; c++) {
        expect(result[0][c]).to.equal(true);
        expect(result[2][c]).to.equal(true);
        expect(result[1][c]).to.equal(false);
        expect(result[3][c]).to.equal(false);
      }
    });

    it('returns a new matrix (does not mutate the original)', () => {
      const matrix = makeMatrix(3, false);
      const functionModules = makeMatrix(3, false);
      applyMask(matrix, functionModules, 0);
      expect(matrix[0][0]).to.equal(false);
    });
  });

  describe('calculatePenalty', () => {
    it('returns a non-negative number', () => {
      const matrix = makeMatrix(5, false);
      expect(calculatePenalty(matrix)).to.be.greaterThanOrEqual(0);
    });

    it('returns a positive penalty for an all-dark matrix', () => {
      const matrix = makeMatrix(10, true);
      expect(calculatePenalty(matrix)).to.be.greaterThan(0);
    });

    it('returns a positive penalty for an all-light matrix', () => {
      const matrix = makeMatrix(10, false);
      expect(calculatePenalty(matrix)).to.be.greaterThan(0);
    });
  });

  describe('selectBestMask', () => {
    it('returns a value in the range [0, 7]', () => {
      const { matrix, size } = generateQRCodeMatrix('TEST', 'M');
      // Rebuild a clean unmasked matrix from scratch is complex;
      // instead verify the contract on any valid matrix
      const functionModules = makeMatrix(size, false);
      const best = selectBestMask(matrix, functionModules);
      expect(best).to.be.within(0, 7);
    });

    it('returns the pattern with the lowest penalty score', () => {
      const { matrix, size } = generateQRCodeMatrix('A', 'M');
      const functionModules = makeMatrix(size, false);
      const best = selectBestMask(matrix, functionModules);

      let lowestPenalty = Number.POSITIVE_INFINITY;
      let expectedBest: MaskPattern = 0;
      for (let p = 0; p < 8; p++) {
        const masked = applyMask(matrix, functionModules, p as MaskPattern);
        const penalty = calculatePenalty(masked);
        if (penalty < lowestPenalty) {
          lowestPenalty = penalty;
          expectedBest = p as MaskPattern;
        }
      }
      expect(best).to.equal(expectedBest);
    });
  });
});

describe('QR model - matrix generation', () => {
  // V1/M with byte-mode data
  const V1_DATA = 'Hello World';
  let v1Result: ReturnType<typeof generateQRCodeMatrix>;

  before(() => {
    v1Result = generateQRCodeMatrix(V1_DATA, 'M');
  });

  describe('Output shape', () => {
    it('size equals version * 4 + 17', () => {
      expect(v1Result.size).to.equal(v1Result.version * 4 + 17);
    });

    it('matrix is square with side length equal to size', () => {
      const { matrix, size } = v1Result;
      expect(matrix.length).to.equal(size);
      for (const row of matrix) {
        expect(row.length).to.equal(size);
      }
    });

    it('matrix contains only boolean values', () => {
      for (const row of v1Result.matrix) {
        for (const cell of row) {
          expect(typeof cell).to.equal('boolean');
        }
      }
    });

    it('returns version 1 for short byte data at level M', () => {
      expect(v1Result.version).to.equal(1);
    });

    it('returns size 21 for version 1', () => {
      expect(v1Result.size).to.equal(21);
    });

    it('returns a higher version for data too large for V1', () => {
      const result = generateQRCodeMatrix('A'.repeat(50), 'M');
      expect(result.version).to.be.greaterThan(1);
    });
  });

  describe('Finder patterns', () => {
    const FINDER_PATTERN = [
      [true, true, true, true, true, true, true],
      [true, false, false, false, false, false, true],
      [true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true],
      [true, false, false, false, false, false, true],
      [true, true, true, true, true, true, true],
    ];

    function extractRegion(
      matrix: boolean[][],
      rowStart: number,
      colStart: number,
      size = 7
    ): boolean[][] {
      return Array.from({ length: size }, (_, r) =>
        Array.from(
          { length: size },
          (_, c) => matrix[rowStart + r][colStart + c]
        )
      );
    }

    it('top-left finder pattern matches the expected bit layout', () => {
      const region = extractRegion(v1Result.matrix, 0, 0);
      expect(region).to.deep.equal(FINDER_PATTERN);
    });

    it('top-right finder pattern matches the expected bit layout', () => {
      const { matrix, size } = v1Result;
      const region = extractRegion(matrix, 0, size - 7);
      expect(region).to.deep.equal(FINDER_PATTERN);
    });

    it('bottom-left finder pattern matches the expected bit layout', () => {
      const { matrix, size } = v1Result;
      const region = extractRegion(matrix, size - 7, 0);
      expect(region).to.deep.equal(FINDER_PATTERN);
    });
  });

  describe('Timing patterns', () => {
    it('row 6 alternates between finder patterns (even col = dark)', () => {
      const { matrix, size } = v1Result;
      for (let c = 8; c < size - 8; c++) {
        expect(matrix[6][c]).to.equal(
          c % 2 === 0,
          `matrix[6][${c}] should be ${c % 2 === 0}`
        );
      }
    });

    it('col 6 alternates between finder patterns (even row = dark)', () => {
      const { matrix, size } = v1Result;
      for (let r = 8; r < size - 8; r++) {
        expect(matrix[r][6]).to.equal(
          r % 2 === 0,
          `matrix[${r}][6] should be ${r % 2 === 0}`
        );
      }
    });
  });

  describe('Dark module', () => {
    it('is always true regardless of mask or version', () => {
      for (const version of [1, 5, 10]) {
        const result = generateQRCodeMatrix('A', 'M', version);
        expect(result.matrix[4 * version + 9][8]).to.equal(true);
      }
    });
  });

  describe('Version information (V7+)', () => {
    it('version info area near top-right corner is non-trivial for V7', () => {
      const result = generateQRCodeMatrix('A'.repeat(20), 'M', 7);
      const { matrix, size } = result;

      // 6×3 block at top-right: cols size-11..size-9, rows 0..5
      let hasTrue = false;
      let hasFalse = false;
      for (let r = 0; r < 6; r++) {
        for (let c = size - 11; c < size - 8; c++) {
          if (matrix[r][c]) hasTrue = true;
          else hasFalse = true;
        }
      }
      expect(hasTrue).to.equal(true);
      expect(hasFalse).to.equal(true);
    });
  });
});

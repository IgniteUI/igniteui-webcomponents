import { getOrInsertComputed } from '#internals/utils/objects.js';

// The readers reduce the exponent modulo 255, so one cycle is enough.
const EXP_TABLE: number[] = new Array(256);
const LOG_TABLE: number[] = new Array(256);
const POLYNOMIALS = new Map<number, number[]>();

(function initTables() {
  let x = 1;
  for (let i = 0; i < 256; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
}

function gfPow(a: number, power: number): number {
  return EXP_TABLE[(LOG_TABLE[a] * power) % 255];
}

function generatePolynomial(degree: number): number[] {
  let poly = [1];

  for (let i = 0; i < degree; i++) {
    const term = [1, gfPow(2, i)];
    const newPoly = new Array(poly.length + term.length - 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      for (let k = 0; k < term.length; k++) {
        newPoly[j + k] ^= gfMul(poly[j], term[k]);
      }
    }
    poly = newPoly;
  }
  return poly;
}

function getPolynomial(degree: number): number[] {
  return getOrInsertComputed(POLYNOMIALS, degree, generatePolynomial);
}

/** Computes Reed-Solomon error correction codewords for a data block of the given EC degree. */
export function calculateECC(data: number[], degree: number): number[] {
  const poly = getPolynomial(degree);
  const ecc: number[] = new Array(data.length + degree).fill(0);

  for (let i = 0; i < data.length; i++) {
    ecc[i] = data[i];
  }

  for (let i = 0; i < data.length; i++) {
    const factor = ecc[i];
    if (factor !== 0) {
      for (let j = 0; j < poly.length; j++) {
        ecc[i + j] ^= gfMul(poly[j], factor);
      }
    }
  }

  return ecc.slice(data.length, data.length + degree);
}

/** Describes one error correction block configuration for a QR version + EC level. */
export type ECBlock = {
  ecPerBlock: number;
  groups: { numBlocks: number; dataCW: number }[];
};

/**
 * The error correction codewords of each block, by error correction level (L, M, Q, H)
 * and by version - 1. ISO/IEC 18004, table 9.
 */
const ECC_PER_BLOCK: readonly (readonly number[])[] = [
  // L
  [
    7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28,
    28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30,
  ],
  // M
  [
    10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26,
    26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28,
  ],
  // Q
  [
    13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26,
    30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30,
  ],
  // H
  [
    17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26,
    28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30,
  ],
];

/** The number of error correction blocks, by error correction level and by version - 1. */
const NUM_BLOCKS: readonly (readonly number[])[] = [
  // L
  [
    1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12,
    12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ],
  // M
  [
    1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17,
    18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ],
  // Q
  [
    1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23,
    25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ],
  // H
  [
    1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25,
    34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81,
  ],
];

/** The number of data and error correction modules of `version`: the area without the function patterns. */
function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;

  if (version >= 2) {
    const alignments = Math.floor(version / 7) + 2;
    result -= (25 * alignments - 10) * alignments - 55;

    // The two version information areas.
    if (version >= 7) {
      result -= 36;
    }
  }

  return result;
}

/**
 * The block split of each version and error correction level. The codewords divide over
 * the blocks as evenly as they can: the short blocks come first, and each long block holds
 * one more data codeword.
 */
export const EC_BLOCKS_TABLE: ECBlock[][] = Array.from(
  { length: 40 },
  (_, index) =>
    ECC_PER_BLOCK.map((perVersion, level) => {
      const ecPerBlock = perVersion[index];
      const numBlocks = NUM_BLOCKS[level][index];
      const codewords = getTotalCodewordsCount(index + 1);
      const shortLength = Math.floor(codewords / numBlocks);
      const shortBlocks = numBlocks - (codewords % numBlocks);
      const groups = [
        { numBlocks: shortBlocks, dataCW: shortLength - ecPerBlock },
      ];

      if (shortBlocks < numBlocks) {
        groups.push({
          numBlocks: numBlocks - shortBlocks,
          dataCW: shortLength - ecPerBlock + 1,
        });
      }

      return { ecPerBlock, groups };
    })
);

/** Returns the total number of data codewords available for the given version and EC level index. */
export function getDataCodewordsCount(
  version: number,
  errorCorrectionLevel: number
): number {
  const ecBlock = EC_BLOCKS_TABLE[version - 1][errorCorrectionLevel];
  let totalDataCodewords = 0;

  for (const group of ecBlock.groups) {
    totalDataCodewords += group.numBlocks * group.dataCW;
  }
  return totalDataCodewords;
}

/** Returns the number of codewords of `version`, data and error correction, at any level. */
export function getTotalCodewordsCount(version: number): number {
  return Math.floor(rawDataModules(version) / 8);
}

/**
 * Returns the block and the position in that block of each codeword, in interleaved order. A
 * position at or past the data length of its block is an error correction codeword.
 */
export function getInterleavedOrder(
  version: number,
  errorCorrectionLevel: number
): [block: number, position: number][] {
  const { ecPerBlock, groups } =
    EC_BLOCKS_TABLE[version - 1][errorCorrectionLevel];
  const dataLengths = groups.flatMap(({ numBlocks, dataCW }) =>
    new Array<number>(numBlocks).fill(dataCW)
  );
  // The long blocks come last.
  const longest = dataLengths.at(-1)!;
  const order: [number, number][] = [];

  for (let i = 0; i < longest; i++) {
    for (const [block, length] of dataLengths.entries()) {
      if (i < length) {
        order.push([block, i]);
      }
    }
  }

  for (let i = 0; i < ecPerBlock; i++) {
    for (const [block, length] of dataLengths.entries()) {
      order.push([block, length + i]);
    }
  }

  return order;
}

/** Interleaves data and ECC codewords from all blocks per the QR specification, producing the final codeword sequence. */
export function interleaveBlocks(
  dataBlocks: number[],
  version: number,
  errorCorrectionLevel: number
): number[] {
  const ecBlock = EC_BLOCKS_TABLE[version - 1][errorCorrectionLevel];
  const blocks: number[][] = [];

  let offset = 0;

  for (const group of ecBlock.groups) {
    for (let b = 0; b < group.numBlocks; b++) {
      const block = dataBlocks.slice(offset, offset + group.dataCW);
      blocks.push(block.concat(calculateECC(block, ecBlock.ecPerBlock)));
      offset += group.dataCW;
    }
  }

  return getInterleavedOrder(version, errorCorrectionLevel).map(
    ([block, position]) => blocks[block][position]
  );
}

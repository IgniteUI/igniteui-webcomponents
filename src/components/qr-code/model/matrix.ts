import type { QrErrorCorrectionLevel } from '../types.js';
import { encodeQR } from './encode.js';
import { applyMask, selectBestMask } from './mask.js';

/**
 * Returns the alignment pattern center coordinates of a version (ISO/IEC 18004, Annex E).
 *
 * The first center is always 6 and the last is `4 * version + 10`; the centers between are
 * spaced evenly by an even step, counted back from the last one.
 */
export function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }

  const count = Math.floor(version / 7) + 2;
  const last = 4 * version + 10;
  // Version 32 is the one exception to the step formula.
  const step =
    version === 32 ? 26 : Math.ceil((4 * version + 4) / (2 * count - 2)) * 2;

  const positions = [6];
  for (let i = count - 2; i >= 0; i--) {
    positions.push(last - i * step);
  }
  return positions;
}

/** The format information bits of the error correction levels L, M, Q and H. */
const FORMAT_LEVEL_BITS = [0b01, 0b00, 0b11, 0b10];

/**
 * The 15-bit format information of an error correction level index and a mask
 * pattern: 5 data bits and their BCH(15, 5) code, under the fixed XOR mask.
 */
export function getFormatInfo(level: number, mask: number): number {
  const data = (FORMAT_LEVEL_BITS[level] << 3) | mask;
  let remainder = data;

  for (let i = 0; i < 10; i++) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  }

  return ((data << 10) | remainder) ^ 0x5412;
}

/** The 18-bit version information of versions 7 and above: the version and its BCH(18, 6) code. */
export function getVersionInfo(version: number): number {
  let remainder = version;

  for (let i = 0; i < 12; i++) {
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  }

  return (version << 12) | remainder;
}

function createMatrix(size: number): boolean[][] {
  return Array.from({ length: size }, () => new Array(size).fill(false));
}

/** Places a 7x7 finder pattern and its 1-module separator, and marks them as function modules. */
function placeFinderPattern(
  matrix: boolean[][],
  functionModules: boolean[][],
  row: number,
  col: number
): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const mr = row + r;
      const mc = col + c;
      if (mr < 0 || mr >= matrix.length || mc < 0 || mc >= matrix.length) {
        continue;
      }
      // Rings from the center: dark 3x3, light, dark, light separator.
      const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
      functionModules[mr][mc] = true;
      matrix[mr][mc] = ring !== 2 && ring !== 4;
    }
  }
}

/** Places a 5x5 alignment pattern centered on `row`, `col`, and marks it as function modules. */
function placeAlignmentPattern(
  matrix: boolean[][],
  functionModules: boolean[][],
  row: number,
  col: number
): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      functionModules[row + r][col + c] = true;
      matrix[row + r][col + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
    }
  }
}

/** Places the timing patterns between the finder patterns, and marks them as function modules. */
function placeTimingPatterns(
  matrix: boolean[][],
  functionModules: boolean[][]
): void {
  const size = matrix.length;
  for (let i = 8; i < size - 8; i++) {
    const bit = i % 2 === 0;
    matrix[6][i] = bit;
    matrix[i][6] = bit;
    functionModules[6][i] = true;
    functionModules[i][6] = true;
  }
}

const FORMAT_INFO_POSITIONS: [number, number][] = [
  [8, 0],
  [8, 1],
  [8, 2],
  [8, 3],
  [8, 4],
  [8, 5],
  [8, 7],
  [8, 8],
  [7, 8],
  [5, 8],
  [4, 8],
  [3, 8],
  [2, 8],
  [1, 8],
  [0, 8],
];

/**
 * Returns `[row, col, bit]` for both copies of the 15-bit format information (error
 * correction level and mask), where `bit` 0 is the least significant.
 */
function formatInfoModules(size: number): [number, number, number][] {
  const modules = FORMAT_INFO_POSITIONS.map(
    ([r, c], i): [number, number, number] => [r, c, 14 - i]
  );
  for (let i = 0; i < 8; i++) modules.push([8, size - 1 - i, i]);
  for (let i = 0; i < 7; i++) modules.push([size - 7 + i, 8, i + 7]);
  return modules;
}

/**
 * Writes the 18-bit version information near the top-right and bottom-left finder patterns,
 * for version 7 and above, and marks it as function modules.
 */
function reserveVersionInfoAreas(
  matrix: boolean[][],
  functionModules: boolean[][],
  version: number
): void {
  if (version < 7) return;
  const size = matrix.length;
  const versionInfo = getVersionInfo(version);

  for (let i = 0; i < 18; i++) {
    const bit = (versionInfo >> i) & 1;
    const r = Math.floor(i / 3);
    const c = i % 3;
    matrix[r][size - 11 + c] = bit === 1;
    functionModules[r][size - 11 + c] = true;
    matrix[size - 11 + c][r] = bit === 1;
    functionModules[size - 11 + c][r] = true;
  }
}

/**
 * Places the codeword bits in a zig-zag from the bottom-right corner and skips the function
 * modules. The modules after the last bit stay light.
 */
function placeDataBits(
  matrix: boolean[][],
  functionModules: boolean[][],
  codewords: number[]
): void {
  const size = matrix.length;
  const totalBits = codewords.length * 8;
  let bitIndex = 0;

  let col = size - 1;
  let goingUp = true;

  while (col >= 0) {
    if (col === 6) {
      col--; // Skip vertical timing pattern
      continue;
    }

    const rowStart = goingUp ? size - 1 : 0;
    const rowEnd = goingUp ? -1 : size;
    const rowStep = goingUp ? -1 : 1;

    for (let row = rowStart; row !== rowEnd; row += rowStep) {
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (c < 0) continue;
        if (functionModules[row][c]) continue;
        if (bitIndex < totalBits) {
          const byteIndex = Math.floor(bitIndex / 8);
          const bitPosition = 7 - (bitIndex % 8);
          matrix[row][c] = ((codewords[byteIndex] >> bitPosition) & 1) === 1;
          bitIndex++;
        } else {
          matrix[row][c] = false; // Padding bits (set to 0)
        }
      }
    }
    col -= 2;
    goingUp = !goingUp;
  }
}

/** Result produced by `generateQRCodeMatrix`. */
export interface QRCodeMatrixResult {
  /** The fully masked QR boolean matrix ready for rendering. */
  matrix: boolean[][];
  /** QR version (1–40) that was used. */
  version: number;
  /** Side length of the matrix in modules (= `version * 4 + 17`). */
  size: number;
}

/** Encodes `data`, builds the module matrix and applies the best mask. */
export function generateQRCodeMatrix(
  data: string,
  ecLevel: QrErrorCorrectionLevel = 'M',
  requiredVersion?: number
): QRCodeMatrixResult {
  const encoded = encodeQR(data, ecLevel, requiredVersion);
  const { codewords, version, ecLevelIndex } = encoded;

  const size = version * 4 + 17;
  const matrix = createMatrix(size);
  const functionModules = createMatrix(size);

  placeFinderPattern(matrix, functionModules, 0, 0);
  placeFinderPattern(matrix, functionModules, 0, size - 7);
  placeFinderPattern(matrix, functionModules, size - 7, 0);

  placeTimingPatterns(matrix, functionModules);

  // The dark module, present in all versions.
  const darkRow = 4 * version + 9;
  matrix[darkRow][8] = true;
  functionModules[darkRow][8] = true;

  const alignmentPositions = getAlignmentPatternPositions(version);
  for (const r of alignmentPositions) {
    for (const c of alignmentPositions) {
      // Skip if this position overlaps with a finder pattern
      if (
        (r <= 8 && c <= 8) ||
        (r <= 8 && c >= size - 8) ||
        (r >= size - 8 && c <= 8)
      ) {
        continue;
      }
      placeAlignmentPattern(matrix, functionModules, r, c);
    }
  }

  reserveVersionInfoAreas(matrix, functionModules, version);

  const formatModules = formatInfoModules(size);
  for (const [r, c] of formatModules) functionModules[r][c] = true;

  placeDataBits(matrix, functionModules, codewords);

  const bestMask = selectBestMask(matrix, functionModules);

  const maskedMatrix = applyMask(matrix, functionModules, bestMask);

  const formatBits = getFormatInfo(ecLevelIndex, bestMask);
  for (const [r, c, bit] of formatModules) {
    maskedMatrix[r][c] = ((formatBits >> bit) & 1) === 1;
  }
  maskedMatrix[size - 8][8] = true;

  return { matrix: maskedMatrix, version, size };
}

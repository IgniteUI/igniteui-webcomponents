import type { QrErrorCorrectionLevel } from '../types.js';
import { encodeQR } from './encode.js';
import { applyMask, selectBestMask } from './mask.js';

// Alignment pattern positions for each version (1-40).
const ALIGNMENT_PATTERN_TABLE: number[][] = [
  [], // V1
  [6, 18], // V2
  [6, 22], // V3
  [6, 26], // V4
  [6, 30], // V5
  [6, 34], // V6
  [6, 22, 38], // V7
  [6, 24, 42], // V8
  [6, 26, 46], // V9
  [6, 28, 50], // V10
  [6, 30, 54], // V11
  [6, 32, 58], // V12
  [6, 34, 62], // V13
  [6, 26, 46, 66], // V14
  [6, 26, 48, 70], // V15
  [6, 26, 50, 74], // V16
  [6, 30, 54, 78], // V17
  [6, 30, 56, 82], // V18
  [6, 30, 58, 86], // V19
  [6, 34, 62, 90], // V20
  [6, 28, 50, 72, 94], // V21
  [6, 26, 50, 74, 98], // V22
  [6, 30, 54, 78, 102], // V23
  [6, 28, 54, 80, 106], // V24
  [6, 32, 58, 84, 110], // V25
  [6, 30, 58, 86, 114], // V26
  [6, 34, 62, 90, 118], // V27
  [6, 26, 50, 74, 98, 122], // V28
  [6, 30, 54, 78, 102, 126], // V29
  [6, 26, 52, 78, 104, 130], // V30
  [6, 30, 56, 82, 108, 132], // V31
  [6, 34, 60, 86, 112, 136], // V32
  [6, 30, 58, 86, 114, 142], // V33
  [6, 34, 62, 90, 118, 146], // V34
  [6, 30, 54, 78, 102, 126, 150], // V35
  [6, 24, 50, 76, 102, 128, 154], // V36
  [6, 28, 54, 80, 106, 132, 158], // V37
  [6, 32, 58, 84, 110, 136, 162], // V38
  [6, 26, 54, 82, 110, 138, 166], // V39
  [6, 30, 58, 86, 114, 142, 170], // V40
];

// Format information for each error correction level and mask pattern.
const FORMAT_INFO_TABLE: number[] = [
  // L (EC level bits 01)
  0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
  // M (EC level bits 00)
  0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
  // Q (EC level bits 11)
  0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed,
  // H (EC level bits 10)
  0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b,
];

// The 18-bit version information for versions 7 and above.
const VERSION_INFO_TABLE: number[] = [
  0x07c94, // V7
  0x085bc, // V8
  0x09a99, // V9
  0x0a4d3, // V10
  0x0bbf6, // V11
  0x0c762, // V12
  0x0d847, // V13
  0x0e60d, // V14
  0x0f928, // V15
  0x10b78, // V16
  0x1145d, // V17
  0x12a17, // V18
  0x13532, // V19
  0x149a6, // V20
  0x15683, // V21
  0x168c9, // V22
  0x177ec, // V23
  0x18ec4, // V24
  0x191e1, // V25
  0x1afab, // V26
  0x1b08e, // V27
  0x1cc1a, // V28
  0x1d33f, // V29
  0x1ed75, // V30
  0x1f250, // V31
  0x209d5, // V32
  0x216f0, // V33
  0x228ba, // V34
  0x2379f, // V35
  0x24b0b, // V36
  0x2542e, // V37
  0x26a64, // V38
  0x27541, // V39
  0x28c69, // V40
];

const EC_LEVEL_FORMAT_INDEX: Record<QrErrorCorrectionLevel, number> = {
  L: 0,
  M: 1,
  Q: 2,
  H: 3,
};

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
      functionModules[mr][mc] = true;
      if (r === -1 || r === 7 || c === -1 || c === 7) {
        matrix[mr][mc] = false; // Separator (white border)
      } else if (r === 0 || r === 6 || c === 0 || c === 6) {
        matrix[mr][mc] = true; // Finder pattern (black)
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        matrix[mr][mc] = true; // inner square (black)
      } else {
        matrix[mr][mc] = false; // inner area (white)
      }
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
      const mr = row + r;
      const mc = col + c;
      functionModules[mr][mc] = true;
      if (r === -2 || r === 2 || c === -2 || c === 2) {
        matrix[mr][mc] = true; // Alignment pattern (black)
      } else if (r === 0 && c === 0) {
        matrix[mr][mc] = true; // center module (black)
      } else {
        matrix[mr][mc] = false; // other modules (white)
      }
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

/** Reserves the modules of the 15-bit format information (error correction level and mask). */
function reserveFormatInfoAreas(
  functionModules: boolean[][],
  size: number
): void {
  for (const [r, c] of FORMAT_INFO_POSITIONS) {
    functionModules[r][c] = true;
  }

  for (let i = 0; i < 8; i++) {
    functionModules[8][size - 1 - i] = true;
  }

  for (let i = 0; i < 7; i++) {
    functionModules[size - 7 + i][8] = true;
  }
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
  const versionInfo = VERSION_INFO_TABLE[version - 7];

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
  const { codewords, version } = encoded;

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

  const alignmentPositions = ALIGNMENT_PATTERN_TABLE[version - 1];
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

  reserveFormatInfoAreas(functionModules, size);

  placeDataBits(matrix, functionModules, codewords);

  const bestMask = selectBestMask(matrix, functionModules);

  const maskedMatrix = applyMask(matrix, functionModules, bestMask);

  const ecFormatIndex = EC_LEVEL_FORMAT_INDEX[ecLevel];
  const formatBits = FORMAT_INFO_TABLE[ecFormatIndex * 8 + bestMask];
  writeFormatInfo(maskedMatrix, formatBits, size);

  return { matrix: maskedMatrix, version, size };
}

function writeFormatInfo(
  matrix: boolean[][],
  formatBits: number,
  size: number
): void {
  for (let i = 0; i < 15; i++) {
    const bit = (formatBits >> (14 - i)) & 1;
    const [r, c] = FORMAT_INFO_POSITIONS[i];
    matrix[r][c] = bit === 1;
  }

  for (let i = 0; i < 8; i++) {
    const bit = (formatBits >> i) & 1;
    matrix[8][size - 1 - i] = bit === 1;
  }

  for (let i = 0; i < 7; i++) {
    const bit = (formatBits >> (i + 7)) & 1;
    matrix[size - 7 + i][8] = bit === 1;
  }

  matrix[size - 8][8] = true;
}

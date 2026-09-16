/** One of the eight QR mask pattern indices (0–7). */
export type MaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const MASK_PATTERN_FUNCTIONS: ((row: number, col: number) => boolean)[] = [
  (row, col) => (row + col) % 2 === 0,
  (row, _) => row % 2 === 0,
  (_, col) => col % 3 === 0,
  (row, col) => (row + col) % 3 === 0,
  (row, col) => (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0,
  (row, col) => ((row * col) % 2) + ((row * col) % 3) === 0,
  (row, col) => (((row * col) % 2) + ((row * col) % 3)) % 2 === 0,
  (row, col) => (((row + col) % 2) + ((row * col) % 3)) % 2 === 0,
];

/**
 * Applies the given mask pattern to all non-function modules of the matrix,
 * returning a new 2D array (the input is not mutated).
 */
export function applyMask(
  matrix: boolean[][],
  functionModules: boolean[][],
  pattern: MaskPattern
): boolean[][] {
  const condition = MASK_PATTERN_FUNCTIONS[pattern];
  return matrix.map((row, r) =>
    row.map((val, c) => {
      if (functionModules[r][c]) return val;
      return condition(r, c) ? !val : val;
    })
  );
}

// Penalty Rule 1: Adjacent modules in row/column in same color
function penaltyRule1(matrix: boolean[][]): number {
  const size = matrix.length;
  let penalty = 0;

  for (let r = 0; r < size; r++) {
    // Compute horizontal runs
    let runLen = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);

    // Compute vertical runs
    runLen = 1;
    for (let i = 1; i < size; i++) {
      if (matrix[i][r] === matrix[i - 1][r]) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }

  return penalty;
}

// Penalty Rule 2: Blocks of modules in same color
function penaltyRule2(matrix: boolean[][]): number {
  const size = matrix.length;
  let penalty = 0;

  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const value = matrix[r][c];
      if (
        matrix[r][c + 1] === value &&
        matrix[r + 1][c] === value &&
        matrix[r + 1][c + 1] === value
      ) {
        penalty += 3;
      }
    }
  }

  return penalty;
}

const N3_PATTERN1 = [
  true,
  false,
  true,
  true,
  true,
  false,
  true,
  false,
  false,
  false,
  false,
];
const N3_PATTERN2 = [
  false,
  false,
  false,
  false,
  true,
  false,
  true,
  true,
  true,
  false,
  true,
];

function matchPatternInRow(
  row: boolean[],
  start: number,
  pattern: boolean[]
): boolean {
  for (let i = 0; i < pattern.length; i++) {
    if (row[start + i] !== pattern[i]) return false;
  }
  return true;
}

function matchPatternInColumn(
  matrix: boolean[][],
  startRow: number,
  col: number,
  pattern: boolean[]
): boolean {
  for (let i = 0; i < pattern.length; i++) {
    if (matrix[startRow + i][col] !== pattern[i]) return false;
  }
  return true;
}

// Penalty Rule 3: Patterns similar to the finder patterns
function penaltyRule3(matrix: boolean[][]): number {
  const size = matrix.length;
  let penalty = 0;

  for (let r = 0; r < size; r++) {
    const row = matrix[r];
    for (let c = 0; c <= size - 11; c++) {
      if (
        matchPatternInRow(row, c, N3_PATTERN1) ||
        matchPatternInRow(row, c, N3_PATTERN2)
      ) {
        penalty += 40;
      }
    }
  }

  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      if (
        matchPatternInColumn(matrix, r, c, N3_PATTERN1) ||
        matchPatternInColumn(matrix, r, c, N3_PATTERN2)
      ) {
        penalty += 40;
      }
    }
  }

  return penalty;
}

// Penalty Rule 4: Proportion of dark modules in entire symbol
function penaltyRule4(matrix: boolean[][]): number {
  const size = matrix.length;
  let darkCount = 0;
  const totalModules = size * size;

  for (const row of matrix) {
    for (const val of row) {
      if (val) darkCount++;
    }
  }

  const darkRatio = (darkCount / totalModules) * 100;
  return Math.floor(Math.abs(darkRatio - 50) / 5) * 10;
}

/** Computes the total QR penalty score for a masked matrix (sum of rules 1–4). */
export function calculatePenalty(matrix: boolean[][]): number {
  return (
    penaltyRule1(matrix) +
    penaltyRule2(matrix) +
    penaltyRule3(matrix) +
    penaltyRule4(matrix)
  );
}

/** Evaluates all eight mask patterns and returns the one with the lowest penalty score. */
export function selectBestMask(
  matrix: boolean[][],
  functionModules: boolean[][]
): MaskPattern {
  let bestMask: MaskPattern = 0;
  let lowestPenalty = Number.POSITIVE_INFINITY;

  for (let pattern = 0; pattern < 8; pattern++) {
    const maskedMatrix = applyMask(
      matrix,
      functionModules,
      pattern as MaskPattern
    );
    const penalty = calculatePenalty(maskedMatrix);
    if (penalty < lowestPenalty) {
      lowestPenalty = penalty;
      bestMask = pattern as MaskPattern;
    }
  }
  return bestMask;
}

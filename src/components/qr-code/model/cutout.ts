import {
  EC_BLOCKS_TABLE,
  getInterleavedOrder,
  getTotalCodewordsCount,
} from './error-correction.js';
import { createFunctionPatterns, forEachDataModule } from './matrix.js';

/** A range of modules, from the first to the last row and column. */
export type ModuleRange = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};

/** Returns `range` clipped to a matrix of `size` modules. */
export function clampRange(
  { top, left, bottom, right }: ModuleRange,
  size: number
): ModuleRange {
  return {
    top: Math.max(top, 0),
    left: Math.max(left, 0),
    bottom: Math.min(bottom, size - 1),
    right: Math.min(right, size - 1),
  };
}

/** The module map value of a locator module, which a scanner needs to read the code. */
export const LOCATOR_MODULE = -2;

/**
 * The misdecode protection codewords, by version - 1 and level index (ISO/IEC 18004, table 9).
 * They take no part in the error correction.
 */
const MISDECODE_PROTECTION = [[3, 2, 1, 1], [2], [1]];

const moduleMaps = new Map<number, Int16Array>();
const codewordBlocks = new Map<string, Uint8Array>();

/**
 * Returns, row by row, the interleaved codeword of each module of `version`: `LOCATOR_MODULE`
 * for a finder pattern, its separator, and the format and version information, and -1 for the
 * other function modules and the remainder bits.
 */
export function getModuleMap(version: number): Int16Array {
  const cached = moduleMaps.get(version);
  if (cached) return cached;

  const { functionModules, locatorModules } = createFunctionPatterns(version);
  const size = functionModules.length;
  const total = getTotalCodewordsCount(version);
  const map = new Int16Array(size * size).fill(-1);
  let bit = 0;

  for (const [index, locator] of locatorModules.flat().entries()) {
    if (locator) map[index] = LOCATOR_MODULE;
  }

  forEachDataModule(functionModules, (row, col) => {
    const codeword = bit++ >> 3;
    if (codeword < total) map[row * size + col] = codeword;
  });

  moduleMaps.set(version, map);
  return map;
}

function getCodewordBlocks(version: number, level: number): Uint8Array {
  const key = `${version}:${level}`;
  let blocks = codewordBlocks.get(key);

  if (!blocks) {
    blocks = Uint8Array.from(
      getInterleavedOrder(version, level),
      ([block]) => block
    );
    codewordBlocks.set(key, blocks);
  }

  return blocks;
}

/**
 * Whether a scanner reads a code of `version` and `level` (0 for L to 3 for H) with the modules
 * of the `cutout` ranges hidden: no hidden module is a locator module, and no block loses more
 * codewords than it corrects. A codeword with one hidden module counts as lost.
 */
export function canHideModules(
  version: number,
  level: number,
  ...cutout: ModuleRange[]
): boolean {
  const size = version * 4 + 17;
  const map = getModuleMap(version);
  const hidden = new Set<number>();

  for (const range of cutout) {
    const { top, left, bottom, right } = clampRange(range, size);

    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        const codeword = map[row * size + col];

        if (codeword === LOCATOR_MODULE) return false;
        if (codeword >= 0) hidden.add(codeword);
      }
    }
  }

  const protection = MISDECODE_PROTECTION[version - 1]?.[level] ?? 0;
  const correctable =
    (EC_BLOCKS_TABLE[version - 1][level].ecPerBlock - protection) >> 1;
  const blocks = getCodewordBlocks(version, level);
  const losses: number[] = [];

  for (const codeword of hidden) {
    const block = blocks[codeword];
    losses[block] = (losses[block] ?? 0) + 1;

    if (losses[block] > correctable) return false;
  }

  return true;
}

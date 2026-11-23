import { getAlignmentPatternCenters } from '../model/matrix.js';
import type {
  QrCornerDotStyle,
  QrCornerSquareStyle,
  QrDotStyle,
} from '../types.js';

function squarePath(x: number, y: number, s: number): string {
  return `M${x},${y}h${s}v${s}h${-s}Z`;
}

function circlePath(cx: number, cy: number, r: number, sweep = 0): string {
  return (
    `M${cx - r},${cy}` +
    `a${r},${r} 0 1,${sweep} ${r * 2},0` +
    `a${r},${r} 0 1,${sweep} ${-r * 2},0z`
  );
}

/**
 * The distance of the cubic control points from the axis, as a ratio of the half side, that puts
 * the curve on the superellipse |x|⁴ + |y|⁴ = 1 at 45°: (2^-¼ - ½) / ⅜.
 */
const SQUIRCLE_KAPPA = 0.909_057;

/** The relative cubics of the last squircle side, which all the data modules share. */
let squircleCurves = { side: Number.NaN, path: '' };

/** Returns the path of a squircle that fills the square of side `s` at `x`, `y`. */
function squirclePath(x: number, y: number, s: number): string {
  if (squircleCurves.side !== s) {
    const round = (value: number) => Number(value.toFixed(4));
    const h = round(s / 2);
    const d = round((s / 2) * (1 - SQUIRCLE_KAPPA));
    const k = round(h - d);
    // One cubic for each quadrant, clockwise from the middle of the right side.
    squircleCurves = {
      side: s,
      path:
        `c0,${k} ${-d},${h} ${-h},${h}` +
        `s${-h},${-d} ${-h},${-h}` +
        `s${d},${-h} ${h},${-h}` +
        `s${h},${d} ${h},${h}z`,
    };
  }

  return `M${x + s},${y + s / 2}${squircleCurves.path}`;
}

function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string {
  const cr = Math.min(radius, width / 2, height / 2);
  return roundedRectPerCorner(x, y, width, height, cr, cr, cr, cr);
}

function roundedRectPerCorner(
  x: number,
  y: number,
  width: number,
  height: number,
  rTL: number,
  rTR: number,
  rBR: number,
  rBL: number
): string {
  return (
    `M${x + rTL},${y}` +
    `h${width - rTL - rTR}` +
    `q${rTR},0 ${rTR},${rTR}` +
    `v${height - rTR - rBR}` +
    `q0,${rBR} ${-rBR},${rBR}` +
    `h${-(width - rBR - rBL)}` +
    `q${-rBL},0 ${-rBL},${-rBL}` +
    `v${-(height - rBL - rTL)}` +
    `q0,${-rTL} ${rTL},${-rTL}z`
  );
}

/**
 * Returns the SVG path of the data module at row `r` and column `c`, in a cell of side `s`
 * at `x`, `y`. The module is `scale` times the cell, centered in it. A `'rounded'` module
 * keeps a square corner toward each dark neighbor that it touches.
 */
function dotPath(
  data: boolean[][],
  r: number,
  c: number,
  x: number,
  y: number,
  s: number,
  style: QrDotStyle,
  scale: number
): string {
  const size = s * scale;
  const inset = (s - size) / 2;

  switch (style) {
    case 'square':
      return squarePath(x + inset, y + inset, size);
    case 'circle':
      return circlePath(x + s / 2, y + s / 2, size / 2);
    case 'squircle':
      return squirclePath(x + inset, y + inset, size);
    case 'rounded': {
      const R = size * 0.45;
      // A scaled module touches no neighbor.
      if (scale < 1) {
        return roundedRect(x + inset, y + inset, size, size, R);
      }
      // Out of the matrix, the reads give `undefined`, a light neighbor.
      const top = data[r - 1]?.[c];
      const right = data[r][c + 1];
      const bottom = data[r + 1]?.[c];
      const left = data[r][c - 1];
      return roundedRectPerCorner(
        x,
        y,
        s,
        s,
        top || left ? 0 : R,
        top || right ? 0 : R,
        bottom || right ? 0 : R,
        bottom || left ? 0 : R
      );
    }
  }
}

/** Returns an SVG path string for the inner dot of a finder-pattern corner. */
function cornerDotPath(
  x: number,
  y: number,
  size: number,
  style: QrCornerDotStyle
): string {
  switch (style) {
    case 'circle':
      return circlePath(x + size / 2, y + size / 2, size / 2);
    case 'rounded': {
      return roundedRect(x, y, size, size, size * 0.3);
    }
    case 'squircle':
      return squirclePath(x, y, size);
    default:
      return squarePath(x, y, size);
  }
}

/** Returns the SVG path of a ring of side `size` and of width `ring`. */
function cornerSquarePath(
  x: number,
  y: number,
  size: number,
  ring: number,
  style: QrCornerSquareStyle
): string {
  const inner = size - 2 * ring;
  const innerOffset = ring;

  switch (style) {
    case 'square': {
      const outer = squarePath(x, y, size);
      const cut = squarePath(x + innerOffset, y + innerOffset, inner);
      return `${outer} ${cut}`;
    }
    case 'rounded': {
      const outer = roundedRect(x, y, size, size, size * 0.15);
      const cut = squarePath(x + innerOffset, y + innerOffset, inner);
      return `${outer} ${cut}`;
    }
    case 'squircle': {
      const outer = squirclePath(x, y, size);
      const cut = squirclePath(x + innerOffset, y + innerOffset, inner);
      return `${outer} ${cut}`;
    }
    default: {
      const cx = x + size / 2;
      const cy = y + size / 2;
      return circlePath(cx, cy, size / 2) + circlePath(cx, cy, inner / 2, 1);
    }
  }
}

/** Converts a module grid index to a pixel coordinate, accounting for margin. */
export function moduleToPx(
  moduleIndex: number,
  moduleSize: number,
  marginPx: number
): number {
  return moduleIndex * moduleSize + marginPx;
}

function finderCorners(size: number): [number, number][] {
  return [
    [0, 0], // Top-left
    [0, size - 7], // Top-right
    [size - 7, 0], // Bottom-left
  ];
}

function alignmentCenters(size: number): [number, number][] {
  return getAlignmentPatternCenters((size - 17) / 4);
}

/**
 * Returns the ring and the center dot of a finder pattern (7 modules) or an alignment pattern
 * (5 modules) whose top-left module is at `x`, `y`.
 */
export function patternPaths(
  x: number,
  y: number,
  modules: number,
  moduleSize: number,
  squareStyle: QrCornerSquareStyle,
  dotStyle: QrCornerDotStyle
): [ring: string, dot: string] {
  const inset = 2 * moduleSize;
  return [
    cornerSquarePath(x, y, modules * moduleSize, moduleSize, squareStyle),
    cornerDotPath(x + inset, y + inset, (modules - 4) * moduleSize, dotStyle),
  ];
}

/**
 * Returns a copy of `data` without the finder patterns, their separators and the alignment
 * patterns, which have their own shapes. A joining style does not join a module to them.
 */
function dataModulesOf(data: boolean[][]): boolean[][] {
  const size = data.length;
  const modules = data.map((row) => row.slice());
  const clear = (row: number, col: number, side: number) => {
    for (let r = Math.max(row, 0); r < Math.min(row + side, size); r++) {
      modules[r].fill(false, Math.max(col, 0), col + side);
    }
  };

  for (const [row, col] of finderCorners(size)) clear(row - 1, col - 1, 9);
  for (const [row, col] of alignmentCenters(size)) clear(row - 2, col - 2, 5);

  return modules;
}

/**
 * Returns one SVG path for each dark data module outside the finder and alignment patterns, at
 * `dotScale` times the module size.
 */
export function renderDataModules(
  data: boolean[][],
  moduleSize: number,
  marginPx: number,
  dotStyle: QrDotStyle,
  dotScale: number
): string[] {
  const modules = dataModulesOf(data);
  const size = modules.length;
  const paths: string[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!modules[r][c]) continue;

      const x = moduleToPx(c, moduleSize, marginPx);
      const y = moduleToPx(r, moduleSize, marginPx);

      paths.push(dotPath(modules, r, c, x, y, moduleSize, dotStyle, dotScale));
    }
  }

  return paths;
}

/**
 * Returns the SVG path of the alignment patterns of a matrix of `size` modules: a ring of
 * `squareStyle` and a center dot of `dotStyle` for each. Fill it with the `evenodd` rule.
 */
export function alignmentPath(
  size: number,
  moduleSize: number,
  marginPx: number,
  squareStyle: QrCornerSquareStyle,
  dotStyle: QrCornerDotStyle
): string {
  return alignmentCenters(size)
    .flatMap(([r, c]) =>
      patternPaths(
        moduleToPx(c - 2, moduleSize, marginPx),
        moduleToPx(r - 2, moduleSize, marginPx),
        5,
        moduleSize,
        squareStyle,
        dotStyle
      )
    )
    .join(' ');
}

/**
 * Returns the style that a corner dot draws in a ring of `squareStyle`. A `circle` ring takes a
 * round dot: zxing checks the pattern on the diagonals too, and a square dot leaves a gap there.
 */
export function resolveCornerDotStyle(
  squareStyle: QrCornerSquareStyle,
  dotStyle: QrCornerDotStyle
): QrCornerDotStyle {
  return squareStyle === 'circle' && dotStyle === 'square'
    ? 'circle'
    : dotStyle;
}

/**
 * Returns the transform that puts each module of a code of `side` modules on whole pixels of an
 * image of `pixels`, with the spare pixels in the quiet zone. Below 1 pixel per module, it returns
 * `undefined`.
 */
export function snapToPixels(
  pixels: number,
  side: number,
  margin: number
): { transform: string; scale: number } | undefined {
  const modules = side + 2 * margin;
  let modulePixels = Math.floor(pixels / modules);

  // A fractional margin needs whole pixels on both sides.
  if (2 * Math.ceil(margin * modulePixels) + modulePixels * side > pixels) {
    modulePixels--;
  }

  if (!Number.isFinite(modulePixels) || modulePixels < 1) {
    return undefined;
  }

  const start = Math.floor((pixels - modulePixels * side) / 2);
  const scale = (modulePixels * modules) / pixels;
  const offset = (side * (start - modulePixels * margin)) / pixels;

  return { transform: `translate(${offset} ${offset}) scale(${scale})`, scale };
}

/** Returns the top-left pixel coordinates of the three finder-pattern corners. */
export function getFinderPatterns(
  size: number,
  moduleSize: number,
  marginPx: number
) {
  return finderCorners(size).map(([r, c]) => ({
    x: moduleToPx(c, moduleSize, marginPx),
    y: moduleToPx(r, moduleSize, marginPx),
  }));
}

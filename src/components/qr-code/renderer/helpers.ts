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
export function cornerDotPath(
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

/** Returns the SVG path (a ring with a cutout) of the outer square of a finder corner. */
export function cornerSquarePath(
  x: number,
  y: number,
  size: number,
  style: QrCornerSquareStyle
): string {
  const moduleSize = size / 7;
  const inner = size - 2 * moduleSize;
  const innerOffset = moduleSize;

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

/**
 * Returns one SVG path for each dark data module outside the finder patterns, at `dotScale`
 * times the module size.
 */
export function renderDataModules(
  data: boolean[][],
  moduleSize: number,
  marginPx: number,
  dotStyle: QrDotStyle,
  dotScale: number
): string[] {
  const size = data.length;
  const far = size - 8;
  const paths: string[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // The finder patterns and their separators.
      if ((r <= 7 && (c <= 7 || c >= far)) || (r >= far && c <= 7)) continue;
      if (!data[r][c]) continue;

      const x = moduleToPx(c, moduleSize, marginPx);
      const y = moduleToPx(r, moduleSize, marginPx);

      paths.push(dotPath(data, r, c, x, y, moduleSize, dotStyle, dotScale));
    }
  }

  return paths;
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

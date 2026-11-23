import { createMatrix, getAlignmentPatternCenters } from '../model/matrix.js';
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

/** The radius of the corners of a `rounded` module, and of the fillets of `liquid`, per side. */
const ROUNDED_RADIUS = 0.45;

/**
 * Returns `build(side)`, kept for the last side: the relative part of a shape that all the
 * modules of one size share.
 */
function cachedBySide(
  build: (side: number) => string
): (side: number) => string {
  let side = Number.NaN;
  let path = '';
  return (s) => {
    if (s !== side) {
      side = s;
      path = build(s);
    }
    return path;
  };
}

const squircleCurves = cachedBySide((s) => {
  const round = (value: number) => Number(value.toFixed(4));
  const h = round(s / 2);
  const d = round((s / 2) * (1 - SQUIRCLE_KAPPA));
  const k = round(h - d);
  // One cubic for each quadrant, clockwise from the middle of the right side.
  return (
    `c0,${k} ${-d},${h} ${-h},${h}` +
    `s${-h},${-d} ${-h},${-h}` +
    `s${d},${-h} ${h},${-h}` +
    `s${h},${d} ${h},${h}z`
  );
});

/** Returns the path of a squircle that fills the square of side `s` at `x`, `y`. */
function squirclePath(x: number, y: number, s: number): string {
  return `M${x + s},${y + s / 2}${squircleCurves(s)}`;
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

/** `roundedRectPerCorner` with circular arcs for the corners. */
function arcRectPerCorner(
  x: number,
  y: number,
  width: number,
  height: number,
  rTL: number,
  rTR: number,
  rBR: number,
  rBL: number
): string {
  const arc = (r: number, dx: number, dy: number) =>
    r ? `a${r},${r} 0 0 1 ${dx},${dy}` : '';
  return (
    `M${x + rTL},${y}` +
    `h${width - rTL - rTR}${arc(rTR, rTR, rTR)}` +
    `v${height - rTR - rBR}${arc(rBR, -rBR, rBR)}` +
    `h${-(width - rBR - rBL)}${arc(rBL, -rBL, -rBL)}` +
    `v${-(height - rBL - rTL)}${arc(rTL, rTL, -rTL)}z`
  );
}

const diamondTail = cachedBySide((s) => {
  const h = s / 2;
  return `l${h},${h}l${-h},${h}l${-h},${-h}z`;
});

function diamondPath(x: number, y: number, s: number): string {
  return `M${x + s / 2},${y}${diamondTail(s)}`;
}

const plusTail = cachedBySide((s) => {
  const a = s / 4;
  return `h${2 * a}v${a}h${a}v${2 * a}h${-a}v${a}h${-2 * a}v${-a}h${-a}v${-2 * a}h${a}z`;
});

/** Returns the path of a cross with arms half as wide as the square of side `s` at `x`, `y`. */
function plusPath(x: number, y: number, s: number): string {
  return `M${x + s / 4},${y}${plusTail(s)}`;
}

/**
 * Returns the path of a leaf in the square of side `s` at `x`, `y`: its top-left and
 * bottom-right corners are round, or its top-right and bottom-left ones on the `antiDiagonal`.
 * A radius over a quarter of the side fails to decode.
 */
function leafPath(
  x: number,
  y: number,
  s: number,
  antiDiagonal: boolean
): string {
  const r = s / 4;
  return antiDiagonal
    ? arcRectPerCorner(x, y, s, s, 0, r, 0, r)
    : arcRectPerCorner(x, y, s, s, r, 0, r, 0);
}

/** Returns the path of a pill with round ends on its short sides. */
function pillPath(x: number, y: number, width: number, height: number): string {
  const r = Math.min(width, height) / 2;
  return arcRectPerCorner(x, y, width, height, r, r, r, r);
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
    case 'circle':
      return circlePath(x + s / 2, y + s / 2, size / 2);
    case 'squircle':
      return squirclePath(x + inset, y + inset, size);
    case 'diamond':
      return diamondPath(x + inset, y + inset, size);
    case 'plus':
      return plusPath(x + inset, y + inset, size);
    case 'rounded':
    case 'liquid': {
      const R = size * ROUNDED_RADIUS;
      // A scaled module touches no neighbor. Out of the matrix, a read gives `undefined`.
      const joins = scale === 1;
      const top = joins && data[r - 1]?.[c];
      const right = joins && data[r][c + 1];
      const bottom = joins && data[r + 1]?.[c];
      const left = joins && data[r][c - 1];
      return roundedRectPerCorner(
        x + inset,
        y + inset,
        size,
        size,
        top || left ? 0 : R,
        top || right ? 0 : R,
        bottom || right ? 0 : R,
        bottom || left ? 0 : R
      );
    }
    default:
      return squarePath(x + inset, y + inset, size);
  }
}

/** Returns the SVG path of the center dot of a finder or an alignment pattern. */
function cornerDotPath(
  x: number,
  y: number,
  size: number,
  style: QrCornerDotStyle,
  antiDiagonal: boolean
): string {
  switch (style) {
    case 'circle':
      return circlePath(x + size / 2, y + size / 2, size / 2);
    case 'rounded': {
      return roundedRect(x, y, size, size, size * 0.3);
    }
    case 'squircle':
      return squirclePath(x, y, size);
    case 'leaf':
      return leafPath(x, y, size, antiDiagonal);
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
  style: QrCornerSquareStyle,
  antiDiagonal: boolean
): string {
  const inner = size - 2 * ring;
  const cut = (shape: (x: number, y: number, s: number) => string) =>
    shape(x + ring, y + ring, inner);

  switch (style) {
    case 'leaf': {
      const leaf = (left: number, top: number, s: number) =>
        leafPath(left, top, s, antiDiagonal);
      return `${leaf(x, y, size)} ${cut(leaf)}`;
    }
    case 'square':
      return `${squarePath(x, y, size)} ${cut(squarePath)}`;
    case 'rounded':
      return `${roundedRect(x, y, size, size, size * 0.15)} ${cut(squarePath)}`;
    case 'squircle':
      return `${squirclePath(x, y, size)} ${cut(squirclePath)}`;
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
  dotStyle: QrCornerDotStyle,
  antiDiagonal = false
): [ring: string, dot: string] {
  const size = modules * moduleSize;
  const inset = 2 * moduleSize;
  return [
    cornerSquarePath(x, y, size, moduleSize, squareStyle, antiDiagonal),
    cornerDotPath(
      x + inset,
      y + inset,
      size - 2 * inset,
      dotStyle,
      antiDiagonal
    ),
  ];
}

/**
 * Returns the cells of the finder patterns, their separators and the alignment patterns of a
 * matrix of `size` modules.
 */
function patternCells(size: number): boolean[][] {
  const cells = createMatrix(size);
  const mark = (row: number, col: number, side: number) => {
    for (let r = Math.max(row, 0); r < Math.min(row + side, size); r++) {
      cells[r].fill(true, Math.max(col, 0), col + side);
    }
  };

  for (const [row, col] of finderCorners(size)) mark(row - 1, col - 1, 9);
  for (const [row, col] of alignmentCenters(size)) mark(row - 2, col - 2, 5);

  return cells;
}

/**
 * Returns the concave fillets of `liquid`: one in each corner of a light cell where the two
 * neighbors and the diagonal neighbor at that corner are dark, so an L-join has no sharp
 * inside corner.
 */
function filletPaths(
  modules: boolean[][],
  patterns: boolean[][],
  moduleSize: number,
  marginPx: number
): string[] {
  const size = modules.length;
  const R = moduleSize * ROUNDED_RADIUS;
  const dark = (r: number, c: number) => modules[r]?.[c] === true;
  // The directions of the neighbors at each corner, and the fillet from the corner point.
  const corners = [
    [-1, -1],
    [-1, 1],
    [1, 1],
    [1, -1],
  ].map(([dr, dc]) => ({
    dr,
    dc,
    fillet: `h${-dc * R}a${R},${R} 0 0 ${dr === dc ? 0 : 1} ${dc * R},${-dr * R}z`,
  }));
  const paths: string[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c] || patterns[r][c]) continue;

      for (const { dr, dc, fillet } of corners) {
        if (dark(r + dr, c) && dark(r, c + dc) && dark(r + dr, c + dc)) {
          const x = moduleToPx(c + (dc > 0 ? 1 : 0), moduleSize, marginPx);
          const y = moduleToPx(r + (dr > 0 ? 1 : 0), moduleSize, marginPx);
          paths.push(`M${x},${y}${fillet}`);
        }
      }
    }
  }

  return paths;
}

/**
 * Returns one pill for each run of dark modules in a row, or in a column when `vertical` is
 * set. `scale` sets the thickness and insets the ends.
 */
function barPaths(
  modules: boolean[][],
  moduleSize: number,
  marginPx: number,
  scale: number,
  vertical: boolean
): string[] {
  const size = modules.length;
  const thickness = moduleSize * scale;
  const inset = (moduleSize - thickness) / 2;
  const dark = (line: number, i: number) =>
    vertical ? modules[i][line] : modules[line][i];
  const paths: string[] = [];

  for (let line = 0; line < size; line++) {
    for (let start = 0; start < size; start++) {
      if (!dark(line, start)) continue;

      let end = start;
      while (end + 1 < size && dark(line, end + 1)) end++;

      const across = moduleToPx(line, moduleSize, marginPx) + inset;
      const along = moduleToPx(start, moduleSize, marginPx) + inset;
      const length = (end - start + 1) * moduleSize - 2 * inset;

      paths.push(
        vertical
          ? pillPath(across, along, thickness, length)
          : pillPath(along, across, length, thickness)
      );
      start = end;
    }
  }

  return paths;
}

/**
 * Returns the SVG paths of the dark data modules outside the finder and alignment patterns, at
 * `dotScale` times the module size. A joining style does not join a module to the patterns.
 */
export function renderDataModules(
  data: boolean[][],
  moduleSize: number,
  marginPx: number,
  dotStyle: QrDotStyle,
  dotScale: number
): string[] {
  const size = data.length;
  const patterns = patternCells(size);
  const modules = data.map((row, r) =>
    row.map((dark, c) => dark && !patterns[r][c])
  );

  if (dotStyle === 'horizontal-bars' || dotStyle === 'vertical-bars') {
    return barPaths(
      modules,
      moduleSize,
      marginPx,
      dotScale,
      dotStyle === 'vertical-bars'
    );
  }

  const paths: string[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!modules[r][c]) continue;

      const x = moduleToPx(c, moduleSize, marginPx);
      const y = moduleToPx(r, moduleSize, marginPx);

      paths.push(dotPath(modules, r, c, x, y, moduleSize, dotStyle, dotScale));
    }
  }

  // The fillets need touching modules.
  if (dotStyle === 'liquid' && dotScale === 1) {
    paths.push(...filletPaths(modules, patterns, moduleSize, marginPx));
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
 * The corner dot of each dot style. A diamond or plus finder center fails to decode, and a
 * joining style has no single-shape form.
 */
const CORNER_DOTS: Record<QrDotStyle, QrCornerDotStyle> = {
  square: 'square',
  circle: 'circle',
  rounded: 'rounded',
  squircle: 'squircle',
  diamond: 'square',
  plus: 'square',
  liquid: 'rounded',
  'horizontal-bars': 'rounded',
  'vertical-bars': 'rounded',
};

/**
 * Returns the style that the corner dots draw: `cornerDotStyle`, or else the one of `dotStyle`.
 * A `circle` ring draws a `square` or `leaf` dot as a circle: zxing checks the pattern on the
 * diagonals too, and a dot with corners there leaves a gap.
 */
export function resolveCornerDotStyle(
  squareStyle: QrCornerSquareStyle,
  cornerDotStyle: QrCornerDotStyle | undefined,
  dotStyle: QrDotStyle
): QrCornerDotStyle {
  const style = cornerDotStyle || CORNER_DOTS[dotStyle];

  return squareStyle === 'circle' && (style === 'square' || style === 'leaf')
    ? 'circle'
    : style;
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

/**
 * Returns the top-left pixel coordinates of the three finder patterns. The `leaf` of the
 * top-right and the bottom-left ones is round on the anti-diagonal, so that each leaf points at
 * the center of the code.
 */
export function getFinderPatterns(
  size: number,
  moduleSize: number,
  marginPx: number
): { x: number; y: number; antiDiagonal: boolean }[] {
  return finderCorners(size).map(([r, c], index) => ({
    x: moduleToPx(c, moduleSize, marginPx),
    y: moduleToPx(r, moduleSize, marginPx),
    antiDiagonal: index > 0,
  }));
}

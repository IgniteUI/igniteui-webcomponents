import { clampRange, type ModuleRange } from '../model/cutout.js';
import { getAlignmentPatternCenters } from '../model/matrix.js';
import type {
  QrCornerDotStyle,
  QrCornerSquareStyle,
  QrDotStyle,
} from '../types.js';

function squarePath(x: number, y: number, s: number): string {
  return `M${x},${y}h${s}v${s}h${-s}Z`;
}

export function ellipsePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  sweep = 0
): string {
  return (
    `M${cx - rx},${cy}` +
    `a${rx},${ry} 0 1,${sweep} ${rx * 2},0` +
    `a${rx},${ry} 0 1,${sweep} ${-rx * 2},0z`
  );
}

function circlePath(cx: number, cy: number, r: number, sweep = 0): string {
  return ellipsePath(cx, cy, r, r, sweep);
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

/**
 * Returns the relative path of a squircle of `width` by `height`: one cubic for each quadrant,
 * clockwise from the middle of the right side.
 */
function squircleCurves(width: number, height: number): string {
  const round = (value: number) => Number(value.toFixed(4));
  const w = round(width / 2);
  const h = round(height / 2);
  const dx = round(w * (1 - SQUIRCLE_KAPPA));
  const dy = round(h * (1 - SQUIRCLE_KAPPA));
  return (
    `c0,${round(h - dy)} ${-dx},${h} ${-w},${h}` +
    `s${-w},${-dy} ${-w},${-h}` +
    `s${dx},${-h} ${w},${-h}` +
    `s${w},${dy} ${w},${h}z`
  );
}

const squircleTail = cachedBySide((s) => squircleCurves(s, s));

/** Returns the path of a squircle that fills the square of side `s` at `x`, `y`. */
function squirclePath(x: number, y: number, s: number): string {
  return `M${x + s},${y + s / 2}${squircleTail(s)}`;
}

/** Returns the path of a squircle that fills the box at `x`, `y`. */
export function squircleRect(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  return `M${x + width},${y + height / 2}${squircleCurves(width, height)}`;
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

/** Returns the path of a rectangle with circular corners of radius `r`. */
export function arcRect(
  x: number,
  y: number,
  width: number,
  height: number,
  r: number
): string {
  return arcRectPerCorner(x, y, width, height, r, r, r, r);
}

/** Returns the path of a pill with round ends on its short sides. */
function pillPath(x: number, y: number, width: number, height: number): string {
  return arcRect(x, y, width, height, Math.min(width, height) / 2);
}

/**
 * The zone of each cell of a matrix: `OPEN_ZONE`, or `CUTOUT_ZONE` under the logo, positive for
 * a dark data module and negative for a light cell. A cell of a finder pattern, its separator or
 * an alignment pattern is 0, because the data modules do not draw it.
 */
type ZoneGrid = number[][];

const OPEN_ZONE = 1;
const CUTOUT_ZONE = 2;

/** Whether the cells at `r`, `c` and `r2`, `c2` are dark data modules of one zone. */
function joins(
  zones: ZoneGrid,
  r: number,
  c: number,
  r2: number,
  c2: number
): boolean {
  return zones[r][c] > 0 && zones[r2]?.[c2] === zones[r][c];
}

/** Whether the modules of `dotStyle` join their neighbors, so that the logo cutout changes them. */
export function joinsModules(dotStyle: QrDotStyle, dotScale: number): boolean {
  return (
    dotStyle.endsWith('-bars') ||
    (dotScale === 1 && (dotStyle === 'rounded' || dotStyle === 'liquid'))
  );
}

/**
 * Returns the SVG path of the data module at row `r` and column `c`, in a cell of side `s`
 * at `x`, `y`. The module is `scale` times the cell, centered in it. A `'rounded'` module
 * keeps a square corner toward each neighbor that it joins, when `canJoin` is set.
 */
function dotPath(
  zones: ZoneGrid,
  r: number,
  c: number,
  x: number,
  y: number,
  s: number,
  style: QrDotStyle,
  scale: number,
  canJoin: boolean
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
      const join = (r2: number, c2: number) =>
        canJoin && joins(zones, r, c, r2, c2);
      const top = join(r - 1, c);
      const right = join(r, c + 1);
      const bottom = join(r + 1, c);
      const left = join(r, c - 1);
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

/** Returns the zone grid of a matrix with the logo `cutout`. */
function zoneGrid(data: boolean[][], cutout: ModuleRange[]): ZoneGrid {
  const size = data.length;
  const zones = data.map((row) =>
    row.map((dark) => (dark ? OPEN_ZONE : -OPEN_ZONE))
  );
  const mark = (range: ModuleRange, zone: number) => {
    const { top, left, bottom, right } = clampRange(range, size);
    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        zones[r][c] = zones[r][c] > 0 ? zone : -zone;
      }
    }
  };
  const square = (top: number, left: number, side: number) => ({
    top,
    left,
    bottom: top + side - 1,
    right: left + side - 1,
  });

  for (const range of cutout) mark(range, CUTOUT_ZONE);
  for (const [row, col] of finderCorners(size)) {
    mark(square(row - 1, col - 1, 9), 0);
  }
  for (const [row, col] of alignmentCenters(size)) {
    mark(square(row - 2, col - 2, 5), 0);
  }

  return zones;
}

/**
 * Returns the concave fillets of `liquid`: one in each corner of a light cell where the two
 * neighbors and the diagonal neighbor at that corner are dark and in the zone of the cell, so
 * an L-join has no sharp inside corner.
 */
function filletPaths(
  zones: ZoneGrid,
  moduleSize: number,
  marginPx: number
): string[] {
  const size = zones.length;
  const R = moduleSize * ROUNDED_RADIUS;
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
      const zone = -zones[r][c];
      if (zone <= 0) continue;

      for (const { dr, dc, fillet } of corners) {
        if (
          zones[r + dr]?.[c] === zone &&
          joins(zones, r + dr, c, r, c + dc) &&
          joins(zones, r + dr, c, r + dr, c + dc)
        ) {
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
 * Returns one pill for each run of dark modules of one zone in a row, or in a column when
 * `vertical` is set. `scale` sets the thickness and insets the ends.
 */
function barPaths(
  zones: ZoneGrid,
  moduleSize: number,
  marginPx: number,
  scale: number,
  vertical: boolean
): string[] {
  const size = zones.length;
  const thickness = moduleSize * scale;
  const inset = (moduleSize - thickness) / 2;
  const cell = (line: number, i: number): [number, number] =>
    vertical ? [i, line] : [line, i];
  const paths: string[] = [];

  for (let line = 0; line < size; line++) {
    for (let start = 0; start < size; start++) {
      const [r, c] = cell(line, start);
      if (zones[r][c] <= 0) continue;

      let end = start;
      while (
        end + 1 < size &&
        joins(zones, ...cell(line, end), ...cell(line, end + 1))
      ) {
        end++;
      }

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
 * `dotScale` times the module size. The modules under the logo `cutout` stay in the paths, for
 * an export that drops the logo.
 */
export function renderDataModules(
  data: boolean[][],
  moduleSize: number,
  marginPx: number,
  dotStyle: QrDotStyle,
  dotScale: number,
  cutout: ModuleRange[] = []
): string[] {
  const size = data.length;
  const zones = zoneGrid(data, cutout);
  const canJoin = joinsModules(dotStyle, dotScale);

  if (dotStyle === 'horizontal-bars' || dotStyle === 'vertical-bars') {
    return barPaths(
      zones,
      moduleSize,
      marginPx,
      dotScale,
      dotStyle === 'vertical-bars'
    );
  }

  const paths: string[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (zones[r][c] <= 0) continue;

      const x = moduleToPx(c, moduleSize, marginPx);
      const y = moduleToPx(r, moduleSize, marginPx);

      paths.push(
        dotPath(zones, r, c, x, y, moduleSize, dotStyle, dotScale, canJoin)
      );
    }
  }

  if (dotStyle === 'liquid' && canJoin) {
    paths.push(...filletPaths(zones, moduleSize, marginPx));
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

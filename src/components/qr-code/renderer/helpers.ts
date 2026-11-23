import { forEachModule, type ModuleRange } from '../model/cutout.js';
import { getAlignmentPatternCenters } from '../model/matrix.js';
import type {
  QrCornerDotStyle,
  QrCornerSquareStyle,
  QrDotStyle,
} from '../types.js';

/** A box in SVG units. */
export type Box = { x: number; y: number; width: number; height: number };

/** The modules of a code in SVG units: the side of a module, and the quiet zone before the first. */
export type ModuleGrid = { moduleSize: number; marginPx: number };

/** A code of `size` modules on a view box with the side `svgSize`. */
export type CodeGrid = ModuleGrid & { size: number; svgSize: number };

/** Converts a module index to an SVG coordinate. */
export function moduleToPx(
  index: number,
  { moduleSize, marginPx }: ModuleGrid
): number {
  return index * moduleSize + marginPx;
}

//#region Shapes

function squarePath(x: number, y: number, side: number): string {
  return `M${x},${y}h${side}v${side}h${-side}Z`;
}

function ellipsePath(
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

/** Returns the path of an ellipse that fills `box`. */
export function ellipseBoxPath({ x, y, width, height }: Box): string {
  return ellipsePath(x + width / 2, y + height / 2, width / 2, height / 2);
}

/**
 * The distance of the cubic control points from the axis, as a ratio of the half side, that puts
 * the curve on the superellipse |x|⁴ + |y|⁴ = 1 at 45°: (2^-¼ - ½) / ⅜.
 */
const SQUIRCLE_KAPPA = 0.909_057;

/** The corner radius of a `rounded` module and of a `liquid` fillet, per module side. */
const ROUNDED_RADIUS = 0.45;

/** Returns `build`, memoized for the last side: the relative path that modules of one size share. */
function cachedBySide(
  build: (side: number) => string
): (side: number) => string {
  let lastSide = Number.NaN;
  let path = '';
  return (side) => {
    if (side !== lastSide) {
      lastSide = side;
      path = build(side);
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

const squircleTail = cachedBySide((side) => squircleCurves(side, side));

/** Returns the path of a squircle that fills `box`. */
export function squircleBoxPath({ x, y, width, height }: Box): string {
  const curves =
    width === height ? squircleTail(width) : squircleCurves(width, height);
  return `M${x + width},${y + height / 2}${curves}`;
}

function squirclePath(x: number, y: number, side: number): string {
  return squircleBoxPath({ x, y, width: side, height: side });
}

/** Draws a corner of radius `r` to `dx`, `dy`; `horizontal` when the edge before it is. */
type CornerCommand = (
  r: number,
  dx: number,
  dy: number,
  horizontal: boolean
) => string;

const quadCorner: CornerCommand = (_r, dx, dy, horizontal) =>
  horizontal ? `q${dx},0 ${dx},${dy}` : `q0,${dy} ${dx},${dy}`;

const arcCorner: CornerCommand = (r, dx, dy) =>
  r ? `a${r},${r} 0 0 1 ${dx},${dy}` : '';

/** Returns the path of a rectangle with a radius for each corner, drawn with `corner`. */
function rectPerCorner(
  x: number,
  y: number,
  width: number,
  height: number,
  rTL: number,
  rTR: number,
  rBR: number,
  rBL: number,
  corner: CornerCommand
): string {
  return (
    `M${x + rTL},${y}` +
    `h${width - rTL - rTR}${corner(rTR, rTR, rTR, true)}` +
    `v${height - rTR - rBR}${corner(rBR, -rBR, rBR, false)}` +
    `h${-(width - rBR - rBL)}${corner(rBL, -rBL, -rBL, true)}` +
    `v${-(height - rBL - rTL)}${corner(rTL, rTL, -rTL, false)}z`
  );
}

function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string {
  const r = Math.min(radius, width / 2, height / 2);
  return rectPerCorner(x, y, width, height, r, r, r, r, quadCorner);
}

/** Returns the path of `box` with circular corners of `radius`. */
export function arcBoxPath(
  { x, y, width, height }: Box,
  radius: number
): string {
  return rectPerCorner(
    x,
    y,
    width,
    height,
    radius,
    radius,
    radius,
    radius,
    arcCorner
  );
}

const diamondTail = cachedBySide((side) => {
  const half = side / 2;
  return `l${half},${half}l${-half},${half}l${-half},${-half}z`;
});

function diamondPath(x: number, y: number, side: number): string {
  return `M${x + side / 2},${y}${diamondTail(side)}`;
}

const plusTail = cachedBySide((side) => {
  const arm = side / 4;
  return `h${2 * arm}v${arm}h${arm}v${2 * arm}h${-arm}v${arm}h${-2 * arm}v${-arm}h${-arm}v${-2 * arm}h${arm}z`;
});

/** Returns the path of a cross with arms half as wide as the square of `side` at `x`, `y`. */
function plusPath(x: number, y: number, side: number): string {
  return `M${x + side / 4},${y}${plusTail(side)}`;
}

/**
 * Returns a square whose top-left and bottom-right corners, or the other two on the
 * `antiDiagonal`, are round at a quarter of the side. A larger radius fails to decode.
 */
function leafPath(
  x: number,
  y: number,
  side: number,
  antiDiagonal: boolean
): string {
  const radius = side / 4;
  const [topLeft, topRight] = antiDiagonal ? [0, radius] : [radius, 0];
  return rectPerCorner(
    x,
    y,
    side,
    side,
    topLeft,
    topRight,
    topLeft,
    topRight,
    arcCorner
  );
}

/** Returns the path of a pill: two half circles on the short sides. */
function pillPath(x: number, y: number, width: number, height: number): string {
  const radius = Math.min(width, height) / 2;
  const arc = (dx: number, dy: number) =>
    `a${radius},${radius} 0 0 1 ${dx},${dy}`;
  return width >= height
    ? `M${x + radius},${y}h${width - 2 * radius}${arc(0, 2 * radius)}h${2 * radius - width}${arc(0, -2 * radius)}z`
    : `M${x},${y + radius}${arc(2 * radius, 0)}v${height - 2 * radius}${arc(-2 * radius, 0)}z`;
}

//#endregion

//#region Finder and alignment patterns

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

/** Returns the SVG path of the center dot of a finder or an alignment pattern. */
function cornerDotPath(
  x: number,
  y: number,
  side: number,
  style: QrCornerDotStyle,
  antiDiagonal: boolean
): string {
  switch (style) {
    case 'circle':
      return circlePath(x + side / 2, y + side / 2, side / 2);
    case 'rounded':
      return roundedRect(x, y, side, side, side * 0.3);
    case 'squircle':
      return squirclePath(x, y, side);
    case 'leaf':
      return leafPath(x, y, side, antiDiagonal);
    default:
      return squarePath(x, y, side);
  }
}

/** Returns the SVG path of a ring of `side` and of width `ring`. */
function cornerSquarePath(
  x: number,
  y: number,
  side: number,
  ring: number,
  style: QrCornerSquareStyle,
  antiDiagonal: boolean
): string {
  const inner = side - 2 * ring;
  const hole = (shape: (x: number, y: number, side: number) => string) =>
    shape(x + ring, y + ring, inner);

  switch (style) {
    case 'leaf': {
      const leaf = (left: number, top: number, leafSide: number) =>
        leafPath(left, top, leafSide, antiDiagonal);
      return `${leaf(x, y, side)} ${hole(leaf)}`;
    }
    case 'square':
      return `${squarePath(x, y, side)} ${hole(squarePath)}`;
    case 'rounded':
      return `${roundedRect(x, y, side, side, side * 0.15)} ${hole(squarePath)}`;
    case 'squircle':
      return `${squirclePath(x, y, side)} ${hole(squirclePath)}`;
    default: {
      const cx = x + side / 2;
      const cy = y + side / 2;
      return circlePath(cx, cy, side / 2) + circlePath(cx, cy, inner / 2, 1);
    }
  }
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
  const side = modules * moduleSize;
  const inset = 2 * moduleSize;
  return [
    cornerSquarePath(x, y, side, moduleSize, squareStyle, antiDiagonal),
    cornerDotPath(
      x + inset,
      y + inset,
      side - 2 * inset,
      dotStyle,
      antiDiagonal
    ),
  ];
}

/**
 * Returns the top-left SVG coordinates of the three finder patterns. The `leaf` of the top-right
 * and the bottom-left ones is round on the anti-diagonal, so that each leaf points at the center
 * of the code.
 */
export function getFinderPatterns(
  grid: CodeGrid
): { x: number; y: number; antiDiagonal: boolean }[] {
  return finderCorners(grid.size).map(([r, c], index) => ({
    x: moduleToPx(c, grid),
    y: moduleToPx(r, grid),
    antiDiagonal: index > 0,
  }));
}

/**
 * Returns the SVG path of the alignment patterns: a ring of `squareStyle` and a center dot of
 * `dotStyle` for each. Fill it with the `evenodd` rule.
 */
export function alignmentPath(
  grid: CodeGrid,
  squareStyle: QrCornerSquareStyle,
  dotStyle: QrCornerDotStyle
): string {
  return alignmentCenters(grid.size)
    .flatMap(([r, c]) =>
      patternPaths(
        moduleToPx(c - 2, grid),
        moduleToPx(r - 2, grid),
        5,
        grid.moduleSize,
        squareStyle,
        dotStyle
      )
    )
    .join(' ');
}

//#endregion

//#region Data modules

const OPEN_ZONE = 1;
const CUTOUT_ZONE = 2;

/**
 * The cells of a matrix: whether each one is dark, and its zone, `CUTOUT_ZONE` under the logo or
 * else `OPEN_ZONE`. A cell of a finder pattern, its separator or an alignment pattern has zone 0,
 * because the data modules do not draw it.
 */
type ModuleCells = { dark: boolean[][]; zones: number[][] };

function getModuleCells(data: boolean[][], cutout: ModuleRange[]): ModuleCells {
  const size = data.length;
  const zones = data.map((row) => row.map(() => OPEN_ZONE));
  const mark = (range: ModuleRange, zone: number) =>
    forEachModule(range, size, (r, c) => {
      zones[r][c] = zone;
    });
  const square = (top: number, left: number, side: number): ModuleRange => ({
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

  return { dark: data, zones };
}

/** Whether the cell at `r`, `c` is a dark data module of `zone`. */
function isModuleOf(
  { dark, zones }: ModuleCells,
  r: number,
  c: number,
  zone: number
): boolean {
  return zone > 0 && dark[r]?.[c] === true && zones[r][c] === zone;
}

/** Whether the cells at `r`, `c` and `r2`, `c2` are dark data modules of one zone. */
function joins(
  cells: ModuleCells,
  r: number,
  c: number,
  r2: number,
  c2: number
): boolean {
  const zone = cells.zones[r][c];
  return isModuleOf(cells, r, c, zone) && isModuleOf(cells, r2, c2, zone);
}

/** Draws a module in the square of `side` at `x`, `y`, for the module at row `r` and column `c`. */
type ModuleShape = (
  x: number,
  y: number,
  side: number,
  r: number,
  c: number
) => string;

/** Returns `shape` for each dark data module, `scale` times its cell and centered in it. */
function modulePaths(
  cells: ModuleCells,
  grid: ModuleGrid,
  scale: number,
  shape: ModuleShape
): string[] {
  const side = grid.moduleSize * scale;
  const inset = (grid.moduleSize - side) / 2;
  const paths: string[] = [];

  for (const [r, row] of cells.dark.entries()) {
    for (const [c, dark] of row.entries()) {
      if (dark && cells.zones[r][c] > 0) {
        const x = moduleToPx(c, grid) + inset;
        const y = moduleToPx(r, grid) + inset;
        paths.push(shape(x, y, side, r, c));
      }
    }
  }

  return paths;
}

/** Returns `rounded` modules, with a square corner toward each neighbor that they join. */
function roundedPaths(
  cells: ModuleCells,
  grid: ModuleGrid,
  scale: number,
  joined: boolean
): string[] {
  return modulePaths(cells, grid, scale, (x, y, side, r, c) => {
    const radius = side * ROUNDED_RADIUS;
    const top = joined && joins(cells, r, c, r - 1, c);
    const right = joined && joins(cells, r, c, r, c + 1);
    const bottom = joined && joins(cells, r, c, r + 1, c);
    const left = joined && joins(cells, r, c, r, c - 1);
    return rectPerCorner(
      x,
      y,
      side,
      side,
      top || left ? 0 : radius,
      top || right ? 0 : radius,
      bottom || right ? 0 : radius,
      bottom || left ? 0 : radius,
      quadCorner
    );
  });
}

/**
 * Returns the concave `liquid` fillets: one in each corner of a light cell whose two side
 * neighbors and diagonal neighbor at that corner are dark and in its zone.
 */
function filletPaths(cells: ModuleCells, grid: ModuleGrid): string[] {
  const radius = grid.moduleSize * ROUNDED_RADIUS;
  // The directions of the neighbors at each corner, and the fillet from the corner point.
  const corners = [
    [-1, -1],
    [-1, 1],
    [1, 1],
    [1, -1],
  ].map(([dr, dc]) => ({
    dr,
    dc,
    fillet: `h${-dc * radius}a${radius},${radius} 0 0 ${dr === dc ? 0 : 1} ${dc * radius},${-dr * radius}z`,
  }));
  const paths: string[] = [];

  for (const [r, row] of cells.dark.entries()) {
    for (const [c, dark] of row.entries()) {
      const zone = cells.zones[r][c];
      if (dark || zone === 0) continue;

      for (const { dr, dc, fillet } of corners) {
        if (
          isModuleOf(cells, r + dr, c, zone) &&
          isModuleOf(cells, r, c + dc, zone) &&
          isModuleOf(cells, r + dr, c + dc, zone)
        ) {
          const x = moduleToPx(c + (dc > 0 ? 1 : 0), grid);
          const y = moduleToPx(r + (dr > 0 ? 1 : 0), grid);
          paths.push(`M${x},${y}${fillet}`);
        }
      }
    }
  }

  return paths;
}

/**
 * Returns one pill for each run of joined modules in a row, or in a column when `vertical` is
 * set. `scale` sets the thickness and insets the ends.
 */
function barPaths(
  cells: ModuleCells,
  grid: ModuleGrid,
  scale: number,
  vertical: boolean
): string[] {
  const size = cells.dark.length;
  const thickness = grid.moduleSize * scale;
  const inset = (grid.moduleSize - thickness) / 2;
  const row = (line: number, i: number) => (vertical ? i : line);
  const col = (line: number, i: number) => (vertical ? line : i);
  const joinsNext = (line: number, i: number) =>
    joins(
      cells,
      row(line, i),
      col(line, i),
      row(line, i + 1),
      col(line, i + 1)
    );
  const paths: string[] = [];

  for (let line = 0; line < size; line++) {
    for (let start = 0; start < size; start++) {
      const r = row(line, start);
      const c = col(line, start);
      if (!isModuleOf(cells, r, c, cells.zones[r][c])) continue;

      let end = start;
      while (end + 1 < size && joinsNext(line, end)) end++;

      const across = moduleToPx(line, grid) + inset;
      const along = moduleToPx(start, grid) + inset;
      const length = (end - start + 1) * grid.moduleSize - 2 * inset;

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

type DotStyleGeometry = {
  /** The style of the corner dots when `cornerDotStyle` is not set. */
  cornerDot: QrCornerDotStyle;
  /** Whether the modules join their neighbors at `scale`. */
  joins: (scale: number) => boolean;
  /** Returns the paths of the dark data modules; `joined` is the result of `joins`. */
  paths: (
    cells: ModuleCells,
    grid: ModuleGrid,
    scale: number,
    joined: boolean
  ) => string[];
};

const shaped =
  (shape: ModuleShape): DotStyleGeometry['paths'] =>
  (cells, grid, scale) =>
    modulePaths(cells, grid, scale, shape);

const never = () => false;
const atFullSize = (scale: number) => scale === 1;

/**
 * The geometry of each dot style. A `diamond` or `plus` finder center fails to decode, so their
 * corner dot is a square. A joining style has no single-shape form, so its corner dot is rounded.
 */
const DOT_STYLES: Record<QrDotStyle, DotStyleGeometry> = {
  square: { cornerDot: 'square', joins: never, paths: shaped(squarePath) },
  circle: {
    cornerDot: 'circle',
    joins: never,
    paths: shaped((x, y, side) =>
      circlePath(x + side / 2, y + side / 2, side / 2)
    ),
  },
  squircle: {
    cornerDot: 'squircle',
    joins: never,
    paths: shaped(squirclePath),
  },
  diamond: { cornerDot: 'square', joins: never, paths: shaped(diamondPath) },
  plus: { cornerDot: 'square', joins: never, paths: shaped(plusPath) },
  rounded: { cornerDot: 'rounded', joins: atFullSize, paths: roundedPaths },
  liquid: {
    cornerDot: 'rounded',
    joins: atFullSize,
    paths: (cells, grid, scale, joined) => [
      ...roundedPaths(cells, grid, scale, joined),
      ...(joined ? filletPaths(cells, grid) : []),
    ],
  },
  'horizontal-bars': {
    cornerDot: 'rounded',
    joins: () => true,
    paths: (cells, grid, scale) => barPaths(cells, grid, scale, false),
  },
  'vertical-bars': {
    cornerDot: 'rounded',
    joins: () => true,
    paths: (cells, grid, scale) => barPaths(cells, grid, scale, true),
  },
};

function dotStyleOf(dotStyle: QrDotStyle): DotStyleGeometry {
  return DOT_STYLES[dotStyle] ?? DOT_STYLES.square;
}

/** Whether the modules of `dotStyle` join their neighbors, so that the logo cutout changes them. */
export function joinsModules(dotStyle: QrDotStyle, dotScale: number): boolean {
  return dotStyleOf(dotStyle).joins(dotScale);
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
  const style = dotStyleOf(dotStyle);
  return style.paths(
    getModuleCells(data, cutout),
    { moduleSize, marginPx },
    dotScale,
    style.joins(dotScale)
  );
}

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
  const style = cornerDotStyle || dotStyleOf(dotStyle).cornerDot;

  return squareStyle === 'circle' && (style === 'square' || style === 'leaf')
    ? 'circle'
    : style;
}

//#endregion

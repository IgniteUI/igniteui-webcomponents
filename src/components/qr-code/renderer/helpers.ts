import type {
  QrCornerDotStyle,
  QrCornerSquareStyle,
  QrDotStyle,
} from '../types.js';

type DotNeighbor = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

function squarePath(x: number, y: number, s: number): string {
  return `M${x},${y}h${s}v${s}h${-s}Z`;
}

function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string {
  const cr = Math.min(radius, width / 2, height / 2);
  return (
    `M${x + cr},${y}` +
    `h${width - 2 * cr}` +
    `q${cr},0 ${cr},${cr}` +
    `v${height - 2 * cr}` +
    `q0,${cr} ${-cr},${cr}` +
    `h${-(width - 2 * cr)}` +
    `q${-cr},0 ${-cr},${-cr}` +
    `v${-(height - 2 * cr)}` +
    `q0,${-cr} ${cr},${-cr}z`
  );
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

/** Returns an SVG path string for a single data module at `(x, y)` with side `s`, in the given style.
 * For `'rounded'`, adjacent module flags control which corners are rounded. */
function dotPath(
  x: number,
  y: number,
  s: number,
  style: QrDotStyle,
  neighbors?: DotNeighbor
): string {
  switch (style) {
    case 'square':
      return squarePath(x, y, s);
    case 'circle': {
      const cx = x + s / 2;
      const cy = y + s / 2;
      const r = s / 2;
      return (
        `M${cx - r},${cy}` +
        `a${r},${r} 0 1,0 ${r * 2},0` +
        `a${r},${r} 0 1,0 ${-r * 2},0z`
      );
    }
    case 'rounded': {
      const R = s * 0.45;
      const n = neighbors || {
        top: false,
        right: false,
        bottom: false,
        left: false,
      };
      const rTL = n.top || n.left ? 0 : R;
      const rTR = n.top || n.right ? 0 : R;
      const rBR = n.bottom || n.right ? 0 : R;
      const rBL = n.bottom || n.left ? 0 : R;
      return roundedRectPerCorner(x, y, s, s, rTL, rTR, rBR, rBL);
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
    case 'circle': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size / 2;
      return (
        `M${cx - r},${cy}` +
        `a${r},${r} 0 1,0 ${r * 2},0` +
        `a${r},${r} 0 1,0 ${-r * 2},0z`
      );
    }
    case 'rounded': {
      return roundedRect(x, y, size, size, size * 0.3);
    }
    default:
      return squarePath(x, y, size);
  }
}

/** Returns an SVG path string (outer ring with inner cutout) for the outer square of a finder-pattern corner. */
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
    default: {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const rOuter = size / 2;
      const rInner = inner / 2;
      return (
        `M${cx - rOuter},${cy}` +
        `a${rOuter},${rOuter} 0 1,0 ${rOuter * 2},0` +
        `a${rOuter},${rOuter} 0 1,0 ${-rOuter * 2},0z` +
        `M${cx - rInner},${cy}` +
        `a${rInner},${rInner} 0 1,1 ${rInner * 2},0` +
        `a${rInner},${rInner} 0 1,1 ${-rInner * 2},0z`
      );
    }
  }
}

/** Converts a module grid index to a pixel coordinate, accounting for margin. */
function moduleToPx(
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
 * Returns the set of flat module indices `(row * size + col)` occupied by the
 * three finder patterns (including their separators), used to skip those modules
 * during data rendering.
 */
function getFinderPatternModules(size: number): Set<number> {
  const modules = new Set<number>();

  for (const [startRow, startCol] of finderCorners(size)) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = startRow + r;
        const col = startCol + c;
        if (row >= 0 && col >= 0 && row < size && col < size) {
          modules.add(row * size + col);
        }
      }
    }
  }

  return modules;
}

/**
 * Generates SVG path strings for all dark data modules in the matrix,
 * skipping finder-pattern areas. Returns one path string per visible module.
 */
export function renderDataModules(
  data: boolean[][],
  moduleSize: number,
  marginPx: number,
  dotStyle: QrDotStyle
): string[] {
  const size = data.length;
  const finderModules = getFinderPatternModules(size);
  const paths: string[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (finderModules.has(r * size + c)) continue;
      if (!data[r][c]) continue;

      const x = moduleToPx(c, moduleSize, marginPx);
      const y = moduleToPx(r, moduleSize, marginPx);

      let neighbors: DotNeighbor | undefined;
      if (dotStyle === 'rounded') {
        neighbors = {
          top: r > 0 && data[r - 1][c],
          right: c < size - 1 && data[r][c + 1],
          bottom: r < size - 1 && data[r + 1][c],
          left: c > 0 && data[r][c - 1],
        };
      }

      paths.push(dotPath(x, y, moduleSize, dotStyle, neighbors));
    }
  }

  return paths;
}

/**
 * Returns the pixel top-left coordinates `{ x, y }` for each of the three
 * finder-pattern corners, ready to pass to `renderQrCorner`.
 */
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

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

function circlePath(cx: number, cy: number, r: number, sweep = 0): string {
  return (
    `M${cx - r},${cy}` +
    `a${r},${r} 0 1,${sweep} ${r * 2},0` +
    `a${r},${r} 0 1,${sweep} ${-r * 2},0z`
  );
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
 * Returns the SVG path of one data module. For `'rounded'`, the neighbors select the
 * rounded corners.
 */
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
    case 'circle':
      return circlePath(x + s / 2, y + s / 2, s / 2);
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
    case 'circle':
      return circlePath(x + size / 2, y + size / 2, size / 2);
    case 'rounded': {
      return roundedRect(x, y, size, size, size * 0.3);
    }
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
    default: {
      const cx = x + size / 2;
      const cy = y + size / 2;
      return circlePath(cx, cy, size / 2) + circlePath(cx, cy, inner / 2, 1);
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

/** Returns one SVG path for each dark data module outside the finder patterns. */
export function renderDataModules(
  data: boolean[][],
  moduleSize: number,
  marginPx: number,
  dotStyle: QrDotStyle
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

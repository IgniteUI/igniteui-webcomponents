import { clamp } from '#internals/utils/math.js';
import { canHideModules, type ModuleRange } from '../model/cutout.js';
import { EC_LEVEL_INDEX } from '../model/encode.js';
import type { QrErrorCorrectionLevel, QrLogoShape } from '../types.js';
import {
  arcBoxPath,
  type Box,
  ellipseBoxPath,
  squircleBoxPath,
} from './helpers.js';

/**
 * A logo box centered on the code, in modules from the top-left corner of the matrix, its shape,
 * and the cutout: the modules that the shape covers, in part or in full.
 */
export type LogoLayout = Box & {
  shape: QrLogoShape;
  cutout: ModuleRange[];
};

/** The logo settings of a code: `area` is a share of the code without its quiet zone. */
export type LogoSettings = {
  errorLevel: QrErrorCorrectionLevel;
  area: number;
  aspectRatio: number;
  shape: QrLogoShape;
};

function cornerRadius(width: number, height: number): number {
  return Math.min(width, height) / 4;
}

/** Returns `box` less `inset` on each side. */
export function insetBox({ x, y, width, height }: Box, inset: number): Box {
  return {
    x: x + inset,
    y: y + inset,
    width: width - 2 * inset,
    height: height - 2 * inset,
  };
}

type LogoShapeGeometry = {
  /**
   * Whether a point at `dx`, `dy` from the center of a box with the half sides `halfWidth`,
   * `halfHeight` is in the shape.
   */
  covers: (
    dx: number,
    dy: number,
    halfWidth: number,
    halfHeight: number
  ) => boolean;
  /** Returns the clip path of the shape in `inner`: its `box` less `inset` on each side. */
  clip?: (inner: Box, inset: number, box: Box) => string;
};

/** Each cell of the box range overlaps a `square`. */
const LOGO_SHAPES: Record<QrLogoShape, LogoShapeGeometry> = {
  square: { covers: () => true },
  circle: {
    covers: (dx, dy, halfWidth, halfHeight) =>
      (dx / halfWidth) ** 2 + (dy / halfHeight) ** 2 < 1,
    clip: ellipseBoxPath,
  },
  squircle: {
    covers: (dx, dy, halfWidth, halfHeight) =>
      (dx / halfWidth) ** 4 + (dy / halfHeight) ** 4 < 1,
    clip: squircleBoxPath,
  },
  rounded: {
    covers: (dx, dy, halfWidth, halfHeight) => {
      const r = cornerRadius(2 * halfWidth, 2 * halfHeight);
      const cx = Math.max(dx - halfWidth + r, 0);
      const cy = Math.max(dy - halfHeight + r, 0);
      return dx < halfWidth && dy < halfHeight && cx * cx + cy * cy < r * r;
    },
    // The curve keeps its center, so the clip is the exact inset of the shape.
    clip: (inner, inset, box) =>
      arcBoxPath(
        inner,
        Math.max(cornerRadius(box.width, box.height) - inset, 0)
      ),
  },
};

function geometryOf(shape: QrLogoShape): LogoShapeGeometry {
  return LOGO_SHAPES[shape] ?? LOGO_SHAPES.square;
}

/**
 * Returns the ranges of the modules whose cells overlap `shape` in `box`, one for each run of
 * rows with the same columns. The point of a cell nearest to the center decides.
 */
function getCutout(
  shape: QrLogoShape,
  { x, y, width, height }: Box
): ModuleRange[] {
  const { covers } = geometryOf(shape);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const distance = (center: number, cell: number) =>
    Math.abs(clamp(center, cell, cell + 1) - center);
  const ranges: ModuleRange[] = [];

  for (let row = Math.floor(y); row < y + height; row++) {
    const dy = distance(y + halfHeight, row);
    const overlaps = (col: number) =>
      covers(distance(x + halfWidth, col), dy, halfWidth, halfHeight);
    let left = Math.floor(x);
    let right = Math.ceil(x + width) - 1;

    while (left <= right && !overlaps(left)) left++;
    while (right > left && !overlaps(right)) right--;
    if (left > right) continue;

    const last = ranges.at(-1);
    if (
      last?.bottom === row - 1 &&
      last.left === left &&
      last.right === right
    ) {
      last.bottom = row;
    } else {
      ranges.push({ top: row, left, bottom: row, right });
    }
  }

  return ranges;
}

/**
 * Returns the clip path of a logo `shape` in `box`, less `inset` on each side, or `undefined`
 * for a `square`, which needs no clip.
 */
export function logoClipPath(
  shape: QrLogoShape,
  box: Box,
  inset: number
): string | undefined {
  return geometryOf(shape).clip?.(insetBox(box, inset), inset, box);
}

function getLogoLayout(
  version: number,
  { aspectRatio, shape }: LogoSettings,
  area: number
): LogoLayout {
  const size = version * 4 + 17;
  const scaled = area * size * size;
  const width = Math.sqrt(scaled * aspectRatio);
  const height = Math.sqrt(scaled / aspectRatio);
  const box = { x: (size - width) / 2, y: (size - height) / 2, width, height };

  return { ...box, shape, cutout: getCutout(shape, box) };
}

function fits(version: number, settings: LogoSettings, area: number): boolean {
  return canHideModules(
    version,
    EC_LEVEL_INDEX[settings.errorLevel],
    ...getLogoLayout(version, settings, area).cutout
  );
}

/** Returns the largest logo area, up to the one of `settings`, that fits a code of `version`. */
function fitArea(version: number, settings: LogoSettings): number {
  if (fits(version, settings, settings.area)) {
    return settings.area;
  }

  // The cutout grows with the area, so a bisection finds the largest area that fits.
  let low = 0;
  let high = settings.area;

  for (let step = 0; step < 20; step++) {
    const middle = (low + high) / 2;
    if (fits(version, settings, middle)) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return low;
}

/**
 * Returns the version of a code with a logo, and the layout of the logo. A `pinned` code keeps
 * the `smallest` version; otherwise the version is the smallest from `smallest` up that a scanner
 * reads with the logo cutout. When the version cannot hold the logo, the logo gets smaller.
 */
export function fitLogo(
  smallest: number,
  pinned: boolean,
  settings: LogoSettings
): { version: number; layout: LogoLayout } {
  let version = smallest;

  if (!pinned) {
    for (let candidate = smallest; candidate <= 40; candidate++) {
      if (fits(candidate, settings, settings.area)) {
        version = candidate;
        break;
      }
    }
  }

  const area = fitArea(version, settings);
  return { version, layout: getLogoLayout(version, settings, area) };
}

import { canHideModules, type ModuleRange } from '../model/cutout.js';
import { EC_LEVEL_INDEX } from '../model/encode.js';
import type { QrErrorCorrectionLevel } from '../types.js';

/**
 * A logo box centered on the code, and the cutout under it: each module that the box covers, in
 * part or in full. The values are in modules from the top-left corner of the matrix.
 */
export type LogoLayout = ModuleRange & {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** The logo settings of a code: `area` is a share of the code without its quiet zone. */
export type LogoSettings = {
  errorLevel: QrErrorCorrectionLevel;
  area: number;
  aspectRatio: number;
};

function getLogoLayout(
  version: number,
  { aspectRatio }: LogoSettings,
  area: number
): LogoLayout {
  const size = version * 4 + 17;
  const scaled = area * size * size;
  const width = Math.sqrt(scaled * aspectRatio);
  const height = Math.sqrt(scaled / aspectRatio);
  const x = (size - width) / 2;
  const y = (size - height) / 2;

  return {
    x,
    y,
    width,
    height,
    top: Math.floor(y),
    left: Math.floor(x),
    bottom: Math.ceil(y + height) - 1,
    right: Math.ceil(x + width) - 1,
  };
}

function fits(version: number, settings: LogoSettings, area: number): boolean {
  return canHideModules(
    version,
    EC_LEVEL_INDEX[settings.errorLevel],
    getLogoLayout(version, settings, area)
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

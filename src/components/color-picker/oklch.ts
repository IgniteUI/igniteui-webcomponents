import { clamp, roundPrecise } from '#internals/utils/math.js';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import {
  converter,
  delinearize,
  hueDirection,
  LMS_TO_LINEAR_SRGB,
  OKLAB_TO_LMS,
  type OKLCH,
  oklabToLinearSrgb,
  rgbString,
} from './converters.js';

/** The axes of the area: HSV saturation by value, or OKLCH lightness by chroma. */
export type AreaSpace = 'hsv' | 'oklch';

/**
 * The end of the chroma axis of the OKLCH area, for every hue: just past the
 * largest sRGB chroma, 0.3225 at hue 328.
 */
export const OKLCH_AREA_CHROMA = 0.33;

/** A linear channel this far outside 0-1 is still in the sRGB gamut. */
const GAMUT_TOLERANCE = 1e-7;

/** The upper bound of the chroma search: no sRGB color has more. */
const CHROMA_LIMIT = 0.4;

/** Whether a chroma is too small for a hue: the chroma of a gray. */
export function isAchromatic(chroma: number): boolean {
  return roundPrecise(chroma, 5) === 0;
}

/** A chroma range of one row of the OKLCH area that is in the sRGB gamut. */
type GamutRun = readonly [start: number, end: number];

/** A cubic of the chroma `c`: `constant + linear c + quadratic c² + cubic c³`. */
type Cubic = readonly [
  constant: number,
  linear: number,
  quadratic: number,
  cubic: number,
];

// Index access, not destructuring: this runs in the inner loop of a paint.
function evaluate(cubic: Cubic, c: number): number {
  return ((cubic[3] * c + cubic[2]) * c + cubic[1]) * c + cubic[0];
}

/**
 * The linear sRGB channels along one row of the OKLCH area, as cubics of the
 * chroma: each cube root of LMS is linear in the chroma.
 */
function channelCubics(lightness: number, hue: number): Cubic[] {
  const [cos, sin] = hueDirection(hue);
  const l = lightness / 100;
  const slopes = OKLAB_TO_LMS.map(([, a, b]) => a * cos + b * sin);

  return LMS_TO_LINEAR_SRGB.map((row) => {
    const cubic: [number, number, number, number] = [0, 0, 0, 0];

    row.forEach((weight, j) => {
      const s = slopes[j];
      // (l + s c)³ expanded.
      cubic[0] += weight * l * l * l;
      cubic[1] += weight * 3 * l * l * s;
      cubic[2] += weight * 3 * l * s * s;
      cubic[3] += weight * s * s * s;
    });

    return cubic;
  });
}

/** The chromas where the slope of a cubic is 0, in order. */
function turningPoints([, linear, quadratic, cubic]: Cubic): number[] {
  // The slope is `linear + slopeLinear c + slopeSquare c²`.
  const slopeSquare = 3 * cubic;
  const slopeLinear = 2 * quadratic;

  if (Math.abs(slopeSquare) < 1e-12) {
    return Math.abs(slopeLinear) < 1e-12 ? [] : [-linear / slopeLinear];
  }

  const discriminant = slopeLinear * slopeLinear - 4 * slopeSquare * linear;

  if (discriminant < 0) {
    return [];
  }

  const vertex = -slopeLinear / (2 * slopeSquare);
  const spread = Math.sqrt(discriminant) / Math.abs(2 * slopeSquare);
  return [vertex - spread, vertex + spread];
}

/** Adds the chromas in `[0, CHROMA_LIMIT)` where a cubic equals `target`. */
function addRoots(cubic: Cubic, target: number, roots: number[]): void {
  const edges = turningPoints(cubic);
  let low = 0;
  let lowOffset = evaluate(cubic, low) - target;

  edges.push(CHROMA_LIMIT);

  // Between two turning points a cubic has at most one root.
  for (const edge of edges) {
    if (edge <= low) continue;

    const high = Math.min(edge, CHROMA_LIMIT);
    const highOffset = evaluate(cubic, high) - target;

    if (lowOffset === 0) {
      roots.push(low);
    } else if (lowOffset * highOffset < 0) {
      // Bisection. Inline, as it runs for every row of a paint.
      let from = low;
      let to = high;

      while (to - from > 1e-10) {
        const middle = (from + to) / 2;

        if ((evaluate(cubic, middle) - target) * lowOffset > 0) {
          from = middle;
        } else {
          to = middle;
        }
      }

      roots.push((from + to) / 2);
    }

    if (high === CHROMA_LIMIT) return;

    low = high;
    lowOffset = highOffset;
  }
}

/**
 * The chroma ranges of a row of the OKLCH area, at a lightness (0-100) and a
 * hue, that are in the sRGB gamut. A row can have more than one range: at the
 * hue of blue, the black-to-blue edge of sRGB is a thin spike apart from the
 * rest, and a range can be a single chroma.
 */
export function gamutRuns(lightness: number, hue: number): GamutRun[] {
  const cubics = channelCubics(lightness, hue);
  const inside = (c: number) => {
    for (const cubic of cubics) {
      const channel = evaluate(cubic, c);

      if (channel < -GAMUT_TOLERANCE || channel > 1 + GAMUT_TOLERANCE) {
        return false;
      }
    }
    return true;
  };
  const breaks = [0, CHROMA_LIMIT];

  for (const cubic of cubics) {
    addRoots(cubic, 0, breaks);
    addRoots(cubic, 1, breaks);
  }

  breaks.sort((x, y) => x - y);

  const runs: [number, number][] = [];
  const add = (start: number, end: number) => {
    const last = runs.at(-1);

    if (last && start - last[1] < 1e-9) {
      last[1] = Math.max(last[1], end);
    } else {
      runs.push([start, end]);
    }
  };

  for (let i = 0; i < breaks.length; i++) {
    const start = breaks[i];
    const end = breaks[i + 1];

    if (start === end) continue;

    if (end !== undefined && inside((start + end) / 2)) {
      add(start, end);
    } else if (inside(start)) {
      // Two channels meet the gamut edge at one chroma.
      add(start, start);
    }
  }

  return runs;
}

/**
 * The most chroma, up to the chroma of `color`, that sRGB has at its lightness
 * and hue: its own chroma when it is in the gamut, else the end of the nearest
 * range below it.
 */
export function gamutChroma([lightness, chroma, hue]: OKLCH): number {
  // A chroma a rounding step before a single-chroma range is on it.
  const run = gamutRuns(lightness, hue).findLast(
    ([start]) => chroma >= start - 1e-9
  );

  return run ? Math.min(chroma, run[1]) : 0;
}

/** The OKLCH values of the pure color of an HSV hue. */
export function pureHueOklch(hsvHue: number): OKLCH {
  return converter.rgb.oklch(converter.hsv.rgb([hsvHue, 100, 100]));
}

const RED_HUE = pureHueOklch(0)[2];

/**
 * The HSV hue whose pure color has an OKLCH hue: the HSV hue of the cusp.
 * The OKLCH hue rises with the HSV hue from red.
 */
export function cuspHsvHue(oklchHue: number, tolerance = 1e-6): number {
  const unwrap = (h: number) => (h < RED_HUE ? h + 360 : h);
  const target = unwrap(oklchHue);
  let low = 0;
  let high = 360;

  while (high - low > tolerance) {
    const middle = (low + high) / 2;

    if (unwrap(pureHueOklch(middle)[2]) < target) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return (low + high) / 2;
}

/** The cusps by OKLCH hue in half degrees. */
const cusps = new Map<number, OKLCH>();

/** The OKLCH values of the cusp of an OKLCH hue: its most chromatic sRGB color. */
export function cusp(oklchHue: number): OKLCH {
  return getOrInsertComputed(cusps, Math.round(oklchHue * 2), (key) =>
    pureHueOklch(cuspHsvHue(key / 2, 0.01))
  );
}

/** The cusp of an OKLCH hue as a CSS `rgb()` color. */
export function cuspColor(oklchHue: number): string {
  return rgbString(converter.oklch.rgb(cusp(oklchHue)));
}

/** The steps of the gamma table of the area paint. */
const GAMMA_STEPS = 4096;

let gammaTable: Uint8ClampedArray | undefined;

/**
 * 8-bit sRGB values of linear light in `GAMMA_STEPS` steps. A step is less
 * than one 8-bit value, also near black, and a paint needs no `pow` call.
 */
function getGammaTable(): Uint8ClampedArray {
  gammaTable ??= Uint8ClampedArray.from({ length: GAMMA_STEPS + 1 }, (_, i) =>
    delinearize(i / GAMMA_STEPS)
  );
  return gammaTable;
}

/** A gamut range of a line of the area, in pixels from the left edge. */
type PixelRun = [start: number, end: number];

/** The integral of `clamp(v, 0, 1)` from 0 to `v`. */
function rampIntegral(v: number): number {
  if (v <= 0) return 0;
  return v >= 1 ? v - 0.5 : (v * v) / 2;
}

/**
 * The share of pixel column `x` that lies left of an edge, on average while
 * the edge moves from `from` to `to` across a row: a box filter of the edge.
 */
function shareLeftOf(from: number, to: number, x: number): number {
  const a = from - x;
  const b = to - x;

  return Math.abs(b - a) < 1e-6
    ? clamp((a + b) / 2, 0, 1)
    : (rampIntegral(b) - rampIntegral(a)) / (b - a);
}

/**
 * Adds to `coverage` the share of each pixel of a half row that the gamut
 * covers, with each run moving from its place on the top line to its place on
 * the bottom line. A run narrower than a pixel is a line: it is 1 px wide
 * across its direction.
 */
function addHalfRowCoverage(
  coverage: Float32Array,
  top: PixelRun[],
  bottom: PixelRun[]
): void {
  for (let i = 0; i < Math.max(top.length, bottom.length); i++) {
    // A run on one line only stays in place across the half row.
    let [s0, e0] = top[i] ?? bottom[i];
    let [s1, e1] = bottom[i] ?? top[i];

    if (e0 - s0 < 1 && e1 - s1 < 1) {
      const m0 = (s0 + e0) / 2;
      const m1 = (s1 + e1) / 2;
      // The line moves `m1 - m0` across a half row of 0.5 px.
      const half = Math.hypot(1, (m1 - m0) * 2) / 2;

      [s0, e0, s1, e1] = [m0 - half, m0 + half, m1 - half, m1 + half];
    }

    const innerStart = Math.max(s0, s1);
    const innerEnd = Math.min(e0, e1);
    const last = Math.min(Math.ceil(Math.max(e0, e1)), coverage.length);

    for (let x = Math.max(Math.floor(Math.min(s0, s1)), 0); x < last; x++) {
      const share =
        x >= innerStart && x + 1 <= innerEnd
          ? 1
          : shareLeftOf(e0, e1, x) - shareLeftOf(s0, s1, x);

      coverage[x] += share / 2;
    }
  }
}

/** `u` moved into the nearest run. */
function intoRuns(u: number, runs: PixelRun[]): number {
  let nearest = u;
  let distance = Number.POSITIVE_INFINITY;

  // An index loop: this runs for every pixel of a paint.
  for (let i = 0; i < runs.length; i++) {
    const inside = clamp(u, runs[i][0], runs[i][1]);
    const gap = Math.abs(inside - u);

    if (gap < distance) {
      distance = gap;
      nearest = inside;
    }
  }

  return nearest;
}

/**
 * Paints the OKLCH area of a hue into `image`: lightness from 100 % at the top
 * edge to 0 at the bottom edge, chroma from 0 at the left edge to
 * `OKLCH_AREA_CHROMA` at the right edge. The alpha of a pixel is the share of
 * it inside the sRGB gamut, so the gamut edge is smooth and the rest is
 * transparent. A gamut range narrower than a pixel, such as the blue spike,
 * paints as a 1 px line.
 */
export function paintOklchArea(image: ImageData, hue: number): void {
  const { width, height, data } = image;
  const [cos, sin] = hueDirection(hue);
  const linear = [0, 0, 0];
  // Pixel `x` covers the chroma from `x / scale` to `(x + 1) / scale`.
  const scale = width / OKLCH_AREA_CHROMA;
  const gamma = getGammaTable();
  const coverage = new Float32Array(width);
  const toByte = (channel: number) =>
    gamma[Math.round(clamp(channel, 0, 1) * GAMMA_STEPS)];
  // The gamut runs of the line `y` px below the top edge.
  const runsAt = (y: number): PixelRun[] =>
    gamutRuns(100 * (1 - y / height), hue).map(([start, end]) => [
      start * scale,
      end * scale,
    ]);

  data.fill(0);

  let top = runsAt(0);

  for (let y = 0; y < height; y++) {
    const middle = runsAt(y + 0.5);
    const bottom = runsAt(y + 1);
    const lightness = 1 - (y + 0.5) / height;

    coverage.fill(0);
    addHalfRowCoverage(coverage, top, middle);
    addHalfRowCoverage(coverage, middle, bottom);

    for (let x = 0; x < width; x++) {
      const alpha = Math.round(Math.min(coverage[x], 1) * 255);

      if (!alpha) continue;

      // An edge pixel takes the color of the gamut edge.
      const chroma = intoRuns(x + 0.5, middle) / scale;
      const i = (y * width + x) * 4;

      oklabToLinearSrgb(lightness, chroma * cos, chroma * sin, linear);
      data[i] = toByte(linear[0]);
      data[i + 1] = toByte(linear[1]);
      data[i + 2] = toByte(linear[2]);
      data[i + 3] = alpha;
    }

    top = bottom;
  }
}

/** The hues of the stops of the OKLCH hue slider track, every 10 degrees. */
const TRACK_HUES = Array.from({ length: 37 }, (_, i) => i * 10);

let hueTrack: string | undefined;

/**
 * The track of the hue slider in the OKLCH format: the cusp of each OKLCH
 * hue, inset by half a thumb at both ends, in the direction of the slider.
 */
export function oklchHueTrack(): string {
  if (!hueTrack) {
    const stops = TRACK_HUES.map(cuspColor);

    stops[0] += ' var(--_slider-track-inset)';
    stops[stops.length - 1] += ' calc(100% - var(--_slider-track-inset))';
    hueTrack = `linear-gradient(var(--_slider-track-direction), ${stops.join(', ')})`;
  }

  return hueTrack;
}

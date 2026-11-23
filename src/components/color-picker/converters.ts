import { clamp, modulo } from '#internals/utils/math.js';

const ONE_THIRD = 1 / 3;
const TWO_THIRDS = 2 / 3;

export type RGB = [number, number, number];
export type HSL = [number, number, number];
export type HSV = [number, number, number];
export type OKLCH = [number, number, number];

/**
 * Linear sRGB to LMS: the product of the sRGB to XYZ and the XYZ to LMS
 * matrices of CSS Color 4, as Firefox and Safari convert.
 */
const LINEAR_SRGB_TO_LMS = [
  [0.41222146947076305, 0.5363325372617348, 0.05144599326750221],
  [0.21190349581782522, 0.6806995506452344, 0.10739695353694056],
  [0.08830245919005643, 0.2817188391361215, 0.6299787016738222],
];

const LMS_TO_OKLAB = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
];

function multiply3x3(matrix: number[][], [x, y, z]: number[]): number[] {
  return matrix.map((row) => row[0] * x + row[1] * y + row[2] * z);
}

/** An sRGB channel (0-255) in linear light (0-1). */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export const converter = Object.freeze({
  rgb: {
    hex: (rgb: RGB): string => {
      const [r, g, b] = rgb.map((v) => clamp(Math.round(v), 0, 255));
      const value = (r << 16) + (g << 8) + b;
      return value.toString(16).padStart(6, '0');
    },
    hsl: (rgb: RGB): HSL => {
      const [r, g, b] = rgb.map((v) => v / 255);
      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);
      const delta = max - min;
      let h = 0;
      let s: number;

      if (max === min) {
        h = 0;
      } else if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else if (b === max) {
        h = 4 + (r - g) / delta;
      }

      h = Math.min(h * 60, 360);

      if (h < 0) {
        h += 360;
      }

      const l = (min + max) / 2;

      if (max === min) {
        s = 0;
      } else if (l <= 0.5) {
        s = delta / (max + min);
      } else {
        s = delta / (2 - max - min);
      }

      return [h, s * 100, l * 100];
    },
    hsv: (rgb: RGB): HSV => {
      const [r, g, b] = rgb.map((v) => v / 255);
      const v = Math.max(r, g, b);
      const diff = v - Math.min(r, g, b);
      const calc = (c: number) => (v - c) / 6 / diff + 1 / 2;

      let h = 0;
      let s = 0;

      if (diff > 0) {
        s = diff / v;
        const rDiff = calc(r);
        const gDiff = calc(g);
        const bDiff = calc(b);

        if (r === v) {
          h = bDiff - gDiff;
        } else if (g === v) {
          h = ONE_THIRD + rDiff - bDiff;
        } else if (b === v) {
          h = TWO_THIRDS + gDiff - rDiff;
        }

        if (h < 0) {
          h += 1;
        } else if (h > 1) {
          h -= 1;
        }
      }

      return [h * 360, s * 100, v * 100];
    },
    /** Lightness (0-100), chroma (0 to about 0.32 in sRGB) and hue (0-360). */
    oklch: (rgb: RGB): OKLCH => {
      const lms = multiply3x3(LINEAR_SRGB_TO_LMS, rgb.map(linearize));
      const [l, a, b] = multiply3x3(LMS_TO_OKLAB, lms.map(Math.cbrt));
      const h = (Math.atan2(b, a) * 180) / Math.PI;

      return [l * 100, Math.hypot(a, b), modulo(h, 360)];
    },
  },
  hsl: {
    rgb: (hsl: HSL): RGB => {
      const h = hsl[0] / 360;
      const s = hsl[1] / 100;
      const l = hsl[2] / 100;

      if (s === 0) {
        const val = l * 255;
        return [val, val, val];
      }

      let t3: number;
      let val: number;
      const t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const t1 = 2 * l - t2;
      const rgb: RGB = [0, 0, 0];

      for (let i = 0; i < 3; i++) {
        t3 = h + ONE_THIRD * -(i - 1);
        if (t3 < 0) {
          t3++;
        }

        if (t3 > 1) {
          t3--;
        }

        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (TWO_THIRDS - t3) * 6;
        } else {
          val = t1;
        }

        rgb[i] = val * 255;
      }

      return rgb;
    },
    hsv: (hsl: HSL): HSV => {
      const h = hsl[0];
      let s = hsl[1] / 100;
      let l = hsl[2] / 100;
      let sMin = s;
      const lMin = Math.max(l, 0.01);

      l *= 2;
      // Test the doubled `l`, not `lMin`. `lMin` never exceeds 1, so testing
      // it makes `2 - l` dead and pushes `v` past 100 above 50% lightness.
      s *= l <= 1 ? l : 2 - l;
      sMin *= lMin;
      const v = (l + s) / 2;
      const sv = l === 0 ? (2 * sMin) / (lMin + sMin) : (2 * s) / (l + s);

      return [h, sv * 100, v * 100];
    },
  },
  hsv: {
    rgb: (hsv: HSV): RGB => {
      const h = hsv[0] / 60;
      const s = hsv[1] / 100;
      let v = hsv[2] / 100;
      // Wrap the sector so that a negative or out-of-range hue still maps
      // to its color on the wheel.
      const hi = ((Math.floor(h) % 6) + 6) % 6;

      const f = h - Math.floor(h);
      const p = 255 * v * (1 - s);
      const q = 255 * v * (1 - s * f);
      const t = 255 * v * (1 - s * (1 - f));
      v *= 255;

      switch (hi) {
        case 0:
          return [v, t, p];
        case 1:
          return [q, v, p];
        case 2:
          return [p, v, t];
        case 3:
          return [p, q, v];
        case 4:
          return [t, p, v];
        default:
          return [v, p, q];
      }
    },
    hsl: (hsv: HSV): HSL => {
      const h = hsv[0];
      const s = hsv[1] / 100;
      const v = hsv[2] / 100;
      const vMin = Math.max(v, 0.01);
      let sl: number;
      let l: number;

      l = (2 - s) * v;
      const lMin = (2 - s) * vMin;
      sl = s * vMin;
      // Expanded `2 - lMin`. The short form cancels to 0 for a value near 100
      // and a tiny saturation.
      sl /= lMin <= 1 ? lMin : 2 * (1 - vMin) + s * vMin;
      sl = sl || 0;
      l /= 2;

      return [h, sl * 100, l * 100];
    },
  },
});

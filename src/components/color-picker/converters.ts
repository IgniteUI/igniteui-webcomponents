const ONE_THIRD = 1 / 3;
const TWO_THIRDS = 2 / 3;

export type RGB = [number, number, number];
export type HSL = [number, number, number];
export type HSV = [number, number, number];

export const converter = Object.freeze({
  rgb: {
    hex: (rgb: RGB): string => {
      const [r, g, b] = rgb.map((v) => Math.round(v) & 0xff);
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
          h = ONE_THIRD * rDiff - bDiff;
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
      const t2 = l < 0.5 ? l * (1 + s) : 1 + s - 1 * s;
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
      s *= lMin <= 1 ? l : 2 - l;
      sMin *= lMin <= 1 ? lMin : 2 - lMin;
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
      const hi = Math.floor(h) % 6;

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
        case 5:
          return [v, p, q];
        default:
          return [v, t, p];
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
      sl /= lMin <= 1 ? lMin : 2 - lMin;
      sl = sl || 0;
      l /= 2;

      return [h, sl * 100, l * 100];
    },
  },
});

import { clamp } from '../common/util.js';
import { parseColor } from './common.js';
import { converter, type HSL, type HSV, type RGB } from './converters.js';

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/**
 * Configuration options for color formatting.
 */
export interface ColorConfig {
  /** The output format for the color string */
  format?: ColorFormat;
  /** Whether to include alpha channel in the output */
  withAlpha?: boolean;
}

function makeCanvasContext() {
  let context: OffscreenCanvasRenderingContext2D | null;

  return () => {
    if (context) return context;

    try {
      context = new OffscreenCanvas(0, 0).getContext('2d');
      return context;
    } catch {}
    return null;
  };
}
export const getContext = makeCanvasContext();

/**
 * Represents a color with support for RGB, HSL, and HSV color spaces.
 * Automatically syncs between color spaces when properties are modified.
 *
 * @example
 * ```ts
 * // Create from RGB
 * const color = new ColorModel([255, 0, 0], 0.5);
 *
 * // Parse from string
 * const parsed = ColorModel.parse('#ff0000');
 *
 * // Modify and convert
 * color.h = 120;
 * console.log(color.asString('hsl')); // 'hsla(120, 100%, 50%, 0.5)'
 * ```
 */
export class ColorModel {
  private _rgb: RGB;
  private _hsl: HSL;
  private _hsv: HSV;
  private _alpha: number;

  /**
   * Creates a default black color with full opacity.
   * @returns A new ColorModel instance representing black
   */
  public static default(): ColorModel {
    return new ColorModel([0, 0, 0], 1);
  }

  /**
   * Parses a color string and creates a ColorModel instance.
   * Supports hex, rgb, rgba, hsl, hsla, and named color formats.
   *
   * @param color - The color string to parse
   * @returns A new ColorModel instance
   */
  public static parse(color: string): ColorModel {
    const parsed = parseColor(color, getContext());
    return new ColorModel(parsed.value, parsed.alpha);
  }

  /**
   * Creates a ColorModel from HSL values.
   *
   * @param h - Hue (0-360)
   * @param s - Saturation (0-100)
   * @param l - Lightness (0-100)
   * @param alpha - Alpha channel (0-1)
   * @returns A new ColorModel instance
   */
  public static fromHSL(
    h: number,
    s: number,
    l: number,
    alpha = 1
  ): ColorModel {
    const rgb = converter.hsl.rgb([h, s, l]);
    return new ColorModel(rgb, alpha);
  }

  /**
   * Creates a ColorModel from HSV values.
   *
   * @param h - Hue (0-360)
   * @param s - Saturation (0-100)
   * @param v - Value (0-100)
   * @param alpha - Alpha channel (0-1)
   * @returns A new ColorModel instance
   */
  public static fromHSV(
    h: number,
    s: number,
    v: number,
    alpha = 1
  ): ColorModel {
    const rgb = converter.hsv.rgb([h, s, v]);
    return new ColorModel(rgb, alpha);
  }

  /**
   * Creates a new ColorModel instance.
   *
   * @param value - RGB values as [r, g, b] tuple (0-255 each)
   * @param alpha - Alpha channel value (0-1), defaults to 1
   */
  constructor(value: RGB, alpha = 1) {
    // Create a copy to prevent external mutations
    this._rgb = [value[0], value[1], value[2]];
    this._hsl = converter.rgb.hsl(this._rgb);
    this._hsv = converter.rgb.hsv(this._rgb);
    this._alpha = clamp(alpha, 0, 1);
  }

  /** Red component (0-255) */
  public get r(): number {
    return this._rgb[0];
  }

  public set r(value: number) {
    this._rgb[0] = clamp(value, 0, 255);
    this._hsl = converter.rgb.hsl(this._rgb);
    this._hsv = converter.rgb.hsv(this._rgb);
  }

  /** Green component (0-255) */
  public get g(): number {
    return this._rgb[1];
  }

  public set g(value: number) {
    this._rgb[1] = clamp(value, 0, 255);
    this._hsl = converter.rgb.hsl(this._rgb);
    this._hsv = converter.rgb.hsv(this._rgb);
  }

  /** Blue component (0-255) */
  public get b(): number {
    return this._rgb[2];
  }

  public set b(value: number) {
    this._rgb[2] = clamp(value, 0, 255);
    this._hsl = converter.rgb.hsl(this._rgb);
    this._hsv = converter.rgb.hsv(this._rgb);
  }

  /** Hue component (0-360) */
  public get h(): number {
    return this._hsl[0];
  }

  public set h(value: number) {
    this._hsl[0] = clamp(value, 0, 360);
    this._rgb = converter.hsl.rgb(this._hsl);
    this._hsv = converter.hsl.hsv(this._hsl);
  }

  /** Saturation component from HSL (0-100) */
  public get s(): number {
    return this._hsl[1];
  }

  public set s(value: number) {
    this._hsl[1] = clamp(value, 0, 100);
    this._rgb = converter.hsl.rgb(this._hsl);
    this._hsv = converter.hsl.hsv(this._hsl);
  }

  /** Lightness component (0-100) */
  public get l(): number {
    return this._hsl[2];
  }

  public set l(value: number) {
    this._hsl[2] = clamp(value, 0, 100);
    this._rgb = converter.hsl.rgb(this._hsl);
    this._hsv = converter.hsl.hsv(this._hsl);
  }

  /** Value component from HSV (0-100) */
  public get v(): number {
    return this._hsv[2];
  }

  public set v(value: number) {
    this._hsv[2] = clamp(value, 0, 100);
    this._rgb = converter.hsv.rgb(this._hsv);
    this._hsl = converter.hsv.hsl(this._hsv);
  }

  /** Alpha/opacity channel (0-1) */
  public get alpha(): number {
    return this._alpha;
  }

  public set alpha(value: number) {
    this._alpha = clamp(value, 0, 1);
  }

  /**
   * Converts the color to a CSS color string.
   *
   * @param format - The output format ('hex', 'rgb', or 'hsl')
   * @param forceAlpha - Whether to always include alpha channel
   * @returns CSS color string
   */
  public asString(format: ColorFormat, forceAlpha = false): string {
    const hasAlpha = this._alpha < 1 || forceAlpha;
    switch (format) {
      case 'hex': {
        return hasAlpha
          ? `#${converter.rgb.hex(this._rgb)}${Math.round(this._alpha * 255)
              .toString(16)
              .padStart(2, '0')}`
          : `#${converter.rgb.hex(this._rgb)}`;
      }
      case 'rgb': {
        const [r, g, b] = this._rgb.map((v) => Math.round(v));
        return hasAlpha
          ? `rgba(${r}, ${g}, ${b}, ${this._alpha})`
          : `rgb(${r}, ${g}, ${b})`;
      }
      case 'hsl': {
        const [h, s, l] = this._hsl.map((v) => Math.round(v));
        return hasAlpha
          ? `hsla(${h}, ${s}%, ${l}%, ${this._alpha})`
          : `hsl(${h}, ${s}%, ${l}%)`;
      }
    }
  }

  /**
   * Creates a copy of this color model.
   *
   * @returns A new ColorModel instance with the same values
   */
  public clone(): ColorModel {
    return new ColorModel([...this._rgb] as RGB, this._alpha);
  }

  /**
   * Checks if this color equals another color.
   *
   * @param other - The color to compare with
   * @returns True if colors are equal
   */
  public equals(other: ColorModel): boolean {
    return (
      this._rgb[0] === other._rgb[0] &&
      this._rgb[1] === other._rgb[1] &&
      this._rgb[2] === other._rgb[2] &&
      this._alpha === other._alpha
    );
  }

  /**
   * Returns the RGB values as a tuple.
   *
   * @returns RGB values [r, g, b]
   */
  public toRGB(): RGB {
    return [this._rgb[0], this._rgb[1], this._rgb[2]];
  }

  /**
   * Returns the HSL values as a tuple.
   *
   * @returns HSL values [h, s, l]
   */
  public toHSL(): HSL {
    return [this._hsl[0], this._hsl[1], this._hsl[2]];
  }

  /**
   * Returns the HSV values as a tuple.
   *
   * @returns HSV values [h, s, v]
   */
  public toHSV(): HSV {
    return [this._hsv[0], this._hsv[1], this._hsv[2]];
  }
}

import { clamp } from '#internals/utils/math.js';
import type { ColorFormat } from '../types.js';
import { isValidColor, normalizeColor, parseColor } from './common.js';
import { converter, type HSL, type HSV, type RGB } from './converters.js';

export type { ColorFormat };

/** The color space a channel write is expressed in. */
type ColorSpace = 'rgb' | 'hsl' | 'hsv';
type Channel = 0 | 1 | 2;

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
  private _empty = false;

  /** Creates a black color with full opacity. */
  public static default(): ColorModel {
    return new ColorModel([0, 0, 0], 1);
  }

  /**
   * Creates an empty color, representing a missing/undefined color value.
   * An empty color serializes to an empty string and is considered "empty"
   * until any of its channels are modified.
   *
   * Backed by white rather than black: an empty color still has to be drawn,
   * and white is HSV `[0, 0, 100]` - the origin of the saturation/value plane,
   * where a picker with nothing selected should start. Black would put the
   * marker in the opposite corner, on a color the user never chose.
   */
  public static empty(): ColorModel {
    const color = new ColorModel([255, 255, 255], 1);
    color._empty = true;
    return color;
  }

  /**
   * Parses a color string and creates a ColorModel instance.
   * Supports hex, rgb, rgba, hsl, hsla, and named color formats.
   *
   * Empty, whitespace-only, or otherwise invalid strings produce an empty
   * ColorModel instead of a stale/incorrect color.
   */
  public static parse(color: string): ColorModel {
    const ctx = getContext();
    // Normalized up front - validating the raw string would reject a hash-less
    // hex before `parseColor` ever got the chance to restore its `#`.
    const normalized = normalizeColor(color);

    if (!isValidColor(normalized, ctx)) {
      return ColorModel.empty();
    }

    const parsed = parseColor(normalized, ctx);
    return new ColorModel(parsed.value, parsed.alpha);
  }

  /** Creates a ColorModel from hue (0-360), saturation and lightness (0-100). */
  public static fromHSL(
    h: number,
    s: number,
    l: number,
    alpha = 1
  ): ColorModel {
    return new ColorModel(converter.hsl.rgb([h, s, l]), alpha);
  }

  /** Creates a ColorModel from hue (0-360), saturation and value (0-100). */
  public static fromHSV(
    h: number,
    s: number,
    v: number,
    alpha = 1
  ): ColorModel {
    return new ColorModel(converter.hsv.rgb([h, s, v]), alpha);
  }

  /**
   * @param value - RGB values as [r, g, b] tuple (0-255 each)
   * @param alpha - Alpha channel value (0-1)
   */
  constructor(value: RGB, alpha = 1) {
    // Copied to prevent external mutations.
    this._rgb = [value[0], value[1], value[2]];
    this._hsl = converter.rgb.hsl(this._rgb);
    this._hsv = converter.rgb.hsv(this._rgb);
    this._alpha = clamp(alpha, 0, 1);
  }

  /** Whether the color represents a missing/undefined value. */
  public get isEmpty(): boolean {
    return this._empty;
  }

  /** Rebuilds the two color spaces that were not the one just written to. */
  private _syncFrom(space: ColorSpace): void {
    switch (space) {
      case 'rgb':
        this._hsl = converter.rgb.hsl(this._rgb);
        this._hsv = converter.rgb.hsv(this._rgb);
        break;
      case 'hsl':
        this._rgb = converter.hsl.rgb(this._hsl);
        this._hsv = converter.hsl.hsv(this._hsl);
        break;
      case 'hsv':
        this._rgb = converter.hsv.rgb(this._hsv);
        this._hsl = converter.hsv.hsl(this._hsv);
        break;
    }
  }

  /**
   * Writes a single channel and brings the rest of the model back in sync.
   * Every channel setter goes through here, so no space is ever left stale.
   */
  private _setChannel(
    space: ColorSpace,
    index: Channel,
    value: number,
    max: number
  ): void {
    this._empty = false;

    // Safe to hold onto: `_syncFrom` only replaces the *other* two tuples.
    const channels =
      space === 'rgb' ? this._rgb : space === 'hsl' ? this._hsl : this._hsv;

    channels[index] = clamp(value, 0, max);
    this._syncFrom(space);
  }

  /** Red component (0-255) */
  public get r(): number {
    return this._rgb[0];
  }

  public set r(value: number) {
    this._setChannel('rgb', 0, value, 255);
  }

  /** Green component (0-255) */
  public get g(): number {
    return this._rgb[1];
  }

  public set g(value: number) {
    this._setChannel('rgb', 1, value, 255);
  }

  /** Blue component (0-255) */
  public get b(): number {
    return this._rgb[2];
  }

  public set b(value: number) {
    this._setChannel('rgb', 2, value, 255);
  }

  /** Hue component (0-360) */
  public get h(): number {
    return this._hsl[0];
  }

  public set h(value: number) {
    this._setChannel('hsl', 0, value, 360);
  }

  /** Saturation component from HSL (0-100) */
  public get s(): number {
    return this._hsl[1];
  }

  public set s(value: number) {
    this._setChannel('hsl', 1, value, 100);
  }

  /** Lightness component (0-100) */
  public get l(): number {
    return this._hsl[2];
  }

  public set l(value: number) {
    this._setChannel('hsl', 2, value, 100);
  }

  /** Value component from HSV (0-100) */
  public get v(): number {
    return this._hsv[2];
  }

  public set v(value: number) {
    this._setChannel('hsv', 2, value, 100);
  }

  /** Alpha/opacity channel (0-1) */
  public get alpha(): number {
    return this._alpha;
  }

  public set alpha(value: number) {
    this._empty = false;
    this._alpha = clamp(value, 0, 1);
  }

  /**
   * Sets the HSV saturation and value in a single atomic update, preserving
   * the current hue and alpha. Intended for the 2D saturation/value picker
   * area, where both components change together and setting them through the
   * individual `s` (HSL) and `v` (HSV) setters would be both incorrect
   * (mixing color spaces) and order-dependent.
   *
   * @param saturation - HSV saturation (0-100)
   * @param value - HSV value (0-100)
   */
  public setSaturationAndValue(saturation: number, value: number): void {
    this._empty = false;
    this._hsv[1] = clamp(saturation, 0, 100);
    this._hsv[2] = clamp(value, 0, 100);
    this._syncFrom('hsv');
  }

  /**
   * Converts the color to a CSS color string. An empty color renders as an
   * empty string.
   *
   * @param format - The output format ('hex', 'rgb', or 'hsl')
   * @param forceAlpha - Whether to always include the alpha channel
   */
  public asString(format: ColorFormat, forceAlpha = false): string {
    if (this._empty) {
      return '';
    }

    const alpha = this._alpha < 1 || forceAlpha ? this._alpha : null;

    switch (format) {
      case 'hex': {
        const hex = converter.rgb.hex(this._rgb);
        const suffix =
          alpha === null
            ? ''
            : Math.round(alpha * 255)
                .toString(16)
                .padStart(2, '0');
        return `#${hex}${suffix}`;
      }
      case 'rgb': {
        const [r, g, b] = this._rgb.map(Math.round);
        return `rgb(${r} ${g} ${b}${alpha === null ? '' : ` / ${alpha}`})`;
      }
      case 'hsl': {
        const [h, s, l] = this._hsl.map(Math.round);
        return `hsl(${h} ${s}% ${l}%${alpha === null ? '' : ` / ${alpha}`})`;
      }
    }
  }

  /** Creates a copy of this color model. */
  public clone(): ColorModel {
    const color = new ColorModel(this._rgb, this._alpha);
    color._empty = this._empty;
    return color;
  }

  /** Whether this color has the same channels and emptiness as `other`. */
  public equals(other: ColorModel): boolean {
    return (
      this._empty === other._empty &&
      this._alpha === other._alpha &&
      this._rgb.every((channel, i) => channel === other._rgb[i])
    );
  }

  /** Returns the RGB values as a tuple. */
  public toRGB(): RGB {
    return [...this._rgb];
  }

  /** Returns the HSL values as a tuple. */
  public toHSL(): HSL {
    return [...this._hsl];
  }

  /** Returns the HSV values as a tuple. */
  public toHSV(): HSV {
    return [...this._hsv];
  }
}

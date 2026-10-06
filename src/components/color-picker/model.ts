import { clamp } from '#internals/utils/math.js';
import type { ColorFormat } from '../types.js';
import { isValidColor, normalizeColor, parseColor } from './common.js';
import { converter, type HSL, type HSV, type RGB } from './converters.js';

export type { ColorFormat };

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
 * A color that keeps its RGB, HSL and HSV values in sync.
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
   * Creates an empty color. It serializes to an empty string until a channel
   * changes. It is white, the origin of the saturation/value plane, so an
   * empty picker starts there.
   */
  public static empty(): ColorModel {
    const color = new ColorModel([255, 255, 255], 1);
    color._empty = true;
    return color;
  }

  /**
   * Parses a hex, rgb(a), hsl(a) or named color.
   * An empty or invalid string gives an empty color.
   */
  public static parse(color: string): ColorModel {
    const ctx = getContext();
    // Validation rejects a hash-less hex, so normalize first.
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

  /** RGB channels are 0-255 and alpha is 0-1. */
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

  /** Writes one channel and syncs the other color spaces. */
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
   * Sets the HSV saturation and value in one update and keeps the hue and alpha.
   * The `s` (HSL) and `v` (HSV) setters mix color spaces and depend on order.
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

  public toRGB(): RGB {
    return [...this._rgb];
  }

  public toHSL(): HSL {
    return [...this._hsl];
  }

  public toHSV(): HSV {
    return [...this._hsv];
  }
}

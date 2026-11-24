import { clamp, roundPrecise } from '#internals/utils/math.js';
import type { ColorFormat } from '../types.js';
import { tryParseColor } from './common.js';
import {
  alphaPart,
  converter,
  type HSL,
  type HSV,
  type OKLCH,
  type RGB,
  rgbString,
} from './converters.js';
import {
  cuspHsvHue,
  gamutChroma,
  isAchromatic,
  pureHueOklch,
} from './oklch.js';

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

/** The color string shape of each format. Shown while a color text is empty. */
export const formatPlaceholders: Record<ColorFormat, string> = {
  hex: '#rrggbb',
  rgb: 'rgb(r g b)',
  hsl: 'hsl(h s% l%)',
  oklch: 'oklch(l% c h)',
};

/**
 * The formats in the key order of `formatPlaceholders`, which is the order of
 * the format select.
 */
export const colorFormats = Object.keys(
  formatPlaceholders
) as readonly ColorFormat[];

/**
 * A color with its alpha in one notation, to compare two colors. The empty
 * key is no color.
 */
export type ColorKey = string;

export function colorKey(color: ColorModel): ColorKey {
  return color.asString('rgb', true);
}

/** The color with an opaque alpha. An empty color gives white. */
export function opaqueColor(color: ColorModel): string {
  return rgbString(color.toRGB());
}

/**
 * The color of a committed color text. An empty text gives an empty color. An
 * invalid text gives `null`: the input shows the current color again.
 */
export function parseTypedColor(text: string | undefined): ColorModel | null {
  const color = ColorModel.parse(text ?? '');
  return color.isEmpty && text?.trim() ? null : color;
}

/**
 * A color that keeps its RGB, HSL, HSV and OKLCH values in sync. A gray keeps
 * the hue that the user set, and the HSV and OKLCH hues of a gray match
 * through the cusp of the hue.
 */
export class ColorModel {
  private _rgb: RGB;
  private _hsl: HSL;
  private _hsv: HSV;
  private _oklch: OKLCH;
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
   * Parses a CSS color into sRGB. A color outside the sRGB gamut clips. An
   * empty or invalid string, or a color that depends on its context, such as
   * `currentcolor`, gives an empty color.
   */
  public static parse(color: string): ColorModel {
    const parsed = tryParseColor(color, getContext());

    return parsed
      ? new ColorModel(parsed.value, parsed.alpha)
      : ColorModel.empty();
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
    this._oklch = this._oklchFromRgb();
    this._alpha = clamp(alpha, 0, 1);
  }

  /** Whether the color represents a missing/undefined value. */
  public get isEmpty(): boolean {
    return this._empty;
  }

  /** Rebuilds the color spaces that were not the one just written to. */
  private _syncFrom(space: ColorSpace): void {
    switch (space) {
      case 'rgb':
        this._syncHslHsv();
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

    this._oklch = this._oklchFromRgb();
  }

  /** Rebuilds HSL and HSV from RGB. */
  private _syncHslHsv(): void {
    this._hsl = converter.rgb.hsl(this._rgb);
    this._hsv = converter.rgb.hsv(this._rgb);
  }

  /** The OKLCH values of the RGB channels. A gray takes the hue of its HSV cusp. */
  private _oklchFromRgb(): OKLCH {
    const oklch = converter.rgb.oklch(this._rgb);

    if (isAchromatic(oklch[1])) {
      oklch[1] = 0;
      oklch[2] = pureHueOklch(this._hsv[0])[2];
    }

    return oklch;
  }

  /** Rebuilds RGB, HSL and HSV. A gray takes the HSV hue of its OKLCH cusp. */
  private _syncFromOklch(): void {
    const rgb = converter.oklch
      .rgb(this._oklch)
      .map((channel) => clamp(channel, 0, 255)) as RGB;
    const gray = isAchromatic(this._oklch[1]);

    if (gray) {
      // Rounding leaves the channels a little apart, which gives a gray a hue.
      rgb.fill((rgb[0] + rgb[1] + rgb[2]) / 3);
    }

    this._rgb = rgb;
    this._syncHslHsv();

    if (gray) {
      this._hsl[0] = this._hsv[0] = cuspHsvHue(this._oklch[2]);
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

    // Safe to hold onto: `_syncFrom` only replaces the *other* tuples.
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

  /** Writes OKLCH values and returns whether the gamut edge cut the chroma. */
  private _setOklch(color: OKLCH): boolean {
    const [lightness, chroma, hue] = color;
    const inGamut = gamutChroma(color);

    this._empty = false;
    this._oklch = [lightness, inGamut, hue];
    this._syncFromOklch();
    return inGamut < chroma;
  }

  /**
   * Sets the OKLCH lightness and chroma in one update and keeps the hue and
   * alpha. A chroma beyond the sRGB gamut is cut back to the gamut edge.
   *
   * @param lightness - OKLCH lightness (0-100)
   * @param chroma - OKLCH chroma (0 and up)
   * @returns Whether the chroma was cut.
   */
  public setLightnessAndChroma(lightness: number, chroma: number): boolean {
    return this._setOklch([
      clamp(lightness, 0, 100),
      Math.max(chroma, 0),
      this._oklch[2],
    ]);
  }

  /**
   * Sets the OKLCH hue (0-360) and keeps the lightness and alpha. A chroma
   * beyond the sRGB gamut at the new hue is cut back to the gamut edge.
   *
   * @returns Whether the chroma was cut.
   */
  public setOklchHue(hue: number): boolean {
    const [lightness, chroma] = this._oklch;
    return this._setOklch([lightness, chroma, clamp(hue, 0, 360)]);
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
      case 'rgb':
        return rgbString(this._rgb, alpha);
      case 'hsl': {
        const [h, s, l] = this._hsl.map(Math.round);
        return `hsl(${h} ${s}% ${l}%${alphaPart(alpha)})`;
      }
      case 'oklch': {
        // The fewest decimals that give every 8-bit color back in Firefox and
        // Safari. Chromium uses other OKLab matrices and can be one step off.
        const [l, c, h] = converter.rgb.oklch(this._rgb);
        // A gray has no hue.
        const hue = isAchromatic(c) ? 0 : roundPrecise(h, 2) % 360;
        return `oklch(${roundPrecise(l, 2)}% ${roundPrecise(c, 5)} ${hue}${alphaPart(alpha)})`;
      }
    }
  }

  public clone(): ColorModel {
    const color = new ColorModel(this._rgb, this._alpha);
    // The other spaces keep the hue of a gray.
    color._hsl = [...this._hsl];
    color._hsv = [...this._hsv];
    color._oklch = [...this._oklch];
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

  /** Lightness (0-100), chroma and hue (0-360). A gray keeps its hue. */
  public toOKLCH(): OKLCH {
    return [...this._oklch];
  }
}

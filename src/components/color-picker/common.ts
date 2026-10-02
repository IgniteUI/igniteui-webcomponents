import { asNumber } from '#internals/utils/math.js';
import type { RGB } from './converters.js';

const RGBA_RE =
  /^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i;
const HEX_RE = /.{2}/g;
const HEX_WITHOUT_HASH_RE = /^[0-9a-f]{3,4}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/i;

export interface ParsedColor {
  value: RGB;
  alpha: number;
}

/**
 * Trims a color string and adds the `#` that the canvas needs for a hash-less hex.
 * Normalize before validation, which rejects a raw `ff0000`.
 */
export function normalizeColor(colorString: string): string {
  const trimmed = colorString?.trim() ?? '';
  return HEX_WITHOUT_HASH_RE.test(trimmed) ? `#${trimmed}` : trimmed;
}

/**
 * Parses a hex, rgb(a), hsl(a) or named color into RGB values and alpha.
 *
 * @param colorString - The color string to parse
 * @param ctx - Optional canvas context for color parsing. If not provided, returns default black color.
 * @returns Object containing RGB values and alpha channel
 */
export function parseColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): ParsedColor {
  const result: ParsedColor = {
    value: [0, 0, 0],
    alpha: 1,
  };

  if (!colorString || !ctx) {
    return result;
  }

  const normalized = normalizeColor(colorString);

  if (!isValidColor(normalized, ctx)) {
    return result;
  }

  // The canvas parses the color.
  ctx.fillStyle = normalized;
  const color = ctx.fillStyle;

  const rgbaMatch = RGBA_RE.exec(color);

  if (rgbaMatch) {
    const [r, g, b, a] = rgbaMatch.slice(3).map((part) => asNumber(part));
    result.value = [r, g, b];
    result.alpha = a ?? 1;
  } else {
    const hexValue = color.replace('#', '');
    const matches = hexValue.match(HEX_RE);

    if (!matches) {
      return result;
    }

    const [r, g, b, a] = matches.map((part) => Number.parseInt(part, 16));
    result.value = [r, g, b];

    // Handle 8-digit hex with alpha channel
    if (matches.length === 4 && a !== undefined) {
      result.alpha = a / 255;
    }
  }

  return result;
}

/**
 * Whether a string is a valid CSS color.
 *
 * An invalid color leaves the canvas fill unchanged, so two different
 * baselines give two different results.
 *
 * @param colorString - The color string to validate
 * @param ctx - Canvas context used for parsing
 * @returns `true` if the string is a valid, non-empty CSS color
 */
export function isValidColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): boolean {
  if (!colorString?.trim() || !ctx) {
    return false;
  }

  ctx.fillStyle = '#000';
  ctx.fillStyle = colorString;
  const onBlack = ctx.fillStyle;

  ctx.fillStyle = '#fff';
  ctx.fillStyle = colorString;
  const onWhite = ctx.fillStyle;

  return onBlack === onWhite;
}

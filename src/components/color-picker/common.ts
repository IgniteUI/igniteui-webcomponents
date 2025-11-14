import { asNumber } from '../common/util.js';
import type { RGB } from './converters.js';

export const RGBA_RE =
  /^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i;
export const HEX_RE = /.{2}/g;

export interface ParsedColor {
  value: RGB;
  alpha: number;
}

/**
 * Parses a color string into RGB values and alpha channel.
 * Supports hex, rgb, rgba, hsl, hsla, and named color formats.
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

  // Trigger parsing through canvas context
  ctx.fillStyle = colorString;
  const color = ctx.fillStyle;

  const rgbaMatch = RGBA_RE.exec(color);

  if (rgbaMatch) {
    const [r, g, b, a] = rgbaMatch.slice(3).map((part) => asNumber(part));
    result.value = [r, g, b];
    result.alpha = a ?? 1;
  } else {
    // Parse hex color
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

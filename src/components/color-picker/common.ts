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

/** Parses a hex, rgb(a), hsl(a) or named color, or returns `null` for an invalid one. */
export function tryParseColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): ParsedColor | null {
  const serialized = serializeColor(normalizeColor(colorString), ctx);
  return serialized === null ? null : fromSerialized(serialized);
}

/**
 * Parses a hex, rgb(a), hsl(a) or named color into RGB values and alpha.
 * An invalid color, or no canvas context, gives black.
 */
export function parseColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): ParsedColor {
  return tryParseColor(colorString, ctx) ?? { value: [0, 0, 0], alpha: 1 };
}

/** Reads the RGB values and the alpha from a canvas serialization. */
function fromSerialized(color: string): ParsedColor {
  const result: ParsedColor = {
    value: [0, 0, 0],
    alpha: 1,
  };

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

    if (matches.length === 4 && a !== undefined) {
      result.alpha = a / 255;
    }
  }

  return result;
}

/**
 * The canvas serialization of a valid color, or `null`. An invalid color
 * leaves the fill unchanged, so two baselines differ.
 */
function serializeColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): string | null {
  if (!colorString?.trim() || !ctx) {
    return null;
  }

  ctx.fillStyle = '#000';
  ctx.fillStyle = colorString;
  const onBlack = ctx.fillStyle;

  ctx.fillStyle = '#fff';
  ctx.fillStyle = colorString;
  const onWhite = ctx.fillStyle;

  return onBlack === onWhite ? onBlack : null;
}

/** Whether a string is a valid CSS color. */
export function isValidColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): boolean {
  return serializeColor(colorString, ctx) !== null;
}

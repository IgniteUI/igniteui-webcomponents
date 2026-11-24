import { asNumber, clamp } from '#internals/utils/math.js';
import type { RGB } from './converters.js';

const RGBA_RE =
  /^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i;
const SRGB_RE = /^color\(srgb\s+(\S+)\s+(\S+)\s+(\S+?)(?:\s*\/\s*(\S+?))?\)$/i;
const HEX_RE = /.{2}/g;
const HEX_WITHOUT_HASH_RE = /^[0-9a-f]{3,4}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/i;

/** A canvas serialization in the legacy sRGB syntax: hex, `rgb()` or `rgba()`. */
const LEGACY_RE = /^(?:#|rgba?\()/i;

/**
 * The colors that take their value from a context: the element
 * (`currentcolor`), the page (`var()`), the color scheme (`light-dark()`) or
 * the platform (the system colors). A color value must not change with its
 * context, so they are invalid.
 */
const CONTEXT_COLORS = [
  'currentcolor',
  'var',
  'light-dark',
  // System colors
  'accentcolor',
  'accentcolortext',
  'activetext',
  'buttonborder',
  'buttonface',
  'buttontext',
  'canvas',
  'canvastext',
  'field',
  'fieldtext',
  'graytext',
  'highlight',
  'highlighttext',
  'linktext',
  'mark',
  'marktext',
  'selecteditem',
  'selecteditemtext',
  'visitedtext',
  // Deprecated system colors
  'activeborder',
  'activecaption',
  'appworkspace',
  'background',
  'buttonhighlight',
  'buttonshadow',
  'captiontext',
  'inactiveborder',
  'inactivecaption',
  'inactivecaptiontext',
  'infobackground',
  'infotext',
  'menu',
  'menutext',
  'scrollbar',
  'threeddarkshadow',
  'threedface',
  'threedhighlight',
  'threedlightshadow',
  'threedshadow',
  'window',
  'windowframe',
  'windowtext',
];

/**
 * Finds a context color as a whole CSS identifier, also inside a function such
 * as `color-mix()`. The canvas of Chromium and WebKit resolves `currentcolor`
 * to black and a system color to its light value, so this check runs before
 * the canvas.
 */
const CONTEXT_COLOR_RE = new RegExp(
  `(?:^|[^\\w-])(?:${CONTEXT_COLORS.join('|')})(?![\\w-])`,
  'i'
);

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
 * Parses a CSS color into sRGB, or returns `null` for an invalid one or a
 * color that depends on its context.
 */
export function tryParseColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): ParsedColor | null {
  return readColor(normalizeColor(colorString), ctx);
}

/**
 * Parses a CSS color into sRGB values and alpha. An invalid color, a color
 * that depends on its context, or no canvas context gives black.
 */
export function parseColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): ParsedColor {
  return tryParseColor(colorString, ctx) ?? { value: [0, 0, 0], alpha: 1 };
}

/** Whether a string is a valid CSS color that does not depend on its context. */
export function isValidColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): boolean {
  return readColor(colorString, ctx) !== null;
}

function readColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): ParsedColor | null {
  const serialized = serializeColor(colorString, ctx);
  return serialized === null ? null : fromSerialized(serialized);
}

/**
 * Reads the RGB values and the alpha from a serialization of
 * {@link serializeColor}, or returns `null` for another notation.
 */
function fromSerialized(color: string): ParsedColor | null {
  const srgbMatch = SRGB_RE.exec(color);

  if (srgbMatch) {
    // A channel outside 0-1 is outside the sRGB gamut, so it clips.
    // `none` reads as 0.
    const [r, g, b] = srgbMatch
      .slice(1, 4)
      .map((part) => clamp(Math.round(asNumber(part) * 255), 0, 255));
    const alpha = srgbMatch[4];

    return {
      value: [r, g, b],
      alpha: alpha === undefined ? 1 : clamp(asNumber(alpha), 0, 1),
    };
  }

  const rgbaMatch = RGBA_RE.exec(color);

  if (rgbaMatch) {
    const [r, g, b, a] = rgbaMatch.slice(3).map((part) => asNumber(part));
    return { value: [r, g, b], alpha: a ?? 1 };
  }

  if (!color.startsWith('#')) {
    return null;
  }

  const matches = color.slice(1).match(HEX_RE);

  if (!matches) {
    return null;
  }

  const [r, g, b, a] = matches.map((part) => Number.parseInt(part, 16));

  return {
    value: [r, g, b],
    alpha: matches.length === 4 && a !== undefined ? a / 255 : 1,
  };
}

/**
 * The serialization of a valid color as hex, `rgb()`, `rgba()` or
 * `color(srgb r g b / a)`, or `null`.
 *
 * Chromium and WebKit keep the notation of a color outside the legacy sRGB
 * syntax, such as `oklch()`, `lab()` or `color(display-p3 ...)`. Relative color
 * syntax converts it to `color(srgb ...)`, where a color outside the sRGB gamut
 * has channels outside 0-1. Firefox serializes every color as hex or `rgba()`.
 *
 * The relative color wraps the serialization of the canvas, not the input, so
 * text in the input, such as an open comment, cannot change the color.
 */
function serializeColor(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D | null
): string | null {
  if (!colorString?.trim() || !ctx || CONTEXT_COLOR_RE.test(colorString)) {
    return null;
  }

  const serialized = canvasSerialize(colorString, ctx);

  return serialized === null || LEGACY_RE.test(serialized)
    ? serialized
    : canvasSerialize(`color(from ${serialized} srgb r g b / alpha)`, ctx);
}

/**
 * The canvas serialization of a valid color, or `null`. An invalid color
 * leaves the fill unchanged, so two baselines differ.
 */
function canvasSerialize(
  colorString: string,
  ctx: OffscreenCanvasRenderingContext2D
): string | null {
  ctx.fillStyle = '#000';
  ctx.fillStyle = colorString;
  const onBlack = ctx.fillStyle;

  ctx.fillStyle = '#fff';
  ctx.fillStyle = colorString;
  const onWhite = ctx.fillStyle;

  return onBlack === onWhite ? onBlack : null;
}

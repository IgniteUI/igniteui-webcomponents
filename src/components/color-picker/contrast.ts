import { getNumberFormatter } from 'igniteui-i18n-core';
import { formatString } from '#internals/utils/strings.js';
import { linearize, type RGB } from './converters.js';
import type { ColorPickerI18n } from './i18n.js';
import type { ColorModel } from './model.js';

/** The WCAG 2 levels for normal text. */
export const CONTRAST_LEVELS = [
  { nameKey: 'color_picker_contrast_aa', minimumRatio: 4.5 },
  { nameKey: 'color_picker_contrast_aaa', minimumRatio: 7 },
] as const;

const WHITE: RGB = [255, 255, 255];

/** A color with its alpha over an opaque color, as the browser paints in sRGB. */
function composite(top: RGB, alpha: number, bottom: RGB): RGB {
  return top.map(
    (channel, i) => channel * alpha + bottom[i] * (1 - alpha)
  ) as RGB;
}

/** The WCAG 2 relative luminance of an sRGB color, from 0 to 1. */
function luminance(rgb: RGB): number {
  const [r, g, b] = rgb.map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The WCAG 2 contrast ratio of a color over a background, from 1 to 21. The
 * background goes over white and the color over the background, each with its
 * alpha.
 */
export function contrastRatio(
  color: ColorModel,
  background: ColorModel
): number {
  const bottom = composite(background.toRGB(), background.alpha, WHITE);
  const top = luminance(composite(color.toRGB(), color.alpha, bottom));
  const base = luminance(bottom);

  return (Math.max(top, base) + 0.05) / (Math.min(top, base) + 0.05);
}

/**
 * The text of a contrast ratio, such as "Contrast 4.54:1". The ratio is cut to
 * two decimals, so it never reads as a level that it fails.
 */
export function formatContrastRatio(
  ratio: number,
  { resourceStrings, locale }: ColorPickerI18n
): string {
  const value = getNumberFormatter().formatNumber(ratio, locale, {
    maximumFractionDigits: 2,
    roundingMode: 'trunc',
  });

  return formatString(resourceStrings.color_picker_contrast_ratio, value);
}

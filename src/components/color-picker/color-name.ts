import { getNumberFormatter } from 'igniteui-i18n-core';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import { formatString } from '#internals/utils/strings.js';
import { converter, type RGB } from './converters.js';
import type { ColorPickerI18n, ColorPickerStrings } from './i18n.js';
import type { ColorModel } from './model.js';

type ColorLightnessWord = 'very_dark' | 'dark' | 'light' | 'very_light';

type ColorChromaWord = 'grayish' | 'vibrant';

type ColorHueWord =
  | 'red'
  | 'orange'
  | 'brown'
  | 'yellow'
  | 'yellow_green'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'magenta'
  | 'pink'
  | 'black'
  | 'white'
  | 'gray';

type ColorNameWord = ColorLightnessWord | ColorChromaWord | ColorHueWord;

/** The words of a color name. Only the hue word is always there. */
export interface ColorNameParts {
  lightness?: ColorLightnessWord;
  chroma?: ColorChromaWord;
  hue: ColorHueWord;
}

/** The OKLCH hue where each hue word ends. Above 345 the hue is pink. */
const HUE_WORDS: ReadonlyArray<readonly [end: number, word: ColorHueWord]> = [
  [20, 'pink'],
  [42, 'red'],
  [80, 'orange'],
  [115, 'yellow'],
  [138, 'yellow_green'],
  [165, 'green'],
  [210, 'cyan'],
  [290, 'blue'],
  [325, 'purple'],
  [345, 'magenta'],
];

/** Below this OKLCH chroma, a color has no hue. */
const ACHROMATIC_CHROMA = 0.02;

/** The lightness word limits of a gray (OKLCH lightness 0-100). */
const GRAY_LIMITS = [30, 55, 70, 85] as const;

/** The lightness word limits of a color, from -1 (black) to 1 (white) around the cusp. */
const SHADE_LIMITS = [-0.6, -0.25, 0.25, 0.6] as const;

function pureHueOklch(hsvHue: number): number[] {
  return converter.rgb.oklch(converter.hsv.rgb([hsvHue, 100, 100]));
}

const RED_HUE = pureHueOklch(0)[2];

/** The cusps by OKLCH hue in half degrees. */
const cusps = new Map<number, number[]>();

/**
 * The OKLCH values of the most chromatic sRGB color of a hue: the pure hue
 * with that OKLCH hue, found by bisection.
 */
function cusp(hue: number): number[] {
  return getOrInsertComputed(cusps, Math.round(hue * 2), (key) => {
    const unwrap = (h: number) => (h < RED_HUE ? h + 360 : h);
    const target = unwrap(key / 2);
    let low = 0;
    let high = 360;

    while (high - low > 0.01) {
      const middle = (low + high) / 2;

      if (unwrap(pureHueOklch(middle)[2]) < target) {
        low = middle;
      } else {
        high = middle;
      }
    }

    return pureHueOklch((low + high) / 2);
  });
}

function hueWord(oklchHue: number): ColorHueWord {
  return HUE_WORDS.find(([end]) => oklchHue < end)?.[1] ?? 'pink';
}

function lightnessWord(
  value: number,
  [veryDark, dark, light, veryLight]: readonly number[]
): ColorLightnessWord | undefined {
  if (value < veryDark) return 'very_dark';
  if (value < dark) return 'dark';
  if (value > veryLight) return 'very_light';
  if (value > light) return 'light';
  return undefined;
}

/**
 * The words that name an sRGB color. Lightness and chroma compare with the
 * most chromatic color of the hue, so pure yellow and pure blue are not light
 * or dark.
 */
export function colorNameParts(rgb: RGB): ColorNameParts {
  const [lightness, chroma, hue] = converter.rgb.oklch(rgb);

  if (chroma < ACHROMATIC_CHROMA) {
    if (lightness < 18) return { hue: 'black' };
    if (lightness > 97) return { hue: 'white' };
    return { lightness: lightnessWord(lightness, GRAY_LIMITS), hue: 'gray' };
  }

  const [cuspLightness, cuspChroma] = cusp(hue);
  const darker = lightness < cuspLightness;
  const shade = darker
    ? lightness / cuspLightness - 1
    : (lightness - cuspLightness) / (100 - cuspLightness);
  // An estimate of the most chroma of sRGB at this lightness: the sRGB slice of
  // a hue is close to a triangle of black, white and the cusp.
  const maxChroma =
    cuspChroma *
    (darker
      ? lightness / cuspLightness
      : (100 - lightness) / (100 - cuspLightness));
  const saturation = chroma / maxChroma;

  const parts: ColorNameParts = {
    lightness: lightnessWord(shade, SHADE_LIMITS),
    hue: hueWord(hue),
  };

  if (saturation < 0.4) {
    parts.chroma = 'grayish';
  } else if (saturation > 0.75 && chroma > 0.7 * cuspChroma) {
    parts.chroma = 'vibrant';
  }

  // Brown is a dark orange and is never vibrant. Pink is a very light red.
  if (parts.hue === 'orange' && lightness < 65) {
    parts.hue = 'brown';
    parts.chroma = parts.chroma === 'vibrant' ? undefined : parts.chroma;
  } else if (parts.hue === 'red' && parts.lightness === 'very_light') {
    parts.hue = 'pink';
  }

  return parts;
}

/** The hue word of the pure color of an HSV hue, for the hue slider. */
export function pureHueWord(hsvHue: number): ColorHueWord {
  return hueWord(pureHueOklch(hsvHue)[2]);
}

function word(strings: ColorPickerStrings, token?: ColorNameWord): string {
  return token ? strings[`color_picker_name_${token}`] : '';
}

/** The localized name of an sRGB color, such as "dark vibrant blue". */
export function formatColorName(rgb: RGB, strings: ColorPickerStrings): string {
  const { lightness, chroma, hue } = colorNameParts(rgb);

  return formatString(
    strings.color_picker_name_pattern,
    word(strings, lightness),
    word(strings, chroma),
    word(strings, hue)
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** A share (0-1) as a percentage in the number format of the locale. */
export function formatPercent(share: number, locale: string): string {
  return getNumberFormatter().formatNumber(share, locale, { style: 'percent' });
}

/** The name of a swatch color, with its alpha when it is not opaque. */
export function formatSwatchName(
  color: ColorModel,
  { resourceStrings, locale }: ColorPickerI18n
): string {
  const name = formatColorName(color.toRGB(), resourceStrings);

  return color.alpha < 1
    ? formatString(
        resourceStrings.color_picker_name_with_alpha,
        name,
        formatPercent(color.alpha, locale)
      )
    : name;
}

/** A value text and a color name, such as "120 degrees, green". */
export function formatValueWithName(
  value: string,
  name: string,
  strings: ColorPickerStrings
): string {
  return formatString(strings.color_picker_value_with_name, value, name);
}

/** The value text of the hue slider: the angle and the name of the hue. */
export function formatHueValue(
  hue: number,
  { resourceStrings, locale }: ColorPickerI18n
): string {
  const angle = getNumberFormatter().formatNumber(hue, locale, {
    style: 'unit',
    unit: 'degree',
    unitDisplay: 'long',
  });

  return formatValueWithName(
    angle,
    word(resourceStrings, pureHueWord(hue)),
    resourceStrings
  );
}

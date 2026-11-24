import {
  ColorPickerResourceStringsEN,
  type IColorPickerResourceStrings,
} from 'igniteui-i18n-core';
import type { I18nMixinConfig } from '#internals/mixins/i18n.js';
import type { ColorFormat } from '../types.js';

/**
 * The color picker strings that `igniteui-i18n-core` does not ship yet. Until
 * it does, every locale shows the English text.
 *
 * TODO: remove when `IColorPickerResourceStrings` has these keys.
 */
export interface IgcColorPickerPendingResourceStrings {
  /** The name of a no-color swatch without a label. */
  color_picker_no_color?: string;
  /** The name of the swatch list. */
  color_picker_swatches?: string;
  /** The text of the view switcher button of the gradient view. */
  color_picker_view_gradient?: string;
  /** The text of the view switcher button of the swatch view. */
  color_picker_view_swatches?: string;
  /** The name of the hex format in the format select. */
  color_picker_format_hex?: string;
  /** The name of the RGB format in the format select. */
  color_picker_format_rgb?: string;
  /** The name of the HSL format in the format select. */
  color_picker_format_hsl?: string;
  /** The name of the OKLCH format in the format select. */
  color_picker_format_oklch?: string;
  /** The name of the clear icon in input mode. */
  color_picker_clear?: string;
  /** The text of the Apply button of the confirm mode. */
  color_picker_apply?: string;
  /** The text of the Cancel button of the confirm mode. */
  color_picker_cancel?: string;
  /** The name of the preview button that restores the initial color. */
  color_picker_initial_color?: string;
  /** The name of the copy button after a copy. */
  color_picker_copied?: string;
  /** The name of the copy button after a failed copy. */
  color_picker_copy_failed?: string;
  /** The word order of a color name: `{0}` lightness, `{1}` chroma, `{2}` hue. */
  color_picker_name_pattern?: string;
  /** A color name with its alpha: `{0}` name, `{1}` percentage. */
  color_picker_name_with_alpha?: string;
  /** A slider value text with a color name: `{0}` value, `{1}` name. */
  color_picker_value_with_name?: string;
  /** The lightness word "very dark" of a color name. */
  color_picker_name_very_dark?: string;
  /** The lightness word "dark" of a color name. */
  color_picker_name_dark?: string;
  /** The lightness word "light" of a color name. */
  color_picker_name_light?: string;
  /** The lightness word "very light" of a color name. */
  color_picker_name_very_light?: string;
  /** The chroma word "grayish" of a color name. */
  color_picker_name_grayish?: string;
  /** The chroma word "vibrant" of a color name. */
  color_picker_name_vibrant?: string;
  /** The hue word "red" of a color name. */
  color_picker_name_red?: string;
  /** The hue word "orange" of a color name. */
  color_picker_name_orange?: string;
  /** The hue word "brown" of a color name: a dark orange. */
  color_picker_name_brown?: string;
  /** The hue word "yellow" of a color name. */
  color_picker_name_yellow?: string;
  /** The hue word "yellow green" of a color name. */
  color_picker_name_yellow_green?: string;
  /** The hue word "green" of a color name. */
  color_picker_name_green?: string;
  /** The hue word "cyan" of a color name. */
  color_picker_name_cyan?: string;
  /** The hue word "blue" of a color name. */
  color_picker_name_blue?: string;
  /** The hue word "purple" of a color name. */
  color_picker_name_purple?: string;
  /** The hue word "magenta" of a color name. */
  color_picker_name_magenta?: string;
  /** The hue word "pink" of a color name. */
  color_picker_name_pink?: string;
  /** The name "black" of a very dark color with almost no chroma. */
  color_picker_name_black?: string;
  /** The name "white" of a very light color with almost no chroma. */
  color_picker_name_white?: string;
  /** The hue word "gray" of a color with almost no chroma. */
  color_picker_name_gray?: string;
  /** The contrast ratio of the value over `contrastAgainst`: `{0}` ratio. */
  color_picker_contrast_ratio?: string;
  /** A WCAG level that the contrast ratio passes: `{0}` level name. */
  color_picker_contrast_pass?: string;
  /** A WCAG level that the contrast ratio fails: `{0}` level name. */
  color_picker_contrast_fail?: string;
  /** The name of the WCAG level AA (contrast 4.5:1). */
  color_picker_contrast_aa?: string;
  /** The name of the WCAG level AAA (contrast 7:1). */
  color_picker_contrast_aaa?: string;
  /** The name of the area marker in the OKLCH format. */
  color_picker_canvas_oklch_label?: string;
  /** The value text of the area marker in the OKLCH format: `{0}` lightness, `{1}` chroma. */
  color_picker_canvas_oklch_value?: string;
}

/** The resource strings of the color picker and the color panel. */
export type IgcColorPickerResourceStrings = IColorPickerResourceStrings &
  IgcColorPickerPendingResourceStrings;

/** The resolved strings: every key has a value. */
export type ColorPickerStrings = Required<IgcColorPickerResourceStrings>;

/** The strings and the locale of a color picker or a color panel. */
export interface ColorPickerI18n {
  readonly resourceStrings: ColorPickerStrings;
  readonly locale: string;
}

const PendingResourceStringsEN: Required<IgcColorPickerPendingResourceStrings> =
  {
    color_picker_no_color: 'No color',
    color_picker_swatches: 'Color swatches',
    color_picker_view_gradient: 'Gradient',
    color_picker_view_swatches: 'Swatches',
    color_picker_format_hex: 'Hex',
    color_picker_format_rgb: 'RGB',
    color_picker_format_hsl: 'HSL',
    color_picker_format_oklch: 'OKLCH',
    color_picker_clear: 'Clear color',
    color_picker_apply: 'Apply',
    color_picker_cancel: 'Cancel',
    color_picker_initial_color: 'Initial color',
    color_picker_copied: 'Copied',
    color_picker_copy_failed: 'Copy failed',
    color_picker_name_pattern: '{0} {1} {2}',
    color_picker_name_with_alpha: '{0}, alpha {1}',
    color_picker_value_with_name: '{0}, {1}',
    color_picker_name_very_dark: 'very dark',
    color_picker_name_dark: 'dark',
    color_picker_name_light: 'light',
    color_picker_name_very_light: 'very light',
    color_picker_name_grayish: 'grayish',
    color_picker_name_vibrant: 'vibrant',
    color_picker_name_red: 'red',
    color_picker_name_orange: 'orange',
    color_picker_name_brown: 'brown',
    color_picker_name_yellow: 'yellow',
    color_picker_name_yellow_green: 'yellow green',
    color_picker_name_green: 'green',
    color_picker_name_cyan: 'cyan',
    color_picker_name_blue: 'blue',
    color_picker_name_purple: 'purple',
    color_picker_name_magenta: 'magenta',
    color_picker_name_pink: 'pink',
    color_picker_name_black: 'black',
    color_picker_name_white: 'white',
    color_picker_name_gray: 'gray',
    color_picker_contrast_ratio: 'Contrast {0}:1',
    color_picker_contrast_pass: '{0} pass',
    color_picker_contrast_fail: '{0} fail',
    color_picker_contrast_aa: 'AA',
    color_picker_contrast_aaa: 'AAA',
    color_picker_canvas_oklch_label: 'Lightness and chroma',
    color_picker_canvas_oklch_value: 'Lightness {0}%, chroma {1}',
  };

/** The resource string of the name of each format in the format select. */
export const formatNameKeys = {
  hex: 'color_picker_format_hex',
  rgb: 'color_picker_format_rgb',
  hsl: 'color_picker_format_hsl',
  oklch: 'color_picker_format_oklch',
} as const satisfies Record<ColorFormat, keyof IgcColorPickerResourceStrings>;

/** The i18n configuration that the color picker and the color panel share. */
export const colorPickerI18nConfig: I18nMixinConfig<IgcColorPickerResourceStrings> =
  {
    defaultEN: {
      ...ColorPickerResourceStringsEN,
      ...PendingResourceStringsEN,
    },
  };

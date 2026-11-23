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
}

/** The resource strings of the color picker and the color panel. */
export type IgcColorPickerResourceStrings = IColorPickerResourceStrings &
  IgcColorPickerPendingResourceStrings;

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

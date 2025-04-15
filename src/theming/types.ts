import type { CSSResult } from 'lit';

export type Theme = 'material' | 'bootstrap' | 'indigo' | 'fluent';
export type ThemeVariant = 'light' | 'dark';

export type Themes = {
  light: {
    [K in Theme | 'shared']?: CSSResult;
  };
  dark: {
    [K in Theme | 'shared']?: CSSResult;
  };
};

export type ThemeChangedCallback = (theme: Theme) => unknown;

/**
 * A controller responsible for adopting various component themes;
 * See also {@link updateWhenThemeChanges}.
 */
export interface ThemeController {
  /**
   * The name of the currently adopted theme. See {@link Theme}.
   */
  theme: Theme;

  /**
   * Optional callback function to invoke when the theme is changed at runtime.
   */
  onThemeChanged?: ThemeChangedCallback;
}

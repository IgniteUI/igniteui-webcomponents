import type { CSSResult } from 'lit';

export type Theme = 'material' | 'bootstrap' | 'indigo' | 'fluent';
export type ThemeVariant = 'light' | 'dark';

export type Themes = {
  light: {
    [K in Theme]?: CSSResult;
  };
  dark: {
    [K in Theme]?: CSSResult;
  };
};

/**
 * A controller responsible for adopting various component themes;
 * See also {@link updateWhenThemeChanges}.
 */
export interface ThemeController {
  /**
   * The name of the currently adopted theme. See {@link Theme}.
   */
  theme: Theme;
}

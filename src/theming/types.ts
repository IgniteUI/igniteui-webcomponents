import { CSSResult } from 'lit';

export type Theme = 'material' | 'bootstrap' | 'indigo' | 'fluent';

export type Themes = {
  [K in Theme]?: CSSResult;
};

/**
 * A controller responsible for adopting various comopnent themes;
 * See also {@link updateWhenThemeChanges}.
 */
export interface ThemeController {
  /**
   * The name of the currently adopted theme. See {@link Theme}.
   */
  theme: Theme;
}

export interface ReactiveTheme {
  /**
   *  Provides the attached ThemeController to the component instance.
   *  Can be used to get the currently adopted theme name.
   *  See also {@link ThemeController}
   */
  themeAdopted(controller: ThemeController): void;
}

import type { CSSResult } from 'lit';

/**
 * Design system whose styles the components use.
 *
 * - `material` — Material Design.
 * - `bootstrap` — Bootstrap.
 * - `indigo` — Indigo Design.
 * - `fluent` — Fluent UI.
 */
export type Theme = 'material' | 'bootstrap' | 'indigo' | 'fluent';

/**
 * Color scheme of a {@link Theme}.
 *
 * - `light` — light backgrounds with dark text.
 * - `dark` — dark backgrounds with light text.
 */
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
export type ThemingControllerConfig = {
  themeChange?: ThemeChangedCallback;
};

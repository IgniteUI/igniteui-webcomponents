import type { CSSResult } from 'lit';

export type Theme = 'material' | 'bootstrap' | 'indigo' | 'fluent';
export type ThemeVariant = 'light' | 'dark';

export type Themes = Record<
  ThemeVariant,
  Partial<Record<Theme | 'shared', CSSResult>>
>;

export type ThemeChangedCallback = (theme: Theme) => unknown;
export type ThemingControllerConfig = {
  themeChange?: ThemeChangedCallback;
};

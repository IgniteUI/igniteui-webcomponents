import type { CSSResult } from 'lit';

/**
 * The theme names. The style build checks the component theme files against
 * the global theme entries, `src/styles/themes/light/<theme>.scss`.
 */
export const THEMES = ['material', 'bootstrap', 'indigo', 'fluent'] as const;

/** The theme variants. */
export const THEME_VARIANTS = ['light', 'dark'] as const;

export type Theme = (typeof THEMES)[number];
export type ThemeVariant = (typeof THEME_VARIANTS)[number];

/** The style sheets of a theme entry, in cascade order. */
export type ThemeStyles = CSSResult | readonly CSSResult[];

/**
 * The theme styles of a component, keyed by variant, then by theme. The
 * `shared` entry applies with every theme of its variant.
 */
export type ComponentThemes = Record<
  ThemeVariant,
  Partial<Record<Theme | 'shared', ThemeStyles>>
>;

/** A {@link ComponentThemes} map with one style sheet per entry. */
export type Themes = Record<
  ThemeVariant,
  Partial<Record<Theme | 'shared', CSSResult>>
>;

export type ThemeChangedCallback = (theme: Theme) => unknown;
export type ThemingControllerConfig = {
  themeChange?: ThemeChangedCallback;
};

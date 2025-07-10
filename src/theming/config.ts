import { isServer } from 'lit';
import {
  CHANGE_THEME_EVENT,
  type ChangeThemeEventDetail,
} from './theming-event.js';
import type { Theme, ThemeVariant } from './types.js';
import { getAllCssVariables } from './utils.js';

let theme: Theme;
let themeVariant: ThemeVariant;

/**
 * Dispatch an "igc-change-theme" event to `window` with the given detail.
 */
function dispatchThemingEvent(detail: ChangeThemeEventDetail): void {
  if (!isServer) {
    globalThis.dispatchEvent(new CustomEvent(CHANGE_THEME_EVENT, { detail }));
  }
}

function isOfTypeTheme(theme: string): theme is Theme {
  return ['bootstrap', 'material', 'indigo', 'fluent'].includes(theme);
}

function isOfTypeThemeVariant(variant: string): variant is ThemeVariant {
  return ['light', 'dark'].includes(variant);
}

export function getTheme() {
  if (!(theme && themeVariant)) {
    const cssVars = getAllCssVariables();
    const foundTheme = cssVars.igTheme;
    const foundVariant = cssVars.igThemeVariant;

    theme = isOfTypeTheme(foundTheme) ? foundTheme : 'bootstrap';
    themeVariant = isOfTypeThemeVariant(foundVariant) ? foundVariant : 'light';
  }

  return { theme, themeVariant };
}

export function setTheme(value: Theme, variant: ThemeVariant): void {
  theme = value;
  themeVariant = variant;
}

/**
 * Allows the global configuration of the active theme.
 *
 * Usage:
 *  ```ts
 *  import { configureTheme } from 'igniteui-webcomponents';
 *
 *  configureTheme('material', 'light');
 *  ```
 */
export function configureTheme(t: Theme, v: ThemeVariant = 'light'): void {
  if (isOfTypeTheme(t) && isOfTypeThemeVariant(v)) {
    setTheme(t, v);
    dispatchThemingEvent({ theme, themeVariant });
  }
}

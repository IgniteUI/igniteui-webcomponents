import { ChangeThemeEventDetail, CHANGE_THEME_EVENT } from './theming-event.js';
import type { Theme } from './types';
import { getAllCSSVariables } from './utils.js';

let theme: Theme;

/**
 * Dispatch an "igc-change-theme" event to `window` with the given detail.
 */
function dispatchThemingEvent(detail: ChangeThemeEventDetail) {
  window.dispatchEvent(new CustomEvent(CHANGE_THEME_EVENT, { detail }));
}

function isOfTypeTheme(theme: string): theme is Theme {
  return ['bootstrap', 'material', 'indigo', 'fluent'].includes(theme);
}

export const getTheme: () => Theme = () => {
  if (!theme) {
    const [_, t] =
      Object.entries(getAllCSSVariables()).find(([v]) => v === 'igcTheme') ||
      [];

    theme = t && isOfTypeTheme(t) ? (t as Theme) : 'bootstrap';
  }

  return theme;
};

export const setTheme = (value: Theme) => {
  theme = value;
};

/**
 * Allows the global configuration of the active theme.
 *
 * Usage:
 *  ```ts
 *  import { configureTheme } from 'igniteui-webcomponents';
 *
 *  configureTheme({ theme: 'material' });
 *  ```
 */
export const configureTheme = (t: Theme) => {
  if (isOfTypeTheme(t)) {
    setTheme(t);
  }

  dispatchThemingEvent({ theme });
};

import { ChangeThemeEventDetail, CHANGE_THEME_EVENT } from './theming-event';
import { Theme } from './types';

let theme: Theme = 'bootstrap';

type ThemeConfig = {
  theme: Theme;
  variant?: 'light' | 'dark';
};

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
export const configureTheme = ({ theme: t }: ThemeConfig) => {
  if (isOfTypeTheme(t)) {
    setTheme(t);
  }

  dispatchThemingEvent({ theme });
};

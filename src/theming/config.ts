import { isDefined } from '../components/common/util.js';
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
function dispatchThemingEvent(detail: ChangeThemeEventDetail) {
  if (isDefined(globalThis.dispatchEvent)) {
    globalThis.dispatchEvent(new CustomEvent(CHANGE_THEME_EVENT, { detail }));
  }
}

function isOfTypeTheme(theme: string): theme is Theme {
  return ['bootstrap', 'material', 'indigo', 'fluent'].includes(theme);
}

function isOfTypeThemeVariant(variant: string): variant is ThemeVariant {
  return ['light', 'dark'].includes(variant);
}

export const getTheme: () => {
  theme: Theme;
  themeVariant: ThemeVariant;
} = () => {
  if (!(theme && themeVariant)) {
    const [_theme, _variant] =
      Object.entries(getAllCssVariables()).filter(
        ([v]) => v === 'igTheme' || v === 'igThemeVariant'
      ) || [];

    theme =
      _theme?.[1] && isOfTypeTheme(_theme[1])
        ? (_theme[1] as Theme)
        : 'bootstrap';

    themeVariant =
      _variant?.[1] && isOfTypeThemeVariant(_variant[1])
        ? (_variant[1] as ThemeVariant)
        : 'light';
  }

  return { theme, themeVariant };
};

export const setTheme = (value: Theme, variant: ThemeVariant) => {
  theme = value;
  themeVariant = variant;
};

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
export const configureTheme = (t: Theme, v: ThemeVariant = 'light') => {
  if (isOfTypeTheme(t) && isOfTypeThemeVariant(v)) {
    setTheme(t, v);
  }

  dispatchThemingEvent({ theme, themeVariant });
};

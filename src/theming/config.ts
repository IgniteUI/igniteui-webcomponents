import { ChangeThemeEventDetail, CHANGE_THEME_EVENT } from './theming-event';
import { Theme } from './types';

let theme: Theme = 'bootstrap';
let installed = false;

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

export const configureTheme = (t: Theme) => {
  if (isOfTypeTheme(t)) {
    setTheme(t);
  }

  if (!installed) {
    installed = true;
  } else {
    dispatchThemingEvent({ theme });
  }
};

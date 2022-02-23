import { ChangeThemeEventDetail, CHANGE_THEME_EVENT } from './theming-event';
import { IgcTheme } from './types';

let theme: IgcTheme;

/**
 * Dispatch an "igc-change-theme" event to `window` with the given detail.
 */
function dispatchThemingEvent(detail: ChangeThemeEventDetail) {
  window.dispatchEvent(new CustomEvent(CHANGE_THEME_EVENT, { detail }));
}

export const getTheme: () => string = () => {
  return theme;
};

export const setTheme = (value: IgcTheme) => {
  theme = value;
};

export const configureTheme = (theme: IgcTheme) => {
  setTheme(theme);
  dispatchThemingEvent({ theme });
};

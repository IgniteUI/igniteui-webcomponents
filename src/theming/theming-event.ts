import type { Theme, ThemeVariant } from './types.js';

export const CHANGE_THEME_EVENT = 'igc-change-theme';
export const CHANGED_THEME_EVENT = 'igc-changed-theme';

declare global {
  interface WindowEventMap {
    [CHANGE_THEME_EVENT]: CustomEvent<ChangeThemeEventDetail>;
  }
}

/**
 * The possible details of the "igc-change-theme" event.
 */
export type ChangeThemeEventDetail = {
  theme: Theme;
  themeVariant: ThemeVariant;
};

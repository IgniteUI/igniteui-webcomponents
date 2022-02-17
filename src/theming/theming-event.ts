import { IgcTheme } from './types';

export const CHANGE_THEME_EVENT = 'igc-change-theme';

// Misfiring eslint rule
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface WindowEventMap {
    [CHANGE_THEME_EVENT]: CustomEvent<ChangeThemeEventDetail>;
  }
}

/**
 * The possible details of the "igc-change-theme" event.
 */
export type ChangeThemeEventDetail = ChangeTheme;

/**
 * Detail of the "igc-change-theme" event.
 *
 * A "ready" status can be followed only by a "loading" status.
 */
export interface ChangeTheme {
  theme: IgcTheme;
}

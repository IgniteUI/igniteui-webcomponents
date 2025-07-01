import { isServer } from 'lit';
import type { Theme, ThemeVariant } from './types.js';

class ThemeChangedEmitter extends EventTarget {
  constructor() {
    super();
    if (!isServer) {
      globalThis.addEventListener(CHANGE_THEME_EVENT, this);
    }
  }

  /** @internal */
  public handleEvent(): void {
    this.dispatchEvent(new CustomEvent(CHANGED_THEME_EVENT));
  }
}

export const CHANGE_THEME_EVENT = 'igc-change-theme';
export const CHANGED_THEME_EVENT = 'igc-changed-theme';
export const _themeChangedEmitter = new ThemeChangedEmitter();

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

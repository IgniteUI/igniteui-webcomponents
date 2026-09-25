import { isServer } from 'lit';
import {
  CHANGE_THEME_EVENT,
  CHANGED_THEME_EVENT,
  type ChangeThemeEventDetail,
} from './theming-event.js';
import type { Theme, ThemeVariant } from './types.js';

const THEMES = new Set<unknown>(['bootstrap', 'material', 'indigo', 'fluent']);
const THEME_VARIANTS = new Set<unknown>(['light', 'dark']);

let theme: Theme;
let themeVariant: ThemeVariant;

function isOfTypeTheme(value: unknown): value is Theme {
  return THEMES.has(value);
}

function isOfTypeThemeVariant(value: unknown): value is ThemeVariant {
  return THEME_VARIANTS.has(value);
}

function setTheme(value: Theme, variant: ThemeVariant): void {
  theme = value;
  themeVariant = variant;
}

/**
 * Relays "igc-change-theme" events from `window` to the theming controllers.
 * It also syncs the module state from the event detail, so an event from another
 * copy of the library changes the theme here too.
 */
class ThemeChangedEmitter extends EventTarget {
  constructor() {
    super();
    if (!isServer) {
      globalThis.addEventListener(CHANGE_THEME_EVENT, this);
    }
  }

  /** @internal */
  public handleEvent({ detail }: CustomEvent<ChangeThemeEventDetail>): void {
    if (
      isOfTypeTheme(detail?.theme) &&
      isOfTypeThemeVariant(detail?.themeVariant)
    ) {
      setTheme(detail.theme, detail.themeVariant);
      this.dispatchEvent(new CustomEvent(CHANGED_THEME_EVENT));
    }
  }
}

export const _themeChangedEmitter = new ThemeChangedEmitter();

export function getTheme(): ChangeThemeEventDetail {
  if (!(theme && themeVariant)) {
    const rootStyles = isServer
      ? undefined
      : getComputedStyle(document.documentElement);
    const foundTheme = rootStyles?.getPropertyValue('--ig-theme').trim();
    const foundVariant = rootStyles
      ?.getPropertyValue('--ig-theme-variant')
      .trim();

    theme = isOfTypeTheme(foundTheme) ? foundTheme : 'bootstrap';
    themeVariant = isOfTypeThemeVariant(foundVariant) ? foundVariant : 'light';
  }

  return { theme, themeVariant };
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
    // Also set by the emitter's window listener, but that listener does not exist on the server.
    setTheme(t, v);

    if (!isServer) {
      globalThis.dispatchEvent(
        new CustomEvent(CHANGE_THEME_EVENT, {
          detail: { theme, themeVariant },
        })
      );
    }
  }
}

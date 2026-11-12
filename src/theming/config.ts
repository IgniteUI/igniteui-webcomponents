import { isServer } from 'lit';
import {
  CHANGE_THEME_EVENT,
  type ChangeThemeEventDetail,
} from './theming-event.js';
import {
  THEME_VARIANTS,
  THEMES,
  type Theme,
  type ThemeVariant,
} from './types.js';

const themes = new Set<unknown>(THEMES);
const variants = new Set<unknown>(THEME_VARIANTS);

let theme: Theme;
let themeVariant: ThemeVariant;

function isOfTypeTheme(value: unknown): value is Theme {
  return themes.has(value);
}

function isOfTypeThemeVariant(value: unknown): value is ThemeVariant {
  return variants.has(value);
}

function setTheme(value: Theme, variant: ThemeVariant): void {
  theme = value;
  themeVariant = variant;
}

/**
 * The theming controllers that follow the global theme. Not an `EventTarget`:
 * Chromium scans all listeners on each add and remove.
 */
export const _globalThemeListeners = new Set<{ globalThemeChanged(): void }>();

/**
 * Relays "igc-change-theme" events from `window` to the theming controllers.
 * It also syncs the module state from the event detail, so an event from another
 * copy of the library changes the theme here too.
 */
function relayThemeChange({
  detail,
}: CustomEvent<ChangeThemeEventDetail>): void {
  if (
    isOfTypeTheme(detail?.theme) &&
    isOfTypeThemeVariant(detail?.themeVariant)
  ) {
    // A repeated call or another copy of the library may send the active theme again.
    if (detail.theme === theme && detail.themeVariant === themeVariant) {
      return;
    }

    setTheme(detail.theme, detail.themeVariant);

    for (const listener of _globalThemeListeners) {
      listener.globalThemeChanged();
    }
  }
}

if (!isServer) {
  globalThis.addEventListener(CHANGE_THEME_EVENT, relayThemeChange);
}

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
    if (isServer) {
      // On the client, the window listener sets the state.
      setTheme(t, v);
    } else {
      globalThis.dispatchEvent(
        new CustomEvent(CHANGE_THEME_EVENT, {
          detail: { theme: t, themeVariant: v },
        })
      );
    }
  }
}

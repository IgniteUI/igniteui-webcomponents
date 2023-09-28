import {
  adoptStyles,
  css,
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
  ReactiveElement,
} from 'lit';
import { getTheme } from './config.js';
import { CHANGE_THEME_EVENT } from './theming-event.js';
import type { Theme, ThemeController, Themes, ThemeVariant } from './types.js';

class ThemeEventListeners {
  private readonly listeners = new Set<Function>();

  public add(listener: Function) {
    window.addEventListener(CHANGE_THEME_EVENT, this);
    this.listeners.add(listener);
  }

  public remove(listener: Function) {
    this.listeners.delete(listener);
    if (this.listeners.size < 1) {
      window.removeEventListener(CHANGE_THEME_EVENT, this);
    }
  }

  public handleEvent = () => {
    for (const listener of this.listeners) {
      listener();
    }
  };
}

const _themingEventListeners = new ThemeEventListeners();

class ThemingController implements ReactiveController, ThemeController {
  private themes: Themes;
  private host: ReactiveControllerHost & ReactiveElement;
  public theme!: Theme;
  public themeVariant!: ThemeVariant;

  constructor(host: ReactiveControllerHost & ReactiveElement, themes: Themes) {
    this.host = host;
    this.themes = themes;
  }

  public hostConnected() {
    this.adoptStyles();
    _themingEventListeners.add(this.themeChanged);
  }

  public hostDisconnected() {
    _themingEventListeners.remove(this.themeChanged);
  }

  protected adoptStyles() {
    const { theme, themeVariant } = getTheme();
    this.theme = theme;
    this.themeVariant = themeVariant;

    const ctor = this.host.constructor as typeof LitElement;

    const [_, cssResult] =
      Object.entries(this.themes[themeVariant]).find(
        ([name]) => name === this.theme
      ) ?? [];

    adoptStyles(this.host.shadowRoot as ShadowRoot, [
      ...ctor.elementStyles,
      cssResult ?? css``,
    ]);
  }

  private themeChanged = () => {
    this.adoptStyles();
    this.host.requestUpdate();
  };
}

const _updateWhenThemeChanges = (
  host: ReactiveControllerHost & ReactiveElement,
  themes: Themes,
  exposeTheme?: boolean
) => {
  const controller = new ThemingController(host, themes);
  host.addController(controller);

  if (exposeTheme) {
    Object.defineProperty(host, themeSymbol, {
      get() {
        return controller.theme;
      },
      configurable: true,
      enumerable: false,
    });
  }

  return controller;
};

export const updateWhenThemeChanges: typeof _updateWhenThemeChanges & {
  _THEMING_CONTROLLER_FN_?: never;
} = _updateWhenThemeChanges;

export const themeSymbol = Symbol('Current active theme');

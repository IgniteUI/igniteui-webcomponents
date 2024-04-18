import {
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
  type ReactiveElement,
  adoptStyles,
  css,
} from 'lit';

import { getTheme } from './config.js';
import { CHANGE_THEME_EVENT } from './theming-event.js';
import type { Theme, ThemeController, ThemeVariant, Themes } from './types.js';

class ThemeEventListeners {
  private readonly listeners = new Set<Function>();

  public add(listener: Function) {
    globalThis.addEventListener(CHANGE_THEME_EVENT, this);
    this.listeners.add(listener);
  }

  public remove(listener: Function) {
    this.listeners.delete(listener);
    if (this.listeners.size < 1) {
      globalThis.removeEventListener(CHANGE_THEME_EVENT, this);
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
    const stylesheets = Object.entries(this.themes[themeVariant]);

    const [_unused, sharedStyles] =
      stylesheets.find(([name]) => name === 'shared') ?? [];
    const [_, themeStyles] =
      stylesheets.find(([name]) => name === this.theme) ?? [];

    adoptStyles(this.host.shadowRoot as ShadowRoot, [
      ...ctor.elementStyles,
      sharedStyles ?? css``,
      themeStyles ?? css``,
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

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
import type {
  Theme,
  ThemeChangedCallback,
  ThemeController,
  ThemeVariant,
  Themes,
} from './types.js';

type ThemeCallback = () => void;

class ThemeEventListeners {
  private readonly listeners = new Set<ThemeCallback>();

  public add(listener: ThemeCallback) {
    globalThis.addEventListener(CHANGE_THEME_EVENT, this);
    this.listeners.add(listener);
  }

  public remove(listener: ThemeCallback) {
    this.listeners.delete(listener);
    if (this.listeners.size < 1) {
      globalThis.removeEventListener(CHANGE_THEME_EVENT, this);
    }
  }

  public handleEvent() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

const _themeListeners = new ThemeEventListeners();

/* blazorSuppress */
export class ThemingController implements ReactiveController, ThemeController {
  private themes: Themes;
  private host: ReactiveControllerHost & ReactiveElement;

  public theme!: Theme;
  public themeVariant!: ThemeVariant;
  public onThemeChanged?: ThemeChangedCallback;

  constructor(host: ReactiveControllerHost & ReactiveElement, themes: Themes) {
    this.host = host;
    this.themes = themes;
  }

  public hostConnected() {
    this.themeChanged();
    _themeListeners.add(this.themeChanged);
  }

  public hostDisconnected() {
    _themeListeners.remove(this.themeChanged);
  }

  private getStyles() {
    const styleSheets = Object.entries(this.themes[this.themeVariant]);
    const styles = { shared: css``, theme: css`` };

    for (const [name, sheet] of styleSheets) {
      if (name === 'shared') {
        styles.shared = sheet;
      }
      if (name === this.theme) {
        styles.theme = sheet;
      }
    }

    return styles;
  }

  protected adoptStyles() {
    const { theme, themeVariant } = getTheme();
    this.theme = theme;
    this.themeVariant = themeVariant;

    const ctor = this.host.constructor as typeof LitElement;
    const { shared, theme: _theme } = this.getStyles();

    adoptStyles(this.host.shadowRoot!, [...ctor.elementStyles, shared, _theme]);
  }

  private themeChanged: ThemeCallback = () => {
    this.adoptStyles();
    this.onThemeChanged?.call(this.host, this.theme);
    this.host.requestUpdate();
  };
}

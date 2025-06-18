import {
  adoptStyles,
  css,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
  type ReactiveElement,
} from 'lit';

import { getTheme } from './config.js';
import { _themeChangedEmitter, CHANGED_THEME_EVENT } from './theming-event.js';
import type {
  Theme,
  ThemeChangedCallback,
  ThemeController,
  Themes,
  ThemeVariant,
} from './types.js';

class ThemingController implements ReactiveController, ThemeController {
  private themes: Themes;
  private host: ReactiveControllerHost & ReactiveElement;

  public theme!: Theme;
  public themeVariant!: ThemeVariant;
  public onThemeChanged?: ThemeChangedCallback;

  constructor(host: ReactiveControllerHost & ReactiveElement, themes: Themes) {
    this.themes = themes;
    this.host = host;
    this.host.addController(this);
  }

  public hostConnected() {
    this.themeChanged();
    _themeChangedEmitter.addEventListener(CHANGED_THEME_EVENT, this);
  }

  public hostDisconnected() {
    _themeChangedEmitter.removeEventListener(CHANGED_THEME_EVENT, this);
  }

  public handleEvent() {
    this.themeChanged();
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

  private themeChanged() {
    this.adoptStyles();
    this.onThemeChanged?.call(this.host, this.theme);
    this.host.requestUpdate();
  }
}

export function createThemeController(
  host: ReactiveControllerHost & ReactiveElement,
  themes: Themes
) {
  return new ThemingController(host, themes);
}

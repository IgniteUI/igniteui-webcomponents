import {
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
  type ReactiveElement,
  adoptStyles,
  css,
} from 'lit';

import { getTheme } from './config.js';
import { CHANGED_THEME_EVENT, _themeChangedEmitter } from './theming-event.js';
import type {
  Theme,
  ThemeVariant,
  Themes,
  ThemingControllerConfig,
} from './types.js';

class ThemingController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & ReactiveElement;
  private readonly _themes: Themes;
  private readonly _options?: ThemingControllerConfig;

  private _theme: Theme = 'bootstrap';
  private _variant: ThemeVariant = 'light';

  public get theme(): Theme {
    return this._theme;
  }

  constructor(
    host: ReactiveControllerHost & ReactiveElement,
    themes: Themes,
    config?: ThemingControllerConfig
  ) {
    this._host = host;
    this._themes = themes;
    this._options = config;
    this._host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    this._handleThemeChanged();
    _themeChangedEmitter.addEventListener(CHANGED_THEME_EVENT, this);
  }

  /** @internal */
  public hostDisconnected(): void {
    _themeChangedEmitter.removeEventListener(CHANGED_THEME_EVENT, this);
  }

  /** @internal */
  public handleEvent(): void {
    this._handleThemeChanged();
  }

  private _getStyles() {
    const props = this._themes[this._variant];
    const styles = { shared: css``, theme: css`` };

    for (const [name, sheet] of Object.entries(props)) {
      if (name === 'shared') {
        styles.shared = sheet;
      }
      if (name === this.theme) {
        styles.theme = sheet;
      }
    }

    return styles;
  }

  protected _adoptStyles(): void {
    const { theme: currentTheme, themeVariant } = getTheme();
    this._theme = currentTheme;
    this._variant = themeVariant;

    const ctor = this._host.constructor as typeof LitElement;
    const { shared, theme } = this._getStyles();

    adoptStyles(this._host.shadowRoot!, [...ctor.elementStyles, shared, theme]);
  }

  private _handleThemeChanged(): void {
    this._adoptStyles();
    this._options?.themeChange?.call(this._host, this._theme);
    this._host.requestUpdate();
  }
}

export function addThemingController(
  host: ReactiveControllerHost & ReactiveElement,
  themes: Themes,
  config?: ThemingControllerConfig
): ThemingController {
  return new ThemingController(host, themes, config);
}

export type { ThemingController };

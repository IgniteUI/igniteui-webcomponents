import { ContextConsumer } from '@lit/context';
import {
  adoptStyles,
  css,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
  type ReactiveElement,
} from 'lit';

import { getTheme } from './config.js';
import { themeContext } from './context.js';
import { _themeChangedEmitter, CHANGED_THEME_EVENT } from './theming-event.js';
import type {
  Theme,
  Themes,
  ThemeVariant,
  ThemingControllerConfig,
} from './types.js';

type ThemeProviderSource = 'uninitialized' | 'context' | 'global';

class ThemingController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & ReactiveElement;
  private readonly _themes: Themes;
  private readonly _options?: ThemingControllerConfig;
  private readonly _contextConsumer: ContextConsumer<
    typeof themeContext,
    ReactiveElement
  >;

  private _theme: Theme = 'bootstrap';
  private _variant: ThemeVariant = 'light';
  private _themeSource: ThemeProviderSource = 'uninitialized';

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

    this._contextConsumer = new ContextConsumer(this._host, {
      context: themeContext,
      callback: (value) => {
        if (value) {
          this._applyContextTheme(value);
        }
      },
      subscribe: true,
    });
  }

  /** @internal */
  public hostConnected(): void {
    // Check if we have a context value immediately when connected usually after the parent provider
    // is already in the DOM (i.e. creation of the component after initial render)
    const contextValue = this._contextConsumer.value;

    if (contextValue) {
      this._applyContextTheme(contextValue);
    } else {
      this._applyGlobalTheme();
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    if (this._themeSource === 'global') {
      _themeChangedEmitter.removeEventListener(CHANGED_THEME_EVENT, this);
    }
  }

  /** @internal */
  public handleEvent(): void {
    // Only handle global theme change events
    if (this._themeSource === 'global') {
      this._applyGlobalTheme();
    }
  }

  private _applyContextTheme(contextValue: {
    theme: Theme;
    variant: ThemeVariant;
  }): void {
    // If we were using global theme, unsubscribe from global events
    if (this._themeSource === 'global') {
      _themeChangedEmitter.removeEventListener(CHANGED_THEME_EVENT, this);
    }

    this._themeSource = 'context';
    this._theme = contextValue.theme;
    this._variant = contextValue.variant;

    this._adoptStyles();
    this._options?.themeChange?.call(this._host, this._theme);
    this._host.requestUpdate();
  }

  private _applyGlobalTheme(): void {
    // Subscribe to global events only on first initialization
    if (this._themeSource === 'uninitialized') {
      _themeChangedEmitter.addEventListener(CHANGED_THEME_EVENT, this);
    }

    this._themeSource = 'global';

    const { theme: currentTheme, themeVariant } = getTheme();
    this._theme = currentTheme;
    this._variant = themeVariant;

    this._adoptStyles();
    this._options?.themeChange?.call(this._host, this._theme);
    this._host.requestUpdate();
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
    const ctor = this._host.constructor as typeof LitElement;
    const { shared, theme } = this._getStyles();

    adoptStyles(this._host.shadowRoot!, [...ctor.elementStyles, shared, theme]);
  }
}

/**
 * Adds theming controller to the host component.
 */
export function addThemingController(
  host: ReactiveControllerHost & ReactiveElement,
  themes: Themes,
  config?: ThemingControllerConfig
): ThemingController {
  return new ThemingController(host, themes, config);
}

export type { ThemingController };

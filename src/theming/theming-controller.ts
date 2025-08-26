import {
  adoptStyles,
  css,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
  type ReactiveElement,
} from 'lit';
import { createAbortHandle } from '../components/common/abort-handler.js';
import { getTheme } from './config.js';
import { _themeChangedEmitter, CHANGED_THEME_EVENT } from './theming-event.js';
import type {
  Theme,
  ThemeChangedCallback,
  Themes,
  ThemeVariant,
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

type LazyThemes = {
  light: {
    [K in Theme | 'shared']?: string;
  };
  dark: {
    [K in Theme | 'shared']?: string;
  };
};

type NewThemingControllerConfig = {
  themes: LazyThemes;
  onThemeChange?: ThemeChangedCallback;
};

class NewThemingController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & ReactiveElement;
  private readonly _abortHandler = createAbortHandle();
  private readonly _options: NewThemingControllerConfig;

  private _theme: Theme = 'bootstrap';
  private _variant: ThemeVariant = 'light';

  public get theme(): Theme {
    return this._theme;
  }

  public get variant(): ThemeVariant {
    return this._variant;
  }

  constructor(
    host: ReactiveControllerHost & ReactiveElement,
    options: NewThemingControllerConfig
  ) {
    this._host = host;
    this._options = options;
    this._host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    this._handleThemeChange();
    _themeChangedEmitter.addEventListener(CHANGED_THEME_EVENT, this, {
      signal: this._abortHandler.signal,
    });
  }

  /** @internal */
  public hostDisconnected(): void {
    this._abortHandler.abort();
  }

  public handleEvent(): void {
    this._handleThemeChange();
  }

  private async _handleThemeChange() {
    await this._adoptStyles();
    this._options.onThemeChange?.call(this._host, this._theme);
    this._host.requestUpdate();
  }

  private async _adoptStyles() {
    const current = getTheme();
    this._theme = current.theme;
    this._variant = current.themeVariant;
    const whatever = this._options.themes[this._variant];

    const newStyles = { shared: css``, theme: css`` };

    // Instead of loading a `CSSResult` from the matching dynamic import path
    // load the CSS payload as a string and create a style sheet:

    // const { styles } = await import(path);
    // const sheet = new CSSStyleSheet();
    // const sheet.replace(styles);
    // newStyles.shared = sheet;

    // Another approach is to use Lit's `unsafeCSS` to get the `CSSResult` object.

    for (const [name, path] of Object.entries(whatever ?? {})) {
      if (name === 'shared') {
        // !! Potential performance hit:
        // While dynamic imports are aggressively cached by the browser until the import
        // is resolved subsequent calls to this function will queue more requests - for example,
        // having a dozen inputs in a form, on initial render each input `connectedCallback` invokes
        // this function until a one of them resolves.

        // If the dynamic approach is successful then this could be optimized by having a cache, which checks
        // whether a given element has a pending/resolved promise for a given theme-variant combination and
        // waits/resolves on it, thus minimizing the number of requests created.

        const { styles } = await import(path);
        newStyles.shared = styles;
      }
      if (name === this._theme) {
        const { styles } = await import(path);
        newStyles.theme = styles;
      }
    }

    const ctor = this._host.constructor as typeof LitElement;
    adoptStyles(this._host.shadowRoot!, [
      ...ctor.elementStyles,
      newStyles.shared,
      newStyles.theme,
    ]);
  }
}

export function addDynamicTheme(
  host: ReactiveControllerHost & ReactiveElement,
  options: NewThemingControllerConfig
): NewThemingController {
  return new NewThemingController(host, options);
}

export type { NewThemingController };

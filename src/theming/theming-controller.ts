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

/**
 * A reactive controller that manages theme adoption for a Lit host element.
 *
 * It resolves the active theme from one of two sources, in order of priority:
 *
 * 1. **Context** — provided by an ancestor `<igc-theme-provider>` element via the Lit context API.
 * 2. **Global** — the application-wide theme set via `configureTheme()`.
 *
 * When a context provider is present, the controller subscribes to its updates
 * and stops listening to global theme change events. When the host element is
 * disconnected and reconnected outside a provider, it automatically falls back
 * to the global theme.
 *
 * Theme styles are applied directly to the host's shadow root via `adoptStyles`
 * every time the active theme or variant changes.
 *
 * @example
 * Basic usage — typically created via {@link addThemingController}:
 * ```typescript
 * import { addThemingController } from '../../theming/theming-controller.js';
 * import { all } from './themes/themes.js';
 *
 * export default class IgcMyComponent extends LitElement {
 *   constructor() {
 *     super();
 *     addThemingController(this, all);
 *   }
 * }
 * ```
 *
 * @example
 * Accessing the current theme and variant at runtime:
 * ```typescript
 * export default class IgcMyComponent extends LitElement {
 *   private readonly _themes = addThemingController(this, all);
 *
 *   protected override render() {
 *     // Conditionally render based on active theme
 *     return this._themes.variant === 'dark'
 *       ? html`<div class="dark-layout"></div>`
 *       : html`<div class="light-layout"></div>`;
 *   }
 * }
 * ```
 */
class ThemingController implements ReactiveController {
  //#region Internal state

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

  //#endregion

  //#region Public properties

  /** Gets the current theme. */
  public get theme(): Theme {
    return this._theme;
  }

  /** Gets the current theme variant. */
  public get variant(): ThemeVariant {
    return this._variant;
  }

  //#endregion

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

  //#region ReactiveController implementation

  /** @internal */
  public hostConnected(): void {
    // Check if we have a context value immediately when connected usually after the parent provider
    // is already in the DOM (i.e. creation of the component after initial render)
    const contextValue = this._contextConsumer.value;
    contextValue
      ? this._applyContextTheme(contextValue)
      : this._applyGlobalTheme();
  }

  /** @internal */
  public hostDisconnected(): void {
    if (this._themeSource === 'global') {
      _themeChangedEmitter.removeEventListener(CHANGED_THEME_EVENT, this);
    }
  }

  //#endregion

  //#region Event handling

  /** @internal */
  public handleEvent(): void {
    if (this._themeSource === 'global') {
      this._applyGlobalTheme();
    }
  }

  //#endregion

  //#region Internal methods

  private _applyContextTheme(contextValue: {
    theme: Theme;
    variant: ThemeVariant;
  }): void {
    // If we were using global theme, unsubscribe from global events
    if (this._themeSource === 'global') {
      _themeChangedEmitter.removeEventListener(CHANGED_THEME_EVENT, this);
    }

    this._themeSource = 'context';
    this._applyTheme(contextValue.theme, contextValue.variant);
  }

  private _applyGlobalTheme(): void {
    // Subscribe to global events only on first initialization
    if (this._themeSource === 'uninitialized') {
      _themeChangedEmitter.addEventListener(CHANGED_THEME_EVENT, this);
    }

    const { theme, themeVariant } = getTheme();

    this._themeSource = 'global';
    this._applyTheme(theme, themeVariant);
  }

  private _applyTheme(theme: Theme, variant: ThemeVariant): void {
    this._theme = theme;
    this._variant = variant;

    this._adoptStyles();
    this._options?.themeChange?.call(this._host, this._theme);
    this._host.requestUpdate();
  }

  private _adoptStyles(): void {
    const ctor = this._host.constructor as typeof LitElement;
    const shared = this._themes[this._variant].shared || css``;
    const theme = this._themes[this._variant][this._theme] || css``;

    adoptStyles(this._host.shadowRoot!, [...ctor.elementStyles, shared, theme]);
  }

  //#endregion
}

/**
 * Creates and attaches a {@link ThemingController} to the given host element.
 *
 * This is the preferred way to add theming support to a component. The controller
 * is registered with the host's reactive controller lifecycle and automatically
 * resolves the active theme from an ancestor `<igc-theme-provider>` context or
 * falls back to the application-wide theme set via `configureTheme()`.
 *
 * @param host - The Lit element that will host the controller.
 * @param themes - The theme styles map containing `light` and `dark` variant entries,
 *   each keyed by theme name (`bootstrap`, `material`, `fluent`, `indigo`) and
 *   an optional `shared` entry applied regardless of theme.
 * @param config - Optional configuration.
 * @param config.themeChange - Callback invoked on the host whenever the active theme changes.
 *
 * @returns The created {@link ThemingController} instance.
 *
 * @example
 * Minimal setup in a component constructor:
 * ```typescript
 * import { addThemingController } from '../../theming/theming-controller.js';
 * import { all } from './themes/themes.js';
 *
 * export default class IgcMyComponent extends LitElement {
 *   constructor() {
 *     super();
 *     addThemingController(this, all);
 *   }
 * }
 * ```
 *
 * @example
 * With a `themeChange` callback and retained controller reference:
 * ```typescript
 * export default class IgcMyComponent extends LitElement {
 *   private readonly _themingController = addThemingController(this, all, {
 *     themeChange(theme) {
 *       // Called on `this` (the host) whenever the theme switches
 *       console.log(`Theme changed to: ${theme}`);
 *     },
 *   });
 *
 *   protected override render() {
 *     return html`<span>Current variant: ${this._themingController.variant}</span>`;
 *   }
 * }
 * ```
 */
export function addThemingController(
  host: ReactiveControllerHost & ReactiveElement,
  themes: Themes,
  config?: ThemingControllerConfig
): ThemingController {
  return new ThemingController(host, themes, config);
}

export type { ThemingController };

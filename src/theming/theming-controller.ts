import { ContextEvent } from '@lit/context';
import {
  adoptStyles,
  type ReactiveController,
  type ReactiveControllerHost,
  type ReactiveElement,
} from 'lit';

import { sheetForDocument } from '#internals/utils/dom.js';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import { _globalThemeListeners, getTheme } from './config.js';
import { type ThemeContext, themeContext } from './context.js';
import type {
  ComponentThemes,
  Theme,
  ThemeVariant,
  ThemingControllerConfig,
} from './types.js';

type ThemeProviderSource = 'uninitialized' | 'context' | 'global';

type ElementClass = typeof ReactiveElement;

/**
 * The sheets that the instances of an element class adopt, keyed by the theme
 * map, the class and `variant:theme`. The instances share them, so a theme
 * resolves once per class.
 */
const resolvedSheets = new WeakMap<
  ComponentThemes,
  WeakMap<ElementClass, Map<string, ReadonlySet<CSSStyleSheet>>>
>();

/** The copies of the resolved sheets for the documents of other windows. */
const documentSheets = new WeakMap<
  ReadonlySet<CSSStyleSheet>,
  WeakMap<Document, ReadonlySet<CSSStyleSheet>>
>();

/** Set by the first theme provider. Until then, nothing can answer a request. */
let themeContextEnabled = false;

/**
 * Called by a theme provider. The first call also sends the context request
 * of the components that connected before the provider.
 */
export function enableThemeContext(): void {
  if (themeContextEnabled) {
    return;
  }

  themeContextEnabled = true;

  // After the provider connects and listens.
  queueMicrotask(() => {
    for (const listener of Array.from(_globalThemeListeners)) {
      listener.requestThemeContext();
    }
  });
}

/** The sheets of a controller that has adopted nothing yet. */
const NO_SHEETS: ReadonlySet<CSSStyleSheet> = new Set();

/** Whether `adopted` starts with `sheets`, in their order. */
function adoptsFirst(
  adopted: readonly CSSStyleSheet[],
  sheets: ReadonlySet<CSSStyleSheet>
): boolean {
  let index = 0;

  for (const sheet of sheets) {
    if (adopted[index++] !== sheet) {
      return false;
    }
  }

  return true;
}

/** Returns the element styles of `ctor` followed by the shared and the theme styles. */
function resolveSheets(
  ctor: ElementClass,
  themes: ComponentThemes,
  theme: Theme,
  variant: ThemeVariant
): ReadonlySet<CSSStyleSheet> {
  const perClass = getOrInsertComputed(
    resolvedSheets,
    themes,
    () => new WeakMap()
  );
  const perTheme = getOrInsertComputed(perClass, ctor, () => new Map());

  return getOrInsertComputed(perTheme, `${variant}:${theme}`, () => {
    const { shared, [theme]: themed } = themes[variant];

    return new Set(
      [...ctor.elementStyles, ...[shared, themed].flat()]
        .filter((style) => style !== undefined)
        .map((style) =>
          style instanceof CSSStyleSheet ? style : style.styleSheet!
        )
    );
  });
}

/**
 * A reactive controller that manages theme adoption for a Lit host element.
 *
 * It resolves the active theme from one of two sources, in order of priority:
 *
 * 1. **Context** - provided by an ancestor theme provider component via the Lit context API.
 * 2. **Global** - the application-wide theme set via `configureTheme()`.
 *
 * When a context provider is present, the controller subscribes to its updates
 * and stops following the global theme. When the host element is
 * disconnected and reconnected outside a provider, it automatically falls back
 * to the global theme.
 *
 * Theme styles are applied directly to the host's shadow root via `adoptStyles`
 * every time the active theme or variant changes. The controller replaces only
 * its own sheets and keeps the sheets that other code adopted, after its own.
 */
class ThemingController implements ReactiveController {
  //#region Internal state

  private readonly _host: ReactiveControllerHost & ReactiveElement;
  private readonly _themes: ComponentThemes;
  private readonly _options?: ThemingControllerConfig;

  private _theme: Theme = 'bootstrap';
  private _variant: ThemeVariant = 'light';
  private _themeSource: ThemeProviderSource = 'uninitialized';

  /** Whether the host has read the theme, so a theme change must update it. */
  private _observed = false;

  /** The element and theme sheets that this controller adopted last. */
  private _sheets = NO_SHEETS;

  /** Ends the subscription to the theme provider that answered last. */
  private _unsubscribe?: () => void;

  /** The context callback. A stable function, as a provider dedupes by it. */
  private _contextCallback?: (
    value: ThemeContext,
    unsubscribe?: () => void
  ) => void;

  //#endregion

  //#region Public properties

  /** Gets the current theme. */
  public get theme(): Theme {
    this._observed = true;
    return this._theme;
  }

  /** Gets the current theme variant. */
  public get variant(): ThemeVariant {
    this._observed = true;
    return this._variant;
  }

  //#endregion

  constructor(
    host: ReactiveControllerHost & ReactiveElement,
    themes: ComponentThemes,
    config?: ThemingControllerConfig
  ) {
    this._host = host;
    this._themes = themes;
    this._options = config;

    this._host.addController(this);
  }

  //#region ReactiveController implementation

  /** @internal */
  public hostConnected(): void {
    // A connected provider answers at once, before the global fallback below.
    if (themeContextEnabled) {
      this.requestThemeContext();
    }

    if (this._themeSource === 'uninitialized') {
      _globalThemeListeners.add(this);
      this._applyGlobalTheme();
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    this._unsubscribe?.();
    this._unsubscribe = undefined;
    _globalThemeListeners.delete(this);

    // Re-resolve the theme source on reconnect, which may be in another part of the tree.
    this._themeSource = 'uninitialized';
  }

  //#endregion

  //#region Global theme

  /** @internal */
  public requestThemeContext(): void {
    this._contextCallback ??= (value, unsubscribe) => {
      // Another answer means another provider.
      if (this._unsubscribe !== unsubscribe) {
        this._unsubscribe?.();
        this._unsubscribe = unsubscribe;
      }
      if (value) {
        this._applyContextTheme(value);
      }
    };

    this._host.dispatchEvent(
      new ContextEvent(themeContext, this._host, this._contextCallback, true)
    );
  }

  /** @internal */
  public globalThemeChanged(): void {
    if (this._themeSource === 'global') {
      this._applyGlobalTheme();
    }
  }

  //#endregion

  //#region Internal methods

  private _applyContextTheme({ theme, variant }: ThemeContext): void {
    _globalThemeListeners.delete(this);
    this._themeSource = 'context';
    this._applyTheme(theme, variant);
  }

  private _applyGlobalTheme(): void {
    const { theme, themeVariant } = getTheme();

    this._themeSource = 'global';
    this._applyTheme(theme, themeVariant);
  }

  private _applyTheme(theme: Theme, variant: ThemeVariant): void {
    const changed =
      this._sheets === NO_SHEETS ||
      theme !== this._theme ||
      variant !== this._variant;

    this._theme = theme;
    this._variant = variant;
    this._adoptStyles();

    // A reconnect in the same theme changes nothing that the host renders.
    if (!changed) {
      return;
    }

    this._options?.themeChange?.call(this._host, this._theme);

    // A host that never reads the theme renders the same output for every theme.
    if (this._observed || this._options?.themeChange) {
      this._host.requestUpdate();
    }
  }

  private _adoptStyles(): void {
    const root = this._host.shadowRoot!;
    const doc = root.ownerDocument;
    const own = doc === globalThis.document;

    // The document of a removed iframe has no window to adopt into.
    if (!(own || doc.defaultView)) {
      return;
    }

    const resolved = resolveSheets(
      this._host.constructor as ElementClass,
      this._themes,
      this._theme,
      this._variant
    );

    // A host moved to the document of another window adopts copies.
    const sheets = own
      ? resolved
      : getOrInsertComputed(
          getOrInsertComputed(documentSheets, resolved, () => new WeakMap()),
          doc,
          () =>
            new Set(
              Array.from(resolved, (sheet) => sheetForDocument(sheet, doc)!)
            )
        );

    // Adopted already; the check still repairs a root whose sheets were replaced.
    if (
      sheets === this._sheets &&
      adoptsFirst(root.adoptedStyleSheets, sheets)
    ) {
      return;
    }

    // The sheets that other code adopted, such as a virtual scroll or a highlight.
    const foreign = root.adoptedStyleSheets.filter(
      (sheet) => !(sheets.has(sheet) || this._sheets.has(sheet))
    );

    // Lit's `adoptStyles` accepts only the sheets of this window.
    if (own) {
      adoptStyles(root, [...sheets, ...foreign]);
    } else {
      root.adoptedStyleSheets = [...sheets, ...foreign];
    }

    this._sheets = sheets;
  }

  //#endregion
}

/**
 * Creates and attaches a {@link ThemingController} to the given host element.
 *
 * This is the preferred way to add theming support to a component. The controller
 * is registered with the host's reactive controller lifecycle and automatically
 * resolves the active theme from an ancestor theme provider context or
 * falls back to the application-wide theme set via `configureTheme()`.
 *
 * @param host - The Lit element that will host the controller.
 * @param themes - The theme styles map containing `light` and `dark` variant entries,
 *   each keyed by theme name (`bootstrap`, `material`, `fluent`, `indigo`) and
 *   an optional `shared` entry applied regardless of theme. An entry is one
 *   style sheet, or an array of them in cascade order.
 * @param config - Optional configuration.
 * @param config.themeChange - Callback invoked on the host whenever the active theme changes.
 *
 * @returns The created {@link ThemingController} instance.
 *
 * @example
 * Minimal setup in a component constructor:
 * ```typescript
 * import { addThemingController } from '#theming/theming-controller.js';
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
  themes: ComponentThemes,
  config?: ThemingControllerConfig
): ThemingController {
  return new ThemingController(host, themes, config);
}

export type { ThemingController };

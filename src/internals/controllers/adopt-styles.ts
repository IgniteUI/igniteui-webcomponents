import {
  adoptStyles,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';

const observerConfig: MutationObserverInit = { childList: true, subtree: true };

/** Shallow identity comparison of two stylesheet collections. */
function isSameCollection(
  a: readonly CSSStyleSheet[],
  b: readonly CSSStyleSheet[]
): boolean {
  return a.length === b.length && a.every((sheet, index) => sheet === b[index]);
}

/**
 * Returns the rules of a stylesheet which can be re-inserted in a constructable one.
 *
 * Cross-origin stylesheets are not readable and yield no rules, as do `@import` rules,
 * which cannot be inserted in a constructable stylesheet.
 */
function getCloneableRules(sheet: CSSStyleSheet): CSSRule[] {
  try {
    return Array.from(sheet.cssRules).filter(
      (rule) => !(rule instanceof CSSImportRule)
    );
  } catch {
    return [];
  }
}

/**
 * Tracks the stylesheets of a document and mirrors them as constructable stylesheets
 * which can be adopted by shadow roots.
 *
 * A single instance per document is shared by all the {@link AdoptedStylesController}
 * instances whose hosts belong to it.
 *
 * The document is observed for as long as at least one controller is adopting styles,
 * so that stylesheets appearing after the initial adoption - such as the ones injected
 * at runtime by framework renderers - are picked up and pushed to the shadow roots
 * which have already adopted.
 */
class DocumentStyleSheets {
  //#region Instances

  private static readonly _instances = new WeakMap<
    Document,
    DocumentStyleSheets
  >();

  /** Returns the tracker of the given document, creating it if necessary. */
  public static for(document: Document): DocumentStyleSheets {
    let instance = DocumentStyleSheets._instances.get(document);

    if (!instance) {
      instance = new DocumentStyleSheets(document);
      DocumentStyleSheets._instances.set(document, instance);
    }

    return instance;
  }

  //#endregion

  //#region Internal state

  private readonly _document: Document;
  private readonly _observer: MutationObserver;
  private readonly _consumers = new Set<AdoptedStylesController>();

  private _clones = new WeakMap<CSSStyleSheet, CSSStyleSheet>();
  private _sources: readonly CSSStyleSheet[] = [];
  private _sheets: CSSStyleSheet[] = [];
  private _isStale = true;

  //#endregion

  //#region Public properties

  /** The clones of the document stylesheets. */
  public get sheets(): CSSStyleSheet[] {
    if (this._isStale) {
      this._collect(Array.from(this._document.styleSheets));
    }

    return this._sheets;
  }

  //#endregion

  constructor(document: Document) {
    this._document = document;
    this._observer = new MutationObserver(() => this._synchronize());
  }

  //#region Public API

  /** Registers a consumer, starting the document observation if it is the first one. */
  public subscribe(consumer: AdoptedStylesController): void {
    this._consumers.add(consumer);

    if (this._consumers.size === 1) {
      this._observer.observe(this._document, observerConfig);
      this._document.addEventListener('load', this, { capture: true });
    }
  }

  /** Unregisters a consumer, stopping the document observation if it was the last one. */
  public unsubscribe(consumer: AdoptedStylesController): void {
    if (this._consumers.delete(consumer) && this._consumers.size === 0) {
      this._observer.disconnect();
      this._document.removeEventListener('load', this, { capture: true });
    }
  }

  /** Drops the cloned stylesheets, forcing a re-clone on the next access. */
  public invalidate(): void {
    this._clones = new WeakMap();
    this._isStale = true;
  }

  //#endregion

  //#region Event handling

  /**
   * Stylesheet links have no CSSOM representation at the time they are appended to
   * the document, so they are picked up when they finish loading.
   *
   * @internal
   */
  public handleEvent(event: Event): void {
    if ((event.target as Node | null)?.nodeName === 'LINK') {
      this._synchronize();
    }
  }

  //#endregion

  //#region Internal methods

  /** Re-clones the document stylesheets and notifies the consumers if they have changed. */
  private _synchronize(): void {
    const sources = Array.from(this._document.styleSheets);

    if (!this._isStale && isSameCollection(sources, this._sources)) {
      return;
    }

    this._collect(sources);

    for (const consumer of this._consumers) {
      consumer.updateAdoptedStyles();
    }
  }

  private _collect(sources: readonly CSSStyleSheet[]): void {
    const sheets: CSSStyleSheet[] = [];

    for (const source of sources) {
      const clone = this._clone(source);

      if (clone) {
        sheets.push(clone);
      }
    }

    this._sources = sources;
    this._sheets = sheets;
    this._isStale = false;
  }

  /**
   * Clones the given stylesheet into a constructable one, keeping the rules in their
   * original order. Rules which cannot be inserted, such as ones with invalid syntax,
   * are skipped.
   *
   * Empty results are not cached, so that stylesheets populated at a later point are
   * eventually picked up.
   *
   * @returns The cloned stylesheet or null when there is nothing to clone.
   */
  private _clone(sheet: CSSStyleSheet): CSSStyleSheet | null {
    const cached = this._clones.get(sheet);

    if (cached) {
      return cached;
    }

    const rules = getCloneableRules(sheet);

    if (rules.length === 0) {
      return null;
    }

    const clone = new CSSStyleSheet();

    for (const rule of rules) {
      try {
        clone.insertRule(rule.cssText, clone.cssRules.length);
      } catch {
        // Skip rules that cannot be cloned
      }
    }

    if (clone.cssRules.length === 0) {
      return null;
    }

    this._clones.set(sheet, clone);
    return clone;
  }

  //#endregion
}

/**
 * Reactive controller which adopts the document stylesheets into the shadow root of
 * its host, effectively bridging the style encapsulation boundary when needed.
 *
 * The document is tracked for as long as the styles are adopted, so stylesheets added
 * to or removed from it afterwards are reflected in the shadow root as well. Only the
 * stylesheets the controller itself adopted are ever removed - the styles of the
 * component and of its theme are left intact.
 */
class AdoptedStylesController implements ReactiveController {
  //#region Internal state

  private readonly _host: ReactiveControllerHost & LitElement;

  private _adoptedSheets: readonly CSSStyleSheet[] = [];
  private _shouldAdopt = false;
  private _hasAdoptedStyles = false;

  private get _documentStyles(): DocumentStyleSheets {
    return DocumentStyleSheets.for(this._host.ownerDocument);
  }

  //#endregion

  //#region Public properties

  /** Whether the document styles are adopted in the host's shadow root. */
  public get hasAdoptedStyles(): boolean {
    return this._hasAdoptedStyles;
  }

  //#endregion

  constructor(host: ReactiveControllerHost & LitElement) {
    this._host = host;
    host.addController(this);
  }

  //#region ReactiveController implementation

  /**
   * Restores the styles cleared on the previous disconnect.
   * @internal
   */
  public hostConnected(): void {
    this.updateAdoptedStyles();
  }

  /**
   * Clears the adopted styles to prevent memory leaks.
   * @internal
   */
  public hostDisconnected(): void {
    this._clearAdoptedStyles();
  }

  //#endregion

  //#region Public API

  /**
   * Adopts or clears the document styles based on the passed condition.
   *
   * @example
   * ```typescript
   * this._adoptedStyles.shouldAdoptStyles(this.options?.adoptRootStyles);
   * ```
   */
  public shouldAdoptStyles(condition: boolean): void {
    this._shouldAdopt = condition;
    condition ? this._adoptRootStyles() : this._clearAdoptedStyles();
  }

  /**
   * Invalidates the cloned stylesheets of the given document, so that the next adoption
   * re-clones them. Additions and removals are picked up on their own - this is meant for
   * changes the document cannot be observed for, such as a theme rewriting a stylesheet
   * in place.
   *
   * @param doc - The document whose cache to invalidate. Defaults to the global document.
   */
  public invalidateCache(doc?: Document): void {
    DocumentStyleSheets.for(doc ?? document).invalidate();
  }

  /**
   * Re-adopts the document styles. Invoked when the tracked stylesheets change.
   * @internal
   */
  public updateAdoptedStyles(): void {
    if (this._shouldAdopt) {
      this._adoptRootStyles();
    }
  }

  //#endregion

  //#region Internal methods

  private _adoptRootStyles(): void {
    const shadowRoot = this._host.shadowRoot;

    if (!shadowRoot) {
      return;
    }

    const documentStyles = this._documentStyles;
    const sheets = documentStyles.sheets;

    adoptStyles(shadowRoot, [...this._getHostSheets(shadowRoot), ...sheets]);

    this._adoptedSheets = sheets;
    this._hasAdoptedStyles = true;

    documentStyles.subscribe(this);
  }

  private _clearAdoptedStyles(): void {
    if (!this._hasAdoptedStyles) {
      return;
    }

    const shadowRoot = this._host.shadowRoot;

    if (shadowRoot) {
      adoptStyles(shadowRoot, this._getHostSheets(shadowRoot));
    }

    this._adoptedSheets = [];
    this._hasAdoptedStyles = false;
    this._documentStyles.unsubscribe(this);
  }

  /** Returns the stylesheets of the shadow root which are not managed by this controller. */
  private _getHostSheets(shadowRoot: ShadowRoot): CSSStyleSheet[] {
    return shadowRoot.adoptedStyleSheets.filter(
      (sheet) => !this._adoptedSheets.includes(sheet)
    );
  }

  //#endregion
}

/**
 * Creates and attaches an {@link AdoptedStylesController} to a Lit component.
 *
 * @example
 * ```typescript
 * class MyComponent extends LitElement {
 *   private readonly _adoptedStyles = addAdoptedStylesController(this);
 *
 *   protected override update(props: PropertyValues): void {
 *     if (props.has('shouldAdopt')) {
 *       this._adoptedStyles.shouldAdoptStyles(this.shouldAdopt);
 *     }
 *     super.update(props);
 *   }
 * }
 * ```
 */
export function addAdoptedStylesController(
  host: ReactiveControllerHost & LitElement
): AdoptedStylesController {
  return new AdoptedStylesController(host);
}

export type { AdoptedStylesController };

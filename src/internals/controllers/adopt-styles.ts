import {
  adoptStyles,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';
import { sameItems } from '../utils/arrays.js';

const observerConfig: MutationObserverInit = { childList: true, subtree: true };

/**
 * Returns the rules that a constructable stylesheet accepts. A cross-origin
 * stylesheet is not readable and gives none; an `@import` rule is dropped.
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
 * Tracks the stylesheets of a document as constructable clones that a shadow
 * root adopts. All {@link AdoptedStylesController} instances of one document
 * share a tracker.
 *
 * @remarks
 * The tracker observes the document while at least one controller adopts, so
 * a stylesheet injected at runtime reaches the shadow roots that already
 * adopted. A stylesheet that changes in place needs an {@link invalidate}
 * call.
 */
class DocumentStyleSheets {
  //#region Instances

  private static readonly _instances = new WeakMap<
    Document,
    DocumentStyleSheets
  >();

  /** Returns the tracker of the document, and creates a missing one. */
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
  private _sheets: CSSStyleSheet[] = [];
  private _isStale = true;

  /**
   * The node to observe for stylesheets: the head by convention, which avoids
   * a mutation record for every DOM change in the page. The fallbacks cover a
   * document without a head, such as one that `DOMImplementation` creates.
   */
  private get _observedRoot(): Node {
    return (
      this._document.head ?? this._document.documentElement ?? this._document
    );
  }

  //#endregion

  //#region Public properties

  /** The clones of the document stylesheets. */
  public get sheets(): CSSStyleSheet[] {
    if (this._isStale) {
      this._collect();
    }

    return this._sheets;
  }

  //#endregion

  constructor(document: Document) {
    this._document = document;
    this._observer = new MutationObserver(() => this._synchronize());
  }

  //#region Public API

  /** Registers a consumer. The first consumer starts the observation. */
  public subscribe(consumer: AdoptedStylesController): void {
    this._consumers.add(consumer);

    if (this._consumers.size === 1) {
      this._observer.observe(this._observedRoot, observerConfig);
      this._document.addEventListener('load', this, { capture: true });
    }
  }

  /** Unregisters a consumer. The last consumer stops the observation. */
  public unsubscribe(consumer: AdoptedStylesController): void {
    if (this._consumers.delete(consumer) && this._consumers.size === 0) {
      this._observer.disconnect();
      this._document.removeEventListener('load', this, { capture: true });
    }
  }

  /** Drops the cloned stylesheets. The next access clones them again. */
  public invalidate(): void {
    this._clones = new WeakMap();
    this._isStale = true;
  }

  //#endregion

  //#region Event handling

  /**
   * Synchronizes the tracker when a stylesheet link finishes its load. A link
   * has no CSSOM representation before that.
   *
   * @internal
   */
  public handleEvent(event: Event): void {
    const target = event.target as Partial<HTMLLinkElement> | null;

    if (target?.sheet) {
      this._synchronize();
    }
  }

  //#endregion

  //#region Internal methods

  /** Clones the document stylesheets again, and notifies on a change. */
  private _synchronize(): void {
    if (this._collect()) {
      for (const consumer of this._consumers) {
        consumer.updateAdoptedStyles();
      }
    }
  }

  /**
   * Mirrors the stylesheets that the document holds now.
   *
   * @remarks
   * The comparison uses the clones and not the document collection, so a
   * stylesheet that gave nothing before is read again on every pass, and an
   * unreadable one leaves the consumers alone.
   *
   * @returns Whether the mirrored collection has changed.
   */
  private _collect(): boolean {
    const sheets: CSSStyleSheet[] = [];

    for (const source of this._document.styleSheets) {
      const clone = this._clone(source);

      if (clone) {
        sheets.push(clone);
      }
    }

    this._isStale = false;

    if (sameItems(sheets, this._sheets)) {
      return false;
    }

    this._sheets = sheets;
    return true;
  }

  /**
   * Clones the given stylesheet into a constructable one, in the original
   * rule order, and skips a rule that the clone does not accept.
   *
   * @remarks
   * A stylesheet without rules is not cached, so a later pass picks up one
   * that the document receives empty and fills afterwards.
   *
   * @returns The cloned stylesheet, or null when there is nothing to clone.
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
        // The clone does not accept this rule.
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
 * Adopts the document stylesheets into the shadow root of the host, across
 * its style encapsulation boundary.
 *
 * @remarks
 * The controller tracks the document while the host adopts, so a later
 * addition or removal reaches the shadow root too. It removes only the
 * stylesheets that it adopted, and leaves component and theme styles intact.
 */
class AdoptedStylesController implements ReactiveController {
  //#region Internal state

  private readonly _host: ReactiveControllerHost & LitElement;

  private _adoptedSheets: ReadonlySet<CSSStyleSheet> = new Set();
  private _shouldAdopt = false;
  private _hasAdoptedStyles = false;

  private get _documentStyles(): DocumentStyleSheets {
    return DocumentStyleSheets.for(this._host.ownerDocument);
  }

  //#endregion

  constructor(host: ReactiveControllerHost & LitElement) {
    this._host = host;
    host.addController(this);
  }

  //#region ReactiveController implementation

  /**
   * Restores the styles that the previous disconnect cleared.
   * @internal
   */
  public hostConnected(): void {
    this.updateAdoptedStyles();
  }

  /**
   * Clears the adopted styles to prevent a memory leak.
   * @internal
   */
  public hostDisconnected(): void {
    this._clearAdoptedStyles();
  }

  //#endregion

  //#region Public API

  /**
   * Adopts the document styles, or clears them, based on `condition`.
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
   * Invalidates the cloned stylesheets of the given document.
   *
   * @remarks
   * The tracker sees an addition and a removal on its own. Use this for a
   * change it cannot see, such as a theme that rewrites a sheet in place.
   *
   * @param doc - The document whose cache to invalidate.
   */
  public invalidateCache(doc: Document): void {
    DocumentStyleSheets.for(doc).invalidate();
  }

  /**
   * Adopts the document styles again. The tracker calls it on a change.
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

    this._adoptedSheets = new Set(sheets);
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

    this._adoptedSheets = new Set();
    this._hasAdoptedStyles = false;
    this._documentStyles.unsubscribe(this);
  }

  /** Returns the shadow root stylesheets that this controller does not own. */
  private _getHostSheets(shadowRoot: ShadowRoot): CSSStyleSheet[] {
    return shadowRoot.adoptedStyleSheets.filter(
      (sheet) => !this._adoptedSheets.has(sheet)
    );
  }

  //#endregion
}

/**
 * Creates an {@link AdoptedStylesController} and adds it to a Lit component.
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

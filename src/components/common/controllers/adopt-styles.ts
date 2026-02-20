/**
 * Reactive controller for adopting document-level styles into Shadow DOM.
 *
 * This controller enables web components to access and apply styles from the
 * document's stylesheets within their Shadow DOM, effectively bridging the
 * style encapsulation boundary when needed.
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

import {
  adoptStyles,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';

/**
 * Controller that manages the adoption of document-level styles into a
 * component's Shadow DOM.
 *
 * This controller provides:
 * - Automatic caching of cloned stylesheets per document
 * - Efficient adoption and removal of document styles
 * - Cache invalidation for theme changes
 * - Automatic cleanup on component disconnection
 */
class AdoptedStylesController implements ReactiveController {
  private static _cachedSheets = new WeakMap<Document, CSSStyleSheet[]>();

  private static _invalidateCache(doc: Document): void {
    AdoptedStylesController._cachedSheets.delete(doc);
  }

  private readonly _host: ReactiveControllerHost & LitElement;
  private _hasAdoptedStyles = false;

  /**
   * Indicates whether document styles have been adopted into the host's Shadow DOM.
   */
  public get hasAdoptedStyles(): boolean {
    return this._hasAdoptedStyles;
  }

  constructor(host: ReactiveControllerHost & LitElement) {
    this._host = host;
    host.addController(this);
  }

  /**
   * Conditionally adopts or clears document styles based on the provided condition.
   *
   * @param condition - If true, adopts document styles; if false, clears adopted styles
   *
   * @example
   * ```typescript
   * this._adoptedStyles.shouldAdoptStyles(this.options?.adoptRootStyles);
   * ```
   */
  public shouldAdoptStyles(condition: boolean): void {
    condition ? this._adoptRootStyles() : this._clearAdoptedStyles();
  }

  /**
   * Invalidates the stylesheet cache for the specified document.
   *
   * This should be called when the document's stylesheets change (e.g., theme changes)
   * to ensure the next adoption uses the updated styles.
   *
   * @param doc - The document whose cache to invalidate. Defaults to the global document.
   *
   * @example
   * ```typescript
   * // Invalidate cache on theme change
   * this._adoptedStyles.invalidateCache(this.ownerDocument);
   * ```
   */
  public invalidateCache(doc?: Document): void {
    AdoptedStylesController._invalidateCache(doc ?? document);
  }

  /**
   * Lifecycle callback invoked when the host component is disconnected.
   * Automatically clears adopted styles to prevent memory leaks.
   * @internal
   */
  public hostDisconnected(): void {
    this._clearAdoptedStyles();
  }

  /**
   * Adopts document-level styles into the host's Shadow DOM.
   *
   * This method:
   * 1. Checks the cache for previously cloned stylesheets
   * 2. Clones document stylesheets if not cached
   * 3. Applies both component styles and cloned document styles to the Shadow Root
   */
  private _adoptRootStyles(): void {
    const ownerDocument = this._host.ownerDocument;

    if (!AdoptedStylesController._cachedSheets.has(ownerDocument)) {
      AdoptedStylesController._cachedSheets.set(
        ownerDocument,
        this._cloneDocumentStyleSheets(ownerDocument)
      );
    }

    const ctor = this._host.constructor as typeof LitElement;
    adoptStyles(this._host.shadowRoot!, [
      ...ctor.elementStyles,
      ...AdoptedStylesController._cachedSheets.get(ownerDocument)!,
    ]);
    this._hasAdoptedStyles = true;
  }

  /**
   * Removes previously adopted document styles from the Shadow DOM.
   *
   * Only removes stylesheets that were added by this controller, preserving
   * the component's original styles.
   */
  private _clearAdoptedStyles(): void {
    const shadowRoot = this._host.shadowRoot;
    if (shadowRoot) {
      shadowRoot.adoptedStyleSheets = shadowRoot.adoptedStyleSheets.filter(
        (sheet) =>
          !AdoptedStylesController._cachedSheets
            .get(this._host.ownerDocument)
            ?.includes(sheet)
      );
    }
    this._hasAdoptedStyles = false;
  }

  /**
   * Clones all accessible stylesheets from the document into constructable stylesheets.
   *
   * This method:
   * - Iterates through all document stylesheets
   * - Skips cross-origin stylesheets (CORS restrictions)
   * - Skips @import rules (cannot be cloned into constructable stylesheets)
   * - Creates new CSSStyleSheet instances with cloned rules
   *
   * @param ownerDocument - The document whose stylesheets should be cloned
   * @returns An array of cloned CSSStyleSheet objects
   */
  private _cloneDocumentStyleSheets(ownerDocument: Document): CSSStyleSheet[] {
    const sheets: CSSStyleSheet[] = [];

    for (const sheet of ownerDocument.styleSheets) {
      try {
        const constructed = new CSSStyleSheet();
        let hasRules = false;

        for (const rule of sheet.cssRules) {
          // Skip @import rules as they cannot be inserted into constructable stylesheets
          if (rule instanceof CSSImportRule) {
            continue;
          }

          try {
            constructed.insertRule(rule.cssText);
            hasRules = true;
          } catch {
            // Skip rules that cannot be cloned (e.g., invalid syntax)
          }
        }

        if (hasRules) {
          sheets.push(constructed);
        }
      } catch {
        // Skip stylesheets that cannot be accessed (e.g., cross-origin)
      }
    }

    return sheets;
  }
}

/**
 * Creates and attaches an AdoptedStylesController to a Lit component.
 *
 * @param host - The Lit component that will host the controller
 * @returns The created AdoptedStylesController instance
 *
 * @example
 * ```typescript
 * class MyComponent extends LitElement {
 *   private readonly _adoptedStyles = addAdoptedStylesController(this);
 *
 *   connectedCallback() {
 *     super.connectedCallback();
 *     this._adoptedStyles.shouldAdoptStyles(true);
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

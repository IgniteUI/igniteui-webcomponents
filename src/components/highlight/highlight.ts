import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  createHighlightController,
  type HighlightNavigation,
} from './service.js';
import { styles as shared } from './themes/shared/highlight.common.css.js';
import { all } from './themes/themes.js';

/**
 * The highlight component provides efficient searching and highlighting of text
 * projected into it via its default slot. It uses the native CSS Custom Highlight API
 * to apply highlight styles to matched text nodes without modifying the DOM.
 *
 * The component supports case-sensitive matching, programmatic navigation between
 * matches, and automatic scroll-into-view of the active match.
 *
 * @element igc-highlight
 *
 * @slot - The default slot. Place the text content you want to search and highlight here.
 *
 * @cssproperty --foreground - The text color for a highlighted text node.
 * @cssproperty --background - The background color for a highlighted text node.
 * @cssproperty --foreground-active - The text color for the active highlighted text node.
 * @cssproperty --background-active - The background color for the active highlighted text node.
 *
 * @example
 * Basic usage — wrap your text and set the `search-text` attribute:
 * ```html
 * <igc-highlight search-text="world">
 *   <p>Hello, world! The world is a wonderful place.</p>
 * </igc-highlight>
 * ```
 *
 * @example
 * Case-sensitive search:
 * ```html
 * <igc-highlight search-text="Hello" case-sensitive>
 *   <p>Hello hello HELLO — only the first one matches.</p>
 * </igc-highlight>
 * ```
 *
 * @example
 * Navigating between matches programmatically:
 * ```typescript
 * const highlight = document.querySelector('igc-highlight');
 *
 * highlight.searchText = 'world';
 * console.log(highlight.size);    // total number of matches
 * console.log(highlight.current); // index of the active match (0-based)
 *
 * highlight.next();               // move to the next match
 * highlight.previous();           // move to the previous match
 * highlight.setActive(2);         // jump to a specific match by index
 * ```
 *
 * @example
 * Prevent scroll-into-view when navigating:
 * ```typescript
 * const highlight = document.querySelector('igc-highlight');
 * highlight.next({ preventScroll: true });
 * ```
 *
 * @example
 * Re-run search after dynamic content changes (e.g. lazy-loaded text):
 * ```typescript
 * const highlight = document.querySelector('igc-highlight');
 * // After slotted content has been updated:
 * highlight.search();
 * ```
 */
export default class IgcHighlightComponent extends LitElement {
  public static readonly tagName = 'igc-highlight';
  public static override styles = [shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcHighlightComponent);
  }

  //#region Internal properties and state

  private readonly _service = createHighlightController(this);

  private _caseSensitive = false;
  private _searchText = '';

  //#endregion

  //#region Public properties and attributes

  /**
   * Whether to match the searched text with case sensitivity in mind.
   * When `true`, only exact-case occurrences of `searchText` are highlighted.
   *
   * @attr case-sensitive
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'case-sensitive' })
  public set caseSensitive(value: boolean) {
    this._caseSensitive = value;
    this.search();
  }

  public get caseSensitive(): boolean {
    return this._caseSensitive;
  }

  /**
   * The string to search and highlight in the DOM content of the component.
   * Setting this property triggers a new search automatically.
   * An empty string clears all highlights.
   *
   * @attr search-text
   */
  @property({ attribute: 'search-text' })
  public set searchText(value: string) {
    this._searchText = value;
    this.search();
  }

  public get searchText(): string {
    return this._searchText;
  }

  /** The total number of matches found for the current `searchText`. Returns `0` when there are no matches or `searchText` is empty. */
  public get size(): number {
    return this._service.size;
  }

  /** The zero-based index of the currently active (focused) match. Returns `0` when there are no matches. */
  public get current(): number {
    return this._service.current;
  }

  //#endregion

  constructor() {
    super();

    addThemingController(this, all, {
      themeChange: this._addStylesheet,
    });
  }

  //#region Internal methods

  private _addStylesheet(): void {
    this._service.attachStylesheet();
  }

  //#endregion

  //#region Public methods

  /**
   * Moves the active highlight to the next match.
   * Wraps around to the first match after the last one.
   *
   * @param options - Optional navigation options (e.g. `preventScroll`).
   */
  public next(options?: HighlightNavigation): void {
    this._service.next(options);
  }

  /**
   * Moves the active highlight to the previous match.
   * Wraps around to the last match when going back from the first one.
   *
   * @param options - Optional navigation options (e.g. `preventScroll`).
   */
  public previous(options?: HighlightNavigation): void {
    this._service.previous(options);
  }

  /**
   * Moves the active highlight to the match at the specified zero-based index.
   *
   * @param index - The zero-based index of the match to activate.
   * @param options - Optional navigation options (e.g. `preventScroll`).
   */
  public setActive(index: number, options?: HighlightNavigation): void {
    this._service.setActive(index, options);
  }

  /**
   * Re-runs the highlight search based on the current `searchText` and `caseSensitive` values.
   *
   * Call this method after the slotted content changes dynamically (e.g. after lazy loading
   * or programmatic DOM mutations) to ensure all matches are up to date.
   */
  public search(): void {
    if (this.hasUpdated) {
      this._service.clear();
      this._service.find(this.searchText);
    }
  }

  //#endregion

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-highlight': IgcHighlightComponent;
  }
}

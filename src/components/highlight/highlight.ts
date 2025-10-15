import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  createHighlightController,
  type HighlightNavigation,
} from './service.js';

/**
 * The highlight component provides a way for efficient searching and highlighting of
 * text projected into it.
 *
 * @element igc-highlight
 *
 * @slot - The default slot of the component.
 *
 * @cssproperty --resting-color - The text color for a highlighted text node.
 * @cssproperty --resting-background - The background color for a highlighted text node.
 * @cssproperty --active-color - The text color for the active highlighted text node.
 * @cssproperty --active-background - The background color for the active highlighted text node.
 */
export default class IgcHighlightComponent extends LitElement {
  public static readonly tagName = 'igc-highlight';

  public static override styles = css`
    :host {
      display: contents;
    }
  `;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcHighlightComponent);
  }

  private readonly _service = createHighlightController(this);

  private _caseSensitive = false;
  private _searchText = '';

  /**
   * Whether to match the searched text with case sensitivity in mind.
   * @attr case-sensitive
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

  /** The number of matches. */
  public get size(): number {
    return this._service.size;
  }

  /** The index of the currently active match. */
  public get current(): number {
    return this._service.current;
  }

  /** Moves the active state to the next match. */
  public next(options?: HighlightNavigation): void {
    this._service.next(options);
  }

  /** Moves the active state to the previous match. */
  public previous(options?: HighlightNavigation): void {
    this._service.previous(options);
  }

  /** Moves the active state to the given index. */
  public setActive(index: number, options?: HighlightNavigation): void {
    this._service.setActive(index, options);
  }

  /**
   * Executes the highlight logic again based on the current `searchText` and
   * `caseSensitive` values.
   *
   * Useful when the slotted content is dynamic.
   */
  public search(): void {
    if (this.hasUpdated) {
      this._service.clear();
      this._service.find(this.searchText);
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-highlight': IgcHighlightComponent;
  }
}

import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { iterNodes, wrap } from '../common/util.js';

// Workaround until it lands in the DOM d.ts
declare let Highlight: any;

function createRange(node: Node, span: [number, number]) {
  const range = new Range();
  range.setStart(node, span[0]);
  range.setEnd(node, span[1]);
  return range;
}

function escapeRegex(regex: string) {
  return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getHighlightsAPI() {
  return (CSS as any).highlights;
}

/**
 * The highlight component provides a way for efficient searching and highlighting of
 * text projected into it.
 *
 * @element igc-highlight
 *
 * @slot - The default slot of the component.
 */
export default class IgcHighlightComponent extends LitElement {
  public static readonly tagName = 'igc-highlight';

  public static override styles = css`
    :host {
      display: contents;
    }
  `;

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
  }

  private highlight!: typeof Highlight;
  private activeHighlight!: typeof Highlight;

  private get _size(): number {
    return this.highlight.size;
  }

  @state()
  private _current = 0;

  /**
   * Whether to match the searched text with case sensitivity in mind.
   * @attr case-sensitive
   */
  @property({ type: Boolean, reflect: true, attribute: 'case-sensitive' })
  public caseSensitive = false;

  /**
   * The highlight theme name to use for the matched ranges.
   * @attr theme
   */
  @property()
  public theme = 'igc-default-highlight';

  /**
   * The highlight theme name to use for the current active range.
   * @attr active-theme
   */
  @property({ attribute: 'active-theme' })
  public activeTheme = 'igc-default-active-highlight';

  /**
   * The string to search and highlight in the DOM content of the component.
   * @attr search
   */
  @property()
  public search!: string;

  /** The number of matches. */
  public get size() {
    return this._size;
  }

  /** The index of the currently active match. */
  public get current() {
    return this._current;
  }

  @watch('theme', { waitUntilFirstUpdate: true })
  protected themeChanged(previous: string) {
    const api = getHighlightsAPI();

    api.delete(previous);
    api.set(this.theme, this.highlight);
  }

  @watch('activeTheme', { waitUntilFirstUpdate: true })
  protected activeThemeChanged(previous: string) {
    const api = getHighlightsAPI();

    api.delete(previous);
    api.set(this.activeTheme, this.activeHighlight);
  }

  @watch('search')
  protected searchChanged() {
    this.highlight.clear();
    this.activeHighlight.clear();
    this._current = 0;

    this.find(this.search);
  }

  constructor() {
    super();

    this.highlight = new Highlight();
    this.highlight.priority = 0;

    this.activeHighlight = new Highlight();
    this.activeHighlight.priority = 1;
  }

  public override connectedCallback() {
    super.connectedCallback();

    const api = getHighlightsAPI();
    api.set(this.theme, this.highlight);
    api.set(this.activeTheme, this.activeHighlight);
  }

  protected override firstUpdated() {
    this.searchChanged();
  }

  private find(term: string) {
    if (!term) return;

    const nodes = iterNodes(this, 'SHOW_TEXT');
    const flags = this.caseSensitive ? 'gud' : 'guid';
    const regex = new RegExp(`${escapeRegex(term)}`, flags);

    for (const node of nodes) {
      const matches = Array.from(node.textContent!.matchAll(regex)).flatMap(
        ({ indices }) => indices
      );

      for (const span of matches) {
        this.highlight.add(createRange(node, span!));
      }
    }

    this.setActive();
  }

  private setActive() {
    if (this._size) {
      const range = Array.from(this.highlight.values())[this._current] as Range;
      this.activeHighlight.add(range.cloneRange());
    }
  }

  private moveTo(idx: number) {
    if (!this._size) return;
    this._current = wrap(0, this._size - 1, idx);

    const range = Array.from(this.highlight.values())[this._current] as Range;
    this.activeHighlight.clear();
    this.activeHighlight.add(range.cloneRange());

    // REVIEW: Is this an overkill?
    const container = range.commonAncestorContainer.parentElement;
    if (container) {
      container.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'auto',
      });
    }
  }

  /** Moves the active state to the next match. */
  public next() {
    this.moveTo(this._current + 1);
  }

  /** Moves the active state to the previous match. */
  public previous() {
    this.moveTo(this._current - 1);
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

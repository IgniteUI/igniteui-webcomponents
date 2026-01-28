import { isServer, type ReactiveController } from 'lit';
import {
  escapeRegex,
  first,
  iterNodes,
  scrollIntoView,
  wrap,
} from '../common/util.js';
import type IgcHighlightComponent from './highlight.js';

type Match = { node: Node; indices: [start: number, end: number] };

/**
 * Options for controlling navigation behavior when moving the active highlight.
 */
export type HighlightNavigation = {
  /** If true, prevents the component from scrolling the new active match into view. */
  preventScroll?: boolean;
};

let nextKey = 0;

function* matchText(
  nodes: IterableIterator<Node>,
  regexp: RegExp
): Generator<Match> {
  for (const node of nodes) {
    if (node.textContent) {
      for (const match of node.textContent.matchAll(regexp)) {
        yield { node, indices: first(match.indices!) } satisfies Match;
      }
    }
  }
}

class HighlightService implements ReactiveController {
  //#region Private properties

  private readonly _host: IgcHighlightComponent;

  private readonly _key = `igc-highlight-${nextKey++}`;
  private readonly _activeKey = `${this._key}-active`;

  private readonly _styles = `
  ::highlight(${this._key}) {
    background-color: var(--resting-background, hsla(var(--ig-gray-300), var(--ig-gray-a)));
    color: var(--resting-color, white);
  }
  ::highlight(${this._activeKey}) {
    background-color: var(--active-background, hsla(333deg , calc( 78% * 1.23), calc( 49% * 1.34), 1));
    color: var(--active-color, white);
  }` as const;

  private readonly _styleSheet!: CSSStyleSheet;

  private _highlight!: Highlight;
  private _activeHighlight!: Highlight;

  private _current = 0;

  //#endregion

  //#region Public properties

  public get size(): number {
    return this._highlight.size;
  }

  public get current(): number {
    return this._current;
  }

  //#endregion

  constructor(host: IgcHighlightComponent) {
    this._host = host;
    this._host.addController(this);

    if (!isServer) {
      this._styleSheet = new CSSStyleSheet();
      this._styleSheet.replaceSync(this._styles);
    }
  }

  //#region Controller life-cycle

  /** @internal */
  public hostConnected(): void {
    this._createHighlightEntries();
    this._addStylesheet();
    this.find(this._host.searchText);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._removeHighlightEntries();
    this._removeStyleSheet();
  }

  //#endregion

  //#region Private methods

  private _addStylesheet(): void {
    const root = this._host.renderRoot as ShadowRoot;
    root.adoptedStyleSheets.push(this._styleSheet);
  }

  private _removeStyleSheet(): void {
    const root = this._host.renderRoot as ShadowRoot;

    root.adoptedStyleSheets = root.adoptedStyleSheets.filter(
      (sheet) => sheet !== this._styleSheet
    );
  }

  private _createHighlightEntries(): void {
    this._highlight = new Highlight();
    this._highlight.priority = 0;

    this._activeHighlight = new Highlight();
    this._activeHighlight.priority = 1;

    CSS.highlights.set(this._key, this._highlight);
    CSS.highlights.set(this._activeKey, this._activeHighlight);
  }

  private _removeHighlightEntries(): void {
    CSS.highlights.delete(this._key);
    CSS.highlights.delete(this._activeKey);
  }

  private _createRegex(value: string): RegExp {
    return new RegExp(
      `${escapeRegex(value)}`,
      this._host.caseSensitive ? 'dg' : 'dgi'
    );
  }

  private _getRangeByIndex(index: number): Range {
    return this._highlight.values().drop(index).next().value as Range;
  }

  private _updateActiveHighlight(): void {
    if (this.size) {
      this._activeHighlight.add(
        this._getRangeByIndex(this._current).cloneRange()
      );
    }
  }

  private _goTo(index: number, options?: HighlightNavigation): void {
    if (!this.size) {
      return;
    }

    this._current = wrap(0, this.size - 1, index);
    const range = this._getRangeByIndex(this._current);

    this._activeHighlight.clear();
    this._activeHighlight.add(range.cloneRange());

    if (!options?.preventScroll) {
      scrollIntoView(range.commonAncestorContainer.parentElement, {
        block: 'center',
        inline: 'center',
      });
    }
  }

  //#endregion

  //#region Public methods

  public find(value: string): void {
    if (!value) {
      return;
    }

    const nodes = iterNodes(this._host, {
      show: 'SHOW_TEXT',
      filter: (node) => !!node.textContent,
    });

    const iterator = matchText(nodes, this._createRegex(value));

    for (const { node, indices } of iterator) {
      const range = new Range();
      range.setStart(node, indices[0]);
      range.setEnd(node, indices[1]);
      this._highlight.add(range);
    }

    this._updateActiveHighlight();
  }

  /** Moves the active state to the next match. */
  public next(options?: HighlightNavigation): void {
    this._goTo(this._current + 1, options);
  }

  /** Moves the active state to the previous match. */
  public previous(options?: HighlightNavigation): void {
    this._goTo(this._current - 1, options);
  }

  /** Moves the active state to the given index. */
  public setActive(index: number, options?: HighlightNavigation): void {
    this._goTo(index, options);
  }

  /** Clears highlight collections. */
  public clear(): void {
    this._activeHighlight.clear();
    this._highlight.clear();
    this._current = 0;
  }

  //#endregion
}

export function createHighlightController(
  host: IgcHighlightComponent
): HighlightService {
  return new HighlightService(host);
}

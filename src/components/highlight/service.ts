import { isServer, type ReactiveController } from 'lit';
import {
  createMutationController,
  type MutationController,
} from '#internals/controllers/mutation-observer.js';
import { getRoot, iterNodes, scrollIntoView } from '#internals/utils/dom.js';
import { wrap } from '#internals/utils/math.js';
import { escapeRegex, nanoid } from '#internals/utils/strings.js';
import type IgcHighlightComponent from './highlight.js';

type Match = { node: Node; indices: [start: number, end: number] };

/* jsonAPIPlainObject */
/* marshalByValue */
/**
 * Options for controlling navigation behavior when moving the active highlight.
 */
export interface HighlightNavigation {
  /** If true, prevents the component from scrolling the new active match into view. */
  preventScroll?: boolean;
}

function* matchText(
  nodes: IterableIterator<Node>,
  regexp: RegExp
): Generator<Match> {
  for (const node of nodes) {
    if (node.textContent) {
      for (const match of node.textContent.matchAll(regexp)) {
        const [start, end] = match.indices![0]!;
        yield { node, indices: [start, end] } satisfies Match;
      }
    }
  }
}

class HighlightService implements ReactiveController {
  //#region Private properties

  private readonly _host: IgcHighlightComponent;
  private readonly _id: string;
  private readonly _activeId: string;
  private readonly _styleSheet?: CSSStyleSheet;
  private readonly _hostStyleSheet?: CSSStyleSheet;

  private readonly _observer: MutationController;
  private _attachedRoot: (DocumentOrShadowRoot & Node) | null = null;
  private _connected = false;

  private _highlight!: Highlight;
  private _activeHighlight!: Highlight;
  private _ranges: StaticRange[] = [];

  private _current = 0;

  //#endregion

  //#region Public properties

  /**
   * The total number of matches found in the component's content.
   */
  public get size(): number {
    return this._ranges.length;
  }

  /**
   * The index of the currently active match. Returns 0 if there are no matches.
   */
  public get current(): number {
    return this._current;
  }

  //#endregion

  constructor(host: IgcHighlightComponent) {
    this._host = host;
    this._host.addController(this);

    this._observer = createMutationController(host, {
      callback: () => this.search(true),
      config: { childList: true, characterData: true, subtree: true },
    });
    this._id = `igc-highlight-${nanoid()}`;
    this._activeId = `${this._id}-active`;

    // The rules resolve on the matched text, where an inner component can set the public names.
    const prefix = `--_${this._id}`;

    const hostStyles = `
      :host {
        ${prefix}-background: var(--background);
        ${prefix}-foreground: var(--foreground);
        ${prefix}-background-active: var(--background-active);
        ${prefix}-foreground-active: var(--foreground-active);
      }`;

    const styles = `
      ::highlight(${this._id}) {
        background-color: var(${prefix}-background, var(--ig-secondary-700));
        color: var(${prefix}-foreground, var(--ig-secondary-700-contrast));
      }
      ::highlight(${this._activeId}) {
        background-color: var(${prefix}-background-active, var(--ig-primary-500));
        color: var(${prefix}-foreground-active, var(--ig-primary-500-contrast));
      }`;

    if (!isServer) {
      this._hostStyleSheet = new CSSStyleSheet();
      this._hostStyleSheet.replaceSync(hostStyles);
      this._styleSheet = new CSSStyleSheet();
      this._styleSheet.replaceSync(styles);
    }
  }

  //#region Controller life-cycle

  /** @internal */
  public hostConnected(): void {
    this._createHighlightEntries();
    this._adoptHostStyleSheet();
    this.attachStylesheet();
    this._connected = true;
    this.search();
  }

  /** @internal */
  public hostDisconnected(): void {
    this._connected = false;
    this._removeHighlightEntries();
    this._removeStyleSheet();
  }

  //#endregion

  //#region Private methods

  private _removeStyleSheet(): void {
    const root = this._attachedRoot;

    if (root && this._styleSheet) {
      root.adoptedStyleSheets = root.adoptedStyleSheets.filter(
        (sheet) => sheet !== this._styleSheet
      );
    }

    this._attachedRoot = null;
  }

  /** The theming controller keeps the sheet on a theme change. */
  private _adoptHostStyleSheet(): void {
    const root = this._host.shadowRoot!;
    const sheet = this._hostStyleSheet!;

    if (!root.adoptedStyleSheets.includes(sheet)) {
      root.adoptedStyleSheets.push(sheet);
    }
  }

  private _createHighlightEntries(): void {
    this._highlight = new Highlight();
    this._highlight.priority = 0;

    this._activeHighlight = new Highlight();
    this._activeHighlight.priority = 1;

    CSS.highlights.set(this._id, this._highlight);
    CSS.highlights.set(this._activeId, this._activeHighlight);
  }

  private _removeHighlightEntries(): void {
    CSS.highlights.delete(this._id);
    CSS.highlights.delete(this._activeId);
    this._ranges.length = 0;
  }

  private _createRegex(value: string): RegExp {
    // A run of whitespace in the search text matches any run of whitespace in
    // the content, such as a line break in the HTML source.
    const pattern = value
      .split(/\s+/)
      .map(escapeRegex)
      .join(String.raw`\s+`);
    return new RegExp(pattern, this._host.caseSensitive ? 'dg' : 'dgi');
  }

  private _updateActiveHighlight(): void {
    if (this.size) {
      this._activeHighlight.clear();
      this._activeHighlight.add(this._ranges[this._current]);
    }
  }

  private _find(): void {
    const value = this._host.searchText;

    if (!value?.trim()) {
      return;
    }

    const iterator = matchText(
      iterNodes(this._host, { show: 'SHOW_TEXT' }),
      this._createRegex(value)
    );

    for (const {
      node,
      indices: [start, end],
    } of iterator) {
      // Static, so a DOM change does not have to update the ranges.
      const range = new StaticRange({
        startContainer: node,
        startOffset: start,
        endContainer: node,
        endOffset: end,
      });

      this._ranges.push(range);
      this._highlight.add(range);
    }
  }

  private _clear(): void {
    this._activeHighlight.clear();
    this._highlight.clear();
    this._ranges.length = 0;
    this._current = 0;
  }

  private _goTo(index: number, options?: HighlightNavigation): void {
    if (!this.size) {
      return;
    }

    this._current = wrap(0, this.size - 1, index);
    this._updateActiveHighlight();

    if (!options?.preventScroll) {
      const range = this._ranges[this._current];
      scrollIntoView(range.startContainer.parentElement, {
        block: 'center',
        inline: 'center',
      });
    }
  }

  //#endregion

  //#region Public methods

  /**
   * Attaches the stylesheet to the tree scope of the slotted content. Idempotent, and
   * re-targets the stylesheet when the host moves to another tree scope.
   */
  public attachStylesheet(): void {
    if (!this._styleSheet) {
      return;
    }

    // `::highlight()` rules are tree-scoped (Firefox enforces it): slotted content needs the host's root.
    const root = getRoot(this._host);

    if (this._attachedRoot !== root) {
      this._removeStyleSheet();
    }

    if (!root || root.adoptedStyleSheets.includes(this._styleSheet)) {
      return;
    }

    root.adoptedStyleSheets.push(this._styleSheet);
    this._attachedRoot = root;
  }

  /**
   * With `keepActive`, the match at the same node and offset stays active,
   * else the first match does.
   */
  public search(keepActive = false): void {
    if (!this._connected) {
      return;
    }

    const active = keepActive ? this._ranges[this._current] : undefined;

    if (!keepActive) {
      // This search already sees the pending content changes.
      this._observer.disconnect();
      this._observer.observe();
    }

    this._clear();
    this._find();

    if (active) {
      const index = this._ranges.findIndex(
        ({ startContainer, startOffset }) =>
          startContainer === active.startContainer &&
          startOffset === active.startOffset
      );

      this._current = Math.max(index, 0);
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

  //#endregion
}

export function createHighlightController(
  host: IgcHighlightComponent
): HighlightService {
  return new HighlightService(host);
}

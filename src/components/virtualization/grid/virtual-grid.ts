import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { createIndexedResizeController } from '#internals/controllers/indexed-resize.js';
import { createLayoutSettleController } from '#internals/controllers/layout-settle.js';
import { createLightDomStylesController } from '#internals/controllers/light-dom-styles.js';
import { createResizeObserverController } from '#internals/controllers/resize-observer.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { commonPrefixLength } from '#internals/utils/arrays.js';
import { getBorderBoxSize, isLTR } from '#internals/utils/dom.js';
import { asNumber } from '#internals/utils/math.js';
import { equal } from '#internals/utils/objects.js';
import {
  EMPTY_RANGE,
  normalizeOverScan,
  normalizeSize,
  rangesEqual,
  sliceRange,
} from '../engine.js';
import { ScrollCorrectionController } from '../scroll-correction.js';
import type { VisibleRange } from '../types.js';
import {
  type ScrollPosition,
  type ScrollTarget,
  type ViewportSize,
  VirtualGridEngine,
} from './engine.js';
import {
  VirtualGridCellContext,
  type VirtualGridColumnWidth,
  type VirtualGridState,
  type VisibleWindow,
} from './types.js';

export type VirtualGridCellTemplate<T, C> = (
  context: VirtualGridCellContext<T, C>
) => TemplateResult | typeof nothing;

export interface IgcVirtualGridComponentEventMap {
  igcStateChange: CustomEvent<VirtualGridState>;
}

const SCROLL_OFFSET_EPSILON_PX = 1;
/** Fallback for a non-positive `rowHeight`. Equal to its default. */
const DEFAULT_ROW_HEIGHT = 40;
/** Fallback for a non-positive numeric `columnWidth`. Equal to its default. */
const DEFAULT_COLUMN_WIDTH = 120;
const DEFAULT_ROW_OVER_SCAN = 2;
const DEFAULT_COLUMN_OVER_SCAN = 1;

const EMPTY_WINDOW: VisibleWindow = Object.freeze({
  rows: EMPTY_RANGE,
  columns: EMPTY_RANGE,
});

/**
 * The cell wrapper role that goes with each host role. Rows are `row` for
 * all of them. A host role outside the table falls back to `grid`.
 */
const CELL_ROLES: Record<string, 'gridcell' | 'cell'> = {
  grid: 'gridcell',
  treegrid: 'gridcell',
  table: 'cell',
};

function positionsEqual(a: ScrollPosition, b: ScrollPosition): boolean {
  return (
    Math.abs(a.top - b.top) < SCROLL_OFFSET_EPSILON_PX &&
    Math.abs(a.left - b.left) < SCROLL_OFFSET_EPSILON_PX
  );
}

/**
 * The column tracks and the row height are set on the track, not on the
 * translated content wrapper, so that a sibling of the wrapper, for
 * example a sticky header row, inherits them too. The first rendered cell
 * starts at the named `window-start` line, after the spacer track, so
 * tracks placed before the spacer later do not move it.
 */
const STYLES = `
  :where(igc-virtual-grid) {
    display: block;
    position: relative;
    overflow: auto;
    height: 18.75rem;
  }

  :where(igc-virtual-grid) [part="virtualization-track"] {
    position: relative;
    min-width: 100%;
    min-height: 100%;
  }

  :where(igc-virtual-grid) [part="virtualization-content"] {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    width: 100%;
    will-change: transform;
    contain: layout style paint;
  }

  :where(igc-virtual-grid) [part="row"] {
    display: grid;
    grid-template-columns: var(--igc-grid-cols);
    block-size: var(--igc-grid-row-height);
    box-sizing: border-box;
  }

  :where(igc-virtual-grid) [part="row"] > [data-vg-window-start] {
    grid-column-start: window-start;
  }

  :where(igc-virtual-grid) [part="cell"] {
    min-width: 0;
    overflow: hidden;
    box-sizing: border-box;
  }
`;

/**
 * A two-dimensional virtualization component. Only the rows and columns
 * visible in the viewport are rendered.
 *
 * Rows are fixed height by default and columns always have a known width,
 * so the offset math on both axes is arithmetic and any row count costs the
 * same. `autoRowHeight` switches rows to DOM measurement.
 *
 * @element igc-virtual-grid
 *
 * @fires igcStateChange - Emitted when the rendered virtual window changes on either axis.
 *
 * @csspart virtualization-track - The full-size element that gives the host its scrollable extent.
 * @csspart virtualization-content - The wrapper that holds the rendered rows, translated into
 * position within the track.
 * @csspart row - A rendered row. A CSS grid whose tracks are the rendered columns.
 * @csspart cell - A rendered cell. Wraps the output of `cellTemplate`.
 */
export default class IgcVirtualGridComponent<
  T = any,
  C = any,
> extends EventEmitterMixin<
  IgcVirtualGridComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-virtual-grid';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcVirtualGridComponent);
  }

  //#region Internal state

  protected readonly _engine = new VirtualGridEngine();
  private readonly _contentRef = createRef<HTMLDivElement>();
  private readonly _rowResizeController = createIndexedResizeController(this, {
    indexKey: 'vgRow',
    callback: this._handleRowResize,
  });
  private readonly _layoutSettle = createLayoutSettleController(this);
  private readonly _scrollCorrection =
    new ScrollCorrectionController<ScrollPosition>(this, {
      current: () => this._currentScroll(),
      equals: positionsEqual,
      scroll: (position, behavior) => this._applyScroll(position, behavior),
    });

  private _window: VisibleWindow = EMPTY_WINDOW;
  private _lastEmittedState: VirtualGridState | null = null;

  /**
   * The live scroll offsets. Not reactive by design: `render` reads them
   * only through `_window`, so `_handleScroll` schedules an update only when
   * a window moves.
   */
  private _scroll: ScrollPosition = { top: 0, left: 0 };

  @state()
  private _viewport: ViewportSize = { width: 0, height: 0 };

  //#endregion

  //#region Public properties

  /**
   * The array of rows to virtualize.
   *
   * Compared by reference: a mutation in place (`data.push(...)`) causes no
   * update. Assign a new array instead.
   */
  @property({ attribute: false })
  public data: T[] = [];

  /**
   * The column descriptors, in display order. The grid reads nothing from
   * them itself; they are handed to `cellTemplate` and `columnWidth`.
   *
   * Compared by reference, like `data`.
   */
  @property({ attribute: false })
  public columns: C[] = [];

  /**
   * A function that renders one cell. Receives a `VirtualGridCellContext`
   * with the row, the column, both indexes and both counts. Without it,
   * nothing is rendered.
   *
   * Cell wrappers are recycled positionally: after a scroll, the same
   * element can render another cell. Stateful content, for example an input
   * with a value, must key its state on the data, not on the element.
   */
  @property({ attribute: false })
  public cellTemplate: VirtualGridCellTemplate<T, C> | null = null;

  /**
   * The height of every row in pixels. With `autoRowHeight` set, the
   * estimate used before a row is measured in the DOM.
   * @attr row-height
   * @default 40
   */
  @property({ type: Number, attribute: 'row-height' })
  public rowHeight = DEFAULT_ROW_HEIGHT;

  /**
   * Whether rendered rows are measured in the DOM instead of all sharing
   * `rowHeight`.
   *
   * A row's height then depends on the cells rendered in it. A tall cell in
   * a column that scrolls into view can grow the row and shift every row
   * below it. For a stable layout keep rows fixed, or clamp cell content.
   * @attr auto-row-height
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'auto-row-height' })
  public autoRowHeight = false;

  /**
   * The width of every column in pixels, or a function that returns the width
   * of one column from its descriptor and index. A function is evaluated once
   * per `columns` change. The attribute accepts only the number form.
   * @attr column-width
   * @default 120
   */
  @property({ type: Number, attribute: 'column-width' })
  public columnWidth: VirtualGridColumnWidth<C> = DEFAULT_COLUMN_WIDTH;

  /**
   * Number of extra rows to render above and below the visible area.
   * @attr row-over-scan
   * @default 2
   */
  @property({ type: Number, attribute: 'row-over-scan' })
  public rowOverScan = DEFAULT_ROW_OVER_SCAN;

  /**
   * Number of extra columns to render before and after the visible area.
   * @attr column-over-scan
   * @default 1
   */
  @property({ type: Number, attribute: 'column-over-scan' })
  public columnOverScan = DEFAULT_COLUMN_OVER_SCAN;

  //#endregion

  constructor() {
    super();
    this._engine.onSizeChange = () => this.requestUpdate();
    this._handleScroll = this._handleScroll.bind(this);

    createLightDomStylesController(this, STYLES);
    createResizeObserverController(this, {
      callback: this._measureViewport,
    });
  }

  //#region Lit lifecycle

  /** @internal */
  public override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();

    // Content attributes, not `ElementInternals`: accessibility tooling
    // reads only the former. A consumer that wants static semantics sets
    // `role="table"` and the wrappers follow. The host is a scrollable
    // region, so it is in the tab order unless the consumer, for example a
    // data grid with roving focus on its cells, decides otherwise.
    if (!this.role) {
      this.role = 'grid';
    }
    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = 0;
    }

    this._engine.initMaxBrowserSize(this.ownerDocument);
    this._measureViewport();
    this.addEventListener('scroll', this._handleScroll, { passive: true });
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('scroll', this._handleScroll);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    const { rows } = this._engine;

    if (changed.has('autoRowHeight')) {
      rows.fixed = !this.autoRowHeight;
    }

    if (changed.has('data')) {
      // Fixed rows have no measurements to retain, so the prefix walk over
      // the two arrays is skipped for them.
      const previous = changed.get('data');
      rows.resize(
        this._rows.length,
        this._normalizedRowHeight,
        previous && this.autoRowHeight
          ? commonPrefixLength(previous, this._rows)
          : 0
      );
      this.ariaRowCount = `${this._rows.length}`;
    }

    if (changed.has('rowHeight')) {
      rows.updateEstimatedSize(this._normalizedRowHeight);
    }

    if (changed.has('columns') || changed.has('columnWidth')) {
      this._syncColumnSizes();
      this.ariaColCount = `${this._columns.length}`;
    }

    this._window = this._computeWindow();
  }

  protected override updated(_changed: PropertyValues<this>): void {
    this._rowResizeController.sync(
      this.autoRowHeight ? this._contentRef.value : null
    );
    this._emitStateChange();
  }

  protected override render(): TemplateResult {
    if (!this.cellTemplate) {
      return html`${nothing}`;
    }

    const { rows: rowsEngine, columns: columnsEngine } = this._engine;
    const { rows: rowRange, columns: columnRange } = this._window;
    const cellRole = CELL_ROLES[this.role ?? 'grid'] ?? CELL_ROLES.grid;

    const trackStyle = {
      width: `${columnsEngine.domSize}px`,
      height: `${rowsEngine.domSize}px`,
      '--igc-grid-cols': this._columnTracks(columnRange),
      '--igc-grid-row-height': this.autoRowHeight
        ? 'auto'
        : `${this._normalizedRowHeight}px`,
    };

    // The content wrapper sits at the origin of the track. A vertical
    // translation to the first rendered row puts that row at its virtual
    // position. The horizontal axis is not translated: each row is a grid
    // whose first track is as wide as the columns scrolled past.
    const contentStyle = {
      transform: `translateY(${rowsEngine.getRangeOffset(rowRange)}px)`,
    };

    const rowCount = this._rows.length;
    const columnCount = this._columns.length;
    const visibleRows = sliceRange(this._rows, rowRange);
    const visibleColumns = sliceRange(this._columns, columnRange);

    return html`
      <div
        part="virtualization-track"
        role="presentation"
        style=${styleMap(trackStyle)}
      >
        <div
          ${ref(this._contentRef)}
          part="virtualization-content"
          role="presentation"
          style=${styleMap(contentStyle)}
        >
          ${visibleRows.map((row, i) => {
            const rowIndex = rowRange.startIndex + i;
            return html`<div
              part="row"
              role="row"
              aria-rowindex=${rowIndex + 1}
              data-vg-row=${rowIndex}
            >
              ${visibleColumns.map((column, j) => {
                const columnIndex = columnRange.startIndex + j;
                const ctx = new VirtualGridCellContext(
                  row,
                  rowIndex,
                  rowCount,
                  column,
                  columnIndex,
                  columnCount
                );
                return html`<div
                  part="cell"
                  role=${cellRole}
                  aria-colindex=${columnIndex + 1}
                  data-vg-column=${columnIndex}
                  ?data-vg-window-start=${j === 0}
                >
                  ${this.cellTemplate!(ctx)}
                </div>`;
              })}
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  //#endregion

  //#region Internal API

  /** `data`, guarded against a nullish value set by the consumer. */
  private get _rows(): T[] {
    return this.data ?? [];
  }

  /** `columns`, guarded against a nullish value set by the consumer. */
  private get _columns(): C[] {
    return this.columns ?? [];
  }

  /** The configured `rowHeight`, normalized to a positive number. */
  private get _normalizedRowHeight(): number {
    return normalizeSize(this.rowHeight, DEFAULT_ROW_HEIGHT);
  }

  /**
   * Pushes the column widths to the horizontal engine: one bulk assignment
   * of known sizes for a function, a uniform index for a number.
   */
  private _syncColumnSizes(): void {
    const { columns } = this._engine;
    const width = this.columnWidth;

    if (typeof width === 'function') {
      columns.setSizes(
        this._columns.map((column, i) =>
          Math.max(0, asNumber(width(column, i)))
        )
      );
    } else {
      columns.fixed = true;
      columns.resize(
        this._columns.length,
        normalizeSize(width, DEFAULT_COLUMN_WIDTH)
      );
    }
  }

  /**
   * The `grid-template-columns` value shared by every rendered row: a
   * spacer as wide as the columns before the window, the `window-start`
   * line, one track per rendered column, and a flexible track that fills a
   * viewport wider than all columns together.
   */
  private _columnTracks(range: VisibleRange): string {
    const { columns } = this._engine;
    const tracks = [`${columns.getRangeOffset(range)}px [window-start]`];

    for (let i = range.startIndex; i <= range.endIndex; i++) {
      tracks.push(`${columns.getItemSize(i)}px`);
    }
    tracks.push('1fr');

    return tracks.join(' ');
  }

  /**
   * The windows to render for the current scroll position and viewport.
   * Empty until a `cellTemplate` is set, because nothing renders without one.
   */
  private _computeWindow(): VisibleWindow {
    return this.cellTemplate
      ? this._engine.getVisibleWindow(this._scroll, this._viewport, {
          rows: normalizeOverScan(this.rowOverScan, DEFAULT_ROW_OVER_SCAN),
          columns: normalizeOverScan(
            this.columnOverScan,
            DEFAULT_COLUMN_OVER_SCAN
          ),
        })
      : EMPTY_WINDOW;
  }

  /** The current real scroll position, with `left` normalized for RTL. */
  private _currentScroll(): ScrollPosition {
    return {
      top: this.scrollTop,
      left: isLTR(this) ? this.scrollLeft : -this.scrollLeft,
    };
  }

  /** Scrolls to a normalized position, accounting for RTL. */
  private _applyScroll(
    position: ScrollPosition,
    behavior: ScrollBehavior
  ): void {
    this.scrollTo({
      top: position.top,
      left: isLTR(this) ? position.left : -position.left,
      behavior,
    });
  }

  private _measureViewport(): void {
    const { clientWidth: width, clientHeight: height } = this;
    if (width !== this._viewport.width || height !== this._viewport.height) {
      this._viewport = { width, height };
    }
  }

  /**
   * Records the new scroll offsets. Schedules a render only when a window
   * moves on either axis; a scroll inside the current windows would re-run
   * every cell template for an identical result.
   */
  private _handleScroll(): void {
    this._scroll = this._currentScroll();

    const next = this._computeWindow();
    if (
      !rangesEqual(next.rows, this._window.rows) ||
      !rangesEqual(next.columns, this._window.columns)
    ) {
      this.requestUpdate();
    }
  }

  private _handleRowResize(index: number, entry: ResizeObserverEntry): void {
    const measured = getBorderBoxSize(entry, 'block');

    if (measured > 0) {
      this._engine.rows.measureItem(index, measured);
    }
  }

  /**
   * Scrolls both axes to `target`. Column widths are always known, so only
   * measured rows can move the landing point between correction passes.
   */
  private _scrollTo(
    target: ScrollTarget,
    options?: ScrollIntoViewOptions
  ): Promise<void> {
    return this._scrollCorrection.run(
      () =>
        this._engine.resolveScrollPosition(
          target,
          this._currentScroll(),
          this._viewport,
          options
        ),
      options?.behavior ?? 'auto'
    );
  }

  /**
   * Emits `igcStateChange`. Skipped when a window is empty or the state is
   * equal to the last reported one, because measurement passes re-render
   * without a window change.
   */
  private _emitStateChange(): void {
    const { rows, columns } = this._window;
    if (
      rows.endIndex < rows.startIndex ||
      columns.endIndex < columns.startIndex
    ) {
      return;
    }

    const detail: VirtualGridState = {
      rowStartIndex: rows.startIndex,
      rowEndIndex: rows.endIndex,
      columnStartIndex: columns.startIndex,
      columnEndIndex: columns.endIndex,
      viewportWidth: this._viewport.width,
      viewportHeight: this._viewport.height,
      totalWidth: this._engine.columns.totalSize,
      totalHeight: this._engine.rows.totalSize,
    };

    if (equal(this._lastEmittedState, detail)) {
      return;
    }

    this._lastEmittedState = { ...detail };
    this.emitEvent('igcStateChange', { detail });
  }

  //#endregion

  //#region Public API

  /* blazorSuppress */
  /**
   * Resolves when the grid has settled: the current render pass is complete,
   * the row measurements it triggers are complete, and so are the renders
   * those measurements schedule.
   *
   * `updateComplete` covers one Lit render pass. This covers `data` changes,
   * scrolls, and viewport resizes, where the stable DOM state comes after
   * one or more follow-up renders.
   */
  public get layoutComplete(): Promise<void> {
    return this._layoutSettle.complete;
  }

  /**
   * Scrolls to the cell at `rowIndex`, `columnIndex`. `options.block`
   * aligns the row and `options.inline` the column. Indexes outside the
   * data are clamped to the last row or column.
   *
   * With `autoRowHeight`, rows outside the rendered window have only an
   * estimated height, so the first jump can miss the target row. The rows
   * at the landing point are then measured and the position is corrected
   * until it is stable. The returned promise resolves when the scroll
   * settles on the final offset.
   */
  public scrollToCell(
    rowIndex: number,
    columnIndex: number,
    options?: ScrollIntoViewOptions
  ): Promise<void> {
    return this._scrollTo({ row: rowIndex, column: columnIndex }, options);
  }

  /**
   * Scrolls to the row at `index`, aligned by `options.block`. The
   * horizontal offset does not change.
   */
  public scrollToRow(
    index: number,
    options?: ScrollIntoViewOptions
  ): Promise<void> {
    return this._scrollTo({ row: index }, options);
  }

  /**
   * Scrolls to the column at `index`, aligned by `options.inline`. The
   * vertical offset does not change.
   */
  public scrollToColumn(
    index: number,
    options?: ScrollIntoViewOptions
  ): Promise<void> {
    return this._scrollTo({ column: index }, options);
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-virtual-grid': IgcVirtualGridComponent;
  }
}

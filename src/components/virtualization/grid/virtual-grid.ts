import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { createIndexedResizeController } from '#internals/controllers/indexed-resize.js';
import { createLayoutSettleController } from '#internals/controllers/layout-settle.js';
import { createLightDomStylesController } from '#internals/controllers/light-dom-styles.js';
import { createResizeObserverController } from '#internals/controllers/resize-observer.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { commonPrefixLength, lastOf } from '#internals/utils/arrays.js';
import { getBorderBoxSize, isLTR } from '#internals/utils/dom.js';
import { asNumber } from '#internals/utils/math.js';
import { equal } from '#internals/utils/objects.js';
import { DataRequestTracker } from '../data-request.js';
import {
  EMPTY_RANGE,
  normalizeCount,
  normalizeOverScan,
  normalizeSize,
  rangesEqual,
  sliceRange,
} from '../engine.js';
import { ScrollCorrectionController } from '../scroll-correction.js';
import type { VirtualScrollDataRequest, VisibleRange } from '../types.js';
import {
  type PinnedCounts,
  type PinnedTrack,
  type ScrollPosition,
  type ScrollTarget,
  type ViewportSize,
  VirtualGridEngine,
} from './engine.js';
import {
  VirtualGridCellContext,
  VirtualGridColumnContext,
  type VirtualGridColumnWidth,
  VirtualGridRowContext,
  type VirtualGridState,
  type VisibleWindow,
} from './types.js';

export type VirtualGridCellTemplate<T, C> = (
  context: VirtualGridCellContext<T, C>
) => TemplateResult | typeof nothing;

export type VirtualGridHeaderTemplate<C> = (
  context: VirtualGridColumnContext<C>
) => TemplateResult | typeof nothing;

/**
 * Renders a whole row, or returns `null` for a row that renders its cells.
 */
export type VirtualGridRowTemplate<T> = (
  context: VirtualGridRowContext<T>
) => TemplateResult | null;

export interface IgcVirtualGridComponentEventMap {
  igcStateChange: CustomEvent<VirtualGridState>;
  igcDataRequest: CustomEvent<VirtualScrollDataRequest>;
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
 * The cell wrapper role that goes with each host role. Rows are `row` and
 * header cells `columnheader` for all of them. A host role outside the
 * table falls back to `grid`.
 */
const CELL_ROLES: Record<string, 'gridcell' | 'cell'> = {
  grid: 'gridcell',
  treegrid: 'gridcell',
  table: 'cell',
};

type CellRole = 'gridcell' | 'cell' | 'columnheader';
/** A named line of the row grid that a cell is placed at. */
type GridLine = 'window-start' | 'pinned-end';

function positionsEqual(a: ScrollPosition, b: ScrollPosition): boolean {
  return (
    Math.abs(a.top - b.top) < SCROLL_OFFSET_EPSILON_PX &&
    Math.abs(a.left - b.left) < SCROLL_OFFSET_EPSILON_PX
  );
}

function px(value: number): string {
  return `${value}px`;
}

/** The selector path from the host to the rendered rows. */
const ROWS_SELECTOR =
  ':scope > [part="virtualization-track"] > [part="virtualization-content"] > [part="row"]';

/**
 * The header row and the track are siblings, so the column tracks are set
 * on both from one string, and the row height on the track alone.
 *
 * Every rendered row is one CSS grid: pinned start tracks, a spacer as wide
 * as the columns scrolled past, the `window-start` line, the rendered
 * window, a flexible track, and after the `pinned-end` line the pinned end
 * tracks. Only the first cell of the window and of the pinned end is placed
 * by line; the others follow it in flow.
 *
 * Pinned cells are sticky against the host, so a horizontal scroll never
 * moves them and needs no script. They are painted over the cells that
 * scroll under them, so they need an opaque background from the consumer.
 * A full-width cell spans every track of its row and is sticky in the same
 * way, sized to the viewport through `--igc-grid-viewport-width`.
 *
 * The grid corrects its own scroll offset when a row above the viewport is
 * measured, so the browser's scroll anchoring is turned off.
 */
const STYLES = `
  :where(igc-virtual-grid) {
    display: block;
    position: relative;
    overflow: auto;
    overflow-anchor: none;
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

  :where(igc-virtual-grid) [part="header"] {
    position: sticky;
    inset-block-start: 0;
    z-index: 1;
    min-width: 100%;
    box-sizing: border-box;
  }

  :where(igc-virtual-grid) :is([part="row"], [part="header"]) {
    display: grid;
    grid-template-columns: var(--igc-grid-cols);
  }

  :where(igc-virtual-grid) [part="row"] {
    block-size: var(--igc-grid-row-height);
    box-sizing: border-box;
  }

  :where(igc-virtual-grid) [data-vg-line="window-start"] {
    grid-column-start: window-start;
  }

  :where(igc-virtual-grid) [data-vg-line="pinned-end"] {
    grid-column-start: pinned-end;
  }

  :where(igc-virtual-grid) [data-vg-pinned] {
    position: sticky;
  }

  :where(igc-virtual-grid) [data-vg-pinned="start"] {
    inset-inline-start: 0;
  }

  :where(igc-virtual-grid) [data-vg-pinned="end"] {
    inset-inline-end: 0;
  }

  :where(igc-virtual-grid) [part="full-width-cell"] {
    grid-column: 1 / -1;
    position: sticky;
    inset-inline-start: 0;
    inline-size: var(--igc-grid-viewport-width);
  }

  :where(igc-virtual-grid)
    :is([part="cell"], [part="header-cell"], [part="full-width-cell"]) {
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
 * @fires igcDataRequest - Emitted when the rendered rows come within a few rows of the end
 * of `data`. Also emitted on the first render, when the loaded rows do not fill the viewport.
 *
 * @csspart virtualization-track - The full-size element that gives the host its scrollable extent.
 * @csspart virtualization-content - The wrapper that holds the rendered rows, translated into
 * position within the track.
 * @csspart header - The sticky header row, rendered with `headerTemplate`.
 * @csspart header-cell - A header cell. Wraps the output of `headerTemplate`.
 * @csspart row - A rendered row. A CSS grid whose tracks are the rendered columns.
 * @csspart cell - A rendered cell. Wraps the output of `cellTemplate`.
 * @csspart full-width-cell - The one cell of a row rendered with `rowTemplate`. Spans every
 * column and sticks to the viewport during a horizontal scroll.
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
  private readonly _headerResizeController = createResizeObserverController(
    this,
    {
      callback: this._handleHeaderResize,
      target: null,
      requestUpdate: false,
    }
  );
  private readonly _layoutSettle = createLayoutSettleController(this);
  private readonly _dataRequests = new DataRequestTracker();
  private readonly _scrollCorrection =
    new ScrollCorrectionController<ScrollPosition>(this, {
      current: () => this._currentScroll(),
      equals: positionsEqual,
      scroll: (position, behavior) => this._applyScroll(position, behavior),
    });

  private _window: VisibleWindow = EMPTY_WINDOW;
  private _lastEmittedState: VirtualGridState | null = null;

  /**
   * The DOM px the vertical scroll offset moves by in the current update so
   * the content at the top of the viewport stays put after the row
   * measurements behind it. Predicted into `_scroll` before the render and
   * applied to the host after it.
   */
  private _scrollShift = 0;

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
   * update. Assign a new array instead. The `igcDataRequest` flow also
   * expects a new array.
   */
  @property({ attribute: false })
  public data: T[] = [];

  /**
   * The column descriptors, in display order. The grid reads nothing from
   * them itself; they are handed to `cellTemplate`, `headerTemplate` and
   * `columnWidth`.
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
   * A function that renders one header cell from a `VirtualGridColumnContext`.
   * When set, a header row sticks to the top of the grid and shares the
   * column tracks of the rows. Its height comes from its content.
   */
  @property({ attribute: false })
  public headerTemplate: VirtualGridHeaderTemplate<C> | null = null;

  /**
   * A function that renders a whole row from a `VirtualGridRowContext`, for
   * example a group header or a detail row. Called for every rendered row
   * before `cellTemplate`: a `null` result renders the cells of the row, any
   * other result replaces them with one cell that spans every column and
   * sticks to the viewport during a horizontal scroll.
   *
   * With fixed rows, a full-width row is as tall as any other row. Set
   * `autoRowHeight` when it needs its own height.
   */
  @property({ attribute: false })
  public rowTemplate: VirtualGridRowTemplate<T> | null = null;

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
   * The number of leading columns that stay in view during a horizontal
   * scroll. They are the first entries of `columns`, rendered in every row
   * and in the header. Give their cells an opaque background, since the
   * scrollable columns pass under them.
   * @attr pinned-columns-start
   * @default 0
   */
  @property({ type: Number, attribute: 'pinned-columns-start' })
  public pinnedColumnsStart = 0;

  /**
   * The number of trailing columns that stay in view during a horizontal
   * scroll. They are the last entries of `columns`. See `pinnedColumnsStart`.
   * @attr pinned-columns-end
   * @default 0
   */
  @property({ type: Number, attribute: 'pinned-columns-end' })
  public pinnedColumnsEnd = 0;

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
      this._dataRequests.reset();
    }

    if (changed.has('headerTemplate')) {
      if (!this.headerTemplate) {
        this._engine.headerSize = 0;
      }
      this.ariaRowCount = `${this._rows.length + this._headerRowCount}`;
    } else if (changed.has('data')) {
      this.ariaRowCount = `${this._rows.length + this._headerRowCount}`;
    }

    if (changed.has('rowHeight')) {
      rows.updateEstimatedSize(this._normalizedRowHeight);
    }

    if (changed.has('columns') || changed.has('columnWidth')) {
      this._syncColumnSizes();
      this.ariaColCount = `${this._columns.length}`;
    } else if (
      changed.has('pinnedColumnsStart') ||
      changed.has('pinnedColumnsEnd')
    ) {
      this._engine.setPinned(this._pinnedCounts);
    }

    this._scrollShift = rows.takeMeasureShift();
    if (this._scrollShift !== 0) {
      this._scroll = {
        ...this._scroll,
        top: this._scroll.top + this._scrollShift,
      };
      rows.anchorOffset = this._scroll.top;
    }

    this._window = this._computeWindow();
  }

  protected override updated(_changed: PropertyValues<this>): void {
    if (this._scrollShift !== 0) {
      // The rows are at their new offsets now, so the host follows them.
      // The scroll event this causes finds the windows already in place.
      this._scrollShift = 0;
      this.scrollTop = this._scroll.top;
    }

    this._rowResizeController.sync(
      this.autoRowHeight ? this._contentRef.value : null
    );
    this._checkDataRequest();
    this._emitStateChange();
  }

  protected override render(): TemplateResult {
    if (!this.cellTemplate) {
      return html`${nothing}`;
    }

    const engine = this._engine;
    const { rows: rowRange, columns: columnRange } = this._window;
    const cellRole = CELL_ROLES[this.role ?? 'grid'] ?? CELL_ROLES.grid;

    // The header shares the horizontal geometry of the track.
    const headerStyle = {
      width: px(engine.domWidth),
      '--igc-grid-cols': this._columnTracks(columnRange),
    };
    const trackStyle = {
      ...headerStyle,
      height: px(engine.rows.domSize),
      '--igc-grid-row-height': this.autoRowHeight
        ? 'auto'
        : px(this._normalizedRowHeight),
      '--igc-grid-viewport-width': px(this._viewport.width),
    };

    // The content wrapper sits at the origin of the track. A vertical
    // translation to the first rendered row puts that row at its virtual
    // position. The horizontal axis is not translated: each row is a grid
    // whose spacer track is as wide as the columns scrolled past.
    const contentStyle = {
      transform: `translateY(${px(engine.rows.getRangeOffset(rowRange))})`,
    };

    const columnCount = this._columns.length;
    const visibleRows = sliceRange(this._rows, rowRange);

    return html`
      ${
        this.headerTemplate
          ? html`<div
              ${ref(this._handleHeaderRef)}
              part="header"
              role="row"
              aria-rowindex="1"
              style=${styleMap(headerStyle)}
            >
              ${this._renderCells(
                columnRange,
                'header-cell',
                'columnheader',
                (column, columnIndex) =>
                  this.headerTemplate!(
                    new VirtualGridColumnContext(
                      column,
                      columnIndex,
                      columnCount
                    )
                  )
              )}
            </div>`
          : nothing
      }
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
          ${visibleRows.map((row, i) =>
            this._renderRow(row, rowRange.startIndex + i, columnRange, cellRole)
          )}
        </div>
      </div>
    `;
  }

  //#endregion

  //#region Rendering

  /**
   * Renders one row: the cells of `columnRange`, or, when `rowTemplate`
   * takes the row, one cell that spans every column.
   */
  private _renderRow(
    row: T,
    rowIndex: number,
    columnRange: VisibleRange,
    cellRole: CellRole
  ): TemplateResult {
    const rowCount = this._rows.length;
    const columnCount = this._columns.length;
    const fullWidth =
      this.rowTemplate?.(new VirtualGridRowContext(row, rowIndex, rowCount)) ??
      null;

    return html`<div
      part="row"
      role="row"
      aria-rowindex=${rowIndex + 1 + this._headerRowCount}
      data-vg-row=${rowIndex}
    >
      ${
        fullWidth !== null
          ? html`<div
              part="full-width-cell"
              role=${cellRole}
              aria-colindex="1"
              aria-colspan=${columnCount}
            >
              ${fullWidth}
            </div>`
          : this._renderCells(
              columnRange,
              'cell',
              cellRole,
              (column, columnIndex) =>
                this.cellTemplate!(
                  new VirtualGridCellContext(
                    row,
                    rowIndex,
                    rowCount,
                    column,
                    columnIndex,
                    columnCount
                  )
                )
            )
      }
    </div>`;
  }

  /**
   * Renders the cells of one row in track order: the pinned start columns,
   * the scrollable window, then the pinned end columns. The first cell of
   * the window and of the pinned end carry the grid line they start at.
   */
  private _renderCells(
    range: VisibleRange,
    part: 'cell' | 'header-cell',
    role: CellRole,
    content: (column: C, columnIndex: number) => TemplateResult | typeof nothing
  ): TemplateResult[] {
    const columns = this._columns;
    const { start, end } = this._engine.pinned;
    const endStart = columns.length - end.length;
    const cells: TemplateResult[] = [];

    const cell = (
      columnIndex: number,
      pinned: PinnedTrack | null,
      line: GridLine | null
    ) =>
      html`<div
        part=${part}
        role=${role}
        aria-colindex=${columnIndex + 1}
        data-vg-column=${columnIndex}
        data-vg-pinned=${pinned?.side ?? nothing}
        data-vg-line=${line ?? nothing}
        style=${ifDefined(
          pinned
            ? `inset-inline-${pinned.side}: ${px(pinned.inset)}`
            : undefined
        )}
      >
        ${content(columns[columnIndex], columnIndex)}
      </div>`;

    for (let i = 0; i < start.length; i++) {
      cells.push(cell(i, start[i], null));
    }
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      cells.push(cell(i, null, i === range.startIndex ? 'window-start' : null));
    }
    for (let i = endStart; i < columns.length; i++) {
      cells.push(
        cell(i, end[i - endStart], i === endStart ? 'pinned-end' : null)
      );
    }

    return cells;
  }

  /**
   * The `grid-template-columns` value shared by the header and every row:
   * the pinned start tracks, a spacer as wide as the scrollable columns
   * before the window, the `window-start` line, one track per rendered
   * column, a flexible track that fills a viewport wider than all columns
   * together, and the pinned end tracks after their line.
   */
  private _columnTracks(range: VisibleRange): string {
    const engine = this._engine;
    const { start, end } = engine.pinned;
    const tracks = start.map((track) => px(track.width));

    tracks.push(`${px(engine.getColumnRangeOffset(range))} [window-start]`);
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      tracks.push(px(engine.getColumnWidth(i)));
    }
    tracks.push('1fr');

    if (end.length > 0) {
      tracks.push('[pinned-end]', ...end.map((track) => px(track.width)));
    }

    return tracks.join(' ');
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

  private get _overScan(): { rows: number; columns: number } {
    return {
      rows: normalizeOverScan(this.rowOverScan, DEFAULT_ROW_OVER_SCAN),
      columns: normalizeOverScan(this.columnOverScan, DEFAULT_COLUMN_OVER_SCAN),
    };
  }

  /** 1 with a header row, which counts as a row for ARIA; 0 without. */
  private get _headerRowCount(): number {
    return this.headerTemplate ? 1 : 0;
  }

  /** The pinned counts, clamped to the columns. */
  private get _pinnedCounts(): PinnedCounts {
    const count = this._columns.length;
    return {
      start: normalizeCount(this.pinnedColumnsStart, count),
      end: normalizeCount(this.pinnedColumnsEnd, count),
    };
  }

  /**
   * Hands the column widths and the pinned counts to the engine: one value
   * per column, from the number or from the function evaluated once per
   * column.
   */
  private _syncColumnSizes(): void {
    const columns = this._columns;
    const width = this.columnWidth;
    const widths =
      typeof width === 'function'
        ? columns.map((column, i) => Math.max(0, asNumber(width(column, i))))
        : columns.map(() => normalizeSize(width, DEFAULT_COLUMN_WIDTH));

    this._engine.setColumns(widths, this._pinnedCounts);
  }

  /**
   * The windows to render for the current scroll position and viewport.
   * Empty until a `cellTemplate` is set, because nothing renders without one.
   */
  private _computeWindow(): VisibleWindow {
    return this.cellTemplate
      ? this._engine.getVisibleWindow(
          this._scroll,
          this._viewport,
          this._overScan
        )
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
    this._engine.rows.anchorOffset = this._scroll.top;

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

  /** Follows the header element across renders with one resize observer. */
  private readonly _handleHeaderRef = (element?: Element): void => {
    this._headerResizeController.sync(element);
  };

  /**
   * The header is in flow before the track, so the engine reserves its
   * height on the vertical axis and the rows scroll through the viewport
   * below it.
   */
  private _handleHeaderResize(entries: ResizeObserverEntry[]): void {
    this._engine.headerSize = getBorderBoxSize(lastOf(entries)!, 'block');
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

  private _checkDataRequest(): void {
    const request = this._dataRequests.next(
      this._window.rows,
      this._rows.length,
      this._overScan.rows
    );

    if (request) {
      this.emitEvent('igcDataRequest', { detail: request });
    }
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
      totalWidth: this._engine.totalWidth,
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
   * The wrapper element of the cell at `rowIndex`, `columnIndex`, or `null`
   * when that cell is not rendered. A row rendered with `rowTemplate` has no
   * cells. Pair it with `scrollToCell` to move focus to a cell that is out
   * of view.
   */
  public getCellElement(
    rowIndex: number,
    columnIndex: number
  ): HTMLElement | null {
    return this.querySelector<HTMLElement>(
      `${ROWS_SELECTOR}[data-vg-row="${rowIndex}"] > [data-vg-column="${columnIndex}"]`
    );
  }

  /**
   * Sets the width of the column at `columnIndex` to the widest of its
   * rendered cells, the header cell included, and returns that width in px.
   *
   * The measurement is a sample: rows outside the rendered window take no
   * part in it, so a wider cell can still scroll into view later. The width
   * holds until `columns` or `columnWidth` changes. When no cell of the
   * column is rendered, the width does not change and is returned as is.
   */
  public autoSizeColumn(columnIndex: number): number {
    const cells = this.querySelectorAll<HTMLElement>(
      `:scope > [part="header"] > [data-vg-column="${columnIndex}"], ${ROWS_SELECTOR} > [data-vg-column="${columnIndex}"]`
    );
    if (cells.length === 0) {
      return this._engine.getColumnWidth(columnIndex);
    }

    // A cell fills its track, so its natural width shows only once the
    // track no longer constrains it. One write pass, one read pass, one
    // layout.
    let width = 0;
    for (const cell of cells) {
      cell.style.width = 'max-content';
    }
    for (const cell of cells) {
      width = Math.max(width, cell.getBoundingClientRect().width);
    }
    for (const cell of cells) {
      cell.style.width = '';
    }

    width = Math.ceil(width);
    this._engine.setColumnWidth(columnIndex, width);
    return width;
  }

  /**
   * Scrolls to the cell at `rowIndex`, `columnIndex`. `options.block`
   * aligns the row and `options.inline` the column. Indexes outside the
   * data are clamped to the last row or column. A pinned column is always
   * in view, so the horizontal offset does not change for it.
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

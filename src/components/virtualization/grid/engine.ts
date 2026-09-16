import { clampIndex, EMPTY_RANGE, VirtualScrollEngine } from '../engine.js';
import type { VisibleRange } from '../types.js';
import type { VisibleWindow } from './types.js';

/** A DOM scroll position on both axes, in px. Normalized for RTL. */
export interface ScrollPosition {
  top: number;
  left: number;
}

/** A viewport size on both axes, in px. */
export interface ViewportSize {
  width: number;
  height: number;
}

/** The row and column to bring into view. An omitted axis keeps its offset. */
export interface ScrollTarget {
  row?: number;
  column?: number;
}

/** The side a column is pinned to. */
export type PinnedSide = 'start' | 'end';

/** One pinned column, as the rows render it. */
export interface PinnedTrack {
  readonly side: PinnedSide;
  readonly width: number;
  /**
   * The sticky inset from `side`: the widths of the pinned columns between
   * this one and that edge.
   */
  readonly inset: number;
}

/** The pinned columns on each side, in display order. */
export interface PinnedColumns {
  readonly start: readonly PinnedTrack[];
  readonly end: readonly PinnedTrack[];
}

/** The pinned column counts on each side. */
export interface PinnedCounts {
  start: number;
  end: number;
}

const NO_PINNED_COLUMNS: PinnedColumns = Object.freeze({ start: [], end: [] });

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Turns pinned widths into tracks with insets. The inset of a start track is
 * the sum of the widths before it; of an end track, the sum after it.
 */
function toPinnedTracks(
  widths: readonly number[],
  side: PinnedSide
): PinnedTrack[] {
  const tracks: PinnedTrack[] = new Array(widths.length);
  let inset = 0;

  if (side === 'start') {
    for (let i = 0; i < widths.length; i++) {
      tracks[i] = { side, width: widths[i], inset };
      inset += widths[i];
    }
  } else {
    for (let i = widths.length - 1; i >= 0; i--) {
      tracks[i] = { side, width: widths[i], inset };
      inset += widths[i];
    }
  }

  return tracks;
}

/**
 * Two single-axis engines behind one facade. `rows` owns the vertical axis
 * and `columns` the horizontal one; each keeps its own size index and
 * coordinate compression.
 *
 * The facade owns what neither axis knows: the pinned columns, which stay
 * out of the horizontal axis because they never scroll, and the header,
 * which takes space in the scroll extent before the rows. Both narrow the
 * viewport the scrollable rows and columns move through, and both are
 * reserved from their axis so the track stays within the browser limit.
 * Column indexes at this boundary are always indexes into `columns`; the
 * offset into the horizontal axis is applied here.
 */
export class VirtualGridEngine {
  public readonly rows = new VirtualScrollEngine();
  public readonly columns = new VirtualScrollEngine();

  private _widths: number[] = [];
  private _pinnedCounts: PinnedCounts = { start: 0, end: 0 };
  private _pinned: PinnedColumns = NO_PINNED_COLUMNS;
  private _pinnedSize = 0;
  private _headerSize = 0;

  /**
   * Called when sizes or counts change on either axis.
   * Example: `() => this.requestUpdate()`.
   */
  public set onSizeChange(callback: (() => void) | null) {
    this.rows.onSizeChange = callback;
    this.columns.onSizeChange = callback;
  }

  /** The pinned columns, with the sticky inset of each. */
  public get pinned(): PinnedColumns {
    return this._pinned;
  }

  /** The number of leading pinned columns; the offset into the horizontal axis. */
  private get _pinnedStartCount(): number {
    return this._pinned.start.length;
  }

  /**
   * The height in px of a header that sits in the scroll extent before the
   * rows. Reserved from the vertical axis and taken off the row viewport.
   */
  public set headerSize(px: number) {
    this._headerSize = Math.max(0, px);
    this.rows.reservedSize = this._headerSize;
  }

  /** The total width of all columns in px, pinned ones included. */
  public get totalWidth(): number {
    return this._pinnedSize + this.columns.totalSize;
  }

  /** The DOM width of the track: the pinned columns plus the scrollable ones. */
  public get domWidth(): number {
    return this._pinnedSize + this.columns.domSize;
  }

  /** Measures the maximum browser size for the document on both axes. */
  public initMaxBrowserSize(doc: Document): void {
    this.rows.initMaxBrowserSize(doc);
    this.columns.initMaxBrowserSize(doc);
  }

  /**
   * Sets the width of every column, in display order, and the pinned
   * counts. The first `start` and the last `end` columns are pinned, the
   * rest go to the horizontal axis as known sizes. The counts are clamped
   * to the columns.
   */
  public setColumns(widths: readonly number[], pinned: PinnedCounts): void {
    this._widths = [...widths];
    this._pinnedCounts = pinned;
    this._splitColumns();
  }

  /** Changes the pinned counts; the widths stay. */
  public setPinned(pinned: PinnedCounts): void {
    this._pinnedCounts = pinned;
    this._splitColumns();
  }

  /** Changes the width of the column at `index`, pinned or not. */
  public setColumnWidth(index: number, width: number): void {
    if (index < 0 || index >= this._widths.length) {
      return;
    }
    this._widths[index] = width;
    this._splitColumns();
  }

  /** Splits the widths into the pinned tracks and the horizontal axis. */
  private _splitColumns(): void {
    const widths = this._widths;
    const pinned = this._pinnedCounts;
    const count = widths.length;
    const startCount = Math.min(Math.max(0, pinned.start), count);
    const endStart =
      count - Math.min(Math.max(0, pinned.end), count - startCount);

    const startWidths = widths.slice(0, startCount);
    const endWidths = widths.slice(endStart);
    this._pinned = {
      start: toPinnedTracks(startWidths, 'start'),
      end: toPinnedTracks(endWidths, 'end'),
    };
    this._pinnedSize = sum(startWidths) + sum(endWidths);

    this.columns.setSizes(widths.slice(startCount, endStart));
    this.columns.reservedSize = this._pinnedSize;
  }

  /** The width in px of the column at `index`, pinned or not. */
  public getColumnWidth(index: number): number {
    const { start, end } = this._pinned;
    const endStart = this._columnCount - end.length;

    if (index < start.length) {
      return start[index]?.width ?? 0;
    }
    if (index >= endStart) {
      return end[index - endStart]?.width ?? 0;
    }
    return this.columns.getItemSize(index - start.length);
  }

  /**
   * The width in px of the scrollable columns before the rendered `range`:
   * the spacer track that stands in for them.
   */
  public getColumnRangeOffset(range: VisibleRange): number {
    return this.columns.getRangeOffset(this._toAxisRange(range));
  }

  /**
   * The rows and the scrollable columns to render for a DOM scroll position
   * and the host viewport, each padded by its own over-scan. The column
   * range is in column indexes; pinned columns are outside it and always
   * rendered.
   */
  public getVisibleWindow(
    scroll: ScrollPosition,
    viewport: ViewportSize,
    overScan: { rows: number; columns: number }
  ): VisibleWindow {
    const scrollable = this._scrollableViewport(viewport);
    const columns = this.columns.getVisibleRange(
      scroll.left,
      scrollable.width,
      overScan.columns
    );

    return {
      rows: this.rows.getVisibleRange(
        scroll.top,
        scrollable.height,
        overScan.rows
      ),
      columns:
        columns === EMPTY_RANGE ? EMPTY_RANGE : this._toColumnRange(columns),
    };
  }

  /**
   * The scroll position that brings `target` into view according to
   * `options`: `block` aligns the row and `inline` the column. An axis
   * without a target keeps its `current` offset, and so does the horizontal
   * one for a pinned column, which is in view at any offset. A column index
   * outside the columns is clamped to the last one first.
   */
  public resolveScrollPosition(
    target: ScrollTarget,
    current: ScrollPosition,
    viewport: ViewportSize,
    options?: ScrollIntoViewOptions
  ): ScrollPosition {
    const scrollable = this._scrollableViewport(viewport);
    const column =
      target.column === undefined
        ? undefined
        : this._toAxisIndex(target.column);

    return {
      top:
        target.row === undefined
          ? current.top
          : this.rows.resolveScrollOffset(
              target.row,
              current.top,
              scrollable.height,
              options?.block
            ),
      left:
        column === undefined
          ? current.left
          : this.columns.resolveScrollOffset(
              column,
              current.left,
              scrollable.width,
              options?.inline
            ),
    };
  }

  /** The column count on both sides of the axis: pinned plus scrollable. */
  private get _columnCount(): number {
    const { start, end } = this._pinned;
    return start.length + this.columns.length + end.length;
  }

  /** The host viewport less the header and the pinned columns. */
  private _scrollableViewport(viewport: ViewportSize): ViewportSize {
    return {
      width: Math.max(0, viewport.width - this._pinnedSize),
      height: Math.max(0, viewport.height - this._headerSize),
    };
  }

  /**
   * The horizontal axis index of the column at `index`, or `undefined` for
   * a pinned column.
   */
  private _toAxisIndex(index: number): number | undefined {
    const count = this._columnCount;
    if (count === 0) {
      return undefined;
    }

    const clamped = clampIndex(index, count);
    const startCount = this._pinnedStartCount;

    return clamped < startCount || clamped >= count - this._pinned.end.length
      ? undefined
      : clamped - startCount;
  }

  private _toAxisRange(range: VisibleRange): VisibleRange {
    const offset = this._pinnedStartCount;
    return {
      startIndex: range.startIndex - offset,
      endIndex: range.endIndex - offset,
    };
  }

  private _toColumnRange(range: VisibleRange): VisibleRange {
    const offset = this._pinnedStartCount;
    return {
      startIndex: range.startIndex + offset,
      endIndex: range.endIndex + offset,
    };
  }
}

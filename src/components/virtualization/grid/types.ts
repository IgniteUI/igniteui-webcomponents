import type { VisibleRange } from '../types.js';

/**
 * Context passed to the header template: the column behind the header cell,
 * its index, the column count, and edge predicates.
 */
export class VirtualGridColumnContext<C> {
  /** The column descriptor of the current cell. */
  public readonly column: C;
  /** The index of the column in `columns`. */
  public readonly columnIndex: number;
  /** The total number of columns. */
  public readonly columnCount: number;

  constructor(column: C, columnIndex: number, columnCount: number) {
    this.column = column;
    this.columnIndex = columnIndex;
    this.columnCount = columnCount;
  }

  /** Whether the cell is in the first column. */
  public get isFirstColumn(): boolean {
    return this.columnIndex === 0;
  }

  /** Whether the cell is in the last column. */
  public get isLastColumn(): boolean {
    return this.columnIndex === this.columnCount - 1;
  }
}

/**
 * Context passed to the cell template: the row and column behind the cell,
 * both indexes, both counts, and edge predicates.
 */
export class VirtualGridCellContext<T, C> extends VirtualGridColumnContext<C> {
  /** The row item of the current cell. */
  public readonly row: T;
  /** The index of the row in `data`. */
  public readonly rowIndex: number;
  /** The total number of rows. */
  public readonly rowCount: number;

  constructor(
    row: T,
    rowIndex: number,
    rowCount: number,
    column: C,
    columnIndex: number,
    columnCount: number
  ) {
    super(column, columnIndex, columnCount);
    this.row = row;
    this.rowIndex = rowIndex;
    this.rowCount = rowCount;
  }

  /** Whether the cell is in the first row. */
  public get isFirstRow(): boolean {
    return this.rowIndex === 0;
  }

  /** Whether the cell is in the last row. */
  public get isLastRow(): boolean {
    return this.rowIndex === this.rowCount - 1;
  }
}

/**
 * The width of every column in px, or a function that gives the width of one
 * column from its descriptor and index.
 */
export type VirtualGridColumnWidth<C> =
  | number
  | ((column: C, index: number) => number);

/**
 * The rendered row and column windows. The column range is over the
 * scrollable columns only, indexed from the first one; pinned columns are
 * always rendered.
 */
export interface VisibleWindow {
  /** The rendered row range (inclusive). */
  rows: VisibleRange;
  /** The rendered scrollable column range (inclusive). */
  columns: VisibleRange;
}

/** Snapshot of the currently rendered virtual window on both axes. */
export interface VirtualGridState {
  /** The index of the first rendered row. */
  rowStartIndex: number;
  /** The index of the last rendered row (inclusive). */
  rowEndIndex: number;
  /**
   * The index of the first rendered scrollable column. Pinned columns are
   * always rendered and not part of the window.
   */
  columnStartIndex: number;
  /** The index of the last rendered scrollable column (inclusive). */
  columnEndIndex: number;
  /** The width of the viewport in pixels. */
  viewportWidth: number;
  /** The height of the viewport in pixels. */
  viewportHeight: number;
  /** The total width of all columns in pixels. */
  totalWidth: number;
  /** The total height of all rows in pixels. */
  totalHeight: number;
}

import { asNumber, first } from '../common/util.js';
import type { ResizeState } from '../resize-container/types.js';
import { ResizeUtil } from './resize-util.js';
import type IgcTileComponent from './tile.js';
import type {
  ResizeProps,
  ResizeSpanProps,
  TileGridDimension,
  TileGridPosition,
  TileResizeDimensions,
} from './types.js';

const CssValues = new RegExp(/(?<start>\d+)?\s*\/?\s*span\s*(?<span>\d+)?/gi);

function parseTileGridRect(tile: IgcTileComponent): TileGridPosition {
  const computed = getComputedStyle(tile);
  const { gridColumn, gridRow } = computed;

  const [column, row] = [
    first(Array.from(gridColumn.matchAll(CssValues))).groups!,
    first(Array.from(gridRow.matchAll(CssValues))).groups!,
  ];

  return {
    column: {
      start: asNumber(column.start, -1),
      span: asNumber(column.span, -1),
    },
    row: { start: asNumber(row.start, -1), span: asNumber(row.span, -1) },
  };
}

function parseTileParentGrid(gridContainer: HTMLElement) {
  const computed = getComputedStyle(gridContainer);
  const { gap, gridTemplateColumns, gridTemplateRows } = computed;

  const columns = gridTemplateColumns.split(' ').map(asNumber);
  const rows = gridTemplateRows.split(' ').map(asNumber);

  return {
    gap: asNumber(gap),
    columns: {
      count: columns.length,
      entries: columns,
      minSize: asNumber(computed.getPropertyValue('--min-col-width')),
    },
    rows: {
      count: rows.length,
      entries: rows,
      minSize: asNumber(computed.getPropertyValue('--min-row-height')),
    },
  };
}

class TileResizeState {
  private _initialPosition!: TileGridPosition;
  private _resizeUtil!: ResizeUtil;

  protected _gap = 0;
  protected _prevDeltaX = 0;
  protected _prevDeltaY = 0;

  protected _prevSnappedWidth = 0;
  protected _prevSnappedHeight = 0;

  protected _position: TileGridPosition = {
    column: { start: 0, span: 0 },
    row: { start: 0, span: 0 },
  };

  protected _columns: TileGridDimension = {
    count: 0,
    entries: [],
    minSize: 0,
  };

  protected _rows: TileGridDimension = {
    count: 0,
    entries: [],
    minSize: 0,
  };

  public resizedDimensions: TileResizeDimensions = {
    width: null,
    height: null,
  };

  public get emptyResizeDimensions(): TileResizeDimensions {
    return { width: null, height: null };
  }

  public get gap(): number {
    return this._gap;
  }

  public get position(): TileGridPosition {
    return structuredClone(this._position);
  }

  public get columns(): TileGridDimension {
    return structuredClone(this._columns);
  }

  public get rows(): TileGridDimension {
    return structuredClone(this._rows);
  }

  public calculateSnappedWidth(state: ResizeState): number {
    const resizeProps = this.getResizeProps(state);
    const snappedDimension =
      this._resizeUtil.calculateSnappedDimension(resizeProps);

    this._prevDeltaX = snappedDimension.newDelta;
    this._prevSnappedWidth = snappedDimension.snappedSize;
    return snappedDimension.snappedSize;
  }

  public calculateSnappedHeight(state: ResizeState): number {
    const resizeProps = this.getResizeProps(state, true);
    const snappedDimension =
      this._resizeUtil.calculateSnappedDimension(resizeProps);

    this._prevDeltaY = snappedDimension.newDelta;
    this._prevSnappedHeight = snappedDimension.snappedSize;
    return snappedDimension.snappedSize;
  }

  public updateState(
    tileRect: DOMRect,
    tile: IgcTileComponent,
    grid: HTMLElement
  ): void {
    this.initState(grid, tile);
    this.calculateTileStartPosition(grid, tileRect);
  }

  /**
   * Calculates and returns the CSS column and row properties of a tile after resizing,
   * based on its new dimensions and starting position.
   */
  public calculateResizedGridPosition(rect: DOMRect) {
    const colProps = this.getResizeSpanProps(rect);
    const rowProps = this.getResizeSpanProps(rect, true);

    // REVIEW pass col minSize and allowOverflow?
    this._position.column.span =
      this._resizeUtil.calculateResizedSpan(colProps);
    this._position.row.span = this._resizeUtil.calculateResizedSpan(rowProps);

    return {
      colSpan: this._position.column.span,
      rowSpan: this._position.row.span,
    };
  }

  public calculateActualSize(grid: HTMLElement) {
    const { columns, rows } = parseTileParentGrid(grid);

    const width = this._resizeUtil.calculateSizeFromEntries(
      columns.entries,
      this.position.column
    );
    const height = this._resizeUtil.calculateSizeFromEntries(
      rows.entries,
      this.position.row
    );

    return { width, height };
  }

  /**
   * Checks and adjusts tile spans based on the column count of the tile manager.
   */
  // REVIEW once we decide how to handle empty columns.
  public adjustTileGridPosition(tiles: IgcTileComponent[]): void {
    const columnCount = this.columns.count;

    for (const tile of tiles) {
      const colStart = tile.colStart || 0;
      const colSpan = tile.colSpan || 0;

      if (colStart > columnCount) {
        //Prioritize span over start?
        tile.colSpan = 1;
        tile.colStart = columnCount;
        continue;
      }

      if (colStart + colSpan - 1 > columnCount) {
        tile.colSpan = columnCount - colStart + 1;
      }
    }
  }

  private initState(grid: HTMLElement, tile: IgcTileComponent): void {
    const { gap, columns, rows } = parseTileParentGrid(grid);

    this._resizeUtil = new ResizeUtil(gap);
    this._initialPosition = parseTileGridRect(tile);
    this._position = structuredClone(this._initialPosition);

    this._gap = gap;
    this._columns = columns;
    this._rows = rows;
    this._prevDeltaX = 0;
    this._prevDeltaY = 0;
    this._prevSnappedWidth = 0;
    this._prevSnappedHeight = 0;
  }

  private calculateTileStartPosition(
    grid: HTMLElement,
    tileRect: DOMRect
  ): void {
    if (this._position.column.start < 0) {
      const offsetX = this.getGridOffset(grid, 'horizontal');

      this._position.column.start = this._resizeUtil.calculatePosition(
        tileRect.left + window.scrollX + grid.scrollLeft - offsetX,
        this._columns.entries
      );
    }

    if (this._position.row.start < 0) {
      const offsetY = this.getGridOffset(grid, 'vertical');

      this._position.row.start = this._resizeUtil.calculatePosition(
        tileRect.top + window.scrollY - offsetY,
        this._rows.entries
      );
    }
  }

  private getGridOffset(
    grid: HTMLElement,
    axis: 'horizontal' | 'vertical'
  ): number {
    const gridRect = grid.getBoundingClientRect();
    const computed = getComputedStyle(grid);

    return axis === 'horizontal'
      ? gridRect.left +
          window.scrollX +
          grid.scrollLeft +
          Number.parseFloat(computed.paddingLeft)
      : gridRect.top + window.scrollY + Number.parseFloat(computed.paddingTop);
  }

  private getResizeProps(state: ResizeState, isRow = false): ResizeProps {
    return isRow
      ? {
          currentDelta: state.deltaY,
          currentSize: state.current.height,
          prevDelta: this._prevDeltaY,
          gridEntries: this._rows.entries,
          startIndex: this._position.row.start,
          prevSnapped: this._prevSnappedHeight,
        }
      : {
          currentDelta: state.deltaX,
          currentSize: state.current.width,
          prevDelta: this._prevDeltaX,
          gridEntries: this._columns.entries,
          startIndex: this._position.column.start,
          prevSnapped: this._prevSnappedWidth,
        };
  }

  private getResizeSpanProps(rect: DOMRect, isRow = false): ResizeSpanProps {
    return isRow
      ? {
          targetSize: rect.height,
          tilePosition: this.position.row,
          tileGridDimension: this.rows,
          gap: this._gap,
          allowOverflow: true,
        }
      : {
          targetSize: rect.width,
          tilePosition: this.position.column,
          tileGridDimension: this.columns,
          gap: this._gap,
          allowOverflow: false,
        };
  }
}

export function createTileResizeState(): TileResizeState {
  return new TileResizeState();
}

import type { ResizeState } from '#internals/directives/resize.js';
import { firstOf } from '#internals/utils/arrays.js';
import { asNumber } from '#internals/utils/math.js';
import {
  calculatePosition,
  calculateResizedSpan,
  calculateSnappedDimension,
} from './resize-util.js';
import type IgcTileComponent from './tile.js';
import type { TileGridDimension, TileGridPosition } from './types.js';

const CssValues = /(?<start>\d+)?\s*\/?\s*span\s*(?<span>\d+)?/gi;

type ResizeAxis = 'column' | 'row';

type ResizeAxisState = {
  dimension: TileGridDimension;
  prevDelta: number;
  prevSnapped: number;
};

function createAxisState(
  dimension: TileGridDimension = { entries: [], minSize: 0 }
): ResizeAxisState {
  return { dimension, prevDelta: 0, prevSnapped: 0 };
}

function parseTileGridRect(tile: IgcTileComponent): TileGridPosition {
  const computed = getComputedStyle(tile);
  const { gridColumn, gridRow } = computed;

  const [column, row] = [
    firstOf(Array.from(gridColumn.matchAll(CssValues))).groups!,
    firstOf(Array.from(gridRow.matchAll(CssValues))).groups!,
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

  return {
    gap: asNumber(gap),
    columns: {
      entries: gridTemplateColumns.split(' ').map(asNumber),
      minSize: asNumber(computed.getPropertyValue('--min-col-width')),
    },
    rows: {
      entries: gridTemplateRows.split(' ').map(asNumber),
      minSize: asNumber(computed.getPropertyValue('--min-row-height')),
    },
  };
}

class TileResizeState {
  private _gap = 0;

  private _position: TileGridPosition = {
    column: { start: 0, span: 0 },
    row: { start: 0, span: 0 },
  };

  private _axes: Record<ResizeAxis, ResizeAxisState> = {
    column: createAxisState(),
    row: createAxisState(),
  };

  public calculateSnappedWidth(state: ResizeState): number {
    return this._calculateSnappedSize(
      'column',
      state.deltaX,
      state.current.width
    );
  }

  public calculateSnappedHeight(state: ResizeState): number {
    return this._calculateSnappedSize(
      'row',
      state.deltaY,
      state.current.height
    );
  }

  public updateState(
    tileRect: DOMRect,
    tile: IgcTileComponent,
    grid: HTMLElement
  ): void {
    this._initState(grid, tile);
    this._calculateTileStartPosition(grid, tileRect);
  }

  /**
   * Calculates and returns the CSS column and row properties of a tile after resizing,
   * based on its new dimensions and starting position.
   */
  public calculateResizedGridPosition(rect: DOMRect) {
    const { column, row } = this._position;

    // REVIEW pass col minSize and allowOverflow?
    column.span = calculateResizedSpan({
      targetSize: rect.width,
      tilePosition: column,
      tileGridDimension: this._axes.column.dimension,
      gap: this._gap,
      isRow: false,
    });

    row.span = calculateResizedSpan({
      targetSize: rect.height,
      tilePosition: row,
      tileGridDimension: this._axes.row.dimension,
      gap: this._gap,
      isRow: true,
    });

    return { colSpan: column.span, rowSpan: row.span };
  }

  private _calculateSnappedSize(
    axis: ResizeAxis,
    currentDelta: number,
    currentSize: number
  ): number {
    const axisState = this._axes[axis];

    const { snappedSize, newDelta } = calculateSnappedDimension({
      currentDelta,
      currentSize,
      prevDelta: axisState.prevDelta,
      prevSnapped: axisState.prevSnapped,
      gridEntries: axisState.dimension.entries,
      startIndex: this._position[axis].start,
      gap: this._gap,
    });

    axisState.prevDelta = newDelta;
    axisState.prevSnapped = snappedSize;
    return snappedSize;
  }

  private _initState(grid: HTMLElement, tile: IgcTileComponent): void {
    const { gap, columns, rows } = parseTileParentGrid(grid);

    this._gap = gap;
    this._position = parseTileGridRect(tile);
    this._axes = {
      column: createAxisState(columns),
      row: createAxisState(rows),
    };
  }

  /**
   * Resolves the tile's implicit grid start lines from its offset inside the
   * grid container when the tile has no explicit `colStart`/`rowStart`.
   */
  private _calculateTileStartPosition(
    grid: HTMLElement,
    tileRect: DOMRect
  ): void {
    const { column, row } = this._position;

    if (column.start >= 0 && row.start >= 0) {
      return;
    }

    const gridRect = grid.getBoundingClientRect();
    const computed = getComputedStyle(grid);

    if (column.start < 0) {
      column.start = calculatePosition(
        tileRect.left - gridRect.left - Number.parseFloat(computed.paddingLeft),
        this._axes.column.dimension.entries,
        this._gap
      );
    }

    if (row.start < 0) {
      row.start = calculatePosition(
        tileRect.top - gridRect.top - Number.parseFloat(computed.paddingTop),
        this._axes.row.dimension.entries,
        this._gap
      );
    }
  }
}

export function createTileResizeState(): TileResizeState {
  return new TileResizeState();
}

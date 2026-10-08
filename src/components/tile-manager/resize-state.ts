import type { ResizeState } from '#internals/directives/resize.js';
import { asNumber } from '#internals/utils/math.js';
import {
  calculatePosition,
  calculateResizedSpan,
  calculateSnappedDimension,
} from './resize-util.js';
import type IgcTileComponent from './tile.js';
import type {
  TileGridDimension,
  TileGridPosition,
  TilePosition,
} from './types.js';

const CssValues = /(?<start>\d+)?\s*\/?\s*span\s*(?<span>\d+)?/i;

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

/**
 * Parses a computed `[start /] span n`. Another form, as from author CSS, gives
 * start -1, which the layout resolves later, and the span of the tile property.
 */
function parseGridTrack(value: string, span: number): TilePosition {
  const groups = value.match(CssValues)?.groups;

  return {
    start: asNumber(groups?.start, -1),
    span: asNumber(groups?.span, span),
  };
}

function parseTileGridRect(tile: IgcTileComponent): TileGridPosition {
  const { gridColumn, gridRow } = getComputedStyle(tile);

  return {
    column: parseGridTrack(gridColumn, tile.colSpan),
    row: parseGridTrack(gridRow, tile.rowSpan),
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

  /** The column and row spans of the tile for the resized rectangle. */
  public calculateResizedGridPosition({ width, height }: DOMRect) {
    return {
      colSpan: this._calculateResizedSpan('column', width),
      rowSpan: this._calculateResizedSpan('row', height),
    };
  }

  private _calculateResizedSpan(axis: ResizeAxis, targetSize: number): number {
    return calculateResizedSpan({
      targetSize,
      tilePosition: this._position[axis],
      tileGridDimension: this._axes[axis].dimension,
      gap: this._gap,
      isRow: axis === 'row',
    });
  }

  private _calculateSnappedSize(
    axis: ResizeAxis,
    currentDelta: number,
    currentSize: number
  ): number {
    const axisState = this._axes[axis];

    const snappedSize = calculateSnappedDimension({
      currentDelta,
      currentSize,
      prevDelta: axisState.prevDelta,
      prevSnapped: axisState.prevSnapped,
      gridEntries: axisState.dimension.entries,
      startIndex: this._position[axis].start,
      gap: this._gap,
    });

    axisState.prevDelta = currentDelta;
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
   * Resolves a start that the computed placement does not give, for auto
   * placement or author CSS, from the offset of the tile in the grid.
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
      // Columns count from the inline-start edge, which is the right one in RTL.
      const offset =
        computed.direction === 'rtl'
          ? gridRect.right - tileRect.right
          : tileRect.left - gridRect.left;

      column.start = calculatePosition(
        offset - asNumber(computed.paddingInlineStart),
        this._axes.column.dimension.entries,
        this._gap
      );
    }

    if (row.start < 0) {
      row.start = calculatePosition(
        tileRect.top - gridRect.top - asNumber(computed.paddingTop),
        this._axes.row.dimension.entries,
        this._gap
      );
    }
  }
}

export function createTileResizeState(): TileResizeState {
  return new TileResizeState();
}

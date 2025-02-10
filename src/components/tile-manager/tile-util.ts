import { asNumber, first } from '../common/util.js';
import type { ResizeState } from '../resize-container/types.js';
import type IgcTileComponent from './tile.js';

type TilePosition = {
  start: number;
  span: number;
};

type TileGridPosition = {
  column: TilePosition;
  row: TilePosition;
};

type TileGridDimension = { count: number; entries: number[]; minSize: number };

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
      minSize: asNumber(computed.getPropertyValue('--ig-min-col-width')),
    },
    rows: {
      count: rows.length,
      entries: rows,
      minSize: asNumber(computed.getPropertyValue('--ig-min-row-height')),
    },
  };
}

class TileResizeState {
  private _initialPosition!: TileGridPosition;

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
    const deltaX = state.deltaX - this._prevDeltaX;
    this._prevDeltaX = state.deltaX;

    const gap = this._gap;
    const columns = this._columns.entries;

    let snappedWidth = state.current.width;
    let accumulatedWidth = 0;

    // REVIEW: Don't fall below column minSize
    if (Math.trunc(state.current.width) < this._columns.minSize) {
      return this._columns.entries[this._position.column.start];
    }

    if (deltaX === 0 && this._prevSnappedWidth) {
      return this._prevSnappedWidth;
    }

    for (let i = this._position.column.start - 1; i < columns.length; i++) {
      const currentColWidth = columns[i];
      const nextColWidth = columns[i + 1] || currentColWidth;
      const prevColWidth = i > 0 ? columns[i - 1] : currentColWidth;

      const halfwayExpand =
        accumulatedWidth + currentColWidth + gap + nextColWidth / 2;
      const halfwayShrink = accumulatedWidth + prevColWidth / 2;
      const columnEnd = accumulatedWidth + currentColWidth + gap;

      if (deltaX > 0) {
        if (
          state.current.width >= halfwayExpand &&
          state.current.width <= columnEnd + nextColWidth
        ) {
          snappedWidth = columnEnd + nextColWidth;
        }
      } else if (deltaX < 0) {
        if (
          state.current.width <= halfwayShrink &&
          state.current.width > accumulatedWidth
        ) {
          snappedWidth = accumulatedWidth - gap;
        }
      }

      accumulatedWidth += currentColWidth + gap;
    }

    this._prevSnappedWidth = snappedWidth;
    return snappedWidth;
  }

  public calculateSnappedHeight(state: ResizeState): number {
    const deltaY = state.deltaY - this._prevDeltaY;
    this._prevDeltaY = state.deltaY;

    const gap = this._gap;
    const rows = this._rows.entries;

    let snappedHeight = state.current.height;
    let accumulatedHeight = 0;

    // REVIEW: Don't fall below row minSize
    if (Math.trunc(state.current.height) < this._rows.minSize) {
      return this._rows.entries[this._position.row.start];
    }

    if (deltaY === 0 && this._prevSnappedHeight) {
      return this._prevSnappedHeight;
    }

    for (let i = this._position.row.start - 1; i < rows.length; i++) {
      const currentColHeight = rows[i];
      const nextColHeight = rows[i + 1] || currentColHeight;
      const prevColHeight = i > 0 ? rows[i - 1] : currentColHeight;

      const halfwayExpand =
        accumulatedHeight + currentColHeight + gap + nextColHeight / 2;
      const halfwayShrink = accumulatedHeight + prevColHeight / 2;
      const columnEnd = accumulatedHeight + currentColHeight + gap;

      if (deltaY > 0) {
        if (
          state.current.height >= halfwayExpand &&
          state.current.height <= columnEnd + nextColHeight
        ) {
          snappedHeight = columnEnd + nextColHeight;
        }
      } else if (deltaY < 0) {
        if (
          state.current.height <= halfwayShrink &&
          state.current.height > accumulatedHeight
        ) {
          snappedHeight = accumulatedHeight - gap;
        }
      }

      accumulatedHeight += currentColHeight + gap;
    }

    this._prevSnappedHeight = snappedHeight;
    return snappedHeight;
  }

  public updateState(
    tileRect: DOMRect,
    tile: IgcTileComponent,
    grid: HTMLElement
  ): void {
    const { gap, columns, rows } = parseTileParentGrid(grid);

    this._initialPosition = parseTileGridRect(tile);
    this._position = structuredClone(this._initialPosition);

    this._gap = gap;
    this._columns = columns;
    this._rows = rows;
    this._prevDeltaX = 0;
    this._prevDeltaY = 0;
    this._prevSnappedWidth = 0;
    this._prevSnappedHeight = 0;

    if (this._position.column.start < 0) {
      this._position.column.start = this.calculatePosition(
        tileRect.left + window.scrollX,
        this._columns.entries
      );
    }

    if (this._position.row.start < 0) {
      this._position.row.start = this.calculatePosition(
        tileRect.y + window.scrollY,
        this._rows.entries
      );
    }
  }

  /**
   * Calculates and returns the CSS column and row properties of a tile after resizing,
   * based on its new dimensions and starting position.
   */
  public getResizedPosition(rect: DOMRect) {
    const { column, row } = this._initialPosition;

    this._position.column.span = this.calculateResizedSpan(
      rect.width,
      this._position.column,
      this._columns.entries
    );
    this._position.row.span = this.calculateResizedSpan(
      rect.height,
      this._position.row,
      this._rows.entries
    );

    const cssColumn = `${column.start < 0 ? 'auto' : column.start} / span ${this._position.column.span}`;
    const cssRow = `${row.start < 0 ? 'auto' : row.start} / span ${this._position.row.span}`;

    return { column: cssColumn, row: cssRow };
  }

  private calculatePosition(targetPosition: number, sizes: number[]): number {
    const gap = this._gap;
    let accumulatedSize = 0;

    for (const [i, size] of sizes.entries()) {
      accumulatedSize += size + gap;

      if (Math.trunc(targetPosition) < Math.trunc(accumulatedSize - gap)) {
        return i + 1;
      }
    }

    return 1;
  }

  private calculateResizedSpan(
    targetSize: number,
    tilePosition: TilePosition,
    sizes: number[]
  ): number {
    let accumulatedSize = 0;
    let currentSpan = tilePosition.span;

    const sizesAfterStart = sizes.slice(tilePosition.start - 1);
    const availableSize =
      sizesAfterStart.reduce((sum, s) => sum + s, 0) +
      (sizes.length - 1) * this._gap;

    if (targetSize <= sizes[0] + this._gap) {
      return 1;
    }

    if (targetSize > availableSize) {
      return sizesAfterStart.length;
    }

    for (let i = tilePosition.start; i < sizes.length; i++) {
      const currentSize = sizes[i];
      const nextSize = sizes[i + 1] ?? currentSize;

      const halfwayPoint =
        accumulatedSize + currentSize + this._gap + nextSize / 2;

      if (targetSize > halfwayPoint) {
        currentSpan = i + 2 - tilePosition.start;
      } else {
        break;
      }

      accumulatedSize += currentSize + this._gap;
    }

    return currentSpan;
  }
}

export function createTileResizeState(): TileResizeState {
  return new TileResizeState();
}

export function createTileGhost(): HTMLElement {
  const element = document.createElement('div');

  Object.assign(element.style, {
    position: 'absolute',
    contain: 'strict',
    top: 0,
    left: 0,
    zIndex: 1000,
    background: 'var(--placeholder-background)',
    border: '2px solid var(--ghost-border)',
    borderRadius: 'var(--border-radius)',
    width: '100%',
    height: '100%',
  });

  return element;
}

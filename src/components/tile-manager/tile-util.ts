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

export const DraggedTileAttribute = 'data-drag-ghost-tile';

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
    const result = this.calculateSnappedDimension(
      state.current.width,
      state.deltaX,
      this._prevDeltaX,
      this._columns.entries,
      this._position.column.start,
      this._prevSnappedWidth,
      this._columns.minSize
    );

    this._prevDeltaX = result.newDelta;
    this._prevSnappedWidth = result.snapped;
    return result.snapped;
  }

  public calculateSnappedHeight(state: ResizeState): number {
    const result = this.calculateSnappedDimension(
      state.current.height,
      state.deltaY,
      this._prevDeltaY,
      this._rows.entries,
      this._position.row.start,
      this._prevSnappedHeight,
      this._rows.minSize
    );

    this._prevDeltaY = result.newDelta;
    this._prevSnappedHeight = result.snapped;
    return result.snapped;
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
  public getResizedPosition(rect: DOMRect) {
    const { column, row } = this._initialPosition;

    // REVIEW pass col minSize and allowOverflow?
    this._position.column.span = this.calculateResizedSpan(
      rect.width,
      this._position.column,
      this._columns.entries
    );

    this._position.row.span = this.calculateResizedSpan(
      rect.height,
      this._position.row,
      this._rows.entries,
      this._rows.minSize,
      true
    );

    const cssColumn = `${column.start < 0 ? 'auto' : column.start} / span ${this._position.column.span}`;
    const cssRow = `${row.start < 0 ? 'auto' : row.start} / span ${this._position.row.span}`;

    return { column: cssColumn, row: cssRow };
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

  private calculateSnappedDimension(
    currentSize: number,
    currentDelta: number,
    prevDelta: number,
    gridEntries: number[],
    startIndex: number,
    prevSnapped: number,
    minSize: number
  ): { snapped: number; newDelta: number } {
    const effectiveDelta = currentDelta - prevDelta;
    let snapped = currentSize;

    // If current size is below minimum, force to the size of the starting cell.
    if (Math.trunc(currentSize) < minSize) {
      return { snapped: gridEntries[startIndex], newDelta: currentDelta };
    }

    // If no change in delta and we have a snapped value, reuse it.
    if (effectiveDelta === 0 && prevSnapped) {
      return { snapped: prevSnapped, newDelta: currentDelta };
    }

    let accumulated = 0;
    for (let i = startIndex - 1; i < gridEntries.length; i++) {
      const currentEntry = gridEntries[i];
      const nextEntry = gridEntries[i + 1] ?? currentEntry;
      const prevEntry = i > 0 ? gridEntries[i - 1] : currentEntry;

      // Thresholds for snapping to the next or previous tile boundary.
      const halfwayExpand =
        accumulated + currentEntry + this.gap + nextEntry / 2;
      const halfwayShrink = accumulated + prevEntry / 2;
      const entryEnd = accumulated + currentEntry + this.gap;

      if (effectiveDelta > 0) {
        // Expanding: snap when passing the halfway threshold.
        if (
          currentSize >= halfwayExpand &&
          currentSize <= entryEnd + nextEntry
        ) {
          snapped = entryEnd + nextEntry;
        }
      } else if (effectiveDelta < 0) {
        // Shrinking: snap when falling below the halfway threshold.
        if (currentSize <= halfwayShrink && currentSize > accumulated) {
          snapped = accumulated - this.gap;
        }
      }

      accumulated += currentEntry + this.gap;
    }

    return { snapped, newDelta: currentDelta };
  }

  private calculateResizedSpan(
    targetSize: number,
    tilePosition: TilePosition,
    sizes: number[],
    minSize = 0,
    allowOverflow = false
  ): number {
    let accumulatedSize = 0;
    let newSpan = tilePosition.span;

    const sizesAfterStart = sizes.slice(tilePosition.start - 1);
    const availableSize =
      sizesAfterStart.reduce((sum, s) => sum + s, 0) +
      (sizes.length - 1) * this.gap;

    if (targetSize <= sizes[0] + this.gap) {
      return 1;
    }

    if (targetSize > availableSize) {
      const remainingSize = targetSize - availableSize;
      return this.calculateAdditionalSpan(
        remainingSize,
        sizesAfterStart.length,
        minSize,
        allowOverflow
      );
    }

    for (let i = tilePosition.start - 1; i < sizes.length; i++) {
      const currentSize = sizes[i];
      const nextSize = sizes[i + 1] ?? currentSize;

      const halfwayPoint =
        accumulatedSize + currentSize + this.gap + nextSize / 2;

      if (targetSize > halfwayPoint) {
        newSpan = i + 3 - tilePosition.start;
      } else {
        break;
      }

      accumulatedSize += currentSize + this.gap;
    }

    return newSpan;
  }

  private initState(grid: HTMLElement, tile: IgcTileComponent): void {
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
  }

  private calculateTileStartPosition(
    grid: HTMLElement,
    tileRect: DOMRect
  ): void {
    if (this._position.column.start < 0) {
      const offsetX = this.getGridOffset(grid, 'horizontal');

      this._position.column.start = this.calculatePosition(
        tileRect.left + window.scrollX + grid.scrollLeft - offsetX,
        this._columns.entries
      );
    }

    if (this._position.row.start < 0) {
      const offsetY = this.getGridOffset(grid, 'vertical');

      this._position.row.start = this.calculatePosition(
        tileRect.top + window.scrollY - offsetY,
        this._rows.entries
      );
    }
  }

  private calculatePosition(targetPosition: number, sizes: number[]): number {
    const gap = this.gap;
    let accumulatedSize = 0;

    for (const [i, size] of sizes.entries()) {
      accumulatedSize += size + gap;

      if (Math.trunc(targetPosition) < Math.trunc(accumulatedSize - gap)) {
        return i + 1;
      }
    }

    return 1;
  }

  private calculateAdditionalSpan(
    remainingSize: number,
    currentSpan: number,
    minSize: number,
    allowOverflow: boolean
  ) {
    if (allowOverflow) {
      const additionalSpan = Math.ceil(remainingSize / (minSize + this.gap));
      return currentSpan + additionalSpan;
    }

    return currentSpan;
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
}

export function createTileResizeState(): TileResizeState {
  return new TileResizeState();
}

export function createTileDragGhost(tile: IgcTileComponent): IgcTileComponent {
  const clone = tile.cloneNode(true) as IgcTileComponent;
  const computed = getComputedStyle(tile);

  const { width, height } = tile.getBoundingClientRect();

  clone.removeAttribute('id');
  clone.setAttribute(DraggedTileAttribute, '');
  clone.inert = true;
  clone.position = -1;

  Object.assign(clone.style, {
    position: 'absolute',
    contain: 'strict',
    top: 0,
    left: 0,
    width: `${width}px`,
    height: `${height}px`,
    background: `${computed.getPropertyValue('--tile-background')}`,
    border: `1px solid ${computed.getPropertyValue('--ghost-border')}`,
    borderRadius: computed.getPropertyValue('--border-radius'),
    zIndex: 1000,
    viewTransitionName: 'dragged-tile-ghost',
  });

  return clone;
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
    border: '1px solid var(--ghost-border)',
    borderRadius: 'var(--border-radius)',
    width: '100%',
    height: '100%',
  });

  return element;
}

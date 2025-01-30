import { asNumber } from '../common/util.js';
import type { ResizeState } from '../resize-container/types.js';
import type IgcTileComponent from './tile.js';

export class ResizeUtil {
  public static calculateSnappedWidth(
    deltaX: number,
    state: ResizeState,
    gap: number,
    columns: number[]
  ): number {
    let snappedWidth = state.current.width;
    let accumulatedWidth = 0;

    for (let i = 0; i < columns.length; i++) {
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

    return snappedWidth;
  }

  public static calculateSnappedHeight(
    deltaY: number,
    state: ResizeState,
    gap: number,
    rows: number[]
  ): number {
    let snappedHeight = state.current.height;
    let accumulatedHeight = 0;

    for (let i = 0; i < rows.length; i++) {
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

    return snappedHeight;
  }
}

type TileGridPosition = { column: number; row: number };
type TileGridColumns = { count: number; entries: number[]; minWidth: number };
type TileGridRows = { count: number; entries: number[]; minHeight: number };

class TileResizeState {
  protected _position: TileGridPosition = { column: 0, row: 0 };
  protected _gap = 0;
  protected _columns: TileGridColumns = {
    count: 0,
    entries: [],
    minWidth: 0,
  };
  protected _rows: TileGridRows = {
    count: 0,
    entries: [],
    minHeight: 0,
  };

  public get gap() {
    return this._gap;
  }

  public get position(): TileGridPosition {
    return structuredClone(this._position);
  }

  public get columns(): TileGridColumns {
    return structuredClone(this._columns);
  }

  public get rows(): TileGridRows {
    return structuredClone(this._rows);
  }

  public updateState(tile: IgcTileComponent, grid: HTMLElement): void {
    const styles = getComputedStyle(tile);
    const gridStyles = getComputedStyle(grid);

    const columns = gridStyles.gridTemplateColumns.split(' ');
    const rows = gridStyles.gridTemplateRows.split(' ');

    this._gap = asNumber(gridStyles.gap);

    Object.assign(this._columns, {
      count: columns.length,
      entries: columns.map(asNumber),
      minWidth: asNumber(styles.getPropertyValue('--ig-min-col-width')),
    });

    Object.assign(this._rows, {
      count: rows.length,
      entries: rows.map(asNumber),
      minHeight: asNumber(styles.getPropertyValue('--ig-min-row-height')),
    });
  }

  /**
   * Updates and returns the current column/row position of a tile component
   * based on its DOM rect and the parent CSS grid container.
   */
  public getPosition(rect: DOMRect): TileGridPosition {
    const points = { column: 0, row: 0 };

    points.column = this.calculatePosition(rect.left, this._columns.entries);

    points.row = this.calculatePosition(
      rect.y + window.scrollY,
      this._rows.entries
    );

    Object.assign(this._position, points);
    return points;
  }

  /**
   * Calculates and returns the column and row spans of a tile after resizing,
   * based on its new dimensions and starting position.
   */
  public getResizedPosition(
    rect: DOMRect,
    position: TileGridPosition
  ): TileGridPosition {
    const { column: startCol, row: startRow } = position;
    const spans = { column: 1, row: 1 };

    spans.column = this.calculateSpan(
      startCol,
      this._columns.entries,
      rect.width
    );

    spans.row = this.calculateSpan(startRow, this._rows.entries, rect.height);

    return spans;
  }

  private calculatePosition(targetPosition: number, sizes: number[]): number {
    let accumulatedSize = 0;

    for (const [i, value] of sizes.entries()) {
      accumulatedSize += value + this._gap;

      if (
        Math.trunc(targetPosition) < Math.trunc(accumulatedSize - this._gap)
      ) {
        return i;
      }
    }
    return 0;
  }

  private calculateSpan(
    startIndex: number,
    sizes: number[],
    targetSize: number
  ): number {
    let accumulatedSize = 0;

    for (let i = startIndex; i < sizes.length; i++) {
      accumulatedSize += sizes[i] + this._gap;
      if (Math.trunc(targetSize) <= Math.trunc(accumulatedSize)) {
        return i - startIndex + 1;
      }
    }

    return 1;
  }
}

export function createTileResizeState(): TileResizeState {
  return new TileResizeState();
}

export function createTileGhost(): HTMLDivElement {
  const element = document.createElement('div');

  Object.assign(element.style, {
    position: 'absolute',
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

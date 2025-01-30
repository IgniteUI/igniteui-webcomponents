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

  // REVIEW
  public static calculateSnappedHeight(
    deltaY: number,
    startingY: number,
    rowHeights: number[],
    rowGap: number,
    initialTop: number,
    initialHeight: number
  ): number {
    const snappedHeight = startingY + deltaY;
    const rowsAbove =
      ResizeUtil.calculate(initialTop, rowHeights, rowGap).targetIndex || 0;
    const res = ResizeUtil.calculate(snappedHeight, rowHeights, rowGap)!;
    const accumulatedHeight = res.accumulatedHeight;
    const startRowIndex = res.targetIndex;
    const aboveRowsHeight = ResizeUtil.accumulateHeight(
      rowsAbove,
      rowHeights,
      rowGap
    );

    let result = initialHeight;
    let previousRowsHeight = ResizeUtil.accumulateHeight(
      startRowIndex,
      rowHeights,
      rowGap
    );

    if (deltaY > 0) {
      const rowHeight = rowHeights[startRowIndex];
      const halfwayThreshold = previousRowsHeight + rowGap + rowHeight / 2;

      if (snappedHeight >= halfwayThreshold) {
        result = accumulatedHeight - aboveRowsHeight;
      } else {
        result = initialHeight + deltaY;
      }

      result = result <= 0 ? rowHeights[startRowIndex - 1] : result;
    } else if (deltaY < 0) {
      previousRowsHeight =
        previousRowsHeight === 0 ? rowHeights[0] : previousRowsHeight;
      const currentRowHeight = rowHeights[startRowIndex];
      const halfwayThreshold =
        accumulatedHeight - currentRowHeight / 2 - rowGap;

      if (startRowIndex !== 0 && startRowIndex >= startRowIndex - 1) {
        if (snappedHeight <= halfwayThreshold) {
          result =
            accumulatedHeight - currentRowHeight - rowGap - aboveRowsHeight;
        } else {
          result = rowHeights
            .slice(rowsAbove, startRowIndex)
            .reduce((sum, height) => sum + height, 0);
        }
      } else {
        result = snappedHeight - aboveRowsHeight;
      }
    }

    return result;
  }

  // REVIEW
  public static calculate(
    initialTop: number,
    rowHeights: number[],
    rowGap: number
  ): any {
    let targetIndex = 0;
    let accumulatedHeight = 0;

    for (let i = 0; i < rowHeights.length; i++) {
      accumulatedHeight += rowHeights[i] + (i > 0 ? rowGap : 0);
      if (initialTop <= accumulatedHeight) {
        targetIndex = i;
        break;
      }
    }

    return { targetIndex, accumulatedHeight };
  }

  // REVIEW
  private static accumulateHeight(
    rowIndex: number,
    rowHeights: number[],
    rowGap: number
  ): number {
    let accumulatedHeight = 0;
    for (let i = 0; i < rowIndex; i++) {
      accumulatedHeight += rowHeights[i] + rowGap;
    }

    return accumulatedHeight;
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
    let width = 0;

    for (const [i, value] of this._columns.entries.entries()) {
      width += value + this._gap;

      if (Math.trunc(rect.left) < Math.trunc(width - this._gap)) {
        points.column = i;
        break;
      }
    }

    // TODO: Same for rows

    Object.assign(this._position, points);
    return points;
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

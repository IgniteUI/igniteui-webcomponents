import type { ResizeState } from '../resize-container/types.js';

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

  public static calculateTileStartingColumn(
    startingPoint: number,
    gap: number,
    columns: number[]
  ): number {
    let accumulatedWidth = 0;

    for (let i = 0; i < columns.length; i++) {
      const colWidth = columns[i];
      accumulatedWidth += colWidth + (i > 0 ? gap : 0);

      if (startingPoint < accumulatedWidth) {
        return i;
      }
    }

    return 1;
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

export class ResizeUtil {
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

  private static calculate(
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

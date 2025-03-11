import type {
  ResizeProps,
  ResizeSpanProps,
  SnappedDimension,
  TilePosition,
} from './types.js';

export class ResizeUtil {
  private gap: number;

  constructor(gap: number) {
    this.gap = gap;
  }

  public calculateSnappedDimension(resizeProps: ResizeProps): SnappedDimension {
    const {
      currentDelta,
      prevDelta,
      currentSize,
      gridEntries,
      startIndex,
      prevSnapped,
    } = resizeProps;

    const effectiveDelta = currentDelta - prevDelta;
    let snappedSize = currentSize;

    // If current size is below minimum, force to the size of the starting cell.
    if (Math.trunc(currentSize) < gridEntries[startIndex - 1]) {
      return {
        snappedSize: gridEntries[startIndex - 1],
        newDelta: currentDelta,
      };
    }

    // If no change in delta and we have a snapped value, reuse it.
    if (effectiveDelta === 0 && prevSnapped) {
      return { snappedSize: prevSnapped, newDelta: currentDelta };
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
          snappedSize = entryEnd + nextEntry;
        }
      } else if (effectiveDelta < 0) {
        // Shrinking: snap when falling below the halfway threshold.
        if (
          currentSize <= halfwayShrink &&
          currentSize > accumulated - this.gap
        ) {
          snappedSize = accumulated - this.gap;
        }
      }

      accumulated += currentEntry + this.gap;
    }

    return { snappedSize, newDelta: currentDelta };
  }

  public calculateSizeFromEntries(entries: number[], position: TilePosition) {
    let accumulatedSize = 0;

    for (let i = 0; i < position.span; i++) {
      const gapSize = i > 0 ? this.gap : 0;
      accumulatedSize += entries[position.start - 1 + i] + gapSize;
    }

    return accumulatedSize;
  }

  public calculateResizedSpan(props: ResizeSpanProps): number {
    const { targetSize, tilePosition, tileGridDimension, gap, isRow } = props;
    const { entries, minSize } = tileGridDimension;

    let accumulatedSize = 0;
    let newSpan = tilePosition.span;

    const sizesAfterStart = entries.slice(tilePosition.start - 1);
    const availableSize =
      sizesAfterStart.reduce((sum, s) => sum + s, 0) +
      (sizesAfterStart.length - 1) * gap;

    if (targetSize <= entries[0] + gap) {
      return 1;
    }

    if (Math.trunc(targetSize) > Math.trunc(availableSize)) {
      const remainingSize = targetSize - availableSize;

      const additionalSpan = Math.ceil(remainingSize / (minSize + gap));
      newSpan = sizesAfterStart.length + additionalSpan;
      return isRow ? newSpan : Math.min(entries.length, newSpan);
    }

    for (let i = tilePosition.start - 1; i < entries.length; i++) {
      const currentSize = entries[i];
      const nextSize = entries[i + 1] ?? currentSize;

      const halfwayPoint = accumulatedSize + currentSize + gap + nextSize / 2;

      if (targetSize > halfwayPoint) {
        newSpan = i + 3 - tilePosition.start;
      } else {
        break;
      }

      accumulatedSize += currentSize + gap;
    }

    return newSpan;
  }

  public calculatePosition(targetPosition: number, sizes: number[]): number {
    let accumulatedSize = 0;

    for (const [i, size] of sizes.entries()) {
      accumulatedSize += size + this.gap;

      if (Math.trunc(targetPosition) < Math.trunc(accumulatedSize - this.gap)) {
        return i + 1;
      }
    }

    return 1;
  }
}

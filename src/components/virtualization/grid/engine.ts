import { VirtualScrollEngine } from '../engine.js';
import type { VisibleWindow } from './types.js';

/** A DOM scroll position on both axes, in px. Normalized for RTL. */
export interface ScrollPosition {
  top: number;
  left: number;
}

/** A viewport size on both axes, in px. */
export interface ViewportSize {
  width: number;
  height: number;
}

/** The row and column to bring into view. An omitted axis keeps its offset. */
export interface ScrollTarget {
  row?: number;
  column?: number;
}

/**
 * Two single-axis engines behind one facade. `rows` owns the vertical axis
 * and `columns` the horizontal one; each keeps its own size index and
 * coordinate compression. The facade turns one 2-D query into two 1-D
 * queries and nothing more, so every offset method stays on the axis
 * engines.
 */
export class VirtualGridEngine {
  public readonly rows = new VirtualScrollEngine();
  public readonly columns = new VirtualScrollEngine();

  /**
   * Called when sizes or counts change on either axis.
   * Example: `() => this.requestUpdate()`.
   */
  public set onSizeChange(callback: (() => void) | null) {
    this.rows.onSizeChange = callback;
    this.columns.onSizeChange = callback;
  }

  /** Measures the maximum browser size for the document on both axes. */
  public initMaxBrowserSize(doc: Document): void {
    this.rows.initMaxBrowserSize(doc);
    this.columns.initMaxBrowserSize(doc);
  }

  /**
   * The rows and columns to render for a DOM scroll position and viewport
   * size, each padded by its own over-scan.
   */
  public getVisibleWindow(
    scroll: ScrollPosition,
    viewport: ViewportSize,
    overScan: { rows: number; columns: number }
  ): VisibleWindow {
    return {
      rows: this.rows.getVisibleRange(
        scroll.top,
        viewport.height,
        overScan.rows
      ),
      columns: this.columns.getVisibleRange(
        scroll.left,
        viewport.width,
        overScan.columns
      ),
    };
  }

  /**
   * The scroll position that brings `target` into view according to
   * `options`: `block` aligns the row and `inline` the column. An axis
   * without a target keeps its `current` offset.
   */
  public resolveScrollPosition(
    target: ScrollTarget,
    current: ScrollPosition,
    viewport: ViewportSize,
    options?: ScrollIntoViewOptions
  ): ScrollPosition {
    return {
      top:
        target.row === undefined
          ? current.top
          : this.rows.resolveScrollOffset(
              target.row,
              current.top,
              viewport.height,
              options?.block
            ),
      left:
        target.column === undefined
          ? current.left
          : this.columns.resolveScrollOffset(
              target.column,
              current.left,
              viewport.width,
              options?.inline
            ),
    };
  }
}

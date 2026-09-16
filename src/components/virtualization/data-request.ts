import type { VirtualScrollDataRequest, VisibleRange } from './types.js';

/** How many items before the end of the loaded data a request is due. */
const NEAR_END_THRESHOLD = 5;
const MIN_REQUEST_COUNT = 20;

/**
 * Decides when a virtualized host asks its consumer for more items, and
 * for how many.
 *
 * One request is open at a time. A `data` change closes it, whether or not
 * items were appended. A source that is exhausted, and whose consumer
 * reassigns `data` in response to a request, must not receive the same
 * request on each reassignment, so a request is also not repeated for a
 * `total` it was already issued for.
 *
 * Kept across a disconnect of the host: a move in the DOM does not undo what
 * the consumer was already asked for.
 */
export class DataRequestTracker {
  private _pending = false;
  private _lastRequestedIndex = -1;

  /** Closes the open request. Called on each `data` change. */
  public reset(): void {
    this._pending = false;
  }

  /**
   * The request due for a rendered `range` over `total` loaded items, or
   * `null`. The requested count grows with `overScan`, so a host that renders
   * further ahead also asks for more.
   */
  public next(
    range: VisibleRange,
    total: number,
    overScan: number
  ): VirtualScrollDataRequest | null {
    if (
      this._pending ||
      total === 0 ||
      range.endIndex < total - NEAR_END_THRESHOLD ||
      this._lastRequestedIndex === total
    ) {
      return null;
    }

    this._pending = true;
    this._lastRequestedIndex = total;

    return {
      startIndex: total,
      count: Math.max(overScan * 4, MIN_REQUEST_COUNT),
    };
  }
}

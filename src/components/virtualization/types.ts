/**
 * Context for the item template in the virtual scroll component.
 * Provides the item data, its index, and utility properties for template rendering.
 */
export class VirtualScrollItemContext<T> {
  /** The current item in the virtual scroll */
  public value: T;
  /** The index of the current item */
  public index: number;
  /** The total number of items */
  public count: number;

  constructor(value: T, index: number, count: number) {
    this.value = value;
    this.index = index;
    this.count = count;
  }

  /** Whether the current item is the first item */
  public get isFirst(): boolean {
    return this.index === 0;
  }

  /** Whether the current item is the last item */
  public get isLast(): boolean {
    return this.index === this.count - 1;
  }
}

/** Snapshot of the currently rendered virtual window */
export interface VirtualScrollState {
  /** The index of the first item currently rendered in the viewport. */
  startIndex: number;
  /** The index of the last item currently rendered in the viewport (inclusive). */
  endIndex: number;
  /** The size of the viewport in pixels. */
  viewportSize: number;
  /** The total size of the virtual scroll content in pixels. */
  totalSize: number;
}

/**
 * Request for more data to be loaded in the virtual scroll, typically emitted when the user scrolls near the end of the currently loaded items.
 * The consumer of the virtual scroll component can listen to this event and load more data as needed.
 */
export interface VirtualScrollDataRequest {
  /**
   * The first index that does not yet have data.
   * Append at least `(endIndex - startIndex + 1)` more items starting here.
   */
  startIndex: number;
  /** Number of items being requested. */
  count: number;
}

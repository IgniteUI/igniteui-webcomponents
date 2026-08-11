/**
 * Context passed to the item template: the item data, its index and utility
 * properties for rendering.
 */
export class VirtualScrollItemContext<T> {
  /** The current item in the virtual scroll */
  public readonly value: T;
  /** The index of the current item */
  public readonly index: number;
  /** The total number of items */
  public readonly count: number;

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

/**
 * How `scrollToIndex` positions the requested item within the viewport.
 * Mirrors the subset of `ScrollLogicalPosition` the engine can act on.
 */
export type ScrollAlignment = 'start' | 'center' | 'end';

/** The currently visible (and over-scanned) range of items. */
export interface VisibleRange {
  /** Index of the first rendered item (inclusive) */
  startIndex: number;
  /** Index of the last rendered item (inclusive) */
  endIndex: number;
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
 * A request for more data, emitted when the rendered window comes near the end
 * of the loaded items. Consumers listen for it and append what it asks for.
 */
export interface VirtualScrollDataRequest {
  /**
   * The first index that does not yet have data.
   * Append at least `count` more items starting here.
   */
  startIndex: number;
  /** Number of items being requested. */
  count: number;
}

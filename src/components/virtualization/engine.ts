/**
 * Probes the browser for the maximum scrollable coordinate it supports.
 */
function getMaxBrowserSizeProbePx(doc: Document): number {
  const div = doc.createElement('div');
  div.style.position = 'absolute';
  div.style.top = `${Number.MAX_SAFE_INTEGER}px`;
  doc.body.appendChild(div);
  const size = Math.abs(div.getBoundingClientRect().top);
  doc.body.removeChild(div);
  return size;
}

/**
 * Binary Indexed Tree (Fenwick tree) over item sizes.
 *
 * Replaces the previous O(N) prefix-sum rebuild that occurred on every
 * `measureItem` call. All hot-path operations are O(log N):
 *   - Point update (item measured)        : O(log N)
 *   - Prefix sum (scroll offset)          : O(log N)
 *   - Index at offset (scroll → item)     : O(log N) via binary lifting
 */
class BIT {
  public readonly length: number;

  /** 1-indexed BIT; each cell holds a partial range sum. */
  private readonly _tree: Float64Array;

  /** Raw per-item sizes (0-indexed) — kept for O(1) reads and delta calc. */
  private readonly _sizes: Float64Array;

  /** Running total maintained alongside tree updates in O(1). */
  private _total: number;

  private constructor(
    length: number,
    sizes: Float64Array,
    tree: Float64Array,
    total: number
  ) {
    this.length = length;
    this._sizes = sizes;
    this._tree = tree;
    this._total = total;
  }

  /**
   * Creates a BIT of `length` items all initialized to `fillSize`. O(N).
   */
  public static filled(length: number, fillSize: number): BIT {
    const sizes = new Float64Array(length).fill(fillSize);
    const tree = new Float64Array(length + 1);
    const total = length * fillSize;

    // O(N) build (vs O(N log N) for N individual insertions)
    for (let i = 1; i <= length; i++) {
      tree[i] += fillSize;
      const j = i + (i & -i);
      if (j <= length) {
        tree[j] += tree[i];
      }
    }
    return new BIT(length, sizes, tree, total);
  }

  /**
   * Creates a BIT from an existing sizes array. O(N).
   */
  public static fromSizes(sizes: Float64Array): BIT {
    const length = sizes.length;
    const tree = new Float64Array(length + 1);
    let total = 0;

    for (let i = 1; i <= length; i++) {
      tree[i] += sizes[i - 1];
      total += sizes[i - 1];
      const j = i + (i & -i);
      if (j <= length) {
        tree[j] += tree[i];
      }
    }
    return new BIT(length, sizes, tree, total);
  }

  /** Total size of all items. O(1). */
  public get totalSize(): number {
    return this._total;
  }

  /**
   * Prefix sum of items [0, i) — the virtual scroll offset at the leading
   * edge of item i. O(log N).
   */
  public prefixSum(i: number): number {
    let sum = 0;
    for (let j = i; j > 0; j -= j & -j) {
      sum += this._tree[j];
    }
    return sum;
  }

  /**
   * Update the size of the item at 0-based index.
   * Returns true when the size actually changed. O(log N).
   */
  public update(index: number, newSize: number): boolean {
    if (index < 0 || index >= this.length) return false;

    const old = this._sizes[index];
    if (old === newSize) return false;

    const delta = newSize - old;
    this._sizes[index] = newSize;
    this._total += delta;
    for (let i = index + 1; i <= this.length; i += i & -i) {
      this._tree[i] += delta;
    }
    return true;
  }

  /**
   * Returns a new BIT of `newLength` items.
   * Existing measured sizes are preserved up to `min(this.length, newLength)`;
   * new slots are filled with `fillSize`. Single O(N) build pass.
   */
  public cloneResized(newLength: number, fillSize: number): BIT {
    const sizes = new Float64Array(newLength).fill(fillSize);
    sizes.set(this._sizes.subarray(0, Math.min(this.length, newLength)));
    return BIT.fromSizes(sizes);
  }

  /**
   * Returns the 0-based index of the item that contains the given scroll `offset`,
   * i.e. the largest i such that `prefixSum(i) <= offset < prefixSum(i + 1)`.
   * O(log N) via binary lifting on the internal tree.
   */
  public findIndexAtOffset(offset: number): number {
    if (offset <= 0 || this.length === 0) return 0;

    let idx = 0;
    let remaining = offset;

    for (let bit = 1 << (31 - Math.clz32(this.length)); bit > 0; bit >>= 1) {
      const next = idx + bit;
      if (next <= this.length && this._tree[next] <= remaining) {
        idx = next;
        remaining -= this._tree[idx];
      }
    }
    return Math.min(this.length - 1, idx);
  }
}

/**
 * Describes the currently visible (and over-scanned) range of items.
 */
export interface VisibleRange {
  /** Index of the first rendered item (inclusive) */
  startIndex: number;
  /** Index of the last rendered item (inclusive) */
  endIndex: number;
}

/**
 * Pure scroll-math engine for a single axis of virtual scrolling.
 *
 * All size state is held as plain arrays. Consumers can register an
 * `onSizeChange` callback to react whenever item sizes or the item count
 * changes (e.g. to trigger a Lit `requestUpdate()`).
 */
export class VirtualScrollEngine {
  private _maxBrowserSize = Number.POSITIVE_INFINITY;

  /**
   * The ratio `totalSize / maxBrowserSize` when `totalSize` exceeds the
   * maximum DOM coordinate the browser supports; `1` otherwise.
   * Used to map virtual scroll positions to DOM scroll positions.
   */
  private _virtualRatio = 1;

  /** Binary Indexed Tree for O(log N) size queries and updates. */
  private _tree: BIT | null = null;

  /**
   * Called whenever item sizes or the item count change.
   * Assign a callback (e.g. `() => this.requestUpdate()`) to react to size updates.
   */
  public onSizeChange: (() => void) | null = null;

  /** Total virtual size of all items in px. */
  public get totalSize(): number {
    return this._tree?.totalSize ?? 0;
  }

  /** Actual DOM space size (clamped to the maximum browser size) */
  public get domSize(): number {
    return this._virtualRatio !== 1 ? this._maxBrowserSize : this.totalSize;
  }

  /**
   * Initializes the maximum browser size by probing the document, and updates the virtual ratio accordingly.
   */
  public initMaxBrowserSize(doc: Document): void {
    this._maxBrowserSize = getMaxBrowserSizeProbePx(doc);
    this._updateVirtualRatio();
  }

  /**
   * Grows or shrinks the internal sizes array to `length`.
   * New entries are filled with `estimatedSize`.
   * Existing measured sizes are preserved.
   */
  public resize(length: number, estimatedSize: number): void {
    if (this._tree?.length === length) return;

    this._tree = this._tree
      ? this._tree.cloneResized(length, estimatedSize)
      : BIT.filled(length, estimatedSize);
    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /**
   * Records the measured DOM size for a single item.
   */
  public measureItem(index: number, size: number): void {
    if (!this._tree?.update(index, size)) return;

    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /**
   * Returns the DOM scroll offset in pixels that brings item at `index` into view
   * at the leading edge of the viewport.
   */
  public getScrollOffsetForIndex(index: number): number {
    if (!this._tree || index <= 0) return 0;

    const clamped = Math.min(index, this._tree.length);
    return this._tree.prefixSum(clamped) / this._virtualRatio;
  }

  /** Returns the item index at the given DOM scroll position. */
  public getIndexAtScroll(scrollPosition: number): number {
    if (!this._tree || scrollPosition <= 0) return 0;
    return this._tree.findIndexAtOffset(scrollPosition * this._virtualRatio);
  }

  /**
   * Returns the visible + over-scanned item range for the given scroll state.
   */
  public getVisibleRange(
    scrollPosition: number,
    viewportSize: number,
    overScan: number,
    totalItems: number
  ): VisibleRange {
    if (totalItems === 0 || viewportSize <= 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    const start = Math.max(0, this.getIndexAtScroll(scrollPosition) - overScan);
    const endScrollPosition = scrollPosition + viewportSize;
    const endRaw = this.getIndexAtScroll(endScrollPosition);
    const end = Math.min(totalItems - 1, endRaw + overScan);

    return { startIndex: start, endIndex: end };
  }

  /**
   * Returns the CSS `translateY` / `translateX` value (px) to apply to the
   * absolutely-positioned content wrapper.
   *
   * The content wrapper is `position: absolute; top: 0; left: 0` inside a
   * track element that is `totalSize` px tall/wide. Translating it to
   * `getContentPosition(startIndex)` places the first rendered item exactly
   * at its virtual scroll position within the track.
   */
  public getContentPosition(index: number): number {
    return this.getScrollOffsetForIndex(index);
  }

  /**
   * Returns the sum of actual sizes for items in [startIndex, endIndex].
   * Used to clamp the content translate offset under coordinate compression
   * so rendered items never overflow past `domSize`.
   */
  public getPhysicalRangeSize(startIndex: number, endIndex: number): number {
    if (!this._tree) return 0;

    const start = Math.max(0, startIndex);
    const end = Math.min(Math.max(endIndex + 1, start), this._tree.length);
    return this._tree.prefixSum(end) - this._tree.prefixSum(start);
  }

  private _updateVirtualRatio(): void {
    const totalSize = this._tree?.totalSize ?? 0;
    this._virtualRatio =
      this._maxBrowserSize === Number.POSITIVE_INFINITY ||
      totalSize <= this._maxBrowserSize
        ? 1
        : totalSize / this._maxBrowserSize;
  }
}

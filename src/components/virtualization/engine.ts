import { clamp } from '#internals/utils/math.js';
import type { ScrollAlignment, VisibleRange } from './types.js';

/**
 * The maximum scrollable coordinate of a document does not change.
 * All instances in one document share one probe result.
 */
const _maxBrowserSizeCache = new WeakMap<Document, number>();

/**
 * Measures the maximum scrollable coordinate that the browser supports.
 */
function getMaxBrowserSizeProbePx(doc: Document): number {
  const cached = _maxBrowserSizeCache.get(doc);
  if (cached !== undefined) {
    return cached;
  }

  const container = doc.body ?? doc.documentElement;
  if (!container) {
    return Number.POSITIVE_INFINITY;
  }

  const div = doc.createElement('div');
  div.style.position = 'absolute';
  div.style.top = `${Number.MAX_SAFE_INTEGER}px`;
  div.style.width = '0';
  div.style.height = '0';
  div.style.visibility = 'hidden';
  container.appendChild(div);
  const scrollOffset = doc.documentElement?.scrollTop ?? 0;
  const size = Math.abs(div.getBoundingClientRect().top) + scrollOffset;
  container.removeChild(div);

  _maxBrowserSizeCache.set(doc, size);
  return size;
}

/**
 * Clamps `index` into `[0, length - 1]`. This keeps `prefixSum(index)` and
 * `prefixSum(index + 1)` valid. Callers make sure that `length > 0`.
 */
function clampIndex(index: number, length: number): number {
  return clamp(index, 0, length - 1);
}

/**
 * Fills `tree` with the partial range sums of `sizes` in one O(N) pass.
 * `tree` is a 1-indexed Fenwick array of `sizes.length + 1` zeroed entries.
 * Returns the total sum.
 */
function buildTree(tree: Float64Array, sizes: Float64Array): number {
  const length = sizes.length;
  let total = 0;

  for (let i = 1; i <= length; i++) {
    tree[i] += sizes[i - 1];
    total += sizes[i - 1];
    const j = i + (i & -i);
    if (j <= length) {
      tree[j] += tree[i];
    }
  }
  return total;
}

/**
 * The size bookkeeping behind one axis. `SizeTree` serves items that are
 * measured one at a time. `UniformSizes` serves items that all share one
 * size and are never measured.
 */
interface SizeIndex {
  /** Number of items. */
  readonly length: number;
  /** Total size of all items. */
  readonly totalSize: number;
  /** Sum of the sizes of items [0, i): the offset at the leading edge of item i. */
  prefixSum(i: number): number;
  /**
   * The 0-based index of the item that contains `offset`: the largest i where
   * `prefixSum(i) <= offset < prefixSum(i + 1)`.
   */
  findIndexAtOffset(offset: number): number;
  /**
   * Records a measured size for the item at `index`. Returns true when the
   * size changed.
   */
  update(index: number, newSize: number): boolean;
  /**
   * A new index of `newLength` items. Existing sizes are kept up to
   * `retainCount`; the remainder is filled with `fillSize`. Returns `this`
   * when the result would be identical, so the caller can skip a
   * notification.
   */
  cloneResized(
    newLength: number,
    fillSize: number,
    retainCount?: number
  ): SizeIndex;
  /**
   * Sets `estimatedSize` on each item that is not measured. Returns true
   * when at least one size changed.
   */
  applyEstimate(estimatedSize: number): boolean;
}

/**
 * Binary Indexed Tree (Fenwick tree) over item sizes. Each hot-path operation
 * is O(log N): point update (item measured), prefix sum (scroll offset), and
 * index at offset (scroll to item, through binary lifting).
 */
class SizeTree implements SizeIndex {
  public readonly length: number;

  /** A 1-indexed BIT. Each cell holds a partial range sum. */
  private readonly _tree: Float64Array;

  /** Raw per-item sizes, 0-indexed. Kept for O(1) reads and delta calculation. */
  private readonly _sizes: Float64Array;

  /**
   * Flags the indices that hold a DOM-measured size (`1`) instead of an
   * estimate (`0`). `applyEstimate` changes only the estimated entries.
   */
  private readonly _measured: Uint8Array;

  /** Running total. Updated together with the tree in O(1). */
  private _total: number;

  /**
   * The highest power of two <= `length`, for the binary lifting in
   * `findIndexAtOffset`. Precomputed because that runs on each scroll event.
   */
  private readonly _topBit: number;

  private constructor(
    length: number,
    sizes: Float64Array,
    tree: Float64Array,
    total: number,
    measured: Uint8Array
  ) {
    this.length = length;
    this._sizes = sizes;
    this._tree = tree;
    this._total = total;
    this._measured = measured;
    this._topBit = length > 0 ? 1 << (31 - Math.clz32(length)) : 0;
  }

  /**
   * Creates a tree of `length` items, each set to `fillSize` and marked
   * unmeasured. O(N).
   */
  public static filled(length: number, fillSize: number): SizeTree {
    return SizeTree._build(
      new Float64Array(length).fill(fillSize),
      new Uint8Array(length)
    );
  }

  /**
   * Creates a tree from known sizes, each marked measured, so a later
   * `applyEstimate` leaves them alone. O(N).
   */
  public static fromSizes(sizes: ArrayLike<number>): SizeTree {
    return SizeTree._build(
      Float64Array.from(sizes),
      new Uint8Array(sizes.length).fill(1)
    );
  }

  /**
   * Builds a tree from a sizes array and its matching measured-flags array. O(N).
   */
  private static _build(sizes: Float64Array, measured: Uint8Array): SizeTree {
    const tree = new Float64Array(sizes.length + 1);
    const total = buildTree(tree, sizes);
    return new SizeTree(sizes.length, sizes, tree, total, measured);
  }

  /** Total size of all items. O(1). */
  public get totalSize(): number {
    return this._total;
  }

  /**
   * Prefix sum of items [0, i): the virtual scroll offset at the leading
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
   * Sets the size of the item at a 0-based index and marks the item as
   * measured. Later `applyEstimate()` calls do not change measured items.
   * Returns true when the size changed. O(log N).
   */
  public update(index: number, newSize: number): boolean {
    if (index < 0 || index >= this.length) return false;

    const old = this._sizes[index];
    this._measured[index] = 1;
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
   * Returns a new tree of `newLength` items in one O(N) pass. Sizes and
   * measured flags are kept up to `min(this.length, newLength, retainCount)`.
   * The remainder is filled with `fillSize` and marked unmeasured. Pass a
   * `retainCount` below the item count when the data behind those indices
   * changed identity.
   */
  public cloneResized(
    newLength: number,
    fillSize: number,
    retainCount = newLength
  ): SizeTree {
    if (newLength === this.length && retainCount >= newLength) return this;

    const sizes = new Float64Array(newLength).fill(fillSize);
    const measured = new Uint8Array(newLength);
    const retained = Math.max(0, Math.min(this.length, newLength, retainCount));
    sizes.set(this._sizes.subarray(0, retained));
    measured.set(this._measured.subarray(0, retained));
    return SizeTree._build(sizes, measured);
  }

  /**
   * Sets `estimatedSize` on each unmeasured item. Measured items do not
   * change. Returns true when at least one size changed.
   *
   * One estimate change can touch most of the list, so this rebuilds in one
   * O(N) pass instead of one O(log N) `update` per item.
   */
  public applyEstimate(estimatedSize: number): boolean {
    let changed = false;
    for (let i = 0; i < this.length; i++) {
      if (!this._measured[i] && this._sizes[i] !== estimatedSize) {
        this._sizes[i] = estimatedSize;
        changed = true;
      }
    }
    if (!changed) return false;

    this._tree.fill(0);
    this._total = buildTree(this._tree, this._sizes);
    return true;
  }

  /**
   * Returns the 0-based index of the item that contains the scroll `offset`:
   * the largest i where `prefixSum(i) <= offset < prefixSum(i + 1)`. O(log N).
   */
  public findIndexAtOffset(offset: number): number {
    if (offset <= 0 || this.length === 0) return 0;

    let idx = 0;
    let remaining = offset;

    for (let bit = this._topBit; bit > 0; bit >>= 1) {
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
 * Size index for items that all share one size. Every operation is O(1) and
 * there is no per-item state, so it serves any item count at no memory cost.
 * Measurements are rejected: the one size is the truth for every item.
 */
class UniformSizes implements SizeIndex {
  public readonly length: number;
  private _size: number;

  constructor(length: number, size: number) {
    this.length = length;
    this._size = size;
  }

  public get totalSize(): number {
    return this.length * this._size;
  }

  public prefixSum(i: number): number {
    return i * this._size;
  }

  public findIndexAtOffset(offset: number): number {
    if (this.length === 0 || this._size <= 0) return 0;
    return clamp(Math.floor(offset / this._size), 0, this.length - 1);
  }

  public update(): boolean {
    return false;
  }

  /**
   * There are no measurements to retain, so only the length matters. The
   * size follows `applyEstimate`, as it does for a tree.
   */
  public cloneResized(newLength: number, fillSize: number): UniformSizes {
    return newLength === this.length
      ? this
      : new UniformSizes(newLength, fillSize);
  }

  public applyEstimate(estimatedSize: number): boolean {
    if (this._size === estimatedSize) return false;
    this._size = estimatedSize;
    return true;
  }
}

/**
 * Pure scroll-math engine for one axis of virtual scrolling. A size index
 * holds all size state: a Fenwick tree for measured items, or one shared
 * size in fixed mode.
 *
 * ### Virtual and DOM coordinates
 *
 * Browsers limit how far an element can scroll. When the total item size is
 * larger than that limit, the engine compresses the *virtual* space
 * (`0…totalSize`) into the *DOM* space the browser can represent
 * (`0…domSize`) by the factor `_virtualRatio`. Each offset that crosses that
 * boundary is scaled: incoming scroll positions are multiplied by the ratio,
 * and outgoing offsets are divided by it. Items render at their real pixel
 * size, so item sizes are always virtual.
 */
export class VirtualScrollEngine {
  private _maxBrowserSize = Number.POSITIVE_INFINITY;

  /**
   * The ratio `totalSize / maxBrowserSize` when `totalSize` is larger than
   * the maximum DOM coordinate the browser supports; `1` otherwise.
   * Maps virtual scroll positions to DOM scroll positions.
   */
  private _virtualRatio = 1;

  /** Per-item sizes: a Fenwick tree, or one shared size in fixed mode. */
  private _sizes: SizeIndex | null = null;

  private _fixed = false;

  /** The estimate given to the last `resize` or `updateEstimatedSize`. */
  private _estimatedSize = 0;

  /**
   * Called when item sizes or the item count change.
   * Example: `() => this.requestUpdate()`.
   */
  public onSizeChange: (() => void) | null = null;

  /**
   * Whether every item shares one size, the current estimate, and
   * `measureItem` is a no-op. A change in either direction discards all
   * measured sizes: there is nothing to carry over between the two
   * representations. `setSizes` clears it.
   */
  public get fixed(): boolean {
    return this._fixed;
  }

  public set fixed(value: boolean) {
    if (value === this._fixed) return;

    this._fixed = value;
    if (!this._sizes) return;

    this._sizes = this._createIndex(this._sizes.length, this._estimatedSize);
    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /** Total virtual size of all items in px. */
  public get totalSize(): number {
    return this._sizes?.totalSize ?? 0;
  }

  /** Total size in DOM space, clamped to the maximum browser size. */
  public get domSize(): number {
    return this._virtualRatio !== 1 ? this._maxBrowserSize : this.totalSize;
  }

  /** Measures the maximum browser size for the document and rescales. */
  public initMaxBrowserSize(doc: Document): void {
    this._maxBrowserSize = getMaxBrowserSizeProbePx(doc);
    this._updateVirtualRatio();
  }

  /**
   * Resizes the internal sizes array to `length`. Measured sizes below
   * `retainCount` are kept. The remainder is filled with `estimatedSize` and
   * marked unmeasured. Callers that only append can keep the default
   * `retainCount`. Callers whose data changed identity at some index must
   * pass that index, so the stale measurements after it are discarded.
   */
  public resize(
    length: number,
    estimatedSize: number,
    retainCount = length
  ): void {
    this._estimatedSize = estimatedSize;

    if (this._sizes) {
      const resized = this._sizes.cloneResized(
        length,
        estimatedSize,
        retainCount
      );
      if (resized === this._sizes) return;
      this._sizes = resized;
    } else {
      this._sizes = this._createIndex(length, estimatedSize);
    }

    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /** A fresh index of `length` items at `size`, in the current mode. */
  private _createIndex(length: number, size: number): SizeIndex {
    return this._fixed
      ? new UniformSizes(length, size)
      : SizeTree.filled(length, size);
  }

  /**
   * Replaces every item size with the given values, all marked measured, so
   * a later `updateEstimatedSize` leaves them alone. Leaves fixed mode. O(N).
   *
   * For sizes the caller knows up front, for example column widths, instead
   * of one `measureItem` call per item. A later switch to `fixed` uses the
   * estimate of the last `resize` or `updateEstimatedSize`, not these sizes.
   */
  public setSizes(sizes: ArrayLike<number>): void {
    this._fixed = false;
    this._sizes = SizeTree.fromSizes(sizes);
    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /**
   * Records the measured DOM size for a single item. Ignored in fixed mode.
   */
  public measureItem(index: number, size: number): void {
    if (!this._sizes?.update(index, size)) return;

    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /**
   * Applies a new estimated size to each item that is not measured in the
   * DOM. Use this when `estimatedItemSize` changes but the item count does
   * not, because `resize` is then a no-op.
   */
  public updateEstimatedSize(estimatedSize: number): void {
    this._estimatedSize = estimatedSize;
    if (!this._sizes?.applyEstimate(estimatedSize)) return;

    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /**
   * Returns the DOM scroll offset in px that puts the item at `index` at the
   * leading edge of the viewport.
   */
  public getScrollOffsetForIndex(index: number): number {
    if (!this._sizes || index <= 0) return 0;

    const clamped = Math.min(index, this._sizes.length);
    return this._sizes.prefixSum(clamped) / this._virtualRatio;
  }

  /**
   * The largest DOM scroll offset the host can reach for the given viewport
   * size. A request beyond it does nothing, so offsets given to a caller
   * that waits for the scroll to settle are clamped to it.
   */
  private _getMaxScrollOffset(viewportSize: number): number {
    return Math.max(0, this.domSize - viewportSize);
  }

  /**
   * Returns the DOM scroll offset that positions the item at `index` in a
   * `viewportSize` px viewport, aligned by `align` and clamped to the
   * reachable scroll range.
   *
   * The slack is computed in virtual space against the item's real size and
   * converted to DOM space once, at the end. One DOM pixel equals
   * `_virtualRatio` virtual pixels, so mixed coordinates would scale the
   * slack.
   */
  public getAlignedScrollOffset(
    index: number,
    viewportSize: number,
    align: ScrollAlignment
  ): number {
    if (!this._sizes || this._sizes.length === 0) return 0;

    const clamped = clampIndex(index, this._sizes.length);
    const itemStart = this._sizes.prefixSum(clamped);
    let offset = itemStart;

    if (align !== 'start') {
      const itemEnd = this._sizes.prefixSum(clamped + 1);
      const slack = viewportSize - Math.max(0, itemEnd - itemStart);
      offset -= align === 'center' ? slack / 2 : slack;
    }

    return clamp(
      offset / this._virtualRatio,
      0,
      this._getMaxScrollOffset(viewportSize)
    );
  }

  /**
   * Whether the item at `index` is visible without more scrolling at the
   * given DOM scroll position. True when the item is fully inside the
   * viewport, or when it is larger than the viewport and covers it fully.
   * The second case matches native `scrollIntoView({ block: 'nearest' })`.
   */
  public isIndexInView(
    index: number,
    scrollPosition: number,
    viewportSize: number
  ): boolean {
    if (!this._sizes || this._sizes.length === 0) return false;

    const clamped = clampIndex(index, this._sizes.length);
    const itemStart = this._sizes.prefixSum(clamped);
    const itemEnd = this._sizes.prefixSum(clamped + 1);
    const viewStart = Math.max(0, scrollPosition) * this._virtualRatio;
    const viewEnd = viewStart + viewportSize;

    const contained = itemStart >= viewStart && itemEnd <= viewEnd;
    const spanning = itemStart <= viewStart && itemEnd >= viewEnd;

    return contained || spanning;
  }

  /**
   * Returns the visible and over-scanned item range for the given scroll
   * state.
   */
  public getVisibleRange(
    scrollPosition: number,
    viewportSize: number,
    overScan: number
  ): VisibleRange {
    if (!this._sizes || this._sizes.length === 0 || viewportSize <= 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    // The viewport is not scaled by the virtual ratio. Items render at their
    // real pixel size, so a `viewportSize` px viewport always shows that many
    // virtual pixels of items, at any compression of the scroll range.
    const startOffset = Math.max(0, scrollPosition) * this._virtualRatio;
    const first = this._sizes.findIndexAtOffset(startOffset);
    const last = this._sizes.findIndexAtOffset(startOffset + viewportSize);

    return {
      startIndex: Math.max(0, first - overScan),
      endIndex: Math.min(this._sizes.length - 1, last + overScan),
    };
  }

  /**
   * Sum of the actual sizes of the items in [startIndex, endIndex]. The
   * render pass uses it to clamp the content translate offset, so rendered
   * items do not overflow past `domSize` under coordinate compression.
   */
  public getPhysicalRangeSize(startIndex: number, endIndex: number): number {
    if (!this._sizes) return 0;

    const start = Math.max(0, startIndex);
    const end = Math.min(Math.max(endIndex + 1, start), this._sizes.length);
    return this._sizes.prefixSum(end) - this._sizes.prefixSum(start);
  }

  private _updateVirtualRatio(): void {
    const totalSize = this._sizes?.totalSize ?? 0;
    this._virtualRatio =
      totalSize <= this._maxBrowserSize ? 1 : totalSize / this._maxBrowserSize;
  }
}

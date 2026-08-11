import { clamp } from '../../internals/utils/math.js';
import type { ScrollAlignment, VisibleRange } from './types.js';

/**
 * The maximum scrollable coordinate doesn't change over a document's lifetime,
 * so instances sharing one document share a single probe.
 */
const _maxBrowserSizeCache = new WeakMap<Document, number>();

/**
 * Probes the browser for the maximum scrollable coordinate it supports.
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
 * Clamps `index` into `[0, length - 1]`, keeping both `prefixSum(index)` and
 * `prefixSum(index + 1)` addressable. Callers guard for `length > 0`.
 */
function clampIndex(index: number, length: number): number {
  return clamp(index, 0, length - 1);
}

/**
 * Fills `tree` - a 1-indexed Fenwick array of `sizes.length + 1` entries,
 * expected to be zeroed - with the partial range sums of `sizes` in a single
 * O(N) pass. Returns the grand total.
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
 * Binary Indexed Tree (Fenwick tree) over item sizes. Every hot-path
 * operation is O(log N): point update (item measured), prefix sum (scroll
 * offset) and index at offset (scroll -> item, via binary lifting).
 */
class SizeTree {
  public readonly length: number;

  /** 1-indexed BIT; each cell holds a partial range sum. */
  private readonly _tree: Float64Array;

  /** Raw per-item sizes (0-indexed), kept for O(1) reads and delta calc. */
  private readonly _sizes: Float64Array;

  /**
   * Which indices hold a real, DOM-measured size (`1`) rather than an
   * estimate (`0`). Only the latter are touched by `applyEstimate`.
   */
  private readonly _measured: Uint8Array;

  /** Running total maintained alongside tree updates in O(1). */
  private _total: number;

  /**
   * Highest power-of-two <= `length`, for the binary lifting in
   * `findIndexAtOffset`. Precomputed since that runs on every scroll event.
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
   * Creates a tree of `length` items all initialized to `fillSize`, none of
   * which are considered measured yet. O(N).
   */
  public static filled(length: number, fillSize: number): SizeTree {
    return SizeTree._build(
      new Float64Array(length).fill(fillSize),
      new Uint8Array(length)
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
   * Update the size of the item at 0-based index. Marks the item as
   * explicitly measured, exempting it from future `applyEstimate()` calls.
   * Returns true when the size actually changed. O(log N).
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
   * Returns a new tree of `newLength` items in a single O(N) pass. Sizes and
   * their measured flags are preserved up to
   * `min(this.length, newLength, retainCount)`; the rest is filled with
   * `fillSize` and marked unmeasured. Pass a `retainCount` below the item
   * count when the data behind those indices changed identity.
   */
  public cloneResized(
    newLength: number,
    fillSize: number,
    retainCount = newLength
  ): SizeTree {
    const sizes = new Float64Array(newLength).fill(fillSize);
    const measured = new Uint8Array(newLength);
    const retained = Math.max(0, Math.min(this.length, newLength, retainCount));
    sizes.set(this._sizes.subarray(0, retained));
    measured.set(this._measured.subarray(0, retained));
    return SizeTree._build(sizes, measured);
  }

  /**
   * Applies `estimatedSize` to every unmeasured item, leaving measured ones
   * untouched. Returns true when at least one size changed.
   *
   * One estimate change can affect most of the list at once, so this rebuilds
   * in a single O(N) pass instead of one O(log N) `update` per item.
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
   * Returns the 0-based index of the item containing the scroll `offset`, i.e.
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
 * Pure scroll-math engine for a single axis of virtual scrolling. All size
 * state is held in a Fenwick tree.
 *
 * ### Virtual vs DOM coordinates
 *
 * Browsers cap how far an element can be scrolled. When the summed item size
 * exceeds that cap, the engine compresses the *virtual* space (`0…totalSize`)
 * into the *DOM* space the browser can represent (`0…domSize`) by the factor
 * `_virtualRatio`. Every offset crossing that boundary is scaled: incoming
 * scroll positions are multiplied by the ratio, outgoing offsets divided by
 * it. Item sizes render at their real px size and so are always virtual.
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
  private _tree: SizeTree | null = null;

  /**
   * Called whenever item sizes or the item count change, e.g.
   * `() => this.requestUpdate()`.
   */
  public onSizeChange: (() => void) | null = null;

  /** Total virtual size of all items in px. */
  public get totalSize(): number {
    return this._tree?.totalSize ?? 0;
  }

  /** Total size in DOM space, clamped to the maximum browser size. */
  public get domSize(): number {
    return this._virtualRatio !== 1 ? this._maxBrowserSize : this.totalSize;
  }

  /** Probes the document for the maximum browser size and rescales. */
  public initMaxBrowserSize(doc: Document): void {
    this._maxBrowserSize = getMaxBrowserSizeProbePx(doc);
    this._updateVirtualRatio();
  }

  /**
   * Grows or shrinks the internal sizes array to `length`. Measured sizes
   * below `retainCount` are preserved; the rest is refilled with
   * `estimatedSize` and marked unmeasured. Callers that only append can leave
   * `retainCount` at its default; callers whose data changed identity at some
   * index must pass it, so the stale measurements behind it are discarded.
   */
  public resize(
    length: number,
    estimatedSize: number,
    retainCount = length
  ): void {
    if (this._tree?.length === length && retainCount >= length) return;

    this._tree = this._tree
      ? this._tree.cloneResized(length, estimatedSize, retainCount)
      : SizeTree.filled(length, estimatedSize);
    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /** Records the measured DOM size for a single item. */
  public measureItem(index: number, size: number): void {
    if (!this._tree?.update(index, size)) return;

    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /**
   * Applies a new estimated size to every item not yet measured in the DOM.
   * Use this when `estimatedItemSize` changes but the item count doesn't, so
   * `resize` would be a no-op.
   */
  public updateEstimatedSize(estimatedSize: number): void {
    if (!this._tree?.applyEstimate(estimatedSize)) return;

    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  /**
   * Returns the DOM scroll offset in px that puts the item at `index` at the
   * leading edge of the viewport.
   */
  public getScrollOffsetForIndex(index: number): number {
    if (!this._tree || index <= 0) return 0;

    const clamped = Math.min(index, this._tree.length);
    return this._tree.prefixSum(clamped) / this._virtualRatio;
  }

  /**
   * The largest DOM scroll offset the host can reach for the given viewport
   * size. Requesting anything beyond it silently does nothing, so offsets
   * handed out to a caller that waits for the scroll to settle are clamped
   * to it.
   */
  private _getMaxScrollOffset(viewportSize: number): number {
    return Math.max(0, this.domSize - viewportSize);
  }

  /**
   * Returns the DOM scroll offset that positions the item at `index`
   * according to `align` within a `viewportSize` px viewport, clamped to the
   * reachable scroll range.
   *
   * The slack is computed in virtual space against the item's real size and
   * converted to DOM space once, at the end: a DOM pixel is worth
   * `_virtualRatio` virtual pixels, so mixing the two would scale the slack.
   */
  public getAlignedScrollOffset(
    index: number,
    viewportSize: number,
    align: ScrollAlignment
  ): number {
    if (!this._tree || this._tree.length === 0) return 0;

    const clamped = clampIndex(index, this._tree.length);
    const itemStart = this._tree.prefixSum(clamped);
    let offset = itemStart;

    if (align !== 'start') {
      const itemEnd = this._tree.prefixSum(clamped + 1);
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
   * Whether the item at `index` needs no scrolling to be seen at the given DOM
   * scroll position: either it sits entirely inside the viewport, or it is
   * larger than the viewport and already covers it end to end. The latter
   * mirrors native `scrollIntoView({ block: 'nearest' })`.
   */
  public isIndexInView(
    index: number,
    scrollPosition: number,
    viewportSize: number
  ): boolean {
    if (!this._tree || this._tree.length === 0) return false;

    const clamped = clampIndex(index, this._tree.length);
    const itemStart = this._tree.prefixSum(clamped);
    const itemEnd = this._tree.prefixSum(clamped + 1);
    const viewStart = Math.max(0, scrollPosition) * this._virtualRatio;
    const viewEnd = viewStart + viewportSize;

    const contained = itemStart >= viewStart && itemEnd <= viewEnd;
    const spanning = itemStart <= viewStart && itemEnd >= viewEnd;

    return contained || spanning;
  }

  /**
   * Returns the visible + over-scanned item range for the given scroll state.
   */
  public getVisibleRange(
    scrollPosition: number,
    viewportSize: number,
    overScan: number
  ): VisibleRange {
    if (!this._tree || this._tree.length === 0 || viewportSize <= 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    // The viewport is *not* scaled by the virtual ratio: items render at their
    // real px size, so a `viewportSize` px viewport always shows that many
    // virtual px worth of items, however compressed the scroll range is.
    const startOffset = Math.max(0, scrollPosition) * this._virtualRatio;
    const first = this._tree.findIndexAtOffset(startOffset);
    const last = this._tree.findIndexAtOffset(startOffset + viewportSize);

    return {
      startIndex: Math.max(0, first - overScan),
      endIndex: Math.min(this._tree.length - 1, last + overScan),
    };
  }

  /**
   * Sum of the actual sizes of the items in [startIndex, endIndex]. Clamps the
   * content translate offset so rendered items never overflow past `domSize`
   * under coordinate compression.
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
      totalSize <= this._maxBrowserSize ? 1 : totalSize / this._maxBrowserSize;
  }
}

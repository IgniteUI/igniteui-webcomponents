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

/** The item holds the estimate. */
const UNMEASURED = 0;
/** The item was measured under an older estimate. */
const MEASURED = 1;
/** The item was measured under the current estimate. */
const SAMPLED = 2;

/**
 * Binary Indexed Tree (Fenwick tree) over item sizes. Each hot-path operation
 * is O(log N): point update (item measured), prefix sum (scroll offset), and
 * index at offset (scroll to item, through binary lifting).
 *
 * The tree holds only the measured sizes and the number of measured items.
 * Each unmeasured item counts as `estimate`, so an estimate change is O(1).
 */
class SizeTree {
  public readonly length: number;

  /** The size of each unmeasured item. */
  public estimate: number;

  /** A 1-indexed BIT of the measured sizes. */
  private readonly _sums: Float64Array;

  /** A 1-indexed BIT of the number of measured items. */
  private readonly _counts: Int32Array;

  /** Raw measured sizes, 0-indexed. Kept for O(1) delta calculation. */
  private readonly _sizes: Float64Array;

  /** `UNMEASURED`, `MEASURED` or `SAMPLED` for each item. */
  private readonly _states: Uint8Array;

  private _measuredCount = 0;
  private _measuredTotal = 0;

  /** Count and size sum of the `SAMPLED` items. */
  private _sampleCount = 0;
  private _sampleTotal = 0;

  /**
   * The highest power of two <= `length`, for the binary lifting in
   * `findIndexAtOffset`. Precomputed because that runs on each scroll event.
   */
  private readonly _topBit: number;

  /** Builds the tree in one O(N) pass. Without `states`, no item is measured. */
  constructor(
    length: number,
    estimate: number,
    sizes = new Float64Array(length),
    states = new Uint8Array(length)
  ) {
    this.length = length;
    this.estimate = estimate;
    this._sizes = sizes;
    this._states = states;
    this._sums = new Float64Array(length + 1);
    this._counts = new Int32Array(length + 1);
    this._topBit = length > 0 ? 1 << (31 - Math.clz32(length)) : 0;

    for (let i = 1; i <= length; i++) {
      const state = states[i - 1];

      if (state !== UNMEASURED) {
        const size = sizes[i - 1];
        this._sums[i] += size;
        this._counts[i]++;
        this._measuredCount++;
        this._measuredTotal += size;

        if (state === SAMPLED) {
          this._sampleCount++;
          this._sampleTotal += size;
        }
      }

      const parent = i + (i & -i);
      if (parent <= length) {
        this._sums[parent] += this._sums[i];
        this._counts[parent] += this._counts[i];
      }
    }
  }

  /** Total size of all items. O(1). */
  public get totalSize(): number {
    return (
      this._measuredTotal + (this.length - this._measuredCount) * this.estimate
    );
  }

  /** The average size of the `SAMPLED` items, or `0` if there are none. */
  public get sampleAverage(): number {
    return this._sampleCount > 0 ? this._sampleTotal / this._sampleCount : 0;
  }

  /** Whether each item before `index` is measured. O(log N). */
  public isMeasuredBefore(index: number): boolean {
    let count = 0;
    for (let j = index; j > 0; j -= j & -j) {
      count += this._counts[j];
    }
    return count === index;
  }

  /**
   * Prefix sum of items [0, i): the virtual scroll offset at the leading
   * edge of item i. O(log N).
   */
  public prefixSum(i: number): number {
    let sum = 0;
    let count = 0;
    for (let j = i; j > 0; j -= j & -j) {
      sum += this._sums[j];
      count += this._counts[j];
    }
    return sum + (i - count) * this.estimate;
  }

  /**
   * Sets the size of the item at a 0-based index and marks it `SAMPLED`.
   * Returns true when the size changed. O(log N).
   */
  public update(index: number, size: number): boolean {
    if (index < 0 || index >= this.length) return false;

    const state = this._states[index];
    const isNew = state === UNMEASURED;
    const old = isNew ? 0 : this._sizes[index];
    const delta = size - old;

    this._states[index] = SAMPLED;
    this._sizes[index] = size;
    this._measuredTotal += delta;
    this._sampleTotal += state === SAMPLED ? delta : size;
    if (state !== SAMPLED) this._sampleCount++;
    if (isNew) this._measuredCount++;

    if (isNew || delta !== 0) {
      for (let i = index + 1; i <= this.length; i += i & -i) {
        this._sums[i] += delta;
        if (isNew) this._counts[i]++;
      }
    }

    return size !== (isNew ? this.estimate : old);
  }

  /**
   * Returns a new tree of `newLength` items. Measured sizes are kept up to
   * `min(this.length, newLength, retainCount)`, and the other items are
   * unmeasured. Pass a `retainCount` below the item count when the data
   * behind those indices changed identity. O(N).
   */
  public cloneResized(newLength: number, retainCount = newLength): SizeTree {
    const retained = Math.max(0, Math.min(this.length, newLength, retainCount));
    const sizes = new Float64Array(newLength);
    const states = new Uint8Array(newLength);
    sizes.set(this._sizes.subarray(0, retained));
    states.set(this._states.subarray(0, retained));
    return new SizeTree(newLength, this.estimate, sizes, states);
  }

  /**
   * Starts a new sample: `sampleAverage` then counts only the items measured
   * after this call. O(N).
   */
  public startSample(): void {
    for (let i = 0; i < this.length; i++) {
      if (this._states[i] === SAMPLED) {
        this._states[i] = MEASURED;
      }
    }
    this._sampleCount = 0;
    this._sampleTotal = 0;
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
      if (next > this.length) continue;

      // Node `next` covers the `bit` items after `idx`.
      const size =
        this._sums[next] + (bit - this._counts[next]) * this.estimate;
      if (size <= remaining) {
        idx = next;
        remaining -= size;
      }
    }
    return Math.min(this.length - 1, idx);
  }
}

/**
 * Pure scroll-math engine for one axis of virtual scrolling. A Fenwick tree
 * holds all size state.
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
   * Maps a virtual scroll position to a DOM scroll position. The ratio
   * `totalSize / maxBrowserSize` if `totalSize` is larger than the maximum DOM
   * coordinate of the browser, and `1` in all other cases.
   */
  private _virtualRatio = 1;

  /** Binary Indexed Tree for O(log N) size queries and updates. */
  private _tree: SizeTree | null = null;

  /** The estimate last given to `resize` or `updateEstimatedSize`. */
  private _configuredEstimate = Number.NaN;

  /** Whether `adaptEstimate` has applied a measured average. */
  private _hasAdaptedEstimate = false;

  /**
   * Called when item sizes or the item count change.
   * Example: `() => this.requestUpdate()`.
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

  /** Measures the maximum browser size for the document and rescales. */
  public initMaxBrowserSize(doc: Document): void {
    this._maxBrowserSize = getMaxBrowserSizeProbePx(doc);
    this._updateVirtualRatio();
  }

  /**
   * Resizes the internal sizes array to `length`. Measured sizes below
   * `retainCount` are kept, and the other items are unmeasured. Callers that
   * only append can keep the default `retainCount`. Callers whose data
   * changed identity at some index must pass that index, so the stale
   * measurements after it are discarded.
   *
   * Unmeasured items take `estimatedSize`, or the adapted average while
   * `estimatedSize` stays the same: a data change does not make it less
   * accurate.
   */
  public resize(
    length: number,
    estimatedSize: number,
    retainCount = length
  ): void {
    if (this._tree?.length === length && retainCount >= length) return;

    const reconfigured = this._configureEstimate(estimatedSize);
    const tree =
      this._tree?.cloneResized(length, retainCount) ??
      new SizeTree(length, estimatedSize);

    if (reconfigured) {
      tree.estimate = estimatedSize;
    }
    this._tree = tree;
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
   * Applies a new estimated size to each item that is not measured in the
   * DOM. Use this when `estimatedItemSize` changes but the item count does
   * not, because `resize` is then a no-op.
   */
  public updateEstimatedSize(estimatedSize: number): void {
    if (this._configureEstimate(estimatedSize)) {
      this._applyEstimate(estimatedSize);
    }
  }

  /**
   * Sets the estimate of the unmeasured items to the average size measured
   * since the estimate was last configured. Older sizes can be out of date,
   * for example after a density change.
   *
   * The first change applies anywhere. A later one applies only while each
   * item before `windowStart` is measured: the offset of the rendered items
   * then does not depend on the estimate, so the change cannot move them.
   */
  public adaptEstimate(windowStart: number): void {
    const tree = this._tree;
    if (!tree?.sampleAverage) return;
    if (this._hasAdaptedEstimate && !tree.isMeasuredBefore(windowStart)) return;

    this._hasAdaptedEstimate = true;
    this._applyEstimate(tree.sampleAverage);
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
   * size. A request past it does nothing, so an offset given to a caller that
   * waits for the scroll to settle is clamped to this value.
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
   * Returns the DOM scroll offset that brings the item at `index` into view
   * as `position` asks. `nearest` follows native `scrollIntoView`: an item in
   * view, or one that covers the viewport, keeps `scrollPosition`, and any
   * other item scrolls the smallest distance to an edge alignment.
   */
  public resolveScrollOffset(
    index: number,
    scrollPosition: number,
    viewportSize: number,
    position: ScrollLogicalPosition = 'start'
  ): number {
    if (position === 'nearest') {
      const start = this.getAlignedScrollOffset(index, viewportSize, 'start');
      const end = this.getAlignedScrollOffset(index, viewportSize, 'end');
      return clamp(scrollPosition, Math.min(start, end), Math.max(start, end));
    }

    return this.getAlignedScrollOffset(
      index,
      viewportSize,
      position === 'center' || position === 'end' ? position : 'start'
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
   * Returns the visible and over-scanned item range for the given scroll
   * state.
   */
  public getVisibleRange(
    scrollPosition: number,
    viewportSize: number,
    overScan: number
  ): VisibleRange {
    if (!this._tree || this._tree.length === 0 || viewportSize <= 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    // The virtual ratio does not scale the viewport. Items render at their real
    // pixel size, so a `viewportSize` px viewport shows that many virtual pixels
    // of items at any compression of the scroll range.
    const startOffset = Math.max(0, scrollPosition) * this._virtualRatio;
    const first = this._tree.findIndexAtOffset(startOffset);
    const last = this._tree.findIndexAtOffset(startOffset + viewportSize);

    return {
      startIndex: Math.max(0, first - overScan),
      endIndex: Math.min(this._tree.length - 1, last + overScan),
    };
  }

  /**
   * Sum of the actual sizes of the items in [startIndex, endIndex]. The
   * render pass uses it to clamp the content translate offset, so rendered
   * items do not overflow past `domSize` under coordinate compression.
   */
  public getPhysicalRangeSize(startIndex: number, endIndex: number): number {
    if (!this._tree) return 0;

    const start = Math.max(0, startIndex);
    const end = Math.min(Math.max(endIndex + 1, start), this._tree.length);
    return this._tree.prefixSum(end) - this._tree.prefixSum(start);
  }

  /**
   * Records a changed configured estimate and starts a new sample. Returns
   * false for an unchanged one, which keeps the adapted average.
   */
  private _configureEstimate(estimatedSize: number): boolean {
    if (estimatedSize === this._configuredEstimate) return false;

    this._configuredEstimate = estimatedSize;
    this._tree?.startSample();
    return true;
  }

  private _applyEstimate(estimatedSize: number): void {
    const tree = this._tree;
    if (!tree) return;

    const total = tree.totalSize;
    tree.estimate = estimatedSize;
    if (tree.totalSize === total) return;

    this._updateVirtualRatio();
    this.onSizeChange?.();
  }

  private _updateVirtualRatio(): void {
    const totalSize = this._tree?.totalSize ?? 0;
    this._virtualRatio =
      totalSize <= this._maxBrowserSize ? 1 : totalSize / this._maxBrowserSize;
  }
}

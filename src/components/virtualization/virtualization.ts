import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { createIndexedResizeController } from '#internals/controllers/indexed-resize.js';
import { createLayoutSettleController } from '#internals/controllers/layout-settle.js';
import { createLightDomStylesController } from '#internals/controllers/light-dom-styles.js';
import { createResizeObserverController } from '#internals/controllers/resize-observer.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { commonPrefixLength } from '#internals/utils/arrays.js';
import { getBorderBoxSize, isLTR } from '#internals/utils/dom.js';
import { clamp } from '#internals/utils/math.js';
import { equal } from '#internals/utils/objects.js';
import {
  EMPTY_RANGE,
  normalizeOverScan,
  normalizeSize,
  rangesEqual,
  sliceRange,
  VirtualScrollEngine,
} from './engine.js';
import { ScrollCorrectionController } from './scroll-correction.js';
import {
  type VirtualScrollDataRequest,
  VirtualScrollItemContext,
  type VirtualScrollState,
  type VisibleRange,
} from './types.js';

export type VirtualScrollItemTemplate<T> = (
  context: VirtualScrollItemContext<T>
) => TemplateResult | typeof nothing;

export interface IgcVirtualScrollComponentEventMap {
  igcStateChange: CustomEvent<VirtualScrollState>;
  igcDataRequest: CustomEvent<VirtualScrollDataRequest>;
}

const REMOTE_SCROLLING_THRESHOLD = 5;
const SCROLL_OFFSET_EPSILON_PX = 1;
/** Fallback for a non-positive `estimatedItemSize`. Equal to its default. */
const DEFAULT_ESTIMATED_ITEM_SIZE = 50;
const DEFAULT_OVER_SCAN = 2;

function offsetsEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < SCROLL_OFFSET_EPSILON_PX;
}

const STYLES = `
  :where(igc-virtual-scroll) {
    display: block;
    position: relative;
    overflow: auto;
    height: 18.75rem;
  }

  :where(igc-virtual-scroll[orientation='vertical']) {
    overflow-y: auto;
    overflow-x: hidden;
  }

  :where(igc-virtual-scroll[orientation='horizontal']) {
    overflow-x: auto;
    overflow-y: hidden;
  }

  :where(igc-virtual-scroll) [part="virtualization-track"] {
    position: relative;
    width: 100%;
    min-height: 100%;
  }

  :where(igc-virtual-scroll) [part="virtualization-content"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    will-change: transform;
    contain: layout style paint;
  }

  :where(igc-virtual-scroll[orientation='horizontal']) [part="virtualization-track"] {
    height: 100%;
    width: auto;
    min-height: unset;
  }

  :where(igc-virtual-scroll[orientation='horizontal']) [part="virtualization-content"] {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: auto;
  }

  :where(igc-virtual-scroll[orientation='horizontal']) [part="virtualization-content"] > [data-vs-index] {
    flex-shrink: 0;
    height: 100%;
  }

  :where(igc-virtual-scroll[orientation='horizontal']):dir(rtl) [part="virtualization-content"] {
    left: auto;
    right: 0;
  }
`;

/**
 * A virtual scroll component for large lists. Only the items visible in the
 * viewport are rendered.
 *
 * @element igc-virtual-scroll
 *
 * @fires igcStateChange - Emitted when the rendered virtual window changes.
 * @fires igcDataRequest - Emitted when the rendered window comes within a few items of the end
 * of `data`. Also emitted on the first render, when the loaded items do not fill the viewport.
 *
 * @csspart virtualization-track - The full-size element that gives the host its scrollable extent.
 * @csspart virtualization-content - The wrapper that holds the rendered items, translated into
 * position within the track.
 */
export default class IgcVirtualScrollComponent<
  T = any,
> extends EventEmitterMixin<
  IgcVirtualScrollComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-virtual-scroll';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcVirtualScrollComponent);
  }

  //#region Internal state

  protected readonly _engine = new VirtualScrollEngine();
  private readonly _contentRef = createRef<HTMLDivElement>();
  private readonly _itemResizeController = createIndexedResizeController(this, {
    indexKey: 'vsIndex',
    callback: this._handleItemResize,
  });
  private readonly _layoutSettle = createLayoutSettleController(this);
  private readonly _scrollCorrection = new ScrollCorrectionController<number>(
    this,
    {
      current: () => this._currentAxisScroll(),
      equals: offsetsEqual,
      scroll: (offset, behavior) => this._applyScroll(offset, behavior),
    }
  );

  private _currentRange: VisibleRange = EMPTY_RANGE;
  private _lastEmittedState: VirtualScrollState | null = null;
  private _hasPendingDataRequest = false;

  /**
   * The `startIndex` of the last emitted `igcDataRequest`, which is also the
   * item count at that emit. See `_checkDataRequest`.
   *
   * Kept across a disconnect, like `_hasPendingDataRequest`: a move in the
   * DOM does not undo what the consumer was already asked for. If only one
   * of the two were cleared, the request loop would reopen on reconnect.
   */
  private _lastDataRequestIndex = -1;

  /**
   * The live scroll offset on the active axis. Not reactive by design:
   * `render` reads it only through `_currentRange`, so `_handleScroll`
   * schedules an update only when the window moves.
   */
  private _scrollPosition = 0;

  @state()
  private _viewportSize = 0;

  //#endregion

  //#region Public properties

  /**
   * The array of items to virtualize.
   *
   * Compared by reference: a mutation in place (`data.push(...)`) causes no
   * update. Assign a new array instead. The `igcDataRequest` flow also
   * expects a new array.
   */
  @property({ attribute: false })
  public data: T[] = [];

  /**
   * Scroll orientation of the virtual scroll.
   * @attr orientation
   * @default 'vertical'
   */
  @property({ reflect: true })
  public orientation: 'vertical' | 'horizontal' = 'vertical';

  /**
   * Number of extra items to render beyond the visible area of the viewport.
   * Higher values reduce blank flashes during fast scrolling but can lower performance.
   * @attr over-scan
   * @default 2
   */
  @property({ type: Number, attribute: 'over-scan' })
  public overScan = 2;

  /**
   * Estimated item size in pixels, used before an item is measured in the DOM.
   * After the first render of an item, the engine replaces the estimate with the measured size.
   * With `fixedItemSize` set, this is the exact size of every item.
   * @attr estimated-item-size
   * @default 50
   */
  @property({ type: Number, attribute: 'estimated-item-size' })
  public estimatedItemSize = DEFAULT_ESTIMATED_ITEM_SIZE;

  /**
   * Whether every item has the size given by `estimatedItemSize`.
   *
   * Items are then not measured in the DOM. The offset math is constant time
   * and the component keeps no per-item state, so any item count costs the
   * same. Set it when the item template renders at one known size. An item
   * that renders at another size overlaps its neighbor or leaves a gap,
   * because nothing corrects the offsets.
   * @attr fixed-item-size
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'fixed-item-size' })
  public fixedItemSize = false;

  /**
   * A function that renders each item in the virtual scroll list.
   * Receives a VirtualScrollItemContext<T> with the item data, its index, and the total count.
   * Without it, nothing is rendered.
   *
   * Items are measured by their border box, so margins accumulate as drift
   * down the list. Use padding on the item, or a gap on a wrapper, instead.
   *
   * Only the current window is in the DOM, so assistive technology cannot
   * infer an item's position from the markup. Templates that render a role
   * with set semantics (`option`, `listitem`, `row`, ...) should map the
   * context's `index` and `count` onto `aria-posinset` and `aria-setsize`.
   */
  @property({ attribute: false })
  public itemTemplate: VirtualScrollItemTemplate<T> | null = null;

  //#endregion

  constructor() {
    super();
    this._engine.onSizeChange = () => this.requestUpdate();
    this._handleScroll = this._handleScroll.bind(this);

    createLightDomStylesController(this, STYLES);
    createResizeObserverController(this, {
      callback: this._measureViewport,
    });
  }

  //#region Lit lifecycle

  /** @internal */
  public override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this._engine.initMaxBrowserSize(this.ownerDocument);
    this._measureViewport();
    this.addEventListener('scroll', this._handleScroll, { passive: true });
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('scroll', this._handleScroll);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('fixedItemSize')) {
      this._engine.fixed = this.fixedItemSize;
    }

    if (changed.has('data')) {
      this._engine.resize(
        this._items.length,
        this._normalizedItemSize,
        this._firstChangedIndex(changed.get('data'))
      );
      this._hasPendingDataRequest = false;
    }

    if (changed.has('estimatedItemSize')) {
      this._engine.updateEstimatedSize(this._normalizedItemSize);
    }

    if (changed.has('orientation')) {
      this._measureViewport();
      this._scrollPosition = this._currentAxisScroll();
    }

    this._currentRange = this._computeRange();
  }

  protected override updated(_changed: PropertyValues<this>): void {
    this._scheduleItemMeasurement();
    this._checkDataRequest();
    this._emitStateChange();
  }

  protected override render(): TemplateResult {
    if (!this.itemTemplate) {
      return html`${nothing}`;
    }

    const items = this._items;
    const range = this._currentRange;
    const count = items.length;
    const isVertical = this._isVertical;

    const trackStyle = isVertical
      ? { height: `${this._engine.domSize}px` }
      : { width: `${this._engine.domSize}px` };

    // The content wrapper is absolutely positioned at the origin of a track
    // that is `domSize` px tall or wide. A translation to the first rendered
    // item's scroll offset puts that item at its virtual position.
    const contentPosition = this._engine.getRangeOffset(range);
    const isRTL = !isVertical && !isLTR(this);
    const contentStyle = {
      transform: isVertical
        ? `translateY(${contentPosition}px)`
        : `translateX(${isRTL ? -contentPosition : contentPosition}px)`,
    };

    const visibleItems = sliceRange(items, range);

    return html`
      <div
        part="virtualization-track"
        role="presentation"
        style=${styleMap(trackStyle)}
      >
        <div
          ${ref(this._contentRef)}
          part="virtualization-content"
          role="presentation"
          style=${styleMap(contentStyle)}
        >
          ${visibleItems.map((item, i) => {
            const itemIndex = range.startIndex + i;
            const ctx = new VirtualScrollItemContext(item, itemIndex, count);
            return html`<div role="presentation" data-vs-index=${itemIndex}>
              ${this.itemTemplate!(ctx)}
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  //#endregion

  //#region Internal API

  private get _isVertical(): boolean {
    return this.orientation === 'vertical';
  }

  /** The configured `overScan`, normalized to a non-negative integer. */
  private get _normalizedOverScan(): number {
    return normalizeOverScan(this.overScan, DEFAULT_OVER_SCAN);
  }

  /** The configured `estimatedItemSize`, normalized to a positive number. */
  private get _normalizedItemSize(): number {
    return normalizeSize(this.estimatedItemSize, DEFAULT_ESTIMATED_ITEM_SIZE);
  }

  /** `data`, guarded against a nullish value set by the consumer. */
  private get _items(): T[] {
    return this.data ?? [];
  }

  /**
   * The window to render for the current scroll position and viewport. Empty
   * until an `itemTemplate` is set, because nothing renders without one.
   */
  private _computeRange(): VisibleRange {
    return this.itemTemplate
      ? this._engine.getVisibleRange(
          this._scrollPosition,
          this._viewportSize,
          this._normalizedOverScan
        )
      : EMPTY_RANGE;
  }

  /**
   * The scroll offset that aligns `index` in the viewport according to
   * `options`. The active axis reads `block` when vertical and `inline`,
   * with `block` as a fallback, when horizontal.
   */
  private _getAlignedScrollOffset(
    index: number,
    options?: ScrollIntoViewOptions
  ): number {
    const position = this._isVertical
      ? options?.block
      : (options?.inline ?? options?.block);

    return this._engine.resolveScrollOffset(
      index,
      this._currentAxisScroll(),
      this._viewportSize,
      position
    );
  }

  /** Applies a scroll offset to the correct axis, accounting for RTL. */
  private _applyScroll(offset: number, behavior: ScrollBehavior): void {
    if (this._isVertical) {
      this.scrollTo({ top: offset, behavior });
    } else {
      this.scrollTo({ left: isLTR(this) ? offset : -offset, behavior });
    }
  }

  /** The current real scroll position on the active axis, normalized for RTL. */
  private _currentAxisScroll(): number {
    return this._isVertical
      ? this.scrollTop
      : isLTR(this)
        ? this.scrollLeft
        : -this.scrollLeft;
  }

  private _measureViewport(): void {
    this._viewportSize = this._isVertical
      ? this.clientHeight
      : this.clientWidth;
  }

  /**
   * Records the new scroll offset. Schedules a render only when the rendered
   * window moves.
   *
   * `render` derives the track size, the content translate, and the item
   * slice from `_currentRange`, not from the scroll offset. Without the
   * guard, a scroll inside one item would re-run each item template for an
   * identical result. `willUpdate` still recomputes `_currentRange` for each
   * other trigger, so this suppresses only redundant passes, never a needed
   * one.
   */
  private _handleScroll(): void {
    this._scrollPosition = this._currentAxisScroll();

    if (!rangesEqual(this._computeRange(), this._currentRange)) {
      this.requestUpdate();
    }
  }

  /**
   * The number of leading items that kept their identity across a `data`
   * change: the index of the first item whose measured size no longer
   * matches its rendered content. An append (the `igcDataRequest` flow)
   * retains all items. A filter or a replacement retains only the unchanged
   * prefix.
   */
  private _firstChangedIndex(previous: T[] | undefined): number {
    return previous ? commonPrefixLength(previous, this._items) : 0;
  }

  private _handleItemResize(index: number, entry: ResizeObserverEntry): void {
    const measured = getBorderBoxSize(
      entry,
      this._isVertical ? 'block' : 'inline'
    );

    if (measured > 0) {
      this._engine.measureItem(index, measured);
    }
  }

  /**
   * Synchronizes the item observer with the rendered window. In fixed mode
   * nothing is observed: the size is known, and a measurement would be
   * ignored by the engine anyway.
   */
  private _scheduleItemMeasurement(): void {
    this._itemResizeController.sync(
      this.fixedItemSize ? null : this._contentRef.value
    );
  }

  /**
   * Emits `igcStateChange`. Skipped when the window is empty or equal to the
   * last reported one, because measurement passes re-render without a window
   * change.
   */
  private _emitStateChange(): void {
    const { startIndex, endIndex } = this._currentRange;
    if (endIndex < startIndex) return;

    const detail: VirtualScrollState = {
      startIndex,
      endIndex,
      viewportSize: this._viewportSize,
      totalSize: this._engine.totalSize,
    };

    if (equal(this._lastEmittedState, detail)) {
      return;
    }

    this._lastEmittedState = { ...detail };
    this.emitEvent('igcStateChange', { detail });
  }

  private _checkDataRequest(): void {
    if (this._hasPendingDataRequest) return;

    const range = this._currentRange;
    const total = this._items.length;

    if (total === 0 || range.endIndex < total - REMOTE_SCROLLING_THRESHOLD) {
      return;
    }

    // Each `data` change clears `_hasPendingDataRequest`, including one that
    // appends nothing. Without this second guard, a consumer whose source is
    // exhausted, and that reassigns `data` in response to a request, would
    // receive the same request on each reassignment.
    if (this._lastDataRequestIndex === total) {
      return;
    }

    this._hasPendingDataRequest = true;
    this._lastDataRequestIndex = total;

    this.emitEvent('igcDataRequest', {
      detail: {
        startIndex: total,
        count: Math.max(this._normalizedOverScan * 4, 20),
      },
    });
  }

  //#endregion

  //#region Public API

  /* blazorSuppress */
  /**
   * Resolves when the virtual scroll has settled: the current render pass is
   * complete, the item-size measurements it triggers are complete, and so
   * are the renders those measurements schedule.
   *
   * `updateComplete` covers one Lit render pass. This covers `data` changes,
   * scrolls, and viewport resizes, where the stable DOM state comes after
   * one or more follow-up renders.
   */
  public get layoutComplete(): Promise<void> {
    return this._layoutSettle.complete;
  }

  /**
   * Scrolls to the specified item index.
   *
   * Items outside the rendered window have only an estimated size, so the
   * first jump can miss the target. The items at the landing point are then
   * measured, and the scroll position is corrected. This repeats until the
   * offset is stable.
   *
   * The returned promise resolves when the scroll settles on the final,
   * corrected offset. Callers that need only the first, approximate scroll
   * can ignore it.
   */
  public scrollToIndex(
    index: number,
    options?: ScrollIntoViewOptions
  ): Promise<void> {
    const clampedIndex = clamp(index, 0, Math.max(0, this._items.length - 1));

    return this._scrollCorrection.run(
      () => this._getAlignedScrollOffset(clampedIndex, options),
      options?.behavior ?? 'auto'
    );
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-virtual-scroll': IgcVirtualScrollComponent;
  }
}

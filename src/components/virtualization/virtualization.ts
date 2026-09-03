import {
  html,
  isServer,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { createResizeObserverController } from '#internals/controllers/resize-observer.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { isLTR } from '#internals/utils/dom.js';
import { asNumber, clamp } from '#internals/utils/math.js';
import { VirtualScrollEngine } from './engine.js';
import {
  type ScrollAlignment,
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
const MAX_LAYOUT_SETTLE_PASSES = 20;
const MAX_SCROLL_CORRECTION_PASSES = 5;
const SCROLL_END_TIMEOUT_MS = 2000;
const SCROLL_OFFSET_EPSILON_PX = 1;
/** Fallback for a non-positive `estimatedItemSize`. Equal to its default. */
const DEFAULT_ESTIMATED_ITEM_SIZE = 50;
/** How long the scroll position must stay unchanged to count as settled. */
const SCROLL_IDLE_MS = 100;
/**
 * Upper limit on one `requestAnimationFrame` wait. A hidden tab or a
 * disconnected element gets no frames, and `layoutComplete` must still
 * resolve there.
 */
const LAYOUT_FRAME_TIMEOUT_MS = 100;

/**
 * `scrollend` reports exactly when a scroll has settled. Safari before 18.2
 * does not have it, and `_scrollAndWaitForEnd` falls back to a scroll-idle
 * timer there.
 */
const SUPPORTS_SCROLL_END = !isServer && 'onscrollend' in window;

const EMPTY_RANGE: VisibleRange = Object.freeze({
  startIndex: 0,
  endIndex: -1,
});

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

  private static _styleSheet: CSSStyleSheet | null = null;

  private static _getStyleSheet(): CSSStyleSheet {
    if (!IgcVirtualScrollComponent._styleSheet) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(`
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
      `);
      IgcVirtualScrollComponent._styleSheet = sheet;
    }
    return IgcVirtualScrollComponent._styleSheet;
  }

  //#region Internal state

  protected readonly _engine = new VirtualScrollEngine();
  private readonly _contentRef = createRef<HTMLDivElement>();
  private readonly _itemResizeController = createResizeObserverController(
    this,
    {
      callback: this._handleItemResize,
      target: null,
      requestUpdate: false,
    }
  );

  private _currentRange: VisibleRange = EMPTY_RANGE;

  /**
   * The item index each wrapper element was last observed under. Lit reuses
   * the wrapper elements across renders. After a scroll, the same element
   * can host a different item at an identical size, and a ResizeObserver
   * does not report that. See `_scheduleItemMeasurement`.
   */
  private readonly _observedItemIndexes = new WeakMap<Element, number>();
  private _lastEmittedState: VirtualScrollState | null = null;
  private _hasPendingDataRequest = false;
  private _layoutCompletePromise: Promise<void> | null = null;
  private _scrollRequestId = 0;

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
   * @attr estimated-item-size
   * @default 50
   */
  @property({ type: Number, attribute: 'estimated-item-size' })
  public estimatedItemSize = DEFAULT_ESTIMATED_ITEM_SIZE;

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

  private _adoptStyles(): void {
    /* c8 ignore next 3 */
    if (isServer) {
      return;
    }

    const root = this.getRootNode() as Document | ShadowRoot;
    const sheet = IgcVirtualScrollComponent._getStyleSheet();
    if (!root.adoptedStyleSheets.includes(sheet)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    }
  }

  constructor() {
    super();
    this._engine.onSizeChange = () => this.requestUpdate();
    this._handleScroll = this._handleScroll.bind(this);

    // Viewport resize observer
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
    this._adoptStyles();
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
    // TODO: Either fix this in the theming controller or come up with some other solution.

    // Verified on every update, not only in `connectedCallback`; a no-op
    // when the sheet is already present. A host that renders this component
    // in its own shadow root (for example, combo) can have that root's
    // `adoptedStyleSheets` replaced by its theming logic. That drops this
    // sheet without this element reconnecting.
    this._adoptStyles();

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
    let contentPosition = this._engine.getScrollOffsetForIndex(
      range.startIndex
    );
    const physicalRangeSize = this._engine.getPhysicalRangeSize(
      range.startIndex,
      range.endIndex
    );
    contentPosition = clamp(
      contentPosition,
      0,
      this._engine.domSize - physicalRangeSize
    );
    const isRTL = !isVertical && !isLTR(this);
    const contentStyle = {
      transform: isVertical
        ? `translateY(${contentPosition}px)`
        : `translateX(${isRTL ? -contentPosition : contentPosition}px)`,
    };

    const visibleItems =
      range.endIndex >= range.startIndex
        ? items.slice(range.startIndex, range.endIndex + 1)
        : [];

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
    return Math.max(0, Math.floor(asNumber(this.overScan, 2)));
  }

  /** The configured `estimatedItemSize`, normalized to a positive number. */
  private get _normalizedItemSize(): number {
    const size = asNumber(this.estimatedItemSize);
    return size > 0 ? size : DEFAULT_ESTIMATED_ITEM_SIZE;
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
   * `options`, from the engine's current size data. As more items are
   * measured, the same input can give a different, more accurate result.
   *
   * For `block: 'nearest'` on an item already in view, returns the current
   * offset, so no scroll occurs.
   */
  private _getAlignedScrollOffset(
    index: number,
    options?: ScrollIntoViewOptions
  ): number {
    const requested = this._isVertical
      ? (options?.block ?? 'start')
      : (options?.inline ?? options?.block ?? 'start');
    const current = this._currentAxisScroll();

    if (
      requested === 'nearest' &&
      this._engine.isIndexInView(index, current, this._viewportSize)
    ) {
      return current;
    }

    const align: ScrollAlignment =
      requested === 'center' || requested === 'end' ? requested : 'start';

    return this._engine.getAlignedScrollOffset(
      index,
      this._viewportSize,
      align
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

  /**
   * Applies a scroll offset to the active axis and waits for the scroll,
   * instant or smooth, to settle.
   *
   * `scrollend` does not fire when the requested offset does not move the
   * scroll position, so that case resolves immediately. The timeout covers
   * an event that never arrives, for example when the element disconnects
   * mid-scroll.
   */
  private _scrollAndWaitForEnd(
    offset: number,
    behavior: ScrollBehavior
  ): Promise<void> {
    if (
      Math.abs(this._currentAxisScroll() - offset) < SCROLL_OFFSET_EPSILON_PX
    ) {
      return Promise.resolve();
    }

    return this._withDeadline(SCROLL_END_TIMEOUT_MS, (signal) => {
      const settled = SUPPORTS_SCROLL_END
        ? this._waitForScrollEnd(signal)
        : this._waitForScrollIdle(signal);

      // Applied only after the listener is attached, so an instant scroll
      // cannot settle before something watches for it.
      this._applyScroll(offset, behavior);
      return settled;
    });
  }

  /**
   * Resolves with `task` or with a deadline of `ms`, whichever comes first.
   * The signal then tears down the other, so no live timer or dangling
   * listener remains.
   */
  private _withDeadline(
    ms: number,
    task: (signal: AbortSignal) => Promise<void>
  ): Promise<void> {
    const controller = new AbortController();

    return Promise.race([
      task(controller.signal),
      this._timeout(ms, controller.signal),
    ]).finally(() => controller.abort());
  }

  private _waitForScrollEnd(signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      this.addEventListener('scrollend', () => resolve(), {
        once: true,
        signal,
      });
    });
  }

  /**
   * Resolves when no `scroll` event arrives for `SCROLL_IDLE_MS`: the
   * closest replacement for `scrollend`. The first timer starts immediately,
   * so a scroll that does not move still settles.
   */
  private _waitForScrollIdle(signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      let id = setTimeout(resolve, SCROLL_IDLE_MS);

      this.addEventListener(
        'scroll',
        () => {
          clearTimeout(id);
          id = setTimeout(resolve, SCROLL_IDLE_MS);
        },
        { passive: true, signal }
      );

      signal.addEventListener('abort', () => clearTimeout(id), { once: true });
    });
  }

  private _timeout(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      signal.addEventListener('abort', () => clearTimeout(id), { once: true });
    });
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

    const { startIndex, endIndex } = this._computeRange();
    if (
      startIndex !== this._currentRange.startIndex ||
      endIndex !== this._currentRange.endIndex
    ) {
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
    if (!previous) {
      return 0;
    }

    const items = this._items;
    const shared = Math.min(previous.length, items.length);
    for (let i = 0; i < shared; i++) {
      if (previous[i] !== items[i]) {
        return i;
      }
    }
    return shared;
  }

  private _handleItemResize(entries: ResizeObserverEntry[]): void {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      const index = asNumber(el.dataset.vsIndex, -1);
      if (index < 0) continue;

      const measured = this._isVertical
        ? (entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
        : (entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);

      if (measured > 0) {
        this._engine.measureItem(index, measured);
      }
    }
  }

  /**
   * Synchronizes the item observer with the rendered window and applies only
   * the difference. A newly observed element gets one initial measurement.
   * An `observe` call on an already observed element is a no-op, so a
   * re-measurement on demand requires re-registration: unobserve, then
   * observe.
   *
   * Re-registration is applied to each element whose `data-vs-index`
   * changed. Lit reuses the wrapper elements across renders, so after a
   * scroll the same element can host a different item at an identical size.
   * The observer does not report that, and the new index would keep its
   * estimated size.
   */
  private _scheduleItemMeasurement(): void {
    const content = this._contentRef.value;
    if (!content) return;

    const observed = this._itemResizeController.targets;

    for (const element of observed) {
      if (element.parentNode !== content) {
        this._itemResizeController.unobserve(element);
      }
    }

    for (const element of content.children) {
      const index = asNumber((element as HTMLElement).dataset.vsIndex, -1);
      const isObserved = observed.has(element);

      if (isObserved && this._observedItemIndexes.get(element) === index) {
        continue;
      }

      if (isObserved) {
        this._itemResizeController.unobserve(element);
      }
      this._itemResizeController.observe(element);
      this._observedItemIndexes.set(element, index);
    }
  }

  /**
   * Emits `igcStateChange`. Skipped when the window is empty or equal to the
   * last reported one, because measurement passes re-render without a window
   * change.
   */
  private _emitStateChange(): void {
    const { startIndex, endIndex } = this._currentRange;
    if (endIndex < startIndex) return;

    const previous = this._lastEmittedState;
    const detail: VirtualScrollState = {
      startIndex,
      endIndex,
      viewportSize: this._viewportSize,
      totalSize: this._engine.totalSize,
    };

    if (
      previous &&
      previous.startIndex === detail.startIndex &&
      previous.endIndex === detail.endIndex &&
      previous.viewportSize === detail.viewportSize &&
      previous.totalSize === detail.totalSize
    ) {
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

  /**
   * Resolves on the next animation frame, or after `LAYOUT_FRAME_TIMEOUT_MS`
   * when no frame arrives. A hidden tab or a disconnected element gets no
   * frames, and `layoutComplete` must still settle there. That state has no
   * layout to wait for, so an early resolve is safe.
   */
  private _nextFrame(): Promise<void> {
    return this._withDeadline(
      LAYOUT_FRAME_TIMEOUT_MS,
      (signal) =>
        new Promise((resolve) => {
          const id = requestAnimationFrame(() => resolve());
          signal.addEventListener('abort', () => cancelAnimationFrame(id), {
            once: true,
          });
        })
    );
  }

  /**
   * Waits for the current update, then lets ResizeObserver item measurements
   * run. When those schedule a follow-up render, for example an estimate
   * replaced by a measured size, the wait repeats until nothing is pending,
   * up to a safety cap.
   */
  private async _resolveLayoutComplete(): Promise<void> {
    try {
      await this.updateComplete;

      for (let i = 0; i < MAX_LAYOUT_SETTLE_PASSES; i++) {
        await this._nextFrame();

        if (!this.isUpdatePending) {
          break;
        }

        await this.updateComplete;
      }
    } finally {
      // Cleared here, not after the loop, so a run that throws cannot leave
      // the getter with a permanently rejected promise.
      this._layoutCompletePromise = null;
    }
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
    if (!this._layoutCompletePromise) {
      this._layoutCompletePromise = this._resolveLayoutComplete();
    }
    return this._layoutCompletePromise;
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
  public async scrollToIndex(
    index: number,
    options?: ScrollIntoViewOptions
  ): Promise<void> {
    const maxIndex = Math.max(0, this._items.length - 1);
    const clampedIndex = clamp(index, 0, maxIndex);
    const behavior = options?.behavior ?? 'auto';

    // A newer call supersedes a correction loop that still runs for a
    // previous call, for example under rapid, repeated calls.
    const requestId = ++this._scrollRequestId;

    let offset = this._getAlignedScrollOffset(clampedIndex, options);
    await this._scrollAndWaitForEnd(offset, behavior);

    for (let i = 0; i < MAX_SCROLL_CORRECTION_PASSES; i++) {
      await this.layoutComplete;

      if (requestId !== this._scrollRequestId) {
        return;
      }

      const corrected = this._getAlignedScrollOffset(clampedIndex, options);
      if (Math.abs(corrected - offset) < SCROLL_OFFSET_EPSILON_PX) {
        break;
      }

      offset = corrected;
      await this._scrollAndWaitForEnd(offset, 'auto');

      if (requestId !== this._scrollRequestId) {
        return;
      }
    }
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-virtual-scroll': IgcVirtualScrollComponent;
  }
}

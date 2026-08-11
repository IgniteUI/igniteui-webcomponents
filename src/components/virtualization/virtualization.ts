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
/** Fallback for a non-positive `estimatedItemSize`; mirrors its default. */
const DEFAULT_ESTIMATED_ITEM_SIZE = 50;
/** How long the scroll position must stay put to count as settled. */
const SCROLL_IDLE_MS = 100;
/**
 * Upper bound on a single `requestAnimationFrame` wait. Frames aren't served
 * to a hidden tab or a disconnected element, where `layoutComplete` must
 * still resolve.
 */
const LAYOUT_FRAME_TIMEOUT_MS = 100;

/**
 * `scrollend` reports precisely when a scroll has settled, but is missing on
 * part of the supported browser matrix (Safari before 18.2), where
 * `_scrollAndWaitForEnd` falls back to a scroll-idle timer.
 */
const SUPPORTS_SCROLL_END = !isServer && 'onscrollend' in window;

const EMPTY_RANGE: VisibleRange = Object.freeze({
  startIndex: 0,
  endIndex: -1,
});

/**
 * A virtual scroll component that efficiently renders large lists by only
 * rendering the items currently visible in the viewport.
 *
 * @element igc-virtual-scroll
 *
 * @fires igcStateChange - Emitted when the rendered virtual window changes.
 * @fires igcDataRequest - Emitted whenever the rendered window comes within a few items of the
 * end of `data` - including on the very first render, when the loaded items don't fill the viewport.
 *
 * @csspart virtualization-track - The full-size element that gives the host its scrollable extent.
 * @csspart virtualization-content - The wrapper holding the currently rendered items, translated
 * into position within the track.
 */
export default class IgcVirtualScrollComponent<
  T = unknown,
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
  private _lastEmittedState: VirtualScrollState | null = null;
  private _hasPendingDataRequest = false;
  private _layoutCompletePromise: Promise<void> | null = null;
  private _scrollRequestId = 0;

  /**
   * The `startIndex` of the last emitted `igcDataRequest`, which is also the
   * item count it was emitted at. See `_checkDataRequest`.
   *
   * Outlives a disconnect, like `_hasPendingDataRequest`: what the consumer has
   * already been asked for does not become untrue by moving the element, and
   * clearing only one of the two would re-open the request loop on reconnect.
   */
  private _lastDataRequestIndex = -1;

  /**
   * The live scroll offset on the active axis. Deliberately *not* reactive:
   * nothing in `render` reads it except through `_currentRange`, so
   * `_handleScroll` schedules an update only when the window actually moves.
   */
  private _scrollPosition = 0;

  @state()
  private _viewportSize = 0;

  //#endregion

  //#region Public properties

  /**
   * The array of items to virtualize.
   *
   * Compared by reference: mutating the array
   * in place (`data.push(...)`) produces no update. Assign a new array
   * instead, which is also what the `igcDataRequest` flow expects.
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
   * Higher values reduce blank flashes during fast scrolling but may impact performance.
   * @attr over-scan
   * @default 2
   */
  @property({ type: Number, attribute: 'over-scan' })
  public overScan = 2;

  /**
   * Estimated item size in pixels used before an item is measured in the DOM.
   * The engine replaces this with the actual measured size after the first render of each item.
   * @attr estimated-item-size
   * @default 50
   */
  @property({ type: Number, attribute: 'estimated-item-size' })
  public estimatedItemSize = DEFAULT_ESTIMATED_ITEM_SIZE;

  /**
   * A function that renders each item in the virtual scroll list.
   * Receives a VirtualScrollItemContext<T> with the item data, its index, and the total count.
   * If not provided, nothing is rendered.
   *
   * Items are measured by their border box, so margins accumulate as drift
   * down the list. Use padding on the item, or a gap on a wrapper, instead.
   *
   * Only the current window is ever in the DOM, so assistive technology
   * cannot infer an item's position from the markup. Templates rendering a
   * role with set semantics (`option`, `listitem`, `row`, ...) should map the
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

    // Re-verified on every update (an idempotent no-op when already present)
    // rather than only in `connectedCallback`. A host rendering this component
    // inside its own shadow root (e.g. combo) may have that root's
    // `adoptedStyleSheets` wholesale replaced by its theming logic, silently
    // dropping this sheet without this element ever reconnecting.
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
    // that is `domSize` px tall/wide, so translating it to the first rendered
    // item's scroll offset places that item at its virtual position.
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

  /** `data`, guarded against a consumer clearing it with a nullish value. */
  private get _items(): T[] {
    return this.data ?? [];
  }

  /**
   * The window to render for the current scroll position and viewport. Empty
   * until an `itemTemplate` is set, since nothing renders without one.
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
   * The scroll offset that aligns `index` within the viewport according to
   * `options`, from the engine's *current* size data. As more items get
   * measured, the same index/options can yield a different, more accurate
   * result.
   *
   * For `block: 'nearest'` on an item already in view, returns the current
   * offset, so that no scrolling takes place.
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
   * Applies a scroll offset to the active axis and waits for the resulting
   * scroll - instant or smooth - to settle.
   *
   * `scrollend` never fires when the requested offset doesn't actually move
   * the scroll position, so that case is short-circuited rather than waiting
   * for it. The timeout covers the rare case of the event never arriving at
   * all, e.g. the element being disconnected mid-scroll.
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

      // Applied only once the listener is attached, so an instant scroll
      // can't settle before anything is watching for it.
      this._applyScroll(offset, behavior);
      return settled;
    });
  }

  /**
   * Resolves with whichever comes first, `task` or a deadline of `ms`.
   * Whichever wins, the loser is torn down through the signal instead of
   * being left behind as a live timer or a dangling listener.
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
   * Resolves once no `scroll` event has arrived for `SCROLL_IDLE_MS`, the
   * closest approximation of `scrollend` without it. The first timer is armed
   * immediately, so a scroll that never moves still settles.
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
   * Records the new scroll offset and schedules a render only if it moves the
   * rendered window.
   *
   * `render` derives the track size, the content translate and the item slice
   * from `_currentRange`, and nothing from the scroll offset itself, so
   * scrolling within a single item would otherwise re-run every item template
   * for a pixel-identical result. `willUpdate` still recomputes
   * `_currentRange` for every other trigger, so this can only suppress a
   * redundant pass, never a needed one.
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
   * change, i.e. the index of the first item whose measured size no longer
   * describes what is rendered there. Appending (the `igcDataRequest` flow)
   * retains everything; filtering or replacing retains only the untouched
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
   * Brings the item observer in sync with the rendered window, applying only
   * the difference: re-observing an already observed element makes the browser
   * deliver another initial measurement for it, so blanket re-registration
   * would fire a callback for every rendered item on every update pass.
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
      if (!observed.has(element)) {
        this._itemResizeController.observe(element);
      }
    }
  }

  /**
   * Emits `igcStateChange`, unless the window is empty or identical to the one
   * last reported: measurement passes re-render without moving the window.
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

    // `_hasPendingDataRequest` is cleared by any `data` change, including one
    // that appends nothing. Without this second guard, a consumer that
    // reassigns `data` in response to a request it cannot fulfil - its source
    // being exhausted - would be asked for the same items on every
    // reassignment, indefinitely.
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
   * if one never arrives. A hidden tab or a disconnected element is never
   * served frames, and `layoutComplete` must still settle there. There is no
   * layout to wait for in that state, so resolving early costs nothing.
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
   * Waits for the current update to finish and then gives any
   * ResizeObserver-driven item measurements a chance to run. If those schedule
   * a follow-up render - an estimated size being replaced with a measured one
   * - the wait repeats until nothing is pending, up to a safety cap.
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
      // Cleared here rather than after the loop, so a run that throws can't
      // leave the getter handing out the same rejected promise forever.
      this._layoutCompletePromise = null;
    }
  }

  //#endregion

  //#region Public API

  /* blazorSuppress */
  /**
   * Resolves once the virtual scroll has fully settled: the current render
   * pass has completed *and* so have any item-size measurements it triggers,
   * along with the renders those in turn schedule.
   *
   * Unlike `updateComplete`, which reflects a single Lit render pass, this
   * covers changing `data`, scrolling or resizing the viewport, where the
   * stable DOM state is only reached after one or more follow-up renders.
   */
  public get layoutComplete(): Promise<void> {
    if (!this._layoutCompletePromise) {
      this._layoutCompletePromise = this._resolveLayoutComplete();
    }
    return this._layoutCompletePromise;
  }

  /**
   * Programmatically scrolls to the specified item index.
   *
   * Items outside the rendered window only have an *estimated* size, so the
   * first jump may land off target. The items around where it lands are then
   * measured and the scroll position corrected, repeating - each pass landing
   * closer to the true target - until the offset stabilizes.
   *
   * The returned promise resolves once the scroll has settled on that final,
   * corrected offset, and can be ignored by callers that only care about the
   * initial, approximate scroll.
   */
  public async scrollToIndex(
    index: number,
    options?: ScrollIntoViewOptions
  ): Promise<void> {
    const maxIndex = Math.max(0, this._items.length - 1);
    const clampedIndex = clamp(index, 0, maxIndex);
    const behavior = options?.behavior ?? 'auto';

    // A newer call supersedes any correction loop still running for a previous
    // one, e.g. under rapid, repeated calls.
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

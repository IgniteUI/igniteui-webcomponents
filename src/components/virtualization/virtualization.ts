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
import { createResizeObserverController } from '../common/controllers/resize-observer.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, isLTR } from '../common/util.js';
import { VirtualScrollEngine, type VisibleRange } from './engine.js';
import {
  type VirtualScrollDataRequest,
  VirtualScrollItemContext,
  type VirtualScrollState,
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
const MAX_SCROLL_SETTLE_PASSES = 180;
const SCROLL_CORRECTION_EPSILON = 1;

/**
 * A virtual scroll component that efficiently renders large lists by only
 * rendering the items currently visible in the viewport.
 *
 * @element igc-virtual-scroll
 *
 * @fires igcStateChange - Emitted after each render pass with a snapshot of the current virtual window.
 * @fires igcDataRequest - Emitted when the scroll position approaches the end of the available data.
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

  //#region Internal state

  protected readonly _engine = new VirtualScrollEngine();

  private readonly _contentRef = createRef<HTMLDivElement>();
  private _itemResizeObserver: ResizeObserver | null = null;
  private _onScroll: ((e: Event) => void) | null = null;
  private _currentRange: VisibleRange = { startIndex: 0, endIndex: -1 };
  private _hasPendingDataRequest = false;
  private _layoutCompletePromise: Promise<void> | null = null;
  private _scrollRequestId = 0;

  @state()
  private _scrollPosition = 0;

  @state()
  private _viewportSize = 0;

  //#endregion

  //#region Public properties

  /**
   * The array of items to virtualize.
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
  public estimatedItemSize = 50;

  /**
   * A function that renders each item in the virtual scroll list.
   * Receives a VirtualScrollItemContext<T> with the item data, its index, and the total count.
   * If not provided, nothing is rendered.
   */
  @property({ attribute: false })
  public itemTemplate: VirtualScrollItemTemplate<T> | null = null;

  //#endregion

  private static _styleSheet: CSSStyleSheet | null = null;

  private static _getStyleSheet(): CSSStyleSheet {
    if (!IgcVirtualScrollComponent._styleSheet) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(`
        igc-virtual-scroll {
          display: block;
          position: relative;
          overflow: auto;
          height: 18.75rem;
        }

        igc-virtual-scroll[orientation='vertical'] {
          overflow-y: auto;
          overflow-x: hidden;
        }

        igc-virtual-scroll[orientation='horizontal'] {
          overflow-x: auto;
          overflow-y: hidden;
        }

        [part="igc-vs-track"] {
          position: relative;
          width: 100%;
          min-height: 100%;
        }

        [part="igc-vs-content"] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          will-change: transform;
          contain: layout style paint;
        }

        igc-virtual-scroll[orientation='horizontal'] [part="igc-vs-track"] {
          height: 100%;
          width: auto;
          min-height: unset;
        }

        igc-virtual-scroll[orientation='horizontal'] [part="igc-vs-content"] {
          display: flex;
          flex-direction: row;
          height: 100%;
          width: auto;
        }

        igc-virtual-scroll[orientation='horizontal'] [part="igc-vs-content"] > [data-vs-index] {
          flex-shrink: 0;
          height: 100%;
        }

        igc-virtual-scroll[orientation='horizontal']:dir(rtl) [part="igc-vs-content"] {
          left: auto;
          right: 0;
        }
      `);
      IgcVirtualScrollComponent._styleSheet = sheet;
    }
    return IgcVirtualScrollComponent._styleSheet;
  }

  private _adoptStyles(): void {
    const root = this.getRootNode() as Document | ShadowRoot;
    const sheet = IgcVirtualScrollComponent._getStyleSheet();
    if (!root.adoptedStyleSheets.includes(sheet)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    }
  }

  constructor() {
    super();
    this._engine.onSizeChange = () => this.requestUpdate();
    this._handleItemResize = this._handleItemResize.bind(this);
    this._handleViewportResize = this._handleViewportResize.bind(this);

    // Viewport resize observer
    createResizeObserverController(this, {
      callback: this._handleViewportResize,
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
    this._setupScrollListener();
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._dispose();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    // TODO: Either fix this in the theming controller or come up with some other solution.

    // Re-verified (cheap, idempotent no-op when already present) on every
    // update rather than only in `connectedCallback`. Hosts that render this
    // component into light DOM inside an *ancestor's* shadow root (e.g. combo)
    // may have that shadow root's `adoptedStyleSheets` wholesale replaced by
    // the ancestor's own styling/theming logic, silently dropping this sheet
    // without ever disconnecting/reconnecting this element.
    this._adoptStyles();

    if (changed.has('data') || changed.has('estimatedItemSize')) {
      const estimatedSize = asNumber(this.estimatedItemSize);
      this._engine.resize(
        this.data.length,
        estimatedSize > 0 ? estimatedSize : 50
      );
      this._hasPendingDataRequest = false;
    }

    if (changed.has('orientation')) {
      this._measureViewport();
      this._setupScrollListener();
    }
  }

  protected override updated(_changed: PropertyValues<this>): void {
    this._scheduleItemMeasurement();
    this._checkDataRequest();

    const range = this._currentRange;
    if (range.endIndex >= range.startIndex) {
      this.emitEvent('igcStateChange', {
        detail: {
          startIndex: range.startIndex,
          endIndex: range.endIndex,
          viewportSize: this._viewportSize,
          totalSize: this._engine.totalSize,
        },
      });
    }
  }

  protected override render(): TemplateResult {
    if (!this.itemTemplate) {
      return html`${nothing}`;
    }

    const overScan = Math.max(0, Math.floor(asNumber(this.overScan, 2)));

    this._currentRange = this._engine.getVisibleRange(
      this._scrollPosition,
      this._viewportSize,
      overScan,
      this.data.length
    );

    const range = this._currentRange;
    const count = this.data.length;
    const isVertical = this._isVertical;

    const trackStyle = isVertical
      ? { height: `${this._engine.domSize}px` }
      : { width: `${this._engine.domSize}px` };

    let contentPosition = this._engine.getContentPosition(range.startIndex);
    const physicalRangeSize = this._engine.getPhysicalRangeSize(
      range.startIndex,
      range.endIndex
    );
    contentPosition = Math.max(
      0,
      Math.min(contentPosition, this._engine.domSize - physicalRangeSize)
    );
    const isRTL = !isVertical && !isLTR(this);
    const contentStyle = {
      transform: isVertical
        ? `translateY(${contentPosition}px)`
        : `translateX(${isRTL ? -contentPosition : contentPosition}px)`,
    };

    const visibleItems =
      range.endIndex >= range.startIndex
        ? this.data.slice(range.startIndex, range.endIndex + 1)
        : [];

    return html`
      <div part="igc-vs-track" style=${styleMap(trackStyle)}>
        <div
          ${ref(this._contentRef)}
          part="igc-vs-content"
          style=${styleMap(contentStyle)}
        >
          ${visibleItems.map((item, i) => {
            const itemIndex = range.startIndex + i;
            const ctx = new VirtualScrollItemContext(item, itemIndex, count);
            return html`<div data-vs-index=${itemIndex}>
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

  /**
   * Computes the scroll offset that aligns the given item index within the
   * viewport according to `options`, using the engine's *current* size
   * data. As more items get measured, calling this again for the same
   * index/options can yield a different, more accurate result.
   */
  private _getAlignedScrollOffset(
    index: number,
    options?: ScrollIntoViewOptions
  ): number {
    const itemStart = this._engine.getScrollOffsetForIndex(index);
    const itemEnd = this._engine.getScrollOffsetForIndex(index + 1);
    const itemSize = Math.max(0, itemEnd - itemStart);

    const align = this._isVertical
      ? (options?.block ?? 'start')
      : (options?.inline ?? options?.block ?? 'start');

    let offset = itemStart;
    if (align === 'center') {
      offset = itemStart - (this._viewportSize - itemSize) / 2;
    } else if (align === 'end') {
      offset = itemStart - (this._viewportSize - itemSize);
    }

    return Math.max(0, offset);
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
   * Waits until the real scroll position on the active axis stops moving
   * between two consecutive frames.
   *
   * `behavior: 'smooth'` scrolls animate asynchronously over multiple
   * frames, so the DOM (and the items rendered around it) only reflect the
   * final position once that animation finishes. Measuring items - and
   * correcting the target offset from those measurements - before that
   * happens would use data from wherever the animation currently happens
   * to be, not from the requested destination.
   */
  private async _waitForScrollSettled(): Promise<void> {
    let previous = this._currentAxisScroll();

    for (let i = 0; i < MAX_SCROLL_SETTLE_PASSES; i++) {
      await this._nextFrame();

      const current = this._currentAxisScroll();
      if (Math.abs(current - previous) < SCROLL_CORRECTION_EPSILON) {
        return;
      }
      previous = current;
    }
  }

  private _measureViewport(): void {
    const size = this._isVertical ? this.clientHeight : this.clientWidth;
    if (size !== this._viewportSize) {
      this._viewportSize = size;
    }
  }

  private _setupScrollListener(): void {
    if (this._onScroll) {
      this.removeEventListener('scroll', this._onScroll);
    }

    this._onScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollPos = this._isVertical
        ? target.scrollTop
        : isLTR(this)
          ? target.scrollLeft
          : -target.scrollLeft;
      this._scrollPosition = scrollPos;
    };

    this.addEventListener('scroll', this._onScroll, { passive: true });
  }

  private _handleViewportResize(): void {
    const newSize = this._isVertical ? this.clientHeight : this.clientWidth;
    if (newSize !== this._viewportSize) {
      this._viewportSize = newSize;
    }
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

  private _scheduleItemMeasurement(): void {
    if (!this._contentRef.value) return;

    if (!this._itemResizeObserver) {
      this._itemResizeObserver = new ResizeObserver(this._handleItemResize);
    }

    this._itemResizeObserver.disconnect();
    for (const el of this._contentRef.value.children) {
      this._itemResizeObserver.observe(el);
    }
  }

  private _checkDataRequest(): void {
    if (this._hasPendingDataRequest) return;
    const range = this._currentRange;
    const total = this.data.length;
    const overScan = Math.max(0, Math.floor(asNumber(this.overScan, 2)));

    if (total > 0 && range.endIndex >= total - REMOTE_SCROLLING_THRESHOLD) {
      this._hasPendingDataRequest = true;
      this.emitEvent('igcDataRequest', {
        detail: {
          startIndex: total,
          count: Math.max(overScan * 4, 20),
        },
      });
    }
  }

  private _dispose(): void {
    if (this._onScroll) {
      this.removeEventListener('scroll', this._onScroll);
      this._onScroll = null;
    }
    this._itemResizeObserver?.disconnect();
    this._itemResizeObserver = null;
  }

  private _nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  /**
   * Waits for the current update to finish and then gives any
   * ResizeObserver-driven item measurements a chance to run. If those
   * measurements schedule a follow-up render (e.g. because an estimated
   * item size was replaced with its real, measured size), the wait is
   * repeated until no further renders are pending, up to a safety cap.
   */
  private async _resolveLayoutComplete(): Promise<void> {
    await this.updateComplete;

    for (let i = 0; i < MAX_LAYOUT_SETTLE_PASSES; i++) {
      await this._nextFrame();

      if (!this.isUpdatePending) {
        break;
      }

      await this.updateComplete;
    }

    this._layoutCompletePromise = null;
  }

  //#endregion

  //#region Public API

  /* blazorSuppress */
  /**
   * A promise that resolves once the virtual scroll has fully settled:
   * the current render pass has completed *and* any item-size
   * measurements it triggers (and the renders those in turn schedule)
   * have also completed.
   *
   * Unlike `updateComplete`, which only reflects a single Lit render
   * pass, `layoutComplete` is useful after changing `data`, scrolling,
   * or resizing the viewport, when the final, stable DOM state may only
   * be reached after one or more follow-up renders.
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
   * Items outside the currently rendered window only have an *estimated*
   * size, so the very first jump may land slightly off target. Once the
   * scroll lands, the items around it are measured and, if that changes
   * their computed offset, the scroll position is corrected. This repeats
   * (each pass measuring items closer to the true target) until the offset
   * stabilizes, so the requested index ends up precisely aligned even for
   * far-away, never-before-rendered items.
   *
   * Returns a promise that resolves once the scroll position has settled
   * on the final, corrected offset. Callers that only care about the
   * initial (approximate) scroll can ignore the returned promise.
   */
  public async scrollToIndex(
    index: number,
    options?: ScrollIntoViewOptions
  ): Promise<void> {
    const maxIndex = Math.max(0, this.data.length - 1);
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    const behavior = options?.behavior ?? 'auto';

    // A newer call supersedes any correction loop still running for a
    // previous one (e.g. rapid, repeated calls to scrollToIndex).
    const requestId = ++this._scrollRequestId;

    let offset = this._getAlignedScrollOffset(clampedIndex, options);
    this._applyScroll(offset, behavior);

    for (let i = 0; i < MAX_SCROLL_CORRECTION_PASSES; i++) {
      await this._waitForScrollSettled();
      await this.layoutComplete;

      if (requestId !== this._scrollRequestId) {
        return;
      }

      const corrected = this._getAlignedScrollOffset(clampedIndex, options);
      if (Math.abs(corrected - offset) < SCROLL_CORRECTION_EPSILON) {
        break;
      }

      offset = corrected;
      this._applyScroll(offset, 'auto');
    }
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-virtual-scroll': IgcVirtualScrollComponent;
  }
}

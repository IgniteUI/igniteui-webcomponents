import type { Ref } from 'lit/directives/ref.js';
import { isLTR, setStyles } from '#internals/utils/dom.js';
import { asNumber } from '#internals/utils/math.js';
import { equal } from '#internals/utils/objects.js';
import type IgcTabComponent from './tab.js';
import type IgcTabsComponent from './tabs.js';

const EDGE_TOLERANCE = 1;

export const TAB_HEADER = '[part~="tab-header"]';

type TabsStyleProperties = {
  '--_tabs-count': string;
  '--_ig-tabs-width': string;
  '--_ig-tabs-height': string;
};

type ScrollButtonsState = {
  start: boolean;
  end: boolean;
};

/** A box on the scroll axis: the inline axis of a row, the block axis of a column. */
type Extent = {
  min: number;
  max: number;
  size: number;
};

export class TabsHelpers {
  private readonly _host: IgcTabsComponent;
  private readonly _containerRef: Ref<HTMLElement>;
  private readonly _indicatorRef: Ref<HTMLElement>;

  private _styleProperties: TabsStyleProperties = {
    '--_tabs-count': '',
    '--_ig-tabs-width': '',
    '--_ig-tabs-height': '',
  };

  private _hasScrollButtons = false;
  private _scrollButtonsDisabled: ScrollButtonsState = {
    start: true,
    end: false,
  };

  private _isLeftToRight = false;

  private get _container(): HTMLElement | undefined {
    return this._containerRef.value;
  }

  private get _indicator(): HTMLElement | undefined {
    return this._indicatorRef.value;
  }

  /** Whether the end of the scroll axis is its larger coordinate. */
  private get _endIsMax(): boolean {
    return isColumn(this._host) || isLTR(this._host);
  }

  public get styleProperties(): TabsStyleProperties {
    return this._styleProperties;
  }

  public get hasScrollButtons(): boolean {
    return this._hasScrollButtons;
  }

  public get scrollButtonsDisabled(): ScrollButtonsState {
    return this._scrollButtonsDisabled;
  }

  constructor(
    host: IgcTabsComponent,
    container: Ref<HTMLElement>,
    indicator: Ref<HTMLElement>
  ) {
    this._host = host;
    this._containerRef = container;
    this._indicatorRef = indicator;
  }

  /** Measures the strip and every tab header. On scroll, the cheaper `setScrollPositionState()` runs. */
  public updateLayout(): void {
    const tabs = this._host.tabs;
    const container = this._container;
    const column = isColumn(this._host);
    const width = container && getRect(container).width;
    // As tall as a column with a definite height, else 0, so that the panels can
    // grow a column with an auto height.
    const probe = column && container?.querySelector('[data-height-probe]');
    const height = probe ? getRect(probe).height : 0;
    const next = {
      '--_tabs-count': String(tabs.length),
      '--_ig-tabs-width': width === undefined || column ? '' : `${width}px`,
      '--_ig-tabs-height': height ? `${height}px` : '',
    };

    if (!equal(this._styleProperties, next)) {
      this._styleProperties = next;
      this._host.requestUpdate();
    }

    if (width === undefined) {
      return;
    }

    // The tabs alone, because the scroll size includes the scroll buttons. Subpixel
    // sizes, so that the rounding of many headers does not add up.
    const tabsSize = tabs.reduce((sum, tab) => {
      const header = getTabHeader(tab);
      return sum + (header ? this._getExtent(header).size : 0);
    }, 0);

    // A column scrolls only in a definite height.
    this.setScrollPositionState(
      column
        ? height > 0 && tabsSize > height + EDGE_TOLERANCE
        : tabsSize > width + EDGE_TOLERANCE
    );
  }

  public checkAndUpdateDirection(): boolean {
    const isLeftToRight = isLTR(this._host);

    if (this._isLeftToRight !== isLeftToRight) {
      this._isLeftToRight = isLeftToRight;
      return true;
    }

    return false;
  }

  /** The extent of `element` on the scroll axis, in its own CSS pixels. */
  private _getExtent(element: Element): Extent {
    const { left, right, top, bottom, width, height } = getRect(element);

    return isColumn(this._host)
      ? { min: top, max: bottom, size: height }
      : { min: left, max: right, size: width };
  }

  /** The bounds of the strip without the sticky scroll buttons. */
  private _getVisibleBounds(container: HTMLElement): {
    min: number;
    max: number;
  } {
    const style = getComputedStyle(container);
    const { min, max } = this._getExtent(container);
    const [start, end] = isColumn(this._host)
      ? [style.scrollPaddingBlockStart, style.scrollPaddingBlockEnd]
      : [style.scrollPaddingInlineStart, style.scrollPaddingInlineEnd];
    const [low, high] = this._endIsMax ? [start, end] : [end, start];

    return { min: min + asNumber(low), max: max - asNumber(high) };
  }

  /** Scrolls the strip on its axis. */
  private _scrollBy(
    container: HTMLElement,
    offset: number,
    behavior?: ScrollBehavior
  ): void {
    container.scrollBy(
      isColumn(this._host)
        ? { top: offset, behavior }
        : { left: offset, behavior }
    );
  }

  private _getScrollOffset(
    container: HTMLElement,
    direction: 'start' | 'end'
  ): number {
    const isEnd = direction === 'end';
    const { min, max } = this._getVisibleBounds(container);

    const useMaxEdge = isEnd === this._endIsMax;

    const isOutOfView = (header: HTMLElement): boolean => {
      const extent = this._getExtent(header);
      return useMaxEdge
        ? extent.max > max + EDGE_TOLERANCE
        : extent.min < min - EDGE_TOLERANCE;
    };

    const headers = this._host.tabs
      .map(getTabHeader)
      .filter((header) => header !== null);

    // The first match past the edge is the closest one.
    const target = isEnd
      ? headers.find(isOutOfView)
      : headers.findLast(isOutOfView);

    if (!target) {
      return 0;
    }

    const extent = this._getExtent(target);
    return useMaxEdge ? extent.max - max : extent.min - min;
  }

  public scrollTabs(direction: 'start' | 'end'): void {
    const container = this._container;

    if (!container) {
      return;
    }

    const offset = this._getScrollOffset(container, direction);

    if (offset) {
      this._scrollBy(container, offset, 'smooth');
    }
  }

  /** Unlike `Element.scrollIntoView()`, it scrolls only the strip, never the page. */
  public async scrollTabIntoView(tab?: IgcTabComponent): Promise<void> {
    // The render of a new tab count can bring in the scroll buttons, which move
    // every tab, so a second pass measures after their render.
    for (let pass = 0; pass < 2; pass++) {
      this.updateLayout();
      await this._host.updateComplete;
    }

    const container = this._container;
    const header = tab ? getTabHeader(tab) : null;

    if (!(container && header)) {
      return;
    }

    const { min, max } = this._getVisibleBounds(container);
    const extent = this._getExtent(header);

    let offset = 0;

    if (extent.max > max + EDGE_TOLERANCE) {
      offset = extent.max - max;
    } else if (extent.min < min - EDGE_TOLERANCE) {
      offset = extent.min - min;
    }

    if (offset) {
      this._scrollBy(container, offset);
    }
  }

  public setScrollPositionState(
    hasScrollButtons = this._hasScrollButtons
  ): void {
    const container = this._container;

    if (!container) {
      return;
    }

    // A right-to-left row has a negative offset.
    const [offset, scrollSize, clientSize] = isColumn(this._host)
      ? [container.scrollTop, container.scrollHeight, container.clientHeight]
      : [container.scrollLeft, container.scrollWidth, container.clientWidth];
    const disabled = this._scrollButtonsDisabled;

    const start = Math.abs(offset) <= EDGE_TOLERANCE;
    const end =
      Math.abs(Math.abs(offset) + clientSize - scrollSize) <= EDGE_TOLERANCE;

    if (
      this._hasScrollButtons === hasScrollButtons &&
      disabled.start === start &&
      disabled.end === end
    ) {
      return;
    }

    this._hasScrollButtons = hasScrollButtons;
    this._scrollButtonsDisabled = { start, end };

    this._host.requestUpdate();
  }

  /** Moves the indicator to the header of `active`. Without `animate`, it moves at once. */
  public async setIndicator(
    active?: IgcTabComponent,
    animate = true
  ): Promise<void> {
    await this._host.updateComplete;

    const container = this._container;
    const indicator = this._indicator;

    if (!(container && indicator)) {
      return;
    }

    const header = active ? getTabHeader(active) : null;

    if (!header) {
      setStyles(indicator, { visibility: 'hidden' });
      return;
    }

    const column = isColumn(this._host);
    const size = column ? header.offsetHeight : header.offsetWidth;
    const offset = column
      ? header.offsetTop - container.offsetTop
      : isLTR(this._host)
        ? header.offsetLeft - container.offsetLeft
        : header.offsetLeft + size - container.offsetWidth;

    setStyles(indicator, {
      visibility: '',
      width: column ? '' : `${size}px`,
      height: column ? `${size}px` : '',
      transform: `translate${column ? 'Y' : 'X'}(${offset}px)`,
    });

    if (!animate) {
      for (const animation of indicator.getAnimations()) {
        animation.finish();
      }
    }
  }
}

/**
 * The client rectangle in the CSS pixels of the element. An ancestor `zoom` scales
 * the client rectangle, but not the scroll offsets and the computed styles.
 */
function getRect(element: Element): DOMRect {
  const zoom = element.currentCSSZoom || 1;
  const { x, y, width, height } = element.getBoundingClientRect();

  return new DOMRect(x / zoom, y / zoom, width / zoom, height / zoom);
}

/** Whether the headers form a column before or after the panels. */
export function isColumn(tabs: IgcTabsComponent): boolean {
  return tabs.headerPosition === 'start' || tabs.headerPosition === 'end';
}

export function getTabHeader(tab: IgcTabComponent): HTMLElement | null {
  return tab.renderRoot.querySelector(TAB_HEADER);
}

/**
 * Whether the browser opens the link of the tab in another browsing context:
 * by its `target`, or by a click with another button or a modifier key.
 */
export function opensElsewhere(
  tab: IgcTabComponent,
  event?: MouseEvent
): boolean {
  if (tab.href == null) {
    return false;
  }

  if (
    event &&
    (event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey)
  ) {
    return true;
  }

  const target = (
    tab.target ?? getBaseTarget(tab.ownerDocument)
  )?.toLowerCase();

  return Boolean(target) && target !== '_self';
}

/** The target of the first `<base>` element that has one, as the browser uses it. */
function getBaseTarget(document: Document): string | null {
  for (const base of document.getElementsByTagName('base')) {
    if (base.hasAttribute('target')) {
      return base.getAttribute('target');
    }
  }

  return null;
}

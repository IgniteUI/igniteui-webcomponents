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
    const width = container && getRect(container).width;
    const height = this._getColumnHeight(container);
    const next = {
      '--_tabs-count': String(tabs.length),
      '--_ig-tabs-width': width === undefined ? '' : `${width}px`,
      '--_ig-tabs-height': height ? `${height}px` : '',
    };

    if (!equal(this._styleProperties, next)) {
      this._styleProperties = next;
      this._host.requestUpdate();
    }

    if (width === undefined) {
      return;
    }

    // The tabs alone, because the scroll width includes the button columns. Subpixel
    // widths, so that the rounding of many headers does not add up.
    const tabsWidth = tabs.reduce((sum, tab) => {
      const header = getTabHeader(tab);
      return sum + (header ? getRect(header).width : 0);
    }, 0);

    this.setScrollPositionState(tabsWidth > width + EDGE_TOLERANCE);
  }

  /**
   * The definite height of a column of headers, else 0. The height probe is 0 when
   * the height of the tabs is auto, so that the panels can grow the tabs.
   */
  private _getColumnHeight(container?: HTMLElement): number {
    const probe = container?.querySelector('[data-height-probe]');
    return probe && isColumn(this._host) ? getRect(probe).height : 0;
  }

  public checkAndUpdateDirection(): boolean {
    const isLeftToRight = isLTR(this._host);

    if (this._isLeftToRight !== isLeftToRight) {
      this._isLeftToRight = isLeftToRight;
      return true;
    }

    return false;
  }

  /** The bounds of the strip without the sticky scroll buttons. */
  private _getVisibleBounds(container: HTMLElement): {
    min: number;
    max: number;
  } {
    const { scrollPaddingInlineStart, scrollPaddingInlineEnd } =
      getComputedStyle(container);
    const { left, right } = getRect(container);

    const start = asNumber(scrollPaddingInlineStart);
    const end = asNumber(scrollPaddingInlineEnd);

    return isLTR(this._host)
      ? { min: left + start, max: right - end }
      : { min: left + end, max: right - start };
  }

  private _getScrollOffset(
    container: HTMLElement,
    direction: 'start' | 'end'
  ): number {
    const isEnd = direction === 'end';
    const { min, max } = this._getVisibleBounds(container);

    const useRightEdge = isEnd === isLTR(this._host);

    const isOutOfView = (header: HTMLElement): boolean => {
      const { left, right } = getRect(header);
      return useRightEdge
        ? right > max + EDGE_TOLERANCE
        : left < min - EDGE_TOLERANCE;
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

    const { left, right } = getRect(target);
    return useRightEdge ? right - max : left - min;
  }

  public scrollTabs(direction: 'start' | 'end'): void {
    const container = this._container;

    if (!container) {
      return;
    }

    const offset = this._getScrollOffset(container, direction);

    if (offset) {
      container.scrollBy({ left: offset, behavior: 'smooth' });
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
    const { left, right } = getRect(header);

    let offset = 0;

    if (right > max + EDGE_TOLERANCE) {
      offset = right - max;
    } else if (left < min - EDGE_TOLERANCE) {
      offset = left - min;
    }

    if (offset) {
      container.scrollBy({ left: offset });
    }
  }

  public setScrollPositionState(
    hasScrollButtons = this._hasScrollButtons
  ): void {
    if (!this._container) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = this._container;
    const disabled = this._scrollButtonsDisabled;

    const start = Math.abs(scrollLeft) <= EDGE_TOLERANCE;
    const end =
      Math.abs(Math.abs(scrollLeft) + clientWidth - scrollWidth) <=
      EDGE_TOLERANCE;

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

  public async setIndicator(active?: IgcTabComponent): Promise<void> {
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

    const width = header.offsetWidth;
    const offset = isLTR(this._host)
      ? header.offsetLeft - container.offsetLeft
      : header.offsetLeft + width - container.offsetWidth;

    setStyles(indicator, {
      visibility: '',
      width: `${width}px`,
      transform: `translateX(${offset}px)`,
    });
  }
}

/**
 * The client rectangle in the CSS pixels of the element. An ancestor `zoom` scales
 * the client rectangle, but not the scroll offsets and the computed styles.
 */
function getRect(element: Element): {
  left: number;
  right: number;
  width: number;
  height: number;
} {
  const zoom = element.currentCSSZoom || 1;
  const { left, right, width, height } = element.getBoundingClientRect();

  return {
    left: left / zoom,
    right: right / zoom,
    width: width / zoom,
    height: height / zoom,
  };
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

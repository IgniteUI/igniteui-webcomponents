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
};

type ScrollButtonsState = {
  start: boolean;
  end: boolean;
};

export class TabsHelpers {
  private readonly _host: IgcTabsComponent;
  private readonly _container: Ref<HTMLElement>;
  private readonly _indicator: Ref<HTMLElement>;

  private _styleProperties: TabsStyleProperties = {
    '--_tabs-count': '',
    '--_ig-tabs-width': '',
  };

  private _hasScrollButtons = false;
  private _scrollButtonsDisabled: ScrollButtonsState = {
    start: true,
    end: false,
  };

  private _isLeftToRight = false;

  private get container(): HTMLElement | undefined {
    return this._container.value;
  }

  private get indicator(): HTMLElement | undefined {
    return this._indicator.value;
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
    this._container = container;
    this._indicator = indicator;
  }

  public updateLayout(): void {
    this._setStyleProperties();
    this._setScrollButtonState();
  }

  private _setStyleProperties(): void {
    const next = {
      '--_tabs-count': String(this._host.tabs.length),
      '--_ig-tabs-width': this.container
        ? `${this.container.getBoundingClientRect().width}px`
        : '',
    };

    if (!equal(this._styleProperties, next)) {
      this._styleProperties = next;
      this._host.requestUpdate();
    }
  }

  public checkAndUpdateDirection(): boolean {
    const isLeftToRight = isLTR(this._host);

    if (this._isLeftToRight !== isLeftToRight) {
      this._isLeftToRight = isLeftToRight;
      return true;
    }

    return false;
  }

  public setScrollSnap(type?: 'start' | 'end'): void {
    if (this.container) {
      this.container.style.setProperty('--_ig-tab-snap', type || 'unset');
    }
  }

  /** The bounds of the strip without the sticky scroll buttons. */
  private _getVisibleBounds(container: HTMLElement): {
    min: number;
    max: number;
  } {
    const { scrollPaddingInlineStart, scrollPaddingInlineEnd } =
      getComputedStyle(container);
    const { left, right } = container.getBoundingClientRect();

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
      const { left, right } = header.getBoundingClientRect();
      return useRightEdge
        ? right > max + EDGE_TOLERANCE
        : left < min - EDGE_TOLERANCE;
    };

    const headers = this._host.tabs
      .map((tab) => getTabHeader(tab))
      .filter((header): header is HTMLElement => header !== null);

    // The first match past the edge is the closest one.
    const target = isEnd
      ? headers.find(isOutOfView)
      : headers.findLast(isOutOfView);

    if (!target) {
      return 0;
    }

    const { left, right } = target.getBoundingClientRect();
    return useRightEdge ? right - max : left - min;
  }

  public scrollTabs(direction: 'start' | 'end'): void {
    const container = this.container;

    if (!container) {
      return;
    }

    const offset = this._getScrollOffset(container, direction);

    if (!offset) {
      return;
    }

    this.setScrollSnap(direction);
    container.scrollBy({ left: offset, behavior: 'smooth' });
  }

  /** Unlike `Element.scrollIntoView()`, it scrolls only the strip, never the page. */
  public async scrollTabIntoView(tab?: IgcTabComponent): Promise<void> {
    // The render of a new tab count can bring in the scroll buttons, which move
    // every tab, so a second pass measures after their render.
    for (let pass = 0; pass < 2; pass++) {
      this.updateLayout();
      await this._host.updateComplete;
    }

    const container = this.container;
    const header = tab ? getTabHeader(tab) : null;

    if (!(container && header)) {
      return;
    }

    const { min, max } = this._getVisibleBounds(container);
    const { left, right } = header.getBoundingClientRect();

    let offset = 0;

    if (right > max + EDGE_TOLERANCE) {
      offset = right - max;
    } else if (left < min - EDGE_TOLERANCE) {
      offset = left - min;
    }

    if (!offset) {
      return;
    }

    this.setScrollSnap();
    container.scrollBy({ left: offset });
  }

  /** Reads every tab header, so the scroll handler uses `setScrollPositionState()`. */
  private _setScrollButtonState(): void {
    if (!this.container) {
      return;
    }

    // The tabs alone, because the scroll width includes the button columns. Subpixel
    // widths, so that the rounding of many headers does not add up.
    const tabsWidth = this._host.tabs.reduce(
      (width, tab) =>
        width + (getTabHeader(tab)?.getBoundingClientRect().width ?? 0),
      0
    );
    const hasScrollButtons =
      tabsWidth > this.container.getBoundingClientRect().width + EDGE_TOLERANCE;

    this.setScrollPositionState(hasScrollButtons);
  }

  public setScrollPositionState(
    hasScrollButtons = this._hasScrollButtons
  ): void {
    if (!this.container) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = this.container;
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

    const { container, indicator } = this;

    if (!(container && indicator)) {
      return;
    }

    const header = active ? getTabHeader(active) : null;

    const styles = {
      visibility: header ? 'visible' : 'hidden',
    } satisfies Partial<CSSStyleDeclaration>;

    if (header) {
      const { offsetLeft: containerLeft, offsetWidth: containerWidth } =
        container;
      const width = header.offsetWidth;

      const offset = isLTR(this._host)
        ? header.offsetLeft - containerLeft
        : header.offsetLeft + width - containerWidth;

      Object.assign(styles, {
        width: `${width}px`,
        transform: `translateX(${offset}px)`,
      });
    }

    setStyles(indicator, styles);
  }
}

export function getTabHeader(tab: IgcTabComponent): HTMLElement | null {
  return tab.renderRoot.querySelector(TAB_HEADER);
}

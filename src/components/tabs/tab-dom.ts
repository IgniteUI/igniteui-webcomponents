import type { Ref } from 'lit/directives/ref.js';
import { asNumber, getScaleFactor, isLTR, setStyles } from '../common/util.js';
import type IgcTabComponent from './tab.js';
import type IgcTabsComponent from './tabs.js';

/** Tolerance for treating a tab edge as aligned with the visible region. */
const EDGE_TOLERANCE = 1;

type TabsStyleProperties = {
  '--_tabs-count': string;
  '--_ig-tabs-width': string;
};

type ScrollButtonsState = {
  start: boolean;
  end: boolean;
};

class TabsHelpers {
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

  /** The DOM container holding the tab headers. */
  public get container(): HTMLElement | undefined {
    return this._container.value;
  }

  /** The selected tab indicator element. */
  public get indicator(): HTMLElement | undefined {
    return this._indicator.value;
  }

  /** The internal CSS variables driving the layout of the tabs component. */
  public get styleProperties(): TabsStyleProperties {
    return this._styleProperties;
  }

  /** Whether the header strip overflows and needs its scroll buttons. */
  public get hasScrollButtons(): boolean {
    return this._hasScrollButtons;
  }

  /** The disabled state of the header strip scroll buttons. */
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

  /**
   * Sets the internal CSS variables used for the layout of the tabs component.
   * Triggers an update cycle (rerender) of the `igc-tabs` component if needed.
   */
  public setStyleProperties(): void {
    const count = String(this._host.tabs.length);
    const width = this.container
      ? `${this.container.getBoundingClientRect().width}px`
      : '';
    const current = this._styleProperties;

    if (
      current['--_tabs-count'] === count &&
      current['--_ig-tabs-width'] === width
    ) {
      return;
    }

    this._styleProperties = {
      '--_tabs-count': count,
      '--_ig-tabs-width': width,
    };
    this._host.requestUpdate();
  }

  public checkAndUpdateDirection(): boolean {
    const isLeftToRight = isLTR(this._host);

    if (this._isLeftToRight !== isLeftToRight) {
      this._isLeftToRight = isLeftToRight;
      return true;
    }

    return false;
  }

  /**
   * Sets the type of the `scroll-snap-align` CSS property for the tabs header strip.
   */
  public setScrollSnap(type?: 'start' | 'end'): void {
    if (this.container) {
      this.container.style.setProperty('--_ig-tab-snap', type || 'unset');
    }
  }

  /**
   * The horizontal bounds of the strip that are not covered by the sticky scroll
   * buttons, which is the area a tab has to fit in to count as being in view.
   */
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

  /**
   * The distance needed to bring the closest tab that is not fully in view for the
   * given direction inside the visible bounds, or `0` when every tab is in view.
   */
  private _getScrollOffset(
    container: HTMLElement,
    direction: 'start' | 'end'
  ): number {
    const isEnd = direction === 'end';
    const { min, max } = this._getVisibleBounds(container);

    // Which edge a tab overflows depends on the scroll direction and the text
    // direction alike - scrolling towards the end moves leftwards in RTL.
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

    // Tabs are in document order, so the first match going forward and the last one
    // going backwards are the ones closest to the visible region.
    const target = isEnd
      ? headers.find(isOutOfView)
      : headers.findLast(isOutOfView);

    if (!target) {
      return 0;
    }

    const { left, right } = target.getBoundingClientRect();
    return useRightEdge ? right - max : left - min;
  }

  /**
   * Scrolls the tabs header strip to the closest tab that is out of view in the given
   * direction, with `scroll-snap-align` set.
   */
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

  /**
   * Updates the state of the tabs header strip scroll buttons - visibility and active state.
   * Triggers an update cycle (rerender) of the `igc-tabs` component.
   */
  public setScrollButtonState(): void {
    if (!this.container) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = this.container;
    const disabled = this._scrollButtonsDisabled;

    const hasScrollButtons = scrollWidth > clientWidth;
    const start = Math.abs(scrollLeft) <= 1;
    const end = Math.abs(Math.abs(scrollLeft) + clientWidth - scrollWidth) <= 1;

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

  /**
   * Updates the indicator DOM element styles based on the current "active" tab.
   */
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
      const scaledWidth =
        header.getBoundingClientRect().width * getScaleFactor(header).x;

      const offset = isLTR(this._host)
        ? header.offsetLeft - containerLeft
        : header.offsetLeft + scaledWidth - containerWidth;

      Object.assign(styles, {
        width: `${scaledWidth}px`,
        transform: `translateX(${offset}px)`,
      });
    }

    setStyles(indicator, styles);
  }
}

export function createTabHelpers(
  host: IgcTabsComponent,
  container: Ref<HTMLElement>,
  indicator: Ref<HTMLElement>
): TabsHelpers {
  return new TabsHelpers(host, container, indicator);
}

/** Returns the header element of the given tab, or `null` if it has not rendered yet. */
export function getTabHeader(tab: IgcTabComponent): HTMLElement | null {
  return tab.renderRoot.querySelector('[part~="tab-header"]');
}

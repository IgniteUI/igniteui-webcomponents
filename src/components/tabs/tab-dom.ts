import type { Ref } from 'lit/directives/ref.js';
import { getScaleFactor, isLTR, setStyles } from '../common/util.js';
import type IgcTabComponent from './tab.js';
import type IgcTabsComponent from './tabs.js';

class TabsHelpers {
  private static readonly SCROLL_AMOUNT = 180;
  private readonly _host: IgcTabsComponent;
  private readonly _container: Ref<HTMLElement>;
  private readonly _indicator: Ref<HTMLElement>;

  private _styleProperties = {
    '--_tabs-count': '',
    '--_ig-tabs-width': '',
  };

  private _hasScrollButtons = false;
  private _scrollButtonsDisabled = { start: true, end: false };

  private _isLeftToRight = false;

  /**
   * Returns the DOM container holding the tabs headers.
   */
  public get container(): HTMLElement | undefined {
    return this._container.value;
  }

  /**
   * Returns the selected indicator DOM element.
   */
  public get indicator(): HTMLElement | undefined {
    return this._indicator.value;
  }

  /**
   * Returns the internal CSS variables used for the layout of the tabs component.
   */
  public get styleProperties() {
    return this._styleProperties;
  }

  /**
   * Whether the scroll buttons of the tabs header strip should be shown.
   */
  public get hasScrollButtons(): boolean {
    return this._hasScrollButtons;
  }

  /**
   * Returns the disabled state of the tabs header strip scroll buttons.
   */
  public get scrollButtonsDisabled() {
    return this._scrollButtonsDisabled;
  }

  public get isLeftToRightChanged(): boolean {
    const isLeftToRight = isLTR(this._host);

    if (this._isLeftToRight !== isLeftToRight) {
      this._isLeftToRight = isLeftToRight;
      return true;
    }

    return false;
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
   * Triggers an update cycle (rerender) of the `igc-tabs` component.
   */
  public setStyleProperties(): void {
    this._styleProperties = {
      '--_tabs-count': this._host.tabs.length.toString(),
      '--_ig-tabs-width': this.container
        ? `${this.container.getBoundingClientRect().width}px`
        : '',
    };
    this._host.requestUpdate();
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
   * Scrolls the tabs header strip in the given direction with `scroll-snap-align` set.
   */
  public scrollTabs(direction: 'start' | 'end'): void {
    if (!this.container) {
      return;
    }

    const factor = isLTR(this._host) ? 1 : -1;
    const amount =
      direction === 'start'
        ? -TabsHelpers.SCROLL_AMOUNT
        : TabsHelpers.SCROLL_AMOUNT;

    this.setScrollSnap(direction);
    this.container.scrollBy({ left: factor * amount, behavior: 'smooth' });
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

    this._hasScrollButtons = scrollWidth > clientWidth;
    this._scrollButtonsDisabled = {
      start: scrollLeft === 0,
      end: Math.abs(Math.abs(scrollLeft) + clientWidth - scrollWidth) <= 1,
    };

    this._host.requestUpdate();
  }

  /**
   * Updates the indicator DOM element styles based on the current "active" tab.
   */
  public async setIndicator(active?: IgcTabComponent): Promise<void> {
    if (!(this.container && this.indicator)) {
      return;
    }

    const styles = {
      visibility: active ? 'visible' : 'hidden',
    } satisfies Partial<CSSStyleDeclaration>;

    await this._host.updateComplete;

    if (active) {
      const header = getTabHeader(active);
      const { offsetLeft: containerLeft, offsetWidth: containerWidth } =
        this.container;
      const scaledWidth =
        header.getBoundingClientRect().width * getScaleFactor(header).x;

      const offset = this._isLeftToRight
        ? header.offsetLeft - containerLeft
        : header.offsetLeft + scaledWidth - containerWidth;

      Object.assign(styles, {
        width: `${scaledWidth}px`,
        transform: `translateX(${offset}px)`,
      });
    }

    setStyles(this.indicator, styles);
  }
}

export function createTabHelpers(
  host: IgcTabsComponent,
  container: Ref<HTMLElement>,
  indicator: Ref<HTMLElement>
) {
  return new TabsHelpers(host, container, indicator);
}

export function getTabHeader(tab: IgcTabComponent): HTMLElement {
  return tab.renderRoot.querySelector('[part~="tab-header"]')!;
}

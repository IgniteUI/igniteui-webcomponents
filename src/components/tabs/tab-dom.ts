import { createRef } from 'lit/directives/ref.js';
import type { StyleInfo } from 'lit/directives/style-map.js';
import { hasModifiers } from '#internals/controllers/key-bindings.js';
import { isLTR, setStyles } from '#internals/utils/dom.js';
import { asNumber } from '#internals/utils/math.js';
import { equal } from '#internals/utils/objects.js';
import type IgcTabComponent from './tab.js';
import type IgcTabsComponent from './tabs.js';

const EDGE_TOLERANCE = 1;

/** The height of the `max-height` probe without a `max-height`, as in tabs.base.scss. */
const NO_MAX_HEIGHT = 100_000;

export const TAB_HEADER = '[part~="tab-header"]';

/** A box on the scroll axis: the inline axis of a row, the block axis of a column. */
type Extent = {
  min: number;
  max: number;
  size: number;
};

/** How far `extent` passes the `max` (or `min`) edge of `bounds`, else 0. */
function pastEdge(
  extent: Extent,
  bounds: Omit<Extent, 'size'>,
  edge: 'min' | 'max'
): number {
  const offset = extent[edge] - bounds[edge];
  // A header that does not render has an empty box at the origin of the viewport.
  return extent.size && (edge === 'max' ? offset : -offset) > EDGE_TOLERANCE
    ? offset
    : 0;
}

export class TabsHelpers {
  private readonly _host: IgcTabsComponent;

  public readonly containerRef = createRef<HTMLElement>();
  public readonly indicatorRef = createRef<HTMLElement>();
  public readonly heightProbeRef = createRef<HTMLElement>();
  public readonly maxHeightProbeRef = createRef<HTMLElement>();

  /** The measured styles of the container. The keys render before hydration. */
  public styleProperties: StyleInfo = {
    '--_tabs-count': '',
    '--_ig-tabs-width': '',
    '--_ig-tabs-height': '',
    'max-height': '',
  };

  public hasScrollButtons = false;
  public scrollButtonsDisabled = { start: true, end: false };

  /** Whether the end of the scroll axis is its larger coordinate. */
  private get _endIsMax(): boolean {
    return isColumn(this._host) || isLTR(this._host);
  }

  constructor(host: IgcTabsComponent) {
    this._host = host;
  }

  /** Measures the strip and every tab header. On scroll, the cheaper `setScrollPositionState()` runs. */
  public updateLayout(): void {
    const tabs = this._host.tabs;
    const headers = tabs.map(getTabHeader);
    const container = this.containerRef.value;
    const probe = this.heightProbeRef.value;
    const column = isColumn(this._host);
    // The probe is as tall as a column with a definite height, else 0, so that the
    // panels can grow a column with an auto height. A `max-height` also limits them.
    const definite = column && probe ? this._getExtent(probe).size : 0;
    const limit = definite || (column ? this._getMaxHeight() : 0);
    // The room of the headers: the width of a row, or the height limit of a column.
    const room =
      container && (column ? limit : this._getExtent(container).size);
    // A hidden tab gets no track, so `justify` leaves no gap for it.
    const rendered = headers.filter(
      (header) => header?.checkVisibility() ?? true
    );
    const next = {
      '--_tabs-count': String(rendered.length || tabs.length),
      '--_ig-tabs-width': room === undefined || column ? '' : `${room}px`,
      '--_ig-tabs-height': limit ? `${limit}px` : '',
      // Only the limit of a `max-height`: the height probe is in the container.
      'max-height': limit && !definite ? `${limit}px` : '',
    };

    if (!equal(this.styleProperties, next)) {
      this.styleProperties = next;
      this._host.requestUpdate();
    }

    if (room === undefined) {
      return;
    }

    // The tabs alone, because the scroll size includes the scroll buttons. Subpixel
    // sizes, so that the rounding of many headers does not add up.
    const tabsSize = headers.reduce(
      (sum, header) => sum + (header ? this._getExtent(header).size : 0),
      0
    );

    // A column scrolls only with a height limit.
    this.setScrollPositionState(
      (room > 0 || !column) && tabsSize > room + EDGE_TOLERANCE
    );
  }

  /**
   * The extent of `element` on the scroll axis, in its own CSS pixels. An ancestor
   * `zoom` scales the client rectangle, but not the scroll offsets and the computed
   * styles.
   */
  private _getExtent(element: Element): Extent {
    const zoom = element.currentCSSZoom || 1;
    const { left, right, top, bottom, width, height } =
      element.getBoundingClientRect();
    const [min, max, size] = isColumn(this._host)
      ? [top, bottom, height]
      : [left, right, width];

    return { min: min / zoom, max: max / zoom, size: size / zoom };
  }

  /**
   * The `max-height` of the tabs without their padding and border, else 0. The probe
   * takes it in any unit that does not depend on the parent.
   */
  private _getMaxHeight(): number {
    const probe = this.maxHeightProbeRef.value;
    const max = probe ? this._getExtent(probe).size : 0;

    if (!max || max >= NO_MAX_HEIGHT - EDGE_TOLERANCE) {
      return 0;
    }

    const style = getComputedStyle(this._host);
    const frame =
      style.boxSizing === 'border-box'
        ? [
            style.paddingTop,
            style.paddingBottom,
            style.borderTopWidth,
            style.borderBottomWidth,
          ].reduce((sum, value) => sum + asNumber(value), 0)
        : 0;

    return Math.max(max - frame, 0);
  }

  /** The bounds of the strip without the sticky scroll buttons. */
  private _getVisibleBounds(container: HTMLElement): Omit<Extent, 'size'> {
    const style = getComputedStyle(container);
    const { min, max } = this._getExtent(container);
    const [low, high] = isColumn(this._host)
      ? [style.scrollPaddingTop, style.scrollPaddingBottom]
      : [style.scrollPaddingLeft, style.scrollPaddingRight];

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

  /** Scrolls the closest header that is past the `direction` edge into view. */
  public scrollTabs(direction: 'start' | 'end'): void {
    const container = this.containerRef.value;

    if (!container) {
      return;
    }

    const bounds = this._getVisibleBounds(container);
    const edge = (direction === 'end') === this._endIsMax ? 'max' : 'min';
    const offsets = this._host.tabs.map((tab) => {
      const header = getTabHeader(tab);
      return header ? pastEdge(this._getExtent(header), bounds, edge) : 0;
    });
    const offset =
      direction === 'end' ? offsets.find(Boolean) : offsets.findLast(Boolean);

    if (offset) {
      this._scrollBy(container, offset, 'smooth');
    }
  }

  /** Unlike `Element.scrollIntoView()`, it scrolls only the strip, never the page. */
  public async scrollTabIntoView(tab?: IgcTabComponent): Promise<void> {
    // Measures after the pending render, such as a new selection, and again after
    // the render of what it measured, such as the scroll buttons, which move every tab.
    await this._host.updateComplete;
    this.updateLayout();
    await this._host.updateComplete;

    const container = this.containerRef.value;
    const header = getTabHeader(tab);

    if (!(container && header)) {
      return;
    }

    const bounds = this._getVisibleBounds(container);
    const extent = this._getExtent(header);
    const offset =
      pastEdge(extent, bounds, 'max') || pastEdge(extent, bounds, 'min');

    if (offset) {
      this._scrollBy(container, offset);
    }
  }

  public setScrollPositionState(
    hasScrollButtons = this.hasScrollButtons
  ): void {
    const container = this.containerRef.value;

    if (!container) {
      return;
    }

    // A right-to-left row has a negative offset.
    const [offset, scrollSize, clientSize] = isColumn(this._host)
      ? [container.scrollTop, container.scrollHeight, container.clientHeight]
      : [container.scrollLeft, container.scrollWidth, container.clientWidth];
    const disabled = this.scrollButtonsDisabled;

    const start = Math.abs(offset) <= EDGE_TOLERANCE;
    const end =
      Math.abs(Math.abs(offset) + clientSize - scrollSize) <= EDGE_TOLERANCE;

    if (
      this.hasScrollButtons === hasScrollButtons &&
      disabled.start === start &&
      disabled.end === end
    ) {
      return;
    }

    this.hasScrollButtons = hasScrollButtons;
    this.scrollButtonsDisabled = { start, end };

    this._host.requestUpdate();
  }

  /** Moves the indicator to the header of `active`. Without `animate`, it moves at once. */
  public async setIndicator(
    active?: IgcTabComponent,
    animate = true
  ): Promise<void> {
    await this._host.updateComplete;

    const container = this.containerRef.value;
    const indicator = this.indicatorRef.value;

    if (!(container && indicator)) {
      return;
    }

    const header = getTabHeader(active);

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

/** Whether the headers form a column before or after the panels. */
export function isColumn(tabs: IgcTabsComponent): boolean {
  return tabs.headerPosition === 'start' || tabs.headerPosition === 'end';
}

export function getTabHeader(tab?: IgcTabComponent): HTMLElement | null {
  return tab?.renderRoot.querySelector(TAB_HEADER) ?? null;
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

  if (event && (event.button !== 0 || hasModifiers(event))) {
    return true;
  }

  // The browser uses the target of the first `<base>` element that has one.
  const target = (
    tab.target ??
    tab.ownerDocument.querySelector('base[target]')?.getAttribute('target')
  )?.toLowerCase();

  return Boolean(target) && target !== '_self';
}

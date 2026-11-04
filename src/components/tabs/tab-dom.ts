import { createRef } from 'lit/directives/ref.js';
import type { StyleInfo } from 'lit/directives/style-map.js';
import { isLTR, replaceStyles, setStyles } from '#internals/utils/dom.js';
import { linkOpensElsewhere } from '#internals/utils/events.js';
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

/**
 * The offset of `element` from the page on one axis. Unlike client rectangles, offsets
 * ignore transforms. Each offset parent counts, because the parts of the tabs are not
 * offset parents of a header.
 */
function getPageOffset(element: HTMLElement, vertical: boolean): number {
  let offset = vertical ? element.offsetTop : element.offsetLeft;

  for (
    let parent = element.offsetParent;
    parent instanceof HTMLElement;
    parent = parent.offsetParent
  ) {
    offset += vertical
      ? parent.offsetTop + parent.clientTop
      : parent.offsetLeft + parent.clientLeft;
  }

  return offset;
}

/** The padding and the border of `style` on one axis. */
function getFrame(style: CSSStyleDeclaration, vertical: boolean): number {
  return (vertical ? ['top', 'bottom'] : ['left', 'right']).reduce(
    (sum, side) =>
      sum +
      asNumber(style.getPropertyValue(`padding-${side}`)) +
      asNumber(style.getPropertyValue(`border-${side}-width`)),
    0
  );
}

/** How far `extent` passes the `max` (or `min`) edge of `bounds`, else 0. */
function pastEdge(
  extent: Extent,
  bounds: Omit<Extent, 'size'>,
  edge: 'min' | 'max'
): number {
  const offset = extent[edge] - bounds[edge];
  // A header that does not render has an empty box at the origin.
  return extent.size && (edge === 'max' ? offset : -offset) > EDGE_TOLERANCE
    ? offset
    : 0;
}

export class TabsHelpers {
  private readonly _host: IgcTabsComponent;

  public readonly containerRef = createRef<HTMLElement>();
  public readonly innerRef = createRef<HTMLElement>();
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

  /** Whether the next layout scrolls the selected tab into view. */
  public scrollOnLayout = false;

  /** The height of the height probe at the last check, and whether it was definite. */
  private _heightCheck = { probe: -1, definite: false };

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
    // A hidden tab gets no track, so `justify` leaves no gap for it.
    const rendered = headers.filter(
      (header) => header?.checkVisibility() ?? true
    );
    const count = String(rendered.length || tabs.length);

    // Hidden tabs measure nothing, so they keep the layout they showed with. Tabs
    // that never showed get the tab count, so that their tracks exist when they show.
    if (!container?.checkVisibility()) {
      this._setStyleProperties({
        ...this.styleProperties,
        '--_tabs-count': this.styleProperties['--_tabs-count'] || count,
      });
      return;
    }

    // The probe is as tall as a column with a definite height, else 0, so that the
    // panels can grow a column with an auto height. A `max-height` also limits them.
    const definite =
      column && probe ? this._getDefiniteHeight(container, probe) : 0;
    const limit = definite || (column ? this._getMaxHeight() : 0);
    // The room of the headers: the width of a row, or the height limit of a column.
    const room = column ? limit : this._getSize(container);

    this._setStyleProperties({
      '--_tabs-count': count,
      '--_ig-tabs-width': column ? '' : `${room}px`,
      '--_ig-tabs-height': limit ? `${limit}px` : '',
      // Only the limit of a `max-height`: the height probe is in the container.
      'max-height': limit && !definite ? `${limit}px` : '',
    });

    // The tabs alone, because the scroll size includes the scroll buttons. Subpixel
    // sizes, so that the rounding of many headers does not add up.
    const tabsSize = headers.reduce(
      (sum, header) => sum + (header ? this._getSize(header) : 0),
      0
    );

    // A column scrolls only with a height limit.
    this.setScrollPositionState(
      (room > 0 || !column) && tabsSize > room + EDGE_TOLERANCE
    );
  }

  private _setStyleProperties(next: StyleInfo): void {
    if (!equal(this.styleProperties, next)) {
      this.styleProperties = next;
      this._host.requestUpdate();
    }
  }

  /**
   * The height of the `probe`, else 0 when the parent sizes the tabs from their
   * content, such as a grid row with an auto height, so that the panels grow them.
   * Such a parent grows the container with a taller probe. The check runs again when
   * the height of the probe changes.
   */
  private _getDefiniteHeight(
    container: HTMLElement,
    probe: HTMLElement
  ): number {
    const height = this._getSize(probe);

    if (height && height !== this._heightCheck.probe) {
      const before = this._getSize(container);
      const restore = replaceStyles(probe, { 'block-size': `${2 * height}px` });
      const definite = this._getSize(container) <= before + EDGE_TOLERANCE;
      restore();

      this._heightCheck = { probe: height, definite };
    }

    return this._heightCheck.definite ? height : 0;
  }

  /**
   * The border-box size of `element` on the scroll axis, which transforms and `zoom`
   * do not scale. 0 without a box, where the computed size is the specified one,
   * such as `100%`.
   */
  private _getSize(element: Element): number {
    if (!element.checkVisibility()) {
      return 0;
    }

    const column = isColumn(this._host);
    const style = getComputedStyle(element);
    const size = asNumber(column ? style.height : style.width);

    return style.boxSizing === 'border-box'
      ? size
      : size + getFrame(style, column);
  }

  /** The extent of `element` on the scroll axis, from the page. */
  private _getExtent(element: HTMLElement): Extent {
    const column = isColumn(this._host);
    const min = getPageOffset(element, column);
    const size = column ? element.offsetHeight : element.offsetWidth;

    return { min, max: min + size, size };
  }

  /**
   * The `max-height` of the tabs without their padding and border, else 0. The probe
   * takes it in any unit that does not depend on the parent.
   */
  private _getMaxHeight(): number {
    const probe = this.maxHeightProbeRef.value;
    const max = probe ? this._getSize(probe) : 0;

    if (!max || max >= NO_MAX_HEIGHT - EDGE_TOLERANCE) {
      return 0;
    }

    const style = getComputedStyle(this._host);
    const frame = style.boxSizing === 'border-box' ? getFrame(style, true) : 0;

    return Math.max(max - frame, 0);
  }

  /**
   * The bounds of the strip without the sticky scroll buttons, from the page. Offsets
   * ignore the scroll of the strip, so the bounds move with it.
   */
  private _getVisibleBounds(container: HTMLElement): Omit<Extent, 'size'> {
    const style = getComputedStyle(container);
    const [inset, size, low, high] = isColumn(this._host)
      ? [
          container.clientTop + container.scrollTop,
          container.clientHeight,
          asNumber(style.scrollPaddingTop),
          asNumber(style.scrollPaddingBottom),
        ]
      : [
          container.clientLeft + container.scrollLeft,
          container.clientWidth,
          asNumber(style.scrollPaddingLeft),
          asNumber(style.scrollPaddingRight),
        ];
    const start = this._getExtent(container).min + inset;

    return { min: start + low, max: start + size - high };
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
    // Measures after the pending render, such as a new selection, and again after each
    // render of what it measured, such as a new tab count that brings in the scroll
    // buttons, which move every tab.
    await this._host.updateComplete;

    for (let pass = 0; pass < 3; pass++) {
      this.updateLayout();

      if (!this._host.isUpdatePending) {
        break;
      }

      await this._host.updateComplete;
    }

    const container = this.containerRef.value;
    const header = getTabHeader(tab);

    if (!(container && header)) {
      return;
    }

    // A strip that does not render, such as in a closed `<details>`, keeps the layout
    // it had, so the next layout scrolls again with the current scroll buttons.
    this.scrollOnLayout ||= !container.checkVisibility();

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

    const inner = this.innerRef.value;
    const indicator = this.indicatorRef.value;

    // Hidden tabs keep the indicator they showed with.
    if (!(inner?.checkVisibility() && indicator)) {
      return;
    }

    const header = getTabHeader(active);

    if (!header) {
      setStyles(indicator, { visibility: 'hidden' });
      return;
    }

    // The span moves from the start of the content box of the grid.
    const column = isColumn(this._host);
    const style = getComputedStyle(inner);
    const inset = column
      ? asNumber(style.borderTopWidth) + asNumber(style.paddingTop)
      : asNumber(style.borderInlineStartWidth) +
        asNumber(style.paddingInlineStart);
    const grid = this._getExtent(inner);
    const { min, max, size } = this._getExtent(header);
    const offset = this._endIsMax
      ? min - (grid.min + inset)
      : max - (grid.max - inset);

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
  return (
    tab.href != null && linkOpensElsewhere(tab.target, tab.ownerDocument, event)
  );
}

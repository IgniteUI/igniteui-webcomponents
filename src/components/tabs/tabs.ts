import '../button/icon-button';
import { html, LitElement, nothing } from 'lit';
import {
  eventOptions,
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { themes } from '../../theming/theming-decorator.js';
import type IgcTabComponent from './tab.js';
import type IgcTabPanelComponent from './tab-panel.js';
import { styles } from './themes/light/tabs.base.css.js';
import { styles as bootstrap } from './themes/light/tabs.bootstrap.css.js';
import { styles as fluent } from './themes/light/tabs.fluent.css.js';
import { styles as indigo } from './themes/light/tabs.indigo.css.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import { findLastIndex } from '../common/util.js';

export interface IgcTabsEventMap {
  igcChange: CustomEvent<string>;
}

/**
 * Represents tabs component
 *
 * @element igc-tabs
 *
 * @fires igcChange - Emitted when the selected tab changes.
 *
 * @slot - Renders the tab header.
 * @slot panel - Renders the tab content.
 *
 * @csspart headers - The wrapper of the tabs including the headers content and the scroll buttons.
 * @csspart headers-content - The container for the tab headers.
 * @csspart headers-wrapper - The wrapper for the tab headers and the selected indicator.
 * @csspart headers-scroll - The container for the headers.
 * @csspart selected-indicator - The selected indicator.
 * @csspart start-scroll-button - The start scroll button displayed when the tabs overflow.
 * @csspart end-scroll-button - The end scroll button displayed when the tabs overflow.
 * @csspart content - The container for the tabs content.
 */
@themes({ bootstrap, fluent, indigo })
export default class IgcTabsComponent extends EventEmitterMixin<
  IgcTabsEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tabs';

  public static styles = styles;

  @queryAssignedElements({ selector: 'igc-tab' })
  protected tabs!: Array<IgcTabComponent>;

  @queryAssignedElements({ slot: 'panel' })
  protected panels!: Array<IgcTabPanelComponent>;

  @query('slot', true)
  protected defaultSlot!: HTMLSlotElement;

  @query('[part="headers-wrapper"]', true)
  protected headersWrapper!: HTMLElement;

  @query('[part="headers-content"]', true)
  protected headersContent!: HTMLElement;

  @query('[part="selected-indicator"]', true)
  protected selectedIndicator!: HTMLElement;

  @state()
  protected showScrollButtons = false;

  @state()
  protected disableStartScrollButton = true;

  @state()
  protected disableEndScrollButton = false;

  @state()
  protected _selected = '';

  protected resizeObserver!: ResizeObserver;

  protected get selectedTab() {
    return this.tabs.find((tab) => tab.panel === this._selected);
  }

  protected get enabledTabs() {
    return this.tabs.filter((tab) => !tab.disabled);
  }

  protected get isLTR() {
    return (
      window.getComputedStyle(this).getPropertyValue('direction') === 'ltr'
    );
  }

  /** Returns the currently selected tab. */
  public get selected(): string {
    return this._selected;
  }

  /** Sets the alignment for the tab headers */
  @property({ reflect: true })
  public alignment: 'start' | 'end' | 'center' | 'justify' = 'start';

  /**
   * Determines the tab activation. When set to auto,
   * the tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys
   * and the corresponding panel is displayed.
   * When set to manual, the tab is only focused. The selection happens after pressing Space or Enter.
   */
  @property()
  public activation: 'auto' | 'manual' = 'auto';

  @watch('alignment', { waitUntilFirstUpdate: true })
  protected alignIndicator() {
    const styles: Partial<CSSStyleDeclaration> = {
      visibility: this.selected ? 'visible' : 'hidden',
      transitionDuration: '0.3s',
    };

    if (this.selected) {
      const { offsetLeft, offsetWidth } = this.selectedTab as IgcTabComponent;
      const [containerOffset, containerWidth] = [
        this.headersContent.offsetLeft,
        this.headersContent.offsetWidth,
      ];

      const position =
        offsetLeft + offsetWidth - containerWidth - containerOffset;

      Object.assign(styles, {
        width: `${offsetWidth}px`,
        transform: `translate(${
          this.isLTR ? offsetLeft - containerOffset : position
        }px)`,
      });
    }

    Object.assign(this.selectedIndicator.style, styles);
  }

  protected override async firstUpdated() {
    this.showScrollButtons =
      this.headersContent.scrollWidth > this.headersContent.clientWidth;

    await this.updateComplete;

    this.setSelectedTab(
      this.tabs.filter((tab) => tab.selected).at(-1) ?? this.enabledTabs.at(0)
    );

    this.setupObserver();
    this.defaultSlot.addEventListener('slotchange', this.handleSlotChange);
  }

  public override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.defaultSlot.removeEventListener('slotchange', this.handleSlotChange);
    super.disconnectedCallback();
  }

  protected updateButtonsOnResize() {
    // Hide the buttons in the resize observer callback and synchronously update the DOM
    // in order to get the actual size
    this.showScrollButtons = false;
    this.performUpdate();

    this.showScrollButtons =
      this.headersContent.scrollWidth > this.headersContent.clientWidth;

    this.updateScrollButtons();
  }

  protected updateScrollButtons() {
    const { scrollLeft, offsetWidth } = this.headersContent,
      { scrollWidth } = this.headersWrapper;

    this.disableEndScrollButton =
      scrollWidth <= Math.abs(scrollLeft) + offsetWidth;
    this.disableStartScrollButton = scrollLeft === 0;
  }

  protected setupObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateButtonsOnResize();
      this.alignIndicator();
    });

    [this.headersContent, this.headersWrapper, ...this.tabs].forEach(
      (element) => this.resizeObserver.observe(element)
    );
  }

  private setSelectedTab(tab?: IgcTabComponent) {
    if (!tab) {
      return;
    }

    if (tab.panel !== this._selected) {
      this._selected = tab.panel;

      this.tabs.forEach((el) => (el.selected = el.panel === this._selected));
      this.panels.forEach((el) => (el.selected = el.name === this._selected));

      this.scrollToTab(tab);
      this.alignIndicator();
    }
  }

  protected scrollToTab(
    target?: IgcTabComponent,
    alignment: 'start' | 'end' | 'nearest' = 'nearest'
  ) {
    target?.scrollIntoView({ behavior: 'smooth', inline: alignment });
  }

  protected getTabAtBoundary(boundary: 'start' | 'end' = 'end') {
    const { right } = this.headersContent.getBoundingClientRect();

    const [forward, backward] = [
      right + this.headersContent.scrollLeft,
      this.headersContent.scrollLeft,
    ];

    const dimensions = this.tabs.map(({ offsetLeft, offsetWidth }) => ({
      start: offsetLeft,
      end: offsetLeft + offsetWidth,
    }));

    const isNext = boundary === 'end';

    const point = this.isLTR
      ? isNext
        ? forward
        : backward
      : isNext
      ? backward
      : forward;

    let target = 0;

    if (this.isLTR) {
      target = isNext
        ? dimensions.findIndex(
            ({ start, end }) => start <= point && end >= point
          )
        : findLastIndex(dimensions, ({ start }) => start <= point);
    } else {
      target = isNext
        ? dimensions.findIndex(
            ({ start, end }) => start <= point && end >= point
          )
        : findLastIndex(dimensions, ({ end }) => end >= point);
    }
    return this.tabs[target];
  }

  protected handleStartButtonClick() {
    this.scrollToTab(this.getTabAtBoundary('start'), 'start');
  }

  protected handleEndButtonClick() {
    this.scrollToTab(this.getTabAtBoundary('end'), 'end');
  }

  protected handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('igc-tab');

    if (!tab || tab.disabled) {
      return;
    }

    tab.focus();
    this.setSelectedTab(tab);
    this.emitEvent('igcChange', { detail: this._selected });
  }

  protected handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const enabledTabs = this.enabledTabs;

    let index = enabledTabs.indexOf(document.activeElement as IgcTabComponent);

    switch (key) {
      case 'ArrowLeft':
        index = this.isLTR
          ? (enabledTabs.length + index - 1) % enabledTabs.length
          : (index + 1) % enabledTabs.length;
        break;
      case 'ArrowRight':
        index = this.isLTR
          ? (index + 1) % enabledTabs.length
          : (enabledTabs.length + index - 1) % enabledTabs.length;
        break;
      case 'Home':
        index = 0;
        break;
      case 'End':
        index = enabledTabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        this.setSelectedTab(enabledTabs[index]);
        break;
      default:
        return;
    }

    enabledTabs[index].focus({ preventScroll: true });

    if (this.activation === 'auto') {
      this.setSelectedTab(enabledTabs[index]);
      this.emitEvent('igcChange', { detail: this._selected });
    } else {
      this.scrollToTab(enabledTabs[index]);
    }

    event.preventDefault();
  };

  @eventOptions({ passive: true })
  protected handleScroll() {
    this.updateScrollButtons();
  }

  protected handleSlotChange = () => {
    this.resizeObserver?.disconnect();

    if (!this.selectedTab) {
      this.tabs.forEach((tab) => (tab.selected = false));
      this.panels.forEach((panel) => (panel.selected = false));
      this._selected = '';
    }

    this.setupObserver();
  };

  /** Selects the specified tab and displays the corresponding panel.  */
  public select(selectedTab: string | HTMLElement) {
    this.setSelectedTab(
      this.tabs.find((el) => el.panel === selectedTab || el === selectedTab)
    );
  }

  protected renderScrollButton(position: 'start' | 'end') {
    const start = position === 'start';

    return this.showScrollButtons
      ? html`<igc-icon-button
          size="large"
          variant="flat"
          collection="internal"
          part="${position}-scroll-button"
          name="navigate_${start ? 'before' : 'next'}"
          .disabled=${start
            ? this.disableStartScrollButton
            : this.disableEndScrollButton}
          @click=${start
            ? this.handleStartButtonClick
            : this.handleEndButtonClick}
        ></igc-icon-button>`
      : nothing;
  }

  protected override render() {
    return html`
      <div part="headers">
        ${this.renderScrollButton('start')}
        <div part="headers-content" @scroll=${this.handleScroll}>
          <div part="headers-wrapper">
            <div
              part="headers-scroll"
              role="tablist"
              @click=${this.handleClick}
              @keydown=${this.handleKeyDown}
            >
              <slot></slot>
            </div>
            <div part="selected-indicator"></div>
          </div>
        </div>
        ${this.renderScrollButton('end')}
      </div>
      <div part="content">
        <slot name="panel"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tabs': IgcTabsComponent;
  }
}

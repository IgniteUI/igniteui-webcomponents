import '../button/icon-button';
import { html, LitElement } from 'lit';
import {
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
  private tabs!: Array<IgcTabComponent>;

  @queryAssignedElements({ slot: 'panel' })
  private panels!: Array<IgcTabPanelComponent>;

  @query('[part="headers-wrapper"]', true)
  private headersWrapper!: HTMLLIElement;

  @query('[part="headers-content"]', true)
  private headersContent!: HTMLLIElement;

  @query('[part="selected-indicator"]', true)
  private selectedIndicator!: HTMLElement;

  @state() private showStartScrollButton = false;
  @state() private showEndScrollButton = false;

  private resizeObserver!: ResizeObserver;
  private _selected = '';

  private get isLTR() {
    return (
      window.getComputedStyle(this).getPropertyValue('direction') === 'ltr'
    );
  }

  /** Returns the currently selected tab. */
  @property({ type: String })
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
  private realignSelectedIndicator() {
    const selectedHeader = this.tabs.find(
      (element) => element.panel === this._selected
    );

    selectedHeader
      ? this.alignSelectedIndicator(selectedHeader as HTMLElement)
      : this.hideSelectedIndicator();
  }

  public override firstUpdated() {
    const selectedTab = this.tabs.filter((el) => el.selected).at(-1);

    selectedTab
      ? this.setSelectedTab(selectedTab)
      : this.setSelectedTab(this.tabs.find((el) => !el.disabled));

    this.resizeObserver = new ResizeObserver(() => {
      this.updateScrollButtons();
      this.realignSelectedIndicator();
    });

    this.updateComplete.then(() => {
      this.resizeObserver.observe(this.headersContent);
      this.resizeObserver.observe(this.headersWrapper);
      this.tabs.forEach((tab) => {
        this.resizeObserver.observe(tab);
      });
    });
  }

  public override disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  /** Selects the specified tab and displays the corresponding panel.  */
  public select(selectedTab: string | HTMLElement) {
    const tab = this.tabs.find(
      (el) => el.panel === selectedTab || el === selectedTab
    );

    if (tab) {
      this.setSelectedTab(tab);
    }
  }

  private setSelectedTab(tab?: IgcTabComponent) {
    if (!tab) {
      this.hideSelectedIndicator();
      return;
    }

    if (tab.panel !== this._selected) {
      this._selected = tab.panel;

      this.tabs.forEach((el) => (el.selected = el.panel === this._selected));
      this.panels.forEach((el) => (el.selected = el.name === this._selected));

      this.realignSelectedIndicator();
      this.scrollToTab(tab);
    }
  }

  protected getTabAtBoundary(boundary: 'start' | 'end' = 'end') {
    const { x, width } = this.headersContent.getBoundingClientRect();
    const scrollLeft = this.headersContent.scrollLeft;
    const tabs = this.tabs.map((tab) => ({
      start: tab.offsetLeft,
      end: tab.offsetLeft + tab.offsetWidth,
    }));

    if (this.isLTR) {
      const origin =
        boundary === 'end' ? x + width + scrollLeft : scrollLeft - x;

      const target =
        boundary === 'end'
          ? tabs.findIndex(({ start, end }) => start <= origin && end > origin)
          : tabs.findIndex(({ start }) => start > origin && origin > 0);

      return this.tabs[target];
    } else {
      const origin = boundary === 'end' ? scrollLeft : x + width + scrollLeft;

      const target =
        boundary === 'end'
          ? tabs.findIndex(({ start, end }) => start <= origin && end >= origin)
          : tabs.map(({ end }) => end >= origin).lastIndexOf(true);

      return this.tabs[target];
    }
  }

  private handleStartButtonClick() {
    const nearestTab = this.getTabAtBoundary('start');
    nearestTab
      ? this.scrollToTab(nearestTab)
      : this.scrollToTab(this.tabs[this.tabs.length - 1]);
  }

  private handleEndButtonClick() {
    const nearestTab = this.getTabAtBoundary('end');
    nearestTab ? this.scrollToTab(nearestTab) : this.scrollToTab(this.tabs[0]);
  }

  protected scrollToTab(target: IgcTabComponent) {
    target.scrollIntoView({ behavior: 'auto' });

    this.updateScrollButtons();
  }

  protected updateScrollButtons() {
    this.showEndScrollButton = false;
    this.showStartScrollButton = false;
    this.performUpdate();

    this.showEndScrollButton =
      Math.round(this.headersWrapper.offsetWidth) >
      Math.round(
        Math.abs(this.headersContent.scrollLeft) +
          this.headersContent.offsetWidth
      );
    this.showStartScrollButton = this.headersContent.scrollLeft !== 0;
  }

  private alignSelectedIndicator(element: HTMLElement, duration = 0.3) {
    const position =
      this.headersWrapper.offsetWidth -
      element.offsetLeft -
      element.offsetWidth;
    const transformation = this.isLTR
      ? `translate(${element.offsetLeft}px)`
      : `translate(${-position}px)`;
    const transitionDuration = duration > 0 ? `${duration}s` : 'initial';

    const indicatorStyles: Partial<CSSStyleDeclaration> = {
      visibility: 'visible',
      transitionDuration: `${transitionDuration}s`,
      width: `${element.offsetWidth}px`,
      transform: `${transformation}`,
    };

    Object.assign(this.selectedIndicator.style, indicatorStyles);
  }

  private hideSelectedIndicator() {
    const indicatorStyles: Partial<CSSStyleDeclaration> = {
      visibility: 'hidden',
    };

    Object.assign(this.selectedIndicator.style, indicatorStyles);
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('igc-tab');

    if (!tab || tab.disabled) {
      return;
    }

    tab.focus();
    this.setSelectedTab(tab);
    this.emitEvent('igcChange', { detail: this._selected });
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const activeEl = document.activeElement;
    const enabledTabs = this.tabs.filter((el) => !el.disabled);

    let index = enabledTabs.indexOf(activeEl as IgcTabComponent);

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

  private renderScrollButton(visible: boolean, { ...details }) {
    return visible
      ? html`
          <igc-icon-button
            part=${details.part}
            size="medium"
            variant="flat"
            name=${details.name}
            collection="internal"
            @click=${details.click}
          ></igc-icon-button>
        `
      : '';
  }

  protected override render() {
    return html`
      <div part="headers">
        ${this.renderScrollButton(this.showStartScrollButton, {
          part: 'start-scroll-button',
          name: 'navigate_before',
          click: this.handleStartButtonClick,
        })}
        <div part="headers-content">
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
        ${this.renderScrollButton(this.showEndScrollButton, {
          part: 'end-scroll-button',
          name: 'navigate_next',
          click: this.handleEndButtonClick,
        })}
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

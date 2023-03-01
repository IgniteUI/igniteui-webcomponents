import { html, LitElement, nothing } from 'lit';
import {
  eventOptions,
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcTabComponent from './tab.js';
import { watch } from '../common/decorators/watch.js';
import { isLTR, partNameMap } from '../common/util.js';
import type { ThemeController } from '../../theming/types.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/tabs/tabs.base.css.js';
import { styles as bootstrap } from './themes/tabs/tabs.bootstrap.css.js';
import { styles as fluent } from './themes/tabs/tabs.fluent.css.js';
import { styles as indigo } from './themes/tabs/tabs.indigo.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';

defineComponents(IgcTabComponent, IgcIconButtonComponent);

const OFFSET_TOLERANCE = 1;

export interface IgcTabsEventMap {
  igcChange: CustomEvent<IgcTabComponent>;
}

/**
 * IgcTabs provides a wizard-like workflow by dividing content into logical tabs.
 *
 * @remarks
 * The tabs component allows the user to navigate between multiple tabs.
 * It supports keyboard navigation and provides API methods to control the selected tab.
 *
 * @element igc-tabs
 *
 * @slot - Renders the tab components inside default slot.
 *
 * @fires igcSelectedTabChanging - Emitted when the selected tab is about to change.
 * @fires igcSelectedTabChanged - Emitted when the selected tab is changed.
 */
@themes({ bootstrap, fluent, indigo })
export default class IgcTabsComponent extends EventEmitterMixin<
  IgcTabsEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static readonly tagName = 'igc-tabs';
  /** @private */
  protected static styles = styles;
  /** @private */
  protected themeController!: ThemeController;

  private hostWidth = 0;

  private readonly keyDownHandlers: Map<string, Function> = new Map(
    Object.entries({
      Enter: this.selectTab,
      Space: this.selectTab,
      SpaceBar: this.selectTab,
      ' ': this.selectTab,
      ArrowLeft: this.onArrowLeftKeyDown,
      ArrowRight: this.onArrowRightKeyDown,
      Home: this.onHomeKey,
      End: this.onEndKey,
    })
  );

  public activeTab!: IgcTabComponent;

  /** Returns all of the tabs. */
  @queryAssignedElements({ selector: 'igc-tab' })
  public tabs!: Array<IgcTabComponent>;

  @query('[part~="tabs"]')
  protected scrollContainer!: HTMLElement;

  @query('[part="start-scroll-button"]')
  protected startButton!: HTMLElement;

  @query('[part="end-scroll-button"]')
  protected endButton!: HTMLElement;

  @query('[part="selected-indicator"] span')
  protected selectedIndicator!: HTMLElement;

  @state()
  protected showScrollButtons = false;

  @state()
  protected disableStartScrollButton = true;

  @state()
  protected disableEndScrollButton = false;

  /**
   * Sets the alignment for the tab headers
   * @attr
   */
  @property({ reflect: true })
  public alignment: 'start' | 'end' | 'center' | 'justify' = 'start';

  /**
   * Determines the tab activation. When set to auto,
   * the tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys
   * and the corresponding panel is displayed.
   * When set to manual, the tab is only focused. The selection happens after pressing Space or Enter.
   * @attr
   */
  @property()
  public activation: 'auto' | 'manual' = 'auto';

  protected resizeObserver!: ResizeObserver;

  @watch('alignment', { waitUntilFirstUpdate: true })
  protected alignIndicator() {
    if (this.themeController.theme === 'bootstrap') {
      return;
    }

    const styles: Partial<CSSStyleDeclaration> = {
      visibility: this.activeTab ? 'visible' : 'hidden',
      transitionDuration: '0.3s',
    };

    const getOffset = () => {
      if (isLTR(this)) {
        return this.activeTab!.header.offsetLeft;
      }
      return (
        this.activeTab!.header.offsetLeft -
        this.scrollContainer.getBoundingClientRect().width +
        this.activeTab!.header.getBoundingClientRect().width
      );
    };

    if (this.activeTab) {
      Object.assign(styles, {
        width: `${this.activeTab!.header.getBoundingClientRect().width}px`,
        transform: `translate(${getOffset()}px)`,
      });
    }

    Object.assign(this.selectedIndicator.style, styles);
  }

  constructor() {
    super();

    this.addEventListener('tabSelectedChanged', (event: any) => {
      event.stopPropagation();
      this.selectTab(event.target, false);
    });
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    this.setupObserver();
  }

  protected themeAdopted(controller: ThemeController) {
    this.themeController = controller;
  }

  public override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    super.disconnectedCallback();
  }

  protected updateButtonsOnResize() {
    this.showScrollButtons =
      this.scrollContainer.scrollWidth > this.scrollContainer.clientWidth;
    this.updateScrollButtons();
  }

  protected updateScrollButtons() {
    const { scrollLeft, scrollWidth } = this.scrollContainer;
    const { width } = this.scrollContainer.getBoundingClientRect();

    this.disableEndScrollButton =
      Math.abs(Math.abs(scrollLeft) + width - scrollWidth) <= OFFSET_TOLERANCE;
    this.disableStartScrollButton = scrollLeft === 0;
  }

  protected setupObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width === this.hostWidth) {
        return;
      }

      this.hostWidth = width;
      console.log('observe');
      this.style.setProperty('--tabs-width', width + 'px');
      this.updateButtonsOnResize();
      this.alignIndicator();
    });

    this.resizeObserver.observe(this);
  }

  private selectFirstTab() {
    const firstEnabledTab = this.tabs.find(
      (tab: IgcTabComponent) => !tab.disabled
    );
    if (firstEnabledTab) {
      this.selectTab(firstEnabledTab, false);
    }
  }

  private selectTab(tab: IgcTabComponent, shouldEmit = true) {
    if (tab === this.activeTab) {
      return;
    }

    this.setSelectedTab(tab);
    if (shouldEmit) {
      this.emitEvent('igcChange', { detail: this.activeTab });
    }
    this.alignIndicator();
  }

  private setSelectedTab(tab: IgcTabComponent) {
    if (this.activeTab) {
      this.activeTab.selected = false;
    }
    tab.selected = true;
    this.activeTab = tab;
    tab.header.scrollIntoView({ block: 'nearest' });
  }

  protected scrollByTabOffset(direction: 'start' | 'end') {
    const containerBoundingRect = this.scrollContainer.getBoundingClientRect();
    const LTR = isLTR(this);
    const next = direction === 'end';
    const { width: buttonWidth } = next
      ? this.startButton.getBoundingClientRect()
      : this.endButton.getBoundingClientRect();

    const nextTab = this.tabs
      .map((tab) => ({
        headerBoundingClientRect: tab.header.getBoundingClientRect(),
        tab: tab,
      }))
      .filter((tab) => {
        if ((next && LTR) || (!next && !LTR)) {
          return (
            tab.headerBoundingClientRect.right -
              containerBoundingRect.right +
              buttonWidth >
            OFFSET_TOLERANCE
          );
        } else {
          return (
            containerBoundingRect.left +
              buttonWidth -
              tab.headerBoundingClientRect.left >
            OFFSET_TOLERANCE
          );
        }
      })
      .at(next ? 0 : -1);

    if (nextTab) {
      nextTab!.tab.header.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: next ? 'end' : 'start',
      });
    }
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('igc-tab');

    if (!(tab && this.contains(tab)) || tab.disabled) {
      return;
    }

    tab.header.focus();
    this.selectTab(tab);
  }

  private handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const focusedTab = target.closest('igc-tab');

    if (this.keyDownHandlers.has(event.key)) {
      event.preventDefault();
      const nextTab = this.keyDownHandlers
        .get(event.key)
        ?.call(this, focusedTab);
      if (nextTab) {
        nextTab.header.focus({ preventScroll: true });
        if (this.activation === 'auto') {
          this.selectTab(nextTab);
        } else {
          nextTab.header.scrollIntoView({ block: 'nearest' });
        }
      }
    }
  }

  private onHomeKey() {
    return this.tabs.filter((tab: IgcTabComponent) => !tab.disabled)[0];
  }

  private onEndKey() {
    return this.tabs.filter((tab: IgcTabComponent) => !tab.disabled).pop();
  }

  private onArrowRightKeyDown(focusedTab: IgcTabComponent) {
    return isLTR(this)
      ? this.getNextTab(focusedTab)
      : this.getPreviousTab(focusedTab);
  }

  private onArrowLeftKeyDown(focusedTab: IgcTabComponent) {
    return isLTR(this)
      ? this.getPreviousTab(focusedTab)
      : this.getNextTab(focusedTab);
  }

  private getNextTab(focusedTab: IgcTabComponent): IgcTabComponent | undefined {
    const nextAccessible = this.tabs.find(
      (tab: IgcTabComponent, i: number) => i > focusedTab.index && !tab.disabled
    );
    return nextAccessible
      ? nextAccessible
      : this.tabs.find((tab: IgcTabComponent) => !tab.disabled);
  }

  private getPreviousTab(
    focusedTab: IgcTabComponent
  ): IgcTabComponent | undefined {
    let prevTab;
    for (let i = focusedTab.index - 1; i >= 0; i--) {
      const tab = this.tabs[i];
      if (!tab.disabled) {
        prevTab = tab;
        break;
      }
    }

    return prevTab
      ? prevTab
      : this.tabs.filter((tab: IgcTabComponent) => !tab.disabled).pop();
  }

  private syncProperties(): void {
    this.style.setProperty('--tabs-count', this.tabs.length.toString());
    this.tabs.forEach((tab: IgcTabComponent, index: number) => {
      tab.index = index;
      tab.selected = this.activeTab === tab;
      tab.header?.setAttribute('aria-setsize', this.tabs.length.toString());
    });
  }

  private tabsChanged(): void {
    const lastSelectedTab = this.tabs
      .reverse()
      .find((tab: IgcTabComponent) => tab.selected);
    if (!lastSelectedTab) {
      // initially when there isn't a predefined selected tab or when the selected tab is removed
      this.selectFirstTab();
    } else {
      // activate the last tab marked as selected
      this.selectTab(lastSelectedTab, false);
    }
    this.syncProperties();
    this.updateButtonsOnResize();
    this.alignIndicator();
  }

  @eventOptions({ passive: true })
  private handleScroll() {
    this.updateScrollButtons();
  }

  /** Selects the specified tab by tab id or HTMLElement reference.  */
  public select(tabIdentifier: IgcTabComponent | string) {
    if (typeof tabIdentifier === 'string') {
      tabIdentifier = this.tabs.find(
        (tab) => tab.id === tabIdentifier
      ) as IgcTabComponent;
    }
    if (tabIdentifier) {
      this.setSelectedTab(tabIdentifier);
    }
  }

  protected renderScrollButton(direction: 'start' | 'end') {
    const start = direction === 'start';

    return this.showScrollButtons
      ? html`<igc-icon-button
          tabindex="-1"
          aria-hidden="true"
          size="large"
          variant="flat"
          collection="internal"
          part="${direction}-scroll-button"
          name="navigate_${start ? 'before' : 'next'}"
          .disabled=${start
            ? this.disableStartScrollButton
            : this.disableEndScrollButton}
          @click=${() => this.scrollByTabOffset(direction)}
        ></igc-icon-button>`
      : nothing;
  }

  protected renderSelectIndicator() {
    if (this.themeController.theme !== 'bootstrap') {
      return html`<div part="selected-indicator"><span></span></div>`;
    } else {
      return html`<div part="separator"><span></span></div>`;
    }
  }

  protected override render() {
    return html`
      <div part="tabs" @scroll=${this.handleScroll}>
        <div
          role="tablist"
          part="${partNameMap({
            inner: true,
            scrollable: this.showScrollButtons,
          })}"
        >
          ${this.renderScrollButton('start')}
          <slot
            @slotchange=${this.tabsChanged}
            @click=${this.handleClick}
            @keydown=${this.handleKeydown}
          ></slot>
          ${this.renderScrollButton('end')} ${this.renderSelectIndicator()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tabs': IgcTabsComponent;
  }
}

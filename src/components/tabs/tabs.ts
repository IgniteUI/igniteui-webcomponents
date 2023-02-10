import { html, LitElement, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { IgcTabsEventMap } from './tabs.common.js';
import IgcTabComponent from './tab.js';
import { Direction } from '../common/types.js';
import { watch } from '../common/decorators/watch.js';
import { getOffset, isLTR, partNameMap } from '../common/util.js';
import type { ThemeController } from '../../theming/types.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/tabs/tabs.base.css.js';
import { styles as bootstrap } from './themes/tabs/tabs.bootstrap.css.js';
import { styles as fluent } from './themes/tabs/tabs.fluent.css.js';
import { styles as indigo } from './themes/tabs/tabs.indigo.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';

defineComponents(IgcTabComponent, IgcIconButtonComponent);

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
export default class IgcTabsComponent extends SizableMixin(
  EventEmitterMixin<IgcTabsEventMap, Constructor<LitElement>>(LitElement)
) {
  /** @private */
  public static readonly tagName = 'igc-tabs';
  /** @private */
  protected static styles = styles;
  /** @private */
  protected themeController!: ThemeController;

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

  private selectedTab!: IgcTabComponent;

  /** Returns all of the tabs. */
  @queryAssignedElements({ selector: 'igc-tab' })
  public tabs!: Array<IgcTabComponent>;

  @query('[part~="headers-scroll"]', true)
  protected scrollWrapper!: HTMLElement;

  @query('[part="start-scroll-button"]', true)
  protected startButton!: HTMLElement;

  @query('[part="end-scroll-button"]', true)
  protected endButton!: HTMLElement;

  // @query('[part="headers-content"]', true)
  // protected container!: HTMLElement;

  @query('[part="selected-indicator"] span', true)
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

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: Direction = 'auto';

  protected resizeObserver!: ResizeObserver;

  @watch('activation', { waitUntilFirstUpdate: true })
  protected activationChange(): void {
    this.tabs.forEach(
      (tab: IgcTabComponent) => (tab.activation = this.activation)
    );
  }

  @watch('alignment', { waitUntilFirstUpdate: true })
  protected alignIndicator() {
    if (this.themeController.theme === 'bootstrap') {
      return;
    }

    const styles: Partial<CSSStyleDeclaration> = {
      visibility: this.selectedTab ? 'visible' : 'hidden',
      transitionDuration: '0.3s',
    };

    if (this.selectedTab) {
      Object.assign(styles, {
        width: `${this.selectedTab!.offsetWidth}px`,
        transform: `translate(${
          isLTR(this)
            ? getOffset(this.selectedTab!, this).left
            : getOffset(this.selectedTab!, this).right
        }px)`,
      });
    }

    Object.assign(this.selectedIndicator.style, styles);
  }

  constructor() {
    super();

    this.addEventListener('tabSelectedChanged', (event: any) => {
      event.stopPropagation();
      // event.target.header.scrollIntoView();
      this.selectTab(event.target, event.detail);
    });

    this.addEventListener('tabHeaderKeydown', (event: any) => {
      event.stopPropagation();
      this.handleKeydown(event.detail.event, event.detail.focusedTab);
    });
  }

  protected override async firstUpdated() {
    this.setAttribute('role', 'tablist');

    this.showScrollButtons =
      this.scrollWrapper.scrollWidth > this.scrollWrapper.clientWidth;

    await this.updateComplete;

    this.setupObserver();
    // this.setSelectedTab(
    //   this.tabs.filter((tab) => tab.selected).at(-1) ?? this.enabledTabs.at(0)
    // );
    // this.updateSelectedTab();
  }

  protected themeAdopted(controller: ThemeController) {
    this.themeController = controller;
  }

  public override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    super.disconnectedCallback();
  }

  protected updateButtonsOnResize() {
    // Hide the buttons in the resize observer callback and synchronously update the DOM
    // in order to get the actual size
    this.showScrollButtons = false;
    this.performUpdate();

    this.showScrollButtons =
      this.scrollWrapper.scrollWidth > this.scrollWrapper.clientWidth;

    this.syncProperties();
    this.updateScrollButtons();
  }

  protected updateScrollButtons() {
    const { scrollLeft, scrollWidth } = this.scrollWrapper;
    const offsetWidth = this.scrollWrapper.getBoundingClientRect().width;

    this.disableEndScrollButton =
      Math.abs(scrollLeft + offsetWidth - scrollWidth) < 1;
    this.disableStartScrollButton = scrollLeft === 0;
  }

  protected scrollByTabOffset(direction: 'start' | 'end') {
    const wrapperBoundingRect = this.scrollWrapper.getBoundingClientRect();
    // const LTR = isLTR(this);
    const next = direction === 'end';
    const buttonWidth = next
      ? this.startButton.getBoundingClientRect().width
      : this.endButton.getBoundingClientRect().width;

    const nextTab = this.tabs
      .map((tab) => ({
        headerBoundingClientRect: tab.header.getBoundingClientRect(),
        tab: tab,
      }))
      .filter((tab) =>
        next
          ? tab.headerBoundingClientRect.right -
              wrapperBoundingRect.right +
              buttonWidth >
            1
          : wrapperBoundingRect.left +
              buttonWidth -
              tab.headerBoundingClientRect.left >
            1
      )
      .at(next ? 0 : -1);

    // this.scrollWrapper.scrollLeft = nextTab?.headerBoundingClientRect
    nextTab!.tab.header.scrollIntoView();

    // let amount = next
    //   ? nextTab!.start + nextTab!.width - pivot
    //   : pivot - nextTab!.start;

    // amount *= next ? 1 : -1;
    // this.scrollWrapper.scrollBy({ left: LTR ? amount : -amount });
    // this.style.setProperty(
    //   '--margin-left',
    //   (this.scrollWrapper.scrollLeft + amount).toString() + 'px'
    // );
  }

  protected setupObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.style.setProperty(
        '--tabs-width',
        this.getBoundingClientRect().width + 'px'
      );
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
    if (tab === this.selectedTab) {
      return;
    }

    if (shouldEmit) {
      const args = {
        detail: {
          owner: this,
          oldIndex: this.selectedTab.index,
          newIndex: tab.index,
        },
        cancelable: true,
      };

      const allowed = this.emitEvent('igcSelectedTabChanging', args);

      if (!allowed) {
        return;
      }
      this.changeSelectedTab(tab);
      this.emitEvent('igcSelectedTabChanged', {
        detail: { owner: this, index: tab.index },
      });
    } else {
      this.changeSelectedTab(tab);
    }
    this.alignIndicator();
  }

  private changeSelectedTab(tab: IgcTabComponent) {
    if (this.selectedTab) {
      this.selectedTab.selected = false;
    }
    tab.selected = true;
    this.selectedTab = tab;
  }

  private handleKeydown(event: KeyboardEvent, focusedTab: IgcTabComponent) {
    const key = event.key.toLowerCase();

    if (this.keyDownHandlers.has(event.key)) {
      event.preventDefault();
      this.keyDownHandlers.get(event.key)?.call(this, focusedTab);
    }
    if (key === 'tab' && this.selectedTab.index !== focusedTab.index) {
      this.selectedTab.header.focus();
    }
  }

  private onHomeKey() {
    this.tabs
      .filter((tab: IgcTabComponent) => !tab.disabled)[0]
      ?.header?.focus();
  }

  private onEndKey() {
    this.tabs
      .filter((tab: IgcTabComponent) => !tab.disabled)
      .pop()
      ?.header?.focus();
  }

  private onArrowRightKeyDown(focusedTab: IgcTabComponent) {
    const nextTab =
      this.dir === 'rtl'
        ? this.getPreviousTab(focusedTab)
        : this.getNextTab(focusedTab);
    nextTab?.header?.focus({ preventScroll: true });
    nextTab?.header?.scrollIntoView();
  }

  private onArrowLeftKeyDown(focusedTab: IgcTabComponent) {
    const nextTab =
      this.dir === 'rtl'
        ? this.getNextTab(focusedTab)
        : this.getPreviousTab(focusedTab);
    nextTab?.header?.focus({ preventScroll: true });
    nextTab?.header?.scrollIntoView();

    // this.scrollTabIntoView(nextTab!, false);

    // if (nextTab === this.tabs[this.tabs.length - 1]) {
    //   this.scrollWrapper.scrollBy({ left: 48 });
    // }
  }

  private getNextTab(focusedTab: IgcTabComponent): IgcTabComponent | undefined {
    if (focusedTab.index === this.tabs.length - 1) {
      return this.tabs.find((tab: IgcTabComponent) => !tab.disabled);
    }

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
    if (focusedTab.index === 0) {
      return this.tabs.filter((tab: IgcTabComponent) => !tab.disabled).pop();
    }

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
      tab.activation = this.activation;
      tab.index = index;
      tab.selected = this.selectedTab === tab;
      tab.header?.setAttribute('aria-posinset', (index + 1).toString());
      tab.header?.setAttribute('aria-setsize', this.tabs.length.toString());
      tab.header?.setAttribute('id', `igc-tab-header-${index}`);
      tab.header?.setAttribute('aria-controls', `igc-tab-content-${index}`);
    });
  }

  private async tabsChanged(): Promise<void> {
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
  }

  /** Selects the tab at a given index. */
  public navigateTo(index: number) {
    const tab = this.tabs[index];
    if (!tab) {
      return;
    }
    this.selectTab(tab, false);
  }

  private handleScroll() {
    this.updateScrollButtons();
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
    }
    return nothing;
  }

  protected override render() {
    return html`
      <div
        part="${partNameMap({
          'headers-scroll': true,
          scrollable: this.showScrollButtons,
        })}"
        role="tablist"
        @scroll=${this.handleScroll}
      >
        ${this.renderScrollButton('start')}
        <slot @slotchange=${this.tabsChanged}></slot>
        ${this.renderScrollButton('end')} ${this.renderSelectIndicator()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tabs': IgcTabsComponent;
  }
}

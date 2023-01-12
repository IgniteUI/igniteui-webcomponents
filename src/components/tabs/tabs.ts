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
import { getOffset, isLTR } from '../common/util.js';
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

  @query('[part="headers-wrapper"]', true)
  protected wrapper!: HTMLElement;

  @query('[part="headers-content"]', true)
  protected container!: HTMLElement;

  @query('[part="selected-indicator"]', true)
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
    const styles: Partial<CSSStyleDeclaration> = {
      visibility: this.selectedTab ? 'visible' : 'hidden',
      transitionDuration: '0.3s',
    };

    if (this.selectedTab) {
      Object.assign(styles, {
        width: `${this.selectedTab!.offsetWidth}px`,
        transform: `translate(${
          isLTR(this)
            ? getOffset(this.selectedTab!, this.wrapper).left
            : getOffset(this.selectedTab!, this.wrapper).right
        }px)`,
      });
    }

    Object.assign(this.selectedIndicator.style, styles);
  }

  constructor() {
    super();

    this.addEventListener('tabSelectedChanged', (event: any) => {
      event.stopPropagation();
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
      this.container.scrollWidth > this.container.clientWidth;

    await this.updateComplete;

    this.setupObserver();
    // this.setSelectedTab(
    //   this.tabs.filter((tab) => tab.selected).at(-1) ?? this.enabledTabs.at(0)
    // );
    // this.updateSelectedTab();
  }

  protected updateButtonsOnResize() {
    // Hide the buttons in the resize observer callback and synchronously update the DOM
    // in order to get the actual size
    this.showScrollButtons = false;
    this.performUpdate();

    this.showScrollButtons =
      this.container.scrollWidth > this.container.clientWidth;

    this.syncProperties();
    this.updateScrollButtons();
  }

  protected updateScrollButtons() {
    const { scrollLeft, offsetWidth } = this.container,
      { scrollWidth } = this.wrapper;

    this.disableEndScrollButton =
      scrollWidth <= Math.abs(scrollLeft) + offsetWidth;
    this.disableStartScrollButton = scrollLeft === 0;
  }

  protected setupObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateButtonsOnResize();
      this.alignIndicator();
    });

    [this.container, this.wrapper, ...this.tabs].forEach((element) =>
      this.resizeObserver.observe(element)
    );
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
    if (this.dir === 'rtl') {
      this.getPreviousTab(focusedTab)?.header?.focus();
    } else {
      this.getNextTab(focusedTab)?.header?.focus();
    }
  }

  private onArrowLeftKeyDown(focusedTab: IgcTabComponent) {
    if (this.dir === 'rtl') {
      this.getNextTab(focusedTab)?.header?.focus();
    } else {
      this.getPreviousTab(focusedTab)?.header?.focus();
    }
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
    const tabsLength = this.showScrollButtons
      ? this.tabs.length + 2
      : this.tabs.length;
    this.style.setProperty('--tabs-count', tabsLength.toString());
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

  private handleScroll() {}

  protected renderScrollButton(direction: 'start' | 'end') {
    const start = direction === 'start';
    // this.showScrollButtons = true;

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
        ></igc-icon-button>`
      : nothing;
  }

  protected override render() {
    return html`
      <div part="headers">
        <div part="headers-content" @scroll=${this.handleScroll}>
          <div part="headers-wrapper">
            <div part="headers-scroll" role="tablist">
              ${this.renderScrollButton('start')}
              <slot @slotchange=${this.tabsChanged}></slot>
              ${this.renderScrollButton('end')}
            </div>
            <div part="selected-indicator"></div>
          </div>
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

import { LitElement, html, nothing } from 'lit';
import {
  eventOptions,
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';

import { themes } from '../../theming/theming-decorator.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import {
  addKeybindings,
  arrowLeft,
  arrowRight,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import {
  type MutationControllerParams,
  createMutationController,
} from '../common/controllers/mutation-observer.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter, getOffset, isLTR, wrap } from '../common/util.js';
import IgcTabPanelComponent from './tab-panel.js';
import IgcTabComponent from './tab.js';
import { styles as shared } from './themes/shared/tabs/tabs.common.css.js';
import { all } from './themes/tabs-themes.js';
import { styles } from './themes/tabs.base.css.js';

export interface IgcTabsEventMap {
  igcChange: CustomEvent<IgcTabComponent>;
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
@themes(all)
@blazorAdditionalDependencies('IgcTabComponent, IgcTabPanelComponent')
export default class IgcTabsComponent extends EventEmitterMixin<
  IgcTabsEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tabs';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcTabsComponent,
      IgcTabComponent,
      IgcTabPanelComponent,
      IgcIconButtonComponent
    );
  }

  private static readonly increment = createCounter();

  protected headerRef: Ref<HTMLDivElement> = createRef();

  @queryAssignedElements({ selector: IgcTabComponent.tagName })
  protected tabs!: Array<IgcTabComponent>;

  @queryAssignedElements({ slot: 'panel' })
  protected panels!: Array<IgcTabPanelComponent>;

  @query('[part="headers-wrapper"]')
  protected wrapper!: HTMLElement;

  @query('[part="headers-content"]')
  protected container!: HTMLElement;

  @query('[part="selected-indicator"]')
  protected selectedIndicator!: HTMLElement;

  @state()
  protected showScrollButtons = false;

  @state()
  protected disableStartScrollButton = true;

  @state()
  protected disableEndScrollButton = false;

  @state()
  protected activeTab?: IgcTabComponent;

  protected resizeObserver!: ResizeObserver;

  private get _closestActiveTabIndex() {
    const root = this.getRootNode() as Document | ShadowRoot;
    const tabs = this.enabledTabs;
    const tab = root.activeElement
      ? root.activeElement.closest(IgcTabComponent.tagName)
      : null;

    return tabs.indexOf(tab!);
  }

  private _mutationCallback({
    changes: { attributes, added, removed },
  }: MutationControllerParams<IgcTabComponent>) {
    this.setSelectedTab(attributes.find((tab) => tab.selected));

    if (removed.length || added.length) {
      for (const tab of removed) {
        this.resizeObserver?.unobserve(tab);
        if (tab.selected && tab === this.activeTab) {
          this.activeTab = undefined;
        }
      }

      for (const tab of added) {
        this.resizeObserver?.observe(tab);
        if (tab.selected) {
          this.setSelectedTab(tab);
        }
      }

      this.syncAttributes();
    }

    this.updateSelectedTab();
    this.activeTab?.scrollIntoView({ block: 'nearest' });
    this.alignIndicator();
  }

  protected get enabledTabs() {
    return this.tabs.filter((tab) => !tab.disabled);
  }

  /** Returns the currently selected tab. */
  public get selected(): string {
    return this.activeTab?.panel ?? '';
  }

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

  @watch('alignment', { waitUntilFirstUpdate: true })
  protected alignIndicator() {
    const styles: Partial<CSSStyleDeclaration> = {
      visibility: this.activeTab ? 'visible' : 'hidden',
      transitionDuration: '0.3s',
    };

    if (this.activeTab && this.wrapper) {
      Object.assign(styles, {
        width: `${this.activeTab.offsetWidth}px`,
        transform: `translate(${
          isLTR(this)
            ? getOffset(this.activeTab, this.wrapper).left
            : getOffset(this.activeTab, this.wrapper).right
        }px)`,
      });
    }

    Object.assign(this.selectedIndicator?.style ?? {}, styles);
  }

  constructor() {
    super();

    addKeybindings(this, {
      ref: this.headerRef,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, this.onArrowLeft)
      .set(arrowRight, this.onArrowRight)
      .set(homeKey, this.onHomeKey)
      .set(endKey, this.onEndKey)
      .setActivateHandler(this.onActivationKey);

    createMutationController(this, {
      callback: this._mutationCallback,
      config: {
        attributeFilter: ['selected'],
        childList: true,
        subtree: true,
      },
      filter: [IgcTabComponent.tagName],
    });
  }

  protected override async firstUpdated() {
    this.showScrollButtons =
      this.container.scrollWidth > this.container.clientWidth;

    await this.updateComplete;

    this.syncAttributes();
    this.setupObserver();
    this.setSelectedTab(
      this.tabs.filter((tab) => tab.selected).at(-1) ?? this.enabledTabs.at(0)
    );
    this.updateSelectedTab();
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
      this.container.scrollWidth > this.container.clientWidth;

    this.updateScrollButtons();
  }

  protected updateScrollButtons() {
    const { scrollLeft, offsetWidth } = this.container;
    const { scrollWidth } = this.wrapper;

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

  protected updateSelectedTab() {
    this.tabs.forEach((tab) => {
      tab.selected = tab === this.activeTab;
    });
    this.panels.forEach((panel) => {
      panel.hidden = panel.id !== this.activeTab?.panel;
    });
  }

  protected syncAttributes() {
    const prefix = this.id ? `${this.id}-` : '';
    this.tabs.forEach((tab, index) => {
      if (!tab.panel) {
        tab.panel =
          this.panels.at(index)?.id ??
          `${prefix}tab-${IgcTabsComponent.increment()}`;
      }
      this.panels
        .find((panel) => panel.id === tab.panel)
        ?.setAttribute('aria-labelledby', tab.id);
    });
  }

  private setSelectedTab(tab?: IgcTabComponent) {
    if (!tab || tab === this.activeTab) {
      return;
    }

    if (this.activeTab) {
      this.activeTab.selected = false;
    }

    this.activeTab = tab;
    this.activeTab.selected = true;
  }

  protected scrollByTabOffset(direction: 'start' | 'end') {
    const { scrollLeft, offsetWidth } = this.container;
    const LTR = isLTR(this);
    const next = direction === 'end';

    const pivot = Math.abs(next ? offsetWidth + scrollLeft : scrollLeft);

    let amount = this.tabs
      .map((tab) => ({
        start: LTR
          ? getOffset(tab, this.wrapper).left
          : Math.abs(getOffset(tab, this.wrapper).right),
        width: tab.offsetWidth,
      }))
      .filter((offset) =>
        next ? offset.start + offset.width > pivot : offset.start < pivot
      )
      .at(next ? 0 : -1)!.width;

    amount *= next ? 1 : -1;
    this.container.scrollBy({ left: LTR ? amount : -amount });
  }

  protected handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('igc-tab');

    if (!(tab && this.contains(tab)) || tab.disabled) {
      return;
    }

    tab.focus();
    this.setSelectedTab(tab);
    this.emitEvent('igcChange', { detail: tab });
  }

  private _scrollToAndFocus(tab: IgcTabComponent) {
    tab.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    tab.focus();
  }

  private _kbActivateTab(tab: IgcTabComponent) {
    this._scrollToAndFocus(tab);

    if (this.activation === 'auto') {
      this.setSelectedTab(tab);
      this.emitEvent('igcChange', { detail: tab });
    }
  }

  private onArrowLeft() {
    const tabs = this.enabledTabs;
    const delta = isLTR(this) ? -1 : 1;

    this._kbActivateTab(
      tabs[wrap(0, tabs.length - 1, this._closestActiveTabIndex + delta)]
    );
  }

  private onArrowRight() {
    const tabs = this.enabledTabs;
    const delta = isLTR(this) ? 1 : -1;

    this._kbActivateTab(
      tabs[wrap(0, tabs.length - 1, this._closestActiveTabIndex + delta)]
    );
  }

  private onHomeKey() {
    this._kbActivateTab(this.enabledTabs.at(0)!);
  }

  private onEndKey() {
    this._kbActivateTab(this.enabledTabs.at(-1)!);
  }

  private onActivationKey() {
    const tabs = this.enabledTabs;
    const index = this._closestActiveTabIndex;

    this.setSelectedTab(tabs[index]);
    this._kbActivateTab(tabs[index]);
  }

  @eventOptions({ passive: true })
  protected handleScroll() {
    this.updateScrollButtons();
  }

  /** Selects the specified tab and displays the corresponding panel.  */
  public select(name: string) {
    this.setSelectedTab(this.tabs.find((el) => el.panel === name));
  }

  protected renderScrollButton(direction: 'start' | 'end') {
    const start = direction === 'start';

    return this.showScrollButtons
      ? html`<igc-icon-button
          tabindex="-1"
          aria-hidden="true"
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

  protected override render() {
    return html`
      <div part="headers">
        ${this.renderScrollButton('start')}
        <div part="headers-content" @scroll=${this.handleScroll}>
          <div part="headers-wrapper">
            <div
              ${ref(this.headerRef)}
              part="headers-scroll"
              role="tablist"
              @click=${this.handleClick}
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

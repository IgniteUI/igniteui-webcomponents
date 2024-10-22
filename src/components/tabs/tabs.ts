import { LitElement, html, nothing } from 'lit';
import {
  eventOptions,
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';

import { styleMap } from 'lit/directives/style-map.js';
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
import { createResizeController } from '../common/controllers/resize-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  findElementFromEventPath,
  first,
  isEmpty,
  isLTR,
  isString,
  last,
  partNameMap,
  scrollIntoView,
  wrap,
} from '../common/util.js';
import IgcTabComponent from './tab.js';
import { styles as shared } from './themes/shared/tabs/tabs.common.css.js';
import { all } from './themes/tabs-themes.js';
import { styles } from './themes/tabs.base.css.js';

export interface IgcTabsComponentEventMap {
  igcChange: CustomEvent<IgcTabComponent>;
}

function getTabHeader(element: IgcTabComponent) {
  return element.renderRoot.querySelector<HTMLElement>('[part~="header"]')!;
}

/* blazorAdditionalDependency: IgcTabComponent */
/**
 * `IgcTabsComponent` provides a wizard-like workflow by dividing content into logical tabs.
 *
 * @remarks
 * The tabs component allows the user to navigate between multiple tabs.
 * It supports keyboard navigation and provides API methods to control the selected tab.
 *
 * @element igc-tabs
 *
 * @fires igcChange - Emitted when the selected tab changes.
 *
 * @slot - Renders the `IgcTabComponents` inside default slot.
 *
 * @csspart start-scroll-button - The start scroll button displayed when the tabs overflow.
 * @csspart end-scroll-button - The end scroll button displayed when the tabs overflow.
 * @csspart selected-indicator - The indicator that shows which tab is selected.
 */
@themes(all)
export default class IgcTabsComponent extends EventEmitterMixin<
  IgcTabsComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tabs';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcTabsComponent,
      IgcTabComponent,
      IgcIconButtonComponent
    );
  }

  private _resizeController!: ReturnType<typeof createResizeController>;
  private _headerRef: Ref<HTMLDivElement> = createRef();

  @query('[part~="tabs"]', true)
  protected scrollContainer!: HTMLElement;

  @query('[part="start-scroll-button"]')
  protected startButton!: HTMLElement;

  @query('[part="end-scroll-button"]')
  protected endButton!: HTMLElement;

  @query('[part="selected-indicator"] span', true)
  protected _selectedIndicator!: HTMLElement;

  @state()
  private _activeTab?: IgcTabComponent;

  @state()
  private _tabsCSSVars = {
    '--tabs-count': '',
    '--ig-tabs-width': '',
  };

  @state()
  protected showScrollButtons = false;

  @state()
  protected disableStartScrollButton = true;

  @state()
  protected disableEndScrollButton = false;

  private get _closestActiveTabIndex() {
    const root = this.getRootNode() as Document | ShadowRoot;
    const tab = root.activeElement
      ? root.activeElement.closest(IgcTabComponent.tagName)
      : null;

    return this.enabledTabs.indexOf(tab!);
  }

  @queryAssignedElements({ selector: IgcTabComponent.tagName })
  public tabs!: Array<IgcTabComponent>;

  private _mutationCallback({
    changes: { attributes, added, removed },
  }: MutationControllerParams<IgcTabComponent>) {
    const selected = attributes.find((tab) => tab.selected);
    this.selectTab(selected, false);

    if (!isEmpty(removed) || !isEmpty(added)) {
      let nextSelectedTab: IgcTabComponent | null = null;

      for (const tab of removed) {
        this._resizeController.unobserve(tab);
        if (tab.selected && tab === this._activeTab) {
          nextSelectedTab = first(this.enabledTabs);
        }
      }

      for (const tab of added) {
        this._resizeController.observe(tab);
        if (tab.selected) {
          nextSelectedTab = tab;
        }
      }

      if (nextSelectedTab) {
        this.selectTab(nextSelectedTab, false);
      }

      this._setTabsCSSProps();
    }

    scrollIntoView(this._activeTab);
    this.alignIndicator();
  }

  protected get enabledTabs() {
    return this.tabs.filter((tab) => !tab.disabled);
  }

  /** Returns the currently selected tab. */
  public get selected(): string {
    return this._activeTab?.label ?? '';
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
  protected async alignIndicator() {
    const styles: Partial<CSSStyleDeclaration> = {
      visibility: this._activeTab ? 'visible' : 'hidden',
    };

    await this.updateComplete;

    if (this._activeTab) {
      const activeTabHeader = getTabHeader(this._activeTab);

      const headerOffsetLeft = activeTabHeader.offsetLeft;
      const headerWidth = activeTabHeader.getBoundingClientRect().width;
      const containerWidth = this.scrollContainer.getBoundingClientRect().width;

      const translateX = isLTR(this)
        ? headerOffsetLeft
        : headerOffsetLeft - containerWidth + headerWidth;

      Object.assign(styles, {
        width: `${headerWidth}px`,
        transform: `translateX(${translateX}px)`,
      });
    }

    Object.assign(this._selectedIndicator.style ?? {}, styles);
  }

  private async _resizeCallback() {
    this.updateButtonsOnResize();
    await this.updateComplete;
    this.alignIndicator();
    this._setTabsCSSProps();
  }

  constructor() {
    super();

    addKeybindings(this, {
      ref: this._headerRef,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, () => this._onArrowKey(isLTR(this) ? -1 : 1))
      .set(arrowRight, () => this._onArrowKey(isLTR(this) ? 1 : -1))
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

    this._resizeController = createResizeController(this, {
      callback: this._resizeCallback,
    });
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    const selectedTab =
      last(this.tabs.filter((tab) => tab.selected)) ?? first(this.enabledTabs);

    this._setTabsCSSProps();
    this.updateButtonsOnResize();
    this.selectTab(selectedTab, false);

    this._resizeController.observe(this.scrollContainer);
    for (const tab of this.tabs) {
      this._resizeController.observe(tab);
    }
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.role = 'tablist';
  }

  protected updateButtonsOnResize() {
    const { scrollWidth, clientWidth } = this.scrollContainer;

    this.showScrollButtons = scrollWidth > clientWidth;
    this.updateScrollButtons();
  }

  protected updateScrollButtons() {
    const { scrollLeft, scrollWidth } = this.scrollContainer;
    const { width } = this.scrollContainer.getBoundingClientRect();

    this.disableStartScrollButton = scrollLeft === 0;
    this.disableEndScrollButton =
      Math.abs(Math.abs(scrollLeft) + width - scrollWidth) === 0;
  }

  private selectTab(tab?: IgcTabComponent, shouldEmit = true) {
    if (!tab || tab === this._activeTab) {
      return;
    }

    this.setSelectedTab(tab);
    if (shouldEmit) {
      this.emitEvent('igcChange', { detail: this._activeTab });
    }
  }

  private async setSelectedTab(tab: IgcTabComponent) {
    if (this._activeTab) {
      this._activeTab.selected = false;
    }

    tab.selected = true;
    this._activeTab = tab;

    scrollIntoView(getTabHeader(tab));
    this.alignIndicator();
  }

  protected scrollByTabOffset(direction: 'start' | 'end') {
    const factor = isLTR(this) ? 1 : -1;
    const step = direction === 'start' ? -180 : 180;

    this.scrollContainer.scrollLeft += factor * step;
  }

  protected handleClick(event: PointerEvent) {
    const tab = findElementFromEventPath<IgcTabComponent>(
      IgcTabComponent.tagName,
      event
    );

    if (!(tab && this.contains(tab)) || tab.disabled) {
      return;
    }

    getTabHeader(tab).focus();
    this.selectTab(tab);
  }

  private _keyboardActivateTab(tab: IgcTabComponent) {
    scrollIntoView(getTabHeader(tab), { focus: true });

    if (this.activation === 'auto') {
      this.selectTab(tab);
    }
  }

  private _onArrowKey(delta: -1 | 1) {
    const tabs = this.enabledTabs;
    this._keyboardActivateTab(
      tabs[wrap(0, tabs.length - 1, this._closestActiveTabIndex + delta)]
    );
  }

  private onHomeKey() {
    this._keyboardActivateTab(first(this.enabledTabs));
  }

  private onEndKey() {
    this._keyboardActivateTab(last(this.enabledTabs));
  }

  private onActivationKey() {
    const tabs = this.enabledTabs;
    const index = this._closestActiveTabIndex;

    this.selectTab(tabs[index], false);
    this._keyboardActivateTab(tabs[index]);
  }

  private _setTabsCSSProps() {
    this._tabsCSSVars = {
      '--tabs-count': this.tabs.length.toString(),
      '--ig-tabs-width': `${this.scrollContainer.getBoundingClientRect().width}px`,
    };
  }

  @eventOptions({ passive: true })
  protected handleScroll() {
    this.updateScrollButtons();
  }

  /** Selects the specified tab and displays the corresponding panel.  */
  public select(tab: IgcTabComponent | string) {
    const element = isString(tab) ? this.tabs.find((t) => t.id === tab) : tab;

    if (element) {
      this.selectTab(element, false);
    }
  }

  protected renderScrollButton(direction: 'start' | 'end') {
    const start = direction === 'start';

    return this.showScrollButtons
      ? html`<igc-icon-button
          tabindex="-1"
          aria-hidden="true"
          variant="flat"
          collection="default"
          part="${direction}-scroll-button"
          exportparts="icon"
          name="${start ? 'prev' : 'next'}"
          .disabled=${start
            ? this.disableStartScrollButton
            : this.disableEndScrollButton}
          @click=${() => this.scrollByTabOffset(direction)}
        ></igc-icon-button>`
      : nothing;
  }

  protected override render() {
    const part = partNameMap({
      inner: true,
      scrollable: this.showScrollButtons,
    });

    return html`
      <div
        ${ref(this._headerRef)}
        part="tabs"
        style=${styleMap(this._tabsCSSVars)}
        @scroll=${this.handleScroll}
      >
        <div part=${part}>
          ${this.renderScrollButton('start')}

          <slot @click=${this.handleClick}></slot>

          ${this.renderScrollButton('end')}

          <div part="selected-indicator">
            <span></span>
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

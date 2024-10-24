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

  /** Used in the `update` hook to check if a dynamic ltr-rtl change has happened,
   * and calls `alignIndicator` if there is one.
   */
  private _isLTR = true;

  @query('[part~="tabs"]', true)
  protected _scrollContainer!: HTMLElement;

  @query('[part="selected-indicator"] span', true)
  protected _selectedIndicator!: HTMLElement;

  @state()
  private _activeTab?: IgcTabComponent;

  @state()
  private _cssVars = {
    '--_tabs-count': '',
    '--_ig-tabs-width': '',
  };

  @state()
  private _scrollButtonsDisabled = {
    start: true,
    end: false,
  };

  @state()
  protected showScrollButtons = false;

  private get _closestActiveTabIndex() {
    const root = this.getRootNode() as Document | ShadowRoot;
    const tab = root.activeElement
      ? root.activeElement.closest(IgcTabComponent.tagName)
      : null;

    return this._enabledTabs.indexOf(tab!);
  }

  protected get _enabledTabs() {
    return this.tabs.filter((tab) => !tab.disabled);
  }

  @queryAssignedElements({ selector: IgcTabComponent.tagName })
  public tabs!: Array<IgcTabComponent>;

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
  protected alignmentChanged() {
    this._alignIndicator();
  }

  constructor() {
    super();

    addKeybindings(this, {
      ref: this._headerRef,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, () => this.handleArrowKeys(isLTR(this) ? -1 : 1))
      .set(arrowRight, () => this.handleArrowKeys(isLTR(this) ? 1 : -1))
      .set(homeKey, this.handleHomeKey)
      .set(endKey, this.handleEndKey)
      .setActivateHandler(this.handleActivationKeys, { preventDefault: false });

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
      last(this.tabs.filter((tab) => tab.selected)) ?? first(this._enabledTabs);

    this._setCSSProps();
    this._updateButtonsOnResize();
    this._selectTab(selectedTab, false);

    this._resizeController.observe(this._scrollContainer);
    for (const tab of this.tabs) {
      this._resizeController.observe(tab);
    }
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.role = 'tablist';
  }

  protected override updated() {
    if (this._isLTR !== isLTR(this)) {
      this._isLTR = isLTR(this);
      this._alignIndicator();
    }
  }

  private async _resizeCallback() {
    this._updateButtonsOnResize();
    await this.updateComplete;
    this._alignIndicator();
    this._setCSSProps();
  }

  private _mutationCallback({
    changes: { attributes, added, removed },
  }: MutationControllerParams<IgcTabComponent>) {
    const selected = attributes.find((tab) => tab.selected);
    this._selectTab(selected, false);

    if (!isEmpty(removed) || !isEmpty(added)) {
      let nextSelectedTab: IgcTabComponent | null = null;

      for (const tab of removed) {
        this._resizeController.unobserve(tab);
        if (tab.selected && tab === this._activeTab) {
          nextSelectedTab = first(this._enabledTabs);
        }
      }

      for (const tab of added) {
        this._resizeController.observe(tab);
        if (tab.selected) {
          nextSelectedTab = tab;
        }
      }

      if (nextSelectedTab) {
        this._selectTab(nextSelectedTab, false);
      }

      this._setCSSProps();
    }

    scrollIntoView(this._activeTab);
    this._alignIndicator();
  }

  private async _alignIndicator() {
    const styles: Partial<CSSStyleDeclaration> = {
      visibility: this._activeTab ? 'visible' : 'hidden',
    };

    await this.updateComplete;

    if (this._activeTab) {
      const activeTabHeader = getTabHeader(this._activeTab);

      const headerOffsetLeft = activeTabHeader.offsetLeft;
      const headerWidth = activeTabHeader.getBoundingClientRect().width;
      const containerWidth =
        this._scrollContainer.getBoundingClientRect().width;

      const translateX = isLTR(this)
        ? headerOffsetLeft
        : headerOffsetLeft - containerWidth + headerWidth;

      Object.assign(styles, {
        width: `${headerWidth}px`,
        transform: `translateX(${translateX}px)`,
      });
    }

    Object.assign(this._selectedIndicator.style, styles);
  }

  private _updateButtonsOnResize() {
    const { scrollWidth, clientWidth } = this._scrollContainer;

    this.showScrollButtons = scrollWidth > clientWidth;
    this._updateScrollButtons();
  }

  private _updateScrollButtons() {
    const { scrollLeft, scrollWidth } = this._scrollContainer;
    const { width } = this._scrollContainer.getBoundingClientRect();

    this._scrollButtonsDisabled = {
      start: scrollLeft === 0,
      end: Math.abs(Math.abs(scrollLeft) + width - scrollWidth) === 0,
    };
  }

  private _selectTab(tab?: IgcTabComponent, shouldEmit = true) {
    if (!tab || tab === this._activeTab) {
      return;
    }

    this._setSelectedTab(tab);
    if (shouldEmit) {
      this.emitEvent('igcChange', { detail: this._activeTab });
    }
  }

  private async _setSelectedTab(tab: IgcTabComponent) {
    if (this._activeTab) {
      this._activeTab.selected = false;
    }

    tab.selected = true;
    this._activeTab = tab;

    scrollIntoView(getTabHeader(tab));
    this._alignIndicator();
  }

  private _scrollByOffset(direction: 'start' | 'end') {
    const factor = isLTR(this) ? 1 : -1;
    const step = direction === 'start' ? -180 : 180;

    this._setScrollSnap(direction);
    this._scrollContainer.scrollBy({ left: step * factor, behavior: 'smooth' });
  }

  private _keyboardActivateTab(tab: IgcTabComponent) {
    const header = getTabHeader(tab);

    this._setScrollSnap('unset');
    scrollIntoView(header);
    header.focus({ preventScroll: true });

    if (this.activation === 'auto') {
      this._selectTab(tab);
    }
  }

  private _setCSSProps() {
    this._cssVars = {
      '--_tabs-count': this.tabs.length.toString(),
      '--_ig-tabs-width': `${this._scrollContainer.getBoundingClientRect().width}px`,
    };
  }

  private _setScrollSnap(value: 'start' | 'end' | 'unset') {
    this._scrollContainer.style.setProperty('--_ig-tab-snap', value);
  }

  protected handleClick(event: PointerEvent) {
    const tab = findElementFromEventPath<IgcTabComponent>(
      IgcTabComponent.tagName,
      event
    );

    if (!(tab && this.contains(tab)) || tab.disabled) {
      return;
    }

    this._setScrollSnap('unset');
    getTabHeader(tab).focus();
    this._selectTab(tab);
  }

  protected handleArrowKeys(delta: -1 | 1) {
    const tabs = this._enabledTabs;
    this._keyboardActivateTab(
      tabs[wrap(0, tabs.length - 1, this._closestActiveTabIndex + delta)]
    );
  }

  protected handleHomeKey() {
    this._keyboardActivateTab(first(this._enabledTabs));
  }

  protected handleEndKey() {
    this._keyboardActivateTab(last(this._enabledTabs));
  }

  protected handleActivationKeys() {
    const tabs = this._enabledTabs;
    const index = this._closestActiveTabIndex;

    if (index > -1) {
      this._selectTab(tabs[index], false);
      this._keyboardActivateTab(tabs[index]);
    }
  }

  @eventOptions({ passive: true })
  protected handleScroll() {
    this._updateScrollButtons();
  }

  /** Selects the specified tab and displays the corresponding panel.  */
  public select(tab: IgcTabComponent | string) {
    const element = isString(tab) ? this.tabs.find((t) => t.id === tab) : tab;

    if (element) {
      this._selectTab(element, false);
    }
  }

  protected renderScrollButton(direction: 'start' | 'end') {
    const start = direction === 'start';

    return this.showScrollButtons
      ? html`
          <igc-icon-button
            tabindex="-1"
            variant="flat"
            collection="default"
            part="${direction}-scroll-button"
            exportparts="icon"
            name="${start ? 'prev' : 'next'}"
            ?disabled=${start
              ? this._scrollButtonsDisabled.start
              : this._scrollButtonsDisabled.end}
            @click=${() => this._scrollByOffset(direction)}
          >
          </igc-icon-button>
        `
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
        style=${styleMap(this._cssVars)}
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

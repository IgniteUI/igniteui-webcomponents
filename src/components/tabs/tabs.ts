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
import { isLTR, partNameMap, wrap } from '../common/util.js';
import IgcTabComponent from './tab.js';
import { styles as shared } from './themes/shared/tabs/tabs.common.css.js';
import { all } from './themes/tabs-themes.js';
import { styles } from './themes/tabs.base.css.js';

const OFFSET_TOLERANCE = 1;
export interface IgcTabsComponentEventMap {
  igcChange: CustomEvent<IgcTabComponent>;
}

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
@blazorAdditionalDependencies('IgcTabComponent')
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

  protected headerRef: Ref<HTMLDivElement> = createRef();

  public activeTab?: IgcTabComponent;

  @queryAssignedElements({ selector: IgcTabComponent.tagName })
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
    this.selectTab(
      attributes.find((tab) => tab.selected),
      false
    );

    if (removed.length || added.length) {
      for (const tab of removed) {
        this.resizeObserver?.unobserve(tab);
        if (tab.selected && tab === this.activeTab) {
          this.selectTab(this.enabledTabs.at(0), false);
        }
      }

      for (const tab of added) {
        this.resizeObserver?.observe(tab);
        if (tab.selected) {
          this.selectTab(tab);
        }
      }
      this.syncProperties();
    }

    this.activeTab?.scrollIntoView({ block: 'nearest' });
    this.alignIndicator();
  }

  protected get enabledTabs() {
    return this.tabs.filter((tab) => !tab.disabled);
  }

  /** Returns the currently selected tab. */
  public get selected(): string {
    return this.activeTab?.label ?? '';
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

    if (this.activeTab) {
      const activeTabOffesetLeft = this.activeTab!.header.offsetLeft;
      const activeTabWidth =
        this.activeTab!.header.getBoundingClientRect().width;
      const scrollContainerWidth =
        this.scrollContainer.getBoundingClientRect().width;

      const getOffset = () => {
        if (isLTR(this)) {
          return activeTabOffesetLeft;
        }
        return activeTabOffesetLeft - scrollContainerWidth + activeTabWidth;
      };

      Object.assign(styles, {
        width: `${activeTabWidth}px`,
        transform: `translate(${getOffset()}px)`,
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
        attributeFilter: ['selected', 'dir'],
        childList: true,
        subtree: true,
      },
      filter: [IgcTabComponent.tagName],
    });
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    this.syncProperties();
    this.updateButtonsOnResize();
    this.setupObserver();
    this.selectTab(
      this.tabs.filter((tab) => tab.selected).at(-1) ?? this.enabledTabs.at(0),
      false
    );
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
    this.resizeObserver = new ResizeObserver(() => {
      this.updateButtonsOnResize();
      this.performUpdate();
      this.alignIndicator();
    });

    [this.scrollContainer, ...this.tabs].forEach((element) =>
      this.resizeObserver.observe(element)
    );
  }

  private selectTab(tab?: IgcTabComponent, shouldEmit = true) {
    if (!tab || tab === this.activeTab) {
      return;
    }

    this.setSelectedTab(tab);
    if (shouldEmit) {
      this.emitEvent('igcChange', { detail: this.activeTab });
    }
  }

  private async setSelectedTab(tab: IgcTabComponent) {
    if (this.activeTab) {
      this.activeTab.selected = false;
    }

    tab.selected = true;
    this.activeTab = tab;

    await this.performUpdate();

    this.scrollContainer.part.add('focused');
    tab.header.scrollIntoView({ block: 'nearest' });

    this.scrollContainer.part.remove('focused');

    this.alignIndicator();
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
        }
        return (
          containerBoundingRect.left +
            buttonWidth -
            tab.headerBoundingClientRect.left >
          OFFSET_TOLERANCE
        );
      })
      .at(next ? 0 : -1);

    if (nextTab) {
      this.scrollContainer.part.add('focused');

      nextTab!.tab.header.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: next ? 'end' : 'start',
      });
    }
  }

  protected handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('igc-tab');

    if (!(tab && this.contains(tab)) || tab.disabled) {
      return;
    }

    tab.header.focus();
    this.selectTab(tab);
  }

  private _scrollToAndFocus(tab: IgcTabComponent) {
    tab.header.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    tab.header.focus();
  }

  private _kbActivateTab(tab: IgcTabComponent) {
    this._scrollToAndFocus(tab);

    if (this.activation === 'auto') {
      this.selectTab(tab);
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

    this.selectTab(tabs[index], false);
    this._kbActivateTab(tabs[index]);
  }

  private syncProperties() {
    this.style.setProperty('--tabs-count', this.tabs.length.toString());
    this.tabs.forEach((tab: IgcTabComponent, index: number) => {
      tab.index = index;
      tab.selected = this.activeTab === tab;
      tab.header?.setAttribute('aria-setsize', this.tabs.length.toString());
    });
  }

  @eventOptions({ passive: true })
  protected handleScroll() {
    this.updateScrollButtons();
  }

  /** Selects the specified tab and displays the corresponding panel.  */
  public select(tabIdentifier: IgcTabComponent | string) {
    let tab = tabIdentifier;
    if (typeof tab === 'string') {
      tab = this.tabs.find(
        (tab) => tab.id === tabIdentifier
      ) as IgcTabComponent;
    }
    if (tab) {
      this.selectTab(tab, false);
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
    return html`
      <div part="tabs" @scroll=${this.handleScroll}>
        <div
          ${ref(this.headerRef)}
          role="tablist"
          part="${partNameMap({
            inner: true,
            scrollable: this.showScrollButtons,
          })}"
        >
          ${this.renderScrollButton('start')}
          <slot @click=${this.handleClick}></slot>
          ${this.renderScrollButton('end')}
          <div part="selected-indicator"><span></span></div>
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

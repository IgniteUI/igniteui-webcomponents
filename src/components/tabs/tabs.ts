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
import { createResizeController } from '../common/controllers/resize-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  findElementFromEventPath,
  first,
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

const OFFSET_TOLERANCE = 1;
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

  protected headerRef: Ref<HTMLDivElement> = createRef();

  public activeTab?: IgcTabComponent;

  @queryAssignedElements({ selector: IgcTabComponent.tagName })
  public tabs!: Array<IgcTabComponent>;

  @query('[part~="tabs"]', true)
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
    const selected = attributes.find((tab) => tab.selected);
    this.selectTab(selected, false);

    if (removed.length || added.length) {
      for (const tab of removed) {
        this._resizeController.unobserve(tab);
        if (tab.selected && tab === this.activeTab) {
          this.selectTab(first(this.enabledTabs), false);
        }
      }

      for (const tab of added) {
        this._resizeController.observe(tab);
        if (tab.selected) {
          this.selectTab(tab);
        }
      }

      this._setTabsCount();
    }

    scrollIntoView(this.activeTab);
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
    };

    if (this.activeTab) {
      const activeTabHeader = getTabHeader(this.activeTab);

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

    Object.assign(this.selectedIndicator.style ?? {}, styles);
  }

  private async _resizeCallback() {
    this.updateButtonsOnResize();
    await this.updateComplete;
    this.alignIndicator();
    this.setComponentWidth();
  }

  constructor() {
    super();

    addKeybindings(this, {
      ref: this.headerRef,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, () => this._onArrowKey(isLTR(this) ? -1 : 1))
      .set(arrowRight, () => this._onArrowKey(isLTR(this) ? 1 : -1))
      .set(homeKey, this.onHomeKey)
      .set(endKey, this.onEndKey)
      .setActivateHandler(this.onActivationKey);

    this._resizeController = createResizeController(this, {
      callback: this._resizeCallback,
    });

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
    await this.updateComplete;

    const selectedTab =
      last(this.tabs.filter((tab) => tab.selected)) ?? first(this.enabledTabs);

    this._setTabsCount();
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

  private setComponentWidth() {
    const width = this.scrollContainer.getBoundingClientRect().width;
    this.style.setProperty('--ig-tabs-width', `${width}px`);
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

    this.scrollContainer.part.add('focused');
    scrollIntoView(getTabHeader(tab));
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
        headerBoundingClientRect: getTabHeader(tab).getBoundingClientRect(),
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
      scrollIntoView(getTabHeader(nextTab.tab), {
        inline: next ? 'end' : 'start',
      });
      this.scrollContainer.part.add('focused');
    }
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

  private _setTabsCount() {
    this.style.setProperty('--tabs-count', this.tabs.length.toString());
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
      <div part="tabs" @scroll=${this.handleScroll} ${ref(this.headerRef)}>
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

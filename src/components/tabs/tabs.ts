import { html, LitElement, nothing } from 'lit';
import {
  eventOptions,
  property,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { createRef, ref } from 'lit/directives/ref.js';

import { styleMap } from 'lit/directives/style-map.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import {
  addKeybindings,
  arrowLeft,
  arrowRight,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '../common/controllers/mutation-observer.js';
import { createResizeObserverController } from '../common/controllers/resize-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import {
  findElementFromEventPath,
  first,
  getRoot,
  isEmpty,
  isLTR,
  isString,
  last,
  scrollIntoView,
  wrap,
} from '../common/util.js';
import type { TabsActivation, TabsAlignment } from '../types.js';
import IgcTabComponent from './tab.js';
import { createTabHelpers, getTabHeader } from './tab-dom.js';
import { styles as shared } from './themes/shared/tabs/tabs.common.css.js';
import { styles } from './themes/tabs.base.css.js';
import { all } from './themes/tabs-themes.js';

export interface IgcTabsComponentEventMap {
  igcChange: CustomEvent<IgcTabComponent>;
}

/* blazorAdditionalDependency: IgcTabComponent */
/**
 * Tabs organize and allow navigation between groups of content that are related and at the same level of hierarchy.
 *
 * The `<igc-tabs>` component allows the user to navigate between multiple `<igc-tab>` elements.
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
export default class IgcTabsComponent extends EventEmitterMixin<
  IgcTabsComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tabs';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcTabsComponent,
      IgcTabComponent,
      IgcIconButtonComponent
    );
  }

  //#region Private state & properties

  private readonly _resizeController = createResizeObserverController(this, {
    callback: this._resizeCallback,
    options: { box: 'border-box' },
    target: null,
  });

  /** The tabs container reference holding the tab headers. */
  private readonly _headerRef = createRef<HTMLElement>();

  /** The selected tab indicator reference.  */
  private readonly _indicatorRef = createRef<HTMLElement>();

  private readonly _domHelpers = createTabHelpers(
    this,
    this._headerRef,
    this._indicatorRef
  );

  @queryAssignedElements({ selector: IgcTabComponent.tagName })
  private _tabs!: IgcTabComponent[];

  protected get _enabledTabs(): IgcTabComponent[] {
    return this._tabs.filter((tab) => !tab.disabled);
  }

  @state()
  private _activeTab?: IgcTabComponent;

  //#endregion

  //#region Public properties

  /**
   * Sets the alignment for the tab headers
   * @attr
   */
  @property({ reflect: true })
  public alignment: TabsAlignment = 'start';

  /**
   * Determines the tab activation. When set to auto,
   * the tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys
   * and the corresponding panel is displayed.
   * When set to manual, the tab is only focused. The selection happens after pressing Space or Enter.
   * @attr
   */
  @property()
  public activation: TabsActivation = 'auto';

  /* blazorSuppress */
  /** Returns the direct `igc-tab` elements that are children of this element. */
  public get tabs(): IgcTabComponent[] {
    return this._tabs;
  }

  /** Returns the currently selected tab label or IDREF if no label property is set. */
  public get selected(): string {
    if (this._activeTab) {
      return this._activeTab.label || this._activeTab.id;
    }

    return '';
  }

  //#endregion

  @watch('alignment', { waitUntilFirstUpdate: true })
  protected _alignmentChanged(): void {
    this._domHelpers.setIndicator(this._activeTab);
  }

  //#region Life-cycle hooks

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      ref: this._headerRef,
      skip: this._skipKeyboard,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, () => this._handleArrowKeys(isLTR(this) ? -1 : 1))
      .set(arrowRight, () => this._handleArrowKeys(isLTR(this) ? 1 : -1))
      .set(homeKey, this._handleHomeKey)
      .set(endKey, this._handleEndKey)
      .setActivateHandler(this._handleActivationKeys, {
        preventDefault: false,
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
      this._tabs.findLast((tab) => tab.selected) ?? first(this._enabledTabs);

    this._domHelpers.setStyleProperties();
    this._domHelpers.setScrollButtonState();
    this._setSelectedTab(selectedTab, false);

    this._resizeController.observe(this._headerRef.value!);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.role = 'tablist';
  }

  protected override updated(): void {
    if (this._domHelpers.isLeftToRightChanged) {
      this._domHelpers.setIndicator(this._activeTab);
    }
  }

  //#endregion

  //#region Observers callbacks

  private _resizeCallback(): void {
    this._domHelpers.setStyleProperties();
    this._domHelpers.setScrollButtonState();
    this._domHelpers.setIndicator(this._activeTab);
  }

  private _mutationCallback(
    parameters: MutationControllerParams<IgcTabComponent>
  ): void {
    this._selectedAttributeChanged(parameters);
    this._handleTabsRemoved(parameters);
    this._handleTabsAdded(parameters);

    this._domHelpers.setStyleProperties();
    this._domHelpers.setScrollButtonState();
    this._domHelpers.setIndicator(this._activeTab);
  }

  private _selectedAttributeChanged({
    changes,
  }: MutationControllerParams<IgcTabComponent>): void {
    const selected = changes.attributes.find(
      (tab) => this._tabs.includes(tab) && tab.selected
    );
    this._setSelectedTab(selected, false);
  }

  private _handleTabsAdded({
    changes,
  }: MutationControllerParams<IgcTabComponent>): void {
    if (!isEmpty(changes.added)) {
      const lastAdded = changes.added.findLast(
        (change) =>
          change.target.closest(this.tagName) === this && change.node.selected
      )?.node;

      this._setSelectedTab(lastAdded, false);
    }
  }

  private _handleTabsRemoved({
    changes,
  }: MutationControllerParams<IgcTabComponent>): void {
    if (!isEmpty(changes.removed)) {
      let nextSelectedTab: IgcTabComponent | null = null;

      const removed = changes.removed.filter(
        (change) => change.target.closest(this.tagName) === this
      );

      for (const each of removed) {
        if (each.node.selected && each.node === this._activeTab) {
          nextSelectedTab = first(this._enabledTabs);
          break;
        }
      }

      if (nextSelectedTab) {
        this._setSelectedTab(nextSelectedTab, false);
      }
    }
  }

  //#endregion

  //#region Private API

  private _getClosestActiveTabIndex(): number {
    const active = getRoot(this).activeElement;
    const tab = active ? active.closest(IgcTabComponent.tagName) : null;
    return tab ? this._enabledTabs.indexOf(tab) : -1;
  }

  private _setSelectedTab(tab?: IgcTabComponent, shouldEmit = true): void {
    if (!tab || tab === this._activeTab) {
      return;
    }

    if (this._activeTab) {
      this._activeTab.selected = false;
    }

    tab.selected = true;
    this._activeTab = tab;

    scrollIntoView(getTabHeader(tab));
    this._domHelpers.setIndicator(this._activeTab);

    if (shouldEmit) {
      this.emitEvent('igcChange', { detail: this._activeTab });
    }
  }

  private _keyboardActivateTab(tab: IgcTabComponent) {
    const header = getTabHeader(tab);

    this._domHelpers.setScrollSnap();
    scrollIntoView(header);
    header.focus({ preventScroll: true });

    if (this.activation === 'auto') {
      this._setSelectedTab(tab);
    }
  }

  private _skipKeyboard(node: Element, event: KeyboardEvent): boolean {
    return !(
      this._isEventFromTabHeader(event) &&
      this._tabs.includes(node.closest(IgcTabComponent.tagName)!)
    );
  }

  private _isEventFromTabHeader(event: Event) {
    return findElementFromEventPath('[part~="tab-header"]', event);
  }

  //#endregion

  //#region Event handlers

  protected _handleArrowKeys(delta: -1 | 1): void {
    const tabs = this._enabledTabs;
    this._keyboardActivateTab(
      tabs[wrap(0, tabs.length - 1, this._getClosestActiveTabIndex() + delta)]
    );
  }

  protected _handleHomeKey(): void {
    this._keyboardActivateTab(first(this._enabledTabs));
  }

  protected _handleEndKey(): void {
    this._keyboardActivateTab(last(this._enabledTabs));
  }

  protected _handleActivationKeys(): void {
    const tabs = this._enabledTabs;
    const index = this._getClosestActiveTabIndex();

    if (index > -1) {
      this._setSelectedTab(tabs[index], false);
      this._keyboardActivateTab(tabs[index]);
    }
  }

  protected _handleClick(event: PointerEvent): void {
    if (!this._isEventFromTabHeader(event)) {
      return;
    }

    const tab = findElementFromEventPath<IgcTabComponent>(
      IgcTabComponent.tagName,
      event
    );

    if (!(tab && this._tabs.includes(tab)) || tab?.disabled) {
      return;
    }

    this._domHelpers.setScrollSnap();
    getTabHeader(tab).focus();
    this._setSelectedTab(tab);
  }

  @eventOptions({ passive: true })
  protected _handleScroll(): void {
    this._domHelpers.setScrollButtonState();
  }

  //#endregion

  //#region Public API methods

  /** Selects the specified tab and displays the corresponding panel.  */
  public select(id: string): void;
  /* blazorSuppress (ref is reserved) */
  public select(ref: IgcTabComponent): void;
  /* blazorSuppress (ref is reserved) */
  public select(ref: IgcTabComponent | string): void {
    const tab = isString(ref) ? this._tabs.find((t) => t.id === ref) : ref;

    if (tab) {
      this._setSelectedTab(tab, false);
    }
  }

  //#endregion

  //#region Render

  protected _renderScrollButton(direction: 'start' | 'end') {
    const isStart = direction === 'start';
    const { start, end } = this._domHelpers.scrollButtonsDisabled;

    return html`${cache(
      this._domHelpers.hasScrollButtons
        ? html`
            <igc-icon-button
              tabindex="-1"
              variant="flat"
              collection="default"
              part="${direction}-scroll-button"
              exportparts="icon"
              name=${isStart ? 'prev' : 'next'}
              ?disabled=${isStart ? start : end}
              @click=${() => this._domHelpers.scrollTabs(direction)}
            >
            </igc-icon-button>
          `
        : nothing
    )}`;
  }

  protected override render() {
    return html`
      <div
        ${ref(this._headerRef)}
        part="tabs"
        style=${styleMap(this._domHelpers.styleProperties)}
        @scroll=${this._handleScroll}
      >
        <div
          part=${partMap({
            inner: true,
            scrollable: this._domHelpers.hasScrollButtons,
          })}
        >
          ${this._renderScrollButton('start')}
          <slot @click=${this._handleClick}></slot>
          ${this._renderScrollButton('end')}
          <div part="selected-indicator">
            <span ${ref(this._indicatorRef)}></span>
          </div>
        </div>
      </div>
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tabs': IgcTabsComponent;
  }
}

import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import {
  eventOptions,
  property,
  queryAssignedElements,
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
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import {
  first,
  getElementFromPath,
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

type TabSelectionOptions = {
  /** The tab to select. Omitting it clears the current selection. */
  tab?: IgcTabComponent;
  shouldEmit?: boolean;
  shouldScroll?: boolean;
};

type TabMutations = MutationControllerParams<IgcTabComponent>['changes'];

export interface IgcTabsComponentEventMap {
  igcChange: CustomEvent<IgcTabComponent>;
}

/* blazorAdditionalDependency: IgcTabComponent */
/**
 * Tabs organize and allow navigation between groups of content that are related and at the same level of hierarchy.
 *
 * The tabs component allows the user to navigate between multiple tab children.
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
    callback: this._refreshLayout,
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

  @queryAssignedElements({ selector: IgcTabComponent.tagName, flatten: true })
  private _tabs!: IgcTabComponent[];

  protected get _enabledTabs(): IgcTabComponent[] {
    return this._tabs.filter((tab) => !tab.disabled);
  }

  private _activeTab?: IgcTabComponent;

  //#endregion

  //#region Public properties

  /**
   * Determines the alignment of the tabs header strip.
   *
   * @attr alignment
   * @default 'start'
   */
  @property({ reflect: true })
  public alignment: TabsAlignment = 'start';

  /**
   * Determines the activation behavior of the tabs.
   *
   * When set to 'auto', the tab will be selected when it receives focus.
   * When set to 'manual', the tab will only be selected when it is clicked or activated with the keyboard.
   *
   * @attr activation
   * @default 'auto'
   */
  @property()
  public activation: TabsActivation = 'auto';

  /* blazorSuppress */
  /** Returns the direct tab children of this element. */
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

  /* blazorSuppress */
  /** Returns the currently selected tab, if any. */
  public get selectedTab(): IgcTabComponent | null {
    return this._activeTab ?? null;
  }

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      ref: this._headerRef,
      skip: this._skipKeyboard,
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
        attributeFilter: ['selected', 'disabled'],
        childList: true,
        subtree: true,
      },
      filter: [IgcTabComponent.tagName],
    });
  }

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;

    const selectedTab =
      this._tabs.findLast((tab) => tab.selected && !tab.disabled) ??
      first(this._enabledTabs);

    this._updateLayout();
    this._syncSelection(selectedTab);

    this._resizeController.observe(this._headerRef.value!);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.role = 'tablist';
    this.ariaOrientation = 'horizontal';
  }

  protected override update(props: PropertyValues<this>): void {
    const directionChanged = this._domHelpers.checkAndUpdateDirection();

    if (props.has('alignment') || directionChanged) {
      this._domHelpers.setIndicator(this._activeTab);
    }

    super.update(props);
  }

  //#endregion

  //#region Observers callbacks

  private _updateLayout(): void {
    this._domHelpers.setStyleProperties();
    this._domHelpers.setScrollButtonState();
  }

  private _refreshLayout(): void {
    this._updateLayout();
    this._domHelpers.setIndicator(this._activeTab);
  }

  private _mutationCallback({
    changes,
  }: MutationControllerParams<IgcTabComponent>): void {
    const structural = !isEmpty(changes.added) || !isEmpty(changes.removed);

    this._handleAttributeChanges(changes);
    this._handleTabsRemoved(changes);
    this._handleTabsAdded(changes);

    // Positions shift on any add/removal, including ones that leave the selection intact.
    this._updateTabsState();

    // Only a changed tab set moves the indicator on its own - selection changes
    // reposition it through `_setSelectedTab`.
    if (structural) {
      this._refreshLayout();
    } else {
      this._updateLayout();
    }
  }

  private _handleAttributeChanges(changes: TabMutations): void {
    const own = changes.attributes.filter(({ node }) =>
      this._tabs.includes(node)
    );

    if (isEmpty(own)) {
      return;
    }

    const selected = own.findLast(
      ({ node, attributeName }) => attributeName === 'selected' && node.selected
    )?.node;

    if (selected) {
      // A tab turning selected takes over.
      this._syncSelection(selected);
    } else if (own.some(({ node }) => node === this._activeTab)) {
      // The active tab was either deselected from the outside, which leaves the
      // component without a selection, or disabled and has to hand over.
      this._syncSelection(
        this._activeTab?.disabled ? first(this._enabledTabs) : undefined
      );
    }
  }

  private _handleTabsAdded(changes: TabMutations): void {
    const added = changes.added.filter(({ node }) => this._tabs.includes(node));

    if (isEmpty(added)) {
      return;
    }

    // An added selected tab takes over, otherwise keep the current selection or
    // recover from an empty one.
    const selected = added.findLast(
      ({ node }) => node.selected && this._isSelectable(node)
    )?.node;

    this._syncSelection(
      selected ?? this._activeTab ?? first(this._enabledTabs)
    );
  }

  private _handleTabsRemoved(changes: TabMutations): void {
    if (changes.removed.some(({ node }) => node === this._activeTab)) {
      this._syncSelection(first(this._enabledTabs));
    }
  }

  //#endregion

  //#region Private API

  private _getClosestActiveTabIndex(): number {
    const active = getRoot(this).activeElement;
    const tab = active ? active.closest(IgcTabComponent.tagName) : null;
    return tab ? this._enabledTabs.indexOf(tab) : -1;
  }

  /** A tab can be selected if it is a direct child of this component and is not disabled. */
  private _isSelectable(tab?: IgcTabComponent): tab is IgcTabComponent {
    return tab != null && !tab.disabled && this._tabs.includes(tab);
  }

  /** Pushes the ARIA set information and the roving tab stop down to the tab children. */
  private _updateTabsState(): void {
    const tabs = this._tabs;
    const tabStop = this._activeTab ?? first(this._enabledTabs);

    for (const [index, tab] of tabs.entries()) {
      tab._setTabState(index + 1, tabs.length, tab === tabStop);
    }
  }

  /** Applies a selection driven by the DOM rather than by user interaction. */
  private _syncSelection(tab?: IgcTabComponent): void {
    this._setSelectedTab({ tab, shouldEmit: false, shouldScroll: false });
  }

  private _setSelectedTab(options: TabSelectionOptions): void {
    const { tab, shouldEmit = true, shouldScroll = true } = options;

    // An explicit `undefined` clears the selection, while a tab that cannot be
    // selected leaves the current one in place.
    const next =
      tab === undefined || this._isSelectable(tab) ? tab : this._activeTab;
    const changed = next !== this._activeTab;

    // Runs on every pass so that tabs holding a stale `selected` state are reconciled.
    for (const each of this._tabs) {
      each.selected = each === next;
    }

    this._activeTab = next;
    this._updateTabsState();

    if (!changed) {
      return;
    }

    if (next && shouldScroll) {
      scrollIntoView(getTabHeader(next));
    }

    this._domHelpers.setIndicator(next);

    if (next && shouldEmit) {
      this.emitEvent('igcChange', { detail: next });
    }
  }

  private _keyboardActivateTab(tab?: IgcTabComponent, activate = false): void {
    if (!tab) {
      return;
    }

    const header = getTabHeader(tab);

    this._domHelpers.setScrollSnap();
    scrollIntoView(header);
    header?.focus({ preventScroll: true });

    if (activate || this.activation === 'auto') {
      this._setSelectedTab({ tab });
    }
  }

  private _skipKeyboard(node: Element, event: KeyboardEvent): boolean {
    return !(
      this._isEventFromTabHeader(event) &&
      this._tabs.includes(node.closest(IgcTabComponent.tagName)!)
    );
  }

  private _isEventFromTabHeader(event: Event): boolean {
    return Boolean(getElementFromPath('[part~="tab-header"]', event));
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
    const index = this._getClosestActiveTabIndex();

    if (index > -1) {
      this._keyboardActivateTab(this._enabledTabs[index], true);
    }
  }

  protected _handleClick(event: PointerEvent): void {
    if (!this._isEventFromTabHeader(event)) {
      return;
    }

    const tab = getElementFromPath(IgcTabComponent.tagName, event);

    if (!this._isSelectable(tab)) {
      return;
    }

    this._domHelpers.setScrollSnap();
    getTabHeader(tab)?.focus({ preventScroll: true });
    this._setSelectedTab({ tab });
  }

  @eventOptions({ passive: true })
  protected _handleScroll(): void {
    this._domHelpers.setScrollButtonState();
  }

  //#endregion

  //#region Public API methods

  /**
   * Selects the tab matching the passed IDREF or label and displays the corresponding panel.
   *
   * Disabled tabs and values not matching any tab are ignored.
   */
  public select(idOrLabel: string): void;
  /* blazorSuppress (ref is reserved) */
  public select(ref: IgcTabComponent): void;
  /* blazorSuppress (ref is reserved) */
  public select(ref: IgcTabComponent | string): void {
    const tab = isString(ref)
      ? this._tabs.find((each) => each.id === ref || each.label === ref)
      : ref;

    if (this._isSelectable(tab)) {
      this._setSelectedTab({ tab, shouldEmit: false });
    }
  }

  //#endregion

  //#region Render

  protected _renderScrollButton(direction: 'start' | 'end'): TemplateResult {
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

  protected override render(): TemplateResult {
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

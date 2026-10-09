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
import { addInternalsController } from '#internals/controllers/internals.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { partMap } from '#internals/part-map.js';
import { firstOf, isEmpty } from '#internals/utils/arrays.js';
import { getElementFromPath } from '#internals/utils/events.js';
import { isString } from '#internals/utils/types.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import type { TabsActivation, TabsAlignment } from '../types.js';
import { getTabHeader, TAB_HEADER, TabsHelpers } from './tab-dom.js';
import IgcTabComponent from './tab.js';
import { styles as shared } from './themes/shared/tabs/tabs.common.css.js';
import { all } from './themes/tabs-themes.js';
import { styles } from './themes/tabs.base.css.js';

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
 * @csspart header - The header strip behind the tab headers.
 * @csspart start-scroll-button - The start scroll button displayed when the tabs overflow.
 * @csspart end-scroll-button - The end scroll button displayed when the tabs overflow.
 * @csspart selected-indicator - The indicator that shows which tab is selected.
 */
export default class IgcTabsComponent extends EventEmitterMixin<
  IgcTabsComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tabs';
  public static styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcTabsComponent,
      IgcTabComponent,
      IgcIconButtonComponent
    );
  }

  //#region Private state & properties

  private readonly _resizeController = addResizeObserverController(this, {
    callback: this._refreshLayout,
    options: { box: 'border-box' },
    target: null,
    requestUpdate: false,
  });

  /** The scroll container of the tab headers. */
  private readonly _headerRef = createRef<HTMLElement>();

  private readonly _indicatorRef = createRef<HTMLElement>();

  private readonly _domHelpers = new TabsHelpers(
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
    return this._activeTab?.label || this._activeTab?.id || '';
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

    addInternalsController(this, {
      initialARIA: { role: 'tablist', ariaOrientation: 'horizontal' },
      reflectRole: true,
    });

    addThemingController(this, all);

    addRovingFocusController(this, {
      keybindings: { ref: this._headerRef, skip: this._skipKeyboard },
      items: () => this._enabledTabs,
      focusItem: (tab) => this._keyboardActivateTab(tab),
      activateItem: (tab) => this._keyboardActivateTab(tab, true),
      missingCurrent: 'wrap',
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

    const selectedTab = this._resolveSelection(true);

    // A selection measures the layout itself.
    if (!selectedTab) {
      this._domHelpers.updateLayout();
    }
    this._syncSelection(selectedTab);

    this._resizeController.observe(this._headerRef.value!);
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

  private _refreshLayout(): void {
    this._domHelpers.updateLayout();
    this._domHelpers.setIndicator(this._activeTab);
  }

  private _mutationCallback({
    changes,
  }: MutationControllerParams<IgcTabComponent>): void {
    const added = changes.added.some(({ node }) => this._tabs.includes(node));

    // Also without a selection change, for the positions of the tabs.
    this._syncSelection(this._resolveSelection(added));

    // A selection change moves the indicator in `_setSelectedTab`.
    if (!isEmpty(changes.added) || !isEmpty(changes.removed)) {
      this._refreshLayout();
    } else {
      this._domHelpers.updateLayout();
    }
  }

  /**
   * A tab that turned selected wins, then the active tab while it stays selected.
   * A deselected active tab leaves no selection, unless a tab was added.
   */
  private _resolveSelection(added: boolean): IgcTabComponent | undefined {
    const active = this._activeTab;
    const claimed = this._tabs.findLast(
      (tab) => tab !== active && tab.selected && !tab.disabled
    );

    if (claimed) {
      return claimed;
    }

    const selectable = this._isSelectable(active);

    if (selectable && active.selected) {
      return active;
    }

    return (active && !selectable) || added
      ? firstOf(this._enabledTabs)
      : undefined;
  }

  //#endregion

  //#region Private API

  private _isSelectable(tab?: IgcTabComponent): tab is IgcTabComponent {
    return tab != null && !tab.disabled && this._tabs.includes(tab);
  }

  private _updateTabsState(): void {
    const tabs = this._tabs;
    const tabStop = this._activeTab ?? firstOf(this._enabledTabs);

    for (const [index, tab] of tabs.entries()) {
      tab._setTabState(index + 1, tabs.length, tab === tabStop);
    }
  }

  private _syncSelection(tab?: IgcTabComponent): void {
    this._setSelectedTab(tab, false);
  }

  private _setSelectedTab(tab?: IgcTabComponent, emit = true): void {
    const next =
      tab === undefined || this._isSelectable(tab) ? tab : this._activeTab;
    const changed = next !== this._activeTab;

    // Also without a change, to reset a stale `selected` on the other tabs.
    for (const each of this._tabs) {
      each.selected = each === next;
    }

    this._activeTab = next;
    this._updateTabsState();

    if (!changed) {
      return;
    }

    this._domHelpers.scrollTabIntoView(next);
    this._domHelpers.setIndicator(next);

    if (next && emit) {
      this.emitEvent('igcChange', { detail: next });
    }
  }

  private _keyboardActivateTab(tab?: IgcTabComponent, activate = false): void {
    if (!tab) {
      return;
    }

    const select = activate || this.activation === 'auto';

    // A selection change scrolls the tab into view itself.
    if (!select || tab === this._activeTab) {
      this._domHelpers.scrollTabIntoView(tab);
    }

    getTabHeader(tab)?.focus({ preventScroll: true });

    if (select) {
      this._setSelectedTab(tab);
    }
  }

  private _skipKeyboard(node: Element, event: KeyboardEvent): boolean {
    return !(
      this._isEventFromTabHeader(event) &&
      this._tabs.includes(node.closest(IgcTabComponent.tagName)!)
    );
  }

  private _isEventFromTabHeader(event: Event): boolean {
    return Boolean(getElementFromPath(TAB_HEADER, event));
  }

  //#endregion

  //#region Event handlers

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
    this._setSelectedTab(tab);
  }

  @eventOptions({ passive: true })
  protected _handleScroll(): void {
    this._domHelpers.setScrollPositionState();
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
      this._syncSelection(tab);
    }
  }

  //#endregion

  //#region Render

  protected _renderScrollButton(direction: 'start' | 'end'): TemplateResult {
    return html`${cache(
      this._domHelpers.hasScrollButtons
        ? html`
            <igc-icon-button
              tabindex="-1"
              variant="flat"
              collection="default"
              part="${direction}-scroll-button"
              exportparts="icon"
              name=${direction === 'start' ? 'prev' : 'next'}
              ?disabled=${this._domHelpers.scrollButtonsDisabled[direction]}
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
          <div part="header"></div>
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

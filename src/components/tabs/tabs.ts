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
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  isKey,
} from '#internals/controllers/keys.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { partMap } from '#internals/part-map.js';
import { firstOf, sameItems } from '#internals/utils/arrays.js';
import { getElementFromPath } from '#internals/utils/events.js';
import { isString } from '#internals/utils/types.js';
import { all } from '#themes/tabs/themes/tabs-themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import type {
  TabsActivation,
  TabsAlignment,
  TabsHeaderPosition,
} from '../types.js';
import {
  getTabHeader,
  isColumn,
  opensElsewhere,
  TAB_HEADER,
  TabsHelpers,
} from './tab-dom.js';
import IgcTabComponent from './tab.js';
import { styles as shared } from './themes/shared/tabs/tabs.common.css.js';
import { styles } from './themes/tabs.base.css.js';

export interface IgcTabsComponentEventMap {
  igcChange: CustomEvent<IgcTabComponent>;
}

/* blazorAdditionalDependency: IgcTabComponent */
/**
 * Tabs organize and allow navigation between groups of content that are related and at the same level of hierarchy.
 *
 * @element igc-tabs
 *
 * @fires igcChange - Emitted when the selected tab changes.
 *
 * @slot - Renders the tab components inside the default slot.
 *
 * @csspart header - The header strip behind the tab headers.
 * @csspart start-scroll-button - The start scroll button displayed when the tabs overflow.
 * @csspart end-scroll-button - The end scroll button displayed when the tabs overflow.
 * @csspart selected-indicator - The indicator that shows which tab is selected.
 * @csspart tabs - The scroll container of the tab headers.
 * @csspart inner - The wrapper of the tab headers, the scroll buttons and the selected indicator.
 * @csspart scrollable - Added to the inner part while the scroll buttons show.
 */
export default class IgcTabsComponent extends EventEmitterMixin<IgcTabsComponentEventMap>(
  LitElement
) {
  public static readonly tagName = 'igc-tabs';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcTabsComponent,
      IgcTabComponent,
      IgcIconButtonComponent
    );
  }

  //#region Private state & properties

  /** Observes the scroll container, the probes and each tab header. */
  private readonly _resizeController = addResizeObserverController(this, {
    callback: this._handleResize,
    options: { box: 'border-box' },
    target: null,
    requestUpdate: false,
  });

  /** Observes the state of the tabs, also of tabs projected through another slot. */
  private readonly _mutationController = createMutationController(this, {
    callback: this._mutationCallback,
    target: () => this._tabs,
    config: { attributeFilter: ['selected', 'disabled'] },
  });

  private _containerWidth = -1;

  /** The height of the tabs when it is definite, else 0. The height probe reports it. */
  private _definiteHeight = 0;

  /** The frame request of a column layout, which waits for the next frame. */
  private _layoutFrame = 0;

  /** The tabs at the last change of the slot. */
  private _knownTabs: IgcTabComponent[] = [];

  private readonly _containerRef = createRef<HTMLElement>();

  private readonly _indicatorRef = createRef<HTMLElement>();

  private readonly _domHelpers = new TabsHelpers(
    this,
    this._containerRef,
    this._indicatorRef
  );

  @queryAssignedElements({ selector: IgcTabComponent.tagName, flatten: true })
  private _tabs!: IgcTabComponent[];

  private get _enabledTabs(): IgcTabComponent[] {
    return this._tabs.filter((tab) => !tab.disabled);
  }

  /** Enabled tabs that render. A hidden tab cannot take the focus. */
  private get _navigableTabs(): IgcTabComponent[] {
    return this._enabledTabs.filter((tab) =>
      getTabHeader(tab)?.checkVisibility({ visibilityProperty: true })
    );
  }

  private _activeTab?: IgcTabComponent;

  //#endregion

  //#region Public properties

  /**
   * The alignment of the tab headers in the header strip.
   *
   * @attr alignment
   * @default 'start'
   */
  @property({ reflect: true })
  public alignment: TabsAlignment = 'start';

  /**
   * The side of the panels on which the tab headers are placed.
   *
   * With `top`, the headers form a row above the panels. With `start` and `end`, they
   * form a column before or after the panels in the text direction, so `start` is on
   * the right in a right-to-left layout. In a column, the Up and Down arrow keys move
   * between the tabs. When the headers do not fit in the height of the tabs, scroll
   * buttons above and below them scroll the column.
   *
   * @attr header-position
   * @default 'top'
   */
  @property({ attribute: 'header-position', reflect: true })
  public headerPosition: TabsHeaderPosition = 'top';

  /**
   * The activation behavior of the tabs.
   *
   * With `auto`, a tab is selected when it receives keyboard focus.
   * With `manual`, a tab is selected only on click, or on Enter or Space.
   *
   * @attr activation
   * @default 'auto'
   */
  @property()
  public activation: TabsActivation = 'auto';

  /* blazorSuppress */
  /** The tab children of the component. */
  public get tabs(): IgcTabComponent[] {
    return this._tabs;
  }

  /**
   * The label of the selected tab, or its `id` when the tab has no label.
   * An empty string when no tab is selected.
   */
  public get selected(): string {
    return this._activeTab?.label || this._activeTab?.id || '';
  }

  /* blazorSuppress */
  /** The selected tab, or `null` when no tab is selected. */
  public get selectedTab(): IgcTabComponent | null {
    return this._activeTab ?? null;
  }

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: { role: 'tablist' },
      aria: () => ({
        ariaOrientation: isColumn(this) ? 'vertical' : 'horizontal',
      }),
      reflectRole: true,
    });

    addThemingController(this, all);

    addRovingFocusController(this, {
      keybindings: { ref: this._containerRef, skip: this._skipKeyboard },
      items: () => this._navigableTabs,
      // `activeElement` misses tabs slotted through another shadow root.
      current: () => this._tabs.find((tab) => tab.matches(':focus-within')),
      focusItem: this._keyboardActivateTab,
      activateItem: this._activateTab,
      // `_skipKeyboard` leaves the arrow keys of the other axis to the browser.
      vertical: true,
      missingCurrent: 'wrap',
    });
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();

    // The mutation observer misses the changes made while detached.
    if (this.hasUpdated) {
      this._syncSelection();
    }
  }

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;
    this._syncTabs();
  }

  protected override update(props: PropertyValues<this>): void {
    const directionChanged = this._domHelpers.checkAndUpdateDirection();

    if (props.has('alignment') || directionChanged) {
      this._domHelpers.setIndicator(this._activeTab);
    }

    if (props.has('headerPosition') && this.hasUpdated) {
      this._applyHeaderPosition();
    }

    super.update(props);
  }

  //#endregion

  //#region Event handlers

  private _handleResize(entries: ResizeObserverEntry[]): void {
    const container = this._containerRef.value;
    let resized = false;
    let replaced = false;
    let heightChanged = false;

    for (const { target, borderBoxSize } of entries) {
      if (target === container) {
        // The panels also size the container, so only its width counts.
        const [{ inlineSize }] = borderBoxSize;
        resized ||= inlineSize !== this._containerWidth;
        this._containerWidth = inlineSize;
      } else if (target.matches('[data-height-probe]')) {
        // Only a column limits the panels to the height of the tabs.
        const [{ blockSize }] = borderBoxSize;
        heightChanged ||= blockSize !== this._definiteHeight && isColumn(this);
        this._definiteHeight = blockSize;
      } else {
        resized = true;
        // A header that a render replaced reports a zero size on removal.
        replaced ||= !target.isConnected;
      }
    }

    if (replaced) {
      this._observeHeaders();
    }

    if (!(resized || heightChanged)) {
      return;
    }

    // In a column, the height limit of the panels and the scroll buttons size the
    // container, which the observer reports as a loop when it happens in this frame.
    if (isColumn(this)) {
      cancelAnimationFrame(this._layoutFrame);
      this._layoutFrame = requestAnimationFrame(
        () => this.isConnected && this._refreshLayout()
      );
    } else {
      this._refreshLayout();
    }
  }

  private _mutationCallback({
    changes: { attributes },
  }: MutationControllerParams<IgcTabComponent>): void {
    // Skip the echo of a selection that the tabs reflect: every tab agrees with it.
    const echo =
      attributes.every(({ attributeName }) => attributeName === 'selected') &&
      this._tabs.every((tab) => tab.selected === (tab === this._activeTab));

    if (!echo) {
      this._syncSelection();
    }
  }

  /** Follows the tabs that the slot assigns, also while detached. */
  private _syncTabs(): void {
    const tabs = this._tabs;
    const known = this._knownTabs;

    // The mutation observer follows the state of the tabs.
    if (sameItems(tabs, known)) {
      return;
    }

    this._knownTabs = tabs;

    // The controller observes only while connected; it starts again on connect.
    if (this.isConnected) {
      this._mutationController.disconnect();
      this._mutationController.observe();
    }

    this._syncSelection(tabs.some((tab) => !known.includes(tab)));
    this._observeHeaders();
    this._refreshLayout();
  }

  protected _handleClick(event: MouseEvent): void {
    if (!getElementFromPath(TAB_HEADER, event)) {
      return;
    }

    const tab = getElementFromPath(IgcTabComponent.tagName, event);

    if (!this._isSelectable(tab) || opensElsewhere(tab, event)) {
      return;
    }

    getTabHeader(tab)?.focus({ preventScroll: true });
    this._setSelectedTab(tab);

    // Does not bubble, so a listener on an outer tab never gets a nested tab's event.
    if (
      tab.href != null &&
      !event.defaultPrevented &&
      !tab.emitEvent('igcNavigate', { bubbles: false, cancelable: true })
    ) {
      event.preventDefault();
    }
  }

  @eventOptions({ passive: true })
  protected _handleScroll(): void {
    this._domHelpers.setScrollPositionState();
  }

  //#endregion

  //#region Private API

  private _refreshLayout(): void {
    this._domHelpers.updateLayout();
    this._domHelpers.setIndicator(this._activeTab);
  }

  /**
   * Lays the tabs out again once a change between a row and a column renders. An
   * axis with hidden overflow keeps its scroll offset, so both start over. The
   * indicator changes axis at once.
   */
  private async _applyHeaderPosition(): Promise<void> {
    await this.updateComplete;

    const focused = this._tabs.find((tab) => tab.matches(':focus-within'));

    this._domHelpers.resetScroll();
    await this._domHelpers.scrollTabIntoView(focused ?? this._activeTab);
    this._domHelpers.setIndicator(this._activeTab, false);
  }

  /**
   * Observes the container and the probes. A ref callback, because a ref gets no
   * element while the host renders disconnected (#2416).
   */
  private _observeContainer(container?: Element): void {
    if (container) {
      this._resizeController.observe(container);

      for (const probe of container.querySelectorAll(
        '[data-direction-probe], [data-height-probe]'
      )) {
        this._resizeController.observe(probe);
      }
    }
  }

  /** Observes the header of each tab once the tabs render, and stops for the old ones. */
  private async _observeHeaders(): Promise<void> {
    await Promise.all(this._tabs.map((tab) => tab.updateComplete));

    const headers = new Set<Element | null>(this._tabs.map(getTabHeader));
    const targets = this._resizeController.targets;

    for (const target of targets) {
      if (target.matches(TAB_HEADER) && !headers.has(target)) {
        this._resizeController.unobserve(target);
      }
    }

    for (const header of headers) {
      if (header && !targets.has(header)) {
        this._resizeController.observe(header);
      }
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

  private _isSelectable(tab?: IgcTabComponent): tab is IgcTabComponent {
    return tab != null && !tab.disabled && this._tabs.includes(tab);
  }

  /** Selects the tab that the state of the tabs resolves to, without an event. */
  private _syncSelection(added = false): void {
    this._setSelectedTab(this._resolveSelection(added), false);
  }

  /** `tab` is selectable or `undefined`, for no selection. */
  private _setSelectedTab(tab?: IgcTabComponent, emit = true): void {
    const tabs = this._tabs;
    const changed = tab !== this._activeTab;
    const tabStop = tab ?? firstOf(this._enabledTabs);

    this._activeTab = tab;

    // Also without a change, to reset a stale `selected` and renumber the tabs.
    for (const [index, each] of tabs.entries()) {
      each.selected = each === tab;
      each._setTabState(index + 1, tabs.length, each === tabStop);
    }

    if (!changed) {
      return;
    }

    this._domHelpers.scrollTabIntoView(tab);
    this._domHelpers.setIndicator(tab);

    if (tab && emit) {
      this.emitEvent('igcChange', { detail: tab });
    }
  }

  private _keyboardActivateTab(tab: IgcTabComponent, activate = false): void {
    // Focus never selects a tab whose link opens elsewhere.
    const select =
      activate || (this.activation === 'auto' && !opensElsewhere(tab));

    // A selection change scrolls the tab into view itself.
    if (!select || tab === this._activeTab) {
      this._domHelpers.scrollTabIntoView(tab);
    }

    getTabHeader(tab)?.focus({ preventScroll: true });

    if (select) {
      this._setSelectedTab(tab);
    }
  }

  /** Enter and Space click a link tab, so they follow its link. */
  private _activateTab(tab: IgcTabComponent): void {
    if (tab.href != null) {
      getTabHeader(tab)?.click();
    } else {
      this._keyboardActivateTab(tab, true);
    }
  }

  /**
   * Only keys pressed on a tab header navigate, so a control slotted into a label
   * keeps its keys. The arrow keys of the other axis stay with the browser, which
   * can scroll the page with them. `node` is the target retargeted to the tab.
   */
  private _skipKeyboard(node: Element, event: KeyboardEvent): boolean {
    const tab = node as IgcTabComponent;
    const otherAxis = isColumn(this)
      ? [arrowLeft, arrowRight]
      : [arrowUp, arrowDown];

    if (otherAxis.some((key) => isKey(event, key))) {
      return true;
    }

    return !(
      this._tabs.includes(tab) &&
      firstOf(event.composedPath()) === getTabHeader(tab)
    );
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
  /**
   * Selects the passed tab and displays the corresponding panel.
   *
   * A disabled tab, or a tab that is not a child of the component, is ignored.
   */
  public select(ref: IgcTabComponent): void;
  /* blazorSuppress (ref is reserved) */
  /**
   * Selects a tab by reference, IDREF or label, and displays the corresponding panel.
   *
   * Disabled tabs and values not matching any tab are ignored.
   */
  public select(ref: IgcTabComponent | string): void {
    const tab = isString(ref)
      ? this._tabs.find((each) => each.id === ref || each.label === ref)
      : ref;

    if (this._isSelectable(tab)) {
      this._setSelectedTab(tab, false);
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
        ${ref(this._containerRef)}
        ${ref(this._observeContainer)}
        part="tabs"
        style=${styleMap(this._domHelpers.styleProperties)}
        @scroll=${this._handleScroll}
      >
        <span data-direction-probe></span>
        <span data-height-probe></span>
        <div
          part=${partMap({
            inner: true,
            scrollable: this._domHelpers.hasScrollButtons,
          })}
        >
          <div part="header"></div>
          ${this._renderScrollButton('start')}
          <slot
            @click=${this._handleClick}
            @slotchange=${this._syncTabs}
          ></slot>
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

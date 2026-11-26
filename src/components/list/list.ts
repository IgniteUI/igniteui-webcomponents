import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import {
  type ListContext,
  type ListRoles,
  listContext,
} from '#internals/context.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  escapeKey,
  f2Key,
  isKey,
  shiftKey,
  tabKey,
} from '#internals/controllers/key-bindings.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { createTypeahead } from '#internals/typeahead.js';
import { firstOf, isEmpty } from '#internals/utils/arrays.js';
import {
  canTakeFocus,
  claimTabIndex,
  getRoot,
  getSlottedChildren,
  isAssignedTo,
  isElement,
  isLTR,
  normalizedTextContent,
  releaseTabIndex,
} from '#internals/utils/dom.js';
import {
  addSafeEventListener,
  focusLeftHost,
} from '#internals/utils/events.js';
import { wrap } from '#internals/utils/math.js';
import { all } from '#themes/list/themes/container.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { ListNavigation } from '../types.js';
import {
  type ControlSearchResult,
  findControls,
  takesArrows,
} from './list-grid.js';
import IgcListHeaderComponent from './list-header.js';
import IgcListItemComponent from './list-item.js';
import { styles } from './themes/container.base.css.js';
import { styles as shared } from './themes/shared/container/list.common.css.js';

const OWN_CHILDREN = `${IgcListItemComponent.tagName},${IgcListHeaderComponent.tagName}`;

const ROLES = {
  none: { list: 'list', item: 'listitem' },
  listbox: { list: 'listbox', item: 'option' },
  grid: { list: 'grid', item: 'row', cell: 'gridcell' },
} satisfies Record<ListNavigation, ListRoles>;

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 * @slot empty - Renders content while the list has no items, such as a "No results" message.
 */
export default class IgcListComponent extends LitElement {
  public static readonly tagName = 'igc-list';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcListComponent,
      IgcListItemComponent,
      IgcListHeaderComponent
    );
  }

  //#region Internal state

  /** In document order. A nested list keeps its own items. */
  private _items: IgcListItemComponent[] = [];

  private _headers = new Map<IgcListItemComponent, IgcListHeaderComponent>();

  private _hasEmptyContent = false;

  private _tabStop?: IgcListItemComponent;
  private _lastFocused?: IgcListItemComponent;

  /**
   * The item that has the focus or holds it in a control. Firefox and WebKit
   * fire no `focusout` for a removed element, so it stays until the focus
   * moves to another element.
   */
  private _focused?: IgcListItemComponent;

  /** The controls of the grid rows, out of the tab order. */
  private readonly _controls = new Set<HTMLElement>();

  private readonly _context: ListContext = {
    navigates: (element) => this._navigable && this._owns(element),
    roles: () => this._roles,
    exposesUnselected: () =>
      !this._isGrid || this.hasAttribute('aria-multiselectable'),
    isTabStop: (item) => item === this._tabStop,
    headerOf: (item) => this._headers.get(item),
    syncState: () => this.requestUpdate(),
  };

  private readonly _typeahead = createTypeahead<IgcListItemComponent>({
    items: () => this._visibleItems,
    text: (item) => {
      const titles = getSlottedChildren(item, 'title');
      return normalizedTextContent(isEmpty(titles) ? [item] : titles);
    },
    spaceStartsSearch: false,
  });

  private get _isGrid(): boolean {
    return this.navigation === 'grid';
  }

  private get _navigable(): boolean {
    return this._isGrid || this.navigation === 'listbox';
  }

  private get _roles(): ListRoles {
    return ROLES[this.navigation] ?? ROLES.none;
  }

  private get _visibleItems(): IgcListItemComponent[] {
    return this._items.filter((item) => item.checkVisibility());
  }

  //#endregion

  //#region Public properties

  /**
   * The keyboard navigation of the list.
   *
   * - `none`: a static list. Its items are not focusable.
   * - `listbox`: the list is one tab stop. The arrow keys, Home, End and typed
   *   letters move between the items, and Enter or Space clicks the focused
   *   item. Each item exposes its `selected` state to assistive technology.
   *   An item holds no interactive content.
   * - `grid`: as `listbox`, and each item is a row that can hold controls.
   *   The list takes the controls out of the tab order. Left and Right move
   *   between the item and its controls, Up and Down move from a control to
   *   the next or previous item, and Escape or F2 returns to the item. A
   *   control that uses the arrow keys, such as a text field, keeps them.
   *
   * The app owns the selection. It toggles `selected` on the items, for
   * example in a `click` handler, and sets `aria-multiselectable="true"` on
   * the list when more than one item can be selected. A grid item that is not
   * selected exposes its state only while the list has `aria-multiselectable`.
   *
   * @attr navigation
   * @default 'none'
   */
  @property()
  public navigation: ListNavigation = 'none';

  //#endregion

  constructor() {
    super();

    addThemingController(this, all);

    addInternalsController(this, {
      initialARIA: { role: 'list' },
      aria: () => ({ role: this._roles.list }),
    });

    addContextProvider(this, {
      context: listContext,
      watch: ['navigation'],
      value: () => this._context,
    });

    createMutationController(this, {
      config: {
        childList: true,
        subtree: true,
        attributeFilter: [
          'hidden',
          'disabled',
          'aria-label',
          'aria-multiselectable',
        ],
      },
      callback: this._handleMutations,
    });

    addRovingFocusController<IgcListItemComponent>(this, {
      keybindings: {
        // A Space that extends a type-ahead search is a letter, not a click.
        skip: (node, event) =>
          this._isNavigableItem(node)
            ? this._typeahead.accepts(event)
            : !this._movesFromControl(node, event),
        bindingDefaults: { preventDefault: true, repeat: true },
      },
      horizontal: false,
      vertical: true,
      wrap: false,
      items: () => this._visibleItems,
      focusItem: (item) => item.focus(),
      activateItem: (item) => item.click(),
    });

    addKeybindings(this, {
      skip: (node, event) => !this._gridRowOf(node, event),
      // The handlers cancel only the keys that they use.
      bindingDefaults: { preventDefault: false, repeat: true },
    })
      .set(arrowLeft, (event) => this._moveInRow(event, -1))
      .set(arrowRight, (event) => this._moveInRow(event, 1))
      .set(escapeKey, this._returnToRow)
      .set(f2Key, this._returnToRow)
      .set([shiftKey, tabKey], this._leaveFromControl);

    addSafeEventListener(this, 'keydown', this._handleTypeahead);
    addSafeEventListener(this, 'focusin', this._handleFocusIn);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);
  }

  //#region Lit lifecycle

  public override connectedCallback(): void {
    super.connectedCallback();
    this._collect();

    // After a move. The first update does the first sync.
    if (this.hasUpdated) {
      this._syncControls();
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._syncControls();
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    this._updateTabStop();

    if (changedProperties.has('navigation')) {
      this._syncControls();
    }

    super.update(changedProperties);
  }

  //#endregion

  //#region Event handlers

  private _handleTypeahead(event: KeyboardEvent): void {
    const item = event.target as Element;

    if (!this._typeahead.accepts(event) || !this._isNavigableItem(item)) {
      return;
    }

    event.preventDefault();
    this._typeahead.search(event.key, item)?.focus();
  }

  private _handleFocusIn(event: FocusEvent): void {
    const item = this._navigable
      ? this._rowOf(event.target as Element)
      : undefined;

    if (!item) {
      return;
    }

    this._focused = item;

    if (item !== this._lastFocused) {
      this._lastFocused = item;
      this._updateTabStop();
    }
  }

  private _handleFocusOut(event: FocusEvent): void {
    if (event.relatedTarget) {
      if (focusLeftHost(this, event)) {
        this._focused = undefined;
      }
      return;
    }

    // No `relatedTarget`: the window lost the focus, which the item keeps;
    // Chromium reports the removal of the item; or the focus went to no
    // element, which ends it.
    queueMicrotask(() => {
      const item = this._focused;
      const active = getRoot(this)?.activeElement;

      if (item?.isConnected && !(active && item.contains(active))) {
        this._focused = undefined;
      }
    });
  }

  private _handleMutations({ changes }: MutationControllerParams): void {
    const nodes = [...changes.added, ...changes.removed];
    const changed = (name: string) =>
      changes.attributes
        .filter(({ attributeName }) => attributeName === name)
        .map(({ node }) => node);

    if (this._navigable) {
      // A new title, subtitle or `aria-label` names or describes the item
      // again, and `aria-multiselectable` changes the selected state of a row.
      const touched =
        this._isGrid && changed('aria-multiselectable').includes(this)
          ? this._items
          : [...nodes.map(({ target }) => target), ...changed('aria-label')];

      for (const element of new Set(touched)) {
        if (element instanceof IgcListItemComponent && this._owns(element)) {
          element.requestUpdate();
        }
      }
    }

    if (
      isEmpty(changed('hidden')) &&
      !nodes.some(({ node, target }) => this._affectsItems(node, target))
    ) {
      // A control that comes, goes or changes its `disabled` state.
      const rows = new Set(
        [
          ...nodes
            .filter(({ node }) => isElement(node))
            .map(({ target }) => target),
          ...(changed('disabled') as Element[]),
        ]
          .map((element) => this._rowOf(element))
          .filter((row) => row !== undefined)
      );

      if (rows.size > 0) {
        this._syncControls([...rows]);
      }
      return;
    }

    const focused = this._focused;
    const index = focused ? this._items.indexOf(focused) : -1;
    // Read first: the host stops being focusable once items arrive.
    const hostFocused = getRoot(this)?.activeElement === this;

    this._collect();
    this._syncControls();

    if (this._lastFocused && !this._owns(this._lastFocused)) {
      this._lastFocused = undefined;
    }

    this._updateTabStop();

    if (!this._navigable) {
      return;
    }

    if (focused && !this._owns(focused)) {
      this._focused = undefined;

      if (this._focusIsLost()) {
        const visible = (item: IgcListItemComponent) => item.checkVisibility();
        const next =
          this._items.slice(index).find(visible) ??
          this._items.slice(0, index).findLast(visible);

        next ? this._focusItem(next) : this.focus();
      }
    } else if (hostFocused && this._tabStop) {
      this._focusItem(this._tabStop);
    }
  }

  //#endregion

  //#region Keyboard navigation

  /** The row of `node` when a grid key moves from it. A key that a control handled stays with it. */
  private _gridRowOf(
    node: Element,
    event: KeyboardEvent
  ): IgcListItemComponent | undefined {
    return this._isGrid && !event.defaultPrevented
      ? this._rowOf(node)
      : undefined;
  }

  /** The target of a grid key and its row, which the skip callback found. */
  private _gridTarget(event: KeyboardEvent): {
    target: Element;
    row: IgcListItemComponent;
    onRow: boolean;
  } {
    const target = event.target as Element;
    const row = this._rowOf(target)!;

    return { target, row, onRow: target === row };
  }

  private _takesArrows(
    event: KeyboardEvent,
    row: IgcListItemComponent
  ): boolean {
    return takesArrows(event, row, (element) => this._isWidget(element));
  }

  /** Moves between a grid row and its controls, around the ends. */
  private _moveInRow(event: KeyboardEvent, delta: 1 | -1): void {
    const { target, row, onRow } = this._gridTarget(event);

    if (!onRow && this._takesArrows(event, row)) {
      return;
    }

    const controls = this._controlsOf(row).controls.filter(canTakeFocus);

    if (isEmpty(controls)) {
      return;
    }

    event.preventDefault();

    // 0 is the row, also for a focused element outside the controls.
    const stops = [row, ...controls];
    const index = controls.findIndex((control) => control.contains(target)) + 1;
    const step = isLTR(this) ? delta : -delta;
    const next = stops[wrap(0, stops.length - 1, index + step)];

    next instanceof IgcListComponent ? next._focusTabStop() : next.focus();
  }

  /**
   * Whether Up or Down on a control of a grid row moves to the next or
   * previous row: the control neither uses nor handled the key.
   */
  private _movesFromControl(node: Element, event: KeyboardEvent): boolean {
    const row = this._gridRowOf(node, event);

    return (
      !!row &&
      (isKey(event, arrowUp) || isKey(event, arrowDown)) &&
      !this._takesArrows(event, row)
    );
  }

  private _returnToRow(event: KeyboardEvent): void {
    const { row, onRow } = this._gridTarget(event);

    if (!onRow) {
      event.preventDefault();
      row.focus();
    }
  }

  /**
   * Shift+Tab from a control would stop at its row, the tab stop. It starts
   * from the row instead, and the default action leaves the list.
   */
  private _leaveFromControl(event: KeyboardEvent): void {
    this._gridTarget(event).row.focus();
  }

  //#endregion

  //#region Internal API

  private _owns(element: Element): boolean {
    return element.closest(IgcListComponent.tagName) === this;
  }

  private _isNavigableItem(node: Element): node is IgcListItemComponent {
    return (
      this._navigable &&
      node instanceof IgcListItemComponent &&
      this._owns(node)
    );
  }

  /** The own item that is `node` or holds it. */
  private _rowOf(node: Element): IgcListItemComponent | undefined {
    let item = node.closest(IgcListItemComponent.tagName);

    // The items of a nested list belong to it.
    while (item && !this._owns(item)) {
      item = item.parentElement?.closest(IgcListItemComponent.tagName) ?? null;
    }

    return item ?? undefined;
  }

  private _affectsItems(node: Node, target: Element): boolean {
    return (
      isElement(node) &&
      (node.matches(OWN_CHILDREN) ||
        node.querySelector(OWN_CHILDREN) !== null ||
        (target === this && isAssignedTo(node, 'empty')))
    );
  }

  /** Whether no element has the focus, as after the removal of the focused one. */
  private _focusIsLost(): boolean {
    const active = getRoot(this)?.activeElement;
    return !active || active === this.ownerDocument.body;
  }

  /**
   * Focuses `item`. An item that just arrived gets its `tabindex` in its next
   * updates, so the focus waits for them while it stays on the list or on no
   * element.
   */
  private _focusItem(item: IgcListItemComponent): void {
    const retry = (): void => {
      if (item.isUpdatePending) {
        item.updateComplete.then(retry);
      } else if (this._focusIsLost() || getRoot(this)?.activeElement === this) {
        item.focus();
      }
    };

    item.focus();

    if (getRoot(this)?.activeElement !== item) {
      item.updateComplete.then(retry);
    }
  }

  /** A nested list that navigates counts as one control. */
  private _isWidget(element: Element): element is IgcListComponent {
    return element instanceof IgcListComponent && element._navigable;
  }

  private _controlsOf(row: IgcListItemComponent): ControlSearchResult {
    return findControls(row, {
      known: this._controls,
      isWidget: (element) => this._isWidget(element),
    });
  }

  /**
   * Takes the controls of `rows` out of the tab order, and gives the app its
   * `tabindex` back on the controls that left them.
   */
  private _syncControls(
    rows: readonly IgcListItemComponent[] = this._items
  ): void {
    const inGrid = this._isGrid && this.isConnected;
    const scope = new Set(rows);
    const searches = inGrid
      ? rows
          .filter((row) => this._owns(row))
          .map((row) => this._controlsOf(row))
      : [];
    const pending = searches.flatMap((search) => search.pending);
    const found = new Set(
      searches
        .flatMap((search) => search.controls)
        // A nested list keeps its own tab stop.
        .filter((control) => !(control instanceof IgcListComponent))
    );

    for (const control of this._controls) {
      const row = this._rowOf(control);

      if (!found.has(control) && (!inGrid || !row || scope.has(row))) {
        releaseTabIndex(control);
        this._controls.delete(control);
      }
    }

    for (const control of found) {
      if (!this._controls.has(control)) {
        claimTabIndex(control, '-1');
        this._controls.add(control);
      }
    }

    // A host that renders later may turn into a control.
    if (!isEmpty(pending)) {
      Promise.allSettled(pending.map((host) => host.updateComplete)).then(() =>
        this._syncControls(rows)
      );
    }
  }

  private _collect(): void {
    const items: IgcListItemComponent[] = [];
    const headers = new Map<IgcListItemComponent, IgcListHeaderComponent>();
    let header: IgcListHeaderComponent | undefined;

    for (const element of this.querySelectorAll(OWN_CHILDREN)) {
      if (!this._owns(element)) {
        continue;
      }

      if (element instanceof IgcListHeaderComponent) {
        header = element;
      } else if (element instanceof IgcListItemComponent) {
        items.push(element);

        if (header) {
          headers.set(element, header);
        }
      }
    }

    // A new group header changes the description.
    if (this._navigable) {
      for (const item of items) {
        if (headers.get(item) !== this._headers.get(item)) {
          item.requestUpdate();
        }
      }
    }

    const hasEmptyContent = !isEmpty(getSlottedChildren(this, 'empty'));

    if (
      isEmpty(items) !== isEmpty(this._items) ||
      hasEmptyContent !== this._hasEmptyContent
    ) {
      this.requestUpdate();
    }

    this._items = items;
    this._headers = headers;
    this._hasEmptyContent = hasEmptyContent;
  }

  /** Focuses the tab stop item, else the empty list itself. */
  private _focusTabStop(): void {
    (this._tabStop ?? this).focus();
  }

  /** An empty list that navigates is the tab stop itself. */
  private _updateTabStop(): void {
    const candidates = this._navigable
      ? this._items.filter((item) => !item.hidden)
      : [];

    const next =
      candidates.find((item) => item === this._lastFocused) ??
      candidates.find((item) => item.selected) ??
      firstOf(candidates);

    if (this._navigable && isEmpty(this._items)) {
      claimTabIndex(this, '0');
    } else {
      releaseTabIndex(this);
    }

    if (next !== this._tabStop) {
      this._tabStop?.requestUpdate();
      next?.requestUpdate();
      this._tabStop = next;
    }
  }

  //#endregion

  /** In a navigating list, the empty-state content is read as its only item. */
  private _renderEmpty(): TemplateResult {
    const slot = html`<slot name="empty"></slot>`;

    if (!this._navigable || !this._hasEmptyContent) {
      return html`<div>${slot}</div>`;
    }

    const { item, cell } = this._roles;

    return html`<div role=${item}>
      ${cell ? html`<div role=${cell}>${slot}</div>` : slot}
    </div>`;
  }

  protected override render(): TemplateResult {
    return html`
      <slot></slot>
      ${isEmpty(this._items) ? this._renderEmpty() : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list': IgcListComponent;
  }
}

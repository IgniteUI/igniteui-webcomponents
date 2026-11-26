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
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import { addRovingFocusController } from '#internals/controllers/roving-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { createTypeahead } from '#internals/typeahead.js';
import { firstOf, isEmpty } from '#internals/utils/arrays.js';
import {
  claimTabIndex,
  getRoot,
  getSlottedChildren,
  isAssignedTo,
  isElement,
  releaseTabIndex,
} from '#internals/utils/dom.js';
import {
  addSafeEventListener,
  focusLeftHost,
} from '#internals/utils/events.js';
import { all } from '#themes/list/themes/container.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { ListNavigation } from '../types.js';
import {
  CONTROL_ATTRIBUTES,
  createListGrid,
  type ListGrid,
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

  //#region Internal state and properties

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

  /** A nested list that navigates counts as one control. */
  private readonly _isWidget = (
    element: Element
  ): element is IgcListComponent =>
    element instanceof IgcListComponent && element._navigable;

  private readonly _context: ListContext = {
    navigates: (element) => this._navigable && this._owns(element),
    roles: () => this._roles,
    exposesUnselected: () =>
      !this._isGrid || this.hasAttribute('aria-multiselectable'),
    headerOf: (item) => this._headers.get(item),
    syncState: () => this._updateTabStop(),
  };

  private readonly _typeahead = createTypeahead<IgcListItemComponent>({
    items: () => this._visibleItems,
    text: (item) => item._searchText,
    spaceStartsSearch: false,
  });

  private readonly _grid: ListGrid;

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'list' },
    aria: () => ({ role: this._roles.list }),
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

  private get _activeElement(): Element | null | undefined {
    return getRoot(this)?.activeElement;
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * The keyboard navigation of the list.
   *
   * - `none`: a static list. Its items are not focusable.
   * - `listbox`: the list is one tab stop. The arrow keys, Home, End and typed
   *   letters move between the items, and Enter or Space clicks the focused
   *   item. An item holds no interactive content.
   * - `grid`: as `listbox`, for items that hold controls. Left and Right move
   *   between an item and its controls, and Escape or F2 returns to the item.
   *   A control that uses the arrow keys, such as a text field, keeps them.
   *
   * The app owns the selection: it toggles `selected` on the items and sets
   * `aria-multiselectable="true"` on the list for a multiple selection. In a
   * grid, an item that is not selected exposes its state only with
   * `aria-multiselectable`.
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
          ...CONTROL_ATTRIBUTES,
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
            : !this._grid.movesFromControl(node, event),
        bindingDefaults: { preventDefault: true, repeat: true },
      },
      horizontal: false,
      vertical: true,
      wrap: false,
      items: () => this._visibleItems,
      focusItem: (item) => item.focus(),
      activateItem: (item) => item.click(),
    });

    this._grid = createListGrid(this, {
      active: () => this._isGrid,
      rows: () => this._items,
      rowOf: (node) => this._rowOf(node),
      isWidget: this._isWidget,
      focus: (control) =>
        this._isWidget(control) ? control._focusTabStop() : control.focus(),
    });

    addSafeEventListener(this, 'keydown', this._handleTypeahead);
    addSafeEventListener(this, 'focusin', this._handleFocusIn);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);
  }

  //#region Lit lifecycle methods

  public override connectedCallback(): void {
    super.connectedCallback();
    this._collect();

    // After a move. The first update does the first sync.
    if (this.hasUpdated) {
      this._updateTabStop();
      this._grid.sync();
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._grid.sync();
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('navigation')) {
      this._internals.setState('navigable', this._navigable);
      this._updateTabStop();
      this._grid.sync();
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

    // No `relatedTarget`: a window blur, which keeps the focus; a removal in
    // Chromium, which the mutation handler takes; or a blur to no element.
    queueMicrotask(() => {
      const item = this._focused;
      const active = this._activeElement;

      if (
        item?.isConnected &&
        item.contains(event.target as Node) &&
        !(active && item.contains(active))
      ) {
        this._focused = undefined;
      }
    });
  }

  private _handleMutations({ changes }: MutationControllerParams): void {
    const nodes = [...changes.added, ...changes.removed];
    const changed = (name: string): Element[] =>
      changes.attributes
        .filter(({ attributeName }) => attributeName === name)
        .map(({ node }) => node as Element);

    const focused = this._focused;
    const index = focused ? this._items.indexOf(focused) : -1;
    // Read first: the host stops being focusable once items arrive.
    const hostFocused = this._activeElement === this;

    if (this._navigable) {
      // An `aria-label` names the item again, and `aria-multiselectable`
      // changes the selected state of a row.
      const touched =
        this._isGrid && changed('aria-multiselectable').includes(this)
          ? this._items
          : changed('aria-label');

      for (const element of new Set(touched)) {
        if (element instanceof IgcListItemComponent && this._owns(element)) {
          element.requestUpdate();
        }
      }
    }

    const itemsChanged =
      !isEmpty(changed('hidden')) ||
      nodes.some(({ node, target }) => this._affectsItems(node, target));

    if (itemsChanged) {
      this._collect();

      if (this._lastFocused && !this._owns(this._lastFocused)) {
        this._lastFocused = undefined;
      }

      this._updateTabStop();
    }

    this._grid.handleMutations(changes, itemsChanged);

    if (this._navigable) {
      this._restoreFocus(
        { focused, index, hostFocused },
        changes.removed.map(({ target }) => target)
      );
    }
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

  /**
   * Puts the focus back after a mutation: on the next item when the focused
   * item left, on the tab stop when items arrive in a focused empty list, and
   * on the row when its focused control left (`parents` of removed elements).
   */
  private _restoreFocus(
    before: {
      focused?: IgcListItemComponent;
      index: number;
      hostFocused: boolean;
    },
    parents: Element[]
  ): void {
    const { focused, index, hostFocused } = before;
    // A nested list that navigates keeps the focus in its own rows.
    const fromRow = (parent: Element): boolean => {
      const list = parent.closest(IgcListComponent.tagName)!;
      return (
        this._rowOf(parent) === focused &&
        (list === this || !this._isWidget(list))
      );
    };

    if (focused && !this._owns(focused)) {
      this._focused = undefined;

      if (this._focusIsLost()) {
        const visible = (item: IgcListItemComponent) => item.checkVisibility();
        const next =
          this._items.slice(index).find(visible) ??
          this._items.slice(0, index).findLast(visible);

        (next ?? this).focus();
      }
    } else if (hostFocused && this._tabStop) {
      this._tabStop.focus();
    } else if (focused && this._focusIsLost() && parents.some(fromRow)) {
      focused.focus();
    }
  }

  /** Whether no element has the focus, as after the removal of the focused one. */
  private _focusIsLost(): boolean {
    const active = this._activeElement;
    return !active || active === this.ownerDocument.body;
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

    // Also before the first render, so it reads the host children.
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

  /** Gives the tab stop to one item, else to an empty list that navigates. */
  private _updateTabStop(): void {
    const navigable = this._navigable;
    const candidates = navigable
      ? this._items.filter((item) => !item.hidden)
      : [];

    this._tabStop =
      candidates.find((item) => item === this._lastFocused) ??
      candidates.find((item) => item.selected) ??
      firstOf(candidates);

    for (const item of this._items) {
      if (navigable) {
        claimTabIndex(item, item === this._tabStop ? '0' : '-1');
      } else {
        releaseTabIndex(item);
      }
    }

    if (navigable && isEmpty(this._items)) {
      claimTabIndex(this, '0');
    } else {
      releaseTabIndex(this);
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

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { type ListContext, listContext } from '#internals/context.js';
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
  normalizedTextContent,
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
import IgcListHeaderComponent from './list-header.js';
import IgcListItemComponent from './list-item.js';
import { styles } from './themes/container.base.css.js';
import { styles as shared } from './themes/shared/container/list.common.css.js';

const OWN_CHILDREN = `${IgcListItemComponent.tagName},${IgcListHeaderComponent.tagName}`;

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
   * The focused item. Firefox and WebKit fire no `focusout` for a removed
   * element, so it stays until the focus moves to another element.
   */
  private _focused?: IgcListItemComponent;

  private readonly _context: ListContext = {
    navigates: (element) => this._navigable && this._owns(element),
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

  private get _navigable(): boolean {
    return this.navigation === 'listbox';
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
   *
   * The app owns the selection. It toggles `selected` on the items, for
   * example in a `click` handler, and sets `aria-multiselectable="true"` on
   * the list when more than one item can be selected.
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
      aria: () => ({ role: this._navigable ? 'listbox' : 'list' }),
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
        attributeFilter: ['hidden', 'aria-label'],
      },
      callback: this._handleMutations,
    });

    addRovingFocusController<IgcListItemComponent>(this, {
      keybindings: {
        // A Space that extends a type-ahead search is a letter, not a click.
        skip: (node, event) =>
          !this._isNavigableItem(node) || this._typeahead.accepts(event),
        bindingDefaults: { preventDefault: true, repeat: true },
      },
      horizontal: false,
      vertical: true,
      wrap: false,
      items: () => this._visibleItems,
      focusItem: (item) => item.focus(),
      activateItem: (item) => item.click(),
    });

    addSafeEventListener(this, 'keydown', this._handleTypeahead);
    addSafeEventListener(this, 'focusin', this._handleFocusIn);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);
  }

  //#region Lit lifecycle

  public override connectedCallback(): void {
    super.connectedCallback();
    this._collect();
  }

  protected override willUpdate(): void {
    this._updateTabStop();
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
    const item = event.target as Element;

    if (!this._isNavigableItem(item)) {
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

      if (item?.isConnected && getRoot(this)?.activeElement !== item) {
        this._focused = undefined;
      }
    });
  }

  private _handleMutations({ changes }: MutationControllerParams): void {
    const nodes = [...changes.added, ...changes.removed];
    const attributes = changes.attributes;

    // A new title, subtitle or `aria-label` names or describes the item again.
    if (this._navigable) {
      const touched = [
        ...nodes.map(({ target }) => target),
        ...attributes
          .filter(({ attributeName }) => attributeName === 'aria-label')
          .map(({ node }) => node),
      ];

      for (const element of new Set(touched)) {
        if (element instanceof IgcListItemComponent && this._owns(element)) {
          element.requestUpdate();
        }
      }
    }

    if (
      !attributes.some(({ attributeName }) => attributeName === 'hidden') &&
      !nodes.some(({ node, target }) => this._affectsItems(node, target))
    ) {
      return;
    }

    const focused = this._focused;
    const index = focused ? this._items.indexOf(focused) : -1;
    // Read first: the host stops being focusable once items arrive.
    const hostFocused = getRoot(this)?.activeElement === this;

    this._collect();

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

  protected override render(): TemplateResult {
    // In a listbox, the empty-state content is read as its only option.
    const emptyRole =
      this._navigable && this._hasEmptyContent ? 'option' : undefined;

    return html`
      <slot></slot>
      ${
        isEmpty(this._items)
          ? html`<div role=${ifDefined(emptyRole)}>
              <slot name="empty"></slot>
            </div>`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list': IgcListComponent;
  }
}

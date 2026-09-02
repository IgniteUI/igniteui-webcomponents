import { html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  type KeyBindingController,
  type KeyBindingObserverCleanup,
  tabKey,
} from '#internals/controllers/key-bindings.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import { addRootClickController } from '#internals/controllers/root-click.js';
import { addRootScrollHandler } from '#internals/controllers/root-scroll.js';
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { registerComponent } from '#internals/definitions/register.js';
import {
  getActiveItems,
  getItems,
  getNextActiveItem,
  getPreviousActiveItem,
  IgcComboBoxBaseLikeComponent,
  setInitialSelectionState,
} from '#internals/mixins/combo-box.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { getElementByIdFromRoot } from '#internals/utils/dom.js';
import { getElementFromPath } from '#internals/utils/events.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { isString } from '#internals/utils/types.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcPopoverComponent, {
  type PopoverPlacement,
} from '../popover/popover.js';
import type { PopoverScrollStrategy } from '../types.js';
import IgcDropdownGroupComponent from './dropdown-group.js';
import IgcDropdownHeaderComponent from './dropdown-header.js';
import IgcDropdownItemComponent from './dropdown-item.js';
import { all } from './themes/container.js';
import { styles } from './themes/dropdown.base.css.js';
import { styles as shared } from './themes/shared/dropdown.common.css.js';

export interface IgcDropdownComponentEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcChange: CustomEvent<IgcDropdownItemComponent>;
}

const nextItemId = createIdGenerator('igc-dropdown-item');

/**
 * Represents a Dropdown component.
 *
 * @element igc-dropdown
 *
 * @fires igcChange - Emitted when the selected item changes.
 * @fires igcOpening - Emitted just before the dropdown is opened.
 * @fires igcOpened - Emitted after the dropdown is opened.
 * @fires igcClosing - Emitter just before the dropdown is closed.
 * @fires igcClosed - Emitted after closing the dropdown.
 *
 * @slot target - Renders the dropdown's target element.
 * @slot - Renders the dropdown list items.
 *
 * @csspart base - The dropdown list wrapper container.
 * @csspart list - The dropdown list element.
 */
@blazorAdditionalDependencies(
  'IgcDropdownItemComponent, IgcDropdownHeaderComponent, IgcDropdownGroupComponent'
)
export default class IgcDropdownComponent extends EventEmitterMixin<
  IgcDropdownComponentEventMap,
  AbstractConstructor<IgcComboBoxBaseLikeComponent>
>(IgcComboBoxBaseLikeComponent) {
  public static readonly tagName = 'igc-dropdown';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcDropdownComponent,
      IgcDropdownGroupComponent,
      IgcDropdownHeaderComponent,
      IgcDropdownItemComponent,
      IgcPopoverComponent
    );
  }

  //#region Internal state

  private readonly _keyBindings: KeyBindingController;

  private readonly _rootScrollController = addRootScrollHandler(this, {
    hideCallback: this._handleClosing,
  });

  protected override readonly _rootClickController = addRootClickController(
    this,
    {
      onHide: this._handleClosing,
    }
  );

  private _selectedItem: IgcDropdownItemComponent | null = null;

  /** The item keyboard navigation moves from. Only {@link _activateItem} assigns it. */
  private _activeItem: IgcDropdownItemComponent | null = null;

  /** The anchor passed to `show()` / `toggle()`, if any. */
  private _explicitTarget?: HTMLElement;

  /** The anchor in use - the popover is positioned against it. */
  @state()
  private _target?: HTMLElement;

  private _targetListeners?: KeyBindingObserverCleanup;

  @query('slot[name="target"]')
  private readonly _targetSlot!: HTMLSlotElement | null;

  /** The element currently assigned to the `target` slot, if any. */
  private get _slottedTarget(): HTMLElement | undefined {
    const [target] =
      this._targetSlot?.assignedElements({ flatten: true }) ?? [];
    return target as HTMLElement | undefined;
  }

  private get _activeItems(): IgcDropdownItemComponent[] {
    return Array.from(
      getActiveItems<IgcDropdownItemComponent>(
        this,
        IgcDropdownItemComponent.tagName
      )
    );
  }

  //#endregion

  //#region Public attributes and properties

  /** The preferred placement of the component around the target element.
   * @attr
   */
  @property()
  public placement: PopoverPlacement = 'bottom-start';

  /**
   * Determines the behavior of the component during scrolling of the parent container.
   * @attr scroll-strategy
   */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: PopoverScrollStrategy = 'scroll';

  /**
   * Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.
   * When true, once enough space is detected on its preferred side, it will flip back.
   * @attr
   */
  @property({ type: Boolean })
  public flip = false;

  /**
   * The distance from the target element.
   * @attr
   */
  @property({ type: Number })
  public distance = 0;

  /**
   * Whether the dropdown's width should be the same as the target's one.
   * @attr same-width
   */
  @property({ type: Boolean, attribute: 'same-width' })
  public sameWidth = false;

  /** Returns the items of the dropdown. */
  public get items(): IgcDropdownItemComponent[] {
    return Array.from(
      getItems<IgcDropdownItemComponent>(this, IgcDropdownItemComponent.tagName)
    );
  }

  /** Returns the group items of the dropdown. */
  public get groups(): IgcDropdownGroupComponent[] {
    return Array.from(
      getItems<IgcDropdownGroupComponent>(
        this,
        IgcDropdownGroupComponent.tagName
      )
    );
  }

  /** Returns the selected item from the dropdown or null. */
  public get selectedItem(): IgcDropdownItemComponent | null {
    return this._selectedItem;
  }

  //#endregion

  //#region Life-cycle

  constructor() {
    super();

    addThemingController(this, all);

    this._keyBindings = addKeybindings(this, {
      skip: () => !this.open,
      bindingDefaults: { preventDefault: true, repeat: true },
    })
      .set(tabKey, this._handleTab, {
        preventDefault: false,
      })
      .set(escapeKey, this._handleClosing)
      .set(arrowUp, this._handleArrowUp)
      .set(arrowLeft, this._handleArrowUp)
      .set(arrowDown, this._handleArrowDown)
      .set(arrowRight, this._handleArrowDown)
      .set(enterKey, this._commitActiveItem)
      .set(homeKey, this._handleHome)
      .set(endKey, this._handleEnd);

    createMutationController(this, {
      callback: this._handleItemsChange,
      filter: [IgcDropdownItemComponent.tagName],
      config: { childList: true, subtree: true },
    });
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    // Re-establish what `disconnectedCallback` tore down.
    this._observeTarget();
    this._syncAnchorARIA();
  }

  /** @internal */
  public override disconnectedCallback(): void {
    this._releaseTarget();
    super.disconnectedCallback();
  }

  protected override willUpdate(properties: PropertyValues<this>): void {
    if (!this.hasUpdated) {
      return;
    }

    const openChanged = properties.has('open');
    const strategyChanged = properties.has('scrollStrategy');

    if (openChanged || properties.has('keepOpenOnOutsideClick')) {
      this._rootClickController.update();
    }

    if (openChanged || strategyChanged) {
      this._rootScrollController.update({ resetListeners: strategyChanged });
    }
  }

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;
    const selected = setInitialSelectionState(this.items);

    if (selected) {
      this._selectItem(selected, false);
    }
  }

  protected override updated(): void {
    this._syncAnchorARIA();
  }

  //#endregion

  //#region Event handlers

  /**
   * Re-resolves the selection whenever items enter or leave the light DOM -
   * frameworks routinely render them after the initial paint, and a selected or
   * navigated item may be taken out from under us.
   */
  private _handleItemsChange({
    changes: { added, removed },
  }: MutationControllerParams<IgcDropdownItemComponent>): void {
    if (!this.hasUpdated || (isEmpty(added) && isEmpty(removed))) {
      return;
    }

    const items = this.items;

    if (this._selectedItem && !items.includes(this._selectedItem)) {
      this._clearSelectedItem();
    } else if (this._activeItem && !items.includes(this._activeItem)) {
      this._activateItem(this._selectedItem);
    }
  }

  private _handleListBoxClick(event: MouseEvent): void {
    const item = getElementFromPath(IgcDropdownItemComponent.tagName, event);

    if (item && !item.disabled) {
      this._selectItem(item);
    }
  }

  protected override _handleAnchorClick(): void {
    // Opening through our own anchor hands the anchor role back to it.
    this._explicitTarget = undefined;
    this._updateTarget();

    super._handleAnchorClick();
  }

  private _handleClosing(): void {
    this._hide(true);
  }

  private _handleArrowUp(): void {
    this._navigateToActiveItem(
      getPreviousActiveItem(this.items, this._activeItem)
    );
  }

  private _handleArrowDown(): void {
    this._navigateToActiveItem(getNextActiveItem(this.items, this._activeItem));
  }

  private _handleHome(): void {
    this._navigateToActiveItem(this._activeItems.at(0));
  }

  private _handleEnd(): void {
    this._navigateToActiveItem(this._activeItems.at(-1));
  }

  private _handleTab(): void {
    this._commitActiveItem();

    // Tab commits and leaves, whatever `keepOpenOnSelect` says.
    this._hide(true);
  }

  //#endregion

  //#region Internal API

  /** Selects the item navigation is on, if there is one. */
  private _commitActiveItem(): void {
    if (this._activeItem) {
      this._selectItem(this._activeItem);
    }
  }

  private _activateItem(item: IgcDropdownItemComponent | null): void {
    if (this._activeItem && this._activeItem !== item) {
      this._activeItem.active = false;
    }

    this._activeItem = item;

    if (item) {
      item.active = true;
    }

    this._syncAnchorARIA();
  }

  private _setSelectedItem(item: IgcDropdownItemComponent): void {
    if (this._selectedItem && this._selectedItem !== item) {
      this._selectedItem.selected = false;
    }

    this._selectedItem = item;
    item.selected = true;
    this._activateItem(item);
  }

  private _selectItem(
    item?: IgcDropdownItemComponent | null,
    emit = true
  ): IgcDropdownItemComponent | null {
    if (!item) {
      this._clearSelectedItem();
      return null;
    }

    // Re-selecting the current item is not a change, but still a commit.
    const changed = this._selectedItem !== item;

    changed ? this._setSelectedItem(item) : this._activateItem(item);

    if (emit) {
      if (changed) {
        this.emitEvent('igcChange', { detail: item });
      }

      if (!this.keepOpenOnSelect) {
        this._hide(true);
      }
    }

    return this._selectedItem;
  }

  private _clearSelectedItem(): void {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }

    this._selectedItem = null;
    this._activateItem(null);
  }

  /** Highlights `item` and, while the list is open, brings it into view. */
  private _navigateToActiveItem(item?: IgcDropdownItemComponent | null): void {
    if (!item) {
      return;
    }

    this._activateItem(item);

    // Closed, the list is inert and off screen.
    if (this.open) {
      item.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }

  /** Resolves an item by its `value`, or by its index in {@link items}. */
  private _resolveItem(
    value: string | number
  ): IgcDropdownItemComponent | undefined {
    return isString(value)
      ? this.items.find((item) => item.value === value)
      : this.items[value];
  }

  /**
   * Moves everything bound to the anchor - key event listeners, outside click
   * exemption and ARIA - over to the one currently in effect.
   */
  private _updateTarget(): void {
    const target = this._explicitTarget ?? this._slottedTarget;

    if (target === this._target) {
      return;
    }

    this._releaseTarget();

    this._target = target;
    this._rootClickController.update({ target });
    this._observeTarget();
    this._syncAnchorARIA();
  }

  /**
   * Only an anchor outside of our own DOM needs listeners of its own - keyboard
   * events on a slotted one already reach the host.
   */
  private _observeTarget(): void {
    const target = this._target;

    if (target && !this._targetListeners && !this.contains(target)) {
      this._targetListeners = this._keyBindings.observeElement(target);
    }
  }

  private _setExplicitTarget(anchor: HTMLElement | string): void {
    const target = isString(anchor)
      ? getElementByIdFromRoot(this, anchor)
      : anchor;

    // An id matching nothing leaves the current anchor in place.
    if (!target) {
      return;
    }

    this._explicitTarget = target;
    this._updateTarget();
  }

  /**
   * Publishes the popup state and the navigation position on the current anchor.
   *
   * `aria-activedescendant` goes on the anchor because that is what holds DOM
   * focus - the list is never focused, since the key bindings are observed on
   * the anchor itself. There is no `aria-controls` to go with it: the list it
   * would name lives in this shadow root, which an IDREF cannot cross and ARIA
   * element reflection only ever resolves out of, never into.
   */
  private _syncAnchorARIA(): void {
    const anchor = this._target;

    if (!anchor) {
      return;
    }

    const active = this.open ? this._activeItem : null;

    anchor.setAttribute('aria-haspopup', 'listbox');
    anchor.setAttribute('aria-expanded', `${this.open}`);

    if (active) {
      // Items only need an id if they have none of their own
      active.id ||= nextItemId();
      anchor.setAttribute('aria-activedescendant', active.id);
    } else {
      anchor.removeAttribute('aria-activedescendant');
    }
  }

  /**
   * Stops driving the current anchor: its key event listeners go, along with
   * everything {@link _syncAnchorARIA} wrote onto it.
   */
  private _releaseTarget(): void {
    this._targetListeners?.unsubscribe();
    this._targetListeners = undefined;

    const anchor = this._target;

    anchor?.removeAttribute('aria-haspopup');
    anchor?.removeAttribute('aria-expanded');
    anchor?.removeAttribute('aria-activedescendant');
  }

  //#endregion

  //#region Public API

  /* blazorSuppress */
  /** Shows the component. */
  public override async show(target?: HTMLElement | string): Promise<boolean> {
    if (target) {
      this._setExplicitTarget(target);

      // A target that resolves to nothing, with no anchor to fall back on,
      // would open a list the popover cannot place - and so cannot show.
      if (!this._target) {
        return false;
      }
    }

    return super.show();
  }

  /* blazorSuppress */
  /** Toggles the open state of the component. */
  public override async toggle(
    target?: HTMLElement | string
  ): Promise<boolean> {
    return this.open ? this.hide() : this.show(target);
  }

  /* blazorSuppress */
  /** Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string): IgcDropdownItemComponent | null;
  /* blazorSuppress */
  /** Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public navigateTo(index: number): IgcDropdownItemComponent | null;
  /* blazorSuppress */
  /** Navigates to the specified item. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string | number): IgcDropdownItemComponent | null {
    const item = this._resolveItem(value);

    if (item) {
      this._navigateToActiveItem(item);
    }

    return item ?? null;
  }

  /* blazorSuppress */
  /** Selects the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public select(value: string): IgcDropdownItemComponent | null;
  /* blazorSuppress */
  /** Selects the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public select(index: number): IgcDropdownItemComponent | null;
  /* blazorSuppress */
  /** Selects the specified item. If it exists, returns the found item, otherwise - null. */
  public select(value: string | number): IgcDropdownItemComponent | null {
    const item = this._resolveItem(value);
    return item ? this._selectItem(item, false) : null;
  }

  /**  Clears the current selection of the dropdown. */
  public clearSelection(): void {
    this._clearSelectedItem();
  }

  //#endregion

  protected override render() {
    return html`<igc-popover
      ?open=${this.open}
      ?flip=${this.flip}
      ?same-width=${this.sameWidth}
      .anchor=${this._target}
      .offset=${this.distance}
      .placement=${this.placement}
      shift
    >
      <slot
        id="dropdown-target"
        name="target"
        slot="anchor"
        @click=${this._handleAnchorClick}
        @slotchange=${this._updateTarget}
      ></slot>
      <div part="base" @click=${this._handleListBoxClick} .inert=${!this.open}>
        <div
          id="dropdown-list"
          role="listbox"
          part="list"
          aria-labelledby="dropdown-target"
        >
          <slot></slot>
        </div>
      </div>
    </igc-popover>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown': IgcDropdownComponent;
  }
}

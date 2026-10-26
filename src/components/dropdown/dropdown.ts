import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import {
  getItems,
  IgcComboBoxBaseLikeComponent,
  setInitialSelectionState,
} from '#internals/bases/combo-box.js';
import { createListSelection } from '#internals/bases/list-selection.js';
import { ariaBindings } from '#internals/controllers/aria-projection.js';
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
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { firstOf, isEmpty, lastOf } from '#internals/utils/arrays.js';
import {
  getElementByIdFromRoot,
  setOrRemoveAttribute,
} from '#internals/utils/dom.js';
import { getElementFromPath } from '#internals/utils/events.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { isString } from '#internals/utils/types.js';
import { all } from '#themes/dropdown/themes/container.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcPopoverComponent, {
  type PopoverPlacement,
} from '../popover/popover.js';
import IgcDropdownGroupComponent from './dropdown-group.js';
import IgcDropdownHeaderComponent from './dropdown-header.js';
import IgcDropdownItemComponent from './dropdown-item.js';
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
 * Shows a list of items in a popup next to a target element. The user
 * selects one item from the list.
 *
 * @element igc-dropdown
 *
 * @fires igcChange - Emitted when the user selects a different item. The detail is the item.
 * @fires igcOpening - Emitted before the user opens the dropdown. Cancelable.
 * @fires igcOpened - Emitted after the dropdown opens on a user action.
 * @fires igcClosing - Emitted before the user closes the dropdown. Cancelable.
 * @fires igcClosed - Emitted after the dropdown closes on a user action.
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
  typeof IgcComboBoxBaseLikeComponent
>(IgcComboBoxBaseLikeComponent) {
  public static readonly tagName = 'igc-dropdown';
  public static override styles = [componentBase, styles, shared];

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

  private readonly _selection = createListSelection<IgcDropdownItemComponent>(
    this,
    {
      itemTag: IgcDropdownItemComponent.tagName,
      onChange: () => this._syncAnchorARIA(),
    }
  );

  /** The anchor passed to `show()` / `toggle()`, if any. */
  private _explicitTarget?: HTMLElement;

  /** The anchor in use - the popover is positioned against it. */
  @state()
  private _target?: HTMLElement;

  private _targetListeners?: KeyBindingObserverCleanup;

  @query('slot[name="target"]')
  private readonly _targetSlot!: HTMLSlotElement | null;

  private get _slottedTarget(): HTMLElement | undefined {
    const [target] =
      this._targetSlot?.assignedElements({ flatten: true }) ?? [];
    return target as HTMLElement | undefined;
  }

  //#endregion

  //#region Public attributes and properties

  /** The preferred placement of the component around the target element.
   * @attr
   */
  @property()
  public placement: PopoverPlacement = 'bottom-start';

  /**
   * Whether the dropdown flips to the opposite side of the target when it does not fit in the visible area.
   * It flips back when its preferred side has enough space again.
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
   * Whether the dropdown has the same width as the target.
   * @attr same-width
   */
  @property({ type: Boolean, attribute: 'same-width' })
  public sameWidth = false;

  /** Returns the items of the dropdown. */
  public get items(): IgcDropdownItemComponent[] {
    return this._selection.items;
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
    return this._selection.selected;
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
   * Resolves the selection again when items enter or leave the light DOM, for
   * example after a late framework render.
   */
  private _handleItemsChange({
    changes: { added, removed },
  }: MutationControllerParams<IgcDropdownItemComponent>): void {
    if (this.hasUpdated && !(isEmpty(added) && isEmpty(removed))) {
      this._selection.prune();
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

  private _handleArrowUp(): void {
    this._selection.navigate(this._selection.previous());
  }

  private _handleArrowDown(): void {
    this._selection.navigate(this._selection.next());
  }

  private _handleHome(): void {
    this._selection.navigate(firstOf(this._selection.activeItems));
  }

  private _handleEnd(): void {
    this._selection.navigate(lastOf(this._selection.activeItems));
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
    if (this._selection.active) {
      this._selectItem(this._selection.active);
    }
  }

  private _selectItem(
    item?: IgcDropdownItemComponent | null,
    emit = true
  ): IgcDropdownItemComponent | null {
    if (!item) {
      this._selection.select(null);
      return null;
    }

    // Re-selecting the current item is not a change, but still a commit.
    const changed = this._selection.selected !== item;

    this._selection.select(item);

    if (emit) {
      if (changed) {
        this.emitEvent('igcChange', { detail: item });
      }

      if (!this.keepOpenOnSelect) {
        this._hide(true);
      }
    }

    return this._selection.selected;
  }

  /**
   * Moves all that is bound to the anchor to the current one: the key event
   * listeners, the outside-click exemption and the ARIA state.
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
   * Only an anchor outside this DOM needs its own listeners. A keyboard event
   * on a slotted anchor already reaches the host.
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
   * Publishes the popup state and the navigation position on the anchor, which
   * holds focus. There is no `aria-controls`: neither an IDREF nor element
   * reflection can reach into this shadow root.
   */
  private _syncAnchorARIA(): void {
    const anchor = this._target;

    if (!anchor) {
      return;
    }

    const active = this.open ? this._selection.active : null;
    const expanded = `${this.open}`;

    // A button target renders again on each write, also of the same value.
    if (anchor.getAttribute('aria-expanded') !== expanded) {
      anchor.setAttribute('aria-haspopup', 'listbox');
      anchor.setAttribute('aria-expanded', expanded);
    }

    if (active) {
      active.id ||= nextItemId();
    }
    setOrRemoveAttribute(anchor, 'aria-activedescendant', active?.id);
  }

  /**
   * Releases the current anchor: removes its key event listeners and all that
   * {@link _syncAnchorARIA} wrote onto it.
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
  /**
   * Opens the dropdown. It does not emit events. The optional `target` is the
   * anchor element, or its ID. The promise resolves to `false` when the
   * dropdown is already open or has no anchor, or when a later call replaces
   * this one.
   */
  public override async show(target?: HTMLElement | string): Promise<boolean> {
    if (target) {
      this._setExplicitTarget(target);

      // The popover cannot place the list without an anchor.
      if (!this._target) {
        return false;
      }
    }

    return super.show();
  }

  /* blazorSuppress */
  /**
   * Opens the dropdown when it is closed, and closes it when it is open. It
   * does not emit events. The optional `target` is the anchor element for
   * the open, or its ID. The promise resolves to `true` when the state
   * changes.
   */
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
    const item = this._selection.resolve(value);
    this._selection.navigate(item);
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
    const item = this._selection.resolve(value);
    return item ? this._selectItem(item, false) : null;
  }

  /**  Clears the current selection of the dropdown. */
  public clearSelection(): void {
    this._selection.select(null);
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
      .scrollStrategy=${this.scrollStrategy}
      @igcPopoverScrollClose=${this._handleClosing}
    >
      <slot
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
          ${ariaBindings({ labelledBy: this._target && [this._target] })}
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

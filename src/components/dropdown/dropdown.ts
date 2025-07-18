import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { addThemingController } from '../../theming/theming-controller.js';
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
} from '../common/controllers/key-bindings.js';
import { addRootClickController } from '../common/controllers/root-click.js';
import { addRootScrollHandler } from '../common/controllers/root-scroll.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  getActiveItems,
  getItems,
  getNextActiveItem,
  getPreviousActiveItem,
  IgcBaseComboBoxLikeComponent,
  setInitialSelectionState,
} from '../common/mixins/combo-box.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  findElementFromEventPath,
  getElementByIdFromRoot,
  isString,
} from '../common/util.js';
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

/**
 * Represents a DropDown component.
 *
 * @element igc-dropdown
 *
 * @fires igcChange - Emitted when the selected item changes.
 * @fires igcOpening - Emitted just before the dropdown is open.
 * @fires igcOpened - Emitted after the dropdown is open.
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
  AbstractConstructor<IgcBaseComboBoxLikeComponent>
>(IgcBaseComboBoxLikeComponent) {
  public static readonly tagName = 'igc-dropdown';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcDropdownComponent,
      IgcDropdownGroupComponent,
      IgcDropdownHeaderComponent,
      IgcDropdownItemComponent,
      IgcPopoverComponent
    );
  }

  private readonly _keyBindings: KeyBindingController;

  private _rootScrollController = addRootScrollHandler(this, {
    hideCallback: this.handleClosing,
  });

  protected override readonly _rootClickController = addRootClickController(
    this,
    {
      onHide: this.handleClosing,
    }
  );

  @state()
  protected _selectedItem: IgcDropdownItemComponent | null = null;

  @state()
  protected _activeItem!: IgcDropdownItemComponent;

  private get _activeItems() {
    return Array.from(
      getActiveItems<IgcDropdownItemComponent>(
        this,
        IgcDropdownItemComponent.tagName
      )
    );
  }

  private _targetListeners!: KeyBindingObserverCleanup;

  @state()
  private _target?: HTMLElement;

  @query('slot[name="target"]', true)
  protected trigger!: HTMLSlotElement;

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
  public get items() {
    return Array.from(
      getItems<IgcDropdownItemComponent>(this, IgcDropdownItemComponent.tagName)
    );
  }

  /** Returns the group items of the dropdown. */
  public get groups() {
    return Array.from(
      getItems<IgcDropdownGroupComponent>(
        this,
        IgcDropdownGroupComponent.tagName
      )
    );
  }

  /** Returns the selected item from the dropdown or null. */
  public get selectedItem() {
    return this._selectedItem;
  }

  @watch('scrollStrategy', { waitUntilFirstUpdate: true })
  protected scrollStrategyChanged() {
    this._rootScrollController.update({ resetListeners: true });
  }

  @watch('open', { waitUntilFirstUpdate: true })
  @watch('keepOpenOnOutsideClick', { waitUntilFirstUpdate: true })
  protected openStateChange() {
    this._updateAnchorAccessibility(this._target);
    this._rootClickController.update();
    this._rootScrollController.update();

    if (!this.open) {
      this._target = undefined;
      this._targetListeners?.unsubscribe();
      this._rootClickController.update({ target: undefined });
    }
  }

  constructor() {
    super();

    addThemingController(this, all);

    this._keyBindings = addKeybindings(this, {
      skip: () => !this.open,
      bindingDefaults: { preventDefault: true, triggers: ['keydownRepeat'] },
    })
      .set(tabKey, this.onTabKey, {
        preventDefault: false,
      })
      .set(escapeKey, this.onEscapeKey)
      .set(arrowUp, this.onArrowUp)
      .set(arrowLeft, this.onArrowUp)
      .set(arrowDown, this.onArrowDown)
      .set(arrowRight, this.onArrowDown)
      .set(enterKey, this.onEnterKey)
      .set(homeKey, this.onHomeKey)
      .set(endKey, this.onEndKey);
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    const selected = setInitialSelectionState(this.items);
    if (selected) {
      this._selectItem(selected, false);
    }
  }

  public override disconnectedCallback() {
    this._targetListeners?.unsubscribe();
    super.disconnectedCallback();
  }

  private handleListBoxClick(event: MouseEvent) {
    const item = findElementFromEventPath<IgcDropdownItemComponent>(
      IgcDropdownItemComponent.tagName,
      event
    );
    if (item && this._activeItems.includes(item)) {
      this._selectItem(item);
    }
  }

  private handleChange(item: IgcDropdownItemComponent) {
    this.emitEvent('igcChange', { detail: item });
  }

  private handleSlotChange() {
    this._updateAnchorAccessibility();
  }

  private onArrowUp() {
    this._navigateToActiveItem(
      getPreviousActiveItem(this.items, this._activeItem)
    );
  }

  private onArrowDown() {
    this._navigateToActiveItem(getNextActiveItem(this.items, this._activeItem));
  }

  protected onHomeKey() {
    this._navigateToActiveItem(this._activeItems.at(0));
  }

  protected onEndKey() {
    this._navigateToActiveItem(this._activeItems.at(-1));
  }

  protected onTabKey() {
    if (this._activeItem) {
      this._selectItem(this._activeItem);
    }
    if (this.open) {
      this._hide(true);
    }
  }

  protected onEscapeKey() {
    this._hide(true);
  }

  protected onEnterKey() {
    this._selectItem(this._activeItem);
  }

  protected handleClosing() {
    this._hide(true);
  }

  private activateItem(item: IgcDropdownItemComponent) {
    if (this._activeItem) {
      this._activeItem.active = false;
    }

    this._activeItem = item;
    this._activeItem.active = true;
  }

  private _navigateToActiveItem(item?: IgcDropdownItemComponent) {
    if (item) {
      this.activateItem(item);
      item.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }

  private _selectItem(item: IgcDropdownItemComponent, emit = true) {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }

    this.activateItem(item);
    this._selectedItem = item;
    this._selectedItem.selected = true;

    if (emit) this.handleChange(this._selectedItem);
    if (emit && !this.keepOpenOnSelect) this._hide(true);

    return this._selectedItem;
  }

  private _updateAnchorAccessibility(anchor?: HTMLElement | null) {
    const target =
      anchor ?? this.trigger.assignedElements({ flatten: true }).at(0);

    // Find tabbable elements ?
    if (target) {
      target.setAttribute('aria-haspopup', 'true');
      target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    }
  }

  private getItem(value: string) {
    return this.items.find((item) => item.value === value);
  }

  private _setTarget(anchor: HTMLElement | string) {
    const target = isString(anchor)
      ? getElementByIdFromRoot(this, anchor)!
      : anchor;

    this._target = target;
    this._targetListeners = this._keyBindings.observeElement(target);
    this._rootClickController.update({ target });
  }

  /* blazorSuppress */
  /** Shows the component. */
  public override async show(target?: HTMLElement | string): Promise<boolean> {
    if (target) {
      this._setTarget(target);
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
    const item = isString(value) ? this.getItem(value) : this.items[value];

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
    const item = isString(value) ? this.getItem(value) : this.items[value];
    return item ? this._selectItem(item, false) : null;
  }

  /**  Clears the current selection of the dropdown. */
  public clearSelection() {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }
    this._selectedItem = null;
  }

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
        @click=${this.handleAnchorClick}
        @slotchange=${this.handleSlotChange}
      ></slot>
      <div part="base" @click=${this.handleListBoxClick} .inert=${!this.open}>
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

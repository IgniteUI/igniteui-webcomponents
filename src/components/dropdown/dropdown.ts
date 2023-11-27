import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import IgcDropdownGroupComponent from './dropdown-group.js';
import IgcDropdownHeaderComponent from './dropdown-header.js';
import IgcDropdownItemComponent from './dropdown-item.js';
import { all } from './themes/container.js';
import { styles } from './themes/dropdown.base.css.js';
import { themes } from '../../theming/theming-decorator.js';
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
  tabKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickHandler } from '../common/controllers/root-click.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  IgcBaseComboBoxLikeComponent,
  getActiveItems,
  getItems,
  getNextActiveItem,
  getPreviousActiveItem,
} from '../common/mixins/combo-box.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import IgcPopoverComponent from '../popover/popover.js';
import type { IgcPlacement } from '../toggle/types';

export interface IgcDropdownEventMap {
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
 * @csspart base - The dropdown list wrapper.
 * @csspart list - The dropdown list.
 */
@themes(all)
@blazorAdditionalDependencies(
  'IgcDropdownItemComponent, IgcDropdownHeaderComponent, IgcDropdownGroupComponent, IgcPopoverComponent'
)
export default class IgcDropdownComponent extends SizableMixin(
  EventEmitterMixin<
    IgcDropdownEventMap,
    Constructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-dropdown';
  public static styles = styles;

  public static register() {
    registerComponent(
      this,
      IgcDropdownGroupComponent,
      IgcDropdownHeaderComponent,
      IgcDropdownItemComponent,
      IgcPopoverComponent
    );
  }

  private _rootClickController = addRootClickHandler(this, {
    hideCallback: () => this._hide(true),
  });

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

  @query('slot[name="target"]', true)
  protected trigger!: HTMLSlotElement;

  /** The preferred placement of the component around the target element.
   * @type {'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end'}
   * @attr
   */
  @property()
  public placement: IgcPlacement = 'bottom-start';

  /**
   * Sets the component's positioning strategy.
   * @attr position-strategy
   */
  @property({ attribute: 'position-strategy' })
  public positionStrategy: 'absolute' | 'fixed' = 'absolute';

  /**
   * Determines the behavior of the component during scrolling the container.
   * @attr scroll-strategy
   */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: 'scroll' | 'block' | 'close' = 'scroll';

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

  @watch('open', { waitUntilFirstUpdate: true })
  @watch('keepOpenOnOutsideClick', { waitUntilFirstUpdate: true })
  protected toggleDirectiveChange() {
    this._updateAnchorAccessibility();
    this._rootClickController.update();
  }

  constructor() {
    super();

    addKeybindings(this, {
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

    const items = this.items;
    let lastSelectedItem!: IgcDropdownItemComponent;

    for (const item of items) {
      if (item.selected) {
        lastSelectedItem = item;
      }
      item.selected = false;
    }
    this.selectItem(lastSelectedItem, false);
  }

  private handleListBoxClick(event: MouseEvent) {
    const item = event.target as IgcDropdownItemComponent;
    if (this._activeItems.includes(item)) {
      this.selectItem(item);
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
    this.selectItem(this._activeItem);
    if (this.open) {
      this._hide(true);
    }
  }

  protected onEscapeKey() {
    this._hide(true);
  }

  protected onEnterKey() {
    this.selectItem(this._activeItem);
  }

  private _navigateToActiveItem(item?: IgcDropdownItemComponent) {
    if (item) {
      this.activateItem(item);
      item.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }

  private _updateAnchorAccessibility() {
    const target = this.trigger
      .assignedElements({ flatten: true })
      .at(0) as HTMLElement;

    if (!target) {
      return;
    }

    // Find tabbable elements ?

    target.setAttribute('aria-haspopup', 'true');
    target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
  }

  private selectItem(item?: IgcDropdownItemComponent, emit = true) {
    if (!item) return null;

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

  private activateItem(item: IgcDropdownItemComponent) {
    if (!item) return;

    if (this._activeItem) {
      this._activeItem.active = false;
    }

    this._activeItem = item;
    this._activeItem.active = true;
  }

  private getItem(value: string) {
    return this.items.find((item) => item.value === value);
  }

  /** Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string): IgcDropdownItemComponent | null;
  /** Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public navigateTo(index: number): IgcDropdownItemComponent | null;
  /** Navigates to the specified item. If it exists, returns the found item, otherwise - null. */
  @blazorSuppress()
  public navigateTo(value: string | number): IgcDropdownItemComponent | null {
    const item =
      typeof value === 'string' ? this.getItem(value) : this.items[value];

    if (item) {
      this._navigateToActiveItem(item);
    }

    return item ?? null;
  }

  /** Selects the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public select(value: string): IgcDropdownItemComponent | null;
  /** Selects the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public select(index: number): IgcDropdownItemComponent | null;
  /** Selects the specified item. If it exists, returns the found item, otherwise - null. */
  @blazorSuppress()
  public select(value: string | number): IgcDropdownItemComponent | null {
    const item =
      typeof value === 'string' ? this.getItem(value) : this.items[value];

    return this.selectItem(item, false);
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
      .strategy=${this.positionStrategy}
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

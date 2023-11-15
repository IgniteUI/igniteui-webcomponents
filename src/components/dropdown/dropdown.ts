import { LitElement, html } from 'lit';
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
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  tabKey,
} from '../common/controllers/key-bindings.js';
import { RootClickController } from '../common/controllers/root-click.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { iterNodes } from '../common/util.js';
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
  EventEmitterMixin<IgcDropdownEventMap, Constructor<LitElement>>(LitElement)
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

  private outsideClickController = new RootClickController(this, {
    hideCallback: () => this._hide({ emit: true }),
  });

  @state()
  protected _selectedItem: IgcDropdownItemComponent | null = null;

  @state()
  protected _activeItem!: IgcDropdownItemComponent;

  // TODO: Expose as a property
  protected target!: HTMLElement;

  private _getItems() {
    return iterNodes<IgcDropdownItemComponent>(this, 'SHOW_ELEMENT', (item) =>
      item.matches(IgcDropdownItemComponent.tagName)
    );
  }

  private _getGroups() {
    return iterNodes<IgcDropdownGroupComponent>(this, 'SHOW_ELEMENT', (item) =>
      item.matches(IgcDropdownGroupComponent.tagName)
    );
  }

  private get _activeItems() {
    const items = [];
    for (const item of this._getItems()) {
      if (!item.disabled) {
        items.push(item);
      }
    }

    return items;
  }

  protected get allItems() {
    return Array.from(this._getItems());
  }

  // TODO: After refactoring igc-select rename this
  public get Items() {
    return this.allItems;
  }

  public get Groups() {
    return Array.from(this._getGroups());
  }

  @query('slot[name="target"]', true)
  protected trigger!: HTMLSlotElement;

  /**
   * Whether the dropdown should be kept open on selection.
   * @attr keep-open-on-select
   */
  @property({ type: Boolean, attribute: 'keep-open-on-select' })
  public keepOpenOnSelect = false;

  /**
   * Sets the open state of the component.
   * @attr
   */
  @property({ type: Boolean })
  public open = false;

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
   * Whether the component should be kept open on clicking outside of it.
   * @attr keep-open-on-outside-click
   */
  @property({ type: Boolean, attribute: 'keep-open-on-outside-click' })
  public keepOpenOnOutsideClick = false;

  /**
   * Whether the dropdown's width should be the same as the target's one.
   * @attr same-width
   */
  @property({ type: Boolean, attribute: 'same-width' })
  public sameWidth = false;

  /** Returns the selected item from the dropdown or null. */
  public get selectedItem() {
    return this._selectedItem;
  }

  @watch('open', { waitUntilFirstUpdate: true })
  @watch('keepOpenOnOutsideClick', { waitUntilFirstUpdate: true })
  protected toggleDirectiveChange() {
    this.updateAccessibility();
    this.outsideClickController.update();
  }

  constructor() {
    super();

    addKeybindings(this, {
      skip: () => !this.open,
      bindingDefaults: { preventDefault: true },
    })
      .set(escapeKey, this.onEscapeKey)
      .set(arrowUp, this.navigatePrev)
      .set(arrowDown, this.navigateNext)
      .set(enterKey, this.onEnterKey)
      .set(tabKey, this.onTabKey, {
        preventDefault: false,
        triggers: ['keydownRepeat'],
      })
      .set(homeKey, this.onHomeKey)
      .set(endKey, this.onEndKey);
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.setInitialSelection();
  }

  protected setInitialSelection() {
    const items = this.allItems;
    let lastSelectedItem!: IgcDropdownItemComponent;

    for (const item of items) {
      if (item.selected) {
        lastSelectedItem = item;
      }
      item.selected = false;
    }
    this.selectItem(lastSelectedItem, false);
  }

  protected onHomeKey() {
    this.navigateTo(this._activeItems.at(0)!.value);
  }

  protected onEndKey() {
    this.navigateTo(this._activeItems.at(-1)!.value);
  }

  protected onEscapeKey() {
    this._hide({ emit: true });
  }

  protected onTabKey() {
    this.selectItem(this._activeItem);
    if (this.open) {
      this._hide({ emit: true });
    }
  }

  protected onEnterKey() {
    this.selectItem(this._activeItem);
  }

  // FIXME: delete these after refactoring igc-select
  protected onArrowUpKeyDown() {}

  protected onArrowDownKeyDown() {}

  protected handleClick(event: MouseEvent) {
    const item = event.target as IgcDropdownItemComponent;
    const items = this._activeItems;

    if (items.includes(item)) {
      this.selectItem(item);
    }
  }

  protected async handleAnchorClick() {
    this.open ? this._hide({ emit: true }) : this._show({ emit: true });
  }

  // TODO: Remove
  protected handleTargetClick = async () => {
    if (!this.open) {
      if (!this.handleOpening()) return;
      this.show();
      await this.updateComplete;
      this.emitEvent('igcOpened');
    } else {
      this._hide();
    }
  };

  protected handleOpening() {
    return this.emitEvent('igcOpening', { cancelable: true });
  }

  protected handleClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  protected handleChange(item: IgcDropdownItemComponent) {
    this.emitEvent('igcChange', { detail: item });
  }

  // TODO: Change
  protected handleSlotChange() {
    if (!this.target) return;
    this.target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
  }

  // TODO: Remove
  protected handleFocusout(event: Event) {
    event.preventDefault();
    (event.target as HTMLElement).focus();
  }

  protected getItem(value: string) {
    const items = this.allItems;
    const index = items.findIndex((item) => item.value === value);
    return index !== -1 ? { item: items[index], index } : { item: null, index };
  }

  protected activateItem(item: IgcDropdownItemComponent) {
    if (!item) return;

    if (this._activeItem) {
      this._activeItem.active = false;
    }

    this._activeItem = item;
    this._activeItem.active = true;
  }

  protected selectItem(
    item?: IgcDropdownItemComponent,
    emit = true
  ): IgcDropdownItemComponent | null {
    if (!item) return null;

    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }

    this.activateItem(item);
    this._selectedItem = item;
    this._selectedItem.selected = true;
    if (emit) this.handleChange(this._selectedItem);
    if (emit && !this.keepOpenOnSelect) this._hide({ emit });

    return this._selectedItem;
  }

  protected navigate(direction: -1 | 1) {
    const index = this._activeItem
      ? this._activeItems.indexOf(this._activeItem) + direction
      : 0;

    this.navigateItem(index);
  }

  private navigateItem(idx: number) {
    const items = this._activeItems;

    if (items.length < 1 || idx < 0 || idx >= items.length) {
      return null;
    }

    const item = items[idx];

    this.activateItem(item);
    item.scrollIntoView({ behavior: 'auto', block: 'nearest' });

    return item;
  }

  protected getNearestSiblingFocusableItemIndex(
    startIndex: number,
    direction: -1 | 1
  ): number {
    let index = startIndex;
    const items = this.allItems;
    if (!items) {
      return -1;
    }

    while (items[index + direction] && items[index + direction].disabled) {
      index += direction;
    }

    index += direction;

    return index > -1 && index < items.length ? index : -1;
  }

  private navigateNext() {
    this.navigate(1);
  }

  private navigatePrev() {
    this.navigate(-1);
  }

  private async _hide(options: { emit: boolean } = { emit: false }) {
    if (!this.open) {
      return;
    }

    if (options.emit && !this.handleClosing()) {
      return;
    }

    this.open = false;

    if (options.emit) {
      await this.updateComplete;
      this.emitEvent('igcClosed');
    }
  }

  private async _show(options: { emit: boolean } = { emit: false }) {
    if (this.open) {
      return;
    }
    if (options.emit && !this.handleOpening()) {
      return;
    }

    this.open = true;

    if (options.emit) {
      await this.updateComplete;
      this.emitEvent('igcOpened');
    }
  }

  /** Shows the dropdown. */
  @blazorSuppress()
  public show(target?: HTMLElement) {
    if (target) {
      this.target = target;
    }
    this._show();
  }

  /** Hides the dropdown. */
  public hide(): void {
    this._hide();
  }

  /** Toggles the open state of the dropdown. */
  @blazorSuppress()
  public toggle(target?: HTMLElement): void {
    this.open ? this.hide() : this.show(target);
  }

  /** Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string): IgcDropdownItemComponent | null;
  /** Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public navigateTo(index: number): IgcDropdownItemComponent | null;
  /** Navigates to the specified item. If it exists, returns the found item, otherwise - null. */
  @blazorSuppress()
  public navigateTo(value: string | number): IgcDropdownItemComponent | null {
    const index =
      typeof value === 'string' ? this.getItem(value).index : (value as number);

    return this.navigateItem(index);
  }

  /** Selects the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public select(value: string): IgcDropdownItemComponent | null;
  /** Selects the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public select(index: number): IgcDropdownItemComponent | null;
  /** Selects the specified item. If it exists, returns the found item, otherwise - null. */
  @blazorSuppress()
  public select(value: string | number): IgcDropdownItemComponent | null {
    const item =
      typeof value === 'string'
        ? this.getItem(value).item
        : this.allItems[value as number];

    return this.selectItem(item!, false);
  }

  /**  Clears the current selection of the dropdown. */
  public clearSelection() {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }
    this._selectedItem = null;
  }

  protected updateAccessibility() {
    const target = this.trigger
      .assignedElements({ flatten: true })
      .at(0) as HTMLElement;

    if (!target) {
      return;
    }

    target.setAttribute('aria-haspopup', 'true');
    target.setAttribute('aria-expanded', this.open ? 'true' : `false`);
  }

  protected override render() {
    return html`<igc-popover
      ?open=${this.open}
      ?flip=${this.flip}
      ?same-width=${this.sameWidth}
      .anchor=${this.target}
      .strategy=${this.positionStrategy}
      .offset=${this.distance}
      .placement=${this.placement}
      shift
    >
      <slot
        id="dropdown-target"
        @click=${this.handleAnchorClick}
        name="target"
        slot="anchor"
      ></slot>
      <div
        id="dropdown-list"
        role="listbox"
        part="base"
        @click=${this.handleClick}
        .inert=${!this.open}
        aria-labelledby="dropdown-target"
      >
        <slot></slot>
      </div>
    </igc-popover>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown': IgcDropdownComponent;
  }
}

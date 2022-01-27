import { LitElement, html } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './dropdown.material.css';
import { watch } from '../common/decorators';
import {
  IgcPlacement,
  IgcToggleEventMap,
  IToggleOptions,
} from '../toggle/utilities';
import IgcDropDownItemComponent from './dropdown-item';
import { IgcToggleController } from '../toggle/toggle.controller';
import IgcDropDownGroupComponent from './dropdown-group';

export enum DropDownActionKey {
  ESCAPE = 'escape',
  ENTER = 'enter',
}

export interface IgcDropDownEventMap extends IgcToggleEventMap {
  igcChange: CustomEvent<ISelectionChangeEventArgs>;
}

export interface ISelectionChangeEventArgs {
  newItem: IgcDropDownItemComponent | null;
}

/**
 * Represents a DropDown component.
 *
 * @element igc-dropdown
 *
 * @fires igcChange - Emitted when the selected item changes.
 *
 * @slot target - Renders the dropdown's target element.
 * @slot - Renders the dropdown list items.
 *
 *
 */
export default class IgcDropDownComponent extends EventEmitterMixin<
  IgcDropDownEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-dropdown';

  public static styles = styles;

  private toggleController!: IgcToggleController;
  private selectedItem!: IgcDropDownItemComponent | null;
  private activeItem!: IgcDropDownItemComponent;
  private target!: HTMLElement;

  private get allItems(): IgcDropDownItemComponent[] {
    const groupItems: IgcDropDownItemComponent[] = this.groups.flatMap(
      (group) => group.items
    );
    return [...this.items, ...groupItems];
  }

  @query('#igcDDLContent')
  protected content!: HTMLElement;

  @query('#igcScrollContainer')
  protected scrollContainer!: HTMLElement;

  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-item' })
  protected items!: Array<IgcDropDownItemComponent>;

  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-group' })
  protected groups!: Array<IgcDropDownGroupComponent>;

  @queryAssignedElements({ slot: 'target' })
  private targetNodes!: Array<HTMLElement>;

  /** Sets the open state of the dropdown list. */
  @property({ type: Boolean })
  public open = false;

  /** Sets the dropdown list's positioning strategy. */
  @property({ attribute: false })
  public positionStrategy: 'absolute' | 'fixed' = 'absolute';

  /** The preferred placement of the dropdown list around the target element. */
  @property({ attribute: false })
  public placement: IgcPlacement = 'bottom-start';

  /**
   * Whether the list should be flipped to the opposite side of the target once it's about to overflow the visible area.
   * When true, once enough space is detected on its preferred side, it will flip back.
   */
  @property({ type: Boolean })
  public flip = false;

  /** Whether the dropdown should be hidden on clicking outside of it. */
  @property({ type: Boolean })
  public closeOnOutsideClick = true;

  /** Determines the behavior of the dropdown list during scrolling the container. */
  @property({ attribute: false })
  public scrollStrategy: 'scroll' | 'close' | 'block' | 'noop' = 'noop';

  /** The amount of offset in horizontal and/or vertical direction. */
  @property({ attribute: false })
  public offset!: { x: number; y: number };

  @watch('target')
  @watch('open')
  protected toggleDirectiveChange() {
    if (!this.target) return;

    this.toggleController.open = this.open;
    this.toggleController.target = this.target;

    if (this.open && !this.selectedItem) {
      this.selectedItem = this.allItems.find((i) => i.selected) ?? null;
    }

    this.target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    // this.content.setAttribute(
    //   'aria-activedescendant',
    //   (this.open
    //     ? this.activeItem
    //       ? this.activeItem.value
    //       : this.items[0]?.value
    //     : '') as string
    // );
  }

  @watch('placement')
  @watch('flip')
  @watch('positionStrategy')
  @watch('closeOnOutsideClick')
  @watch('offset')
  protected updateOptions() {
    if (!this.toggleController) return;

    this.toggleController.options = {
      placement: this.placement,
      positionStrategy: this.positionStrategy,
      flip: this.flip,
      closeOnOutsideClick: this.closeOnOutsideClick,
      offset: this.offset,
    };
  }

  constructor() {
    super();

    const options: IToggleOptions = {
      placement: this.placement,
      positionStrategy: this.positionStrategy,
      flip: this.flip,
      closeOnOutsideClick: this.closeOnOutsideClick,
      offset: this.offset,
    };

    this.toggleController = new IgcToggleController(
      this,
      this.target ?? this.target,
      options
    );
    this.toggleController.documentClicked = (ev: MouseEvent) =>
      this.handleDocumentClicked(ev);
    this.toggleController.handleScroll = (ev: Event) => this.handleScroll(ev);
  }

  public override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  public override firstUpdated() {
    if (this.targetNodes.length) {
      this.target = this.targetNodes[0];
      // this.target.setAttribute('aria-owns', 'igcScrollContainer');
      this.target.setAttribute('haspopup', 'listbox');
    }
  }

  private handleDocumentClicked = (event: MouseEvent) => {
    if (!this.open) {
      return;
    }

    if (this.closeOnOutsideClick) {
      const target = event.composed ? event.composedPath() : [event.target];
      const isInsideClick: boolean =
        target.includes(this.content) ||
        (this.target !== undefined && target.includes(this.target));
      if (isInsideClick) {
        return;
      } else {
        this._hide();
      }
    }
  };

  private handleScroll = (event: Event) => {
    if (!this.open) {
      return;
    }

    switch (this.scrollStrategy) {
      case 'scroll':
        break;
      case 'block':
        this.blockScroll(event);
        break;
      case 'close':
        this._hide();
        break;
      case 'noop':
        event.preventDefault();
        event.stopImmediatePropagation();
        break;
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (
      this.open &&
      event &&
      (event.composedPath().includes(this.target) ||
        event.composedPath().includes(this.content))
    ) {
      const key = event.key.toLowerCase();
      const navKeys = [
        'esc',
        'escape',
        'enter',
        'arrowup',
        'up',
        'arrowdown',
        'down',
      ];
      if (navKeys.indexOf(key) === -1) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      switch (key) {
        case 'esc':
        case 'escape':
          this.handleItemActionKey(DropDownActionKey.ESCAPE);
          break;
        case 'enter':
          this.handleItemActionKey(DropDownActionKey.ENTER);
          break;
        case 'arrowup':
        case 'up':
          this.onArrowUpKeyDown();
          break;
        case 'arrowdown':
        case 'down':
          this.onArrowDownKeyDown();
          break;
        default:
          return;
      }
    }
  };

  private handleItemActionKey(key: DropDownActionKey) {
    switch (key) {
      case DropDownActionKey.ENTER:
        this.selectItem(this.activeItem);
        this.handleChange(this.activeItem);
        break;
      case DropDownActionKey.ESCAPE:
        break;
    }

    this._hide();
  }

  private handleClick(event: MouseEvent) {
    const newSelectedItem =
      event.target instanceof IgcDropDownItemComponent
        ? (event.target as IgcDropDownItemComponent)
        : null;
    if (!newSelectedItem || newSelectedItem.disabled) return;

    this.selectItem(newSelectedItem);
    this.handleChange(newSelectedItem);
    this._hide();
  }

  private handleTargetClick = () => {
    if (!this.open) {
      if (!this.handleOpening()) return;
      this.show();
      this.emitEvent('igcOpened');
    } else {
      this._hide();
    }
  };

  private handleOpening() {
    const args = { cancelable: true };
    return this.emitEvent('igcOpening', args);
  }

  private handleClosing(): boolean {
    const args = { cancelable: true };
    return this.emitEvent('igcClosing', args);
  }

  private handleChange(item: IgcDropDownItemComponent) {
    const args = { detail: { newItem: item } };
    this.emitEvent('igcChange', args);
  }

  private handleSlotChange() {
    if (!this.target) return;
    this.target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    // this.target.setAttribute(
    //   'aria-activedescendant',
    //   (this.activeItem
    //       ? this.activeItem.value
    //       : this.items[0]?.value) as string
    // );
  }

  private _sourceElement?: Element;
  private _initialScrollTop = 0;
  private _initialScrollLeft = 0;

  private blockScroll = (event: Event) => {
    event.preventDefault();
    if (!this._sourceElement || this._sourceElement !== event.target) {
      this._sourceElement = event.target as Element;
      this._initialScrollTop =
        this._sourceElement.scrollTop ??
        this._sourceElement.firstElementChild?.scrollTop;
      this._initialScrollLeft =
        this._sourceElement.scrollLeft ??
        this._sourceElement.firstElementChild?.scrollLeft;
    }

    this._sourceElement.scrollTop = this._initialScrollTop;
    this._sourceElement.scrollLeft = this._initialScrollLeft;
    if (this._sourceElement.firstElementChild) {
      this._sourceElement.firstElementChild.scrollTop = this._initialScrollTop;
      this._sourceElement.firstElementChild.scrollLeft =
        this._initialScrollLeft;
    }
  };

  private getItem(value: string) {
    let itemIndex = -1;
    let item!: IgcDropDownItemComponent;
    [...this.allItems].find((i, index) => {
      if (i.value === value) {
        item = i;
        itemIndex = index;
      }
    });
    return { item: item, index: itemIndex };
  }

  private activateItem(value: IgcDropDownItemComponent) {
    if (!value) return;

    if (this.activeItem && this.activeItem !== value) {
      this.activeItem.classList.remove('active');
    }

    this.activeItem = value;
    this.activeItem.classList.add('active');
  }

  private selectItem(
    item: IgcDropDownItemComponent,
    emit = true
  ): IgcDropDownItemComponent | null {
    const oldItem = this.selectedItem;

    if (!item) {
      return null;
    }

    if (oldItem && oldItem !== item) {
      oldItem.selected = false;
    }

    this.activateItem(item);
    this.selectedItem = item;
    this.selectedItem.selected = true;
    if (emit) this.handleChange(this.selectedItem);

    return this.selectedItem;
  }

  private navigate(direction: -1 | 1, currentIndex?: number) {
    let index = -1;
    if (this.activeItem) {
      index = currentIndex
        ? currentIndex
        : [...this.allItems].indexOf(this.activeItem) ?? index;
    }

    const newIndex = this.getNearestSiblingFocusableItemIndex(index, direction);
    this.navigateItem(newIndex);
  }

  private navigateItem(newIndex: number): IgcDropDownItemComponent | null {
    if (!this.allItems) {
      return null;
    }

    if (newIndex < 0 || newIndex >= this.allItems.length) {
      return null;
    }

    const newItem = this.allItems[newIndex];

    this.activateItem(newItem);
    this.scrollToHiddenItem(newItem);

    return newItem;
  }

  private scrollToHiddenItem(newItem: IgcDropDownItemComponent) {
    const elementRect = newItem.getBoundingClientRect();
    const parentRect = this.content.getBoundingClientRect();
    if (parentRect.top > elementRect.top) {
      this.content.scrollTop -= parentRect.top - elementRect.top;
    }

    if (parentRect.bottom < elementRect.bottom) {
      this.content.scrollTop += elementRect.bottom - parentRect.bottom;
    }
  }

  private getNearestSiblingFocusableItemIndex(
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

  private onArrowDownKeyDown() {
    this.navigateNext();
  }

  private onArrowUpKeyDown() {
    this.navigatePrev();
  }

  private _hide(emit = true) {
    if (emit && !this.handleClosing()) return;

    if (!this.open) return;

    this.open = false;

    if (emit) {
      this.emitEvent('igcClosed');
    }
  }

  /** Shows the dropdown. */
  public show(target?: HTMLElement) {
    if (this.open && !target) return;

    if (target) this.target = target;

    this.open = true;
  }

  /** Hides the dropdown. */
  public hide(): void {
    this._hide(false);
  }

  /** Toggles the open state of the dropdown. */
  public toggle(target?: HTMLElement): void {
    if (!this.open) {
      this.show(target);
    } else {
      this.hide();
    }
  }

  /** Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string): IgcDropDownItemComponent | null;
  /** Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public navigateTo(index: number): IgcDropDownItemComponent | null;
  /** Navigates to the specified item. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: any): IgcDropDownItemComponent | null {
    const index =
      typeof value === 'string' ? this.getItem(value).index : (value as number);

    return this.navigateItem(index);
  }

  /** Selects the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public select(value: string): IgcDropDownItemComponent | null;
  /** Selects the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public select(index: number): IgcDropDownItemComponent | null;
  /** Selects the specified item. If it exists, returns the found item, otherwise - null. */
  public select(value: any): IgcDropDownItemComponent | null {
    const item =
      typeof value === 'string'
        ? this.getItem(value).item
        : this.allItems[value as number];

    return this.selectItem(item, false);
  }

  /**  Clears the current selection of the dropdown. */
  public clearSelection() {
    if (this.selectedItem) {
      this.selectedItem.selected = false;
    }
    this.selectedItem = null;
  }

  protected override render() {
    return html`
      <slot
        name="target"
        @click=${this.handleTargetClick}
        @slotchange=${this.handleSlotChange}
      >
      </slot>
      <div
        id="igcDDLContent"
        part="base"
        @click=${this.handleClick}
        ${this.toggleController.toggleDirective}
      >
        <div
          id="igcScrollContainer"
          role="listbox"
          class="igc-dropdown-list-scroll"
          part="list"
          aria-label="dropdownList"
        >
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown': IgcDropDownComponent;
  }
}

import { LitElement, html } from 'lit';
import {
  customElement,
  property,
  query,
  queryAssignedNodes,
} from 'lit/decorators.js';
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
  SPACE = 'space',
}

export interface IgcDropDownEventMap extends IgcToggleEventMap {
  igcSelect: CustomEvent<ISelectionEventArgs>;
}

export interface ISelectionEventArgs {
  newItem: IgcDropDownItemComponent | null;
  oldItem: IgcDropDownItemComponent | null;
  cancel: boolean;
}

/**
 * DropDown component
 *
 * @element igc-dropdown
 *
 *
 */
@customElement('igc-dropdown')
export default class IgcDropDownComponent extends EventEmitterMixin<
  IgcDropDownEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** private */
  public static styles = styles;

  private toggleDirective!: any;
  private _options: IToggleOptions;
  private _selectedItem!: IgcDropDownItemComponent;
  private _activeItem!: IgcDropDownItemComponent;
  private _toggleController!: IgcToggleController;

  @property({ type: Boolean })
  public open = false;

  @property({ attribute: false })
  public strategy: 'absolute' | 'fixed' = 'absolute';

  @property({ attribute: false })
  public target!: HTMLElement;

  @property({ attribute: false })
  public placement: IgcPlacement = 'bottom-start';

  @property({ type: Boolean })
  public flip = false;

  @property({ type: Boolean })
  public closeOnOutsideClick = true;

  @property({ attribute: false })
  public scrollStrategy: 'absolute' | 'close' | 'block' | 'noop' = 'noop';

  // @property({ type: Boolean })
  // public allowItemsFocus = false;

  @property({ attribute: false })
  public offset!: { x: number; y: number };

  @query('#igcDDLContent')
  protected content!: HTMLElement;

  @queryAssignedNodes(undefined, true, 'igc-dropdown-item')
  public _items!: NodeListOf<IgcDropDownItemComponent>;

  @queryAssignedNodes(undefined, true, 'igc-dropdown-group')
  public _groups!: NodeListOf<IgcDropDownGroupComponent>;

  private get _allItems(): IgcDropDownItemComponent[] {
    const groupItems: IgcDropDownItemComponent[] = [...this._groups].flatMap(
      (group) => [...group.items]
    );
    return [...this._items, ...groupItems];
  }

  @watch('target')
  @watch('open')
  protected toggleDirectiveChange() {
    this.createToggleDirective();
  }

  @watch('placement')
  @watch('flip')
  @watch('strategy')
  @watch('closeOnOutsideClick')
  @watch('offset')
  protected updateOptions() {
    this._options.placement = this.placement;
    this._options.flip = this.flip;
    this._options.strategy = this.strategy;
    this._options.closeOnOutsideClick = this.closeOnOutsideClick;
    this._options.offset = this.offset;
  }

  public show() {
    // this.updateToggleOptions();

    if (!this.handleOpening()) {
      return;
    }

    this.open = true;

    this.handleOpened();
  }

  public hide(): void {
    if (!this.handleClosing()) {
      return;
    }

    this.open = false;
    this.handleClosed();
  }

  public toggle(): void {
    if (!this.open) {
      this.show();
    } else {
      this.hide();
    }
  }

  public select(value: string): IgcDropDownItemComponent {
    const item = [...this._allItems].find(
      (i) => i.value === value
    ) as IgcDropDownItemComponent;
    this.selectItem(item);
    return item;
  }

  protected selectItem(item: IgcDropDownItemComponent): boolean {
    const oldItem = this._selectedItem;

    if (!item) {
      return false;
    }

    if (oldItem) {
      this._selectedItem.selected = false;
    }

    this._selectedItem = item;
    return true;
    // item.active = true;
    // item.selected = true;
  }

  private handleClick(_ev: MouseEvent) {
    // _ev.preventDefault();
    const newSelectedItem = _ev.target as IgcDropDownItemComponent;
    if (newSelectedItem) {
      if (!this.handleSelection(newSelectedItem)) {
        return;
      }

      this.selectItem(newSelectedItem);
    }
  }
  protected handleOpening(): boolean {
    const args = { detail: { cancel: false } };
    this.emitEvent('igcOpening', args);
    console.log(this.id, '=====Opening======');

    if (args.detail.cancel) {
      this.open = false;
      return false;
    }

    return true;
  }

  protected handleOpened() {
    this.emitEvent('igcOpened');
    console.log('=====Opened======');
  }

  protected handleClosing(): boolean {
    const args = { detail: { cancel: false } };
    this.emitEvent('igcClosing', args);

    if (args.detail.cancel) {
      this.open = true;
      return false;
    }

    return true;
  }

  protected handleClosed() {
    this.emitEvent('igcClosed');
    console.log('=====Closed======');
  }

  protected handleSelection(item: IgcDropDownItemComponent): boolean {
    const oldItem = this._selectedItem;
    const newItem = item;
    const args = { detail: { oldItem, newItem, cancel: false } };

    if (args.detail.cancel) {
      return false;
    }

    this.emitEvent('igcSelect', args);
    console.log(args);
    return true;
  }

  private createToggleDirective() {
    this.toggleDirective = this._toggleController.createToggle(
      this.target,
      this.open,
      this._options
    );
  }

  private documentClicked = (ev: MouseEvent) => {
    if (!this.open) {
      return;
    }

    if (this.closeOnOutsideClick) {
      const target = ev.composed ? ev.composedPath() : [ev.target];
      const isInsideClick: boolean =
        target.includes(this.content) ||
        (this.target !== undefined && target.includes(this.target));
      if (isInsideClick) {
        return;
      } else {
        this.hide();
      }
    }
  };

  private handleScroll = (ev: Event) => {
    if (!this.open) {
      return;
    }

    switch (this.scrollStrategy) {
      case 'absolute':
        break;
      case 'block':
        this.blockScroll(ev);
        break;
      case 'close':
        this.hide();
        break;
      case 'noop':
        ev.preventDefault();
        ev.stopImmediatePropagation();
        break;
    }
  };

  private _sourceElement?: Element;
  private _initialScrollTop = 0;
  private _initialScrollLeft = 0;

  private blockScroll = (ev: Event) => {
    ev.preventDefault();
    if (!this._sourceElement || this._sourceElement !== ev.target) {
      this._sourceElement = ev.target as Element;
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

  // Keyboard navigation
  private navigate(direction: -1 | 1, currentIndex?: number) {
    let index = -1;
    if (this._activeItem) {
      index = currentIndex
        ? currentIndex
        : [...this._allItems].indexOf(this._activeItem) ?? index;
    }

    const newIndex = this.getNearestSiblingFocusableItemIndex(index, direction);
    this.navigateItem(newIndex);
  }

  /**
   * Navigates to the item on the specified index
   *
   * @param newIndex number - the index of the item in the `items` collection
   */
  private navigateItem(newIndex: number) {
    if (!this._allItems) {
      return;
    }
    if (newIndex < 0 || newIndex >= this._allItems.length) {
      return;
    }

    const oldItem = this._activeItem;
    const newItem = this._allItems[newIndex];
    if (oldItem) {
      oldItem.active = false;
    }
    this._activeItem = newItem;
    // this.scrollToHiddenItem(newItem);
    this._activeItem.active = true;
    console.log('Active', this._activeItem.textContent);
  }

  // protected scrollToHiddenItem(newItem: IgxDropDownItemBaseDirective) {
  //   const elementRect = newItem.element.nativeElement.getBoundingClientRect();
  //   const parentRect = this.scrollContainer.getBoundingClientRect();
  //   if (parentRect.top > elementRect.top) {
  //       this.scrollContainer.scrollTop -= (parentRect.top - elementRect.top);
  //   }

  //   if (parentRect.bottom < elementRect.bottom) {
  //       this.scrollContainer.scrollTop += (elementRect.bottom - parentRect.bottom);
  //   }
  // }

  private getNearestSiblingFocusableItemIndex(
    startIndex: number,
    direction: -1 | 1
  ): number {
    let index = startIndex;
    const items = this._allItems;
    if (!items) {
      return -1;
    }

    while (items[index + direction] && items[index + direction].disabled) {
      index += direction;
    }

    index += direction;
    if (index >= 0 && index < items.length) {
      return index;
    } else {
      return -1;
    }
  }

  /**
   * @hidden @internal
   */
  private navigateFirst() {
    this.navigate(1, -1);
  }

  /**
   * @hidden @internal
   */
  private navigateLast() {
    this.navigate(-1, this._allItems?.length);
  }

  /**
   * @hidden @internal
   */
  private navigateNext() {
    this.navigate(1);
  }

  /**
   * @hidden @internal
   */
  private navigatePrev() {
    this.navigate(-1);
  }
  /**
   * Navigates to previous item
   */
  private onArrowDownKeyDown() {
    this.navigateNext();
  }

  /**
   * Navigates to previous item
   */
  private onArrowUpKeyDown() {
    this.navigatePrev();
  }

  /**
   * Navigates to last item
   */
  private onEndKeyDown() {
    this.navigateLast();
  }

  /**
   * Navigates to first item
   */
  private onHomeKeyDown() {
    this.navigateFirst();
  }

  /**
   * Captures keydown events and calls the appropriate handlers
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event) {
      const key = event.key.toLowerCase();
      const navKeys = [
        'esc',
        'escape',
        'enter',
        'space',
        'spacebar',
        ' ',
        'arrowup',
        'up',
        'arrowdown',
        'down',
        'home',
        'end',
      ];
      if (navKeys.indexOf(key) === -1) {
        // If key has appropriate function in DD
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      switch (key) {
        case 'esc':
        case 'escape':
          this.onItemActionKey(DropDownActionKey.ESCAPE);
          break;
        case 'enter':
          this.onItemActionKey(DropDownActionKey.ENTER);
          break;
        case 'space':
        case 'spacebar':
        case ' ':
          this.onItemActionKey(DropDownActionKey.SPACE);
          break;
        case 'arrowup':
        case 'up':
          this.onArrowUpKeyDown();
          break;
        case 'arrowdown':
        case 'down':
          this.onArrowDownKeyDown();
          break;
        case 'home':
          this.onHomeKeyDown();
          break;
        case 'end':
          this.onEndKeyDown();
          break;
        default:
          return;
      }
    }
  };

  private onItemActionKey(key: DropDownActionKey) {
    switch (key) {
      case DropDownActionKey.ENTER:
      case DropDownActionKey.SPACE:
        if (!this.handleSelection(this._activeItem)) {
          return;
        }
        this.selectItem(this._activeItem);
        break;
      case DropDownActionKey.ESCAPE:
        break;
    }

    this.hide();
  }

  constructor() {
    super();
    this._toggleController = new IgcToggleController(this);
    this._toggleController.documentClicked = (ev: MouseEvent) =>
      this.documentClicked(ev);
    this._toggleController.handleScroll = (ev: Event) => this.handleScroll(ev);

    this._options = {
      placement: this.placement,
      strategy: this.strategy,
      flip: this.flip,
    };
  }

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  protected render() {
    return html`
      <div
        id="igcDDLContent"
        class="igc-drop-down-list"
        ${this.toggleDirective}
      >
        <div
          class="igc-drop-down-list-scroll"
          role="listbox"
          @click=${this.handleClick}
        >
          <slot></slot>
        </div>
      </div>
    `;
  }
}

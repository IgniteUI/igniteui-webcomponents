import { html, LitElement } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { IgcToggleController } from '../toggle/toggle.controller.js';
import type {
  IgcPlacement,
  IgcToggleComponent,
  IgcToggleEventMap,
} from '../toggle/types';
import { styles } from './themes/light/dropdown.base.css.js';
import { styles as material } from './themes/light/dropdown.material.css.js';
import { styles as bootstrap } from './themes/light/dropdown.bootstrap.css.js';
import { styles as fluent } from './themes/light/dropdown.fluent.css.js';
import { styles as indigo } from './themes/light/dropdown.indigo.css.js';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcDropdownGroupComponent from './dropdown-group.js';
import IgcDropdownHeaderComponent from './dropdown-header.js';
import IgcDropdownItemComponent from './dropdown-item.js';

defineComponents(
  IgcDropdownGroupComponent,
  IgcDropdownHeaderComponent,
  IgcDropdownItemComponent
);

export interface IgcDropdownEventMap extends IgcToggleEventMap {
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
@themes({ bootstrap, fluent, indigo, material })
@blazorAdditionalDependencies(
  'IgcDropdownItemComponent, IgcDropdownHeaderComponent, IgcDropdownGroupComponent'
)
export default class IgcDropdownComponent
  extends SizableMixin(
    EventEmitterMixin<IgcDropdownEventMap, Constructor<LitElement>>(LitElement)
  )
  implements IgcToggleComponent
{
  /** @private */
  public static readonly tagName: string = 'igc-dropdown';

  public static styles = styles;

  protected toggleController!: IgcToggleController;
  protected selectedItem!: IgcDropdownItemComponent | null;

  @state()
  protected activeItem!: IgcDropdownItemComponent;

  protected target!: HTMLElement;

  private readonly keyDownHandlers: Map<string, Function> = new Map(
    Object.entries({
      Escape: this.onEscapeKey,
      Enter: this.onEnterKey,
      ArrowUp: this.onArrowUpKeyDown,
      ArrowDown: this.onArrowDownKeyDown,
      ArrowLeft: this.onArrowUpKeyDown,
      ArrowRight: this.onArrowDownKeyDown,
      Home: this.onHomeKey,
      End: this.onEndKey,
    })
  );

  protected get allItems() {
    return [...this.items, ...this.groups.flatMap((group) => group.items)];
  }

  @queryAssignedElements({ slot: 'target' })
  private targetNodes!: Array<HTMLElement>;

  @query('[part="base"]')
  protected content!: HTMLElement;

  @query('[part="list"]')
  protected scrollContainer!: HTMLElement;

  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-item' })
  protected items!: Array<IgcDropdownItemComponent>;

  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-group' })
  protected groups!: Array<IgcDropdownGroupComponent>;

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
   * @type {"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "right" | "right-start" | "right-end" | "left" | "left-start" | "left-end"}
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

  @watch('open')
  protected toggleDirectiveChange() {
    if (!this.target) return;
    this.toggleController.target = this.target;
    this.requestUpdate();

    if (this.open) {
      document.addEventListener('keydown', this.handleKeyDown);
      this.target.addEventListener('focusout', this.handleFocusout);
      this.selectedItem = this.allItems.find((i) => i.selected) ?? null;
    } else {
      document.removeEventListener('keydown', this.handleKeyDown);
      this.target.removeEventListener('focusout', this.handleFocusout);
    }

    this.target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
  }

  @watch('placement')
  @watch('flip')
  @watch('positionStrategy')
  @watch('closeOnOutsideClick')
  @watch('distance')
  @watch('sameWidth')
  protected updateOptions() {
    if (!this.toggleController) return;

    this.toggleController.update();
  }

  @watch('size')
  protected sizeChange() {
    this.groups.forEach((g) => g.requestUpdate());
  }

  constructor() {
    super();
    this.toggleController = new IgcToggleController(this, {
      target: this.target,
      closeCallback: () => this._hide(),
    });
  }

  protected override async firstUpdated() {
    if (this.targetNodes.length) {
      this.target = this.targetNodes[0];
      this.target.setAttribute('aria-haspopup', 'listbox');
    }

    await this.updateComplete;
    this.toggleDirectiveChange();
    this.setInitialSelection();
  }

  protected override async getUpdateComplete() {
    const result = await super.getUpdateComplete();
    await this.toggleController.rendered;
    return result;
  }

  protected setInitialSelection() {
    const item = this.allItems.filter((item) => item.selected).at(-1);
    this.allItems.forEach((item) => (item.selected = false));
    if (item) {
      this.selectItem(item, false);
    }
  }

  protected handleKeyDown = (event: KeyboardEvent) => {
    const path = event.composedPath();
    if (!(path.includes(this.target) || path.includes(this.content))) return;

    if (this.keyDownHandlers.has(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      this.keyDownHandlers.get(event.key)?.call(this);
    }
  };

  protected onHomeKey() {
    this.navigateTo(
      this.allItems.filter((item) => !item.disabled).at(0)!.value
    );
  }

  protected onEndKey() {
    this.navigateTo(
      this.allItems.filter((item) => !item.disabled).at(-1)!.value
    );
  }

  protected onEscapeKey() {
    this._hide();
  }

  protected onEnterKey() {
    this.selectItem(this.activeItem);
  }

  protected handleClick(event: MouseEvent) {
    const item = event
      .composedPath()
      .find(
        (e) => e instanceof IgcDropdownItemComponent
      ) as IgcDropdownItemComponent;

    if (!item || item.disabled) return;

    this.selectItem(item);
  }

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
    const args = { cancelable: true };
    return this.emitEvent('igcOpening', args);
  }

  protected handleClosing(): boolean {
    const args = { cancelable: true };
    return this.emitEvent('igcClosing', args);
  }

  protected handleChange(item: IgcDropdownItemComponent) {
    const args = { detail: item };
    this.emitEvent('igcChange', args);
  }

  protected handleSlotChange() {
    if (!this.target) return;
    this.target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
  }

  protected handleFocusout(event: Event) {
    event.preventDefault();
    (event.target as HTMLElement).focus();
  }

  protected getItem(value: string) {
    let itemIndex = -1;
    let item!: IgcDropdownItemComponent;
    this.allItems.find((i, index) => {
      if (i.value === value) {
        item = i;
        itemIndex = index;
      }
    });
    return { item: item, index: itemIndex };
  }

  protected activateItem(value: IgcDropdownItemComponent) {
    if (!value) return;

    if (this.activeItem) {
      this.activeItem.active = false;
    }

    this.activeItem = value;
    this.activeItem.active = true;
  }

  protected selectItem(
    item: IgcDropdownItemComponent,
    emit = true
  ): IgcDropdownItemComponent | null {
    if (!item) return null;

    if (this.selectedItem) {
      this.selectedItem.selected = false;
    }

    this.activateItem(item);
    this.selectedItem = item;
    this.selectedItem.selected = true;
    if (emit) this.handleChange(this.selectedItem);
    if (emit && !this.keepOpenOnSelect) this._hide();

    return this.selectedItem;
  }

  protected navigate(direction: -1 | 1, currentIndex?: number) {
    let index = -1;
    if (this.activeItem) {
      index = currentIndex
        ? currentIndex
        : [...this.allItems].indexOf(this.activeItem) ?? index;
    }

    const newIndex = this.getNearestSiblingFocusableItemIndex(index, direction);
    this.navigateItem(newIndex);
  }

  private navigateItem(newIndex: number): IgcDropdownItemComponent | null {
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

  private scrollToHiddenItem(newItem: IgcDropdownItemComponent) {
    const elementRect = newItem.getBoundingClientRect();
    const parentRect = this.content.getBoundingClientRect();
    if (parentRect.top > elementRect.top) {
      this.content.scrollTop -= parentRect.top - elementRect.top;
    }

    if (parentRect.bottom < elementRect.bottom) {
      this.content.scrollTop += elementRect.bottom - parentRect.bottom;
    }
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

  protected onArrowDownKeyDown() {
    this.navigateNext();
  }

  protected onArrowUpKeyDown() {
    this.navigatePrev();
  }

  private async _hide(emit = true) {
    if (!this.open) return;
    if (emit && !this.handleClosing()) return;

    this.open = false;

    if (emit) {
      await this.updateComplete;
      this.emitEvent('igcClosed');
    }
  }

  /** Shows the dropdown. */
  @blazorSuppress()
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
        id="igcDDLTarget"
        name="target"
        @click=${this.handleTargetClick}
        @slotchange=${this.handleSlotChange}
      >
      </slot>
      <div
        part="base"
        style=${styleMap({ position: this.positionStrategy })}
        @click=${this.handleClick}
        ${this.toggleController.toggleDirective}
      >
        <div role="listbox" part="list" aria-labelledby="igcDDLTarget">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown': IgcDropdownComponent;
  }
}

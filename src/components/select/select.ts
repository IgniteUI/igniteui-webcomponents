import { html } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import IgcSelectGroupComponent from './select-group.js';
import IgcSelectHeaderComponent from './select-header.js';
import IgcSelectItemComponent from './select-item.js';
import { styles } from './themes/select.base.css.js';
import { styles as shared } from './themes/shared/select.common.css.js';
import { all } from './themes/themes.js';
import { themeSymbol, themes } from '../../theming/theming-decorator.js';
import type { Theme } from '../../theming/types.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  spaceBar,
  tabKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickHandler } from '../common/controllers/root-click.js';
import { addRootScrollHandler } from '../common/controllers/root-scroll.js';
import { alternateName } from '../common/decorators/alternateName.js';
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
  setInitialSelectionState,
} from '../common/mixins/combo-box.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import { partNameMap } from '../common/util.js';
import { Validator, requiredValidator } from '../common/validators.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent, { type IgcPlacement } from '../popover/popover.js';

export interface IgcSelectEventMap {
  igcChange: CustomEvent<IgcSelectItemComponent>;
  igcBlur: CustomEvent<void>;
  igcFocus: CustomEvent<void>;
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/**
 * Represents a control that provides a menu of options.
 *
 * @element igc-select
 *
 * @slot - Renders the list of select items.
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot header - Renders a container before the list of options.
 * @slot footer - Renders a container after the list of options.
 * @slot helper-text - Renders content below the input.
 * @slot toggle-icon - Renders content inside the suffix container.
 * @slot toggle-icon-expanded - Renders content for the toggle icon when the component is in open state.
 *
 * @fires igcFocus - Emitted when the select gains focus.
 * @fires igcBlur - Emitted when the select loses focus.
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcOpening - Emitted just before the list of options is opened.
 * @fires igcOpened - Emitted after the list of options is opened.
 * @fires igcClosing - Emitter just before the list of options is closed.
 * @fires igcClosed - Emitted after the list of options is closed.
 *
 * @csspart list - The list of options wrapper.
 * @csspart input - The encapsulated igc-input.
 * @csspart label - The encapsulated text label.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart toggle-icon - The toggle icon wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
@themes(all, true)
@blazorAdditionalDependencies(
  'IgcIconComponent, IgcInputComponent, IgcPopoverComponent, IgcSelectGroupComponent, IgcSelectHeaderComponent, IgcSelectItemComponent'
)
export default class IgcSelectComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcSelectEventMap,
    Constructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-select';
  public static styles = [styles, shared];

  public static register() {
    registerComponent(
      this,
      IgcIconComponent,
      IgcInputComponent,
      IgcPopoverComponent,
      IgcSelectGroupComponent,
      IgcSelectHeaderComponent,
      IgcSelectItemComponent
    );
  }

  private declare readonly [themeSymbol]: Theme;
  private _value!: string;
  private _searchTerm = '';
  private _lastKeyTime = 0;

  private _rootClickController = addRootClickHandler(this, {
    hideCallback: () => this._hide(true),
  });

  private _rootScrollController = addRootScrollHandler(this, {
    hideCallback: () => this._hide(true),
  });

  private get isMaterialTheme() {
    return this[themeSymbol] === 'material';
  }

  private get _activeItems() {
    return Array.from(
      getActiveItems<IgcSelectItemComponent>(
        this,
        IgcSelectItemComponent.tagName
      )
    );
  }

  @state()
  protected _selectedItem: IgcSelectItemComponent | null = null;

  @state()
  protected _activeItem!: IgcSelectItemComponent;

  protected override validators: Validator<this>[] = [requiredValidator];

  @query(IgcInputComponent.tagName, true)
  protected input!: IgcInputComponent;

  @queryAssignedElements({ slot: 'helper-text' })
  protected helperText!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected inputSuffix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'prefix' })
  protected inputPrefix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'toggle-icon-expanded' })
  protected _expandedIconSlot!: Array<HTMLElement>;

  protected get hasExpandedIcon() {
    return this._expandedIconSlot.length > 0;
  }

  protected get hasPrefixes() {
    return this.inputPrefix.length > 0;
  }

  protected get hasSuffixes() {
    return this.inputSuffix.length > 0;
  }

  protected get hasHelperText() {
    return this.helperText.length > 0;
  }

  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public get value(): string {
    return this._value;
  }

  public set value(value: string) {
    this._updateValue(value);
    const item = this.getItem(this._value);
    item ? this.setSelectedItem(item) : this.clearSelectedItem();
  }

  /**
   * The outlined attribute of the control.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * The autofocus attribute of the control.
   * @attr
   */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /**
   * The distance of the select dropdown from its input.
   * @attr
   */
  @property({ type: Number })
  public distance = 0;

  /**
   * The label attribute of the control.
   * @attr
   */
  @property()
  public label!: string;

  /**
   * The placeholder attribute of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /** The preferred placement of the select dropdown around its input.
   * @type {'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end'}
   * @attr
   */
  @property()
  public placement: IgcPlacement = 'bottom-start';

  /**
   * @deprecated since version 4.3.0
   * @hidden @internal @private
   */
  public positionStrategy: 'absolute' | 'fixed' = 'fixed';

  /**
   * Determines the behavior of the component during scrolling of the parent container.
   * @attr scroll-strategy
   */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: 'scroll' | 'block' | 'close' = 'scroll';

  /**
   * Whether the dropdown's width should be the same as the target's one.
   * @deprecated since version 4.3.0
   * @hidden @internal @private
   * @attr same-width
   */
  @property({ type: Boolean, attribute: 'same-width' })
  public sameWidth = true;

  /**
   * Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.
   * When true, once enough space is detected on its preferred side, it will flip back.
   * @deprecated since version 4.3.0
   * @hidden @internal @private
   * @attr
   */
  @property({ type: Boolean })
  public flip = true;

  /** Returns the items of the igc-select component. */
  public get items() {
    return Array.from(
      getItems<IgcSelectItemComponent>(this, IgcSelectItemComponent.tagName)
    );
  }

  /** Returns the groups of the igc-select component. */
  public get groups() {
    return Array.from(
      getItems<IgcSelectGroupComponent>(this, IgcSelectGroupComponent.tagName)
    );
  }

  /** Returns the selected item from the dropdown or null.  */
  public get selectedItem() {
    return this._selectedItem;
  }

  @watch('scrollStrategy', { waitUntilFirstUpdate: true })
  protected scrollStrategyChanged() {
    this._rootScrollController.update({ resetListeners: true });
  }

  @watch('open', { waitUntilFirstUpdate: true })
  protected openChange() {
    this._rootClickController.update();
    this._rootScrollController.update();
  }

  constructor() {
    super();

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true, triggers: ['keydownRepeat'] },
    })
      .set([altKey, arrowDown], this.altArrowDown)
      .set([altKey, arrowUp], this.altArrowUp)
      .set(arrowDown, this.onArrowDown)
      .set(arrowUp, this.onArrowUp)
      .set(arrowLeft, this.onArrowUp)
      .set(arrowRight, this.onArrowDown)
      .set(tabKey, this.onTabKey, { preventDefault: false })
      .set(escapeKey, this.onEscapeKey)
      .set(homeKey, this.onHomeKey)
      .set(endKey, this.onEndKey)
      .set(spaceBar, this.onSpaceBarKey)
      .set(enterKey, this.onEnterKey);

    this.addEventListener('keydown', this.handleSearch);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('focusout', this.handleFocusOut);
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    const selected = setInitialSelectionState(this.items);

    if (this.value && !selected) {
      this._selectItem(this.getItem(this.value), false);
    }

    if (selected && selected.value !== this.value) {
      this._defaultValue = selected.value;
      this._selectItem(selected, false);
    }

    if (this.autofocus) {
      this.focus();
    }

    this.updateValidity();
  }

  private handleFocusIn({ relatedTarget }: FocusEvent) {
    this._dirty = true;

    if (this.contains(relatedTarget as Node) || this.open) {
      return;
    }

    this.emitEvent('igcFocus');
  }

  private handleFocusOut({ relatedTarget }: FocusEvent) {
    if (this.contains(relatedTarget as Node)) {
      return;
    }

    this.checkValidity();
    this.emitEvent('igcBlur');
  }

  private handleClick(event: MouseEvent) {
    const item = event.target as IgcSelectItemComponent;
    if (this._activeItems.includes(item)) {
      this._selectItem(item);
    }
  }

  private handleChange(item: IgcSelectItemComponent) {
    return this.emitEvent('igcChange', { detail: item });
  }

  private handleSearch(event: KeyboardEvent) {
    if (!/^.$/u.test(event.key)) {
      return;
    }

    event.preventDefault();
    const now = Date.now();

    if (now - this._lastKeyTime > 500) {
      this._searchTerm = '';
    }

    this._lastKeyTime = now;
    this._searchTerm += event.key.toLocaleLowerCase();

    const item = this._activeItems.find(
      (item) =>
        item.textContent
          ?.trim()
          .toLocaleLowerCase()
          .startsWith(this._searchTerm)
    );

    if (item) {
      this.open ? this.activateItem(item) : this._selectItem(item);
    }
  }

  private onEnterKey() {
    this.open && this._activeItem
      ? this._selectItem(this._activeItem)
      : this.handleAnchorClick();
  }

  private onSpaceBarKey() {
    if (!this.open) {
      this.handleAnchorClick();
    }
  }

  private onArrowDown() {
    const item = getNextActiveItem(this.items, this._activeItem);
    this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
  }

  private onArrowUp() {
    const item = getPreviousActiveItem(this.items, this._activeItem);
    this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
  }

  private altArrowDown() {
    if (!this.open) {
      this._show(true);
    }
  }

  private async altArrowUp() {
    if (this.open && (await this._hide(true))) {
      this.input.focus();
    }
  }

  protected async onEscapeKey() {
    if (await this._hide(true)) {
      this.input.focus();
    }
  }

  private onTabKey(event: KeyboardEvent) {
    if (this.open) {
      event.preventDefault();
      this._selectItem(this._activeItem);
      this._hide(true);
    }
  }

  protected onHomeKey() {
    const item = this._activeItems.at(0);
    this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
  }

  protected onEndKey() {
    const item = this._activeItems.at(-1);
    this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
  }

  /** Monitor input slot changes and request update */
  protected inputSlotChanged() {
    this.requestUpdate();
  }

  private activateItem(item: IgcSelectItemComponent) {
    if (this._activeItem) {
      this._activeItem.active = false;
    }

    this._activeItem = item;
    this._activeItem.active = true;
  }

  private setSelectedItem(item: IgcSelectItemComponent) {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }

    this._selectedItem = item;
    this._selectedItem.selected = true;

    return this._selectedItem;
  }

  private _selectItem(item?: IgcSelectItemComponent, emit = true) {
    if (!item) {
      this.clearSelectedItem();
      this._updateValue();
      return null;
    }

    const items = this.items;
    const [previous, current] = [
      items.indexOf(this._selectedItem!),
      items.indexOf(item),
    ];

    if (previous === current) {
      return this._selectedItem;
    }

    const newItem = this.setSelectedItem(item);
    this.activateItem(newItem);
    this._updateValue(newItem.value);

    if (emit) this.handleChange(newItem);
    if (emit && this.open) this.input.focus();
    if (emit && !this.keepOpenOnSelect) this._hide(true);

    return this._selectedItem;
  }

  private _navigateToActiveItem(item?: IgcSelectItemComponent) {
    if (item) {
      this.activateItem(item);
      item.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }

  private _updateValue(value?: string) {
    this._value = value as string;
    this.setFormValue(this._value ? this._value : null);
    this.updateValidity();
    this.setInvalidState();
  }

  private clearSelectedItem() {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }
    this._selectedItem = null;
  }

  protected getItem(value: string) {
    return this.items.find((item) => item.value === value);
  }

  private _stopPropagation(e: Event) {
    e.stopPropagation();
  }

  /** Sets focus on the component. */
  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the component. */
  @alternateName('blurComponent')
  public override blur() {
    this.input.blur();
    super.blur();
  }

  /** Checks the validity of the control and moves the focus to it if it is not valid. */
  public override reportValidity() {
    const valid = super.reportValidity();
    if (!valid) this.input.focus();
    return valid;
  }

  /** Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string): IgcSelectItemComponent | null;
  /** Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public navigateTo(index: number): IgcSelectItemComponent | null;
  /** Navigates to the specified item. If it exists, returns the found item, otherwise - null. */
  @blazorSuppress()
  public navigateTo(value: string | number): IgcSelectItemComponent | null {
    const item =
      typeof value === 'string' ? this.getItem(value) : this.items[value];

    if (item) {
      this._navigateToActiveItem(item);
    }

    return item ?? null;
  }

  /** Selects the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public select(value: string): IgcSelectItemComponent | null;
  /** Selects the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public select(index: number): IgcSelectItemComponent | null;
  /** Selects the specified item. If it exists, returns the found item, otherwise - null. */
  @blazorSuppress()
  public select(value: string | number): IgcSelectItemComponent | null {
    const item =
      typeof value === 'string' ? this.getItem(value) : this.items[value];
    return item ? this._selectItem(item, false) : null;
  }

  /**  Resets the current value and selection of the component. */
  public clearSelection() {
    this._updateValue();
    this.clearSelectedItem();
  }

  protected renderInputSlots() {
    const prefixName = this.hasPrefixes ? 'prefix' : '';
    const suffixName = this.hasSuffixes ? 'suffix' : '';

    return html`
      <span slot=${prefixName}>
        <slot name="prefix" @slotchange=${this.inputSlotChanged}></slot>
      </span>

      <span slot=${suffixName}>
        <slot name="suffix" @slotchange=${this.inputSlotChanged}></slot>
      </span>
    `;
  }

  protected renderToggleIcon() {
    const parts = partNameMap({ 'toggle-icon': true, filled: this.value! });
    const iconHidden = this.open && this.hasExpandedIcon;
    const iconExpandedHidden = !this.hasExpandedIcon || !this.open;

    const openIcon = this.isMaterialTheme
      ? 'keyboard_arrow_up'
      : 'arrow_drop_up';
    const closeIcon = this.isMaterialTheme
      ? 'keyboard_arrow_down'
      : 'arrow_drop_down';

    return html`
      <span slot="suffix" part=${parts} aria-hidden="true">
        <slot
          name="toggle-icon"
          ?hidden=${iconHidden}
          @slotchange=${this.inputSlotChanged}
        >
          <igc-icon
            name=${this.open ? openIcon : closeIcon}
            collection="internal"
          ></igc-icon>
        </slot>
        <slot
          name="toggle-icon-expanded"
          ?hidden=${iconExpandedHidden}
          @slotchange=${this.inputSlotChanged}
        ></slot>
      </span>
    `;
  }

  protected renderHelperText() {
    return html`
      <div
        id="helper-text"
        part="helper-text"
        slot="anchor"
        ?hidden=${!this.hasHelperText}
      >
        <slot name="helper-text" @slotchange=${this.inputSlotChanged}></slot>
      </div>
    `;
  }

  protected renderInputAnchor() {
    const value = this.selectedItem?.textContent?.trim();

    return html`
      <igc-input
        id="input"
        slot="anchor"
        role="combobox"
        readonly
        aria-controls="dropdown"
        aria-describedby="helper-text"
        aria-expanded=${this.open ? 'true' : 'false'}
        exportparts="container: input, input: native-input, label, prefix, suffix"
        tabIndex=${this.disabled ? -1 : 0}
        value=${ifDefined(value)}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        .disabled=${this.disabled}
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        @click=${this.handleAnchorClick}
        @igcFocus=${this._stopPropagation}
        @igcBlur=${this._stopPropagation}
      >
        ${this.renderInputSlots()} ${this.renderToggleIcon()}
      </igc-input>

      ${this.renderHelperText()}
    `;
  }

  protected renderDropdown() {
    return html`<div part="base" .inert=${!this.open}>
      <div
        id="dropdown"
        role="listbox"
        part="list"
        aria-labelledby="input"
        @click=${this.handleClick}
      >
        <slot name="header"></slot>
        <slot></slot>
        <slot name="footer"></slot>
      </div>
    </div>`;
  }

  protected override render() {
    return html`<igc-popover
      ?open=${this.open}
      flip
      shift
      same-width
      strategy="fixed"
      .offset=${this.distance}
      .placement=${this.placement}
      >${this.renderInputAnchor()} ${this.renderDropdown()}
    </igc-popover>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select': IgcSelectComponent;
  }
}

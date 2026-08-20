import { html, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addAriaProjector } from '#internals/controllers/aria-projection.js';
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
} from '#internals/controllers/key-bindings.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import { addRootClickController } from '#internals/controllers/root-click.js';
import { addRootScrollHandler } from '#internals/controllers/root-scroll.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
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
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { FormValueSelectTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { partMap } from '#internals/part-map.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { isElement, normalizedTextContent } from '#internals/utils/dom.js';
import {
  addSafeEventListener,
  focusLeftHost,
  getElementFromPath,
} from '#internals/utils/events.js';
import { isString } from '#internals/utils/types.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent, {
  type PopoverPlacement,
} from '../popover/popover.js';
import type { PopoverScrollStrategy } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import IgcSelectGroupComponent from './select-group.js';
import IgcSelectHeaderComponent from './select-header.js';
import IgcSelectItemComponent from './select-item.js';
import { styles } from './themes/select.base.css.js';
import { styles as shared } from './themes/shared/select.common.css.js';
import { all } from './themes/themes.js';
import { selectValidators } from './validators.js';

export interface IgcSelectComponentEventMap {
  igcChange: CustomEvent<IgcSelectItemComponent>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

const Slots = setSlots(
  'prefix',
  'suffix',
  'header',
  'footer',
  'helper-text',
  'toggle-icon',
  'toggle-icon-expanded',
  'value-missing',
  'custom-error',
  'invalid'
);

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
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcOpening - Emitted just before the list of options is opened.
 * @fires igcOpened - Emitted after the list of options is opened.
 * @fires igcClosing - Emitter just before the list of options is closed.
 * @fires igcClosed - Emitted after the list of options is closed.
 *
 * @csspart list - The list wrapping container for the items of the select.
 * @csspart input - The encapsulated input of the select.
 * @csspart label - The encapsulated text label of the select.
 * @csspart prefix - The prefix wrapper of the input of the select.
 * @csspart suffix - The suffix wrapper of the input of the select.
 * @csspart toggle-icon - The toggle icon wrapper of the select.
 * @csspart helper-text - The helper text wrapper of the select.
 */
@blazorAdditionalDependencies(
  'IgcIconComponent, IgcInputComponent, IgcSelectGroupComponent, IgcSelectHeaderComponent, IgcSelectItemComponent'
)
@shadowOptions({ delegatesFocus: true })
export default class IgcSelectComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcSelectComponentEventMap,
    AbstractConstructor<IgcComboBoxBaseLikeComponent>
  >(IgcComboBoxBaseLikeComponent)
) {
  public static readonly tagName = 'igc-select';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcSelectComponent,
      IgcIconComponent,
      IgcInputComponent,
      IgcPopoverComponent,
      IgcSelectGroupComponent,
      IgcSelectHeaderComponent,
      IgcSelectItemComponent
    );
  }

  //#region Internal state

  protected override get __validators() {
    return selectValidators;
  }

  private _searchTerm = '';
  private _lastKeyTime = 0;

  private readonly _slots = addSlotController(this, { slots: Slots });

  private readonly _rootScrollController = addRootScrollHandler(this, {
    hideCallback: this._handleClosing,
  });

  protected override readonly _rootClickController = addRootClickController(
    this,
    {
      onHide: this._handleClosing,
    }
  );

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: undefined,
    transformers: FormValueSelectTransformers,
  });

  @state()
  protected _selectedItem: IgcSelectItemComponent | null = null;

  /**
   * The item keyboard navigation moves from. Mirrors {@link _selectedItem}
   * unless the open list has been navigated without committing a selection.
   * Only {@link _activateItem} may assign it.
   */
  @state()
  protected _activeItem: IgcSelectItemComponent | null = null;

  @query(IgcInputComponent.tagName, true)
  protected _input!: IgcInputComponent;

  @query('#dropdown')
  protected _list!: HTMLDivElement | null;

  @query('#select-helper-text')
  protected _helperText!: IgcValidationContainerComponent | null;

  protected get _activeItems(): IgcSelectItemComponent[] {
    return Array.from(
      getActiveItems<IgcSelectItemComponent>(
        this,
        IgcSelectItemComponent.tagName
      )
    );
  }

  //#endregion

  //#region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail.value", false) */
  /**
   * The value of the control.
   * @attr
   */
  @property()
  public set value(value: string | undefined) {
    this._updateValue(value);
    const item = this._getItem(this._formValue.value!);
    item ? this._setSelectedItem(item) : this._clearSelectedItem();
  }

  public get value(): string | undefined {
    return this._formValue.value;
  }

  /**
   * Whether the control has an outlined appearance.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * Whether the control should receive focus automatically.
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
   * The label of the control.
   * @attr
   */
  @property()
  public label!: string;

  /**
   * The placeholder text of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /** The preferred placement of the select dropdown around its input.
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

  /** Returns the items of the select component. */
  public get items(): IgcSelectItemComponent[] {
    return Array.from(
      getItems<IgcSelectItemComponent>(this, IgcSelectItemComponent.tagName)
    );
  }

  /** Returns the groups of the select component. */
  public get groups(): IgcSelectGroupComponent[] {
    return Array.from(
      getItems<IgcSelectGroupComponent>(this, IgcSelectGroupComponent.tagName)
    );
  }

  /** Returns the selected item from the dropdown or null.  */
  public get selectedItem(): IgcSelectItemComponent | null {
    return this._selectedItem;
  }

  //#endregion

  //#region Life-cycle hooks

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (!this.hasUpdated) {
      return;
    }

    if (changedProperties.has('scrollStrategy')) {
      this._rootScrollController.update({ resetListeners: true });
    }

    if (changedProperties.has('open')) {
      this._rootClickController.update();
      this._rootScrollController.update();
    }
  }

  constructor() {
    super();

    addThemingController(this, all);

    // Projects the host's labels and combobox semantics onto the native
    // input inside `igc-input` (see ProjectedARIA for why the host cannot
    // publish these itself).
    addAriaProjector(this, {
      target: () => this._input,
      state: () => ({
        role: 'combobox',
        hasPopup: 'listbox',
        expanded: `${this.open}`,
        controls: this._list ? [this._list] : null,
        describedBy: this._helperText ? [this._helperText] : null,
        labelledBy: this._internals.labels,
      }),
    });

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true, repeat: true },
    })
      .set([altKey, arrowDown], this._handleAltArrowDown)
      .set([altKey, arrowUp], this._handleAltArrowUp)
      .set(arrowDown, this._handleArrowDown)
      .set(arrowUp, this._handleArrowUp)
      .set(arrowLeft, this._handleArrowUp)
      .set(arrowRight, this._handleArrowDown)
      .set(tabKey, this._handleTab, { preventDefault: false })
      .set(escapeKey, this._handleEscape)
      .set(homeKey, this._handleHome)
      .set(endKey, this._handleEnd)
      .set(spaceBar, this._handleSpace)
      .set(enterKey, this._handleEnter);

    createMutationController(this, {
      callback: this._handleItemsChange,
      filter: [IgcSelectItemComponent.tagName],
      config: { childList: true, subtree: true },
    });

    addSafeEventListener(this, 'keydown', this._handleSearch);
    addSafeEventListener(this, 'focusin', this._handleFocusIn);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);
  }

  /**
   * Re-resolves the selection whenever items enter or leave the light DOM.
   * Consuming frameworks routinely render them after the initial paint, so
   * `value` may name an item that does not exist yet, and a selected item may
   * be taken out from under us.
   */
  private _handleItemsChange({
    changes: { added, removed },
  }: MutationControllerParams<IgcSelectItemComponent>): void {
    if (!this.hasUpdated || (isEmpty(added) && isEmpty(removed))) {
      return;
    }

    const match = this.value ? this._getItem(this.value) : undefined;

    if (match) {
      if (match !== this._selectedItem) {
        this._setSelectedItem(match);
      }
      return;
    }

    // Nothing resolves the value anymore - drop the stale element references
    // but hold on to the value itself.
    const items = this.items;

    if (this._selectedItem && !items.includes(this._selectedItem)) {
      this._clearSelectedItem();
    } else if (this._activeItem && !items.includes(this._activeItem)) {
      this._activateItem(this._selectedItem);
    }
  }

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;
    const selected = setInitialSelectionState(this.items);

    if (selected) {
      // A `selected` item wins over an initial `value` and becomes what the
      // component resets to. The default must be assigned while still pristine.
      if (selected.value !== this.value) {
        this.defaultValue = selected.value;
      }

      this._selectItem(selected, false);
    } else if (this.value) {
      const item = this._getItem(this.value);

      // An unmatched value is kept, not discarded - its item may still arrive.
      if (item) {
        this._selectItem(item, false);
      }
    }

    if (this.autofocus) {
      this.focus();
    }

    this._validate();
  }

  //#endregion

  //#region Keyboard event handlers

  private _handleSearch(event: KeyboardEvent): void {
    // A printable key held with a modifier is a shortcut, not type-ahead.
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

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

    const item = this._activeItems.find((item) =>
      item.textContent?.trim().toLocaleLowerCase().startsWith(this._searchTerm)
    );

    this._navigateTo(item);
  }

  private _handleEnter(): void {
    this.open && this._activeItem
      ? this._selectItem(this._activeItem)
      : this._handleAnchorClick();
  }

  private _handleSpace(): void {
    if (!this.open) {
      this._handleAnchorClick();
    }
  }

  private _handleArrowDown(): void {
    this._navigateTo(getNextActiveItem(this.items, this._activeItem));
  }

  private _handleArrowUp(): void {
    this._navigateTo(getPreviousActiveItem(this.items, this._activeItem));
  }

  /**
   * Moves to `item`, committing the move as a selection while closed.
   * Nowhere to move to is a no-op - clearing the selection is reserved for the
   * callers that actually mean it.
   */
  private _navigateTo(item?: IgcSelectItemComponent): void {
    if (item) {
      this.open ? this._navigateToActiveItem(item) : this._selectItem(item);
    }
  }

  private _handleAltArrowDown(): void {
    if (!this.open) {
      this._show(true);
      this._focusItemOnOpen();
    }
  }

  private async _handleAltArrowUp(): Promise<void> {
    if (this.open && (await this._hide(true))) {
      this._input.focus();
    }
  }

  private async _handleEscape(): Promise<void> {
    if (await this._hide(true)) {
      this._input.focus();
    }
  }

  private _handleTab(event: KeyboardEvent): void {
    if (this.open) {
      event.preventDefault();
      this._selectItem(this._activeItem ?? this._selectedItem);
      this._hide(true);
    }
  }

  private _handleHome(): void {
    this._navigateTo(this._activeItems.at(0));
  }

  private _handleEnd(): void {
    this._navigateTo(this._activeItems.at(-1));
  }

  //#endregion

  //#region Event listeners

  private _handleFocusIn(): void {
    this._setTouchedState();
  }

  private _handleFocusOut(event: FocusEvent): void {
    if (focusLeftHost(this, event)) {
      super._handleBlur();
    }
  }

  private _handleClick(event: PointerEvent): void {
    const item = getElementFromPath(IgcSelectItemComponent.tagName, event);
    if (item && this._activeItems.includes(item)) {
      this._selectItem(item);
    }
  }

  private _handleChange(item: IgcSelectItemComponent): boolean {
    this._setTouchedState();
    return this.emitEvent('igcChange', { detail: item });
  }

  private _handleClosing(): void {
    this._hide(true);
  }

  protected override _handleAnchorClick(): void {
    super._handleAnchorClick();
    this._focusItemOnOpen();
  }

  //#endregion

  //#region Internal API

  private _activateItem(item: IgcSelectItemComponent | null): void {
    if (this._activeItem && this._activeItem !== item) {
      this._activeItem.active = false;
    }

    this._activeItem = item;

    if (item) {
      item.active = true;
    }
  }

  private _setSelectedItem(
    item: IgcSelectItemComponent
  ): IgcSelectItemComponent {
    if (this._selectedItem && this._selectedItem !== item) {
      this._selectedItem.selected = false;
    }

    this._selectedItem = item;
    item.selected = true;
    this._activateItem(item);

    return item;
  }

  private _selectItem(
    item?: IgcSelectItemComponent | null,
    emit = true
  ): IgcSelectItemComponent | null {
    if (!item) {
      this._clearSelectedItem();
      this._updateValue();
      return null;
    }

    const shouldFocus = emit && this.open;
    const shouldHide = emit && !this.keepOpenOnSelect;
    // Re-selecting the current item is not a change, but it is still a commit:
    // the list closes and focus returns just the same.
    const changed = this._selectedItem !== item;

    if (changed) {
      this._setSelectedItem(item);
      this._updateValue(item.value);
      if (emit) this._handleChange(item);
    } else {
      this._activateItem(item);
    }

    if (shouldFocus) this._input.focus();
    if (shouldHide) this._hide(true);

    return this._selectedItem;
  }

  /** Highlights `item` and, while the list is open, brings it into view. */
  private _navigateToActiveItem(item?: IgcSelectItemComponent | null): void {
    if (!item) {
      return;
    }

    this._activateItem(item);

    // Closed, the list is inert: focusing and scrolling it is pointless.
    if (this.open) {
      item.focus({ preventScroll: true });
      item.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }

  private _updateValue(value?: string): void {
    this._formValue.setValueAndFormState(value!);
  }

  private _clearSelectedItem(): void {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }
    this._selectedItem = null;
    this._activateItem(null);
  }

  private async _focusItemOnOpen(): Promise<void> {
    await this.updateComplete;

    // Opening restarts navigation from the selection, so that the highlighted
    // item and the one navigation continues from are always the same.
    if (this.open) {
      this._navigateToActiveItem(this._selectedItem ?? this._activeItem);
    }
  }

  private _getItem(value: string): IgcSelectItemComponent | undefined {
    return this.items.find((item) => item.value === value);
  }

  /**
   * The text shown in the input for the current selection: the selected item's
   * main content, without what it routes to its `prefix`/`suffix` slots and
   * without the marker comments templating engines leave among its children.
   */
  private get _displayValue(): string | undefined {
    if (!this._selectedItem) {
      return undefined;
    }

    return normalizedTextContent(
      Array.from(this._selectedItem.childNodes).filter((node) =>
        isElement(node)
          ? !node.hasAttribute('slot')
          : node.nodeType === Node.TEXT_NODE
      )
    );
  }

  //#endregion

  //#region Public API

  /* alternateName: focusComponent */
  /** Sets focus on the component. */
  public override focus(options?: FocusOptions): void {
    this._input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the component. */
  public override blur(): void {
    this._input.blur();
  }

  /** Checks the validity of the control and moves the focus to it if it is not valid. */
  public override reportValidity(): boolean {
    const valid = super.reportValidity();
    if (!valid) this._input.focus();
    return valid;
  }

  /* blazorSuppress */
  /** Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string): IgcSelectItemComponent | null;
  /* blazorSuppress */
  /** Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public navigateTo(index: number): IgcSelectItemComponent | null;
  /* blazorSuppress */
  /** Navigates to the specified item. If it exists, returns the found item, otherwise - null. */
  public navigateTo(value: string | number): IgcSelectItemComponent | null {
    const item = isString(value) ? this._getItem(value) : this.items[value];

    if (item) {
      this._navigateToActiveItem(item);
    }

    return item ?? null;
  }

  /* blazorSuppress */
  /** Selects the item with the specified value. If it exists, returns the found item, otherwise - null. */
  public select(value: string): IgcSelectItemComponent | null;
  /* blazorSuppress */
  /** Selects the item at the specified index. If it exists, returns the found item, otherwise - null. */
  public select(index: number): IgcSelectItemComponent | null;
  /* blazorSuppress */
  /** Selects the specified item. If it exists, returns the found item, otherwise - null. */
  public select(value: string | number): IgcSelectItemComponent | null {
    const item = isString(value) ? this._getItem(value) : this.items[value];
    return item ? this._selectItem(item, false) : null;
  }

  /**  Resets the current value and selection of the component. */
  public clearSelection(): void {
    this._updateValue();
    this._clearSelectedItem();
  }

  //#endregion

  protected _renderInputSlots() {
    const prefix = this._slots.hasAssignedElements('prefix') ? 'prefix' : '';
    const suffix = this._slots.hasAssignedElements('suffix') ? 'suffix' : '';

    return html`
      <span slot=${prefix}>
        <slot name="prefix"></slot>
      </span>

      <span slot=${suffix}>
        <slot name="suffix"></slot>
      </span>
    `;
  }

  protected _renderToggleIcon() {
    const parts = { 'toggle-icon': true, filled: !!this.value };
    const iconName = this.open ? 'input_collapse' : 'input_expand';
    const iconHidden =
      this.open && this._slots.hasAssignedElements('toggle-icon-expanded');

    return html`
      <span slot="suffix" part=${partMap(parts)} aria-hidden="true">
        <slot name="toggle-icon" ?hidden=${iconHidden}>
          <igc-icon name=${iconName} collection="default"></igc-icon>
        </slot>
        <slot name="toggle-icon-expanded" ?hidden=${!iconHidden}></slot>
      </span>
    `;
  }

  protected _renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this, {
      id: 'select-helper-text',
      slot: 'anchor',
      hasHelperText: true,
    });
  }

  protected _renderInputAnchor() {
    return html`
      <igc-input
        id="input"
        slot="anchor"
        readonly
        exportparts="container: input, input: native-input, label, prefix, suffix"
        value=${ifDefined(this._displayValue)}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        .disabled=${this.disabled}
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        @click=${this._handleAnchorClick}
      >
        ${this._renderInputSlots()} ${this._renderToggleIcon()}
      </igc-input>

      ${this._renderHelperText()}
    `;
  }

  protected _renderDropdown() {
    return html`
      <div part="base" .inert=${!this.open}>
        <div
          id="dropdown"
          role="listbox"
          part="list"
          aria-labelledby="input"
          @click=${this._handleClick}
        >
          <slot name="header"></slot>
          <slot></slot>
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  protected override render() {
    return html`
      <igc-popover
        ?open=${this.open}
        flip
        shift
        same-width
        .offset=${this.distance}
        .placement=${this.placement}
      >
        ${this._renderInputAnchor()} ${this._renderDropdown()}
      </igc-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select': IgcSelectComponent;
  }
}

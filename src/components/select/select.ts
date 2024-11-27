import { type TemplateResult, html } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { themes } from '../../theming/theming-decorator.js';
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
import { addRootScrollHandler } from '../common/controllers/root-scroll.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
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
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  type FormValue,
  createFormValueState,
} from '../common/mixins/forms/form-value.js';
import {
  findElementFromEventPath,
  isEmpty,
  isString,
  partNameMap,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent, { type IgcPlacement } from '../popover/popover.js';
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
 * @csspart list - The list wrapping container for the items of the igc-select.
 * @csspart input - The encapsulated igc-input of the igc-select.
 * @csspart label - The encapsulated text label of the igc-select.
 * @csspart prefix - The prefix wrapper of the input of the igc-select.
 * @csspart suffix - The suffix wrapper of the input of the igc-select.
 * @csspart toggle-icon - The toggle icon wrapper of the igc-select.
 * @csspart helper-text - The helper text wrapper of the igc-select.
 */
@themes(all)
@blazorAdditionalDependencies(
  'IgcIconComponent, IgcInputComponent, IgcSelectGroupComponent, IgcSelectHeaderComponent, IgcSelectItemComponent'
)
export default class IgcSelectComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcSelectComponentEventMap,
    AbstractConstructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-select';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
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

  protected override _formValue: FormValue<string | undefined>;

  private _searchTerm = '';
  private _lastKeyTime = 0;

  private _rootScrollController = addRootScrollHandler(this, {
    hideCallback: this.handleClosing,
  });

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

  protected override get __validators() {
    return selectValidators;
  }

  @query(IgcInputComponent.tagName, true)
  protected _input!: IgcInputComponent;

  @queryAssignedElements({ slot: 'suffix' })
  protected _inputSuffix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'prefix' })
  protected _inputPrefix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'toggle-icon-expanded' })
  protected _expandedIconSlot!: Array<HTMLElement>;

  /* @tsTwoWayProperty(true, "igcChange", "detail.value", false) */
  /**
   * The value attribute of the control.
   * @attr
   */
  @property()
  public set value(value: string | undefined) {
    this._updateValue(value);
    const item = this.getItem(this._formValue.value!);
    item ? this.setSelectedItem(item) : this.clearSelectedItem();
  }

  public get value(): string | undefined {
    return this._formValue.value;
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
   * Determines the behavior of the component during scrolling of the parent container.
   * @attr scroll-strategy
   */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: 'scroll' | 'block' | 'close' = 'scroll';

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

    this._formValue = createFormValueState<string | undefined>(this, {
      initialValue: undefined,
      transformers: {
        setValue: (value) => value || undefined,
        setDefaultValue: (value) => value || undefined,
      },
    });

    this._rootClickController.update({ hideCallback: this.handleClosing });

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

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    const selected = setInitialSelectionState(this.items);

    if (this.value && !selected) {
      this._selectItem(this.getItem(this.value), false);
    }

    if (selected && selected.value !== this.value) {
      this.defaultValue = selected.value;
      this._selectItem(selected, false);
    }

    if (this.autofocus) {
      this.focus();
    }

    this._updateValidity();
  }

  private handleFocusIn({ relatedTarget }: FocusEvent) {
    this._dirty = true;

    if (this.contains(relatedTarget as Node) || this.open) {
      return;
    }
  }

  private handleFocusOut({ relatedTarget }: FocusEvent) {
    if (this.contains(relatedTarget as Node)) {
      return;
    }

    this.checkValidity();
  }

  private handleClick(event: MouseEvent) {
    const item = findElementFromEventPath<IgcSelectItemComponent>(
      IgcSelectItemComponent.tagName,
      event
    );
    if (item && this._activeItems.includes(item)) {
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

    const item = this._activeItems.find((item) =>
      item.textContent?.trim().toLocaleLowerCase().startsWith(this._searchTerm)
    );

    if (item) {
      this.open ? this.activateItem(item) : this._selectItem(item);
      this._activeItem.focus();
    }
  }

  protected override handleAnchorClick(): void {
    super.handleAnchorClick();
    this.focusItemOnOpen();
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
      this.focusItemOnOpen();
    }
  }

  private async altArrowUp() {
    if (this.open && (await this._hide(true))) {
      this._input.focus();
    }
  }

  protected async onEscapeKey() {
    if (await this._hide(true)) {
      this._input.focus();
    }
  }

  private onTabKey(event: KeyboardEvent) {
    if (this.open) {
      event.preventDefault();
      this._selectItem(this._activeItem ?? this._selectedItem);
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

  protected handleClosing() {
    this._hide(true);
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

    const shouldFocus = emit && this.open;
    const shouldHide = emit && !this.keepOpenOnSelect;

    if (this._selectedItem === item) {
      if (shouldFocus) this._input.focus();
      return this._selectedItem;
    }

    const newItem = this.setSelectedItem(item);
    this.activateItem(newItem);
    this._updateValue(newItem.value);

    if (emit) this.handleChange(newItem);
    if (shouldFocus) this._input.focus();
    if (shouldHide) this._hide(true);

    return this._selectedItem;
  }

  private _navigateToActiveItem(item?: IgcSelectItemComponent) {
    if (item) {
      this.activateItem(item);
      this._activeItem.focus({ preventScroll: true });
      item.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }

  private _updateValue(value?: string) {
    this._formValue.setValueAndFormState(value!);
    this._validate();
  }

  private clearSelectedItem() {
    if (this._selectedItem) {
      this._selectedItem.selected = false;
    }
    this._selectedItem = null;
  }

  private async focusItemOnOpen() {
    await this.updateComplete;
    (this._selectedItem || this._activeItem)?.focus();
  }

  protected getItem(value: string) {
    return this.items.find((item) => item.value === value);
  }

  /* alternateName: focusComponent */
  /** Sets focus on the component. */
  public override focus(options?: FocusOptions) {
    this._input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the component. */
  public override blur() {
    this._input.blur();
  }

  /** Checks the validity of the control and moves the focus to it if it is not valid. */
  public override reportValidity() {
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
    const item = isString(value) ? this.getItem(value) : this.items[value];

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
    const item = isString(value) ? this.getItem(value) : this.items[value];
    return item ? this._selectItem(item, false) : null;
  }

  /**  Resets the current value and selection of the component. */
  public clearSelection() {
    this._updateValue();
    this.clearSelectedItem();
  }

  protected renderInputSlots() {
    const prefixName = isEmpty(this._inputPrefix) ? '' : 'prefix';
    const suffixName = isEmpty(this._inputSuffix) ? '' : 'suffix';

    return html`
      <span slot=${prefixName}>
        <slot name="prefix"></slot>
      </span>

      <span slot=${suffixName}>
        <slot name="suffix"></slot>
      </span>
    `;
  }

  protected renderToggleIcon() {
    const parts = partNameMap({ 'toggle-icon': true, filled: this.value! });
    const iconHidden = this.open && !isEmpty(this._expandedIconSlot);
    const iconExpandedHidden = !iconHidden;

    return html`
      <span slot="suffix" part=${parts} aria-hidden="true">
        <slot name="toggle-icon" ?hidden=${iconHidden}>
          <igc-icon
            name=${this.open ? 'input_collapse' : 'input_expand'}
            collection="default"
          ></igc-icon>
        </slot>
        <slot name="toggle-icon-expanded" ?hidden=${iconExpandedHidden}></slot>
      </span>
    `;
  }

  protected renderHelperText(): TemplateResult {
    return IgcValidationContainerComponent.create(this, {
      id: 'select-helper-text',
      slot: 'anchor',
      hasHelperText: true,
    });
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
        aria-describedby="select-helper-text"
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

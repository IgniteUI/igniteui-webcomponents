import { html } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { styleMap } from 'lit/directives/style-map.js';

import IgcSelectGroupComponent from './select-group.js';
import IgcSelectHeaderComponent from './select-header.js';
import IgcSelectItemComponent from './select-item.js';
import { styles } from './themes/select.base.css.js';
import { all } from './themes/themes.js';
import { themeSymbol, themes } from '../../theming/theming-decorator.js';
import type { Theme } from '../../theming/types.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import { partNameMap } from '../common/util.js';
import { Validator, requiredValidator } from '../common/validators.js';
import IgcDropdownItemComponent from '../dropdown/dropdown-item.js';
import IgcDropdownComponent, {
  IgcDropdownEventMap,
} from '../dropdown/dropdown.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';

export interface IgcSelectEventMap extends IgcDropdownEventMap {
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

@themes(all, true)
@blazorAdditionalDependencies(
  'IgcIconComponent, IgcInputComponent, IgcSelectGroupComponent, IgcSelectHeaderComponent, IgcSelectItemComponent'
)
/**
 * @element igc-select
 *
 * @slot - Renders the list of select items.
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot header - Renders a container before the list of options.
 * @slot footer - Renders a container after the list of options.
 * @slot helper-text - Renders content below the input.
 * @slot toggle-icon - Renders content inside the suffix container.
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
export default class IgcSelectComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcSelectEventMap, Constructor<IgcDropdownComponent>>(
    IgcDropdownComponent
  )
) {
  public static readonly tagName = 'igc-select';
  public static styles = styles;

  public static register() {
    registerComponent(
      this,
      IgcIconComponent,
      IgcInputComponent,
      IgcSelectGroupComponent,
      IgcSelectHeaderComponent,
      IgcSelectItemComponent
    );
  }

  private searchTerm = '';
  private lastKeyTime = Date.now();

  protected override validators: Validator<this>[] = [requiredValidator];
  private declare readonly [themeSymbol]: Theme;

  private readonly targetKeyHandlers: Map<string, Function> = new Map(
    Object.entries({
      ' ': this.onTargetEnterKey,
      Tab: this.onTargetTabKey,
      Escape: this.onEscapeKey,
      Enter: this.onTargetEnterKey,
      ArrowLeft: this.onTargetArrowLeftKeyDown,
      ArrowRight: this.onTargetArrowRightKeyDown,
      ArrowUp: this.onTargetArrowUpKeyDown,
      ArrowDown: this.onTargetArrowDownKeyDown,
      Home: this.onTargetHomeKey,
      End: this.onTargetEndKey,
    })
  );

  @queryAssignedElements({ flatten: true, selector: 'igc-select-item' })
  protected override items!: Array<IgcSelectItemComponent>;

  @queryAssignedElements({ flatten: true, selector: 'igc-select-group' })
  protected override groups!: Array<IgcSelectGroupComponent>;

  @queryAssignedElements({ slot: 'helper-text' })
  protected helperText!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected inputSuffix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'prefix' })
  protected inputPrefix!: Array<HTMLElement>;

  @state()
  protected override selectedItem!: IgcSelectItemComponent | null;

  @query('div[role="combobox"]')
  protected override target!: IgcInputComponent;

  /**
   * The value attribute of the control.
   * @attr
   */
  @property({ reflect: false })
  public value?: string;

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

  /**
   * @deprecated since version 4.3.0
   * @hidden @internal @private
   */
  public override positionStrategy: 'absolute' | 'fixed' = 'fixed';

  /**
   * Whether the dropdown's width should be the same as the target's one.
   * @deprecated since version 4.3.0
   * @hidden @internal @private
   * @attr same-width
   */
  @property({ type: Boolean, attribute: 'same-width' })
  public override sameWidth = true;

  /**
   * Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.
   * When true, once enough space is detected on its preferred side, it will flip back.
   * @deprecated since version 4.3.0
   * @hidden @internal @private
   * @attr
   */
  @property({ type: Boolean })
  public override flip = true;

  constructor() {
    super();
    this.size = 'medium';

    /** Return the focus to the target element when closing the list of options. */
    this.addEventListener('igcChange', () => {
      if (this.open) this.target.focus();
    });
  }

  /** Override the dropdown target focusout behavior to prevent the focus from
   * being returned to the target element when the select loses focus. */
  protected override handleFocusout() {}

  /** Monitor input slot changes and request update */
  protected inputSlotChanged() {
    this.requestUpdate();
  }

  /** Sets focus on the component. */
  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.target.focus(options);
  }

  /** Removes focus from the component. */
  @alternateName('blurComponent')
  public override blur() {
    this.target.blur();
    super.blur();
  }

  /** Checks the validity of the control and moves the focus to it if it is not valid. */
  public override reportValidity() {
    const valid = super.reportValidity();
    if (!valid) this.target.focus();
    return valid;
  }

  protected override async firstUpdated() {
    super.firstUpdated();
    await this.updateComplete;

    if (!this.selectedItem && this.value) {
      this.updateSelected();
    } else if (this.selectedItem && !this.value) {
      this._defaultValue = this.selectedItem.value;
    }

    if (this.autofocus) {
      this.target.focus();
    }

    this.updateValidity();
  }

  @watch('selectedItem')
  protected updateValue() {
    this.value = this.selectedItem?.value;
  }

  @watch('value')
  protected updateSelected() {
    if (this.allItems.length === 0) {
      this.setFormValue(null);
      this.updateValidity();
      this.setInvalidState();
      return;
    }

    if (this.selectedItem?.value !== this.value) {
      const matches = this.allItems.filter((i) => i.value === this.value);
      const index = this.allItems.indexOf(
        matches.at(-1) as IgcSelectItemComponent
      );

      if (index === -1) {
        this.value = undefined;
        this.clearSelection();
        this.setFormValue(null);
        this.updateValidity();
        this.setInvalidState();
        return;
      }

      this.select(index);
    }
    this.setFormValue(this.value!);
    this.updateValidity();
    this.setInvalidState();
  }

  protected selectNext() {
    const activeItemIndex = [...this.allItems].indexOf(
      this.selectedItem ?? this.activeItem
    );

    const next = this.getNearestSiblingFocusableItemIndex(
      activeItemIndex ?? -1,
      1
    );
    this.selectItem(this.allItems[next], true);
  }

  protected selectPrev() {
    const activeItemIndex = [...this.allItems].indexOf(
      this.selectedItem ?? this.activeItem
    );
    const prev = this.getNearestSiblingFocusableItemIndex(
      activeItemIndex ?? -1,
      -1
    );
    this.selectItem(this.allItems[prev], true);
  }

  protected selectInteractiveItem(index: number) {
    const item = this.allItems
      .filter((i) => !i.disabled)
      .at(index) as IgcDropdownItemComponent;

    if (item.value !== this.value) {
      this.selectItem(item, true);
    }
  }

  protected searchItem(event: KeyboardEvent): void {
    // ignore longer keys ('Alt', 'ArrowDown', etc)
    if (!/^.$/u.test(event.key)) {
      return;
    }

    const currentTime = Date.now();

    if (currentTime - this.lastKeyTime > 500) {
      this.searchTerm = '';
    }

    this.searchTerm += event.key;
    this.lastKeyTime = currentTime;

    const item = this.allItems
      .filter((i) => !i.disabled)
      .find(
        (i) =>
          i.textContent
            ?.trim()
            .toLowerCase()
            .startsWith(this.searchTerm.toLowerCase())
      );

    if (item && this.value !== item.value) {
      this.open ? this.activateItem(item) : this.selectItem(item);
    }
  }

  protected handleFocus() {
    this._dirty = true;
    if (this.open) return;
    this.emitEvent('igcFocus');
  }

  protected handleBlur() {
    this.setInvalidState();
    if (this.open) return;
    this.emitEvent('igcBlur');
  }

  protected onTargetTabKey() {
    this.target.blur();
    if (this.open) this.hide();
  }

  protected onTargetEnterKey() {
    !this.open ? this.target.click() : this.onEnterKey();
  }

  protected onTargetArrowLeftKeyDown() {
    !this.open ? this.selectPrev() : this.onArrowUpKeyDown();
  }

  protected onTargetArrowRightKeyDown() {
    !this.open ? this.selectNext() : this.onArrowDownKeyDown();
  }

  protected onTargetArrowUpKeyDown(event: KeyboardEvent) {
    if (event.altKey) {
      this.toggle();
    } else {
      !this.open ? this.selectPrev() : this.onArrowUpKeyDown();
    }
  }

  protected onTargetArrowDownKeyDown(event: KeyboardEvent) {
    if (event.altKey) {
      this.toggle();
    } else {
      !this.open ? this.selectNext() : this.onArrowDownKeyDown();
    }
  }

  protected onTargetHomeKey() {
    !this.open ? this.selectInteractiveItem(0) : this.onHomeKey();
  }

  protected onTargetEndKey() {
    !this.open ? this.selectInteractiveItem(-1) : this.onEndKey();
  }

  protected handleTargetKeyDown(event: KeyboardEvent) {
    event.stopPropagation();

    if (this.targetKeyHandlers.has(event.key)) {
      event.preventDefault();
      this.targetKeyHandlers.get(event.key)?.call(this, event);
    } else {
      this.searchItem(event);
    }
  }

  protected get hasPrefixes() {
    return this.inputPrefix.length > 0;
  }

  protected get hasSuffixes() {
    return this.inputSuffix.length > 0;
  }

  protected override render() {
    const openIcon =
      this[themeSymbol] === 'material' ? 'keyboard_arrow_up' : 'arrow_drop_up';
    const closeIcon =
      this[themeSymbol] === 'material'
        ? 'keyboard_arrow_down'
        : 'arrow_drop_down';

    return html`
      <div
        role="combobox"
        tabindex=${this.disabled ? -1 : 0}
        aria-controls="dropdown"
        aria-describedby="helper-text"
        aria-disabled=${this.disabled}
        @focusin=${this.handleFocus}
        @focusout=${this.handleBlur}
        @keydown=${this.handleTargetKeyDown}
        @click=${this.handleTargetClick}
      >
        <igc-input
          id="input"
          readonly
          exportparts="container: input, input: native-input, label, prefix, suffix"
          value=${ifDefined(this.selectedItem?.textContent?.trim())}
          placeholder=${ifDefined(this.placeholder)}
          label=${ifDefined(this.label)}
          size=${this.size}
          tabindex="-1"
          .disabled=${this.disabled}
          .required=${this.required}
          .invalid=${live(this.invalid)}
          .outlined=${this.outlined}
          @igcBlur=${(e: Event) => e.stopPropagation()}
          @igcFocus=${(e: Event) => e.stopPropagation()}
        >
          <span slot=${this.hasPrefixes ? 'prefix' : ''}>
            <slot name="prefix" @slotchange=${this.inputSlotChanged}></slot>
          </span>
          <span slot=${this.hasSuffixes ? 'suffix' : ''}>
            <slot name="suffix" @slotchange=${this.inputSlotChanged}></slot>
          </span>
          <span
            slot="suffix"
            part="${partNameMap({
              'toggle-icon': true,
              filled: this.value!,
            })}"
          >
            <slot name="toggle-icon">
              <igc-icon
                size=${this.size}
                name=${this.open ? openIcon : closeIcon}
                collection="internal"
                aria-hidden="true"
              ></igc-icon>
            </slot>
          </span>
        </igc-input>
      </div>
      <div
        id="helper-text"
        part="helper-text"
        ?hidden="${this.helperText.length === 0}"
      >
        <slot name="helper-text" @slotchange="${this.inputSlotChanged}"></slot>
      </div>
      <div
        part="base"
        style=${styleMap({ position: this.positionStrategy })}
        @click=${this.handleClick}
        ${this.toggleController.toggleDirective}
      >
        <div id="dropdown" role="listbox" part="list" aria-labelledby="input">
          <slot name="header"></slot>
          <slot></slot>
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select': IgcSelectComponent;
  }
}

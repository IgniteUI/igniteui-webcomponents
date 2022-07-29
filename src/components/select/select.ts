import { html } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/index.js';
import { watch } from '../common/decorators/watch.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcDropdownItemComponent from '../dropdown/dropdown-item.js';
import IgcDropdownComponent, {
  IgcDropdownEventMap,
} from '../dropdown/dropdown.js';
import IgcIconComponent from '../icon/icon.js';
import IgcInputComponent from '../input/input.js';
import IgcSelectGroupComponent from './select-group.js';
import IgcSelectItemComponent from './select-item.js';
import { styles } from './themes/select.base.css';
import { styles as bootstrap } from './themes/select.bootstrap.css';
import { styles as indigo } from './themes/select.indigo.css';

defineComponents(IgcIconComponent);

export interface IgcSelectEventMap extends IgcDropdownEventMap {
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}
@themes({ bootstrap, indigo })
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
export default class IgcSelectComponent extends IgcDropdownComponent {
  /** @private */
  public static override readonly tagName = 'igc-select';
  public static override styles = styles;
  private searchTerm = '';
  private lastKeyTime = Date.now();

  private readonly inputKeyHandlers: Map<string, Function> = new Map(
    Object.entries({
      ' ': this.onInputEnterKey,
      Tab: this.onInputTabKey,
      Escape: this.onEscapeKey,
      Enter: this.onInputEnterKey,
      ArrowLeft: this.onInputArrowUpKeyDown,
      ArrowRight: this.onInputArrowDownKeyDown,
      ArrowUp: this.onInputArrowUpKeyDown,
      ArrowDown: this.onInputArrowDownKeyDown,
      Home: this.onInputHomeKey,
      End: this.onInputEndKey,
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

  @query('igc-input')
  protected override target!: IgcInputComponent;

  /** The value attribute of the control. */
  @property({ reflect: false, type: String })
  public value?: string | undefined;

  /** The name attribute of the control. */
  @property()
  public name!: string;

  /** The disabled attribute of the control. */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** The required attribute of the control. */
  @property({ reflect: true, type: Boolean })
  public required = false;

  /** The invalid attribute of the control. */
  @property({ reflect: true, type: Boolean })
  public invalid = false;

  /** The outlined attribute of the control. */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /** The autofocus attribute of the control. */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /** The label attribute of the control. */
  @property({ type: String })
  public label!: string;

  /** The placeholder attribute of the control. */
  @property({ type: String })
  public placeholder!: string;

  /** Whether the dropdown's width should be the same as the target's one. */
  @property({ type: Boolean, attribute: 'same-width' })
  public override sameWidth = true;

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  constructor() {
    super();
    this.size = 'medium';
  }

  /** Sets focus on the component. */
  public override focus(options?: FocusOptions) {
    this.target.focus(options);
  }

  /** Removes focus from the component. */
  public override blur() {
    this.target.blur();
  }

  /** Checks the validity of the control. */
  public reportValidity() {
    this.invalid = this.required && !this.value;
    if (this.invalid) this.focus();
    return !this.invalid;
  }

  public override async firstUpdated() {
    super.firstUpdated();
    await this.updateComplete;

    if (!this.selectedItem && this.value) {
      this.updateSelected();
    }
  }

  @watch('selectedItem')
  protected updateValue() {
    this.value = this.selectedItem?.value;
  }

  @watch('value')
  protected updateSelected() {
    if (this.allItems.length === 0) return;

    if (this.selectedItem?.value !== this.value) {
      const matches = this.allItems.filter((i) => i.value === this.value);
      const index = this.allItems.indexOf(
        matches.at(-1) as IgcSelectItemComponent
      );

      if (index === -1) {
        this.value = undefined;
        this.clearSelection();
        return;
      }

      this.select(index);
    }
  }

  @watch('value')
  protected validate() {
    this.updateComplete.then(() => this.reportValidity());
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

  protected selectItemByKey(event: KeyboardEvent): void {
    if (
      !event ||
      !event.key ||
      event.key.length > 1 ||
      event.key === ' ' ||
      event.key === 'spacebar'
    ) {
      // ignore longer keys ('Alt', 'ArrowDown', etc) AND spacebar (used of open/close)
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
      .find((i) =>
        i.textContent
          ?.trim()
          .toLowerCase()
          .startsWith(this.searchTerm.toLowerCase())
      );

    if (item) {
      this.open ? this.activateItem(item) : this.selectItem(item);
    }
  }

  protected onInputTabKey() {
    if (this.open) this.hide();
  }

  protected onInputEnterKey() {
    !this.open ? this.show() : this.onEnterKey();
  }

  protected onInputArrowUpKeyDown(event: KeyboardEvent) {
    if (event.altKey) {
      this.toggle();
    } else {
      !this.open ? this.selectPrev() : this.onArrowUpKeyDown();
    }
  }

  protected onInputArrowDownKeyDown(event: KeyboardEvent) {
    if (event.altKey) {
      this.toggle();
    } else {
      !this.open ? this.selectNext() : this.onArrowDownKeyDown();
    }
  }

  protected onInputHomeKey() {
    !this.open ? this.selectInteractiveItem(0) : this.onHomeKey();
  }

  protected onInputEndKey() {
    !this.open ? this.selectInteractiveItem(-1) : this.onEndKey();
  }

  protected handleInputKeyDown(event: KeyboardEvent) {
    event.stopPropagation();

    if (this.inputKeyHandlers.has(event.key)) {
      event.preventDefault();
      this.inputKeyHandlers.get(event.key)?.call(this, event);
    } else {
      this.selectItemByKey(event);
    }
  }

  protected get hasPrefixes() {
    return this.inputPrefix.length > 0;
  }

  protected get hasSuffixes() {
    return this.inputSuffix.length > 0;
  }

  protected override render() {
    return html`
      <igc-input
        readonly
        id="igcDDLTarget"
        exportparts="container: input, input: native-input, label, prefix, suffix"
        value=${ifDefined(this.selectedItem?.textContent?.trim())}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        size=${this.size}
        dir=${this.dir}
        .disabled="${this.disabled}"
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        ?autofocus=${this.autofocus}
        @click=${this.handleTargetClick}
        @keydown=${this.handleInputKeyDown}
      >
        <span slot=${this.hasPrefixes ? 'prefix' : ''}>
          <slot name="prefix"></slot>
        </span>
        <span slot=${this.hasSuffixes ? 'suffix' : ''}>
          <slot name="suffix"></slot>
        </span>
        <span slot="suffix" part="toggle-icon" style="display: flex">
          <slot name="toggle-icon">
            <igc-icon
              size=${this.size}
              name=${this.open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              collection="internal"
              aria-hidden="true"
            ></igc-icon>
          </slot>
        </span>
      </igc-input>
      <div part="helper-text" .hidden="${this.helperText.length == 0}">
        <slot name="helper-text"></slot>
      </div>
      <div
        part="base"
        style=${styleMap({ position: this.positionStrategy })}
        @click=${this.handleClick}
        ${this.toggleController.toggleDirective}
      >
        <div role="listbox" part="list" aria-labelledby="igcDDLTarget">
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

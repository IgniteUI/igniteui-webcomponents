import { html } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming';
import { watch } from '../common/decorators';
import IgcDropdownComponent, {
  IgcDropdownEventMap,
} from '../dropdown/dropdown';
import IgcInputComponent from '../input/input';
import IgcSelectGroupComponent from './select-group';
import IgcSelectItemComponent from './select-item';
import { styles } from './themes/select.base.css';
import { styles as bootstrap } from './themes/select.bootstrap.css';
import { styles as indigo } from './themes/select.indigo.css';

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
 * @slot toggle-icon - Renders content below the input.
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
  public static override readonly tagName = 'igc-select' as 'igc-dropdown';
  public static override styles = styles;
  private searchTerm = '';
  private lastKeyTime = Date.now();

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
  public value!: string | undefined;

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

    const selectedItem = this.allItems.find((i) => i.selected) ?? null;
    if (selectedItem) this.value = selectedItem.value;
    else this.updateSelected();
  }

  @watch('selectedItem')
  protected updateValue() {
    this.value = this.selectedItem?.value ?? this.value;
  }

  @watch('value')
  protected updateSelected() {
    if (this.allItems.length === 0) return;

    if (this.selectedItem?.value !== this.value) {
      const matches = this.allItems.filter((i) => i.value === this.value);
      const index = this.allItems.indexOf(matches[matches.length - 1]);

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

  protected selectFirstActiveItem() {
    const items = this.allItems.filter((i) => !i.disabled);
    const index = this.allItems.indexOf(items[0]);
    const item = this.allItems[index];

    if (item.value !== this.value) {
      this.selectItem(item, true);
    }
  }

  protected selectLastActiveItem() {
    const items = this.allItems.filter((i) => !i.disabled);
    const index = this.allItems.indexOf(items[items.length - 1]);
    const item = this.allItems[index];

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
    if (item) this.selectItem(item);
  }

  protected handleInputKeyboardEvents(event: KeyboardEvent) {
    event.stopPropagation();
    const key = event.key.toLowerCase();

    if (
      event.altKey &&
      (key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'down' ||
        key === 'up')
    ) {
      this.toggle();
      return;
    }

    if (!this.open) {
      switch (key) {
        case 'space':
        case 'spacebar':
        case ' ':
        case 'enter':
          event.preventDefault();
          this._show();
          return;
        case 'arrowdown':
        case 'down':
        case 'arrowright':
        case 'right':
          event.preventDefault();
          this.selectNext();
          return;
        case 'arrowup':
        case 'up':
        case 'arrowleft':
        case 'left':
          event.preventDefault();
          this.selectPrev();
          return;
        case 'home':
          event.preventDefault();
          this.selectFirstActiveItem();
          return;
        case 'end':
          event.preventDefault();
          this.selectLastActiveItem();
          return;
        default:
          break;
      }
    } else if (key === 'tab' || (event.shiftKey && key === 'tab')) {
      this._hide();
    }

    this.handleKeyDown(event);
    this.selectItemByKey(event);
  }

  protected renderInnerSlots(el: HTMLElement, slot: string) {
    el.setAttribute('slot', slot);
    return html`${el.cloneNode(true)}`;
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
        @keydown=${this.handleInputKeyboardEvents}
      >
        ${this.inputPrefix.map((el) => this.renderInnerSlots(el, 'prefix'))}
        ${this.inputSuffix.map((el) => this.renderInnerSlots(el, 'suffix'))}
        <span slot="suffix" part="toggle-icon" style="display: flex">
          <slot name="toggle-icon">
            <igc-icon
              size=${this.size}
              name=${this.open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              collection="internal"
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
      <slot name="prefix" hidden></slot>
      <slot name="suffix" hidden></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select': IgcSelectComponent;
  }
}

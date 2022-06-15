import { html } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { blazorTwoWayBind, watch } from '../common/decorators';
import IgcDropdownComponent from '../dropdown/dropdown';
import IgcDropdownItemComponent from '../dropdown/dropdown-item';
import { IgcToggleController } from '../toggle/toggle.controller.js';
import IgcSelectItemComponent from './select-item';
import { styles } from './themes/select.base.css';
import { styles as bootstrap } from './themes/select.bootstrap.css';
import { themes } from '../../theming';

@themes({ bootstrap })
/**
 * @element igc-select
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 *
 * @fires igcInput - Emitted when the control input receives user input.
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcFocus - Emitted when the control gains focus.
 * @fires igcBlur - Emitted when the control loses focus.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
export default class IgcSelectComponent extends IgcDropdownComponent {
  public static override readonly tagName = 'igc-select' as 'igc-dropdown';
  public static override styles = styles;
  protected override toggleController!: IgcToggleController;

  @queryAssignedElements({ flatten: true, selector: 'igc-select-item' })
  protected override items!: Array<IgcSelectItemComponent>;

  @queryAssignedElements({ slot: 'helper-text' })
  protected helperText!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected inputSuffix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'prefix' })
  protected inputPrefix!: Array<HTMLElement>;

  @state()
  protected override selectedItem!: IgcDropdownItemComponent | null;

  @query('igc-input')
  private input!: HTMLElement;

  /** The value attribute of the control. */
  @property({ reflect: false, type: String })
  @blazorTwoWayBind('igcChange', 'detail')
  public value!: String | undefined;

  /** The name attribute of the control. */
  @property()
  public name!: String;

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
  public label!: String;

  /** The placeholder attribute of the control. */
  @property({ type: String })
  public placeholder!: String;

  /** Whether the dropdown's width should be the same as the target's one. */
  @property({ type: Boolean, attribute: 'same-width' })
  public override sameWidth = true;

  constructor() {
    super();
    this.toggleController = new IgcToggleController(this, this.input);
    this.size = 'medium';
  }

  public override firstUpdated() {
    super.target = this.input;
    const selectedItem = this.items.find((i) => i.selected) ?? null;

    if (selectedItem) this.value = selectedItem.value;
    else this.updateSelected();
  }

  @watch('selectedItem')
  protected updateValue() {
    this.value = this.selectedItem?.value;
  }

  @watch('value')
  protected updateSelected() {
    if (this.selectedItem?.value !== this.value) {
      const matches = this.items.filter((i) => i.value === this.value);
      const index = this.items.indexOf(matches[matches.length - 1]);
      this.select(index);
    }
  }

  protected selectNext() {
    const activeItemIndex = [...this.items].indexOf(
      this.selectedItem ?? this.activeItem
    );
    const next = this.getNearestSiblingFocusableItemIndex(
      activeItemIndex ?? -1,
      1
    );
    this.selectItem(this.items[next], true);
  }

  protected selectPrev() {
    const activeItemIndex = [...this.items].indexOf(
      this.selectedItem ?? this.activeItem
    );
    const prev = this.getNearestSiblingFocusableItemIndex(
      activeItemIndex ?? -1,
      -1
    );
    this.selectItem(this.items[prev], true);
  }

  protected selectFirstActiveItem() {
    const items = this.items.filter((i) => !i.disabled);
    const index = this.items.indexOf(items[0]);
    const item = this.items[index];

    if (item.value !== this.value) {
      this.selectItem(item, true);
    }
  }

  protected selectLastActiveItem() {
    const items = this.items.filter((i) => !i.disabled);
    const index = this.items.indexOf(items[items.length - 1]);
    const item = this.items[index];

    if (item.value !== this.value) {
      this.selectItem(item, true);
    }
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
          this.target.click();
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
    }

    this.handleKeyDown(event);
  }

  protected renderInnerSlots(el: HTMLElement, slot: string) {
    el.setAttribute('slot', slot);
    return html`${el.cloneNode(true)}`;
  }

  protected override render() {
    return html`
      <igc-input
        id="igcDDLTarget"
        readonly
        @click=${this.handleTargetClick}
        value=${ifDefined(this.value)}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        size=${this.size}
        .disabled="${this.disabled}"
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        ?autofocus=${this.autofocus}
        @keydown=${this.handleInputKeyboardEvents}
        exportparts="prefix, suffix"
      >
        ${this.inputPrefix.map((el) => this.renderInnerSlots(el, 'prefix'))}
        ${this.inputSuffix.map((el) => this.renderInnerSlots(el, 'suffix'))}
        <span slot="suffix" part="toggle-icon" style="display: flex">
          <slot name="toggle-icon">
            <igc-icon
              size="medium"
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
        style=${styleMap({ position: super.positionStrategy })}
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

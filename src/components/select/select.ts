import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
// import { live } from 'lit/directives/live.js';
import { styleMap } from 'lit/directives/style-map.js';
import { blazorTwoWayBind } from '../common/decorators';
import IgcDropdownComponent from '../dropdown/dropdown';
import IgcDropdownItemComponent from '../dropdown/dropdown-item';
import { IgcToggleController } from '../toggle/toggle.controller.js';
import IgcSelectItemComponent from './select-item';

export default class IgcSelectComponent extends IgcDropdownComponent {
  public static override readonly tagName = 'igc-select' as 'igc-dropdown';
  protected override toggleController!: IgcToggleController;

  @queryAssignedElements({ flatten: true, selector: 'igc-select-item' })
  protected override items!: Array<IgcSelectItemComponent>;

  @query('igc-input')
  private input!: HTMLElement;

  /** The value attribute of the control. */
  @property({ reflect: true })
  @blazorTwoWayBind('igcChange', 'detail')
  public value = '';

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

  constructor() {
    super();
    this.toggleController = new IgcToggleController(this, this.input);
    this.size = 'medium';

    this.addEventListener('igcChange', this.handleDDValueChange);
  }

  public override firstUpdated() {
    super.target = this.input;
  }

  protected handleDDValueChange(event: CustomEvent) {
    const item = event.detail as IgcDropdownItemComponent;
    this.value = item.value;
  }

  protected override render() {
    return html`
      <igc-input
        @click=${this.handleTargetClick}
        value=${this.value}
        placeholder=${ifDefined(this.placeholder)}
        label=${this.label}
        size=${this.size}
        .disabled="${this.disabled}"
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        ?autofocus=${this.autofocus}
      >
        <span slot="suffix">home</span>
      </igc-input>
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select': IgcSelectComponent;
  }
}

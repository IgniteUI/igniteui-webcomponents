import { html } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
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

  @query('#igcDDLTarget')
  private tc!: HTMLElement;

  @property({ reflect: true })
  @blazorTwoWayBind('igcChange', 'detail')
  public value = '';

  constructor() {
    super();
    this.toggleController = new IgcToggleController(this, this.tc);

    this.addEventListener('igcChange', this.handleDDValueChange);
  }

  public override firstUpdated() {
    super.target = this.tc;
  }

  protected handleDDValueChange(event: CustomEvent) {
    const item = event.detail as IgcDropdownItemComponent;
    this.value = item.value;
  }

  protected override render() {
    return html`
      <igc-input
        id="igcDDLTarget"
        readonly
        @click=${this.handleTargetClick}
        value=${this.value}
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

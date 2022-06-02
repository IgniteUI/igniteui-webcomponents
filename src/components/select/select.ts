import { html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { blazorTwoWayBind } from '../common/decorators';
import IgcDropdownComponent from '../dropdown/dropdown';
import IgcDropdownItemComponent from '../dropdown/dropdown-item';
import { IgcToggleController } from '../toggle/toggle.controller.js';

export default class IgcSelectComponent extends IgcDropdownComponent {
  public static override readonly tagName = 'igc-select' as any;
  protected override toggleController!: IgcToggleController;

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

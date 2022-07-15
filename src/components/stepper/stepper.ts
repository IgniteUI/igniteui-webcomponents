import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators';

export default class IgcTabsComponent extends LitElement {
  public static readonly tagName = 'igc-stepper';

  @property({ reflect: true, type: Boolean })
  public vertical = false;

  public override firstUpdated(): void {
    this.onVerticalChange();
  }

  @watch('vertical', { waitUntilFirstUpdate: true })
  protected onVerticalChange(): void {
    if (this.vertical) {
      this.shadowRoot!.querySelectorAll('slot')[1]
        ?.assignedElements()
        .forEach((node: any) => (node.slot = ''));
    } else {
      this.shadowRoot!.querySelectorAll('slot')[0]
        ?.assignedElements()
        .forEach((node: any) => {
          if (node.tagName.toLowerCase() !== 'igc-step') {
            node.slot = 'content';
          }
        });
    }
  }

  protected override render() {
    return html`
      <div part="headers">
        <slot></slot>
      </div>
      <div part="content-wrapper"><slot name="content"></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-stepper': IgcTabsComponent;
  }
}

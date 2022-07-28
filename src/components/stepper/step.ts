import { html, LitElement } from 'lit';

export default class IgcStepComponent extends LitElement {
  public static readonly tagName = 'igc-step';

  protected override render() {
    return html` <div part="indicator">Step Indicator</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-step': IgcStepComponent;
  }
}

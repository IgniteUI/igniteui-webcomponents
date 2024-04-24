import { LitElement, css } from 'lit';

import { registerComponent } from '../common/definitions/register.js';

export default class IgcSliderLabelComponent extends LitElement {
  public static readonly tagName = 'igc-slider-label';
  public static override styles = css`
    :host {
      display: none;
    }
  `;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSliderLabelComponent);
  }

  protected override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-slider-label': IgcSliderLabelComponent;
  }
}

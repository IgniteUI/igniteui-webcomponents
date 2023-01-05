import { css, LitElement } from 'lit';
import { registerComponent } from '../common/util.js';

export default class IgcSliderLabelComponent extends LitElement {
  public static override styles = css`
    :host {
      display: none;
    }
  `;

  public static readonly tagName = 'igc-slider-label';

  public static register() {
    registerComponent(this);
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

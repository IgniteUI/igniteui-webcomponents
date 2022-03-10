import { css, LitElement } from 'lit';

export default class IgcSliderLabelComponent extends LitElement {
  public static override styles = css`
    :host {
      display: none;
    }
  `;

  public static readonly tagName = 'igc-slider-label';

  protected override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-slider-label': IgcSliderLabelComponent;
  }
}

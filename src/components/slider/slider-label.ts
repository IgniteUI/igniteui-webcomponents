import { LitElement, css } from 'lit';

import { registerComponent } from '../common/definitions/register.js';

/**
 * Allows formatting the values of the slider as string values.
 * The text content of the slider labels is used for thumb and tick labels.
 *
 * @remarks
 * When slider labels are provided, the `min`, `max` and `step` properties are automatically
 * calculated so that they do not allow values that do not map to the provided labels.
 *
 * @element igc-slider-label
 */
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

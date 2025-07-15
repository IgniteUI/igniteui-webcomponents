import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';

/**
 * Used for defining gradient stops in the igc-circular-progress.
 * For each `igc-circular-gradient` defined as `gradient` slot of `igc-circular-progress` element would be created a SVG stop element.
 * The values passed as `color`, `offset` and `opacity` would be set as
 * `stop-color`, `offset` and `stop-opacity` of the SVG element without further validations.
 *
 * @element igc-circular-gradient
 *
 */
export default class IgcCircularGradientComponent extends LitElement {
  public static readonly tagName = 'igc-circular-gradient';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCircularGradientComponent);
  }

  /**
   * Defines where the gradient stop is placed along the gradient vector
   * @attr
   */
  @property()
  public offset = '0%';

  /**
   * Defines the color of the gradient stop
   * @attr
   */
  @property()
  public color = 'black';

  /**
   * Defines the opacity of the gradient stop
   * @attr
   */
  @property({ type: Number })
  public opacity = 1;

  protected override render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-circular-gradient': IgcCircularGradientComponent;
  }
}

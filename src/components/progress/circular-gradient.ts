import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '#internals/definitions/register.js';

/**
 * Defines a gradient stop for the fill of the circular progress.
 * Put it in the `gradient` slot of the circular progress. Each one becomes an SVG `<stop>` element.
 * The `color`, `offset` and `opacity` values go to the
 * `stop-color`, `offset` and `stop-opacity` of that element without validation.
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
   * Where the stop sits along the gradient vector.
   * @attr
   */
  @property()
  public offset = '0%';

  /**
   * The color of the stop.
   * @attr
   */
  @property()
  public color = 'black';

  /**
   * The opacity of the stop.
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

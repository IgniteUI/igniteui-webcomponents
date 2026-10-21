import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { partMap } from '#internals/part-map.js';
import { all } from '#themes/progress/themes/linear/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { LinearProgressLabelAlign } from '../types.js';
import { IgcProgressBaseComponent } from './base.js';
import { styles } from './themes/linear/linear.progress.base.css.js';
import { styles as shared } from './themes/linear/shared/linear.progress.common.css.js';

/**
 * A linear progress indicator used to express unspecified wait time or display
 * the length of a process.
 *
 * @element igc-linear-progress
 *
 * @slot - Custom label content. A slotted element replaces the default label.
 *
 * @csspart base - The wrapper of the linear progress.
 * @csspart track - The linear progress track area.
 * @csspart fill - The linear progress indicator area.
 * @csspart secondary - Added to the second fill element, which the indeterminate animation uses.
 * @csspart striped - Added to the fill parts when the progress is striped.
 * @csspart label - The linear progress label.
 * @csspart value - The linear progress label value.
 * @csspart indeterminate - Added to the fill parts while the progress is indeterminate.
 * @csspart primary - Added to the fill parts when the variant is `primary`.
 * @csspart danger - Added to the fill parts when the variant is `danger`.
 * @csspart warning - Added to the fill parts when the variant is `warning`.
 * @csspart info - Added to the fill parts when the variant is `info`.
 * @csspart success - Added to the fill parts when the variant is `success`.
 */
export default class IgcLinearProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-linear-progress';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcLinearProgressComponent);
  }

  protected override readonly _slots = addSlotController(this, {
    slots: setSlots(),
  });

  /**
   * Whether the fill of the control is striped.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public striped = false;

  /**
   * The position for the default label of the control.
   * @attr label-align
   */
  @property({ attribute: 'label-align', reflect: true })
  public labelAlign: LinearProgressLabelAlign = 'top-start';

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override render() {
    const parts = {
      fill: true,
      striped: this.striped,
      indeterminate: this.indeterminate,
      [this.variant]: true,
    };

    return html`
      <div part="base" style=${styleMap(this._styleInfo)}>
        <div part="track">
          <div part=${partMap(parts)}></div>
          <div part=${partMap({ ...parts, secondary: true })}></div>
        </div>
        ${this._renderDefaultSlot()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-linear-progress': IgcLinearProgressComponent;
  }
}

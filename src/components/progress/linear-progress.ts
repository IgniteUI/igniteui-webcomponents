import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import type { LinearProgressLabelAlign } from '../types.js';
import { IgcProgressBaseComponent } from './base.js';
import { styles } from './themes/linear/linear.progress.base.css.js';
import { styles as shared } from './themes/linear/shared/linear.progress.common.css.js';
import { all } from './themes/linear/themes.js';

/**
 * A linear progress indicator used to express unspecified wait time or display
 * the length of a process.
 *
 * @element igc-linear-progress
 *
 * @slot - The text area container.
 *
 * @csspart track - The igc-linear-progress track area.
 * @csspart fill - The igc-linear-progress indicator area.
 * @csspart striped - The igc-linear-progress striped indicator.
 * @csspart label - The igc-linear-progress label.
 * @csspart value - The igc-linear-progress label value.
 * @csspart indeterminate - The igc-linear-progress indeterminate state.
 * @csspart primary - The igc-linear-progress indicator primary state.
 * @csspart danger - The igc-linear-progress indicator error state.
 * @csspart warning - The igc-linear-progress indicator warning state.
 * @csspart info - The igc-linear-progress indicator info state.
 * @csspart success - The igc-linear-progress indicator success state.
 */
export default class IgcLinearProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-linear-progress';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcLinearProgressComponent);
  }

  protected override readonly _slots = addSlotController(this, {
    slots: setSlots(),
  });

  /**
   * Sets the striped look of the control.
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

import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';
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
 * @csspart track
 * @csspart fill
 * @csspart striped
 * @csspart label
 * @csspart value
 * @csspart indeterminate
 * @csspart primary
 * @csspart danger
 * @csspart warning
 * @csspart info
 * @csspart success
 */
@themes(all)
export default class IgcLinearProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-linear-progress';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcLinearProgressComponent);
  }

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
  public labelAlign:
    | 'top-start'
    | 'top'
    | 'top-end'
    | 'bottom-start'
    | 'bottom'
    | 'bottom-end' = 'top-start';

  protected override render() {
    const parts = {
      fill: true,
      striped: this.striped,
      indeterminate: this.indeterminate,
      primary: this.variant === 'primary',
      success: this.variant === 'success',
      danger: this.variant === 'danger',
      warning: this.variant === 'warning',
      info: this.variant === 'info',
    };

    const animation = {
      width: `${this.progress * 100}%`,
      '--duration': `${this.animationDuration}ms`,
    };

    return html`
      <div part="track">
        <div part=${partNameMap(parts)} style=${styleMap(animation)}></div>
        <div part="${partNameMap(parts)} secondary"></div>
      </div>
      ${this.renderDefaultSlot()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-linear-progress': IgcLinearProgressComponent;
  }
}

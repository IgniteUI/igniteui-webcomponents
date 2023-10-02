import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { asPercent, partNameMap } from '../common/util.js';
import { IgcProgressBaseComponent } from './base.js';
import { styles } from './themes/linear/linear.progress.base.css.js';
import { styles as bootstrap } from './themes/linear/linear.progress.bootstrap.css.js';
import { styles as fluent } from './themes/linear/linear.progress.fluent.css.js';
import { styles as indigo } from './themes/linear/linear.progress.indigo.css.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';

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
@themes({
  light: { bootstrap, indigo, fluent },
  dark: { bootstrap, indigo, fluent },
})
export default class IgcLinearProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-linear-progress';
  public static override styles = styles;

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

  protected get wrapperParts() {
    return {
      fill: true,
      striped: this.striped,
      indeterminate: this.indeterminate,
      primary: this.variant === 'primary',
      success: this.variant === 'success',
      danger: this.variant === 'danger',
      warning: this.variant === 'warning',
      info: this.variant === 'info',
    };
  }

  protected get animInfo() {
    return {
      width: asPercent(this.value, this.max) + '%',
      '--duration': this.animationDuration + 'ms',
    };
  }

  protected override render() {
    return html`
      <div
        part="track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.indeterminate ? nothing : this.value}
      >
        <div
          part="${partNameMap(this.wrapperParts)}"
          style="${styleMap(this.animInfo)}"
        ></div>
        <div part="${partNameMap(this.wrapperParts)} secondary"></div>
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

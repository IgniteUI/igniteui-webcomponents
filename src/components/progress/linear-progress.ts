import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { asPercent, partNameMap } from '../common/util';
import { IgcProgressBaseComponent } from './base';
import { styles } from './linear.progress.material.css';

/**
 * A linear progress indicator used to express unspecified wait time or display
 * the length of a process.
 *
 * @element igc-linear-progress
 *
 * @slot - The text area container.
 *
 * @csspart track
 * @csspart indicator
 */
export default class IgcLinearProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-linear-progress';
  public static override styles = styles;

  @query('[part~="indicator"]', true)
  protected progressIndicator!: HTMLDivElement;

  /** Sets the striped look of the control. */
  @property({ type: Boolean, reflect: true })
  public striped = false;

  /** The position for the default label of the control. */
  @property({ attribute: 'label-align' })
  public labelAlign:
    | 'top-start'
    | 'top'
    | 'top-end'
    | 'bottom-start'
    | 'bottom'
    | 'bottom-end' = 'top-start';

  protected get wrapperParts() {
    return {
      indicator: true,
      striped: this.striped,
      indeterminate: this.indeterminate,
      primary: this.variant === 'primary',
      success: this.variant === 'success',
      danger: this.variant === 'danger',
      warning: this.variant === 'warning',
      info: this.variant === 'info',
    };
  }

  protected override runAnimation(start: number, end: number) {
    this.animation?.finish();

    const frames = [
      { width: start },
      { width: `${asPercent(end, this.max)}%` },
    ];

    this.animation = this.progressIndicator.animate(
      frames,
      this.animationOptions
    );
    this.animateLabelTo(start, end);
  }

  protected renderLabel() {
    return html`${when(
      this.hideLabel || this.indeterminate || this.slotElements.length,
      () => nothing,
      () => html`<span part="value ${this.labelAlign}">
        ${this.renderLabelText()}
      </span>`
    )}`;
  }

  protected override render() {
    return html`
      <div part="wrapper">
        <div
          part="base"
          role="progressbar"
          aria-valuemin=${this.indeterminate ? nothing : 0}
          aria-valuemax=${this.indeterminate ? nothing : this.max}
          aria-valuenow=${this.indeterminate ? nothing : this.value}
        >
          <div part="${partNameMap(this.wrapperParts)}"></div>
        </div>
        ${this.renderLabel()} ${this.renderDefaultSlot()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-linear-progress': IgcLinearProgressComponent;
  }
}

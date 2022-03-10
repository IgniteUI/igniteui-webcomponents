import { html, LitElement, nothing } from 'lit';
import { property, queryAssignedElements, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { watch } from '../common/decorators';
import { asPercent, clamp } from '../common/util';

export abstract class IgcProgressBaseComponent extends LitElement {
  protected tick!: number;

  @queryAssignedElements()
  protected assignedElements!: Array<HTMLElement>;

  @state()
  protected percentage = 0;

  private oldMax!: number;
  private oldVal!: number;

  /** Maximum value of the control. */
  @property({ type: Number })
  public max = 100;

  /** The value of the control. */
  @property({ type: Number })
  public value = 0;

  /** The variant of the control. */
  @property({ reflect: true })
  public variant: 'primary' | 'info' | 'success' | 'warning' | 'danger' =
    'primary';

  /** Animation duration in milliseconds. */
  @property({ type: Number, attribute: 'animation-duration' })
  public animationDuration = 500;

  /** The indeterminate state of the control. */
  @property({ type: Boolean, reflect: false })
  public indeterminate = false;

  /** Shows/hides the label of the control. */
  @property({ type: Boolean, attribute: 'hide-label', reflect: false })
  public hideLabel = false;

  /**
   * Format string for the default label of the control.
   * Placeholders:
   *  {0} - current value of the control.
   *  {1} - max value of the control.
   */
  @property({ attribute: 'label-format' })
  public labelFormat!: string;

  @watch('max', { waitUntilFirstUpdate: true })
  protected maxChange() {
    this.max = Math.max(0, this.max);
    if (this.value > this.max) {
      this.value = this.max;
    }
  }

  @watch('value', { waitUntilFirstUpdate: true })
  protected valueChange(oldVal: number) {
    this.value = clamp(this.value, 0, this.max);
    if (this.indeterminate) {
      this.percentage = asPercent(this.value, this.max);
    } else {
      cancelAnimationFrame(this.tick);
      this.animateLabelTo(oldVal, this.value);
    }
  }

  protected slotChanges() {
    this.requestUpdate();
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.oldMax = Math.max(0, this.max);
    this.oldVal = clamp(this.value, 0, this.oldMax);
    this.value = 0;
    this.max = 100;
  }

  protected override firstUpdated() {
    if (!this.indeterminate) {
      // trigger transition initially
      setTimeout(() => {
        this.max = this.oldMax;
        this.value = this.oldVal;
      }, 0);
    }
  }

  protected animateLabelTo(start: number, end: number) {
    let t0: number;

    const tick = (t1: number) => {
      t0 = t0 ?? t1;

      const progress = Math.min((t1 - t0) / (this.animationDuration || 1), 1);
      this.percentage = Math.floor(
        asPercent(progress * (end - start) + start, this.max)
      );
      progress < 1
        ? (this.tick = requestAnimationFrame(tick))
        : cancelAnimationFrame(this.tick);
    };

    requestAnimationFrame(tick);
  }

  protected renderLabelFormat() {
    return this.labelFormat
      .replace(/\{0\}/gm, `${this.value}`)
      .replace(/\{1\}/gm, `${this.max}`);
  }

  protected renderDefaultSlot() {
    return html`<slot part="label" @slotchange=${this.slotChanges}></slot>
      ${when(
        this.indeterminate || this.hideLabel || this.assignedElements.length,
        () => nothing,
        () => html`<span part="label value">${this.renderLabelText()}</span>`
      )}`;
  }

  protected renderLabelText() {
    return this.labelFormat ? this.renderLabelFormat() : `${this.percentage}%`;
  }
}

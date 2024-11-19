import { LitElement, html, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';

import { watch } from '../common/decorators/watch.js';
import { asPercent, clamp, formatString } from '../common/util.js';
import type { StyleVariant } from '../types.js';

export abstract class IgcProgressBaseComponent extends LitElement {
  private __internals: ElementInternals;

  @queryAssignedElements()
  protected assignedElements!: Array<HTMLElement>;

  @query('[part~="fill"]', true)
  protected progressIndicator!: Element;

  @state()
  protected percentage = 0;

  @state()
  protected progress = 0;

  /**
   * Maximum value of the control.
   * @attr
   */
  @property({ type: Number })
  public max = 100;

  /**
   * The value of the control.
   * @attr
   */
  @property({ type: Number })
  public value = 0;

  /**
   * The variant of the control.
   * @attr
   */
  @property({ reflect: true })
  public variant: StyleVariant = 'primary';

  /**
   * Animation duration in milliseconds.
   * @attr animation-duration
   */
  @property({ type: Number, attribute: 'animation-duration' })
  public animationDuration = 500;

  /**
   * The indeterminate state of the control.
   * @attr
   */
  @property({ type: Boolean, reflect: false })
  public indeterminate = false;

  /**
   * Shows/hides the label of the control.
   * @attr hide-label
   */
  @property({ type: Boolean, attribute: 'hide-label', reflect: false })
  public hideLabel = false;

  /**
   * Format string for the default label of the control.
   * Placeholders:
   *  {0} - current value of the control.
   *  {1} - max value of the control.
   * @attr label-format
   */
  @property({ attribute: 'label-format' })
  public labelFormat!: string;

  @watch('indeterminate', { waitUntilFirstUpdate: true })
  protected indeterminateChange() {
    if (!this.indeterminate) {
      this._setProgress();
      this._updatePercentage();
    }
  }

  @watch('max', { waitUntilFirstUpdate: true })
  protected maxChange() {
    this.max = Math.max(0, this.max);

    if (this.value > this.max) {
      this.value = this.max;
    }

    this._setProgress();

    if (!this.indeterminate) {
      this._updatePercentage();
    }
  }

  @watch('value', { waitUntilFirstUpdate: true })
  protected valueChange() {
    // CSS counters only support integers, so we use Math.round to ensure the percentage value is an integer.
    this.value = Math.round(clamp(this.value, 0, this.max));
    this._setProgress();

    if (!this.indeterminate) {
      this._updatePercentage();
    }
  }

  constructor() {
    super();
    this.__internals = this.attachInternals();
    this.__internals.role = 'progressbar';
    this.__internals.ariaValueMin = '0';
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  protected override updated(
    changedProperties: Map<string | number | symbol, unknown>
  ) {
    this._updateARIA();

    if (changedProperties.has('animationDuration')) {
      this.style.setProperty(
        '--_transition-duration',
        `${this.animationDuration}ms`
      );
    }
  }

  private _updateARIA() {
    const internals = this.__internals;
    const text = this.labelFormat
      ? this.renderLabelFormat()
      : `${this.percentage}%`;

    internals.ariaValueMax = `${this.max}`;
    internals.ariaValueNow = this.indeterminate ? null : `${this.value}`;
    internals.ariaValueText = this.indeterminate ? null : text;
  }

  private _setProgress() {
    this.progress = this.max > 0 ? this.value / this.max : 0;
  }

  private _updatePercentage() {
    // CSS counters only support integers, so we use Math.round to ensure the percentage value is an integer.
    const percentage = asPercent(this.value, this.max);

    if (percentage !== this.percentage) {
      this.percentage = percentage;
      this.style.setProperty('--_progress', `${this.percentage}`);
    }
  }

  public override async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;

    if (!this.indeterminate) {
      this._setProgress();
      this._updatePercentage();
    }
  }

  protected renderLabelFormat() {
    return formatString(this.labelFormat, this.value, this.max);
  }

  protected renderDefaultSlot() {
    const hasNoLabel =
      this.indeterminate || this.hideLabel || this.assignedElements.length;

    return html`
      <slot part="label"></slot>
      ${hasNoLabel ? nothing : html`<span part="label value"></span>`}
    `;
  }
}

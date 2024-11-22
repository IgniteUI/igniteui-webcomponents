import { LitElement, html, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';

import { watch } from '../common/decorators/watch.js';
import { clamp, formatString } from '../common/util.js';
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

  @state()
  protected hasFraction = false;

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
      this._updateProgress();
    }
  }

  @watch('max', { waitUntilFirstUpdate: true })
  protected maxChange() {
    this.max = Math.max(0, this.max);

    if (this.value > this.max) {
      this.value = this.max;
    }

    if (!this.indeterminate) {
      this._updateProgress();
    }
  }

  @watch('value', { waitUntilFirstUpdate: true })
  protected valueChange() {
    this._clampValue();

    if (!this.indeterminate) {
      this._updateProgress();
    }
  }

  constructor() {
    super();
    this.__internals = this.attachInternals();
    this.__internals.role = 'progressbar';
    this.__internals.ariaValueMin = '0';
  }

  private _setCSSVariables(variables: Record<string, string>) {
    Object.entries(variables).forEach(([key, value]) => {
      this.style.setProperty(key, value);
    });
  }

  private _clampValue(): void {
    this.value = clamp(this.value, 0, this.max);
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    this._updateARIA();

    if (changedProperties.has('animationDuration')) {
      this._setCSSVariables({
        '--_transition-duration': `${this.animationDuration}ms`,
      });
    }
  }

  private _updateARIA() {
    const text = this.labelFormat
      ? this.renderLabelFormat()
      : `${this.percentage}%`;

    const internals = this.__internals;
    internals.ariaValueMax = `${this.max}`;
    internals.ariaValueNow = this.indeterminate ? null : `${this.value}`;
    internals.ariaValueText = this.indeterminate ? null : text;
  }

  /**
   * Calculates the current progress percentage and updates CSS variables
   * Skips updates if the percentage has not changed.
   */
  private _updateProgress() {
    const progress = this.max > 0 ? this.value / this.max : 0;
    const percentage = progress * 100;

    if (this.value !== 0 && percentage === this.percentage) return;

    const wholeValue = percentage;
    const integerValue = Math.floor(percentage);
    const fractionValue = Math.round((percentage % 1) * 100);

    this._setCSSVariables({
      '--_progress-whole': `${wholeValue}`,
      '--_progress-integer': `${integerValue}`,
      '--_progress-fraction': `${fractionValue}`,
    });

    this.hasFraction = fractionValue > 0;
  }

  public override async connectedCallback() {
    super.connectedCallback();
    this._clampValue();
    this._updateProgress();
    this._updateARIA();
    await this.updateComplete;
  }

  protected renderLabel() {
    const basePart = 'label value';
    const part = `${basePart}${this.hasFraction ? ' fraction' : ''}`.trim();

    return html`<span part=${part}></span>`;
  }

  protected renderLabelFormat() {
    return formatString(this.labelFormat, this.value, this.max);
  }

  protected renderDefaultSlot() {
    const hasNoLabel =
      this.indeterminate || this.hideLabel || this.assignedElements.length;

    return html`
      <slot part="label"></slot>
      ${hasNoLabel ? nothing : this.renderLabel()}
    `;
  }
}

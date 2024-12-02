import { LitElement, html, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { watch } from '../common/decorators/watch.js';
import { clamp, formatString } from '../common/util.js';
import type { StyleVariant } from '../types.js';

export abstract class IgcProgressBaseComponent extends LitElement {
  private readonly __internals: ElementInternals;

  @queryAssignedElements()
  protected assignedElements!: Array<HTMLElement>;

  @query('[part="base"]', true)
  protected base!: HTMLElement;

  @state()
  protected percentage = 0;

  @state()
  protected progress = 0;

  @state()
  protected hasFraction = false;

  @state()
  protected styleInfo: Record<string, string> = {};

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

  constructor() {
    super();
    this.__internals = this.attachInternals();
    this.__internals.role = 'progressbar';
    this.__internals.ariaValueMin = '0';
  }

  override connectedCallback() {
    super.connectedCallback();
    this._clampValue();
    this._updateARIA();
  }

  @watch('indeterminate', { waitUntilFirstUpdate: true })
  protected indeterminateChange() {
    if (!this.indeterminate) {
      this.requestUpdate();
    }
  }

  @watch('max', { waitUntilFirstUpdate: true })
  protected maxChange() {
    this.max = Math.max(0, this.max);
    if (this.value > this.max) {
      this.value = this.max;
    }
    if (!this.indeterminate) {
      this.requestUpdate();
    }
  }

  @watch('value', { waitUntilFirstUpdate: true })
  protected valueChange() {
    this._clampValue();
    if (!this.indeterminate) {
      this.requestUpdate();
    }
  }

  private _clampValue(): void {
    this.value = clamp(this.value, 0, this.max);
  }

  private _updateARIA() {
    const text = this.labelFormat ? this.renderLabelFormat() : `${this.value}%`;

    const internals = this.__internals;
    internals.ariaValueMax = `${this.max}`;
    internals.ariaValueNow = this.indeterminate ? null : `${this.value}`;
    internals.ariaValueText = this.indeterminate ? null : text;
  }

  private _updateProgress() {
    const progress = this.max > 0 ? this.value / this.max : 0;
    const percentage = progress * 100;

    const fractionValue = Math.round((percentage % 1) * 100);

    this.styleInfo = {
      '--_progress-whole': `${percentage.toFixed(2)}`,
      '--_progress-integer': `${Math.floor(percentage)}`,
      '--_progress-fraction': `${fractionValue}`,
      '--_transition-duration': `${this.animationDuration}ms`,
    };

    this.hasFraction = fractionValue > 0;
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    if (
      changedProperties.has('animationDuration') ||
      changedProperties.has('value') ||
      changedProperties.has('max')
    ) {
      this._updateProgress();
      this._updateARIA();

      // Apply style directly to base element after updating styleInfo
      if (this.base) {
        Object.entries(this.styleInfo).forEach(([key, value]) => {
          this.base.style.setProperty(key, value);
        });
      }
    }
  }

  protected renderLabel() {
    const basePart = 'label value';
    const part = `${basePart}${this.hasFraction ? ' fraction' : ''}`.trim();

    if (this.labelFormat) {
      return html`<span part=${part}>${this.renderLabelFormat()}</span>`;
    }

    return html`<span part="${part} counter"></span>`;
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

  protected override render() {
    return html`
      <div part="base" style=${styleMap(this.styleInfo)}>
        ${this.renderDefaultSlot()}
      </div>
    `;
  }
}

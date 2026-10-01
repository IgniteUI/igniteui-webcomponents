import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type { StyleInfo } from 'lit/directives/style-map.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import type { SlotController } from '#internals/controllers/slot.js';
import { partMap } from '#internals/part-map.js';
import { asPercent, clamp } from '#internals/utils/math.js';
import { formatString } from '#internals/utils/strings.js';
import type { StyleVariant } from '../types.js';

/** The percentage of `max` that the fill and the default label show. */
interface ProgressPercentage {
  /** The exact percentage. */
  percentage: number;
  /** The whole part of the percentage, rounded to hundredths. */
  integer: number;
  /** The hundredths of the rounded percentage, from 0 to 99. */
  fraction: number;
}

/* omitModule */
export abstract class IgcProgressBaseComponent extends LitElement {
  protected abstract _slots: SlotController<any>;

  @query('[part="base"]', true)
  protected _base!: HTMLElement;

  @state()
  protected _percentage = 0;

  @state()
  protected _progress = 0;

  @state()
  protected _hasFraction = false;

  @state()
  protected _styleInfo: StyleInfo = {
    '--_progress-whole': '0.00',
    '--_progress-integer': '0',
    '--_progress-fraction': '0',
    '--_transition-duration': '0ms',
  };

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

    addInternalsController(this, {
      initialARIA: {
        role: 'progressbar',
        ariaValueMin: '0',
        ariaValueNow: '0',
      },
      aria: () => ({
        ariaValueMax: this.max.toString(),
        ariaValueNow: this.indeterminate ? null : this.value.toString(),
        ariaValueText: this.indeterminate ? null : this._labelText,
      }),
    });
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    const progressChanged =
      changedProperties.has('animationDuration') ||
      changedProperties.has('indeterminate') ||
      changedProperties.has('max') ||
      changedProperties.has('value');

    // Both writes are idempotent, so they are applied unconditionally. A clamp
    // that does change a value lands it in `changedProperties` for this pass.
    this.max = Math.max(0, this.max);
    this.value = clamp(this.value, 0, this.max);

    if (progressChanged && !this.indeterminate) {
      this._updateProgress();
    }
  }

  private get _labelText(): string {
    if (this.labelFormat) {
      return this._renderLabelFormat();
    }

    // The same text as the CSS counters of the default label.
    const { integer, fraction } = this._getPercentage();
    return fraction > 0
      ? `${integer}.${fraction.toString().padStart(2, '0')}%`
      : `${integer}%`;
  }

  private _getPercentage(): ProgressPercentage {
    // A `max` of 0 also clamps the value to 0, so there is no ratio to take.
    const percentage = this.max > 0 ? asPercent(this.value, this.max) : 0;
    // Round to the two decimals of the label first, so that a fraction that
    // rounds up, such as 12.996, carries into the integer instead of ".100".
    const hundredths = Math.round(percentage * 100);

    return {
      percentage,
      integer: Math.floor(hundredths / 100),
      fraction: hundredths % 100,
    };
  }

  private _updateProgress(): void {
    const { percentage, integer, fraction } = this._getPercentage();
    this._hasFraction = fraction > 0;

    this._styleInfo = {
      '--_progress-whole': percentage.toFixed(2),
      '--_progress-integer': integer,
      '--_progress-fraction': fraction,
      '--_transition-duration': `${this.animationDuration}ms`,
    };
  }

  protected _renderLabel() {
    const parts = {
      label: true,
      value: true,
      fraction: this._hasFraction,
    };

    return this.labelFormat
      ? html`<span part=${partMap(parts)}>${this._renderLabelFormat()}</span>`
      : html`<span part=${partMap({ ...parts, counter: true })}></span>`;
  }

  protected _renderLabelFormat(): string {
    return formatString(this.labelFormat, this.value, this.max);
  }

  protected _renderDefaultSlot() {
    const hideDefaultLabel =
      this.indeterminate ||
      this.hideLabel ||
      this._slots.hasAssignedElements('[default]');

    return html`
      <slot part="label"></slot>
      ${hideDefaultLabel ? nothing : this._renderLabel()}
    `;
  }
}

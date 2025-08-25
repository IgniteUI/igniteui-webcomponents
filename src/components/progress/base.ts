import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type { StyleInfo } from 'lit/directives/style-map.js';
import { addInternalsController } from '../common/controllers/internals.js';
import type { SlotController } from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { partMap } from '../common/part-map.js';
import { asPercent, clamp, formatString } from '../common/util.js';
import type { StyleVariant } from '../types.js';

export abstract class IgcProgressBaseComponent extends LitElement {
  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'progressbar',
      ariaValueMin: '0',
      ariaValueNow: '0',
    },
  });

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

  @watch('indeterminate')
  protected _indeterminateChange(): void {
    if (!this.indeterminate) {
      this._updateProgress();
    }
  }

  @watch('max')
  protected _maxChange(): void {
    this.max = Math.max(0, this.max);
    if (this.value > this.max) {
      this.value = this.max;
    }

    if (!this.indeterminate) {
      this._updateProgress();
    }
  }

  @watch('value')
  protected _valueChange(): void {
    this.value = clamp(this.value, 0, this.max);

    if (!this.indeterminate) {
      this._updateProgress();
    }
  }

  protected override updated(): void {
    this._updateARIA();
  }

  private _updateARIA(): void {
    const text = this.labelFormat
      ? this._renderLabelFormat()
      : `${this.value}%`;

    this._internals.setARIA({
      ariaValueMax: this.max.toString(),
      ariaValueNow: this.indeterminate ? null : this.value.toString(),
      ariaValueText: this.indeterminate ? null : text,
    });
  }

  private _updateProgress(): void {
    const percentage = asPercent(this.value, Math.max(1, this.max));
    const fractionValue = Math.round((percentage % 1) * 100);
    this._hasFraction = fractionValue > 0;

    this._styleInfo = {
      '--_progress-whole': percentage.toFixed(2),
      '--_progress-integer': Math.floor(percentage),
      '--_progress-fraction': fractionValue,
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

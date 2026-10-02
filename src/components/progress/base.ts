import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type { StyleInfo } from 'lit/directives/style-map.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import type { SlotController } from '#internals/controllers/slot.js';
import { partMap } from '#internals/part-map.js';
import {
  asNumber,
  asPercent,
  clamp,
  roundPrecise,
} from '#internals/utils/math.js';
import { formatString } from '#internals/utils/strings.js';
import type { StyleVariant } from '../types.js';

/* omitModule */
export abstract class IgcProgressBaseComponent extends LitElement {
  protected abstract _slots: SlotController<any>;

  @query('[part="base"]', true)
  protected _base!: HTMLElement;

  @state()
  protected _hasFraction = false;

  /** The default label text, which the CSS counters of the label also show. */
  private _percentText = '0%';

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
    return this.labelFormat ? this._renderLabelFormat() : this._percentText;
  }

  private _updateProgress(): void {
    // Avoid 0 / 0: a `max` of 0 clamps the value to 0.
    const exact = this.max > 0 ? asPercent(this.value, this.max) : 0;
    // Round before the split, so 12.996 shows 13%, not "12.100%".
    const whole = roundPrecise(exact, 2).toFixed(2);
    const [integer, fraction] = whole.split('.').map((part) => asNumber(part));

    this._hasFraction = fraction > 0;
    this._percentText = `${this._hasFraction ? whole : integer}%`;

    this._styleInfo = {
      '--_progress-whole': whole,
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

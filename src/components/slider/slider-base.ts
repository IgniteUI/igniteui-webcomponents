import { html, LitElement, TemplateResult } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorTypeOverride } from '../common/decorators/blazorTypeOverride.js';
import { watch } from '../common/decorators/watch.js';
import { isLTR } from '../common/util.js';
import { styles } from './themes/light/slider.base.css.js';
import { styles as bootstrap } from './themes/light/slider.bootstrap.css.js';
import { styles as fluent } from './themes/light/slider.fluent.css.js';
import { styles as indigo } from './themes/light/slider.indigo.css.js';
import { styles as material } from './themes/light/slider.material.css.js';

@themes({
  light: { material, bootstrap, fluent, indigo },
  dark: { material, bootstrap, fluent, indigo },
})
@blazorDeepImport
export class IgcSliderBaseComponent extends LitElement {
  public static override styles = styles;

  @query(`[part~='thumb']`)
  protected thumb!: HTMLElement;

  @queryAssignedElements({ selector: 'igc-slider-label' })
  private labelElements!: HTMLElement[];

  private _lowerBound?: number;
  private _upperBound?: number;
  private _min = 0;
  private _max = 100;
  private _step = 1;
  private startValue?: number;
  private pointerCaptured = false;
  private thumbHoverTimer: any;
  protected activeThumb?: HTMLElement;

  @state()
  protected thumbLabelsVisible = false;

  @state()
  protected labels?: string[];

  public set min(value: number) {
    if (value < this.max) {
      const oldVal = this._min;
      this._min = this.labels ? 0 : value;
      this.requestUpdate('min', oldVal);

      if (typeof this.lowerBound === 'number' && this.lowerBound < value) {
        this.lowerBound = value;
      }
    }
  }

  /**
   * The minimum value of the slider scale. Defaults to 0.
   * @attr
   */
  @property({ type: Number })
  public get min() {
    return this._min;
  }

  public set max(value: number) {
    if (value > this.min) {
      const oldVal = this._max;
      this._max = this.labels ? this.labels.length - 1 : value;
      this.requestUpdate('max', oldVal);

      if (typeof this.upperBound === 'number' && this.upperBound > value) {
        this.upperBound = value;
      }
    }
  }

  /**
   * The maximum value of the slider scale. Defaults to 100.
   * @attr
   */
  @property({ type: Number })
  public get max() {
    return this._max;
  }

  public set lowerBound(value: number | undefined) {
    const oldVal = this._lowerBound;

    if (typeof value === 'number') {
      this._lowerBound = this.valueInRange(value, this.min, this.actualMax);
    } else {
      this._lowerBound = value;
    }
    this.requestUpdate('lowerBound', oldVal);
  }

  /**
   * The lower bound of the slider value. If not set, the `min` value is applied.
   * @attr lower-bound
   */
  @property({ type: Number, attribute: 'lower-bound' })
  public get lowerBound(): number | undefined {
    return this._lowerBound;
  }

  public set upperBound(value: number | undefined) {
    const oldVal = this._upperBound;

    if (typeof value === 'number') {
      this._upperBound = this.valueInRange(value, this.actualMin, this.max);
    } else {
      this._upperBound = value;
    }
    this.requestUpdate('upperBound', oldVal);
  }

  /**
   * The upper bound of the slider value. If not set, the `max` value is applied.
   * @attr upper-bound
   */
  @property({ type: Number, attribute: 'upper-bound' })
  public get upperBound(): number | undefined {
    return this._upperBound;
  }

  /**
   * Disables the UI interactions of the slider.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Marks the slider track as discrete so it displays the steps.
   * If the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.
   * @attr discrete-track
   */
  @property({ type: Boolean, attribute: 'discrete-track' })
  public discreteTrack = false;

  /**
   * Hides the thumb tooltip.
   * @attr hide-tooltip
   */
  @property({ type: Boolean, attribute: 'hide-tooltip' })
  public hideTooltip = false;

  public set step(value: number) {
    const oldVal = this._step;
    this._step = this.labels ? 1 : value;
    this.requestUpdate('step', oldVal);
  }

  /**
   * Specifies the granularity that the value must adhere to.
   * If set to 0 no stepping is implied and any value in the range is allowed.
   * @attr
   */
  @property({ type: Number })
  public get step() {
    return this._step;
  }

  /**
   * The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.
   * @attr primary-ticks
   */
  @property({ type: Number, attribute: 'primary-ticks' })
  public primaryTicks = 0;

  /**
   * The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed.
   * @attr secondary-ticks
   */
  @property({ type: Number, attribute: 'secondary-ticks' })
  public secondaryTicks = 0;

  /**
   * Changes the orientation of the ticks.
   * @attr tick-orientation
   */
  @property({ attribute: 'tick-orientation' })
  public tickOrientation: 'mirror' | 'start' | 'end' = 'end';

  /**
   * Hides the primary tick labels.
   * @attr hide-primary-labels
   */
  @property({ type: Boolean, attribute: 'hide-primary-labels' })
  public hidePrimaryLabels = false;

  /**
   * Hides the secondary tick labels.
   * @attr hide-secondary-labels
   */
  @property({ type: Boolean, attribute: 'hide-secondary-labels' })
  public hideSecondaryLabels = false;

  /**
   * The locale used to format the thumb and tick label values in the slider.
   * @attr
   */
  @property()
  public locale = 'en';

  /**
   * String format used for the thumb and tick label values in the slider.
   * @attr value-format
   */
  @property({ attribute: 'value-format' })
  public valueFormat?: string;

  /**
   * Number format options used for the thumb and tick label values in the slider.
   */
  /* blazorSuppress */
  @property({ attribute: false })
  public valueFormatOptions?: Intl.NumberFormatOptions;

  /**
   * The degrees for the rotation of the tick labels. Defaults to 0.
   * @attr tick-label-rotation
   */
  @property({ type: Number, reflect: true, attribute: 'tick-label-rotation' })
  @blazorTypeOverride('TickLabelRotation', true)
  public tickLabelRotation: 0 | 90 | -90 = 0;

  @watch('min', { waitUntilFirstUpdate: true })
  @watch('max', { waitUntilFirstUpdate: true })
  @watch('lowerBound', { waitUntilFirstUpdate: true })
  @watch('upperBound', { waitUntilFirstUpdate: true })
  @watch('step', { waitUntilFirstUpdate: true })
  protected constraintsChange() {
    this.normalizeValue();
  }

  @watch('labels')
  protected labelsChange() {
    if (this.labels) {
      this.min = 0;
      this.max = this.labels.length - 1;
      this.step = 1;
    }
  }

  constructor() {
    super();
    this.addEventListener('pointerdown', this.pointerDown);
    this.addEventListener('pointermove', this.pointerMove);
    this.addEventListener('lostpointercapture', this.lostPointerCapture);
    this.addEventListener('keydown', this.handleKeydown);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.normalizeValue();
    this.addEventListener('keyup', this.handleKeyUp);
  }

  public override disconnectedCallback() {
    this.removeEventListener('keyup', this.handleKeyUp);
    super.disconnectedCallback();
  }

  protected handleKeyUp() {
    this.activeThumb?.part.add('focused');
  }

  protected handleSlotChange() {
    this.labels =
      this.labelElements && this.labelElements.length
        ? this.labelElements.map((e) => e.textContent as string)
        : undefined;
  }

  /* c8 ignore next 3 */
  protected get activeValue() {
    return 0;
  }

  /* c8 ignore next */
  protected normalizeValue(): void {}

  /* c8 ignore next 3 */
  protected getTrackStyle(): StyleInfo {
    return {};
  }

  /* c8 ignore next 3 */
  protected updateValue(_increment: number): boolean {
    return false;
  }

  /* c8 ignore next 3 */
  protected renderThumbs(): TemplateResult<1> {
    return html``;
  }

  /* c8 ignore next */
  protected emitInputEvent() {}

  /* c8 ignore next */
  protected emitChangeEvent() {}

  protected get actualMin(): number {
    return typeof this.lowerBound === 'number'
      ? (this.lowerBound as number)
      : this.min;
  }

  protected get actualMax(): number {
    return typeof this.upperBound === 'number'
      ? (this.upperBound as number)
      : this.max;
  }

  protected validateValue(value: number) {
    value = this.valueInRange(value, this.actualMin, this.actualMax);
    value = this.normalizeByStep(value);

    return value;
  }

  protected formatValue(value: number) {
    return this.valueFormat
      ? this.valueFormat.replace(
          '{0}',
          value.toLocaleString(this.locale, this.valueFormatOptions)
        )
      : value.toLocaleString(this.locale, this.valueFormatOptions);
  }

  private normalizeByStep(value: number) {
    return this.step ? value - ((value - this.actualMin) % this.step) : value;
  }

  protected closestHandle(_event: PointerEvent): HTMLElement {
    return this.thumb;
  }

  private totalTickCount() {
    const primaryTicks = this.labels
      ? this.primaryTicks > 0
        ? this.labels.length
        : 0
      : this.primaryTicks === 1
      ? 2
      : this.primaryTicks;

    return primaryTicks > 0
      ? (primaryTicks - 1) * this.secondaryTicks + primaryTicks
      : this.secondaryTicks > 0
      ? this.secondaryTicks
      : 0;
  }

  private tickValue(idx: number) {
    const tickCount = this.totalTickCount();
    const labelStep =
      tickCount > 1
        ? (this.max - this.min) / (tickCount - 1)
        : this.max - this.min;
    const labelVal = labelStep * idx;

    return this.min + labelVal;
  }

  private isPrimary(idx: number) {
    return this.primaryTicks <= 0
      ? false
      : idx % (this.secondaryTicks + 1) === 0;
  }

  private showThumbLabels() {
    if (this.disabled || this.hideTooltip) {
      return;
    }

    if (this.thumbHoverTimer) {
      clearTimeout(this.thumbHoverTimer);
      this.thumbHoverTimer = null;
    }

    this.thumbLabelsVisible = true;
  }

  private hideThumbLabels() {
    if (this.pointerCaptured || !this.thumbLabelsVisible) {
      return;
    }

    this.thumbHoverTimer = setTimeout(() => {
      this.thumbLabelsVisible = false;
    }, 750);
  }

  private valueInRange(value: number, min = 0, max = 100) {
    return Math.max(Math.min(value, max), min);
  }

  protected valueToFraction(value: number) {
    return (value - this.min) / (this.max - this.min);
  }

  private calculateTrackUpdate(mouseX: number): number {
    if (!this.activeThumb) {
      return 0;
    }

    const thumbBoundaries = this.activeThumb.getBoundingClientRect();
    const thumbCenter = (thumbBoundaries.right - thumbBoundaries.left) / 2;
    const thumbPositionX = thumbBoundaries.left + thumbCenter;

    const scale = this.getBoundingClientRect().width / (this.max - this.min);
    const change = isLTR(this)
      ? mouseX - thumbPositionX
      : thumbPositionX - mouseX;

    if (this.step) {
      const stepDistance = scale * this.step;
      const stepDistanceCenter = stepDistance / 2;

      // If the thumb scale range (slider update) is less than a half step,
      // the position stays the same.
      const scaleXPositive = Math.abs(change);
      if (scaleXPositive < stepDistanceCenter) {
        return 0;
      }

      return Math.round(change / stepDistance) * this.step;
    } else {
      return change / scale;
    }
  }

  private updateSlider(mouseX: number) {
    if (this.disabled) {
      return;
    }

    const increment = this.calculateTrackUpdate(mouseX);
    if (this.activeThumb && increment !== 0) {
      this.updateValue(increment);
    }
  }

  private pointerDown = (event: PointerEvent) => {
    const thumb = this.closestHandle(event);
    thumb.focus();

    this.startValue = this.activeValue;
    this.updateSlider(event.clientX);

    this.setPointerCapture(event.pointerId);
    this.pointerCaptured = true;
    this.showThumbLabels();
    event.preventDefault();
    this.activeThumb?.part.remove('focused');
  };

  private pointerMove = (event: PointerEvent) => {
    if (this.pointerCaptured) {
      this.updateSlider(event.clientX);
    }
  };

  private lostPointerCapture = () => {
    this.pointerCaptured = false;
    this.hideThumbLabels();

    if (this.startValue! !== this.activeValue) {
      this.emitChangeEvent();
    }
    this.startValue = undefined;
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }

    const { key } = event;

    let increment = 0;
    const value = this.activeValue;
    const step = this.step ? this.step : 1;
    const ltr = isLTR(this);

    switch (key) {
      case 'ArrowLeft':
        increment += ltr ? -step : step;
        break;
      case 'ArrowRight':
        increment += ltr ? step : -step;
        break;
      case 'ArrowUp':
        increment = step;
        break;
      case 'ArrowDown':
        increment = -step;
        break;
      case 'Home':
        increment = this.actualMin - value;
        break;
      case 'End':
        increment = this.actualMax - value;
        break;
      case 'PageUp':
        increment = Math.max((this.actualMax - this.actualMin) / 10, step);
        break;
      case 'PageDown':
        increment = -Math.max((this.actualMax - this.actualMin) / 10, step);
        break;
      default:
        return;
    }

    if (increment) {
      const updated = this.updateValue(increment);
      this.showThumbLabels();
      this.hideThumbLabels();

      if (updated) {
        this.emitChangeEvent();
      }
    }
  };

  protected handleThumbPointerEnter = () => {
    this.showThumbLabels();
  };

  protected handleThumbPointerLeave = () => {
    this.hideThumbLabels();
  };

  protected renderTicks() {
    const groups = [];
    for (let i = 0, totalCount = this.totalTickCount(); i < totalCount; i++) {
      const isPrimary = this.isPrimary(i);
      groups.push(html`
        <div part="tick-group">
          <div part="tick" data-primary=${isPrimary}>
            ${(isPrimary ? this.hidePrimaryLabels : this.hideSecondaryLabels)
              ? html``
              : html`
                  <div part="tick-label">
                    <span part="tick-label-inner">
                      ${this.labels
                        ? isPrimary
                          ? this.labels[
                              Math.round(i / (this.secondaryTicks + 1))
                            ]
                          : ''
                        : this.formatValue(this.tickValue(i))}
                    </span>
                  </div>
                `}
          </div>
        </div>
      `);
    }
    return groups;
  }

  protected renderThumb(value: number, ariaLabel?: string, thumbId?: string) {
    const percent = `${this.valueToFraction(value) * 100}%`;

    return html`
      <div
        part="thumb"
        id=${ifDefined(thumbId)}
        tabindex=${this.disabled ? -1 : 0}
        style=${styleMap({ insetInlineStart: percent })}
        role="slider"
        aria-valuemin=${this.actualMin}
        aria-valuemax=${this.actualMax}
        aria-valuenow=${value}
        aria-valuetext=${ifDefined(
          this.labels
            ? this.labels[value]
            : this.valueFormat || this.valueFormatOptions
            ? this.formatValue(value)
            : undefined
        )}
        aria-label=${ifDefined(ariaLabel)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        @pointerenter=${this.handleThumbPointerEnter}
        @pointerleave=${this.handleThumbPointerLeave}
        @focus=${(ev: Event) => (this.activeThumb = ev.target as HTMLElement)}
        @blur=${() => (
          this.activeThumb?.part.remove('focused'),
          (this.activeThumb = undefined)
        )}
      ></div>
      ${this.hideTooltip
        ? html``
        : html`
            <div
              part="thumb-label"
              style=${styleMap({
                opacity: this.thumbLabelsVisible ? '1' : '0',
                insetInlineStart: percent,
              })}
            >
              <div part="thumb-label-inner">
                ${this.labels ? this.labels[value] : this.formatValue(value)}
              </div>
            </div>
          `}
    `;
  }

  private renderSteps() {
    if (!this.discreteTrack || !this.step) {
      return html``;
    }

    const trackRange = this.max - this.min;
    const interval = ((100 / (trackRange / this.step)) * 10) / 10;

    return html`
      <div part="steps">
        <svg width="100%" height="100%" style="display: flex">
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="currentColor"
            stroke-dasharray="0, calc(${interval * Math.sqrt(2)}%)"
            stroke-linecap="round"
            stroke-width="2px"
          ></line>
        </svg>
      </div>
    `;
  }

  protected override render() {
    return html`
      <div part="base">
        ${this.tickOrientation === 'mirror' || this.tickOrientation === 'start'
          ? html`<div part="ticks">${this.renderTicks()}</div>`
          : html``}
        <div part="track">
          <div part="inactive"></div>
          <div part="fill" style=${styleMap(this.getTrackStyle())}></div>
          ${this.renderSteps()}
        </div>
        ${this.tickOrientation !== 'start'
          ? html`<div part="ticks">${this.renderTicks()}</div>`
          : html``}
        <div part="thumbs">${this.renderThumbs()}</div>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}

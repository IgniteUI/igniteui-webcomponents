import { html, LitElement, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { watch } from '../common/decorators';
import { styles } from './slider.material.css';

export class IgcSliderBaseComponent extends LitElement {
  /** @private */
  public static styles = [styles];

  @query(`[part='thumb']`)
  protected thumb!: HTMLElement;

  private _lowerBound?: number;
  private _upperBound?: number;
  private _min = 0;
  private _max = 100;
  private startValue?: number;
  private pointerCaptured = false;
  private thumbHoverTimer: any;
  protected activeThumb?: HTMLElement;

  @state()
  private thumbLabelsVisible = false;

  public set min(value: number) {
    if (value < this.max) {
      const oldVal = this._min;
      this._min = value;
      this.requestUpdate('min', oldVal);

      if (typeof this.lowerBound === 'number' && this.lowerBound < value) {
        this.lowerBound = value;
      }
    }
  }

  /**
   * The minimum value of the slider scale. Defaults to 0.
   */
  @property({ type: Number })
  public get min() {
    return this._min;
  }

  public set max(value: number) {
    if (value > this.min) {
      const oldVal = this._max;
      this._max = value;
      this.requestUpdate('max', oldVal);

      if (typeof this.upperBound === 'number' && this.upperBound > value) {
        this.upperBound = value;
      }
    }
  }

  /**
   * The maximum value of the slider scale. Defaults to 100.
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
   */
  @property({ type: Number, attribute: 'upper-bound' })
  public get upperBound(): number | undefined {
    return this._upperBound;
  }

  /**
   * Disables the UI interactions of the slider.
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Marks the slider track as discrete so it displays the steps.
   * If the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.
   */
  @property({ type: Boolean, attribute: 'discrete-track' })
  public discreteTrack = false;

  /**
   * Hides the thumb tooltip.
   */
  @property({ type: Boolean, attribute: 'hide-tooltip' })
  public hideTooltip = false;

  /**
   * Specifies the granularity that the value must adhere to.
   * If set to 0 no stepping is implied and any value in the range is allowed.
   */
  @property({ type: Number })
  public step = 1;

  /**
   * The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.
   */
  @property({ type: Number, attribute: 'primary-ticks' })
  public primaryTicks = 0;

  /**
   * The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed.
   */
  @property({ type: Number, attribute: 'secondary-ticks' })
  public secondaryTicks = 0;

  /**
   * Changes the orientation of the ticks.
   */
  @property({ attribute: 'tick-orientation' })
  public tickOrientation: 'mirror' | 'start' | 'end' = 'end';

  /**
   * Hides the primary tick labels.
   */
  @property({ type: Boolean, attribute: 'hide-primary-labels' })
  public hidePrimaryLabels = false;

  /**
   * Hides the secondary tick labels.
   */
  @property({ type: Boolean, attribute: 'hide-secondary-labels' })
  public hideSecondaryLabels = false;

  /**
   * Specifies a custom function to format the labels.
   */
  @property({ attribute: false })
  public labelFormatter: ((value: number) => string) | undefined;

  /**
   * The degrees for the rotation of the tick labels. Defaults to 0.
   */
  @property({ type: Number, reflect: true, attribute: 'tick-label-rotation' })
  public tickLabelRotation: 0 | 90 | -90 = 0;

  @watch('min', { waitUntilFirstUpdate: true })
  @watch('max', { waitUntilFirstUpdate: true })
  @watch('lowerBound', { waitUntilFirstUpdate: true })
  @watch('upperBound', { waitUntilFirstUpdate: true })
  @watch('step', { waitUntilFirstUpdate: true })
  protected constraintsChange() {
    this.normalizeValue();
  }

  constructor() {
    super();
    this.addEventListener('pointerdown', this.pointerDown);
    this.addEventListener('pointermove', this.pointerMove);
    this.addEventListener('lostpointercapture', this.lostPointerCapture);
    this.addEventListener('keydown', this.handleKeydown);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.normalizeValue();
  }

  /* c8 ignore next 3 */
  protected get activeValue() {
    return 0;
  }

  /* c8 ignore next 3 */
  protected get fillValue() {
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

  private get actualMin(): number {
    return typeof this.lowerBound === 'number'
      ? (this.lowerBound as number)
      : this.min;
  }

  private get actualMax(): number {
    return typeof this.upperBound === 'number'
      ? (this.upperBound as number)
      : this.max;
  }

  private get isLTR(): boolean {
    const styles = window.getComputedStyle(this);
    return styles.getPropertyValue('direction') === 'ltr';
  }

  protected validateValue(value: number) {
    value = this.valueInRange(value, this.actualMin, this.actualMax);
    value = this.normalizeByStep(value);

    return value;
  }

  private normalizeByStep(value: number) {
    return this.step ? value - ((value - this.actualMin) % this.step) : value;
  }

  protected closestHandle(_event: PointerEvent): HTMLElement {
    return this.thumb;
  }

  private totalTickCount() {
    if (this.primaryTicks === 1) {
      this.primaryTicks = 2;
    }

    return this.primaryTicks > 0
      ? (this.primaryTicks - 1) * this.secondaryTicks + this.primaryTicks
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
    const change = this.isLTR
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

    switch (key) {
      case 'ArrowLeft':
        increment += this.isLTR ? -step : step;
        break;
      case 'ArrowRight':
        increment += this.isLTR ? step : -step;
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

  private handleThumbPointerEnter = () => {
    this.showThumbLabels();
  };

  private handleThumbPointerLeave = () => {
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
                      ${this.labelFormatter
                        ? this.labelFormatter(this.tickValue(i))
                        : this.tickValue(i)}
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
              ${this.labelFormatter ? this.labelFormatter(value) : value}
            </div>
          `}
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
          this.labelFormatter ? this.labelFormatter(value) : undefined
        )}
        aria-label=${ifDefined(ariaLabel)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        @pointerenter=${this.handleThumbPointerEnter}
        @pointerleave=${this.handleThumbPointerLeave}
        @focus=${(ev: Event) => (this.activeThumb = ev.target as HTMLElement)}
        @blur=${() => (this.activeThumb = undefined)}
      ></div>
    `;
  }

  private renderSteps(valueFraction = 1) {
    if (!this.discreteTrack || !this.step) {
      return html`
        <svg width="100%" height="100%" style="display: flex">
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="currentColor"
            stroke-width="2px"
          ></line>
        </svg>
      `;
    }

    const trackRange = this.max - this.min;
    const interval = ((100 / (trackRange / this.step)) * 10) / 10;

    return html`
      <svg width="100%" height="100%" style="display: flex">
        <line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke="currentColor"
          stroke-dasharray="calc(${(interval / valueFraction) *
          Math.sqrt(2)}% - 2px), 2px"
          stroke-dashoffset="-1px"
          stroke-width="2px"
        ></line>
      </svg>
    `;
  }

  protected render() {
    return html`
      <div part="base">
        ${this.tickOrientation === 'mirror' || this.tickOrientation === 'start'
          ? html`<div part="ticks">${this.renderTicks()}</div>`
          : html``}
        <div part="track">
          <div part="fill" style=${styleMap(this.getTrackStyle())}>
            ${this.renderSteps(this.valueToFraction(this.fillValue))}
          </div>
          <div part="inactive">${this.renderSteps()}</div>
        </div>
        ${this.tickOrientation !== 'start'
          ? html`<div part="ticks">${this.renderTicks()}</div>`
          : html``}
        <div part="thumbs">${this.renderThumbs()}</div>
      </div>
    `;
  }
}

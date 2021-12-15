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

  @property({ type: Number, attribute: 'upper-bound' })
  public get upperBound(): number | undefined {
    return this._upperBound;
  }

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @property({ type: Boolean, attribute: 'discrete-track' })
  public discreteTrack = false;

  @property({ type: Boolean, attribute: 'hide-tooltip' })
  public hideTooltip = false;

  @property({ type: Number })
  public step = 1;

  @property({ type: Number, attribute: 'primary-ticks' })
  public primaryTicks = 0;

  @property({ type: Number, attribute: 'secondary-ticks' })
  public secondaryTicks = 0;

  @property({ attribute: 'tick-orientation' })
  public tickOrientation: 'mirror' | 'start' | 'end' = 'end';

  @property({ type: Boolean, reflect: true, attribute: 'show-primary-labels' })
  public showPrimaryLabels = true;

  @property({
    type: Boolean,
    reflect: true,
    attribute: 'show-secondary-labels',
  })
  public showSecondaryLabels = true;

  @property({ attribute: false })
  public labelFormatter: ((value: number) => string) | undefined;

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

  protected get activeValue() {
    return 0;
  }

  protected get fillValue() {
    return 0;
  }

  protected normalizeValue(): void {}

  protected getTrackStyle(): StyleInfo {
    return {};
  }

  protected updateValue(_increment: number): boolean {
    return false;
  }

  protected renderThumbs(): TemplateResult<1> {
    return html``;
  }

  protected emitInputEvent() {}

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
    return value - ((value - this.actualMin) % this.step);
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

  private hiddenTickLabels(idx: number) {
    return this.isPrimary(idx)
      ? this.showPrimaryLabels
      : this.showSecondaryLabels;
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

    const scaleX = this.isLTR
      ? mouseX - thumbPositionX
      : thumbPositionX - mouseX;
    const stepDistance =
      (this.getBoundingClientRect().width / (this.max - this.min)) * this.step;
    const stepDistanceCenter = stepDistance / 2;

    // If the thumb scale range (slider update) is less than a half step,
    // the position stays the same.
    const scaleXPositive = Math.abs(scaleX);
    if (scaleXPositive < stepDistanceCenter) {
      return 0;
    }

    return Math.round(scaleX / stepDistance) * this.step;
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

    switch (key) {
      case 'ArrowLeft':
        increment += this.isLTR ? -this.step : this.step;
        break;
      case 'ArrowRight':
        increment += this.isLTR ? this.step : -this.step;
        break;
      case 'ArrowUp':
        increment = this.step;
        break;
      case 'ArrowDown':
        increment = -this.step;
        break;
      case 'Home':
        increment = this.actualMin - value;
        break;
      case 'End':
        increment = this.actualMax - value;
        break;
      case 'PageUp':
        increment = Math.max((this.actualMax - this.actualMin) / 10, this.step);
        break;
      case 'PageDown':
        increment = -Math.max(
          (this.actualMax - this.actualMin) / 10,
          this.step
        );
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
    for (let i = 0; i < this.totalTickCount(); i++) {
      groups.push(html` <div part="tick-group">
        <div part="tick" data-primary=${this.isPrimary(i)}>
          ${this.hiddenTickLabels(i)
            ? html`<div part="tick-label">
                <span part="tick-label-inner">
                  ${this.labelFormatter
                    ? this.labelFormatter(this.tickValue(i))
                    : this.tickValue(i)}
                </span>
              </div>`
            : html``}
        </div>
      </div>`);
    }
    return groups;
  }

  protected renderThumb(value: number, thumbId?: string) {
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

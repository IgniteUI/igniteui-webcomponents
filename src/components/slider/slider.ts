import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './slider.material.css';

export interface SliderChangeParameters {
  oldValue: number | IRangeSliderValue;
}

export interface IgcSliderEventMap {
  igcChange: CustomEvent<SliderChangeParameters>;
}
export interface IRangeSliderValue {
  lower: number;
  upper: number;
}

export default class IgcSliderComponent extends EventEmitterMixin<
  IgcSliderEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-slider';

  /** @private */
  public static styles = [styles];

  // Limit handle travel zone
  private _pMin = 0;
  private _pMax = 1;

  private _lowerValue?: number;
  private _upperValue?: number;
  private _value: number | IRangeSliderValue = 0;
  private _hasViewInit = false;
  private _activeThumb: HTMLElement | undefined;
  private thumbHoverTimer: any;

  private get isLTR(): boolean {
    const styles = window.getComputedStyle(this);
    return styles.getPropertyValue('direction') === 'ltr';
  }

  private get isRange(): boolean {
    return this.type === 'range';
  }

  public get lowerValue(): number {
    if (
      !Number.isNaN(this._lowerValue) &&
      this._lowerValue !== undefined &&
      this._lowerValue >= this.lowerBound
    ) {
      return this._lowerValue;
    }

    return this.lowerBound;
  }

  public set lowerValue(value: number) {
    value = this.valueInRange(value, this.lowerBound, this.upperBound);
    this._lowerValue = value;
  }

  public get upperValue() {
    if (
      !Number.isNaN(this._upperValue) &&
      this._upperValue !== undefined &&
      this._upperValue <= this.upperBound
    ) {
      return this._upperValue;
    }

    return this.upperBound;
  }

  public set upperValue(value: number) {
    value = this.valueInRange(value, this.lowerBound, this.upperBound);
    this._upperValue = value;
  }

  private get thumbPositionX() {
    if (!this._activeThumb) {
      return;
    }

    const thumbBoundaries = this._activeThumb.getBoundingClientRect();
    const thumbCenter = (thumbBoundaries.right - thumbBoundaries.left) / 2;
    return thumbBoundaries.left + thumbCenter;
  }

  constructor() {
    super();
    this.addEventListener('pointerdown', this.pointerDown);
    this.addEventListener('pointerup', this.pointerUp);
    this.addEventListener('keydown', this.handleKeydown);
  }

  public firstUpdated() {
    this._hasViewInit = true;
    this.positionHandlersAndUpdateTrack();
    this.normalizeByStep();
  }

  @query('#thumbFrom')
  private thumbFrom!: HTMLElement;

  @query('#thumbTo')
  private thumbTo!: HTMLElement;

  @query('#labelFrom')
  private labelFrom!: HTMLElement;

  @query('#labelTo')
  private labelTo!: HTMLElement;

  @query('#fill')
  private filledTrack!: HTMLElement;

  @state()
  private thumbLabelsVisible = false;

  public set value(value: number | IRangeSliderValue) {
    const oldValue = this._value;
    if (this._hasViewInit) {
      this.setValue(value);
      this.positionHandlersAndUpdateTrack();
    } else {
      this._value = value;
    }
    this.requestUpdate('value', oldValue);
  }

  @property({ attribute: false })
  public get value(): number | IRangeSliderValue {
    if (this.isRange) {
      return {
        lower: this.valueInRange(
          this.lowerValue,
          this.lowerBound,
          this.upperBound
        ),
        upper: this.valueInRange(
          this.upperValue,
          this.lowerBound,
          this.upperBound
        ),
      };
    } else {
      return this.valueInRange(
        this.upperValue,
        this.lowerBound,
        this.upperBound
      );
    }
  }

  @property({ type: Number })
  public min = 0;

  @property({ type: Number })
  public max = 100;

  @property({ type: Number, attribute: 'lower-bound' })
  public lowerBound = 0;

  @property({ type: Number, attribute: 'upper-bound' })
  public upperBound = 0;

  @property()
  public type: 'slider' | 'range' = 'slider';

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @property({ type: Boolean, reflect: true })
  public continuous = false;

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
  public labelFormatter: ((tickLabel: string) => string) | undefined;

  @property({ type: Number, reflect: true, attribute: 'tick-label-rotation' })
  public tickLabelRotation: 0 | 90 | -90 = 0;

  private validateInitialRangeValue(value: IRangeSliderValue) {
    if (value.lower < this.lowerBound && value.upper < this.lowerBound) {
      value.upper = this.lowerBound;
      value.lower = this.lowerBound;
    }

    if (value.lower > this.upperBound && value.upper > this.upperBound) {
      value.upper = this.upperBound;
      value.lower = this.upperBound;
    }

    if (value.upper < value.lower) {
      value.upper = this.upperValue;
      value.lower = this.lowerValue;
    }

    return value;
  }

  protected setValue(value: number | IRangeSliderValue) {
    let res;
    if (!this.isRange) {
      this.upperValue = (value as number) - ((value as number) % this.step);
      res = this.upperValue;
    } else {
      value = this.validateInitialRangeValue(value as IRangeSliderValue);
      this.upperValue = (value as IRangeSliderValue).upper;
      this.lowerValue = (value as IRangeSliderValue).lower;
      res = { lower: this.lowerValue, upper: this.upperValue };
    }

    this._value = res;
    this.emitEvent('igcChange');
  }

  @watch('lowerBound')
  protected updateMinTravelZoneAndTrack() {
    this._pMin = this.valueToFraction(this.lowerBound, 0, 1);
    this.positionHandlersAndUpdateTrack();
  }

  @watch('upperBound')
  protected updateMaxTravelZoneAndTrack() {
    this._pMax = this.valueToFraction(this.upperBound, 0, 1);
    this.positionHandlersAndUpdateTrack();
  }

  @watch('min')
  protected updateMinTravelZoneAndBound() {
    this._pMin = 0;
  }

  @watch('max')
  protected updateMaxTravelZoneAndBound() {
    this._pMax = 1;
  }

  private swapThumb(value: IRangeSliderValue) {
    if (this._activeThumb) {
      if (this._activeThumb.id === 'thumbFrom') {
        value.upper = this.upperValue;
        value.lower = this.upperValue;
      } else {
        value.upper = this.lowerValue;
        value.lower = this.lowerValue;
      }
      this.toggleThumb();
    }

    return value;
  }

  private toggleThumb() {
    if (this._activeThumb?.id === 'thumbFrom') {
      this.thumbTo.style.zIndex = '1';
      this._activeThumb = this.thumbTo;
    } else {
      this.thumbFrom.style.zIndex = '1';
      this._activeThumb = this.thumbFrom;
    }
  }

  private findClosestThumb(event: PointerEvent) {
    if (this.isRange) {
      this.closestHandle(event);
    } else {
      this.thumbTo.focus();
      this._activeThumb = this.thumbTo;
    }

    this.updateSlider(event.clientX);
  }

  private closestHandle(event: PointerEvent) {
    const fromOffset =
      this.thumbFrom.offsetLeft + this.thumbFrom.offsetWidth / 2;
    const toOffset = this.thumbTo.offsetLeft + this.thumbTo.offsetWidth / 2;
    const xPointer = event.clientX - this.getBoundingClientRect().left;
    const match = this.closestTo(xPointer, [fromOffset, toOffset]);

    if (fromOffset === toOffset && toOffset < xPointer) {
      this.thumbTo.focus();
      this._activeThumb = this.thumbTo;
    } else if (fromOffset === toOffset && toOffset > xPointer) {
      this.thumbFrom.focus();
      this._activeThumb = this.thumbFrom;
    } else if (match === fromOffset) {
      this.thumbFrom.focus();
      this._activeThumb = this.thumbFrom;
    } else {
      this.thumbTo.focus();
      this._activeThumb = this.thumbTo;
    }
  }

  private totalTickNumber() {
    if (this.primaryTicks === 1) {
      this.primaryTicks = 2;
    }

    return this.primaryTicks > 0
      ? (this.primaryTicks - 1) * this.secondaryTicks + this.primaryTicks
      : this.secondaryTicks > 0
      ? this.secondaryTicks
      : 0;
  }

  private tickLabel(idx: number) {
    const labelStep =
      this.totalTickNumber() > 1
        ? (Math.max(this.min, this.max) - Math.min(this.min, this.max)) /
          (this.totalTickNumber() - 1)
        : Math.max(this.min, this.max) - Math.min(this.min, this.max);
    const labelVal = labelStep * idx;

    return (this.min + labelVal).toFixed(2);
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
    if (this.disabled) {
      return;
    }

    if (this.thumbHoverTimer) {
      clearTimeout(this.thumbHoverTimer);
      this.thumbHoverTimer = null;
    }

    this.thumbLabelsVisible = true;
  }

  private hideThumbLabels() {
    if (this.disabled) {
      return;
    }

    this.thumbHoverTimer = setTimeout(() => {
      this.thumbLabelsVisible = false;
    }, 750);
  }

  private closestTo(goal: number, positions: number[]): number {
    return positions.reduce((previous, current) =>
      Math.abs(goal - current) < Math.abs(goal - previous) ? current : previous
    );
  }

  private calculateStepDistance() {
    return (
      (this.getBoundingClientRect().width / (this.max - this.min)) * this.step
    );
  }

  private valueInRange(value: number, min = 0, max = 100) {
    return Math.max(Math.min(value, max), min);
  }

  private valueToFraction(value: number, pMin = this._pMin, pMax = this._pMax) {
    return this.valueInRange(
      (value - this.min) / (this.max - this.min),
      pMin,
      pMax
    );
  }

  @watch('step', { waitUntilFirstUpdate: true })
  private normalizeByStep() {
    if (this.isRange) {
      const rangeValue = this.value as IRangeSliderValue;
      this.value = {
        lower: rangeValue.lower - (rangeValue.lower % this.step),
        upper: rangeValue.upper - (rangeValue.upper % this.step),
      };
    } else {
      const numValue = this.value as number;
      this.value = numValue - (numValue % this.step);
    }
  }

  private positionHandler(
    thumbHandle: HTMLElement,
    labelHandle: HTMLElement,
    position: number
  ) {
    const percent = `${this.valueToFraction(position) * 100}%`;
    const dir = this.isLTR ? 'left' : 'right';

    if (thumbHandle) {
      thumbHandle.style[dir] = percent;
    }

    if (labelHandle) {
      labelHandle.style[dir] = percent;
    }
  }

  private updateTrack() {
    const fromPosition = this.valueToFraction(this.lowerValue);
    const toPosition = this.valueToFraction(this.upperValue);
    const positionGap = toPosition - fromPosition;

    let filledTrackStyle: Partial<CSSStyleDeclaration>;
    let trackLeftIndention = fromPosition;

    if (this.isRange) {
      if (positionGap) {
        trackLeftIndention = Math.round((1 / positionGap) * fromPosition * 100);
      }

      trackLeftIndention = this.isLTR
        ? trackLeftIndention
        : -trackLeftIndention;
      filledTrackStyle = {
        transform: `scaleX(${positionGap}) translateX(${trackLeftIndention}%)`,
      };
    } else {
      filledTrackStyle = {
        transform: `scaleX(${toPosition})`,
      };
    }

    if (this.filledTrack) {
      Object.assign(this.filledTrack.style, filledTrackStyle);
    }
  }

  @watch('max')
  @watch('min')
  protected positionHandlersAndUpdateTrack() {
    if (!this.isRange) {
      this.positionHandler(this.thumbTo, this.labelTo, this.value as number);
    } else {
      this.positionHandler(
        this.thumbTo,
        this.labelTo,
        (this.value as IRangeSliderValue).upper
      );
      this.positionHandler(
        this.thumbFrom,
        this.labelFrom,
        (this.value as IRangeSliderValue).lower
      );
    }

    this.updateTrack();
  }

  private updateThumbValue(mouseX: number) {
    const calculatedValue = this.calculateTrackUpdate(mouseX);
    if (this._activeThumb && calculatedValue !== 0) {
      this.updateValue(calculatedValue);
    }
  }

  private updateValue(value: number) {
    let newValue: IRangeSliderValue;
    if (this.isRange) {
      if (this._activeThumb?.id === 'thumbFrom') {
        newValue = {
          lower: (this.value as IRangeSliderValue).lower + value,
          upper: (this.value as IRangeSliderValue).upper,
        };
      } else {
        newValue = {
          lower: (this.value as IRangeSliderValue).lower,
          upper: (this.value as IRangeSliderValue).upper + value,
        };
      }

      // Swap the thumbs if a collision appears.
      if (newValue.lower >= newValue.upper) {
        this.value = this.swapThumb(newValue);
      } else {
        this.value = newValue;
      }
    } else {
      this.value = (this.value as number) + value;
    }
  }

  private calculateTrackUpdate(mouseX: number): number {
    if (!this.thumbPositionX) {
      return 0;
    }

    const scaleX = this.isLTR
      ? mouseX - this.thumbPositionX
      : this.thumbPositionX - mouseX;
    const stepDistanceCenter = this.calculateStepDistance() / 2;

    // If the thumb scale range (slider update) is less than a half step,
    // the position stays the same.
    const scaleXPositive = Math.abs(scaleX);
    if (scaleXPositive < stepDistanceCenter) {
      return 0;
    }

    return this.stepToProceed(scaleX, this.calculateStepDistance());
  }

  private stepToProceed(scaleX: number, stepDist: number) {
    return Math.round(scaleX / stepDist) * this.step;
  }

  private updateSlider(mouseX: number) {
    if (this.disabled) {
      return;
    }

    this.updateThumbValue(mouseX);

    this.positionHandlersAndUpdateTrack();
  }

  private pointerDown = (event: PointerEvent) => {
    this.findClosestThumb(event);

    if (!this._activeThumb) {
      return;
    }

    this._activeThumb.setPointerCapture(event.pointerId);
    this._activeThumb.addEventListener('pointermove', this.pointerMove);
    this.showThumbLabels();
    event.preventDefault();
  };

  private pointerUp = (event: PointerEvent) => {
    if (!this._activeThumb) {
      return;
    }

    this._activeThumb.removeEventListener('pointermove', this.pointerMove);
    this._activeThumb.releasePointerCapture(event.pointerId);

    this.hideThumbLabels();
    this.emitEvent('igcChange');
  };

  private pointerMove = (event: PointerEvent) => {
    this.updateSlider(event.clientX);
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }

    const { key } = event;

    if (['ArrowLeft', 'ArrowRight'].includes(key)) {
      let increment = 0;

      switch (key) {
        case 'ArrowLeft':
          increment += this.isLTR ? -this.step : this.step;
          break;
        case 'ArrowRight':
          increment += this.isLTR ? this.step : -this.step;
          break;
        default:
          return;
      }

      this.updateValue(increment);
      this.positionHandlersAndUpdateTrack();
    }
  };

  private handleThumbPointerEnter = () => {
    this.showThumbLabels();
  };

  private handleThumbPointerLeave = () => {
    this.hideThumbLabels();
  };

  public incrementValue() {
    if (this.isRange) {
      if (this._activeThumb?.id === 'thumbFrom') {
        this.lowerValue += this.step;
      } else this.upperValue += this.step;
    }
    this.value = (this.value as number) + this.step;
  }

  public decrementValue() {
    if (this.isRange) {
      if (this._activeThumb?.id === 'thumbFrom') {
        this.lowerValue -= this.step;
      } else this.upperValue -= this.step;
    }
    this.value = (this.value as number) - this.step;
  }

  protected renderTicks() {
    const groups = [];
    for (let i = 0; i < this.totalTickNumber(); i++) {
      groups.push(html` <div part="tick-group">
        <div part="tick" data-primary=${this.isPrimary(i)}>
          ${this.hiddenTickLabels(i)
            ? html`<span part="tick-label"
                >${this.labelFormatter
                  ? this.labelFormatter(this.tickLabel(i))
                  : this.tickLabel(i)}</span
              >`
            : html``}
        </div>
      </div>`);
    }
    return groups;
  }

  private renderThumb(isFrom = false) {
    const value = this.isRange
      ? isFrom
        ? (this.value as IRangeSliderValue).lower
        : (this.value as IRangeSliderValue).upper
      : (this.value as number);

    return html` <div
        part="thumb-label"
        id=${isFrom ? 'labelFrom' : 'labelTo'}
        style=${styleMap({ opacity: this.thumbLabelsVisible ? '1' : '0' })}
      >
        ${value}
      </div>
      <div
        part="thumb"
        id=${isFrom ? 'thumbFrom' : 'thumbTo'}
        tabindex=${this.disabled ? -1 : 0}
        role="slider"
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${value}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        @pointerenter=${this.handleThumbPointerEnter}
        @pointerleave=${this.handleThumbPointerLeave}
      ></div>`;
  }

  private renderSteps() {
    if (this.continuous || this.step <= 0) {
      return html``;
    }

    const color = 'white';
    const trackProgress = 100;
    const trackRange = this.max - this.min;
    const interval = ((trackProgress / (trackRange / this.step)) * 10) / 10;

    return html`<div part="steps">
      <svg width="100%" height="100%" style="display: flex">
        <line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke="${color}"
          stroke-dasharray="1.5px, ${interval}%"
          stroke-linecap="round"
          stroke-width="2px"
        ></line>
      </svg>
    </div>`;
  }

  protected render() {
    return html`
      <div part="base">
        ${this.tickOrientation === 'mirror' || this.tickOrientation === 'start'
          ? html`<div part="ticks">${this.renderTicks()}</div>`
          : html``}
        <div part="track">
          <div part="fill" id="fill"></div>
          <div part="inactive" id="inactive"></div>
          ${this.renderSteps()}
        </div>
        ${this.tickOrientation !== 'start'
          ? html`<div part="ticks">${this.renderTicks()}</div>`
          : html``}
        <div part="thumbs">
          ${this.isRange ? this.renderThumb(true) : html``}
          ${this.renderThumb()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-slider': IgcSliderComponent;
  }
}

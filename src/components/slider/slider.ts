import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './slider.material.css';

export interface IgcSliderEventMap {
  igcInput: CustomEvent<number | IgcRangeSliderValue>;
  igcChange: CustomEvent<number | IgcRangeSliderValue>;
}
export interface IgcRangeSliderValue {
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

  private _value: number | IgcRangeSliderValue = 0;
  private _lowerBound?: number;
  private _upperBound?: number;
  private _min = 0;
  private _max = 100;
  private startValue?: number | IgcRangeSliderValue;
  private pointerCaptured = false;
  private thumbHoverTimer: any;
  private activeThumb?: HTMLElement;

  @state()
  private thumbLabelsVisible = false;

  @query('#thumbFrom')
  private thumbFrom!: HTMLElement;

  @query('#thumbTo')
  private thumbTo!: HTMLElement;

  public set value(val: number | IgcRangeSliderValue) {
    const oldVal = this._value;
    this.setValue(val);
    this.requestUpdate('value', oldVal);
  }

  @property({ attribute: false })
  public get value() {
    return this._value;
  }

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

  @watch('type')
  protected typeChanged(oldValue: any) {
    if (this.isRange && typeof this.value === 'number') {
      this.value = {
        lower: this.actualMin,
        upper: this.value as number,
      };
    } else {
      const rangeValue = this.value as IgcRangeSliderValue;
      if (
        oldValue === 'range' &&
        (rangeValue.upper || rangeValue.upper === 0)
      ) {
        this.value = rangeValue.upper;
      }
    }
  }

  @watch('min', { waitUntilFirstUpdate: true })
  @watch('max', { waitUntilFirstUpdate: true })
  @watch('lowerBound', { waitUntilFirstUpdate: true })
  @watch('upperBound', { waitUntilFirstUpdate: true })
  @watch('step', { waitUntilFirstUpdate: true })
  protected normalizeValue() {
    this.setValue(this.value);
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

  private get isRange(): boolean {
    return this.type === 'range';
  }

  private setValue(value: number | IgcRangeSliderValue) {
    if (this.isRange) {
      const rangeValue = value as IgcRangeSliderValue;
      rangeValue.lower = this.valueInRange(
        rangeValue.lower,
        this.actualMin,
        this.actualMax
      );
      rangeValue.upper = this.valueInRange(
        rangeValue.upper,
        this.actualMin,
        this.actualMax
      );

      rangeValue.lower = this.normalizeByStep(rangeValue.lower);
      rangeValue.upper = this.normalizeByStep(rangeValue.upper);
    } else {
      value = this.valueInRange(
        value as number,
        this.actualMin,
        this.actualMax
      );
      value = this.normalizeByStep(value);
    }

    this._value = value;
  }

  private normalizeByStep(value: number) {
    return value - ((value - this.actualMin) % this.step);
  }

  private swapValues(value: IgcRangeSliderValue) {
    const lower = value.lower;
    value.lower = value.upper;
    value.upper = lower;

    return value;
  }

  private toggleActiveThumb() {
    const thumb =
      this.activeThumb?.id === 'thumbFrom' ? this.thumbTo : this.thumbFrom;
    thumb.focus();
  }

  private closestHandle(event: PointerEvent): HTMLElement {
    const fromOffset =
      this.thumbFrom.offsetLeft + this.thumbFrom.offsetWidth / 2;
    const toOffset = this.thumbTo.offsetLeft + this.thumbTo.offsetWidth / 2;
    const xPointer = event.clientX - this.getBoundingClientRect().left;
    const match = this.closestTo(xPointer, [fromOffset, toOffset]);

    if (fromOffset === toOffset && toOffset < xPointer) {
      return this.thumbTo;
    } else if (fromOffset === toOffset && toOffset > xPointer) {
      return this.thumbFrom;
    } else if (match === fromOffset) {
      return this.thumbFrom;
    } else {
      return this.thumbTo;
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
    if (this.pointerCaptured) {
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

  private valueInRange(value: number, min = 0, max = 100) {
    return Math.max(Math.min(value, max), min);
  }

  private valueToFraction(value: number) {
    return (value - this.min) / (this.max - this.min);
  }

  private getTrackStyle() {
    let filledTrackStyle: StyleInfo;

    if (this.isRange) {
      const rangeValue = this.value as IgcRangeSliderValue;
      const toPosition = this.valueToFraction(rangeValue.upper);
      const fromPosition = this.valueToFraction(rangeValue.lower);
      const positionGap = toPosition - fromPosition;
      let trackLeftIndention = fromPosition;

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
      const position = this.valueToFraction(this.value as number);
      filledTrackStyle = {
        transform: `scaleX(${position})`,
      };
    }

    return filledTrackStyle;
  }

  private updateValue(increment: number) {
    const oldValue = this.value;

    if (this.isRange) {
      const newValue = { ...(this.value as IgcRangeSliderValue) };
      if (this.activeThumb?.id === 'thumbFrom') {
        newValue.lower += increment;
      } else {
        newValue.upper += increment;
      }

      if (newValue.lower >= newValue.upper) {
        this.value = this.swapValues(newValue);
        this.toggleActiveThumb();
      } else {
        this.value = newValue;
      }
    } else {
      this.value = (this.value as number) + increment;
    }

    if (this.areEqualValues(oldValue, this.value)) {
      return false;
    }

    this.emitEvent('igcInput', { detail: this.value });
    return true;
  }

  private areEqualValues(
    oldValue: number | IgcRangeSliderValue,
    newValue: number | IgcRangeSliderValue
  ) {
    if (this.isRange) {
      const oldRangeValue = oldValue as IgcRangeSliderValue;
      const newRangeValue = newValue as IgcRangeSliderValue;
      return (
        oldRangeValue.lower === newRangeValue.lower &&
        oldRangeValue.upper === newRangeValue.upper
      );
    } else {
      return oldValue === newValue;
    }
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
    const thumb = this.isRange ? this.closestHandle(event) : this.thumbTo;
    thumb.focus();

    this.startValue = this.value;
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

    if (!this.areEqualValues(this.startValue!, this.value)) {
      this.emitEvent('igcChange', { detail: this.value });
    }
    this.startValue = undefined;
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

      const updated = this.updateValue(increment);
      this.showThumbLabels();
      this.hideThumbLabels();

      if (updated) {
        this.emitEvent('igcChange', { detail: this.value });
      }
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
      const rangeValue = { ...(this.value as IgcRangeSliderValue) };

      if (this.activeThumb?.id === 'thumbFrom') {
        rangeValue.lower += this.step;
      } else {
        rangeValue.upper += this.step;
      }

      this.value = rangeValue;
    } else {
      this.value = (this.value as number) + this.step;
    }
  }

  public decrementValue() {
    if (this.isRange) {
      const rangeValue = { ...(this.value as IgcRangeSliderValue) };

      if (this.activeThumb?.id === 'thumbFrom') {
        rangeValue.lower -= this.step;
      } else {
        rangeValue.upper -= this.step;
      }

      this.value = rangeValue;
    } else {
      this.value = (this.value as number) - this.step;
    }
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
        ? (this.value as IgcRangeSliderValue).lower
        : (this.value as IgcRangeSliderValue).upper
      : (this.value as number);

    const percent = `${this.valueToFraction(value) * 100}%`;
    const dir = this.isLTR ? 'left' : 'right';
    const thumbId = isFrom ? 'thumbFrom' : 'thumbTo';

    return html` <div
        part="thumb-label"
        id=${isFrom ? 'labelFrom' : 'labelTo'}
        style=${styleMap({
          opacity: this.thumbLabelsVisible ? '1' : '0',
          [dir]: percent,
        })}
      >
        ${value}
      </div>
      <div
        part="thumb"
        id=${thumbId}
        tabindex=${this.disabled ? -1 : 0}
        style=${styleMap({ [dir]: percent })}
        role="slider"
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${value}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        @pointerenter=${this.handleThumbPointerEnter}
        @pointerleave=${this.handleThumbPointerLeave}
        @focus=${(ev: Event) => (this.activeThumb = ev.target as HTMLElement)}
        @blur=${() => (this.activeThumb = undefined)}
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
          <div
            part="fill"
            id="fill"
            style=${styleMap(this.getTrackStyle())}
          ></div>
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

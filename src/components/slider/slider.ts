import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
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

export class IgcSliderComponent extends EventEmitterMixin<
  IgcSliderEventMap,
  Constructor<LitElement>
>(LitElement) {
  static styles = [styles];

  // Limit handle travel zone
  private _pMin = 0;
  private _pMax = 1;

  private _min = 0;
  private _max = 100;
  private _lowerValue?: number;
  private _upperValue?: number;
  private _lowerBound?: number;
  private _upperBound?: number;
  private _value: number | IRangeSliderValue = 0;
  private _disabled = false;
  private _continuous = false;
  private _step = 1;
  private _hasViewInit = false;
  private _activeThumb: HTMLElement | undefined;

  private get isLTR(): boolean {
    const styles = window.getComputedStyle(this);
    return styles.getPropertyValue('direction') === 'ltr';
  }

  public get isRange(): boolean {
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
    //implement pointerUp to release the capture
    // this.addEventListener('pointerup', this.pointerUp);
    this.addEventListener('keydown', this.handleKeydown);
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.zeroOrigin) {
      this.setValue(this._value, false);
    } else {
      this.setValue(this.min, false);
    }
  }

  firstUpdated() {
    this._hasViewInit = true;
    this.positionHandlersAndUpdateTrack();
    this.setTickInterval();
    this.changeThumbFocusableState(this.disabled);
  }

  @query('#steps')
  steps!: HTMLElement;

  @query('#thumbFrom')
  thumbFrom!: HTMLElement;

  @query('#thumbTo')
  thumbTo!: HTMLElement;

  @query('#labelFrom')
  labelFrom!: HTMLElement;

  @query('#labelTo')
  labelTo!: HTMLElement;

  @query('#fill')
  filledTrack!: HTMLElement;

  @state()
  _tabIndex = 0;

  public set value(value: number | IRangeSliderValue) {
    if (this._hasViewInit) {
      this.setValue(value, true);
      this.positionHandlersAndUpdateTrack();
    } else {
      this._value = value;
    }
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

  public set min(value: number) {
    if (value >= this.max) {
      return;
    } else {
      this._min = value;
    }

    if (value > this.upperBound) {
      this.upperBound = this.max;
      this._pMax = 1;
      this.lowerBound = value;
    }

    // Refresh min travel zone limit.
    this._pMin = 0;
    // Recalculate step distance.
    this.positionHandlersAndUpdateTrack();
    if (this._hasViewInit) {
      this.setTickInterval();
    }
  }

  @property({ type: Number })
  public get min(): number {
    return this._min;
  }

  public set max(value: number) {
    if (value <= this._min) {
      return;
    } else {
      this._max = value;
    }

    if (value < this.lowerBound) {
      this.lowerBound = this.min;
      this._pMin = 0;
      this.upperBound = value;
    }

    // refresh max travel zone limits.
    this._pMax = 1;
    this.positionHandlersAndUpdateTrack();
    if (this._hasViewInit) {
      this.setTickInterval();
    }
  }

  @property({ type: Number })
  public get max(): number {
    return this._max;
  }

  public set lowerBound(value: number) {
    if (value >= this.upperBound) {
      return;
    }

    this._lowerBound = this.valueInRange(value, this.min, this.max);

    // Refresh min travel zone.
    this._pMin = this.valueToFraction(this._lowerBound, 0, 1);
    this.positionHandlersAndUpdateTrack();
  }

  @property({ type: Number })
  public get lowerBound(): number {
    if (!Number.isNaN(this._lowerBound) && this._lowerBound !== undefined) {
      return this.valueInRange(this._lowerBound, this.min, this.max);
    }

    return this.min;
  }

  public set upperBound(value: number) {
    if (value <= this.lowerBound) {
      return;
    }

    this._upperBound = this.valueInRange(value, this.min, this.max);

    // Refresh time travel zone.
    this._pMax = this.valueToFraction(this._upperBound, 0, 1);
    this.positionHandlersAndUpdateTrack();
  }

  @property({ type: Number })
  public get upperBound(): number {
    if (!Number.isNaN(this._upperBound) && this._upperBound !== undefined) {
      return this.valueInRange(this._upperBound, this.min, this.max);
    }

    return this.max;
  }

  @property({ type: Boolean })
  zeroOrigin = true;

  @property()
  type: 'slider' | 'range' = 'slider';

  public set disabled(disable: boolean) {
    this._disabled = disable;

    if (this._hasViewInit) {
      this.changeThumbFocusableState(disable);
    }
  }

  @property({ type: Boolean })
  public get disabled(): boolean {
    return this._disabled;
  }

  public set continuous(continuous: boolean) {
    this._continuous = continuous;
    if (this._hasViewInit) {
      this.setTickInterval();
    }
  }

  @property({ type: Boolean })
  public get continuous(): boolean {
    return this._continuous;
  }

  public set step(step: number) {
    this._step = step;

    if (this._hasViewInit) {
      this.normalizeByStep(this.value);
      this.setTickInterval();
    }
  }
  @property({ type: Number })
  public get step() {
    return this._step;
  }

  @property({ type: Number })
  primaryTicks = 0;

  @property({ type: Number })
  secondaryTicks = 0;

  @property()
  tickOrientation: 'mirror' | 'start' | 'end' = 'end';

  @property({ type: Boolean })
  showPrimaryLabels = true;

  @property({ type: Boolean })
  showSecondaryLabels = true;

  private totalTickNumber() {
    return this.primaryTicks > 0
      ? (this.primaryTicks - 1) * this.secondaryTicks + this.primaryTicks
      : this.secondaryTicks > 0
      ? this.secondaryTicks
      : 0;
  }

  private validateInitialValue(value: IRangeSliderValue) {
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

  //Check if the triggerChange is needed here
  private setValue(value: number | IRangeSliderValue, triggerChange: boolean) {
    let res;
    if (!this.isRange) {
      this.upperValue = (value as number) - ((value as number) % this.step);
      res = this.upperValue;
    } else {
      value = this.validateInitialValue(value as IRangeSliderValue);
      this.upperValue = (value as IRangeSliderValue).upper;
      this.lowerValue = (value as IRangeSliderValue).lower;
      res = { lower: this.lowerValue, upper: this.upperValue };
    }

    if (triggerChange) {
      this._value = res;
      this.emitEvent('igcChange');
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
  private generateTickMarks(color: string, interval: number | null) {
    return interval !== null
      ? `repeating-linear-gradient(
            ${'to left'},
            ${color},
            ${color} 1.5px,
            transparent 1.5px,
            transparent ${interval}%
        ), repeating-linear-gradient(
            ${'to right'},
            ${color},
            ${color} 1.5px,
            transparent 1.5px,
            transparent ${interval}%
        )`
      : interval;
  }

  private setTickInterval() {
    const trackProgress = 100;
    const trackRange = this.max - this.min;
    const interval =
      this.step > 1
        ? ((trackProgress / (trackRange / this.step)) * 10) / 10
        : null;

    //In Angular (the three lines below) we have a check for the IE browser.
    // const renderCallbackExecution = !this.continuous ? this.generateTickMarks(
    //     this.platform.isIE ? 'white' : 'var(--igx-slider-track-step-color, var(--track-step-color, white))', interval) : null;
    // this.renderer.setStyle(this.ticks.nativeElement, 'background', renderCallbackExecution);

    //Background should be calculated based on the current theme
    const renderCallbackExecution = !this.continuous
      ? this.generateTickMarks('white', interval)
      : null;
    if (renderCallbackExecution) {
      this.steps.style['background'] = renderCallbackExecution;
    } else {
      this.steps.style['background'] = '';
    }
  }

  private showSliderIndicators() {
    if (this.disabled) {
      return;
    }

    // if (this._indicatorsTimer) {
    //     this._indicatorsDestroyer$.next(true);
    //     this._indicatorsTimer = null;
    // }

    this.showThumbIndicators();
    //this.labelTo.active = true;
    if (this.thumbFrom) {
      this.showThumbIndicators();
    }

    if (this.labelFrom) {
      //this.labelFrom.active = true;
    }
  }

  public showThumbIndicators() {
    //this.toggleThumbIndicators(true);
  }

  public hideThumbIndicators() {
    //this.toggleThumbIndicators(false);
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

  private normalizeByStep(value: IRangeSliderValue | number) {
    if (this.isRange) {
      this.value = {
        lower:
          (value as IRangeSliderValue).lower -
          ((value as IRangeSliderValue).lower % this.step),
        upper:
          (value as IRangeSliderValue).upper -
          ((value as IRangeSliderValue).upper % this.step),
      };
    } else {
      this.value = (value as number) - ((value as number) % this.step);
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

  private positionHandlersAndUpdateTrack() {
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

    if (this._hasViewInit) {
      this.updateTrack();
    }
  }

  private changeThumbFocusableState(state: boolean) {
    const value = state ? -1 : 1;

    if (this.isRange) {
      this.thumbFrom.tabIndex = value;
    }

    this.thumbTo.tabIndex = value;
  }

  private updateThumbValue(mouseX: number) {
    const updateValue = this.calculateTrackUpdate(mouseX);
    if (this._activeThumb && updateValue !== 0) {
      if (!this.isRange) {
        this.value = (this.value as number) + updateValue;
      } else if (this._activeThumb.id === 'thumbTo') {
        this.upperValue = this.upperValue + updateValue;
      } else this.lowerValue = this.lowerValue + updateValue;
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

  pointerDown = (event: PointerEvent) => {
    this.findClosestThumb(event);

    if (!this._activeThumb) {
      return;
    }

    this._activeThumb.setPointerCapture(event.pointerId);
    this.showSliderIndicators();
    event.preventDefault();
  };

  handleKeydown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }

    const { key } = event;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      let increment = 0;

      switch (key) {
        case 'ArrowDown':
          increment += -this.step;
          break;
        case 'ArrowLeft':
          increment += this.isLTR ? -this.step : this.step;
          break;
        case 'ArrowRight':
          increment += this.isLTR ? this.step : -this.step;
          break;
        default:
          increment += this.step;
      }

      //Add value update for range
      this.value = (this.value as number) + increment;
    }
  };

  incrementValue() {
    if (this.isRange) {
      this.lowerValue += this.step;
    }
    this.value = (this.value as number) + this.step;
  }

  decrementValue() {
    if (this.isRange) {
      this.lowerValue -= this.step;
    }
    this.value = (this.value as number) - this.step;
  }

  renderTicks() {
    const groups = [];
    for (let i = 0; i < this.totalTickNumber(); i++) {
      groups.push(html` <div part="tick-group">
        <div part="tick">
          <span part="tick-label"></span>
        </div>
      </div>`);
    }
    return groups;
  }

  render() {
    return html`
      <div part="base" style="{flex-direction:column}">
        <div part="track">
          ${this.tickOrientation === 'mirror' ||
          this.tickOrientation === 'start'
            ? html`<div part="ticks">${this.renderTicks()}</div>`
            : html``}
          <div part="fill" id="fill"></div>
          <div part="steps" id="steps"></div>
          ${this.tickOrientation !== 'start'
            ? html`<div part="ticks">${this.renderTicks()}</div>`
            : html``}
        </div>
        <div part="thumbs">
          ${this.isRange
            ? html`<div part="thumb-label"
                        id="labelFrom"><span>${
                          this.isRange
                            ? (this.value as IRangeSliderValue).lower
                            : null
                        }</span></div>                    
                        </div>
                        <div 
                            part="thumb"
                            id="thumbFrom"
                            tabindex=${this._tabIndex}
                            role="slider"  
                            aria-valuemin=${this.min}
                            aria-valuemax=${this.max}
                            aria-valuenow=${
                              this.isRange
                                ? (this.value as IRangeSliderValue).lower
                                : '0'
                            }
                            aria-disabled=${this.disabled ? 'true' : 'false'}>
                        </div>`
            : html``}
          <div part="thumb-label" id="labelTo">
            ${this.isRange
              ? (this.value as IRangeSliderValue).upper
              : (this.value as number)}
          </div>
          <div
            part="thumb"
            id="thumbTo"
            tabindex=${this._tabIndex}
            role="slider"
            aria-valuemin=${this.min}
            aria-valuemax=${this.max}
            aria-valuenow=${this.upperValue}
            aria-disabled=${this.disabled ? 'true' : 'false'}
          ></div>
        </div>
      </div>
    `;
  }
}

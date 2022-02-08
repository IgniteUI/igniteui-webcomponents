import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { watch } from '../../common/decorators';
import { Constructor } from '../../common/mixins/constructor';
import { EventEmitterMixin } from '../../common/mixins/event-emitter';
import { IgcRadioEventMap } from '../../radio/radio';

const ONE_PERCENT = 0.01;
export const MIN_VALUE = 0;

export const valueInRange = (value: number, max: number, min = 0): number =>
  Math.max(Math.min(value, max), min);
export const toPercent = (value: number, max: number) =>
  Math.floor((100 * value) / max);
export const toValue = (value: number, max: number) => (max * value) / 100;

export const IgxTextAlign = {
  START: 'start',
  CENTER: 'center',
  END: 'end',
};
export type IgxTextAlign = typeof IgxTextAlign[keyof typeof IgxTextAlign];

export const IgxProgressType = {
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
};
export type IgxProgressType =
  typeof IgxProgressType[keyof typeof IgxProgressType];

export class IgcProgressBaseComponent extends EventEmitterMixin<
  IgcRadioEventMap,
  Constructor<LitElement>
>(LitElement) {
  protected _interval!: any;
  protected _initValue = 0;
  protected _contentInit = false;
  protected _internalState = {
    oldVal: 0,
    newVal: 0,
  };

  @state()
  protected _max = 100;
  @state()
  protected _value = MIN_VALUE;
  @state()
  protected _animate = false;
  @state()
  protected _animation!: Animation;

  @property({ type: Boolean })
  public indeterminate = false;

  @watch('indeterminate')
  public indeterminateChange() {
    if (this.indeterminate) {
      this.textVisibility = false;
      this._animation?.cancel();
    } else {
      this._animation?.finish();
    }
  }

  @property({ reflect: true, attribute: false })
  public animationDuration = 2000;

  @property({ type: Boolean })
  public textVisibility = false;

  @property({ type: Boolean })
  public set animated(animate: boolean) {
    this._animate = animate;
    if (animate) {
      this.animationDuration = 2000;
    } else {
      this.animationDuration = 0;
    }
  }

  public get animated(): boolean {
    return this._animate;
  }

  @property({ attribute: true, reflect: true, type: Number })
  public set max(maxNum: number) {
    if (
      maxNum < MIN_VALUE ||
      this._max === maxNum ||
      (this._animation && this._animation.playState !== 'finished')
    ) {
      return;
    }

    if (maxNum < this.value) {
      this._value = maxNum;
    }

    this._internalState.newVal = Math.round(
      toValue(toPercent(this.value, maxNum), maxNum)
    );
    this._value = this._internalState.oldVal = Math.round(
      toValue(this.valueInPercent, maxNum)
    );
    if (maxNum < this._value) {
      this._value = maxNum;
    }

    this._max = maxNum;
    this.triggerProgressTransition(
      this._internalState.oldVal,
      this._internalState.newVal,
      true
    );
  }

  public get max() {
    return this._max;
  }

  @property({ attribute: true, reflect: true, type: Number })
  public set value(val) {
    if (
      (this._animation && this._animation.playState !== 'finished') ||
      val < 0
    ) {
      return;
    }

    const valInRange = valueInRange(val, this.max);

    if (isNaN(valInRange) || this._value === val || this.indeterminate) {
      return;
    }

    if (this._contentInit) {
      this.triggerProgressTransition(this._value, valInRange);
    } else {
      if (this._initValue > this.max) {
        this._initValue = this.max;
      }
      this._initValue = valInRange;
    }
  }

  public get value(): number {
    return this._value;
  }

  public get step(): number {
    return this._max * ONE_PERCENT;
  }

  public get valueInPercent(): number {
    const val = this.max <= 0 ? 0 : toPercent(this._value, this._max);
    return val;
  }

  public override firstUpdated(): void {
    this.triggerProgressTransition(MIN_VALUE, this._initValue);
    this._contentInit = true;
  }

  private updateProgress(val: number) {
    this._value = valueInRange(val, this._max);
    // this.valueInPercent = toPercent(val, this._max);
    this.runAnimation(val);
  }

  protected triggerProgressTransition(
    oldVal: any,
    newVal: any,
    maxUpdate = false
  ) {
    if (oldVal === newVal) {
      return;
    }

    // const changedValues = {
    //   currentValue: newVal,
    //   previousValue: oldVal,
    // };

    const stepDirection = this.directionFlow(oldVal, newVal);
    if (this._animate) {
      const newToPercent = toPercent(newVal, this.max);
      const oldToPercent = toPercent(oldVal, this.max);
      const duration =
        this.animationDuration /
        Math.abs(newToPercent - oldToPercent) /
        this.step;
      this.runAnimation(newVal);
      this._interval = setInterval(
        () => this.increase(newVal, stepDirection),
        duration
      );
    } else {
      this.updateProgress(newVal);
    }

    if (maxUpdate) {
      return;
    }
    // this.emitEvent('igcAsd', { detail: { value: this.value } });
  }

  protected increase(newValue: number, step: number) {
    const targetValue = toPercent(newValue, this._max);
    this._value = valueInRange(this._value, this._max) + step;
    if (
      (step > 0 && this.valueInPercent >= targetValue) ||
      (step < 0 && this.valueInPercent <= targetValue)
    ) {
      if (this._value !== newValue) {
        this._value = newValue;
      }
      return clearInterval(this._interval);
    }
  }

  protected directionFlow(currentValue: number, prevValue: number): number {
    return currentValue < prevValue ? this.step : -this.step;
  }

  protected runAnimation(_value: number) {}
}

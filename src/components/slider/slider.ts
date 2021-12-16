import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { IgcSliderBaseComponent } from './slider-base';

export interface IgcSliderEventMap {
  igcInput: CustomEvent<number>;
  igcChange: CustomEvent<number>;
}

export default class IgcSliderComponent extends EventEmitterMixin<
  IgcSliderEventMap,
  Constructor<IgcSliderBaseComponent>
>(IgcSliderBaseComponent) {
  /** @private */
  public static tagName = 'igc-slider';

  private _value = 0;
  private _ariaLabel!: string;

  public set value(val: number) {
    const oldVal = this._value;
    this._value = this.validateValue(val);
    this.requestUpdate('value', oldVal);
  }

  @property({ type: Number })
  public get value() {
    return this._value;
  }

  public set ariaLabel(value: string) {
    this._ariaLabel = value;
    if (this.hasAttribute('aria-label')) {
      this.removeAttribute('aria-label');
    }
    this.requestUpdate('ariaLabel');
  }

  @property({ attribute: 'aria-label' })
  public get ariaLabel() {
    return this._ariaLabel;
  }

  protected get activeValue(): number {
    return this.value;
  }

  protected get fillValue() {
    return this.value;
  }

  protected normalizeValue(): void {
    this._value = this.validateValue(this._value);
  }

  protected getTrackStyle() {
    const position = this.valueToFraction(this.value);
    const filledTrackStyle = {
      width: `${position * 100}%`,
    };

    return filledTrackStyle;
  }

  protected updateValue(increment: number) {
    const oldValue = this.value;

    this.value = (this.value as number) + increment;

    if (oldValue === this.value) {
      return false;
    }

    this.emitInputEvent();
    return true;
  }

  protected emitInputEvent() {
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected emitChangeEvent() {
    this.emitEvent('igcChange', { detail: this.value });
  }

  public stepUp() {
    this.value = this.value + this.step;
  }

  public stepDown() {
    this.value = this.value - this.step;
  }

  protected renderThumbs() {
    return html`${this.renderThumb(this.value, this.ariaLabel)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-slider': IgcSliderComponent;
  }
}

import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { IgcSliderBaseComponent } from './slider-base';

export default class IgcSliderComponent extends IgcSliderBaseComponent {
  /** @private */
  public static tagName = 'igc-slider';

  private _value = 0;

  public set value(val: number) {
    const oldVal = this._value;
    this._value = this.validateValue(val);
    this.requestUpdate('value', oldVal);
  }

  @property({ attribute: false })
  public get value() {
    return this._value;
  }

  protected get activeValue(): number {
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

    this.emitEvent('igcInput', { detail: this.value });
    return true;
  }

  public stepUp() {
    this.value = this.value + this.step;
  }

  public stepDown() {
    this.value = this.value - this.step;
  }

  protected renderThumbs() {
    return html`${this.renderThumb(this.value)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-slider': IgcSliderComponent;
  }
}

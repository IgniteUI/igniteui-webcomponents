import { property } from 'lit/decorators.js';

import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedMixin } from '../common/mixins/form-associated.js';
import { asNumber, asPercent, clamp } from '../common/util.js';
import { IgcSliderBaseComponent } from './slider-base.js';
import IgcSliderLabelComponent from './slider-label.js';

export interface IgcSliderEventMap {
  /**
   * Emitted when a value is changed via thumb drag or keyboard interaction.
   */
  igcInput: CustomEvent<number>;
  /**
   * Emitted when a value change is committed on a thumb drag end or keyboard interaction.
   */
  igcChange: CustomEvent<number>;
}

/**
 * A slider component used to select numeric value within a range.
 *
 * @element igc-slider
 *
 * @fires igcInput - Emitted when a value is changed via thumb drag or keyboard interaction.
 * @fires igcChange - Emitted when a value change is committed on a thumb drag end or keyboard interaction.
 *
 * @csspart base - The base wrapper of the slider.
 * @csspart ticks - The ticks container.
 * @csspart tick-group - The tick group container.
 * @csspart tick - The tick element.
 * @csspart tick-label - The tick label element.
 * @csspart tick-label-inner - The inner element of the tick label.
 * @csspart thumbs - The thumbs container.
 * @csspart thumb - The thumb element.
 * @csspart thumb-label - The thumb tooltip label container.
 * @csspart thumb-label-inner - The thumb tooltip label inner element.
 * @csspart track - The track container.
 * @csspart steps - The track steps element.
 * @csspart inactive - The inactive element of the track.
 * @csspart fill - The filled part of the track.
 */
export default class IgcSliderComponent extends FormAssociatedMixin(
  EventEmitterMixin<IgcSliderEventMap, Constructor<IgcSliderBaseComponent>>(
    IgcSliderBaseComponent
  )
) {
  public static readonly tagName = 'igc-slider';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSliderComponent, IgcSliderLabelComponent);
  }

  private _value = 0;

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The current value of the component.
   * @attr
   */
  @property({ type: Number })
  public set value(value: number) {
    this._value = this.validateValue(asNumber(value, this._value));
    this.setFormValue(`${this._value}`);
  }

  public get value(): number {
    return this._value;
  }

  protected override get activeValue(): number {
    return this.value;
  }

  protected override normalizeValue(): void {
    this.value = this.validateValue(this.value);
  }

  protected override getTrackStyle() {
    return {
      width: `${asPercent(this.value - this.min, this.distance)}%`,
    };
  }

  protected override updateValue(increment: number) {
    const value = clamp(
      this.value + increment,
      this.lowerBound,
      this.upperBound
    );

    if (this.value === value) {
      return false;
    }

    this.value = value;
    this.emitInputEvent();
    return true;
  }

  protected override emitInputEvent() {
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected override emitChangeEvent() {
    this.emitEvent('igcChange', { detail: this.value });
  }

  /**
   * Increments the value of the slider by `stepIncrement * step`, where `stepIncrement` defaults to 1.
   * @param stepIncrement Optional step increment. If no parameter is passed, it defaults to 1.
   */
  public stepUp(stepIncrement = 1) {
    this.value = this.value + stepIncrement * this.step;
  }

  /**
   * Decrements the value of the slider by `stepDecrement * step`, where `stepDecrement` defaults to 1.
   * @param stepDecrement Optional step decrement. If no parameter is passed, it defaults to 1.
   */
  public stepDown(stepDecrement = 1) {
    this.value = this.value - stepDecrement * this.step;
  }

  protected override renderThumbs() {
    return this.renderThumb(this.value, this.ariaLabel!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-slider': IgcSliderComponent;
  }
}

import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedMixin } from '../common/mixins/form-associated.js';
import { IgcSliderBaseComponent } from './slider-base.js';

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

  /**
   * The current value of the component.
   * @attr
   */
  @property({ type: Number })
  public value = 0;

  @watch('value')
  protected valueChanged() {
    this.value = this.validateValue(this.value);
    this.setFormValue(`${this.value}`);
  }

  protected override get activeValue(): number {
    return this.value;
  }

  protected override normalizeValue(): void {
    this.value = this.validateValue(this.value);
  }

  protected override getTrackStyle() {
    const position = this.valueToFraction(this.value);
    const filledTrackStyle = {
      width: `${position * 100}%`,
    };

    return filledTrackStyle;
  }

  protected override updateValue(increment: number) {
    const oldValue = this.value;

    this.value = (this.value as number) + increment;

    if (oldValue === this.value) {
      return false;
    }

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
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      this.removeAttribute('aria-label');
    }
    return html`${this.renderThumb(this.value, ariaLabel!)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-slider': IgcSliderComponent;
  }
}

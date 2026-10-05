import { property } from 'lit/decorators.js';
import { hostAria } from '#internals/controllers/aria-projection.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedMixin } from '#internals/mixins/forms/associated.js';
import { FormValueNumberTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { asNumber } from '#internals/utils/math.js';
import { IgcSliderBaseComponent, sliderDependencies } from './slider-base.js';

export interface IgcSliderComponentEventMap {
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
  EventEmitterMixin<
    IgcSliderComponentEventMap,
    Constructor<IgcSliderBaseComponent>
  >(IgcSliderBaseComponent)
) {
  public static readonly tagName = 'igc-slider';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSliderComponent, ...sliderDependencies);
  }

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: 0,
    transformers: FormValueNumberTransformers,
  });

  /** The value as set, until the update resolves it. */
  private _requestedValue?: number;

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The current value of the component.
   * @attr
   */
  @property({ type: Number })
  public set value(value: number) {
    const requested = asNumber(value, this._formValue.value);
    const resolved = this.validateValue(requested);

    this._requestedValue = this._keepRequest(requested, resolved);
    this._formValue.setValueAndFormState(resolved);
  }

  public get value(): number {
    return this._formValue.value;
  }

  protected override get activeValue(): number {
    return this.value;
  }

  protected override normalizeValue(constraintsChanged: boolean): void {
    if (constraintsChanged) {
      const value = this.validateValue(this._requestedValue ?? this.value);

      if (value !== this.value) {
        // A clamp is not a user edit, so the pristine state stays.
        this._withPristine(() => (this.value = value));
      }
    }

    this._requestedValue = undefined;
  }

  protected override getTrackStyle() {
    return { width: `${this._percentOf(this.value)}%` };
  }

  protected override _setActiveValue(value: number): void {
    this.value = value;
  }

  protected override emitInputEvent() {
    this._emitTouchedEvent('igcInput', { detail: this.value });
  }

  protected override emitChangeEvent() {
    this._emitTouchedEvent('igcChange', { detail: this.value });
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
    this.stepUp(-stepDecrement);
  }

  /** Focuses the thumb, as a native range input label does. */
  protected override _handleLabelActivation(): void {
    this.thumb.focus();
  }

  protected override renderThumbs() {
    return this.renderThumb(this.value, hostAria(this));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-slider': IgcSliderComponent;
  }
}

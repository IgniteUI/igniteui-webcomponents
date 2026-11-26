import { property } from 'lit/decorators.js';
import { convertToDate, isValidDate } from '#internals/date/converters.js';
import { registerComponent } from '#internals/definitions/register.js';
import { formatDisplayDate } from '#internals/i18n/date-formats.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormValueDateTimeTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { all } from '#themes/input/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import type { DatePart } from './date-part.js';
import { IgcDateTimeInputBaseComponent } from './date-time-input.base.js';
import { DateTimeMaskParser } from './datetime-mask-parser.js';

export interface IgcDateTimeInputComponentEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<Date | null>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/**
 * An input field to enter and edit a date and time value, with configurable input and display formats.
 *
 * @element igc-date-time-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after the input.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot range-overflow - Renders content when the max validation fails.
 * @slot range-underflow - Renders content when the min validation fails.
 * @slot custom-error - Renders content when a custom message is set with `setCustomValidity()`.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the control input receives user input.
 * @fires igcChange - Emitted on blur, when the committed value differs from the one the editor was focused with.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 * @csspart prefixed - Added to the container and the input when an element that is not hidden is in the prefix slot.
 * @csspart suffixed - Added to the container and the input when an element that is not hidden is in the suffix slot.
 * @csspart filled - Added to the container and the input unless the focused input shows only the empty mask.
 * @csspart labelled - Added to the container in the material theme when the control has a label.
 * @csspart start - The wrapper of the prefix in the material theme.
 * @csspart notch - The wrapper of the label in the material theme.
 * @csspart filler - The outline segment between the notch and the end in the material theme.
 * @csspart end - The wrapper of the suffix in the material theme.
 *
 * @cssproperty --ig-helper-min-lines - The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.
 *
 * @cssstate ig-invalid - Set while the control shows its invalid state, that is while `invalid` returns `true`.
 */
export default class IgcDateTimeInputComponent extends EventEmitterMixin<
  IgcDateTimeInputComponentEventMap,
  typeof IgcDateTimeInputBaseComponent<Date, DatePart>
>(IgcDateTimeInputBaseComponent) {
  public static readonly tagName = 'igc-date-time-input';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcDateTimeInputComponent,
      IgcValidationContainerComponent
    );
  }

  //#region Private state and properties

  protected override readonly _themes = addThemingController(this, all);
  protected override readonly _parser = new DateTimeMaskParser();
  protected override readonly _formValue = createFormValueState(this, {
    initialValue: null,
    transformers: FormValueDateTimeTransformers,
  });

  //#endregion

  //#region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the input.
   *
   * Only ever holds a committed value. While the user is typing, the intermediate
   * state lives in the masked text and is committed - together with an `igcChange`
   * event - when the edit is committed on blur. Use the `igcInput` event to observe
   * the value as it is being typed.
   *
   * @attr
   */
  @property({ converter: convertToDate })
  public override set value(value: Date | string | null | undefined) {
    this._applyValue(convertToDate(value));
  }

  public override get value(): Date | null {
    return this._formValue.value;
  }

  /* blazorCSSuppress */
  /**
   * The default value of the control. A form reset restores the value to it.
   * While the value is unchanged since the start or the last form reset, a
   * new default also sets the value. The `value` attribute also sets it.
   */
  public override set defaultValue(value: Date | string | null | undefined) {
    super.defaultValue = value;
  }

  public override get defaultValue(): Date | null {
    return this._formValue.defaultValue;
  }

  //#endregion

  //#region Internal API

  /** The formatted value shown when the input is not focused. */
  protected override _buildDisplayValue(): string {
    return isValidDate(this.value)
      ? formatDisplayDate(this.value, this.locale, this.displayFormat)
      : '';
  }

  /** The `igcInput` detail is the parsed value as an ISO string (the legacy contract). */
  protected override _emitInputEvent(): void {
    this._emitTouchedEvent('igcInput', {
      detail: this._uncommittedValue?.toISOString(),
    });
  }

  //#endregion

  //#region Public API

  /**
   * Increments a date or time part by `delta`, or by its `spinDelta` value.
   * Without `datePart`, it changes the part at the cursor or a default part.
   * The `value` updates at once.
   */
  public override stepUp(datePart?: DatePart, delta?: number): void {
    super.stepUp(datePart, delta);
  }

  /**
   * Decrements a date or time part by `delta`, or by its `spinDelta` value.
   * Without `datePart`, it changes the part at the cursor or a default part.
   * The `value` updates at once.
   */
  public override stepDown(datePart?: DatePart, delta?: number): void {
    super.stepDown(datePart, delta);
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-time-input': IgcDateTimeInputComponent;
  }
}

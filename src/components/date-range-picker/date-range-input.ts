import { property } from 'lit/decorators.js';
import { CalendarDay } from '#internals/date/model.js';
import { registerComponent } from '#internals/definitions/register.js';
import { formatDisplayDate } from '#internals/i18n/date-formats.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormValueDateRangeTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { all } from '#themes/input/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { IgcDateTimeInputBaseComponent } from '../date-time-input/date-time-input.base.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import type { DateRangeValue } from '../types.js';
import {
  DateRangeMaskParser,
  type DateRangePart,
  type DateRangePosition,
} from './date-range-mask-parser.js';

export interface IgcDateRangeInputComponentEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  /* blazorSuppress */
  igcChange: CustomEvent<DateRangeValue | null>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

/* blazorSuppress */
export default class IgcDateRangeInputComponent extends EventEmitterMixin<
  IgcDateRangeInputComponentEventMap,
  typeof IgcDateTimeInputBaseComponent<DateRangeValue, DateRangePart>
>(IgcDateTimeInputBaseComponent) {
  public static readonly tagName = 'igc-date-range-input';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDateRangeInputComponent);
  }

  //#region Private state and properties

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: { start: null, end: null },
    transformers: FormValueDateRangeTransformers,
  });

  protected override readonly _themes = addThemingController(this, all);
  protected override readonly _parser = new DateRangeMaskParser();

  // #endregion

  // #region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false, true) */
  /**
   * The value of the date range input.
   *
   * Only ever holds a committed value. While the user is typing, the intermediate
   * state lives in the masked text and is committed - together with an `igcChange`
   * event - when the edit is committed on blur.
   *
   * @attr
   */
  @property({ attribute: false })
  public override set value(value: DateRangeValue | null) {
    this._applyValue(value);
  }

  public override get value(): DateRangeValue | null {
    return this._formValue.value;
  }

  // #endregion

  // #region Event Handlers Overrides

  protected override _isValueEmpty(): boolean {
    return !this.value || (!this.value.start && !this.value.end);
  }

  // #endregion

  // #region Internal API Overrides

  /** Today, at midnight. */
  protected override _seedDate(): Date {
    return CalendarDay.today.native;
  }

  protected override _buildDisplayValue(): string {
    return [this.value?.start, this.value?.end]
      .map((date) =>
        date ? formatDisplayDate(date, this.locale, this.displayFormat) : ''
      )
      .filter(Boolean)
      .join(this._parser.separator);
  }

  protected override _applyMask(formatString: string): void {
    super._applyMask(formatString);
    this._parser.prompt = this.prompt;
  }

  // #region Public API Overrides

  /** Increments a date/time portion. The `value` updates at once. */
  public override stepUp(datePart?: DateRangePart, delta?: number): void {
    super.stepUp(datePart, delta);
  }

  /** Decrements a date/time portion. The `value` updates at once. */
  public override stepDown(datePart?: DateRangePart, delta?: number): void {
    super.stepDown(datePart, delta);
  }

  // #endregion
}

/** The end of the range at the caret of `input`, or `undefined` in the separator. */
export function typedPosition(
  input: IgcDateRangeInputComponent
): DateRangePosition | undefined {
  return input['_parser'].partAt(input['_inputSelection'].start)?.position;
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-input': IgcDateRangeInputComponent;
  }
}

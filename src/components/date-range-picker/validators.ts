import { calendarRange } from '#internals/date/model.js';
import { isEmpty } from '#internals/utils/arrays.js';
import {
  createMaxDateTimeValidator,
  createMinDateTimeValidator,
  disabledDateMessage,
  requiredValidator,
  type Validator,
} from '#internals/validators.js';
import { isDateInRanges } from '../calendar/helpers.js';
import type { DateRangeValue } from '../types.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';

/** The ends of the current range, each validated against the bound on its own. */
function rangeEnds({ value }: IgcDateRangePickerComponent) {
  return [value?.start, value?.end];
}

const minDateRangeValidator =
  createMinDateTimeValidator<IgcDateRangePickerComponent>(rangeEnds);

const maxDateRangeValidator =
  createMaxDateTimeValidator<IgcDateRangePickerComponent>(rangeEnds);

const requiredDateRangeValidator: Validator<IgcDateRangePickerComponent> = {
  key: 'valueMissing',
  message: requiredValidator.message,
  isValid: (host) => {
    return host.required ? isCompleteDateRange(host.value) : true;
  },
};

const badInputDateRangeValidator: Validator<IgcDateRangePickerComponent> = {
  key: 'badInput',
  message: (host) => disabledDateMessage(host.value),
  isValid: (host) => {
    const { value, disabledDates } = host;

    if (
      !isCompleteDateRange(value) ||
      !disabledDates ||
      isEmpty(disabledDates)
    ) {
      return true;
    }

    return Array.from(
      calendarRange({ start: value.start, end: value.end, inclusive: true })
    ).every((date) => !isDateInRanges(date, disabledDates));
  },
};

export const dateRangeValidators: Validator<IgcDateRangePickerComponent>[] = [
  requiredDateRangeValidator,
  minDateRangeValidator,
  maxDateRangeValidator,
  badInputDateRangeValidator,
];

export function isCompleteDateRange(
  value: DateRangeValue | null
): value is { start: Date; end: Date } {
  return value != null && value.start != null && value.end != null;
}

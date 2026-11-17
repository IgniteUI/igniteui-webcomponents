import { isEmpty } from '#internals/utils/arrays.js';
import {
  createMaxDateTimeValidator,
  createMinDateTimeValidator,
  requiredValidator,
  type Validator,
} from '#internals/validators.js';
import { isSpanInRanges } from '../calendar/helpers.js';
import type { DateRangeDescriptor } from '../calendar/types.js';
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
  message: (host, localize) =>
    localize('disabled_date_validation_error', host.value),
  isValid: (host) => {
    const { value, disabledDates } = host;

    if (
      !isCompleteDateRange(value) ||
      !disabledDates ||
      isEmpty(disabledDates)
    ) {
      return true;
    }

    return rangeAvoids(value, disabledDates);
  },
};

export const dateRangeValidators: Validator<IgcDateRangePickerComponent>[] = [
  requiredDateRangeValidator,
  minDateRangeValidator,
  maxDateRangeValidator,
  badInputDateRangeValidator,
];

/** Whether no day of `range` is in `ranges`. A range with one end checks only that end. */
export function rangeAvoids(
  { start, end }: DateRangeValue,
  ranges: DateRangeDescriptor[]
): boolean {
  const first = start ?? end;
  return !first || !isSpanInRanges(first, end ?? first, ranges);
}

export function isCompleteDateRange(
  value: DateRangeValue | null
): value is { start: Date; end: Date } {
  return value != null && value.start != null && value.end != null;
}

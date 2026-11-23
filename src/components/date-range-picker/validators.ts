import { isEmpty } from '#internals/utils/arrays.js';
import {
  createMaxDateTimeValidator,
  createMinDateTimeValidator,
  requiredValidator,
  type Validator,
} from '#internals/validators.js';
import type IgcDateRangePickerComponent from './date-range-picker.js';
import { isCompleteDateRange, rangeOverlaps } from './range-shape.js';

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

    return !rangeOverlaps(value, disabledDates);
  },
};

export const dateRangeValidators: Validator<IgcDateRangePickerComponent>[] = [
  requiredDateRangeValidator,
  minDateRangeValidator,
  maxDateRangeValidator,
  badInputDateRangeValidator,
];

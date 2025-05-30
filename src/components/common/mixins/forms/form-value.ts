import {
  convertToDate,
  convertToDateRange,
  getDateFormValue,
} from '../../../calendar/helpers.js';
import type { DateRangeValue } from '../../../date-range-picker/date-range-picker.js';
import { asNumber } from '../../util.js';
import type { FormValueType, IgcFormControl } from './types.js';

export function createFormValueState<T>(
  host: IgcFormControl,
  config: FormValueConfig<T>
): FormValue<T> {
  return new FormValue(host, config);
}

type FormValueTransformers<T> = {
  setValue: (value: T) => T;
  getValue: (value: T) => T;
  setDefaultValue: (value: T) => T;
  getDefaultValue: (value: T) => T;
  setFormValue: (value: T, host: IgcFormControl) => FormValueType;
};

type FormValueConfig<T> = {
  initialValue: T;
  initialDefaultValue?: T;
  transformers?: Partial<FormValueTransformers<T>>;
};

const defaultTransformers: FormValueTransformers<string> = {
  setValue: (value) => value || '',
  getValue: (value) => value,
  setDefaultValue: (value) => value || '',
  getDefaultValue: (value) => value,
  setFormValue: (value, _: IgcFormControl) => value || null,
};

export const defaultBooleanTransformers: Partial<
  FormValueTransformers<boolean>
> = {
  setValue: Boolean,
  setDefaultValue: Boolean,
  setFormValue: (checked, host) => {
    return checked && 'value' in host ? (host.value as string) || 'on' : null;
  },
};

export const defaultNumberTransformers: Partial<FormValueTransformers<number>> =
  {
    setValue: asNumber,
    setDefaultValue: asNumber,
    setFormValue: (value) => value.toString(),
  };

export const defaultDateTimeTransformers: Partial<
  FormValueTransformers<Date | null>
> = {
  setValue: convertToDate,
  setDefaultValue: convertToDate,
  setFormValue: getDateFormValue,
};

export const defaultFileListTransformer: Partial<
  FormValueTransformers<FileList | null>
> = {
  setValue: (value) => value || null,
  getValue: (value) => value,
  setDefaultValue: (value) => value || null,
  getDefaultValue: (value) => value,
  setFormValue: (files: FileList | null, host: IgcFormControl) => {
    if (!host.name || !files) {
      return null;
    }

    const data = new FormData();

    for (const file of Array.from(files)) {
      data.append(host.name, file);
    }

    return data;
  },
};

/**
 * Converts a DateDateRangeValue object to FormData with
 * start and end Date values as ISO 8601 strings.
 * The keys are prefixed with the host name
 * and suffixed with 'start' or 'end' accordingly.
 * In case the host does not have a name, it does not participate in form submission.
 *
 * If the date values are null or undefined, the form data values
 * are empty strings ''.
 */
export function getDateRangeFormValue(
  value: DateRangeValue | null,
  host: IgcFormControl
): FormValueType {
  if (!host.name) {
    return null;
  }

  const start = value?.start?.toISOString();
  const end = value?.end?.toISOString();

  const fd = new FormData();
  const prefix = `${host.name}-`;

  if (start) {
    fd.append(`${prefix}start`, start);
  }
  if (end) {
    fd.append(`${prefix}end`, end);
  }

  return fd;
}

export const defaultDateRangeTransformers: Partial<
  FormValueTransformers<DateRangeValue | null>
> = {
  setValue: convertToDateRange,
  setDefaultValue: convertToDateRange,
  setFormValue: getDateRangeFormValue,
};

/* blazorSuppress */
export class FormValue<T> {
  private static readonly setFormValueKey = '_setFormValue' as const;

  private _host: IgcFormControl;
  private _value: T;
  private _defaultValue: T;
  private _transformers: FormValueTransformers<T>;
  private _setFormValue: IgcFormControl[typeof FormValue.setFormValueKey];

  constructor(host: IgcFormControl, config: FormValueConfig<T>) {
    this._host = host;
    this._value = config.initialValue;
    this._defaultValue = config.initialDefaultValue ?? this._value;
    this._setFormValue = host[FormValue.setFormValueKey];

    this._transformers = {
      ...defaultTransformers,
      ...config.transformers,
    } as FormValueTransformers<T>;
  }

  public setValueAndFormState(value: T): void {
    this.value = value;
    this._setFormValue.call(
      this._host,
      this._transformers.setFormValue(this.value, this._host)
    );
  }

  public set defaultValue(value: T) {
    this._defaultValue = this._transformers.setDefaultValue(value);
  }

  public get defaultValue(): T {
    return this._transformers.getDefaultValue(this._defaultValue);
  }

  public set value(value: T) {
    this._value = this._transformers.setValue(value);
  }

  public get value(): T {
    return this._transformers.getValue(this._value);
  }
}

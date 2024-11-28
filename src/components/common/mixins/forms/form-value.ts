import { convertToDate, getDateFormValue } from '../../../calendar/helpers.js';
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

export class FormValue<T> {
  private _host: IgcFormControl;
  private _value: T;
  private _defaultValue: T;
  private _transformers: FormValueTransformers<T>;

  constructor(host: IgcFormControl, config: FormValueConfig<T>) {
    this._host = host;
    this._value = config.initialValue;
    this._defaultValue = config.initialDefaultValue ?? this._value;
    this._transformers = {
      ...defaultTransformers,
      ...config.transformers,
    } as FormValueTransformers<T>;
  }

  public setValueAndFormState(value: T) {
    this.value = value;
    // REVIEW
    // @ts-expect-error: protected access
    this._host._setFormValue(
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

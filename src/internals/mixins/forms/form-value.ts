import type { LitElement } from 'lit';
import {
  type FormValueConfig,
  FormValueDefaultTransformers,
  type FormValueTransformers,
} from './form-transformers.js';
import type { IgcFormControl } from './types.js';

/* blazorSuppress */
export class FormValue<T> {
  private static readonly setFormValueKey = '_setFormValue' as const;

  private readonly _host: IgcFormControl;
  private readonly _transformers: FormValueTransformers<T>;
  private readonly _setFormValue: IgcFormControl[typeof FormValue.setFormValueKey];

  private _value: T;
  private _defaultValue: T;

  constructor(host: IgcFormControl, config: FormValueConfig<T>) {
    this._host = host;
    this._value = config.initialValue;
    this._defaultValue = config.initialDefaultValue ?? this._value;
    this._setFormValue = host[FormValue.setFormValueKey];

    this._transformers = {
      ...FormValueDefaultTransformers,
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

export function createFormValueState<T>(
  host: LitElement,
  config: FormValueConfig<T>
): FormValue<T> {
  return new FormValue(host as IgcFormControl, config);
}

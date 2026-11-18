import type { LitElement } from 'lit';
import { getOrInsertComputed } from '../../utils/objects.js';
import {
  type FormValueConfig,
  FormValueDefaultTransformers,
  type FormValueTransformers,
} from './form-transformers.js';
import type { IgcFormControl } from './types.js';

/** The transformers of each config object, merged over the defaults one time. */
const mergedTransformers = new WeakMap<object, unknown>();

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
    this._defaultValue = this._value;
    this._setFormValue = host[FormValue.setFormValueKey];

    const { transformers } = config;
    this._transformers = (
      transformers
        ? getOrInsertComputed(mergedTransformers, transformers, () => ({
            ...FormValueDefaultTransformers,
            ...transformers,
          }))
        : FormValueDefaultTransformers
    ) as FormValueTransformers<T>;
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

  /** Whether two values are the same. See the `isSameValue` transformer. */
  public isSameValue(a: T, b: T): boolean {
    return this._transformers.isSameValue(a, b);
  }
}

export function createFormValueState<T>(
  host: LitElement,
  config: FormValueConfig<T>
): FormValue<T> {
  return new FormValue(host as IgcFormControl, config);
}

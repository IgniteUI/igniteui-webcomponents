import {
  convertToDate,
  convertToDateRange,
  getDateFormValue,
} from '../../../calendar/helpers.js';
import type { DateRangeValue } from '../../../date-range-picker/date-range-picker.js';
import { asNumber } from '../../util.js';
import type { FormValueType, IgcFormControl } from './types.js';

export type FormValueTransformers<T> = {
  setValue: (value: T) => T;
  getValue: (value: T) => T;
  setDefaultValue: (value: T) => T;
  getDefaultValue: (value: T) => T;
  setFormValue: (value: T, host: IgcFormControl) => FormValueType;
};

export type FormValueConfig<T> = {
  initialValue: T;
  initialDefaultValue?: T;
  transformers?: Partial<FormValueTransformers<T>>;
};

// Transformers

export const FormValueDefaultTransformers: FormValueTransformers<string> = {
  setValue: (value) => value || '',
  getValue: (value) => value,
  setDefaultValue: (value) => value || '',
  getDefaultValue: (value) => value,
  setFormValue: (value, _) => value || null,
};

export const FormValueBooleanTransformers: Partial<
  FormValueTransformers<boolean>
> = {
  setValue: Boolean,
  setDefaultValue: Boolean,
  setFormValue: (checked, host) =>
    checked && 'value' in host ? (host.value as string) || 'on' : null,
};

export const FormValueNumberTransformers: Partial<
  FormValueTransformers<number>
> = {
  setValue: asNumber,
  setDefaultValue: asNumber,
  setFormValue: (value) => value.toString(),
};

export const FormValueDateTimeTransformers: Partial<
  FormValueTransformers<Date | null>
> = {
  setValue: convertToDate,
  setDefaultValue: convertToDate,
  setFormValue: getDateFormValue,
};

export const FormValueDateRangeTransformers: Partial<
  FormValueTransformers<DateRangeValue | null>
> = {
  setValue: convertToDateRange,
  setDefaultValue: convertToDateRange,
  setFormValue: (value, host) => {
    if (!host.name) {
      return null;
    }
    const start = value?.start?.toISOString();
    const end = value?.end?.toISOString();

    const formData = new FormData();

    if (start) {
      formData.append(`${host.name}-start`, start);
    }
    if (end) {
      formData.append(`${host.name}-end`, end);
    }

    return formData;
  },
};

export const FormValueFileListTransformers: FormValueTransformers<FileList | null> =
  {
    setValue: (value) => value || null,
    getValue: (value) => value,
    setDefaultValue: (value) => value || null,
    getDefaultValue: (value) => value,
    setFormValue: (files, host) => {
      if (!(host.name && files)) {
        return null;
      }

      const formData = new FormData();
      for (const file of files) {
        formData.append(host.name, file);
      }

      return formData;
    },
  };

export const FormValueSelectTransformers: Partial<
  FormValueTransformers<string | undefined>
> = {
  setValue: (value) => value || undefined,
  setDefaultValue: (value) => value || undefined,
};

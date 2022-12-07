import { ComplexAttributeConverter } from 'lit';
import { FilteringOptions } from '../types.js';

export const filteringOptionsConverter: ComplexAttributeConverter<
  FilteringOptions<object>
> = {
  toAttribute: (value: FilteringOptions<object>) => {
    return JSON.stringify(value);
  },
  fromAttribute: (value: string) => {
    return JSON.parse(value.replace(/'/gi, '"')) as FilteringOptions<object>;
  },
};

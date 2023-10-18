import type { RenderItemFunction } from '@lit-labs/virtualizer/virtualize.js';
import { ReactiveControllerHost, TemplateResult } from 'lit';

import IgcComboComponent from './combo.js';

export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];
export type Item<T extends object> = T | Values<T>;

export type ComboRecord<T extends object> = {
  value: T;
  header: boolean;
  dataIndex: number;
};

export type ComboHost<T extends object> = ReactiveControllerHost &
  IgcComboComponent<T>;

export type GroupingDirection = 'asc' | 'desc';
export type ComboChangeType = 'selection' | 'deselection' | 'addition';
export type ComboRenderFunction<T extends object> = RenderItemFunction<
  ComboRecord<T>
>;
export type ComboValue<T> = T | Values<T>;

export interface FilteringOptions<T extends object> {
  filterKey: Keys<T> | undefined;
  caseSensitive?: boolean;
  matchDiacritics?: boolean;
}

export interface GroupingOptions<T extends object> {
  groupKey?: Keys<T>;
  valueKey?: Keys<T>;
  displayKey?: Keys<T>;
  direction: GroupingDirection;
}

/* marshalByValue */
export interface IgcComboChangeEventArgs<T extends object = any> {
  newValue: ComboValue<T>[];
  /* primitiveValue */
  items: T[];
  /* blazorAlternateName: changeType */
  type: ComboChangeType;
}

export interface IgcComboEventMap {
  igcChange: CustomEvent<IgcComboChangeEventArgs>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

export type ComboItemTemplate<T extends object> = (
  props: ComboTemplateProps<T>
) => TemplateResult;
export interface ComboTemplateProps<T extends object> {
  item: T;
}

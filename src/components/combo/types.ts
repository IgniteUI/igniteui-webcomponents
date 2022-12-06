import { ReactiveControllerHost, TemplateResult } from 'lit';
import IgcComboComponent from './combo.js';

export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];

export interface ComboRecordMeta {
  header: boolean;
}

export type ComboRecord<T extends object> = T & ComboRecordMeta;

export type ComboHost<T extends object> = ReactiveControllerHost &
  IgcComboComponent<T>;

export type GroupingDirection = 'asc' | 'desc';
export type ComboChangeType = 'selection' | 'deselection' | 'addition';

export interface FilteringOptions<T extends object> {
  filterKey: Keys<T> | undefined;
  caseSensitive?: boolean;
}

export interface GroupingOptions<T extends object> {
  groupKey?: Keys<T>;
  valueKey?: Keys<T>;
  displayKey?: Keys<T>;
  direction: GroupingDirection;
}

export interface IgcComboChangeEventArgs {
  newValue: string;
  items: object;
  type: ComboChangeType;
}

export interface IgcComboEventMap {
  /* blazorSuppress */
  igcChange: CustomEvent<IgcComboChangeEventArgs>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

export type ComboItemTemplate<T extends object> = (item: T) => TemplateResult;

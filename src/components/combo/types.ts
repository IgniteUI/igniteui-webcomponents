import { ReactiveControllerHost } from 'lit';
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

export interface IgcComboEventMap {
  /* blazorSuppress */
  igcChange: CustomEvent<string>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
  igcOpening: CustomEvent<string>;
  igcOpened: CustomEvent<string>;
  igcClosing: CustomEvent<string>;
  igcClosed: CustomEvent<string>;
  igcFiltering: CustomEvent<string>;
  igcFiltered: CustomEvent<string>;
}

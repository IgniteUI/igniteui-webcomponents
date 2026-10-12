import type { ReactiveControllerHost, TemplateResult } from 'lit';
import type { VirtualScrollItemTemplate } from '../virtualization/virtualization.js';
import type IgcComboComponent from './combo.js';

export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];
export type Item<T extends object> = T | Values<T>;

export type ComboRecord<T extends object> = {
  value: T;
  header: boolean;
  /**
   * 1-based position among the visible options. `-1` for group headers.
   * Each pipeline run sets it again.
   */
  position: number;
  /** The group of a header record as a string. Not set on the other records. */
  group?: string;
};

export type ComboHost<T extends object> = ReactiveControllerHost &
  IgcComboComponent<T>;

export type GroupingDirection = 'asc' | 'desc' | 'none';
export type ComboChangeType = 'selection' | 'deselection' | 'addition';
export type ComboRenderFunction<T extends object> = VirtualScrollItemTemplate<
  ComboRecord<T>
>;
export type ComboValue<T> = T | Values<T>;

/* jsonAPIPlainObject */
/** Filtering options for the combo component. */
export interface FilteringOptions<T extends object> {
  /** The key in the data source used when filtering the list of options. */
  filterKey: Keys<T> | undefined;
  /** Determines whether the filtering operation should be case sensitive. */
  caseSensitive?: boolean;
  /** When true, the filter distinguishes between accented letters and their base letters. */
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

export interface IgcComboComponentEventMap {
  igcChange: CustomEvent<IgcComboChangeEventArgs>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
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

export type ComboGroupHeaderTemplate<T extends object> = (
  props: ComboGroupHeaderContext<T>
) => TemplateResult;
/** The context of the group header template. */
export interface ComboGroupHeaderContext<T extends object> {
  /**
   * The group of the header: the value of the `groupKey` field as a string.
   * `Other` for the items without a value in that field.
   */
  group: string;
  /**
   * A record made for the header, not a data item. Only the `groupKey`,
   * `valueKey` and `displayKey` fields are set, and each contains the group value.
   * @deprecated since 7.5.0. Use the `group` property instead.
   */
  item: T;
}

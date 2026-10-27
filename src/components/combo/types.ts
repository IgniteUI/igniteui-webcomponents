import type { ReactiveControllerHost, TemplateResult } from 'lit';
import type { VirtualScrollDataRequest } from '../virtualization/types.js';
import type { VirtualScrollItemTemplate } from '../virtualization/virtualization.js';
import type IgcComboComponent from './combo.js';

export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];
export type Item<T extends object> = T | Values<T>;

export type ComboRecord<T extends object> = {
  value: T;
  header: boolean;
  /**
   * 1-based position among the options, for `aria-posinset`. `-1` for the
   * other records and for the shared select-all and placeholder records,
   * whose positions come from their index. Each pipeline run sets it again.
   */
  position: number;
  /** The group value of a header record. Not set on the other records. */
  group?: unknown;
  /**
   * Set on a record with no item: a placeholder for an item to load, or the
   * select-all option.
   */
  kind?: 'placeholder' | 'select-all';
};

export type ComboHost<T extends object> = ReactiveControllerHost &
  IgcComboComponent<T>;

export type GroupingDirection = 'asc' | 'desc' | 'none';
export type ComboChangeType = 'selection' | 'deselection' | 'addition';
export type ComboRenderFunction<T extends object> = VirtualScrollItemTemplate<
  ComboRecord<T>
>;
export type ComboValue<T> = T | Values<T>;
export type ComboFilteringMode = 'local' | 'remote';

/* jsonAPIPlainObject */
/** Filtering options for the combo component. */
export interface FilteringOptions<T extends object> {
  /** The key in the data source used when filtering the list of options. */
  filterKey: Keys<T> | undefined;
  /** Determines whether the filtering operation should be case sensitive. */
  caseSensitive?: boolean;
  /** When true, the filter distinguishes between accented letters and their base letters. */
  matchDiacritics?: boolean;
  /**
   * Where the filtering runs. With `remote`, the combo does not filter the
   * options: the application sets `data` on `igcSearchInput`, and appends to
   * it on `igcDataRequest`. Default is `local`.
   */
  mode?: ComboFilteringMode;
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

export interface IgcComboSearchInputEventArgs {
  /** The text of the search input, or of the main input in single selection mode. */
  searchText: string;
}

/**
 * The user action that closes the list of options. `toggle` is a click on the
 * input, and `selection` an item click in single selection mode.
 */
export type ComboCloseTrigger =
  | 'enter'
  | 'escape'
  | 'tab'
  | 'arrow-up'
  | 'outside-click'
  | 'scroll'
  | 'toggle'
  | 'selection';

export interface IgcComboClosingEventArgs {
  /** The user action that closes the list. */
  trigger: ComboCloseTrigger;
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
  igcClosing: CustomEvent<IgcComboClosingEventArgs>;
  igcClosed: CustomEvent<IgcComboClosingEventArgs>;
  igcSearchInput: CustomEvent<IgcComboSearchInputEventArgs>;
  igcDataRequest: CustomEvent<VirtualScrollDataRequest>;
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
   * The value that the items of the group share in the `groupKey` field.
   * `Other` for the items without a value in that field.
   */
  key: unknown;
  /**
   * A record made for the header, not a data item. Only the `groupKey`,
   * `valueKey` and `displayKey` fields are set, and each contains the group value.
   * @deprecated since 7.5.0. Use the `key` property instead.
   */
  item: T;
}

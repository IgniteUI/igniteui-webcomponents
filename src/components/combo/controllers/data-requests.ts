import type { PropertyValues } from 'lit';
import { startsWith } from '#internals/utils/arrays.js';
import type { VirtualScrollDataRequest } from '../../virtualization/types.js';
import type IgcVirtualScrollComponent from '../../virtualization/virtualization.js';
import { REMOTE_SCROLLING_THRESHOLD } from '../../virtualization/virtualization.js';
import type IgcComboComponent from '../combo.js';
import type { DataState } from './data.js';
import { newResultsHints } from './results-hint.js';

const DATA_REQUEST_COUNT = 20;

type DataRequestsHost<T extends object> = Pick<
  IgcComboComponent<T>,
  'open' | 'data' | 'filteringOptions' | 'valueKey'
>;

type DataRequestsState<T extends object> = Pick<
  DataState<T>,
  'loadedLength' | 'totalCount'
>;

type DataRequestsList = Pick<
  IgcVirtualScrollComponent,
  'updateComplete' | 'scrollToIndex'
>;

/**
 * Requests more data in remote filtering mode while the open list renders
 * near the end of `data`, or renders placeholders, up to `totalItemCount`.
 * The host emits each request as `igcDataRequest`.
 */
export class ComboDataRequests<T extends object> {
  private readonly _host: DataRequestsHost<T>;
  private readonly _state: DataRequestsState<T>;
  private readonly _request: (detail: VirtualScrollDataRequest) => void;

  /** The length of `data` at the last request. */
  private _lastDataRequest?: number;
  /** The index of the last rendered option, from the list. */
  private _lastRenderedIndex = -1;
  /** Whether a search came after the last `data`. Cleared after the update of a `data`. */
  private _searched = false;
  /**
   * The scroll to the top of new results. A hidden list scrolls when it shows,
   * so an opening waits for it before the check. See `_checkAfter`.
   */
  private _toTop?: Promise<void>;

  constructor(
    host: DataRequestsHost<T>,
    state: DataRequestsState<T>,
    request: (detail: VirtualScrollDataRequest) => void
  ) {
    this._host = host;
    this._state = state;
    this._request = request;
  }

  /** Starts a new sequence of requests. */
  public reset(): void {
    this._lastDataRequest = undefined;
  }

  /** Starts the sequence of a new search. */
  public searched(): void {
    this.reset();
    this._searched = true;
  }

  /**
   * Whether `data` holds new results after `old`, in remote mode. New results
   * show from the top and start a new sequence of requests. A binder can tell
   * it (see `newResultsHints`). Otherwise, they are the first `data` after a
   * search, a shorter `data`, or another first `valueKey`. A `data` that starts
   * with the items of `old`, such as an appended page, is not new, also after a
   * search that the application did not load. Without `valueKey`, a copy of the
   * records is not new.
   */
  private _isNew(old: T[]): boolean {
    const { data, filteringOptions, valueKey } = this._host;

    if (filteringOptions.mode !== 'remote' || !old.length) {
      return false;
    }

    const hint = newResultsHints.get(this._host);

    if (hint !== undefined) {
      return hint;
    }

    const firstKey = (records: T[]) =>
      valueKey ? records[0]?.[valueKey] : undefined;

    return (
      !startsWith(data, old) &&
      (this._searched ||
        data.length < old.length ||
        firstKey(data) !== firstKey(old))
    );
  }

  /**
   * Call from the `willUpdate()` of the host for a new `data`. New results
   * show from the top. See {@link _isNew}.
   * @returns Whether `data` holds new results.
   */
  public dataChanged(old: T[], list?: DataRequestsList): boolean {
    const isNew = this._isNew(old);

    if (isNew) {
      this._showFromTop(list);
    }

    return isNew;
  }

  private _showFromTop(list?: DataRequestsList): void {
    this._toTop = list?.scrollToIndex(0);
  }

  /** Takes the end of the window that the list renders. */
  public rendered(endIndex: number): void {
    this._lastRenderedIndex = endIndex;
    this._check();
  }

  /** Call from the `updated()` of the host. */
  public afterUpdate(
    props: PropertyValues<IgcComboComponent<T>>,
    list?: DataRequestsList
  ): void {
    const opened = props.has('open') && this._host.open;
    const changed = props.has('data');

    // An opening or new results start a new sequence of requests. Opening
    // again also retries a failed request. The same rule as `dataChanged()`.
    if (opened || (changed && this._isNew(props.get('data') ?? []))) {
      this.reset();
    }

    if (changed) {
      this._searched = false;
      newResultsHints.delete(this._host);
    }

    // The list reports a changed window after its own update, and an
    // unchanged one not at all, so check against the window after it.
    if (opened || changed || props.has('totalItemCount')) {
      void list?.updateComplete.then(() => this._checkAfter(opened));
    }
  }

  /** Checks after a pending scroll to the top, against the new window. */
  private async _checkAfter(opened: boolean): Promise<void> {
    const toTop = this._toTop;

    if (opened && toTop) {
      this._toTop = undefined;
      await toTop;
    }

    this._check();
  }

  /**
   * The `count` covers the rendered placeholders. An empty `data` waits for
   * the first page from the application.
   */
  private _check(): void {
    const { open, data, filteringOptions } = this._host;
    const { length } = data;
    const { loadedLength, totalCount } = this._state;

    if (
      !open ||
      !length ||
      filteringOptions.mode !== 'remote' ||
      this._lastDataRequest === length ||
      length >= totalCount ||
      this._lastRenderedIndex < loadedLength - REMOTE_SCROLLING_THRESHOLD
    ) {
      return;
    }

    const placeholders = this._lastRenderedIndex - loadedLength + 1;

    this._lastDataRequest = length;
    this._request({
      startIndex: length,
      count: Math.min(
        totalCount - length,
        Math.max(DATA_REQUEST_COUNT, placeholders)
      ),
    });
  }
}

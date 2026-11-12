import type { PropertyValues } from 'lit';
import type { VirtualScrollDataRequest } from '../../virtualization/types.js';
import type IgcVirtualScrollComponent from '../../virtualization/virtualization.js';
import { REMOTE_SCROLLING_THRESHOLD } from '../../virtualization/virtualization.js';
import type IgcComboComponent from '../combo.js';
import type { DataState } from './data.js';

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
  'updateComplete' | 'checkVisibility' | 'scrollToIndex'
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
  /** Whether a search came after the last `data`. */
  private _searched = false;
  /** Whether a hidden list scrolls to the top when it opens. */
  private _toTopOnOpen = false;

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
   * Call from the `willUpdate()` of the host for a new `data`. Remote results
   * show from the top when they are new: the first `data` after a search, a
   * shorter `data`, or another first `valueKey`. A page appended to the same
   * records keeps the place, also after a search that the application did not
   * load. Without `valueKey`, a copy of the records is not new.
   * @returns Whether `data` holds new results.
   */
  public dataChanged(old: T[], list?: DataRequestsList): boolean {
    const { data, filteringOptions, valueKey } = this._host;
    const searched = this._searched;
    const last = old.length - 1;
    const appended =
      data.length > last && data[0] === old[0] && data[last] === old[last];
    const firstKey = (records: T[]) =>
      valueKey ? records[0]?.[valueKey] : undefined;
    const isNew =
      filteringOptions.mode === 'remote' &&
      old.length > 0 &&
      !appended &&
      (searched ||
        data.length < old.length ||
        firstKey(data) !== firstKey(old));

    this._searched = false;

    if (isNew) {
      this._showFromTop(list);
    }

    return isNew;
  }

  /** A hidden list cannot scroll, so it scrolls when it opens. */
  private _showFromTop(list?: DataRequestsList): void {
    if (list?.checkVisibility()) {
      void list.scrollToIndex(0);
    } else {
      this._toTopOnOpen = true;
    }
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
    const { open, data } = this._host;
    const opened = props.has('open') && open;
    const replaced = props.has('data') && props.get('data')?.[0] !== data[0];

    // An opening, or a replaced `data` rather than an appended one, starts a
    // new sequence of requests. Opening again also retries a failed request.
    if (opened || replaced) {
      this.reset();
    }

    // The list reports a changed window after its own update, and an
    // unchanged one not at all, so check against the window after it.
    if (opened || props.has('data') || props.has('totalItemCount')) {
      void list?.updateComplete.then(() => this._checkAfter(list, opened));
    }
  }

  /** Checks after a pending scroll to the top, against the new window. */
  private async _checkAfter(
    list: DataRequestsList,
    opened: boolean
  ): Promise<void> {
    if (opened && this._toTopOnOpen) {
      this._toTopOnOpen = false;
      this._showFromTop(list);
      await list.updateComplete;
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

import type { PropertyValues, ReactiveElement } from 'lit';
import type { VirtualScrollDataRequest } from '../../virtualization/types.js';
import { REMOTE_SCROLLING_THRESHOLD } from '../../virtualization/virtualization.js';
import type IgcComboComponent from '../combo.js';
import type { DataState } from './data.js';

const DATA_REQUEST_COUNT = 20;

type DataRequestsHost<T extends object> = Pick<
  IgcComboComponent<T>,
  'open' | 'data' | 'filteringOptions'
>;

type DataRequestsState<T extends object> = Pick<
  DataState<T>,
  'loadedLength' | 'totalCount'
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

  /** Takes the end of the window that the list renders. */
  public rendered(endIndex: number): void {
    this._lastRenderedIndex = endIndex;
    this._check();
  }

  /** Call from the `updated()` of the host. */
  public afterUpdate(
    props: PropertyValues<IgcComboComponent<T>>,
    list?: Pick<ReactiveElement, 'updateComplete'>
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
      void list?.updateComplete.then(() => this._check());
    }
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

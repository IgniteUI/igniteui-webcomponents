import { createTimer } from '#internals/timing.js';
import type IgcComboComponent from '../components/combo/combo.js';
import type { IgcComboSearchInputEventArgs } from '../components/combo/types.js';
import type { VirtualScrollDataRequest } from '../components/virtualization/types.js';

/** A request for one page of the results of a search. */
export interface ComboDataRequest {
  /** The search text, trimmed. It is empty for all the items. */
  searchText: string;
  /** The index in the results of the first item to load. */
  startIndex: number;
  /** The number of items to load. The source can return fewer. */
  count: number;
}

/** One page of the results of a search. */
export interface ComboDataPage<T> {
  /** The items of the page. */
  items: T[];
  /** The number of all the results, when the source knows it. No request goes past it. */
  totalCount?: number;
}

/** A remote source that searches and pages on the server. */
export interface ComboDataSource<T> {
  /** Loads one page. Pass `signal` to `fetch`, so that a newer search aborts the request. */
  load(
    request: ComboDataRequest,
    signal: AbortSignal
  ): Promise<ComboDataPage<T>>;
  /**
   * Loads the items of the selected values that the loaded pages do not hold,
   * such as the values of a saved filter. It runs when the binding starts,
   * after each load and when the list opens, one time per value. It needs a
   * `valueKey` on the combo.
   */
  resolve?(values: unknown[], signal: AbortSignal): Promise<T[]>;
}

export interface ComboDataSourceOptions {
  /** The pause in the typing, in milliseconds, before a search loads. Default is `300`. */
  debounce?: number;
  /** The number of items that each request loads. Default is `50`. */
  pageSize?: number;
  /**
   * Whether the first page loads when the user opens the list with no items.
   * `show()` emits no events, so call `refresh()` after it. Default is `true`.
   */
  loadOnOpen?: boolean;
  /** Gets the error of a failed request. The combo keeps its items. */
  onError?: (error: unknown) => void;
}

export interface ComboDataBinding {
  /** Loads the first page of the current search text again. */
  refresh(): Promise<void>;
  /**
   * Removes the listeners, aborts the requests in flight, and gives the combo
   * back its filtering mode.
   */
  dispose(): void;
}

/**
 * Binds a combo to a remote source. The binding sets `filteringOptions.mode`
 * to `remote`. It loads the first page when the list opens with no items and
 * after a pause in the typing, and appends the next page on `igcDataRequest`,
 * up to the total count of the source. A newer search aborts the older
 * requests, and an answer for items that changed since is dropped.
 *
 * @example
 * ```ts
 * const binding = bindComboDataSource(combo, {
 *   load: async ({ searchText, startIndex, count }, signal) => {
 *     const query = `q=${encodeURIComponent(searchText)}&skip=${startIndex}&top=${count}`;
 *     const response = await fetch(`/api/cities?${query}`, { signal });
 *     const { items, total } = await response.json();
 *     return { items, totalCount: total };
 *   },
 * });
 * ```
 */
export function bindComboDataSource<T extends object>(
  combo: IgcComboComponent<T>,
  source: ComboDataSource<T>,
  {
    debounce = 300,
    pageSize = 50,
    loadOnOpen = true,
    onError,
  }: ComboDataSourceOptions = {}
): ComboDataBinding {
  const disposal = new AbortController();
  const search = createTimer(() => void load(0), debounce);
  const { mode } = combo.filteringOptions;
  // The values asked for: in flight, or not found by the source.
  const requested = new Set<unknown>();
  // The search of the next first page, and the search of the items in `data`.
  let searchText = '';
  let loaded = { searchText, totalCount: Number.POSITIVE_INFINITY };
  // Whether the search text changed while the list was closed.
  let stale = false;
  let request: AbortController | undefined;

  const busy = (): boolean => request !== undefined || search.active;

  /** Loads a page. A newer load aborts it, so only the latest one applies. */
  async function load(startIndex: number): Promise<void> {
    search.stop();
    request?.abort();
    const current = new AbortController();
    request = current;
    // A next page continues the search of the loaded items.
    const text = startIndex ? loaded.searchText : searchText;

    try {
      const page = await source.load(
        { searchText: text, startIndex, count: pageSize },
        current.signal
      );

      // A next page applies only to the items that it was requested for.
      if (
        current.signal.aborted ||
        (startIndex && combo.data.length !== startIndex)
      ) {
        return;
      }

      loaded = {
        searchText: text,
        totalCount: page.totalCount ?? Number.POSITIVE_INFINITY,
      };
      combo.data = startIndex ? [...combo.data, ...page.items] : page.items;
    } catch (error) {
      if (!current.signal.aborted) {
        onError?.(error);
      }
      return;
    } finally {
      if (request === current) {
        request = undefined;
      }
    }

    await resolveMissing();
  }

  /** Selects the items of the values that have none. */
  async function resolveMissing(): Promise<void> {
    const { valueKey } = combo;

    if (!(source.resolve && valueKey)) {
      return;
    }

    // The combo matches the selection to a new `data` in its update.
    await combo.updateComplete;

    if (combo.value.length === combo.selection.length) {
      return;
    }

    const known = new Set<unknown>(
      combo.selection.map((item) => item[valueKey])
    );
    const missing = combo.value.filter(
      (value) => !(known.has(value) || requested.has(value))
    );

    if (!missing.length) {
      return;
    }

    for (const value of missing) {
      requested.add(value);
    }

    try {
      const items = await source.resolve(missing, disposal.signal);

      if (disposal.signal.aborted) {
        return;
      }

      // A found value can be missing again later, for example after a deselection.
      for (const item of items) {
        requested.delete(item[valueKey]);
      }

      // `select()` with no items selects all of them.
      if (items.length) {
        combo.select(items);
      }
    } catch (error) {
      for (const value of missing) {
        requested.delete(value);
      }

      if (!disposal.signal.aborted) {
        onError?.(error);
      }
    }
  }

  const handleSearchInput = ({
    detail,
  }: CustomEvent<IgcComboSearchInputEventArgs>): void => {
    const text = detail.searchText.trim();

    if (text === searchText) {
      return;
    }

    searchText = text;
    request?.abort();

    // A search in a closed list waits for the next opening.
    if (combo.open) {
      search.start();
    } else {
      search.stop();
      stale = true;
    }
  };

  const handleDataRequest = ({
    detail,
  }: CustomEvent<VirtualScrollDataRequest>): void => {
    // A pending search replaces the items, and nothing comes after `totalCount`.
    if (!busy() && detail.startIndex < loaded.totalCount) {
      void load(detail.startIndex);
    }
  };

  const handleOpening = (): void => {
    if ((stale || (loadOnOpen && !combo.data.length)) && !busy()) {
      void load(0);
    }

    stale = false;
    void resolveMissing();
  };

  const listener = { signal: disposal.signal };
  combo.addEventListener('igcSearchInput', handleSearchInput, listener);
  combo.addEventListener('igcDataRequest', handleDataRequest, listener);
  combo.addEventListener('igcOpening', handleOpening, listener);
  combo.filteringOptions = { mode: 'remote' };
  void resolveMissing();

  return {
    refresh: () => (disposal.signal.aborted ? Promise.resolve() : load(0)),
    dispose() {
      search.stop();
      request?.abort();
      disposal.abort();
      combo.filteringOptions = { mode };
    },
  };
}

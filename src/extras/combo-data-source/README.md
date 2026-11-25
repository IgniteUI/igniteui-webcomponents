# Combo data source

`bindComboDataSource()` binds an `igc-combo` to a server that searches and pages. The combo then loads its items one
page at a time, while the user scrolls and types.

```ts
import { bindComboDataSource } from 'igniteui-webcomponents/extras/combo-data-source';
```

## Usage

Give the binder a `load` function that returns one page:

```ts
const binding = bindComboDataSource(combo, {
  load: async ({ searchText, caseSensitive, startIndex, count }, signal) => {
    const query = `q=${encodeURIComponent(searchText)}&case=${caseSensitive}&skip=${startIndex}&top=${count}`;
    const response = await fetch(`/api/cities?${query}`, { signal });
    const { items, total } = await response.json();
    return { items, totalCount: total };
  },
});
```

The binding:

- sets `filteringOptions.mode` of the combo to `remote`;
- loads the first page when the list opens with no items, and after a pause in the typing;
- loads the next page when the list scrolls to the items that it does not have yet;
- sets `totalItemCount` from `totalCount`, so the list shows a placeholder row for each item to load;
- sets `loading` while a search waits or a page loads;
- aborts the older requests when a new search starts. Pass `signal` to `fetch`.

A page without `totalCount` keeps the current total, and a next page with no items ends the results.

## Selected values that are not loaded

A combo with a `valueKey` can have values whose items are not on a loaded page, such as the values of a saved filter.
Give the binder a `resolve` function that loads these items:

```ts
bindComboDataSource(combo, {
  load: loadPage,
  resolve: async (values, signal) => {
    const response = await fetch(`/api/cities?ids=${values.join(',')}`, { signal });
    return response.json();
  },
});
```

It runs when the binding starts, after each load and when the list opens, one time for each value.

## Options

The third argument takes these options:

| Option       | Type                         | Default | Description                                                                                 |
| ------------ | ---------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `debounce`   | `number`                     | `300`   | The pause in the typing, in milliseconds, before a search loads.                            |
| `pageSize`   | `number`                     | `50`    | The smallest number of items that a request loads.                                          |
| `loadOnOpen` | `boolean`                    | `true`  | Whether the first page loads when the user opens the list with no items.                    |
| `onError`    | `(error: unknown) => void`   | Not set | Gets the error of a failed request. The combo keeps its items.                              |

## Binding

| Member      | Description                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `refresh()` | Loads the first page of the current search text again. Call it after a change of `filteringOptions.caseSensitive` in code, or after `show()`, which emits no events. |
| `dispose()` | Removes the listeners, aborts the requests in flight, gives the combo back its filtering mode, and clears `totalItemCount` and `loading`. |

See [Remote data](../../components/combo/spec.md#remote-data) in the combo specification and the `RemoteData` story.

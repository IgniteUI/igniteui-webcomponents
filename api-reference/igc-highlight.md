# igc-highlight

Searches the text projected into its default slot and highlights the matches.
It uses the native CSS Custom Highlight API, so it does not change the DOM.

The component supports case-sensitive matching and programmatic navigation between
matches. Navigation scrolls the active match into view. When the content changes,
the component searches it again and keeps the active match where it can.

```ts
import { defineComponents, IgcHighlightComponent } from 'igniteui-webcomponents';

defineComponents(IgcHighlightComponent);
```

## Properties

- `caseSensitive`: `boolean`. Default: `false`. Attribute: `case-sensitive`, reflected.
  Whether the matching distinguishes upper and lower case.
  When `true`, only exact-case occurrences of `searchText` are highlighted.
- `searchText`: `string`. Default: `''`. Attribute: `search-text`.
  The string to search and highlight in the DOM content of the component.
  A change of this property starts a new search.
  An empty string clears all highlights.
- `size`: `number`. Read-only. No attribute.
  The total number of matches found for the current `searchText`. Returns `0` when there are no matches or `searchText` is empty.
- `current`: `number`. Read-only. No attribute.
  The zero-based index of the active match. Returns `0` when there are no matches.

## Methods

- `next(options?: HighlightNavigation): void`
  Moves the active highlight to the next match.
  Wraps around to the first match after the last one.
- `previous(options?: HighlightNavigation): void`
  Moves the active highlight to the previous match.
  Wraps around to the last match when going back from the first one.
- `setActive(index: number, options?: HighlightNavigation): void`
  Moves the active highlight to the match at the specified zero-based index.
- `search(): void`
  Re-runs the highlight search based on the current `searchText` and `caseSensitive` values,
  and makes the first match active.

  The component also searches again by itself after its content changes.

## Slots

- default: The content to search. Only content projected here takes part in the matching.

## CSS custom properties

- `--foreground`: The text color for a highlighted text node. Set it on the host.
- `--background`: The background color for a highlighted text node. Set it on the host.
- `--foreground-active`: The text color for the active highlighted text node. Set it on the host.
- `--background-active`: The background color for the active highlighted text node. Set it on the host.

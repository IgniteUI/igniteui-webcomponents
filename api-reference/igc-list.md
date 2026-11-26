# igc-list

Displays a collection of data items in a templatable list format.

```ts
import { defineComponents, IgcListComponent } from 'igniteui-webcomponents';

defineComponents(IgcListComponent);
```

## Properties

- `navigation`: `'none' | 'listbox'`. Default: `'none'`. Attribute: `navigation`.
  The keyboard navigation of the list.

  - `none`: a static list. Its items are not focusable.
  - `listbox`: the list is one tab stop. The arrow keys, Home, End and typed
    letters move between the items, and Enter or Space clicks the focused
    item. Each item exposes its `selected` state to assistive technology.
    An item holds no interactive content.

  The app owns the selection. It toggles `selected` on the items, for
  example in a `click` handler, and sets `aria-multiselectable="true"` on
  the list when more than one item can be selected.

## Slots

- default: Renders the list items and list headers inside default slot.
- `empty`: Renders content while the list has no items, such as a "No results" message.

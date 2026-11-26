# igc-list

Displays a collection of data items in a templatable list format.

```ts
import { defineComponents, IgcListComponent } from 'igniteui-webcomponents';

defineComponents(IgcListComponent);
```

## Properties

- `navigation`: `'none' | 'listbox' | 'grid'`. Default: `'none'`. Attribute: `navigation`.
  The keyboard navigation of the list.

  - `none`: a static list. Its items are not focusable.
  - `listbox`: the list is one tab stop. The arrow keys, Home, End and typed
    letters move between the items, and Enter or Space clicks the focused
    item. An item holds no interactive content.
  - `grid`: as `listbox`, for items that hold controls. Left and Right move
    between an item and its controls, and Escape or F2 returns to the item.
    A control that uses the arrow keys, such as a text field, keeps them.

  The app owns the selection: it toggles `selected` on the items and sets
  `aria-multiselectable="true"` on the list for a multiple selection. In a
  grid, an item that is not selected exposes its state only with
  `aria-multiselectable`.

## Slots

- default: Renders the list items and list headers inside default slot.
- `empty`: Renders content while the list has no items, such as a "No results" message.

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
    item. Each item exposes its `selected` state to assistive technology.
    An item holds no interactive content.
  - `grid`: as `listbox`, and each item is a row that can hold controls.
    The list takes the controls out of the tab order. Left and Right move
    between the item and its controls, Up and Down move from a control to
    the next or previous item, and Escape or F2 returns to the item. A
    control that uses the arrow keys, such as a text field, keeps them.

  The app owns the selection. It toggles `selected` on the items, for
  example in a `click` handler, and sets `aria-multiselectable="true"` on
  the list when more than one item can be selected. A grid item that is not
  selected exposes its state only while the list has `aria-multiselectable`.

## Slots

- default: Renders the list items and list headers inside default slot.
- `empty`: Renders content while the list has no items, such as a "No results" message.

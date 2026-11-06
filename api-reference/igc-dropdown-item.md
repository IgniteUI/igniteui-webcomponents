# igc-dropdown-item

Represents an item in a dropdown list.

```ts
import { defineComponents, IgcDropdownItemComponent } from 'igniteui-webcomponents';

defineComponents(IgcDropdownItemComponent);
```

## Properties

- `active`: `boolean`. Attribute: `active`, reflected.
  Whether the item is active. The active item has the visual focus during
  keyboard navigation.
- `disabled`: `boolean`. Attribute: `disabled`, reflected.
  Whether the item is disabled.
- `selected`: `boolean`. Default: `false`. Attribute: `selected`, reflected.
  Whether the item is selected. A change also sets `active` to the same
  value.
- `value`: `string`. Attribute: `value`.
  The value of the item. Falls back to the text content of the element.

## Slots

- `prefix`: Renders content before the item's main content.
- default: Renders the item's main content.
- `suffix`: Renders content after the item's main content.

## CSS parts

- `prefix`: The prefix wrapper of the dropdown item.
- `content`: The main content wrapper of the dropdown item.
- `suffix`: The suffix wrapper of the dropdown item.

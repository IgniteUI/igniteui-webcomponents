# igc-select-item

Represents an item in a select list.

```ts
import { defineComponents, IgcSelectItemComponent } from 'igniteui-webcomponents';

defineComponents(IgcSelectItemComponent);
```

## Properties

- `active`: `boolean`. Attribute: `active`, reflected.
  Whether the item is active. The active item is the target of keyboard
  navigation and the only item in the tab order.
- `disabled`: `boolean`. Attribute: `disabled`, reflected.
  Whether the item is disabled.
- `selected`: `boolean`. Default: `false`. Attribute: `selected`, reflected.
  Whether the item is selected. A change also sets `active` to the same
  value.
- `value`: `string`. Attribute: `value`.
  The value of the item. Falls back to the text content of the element.

## Slots

- default: Renders all content except the prefix and suffix.
- `prefix`: Renders content before the main content area.
- `suffix`: Renders content after the main content area.

## CSS parts

- `prefix`: The prefix wrapper of the select item.
- `content`: The main content wrapper of the select item.
- `suffix`: The suffix wrapper of the select item.

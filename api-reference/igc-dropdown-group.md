# igc-dropdown-group

A container for a group of dropdown items.

```ts
import { defineComponents, IgcDropdownGroupComponent } from 'igniteui-webcomponents';

defineComponents(IgcDropdownGroupComponent);
```

## Properties

- `items`: `Array<IgcDropdownItemComponent>`. No attribute.
  All child dropdown items.

## Slots

- `label`: Contains the group's label.
- default: Renders the items of the group.

## CSS parts

- `label`: The native label element.

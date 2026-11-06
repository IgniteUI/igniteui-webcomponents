# igc-select-group

A container for a group of select items.

```ts
import { defineComponents, IgcSelectGroupComponent } from 'igniteui-webcomponents';

defineComponents(IgcSelectGroupComponent);
```

## Properties

- `items`: `Array<IgcSelectItemComponent>`. No attribute.
  All child select items.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the group and all its children are disabled.

## Slots

- `label`: Contains the group's label.
- default: Renders the items of the group.

## CSS parts

- `label`: The native label element.

# igc-nav-drawer-item

Represents a navigation drawer item.

```ts
import { defineComponents, IgcNavDrawerItemComponent } from 'igniteui-webcomponents';

defineComponents(IgcNavDrawerItemComponent);
```

## Properties

- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the drawer item is disabled.
- `active`: `boolean`. Default: `false`. Attribute: `active`, reflected.
  Whether the drawer item is active.

## Slots

- `content`: The content slot for the drawer item.
- `icon`: The slot for the icon of the drawer item.

## CSS parts

- `base`: The base wrapper of the drawer item.
- `icon`: The icon container.
- `content`: The content container.
- `mini`: Added to the base part when the content slot is empty.

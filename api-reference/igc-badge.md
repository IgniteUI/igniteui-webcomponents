# igc-badge

Shows a status on a related item, or marks an area that needs attention.

```ts
import { defineComponents, IgcBadgeComponent } from 'igniteui-webcomponents';

defineComponents(IgcBadgeComponent);
```

## Properties

- `variant`: `'primary' | 'info' | 'success' | 'warning' | 'danger'`. Default: `'primary'`. Attribute: `variant`, reflected.
  The type (style variant) of the badge.
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the badge has an outline.
- `shape`: `'square' | 'rounded'`. Default: `'rounded'`. Attribute: `shape`, reflected.
  The shape of the badge.
- `dot`: `boolean`. Default: `false`. Attribute: `dot`, reflected.
  Whether the badge renders as a small dot without content.

## Slots

- default: The content of the badge.

## CSS parts

- `base`: The base wrapper of the badge.
- `icon`: Added to the base part when an icon is the only slotted element.

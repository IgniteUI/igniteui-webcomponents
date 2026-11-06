# igc-breadcrumbs

A breadcrumb navigation component that renders an ordered list of breadcrumb items.

```ts
import { defineComponents, IgcBreadcrumbsComponent } from 'igniteui-webcomponents';

defineComponents(IgcBreadcrumbsComponent);
```

## Properties

- `separator`: `string`. Default: `'tree_expand'`. Attribute: `separator`, reflected.
  The icon name used as the default separator between breadcrumb items.
  Can be overridden per-item using the `separator` slot on an individual breadcrumb item.

## Slots

- default: Default slot for the breadcrumb items.

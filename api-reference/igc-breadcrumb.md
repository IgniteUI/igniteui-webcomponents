# igc-breadcrumb

A single item within a breadcrumb navigation trail.

```ts
import { defineComponents, IgcBreadcrumbComponent } from 'igniteui-webcomponents';

defineComponents(IgcBreadcrumbComponent);
```

## Properties

- `current`: `boolean`. Default: `false`. Attribute: `current`, reflected.
  Whether the breadcrumb represents the current page.
  Sets `aria-current="page"` on the element when true.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the breadcrumb is disabled.
  Sets `aria-disabled="true"` on the element and removes the slotted
  content from the tab sequence while true.

## Slots

- default: The main content of the breadcrumb, typically an anchor (`<a>`) element.
- `prefix`: Renders content before the main breadcrumb content.
- `suffix`: Renders content after the main breadcrumb content.
- `separator`: Overrides the default separator icon rendered after the breadcrumb item. The separator is hidden from assistive technology.

## CSS parts

- `label`: The container wrapping the prefix, default, and suffix slots.
- `separator`: The container wrapping the separator slot content.

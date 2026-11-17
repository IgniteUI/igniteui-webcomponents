# igc-divider

Shows a horizontal or vertical rule as a break between content on a page.

```ts
import { defineComponents, IgcDividerComponent } from 'igniteui-webcomponents';

defineComponents(IgcDividerComponent);
```

## Properties

- `vertical`: `boolean`. Default: `false`. Attribute: `vertical`, reflected.
  Whether to render a vertical divider line.
- `middle`: `boolean`. Default: `false`. Attribute: `middle`, reflected.
  Whether the `--inset` value shrinks the line from both sides, not only from the start.
- `type`: `'solid' | 'dashed'`. Default: `'solid'`. Attribute: `type`, reflected.
  The style of the divider line: solid or dashed.

## CSS custom properties

- `--color`: The color of the divider.
- `--inset`: The amount by which the line shrinks from the start. When `middle` is set, the line shrinks from both sides.

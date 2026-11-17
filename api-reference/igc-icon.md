# igc-icon

Shows an SVG icon from a collection of registered icons.

```ts
import { defineComponents, IgcIconComponent } from 'igniteui-webcomponents';

defineComponents(IgcIconComponent);
```

## Properties

- `name`: `string`. Default: `''`. Attribute: `name`.
  The name of the icon glyph to draw.
- `collection`: `string`. Default: `'default'`. Attribute: `collection`.
  The registered collection to look the icon up in.
- `mirrored`: `boolean`. Default: `false`. Attribute: `mirrored`, reflected.
  Whether the icon is flipped horizontally, for example for RTL layouts.

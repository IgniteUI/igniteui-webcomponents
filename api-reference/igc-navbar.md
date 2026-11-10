# igc-navbar

A navigation bar component is used to facilitate navigation through
a series of hierarchical screens within an app.

```ts
import { defineComponents, IgcNavbarComponent } from 'igniteui-webcomponents';

defineComponents(IgcNavbarComponent);
```

## Slots

- default: Renders a title inside the default slot.
- `start`: Renders icons at the start of the navigation bar.
- `end`: Renders action icons at the end of the navigation bar.

## CSS parts

- `base`: The base wrapper of the navigation bar.
- `start`: The container of the start icons.
- `middle`: The navigation bar title container.
- `end`: The container of the end action icons.

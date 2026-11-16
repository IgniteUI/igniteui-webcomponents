# igc-card-actions

A container component for card action items such as buttons or icon buttons.
Actions can be positioned at the start, center, or end of the container.

```ts
import { defineComponents, IgcCardActionsComponent } from 'igniteui-webcomponents';

defineComponents(IgcCardActionsComponent);
```

## Properties

- `orientation`: `'horizontal' | 'vertical'`. Default: `'horizontal'`. Attribute: `orientation`, reflected.
  The orientation of the actions layout.

## Slots

- `start`: Renders items at the beginning of the actions area.
- default: Renders items in the center of the actions area.
- `end`: Renders items at the end of the actions area.

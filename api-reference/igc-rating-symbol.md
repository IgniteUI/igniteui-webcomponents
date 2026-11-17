# igc-rating-symbol

A custom symbol for the rating. Put the full symbol in the default slot and
the empty symbol in the `empty` slot.

```ts
import { defineComponents, IgcRatingSymbolComponent } from 'igniteui-webcomponents';

defineComponents(IgcRatingSymbolComponent);
```

## Slots

- default: Default slot for projected full symbols/icons.
- `empty`: Renders the projected empty symbols/icons.

## CSS parts

- `symbol`: The symbol wrapping container.
- `full`: The full symbol wrapping container.
- `empty`: The empty symbol wrapping container.

# igc-color-swatch

A color option of a color panel. A color panel and a color picker show
their swatch children in their swatch list.

A swatch without a `color` is the no-color swatch. A pick of it clears the
value.

```ts
import { defineComponents, IgcColorSwatchComponent } from 'igniteui-webcomponents';

defineComponents(IgcColorSwatchComponent);
```

## Properties

- `color`: `string | undefined`. Attribute: `color`.
  The color of the swatch. Accepts any CSS color, also with `var()`, which
  resolves from the custom properties of the swatch. A pick writes the
  resolved color.

  Without a color, the swatch is the no-color swatch.
- `label`: `string | undefined`. Attribute: `label`.
  The accessible name of the swatch. Without it, the name is the color
  name, such as "vibrant red", or "No color" for the no-color swatch.

## CSS parts

- `base`: The color fill of the swatch.

## CSS custom states

- `ig-selected`: The color of the swatch is the value of the panel.

# igc-circular-gradient

Defines a gradient stop for the fill of the circular progress.
Put it in the `gradient` slot of the circular progress. Each one becomes an SVG `<stop>` element.
The `color`, `offset` and `opacity` values go to the
`stop-color`, `offset` and `stop-opacity` of that element without validation.

```ts
import { defineComponents, IgcCircularGradientComponent } from 'igniteui-webcomponents';

defineComponents(IgcCircularGradientComponent);
```

## Properties

- `offset`: `string`. Default: `'0%'`. Attribute: `offset`.
  Where the stop sits along the gradient vector.
- `color`: `string`. Default: `'black'`. Attribute: `color`.
  The color of the stop.
- `opacity`: `number`. Default: `1`. Attribute: `opacity`.
  The opacity of the stop.

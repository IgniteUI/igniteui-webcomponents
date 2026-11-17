# igc-carousel-indicator

Used when a custom indicator needs to be passed to the carousel component.

```ts
import { defineComponents, IgcCarouselIndicatorComponent } from 'igniteui-webcomponents';

defineComponents(IgcCarouselIndicatorComponent);
```

## Properties

- `active`: `boolean`. Default: `false`. No attribute.
  Whether the indicator is in its active state. The carousel sets this value.
- `index`: `number`. Default: `0`. No attribute.
  The zero-based position of the indicator in the set. The carousel sets this value.

## Slots

- default: Renders the inactive state of the indicator.
- `active`: Renders the active state of the indicator.

## CSS parts

- `indicator`: The wrapping container of the carousel dot indicator.
- `inactive`: The wrapping container of the inactive dot indicator.
- `active`: The wrapping container of the active dot indicator.

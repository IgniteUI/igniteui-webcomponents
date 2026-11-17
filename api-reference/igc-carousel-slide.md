# igc-carousel-slide

A single content container within a set of containers used in the context of a carousel.

```ts
import { defineComponents, IgcCarouselSlideComponent } from 'igniteui-webcomponents';

defineComponents(IgcCarouselSlideComponent);
```

## Properties

- `active`: `boolean`. Default: `false`. Attribute: `active`, reflected.
  Whether the slide is the active slide of the carousel.
- `previous`: `boolean`. Default: `false`. Attribute: `previous`, reflected.
  Whether the slide is the outgoing slide of a running transition.
  The carousel sets this value.

## Slots

- default: Default slot for the carousel slide.

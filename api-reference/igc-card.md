# igc-card

A container component that wraps different elements related to a single subject.
The card component provides a flexible container for organizing content such as headers,
media, text content, and actions.

```ts
import { defineComponents, IgcCardComponent } from 'igniteui-webcomponents';

defineComponents(IgcCardComponent);
```

## Properties

- `elevated`: `boolean`. Default: `false`. Attribute: `elevated`, reflected.
  Whether the card has an elevated appearance with a shadow.
  When false, the card uses an outlined style with a border.

## Slots

- default: Renders the card content. Typically contains the card header, media, content and actions.

# igc-skeleton

Shows placeholder shapes over its content while the content loads, then
fades the content in.

```ts
import { defineComponents, IgcSkeletonComponent } from 'igniteui-webcomponents';

defineComponents(IgcSkeletonComponent);
```

## Properties

- `loading`: `boolean`. Default: `false`. Attribute: `loading`, reflected.
  Whether the skeleton is in a loading state.

  While loading, shapes cover the hidden, inert content, which fades in when
  loading ends.
- `animation`: `'none' | 'breathe' | 'wave'`. Default: `'breathe'`. Attribute: `animation`.
  The animation of the shapes while loading.

  - `none`: The shapes are static.
  - `breathe`: The shapes fade in and grow a little, then return.
  - `wave`: The shapes move up and back down, one after another.

  Another value, or no attribute, gives `breathe`. No animation runs when the
  user prefers reduced motion.

## Slots

- default: The default slot for the skeleton content.

## CSS parts

- `content`: The wrapper around the slotted content.
- `shape`: A placeholder shape over a leaf element or over a line of text.

## CSS custom properties

- `--ig-skeleton-shape-color`: The background color of the placeholder shapes.
- `--border-radius`: The border radius of the text shapes, and of each shape whose source element has no border radius.

## CSS custom states

- `revealing`: Set after loading ends, until the content has faded in. Ends at once when loading starts again or the skeleton is disconnected.

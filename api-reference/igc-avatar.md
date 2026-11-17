# igc-avatar

Shows the identity of a user, for example in a user profile.

```ts
import { defineComponents, IgcAvatarComponent } from 'igniteui-webcomponents';

defineComponents(IgcAvatarComponent);
```

## Properties

- `src`: `string | undefined`. Attribute: `src`.
  The image source to use.
- `alt`: `string | undefined`. Attribute: `alt`.
  Alternative text for the image.
- `initials`: `string | undefined`. Attribute: `initials`.
  Initials to use as a fallback when no image is available.
- `shape`: `'square' | 'circle' | 'rounded'`. Default: `'square'`. Attribute: `shape`, reflected.
  The shape of the avatar.

## Slots

- default: Renders an icon inside the default slot. Ignored when `initials` is set.

## CSS parts

- `base`: The base wrapper of the avatar.
- `initials`: The initials wrapper of the avatar.
- `image`: The image element of the avatar.

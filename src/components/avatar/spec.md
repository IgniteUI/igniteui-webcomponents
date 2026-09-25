# Avatar specification

- [Avatar specification](#avatar-specification)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Key features](#key-features)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Basic initialization](#basic-initialization)
      - [The content fallback chain](#the-content-fallback-chain)
      - [Combining with a badge](#combining-with-a-badge)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Default](#default)
    - [ARIA tests](#aria-tests)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

## Overview

The `igc-avatar` stands for the identity of a user, typically in a profile. It renders an image, a pair of
initials or an icon, and comes in three shapes.

```html
<igc-avatar initials="ZK" shape="circle"></igc-avatar>
```

### Key features

- **Three content kinds** — an image, initials or a projected icon — resolved through a fallback chain.
- **Three shapes**: square, rounded and circle.
- **A graceful image fallback**: an image that fails to load gives way to the initials or the icon.
- **Accessible by default**: the component names itself from the alternative text or the initials.

### Acceptance criteria

- The avatar must be able to show an image, initials or an icon.
- It must accept an image source and an alternative text for it.
- It must offer a square, a rounded and a circle shape.
- It must fall back to the initials or the icon when there is no image or the image fails.
- It must expose its background and foreground for customization.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see myself represented by an image, by my initials or by an icon;
- see an icon when neither an image nor initials are available;
- see the initials when both initials and an icon are available;
- see the image when all three are available.

### Developer stories

As a developer, I expect to be able to:

- show an image, initials or an icon as an avatar;
- set the shape of the avatar;
- set initials that serve as the fallback when there is no image;
- set an alternative text describing the image;
- rely on the component exposing a sensible accessible name;
- customize the colors of the background and the foreground.

## Functionality

### End-user experience

The avatar renders a square, rounded or circular box holding the image, the initials or the icon. The wiki page of
the component carries no design hand-off link.

### Developer experience

#### Basic initialization

```html
<igc-avatar src="/users/1.png" alt="Jane Doe"></igc-avatar>
<igc-avatar initials="JD" shape="circle"></igc-avatar>
<igc-avatar shape="rounded">
  <igc-icon name="person"></igc-icon>
</igc-avatar>
```

#### The content fallback chain

The image wins when there is one. While it loads, it is rendered next to the initials, so nothing jumps once it
arrives, and it drops out again when it fails to load. Changing `src` after a failure makes the component try
again. Without an image, the initials win over a projected icon; the icon is what is left when there are neither.

#### Combining with a badge

An [`igc-badge`](../badge/spec.md) projected into the avatar marks a status on it.

```html
<igc-avatar initials="ZK">
  <igc-badge variant="danger" outlined>6</igc-badge>
</igc-avatar>
```

### Localization

The component has no resource strings. The `alt` text and the initials come from the application and are the
localization points.

### Keyboard interactions

None applicable. The avatar is presentational and is not part of the tab order.

## API

### Properties and attributes

| Property   | Attribute  | Reflected | Type                                | Default  | Description                                       |
| ---------- | ---------- | --------- | ----------------------------------- | -------- | ------------------------------------------------- |
| `src`      | `src`      | no        | `string \| undefined`               | —        | The source of the image.                           |
| `alt`      | `alt`      | no        | `string \| undefined`               | —        | The alternative text of the image.                 |
| `initials` | `initials` | no        | `string \| undefined`               | —        | The initials shown when there is no image.         |
| `shape`    | `shape`    | yes       | `"square" \| "rounded" \| "circle"` | `square` | The shape of the avatar.                           |

### Methods

None applicable.

### Events

None applicable.

### Slots

| Name    | Description                                                        |
| ------- | ------------------------------------------------------------------ |
| default | An icon to render. Ignored while `initials` is set.                 |

### CSS Shadow parts

| Part       | Description                          |
| ---------- | ------------------------------------ |
| `base`     | The wrapper of the avatar.            |
| `initials` | The wrapper of the initials.          |
| `image`    | The wrapper of the image.             |

## Test scenarios

| Suite    | File             |
| -------- | ---------------- |
| `Avatar` | `avatar.spec.ts` |

### Default

1. The component passes the accessibility audit and is initialized with its default values.
2. The `shape` property is applied.
3. Without an image, the avatar falls back to the initials.
4. The image is rendered next to the initials until it fails to load.
5. Changing the source after an error makes the component render the image again.
6. An image without an alternative text is marked as decorative.

### ARIA tests

7. The avatar exposes an image role and a role description, and no name of its own.
8. The accessible name is derived from the alternative text, and from the initials when there is none.

### Not covered by the suite

- Projecting an icon in the default slot, and the precedence of the initials over it, are not covered.

## Assumptions and limitations

- The avatar has no size property; its dimensions come from the styles applied to it.
- Only one content kind is shown at a time, and the order is fixed: the image, then the initials, then the icon.
- A projected icon is ignored while `initials` is set.
- The avatar is presentational and has no interactive behavior of its own.

## Accessibility

### ARIA roles and properties

- The avatar has `role="img"` with `aria-roledescription="avatar"`.
- Its accessible name comes from `alt`, and from `initials` when there is no alternative text. Without either, it
  carries no name of its own, so a surrounding element can provide one.
- An image with no alternative text is rendered as decorative, so that it is not announced twice.

### Keyboard support

Not applicable; the component is not interactive.

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

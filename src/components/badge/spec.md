# Badge specification

- [Badge specification](#badge-specification)
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
      - [Dot badges](#dot-badges)
      - [Icon content](#icon-content)
      - [Positioning against another element](#positioning-against-another-element)
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
    - [Icon part](#icon-part)
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

The `igc-badge` is a small element marking a status on a related item — an avatar, a navigation entry, a list item
or anywhere an active indication is needed. It shows a value, an icon, or nothing at all as a dot.

```html
<igc-badge variant="danger">6</igc-badge>
```

### Key features

- **Any short content**: a number, a piece of text or an icon.
- **A dot variant** with no content, for a minimal indication.
- **Five style variants** — primary, info, success, warning and danger.
- **An outline** drawn outside the badge, so that it does not shrink the content.
- **Two shapes**: rounded and square.
- **Size that follows the content**, with an `icon` part for an icon-only badge.

### Acceptance criteria

- The badge must be able to show a value, an icon, or render as a dot when it has no content.
- It must adapt its size to its content.
- It must offer the five style variants and the two shapes.
- The outline must be drawn outside the badge, without affecting the content.
- It must be positionable against another element, such as the corner of an avatar.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- notice the status of an element from the badge attached to it, from its color and from its value.

### Developer stories

As a developer, I expect to be able to:

- use the badge together with other components, such as avatars, navigation entries and list items;
- position the badge against the element it belongs to;
- choose between the visual variants to express what the status means;
- put text, a number or an icon in it, or use a dot badge with no content;
- give the badge an outline drawn outside its content;
- choose between a rounded and a square shape.

## Functionality

### End-user experience

> [Design hand-off](https://www.figma.com/design/MXNCaAaRgt3XbXNG8vpbA8/Badge-Enhancements?node-id=300-17382&p=f&t=tVtRyjmvozsTyFzr-0)

The badge is a small rounded or square element whose color comes from its variant. It fits its content, and a dot
badge is a plain colored dot.

### Developer experience

#### Basic initialization

```html
<igc-badge variant="success">New</igc-badge>
<igc-badge variant="danger" shape="square">5</igc-badge>
<igc-badge variant="info" outlined>3</igc-badge>
```

#### Dot badges

`dot` renders the badge as a small dot with no content, and works with every variant.

```html
<igc-badge dot variant="warning"></igc-badge>
```

#### Icon content

An `igc-icon` that is the only projected element gets the `icon` part, which sizes the badge for an icon rather
than for text. An icon next to text, or text alone, keeps the inline padding of a regular badge.

```html
<igc-badge><igc-icon name="check"></igc-icon></igc-badge>
```

#### Positioning against another element

The badge is commonly projected into the element it marks, for example an [avatar](../avatar/spec.md).

```html
<igc-avatar src="/users/1.png">
  <igc-badge variant="success"></igc-badge>
</igc-avatar>
```

### Localization

The component has no resource strings. Its content comes from the application.

### Keyboard interactions

None applicable. The badge is not interactive and is not part of the tab order.

## API

### Properties and attributes

| Property   | Attribute  | Reflected | Type                                                        | Default   | Description                                       |
| ---------- | ---------- | --------- | ----------------------------------------------------------- | --------- | ------------------------------------------------- |
| `variant`  | `variant`  | yes       | `"primary" \| "info" \| "success" \| "warning" \| "danger"` | `primary` | The style variant of the badge.                    |
| `shape`    | `shape`    | yes       | `"rounded" \| "square"`                                     | `rounded` | The shape of the badge.                            |
| `outlined` | `outlined` | yes       | `boolean`                                                   | `false`   | Draws an outline around the badge.                 |
| `dot`      | `dot`      | yes       | `boolean`                                                   | `false`   | Renders the badge as a dot, without content.       |

### Methods

None applicable.

### Events

None applicable.

### Slots

| Name    | Description                   |
| ------- | ----------------------------- |
| default | The content of the badge.      |

### CSS Shadow parts

| Part   | Description                                                              |
| ------ | ------------------------------------------------------------------------ |
| `base` | The wrapper of the badge.                                                 |
| `icon` | Present on the wrapper when an `igc-icon` is the only projected element.   |

## Test scenarios

| Suite   | File            |
| ------- | --------------- |
| `Badge` | `badge.spec.ts` |

### Default

1. The component passes the accessibility audit and is initialized with its default values.
2. Projected content is rendered.
3. The `variant`, `shape` and `outlined` properties are applied.
4. A dot badge renders without content and works with every variant.

### Icon part

5. The `icon` part is applied when an `igc-icon` is the only projected element.
6. It is not applied when the icon is accompanied by text, nor for text-only content.
7. It is cleared when the icon is removed.
8. A badge that is not icon-only keeps its inline padding.

### ARIA tests

9. The role description is static and does not change with the variant.

### Not covered by the suite

- The visual result of the variants, the outline and the shapes is not asserted; only the reflected state is.
- Positioning the badge against another element is not covered.

## Assumptions and limitations

- The badge has no size property; its dimensions follow its content and the styles applied to it.
- A dot badge ignores whatever is projected into it.
- The `icon` part applies only when an icon is the sole projected element.
- The badge does not position itself; where it sits is decided by the element it is projected into or by the
  application.
- The badge is not interactive and emits no events.

## Accessibility

### ARIA roles and properties

- The badge has `role="status"` with `aria-roledescription="badge"`, so that a change of its content is announced
  politely.
- The role description is fixed and does not encode the variant, since a color is not a meaning an assistive
  technology can convey. A badge whose variant carries meaning should state it in its content or in a
  [visually hidden](../visually-hidden/spec.md) companion.

### Keyboard support

Not applicable; the component is not interactive.

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

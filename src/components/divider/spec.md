# Divider specification

- [Divider specification](#divider-specification)
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
      - [Orientation and type](#orientation-and-type)
      - [Insetting](#insetting)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom properties](#css-custom-properties)
  - [Test scenarios](#test-scenarios)
    - [Initialization](#initialization)
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

The `igc-divider` renders a horizontal or vertical rule as a break between content, so information on a page can be
organized visually. It is a purely presentational element with no interaction and no content of its own.

### Key features

- **Two orientations**: a horizontal rule by default, or a vertical one.
- **Two types**: a solid or a dashed line.
- **Insetting**: the line can be shrunk from the start, or from both sides.
- **Themeable** through CSS custom properties for the color and the inset.

### Acceptance criteria

- The component must render a horizontal rule by default and a vertical one when configured.
- It must support a solid and a dashed line type.
- It must support shrinking the line from the start, and from both sides.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to:

- see a visual break between sections of content, so the information on the page is easier to scan.

### Developer stories

As a developer, I expect to be able to:

- add a horizontal or a vertical rule between pieces of content.
- choose between a solid and a dashed line.
- inset the line from the start, or from both sides, so it aligns with the surrounding content.
- set the color of the line.

## Functionality

### End-user experience

The divider renders a one-pixel rule across the available inline size, or down the available block size when it is
vertical. It carries no content and is not interactive.

### Developer experience

#### Basic initialization

```html
<p>First section</p>
<igc-divider></igc-divider>
<p>Second section</p>
```

#### Orientation and type

```html
<igc-divider type="dashed"></igc-divider>

<div style="display: flex; height: 100px">
  <span>Left</span>
  <igc-divider vertical></igc-divider>
  <span>Right</span>
</div>
```

#### Insetting

```html
<igc-divider style="--inset: 16px"></igc-divider>
<igc-divider middle style="--inset: 16px"></igc-divider>
```

`--inset` shrinks the line from the start; with `middle` set it shrinks from both sides.

### Localization

None applicable. The component renders no strings.

### Keyboard interactions

None applicable. The component is not interactive.

## API

### Properties and attributes

| Property | Attribute | Reflected | Type           | Default | Description                                                          |
| -------- | --------- | --------- | -------------- | ------- | ---------------------------------------------------------------------- |
| vertical | vertical  | Yes       | `boolean`      | false   | Whether to render a vertical divider line.                           |
| type     | type      | Yes       | `DividerType`  | `solid` | Whether to render a solid or a dashed divider line.                  |
| middle   | middle    | Yes       | `boolean`      | false   | When set, and an inset is provided, shrinks the line from both sides. |

### Methods

None applicable.

### Events

None applicable.

### Slots

None applicable.

### CSS Shadow parts

None applicable.

### CSS custom properties

| Property  | Description                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `--color` | Sets the color of the divider.                                                                     |
| `--inset` | Shrinks the divider by the given amount from the start. With `middle` set, it shrinks from both sides. |

## Test scenarios

The suite lives in [`divider.spec.ts`](./divider.spec.ts) and runs in a real browser through `@web/test-runner` with
`@open-wc/testing` fixtures and assertions.

### Initialization

1. The component is initialized with its default state - horizontal and solid.
2. `vertical` and `type` are reflected and change the rendered rule.
3. The component passes the accessibility audit.

### Not covered by the suite

The `middle` property and the `--color` and `--inset` custom properties have no dedicated cases.

## Assumptions and limitations

- The divider is presentational; it holds no content and takes no interaction.
- A vertical divider needs a parent with a resolved block size, since it stretches to the available space.

## Accessibility

### ARIA roles and properties

- The divider is decorative. Where the break carries meaning for assistive technology, give the element a
  `separator` role from the application.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The inset follows the
inline direction.

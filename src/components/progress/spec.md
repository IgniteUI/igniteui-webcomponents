# Progress indicators specification

- [Progress indicators specification](#progress-indicators-specification)
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
      - [Value and maximum](#value-and-maximum)
      - [Indeterminate state](#indeterminate-state)
      - [Label](#label)
      - [Linear specifics](#linear-specifics)
      - [Circular gradients](#circular-gradients)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [DOM](#dom)
    - [Attributes and properties](#attributes-and-properties)
    - [Rendering](#rendering)
    - [Gradients](#gradients)
    - [Issues](#issues)
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

The directory holds the two progress indicators of the library and the gradient stop element of the circular one.
Both indicators show how far an operation has come, or that one is running with no known end. They are read-only:
the end-user cannot change their state.

- `igc-linear-progress` — a single-line indicator.
- `igc-circular-progress` — a ring that fills clockwise from twelve o'clock.
- `igc-circular-gradient` — a gradient stop for the circular indicator.

```html
<igc-linear-progress value="40" striped></igc-linear-progress>
<igc-circular-progress indeterminate></igc-circular-progress>
```

Both indicators derive from the same base, so the value handling, the variants, the label and the indeterminate
state behave identically.

### Key features

- **Determinate and indeterminate** modes, the second one for an operation with an unknown duration.
- **Five variants** — primary, info, success, warning and danger — driving the color of the fill.
- **A formattable label**, which shows a percentage by default and can be hidden or replaced with projected
  content.
- **A configurable animation duration** for the transition of the fill.
- **A striped look and a label position** for the linear indicator.
- **Gradient fills** for the circular indicator.

### Acceptance criteria

- The value and the maximum must be settable, and the fill must follow their ratio.
- The value must be clamped into `0`–`max`, including when `max` changes.
- Both indicators must offer an indeterminate mode.
- The label must be formattable, hideable and replaceable with projected content.
- The linear indicator must support a striped look and the alignment of its label.
- The circular indicator must accept a gradient instead of a solid fill.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see that something is running in the background and is keeping me from going on;
- see how far an operation has come, so that I know what to expect;
- see an indicator that matches the look and feel of the rest of the application.

### Developer stories

As a developer, I expect to be able to:

- show an endlessly looping indicator for an operation whose end I cannot predict;
- show the exact progress of an operation I can measure;
- set the value and the maximum and rely on the component clamping them;
- change the variant of the indicator to fit the state it reports;
- hide the label, format it, or replace it with my own content;
- position the label of the linear indicator, and give it a striped look;
- set the duration of the fill animation;
- define the fill of the circular indicator as a gradient.

## Functionality

### End-user experience

The linear indicator fills from the start of its track to the end, and the circular one fills clockwise from
twelve o'clock. In the indeterminate mode both animate continuously and show no value. Neither wiki page carries a
design hand-off link.

### Developer experience

#### Basic initialization

```html
<igc-linear-progress value="40" max="100" variant="success"></igc-linear-progress>
<igc-circular-progress value="40"></igc-circular-progress>
```

#### Value and maximum

`value` is clamped into `0`–`max`: a negative value becomes `0` and a value above the maximum becomes the maximum.
Lowering `max` below the current value pulls the value down with it, while raising `max` leaves the value as it
is. Fractional values are kept as they are. A value set at initialization is not reset by the first render.

#### Indeterminate state

`indeterminate` switches the indicator to a continuous animation, hides the default label and stops reporting a
value to assistive technology. Changes made to `value` and `max` while the indicator is indeterminate are applied
once it becomes determinate again.

#### Label

The default label shows the value as a percentage. `labelFormat` replaces it, with `{0}` for the current value and
`{1}` for the maximum. `hideLabel` hides it. Content projected in the default slot replaces the label entirely and
is affected by neither `hideLabel` nor `indeterminate`.

```html
<igc-circular-progress label-format="{0} of {1} files"></igc-circular-progress>
<igc-linear-progress><span>Uploading…</span></igc-linear-progress>
```

#### Linear specifics

`striped` gives the fill a striped look, and `labelAlign` places the default label at `top`, `bottom`,
`top-start`, `top-end`, `bottom-start` or `bottom-end`.

#### Circular gradients

Projecting `igc-circular-gradient` elements in the `gradient` slot replaces the solid fill. Each one becomes an
SVG `stop` whose `color`, `offset` and `opacity` are applied as `stop-color`, `offset` and `stop-opacity` without
further validation, in the order the elements are declared.

```html
<igc-circular-progress>
  <igc-circular-gradient slot="gradient" offset="0%" color="#ff9a40" opacity="0.5"></igc-circular-gradient>
  <igc-circular-gradient slot="gradient" offset="50%" color="#1eccd4"></igc-circular-gradient>
  <igc-circular-gradient slot="gradient" offset="100%" color="#ff0079"></igc-circular-gradient>
</igc-circular-progress>
```

### Localization

The components have no resource strings. `labelFormat` is the localization point for the announced and displayed
text, and projected content in the default slot is under the control of the application.

### Keyboard interactions

Not applicable. The indicators are read-only and are not part of the tab order.

## API

### Properties and attributes

Shared by `igc-linear-progress` and `igc-circular-progress`:

| Property            | Attribute            | Reflected | Type                                                        | Default   | Description                                     |
| ------------------- | -------------------- | --------- | ----------------------------------------------------------- | --------- | ----------------------------------------------- |
| `value`             | `value`              | no        | `number`                                                    | `0`       | The value of the control.                        |
| `max`               | `max`                | no        | `number`                                                    | `100`     | The maximum value of the control.                |
| `variant`           | `variant`            | yes       | `"primary" \| "info" \| "success" \| "warning" \| "danger"` | `primary` | The variant of the control.                      |
| `indeterminate`     | `indeterminate`      | no        | `boolean`                                                   | `false`   | The indeterminate state of the control.          |
| `hideLabel`         | `hide-label`         | no        | `boolean`                                                   | `false`   | Hides the default label.                         |
| `labelFormat`       | `label-format`       | no        | `string`                                                    | —         | The format of the default label.                 |
| `animationDuration` | `animation-duration` | no        | `number`                                                    | `500`     | The duration of the fill animation, in ms.       |

`igc-linear-progress` adds:

| Property     | Attribute     | Reflected | Type                                                                              | Default     | Description                        |
| ------------ | ------------- | --------- | --------------------------------------------------------------------------------- | ----------- | ---------------------------------- |
| `striped`    | `striped`     | yes       | `boolean`                                                                         | `false`     | The striped look of the control.    |
| `labelAlign` | `label-align` | yes       | `"top" \| "bottom" \| "top-start" \| "top-end" \| "bottom-start" \| "bottom-end"` | `top-start` | The position of the default label.  |

`igc-circular-gradient`:

| Property  | Attribute | Reflected | Type     | Default   | Description                                            |
| --------- | --------- | --------- | -------- | --------- | ------------------------------------------------------ |
| `offset`  | `offset`  | no        | `string` | `0%`      | Where the stop sits along the gradient vector.          |
| `color`   | `color`   | no        | `string` | `black`   | The color of the stop.                                  |
| `opacity` | `opacity` | no        | `number` | `1`       | The opacity of the stop.                                |

### Methods

None applicable.

### Events

None applicable.

### Slots

| Component               | Name       | Description                                                        |
| ----------------------- | ---------- | ------------------------------------------------------------------ |
| both indicators         | default    | Replaces the label area of the indicator.                           |
| `igc-circular-progress` | `gradient` | The gradient stops of the fill; accepts `igc-circular-gradient`.     |

### CSS Shadow parts

Shared by both indicators: `track`, `fill`, `label`, `value`, `indeterminate`, and one part per variant —
`primary`, `info`, `success`, `warning` and `danger`.

| Component               | Additional parts                              |
| ----------------------- | --------------------------------------------- |
| `igc-linear-progress`   | `striped`                                      |
| `igc-circular-progress` | `svg`, `gradient_start`, `gradient_end`        |

## Test scenarios

| Suite                         | File                          |
| ----------------------------- | ----------------------------- |
| `Linear progress component`   | `linear-progress.spec.ts`     |
| `Circular progress component` | `circular-progress.spec.ts`   |

Both suites are structured the same way, so the scenarios below apply to both indicators unless one is named.

### DOM

1. The component passes the accessibility audit.
2. The component is initialized with its default property values.

### Attributes and properties

3. `hideLabel` toggles the default label.
4. The `variant` attribute is reflected, and so is `striped` for the linear indicator.
5. The value is reflected in the fill, including fractional values.
6. A negative value is clamped to `0`, and a value above the maximum to the maximum.
7. Lowering `max` below the value pulls the value down; raising it leaves the value as it is.
8. The `indeterminate` attribute is reflected and hides the default label.
9. Updates to `value`, and for the circular indicator to `max`, made while indeterminate are reflected after the
   switch back to determinate.
10. A custom `labelFormat` is applied.
11. The linear indicator applies a change of `animationDuration` on its own, and updates its label alignment.

### Rendering

12. Content projected in the default slot is rendered, and is affected by neither `hideLabel` nor `indeterminate`.

### Gradients

13. The circular indicator renders slotted gradient stops.

### Issues

14. Issue #1083 — a value set at initialization is not reset by the first render.

### Not covered by the suite

- The visual result of the variants, of the striped look and of the label alignment in a right-to-left context is
  verified manually rather than by the suite.
- `igc-circular-gradient` has no suite of its own; it is covered through the gradient rendering test of the
  circular indicator.

## Assumptions and limitations

- The indicators are read-only. They have no events, no methods and no user interaction.
- The circular indicator always fills clockwise starting at twelve o'clock.
- The gradient stops are passed to the SVG as they are, with no validation of the color, the offset or the
  opacity.
- The default label of the circular indicator cannot be positioned; only the linear one has `labelAlign`.
- The step of an update is not enforced by the component; it is whatever the application assigns.

## Accessibility

### ARIA roles and properties

- Both indicators have `role="progressbar"`, with `aria-valuemin` fixed at `0` and `aria-valuemax` taken from
  `max`.
- In the determinate mode `aria-valuenow` carries the value and `aria-valuetext` the formatted label.
- In the indeterminate mode both are dropped, which is how an operation of unknown length is announced.

### Keyboard support

Not applicable; the indicators are not interactive.

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The direction of the
fill and of the animation is mirrored.

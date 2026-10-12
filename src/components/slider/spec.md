# Slider specification

- [Slider specification](#slider-specification)
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
      - [Range slider](#range-slider)
      - [Scale, bounds and step](#scale-bounds-and-step)
      - [Ticks and tick labels](#ticks-and-tick-labels)
      - [Value labels](#value-labels)
      - [Form integration](#form-integration)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Regular](#regular)
    - [Range](#range)
    - [Initial rendering race condition](#initial-rendering-race-condition)
    - [Value resolution](#value-resolution)
    - [Range ARIA](#range-aria)
    - [Thumb label](#thumb-label)
    - [Form integration tests](#form-integration-tests)
    - [Default value](#default-value)
    - [External label association](#external-label-association)
    - [Host ARIA](#host-aria)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                                |
| ------: | ---------- | ------------------------------------------------------------------------------------ |
|       1 | 2026-09-21 | Initial specification                                                                |
|       2 | 2026-09-24 | Label external `label` elements and host `aria-labelledby`, focus from a label click |
|       3 | 2026-10-02 | Correct the `reportValidity` description                                             |
|       4 | 2026-10-02 | Forward the host `aria-describedby`                                                  |
|       5 | 2026-10-05 | Values in any order, nearest step, range defaults and value text, label in top layer |
|       6 | 2026-10-06 | Tick labels inside the box and on one line, unset bounds                             |
|       7 | 2026-10-06 | `focus()` and `blur()` move the focus to a thumb, the lower one in a range slider    |

## Overview

The `igc-slider` lets the user pick a numeric value along a scale, and the `igc-range-slider` lets them pick a
sub-range with two thumbs. Both come in a continuous and a discrete flavor: a continuous slider accepts any value
of the scale, a discrete one snaps to the step and can draw its steps on the track.

```html
<igc-slider min="0" max="100" step="5" value="20" primary-ticks="5"></igc-slider>
<igc-range-slider lower="20" upper="60"></igc-range-slider>
```

### Key features

- **One or two thumbs**, through the two separate components, sharing the same base.
- **Scale and bounds**: `min` and `max` describe the scale, `lowerBound` and `upperBound` restrict the part of it
  the thumbs may reach.
- **Stepping**, with `step` set to `0` for a fully continuous slider.
- **Primary and secondary ticks**, with their own labels, orientation and rotation.
- **A discrete track**, which draws the steps.
- **Thumb label** with the formatted value, shown on hover, while dragging and on keyboard focus. Escape hides it.
- **Value formatting** through a locale, a format string and `Intl.NumberFormat` options, or through projected
  `igc-slider-label` elements.
- **Form association** for the single-value slider.

### Acceptance criteria

- The slider must support a continuous and a discrete mode, and one or two thumbs.
- The scale, the bounds and the step must be settable, and each must restrict the others consistently.
- Tick marks must be displayable, with a configurable position, count and label orientation.
- The value must be changeable by dragging a thumb, by clicking the track and with the keyboard.
- The component must report the value while it changes and once the change is committed.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see the available range, so that I can pick the value I want;
- read the current value from a label above the thumb while I change it;
- focus the slider and change its value with the keyboard;
- have the thumb snap to the allowed values on a discrete slider;
- drag a thumb, or click on the track, to change the value;
- see the part of the track between the two thumbs highlighted on a range slider;
- be kept inside the bounds, which may be narrower than the scale;
- tell the primary ticks from the secondary ones, and read their labels.

### Developer stories

As a developer, I expect to be able to:

- choose between a continuous and a discrete slider, and between one and two thumbs;
- set the scale, the bounds and the step, and rely on them constraining each other;
- be notified while a value changes and when the change is committed;
- show tick marks, set how many there are, where they sit and how their labels are rotated;
- hide the primary or the secondary tick labels, and hide the thumb tooltip;
- format the values with a locale, a format string or number format options;
- project a list of labels and have the slider map its values onto them;
- disable the slider, and submit its value with a form.

## Functionality

### End-user experience

A slider renders a track, an inactive part, a filled part and one or two thumbs. A discrete track draws the steps
as dashes. The thumb label shows while the pointer is on the thumb, while the user drags it, and while the thumb has
keyboard focus. It hides 750 ms after the interaction ends, and Escape hides it at once, also while the focus is
elsewhere. The label is in the top layer, so a container that clips its overflow does not cut it off. The label
hides while its thumb is scrolled out of view, and shows again when the thumb comes back.

The wiki page of the component carries no design hand-off link.

### Developer experience

#### Basic initialization

```html
<igc-slider min="0" max="100" value="50"></igc-slider>
```

#### Range slider

`igc-range-slider` replaces `value` with `lower` and `upper`, and names its thumbs with `thumbLabelLower` and
`thumbLabelUpper`. `lower` starts at `0`, clamped into the bounds. `upper` follows `upperBound` until it is set, and
again after the `upper` attribute is removed, so the default range covers the whole scale. A key press or a drag
sets only the thumb that moves.
Dragging the lower thumb past the upper one moves the focus to the upper thumb and continues the drag there. A
`lower` above `upper` from code or markup swaps the two values, as a drag does.

```html
<igc-range-slider lower="20" upper="60" thumb-label-lower="From" thumb-label-upper="To"></igc-range-slider>
```

#### Scale, bounds and step

`min` and `max` define the scale. When an update ends with `min` above `max`, the slider keeps the previous `min`
and `max`. `lowerBound` and `upperBound` restrict the reachable part of the scale and default to `min` and `max`;
each is itself restricted by the scale and by the other bound. A value outside the resulting interval is normalized
into it. The removal of
the `lower-bound` or `upper-bound` attribute, or a `null` or `undefined` value, unsets the bound, so it follows
`min` or `max` again.

Attributes and properties apply one at a time. Each update resolves the values as set against the final
constraints, so the order of `value`, `lower`, `upper`, `min`, `max` and `step`, as attributes or as properties set
in one task, has no effect: `<igc-slider value="0.5" step="0.01" max="1">` gives 0.5, and
`<igc-slider min="150" max="200">` gives a `min` of 150. A read before the update returns the value resolved
against the constraints of that moment. The two bounds still restrict each other when they are set, so the order
of `lowerBound` and `upperBound` can change the result.

`step` is the granularity. As for a native range input, the steps count from `min`, and a value snaps to the nearest
step, with a tie to the higher step. When a bound is off the steps, the value stays on the nearest step inside the
bounds. A negative step is not valid, so the previous step stays. With `step` set to `0` the slider is continuous and
accepts any value of the track, while the keyboard falls back to a step of `1`.

#### Ticks and tick labels

`primaryTicks` and `secondaryTicks` set how many ticks of each kind are drawn; `0` means none. `tickOrientation`
places them at the `start`, at the `end` or `mirror`ed on both sides, and `tickLabelRotation` rotates the labels by
`0`, `90` or `-90` degrees. `hidePrimaryLabels` and `hideSecondaryLabels` hide the labels of each kind.
`discreteTrack` draws the steps on the track, and has no effect while `step` is `0`.

The box of the slider holds the ticks and their labels, so a slider with tick labels is taller than one without
them, by the size of the labels, also rotated ones. A tick label stays on one line. The labels at the two ends of the
track are centered on their ticks, so they reach past the box of the slider by half their width.

#### Value labels

The thumb tooltip and the tick labels show the formatted value. The formatting comes from `locale`, `valueFormat`
and `valueFormatOptions`, or from projected `igc-slider-label` elements.

```html
<igc-slider>
  <igc-slider-label>Low</igc-slider-label>
  <igc-slider-label>Medium</igc-slider-label>
  <igc-slider-label>High</igc-slider-label>
</igc-slider>
```

Projected labels turn the slider into a discrete one over their indices: `min` becomes `0`, `max` becomes the
number of labels minus one, and `step` is `1`. The values that the author set come back when the labels go.
The labels name only the primary ticks, so the secondary ticks have no label.
`hideTooltip` removes the thumb label entirely.

#### Form integration

`igc-slider` is a form-associated custom element. The `value` attribute seeds `defaultValue`, so a form reset
restores it, clamped into the current range. It follows the disabled state of an ancestor fieldset and supports
`setCustomValidity`, `checkValidity` and `reportValidity`. Its validation behavior follows the
[form-associated elements specification](../validation-container/spec.md). `focus()` moves the focus to the thumb,
so a failed submit and `reportValidity()` focus an invalid slider. A disabled slider does not take the focus.
`igc-range-slider` is not form associated.

### Localization

The component has no resource strings. `locale`, which defaults to `en`, together with `valueFormat` and
`valueFormatOptions`, formats the numbers of the thumb tooltip and the tick labels. Projected
`igc-slider-label` elements replace the numbers with text.

### Keyboard interactions

The keyboard operates the focused thumb.

| Keys                | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| <kbd>↑</kbd>        | Increases the value by one step.                                        |
| <kbd>↓</kbd>        | Decreases the value by one step.                                        |
| <kbd>→</kbd>        | Increases the value by one step; decreases it in a right-to-left context. |
| <kbd>←</kbd>        | Decreases the value by one step; increases it in a right-to-left context. |
| <kbd>Page Up</kbd>  | Increases the value by a tenth of the range.                             |
| <kbd>Page Down</kbd>| Decreases the value by a tenth of the range.                             |
| <kbd>Home</kbd>     | Sets the value to the lower bound.                                       |
| <kbd>End</kbd>      | Sets the value to the upper bound.                                       |
| <kbd>Esc</kbd>      | Hides the thumb label. The key still reaches a dialog around the slider. |

## API

### Properties and attributes

Shared by `igc-slider` and `igc-range-slider`:

| Property              | Attribute               | Reflected | Type                              | Default | Description                                                     |
| --------------------- | ----------------------- | --------- | --------------------------------- | ------- | --------------------------------------------------------------- |
| `min`                 | `min`                   | no        | `number`                          | `0`     | The start of the scale.                                          |
| `max`                 | `max`                   | no        | `number`                          | `100`   | The end of the scale.                                            |
| `lowerBound`          | `lower-bound`           | no        | `number`                          | `min`   | The lowest reachable value.                                      |
| `upperBound`          | `upper-bound`           | no        | `number`                          | `max`   | The highest reachable value.                                     |
| `step`                | `step`                  | no        | `number`                          | `1`     | The granularity; `0` makes the slider continuous.                |
| `disabled`            | `disabled`              | yes       | `boolean`                         | `false` | Disables the interactions of the slider.                         |
| `discreteTrack`       | `discrete-track`        | no        | `boolean`                         | `false` | Draws the steps on the track.                                    |
| `hideTooltip`         | `hide-tooltip`          | no        | `boolean`                         | `false` | Hides the thumb tooltip.                                         |
| `primaryTicks`        | `primary-ticks`         | no        | `number`                          | `0`     | The number of primary ticks.                                     |
| `secondaryTicks`      | `secondary-ticks`       | no        | `number`                          | `0`     | The number of secondary ticks between two primary ones.          |
| `tickOrientation`     | `tick-orientation`      | no        | `"start" \| "end" \| "mirror"`    | `end`   | Where the ticks are drawn.                                       |
| `hidePrimaryLabels`   | `hide-primary-labels`   | no        | `boolean`                         | `false` | Hides the labels of the primary ticks.                           |
| `hideSecondaryLabels` | `hide-secondary-labels` | no        | `boolean`                         | `false` | Hides the labels of the secondary ticks.                         |
| `tickLabelRotation`   | `tick-label-rotation`   | yes       | `0 \| 90 \| -90`                  | `0`     | The rotation of the tick labels in degrees.                      |
| `locale`              | `locale`                | no        | `string`                          | `en`    | The locale used to format the values.                            |
| `valueFormat`         | `value-format`          | no        | `string \| undefined`             | —       | The format string used for the values.                           |
| `valueFormatOptions`  | —                       | —         | `Intl.NumberFormatOptions`        | —       | The number format options used for the values.                   |

`igc-slider` adds:

| Property       | Attribute | Reflected | Type      | Default | Description                                     |
| -------------- | --------- | --------- | --------- | ------- | ----------------------------------------------- |
| `value`        | `value`   | no        | `number`  | `0`     | The value of the component.                      |
| `name`         | `name`    | yes       | `string`  | —       | The name submitted with the form data.           |
| `invalid`      | `invalid` | no        | `boolean` | `false` | The invalid visual state of the component.       |
| `defaultValue` | —         | —         | `number`  | —       | The value restored on a form reset.              |

It also exposes the `form`, `validity`, `validationMessage` and `willValidate` members of a form-associated
element.

`igc-range-slider` adds:

| Property          | Attribute           | Reflected | Type     | Default      | Description                             |
| ----------------- | ------------------- | --------- | -------- | ------------ | --------------------------------------- |
| `lower`           | `lower`             | no        | `number` | `0`          | The value of the lower thumb.           |
| `upper`           | `upper`             | no        | `number` | `upperBound` | The value of the upper thumb.           |
| `thumbLabelLower` | `thumb-label-lower` | no        | `string` | —            | The accessible name of the lower thumb. |
| `thumbLabelUpper` | `thumb-label-upper` | no        | `string` | —            | The accessible name of the upper thumb. |

### Methods

| Method              | Component    | Signature                        | Description                                                                                                       |
| ------------------- | ------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `stepUp`            | `igc-slider` | `(n?: number): void`             | Increases the value by `n` steps.                                                                                 |
| `stepDown`          | `igc-slider` | `(n?: number): void`             | Decreases the value by `n` steps.                                                                                 |
| `focus`             | both         | `(options?: FocusOptions): void` | Focuses the thumb, the lower one in a range slider. A focused thumb keeps the focus. Does nothing while disabled. |
| `blur`              | both         | `(): void`                       | Removes the focus from the thumb that has it.                                                                     |
| `checkValidity`     | `igc-slider` | `(): boolean`                    | Checks the validity and emits `invalid` on failure.                                                               |
| `reportValidity`    | `igc-slider` | `(): boolean`                    | Checks validity, and emits `invalid` when the control is invalid.                                                 |
| `setCustomValidity` | `igc-slider` | `(message: string): void`        | Sets a custom validation message.                                                                                 |

### Events

| Event      | Detail                              | Cancelable | Description                                                          |
| ---------- | ----------------------------------- | ---------- | -------------------------------------------------------------------- |
| `igcInput` | `number` / `{ lower, upper }`       | no         | The value is changing, through a drag or a key press.                 |
| `igcChange`| `number` / `{ lower, upper }`       | no         | The change is committed, on the end of a drag or on a key press.      |

### Slots

The default slot takes `igc-slider-label` elements. They render nothing themselves; their text content becomes the
thumb and the tick labels.

### CSS Shadow parts

| Part                | Description                                    |
| ------------------- | ---------------------------------------------- |
| `base`              | The wrapper of the slider.                      |
| `track`             | The track container.                            |
| `inactive`          | The inactive part of the track.                 |
| `fill`              | The filled part of the track.                   |
| `steps`             | The steps drawn on a discrete track.            |
| `ticks`             | The container of the ticks.                     |
| `tick-group`        | A group of ticks.                               |
| `tick`              | A tick.                                         |
| `tick-label`        | The label of a tick.                            |
| `tick-label-inner`  | The inner element of a tick label.              |
| `thumbs`            | The container of the thumbs.                    |
| `thumb`             | A thumb.                                        |
| `thumb-label`       | The tooltip of a thumb.                         |
| `thumb-label-inner` | The inner element of a thumb tooltip.           |

## Test scenarios

| Suite              | File             |
| ------------------ | ---------------- |
| `Slider component` | `slider.spec.ts` |

### Regular

1. The component passes the accessibility audit.
2. The value is restricted by `min`, `max`, `lowerBound`, `upperBound` and `step`.
3. Clicking and dragging the slider changes the value and emits `igcInput` and `igcChange`.
4. No events are emitted once a thumb reaches a boundary, although the pointer events keep coming.
5. The track fill and the thumb are positioned according to the value.
6. The thumb carries the correct ARIA attributes.
7. `stepUp()` and `stepDown()` change the value.
8. `min` is restricted by `max` and `max` by `min`, and each bound is restricted by the scale and the other bound.
9. With `step` set to `0`, any value on the track is accepted.
10. Primary and secondary tick marks are rendered once their counts are above `0`.
11. The tick labels follow `hidePrimaryLabels` and `hideSecondaryLabels`.
12. The ticks and their labels render correctly for each `tickOrientation`, and the labels for each
    `tickLabelRotation`.
13. The track is continuous or discrete according to `discreteTrack`.
14. No interaction is possible while the slider is disabled.
15. The tick labels and the thumb tooltip are formatted by the value format properties, and use the projected
    labels when there are any.
16. The thumb tooltip appears on hover, and is not rendered while `hideTooltip` is set.
17. The arrow keys change the value by one step, including with a fractional step, and fall back to a step of `1`
    while `step` is `0`.
18. <kbd>Page Up</kbd> and <kbd>Page Down</kbd> change the value by a tenth of the range, and <kbd>Home</kbd> and
    <kbd>End</kbd> jump to the ends.

### Range

19. The range slider passes the accessibility audit.
20. The lower and the upper value are each restricted by `min`, `max`, `lowerBound`, `upperBound` and `step`.
21. Clicking and dragging changes the closest thumb and emits the events.
22. Dragging the lower thumb past the upper one moves the focus to the upper thumb and continues the drag.
23. The track fill and both thumbs are positioned according to the values.
24. Both thumbs carry the correct ARIA attributes.

### Initial rendering race condition

25. The slider is correctly initialized, and a value set before the constraint that invalidates it is normalized,
    for both the single and the range values.

### Value resolution

26. A value snaps to the nearest step, as a native range input with the same attributes does. A drag snaps the same
    way, also at a fractional midpoint such as 0.35 with a step of 0.1.
27. A value on a fractional step stays through later constraint changes (#2433), and the keyboard and `stepUp()`
    reach the end of the scale with a fractional step. On a continuous slider, Home and End reach a fractional bound
    exactly.
28. The attributes, and the properties of one task, apply in any order (#2434). A `min` above the default `max`
    applies when `max` follows, and an update that ends with `min` above `max` keeps the previous scale. A value
    as set that changes nothing does not apply again in a later update.
29. The steps count from `min`, also with a bound off the steps. When no step lies between the bounds, the value
    stays clamped, a second pass does not change it, and a drag moves by whole steps, as the keys do.
30. No events are emitted when the snapped value stays the same.
31. A negative step keeps the previous step.
32. Projected labels override `min`, `max` and `step`, and the values of the author come back when the labels go.
33. A scale where `min` equals `max` renders, and a click keeps the value.
34. The removal of the `lower-bound` or `upper-bound` attribute, or an `undefined` bound, makes the bound follow
    `min` or `max` again, and keeps the value.
35. On the range slider, `lower`, `upper` and `max` apply in any order, a crossed pair swaps, a value as set that
    changes nothing does not apply again, and `upper` follows `upperBound` until it is set and after the removal of
    its attribute. A key press on the lower thumb keeps an unset `upper`. The removal of a bound attribute makes the
    bound follow `min` or `max` again, and keeps the values.

### Range ARIA

36. Each thumb gives the text of its own value from the labels, and no value text without labels or a format.
37. The host `aria-label` and `aria-labelledby` name the group of the thumbs, also after a change and a removal.
38. The host `aria-describedby` describes both thumbs, and an axe audit passes with a host label.

### Thumb label

39. A right click does not move a thumb, and a second pointer does not take over a drag (real mouse input).
40. Keyboard focus shows the label until the blur. After a pointer focus, also on a thumb with keyboard focus, the
    label hides when the interaction ends, and a modifier key alone does not count as keyboard focus. A blur keeps
    the label of a thumb under the pointer (real mouse input). A disabled range slider hides the label of its focused
    thumb, and Escape hides the label without cancelling the key. Escape also hides a hovered label while the focus
    is elsewhere, past a parent that stops the key. The page listens for Escape only while a label shows, and a
    removed slider hides its label.
41. The label shows in the top layer, past a parent that clips its overflow and above a modal dialog that holds
    the slider. It stays centered above its thumb after a move, with the native and the fallback position
    strategies, in LTR and RTL. It hides while its thumb is scrolled out of view, with both position strategies.
42. The range slider renders a label for each thumb, and `hideTooltip` removes the popover and formats no value
    for it. Turning `hideTooltip` on dismisses an open label and its Escape listener, and turning it off again does
    not open the label.

### Tick labels

43. A change of `min`, `max`, `secondaryTicks`, the format string, the locale, the format options (also in place) or
    the projected labels renders the tick labels again.
44. A tick label stays on one line, also at the end of the track.
45. The box of the slider holds the tick labels for each `tickOrientation` and `tickLabelRotation`, ticks without
    labels do not change the height of the slider, and ticks that do not fit do not make it wider. The secondary
    ticks of projected labels render no label.

### Form integration tests

46. The single-value slider is form associated and takes part in submission.
47. A form reset restores the default value, including one set through `setAttribute()`, and clamps an
    out-of-range default.
48. The control follows the disabled state of an ancestor, and fulfils custom constraints.

### Default value

49. The initial state, the submitted value and the reset behavior of `defaultValue` are correct.

### External label association

Generated by `runExternalLabelAssociationTests` for the single-value slider.

50. An external `label` bound through `for` or by nesting names the thumb, and a click on it focuses the thumb. A
    `label` added after the first render names the thumb from the first focus, an axe audit passes with only an external
    `label`, and the host `aria-labelledby` and `aria-label` follow the naming order.

### Host ARIA

51. The shared host description suite: the host `aria-describedby` describes the thumb, and follows a change and a
    removal. The slider has no helper text, so the suite checks no description order.

### Focus

52. `focus()` moves the focus to the thumb and `blur()` removes it. A disabled slider does not take the focus.
53. `focus()` of a range slider moves the focus to the lower thumb, and a focused upper thumb keeps it. `blur()`
    removes the focus from either thumb. A disabled range slider does not take the focus.
54. An invalid slider takes the focus on a failed submit and on `reportValidity()`.

### Not covered by the suite

- `locale` is not covered on its own; the formatting tests run against `valueFormat` and `valueFormatOptions`.
- The label follows the thumb in the fallback position strategy only in Chromium, which the tests force onto it.

## Assumptions and limitations

- The slider is horizontal; there is no vertical orientation.
- `igc-range-slider` is not form associated and does not submit its values.
- Projected `igc-slider-label` elements take over `min`, `max` and `step`, which cannot be set independently while
  they are present.
- `discreteTrack` has no effect while `step` is `0`.
- The tick labels at the two ends of the track reach past the box of the slider by half their width.
- An update that ends with `min` above `max` keeps the previous scale silently, rather than report it.
- The two thumbs of a range slider cannot cross; the drag moves to the other thumb instead, and a crossed pair from
  code swaps.
- The thumb label does not flip below the thumb near the top of the viewport, because its arrow always points down.
- In Indigo, the label moves up by about 3 px while the thumb grows on hover, because the label keeps its gap to
  the box of the thumb.
- Near the edge of the viewport, the label moves inside the viewport, so its arrow can point a few pixels off the
  center of the thumb.

## Accessibility

### ARIA roles and properties

- Each thumb has `role="slider"`, is a tab stop while the component is enabled, and carries `aria-valuemin` and
  `aria-valuemax` from the bounds, `aria-valuenow` from its value and `aria-valuetext` from the formatted value or
  the projected label.
- `aria-disabled` exposes the disabled state, and a disabled slider drops its thumbs out of the tab order.
- The thumbs of a range slider are named through `thumbLabelLower` and `thumbLabelUpper`. The host `aria-label` or
  `aria-labelledby` names the group of the two thumbs, which has `role="group"`, and the host `aria-describedby`
  describes both thumbs. Each thumb gives the text of its own value. The single thumb takes its
  name in the [naming order](../input/spec.md#naming-order): the host `aria-labelledby`, an external `label` element
  bound through `for` or by nesting, and the `aria-label` of the host. A change of the host ARIA at runtime is picked
  up, and a click on an external `label` focuses the thumb.
- The value tooltip is hidden from assistive technology, because `aria-valuetext` already carries the value.
- A host `aria-describedby` describes the single thumb, by element reference.
- Escape hides the thumb label, which is content that shows on hover and on focus (WCAG 1.4.13). The key works also
  while the focus is elsewhere, so the user does not have to move the pointer.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The track, the fill and
the thumbs are mirrored, and <kbd>←</kbd> and <kbd>→</kbd> swap their meaning.

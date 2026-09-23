# Rating specification

- [Rating specification](#rating-specification)
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
      - [Custom symbols](#custom-symbols)
      - [Precision and value handling](#precision-and-value-handling)
      - [Single selection](#single-selection)
      - [Reset, hover preview and read-only](#reset-hover-preview-and-read-only)
      - [Form integration](#form-integration)
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
    - [Default](#default)
    - [Interaction](#interaction)
    - [Value precision](#value-precision)
    - [Form integration tests](#form-integration-tests)
    - [Default value](#default-value)
    - [Accessibility tests](#accessibility-tests)
    - [Hover](#hover)
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
|       2 | 2026-09-23 | Describe when the `--symbol-*-filter` properties apply |

## Overview

The `igc-rating` shows an aggregate opinion as a row of symbols, and optionally lets the user submit a rating of
their own. It supports fractional values, custom symbols, a single selection mode and takes part in form
submission as a number input.

```html
<igc-rating max="10" value="3" label="Movie rating" hover-preview></igc-rating>
```

### Key features

- **Fractional values** down to a step of `0.001`, rendered as partially filled symbols.
- **Custom symbols** projected through `igc-rating-symbol`, each with its own full and empty state.
- **Single selection**, where only the picked symbol is filled, as in a radio group.
- **Hover preview** of the value under the pointer, with an `igcHover` notification.
- **Reset on the same value**, so that a choice can be cleared.
- **Read-only and disabled** states.
- **Form association** through `ElementInternals`, with a default value and constraint validation.

### Acceptance criteria

- The component must expose a name, a value and a maximum, and must submit with a form.
- It must support a precision modifier for fractional values, and must clamp both the value and the step.
- It must support a single selection visual mode and custom symbols per position.
- It must be operable with the pointer and with the keyboard, and must honor the read-only and disabled states.
- It must emit an event when the value changes and when a symbol is hovered with hover preview on.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- click a symbol to give a rating, filling it and every symbol before it;
- click the same value again to clear my choice, when that is allowed;
- read the exact value from a value label next to the symbols;
- preview the value I am about to pick while hovering the symbols;
- increase and decrease the value with the arrow keys, and jump to the lowest and the highest value.

### Developer stories

As a developer, I expect to be able to:

- set the maximum so that the user picks from a controlled range;
- allow fractional values, so that an aggregate such as 4.5 of 5 can be shown;
- replace the symbols with my own, and use a different symbol at each position;
- switch to a single selection mode;
- make the rating read-only, so that it informs without accepting input;
- name the control and submit its value with a form;
- give the control an accessible name and a localized value text.

## Functionality

### End-user experience

> [Figma file](https://www.figma.com/file/vdbiB2kQxQ19MFrcVmvbyt/Rating-All-Themes?node-id=0%3A1)

The rating renders a label above the symbols and an optional value label next to them. The symbol size and the
colors of the full and the empty state are exposed as CSS custom properties.

### Developer experience

#### Basic initialization

```html
<igc-rating label="Rating" max="5" value="3"></igc-rating>
```

#### Custom symbols

Projecting `igc-rating-symbol` elements in the `symbol` slot replaces the default symbols. Each one takes the full
state in its default slot and the empty state in its `empty` slot. The number of projected symbols then decides
`max`, and setting `max` from code has no effect. Adding and removing symbols updates `max` again.

```html
<igc-rating>
  <igc-rating-symbol>
    <igc-icon collection="internal" name="star"></igc-icon>
    <igc-icon collection="internal" name="star_border" slot="empty"></igc-icon>
  </igc-rating-symbol>
</igc-rating>
```

#### Precision and value handling

`step` sets the smallest change and accepts values between `0.001` and `1`; anything outside is clamped to the
nearest bound. A value outside the range is normalized into it, and a fractional value is reported as it is,
without floating point noise. A non-numeric `max` or `step` falls back to the default.

`stepUp(n)` and `stepDown(n)` move the value by `n` steps rather than to the next whole step.

#### Single selection

`single` fills only the picked symbol and forces `step` to `1`.

#### Reset, hover preview and read-only

With `allowReset`, clicking the currently selected value sets the value back to `0`; without it, the click leaves
the value as it is. `hoverPreview` fills the symbols under the pointer while hovering and emits `igcHover` with
the previewed value, including when the pointer re-enters the same symbol. `readOnly` blocks both the pointer and
the keyboard while keeping the control in the tab order, and `disabled` blocks them and removes it.

#### Form integration

The rating is a form-associated custom element with a number value. The `value` attribute seeds `defaultValue`, so
a form reset restores it, clamping it into the range. It follows the disabled state of an ancestor fieldset and
supports `setCustomValidity`, `checkValidity` and `reportValidity`. Its validation behavior follows the
[form-associated elements specification](../validation-container/spec.md).

### Localization

The component has no resource strings. The `valueFormat` property is the localization point for the announced
value: `{0}` is replaced with the current value and `{1}` with the maximum.

```html
<igc-rating value-format="{0} of {1} stars"></igc-rating>
```

### Keyboard interactions

| Keys              | Description                                        |
| ----------------- | -------------------------------------------------- |
| <kbd>↑</kbd>      | Increases the value by one step.                    |
| <kbd>↓</kbd>      | Decreases the value by one step.                    |
| <kbd>→</kbd>      | Increases the value by one step; decreases it in RTL. |
| <kbd>←</kbd>      | Decreases the value by one step; increases it in RTL. |
| <kbd>Home</kbd>   | Sets the value to one step, the lowest value.        |
| <kbd>End</kbd>    | Sets the value to the maximum.                       |

## API

### Properties and attributes

| Property       | Attribute       | Reflected | Type                  | Default | Description                                                     |
| -------------- | --------------- | --------- | --------------------- | ------- | --------------------------------------------------------------- |
| `value`        | `value`         | no        | `number`              | `0`     | The value of the control.                                        |
| `max`          | `max`           | no        | `number`              | `5`     | The maximum value; derived from the projected symbols when there are any. |
| `step`         | `step`          | no        | `number`              | `1`     | The smallest allowed change, clamped to `0.001`–`1`.              |
| `label`        | `label`         | no        | `string \| undefined` | —       | The label of the control.                                        |
| `valueFormat`  | `value-format`  | no        | `string \| undefined` | —       | The format of the announced value text.                          |
| `hoverPreview` | `hover-preview` | yes       | `boolean`             | `false` | Previews the value under the pointer.                            |
| `single`       | `single`        | yes       | `boolean`             | `false` | Single selection mode; forces `step` to `1`.                     |
| `allowReset`   | `allow-reset`   | yes       | `boolean`             | `false` | Clicking the current value resets it to `0`.                     |
| `readOnly`     | `readonly`      | yes       | `boolean`             | `false` | Makes the control read-only.                                     |
| `name`         | `name`          | yes       | `string`              | —       | The name submitted with the form data.                           |
| `disabled`     | `disabled`      | no        | `boolean`             | `false` | The disabled state of the component.                             |
| `invalid`      | `invalid`       | no        | `boolean`             | `false` | The invalid visual state of the component.                       |
| `defaultValue` | —               | —         | `number`              | —       | The value restored on a form reset.                              |
| `form`         | —               | —         | `HTMLFormElement \| null` | —   | The associated form. Read-only.                                  |
| `validity`     | —               | —         | `ValidityState`       | —       | The validity state of the control. Read-only.                    |
| `validationMessage` | —          | —         | `string`              | —       | The validation message of the control. Read-only.                |
| `willValidate` | —               | —         | `boolean`             | —       | Whether the control is a candidate for validation. Read-only.    |

### Methods

| Method              | Signature                        | Description                                                   |
| ------------------- | -------------------------------- | ------------------------------------------------------------- |
| `stepUp`            | `(n?: number): void`             | Increases the value by `n` steps.                              |
| `stepDown`          | `(n?: number): void`             | Decreases the value by `n` steps.                              |
| `checkValidity`     | `(): boolean`                    | Checks the validity and emits `invalid` when it fails.         |
| `reportValidity`    | `(): boolean`                    | Checks the validity and shows the browser message.             |
| `setCustomValidity` | `(message: string): void`        | Sets a custom validation message.                              |

### Events

| Event       | Detail   | Cancelable | Description                                                         |
| ----------- | -------- | ---------- | ------------------------------------------------------------------- |
| `igcChange` | `number` | no         | The value changed through user interaction.                          |
| `igcHover`  | `number` | no         | A symbol was hovered while `hoverPreview` is on.                     |

Setting `value` from code does not emit `igcChange`, and neither does an interaction that leaves the value as it was.

### Slots

| Component           | Name          | Description                                                     |
| ------------------- | ------------- | --------------------------------------------------------------- |
| `igc-rating`        | `symbol`      | The custom rating symbols. Their number decides `max`.           |
| `igc-rating`        | `value-label` | The content shown next to the value.                             |
| `igc-rating-symbol` | default       | The full state of the symbol.                                    |
| `igc-rating-symbol` | `empty`       | The empty state of the symbol.                                   |

### CSS Shadow parts

| Component           | Part          | Description                                     |
| ------------------- | ------------- | ----------------------------------------------- |
| `igc-rating`        | `base`        | The wrapper of all rating elements.              |
| `igc-rating`        | `label`       | The label of the control.                        |
| `igc-rating`        | `value-label` | The value label of the control.                  |
| `igc-rating`        | `symbols`     | The wrapper of all symbols.                      |
| `igc-rating`        | `symbol`      | A default symbol.                                |
| `igc-rating`        | `full`        | A full default symbol.                           |
| `igc-rating`        | `empty`       | An empty default symbol.                         |
| `igc-rating-symbol` | `symbol`      | The wrapper of the projected symbol.             |
| `igc-rating-symbol` | `full`        | The wrapper of the full state.                   |
| `igc-rating-symbol` | `empty`       | The wrapper of the empty state.                  |

### CSS custom properties

| Property                | Description                            |
| ----------------------- | -------------------------------------- |
| `--symbol-size`         | The size of the symbols.                |
| `--symbol-full-color`   | The color of a filled symbol.           |
| `--symbol-empty-color`  | The color of an empty symbol.           |
| `--symbol-full-filter`  | The filter(s) applied to projected full symbols, other than icons, when the rating is disabled. |
| `--symbol-empty-filter` | The filter(s) applied to projected empty symbols, other than icons, when the rating is disabled. |

## Test scenarios

| Suite              | File             |
| ------------------ | ---------------- |
| `Rating component` | `rating.spec.ts` |

### Default

1. The component is initialized with its default values and with passed attributes, and passes the accessibility
   audit.
2. The ARIA attributes are set, and `value-format` is reflected in the announced value text.
3. A value above `max` is truncated, and an out-of-bounds value is normalized.
4. The default symbols render, projected symbols render in their place, and `max` follows the number of projected
   symbols.

### Interaction

5. `stepUp()` and `stepDown()` change the value.
6. A click sets the value, with a step of `1` and with a fractional one, rounding to the next step.
7. The hover state is reflected while `hoverPreview` is on.
8. Clicking the current value resets it only while `allowReset` is set.
9. A click does nothing while the control is disabled or read-only, and neither does the keyboard while it is
   read-only.
10. The arrow keys increment and decrement the value, with <kbd>←</kbd> and <kbd>→</kbd> swapped in a
    right-to-left context.
11. <kbd>Home</kbd> and <kbd>End</kbd> set the lowest and the highest value.
12. No change event is emitted when the value does not change.
13. `single` forces the step to `1`.

### Value precision

14. `stepUp()` and the keyboard keep the value free of floating point noise, and `stepUp(n)` moves by `n` steps
    rather than to the next whole step.
15. A fractional value is reported as it is, including with an integer step, inside a fractional `max`, and at a
    high precision.
16. The decimals of the value survive a step.
17. A non-numeric `max` or `step` falls back to the default.

### Form integration tests

18. The control is form associated and takes part in submission.
19. A form reset restores the default value, including one set through `setAttribute()`, and clamps an
    out-of-range default.
20. The control follows the disabled state of an ancestor, and fulfils custom constraints.

### Default value

21. The initial state, the submitted value and the reset behavior of `defaultValue` are correct.

### Accessibility tests

22. The control is named through the `label` attribute, through the host `aria-label`, and after a change of that
    attribute at runtime.
23. The read-only and the disabled states are exposed to assistive technology.

### Hover

24. `igcHover` is emitted again when the pointer re-enters the same symbol.

### Not covered by the suite

- The projected `value-label` slot is not covered.
- The CSS custom properties are not covered by the suite.

## Assumptions and limitations

- When symbols are projected, `max` follows their number and cannot be set from code.
- An `igc-rating-symbol` expects two elements: one for the full state and one for the empty state.
- `step` is limited to the interval `0.001`–`1`; a larger granularity is not supported.
- `single` overrides `step` with `1`.
- The lowest value the keyboard reaches is one step; `0` is only reachable through the reset behavior or from code.

## Accessibility

### ARIA roles and properties

- The symbols container has `role="slider"`, with `aria-valuemin`, `aria-valuenow` and `aria-valuemax` for the
  range, and `aria-valuetext` composed from `valueFormat`.
- The control is named by its `label`, or by the `aria-label` of the host when there is no label; a change of that
  attribute at runtime is picked up.
- `aria-disabled` and `aria-readonly` expose the two states.
- The rendered symbols are hidden from assistive technology; the slider and its value text carry the semantics.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. <kbd>←</kbd> and
<kbd>→</kbd> swap their meaning.

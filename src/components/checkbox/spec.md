# Checkbox and switch specification

This directory hosts two form-associated components that share the same base implementation:
[`igc-checkbox`](#igc-checkbox) and [`igc-switch`](#igc-switch).

- [Checkbox and switch specification](#checkbox-and-switch-specification)
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
      - [Label and label position](#label-and-label-position)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Indeterminate state](#indeterminate-state)
      - [Validation](#validation)
      - [Form integration](#form-integration)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-checkbox](#igc-checkbox)
    - [igc-switch](#igc-switch)
    - [Shared methods](#shared-methods)
    - [Shared events](#shared-events)
  - [Test scenarios](#test-scenarios)
    - [Rendering and properties](#rendering-and-properties)
    - [Interactions and events](#interactions-and-events)
    - [Form integration](#form-integration-1)
    - [defaultChecked](#defaultchecked)
    - [Validation message slots](#validation-message-slots)
    - [External label association](#external-label-association)
    - [Not covered by the suites](#not-covered-by-the-suites)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                      |
| ------: | ---------- | -------------------------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                                      |
|       2 | 2026-09-24 | Label external `label` elements and host ARIA, activate from a label click |

## Overview

The `igc-checkbox` provides a binary choice for a condition. It follows the native browser checkbox element and
behaves in the same way, adding an optional indeterminate state, a positionable label, theming and declarative
validation messages.

The `igc-switch` controls the state of a single setting - on or off. It exposes the same API as the checkbox, minus
the indeterminate state, and renders as a track with a moving thumb instead of a box with an indicator.

Both components are form-associated: they participate in form submission, reset and constraint validation through
`ElementInternals`, and share a common base class, validators and form value handling.

### Key features

- **Binary state**: `checked` is the submitted state, and `value` is the submitted data.
- **Indeterminate state** (checkbox only), for partially selected groups.
- **Positionable label**: projected content rendered before or after the control.
- **Validation**: a `required` control must be checked to be valid, with declarative message slots.
- **Form integration**: submits with the form, restores its default checked state on reset.
- **Keyboard focus ring**: the focus indicator is shown for keyboard interaction, not for pointer clicks.
- **Themeable**: exposes shadow parts for the base wrapper, the control, the label and the indicator or thumb.

### Acceptance criteria

- The component must have a toggle visual representation.
- The component must be identifiable through a `name` property and must represent a unit of information through a
  `value` property.
- The component must provide a way to be disabled and a way to be marked as a required field.
- The checkbox must have an indeterminate state.
- The component must support a corresponding label, positioned before or after the control.
- The component must be operable with a mouse and with a keyboard.
- The component must emit an event when its checked state changes, and must forward focus and blur events.
- The component must report validation errors in the context of web forms.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant.
- The component must support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a visual representation of the current state, and of state changes.
- identify whether the control is disabled.
- identify whether the control is checked, unchecked or - for a checkbox - indeterminate.
- identify the option I am selecting, through a label or another visual aid.
- toggle the control by clicking either the control or its label.
- identify whether my selection is valid.

### Developer stories

As a developer, I expect to be able to:

- display a binary choice - true or false.
- name the control, so I can identify it among other selection controls of the same type.
- set the value of the control, so I can associate a piece of information with it.
- specify the default state of the control - checked, unchecked, or indeterminate for a checkbox.
- disable the control, so the end-user cannot change its state.
- place content between the tags of the component, so it is used as the corresponding label.
- position the label before or after the control, so it better suits the design.
- programmatically click, focus and blur the control.
- listen for focus, blur and change events, so I can manage the state of the control.
- check the validity of the control and set a custom validation message.
- customize the appearance of the control, so it fits the design language of my application.

## Functionality

### End-user experience

[Design hand-off - validation slots](https://www.figma.com/design/IZce3C3yRofmIqPzq634uQ/Input-Group%2C-Checkbox%2C-Radio%3A-validation-proposal?m=auto&node-id=2043-3&t=GExqKFPDIGlTcEs2-1)

**Checkbox.** The component renders a small square box that changes its appearance according to its state. When
unchecked, the box has only an outline. In the checked and the indeterminate states the box is filled and an icon
appears inside it - a tick mark for checked, a dash for indeterminate. The optional label can be positioned before or
after the box. Clicking either the box or the label toggles the state.

**Switch.** The component renders a track with a thumb. When the switch is turned on, the thumb moves to the end of
the track and the component changes color. The optional label can be positioned before or after the track. Clicking
either the track or the label toggles the state.

For both, the focus ring is rendered only when the control is reached from the keyboard, so a pointer click does not
leave a persistent focus outline. Invalid styling applies after the control has been interacted with, or after a
form submission attempt.

### Developer experience

#### Basic initialization

```html
<igc-checkbox name="terms" value="accepted">I accept the terms</igc-checkbox>
<igc-switch name="notifications" value="on">Enable notifications</igc-switch>
```

#### Label and label position

The label is the default slot content. It can be placed before or after the control:

```html
<igc-checkbox label-position="before">Label before the checkbox</igc-checkbox>
```

When nothing is projected, the label region is not rendered at all.

#### Labeling from the light DOM

The label is normally the content projected in the default slot. The control can also take its name from a `label`
element in the light DOM, bound through `for` or by nesting, and from the `aria-labelledby` or `aria-label` of the host:

```html
<label for="terms">Accept the terms</label>
<igc-checkbox id="terms"></igc-checkbox>

<label>
  Enable notifications
  <igc-switch></igc-switch>
</label>

<span id="external">External label</span>
<igc-checkbox aria-labelledby="external"></igc-checkbox>

<igc-switch aria-label="Dark mode"></igc-switch>
```

An IDREF does not cross a shadow boundary, so the component resolves these sources itself and binds them to the native
input in its shadow root as element references (`ariaLabelledByElements`). The name follows the
[naming order](../input/spec.md#naming-order): the host `aria-labelledby`, then the external `label` elements, then the
slotted label, then the host `aria-label`. An external `label` replaces the slotted label, so a wrapping `label` does
not repeat the slotted text.

A click on an external `label` focuses the native input and toggles the control, as for a native checkbox, and emits
`igcChange`. A disabled control ignores the click.

#### Indeterminate state

```html
<igc-checkbox indeterminate>Some items selected</igc-checkbox>
```

The indeterminate state is a visual state only; it does not change what is submitted. It is exclusive to
`igc-checkbox`.

#### Validation

```html
<igc-checkbox required>
  I accept the terms
  <span slot="value-missing">You must accept the terms to continue</span>
</igc-checkbox>
```

A required checkbox or switch is invalid until it is checked. Custom errors are supported through
`setCustomValidity`. See the [validation container specification](../validation-container/spec.md) for the full
mechanism.

#### Form integration

```html
<form>
  <igc-checkbox name="terms" value="accepted" required>I accept the terms</igc-checkbox>
  <button type="submit">Submit</button>
</form>
```

- A checked control submits its `value` under its `name`. An unchecked control submits nothing.
- When no `value` is set, a checked control submits `on`, following the native element.
- A form reset restores the `defaultChecked` state, which is taken from the `checked` attribute.
- A disabled control does not submit a value.

### Localization

The components render no built-in strings. The label, the helper text and the validation messages are provided by the
application and localized by it.

### Keyboard interactions

| Key combination  | Result                                              |
| ---------------- | --------------------------------------------------- |
| <kbd>Tab</kbd>   | Moves focus to the control, and away from it.       |
| <kbd>Space</kbd> | Toggles the checked state of the control.           |

## API

### igc-checkbox

A check box allowing single values to be selected/deselected.

#### Properties and attributes

| Property          | Attribute        | Reflected | Type                      | Default | Description                                                              |
| ----------------- | ---------------- | --------- | ------------------------- | ------- | ------------------------------------------------------------------------ |
| checked           | checked          | No        | `boolean`                 | false   | The checked state of the control.                                        |
| indeterminate     | indeterminate    | Yes       | `boolean`                 | false   | Draws the checkbox in indeterminate state.                               |
| value             | value            | No        | `string`                  | -       | The value of the control, submitted when the control is checked.         |
| labelPosition     | label-position   | Yes       | `ToggleLabelPosition`     | `after` | The label position of the control.                                       |
| required          | required         | Yes       | `boolean`                 | false   | Makes the component a required field for validation.                     |
| disabled          | disabled         | Yes       | `boolean`                 | false   | The disabled state of the component.                                     |
| invalid           | invalid          | No        | `boolean`                 | false   | Sets the control into invalid state (visual state only).                 |
| name              | name             | Yes       | `string`                  | -       | The name of the control, submitted with the form data.                   |
| defaultChecked    | -                | No        | `boolean`                 | false   | The initial checked state, restored on a form reset.                     |
| form              | -                | No        | `HTMLFormElement \| null` | -       | Read-only. The form associated with this element.                        |
| validity          | -                | No        | `ValidityState`           | -       | Read-only. The validity state of the element.                            |
| validationMessage | -                | No        | `string`                  | -       | Read-only. The validation message of the element.                        |
| willValidate      | -                | No        | `boolean`                 | -       | Read-only. Whether the element is a candidate for constraint validation. |

#### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| (default)       | The checkbox label.                                                              |
| `helper-text`   | Renders content below the control.                                               |
| `value-missing` | Renders content when the required validation fails.                              |
| `custom-error`  | Renders content when setCustomValidity(message) is set.                          |
| `invalid`       | Renders content when the component is in invalid state (validity.valid = false). |

#### CSS Shadow parts

| Part        | Description                        |
| ----------- | ---------------------------------- |
| `base`      | The base wrapper of the checkbox.  |
| `control`   | The checkbox input element.        |
| `label`     | The checkbox label.                |
| `indicator` | The checkbox indicator icon.       |

### igc-switch

Similar to a checkbox, a switch controls the state of a single setting on or off.

#### Properties and attributes

The switch exposes the same properties as the checkbox, with the exception of `indeterminate`:

| Property          | Attribute        | Reflected | Type                      | Default | Description                                                              |
| ----------------- | ---------------- | --------- | ------------------------- | ------- | ------------------------------------------------------------------------ |
| checked           | checked          | No        | `boolean`                 | false   | The checked state of the control.                                        |
| value             | value            | No        | `string`                  | -       | The value of the control, submitted when the control is checked.         |
| labelPosition     | label-position   | Yes       | `ToggleLabelPosition`     | `after` | The label position of the control.                                       |
| required          | required         | Yes       | `boolean`                 | false   | Makes the component a required field for validation.                     |
| disabled          | disabled         | Yes       | `boolean`                 | false   | The disabled state of the component.                                     |
| invalid           | invalid          | No        | `boolean`                 | false   | Sets the control into invalid state (visual state only).                 |
| name              | name             | Yes       | `string`                  | -       | The name of the control, submitted with the form data.                   |
| defaultChecked    | -                | No        | `boolean`                 | false   | The initial checked state, restored on a form reset.                     |
| form              | -                | No        | `HTMLFormElement \| null` | -       | Read-only. The form associated with this element.                        |
| validity          | -                | No        | `ValidityState`           | -       | Read-only. The validity state of the element.                            |
| validationMessage | -                | No        | `string`                  | -       | Read-only. The validation message of the element.                        |
| willValidate      | -                | No        | `boolean`                 | -       | Read-only. Whether the element is a candidate for constraint validation. |

#### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| (default)       | The switch label.                                                                |
| `helper-text`   | Renders content below the control.                                               |
| `value-missing` | Renders content when the required validation fails.                              |
| `custom-error`  | Renders content when setCustomValidity(message) is set.                          |
| `invalid`       | Renders content when the component is in invalid state (validity.valid = false). |

#### CSS Shadow parts

| Part      | Description                             |
| --------- | --------------------------------------- |
| `base`    | The base wrapper of the switch.         |
| `control` | The switch input element.               |
| `thumb`   | The position indicator of the switch.   |
| `label`   | The switch label.                       |

### Shared methods

| Name              | Type signature                    | Description                                                      |
| ----------------- | --------------------------------- | ---------------------------------------------------------------- |
| click             | `(): void`                        | Simulates a click on the control.                                |
| focus             | `(options?: FocusOptions): void`  | Sets focus on the control.                                       |
| blur              | `(): void`                        | Removes focus from the control.                                  |
| checkValidity     | `(): boolean`                     | Checks validity and emits `invalid` when the control is invalid. |
| reportValidity    | `(): boolean`                     | Checks validity and shows the browser message when invalid.      |
| setCustomValidity | `(message: string): void`         | Sets a custom message. Invalid while `message` is not empty.     |

### Shared events

| Name      | Cancellable | Description                                        |
| --------- | ----------- | -------------------------------------------------- |
| igcChange | false       | Emitted when the checked state of the control changes by user interaction. |

```typescript
interface IgcCheckboxChangeEventArgs {
  /** The current checked state of the control. */
  checked: boolean;
  /** The value of the control, if any. */
  value?: string;
}
```

The components also re-dispatch the native `focus`, `blur` and `invalid` events from the host element.

## Test scenarios

The two components are covered by two suites in this directory,
[`checkbox.spec.ts`](./checkbox.spec.ts) and [`switch.spec.ts`](./switch.spec.ts). They run in a real browser
through `@web/test-runner`, with `@open-wc/testing` fixtures and assertions, and reuse the shared harness in
[`src/internals/testing`](../../internals/testing):

| Shared helper | What it contributes |
| ------------- | ------------------- |
| `createFormAssociatedTestBed` | A `form` fixture around the control, exposing `formData`, `submit`, `reset` and `valid`. |
| `runValidationContainerTests` | Generated cases asserting that each validation slot renders for its failing constraint. |
| `simulateClick` / `simulateKeyboard` | User interaction driven without real device events. |
| `ValidityHelpers` | Assertions for validity, invalid styling and validation slot presence and content. |
| `isFocused` | Focus assertions that see through shadow roots. |

The groups below mirror the `describe` blocks of the two suites.

### Rendering and properties

Present in both suites unless noted.

1. Initializes the component with its default values.
2. Renders the component successfully, compared against a DOM snapshot.
3. Renders the correct SVG in the indigo theme (checkbox only).
4. Sets the `name` property correctly.
5. Sets the `labelPosition` property correctly.
6. Sets the `value` property correctly.
7. Sets the `disabled` property correctly.
8. Correctly reports the validity status.
9. Keeps correct focus states between light and shadow DOM.

### Interactions and events

10. Emits `igcChange` when the checked state changes.
11. Emits the click event only once - the shadow root must not duplicate it (checkbox only).

### Form integration

Driven by `createFormAssociatedTestBed`, in both suites.

12. Is form associated.
13. Is associated on submit with the default value `on`, and with a passed value - including when `checked` is set
    before the value.
14. Is not associated on submit when it is not checked.
15. Is correctly reset on form reset, including after a `setAttribute` and after a `toggleAttribute` call
    (checkbox only).
16. Syncs the native input checked state after a form reset (checkbox only).
17. Is correctly submitted on <kbd>Enter</kbd>, and does not submit while the value is invalid.
18. Reflects the disabled state of an ancestor `fieldset`.
19. Fulfils the required constraint - including in combination with `indeterminate` for the checkbox - and a custom
    constraint.
20. An initial checked state is submitted (checkbox only).
21. Validates synchronously (checkbox only).

### defaultChecked

Present in both suites.

22. Form integration - correct initial state, correct submission and correct reset.
23. Validation - fails the initial validation, and passes once `defaultChecked` is updated.

### Validation message slots

Generated by `runValidationContainerTests` in the checkbox suite.

24. `value-missing` with `required`.
25. `custom-error` after `setCustomValidity`.
26. `invalid` with `required`.

### External label association

Generated by `runExternalLabelAssociationTests` in both suites.

27. An external `label` bound through `for`, and a `label` wrapping the host, name the native input through
    `ariaLabelledByElements`. A click on it focuses the input, checks the control and emits `igcChange` once.
28. A `label` added after the first render names the input once the control gets focus.
29. An axe audit passes with only an external `label`.
30. A disabled control ignores a label click, and a click on the control inside a wrapping `label` changes the state
    once.
31. The host `aria-labelledby` wins over an external `label`, the host `aria-label` names the input while no label does,
    and a change of the host `aria-label` reaches the input. A change of the host `aria-labelledby` also reaches the
    input, and its removal gives the name back to the external `label`.

### Not covered by the suites

- The switch suite has no validation message slot cases, although the component exposes the same slots through the
  shared base class.
- The axe audit runs only in the external label configuration, and neither suite covers the keyboard focus ring
  behavior.
- The `indeterminate` property has no dedicated rendering case; it appears only in the required-constraint test.
## Accessibility

### ARIA roles and properties

- The encapsulated native `input` - of type `checkbox` for both components - is the focusable and interactive
  element, so the native checkbox semantics, states and announcements apply.
- The inner input takes its name in the [naming order](../input/spec.md#naming-order): the host `aria-labelledby`, the
  external `label` elements, the projected label content, and the host `aria-label`. See
  [Labeling from the light DOM](#labeling-from-the-light-dom).
- The indeterminate state is set on the native input, so it is announced as "partially checked".
- The helper text and the validation messages are referenced through `aria-describedby`.
- The required and disabled states come from the native attributes on the inner input.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

Both components work in a Right-to-Left context without additional setup or configuration. The label position
follows the inline direction, and the switch thumb travels in the direction of the writing mode.

# Input specification

- [Input specification](#input-specification)
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
      - [Input types](#input-types)
      - [Prefix, suffix and helper text](#prefix-suffix-and-helper-text)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Naming order](#naming-order)
      - [Constraint validation](#constraint-validation)
      - [Validation message slots](#validation-message-slots)
      - [Form integration](#form-integration)
      - [Text selection and numeric stepping](#text-selection-and-numeric-stepping)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Default state](#default-state)
    - [Properties](#properties)
    - [Methods](#methods-1)
    - [Events](#events-1)
    - [Regressions](#regressions)
    - [Form integration](#form-integration-1)
    - [defaultValue](#defaultvalue)
    - [Validation message slots](#validation-message-slots)
    - [External label association](#external-label-association)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                              |
| ------: | ---------- | -------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                              |
|       2 | 2026-09-23 | Correct the `type-mismatch` slot description       |
|       3 | 2026-09-24 | Describe the naming order and the host ARIA naming |

## Overview

The `igc-input` component is a highly customizable single-line text field for entering and editing data. It wraps a
native `input` element in a shadow root with `delegatesFocus`, so it keeps the native typing, autofill and keyboard
behavior while adding a label, placeholder, prefix/suffix content, helper text, theming and declarative validation
messages.

The component is form-associated: it participates in form submission, reset and constraint validation through
`ElementInternals`, without a hidden input.

### Key features

- **Multiple types**: `text`, `email`, `number`, `password`, `search`, `tel` and `url`.
- **Composable shell**: label, placeholder, prefix and suffix slots, and a helper text area shared with the
  validation messages.
- **Constraint validation**: `required`, `pattern`, `minlength`, `maxlength`, `min`, `max` and `step`, mapped to the
  standard `ValidityState` flags.
- **Declarative error messages**: one slot per validity flag, plus a catch-all `invalid` slot.
- **Validate-only mode**: evaluates the length and range constraints without preventing the end-user from typing a
  value that breaks them.
- **Form integration**: submits with the form, restores its default value on reset, and blocks submission when invalid.
- **Two appearances**: default and `outlined`.
- **Themeable**: exposes shadow parts for the container, input, label, prefix, suffix and helper text.

### Acceptance criteria

- The component must render a native input element that is focusable and accepts user input.
- It must support all of the exposed input types and forward the type to the native element.
- It must expose `label`, `placeholder`, `prefix`, `suffix` and `helper-text` presentation options.
- It must emit `igcInput` while the end-user types and `igcChange` when the value is committed.
- It must participate in form submission, reset and validation as a form-associated custom element.
- Validation constraints must map to the standard `ValidityState` flags and render the matching message slots.
- Invalid styling must only apply after the control has been interacted with, or when `invalid` is set explicitly.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant, associating the label and the helper text with the native input.
- The component must support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- type characters in a field, so I can provide data to a web form or another part of an application.
- see a clear focus indicator, so I know which field is currently focused.
- see distinct visual states (idle, hover, focus, filled, invalid, disabled, read-only), so I know how to interact
  with the field.
- read a label, so I can identify what the field is for.
- read helper text, so I get hints, counters or error messages about my input.
- see that a field is required before I try to submit the form.
- see prefix and/or suffix content, so I have more context about the expected value.
- interact with an actionable prefix or suffix, for example a button that clears the value.

### Developer stories

As a developer, I expect to be able to:

- set the input **type**, so the end-user gets the right keyboard and the right native behavior.
- set a **name**, so the field is identifiable in the form data.
- set and read the **value** programmatically.
- restrict the input with **min**, **max**, **step**, **minlength**, **maxlength** and **pattern**.
- mark the field as **required**, so it becomes mandatory for form submission.
- set the field as **disabled**, so it cannot be modified or interacted with.
- set the field as **readonly**, so it cannot be modified but remains focusable.
- set the field as **invalid**, so I can deterministically mark it as invalid.
- set **autocomplete** and **inputmode**, so the browser assists the end-user correctly.
- set **autofocus**, so the field is focused on initial page load.
- add a **label**, a **placeholder** and **helper text**.
- add **prefix** and/or **suffix** content, so I can build compound fields with icons and text.
- slot **error messages** per validation constraint, so the end-user is told what to correct.
- switch between the default and **outlined** appearance.
- validate without restricting input, through **validateOnly**.
- programmatically **select** the value or a range of it, and **step** numeric values.

## Functionality

### End-user experience

[Design hand-off - validation slots](https://www.figma.com/design/IZce3C3yRofmIqPzq634uQ/Input-Group%2C-Checkbox%2C-Radio%3A-validation-proposal?m=auto&node-id=2043-3&t=GExqKFPDIGlTcEs2-1)

The input presents a single-line field with an optional floating label. Prefix and suffix content is rendered inside
the field boundary, before and after the editable area. Below the field, the helper text area shows either the
slotted description or, while the control is invalid, the slotted error messages with an error icon.

Invalid styling is applied only after the end-user has interacted with the control - typed in it, or focused and left
it - or after a form submission attempt. This avoids marking an untouched form as invalid on load. Setting the
`invalid` property explicitly overrides this and styles the control as invalid at once.

A `disabled` control is not focusable, does not submit a value and never styles as invalid. A `readonly` control is
focusable and selectable but its value cannot be edited.

### Developer experience

#### Basic initialization

```html
<igc-input label="First name" name="first-name"></igc-input>
```

#### Input types

```html
<igc-input type="email" label="Email"></igc-input>
<igc-input type="password" label="Password"></igc-input>
<igc-input type="number" label="Quantity" min="1" max="10" step="1"></igc-input>
<igc-input type="search" label="Search" inputmode="search"></igc-input>
```

The `type` property accepts `text`, `email`, `number`, `password`, `search`, `tel` and `url`. It is reflected, so it
can be targeted from CSS.

#### Prefix, suffix and helper text

```html
<igc-input label="Amount" type="number">
  <span slot="prefix">$</span>
  <igc-icon slot="suffix" name="calculate"></igc-icon>
  <span slot="helper-text">Enter the amount in US dollars</span>
</igc-input>
```

Prefix and suffix accept arbitrary content, including interactive elements such as `igc-icon-button`.

#### Labeling from the light DOM

Besides the `label` property, the control can be labelled by a `label` element in the light DOM, either through
`for` or by nesting it:

```html
<label for="external">External label</label>
<igc-input id="external"></igc-input>

<label>
  External label
  <igc-input></igc-input>
</label>
```

An IDREF does not cross a shadow boundary, so the association cannot be expressed with an `aria-labelledby`
attribute on the inner native editor. The component resolves its labels through `ElementInternals` and projects them
onto the editor as **element references** (`ariaLabelledByElements`), which do resolve into ancestor tree scopes.
Clicking the external label focuses the control, exactly as for a native element.

Because a reflected relation blanks its content attribute, assert such a relation by identity
(`input.ariaLabelledByElements[0] === label`) rather than by reading the attribute.

The same channel carries the ARIA of a composite host. `igc-select`, `igc-combo` and `igc-color-picker` wrap an
`igc-input` and project their own `role`, `aria-haspopup`, `aria-expanded`, `aria-controls`,
`aria-activedescendant` and labels onto its native input. A projected label wins over the `label` property of the
input, and the projected `role` and `aria-haspopup` are mirrored on the host as `data-role` and `data-haspopup`, so
themes can style the anchor without reading ARIA that lives inside the shadow root.

#### Naming order

All form associated components of the library name their native control in the same order. The first source
that is present wins:

1. The `aria-labelledby` of the host, resolved in the tree of the host. It replaces all other sources.
2. The external `label` elements, bound through `for` or by nesting.
3. The own visible label of the component, for example the `label` property.
4. The `aria-label` of the host.

An external `label` replaces the own label, as a wrapping `label` already contains the content of the component. The
component resolves the sources again on each render, on a change of the host `aria-label` or `aria-labelledby`, and when
focus enters it, so a `label` that is added after the first render names the control from the first focus.

Chromium adds text from the shadow root of the component, for example the placeholder of the native editor, to the name
from a wrapping `label`. A `label` bound through `for` does not have this limitation.

#### Constraint validation

```html
<igc-input label="Username" required minlength="3" maxlength="16" pattern="[a-z0-9]+"></igc-input>
```

The validators applied depend on the `type`:

| Type          | Validators                                                  |
| ------------- | ----------------------------------------------------------- |
| `number`      | `required`, `min`, `max`, `step`                            |
| all others    | `required`, `minlength`, `maxlength`, `pattern`, type check |

The type check covers `email` and `url`, which set `typeMismatch` when the value is not a valid address or URL.

With `validate-only`, the length and range constraints are evaluated but not enforced on the native element, so the
end-user can type a value that violates them and see an error message instead of being silently blocked:

```html
<igc-input label="Bio" maxlength="140" validate-only>
  <span slot="too-long">Maximum 140 characters</span>
</igc-input>
```

#### Validation message slots

```html
<igc-input label="Email" type="email" required minlength="8">
  <span slot="helper-text">We never share your address</span>
  <span slot="value-missing">This field is required</span>
  <span slot="type-mismatch">Enter a valid email address</span>
  <span slot="too-short">The address is too short</span>
</igc-input>
```

While the control is invalid, the helper text is replaced by the message for the failing constraint. See the
[validation container specification](../validation-container/spec.md) for the full mechanism and the mapping between
validity flags and slot names.

#### Form integration

```html
<form>
  <igc-input name="email" type="email" label="Email" required></igc-input>
  <button type="submit">Submit</button>
</form>
```

- The value is submitted under `name`.
- A form reset restores the value to `defaultValue`, which is taken from the `value` attribute.
- An invalid control blocks submission and fires the native `invalid` event.
- Pressing <kbd>Enter</kbd> inside the field submits the associated form.

#### Text selection and numeric stepping

```ts
const input = document.querySelector('igc-input')!;

input.select();
input.setSelectionRange(0, 4);
input.setRangeText('new', 0, 4, 'select');

// type="number"
input.stepUp();
input.stepDown(5);
```

### Localization

The component renders no built-in strings. The `label`, `placeholder`, helper text and validation messages are
provided by the application and localized by it. The native input inherits the browser locale for its own UI, such as
the virtual keyboard selected through `inputmode`.

### Keyboard interactions

The component delegates focus to the inner native input, so all native text-editing keys apply.

| Key combination  | Result                                                                |
| ---------------- | --------------------------------------------------------------------- |
| <kbd>Tab</kbd>   | Moves focus to the input, and away from it.                           |
| <kbd>Enter</kbd> | Submits the associated form, if any.                                  |
| <kbd>Up</kbd> / <kbd>Down</kbd> | Steps the value of a `type="number"` input.            |

## API

### Properties and attributes

| Property          | Attribute       | Reflected | Type                    | Default | Description                                                                 |
| ----------------- | --------------- | --------- | ----------------------- | ------- | --------------------------------------------------------------------------- |
| value             | value           | No        | `string`                | `''`    | The value of the control.                                                   |
| type              | type            | Yes       | `InputType`             | text    | The type of the control.                                                    |
| label             | label           | No        | `string`                | -       | The label for the control.                                                  |
| placeholder       | placeholder     | No        | `string`                | -       | The placeholder text of the control.                                        |
| outlined          | outlined        | Yes       | `boolean`               | false   | Whether the control will have outlined appearance.                          |
| readOnly          | readonly        | Yes       | `boolean`               | false   | Makes the control a readonly field.                                         |
| required          | required        | Yes       | `boolean`               | false   | Makes the component a required field for validation.                        |
| disabled          | disabled        | Yes       | `boolean`               | false   | The disabled state of the component.                                        |
| invalid           | invalid         | No        | `boolean`               | false   | Sets the control into invalid state (visual state only).                    |
| name              | name            | Yes       | `string`                | -       | The name of the control, submitted with the form data.                      |
| pattern           | pattern         | No        | `string \| undefined`   | -       | The regular expression the value is validated against.                      |
| minLength         | minlength       | No        | `number \| undefined`   | -       | The minimum string length required by the control.                          |
| maxLength         | maxlength       | No        | `number \| undefined`   | -       | The maximum string length of the control.                                   |
| min               | min             | No        | `number \| undefined`   | -       | The minimum value the control accepts.                                      |
| max               | max             | No        | `number \| undefined`   | -       | The maximum value the control accepts.                                      |
| step              | step            | No        | `number \| undefined`   | -       | The granularity the value must adhere to.                                   |
| validateOnly      | validate-only   | Yes       | `boolean`               | false   | Evaluates the length and range constraints without restricting user input.  |
| autocomplete      | autocomplete    | No        | `string`                | -       | A hint for the browser on how to autofill the control.                      |
| autofocus         | autofocus       | No        | `boolean`               | false   | Whether the control should receive focus automatically.                     |
| inputMode         | inputmode       | No        | `string`                | -       | A hint to the browser for which virtual keyboard layout to display.         |
| defaultValue      | -               | No        | `string`                | `''`    | The initial value of the control, restored on a form reset.                 |
| form              | -               | No        | `HTMLFormElement \| null` | -     | Read-only. The form associated with this element.                           |
| validity          | -               | No        | `ValidityState`         | -       | Read-only. The validity state of the element.                               |
| validationMessage | -               | No        | `string`                | -       | Read-only. The validation message of the element.                           |
| willValidate      | -               | No        | `boolean`               | -       | Read-only. Whether the element is a candidate for constraint validation.    |

`invalid` is not reflected as an attribute. Reading it returns the effective state, so a control that has been
interacted with and fails validation reads `true` even if it was never set explicitly.

### Methods

| Name              | Type signature                                                                                          | Description                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| focus             | `(options?: FocusOptions): void`                                                                         | Sets focus on the control.                                         |
| blur              | `(): void`                                                                                               | Removes focus from the control.                                    |
| select            | `(): void`                                                                                               | Selects all the text inside the input.                             |
| setSelectionRange | `(start?: number, end?: number, direction?: SelectionRangeDirection): void`                              | Sets the text selection range of the control.                      |
| setRangeText      | `(replacement: string, start?: number, end?: number, selectMode?: RangeTextSelectMode): void`            | Replaces the selected text in the input.                           |
| stepUp            | `(n?: number): void`                                                                                     | Increments the numeric value of the input by one or more steps.    |
| stepDown          | `(n?: number): void`                                                                                     | Decrements the numeric value of the input by one or more steps.    |
| checkValidity     | `(): boolean`                                                                                            | Checks validity and emits `invalid` when the control is invalid.   |
| reportValidity    | `(): boolean`                                                                                            | Checks validity and shows the browser message when invalid.        |
| setCustomValidity | `(message: string): void`                                                                                | Sets a custom message. Invalid while `message` is not empty.       |

### Events

| Name      | Cancellable | Detail   | Description                                        |
| --------- | ----------- | -------- | -------------------------------------------------- |
| igcInput  | false       | `string` | Emitted when the control input receives user input. |
| igcChange | false       | `string` | Emitted when the value of the control is committed. |

The component also re-dispatches the native `focus`, `blur` and `invalid` events from the host element.

### Slots

| Name               | Description                                                                      |
| ------------------ | --------------------------------------------------------------------------------- |
| `prefix`           | Renders content before the input.                                                |
| `suffix`           | Renders content after input.                                                     |
| `helper-text`      | Renders content below the input.                                                 |
| `value-missing`    | Renders content when the required validation fails.                              |
| `type-mismatch`    | Renders content when the url/email type validation fails.        |
| `pattern-mismatch` | Renders content when the pattern validation fails.                               |
| `too-long`         | Renders content when the maxlength validation fails.                             |
| `too-short`        | Renders content when the minlength validation fails.                             |
| `range-overflow`   | Renders content when the max validation fails.                                   |
| `range-underflow`  | Renders content when the min validation fails.                                   |
| `step-mismatch`    | Renders content when the step validation fails.                                  |
| `custom-error`     | Renders content when setCustomValidity(message) is set.                          |
| `invalid`          | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

| Part          | Description                                          |
| ------------- | ---------------------------------------------------- |
| `container`   | The main wrapper that holds all main input elements. |
| `input`       | The native input element.                            |
| `label`       | The native label element.                            |
| `prefix`      | The prefix wrapper.                                  |
| `suffix`      | The suffix wrapper.                                  |
| `helper-text` | The helper text wrapper.                             |

The `container` and `input` parts additionally carry state part names, so filled, prefixed and suffixed states can be
styled without extra attributes.

## Test scenarios

The suite lives in [`input.spec.ts`](./input.spec.ts). It runs in a real browser through `@web/test-runner`, with
`@open-wc/testing` fixtures and assertions, and it reuses the shared harness in
[`src/internals/testing`](../../internals/testing):

| Shared helper | What it contributes |
| ------------- | ------------------- |
| `createFormAssociatedTestBed` | A `form` fixture around the control, exposing `formData`, `submit`, `reset` and `valid`. |
| `runValidationContainerTests` | Generated cases asserting that each validation slot renders for its failing constraint. |
| `runExternalLabelAssociationTests` | External `label` association through `for`, by nesting and after the first render, click-to-focus, an axe audit, and the host ARIA naming. |
| `simulateInput / simulateClick / simulateKeyboard` | User interaction driven without real device events. |
| `ValidityHelpers` | Assertions for validity, invalid styling and validation slot presence and content. |

The groups below mirror the `describe` blocks of the suite.

### Default state

1. Is initialized with the proper default values.
2. Is accessible (axe audit).
3. Renders the expected layout for the material variant.

### Properties

4. Sets the `type` property.
5. Sets the `disabled` property.
6. Sets the `label` property.
7. Sets the `name` property.
8. Sets the `placeholder` property.
9. Sets the `min` and `max` properties.
10. Sets the `minLength` and `maxLength` properties.
11. Sets the `pattern` property.
12. Sets the `required` property.
13. Sets the `value` property.
14. Issue #1026 - passing `undefined` sets the underlying input value to `undefined`.

### Methods

15. `stepUp` and `stepDown` increment and decrement the value.
16. `setRangeText` replaces the given range.
17. `focus` and `blur` move focus to and from the inner input.

### Events

18. Emits `igcInput`.
19. Emits `igcChange`.
20. A click on the label lets a single click escape the shadow root - it must not be duplicated.

### Regressions

21. Issue #1066 - the component validates synchronously.
22. Issue #1521.
23. Issue #1632 - the control does not enter the `invalid` state while pristine when validator properties change
    dynamically.

### Form integration

Driven by `createFormAssociatedTestBed`.

24. Is form associated.
25. Is not associated on submit when it has no value.
26. Is associated on submit.
27. Is correctly reset on form reset, including after a `setAttribute` call.
28. Reflects the disabled state of an ancestor `fieldset`.
29. Fulfils the required, min, max, step, minimum length, maximum length, pattern and custom constraints.
30. Validates the `email` and `url` schema types.

### defaultValue

31. Form integration - correct initial state, correct submission, correct reset, submission on <kbd>Enter</kbd>, and
    no submission on <kbd>Enter</kbd> while the value is invalid.
32. Validation - a passing and a failing case for each of required, minlength, maxlength, pattern, email schema, url
    schema, min, max and step.

### Validation message slots

Generated by `runValidationContainerTests`. Each case renders the control with the slot projected, forces the
constraint to fail, and asserts the slot is present and has content:

33. `value-missing` with `required`.
34. `type-mismatch` with `type="email"`.
35. `pattern-mismatch` with a `pattern`.
36. `too-long` with `maxLength`, and `too-short` with `minLength`.
37. `range-overflow` with `max`, `range-underflow` with `min`, and `step-mismatch` with `step`, for `type="number"`.
38. `custom-error` after `setCustomValidity`.
39. `invalid` with `required`.
40. Two slots at once - `type-mismatch` and `too-short` on an email input with `minLength`.

### External label association

Generated by `runExternalLabelAssociationTests`.

41. An external `label` bound through `for`, and a `label` wrapping the host, are projected onto the native input as
    `ariaLabelledByElements`.
42. Clicking that label focuses the host and the native input. A `label` added after the first render names the control
    from the first focus, an axe audit passes with only an external `label`, and the host `aria-labelledby` and
    `aria-label` follow the [naming order](#naming-order).

### Not covered by the suite

The following documented behaviors have no dedicated case yet: `select`, `setSelectionRange`, the `validateOnly`
mode, the `outlined` property, and the forwarding of `inputmode` and `autocomplete`.
## Accessibility

### ARIA roles and properties

- The encapsulated native `input` is the focusable and interactive element; the host delegates focus to it.
- The `label` attribute renders a native `label` element bound to the input, which provides an accessible name.
- An external `label` in the light DOM, associated through `for` or by nesting, is resolved through
  `ElementInternals` and projected onto the native input as an element reference, so the name crosses the shadow
  boundary. Clicking that label focuses the control.
- When helper text is slotted, the helper text container is referenced by the input through `aria-describedby`, so
  the current description or validation message is announced.
- The validation message region is announced politely through the validation container.
- The required, disabled and read-only states come from the native attributes on the inner input.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The prefix and suffix
positions, the label alignment and the helper text flow follow the inline direction.

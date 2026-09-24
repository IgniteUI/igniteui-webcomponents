# Mask input specification

- [Mask input specification](#mask-input-specification)
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
      - [Mask pattern flags](#mask-pattern-flags)
      - [Literals and escaping](#literals-and-escaping)
      - [Value modes](#value-modes)
      - [Prompt character](#prompt-character)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Validation](#validation)
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
    - [Generic properties](#generic-properties)
    - [Undo and redo](#undo-and-redo)
    - [Form integration](#form-integration-1)
    - [defaultValue](#defaultvalue)
    - [Validation message slots](#validation-message-slots)
    - [External label association](#external-label-association)
    - [Parser and history unit suites](#parser-and-history-unit-suites)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                              |
| ------: | ---------- | -------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                              |
|       2 | 2026-09-24 | Describe the naming order and the host ARIA naming |

## Overview

The `igc-mask-input` is an input field where the developer controls user input and formats the visible value, based
on a configurable mask pattern. It builds on the same shell as [`igc-input`](../input/spec.md) - label, prefix,
suffix, helper text, theming and validation messages - and adds pattern-driven editing, caret management, an undo and
redo history and a choice of value formats.

### Key features

- **Mask pattern**: a format string of flags and literals that guides the end-user input and the display value.
- **Required and optional positions**: the required flags participate in validation through the `badInput` flag.
- **Configurable prompt**: the symbol shown in the unfilled positions of the pattern.
- **Two value modes**: the raw user input, or the value with all literals and prompts included.
- **Full editing support**: typing, deleting, selection, cut, copy, paste, drag and drop, IME composition, and
  browser auto-fill, all reapplying the mask.
- **Undo and redo**: an internal history replaces the native undo stack, which is cleared on every masked update.
- **Unicode digit input**: digits from non-ASCII numbering systems are normalized to ASCII in digit positions.
- **Form integration**: submits with the form, restores the default value on reset and validates on submission.

### Acceptance criteria

- Provide a mask pattern for guiding user input and for the display value format.
- Support the built-in pattern flags for digits, letters, alphanumeric and any characters, in required and optional
  variants, plus escaping of a flag into a literal.
- Support static symbols (literals) in the mask pattern.
- Provide a prompt symbol for customizing the unfilled parts of the pattern.
- Provide a way to read the value verbatim (with literals included) or stripped of literals and formatting.
- Support the properties and API surface of `igc-input` where applicable.
- Correctly manage and report the validation state when validation constraints or required positions are applied.
  The control becomes invalid when some positions are filled but not all required ones are; an entirely empty value
  is the responsibility of `required`.
- Participate in form submission, reset and validation as a form-associated custom element.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and behave as closely as possible to a standard browser input.
- The component must support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- enter characters in a field, so I can provide data in the format the application expects.
- be prevented from entering characters that do not match the expected format.
- see which positions are still unfilled.
- see a visual indicator, such as an outline, so I know which field is focused.
- see different visual states, so I know how to interact with the field.
- read a label, so I can identify the field.
- read helper text, so I get hints and validation messages about my input.
- see an asterisk glyph in the label, so I know that the field is required.
- see prefix and suffix content, so I have more context.
- copy, paste and drag text into the field and have it reformatted to the mask.
- undo and redo my edits.

### Developer stories

As a developer, I expect to be able to:

- set a **mask** pattern, so user input is guided and filtered.
- set a **prompt** symbol, so the unfilled positions match my design.
- choose the **value mode**, so I read either the raw input or the formatted value.
- set a **name**, so the control is identifiable in the context of a web form.
- set a **value**, so the control can be programmatically initialized or updated.
- set **required**, so the control becomes mandatory in the context of a web form.
- set **disabled**, so the control cannot be modified or interacted with.
- set **readonly**, so the value cannot be modified but the end-user can still interact with the control.
- set **invalid**, so I can deterministically mark the control as invalid.
- add a **label**, a **placeholder**, **prefix**/**suffix** content and **helper text**.
- alter between the filled and **outlined** styles for Material-styled inputs.
- check whether the current input satisfies the mask pattern.

## Functionality

### End-user experience

[Design hand-off - validation slots](https://www.figma.com/design/IZce3C3yRofmIqPzq634uQ/Input-Group%2C-Checkbox%2C-Radio%3A-validation-proposal?m=auto&node-id=2043-3&t=GExqKFPDIGlTcEs2-1)

- The mask adds formatting characters to user input and prevents the end-user from typing input that does not match
  the pattern.
- The control matches the behavior of a standard browser input as closely as possible, while enforcing the mask rules.
- When the control has a value, the mask string is applied regardless of the focus state.
- For an empty control, a placeholder is shown; by default it is the mask pattern itself, unless `placeholder` is set.
  The empty mask with its prompt characters is shown on focus, and while text is dragged over the input.
- Typing a character advances the caret as long as the character satisfies the underlying mask rule. Otherwise the
  caret stays at its current position.
- <kbd>Backspace</kbd> deletes a character, moves the caret to the previous non-literal position and restores the
  prompt symbol in the cleared position.
- <kbd>Delete</kbd> deletes a character, moves the caret to the next non-literal position and restores the prompt
  symbol in the cleared position.
- Pasted text takes the format defined by the mask. Copying from the field always returns the formatted string.
- Text dropped into the field takes the format defined by the mask.
- Input through an input method editor (IME) is supported. While in composition mode the pattern is not enforced; it
  is applied when the composition is committed.
- Text selection behaviors:
  - focusing the control with <kbd>Tab</kbd> selects the text inside the field.
  - clicking inside an empty mask selects the text in the field.
  - clicking at the end of the field selects the text, regardless of the current value state.
- Undo and redo are available through the standard shortcuts. A run of typed characters, or a run of deletions in the
  same direction, collapses into a single step; every other edit - paste, drop, cut, composition, auto-fill,
  `setRangeText` - forms a step of its own.

### Developer experience

#### Basic initialization

```html
<igc-mask-input label="Phone" mask="(000) 000-0000"></igc-mask-input>
```

By default the mask is `CCCCCCCCCC` - ten optional positions that accept any character.

#### Mask pattern flags

| Mask character | Description                                                             |
| :------------- | :---------------------------------------------------------------------- |
| `0`            | Digit character [0-9]. Entry is required.                               |
| `9`            | Digit character [0-9]. Entry is optional.                               |
| `#`            | Digit character [0-9], plus (+), or minus (-) sign. Entry is required.  |
| `L`            | Letter character. Entry is required.                                    |
| `?`            | Letter character. Entry is optional.                                    |
| `A`            | Alphanumeric (letter or digit) character. Entry is required.            |
| `a`            | Alphanumeric (letter or digit) character. Entry is optional.            |
| `&`            | Any keyboard character. Entry is required.                              |
| `C`            | Any keyboard character. Entry is optional.                              |
| `\`            | Escapes a mask flag and turns it into a literal.                        |

Digits typed in a digit position are normalized to ASCII, so input from Arabic-Indic, Devanagari, Thai, full-width
and the other supported numbering systems is accepted.

#### Literals and escaping

Any character in the pattern that is not a flag is a literal and is rendered as-is. A flag character can be turned
into a literal by escaping it:

```html
<!-- Renders a literal "C" followed by five required digits -->
<igc-mask-input mask="\C-00000"></igc-mask-input>
```

#### Value modes

```html
<igc-mask-input mask="(000) 000-0000" value-mode="withFormatting"></igc-mask-input>
```

| `valueMode`      | `value` returns                                   |
| ---------------- | ------------------------------------------------- |
| `raw` (default)  | The clean user input, e.g. `5551234567`.          |
| `withFormatting` | The value with literals and prompts, e.g. `(555) 123-4567`. |

An empty control returns an empty string in both modes.

#### Prompt character

```html
<igc-mask-input mask="00/00/0000" prompt="*"></igc-mask-input>
```

Only the first character of the assigned string is used, and a mask flag is rejected in favor of the default `_`.

#### Labeling from the light DOM

Besides the `label` property, the control can be labelled by a `label` element in the light DOM, either through
`for` or by nesting it:

```html
<label for="external">External label</label>
<igc-mask-input id="external"></igc-mask-input>

<label>
  External label
  <igc-mask-input></igc-mask-input>
</label>
```

An IDREF does not cross a shadow boundary, so the association cannot be expressed with an `aria-labelledby`
attribute on the inner native editor. The component resolves its labels through `ElementInternals` and projects them
onto the editor as **element references** (`ariaLabelledByElements`), which do resolve into ancestor tree scopes.
Clicking the external label focuses the control, exactly as for a native element.

Because a reflected relation blanks its content attribute, assert such a relation by identity
(`input.ariaLabelledByElements[0] === label`) rather than by reading the attribute.

The name follows the [naming order](../input/spec.md#naming-order), so the host `aria-labelledby` and `aria-label` also
name the control.

#### Validation

```html
<igc-mask-input label="Phone" mask="(000) 000-0000" required>
  <span slot="value-missing">A phone number is required</span>
  <span slot="bad-input">Please complete the phone number</span>
</igc-mask-input>
```

The component applies two validators:

| Validator  | Validity flag  | Fails when                                                              |
| ---------- | -------------- | ----------------------------------------------------------------------- |
| `required` | `valueMissing` | The control is required and the value is empty.                         |
| mask       | `badInput`     | Some positions are filled but not all required positions are satisfied. |

`isValidMaskPattern()` exposes the same check programmatically. See the
[validation container specification](../validation-container/spec.md) for the message slot mechanism.

#### Form integration

```html
<form>
  <igc-mask-input name="phone" mask="(000) 000-0000" required></igc-mask-input>
  <button type="submit">Submit</button>
</form>
```

The value submitted with the form follows `valueMode`: the raw input in `raw` mode, the formatted string in
`withFormatting` mode. A form reset restores the default value taken from the `value` attribute.

### Localization

The component renders no built-in strings of its own. The mask validation message comes from the library validation
resource strings, and is only surfaced through the native validation message; slotted error content replaces it in
the UI. The `label`, `placeholder` and helper text are provided by the application.

### Keyboard interactions

| Key combination                                       | Result                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| <kbd>Tab</kbd>                                        | Moves focus to the control and selects its text.                      |
| <kbd>Backspace</kbd>                                  | Clears the previous non-literal position and restores its prompt.     |
| <kbd>Delete</kbd>                                     | Clears the next non-literal position and restores its prompt.         |
| <kbd>Enter</kbd>                                      | Submits the associated form, if any.                                  |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Cmd</kbd> + <kbd>Z</kbd> | Undoes the last edit step.                                   |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd>                        | Redoes the last undone step.                                          |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> / <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redoes the last undone step. |

All other native text-editing keys apply, as the component delegates focus to the inner native input.

## API

### Properties and attributes

| Property          | Attribute   | Reflected | Type                      | Default        | Description                                                                 |
| ----------------- | ----------- | --------- | ------------------------- | -------------- | --------------------------------------------------------------------------- |
| value             | value       | No        | `string`                  | `''`           | The value of the input, in the format dictated by `valueMode`.              |
| mask              | mask        | No        | `string`                  | `CCCCCCCCCC`   | The masked pattern of the component.                                        |
| prompt            | prompt      | No        | `string`                  | `_`            | The prompt symbol to use for unfilled parts of the mask pattern.            |
| valueMode         | value-mode  | No        | `MaskInputValueMode`      | `raw`          | Whether `value` returns the clean input or the formatted one.               |
| label             | label       | No        | `string`                  | -              | The label for the control.                                                  |
| placeholder       | placeholder | No        | `string`                  | the mask       | The placeholder text of the control. Defaults to the escaped mask pattern.  |
| outlined          | outlined    | Yes       | `boolean`                 | false          | Whether the control will have outlined appearance.                          |
| readOnly          | readonly    | Yes       | `boolean`                 | false          | Makes the control a readonly field.                                         |
| required          | required    | Yes       | `boolean`                 | false          | Makes the component a required field for validation.                        |
| disabled          | disabled    | Yes       | `boolean`                 | false          | The disabled state of the component.                                        |
| invalid           | invalid     | No        | `boolean`                 | false          | Sets the control into invalid state (visual state only).                    |
| name              | name        | Yes       | `string`                  | -              | The name of the control, submitted with the form data.                      |
| defaultValue      | -           | No        | `string`                  | `''`           | The initial value of the control, restored on a form reset.                 |
| form              | -           | No        | `HTMLFormElement \| null` | -              | Read-only. The form associated with this element.                           |
| validity          | -           | No        | `ValidityState`           | -              | Read-only. The validity state of the element.                               |
| validationMessage | -           | No        | `string`                  | -              | Read-only. The validation message of the element.                           |
| willValidate      | -           | No        | `boolean`                 | -              | Read-only. Whether the element is a candidate for constraint validation.    |

The standard `autofocus` global attribute is forwarded to the inner native input.

### Methods

| Name               | Type signature                                                                               | Description                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| isValidMaskPattern | `(): boolean`                                                                                 | Returns whether the current masked input is valid according to the mask. |
| select             | `(): void`                                                                                    | Selects all the text inside the input.                                  |
| setSelectionRange  | `(start?: number, end?: number, direction?: SelectionRangeDirection): void`                   | Sets the text selection range of the control.                           |
| setRangeText       | `(replacement: string, start?: number, end?: number, selectMode?: RangeTextSelectMode): void` | Replaces the selected text in the control and re-applies the mask.      |
| focus              | `(options?: FocusOptions): void`                                                              | Sets focus on the control.                                              |
| blur               | `(): void`                                                                                    | Removes focus from the control.                                         |
| checkValidity      | `(): boolean`                                                                                  | Checks validity and emits `invalid` when the control is invalid.        |
| reportValidity     | `(): boolean`                                                                                  | Checks validity and shows the browser message when invalid.             |
| setCustomValidity  | `(message: string): void`                                                                      | Sets a custom message. Invalid while `message` is not empty.            |

### Events

| Name      | Cancellable | Detail   | Description                                                            |
| --------- | ----------- | -------- | ---------------------------------------------------------------------- |
| igcInput  | false       | `string` | Emitted when the control receives user input.                          |
| igcChange | false       | `string` | Emitted when an alteration of the control value is committed by the user. |

Both details follow the current `valueMode`.

### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| `prefix`        | Renders content before the input.                                                |
| `suffix`        | Renders content after the input.                                                 |
| `helper-text`   | Renders content below the input.                                                 |
| `value-missing` | Renders content when the required validation fails.                              |
| `bad-input`     | Renders content when a required mask pattern validation fails.                   |
| `custom-error`  | Renders content when setCustomValidity(message) is set.                          |
| `invalid`       | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

| Part          | Description                                          |
| ------------- | ---------------------------------------------------- |
| `container`   | The main wrapper that holds all main input elements. |
| `input`       | The native input element.                            |
| `label`       | The native label element.                            |
| `prefix`      | The prefix wrapper.                                  |
| `suffix`      | The suffix wrapper.                                  |
| `helper-text` | The helper text wrapper.                             |

## Test scenarios

The suite lives in [`mask-input.spec.ts`](./mask-input.spec.ts). It runs in a real browser through `@web/test-runner`, with
`@open-wc/testing` fixtures and assertions, and it reuses the shared harness in
[`src/internals/testing`](../../internals/testing):

| Shared helper | What it contributes |
| ------------- | ------------------- |
| `createFormAssociatedTestBed` | A `form` fixture around the control, exposing `formData`, `submit`, `reset` and `valid`. |
| `runValidationContainerTests` | Generated cases asserting that each validation slot renders for its failing constraint. |
| `runExternalLabelAssociationTests` | External `label` association through `for`, by nesting and after the first render, click-to-focus, an axe audit, and the host ARIA naming. |
| `simulateInput / simulateClick / simulateKeyboard` | User interaction driven without real device events. |
| `ValidityHelpers` | Assertions for validity, invalid styling and validation slot presence and content. |
| `mask-parser.spec.ts` | A unit suite for the pattern parser itself, independent of the component. |
| `mask-history.spec.ts` | A unit suite for the undo and redo history, independent of the component. |

The groups below mirror the `describe` blocks of the suite.

### Generic properties

1. Sensible default values.
2. Changing the prompt character, with and without a value.
3. Changing the mask, with and without a value.
4. The placeholder is updated correctly.
5. An empty value, with and without literals, and an empty read-only value on focus.
6. Reading the value without literals, and switching a value with literals to one without.
7. The invalid state is correctly reflected.
8. The valid and invalid states derived from the mask pattern.
9. `setCustomValidity`.
10. `setRangeText`, including clearing a focused input - which keeps the mask visible - and clearing an unfocused
    one, which empties it.
11. `igcChange` and `igcInput`, with and without literals, and at the end of the pattern.
12. Is accessible (axe audit).
13. Focus and blur update the underlying input mask, for an empty and a non-empty value.
14. Drag enter and drag leave, with and without focus.
15. <kbd>Delete</kbd> and <kbd>Backspace</kbd> behavior, including skipping literals and a composing backspace.
16. Default input behavior, composition, cut, paste, drop and browser auto-fill for a mask with literals.

### Undo and redo

Grouped as `Undo / redo` in the suite.

17. Collapses a run of typed characters into a single step, and redoes the restored run.
18. Supports the alternate shortcuts.
19. Preserves interior holes in the mask.
20. Starts a new step when the caret moves.
21. Collapses a run of backspaces into a single step, and keeps typing and deleting as separate steps.
22. Records a paste as its own step.
23. Does not record an edit that the mask rejects.
24. Emits `igcInput` when a step is restored, and places the caret where the undone edit began.
25. Is a no-op with nothing to undo, and does nothing while read-only.
26. Drops the history on a programmatic value assignment, on a mask change and on a prompt change.
27. Survives a blur and a refocus.

### Form integration

Driven by `createFormAssociatedTestBed`.

28. Is form associated, and is not associated on submit without a value.
29. Is associated on submit, including with value formatting enabled.
30. Is correctly reset on form reset, with and without value formatting, after a `setAttribute` call, and refreshes
    the rendered masked value and placeholder afterwards.
31. Is correctly submitted on <kbd>Enter</kbd>, and does not submit while the value is invalid.
32. Reflects the disabled state of an ancestor `fieldset`.
33. Fulfils the required constraint, including with value formatting, the mask pattern constraint and a custom
    constraint.

### defaultValue

34. Form integration - correct initial state, correct submission, correct reset, and dropping the undo history on
    reset.
35. Validation - fails the initial validation, and passes once `defaultValue` is updated.

### Validation message slots

Generated by `runValidationContainerTests`.

36. `value-missing` with `required`.
37. `bad-input` with an unsatisfied mask pattern.
38. `custom-error` after `setCustomValidity`.
39. `invalid` with `required`.

### External label association

Generated by `runExternalLabelAssociationTests`.

40. An external `label` bound through `for`, and a `label` wrapping the host, are projected onto the native input as
    `ariaLabelledByElements`, and clicking it focuses the control. A `label` added after the first render names the
    control from the first focus, an axe audit passes with only an external `label`, and the host `aria-labelledby` and
    `aria-label` follow the [naming order](../input/spec.md#naming-order).

### Parser and history unit suites

41. [`mask-parser.spec.ts`](./mask-parser.spec.ts) covers the parser on its own: every flag, literals and escaping,
    applying and parsing values, Unicode digit normalization, and edge and boundary conditions.
42. [`mask-history.spec.ts`](./mask-history.spec.ts) covers the history on its own: recording, coalescing, traversal
    and invalidation of the steps.
## Assumptions and limitations

- The mask input does not expose a `type` attribute, since it is always an input of type `text`.
- The component does not format values by locale; the mask is a literal pattern, not a number or date format. Use
  [`igc-date-time-input`](../date-time-input/spec.md) for date and time editing.

## Accessibility

### ARIA roles and properties

- The encapsulated native `input` is the focusable and interactive element; the host delegates focus to it.
- The `label` attribute renders a native `label` element bound to the input, which provides an accessible name.
- An external `label` in the light DOM, associated through `for` or by nesting, is resolved through
  `ElementInternals` and projected onto the native input as an element reference. Clicking that label focuses the
  control.
- The helper text and the validation messages are referenced through `aria-describedby`.
- The required, disabled and read-only states come from the native attributes on the inner input.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

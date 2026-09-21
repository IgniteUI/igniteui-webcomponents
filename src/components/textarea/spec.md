# Textarea specification

- [Textarea specification](#textarea-specification)
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
      - [Value binding](#value-binding)
      - [Sizing and resizing](#sizing-and-resizing)
      - [Prefix, suffix and helper text](#prefix-suffix-and-helper-text)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
      - [Validation](#validation)
      - [Form integration](#form-integration)
      - [Text selection and scrolling](#text-selection-and-scrolling)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Defaults](#defaults)
    - [Setting value through attribute and projection](#setting-value-through-attribute-and-projection)
    - [Events](#events-1)
    - [Methods API](#methods-api)
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

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

## Overview

The `igc-textarea` represents a multi-line plain-text editing control, useful when the application needs to collect a
sizeable amount of free-form text - a comment on a review, a description or a feedback form.

The component wraps a native `textarea` inside its shadow root and supports most of the attributes of the native
element, while adding a label, prefix and suffix slots, helper text, theming, declarative validation messages and an
auto-sizing mode.

### Key features

- **Two ways to set the value**: the `value` property/attribute or text projected in the default slot.
- **Auto-sizing**: with `resize="auto"` the control grows and shrinks to fit its content.
- **Composable shell**: label, placeholder, prefix, suffix and helper text, shared with `igc-input`.
- **Constraint validation**: `required`, `minlength` and `maxlength`, with declarative message slots.
- **Validate-only mode**: evaluates `maxLength` without truncating what the end-user can type.
- **Native text behavior**: `wrap`, `spellcheck`, `autocapitalize`, `autocomplete` and `inputmode` are forwarded.
- **Form integration**: submits with the form and restores its default value on reset.
- **Themeable**: default and `outlined` appearances, with shadow parts for every region.

### Acceptance criteria

- The value must be initializable and updatable both through the attribute/property and through text projection.
- The component must participate in form submission and form validation.
- The control must expose the number of visible rows and the resize behavior, including an auto-sizing mode.
- Validation constraints must map to the standard `ValidityState` flags and render the matching message slots.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant, associating the label and the helper text with the native textarea.
- The component must support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- enter text in a multi-line editing field, so I can provide data to a web form or another part of an application.
- see a visual indicator, such as an outline, so I know when the control is focused.
- see different visual states, so I know how to interact with the control.
- read a label, so I can identify the control.
- read helper text, so I get updates about my input such as counters or validation states.
- see an asterisk glyph in the label, so I know that the control is required.
- see prefix and suffix content, so I have more context about the purpose of the control.
- resize the control myself when the application allows it.

### Developer stories

As a developer, I expect to be able to:

- set a **name**, so the control is identifiable in the context of a web form.
- set a **value**, so the control can be programmatically initialized or updated.
- set a **value** by slotting text content in the control.
- set **required**, so the control becomes mandatory in the context of a web form.
- set **minlength** and **maxlength**, so the control validates the length of the provided value.
- set **disabled**, so the control cannot be modified or interacted with.
- set **readonly**, so the control cannot be modified but stays focusable.
- set a **label** and a **placeholder**.
- slot content as a **prefix**/**suffix**, so I can use icons or text as additional visual indication.
- slot content as **helper text**, so I can provide guidance or validation state.
- control the number of visible **rows** and the **resize** behavior, including auto-sizing to the content.
- alter between the filled and **outlined** styles in the context of a Material styled view.
- use the control in a native form.

## Functionality

### End-user experience

[Design hand-off - validation slots](https://www.figma.com/design/IZce3C3yRofmIqPzq634uQ/Input-Group%2C-Checkbox%2C-Radio%3A-validation-proposal?m=auto&node-id=2043-3&t=GExqKFPDIGlTcEs2-1)

The textarea renders a multi-line editing area with an optional floating label, prefix and suffix content, and a
helper text area below it. By default the control is three rows tall and can be resized vertically by the end-user
through the native resize affordance. With `resize="auto"`, the control has no manual affordance and instead grows
and shrinks as the content changes; with `resize="none"` it stays at its configured height.

While the control is invalid, the helper text is replaced by the slotted error messages. Invalid styling is applied
only after the end-user has interacted with the control, or after a form submission attempt.

### Developer experience

#### Basic initialization

```html
<igc-textarea label="Comment"></igc-textarea>
```

#### Value binding

Through the attribute or the property:

```html
<igc-textarea value="Hello"></igc-textarea>
```

Through content projection, like the native element:

```html
<igc-textarea>Hello</igc-textarea>
```

Projected text is joined with line breaks and applied as the value. While the control is still pristine, the
projected text also becomes the `defaultValue`, so it is restored on a form reset. After the end-user has changed the
value, later slot changes update the value directly.

#### Sizing and resizing

```html
<igc-textarea rows="6" resize="none" label="Fixed"></igc-textarea>
<igc-textarea resize="auto" label="Grows with the content"></igc-textarea>
```

| `resize`   | Behavior                                                                        |
| ---------- | ------------------------------------------------------------------------------- |
| `vertical` | Default. The end-user can resize the control vertically.                        |
| `none`     | The control cannot be resized and keeps the height derived from `rows`.         |
| `auto`     | The control resizes itself to fit its content; manual resizing is disabled.     |

Auto-sizing recalculates on value, `rows` and `resize` changes, and whenever the element is resized by its layout.

#### Prefix, suffix and helper text

```html
<igc-textarea label="Your comment">
  <igc-icon slot="prefix" name="write-comment" aria-hidden="true"></igc-icon>
  <span slot="helper-text">Maximum 500 characters</span>
</igc-textarea>
```

#### Labeling from the light DOM

Besides the `label` property, the control can be labelled by a `label` element in the light DOM, either through
`for` or by nesting it:

```html
<label for="external">External label</label>
<igc-textarea id="external"></igc-textarea>

<label>
  External label
  <igc-textarea></igc-textarea>
</label>
```

An IDREF does not cross a shadow boundary, so the association cannot be expressed with an `aria-labelledby`
attribute on the inner native editor. The component resolves its labels through `ElementInternals` and projects them
onto the editor as **element references** (`ariaLabelledByElements`), which do resolve into ancestor tree scopes.
Clicking the external label focuses the control, exactly as for a native element.

Because a reflected relation blanks its content attribute, assert such a relation by identity
(`input.ariaLabelledByElements[0] === label`) rather than by reading the attribute.

#### Validation

```html
<igc-textarea label="Your comment" required minlength="20" maxlength="500">
  <span slot="value-missing">A comment is required</span>
  <span slot="too-short">Please write at least 20 characters</span>
  <span slot="too-long">Please keep the comment under 500 characters</span>
</igc-textarea>
```

With `validate-only`, `maxLength` is evaluated but not enforced on the native element, so the end-user can exceed it
and see the error message instead of being silently truncated. See the
[validation container specification](../validation-container/spec.md) for the full mechanism.

#### Form integration

```html
<form>
  <igc-textarea required name="comment" label="Your comment"></igc-textarea>
  <button type="submit">Submit</button>
</form>
```

- The value is submitted under `name`, wrapped according to the `wrap` property.
- A form reset restores the value to `defaultValue`, taken from the `value` attribute or the projected text.
- An invalid control blocks submission and fires the native `invalid` event.

#### Text selection and scrolling

```ts
const area = document.querySelector('igc-textarea')!;

area.select();
area.setSelectionRange(0, 5);
area.setRangeText('Hi', 0, 5, 'select');
area.scrollTo({ top: 0, behavior: 'smooth' });
```

### Localization

The component renders no built-in strings. The `label`, `placeholder`, helper text and validation messages are
provided by the application and localized by it.

### Keyboard interactions

The component delegates focus to the inner native textarea, so all native text-editing keys apply.

| Key combination  | Result                                                        |
| ---------------- | ------------------------------------------------------------- |
| <kbd>Tab</kbd>   | Moves focus to the control, and away from it.                 |
| <kbd>Enter</kbd> | Inserts a new line. It does not submit the associated form.   |

## API

### Properties and attributes

| Property          | Attribute      | Reflected | Type                        | Default    | Description                                                                 |
| ----------------- | -------------- | --------- | --------------------------- | ---------- | --------------------------------------------------------------------------- |
| value             | value          | No        | `string`                    | `''`       | The value of the component.                                                 |
| label             | label          | No        | `string`                    | -          | The label for the control.                                                  |
| placeholder       | placeholder    | No        | `string`                    | -          | The placeholder text of the control.                                        |
| rows              | rows           | No        | `number`                    | 3          | The number of visible text lines for the control.                           |
| resize            | resize         | No        | `TextareaResize`            | `vertical` | Controls whether the control can be resized. `auto` fits the content.       |
| wrap              | wrap           | No        | `'hard' \| 'soft' \| 'off'` | `soft`     | Indicates how the control should wrap the value for form submission.        |
| outlined          | outlined       | Yes       | `boolean`                   | false      | Whether the control will have outlined appearance.                          |
| readOnly          | readonly       | Yes       | `boolean`                   | false      | Makes the control a readonly field.                                         |
| required          | required       | Yes       | `boolean`                   | false      | Makes the component a required field for validation.                        |
| disabled          | disabled       | Yes       | `boolean`                   | false      | The disabled state of the component.                                        |
| invalid           | invalid        | No        | `boolean`                   | false      | Sets the control into invalid state (visual state only).                    |
| name              | name           | Yes       | `string`                    | -          | The name of the control, submitted with the form data.                      |
| minLength         | minlength      | No        | `number`                    | -          | The minimum number of characters required that the user should enter.       |
| maxLength         | maxlength      | No        | `number`                    | -          | The maximum number of characters that the user can enter.                   |
| validateOnly      | validate-only  | Yes       | `boolean`                   | false      | Evaluates `maxLength` without restricting user input.                       |
| spellcheck        | spellcheck     | No        | `boolean`                   | true       | Controls whether the element may be checked for spelling errors.            |
| autocapitalize    | autocapitalize | No        | `string`                    | -          | Controls whether and how text input is automatically capitalized.           |
| autocomplete      | autocomplete   | No        | `string`                    | -          | A hint for the browser on how to autofill the control.                      |
| inputMode         | inputmode      | No        | `string`                    | -          | Hints at the type of data to be entered, for the virtual keyboard.          |
| defaultValue      | -              | No        | `string`                    | `''`       | The initial value of the control, restored on a form reset.                 |
| form              | -              | No        | `HTMLFormElement \| null`   | -          | Read-only. The form associated with this element.                           |
| validity          | -              | No        | `ValidityState`             | -          | Read-only. The validity state of the element.                               |
| validationMessage | -              | No        | `string`                    | -          | Read-only. The validation message of the element.                           |
| willValidate      | -              | No        | `boolean`                   | -          | Read-only. Whether the element is a candidate for constraint validation.    |

### Methods

| Name              | Type signature                                                                              | Description                                                      |
| ----------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| select            | `(): void`                                                                                  | Selects all text within the control.                             |
| setSelectionRange | `(start: number, end: number, direction?: SelectionRangeDirection): void`                   | Sets the text selection range of the control.                    |
| setRangeText      | `(replacement: string, start: number, end: number, selectMode?: RangeTextSelectMode): void` | Replaces the selected text in the control.                       |
| scrollTo          | `(options?: ScrollToOptions): void` / `(x: number, y: number): void`                        | Scrolls the control to the given position.                       |
| checkValidity     | `(): boolean`                                                                               | Checks validity and emits `invalid` when the control is invalid. |
| reportValidity    | `(): boolean`                                                                               | Checks validity and shows the browser message when invalid.      |
| setCustomValidity | `(message: string): void`                                                                   | Sets a custom message. Invalid while `message` is not empty.     |

### Events

| Name      | Cancellable | Detail   | Description                                                        |
| --------- | ----------- | -------- | ------------------------------------------------------------------ |
| igcInput  | false       | `string` | Emitted when the control receives user input.                      |
| igcChange | false       | `string` | Emitted when a change to the control value is committed by the user. |

### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| (default)       | Text content from the default slot will be used as the value of the component.   |
| `prefix`        | Renders content before the input.                                                |
| `suffix`        | Renders content after input.                                                     |
| `helper-text`   | Renders content below the input.                                                 |
| `value-missing` | Renders content when the required validation fails.                              |
| `too-long`      | Renders content when the maxlength validation fails.                             |
| `too-short`     | Renders content when the minlength validation fails.                             |
| `custom-error`  | Renders content when setCustomValidity(message) is set.                          |
| `invalid`       | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

| Part          | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| `container`   | The main wrapper that holds all main input elements of the textarea. |
| `input`       | The native input element of the textarea.                         |
| `label`       | The native label element of the textarea.                         |
| `prefix`      | The prefix wrapper of the textarea.                               |
| `suffix`      | The suffix wrapper of the textarea.                               |
| `helper-text` | The helper text wrapper of the textarea.                          |

## Test scenarios

The suite lives in [`textarea.spec.ts`](./textarea.spec.ts). It runs in a real browser through `@web/test-runner`, with
`@open-wc/testing` fixtures and assertions, and it reuses the shared harness in
[`src/internals/testing`](../../internals/testing):

| Shared helper | What it contributes |
| ------------- | ------------------- |
| `createFormAssociatedTestBed` | A `form` fixture around the control, exposing `formData`, `submit`, `reset` and `valid`. |
| `runValidationContainerTests` | Generated cases asserting that each validation slot renders for its failing constraint. |
| `runExternalLabelAssociationTests` | External `label` association through `for` and through nesting, plus click-to-focus. |
| `simulateInput / simulateClick / simulateKeyboard` | User interaction driven without real device events. |
| `ValidityHelpers` | Assertions for validity, invalid styling and validation slot presence and content. |
| `isFocused` | Focus assertions that see through shadow roots. |

The groups below mirror the `describe` blocks of the suite.

### Defaults

1. Is accessible (axe audit).
2. Renders the expected layout for the material variant.
3. Auto sizing is applied when `resize="auto"`.
4. The auto sizing height is released when `resize` changes away from `auto`.

### Setting value through attribute and projection

5. Through the `value` attribute.
6. Through default slot projection.
7. Projection takes priority over the attribute binding.
8. The value reflects later slot changes.
9. Issue #1206 - passing `undefined` sets the underlying textarea value to `undefined`.
10. Issue #1686 - dynamic prefix and suffix slot manipulation.
11. The internal input query is correctly recreated after re-renders.

### Events

12. Emits `igcInput`.
13. Emits `igcChange`.

### Methods API

14. `select`.
15. `setSelectionRange`.
16. `setRangeText`.
17. `focus` and `blur`.
18. `scrollTo`.

### Form integration

Driven by `createFormAssociatedTestBed`.

19. Is form associated, and is not associated on submit without a value.
20. Is associated on submit.
21. Is correctly reset on form reset, including after a `setAttribute` call.
22. Reflects the disabled state of an ancestor `fieldset`.
23. Fulfils the required, minimum length, maximum length and custom constraints.

### defaultValue

24. Form integration - correct initial state, correct submission and correct reset.
25. Projected content is treated as the default value, is restored on a form reset, and does not shadow a later
    `defaultValue` assignment.
26. Validation - fails and passes required validation, and fails and passes the minlength and maxlength validation.

### Validation message slots

Generated by `runValidationContainerTests`.

27. `value-missing` with `required`.
28. `too-long` with `maxLength`, and `too-short` with `minLength`.
29. `custom-error` after `setCustomValidity`.
30. `invalid` with `required`.

### External label association

Generated by `runExternalLabelAssociationTests`.

31. An external `label` bound through `for`, and a `label` wrapping the host, are projected onto the native textarea
    as `ariaLabelledByElements`, and clicking it focuses the control.

### Not covered by the suite

The following documented behaviors have no dedicated case yet: the `validateOnly` mode, and the forwarding of
`spellcheck`, `autocapitalize`, `autocomplete` and `inputmode`.
## Accessibility

### ARIA roles and properties

- The encapsulated native `textarea` is the focusable and interactive element; the host delegates focus to it.
- The `label` attribute renders a native `label` element bound to the textarea, which provides an accessible name.
- An external `label` in the light DOM, associated through `for` or by nesting, is resolved through
  `ElementInternals` and projected onto the native textarea as an element reference. Clicking that label focuses
  the control.
- The helper text and the validation messages are referenced through `aria-describedby`.
- The required, disabled and read-only states come from the native attributes on the inner textarea.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The prefix and suffix
positions, the label alignment and the text flow follow the inline direction.

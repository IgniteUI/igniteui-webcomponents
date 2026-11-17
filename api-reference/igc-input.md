# igc-input

A single-line text field to enter and edit data. It supports prefix and
suffix content, helper text, form integration and built-in validation.

```ts
import { defineComponents, IgcInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcInputComponent);
```

## Properties

- `value`: `string`. Attribute: `value`.
  The value of the control.
- `type`: `'number' | 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'`. Default: `'text'`. Attribute: `type`, reflected.
  The type of the control.
- `readOnly`: `boolean`. Default: `false`. Attribute: `readOnly`, reflected.
  Whether the control is read-only.
- `inputMode`: `string`. Attribute: `inputmode`.
  A hint to the browser for which virtual keyboard layout to display.
  See [relevant MDN article](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
- `pattern`: `string | undefined`. Attribute: `pattern`.
  The regular expression the value is validated against.
- `minLength`: `number | undefined`. Attribute: `minlength`.
  The minimum string length required by the control.
- `maxLength`: `number | undefined`. Attribute: `maxlength`.
  The maximum string length of the control.
- `min`: `number | undefined`. Attribute: `min`.
  The minimum value the control accepts.
- `max`: `number | undefined`. Attribute: `max`.
  The maximum value the control accepts.
- `step`: `number | undefined`. Attribute: `step`.
  The granularity the value must adhere to.
- `autofocus`: `boolean`. Attribute: `autofocus`.
  Whether the control receives focus automatically.
- `autocomplete`: `string`. Attribute: `autocomplete`.
  A hint for the browser on how to autofill the control.
- `validateOnly`: `boolean`. Default: `false`. Attribute: `validate-only`, reflected.
  Whether the validation rules apply without restricting user input. The user can type past `maxLength`,
  and the spin buttons of a `number` input can go past `min` and `max`.
- `selectionStart`: `number | null`. Read-only. No attribute.
  The offset of the start of the text selection, in UTF-16 code units.
  Equals `selectionEnd` when no text is selected. `null` before the first
  render and for the `email` and `number` types, which have no selection.
- `selectionEnd`: `number | null`. Read-only. No attribute.
  The offset of the end of the text selection, in UTF-16 code units.
  `null` before the first render and for the `email` and `number` types.
- `required`: `boolean`. Default: `false`. Attribute: `required`, reflected.
  Whether the control is required. A required control that has no value,
  or is not checked, fails validation.
- `defaultValue`: `unknown`. No attribute.
  The default value of the control. A form reset restores the value to it.
  While the value is unchanged since the start or the last form reset, a
  new default also sets the value. The `value` attribute also sets it.
- `name`: `string`. Attribute: `name`, reflected.
  The name of the control, submitted with the form data.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`.
  Whether the control is disabled. A disabled control is not validated,
  and the form does not submit its value.
- `invalid`: `boolean`. Default: `false`. Attribute: `invalid`.
  Whether the control shows the invalid state. It changes only the visual
  state, not the validity.
- `form`: `HTMLFormElement | null`. Read-only. No attribute.
  The form that the control is associated with, or `null`.
- `validity`: `ValidityState`. Read-only. No attribute.
  The validity state of the control.
- `validationMessage`: `string`. Read-only. No attribute.
  The validation message of the control. It is empty when the control is
  valid.
- `willValidate`: `boolean`. Read-only. No attribute.
  Whether the control is a candidate for constraint validation.
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the control has an outlined appearance.
- `placeholder`: `string`. Attribute: `placeholder`.
  The placeholder text of the control.
- `label`: `string`. Attribute: `label`.
  The label for the control.

## Methods

- `setRangeText(replacement: string, start?: number, end?: number, selectMode: RangeTextSelectMode = 'preserve'): void`
  Replaces the text from `start` to `end` in the input. Without `start` and
  `end`, replaces the selected text.
- `setSelectionRange(start?: number, end?: number, direction: SelectionRangeDirection = 'none'): void`
  Sets the text selection range of the control.
- `stepUp(n?: number): void`
  Increments the numeric value of the input by one or more steps.
- `stepDown(n?: number): void`
  Decrements the numeric value of the input by one or more steps.
- `reportValidity(): boolean`
  Checks validity. As for a native control, an invalid control emits
  `invalid` and takes the focus. It shows its own validation messages, not
  the message of the browser. Returns `true` when the control is valid.
- `checkValidity(): boolean`
  Checks validity and emits `invalid` when the control is invalid. Returns
  `true` when the control is valid.
- `setCustomValidity(message: string): void`
  Sets a custom validation message. The control is invalid while the
  message is not empty. An empty string removes the custom error.
- `select(): void`
  Selects all the text inside the input.
- `focus(options?: FocusOptions): void`
  Sets focus on the control.
- `blur(): void`
  Removes focus from the control.

## Events

- `igcInput`
  Emitted when the control input receives user input.
- `igcChange`
  Emitted when the value of the control is committed.

## Slots

- `prefix`: Renders content before the input.
- `suffix`: Renders content after the input.
- `helper-text`: Renders content below the input.
- `value-missing`: Renders content when the required validation fails.
- `type-mismatch`: Renders content when the url/email type validation fails.
- `pattern-mismatch`: Renders content when the pattern validation fails.
- `too-long`: Renders content when the maxlength validation fails.
- `too-short`: Renders content when the minlength validation fails.
- `range-overflow`: Renders content when the max validation fails.
- `range-underflow`: Renders content when the min validation fails.
- `step-mismatch`: Renders content when the step validation fails.
- `custom-error`: Renders content when a custom message is set with `setCustomValidity()`.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).

## CSS parts

- `container`: The main wrapper that holds all main input elements.
- `input`: The native input element.
- `label`: The native label element.
- `prefix`: The prefix wrapper.
- `suffix`: The suffix wrapper.
- `helper-text`: The helper text wrapper.
- `prefixed`: Added to the container and the input when an element that is not hidden is in the prefix slot.
- `suffixed`: Added to the container and the input when an element that is not hidden is in the suffix slot.
- `filled`: Added to the container and the input when the control has a value.
- `labelled`: Added to the container in the material theme when the control has a label.
- `start`: The wrapper of the prefix in the material theme.
- `notch`: The wrapper of the label in the material theme.
- `filler`: The outline segment between the notch and the end in the material theme.
- `end`: The wrapper of the suffix in the material theme.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

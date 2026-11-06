# igc-textarea

A multi-line plain-text field for a large amount of free-form text,
for example a comment in a review or feedback form.

```ts
import { defineComponents, IgcTextareaComponent } from 'igniteui-webcomponents';

defineComponents(IgcTextareaComponent);
```

## Properties

- `autocomplete`: `string`. Attribute: `autocomplete`.
  A hint for the browser on how to autofill the control.
  Refer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.
- `autocapitalize`: `string`. Attribute: `autocapitalize`.
  Whether and how the browser capitalizes the text that the user enters.

  [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
- `inputMode`: `string`. Attribute: `inputmode`.
  A hint to the browser for which virtual keyboard layout to display.

  [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
- `label`: `string`. Attribute: `label`.
  The label for the control.
- `maxLength`: `number`. Attribute: `maxlength`.
  The maximum number of characters (UTF-16 code units) that the user can enter.
  If this value isn't specified, the user can enter an unlimited number of characters.
- `minLength`: `number`. Attribute: `minlength`.
  The minimum number of characters (UTF-16 code units) that the value must have.
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the control has an outlined appearance.
- `placeholder`: `string`. Attribute: `placeholder`.
  The placeholder text of the control.
- `readOnly`: `boolean`. Default: `false`. Attribute: `readonly`, reflected.
  Whether the control is read-only.
- `resize`: `'vertical' | 'none' | 'auto'`. Default: `'vertical'`. Attribute: `resize`.
  How the user can resize the control.
  With `auto`, the height of the control fits its content and the resize handle is hidden.
- `rows`: `number`. Default: `3`. Attribute: `rows`.
  The number of visible text lines of the control. As in the native textarea, a value
  less than 1 shows 2 lines.
- `value`: `string`. Attribute: `value`.
  The value of the component.
- `spellcheck`: `boolean`. Default: `true`. Attribute: `spellcheck`.
  Whether the browser checks the spelling of the value. As for the native attribute,
  only the `"false"` attribute value turns the check off.
- `wrap`: `'hard' | 'soft' | 'off'`. Default: `'soft'`. Attribute: `wrap`.
  How the control wraps long lines of text. With `off`, the lines do not wrap.
  Unlike the native element, `hard` does not add line breaks to the submitted value.
  Refer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)
  for explanation of the available values.
- `validateOnly`: `boolean`. Default: `false`. Attribute: `validate-only`, reflected.
  Whether the validation rules apply without restricting user input. The user can type past `maxLength`.
- `selectionStart`: `number`. Read-only. No attribute.
  The offset of the start of the text selection, in UTF-16 code units.
  Equals `selectionEnd` when no text is selected.
- `selectionEnd`: `number`. Read-only. No attribute.
  The offset of the end of the text selection, in UTF-16 code units.
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

## Methods

- `focus(options?: FocusOptions): void`
  Sets focus on the control.
- `blur(): void`
  Removes focus from the control.
- `select(): void`
  Selects all text within the control.
- `setSelectionRange(start: number, end: number, direction: SelectionRangeDirection = 'none'): void`
  Sets the text selection range of the control.
- `setRangeText(replacement: string, start?: number, end?: number, selectMode: RangeTextSelectMode = 'preserve'): void`
  Replaces the text from `start` to `end` in the control. Without `start` and
  `end`, replaces the selected text.
- `scrollTo(options?: ScrollToOptions | undefined): void`
  Scrolls the text of the control to the given position.
- `scrollTo(x: number, y: number): void`
  Scrolls the text of the control to the given `x` and `y` coordinates.
- `scrollTo(x?: unknown, y?: unknown): void`
  Scrolls the text of the control to the given position.
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

## Events

- `igcInput`
  Emitted when the control receives user input.
- `igcChange`
  Emitted when a change to the control value is committed by the user.

## Slots

- default: The text content of the default slot sets the value of the component.
- `prefix`: Renders content before the input.
- `suffix`: Renders content after the input.
- `helper-text`: Renders content below the input.
- `value-missing`: Renders content when the required validation fails.
- `too-long`: Renders content when the maxlength validation fails.
- `too-short`: Renders content when the minlength validation fails.
- `custom-error`: Renders content when a custom message is set with `setCustomValidity()`.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).

## CSS parts

- `container`: The main wrapper that holds all main input elements of the textarea.
- `input`: The native textarea element.
- `label`: The native label element of the textarea.
- `prefix`: The prefix wrapper of the textarea.
- `suffix`: The suffix wrapper of the textarea.
- `helper-text`: The helper text wrapper of the textarea.
- `prefixed`: Added to the container when an element that is not hidden is in the prefix slot.
- `suffixed`: Added to the container when an element that is not hidden is in the suffix slot.
- `filled`: Added to the container when the textarea has a value.
- `placeholder`: Added to the container in the material theme when the textarea has a placeholder.
- `labelled`: Added to the container in the material theme when the control has a label.
- `start`: The wrapper of the prefix in the material theme.
- `notch`: The wrapper of the label in the material theme.
- `filler`: The outline segment between the notch and the end in the material theme.
- `end`: The wrapper of the suffix in the material theme.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

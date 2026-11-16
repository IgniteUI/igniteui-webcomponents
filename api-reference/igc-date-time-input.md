# igc-date-time-input

An input field to enter and edit a date and time value, with configurable input and display formats.

```ts
import { defineComponents, IgcDateTimeInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcDateTimeInputComponent);
```

## Properties

- `value`: `T | null`. Attribute: `value`.
  The value of the input.

  Only ever holds a committed value. While the user is typing, the intermediate
  state lives in the masked text and is committed - together with an `igcChange`
  event - when the edit is committed on blur. Use the `igcInput` event to observe
  the value as it is being typed.
- `readOnly`: `boolean`. Default: `false`. Attribute: `readOnly`, reflected.
  Whether the control is read-only. The user cannot change its value.
- `mask`: `string`. Attribute: `mask`.
  The mask pattern of the component.
- `prompt`: `string`. Default: `'_'`. Attribute: `prompt`.
  The prompt symbol for the unfilled parts of the mask pattern.
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
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the control has an outlined appearance.
- `placeholder`: `string`. Attribute: `placeholder`.
  The placeholder text of the control.
- `label`: `string`. Attribute: `label`.
  The label for the control.
- `inputFormat`: `string`. Attribute: `input-format`.
  The date format of the input while the user edits the value.
  Without it, the input uses the input format of the locale.
- `min`: `Date | null`. Attribute: `min`.
  The minimum value required for the input to remain valid.
- `max`: `Date | null`. Attribute: `max`.
  The maximum value required for the input to remain valid.
- `displayFormat`: `string`. Attribute: `display-format`.
  The format of the value while the input does not have focus.
  Without it, the input uses `inputFormat` when set, else the display format of the locale.
- `spinDelta`: `DatePartDeltas | undefined`. No attribute.
  The amount by which a step action increments or decrements each date part.
  All values default to `1`.
- `spinLoop`: `boolean`. Default: `true`. Attribute: `spin-loop`.
  Whether a spun date part wraps around at its limits.
  When false, the part stops at its minimum or maximum.
- `locale`: `string`. Attribute: `locale`.
  The locale used to format the display value. Without it, the input takes
  its own `lang`, else the locale of the nearest ancestor that has a
  `locale` (a component) or a `lang`, and then the global locale.

## Methods

- `stepUp(datePart?: DatePart, delta?: number): void`
  Increments a date or time part by `delta`, or by its `spinDelta` value.
  Without `datePart`, it changes the part at the cursor or a default part.
  The `value` updates at once.
- `stepDown(datePart?: DatePart, delta?: number): void`
  Decrements a date or time part by `delta`, or by its `spinDelta` value.
  Without `datePart`, it changes the part at the cursor or a default part.
  The `value` updates at once.
- `select(): void`
  Selects all the text inside the input.
- `setSelectionRange(start?: number, end?: number, direction: SelectionRangeDirection = 'none'): void`
  Sets the text selection range of the control.
- `setRangeText(replacement: string, start?: number, end?: number, selectMode?: RangeTextSelectMode): void`
  Replaces the text from `start` to `end` and applies the mask again.
  Without `start` and `end`, it replaces the selected text. `selectMode`
  sets the selection after the change.
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
- `focus(options?: FocusOptions): void`
  Sets focus on the control.
- `blur(): void`
  Removes focus from the control.
- `clear(): void`
  Clears the value and the text of the input.
- `hasDateParts(): boolean`
  Returns whether the input format has a date part: day, month or year.
- `hasTimeParts(): boolean`
  Returns whether the input format has a time part: hours, minutes or seconds.

## Events

- `igcInput`
  Emitted when the control input receives user input.
- `igcChange`
  Emitted on blur, when the committed value differs from the one the editor was focused with.

## Slots

- `prefix`: Renders content before the input.
- `suffix`: Renders content after the input.
- `helper-text`: Renders content below the input.
- `value-missing`: Renders content when the required validation fails.
- `range-overflow`: Renders content when the max validation fails.
- `range-underflow`: Renders content when the min validation fails.
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
- `filled`: Added to the container and the input unless the focused input shows only the empty mask.
- `labelled`: Added to the container in the material theme when the control has a label.
- `start`: The wrapper of the prefix in the material theme.
- `notch`: The wrapper of the label in the material theme.
- `filler`: The outline segment between the notch and the end in the material theme.
- `end`: The wrapper of the suffix in the material theme.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

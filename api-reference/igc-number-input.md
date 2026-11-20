# igc-number-input

A single-line field for a number. It shows the value formatted for the
locale, reads what the user types in the locale, and steps the value with
the arrow keys, the spin buttons and the mouse wheel. It supports prefix and
suffix content, helper text, form integration and built-in validation.

```ts
import { defineComponents, IgcNumberInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcNumberInputComponent);
```

## Properties

- `value`: `number | null`. Attribute: `value`.
  The value of the control, or `null` when it is empty. A numeric string
  reads as `Number()` reads it. `NaN` and infinite values are `null`.
- `min`: `number | undefined`. Attribute: `min`.
  The minimum value of the control. A numeric string reads as a number, and
  a value that is not a finite number sets no minimum.
- `max`: `number | undefined`. Attribute: `max`.
  The maximum value of the control. A numeric string reads as a number, and
  a value that is not a finite number sets no maximum.
- `step`: `number | undefined`. Attribute: `step`.
  The amount by which a step changes the value. A step does not snap to a
  grid of steps. Default is `1`, or `0.01` for the `percent` style, also for
  a value that is not a positive number. A numeric string reads as a number.
- `valueFormatOptions`: `NumberInputFormatOptions | undefined`. No attribute.
  The format of the value: the options of `Intl.NumberFormat` that the
  control can read back, such as a currency, a percent or the number of
  fraction digits. A committed value rounds to the shown fraction digits.
- `hideSpinButtons`: `boolean`. Default: `false`. Attribute: `hide-spin-buttons`.
  Whether the spin buttons are hidden. The keys and the mouse wheel still
  step the value.
- `validateOnly`: `boolean`. Default: `false`. Attribute: `validate-only`.
  Whether a value out of range only fails validation. The user can type it,
  and the commit does not clamp it. A step still stops at `min` and `max`.
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the control has an outlined appearance.
- `readOnly`: `boolean`. Default: `false`. Attribute: `readonly`, reflected.
  Whether the control is read-only.
- `placeholder`: `string | undefined`. Attribute: `placeholder`.
  The placeholder text of the control.
- `label`: `string | undefined`. Attribute: `label`.
  The label for the control.
- `autofocus`: `boolean`. Default: `false`. Attribute: `autofocus`.
  Whether the control receives focus automatically.
- `autocomplete`: `string | undefined`. Attribute: `autocomplete`.
  A hint for the browser on how to autofill the control.
- `inputMode`: `string`. Default: `''`. Attribute: `inputmode`.
  A hint to the browser for which virtual keyboard layout to display. Default
  is `numeric` for a format without fraction digits and without negative
  values, else `decimal`.
- `defaultValue`: `number | null`. No attribute.
  The default value of the control. A form reset restores the value to it.
  While the value is unchanged since the start or the last form reset, a
  new default also sets the value. The `value` attribute also sets it.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<INumberInputResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.
- `required`: `boolean`. Default: `false`. Attribute: `required`, reflected.
  Whether the control is required. A required control that has no value,
  or is not checked, fails validation.
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

- `stepUp(n?: number): void`
  Increments the value by `n` steps, 1 by default. A step stops at `max`.
- `stepDown(n?: number): void`
  Decrements the value by `n` steps, 1 by default. A step stops at `min`.
- `select(): void`
  Focuses the control and selects all the text inside the input.
- `focus(options?: FocusOptions): void`
  Sets focus on the control.
- `blur(): void`
  Removes focus from the control.
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
  Emitted when the user changes the value.
- `igcChange`
  Emitted when the user commits a changed value, on Enter or when the control loses focus.

## Slots

- `prefix`: Renders content before the input.
- `suffix`: Renders content after the input.
- `helper-text`: Renders content below the input.
- `increment-icon`: Renders the icon of the increment button.
- `decrement-icon`: Renders the icon of the decrement button.
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
- `suffixed`: Added to the container and the input when an element that is not hidden is in the suffix slot, or while the spin buttons show.
- `filled`: Added to the container and the input when the control has text.
- `spin-buttons`: The wrapper of the spin buttons, at the end of the suffix wrapper.
- `increment`: The button that increments the value.
- `decrement`: The button that decrements the value.
- `labelled`: Added to the container in the material theme when the control has a label.
- `start`: The wrapper of the prefix in the material theme.
- `notch`: The wrapper of the label in the material theme.
- `filler`: The outline segment between the notch and the end in the material theme.
- `end`: The wrapper of the suffix in the material theme.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

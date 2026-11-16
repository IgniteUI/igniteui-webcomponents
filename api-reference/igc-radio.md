# igc-radio

Lets the user select one option from a set. Radios with the same `name`
form a group, and only one radio of the group is checked.

```ts
import { defineComponents, IgcRadioComponent } from 'igniteui-webcomponents';

defineComponents(IgcRadioComponent);
```

## Properties

- `required`: `boolean`. Default: `false`. Attribute: `required`, reflected.
  Whether the group of the radio is required. A required group fails
  validation while none of its radios is checked.
- `value`: `string`. Attribute: `value`.
  The value of the control, submitted when the control is checked.
- `checked`: `boolean`. Attribute: `checked`.
  Whether the control is checked. A checked radio clears the other radios
  of its group.
- `labelPosition`: `'after' | 'before'`. Default: `'after'`. Attribute: `label-position`, reflected.
  The label position of the radio control.
- `defaultChecked`: `boolean`. No attribute.
  Whether the control is checked by default. A form reset restores the
  checked state to it. While the checked state is unchanged since the
  start or the last form reset, a new default also sets the checked state.
  The `checked` attribute also sets it.
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

- `click(): void`
  Simulates a click on the radio control.
- `focus(options?: FocusOptions): void`
  Sets focus on the radio control.
- `blur(): void`
  Removes focus from the radio control.
- `checkValidity(): boolean`
  Checks the validity of the whole group. Each invalid radio of the group
  emits `invalid`.
- `reportValidity(): boolean`
  Checks the validity of the group. An invalid radio emits `invalid` and
  takes the focus. It shows its own validation messages, not the message of
  the browser.
- `setCustomValidity(message: string): void`
  Sets a custom validation message on every radio of the group. The radios
  are invalid while `message` is not empty.

## Events

- `igcChange`
  Emitted when the checked state of the control changes by user interaction.

## Slots

- default: The radio label.
- `helper-text`: Renders content below the input.
- `value-missing`: Renders content when the required validation fails.
- `custom-error`: Renders content when setCustomValidity(message) is set.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).

## CSS parts

- `base`: The radio control base wrapper.
- `control`: The circle of the radio.
- `label`: The radio control label.
- `ripple`: The highlight around the circle on hover and focus. A disabled radio hides it.
- `checked`: Added to the base, control, label and ripple parts when the radio is checked.
- `focused`: Added to the base part when the radio has keyboard focus.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. In a radio group, only the last radio keeps the space. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

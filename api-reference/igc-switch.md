# igc-switch

Similar to a checkbox, a switch controls the state of a single setting on or off.

```ts
import { defineComponents, IgcSwitchComponent } from 'igniteui-webcomponents';

defineComponents(IgcSwitchComponent);
```

## Properties

- `required`: `boolean`. Default: `false`. Attribute: `required`, reflected.
  Whether the control is required. A required control that has no value,
  or is not checked, fails validation.
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
- `value`: `string`. Attribute: `value`.
  The value of the control, submitted when the control is checked.
- `checked`: `boolean`. Attribute: `checked`.
  Whether the control is checked.
- `labelPosition`: `'after' | 'before'`. Default: `'after'`. Attribute: `label-position`, reflected.
  The label position of the control.

## Methods

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
- `click(): void`
  Simulates a click on the control.
- `focus(options?: FocusOptions): void`
  Sets focus on the control.
- `blur(): void`
  Removes focus from the control.

## Events

- `igcChange`
  Emitted when the checked state of the control changes by user interaction.

## Slots

- default: The switch label.

## CSS parts

- `base`: The base wrapper of the switch.
- `control`: The track of the switch. It holds the thumb.
- `thumb`: The position indicator of the switch.
- `label`: The switch label.
- `checked`: Added to the base, control, label and thumb parts when the switch is checked.
- `focused`: Added to the control part when the switch has keyboard focus.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

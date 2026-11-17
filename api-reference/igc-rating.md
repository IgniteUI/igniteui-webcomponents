# igc-rating

A rating component that allows users to view and provide ratings using customizable symbols.
It supports fractional values, hover previews, keyboard navigation, single-selection mode,
and integrates with forms as a number input.

```ts
import { defineComponents, IgcRatingComponent } from 'igniteui-webcomponents';

defineComponents(IgcRatingComponent);
```

## Properties

- `max`: `number`. Default: `5`. Attribute: `max`.
  The maximum value for the rating.

  With projected symbols, the maximum value is the number of symbols. A
  maximum below the value also lowers the value.
- `step`: `number`. Default: `1`. Attribute: `step`.
  The minimum value change allowed.

  Valid values are in the interval between 0.001 and 1 inclusive.
  The component clamps a value outside of the interval to the closest bound.
  In single selection mode, the step is always 1.
- `label`: `string | undefined`. Attribute: `label`.
  The label of the control.
- `valueFormat`: `string | undefined`. Attribute: `value-format`.
  The format of the `aria-valuetext` of the rating. `{0}` stands for the
  value and `{1}` for the maximum value.

  Use it for screen readers and for localization.
- `value`: `number`. Default: `0`. Attribute: `value`.
  The value of the rating, clamped between 0 and `max`.
- `hoverPreview`: `boolean`. Default: `false`. Attribute: `hover-preview`, reflected.
  Whether to show a preview of the value when hovering over the symbols.
- `readOnly`: `boolean`. Default: `false`. Attribute: `readonly`, reflected.
  Whether the rating is read-only. A read-only rating shows its value but
  ignores user input.
- `single`: `boolean`. Default: `false`. Attribute: `single`, reflected.
  Whether only the symbol at the value is full, instead of all symbols up
  to it. It also sets `step` to 1 and rounds the value up.
- `allowReset`: `boolean`. Default: `false`. Attribute: `allow-reset`, reflected.
  Whether to reset the rating when the user selects the same value.
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

- `stepUp(n = 1): void`
  Increments the value of the control by `n` steps multiplied by the
  step factor.
- `stepDown(n = 1): void`
  Decrements the value of the control by `n` steps multiplied by
  the step factor.
- `focus(options?: FocusOptions): void`
  Sets focus on the rating. A disabled rating does not take the focus.
- `blur(): void`
  Removes focus from the rating.
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

- `igcChange`
  Emitted when the user changes the value.
- `igcHover`
  Emitted when the pointer moves to a new value over the symbols while `hoverPreview` is set.

## Slots

- `symbol`: Slot for projecting custom rating symbol elements. When used, the number of symbols determines the `max` value.
- `value-label`: Renders content after the symbols, such as the value as text.

## CSS parts

- `base`: The main wrapper which holds the symbols and the value label.
- `label`: The label of the rating.
- `value-label`: The wrapper of the `value-label` slot.
- `symbols`: A wrapper for all rating symbols.
- `symbol`: The part of the encapsulated default symbol.
- `full`: The part of the encapsulated full symbols.
- `empty`: The part of the encapsulated empty symbols.

## CSS custom properties

- `--symbol-size`: The size of the symbols.
- `--symbol-full-color`: The color of the filled symbol.
- `--symbol-empty-color`: The color of the empty symbol.
- `--symbol-full-filter`: The filter(s) applied to projected full symbols, other than icons, when the rating is disabled.
- `--symbol-empty-filter`: The filter(s) applied to projected empty symbols, other than icons, when the rating is disabled.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

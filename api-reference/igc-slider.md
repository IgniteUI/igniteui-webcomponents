# igc-slider

A slider component used to select a numeric value within a range.

```ts
import { defineComponents, IgcSliderComponent } from 'igniteui-webcomponents';

defineComponents(IgcSliderComponent);
```

## Properties

- `value`: `number`. Attribute: `value`.
  The current value of the component.
- `defaultValue`: `unknown`. No attribute.
  The default value of the control. A form reset restores the value to it.
  While the value is unchanged since the start or the last form reset, a
  new default also sets the value. The `value` attribute also sets it.
- `name`: `string`. Attribute: `name`, reflected.
  The name of the control, submitted with the form data.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
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
- `min`: `number`. Attribute: `min`.
  The minimum value of the slider scale. Defaults to 0.

  If `min` is greater than `max`, the update keeps the previous `min`. The
  update checks the values after all of them are set, so the order of the
  attributes has no effect.

  With slider labels in the default slot, `min` is always 0.

  If `lowerBound` is less than `min`, the slider uses `min` as the lower bound.
- `max`: `number`. Attribute: `max`.
  The maximum value of the slider scale. Defaults to 100.

  If `max` is less than `min`, the update keeps the previous `max`. The
  update checks the values after all of them are set, so the order of the
  attributes has no effect.

  With slider labels in the default slot, `max` is always the number of
  labels minus one.

  If `upperBound` is greater than `max`, the slider uses `max` as the upper bound.
- `lowerBound`: `number`. Attribute: `lower-bound`.
  The lower bound of the slider value. If not set, the `min` value is applied.
- `upperBound`: `number`. Attribute: `upper-bound`.
  The upper bound of the slider value. If not set, the `max` value is applied.
- `discreteTrack`: `boolean`. Default: `false`. Attribute: `discrete-track`.
  Whether the track shows the steps. It has no effect when `step` is 0.
- `hideTooltip`: `boolean`. Default: `false`. Attribute: `hide-tooltip`.
  Whether the thumb tooltip is hidden.
- `step`: `number`. Default: `1`. Attribute: `step`.
  The interval between two valid values, counted from `min`.

  If set to 0 no stepping is implied and any value in the range is allowed.
  A negative step is not valid, so the previous step stays.
  With slider labels in the default slot, the step is always 1.
- `primaryTicks`: `number`. Default: `0`. Attribute: `primary-ticks`.
  The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.
- `secondaryTicks`: `number`. Default: `0`. Attribute: `secondary-ticks`.
  The number of secondary ticks between two primary ticks. Without primary
  ticks, it is the total number of ticks. The default 0 shows no secondary ticks.
- `tickOrientation`: `'start' | 'end' | 'mirror'`. Default: `'end'`. Attribute: `tick-orientation`.
  Where the ticks are drawn: before the track (`start`), after it (`end`),
  or on both sides (`mirror`).
- `hidePrimaryLabels`: `boolean`. Default: `false`. Attribute: `hide-primary-labels`.
  Whether the labels of the primary ticks are hidden.
- `hideSecondaryLabels`: `boolean`. Default: `false`. Attribute: `hide-secondary-labels`.
  Whether the labels of the secondary ticks are hidden.
- `locale`: `string`. Default: `'en'`. Attribute: `locale`.
  The locale used to format the thumb and tick label values in the slider.
- `valueFormat`: `string | undefined`. Attribute: `value-format`.
  String format used for the thumb and tick label values in the slider.
  The `{0}` placeholder holds the formatted number.
- `valueFormatOptions`: `Intl.NumberFormatOptions | undefined`. No attribute.
  Number format options used for the thumb and tick label values in the slider.
- `tickLabelRotation`: `0 | 90 | -90`. Default: `0`. Attribute: `tick-label-rotation`, reflected.
  The degrees for the rotation of the tick labels. Defaults to 0.

## Methods

- `stepUp(stepIncrement = 1): void`
  Increments the value of the slider by `stepIncrement * step`, where `stepIncrement` defaults to 1.
- `stepDown(stepDecrement = 1): void`
  Decrements the value of the slider by `stepDecrement * step`, where `stepDecrement` defaults to 1.
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
  Sets focus on the thumb, or on the lower thumb of a range slider. A thumb
  that has the focus keeps it. A disabled slider does not take the focus.
- `blur(): void`
  Removes focus from the thumb.

## Events

- `igcInput`
  Emitted when a value is changed via thumb drag or keyboard interaction.
- `igcChange`
  Emitted when a value change is committed on a thumb drag end or keyboard interaction.

## Slots

- default: Renders slider labels. Their text replaces the numbers in the thumb and tick labels.

## CSS parts

- `base`: The base wrapper of the slider.
- `ticks`: The ticks container.
- `tick-group`: The tick group container.
- `tick`: The tick element.
- `tick-label`: The tick label element.
- `tick-label-inner`: The inner element of the tick label.
- `thumbs`: The thumbs container.
- `thumb`: The thumb element.
- `focused`: Added to the thumb part when the thumb has keyboard focus.
- `thumb-label`: The thumb tooltip label container.
- `thumb-label-inner`: The thumb tooltip label inner element.
- `track`: The track container.
- `steps`: The track steps element.
- `inactive`: The inactive element of the track.
- `fill`: The filled part of the track.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

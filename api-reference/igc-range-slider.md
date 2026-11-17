# igc-range-slider

A range slider component used to select two numeric values within a range.

```ts
import { defineComponents, IgcRangeSliderComponent } from 'igniteui-webcomponents';

defineComponents(IgcRangeSliderComponent);
```

## Properties

- `lower`: `number`. Attribute: `lower`.
  The current value of the lower thumb.
- `upper`: `number`. Attribute: `upper`.
  The current value of the upper thumb. Until it is set, and after the
  attribute is removed, it follows `upperBound`.
- `thumbLabelLower`: `string`. Attribute: `thumb-label-lower`.
  The accessible name of the lower thumb.
- `thumbLabelUpper`: `string`. Attribute: `thumb-label-upper`.
  The accessible name of the upper thumb.
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
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the slider is disabled. A disabled slider ignores user interaction.
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

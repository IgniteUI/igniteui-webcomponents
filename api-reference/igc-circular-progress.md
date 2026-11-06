# igc-circular-progress

A circular progress indicator used to express unspecified wait time or display
the length of a process.

```ts
import { defineComponents, IgcCircularProgressComponent } from 'igniteui-webcomponents';

defineComponents(IgcCircularProgressComponent);
```

## Properties

- `max`: `number`. Default: `100`. Attribute: `max`.
  The maximum value of the control.
- `value`: `number`. Default: `0`. Attribute: `value`.
  The value of the control.
- `variant`: `'primary' | 'info' | 'success' | 'warning' | 'danger'`. Default: `'primary'`. Attribute: `variant`, reflected.
  The variant of the control.
- `animationDuration`: `number`. Default: `500`. Attribute: `animation-duration`.
  The duration of the fill animation in milliseconds.
- `indeterminate`: `boolean`. Default: `false`. Attribute: `indeterminate`.
  Whether the progress is indeterminate. An indeterminate progress has no
  value and does not show the default label.
- `hideLabel`: `boolean`. Default: `false`. Attribute: `hide-label`.
  Whether the default label is hidden.
- `labelFormat`: `string`. Attribute: `label-format`.
  Format string for the default label of the control.
  Placeholders:
   {0} - current value of the control.
   {1} - max value of the control.

## Slots

- default: Custom label content. A slotted element replaces the default label.
- `gradient`: The gradient stops of the fill. Accepts circular gradient elements.

## CSS parts

- `base`: The wrapper of the circular progress.
- `svg`: The circular progress SVG element.
- `gradient_start`: The circular progress linear-gradient start color.
- `gradient_end`: The circular progress linear-gradient end color.
- `track`: The circular progress ring track area.
- `fill`: The circular progress indicator area.
- `label`: The circular progress label.
- `value`: The circular progress label value.
- `indeterminate`: Added to the SVG and track parts while the progress is indeterminate.
- `counter`: Added to the label value while it shows the default percentage text.
- `fraction`: Added to the label value when the percentage has a fractional part.

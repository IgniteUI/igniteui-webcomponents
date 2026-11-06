# igc-linear-progress

A linear progress indicator used to express unspecified wait time or display
the length of a process.

```ts
import { defineComponents, IgcLinearProgressComponent } from 'igniteui-webcomponents';

defineComponents(IgcLinearProgressComponent);
```

## Properties

- `striped`: `boolean`. Default: `false`. Attribute: `striped`, reflected.
  Whether the fill of the control is striped.
- `labelAlign`: `'bottom' | 'top' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'`. Default: `'top-start'`. Attribute: `label-align`, reflected.
  The position for the default label of the control.
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

## CSS parts

- `base`: The wrapper of the linear progress.
- `track`: The linear progress track area.
- `fill`: The linear progress indicator area.
- `secondary`: Added to the second fill element, which the indeterminate animation uses.
- `striped`: Added to the fill parts when the progress is striped.
- `label`: The linear progress label.
- `value`: The linear progress label value.
- `indeterminate`: Added to the fill parts while the progress is indeterminate.
- `primary`: Added to the fill parts when the variant is `primary`.
- `danger`: Added to the fill parts when the variant is `danger`.
- `warning`: Added to the fill parts when the variant is `warning`.
- `info`: Added to the fill parts when the variant is `info`.
- `success`: Added to the fill parts when the variant is `success`.
- `counter`: Added to the label value while it shows the default percentage text.
- `fraction`: Added to the label value when the percentage has a fractional part.

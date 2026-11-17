# igc-stepper

A stepper component that provides a wizard-like workflow by dividing content into logical steps.

```ts
import { defineComponents, IgcStepperComponent } from 'igniteui-webcomponents';

defineComponents(IgcStepperComponent);
```

## Properties

- `steps`: `readonly IgcStepComponent[]`. Read-only. No attribute.
  The steps of the stepper.
- `orientation`: `'horizontal' | 'vertical'`. Default: `'horizontal'`. Attribute: `orientation`, reflected.
  The orientation of the stepper.
- `stepType`: `'full' | 'indicator' | 'title'`. Default: `'full'`. Attribute: `step-type`, reflected.
  The visual type of the steps.
- `linear`: `boolean`. Default: `false`. Attribute: `linear`, reflected.
  Whether the stepper is linear.
- `contentTop`: `boolean`. Default: `false`. Attribute: `content-top`, reflected.
  Whether the content is displayed above the steps. Applies only to the
  horizontal orientation.
- `verticalAnimation`: `'fade' | 'none' | 'grow'`. Default: `'grow'`. Attribute: `vertical-animation`.
  The animation type when in vertical mode.
- `horizontalAnimation`: `'slide' | 'fade' | 'none'`. Default: `'slide'`. Attribute: `horizontal-animation`.
  The animation type when in horizontal mode.
- `animationDuration`: `number`. Default: `320`. Attribute: `animation-duration`.
  The animation duration in either vertical or horizontal mode in milliseconds.
- `titlePosition`: `'bottom' | 'top' | 'start' | 'end' | 'auto'`. Default: `'auto'`. Attribute: `title-position`.
  The position of the steps title.

## Methods

- `navigateTo(index: number): void`
  Activates the step at a given index. Does nothing for a disabled step.
- `next(): void`
  Activates the next enabled step.
- `prev(): void`
  Activates the previous enabled step.
- `reset(): void`
  Resets the stepper to its initial state and activates the first enabled step.

## Events

- `igcActiveStepChanging`
  Emitted when the active step is about to change. Cancelable.
- `igcActiveStepChanged`
  Emitted after the active step has changed.

## Slots

- default: Renders the steps of the stepper inside the default slot.

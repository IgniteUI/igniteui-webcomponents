# igc-step

A step component used within a stepper to represent an individual step in a wizard-like workflow.

```ts
import { defineComponents, IgcStepComponent } from 'igniteui-webcomponents';

defineComponents(IgcStepComponent);
```

## Properties

- `invalid`: `boolean`. Default: `false`. Attribute: `invalid`, reflected.
  Whether the step is invalid.

  A visited step that is not active shows an error state. In linear mode,
  the user cannot open the steps after an invalid step.
- `active`: `boolean`. Default: `false`. Attribute: `active`, reflected.
  Whether the step is active.

  Active steps are styled with an active state and their content is visible.
  Setting it activates the step at once, also a disabled step, so of several
  steps set in one task, the last one is active.
- `optional`: `boolean`. Default: `false`. Attribute: `optional`, reflected.
  Whether the step is optional.

  In linear mode, an invalid optional step does not block the steps after it.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the step is disabled.

  Disabled steps are styled with a disabled state and are not interactive.
- `complete`: `boolean`. Default: `false`. Attribute: `complete`, reflected.
  Whether the step is completed.

## Slots

- default: Renders the content of the step.
- `indicator`: Renders the indicator of the step. By default, it displays the step index + 1.
- `title`: Renders the title of the step.
- `subtitle`: Renders the subtitle of the step.

## CSS parts

- `header-container`: Wrapper of the step's `header` and its separators.
- `disabled`: Indicates a disabled state. Applies to `header-container`.
- `complete-start`: Indicates a complete state of the current step. Applies to `header-container`.
- `complete-end`: Indicates a complete state of the previous step. Applies to `header-container`.
- `optional`: Indicates an optional state. Applies to `header-container`.
- `invalid`: Indicates an invalid state. Applies to `header-container`.
- `top`: Indicates that the title is above the indicator. Applies to `header-container`.
- `bottom`: Indicates that the title is below the indicator. Applies to `header-container`.
- `start`: Indicates that the title is before the indicator. Applies to `header-container`.
- `end`: Indicates that the title is after the indicator. Applies to `header-container`.
- `header`: Wrapper of the step's `indicator` and `text`.
- `indicator`: The indicator of the step.
- `text`: Wrapper of the step's `title` and `subtitle`.
- `empty`: Indicates that the step shows no title and subtitle. Applies to `text`.
- `title`: The title of the step.
- `subtitle`: The subtitle of the step.
- `body`: Wrapper of the step's `content`.
- `content`: The step's `content`.

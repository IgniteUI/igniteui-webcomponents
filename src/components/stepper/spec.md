# Stepper specification

This directory hosts two public components: [`igc-stepper`](#igc-stepper) and [`igc-step`](#igc-step).

- [Stepper specification](#stepper-specification)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Key features](#key-features)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Basic initialization](#basic-initialization)
      - [Orientation and appearance](#orientation-and-appearance)
      - [Step state](#step-state)
      - [Linear mode](#linear-mode)
      - [Navigation API](#navigation-api)
      - [Animations](#animations)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-stepper](#igc-stepper)
    - [igc-step](#igc-step)
  - [Test scenarios](#test-scenarios)
    - [Initialization and rendering](#initialization-and-rendering)
    - [Activation](#activation)
    - [Events tests](#events-tests)
    - [Navigation API tests](#navigation-api-tests)
    - [Dynamic steps](#dynamic-steps)
    - [Linear mode tests](#linear-mode-tests)
    - [Appearance](#appearance)
    - [Animation duration](#animation-duration)
    - [Keyboard navigation](#keyboard-navigation)
    - [Context binding](#context-binding)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

## Overview

The `igc-stepper` provides a wizard-like workflow by dividing content into logical steps. Each
[`igc-step`](#igc-step) carries its own header - an indicator, a title and a subtitle - and its content, and the
stepper shows the content of the active step.

In linear mode the stepper enforces the order of the workflow: a step can only be reached once the steps before it
are valid.

### Key features

- **Two orientations**: horizontal and vertical, each with its own animation.
- **Three step types**: the full header, the indicator only, or the title only.
- **Step state**: active, complete, invalid, optional and disabled, each with its own styling hooks.
- **Linear mode** that enforces the order of the workflow, with optional steps exempt from it.
- **Navigation API**: activate by index, move to the next or the previous enabled step, or reset.
- **Cancelable activation**: the change of the active step can be prevented.
- **Configurable animations**, including their duration.

### Acceptance criteria

- The stepper must render its steps and show the content of the active one.
- It must support a horizontal and a vertical orientation, and the three step types.
- It must expose the active, complete, invalid, optional and disabled state of a step.
- In linear mode, a step must not be reachable while a preceding non-optional step is invalid.
- Navigation must be possible through the pointer, the keyboard and the API.
- The change of the active step must be cancelable, and a completion event must follow it.
- Steps added or removed at run time must be picked up.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see the steps of a workflow and which one I am on.
- see which steps I have completed and which are still to come.
- move between the steps with the pointer and with the keyboard.
- be prevented from skipping ahead when the workflow requires the steps in order.
- recognize a step that is optional, invalid or unavailable.

### Developer stories

As a developer, I expect to be able to:

- divide a workflow into steps with their own headers and content.
- lay the stepper out horizontally or vertically, and choose how much of the header is shown.
- mark steps complete, invalid, optional or disabled.
- enforce the order of the workflow through linear mode.
- move between the steps programmatically, and reset the stepper.
- cancel an activation before it happens, for example to run validation.
- configure the animation and its duration.

## Functionality

### End-user experience

[Design hand-off](https://www.figma.com/file/iBiSKAZJ56Z3Pd0zertjHb/Stepper-Design-Handoff?node-id=0%3A1)

The stepper renders its step headers in a row or a column, connected by separators. Each header shows an indicator -
the step number by default - and the title and subtitle. The content of the active step is shown next to or below
the headers, and moving to another step animates the transition.

### Developer experience

#### Basic initialization

```html
<igc-stepper>
  <igc-step>
    <span slot="title">Account</span>
    <span slot="subtitle">Your details</span>
    <p>The content of the first step.</p>
  </igc-step>

  <igc-step>
    <span slot="title">Payment</span>
    <p>The content of the second step.</p>
  </igc-step>
</igc-stepper>
```

#### Orientation and appearance

```html
<igc-stepper orientation="vertical" step-type="indicator" title-position="end" content-top>
  ...
</igc-stepper>
```

| Property        | Values                                                     |
| --------------- | ----------------------------------------------------------- |
| `orientation`   | `horizontal` (default), `vertical`                          |
| `stepType`      | `full` (default), `indicator`, `title`                      |
| `titlePosition` | `auto` (default), `top`, `bottom`, `start`, `end`           |
| `contentTop`    | Renders the content above the step headers.                 |

#### Step state

```html
<igc-step complete>...</igc-step>
<igc-step invalid>...</igc-step>
<igc-step optional>...</igc-step>
<igc-step disabled>...</igc-step>
```

Each state is reflected and exposed through the parts of the step header, so the theme can style it. The indicator
can be replaced through the `indicator` slot.

#### Linear mode

```html
<igc-stepper linear>...</igc-stepper>
```

In linear mode an invalid step blocks the steps after it. An `optional` step is exempt: its validity does not stop
the end-user from moving on.

#### Navigation API

```typescript
const stepper = document.querySelector('igc-stepper')!;

stepper.navigateTo(2);  // activate by index
stepper.next();         // the next enabled step
stepper.prev();         // the previous enabled step
stepper.reset();        // back to the first step

stepper.steps;          // all steps
```

```typescript
stepper.addEventListener('igcActiveStepChanging', (event) => {
  if (!isCurrentStepValid()) {
    event.preventDefault();
  }
});
```

#### Animations

```html
<igc-stepper vertical-animation="fade" horizontal-animation="slide" animation-duration="200">
  ...
</igc-stepper>
```

Setting the duration to `0` disables the animation.

### Localization

The components render no strings of their own. The indicator falls back to the step index plus one, and the titles
and content come from the application.

### Keyboard interactions

The keys apply while a step header has focus.

| Key combination                                | Result                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd> | Moves focus to the previous or next enabled step header.           |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Down</kbd>    | Moves focus in a vertical stepper.                                 |
| <kbd>Home</kbd> / <kbd>End</kbd>               | Moves focus to the first or the last enabled step header.          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>            | Activates the focused step.                                        |
| <kbd>Tab</kbd>                                 | Moves focus out of the header strip and into the content.          |

Disabled steps are skipped, and in linear mode the steps that are not reachable yet cannot be activated.

## API

### igc-stepper

#### Properties and attributes

| Property            | Attribute            | Reflected | Type                              | Default      | Description                                        |
| ------------------- | -------------------- | --------- | --------------------------------- | ------------ | ---------------------------------------------------- |
| orientation         | orientation          | Yes       | `StepperOrientation`              | `horizontal` | The orientation of the stepper.                    |
| stepType            | step-type            | Yes       | `StepperStepType`                 | `full`       | The visual type of the steps.                      |
| titlePosition       | title-position       | No        | `StepperTitlePosition`            | `auto`       | The position of the step titles.                   |
| contentTop          | content-top          | Yes       | `boolean`                         | false        | Whether the content is displayed above the steps.  |
| linear              | linear               | Yes       | `boolean`                         | false        | Whether the stepper is linear.                     |
| verticalAnimation   | vertical-animation   | No        | `StepperVerticalAnimation`        | `grow`       | The animation type in vertical mode.               |
| horizontalAnimation | horizontal-animation | No        | `HorizontalTransitionAnimation`   | `slide`      | The animation type in horizontal mode.             |
| animationDuration   | animation-duration   | No        | `number`                          | 320          | The animation duration in milliseconds.            |
| steps               | -                    | No        | `readonly IgcStepComponent[]`     | -            | Read-only. All steps of the stepper.               |

#### Methods

| Name       | Type signature            | Description                                                      |
| ---------- | ------------------------- | ---------------------------------------------------------------- |
| navigateTo | `(index: number): void`   | Activates the step at the given index.                           |
| next       | `(): void`                | Activates the next enabled step.                                 |
| prev       | `(): void`                | Activates the previous enabled step.                             |
| reset      | `(): void`                | Resets the stepper to its initial state, activating the first step. |

#### Events

| Name                  | Cancellable | Description                                       |
| --------------------- | ----------- | ------------------------------------------------- |
| igcActiveStepChanging | true        | Emitted when the active step is about to change.  |
| igcActiveStepChanged  | false       | Emitted after the active step has changed.        |

#### Slots

| Name      | Description                                            |
| --------- | ------------------------------------------------------ |
| (default) | Renders the steps of the stepper inside default slot.  |

#### CSS Shadow parts

None applicable. Style the steps through their own parts.

### igc-step

A step used within a stepper to represent an individual step in a wizard-like workflow.

| Property | Attribute | Reflected | Type      | Default | Description                                                                 |
| -------- | --------- | --------- | --------- | ------- | ----------------------------------------------------------------------------- |
| active   | active    | Yes       | `boolean` | false   | Whether the step is active. The content of an active step is visible.       |
| complete | complete  | Yes       | `boolean` | false   | Whether the step is completed.                                              |
| invalid  | invalid   | Yes       | `boolean` | false   | Whether the step is invalid. Invalid steps are not interactive in linear mode. |
| optional | optional  | Yes       | `boolean` | false   | Whether the step is optional. Its validity does not block linear navigation. |
| disabled | disabled  | Yes       | `boolean` | false   | Whether the step is disabled and not interactive.                           |

| Slot        | Description                                                                |
| ----------- | -------------------------------------------------------------------------- |
| (default)   | Renders the content of the step.                                           |
| `indicator` | Renders the indicator of the step. By default it displays the step index plus one. |
| `title`     | Renders the title of the step.                                             |
| `subtitle`  | Renders the subtitle of the step.                                          |

| Part               | Description                                                                          |
| ------------------ | -------------------------------------------------------------------------------------- |
| `header-container` | Wrapper of the step header and its separators.                                       |
| `header`           | Wrapper of the step indicator and text.                                               |
| `indicator`        | The indicator of the step.                                                            |
| `text`             | Wrapper of the step title and subtitle.                                               |
| `title`            | The title of the step.                                                                |
| `subtitle`         | The subtitle of the step.                                                             |
| `body`             | Wrapper of the step content.                                                          |
| `content`          | The content of the step.                                                              |
| `empty`            | Indicates that no title and subtitle were provided. Applies to `text`.                |
| `disabled` / `invalid` / `optional` | Indicate the matching state. Apply to `header-container`.            |
| `complete-start` / `complete-end`   | Indicate the complete state of the current and the previous step.    |
| `top` / `bottom` / `start` / `end`  | Indicate where the title sits relative to the indicator.             |

## Test scenarios

The suite lives in [`stepper.spec.ts`](./stepper.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### Initialization and rendering

1. The component is initialized with its defaults, renders its steps and passes the accessibility audit.
2. The default indicator renders the step index plus one, and the `indicator` slot replaces it.
3. The header parts are applied for each step state.

### Activation

4. The first enabled step is active by default, and only the content of the active step is visible.
5. Activating a step through the pointer moves the active state.
6. Disabled steps cannot be activated.

### Events tests

7. `igcActiveStepChanging` is emitted before the change and can be canceled.
8. `igcActiveStepChanged` is emitted after the change.

### Navigation API tests

9. `navigateTo` activates by index, and ignores an index that matches no step.
10. `next` and `prev` move to the neighbouring enabled steps.
11. `reset` returns the stepper to its first step.

### Dynamic steps

12. Steps added or removed at run time are picked up, and the active step is recalculated when it is removed.

### Linear mode tests

13. An invalid step blocks the steps after it.
14. An optional invalid step does not block the navigation.
15. Completing a step unblocks the next one.

### Appearance

16. `orientation`, `stepType`, `titlePosition` and `contentTop` are reflected and change the layout.

### Animation duration

17. The animation duration is applied through the corresponding CSS custom property, and `0` disables the animation.

### Keyboard navigation

18. The arrow keys move focus between the enabled step headers, in both orientations.
19. <kbd>Home</kbd> and <kbd>End</kbd> jump to the first and the last enabled step.
20. <kbd>Enter</kbd> and <kbd>Space</kbd> activate the focused step.

### Context binding

21. The steps receive their configuration - orientation, step type, title position and linear mode - from the
    stepper through context, including for steps added later.

## Assumptions and limitations

- One step is active at a time.
- The stepper does not validate anything itself: `invalid` and `complete` are set by the application, typically from
  the `igcActiveStepChanging` handler.
- Linear mode restricts navigation but does not prevent a programmatic `navigateTo` from the application.

## Accessibility

### ARIA roles and properties

- The step headers form a single tab stop: the active header carries the tab index and the arrow keys move within
  the strip.
- Each header exposes its selected state and controls the content region of its step.
- The disabled, invalid and optional states are exposed, and disabled steps are skipped by the navigation.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The header order, the
separators and the horizontal arrow navigation follow the inline direction.

# Tooltip Specification

- [Tooltip Specification](#tooltip-specification)
  - [Owned By](#owned-by)
    - [Requires approval from:](#requires-approval-from)
    - [Signed off by:](#signed-off-by)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Scenarios](#scenarios)
        - [Declarative anchor target](#declarative-anchor-target)
        - [Programmatic anchor target](#programmatic-anchor-target)
        - [Message and content slots](#message-and-content-slots)
        - [Declaratively setting anchor triggers](#declaratively-setting-anchor-triggers)
      - [Behaviors](#behaviors)
    - [Localization](#localization)
    - [Keyboard interaction](#keyboard-interaction)
  - [API](#api)
    - [Properties](#properties)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS parts](#css-parts)
    - [CSS variables](#css-variables)
  - [Test scenarios](#test-scenarios)
    - [Automation](#automation)
      - [Rendering and initialization](#rendering-and-initialization)
      - [Attributes and properties](#attributes-and-properties)
      - [Behaviors](#behaviors-1)
  - [Accessibility](#accessibility)
    - [WAI-ARIA](#wai-aria)
    - [RTL](#rtl)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [References](#references)

## Owned By

**Team Name**: Astrea + Design and Web Development

**Developer name**: Arkan Ahmedov, Riva Ivanova

**Designer name**: Diana Koleva, Dilyana Yarabanova

### Requires approval from:

- [ ] Damyan Petev
- [ ] Simeon Simeonov

### Signed off by:

- [x] Radoslav Karaivanov - 2025-04-23
- [x] Radoslav Mirchev - 2025-04-16
- [x] Svilen Dimchevski - 2025-04-23

## Revision history

| Version | Author              | Date       | Notes                                                                     |
| ------: | ------------------- | ---------- | ------------------------------------------------------------------------- |
|       1 | Riva Ivanova        | 2025-03-17 | Initial draft - user stories, API, test scenarios                         |
|     1.1 | Riva Ivanova        | 2025-03-20 | Updated draft specification                                               |
|     1.2 | Riva Ivanova        | 2025-04-02 | Finalized specification                                                   |
|     1.3 | Riva Ivanova        | 2025-04-07 | Updated API, ARIA and test scenarios                                      |
|     1.4 | Arkan Ahmedov       | 2025-04-14 | Updated API and ARIA                                                      |
|     1.5 | Radoslav Karaivanov | 2025-04-23 | Signed-off specification                                                  |
|     1.6 | Radoslav Karaivanov | 2025-06-13 | Added `withArrow` property, changed default placement and event arguments |

## Overview

This document outlines the technical specification for the **igc-tooltip** web component. This component provides a way to display supplementary information related to an element when a user interacts with it (e.g., hover, focus). It offers features such as placement customization, delays, sticky mode, and animations.

### Acceptance criteria

The **igc-tooltip must**:

- support rendering of user-provided slotted content or a simple text message.
- support setting an **anchor** element for the tooltip, both declaratively and programmatically.
- expose a declarative way to configure showing/hiding states to common end-user interactions (hover, focus, click, etc.).
- expose an API to programmatically configure showing/hiding/positioning of the tooltip.
- be WAI-ARIA compliant.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- dismiss and hide the tooltip element after it is shown by hovering out of it by default, or depending on the configuration, hide it through some other interaction.
- dismiss any tooltip by pressing <kbd>Escape</kbd> regardless of its configuration parameters.
- interact with tooltip if necessary.

### Developer stories

As a developer, I expect to be able to:

- display a tooltip for a certain DOM element when the end-user hovers over it.
- hide a shown tooltip for a certain DOM element when the end-user hovers out of the tooltip or hovers out/click on its **anchor**
- configure, both declaratively and programmatically, a DOM element that will act as an **anchor** for the tooltip element.
- configure, both declaratively and programmatically, the set of interactions that will show/hide the tooltip element.
- confiture the delay between showing/hiding the tooltip element on end-user interactions.
- configure the position where the tooltip will attempt to place itself in the end-user viewport.
- configure a **sticky** mode where the end-user has to interact with the tooltip element in order to dismiss it.
- slot basic text content either through a property or projected content.
- slot custom DOM structure as content of the tooltip.
- change the default close icon in **sticky** mode by either using the icon service API or slotting custom one.
- programmatically create and configure tooltip elements - anchors, positioning, open state, etc.
- style and customize the look and feel of the tooltip to match application scenarios.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/design/6HS97pQmX6waDxvUTk6qph/Tooltip-Handoff?m=auto&node-id=3023-2&t=T7BncfHz3cqWHxmL-1)

### Developer experience

#### Scenarios

##### Declarative anchor target

With IDREF:

```html
<igc-button id="hover-button">...</igc-button>

<igc-tooltip anchor="hover-button">...</igc-tooltip>
```

##### Programmatic anchor target

With DOM reference:

```html
<igc-button>...</igc-button>

<igc-tooltip>...</igc-tooltip>
```

```ts
const tooltip = document.querySelector('igc-tooltip');
tooltip.anchor = document.querySelector('igc-button');
```

##### Message and content slots

With **message** property:

```html
<igc-tooltip message="Hello World"></igc-tooltip>
```

With slotted content:

```html
<igc-tooltip>Hello World</igc-tooltip>
```

With both:

```html
<igc-tooltip message="I will not be shown">I will be shown</igc-tooltip>
```

##### Declaratively setting anchor triggers

```html
<igc-tooltip
  show-triggers="pointerenter focus"
  hide-triggers="pointerleave blur click"
>
  Custom triggers
</igc-tooltip>
```

> [!NOTE]
> When setting **hide-triggers/show-triggers** you can pass the event names as a comma separated string, a space separated string
> or a mixture between both.

#### Behaviors

- The tooltip will try to respect its given placement position. In scenarios where the tooltip content may be clipped (viewport edge),
  it will try to reposition itself automatically.
- Any slotted content in the default slot of the tooltip takes precedence over the **message** property of the element.
- The default show trigger for the tooltip anchor is **pointerenter** and the default triggers for hiding are **pointerleave + click**.
- Once shown the tooltip will remain in open state unless a hide trigger is activated, the end-user hovers in and out of the
  tooltip element itself or it is closed programmatically.
- In **sticky** mode:
  - A shown tooltip will ignore its **hide-triggers** and the default hover in/out behavior when the user interacts with the tooltip.
  - Dismissing the tooltip is achieved by clicking on the default close button, pressing <kbd>Escape</kbd> or programmatically.
- Any slotted content in the **close-button** slot is rendered only when the tooltip is in **sticky** mode.
- An initially shown tooltip on first render (page load for example) will remain shown until interacting with it or its target.
- The **show/hide-delay** values affect only end-user interactions. Showing a tooltip through the API ignores them.
- The **show/hide/toggle** methods will wait for the respective animation of the tooltip to complete.
- Setting **open** will transition the tooltip to the relevant state **without** delays and animations.
- When invoking `show` with a target, the tooltip will treat the passed in target as a transient anchor. It will attach
  its hide and show triggers and treat the element as its anchor until it is dismissed. If the tooltip had an anchor
  set before the call to `show` it will be restored after the transient state is completed.

### Localization

No specific implementation is required.

### Keyboard interaction

| Key               | Behavior                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| <kbd>Escape</kbd> | Pressing <kbd>Escape</kbd> on a **active** page will close the last shown **igc-tooltip** element. |

## API

### Properties

| Property       | Attribute       | Reflected | Type                          | Default                | Description                                                                                                                           |
| -------------- | --------------- | --------- | ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `anchor`       | `anchor`        | No        | `string \| Element reference` | -                      | A DOM element instance reference or an IDREF string to use as the anchor for the tooltip.                                             |
| `withArrow`    | `with-arrow`    | Yes       | `boolean`                     | `false`                | Whether to enable the rendering of the arrow indicator of the component.                                                              |
| `hideDelay`    | `hide-delay`    | No        | `number`                      | `300`                  | The number of millisecond before the component will start hiding after an user interaction.                                           |
| `hideTriggers` | `hide-triggers` | No        | `string`                      | `'pointerleave,click'` | Which `anchor` event(s) will trigger the component to hide.                                                                           |
| `message`      | `message`       | No        | `string`                      | `''`                   | Specifies a plain text as tooltip content. Ignored if there is slotted content inside the tooltip default slot.                       |
| `offset`       | `offset`        | No        | `number`                      | `6`                    | The offset of the tooltip from its anchor in pixels.                                                                                  |
| `open`         | `open`          | Yes       | `boolean`                     | `false`                | Whether the component is shown.                                                                                                       |
| `placement`    | `placement`     | No        | `PopoverPlacement`            | `'bottom'`             | Where to place the tooltip relative to its anchor.                                                                                    |
| `showDelay`    | `show-delay`    | No        | `number`                      | `200`                  | The number of millisecond before the component will start showing after an user interaction.                                          |
| `showTriggers` | `show-triggers` | No        | `string`                      | `'pointerenter'`       | Which `anchor` event(s) will trigger the component to show.                                                                           |
| `sticky`       | `sticky`        | Yes       | `boolean`                     | `false`                | Whether the tooltip should remain in open state until the user closes it via the close "button" or by pressing <kbd>Escape</kbd> key. |

### Methods

| Name     | Type signature                                   | Description                                                                                                   |
| -------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `show`   | `(anchor?: string \| Element): Promise<boolean>` | Shows the tooltip if not already shown. If an element or an IDREF is provided, sets it as a transient anchor. |
| `hide`   | `(): Promise<boolean>`                           | Hides the tooltip if not already hidden.                                                                      |
| `toggle` | `(): Promise<boolean>`                           | Toggles between shown/hidden state.                                                                           |

### Events

| Name         | Cancellable | Description                           | Parameters |
| ------------ | ----------- | ------------------------------------- | ---------- |
| `igcOpening` | Yes         | Emitted before the tooltip is shown.  | None       |
| `igcOpened`  | No          | Emitted after the tooltip is shown.   | None       |
| `igcClosing` | Yes         | Emitted before the tooltip is hidden. | None       |
| `igcClosed`  | No          | Emitted after the tooltip is hidden.  | None       |

### Slots

| Name           | Description                                              |
| -------------- | -------------------------------------------------------- |
| `-`            | Default slot of the component.                           |
| `close-button` | Replaces the default close icon when in **sticky** mode. |

### CSS parts

| Part   | Description                                    |
| ------ | ---------------------------------------------- |
| `base` | The wrapping container of the tooltip content. |

### CSS variables

None applicable.

## Test scenarios

### Automation

#### Rendering and initialization

- passes the default WAI-ARIA automation.
- is initialized without errors.
- is initialized with the appropriate default state.
- should correctly slot user-provided content for the tooltip.
- the tooltip is initially hidden.

#### Attributes and properties

- should show/hide the tooltip based on `showDelay` and `hideDelay`.
- should show/hide the tooltip based on the `open` property.
- should determine the tooltip's current state via the `open` property.
- should set target via `anchor` property by providing an IDREF.
- should set target via `anchor` property by providing a DOM element reference.
- should show/hide the arrow via the `disableArrow` property.
- should show/hide the arrow via the `disable-arrow` attribute.
- should show the tooltip via `show()` method.
- should hide the tooltip via `hide()` method.
- should toggle between shown/hidden state via `toggle()` method.
- should change the show/hide trigger via `showTriggers`/`hideTriggers` property.
- should change the show/hide trigger via `show-triggers`/`hide-triggers` attribute.
- should render a default close button when in `sticky` mode.
- hide triggers should not close the tooltip when in `sticky` mode.
- should close the tooltip when in `sticky` mode by clicking the default close button.
- should close the tooltip when in `sticky` mode by pressing the `Esc` key.
- should provide content via the `message` property.
- slotted content takes priority over the `message` property.

#### Behaviors

- it should be shown when hovering over its target and hidden when the mouse leaves.
- it should be shown when focusing its target via <kbd>Tab</kbd> key and hidden when losing focus (on blur).
- it should be hidden when pressing <kbd>Escape</kbd>.
- events are correctly emitted on user interaction.
- events can be canceled.

## Accessibility

The **igc-tooltip** follows the general guidelines given by the [APG](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).
While options are given to developers on how they want to initiate the open/close state of the component (_showTriggers/hideTriggers_ properties) or whether it should stick around after showing unless an active close action is initiated by the end-user (_sticky_ property), the component is not focusable and does not manage any focus state out of the box.

Focus management, if any, is up to the developer based on their scenario requirements.

### WAI-ARIA

**Intrinsic roles**

| ARIA attribute | Default                                                |
| -------------- | ------------------------------------------------------ |
| role           | _tooltip_ if not in **sticky** mode otherwise _status_ |
| aria-atomic    | _true_                                                 |
| aria-live      | _polite_                                               |

- When the tooltip is in **sticky** mode the default close icon element must have an
  **aria-hidden** attribute.
- When the tooltip is not shown, its internal `igc-popover` component must be in an **inert** state.

**Animations**

- During show/hide animations the tooltip is in **inert** state.
- The tooltip element adheres to the user preference to minimize the amount of non-essential motion.
  Thus, if `prefers-reduced-motion` is enabled on the user device, the animations are ran with a duration of 0,
  essentially disabling them.

### RTL

The **igc-tooltip** should work in a Right-To-Left context without additional configuration from the developer.

## Assumptions and limitations

## References

- https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
- https://www.w3.org/TR/wai-aria-1.2/#tooltip

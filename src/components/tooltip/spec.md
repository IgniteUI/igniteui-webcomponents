# Tooltip specification

- [Tooltip specification](#tooltip-specification)
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
      - [Declarative anchor target](#declarative-anchor-target)
      - [Programmatic anchor target](#programmatic-anchor-target)
      - [Message and content slots](#message-and-content-slots)
      - [Show and hide triggers](#show-and-hide-triggers)
      - [Delays](#delays)
      - [Placement and the arrow](#placement-and-the-arrow)
      - [Sticky mode](#sticky-mode)
      - [Scroll strategy](#scroll-strategy)
      - [Programmatic control](#programmatic-control)
    - [Behaviors](#behaviors)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Initialization](#initialization)
    - [Properties](#properties)
    - [Methods tests](#methods-tests)
    - [Scroll strategy tests](#scroll-strategy-tests)
    - [Behaviors tests](#behaviors-tests)
    - [State transitions](#state-transitions)
    - [Events tests](#events-tests)
    - [Keyboard interaction tests](#keyboard-interaction-tests)
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

The `igc-tooltip` displays supplementary information related to an element when the end-user interacts with it -
by hovering, focusing, or another configured trigger. It offers placement customization, show and hide delays, a
sticky mode that keeps the tooltip visible until it is actively dismissed, and animations.

The tooltip positions itself through the internal [`igc-popover`](../popover/spec.md), so its content renders in the
top layer and is never clipped by a scrolling ancestor.

### Key features

- **Flexible anchoring**: an IDREF or an element reference, set declaratively or programmatically, plus a transient
  anchor passed to `show`.
- **Content or message**: a plain text `message` property, or arbitrary slotted content that takes precedence.
- **Configurable triggers**: the events that show and hide the tooltip are declared as comma or space separated
  lists.
- **Delays**: separate show and hide delays, applied to end-user interaction only.
- **Sticky mode**: the tooltip ignores its hide triggers and is dismissed through a close button, <kbd>Escape</kbd>
  or the API.
- **Placement with an optional arrow**, repositioned automatically near the viewport edges.
- **Animated transitions** that respect `prefers-reduced-motion`.

### Acceptance criteria

The `igc-tooltip` must:

- support rendering user-provided slotted content or a simple text message.
- support setting an anchor element, both declaratively and programmatically.
- expose a declarative way to configure the end-user interactions that show and hide it.
- expose an API to programmatically show, hide, toggle and position it.
- keep the tooltip in view by repositioning when the content would be clipped.
- be dismissible with <kbd>Escape</kbd> regardless of its configuration.
- be WAI-ARIA compliant.
- be integrated and themeable with the theming mechanism of the library.
- support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see supplementary information for an element when I hover or focus it.
- dismiss the tooltip by hovering away from it by default, or through another configured interaction.
- dismiss any tooltip by pressing <kbd>Escape</kbd>, regardless of its configuration.
- interact with the content of the tooltip when the scenario requires it.

### Developer stories

As a developer, I expect to be able to:

- display a tooltip for a DOM element when the end-user hovers over it.
- hide a shown tooltip when the end-user hovers out of it or out of its anchor, or clicks.
- configure the anchor element declaratively and programmatically.
- configure the set of interactions that show and hide the tooltip.
- configure the delay before showing and before hiding.
- configure where the tooltip attempts to place itself in the viewport.
- configure a sticky mode where the end-user must actively dismiss the tooltip.
- provide basic text content through a property, or a custom DOM structure through projection.
- change the default close icon in sticky mode, through the icon service or by slotting one.
- create and configure tooltips programmatically - anchors, positioning, open state.
- style the tooltip to match the application.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/design/6HS97pQmX6waDxvUTk6qph/Tooltip-Handoff?m=auto&node-id=3023-2&t=T7BncfHz3cqWHxmL-1)

The tooltip appears next to its anchor after the show delay, on the configured side, optionally with an arrow
pointing at the anchor. It disappears after the hide delay once a hide trigger fires, unless the pointer moves onto
the tooltip itself. In sticky mode it stays until the close button is activated, <kbd>Escape</kbd> is pressed, or it
is closed programmatically.

### Developer experience

#### Declarative anchor target

```html
<igc-button id="hover-button">Hover me</igc-button>

<igc-tooltip anchor="hover-button">Supplementary information</igc-tooltip>
```

#### Programmatic anchor target

```html
<igc-button>Hover me</igc-button>
<igc-tooltip>Supplementary information</igc-tooltip>
```

```typescript
const tooltip = document.querySelector('igc-tooltip')!;
tooltip.anchor = document.querySelector('igc-button')!;
```

#### Message and content slots

```html
<!-- Plain text through the property -->
<igc-tooltip message="Hello World"></igc-tooltip>

<!-- Slotted content -->
<igc-tooltip>Hello World</igc-tooltip>

<!-- Slotted content wins -->
<igc-tooltip message="I will not be shown">I will be shown</igc-tooltip>
```

#### Show and hide triggers

```html
<igc-tooltip show-triggers="pointerenter focus" hide-triggers="pointerleave blur click">
  Custom triggers
</igc-tooltip>
```

The defaults are `pointerenter,focusin` for showing and `pointerleave,click,focusout` for hiding.

> [!NOTE]
> The triggers accept the event names as a comma separated string, a space separated string, or a mixture of both.

#### Delays

```html
<igc-tooltip show-delay="500" hide-delay="100">Delayed</igc-tooltip>
```

The delays apply to end-user interaction only. Showing or hiding through the API ignores them.

#### Placement and the arrow

```html
<igc-tooltip placement="top" offset="10" with-arrow>Above the anchor</igc-tooltip>
```

The tooltip respects the given placement and repositions itself when the content would be clipped at a viewport
edge.

#### Sticky mode

```html
<igc-tooltip sticky>
  This stays until dismissed
  <igc-icon slot="close-button" name="close"></igc-icon>
</igc-tooltip>
```

In sticky mode the hide triggers are ignored and a close button is rendered. The `close-button` slot is only
rendered in sticky mode.

#### Scroll strategy

`scrollStrategy` sets the behavior while a parent container scrolls: `hide` - the default - hides the tooltip while
the anchor is fully out of view, `scroll` keeps it visible and anchored, and `close` closes it on each scroll. The
`close` strategy also closes a sticky tooltip; <kbd>Escape</kbd> behaves the same way.

#### Programmatic control

```typescript
await tooltip.show();              // uses the configured anchor
await tooltip.show(otherElement);  // transient anchor
await tooltip.hide();
await tooltip.toggle();
```

`show`, `hide` and `toggle` resolve once the corresponding animation completes, and resolve with whether the state
changed. Setting `open` transitions the tooltip without delays and without animations.

### Behaviors

- The tooltip respects its given placement, and repositions when the content would be clipped at a viewport edge.
- Slotted content in the default slot takes precedence over the `message` property.
- Once shown, the tooltip stays open until a hide trigger fires, the end-user hovers in and out of the tooltip
  itself, or it is closed programmatically.
- In sticky mode a shown tooltip ignores its hide triggers and the hover-out behavior; it is dismissed through the
  close button, <kbd>Escape</kbd>, or the API.
- Content slotted in the `close-button` slot is rendered only in sticky mode.
- A tooltip that is open on the first render stays shown until the end-user interacts with it or with its anchor.
- The show and hide delays affect end-user interaction only; the API ignores them.
- `show`, `hide` and `toggle` wait for the corresponding animation to complete.
- Setting `open` transitions the tooltip without delays and animations.
- Calling `show` with a target treats it as a transient anchor: the triggers are attached to it and it acts as the
  anchor until the tooltip is dismissed, after which a previously set anchor is restored.

### Localization

No specific implementation is required. The component renders no strings of its own; the `message` property and the
slotted content come from the application.

### Keyboard interactions

| Key combination   | Result                                                            |
| ----------------- | ------------------------------------------------------------------ |
| <kbd>Escape</kbd> | Closes the last shown tooltip on the active page.                  |

## API

### Properties and attributes

| Property       | Attribute       | Reflected | Type                             | Default                          | Description                                                     |
| -------------- | --------------- | --------- | -------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| open           | open            | Yes       | `boolean`                        | false                            | Whether the tooltip is showing.                                 |
| anchor         | anchor          | No        | `Element \| string \| undefined` | -                                | An element instance or an IDREF to use as the anchor.           |
| message        | message         | No        | `string`                         | `''`                             | Plain text as the tooltip content.                              |
| placement      | placement       | No        | `PopoverPlacement`               | `bottom`                         | Where to place the tooltip relative to its anchor.              |
| offset         | offset          | No        | `number`                         | 6                                | The offset of the tooltip from the anchor, in pixels.           |
| withArrow      | with-arrow      | Yes       | `boolean`                        | false                            | Whether to render an arrow indicator for the tooltip.           |
| showTriggers   | show-triggers   | No        | `string`                         | `pointerenter,focusin`           | Which event triggers will show the tooltip.                     |
| hideTriggers   | hide-triggers   | No        | `string`                         | `pointerleave,click,focusout`    | Which event triggers will hide the tooltip.                     |
| showDelay      | show-delay      | No        | `number`                         | 200                              | Milliseconds before showing the tooltip.                        |
| hideDelay      | hide-delay      | No        | `number`                         | 300                              | Milliseconds before hiding the tooltip.                         |
| sticky         | sticky          | Yes       | `boolean`                        | false                            | Whether the tooltip stays visible until it is actively closed.  |
| scrollStrategy | scroll-strategy | No        | `PopoverScrollStrategy`          | `hide`                           | The behavior of the tooltip when a parent container scrolls.    |

### Methods

| Name   | Type signature                                | Description                                                                          |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| show   | `(target?: Element \| string): Promise<boolean>` | Shows the tooltip if not already showing. A target is used as a transient anchor. |
| hide   | `(): Promise<boolean>`                        | Hides the tooltip if not already hidden.                                             |
| toggle | `(): Promise<boolean>`                        | Toggles the tooltip between the shown and hidden state.                              |

### Events

| Name       | Cancellable | Description                                                        |
| ---------- | ----------- | ------------------------------------------------------------------ |
| igcOpening | true        | Emitted before the tooltip begins to open. Can be canceled to prevent opening. |
| igcOpened  | false       | Emitted after the tooltip has successfully opened and is visible.  |
| igcClosing | true        | Emitted before the tooltip begins to close. Can be canceled to prevent closing. |
| igcClosed  | false       | Emitted after the tooltip has been fully removed from view.        |

### Slots

| Name           | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| (default)      | Default slot of the tooltip component.                               |
| `close-button` | Slot for a custom sticky-mode close action, such as an icon or button. |

### CSS Shadow parts

| Part           | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `base`         | The wrapping container of the tooltip content.                     |
| `simple-text`  | The container where the `message` property is rendered.            |
| `close-button` | The default sticky-mode close button.                              |

## Test scenarios

The suite lives in [`tooltip.spec.ts`](./tooltip.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### Initialization

1. The component is initialized with its default state and passes the accessibility audit.
2. A tooltip that starts open renders shown.
3. The anchor is resolved from an IDREF and from an element reference.

### Properties

4. `message` renders as plain text, and slotted content takes precedence over it.
5. `placement`, `offset` and `withArrow` are applied to the positioning surface.
6. `showTriggers` and `hideTriggers` accept comma separated, space separated and mixed lists.
7. `showDelay` and `hideDelay` are honoured for end-user interaction.
8. `sticky` renders the close button and ignores the hide triggers.

### Methods tests

9. `show` shows the tooltip and resolves when the animation completes.
10. `show` with a target uses it as a transient anchor, restoring the previous anchor afterwards.
11. `hide` and `toggle` transition the state and resolve with whether it changed.
12. The methods ignore the configured delays.

### Scroll strategy tests

13. `hide` hides the tooltip while the anchor is out of view.
14. `scroll` keeps the tooltip anchored.
15. `close` closes the tooltip on scroll, including in sticky mode.

### Behaviors tests

16. Moving the pointer from the anchor onto the tooltip keeps it open.
17. A tooltip open on the first render stays shown until an interaction.
18. Setting `open` transitions without delays and animations.

### State transitions

19. Interrupted show and hide transitions settle in the correct final state.
20. The tooltip is inert while it is closed and during the animations.

### Events tests

21. `igcOpening` and `igcClosing` are emitted and can be canceled to prevent the transition.
22. `igcOpened` and `igcClosed` are emitted after the transition completes.

### Keyboard interaction tests

23. <kbd>Escape</kbd> closes the last shown tooltip, including in sticky mode.

## Assumptions and limitations

- The tooltip is not focusable and does not manage focus. Focus management, where a scenario needs it, is up to the
  application.
- The delays apply only to end-user interaction; the imperative API is immediate.
- One anchor is active at a time; a transient anchor passed to `show` replaces the configured one until dismissal.

## Accessibility

The component follows the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). Developers
choose how the open state is initiated through the trigger properties, and whether the tooltip stays until actively
dismissed through `sticky`; the component itself is not focusable and manages no focus state.

### ARIA roles and properties

| ARIA attribute | Default                                              |
| -------------- | ---------------------------------------------------- |
| `role`         | `tooltip`, or `status` while in sticky mode          |
| `aria-atomic`  | `true`                                               |
| `aria-live`    | `polite`                                             |

- In sticky mode the default close icon carries `aria-hidden`.
- While the tooltip is not shown, its internal popover is inert.
- During the show and hide animations the tooltip is inert.
- The animations respect `prefers-reduced-motion`: with the preference enabled they run with a duration of zero.

**References**

- [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)
- [WAI-ARIA 1.2 tooltip role](https://www.w3.org/TR/wai-aria-1.2/#tooltip)

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional configuration. The placement variants follow the
inline direction.

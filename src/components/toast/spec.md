# Toast specification

- [Toast specification](#toast-specification)
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
      - [Display time](#display-time)
      - [Positioning](#positioning)
      - [Invoker commands](#invoker-commands)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [ARIA tests](#aria-tests)
    - [API tests](#api-tests)
    - [Positioning tests](#positioning-tests)
    - [Alert behavior tests](#alert-behavior-tests)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |
|       2 | 2026-09-23 | Remove the `base` part, which the toast does not render |
|       3 | 2026-10-07 | The display time waits for the pointer and the keyboard focus and starts again on `show()`; `container` positioning uses an anchor name; an open component shows again after a move; `show()` during the fade-out keeps the component open |

## Overview

The `igc-toast` shows a brief, non-interactive notification. It appears in the configured position, stays visible
for a display time, and disappears on its own.

It shares its base implementation, positioning and auto-dismiss behavior with [`igc-snackbar`](../snackbar/spec.md).
The difference is that a toast carries no action: use a snackbar when the end-user is expected to respond.

### Key features

- **Non-interactive**: a message only, with no actions to focus.
- **Auto-dismiss** after a configurable display time, which can be turned off and waits while the pointer is on the
  toast.
- **Two positioning strategies**: against the viewport, or inside the closest visible ancestor.
- **Three positions**: top, middle and bottom.
- **Declarative invocation** through the Invoker Commands API, with no JavaScript.

### Acceptance criteria

- The component must display a brief, non-interactive message.
- It must close itself after the display time, unless it is kept open.
- It must expose show, hide and toggle methods that report whether the state changed.
- It must position itself against the viewport or inside the closest visible ancestor.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to:

- be told briefly that something has happened, without being interrupted.
- have the message disappear on its own.
- never have my focus moved by the notification.

### Developer stories

As a developer, I expect to be able to:

- show a brief message and have it dismiss itself.
- configure how long it stays visible, or keep it open until I close it.
- position the message against the viewport or within a container.
- show and hide the message declaratively, without writing JavaScript.

## Functionality

### End-user experience

The toast appears in the configured position, shows its message, and disappears after the display time. While the
pointer is on the toast, it stays, and the display time starts again when the pointer leaves. It never takes focus and
offers nothing to interact with.

### Developer experience

#### Basic initialization

```html
<igc-toast>Changes saved</igc-toast>
```

```typescript
await toast.show();
```

#### Display time

```html
<igc-toast display-time="2000">Quick</igc-toast>
<igc-toast keep-open>Stays until closed</igc-toast>
```

The display time stops while the pointer is on the component, or the keyboard focus is in its content, and starts again
in full when both leave. A component that moves while it is open shows again in its new place, with a full display
time.
`show()` on an open component starts the display time again and resolves `false`, so a new message can reuse the open
toast:

```typescript
toast.textContent = 'Link copied';
await toast.show();
```

#### Positioning

```html
<igc-toast position="top">Against the viewport</igc-toast>
<igc-toast positioning="container" position="middle">Inside a container</igc-toast>
```

| `positioning`        | Behavior                                                                          |
| -------------------- | ----------------------------------------------------------------------------------- |
| `viewport` (default) | Positions against the viewport, ignoring every ancestor.                           |
| `container`          | Positions inside the bounding box of the closest visible ancestor, at `position`.  |

With `container` positioning, `show()` resolves `false` when no visible ancestor is found.

While it is open in `container` positioning, the component adds a generated name to the inline `anchor-name` of the
container and sets `position-anchor` on itself. It adds them again when a new `style` attribute, for example from a
template binding, removes them, and it removes them when it closes or moves. A container that has anchor names of its
own, also one that gets them while the component is open, or that is in another tree, such as the host of the shadow
root that holds the component, becomes the `source` of `showPopover()` instead. An anchor name cannot reach another
tree, and the component does not take over the anchor names of a container.

#### Invoker commands

```html
<igc-button commandfor="saved" command="--show">Save</igc-button>
<igc-toast id="saved">Changes saved</igc-toast>
```

The supported commands are `--show`, `--hide` and `--toggle`, on both Ignite and native buttons.

### Localization

The component renders no built-in strings. The message comes from the application.

### Keyboard interactions

None applicable. The toast is not interactive and is not reachable with the keyboard.

## API

### Properties and attributes

| Property    | Attribute    | Reflected | Type                      | Default    | Description                                                 |
| ----------- | ------------ | --------- | ------------------------- | ---------- | ------------------------------------------------------------- |
| open        | open         | Yes       | `boolean`                 | false      | The open state of the component.                            |
| displayTime | display-time | No        | `number`                  | 4000       | The time in milliseconds that the component stays visible.  |
| keepOpen    | keep-open    | Yes       | `boolean`                 | false      | Keeps the component open after the display time is over.    |
| position    | position     | Yes       | `AbsolutePosition`        | `bottom`   | The position of the component in the viewport.              |
| positioning | positioning  | Yes       | `NotificationPositioning` | `viewport` | The positioning strategy of the component.                  |

### Methods

| Name   | Type signature         | Description                                                                         |
| ------ | ---------------------- | ------------------------------------------------------------------------------------- |
| show   | `(): Promise<boolean>` | Opens the component, also during the fade-out of `hide()`. When it is already open, the display time starts again, and it resolves `false`. It also resolves `false` when `container` positioning finds no visible ancestor. |
| hide   | `(): Promise<boolean>` | Closes the component. Resolves `false` when it is already closed or fades out.       |
| toggle | `(): Promise<boolean>` | Toggles the component. Resolves `true` when the state changed.                       |

### Events

None applicable.

### Slots

| Name      | Description                            |
| --------- | -------------------------------------- |
| (default) | Default slot for the toast content.    |

### CSS Shadow parts

None applicable.

## Test scenarios

The suite lives in [`toast.spec.ts`](./toast.spec.ts) and runs in a real browser through `@web/test-runner` with
`@open-wc/testing` fixtures and assertions. It also runs the shared `runAlertTests` and `runInvokerCommandsTests`
suites from [`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### ARIA tests

1. The component exposes the expected role and live region semantics, and passes the accessibility audit.

### API tests

2. `show`, `hide` and `toggle` transition the open state and resolve with whether it changed.
3. `displayTime` closes the component after the configured interval.
4. `keepOpen` keeps the component open after the display time.
5. The Invoker Commands integration calls `show`, `hide` and `toggle`.

### Positioning tests

6. `positioning` defaults to `viewport`, and showing the component sets no inline anchor styles.
7. `positioning="container"` shows the component when there is a visible ancestor.
8. Switching `positioning` between `container` and `viewport` while the component is open keeps it open, in both
   directions.
9. Changing `position` while in `viewport` mode sets no inline styles.

### Alert behavior tests

The shared `runAlertTests` suite, which the snackbar also runs:

10. `show()` on an open component resolves `false` and starts the display time again.
11. The display time waits while the pointer is in the component, and starts again in full when it leaves.
12. A close while the pointer is in the component does not stop the display time of the next `show()`.
13. A move while the pointer is in the component shows it again in the new place, with a full display time.
14. A component removed during the fade-in does not close while it is detached, and its display time runs in full
    after it is back.
15. `show()` during the fade-out keeps the component open and starts the display time again.
16. `toggle()` during the fade-out keeps the component open.
17. `hide()` after a `show()` during the fade-out fades the component out, and the first fade-out does not close it at
    once.
18. `hide()` during the fade-out resolves `false` and does not start the fade-out again.
19. `container` positioning adds an anchor name to the container and `position-anchor` to the component, and removes
    both on close.
20. Two components in one container add their names to the same `anchor-name`, and each close removes only its own.
21. A container with anchor names of its own keeps them and becomes the `source`.
22. A container that gets anchor names of its own while two components are open keeps them, and both components
    show again with it as the `source`.
23. A new `style` attribute on the container or the component does not remove the anchor.
24. `container` positioning places the component inside the container, at the bottom.
25. In a shadow root without a wrapper, `container` positioning uses the host as the `source`, sets no anchor names,
    and places the component inside the host.

### Not covered by the suite

- The suite asserts that `viewport` positioning leaves no inline anchor styles, but does not assert where `top`,
  `middle` and `bottom` actually place the component.
- The `container` path with no visible ancestor, where `show` resolves `false`, has no case.

## Assumptions and limitations

- The toast is not interactive. Use [`igc-snackbar`](../snackbar/spec.md) when the end-user should be able to act on
  the message.
- The component does not stack or queue several toasts; that is up to the application.

## Accessibility

### ARIA roles and properties

- The message is exposed as a live region and announced politely, so it reaches assistive technology without
  stealing focus.
- The component contains nothing focusable and never moves focus when it appears.
- The display time waits while the pointer is on the toast, so that the user has time to read the message
  ([WCAG 2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable)).

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

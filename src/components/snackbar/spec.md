# Snackbar specification

- [Snackbar specification](#snackbar-specification)
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
      - [The action](#the-action)
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
    - [DOM](#dom)
    - [Public API](#public-api)
    - [Positioning tests](#positioning-tests)
    - [Events tests](#events-tests)
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

The `igc-snackbar` provides feedback about an operation by showing a brief message, by default at the bottom of the
screen. Unlike [`igc-toast`](../toast/spec.md), it carries an action - a single button the end-user can activate to
respond to the message, for example to undo the operation it reports.

It closes itself after a display time, unless it is configured to stay open.

### Key features

- **A message and an action**: the action is rendered from a text property, or replaced with projected content.
- **Auto-dismiss** after a configurable display time, which can be turned off.
- **Two positioning strategies**: against the viewport, or inside the closest visible ancestor.
- **Three positions**: top, middle and bottom.
- **Declarative invocation** through the Invoker Commands API, with no JavaScript.

### Acceptance criteria

- The component must display a brief message with an optional action.
- It must close itself after the display time, unless it is kept open.
- It must expose show, hide and toggle methods that report whether the state changed.
- It must emit an event when the action is activated.
- It must position itself against the viewport or inside the closest visible ancestor.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to:

- be told briefly that an operation has completed, without losing my place on the page.
- be able to act on that message, for example to undo what just happened.
- have the message disappear on its own when I do not act on it.

### Developer stories

As a developer, I expect to be able to:

- show a brief message about an operation and have it dismiss itself.
- set the text of the action, or project my own action element.
- be notified when the end-user activates the action.
- keep the message open until I close it.
- position the message against the viewport or within a container.
- show and hide the message declaratively, without writing JavaScript.

## Functionality

### End-user experience

The snackbar slides into the configured position, showing its message and the action button. After the display time
it disappears on its own, unless `keep-open` is set. Activating the action emits an event; the application decides
whether that also closes the snackbar.

### Developer experience

#### Basic initialization

```html
<igc-snackbar action-text="Undo">Item deleted</igc-snackbar>
```

```typescript
await snackbar.show();
```

#### The action

```html
<!-- Default action rendered from the property -->
<igc-snackbar action-text="Undo">Item deleted</igc-snackbar>

<!-- Custom action content -->
<igc-snackbar>
  Item deleted
  <igc-button slot="action" variant="flat">Undo</igc-button>
</igc-snackbar>
```

```typescript
snackbar.addEventListener('igcAction', () => restoreItem());
```

#### Display time

```html
<igc-snackbar display-time="8000">Saved</igc-snackbar>
<igc-snackbar keep-open>Stays until closed</igc-snackbar>
```

#### Positioning

```html
<igc-snackbar position="top">Against the viewport</igc-snackbar>
<igc-snackbar positioning="container" position="bottom">Inside a container</igc-snackbar>
```

| `positioning`        | Behavior                                                                          |
| -------------------- | ----------------------------------------------------------------------------------- |
| `viewport` (default) | Positions against the viewport, ignoring every ancestor.                           |
| `container`          | Positions inside the bounding box of the closest visible ancestor, at `position`.  |

With `container` positioning, `show()` resolves `false` when no visible ancestor is found.

#### Invoker commands

```html
<igc-button commandfor="feedback" command="--show">Delete</igc-button>
<igc-snackbar id="feedback" action-text="Undo">Item deleted</igc-snackbar>
```

The supported commands are `--show`, `--hide` and `--toggle`, on both Ignite and native buttons.

### Localization

The component renders no built-in strings. The message and the action text come from the application.

### Keyboard interactions

None of its own. The action, whether the default button or projected content, is reachable and activated with the
standard button keys.

## API

### Properties and attributes

| Property    | Attribute    | Reflected | Type                       | Default    | Description                                                 |
| ----------- | ------------ | --------- | -------------------------- | ---------- | ------------------------------------------------------------- |
| open        | open         | Yes       | `boolean`                  | false      | The open state of the component.                            |
| actionText  | action-text  | No        | `string \| undefined`      | -          | The text of the action button.                              |
| displayTime | display-time | No        | `number`                   | 4000       | The time in milliseconds that the component stays visible.  |
| keepOpen    | keep-open    | Yes       | `boolean`                  | false      | Keeps the component open after the display time is over.    |
| position    | position     | Yes       | `AbsolutePosition`         | `bottom`   | The position of the component in the viewport.              |
| positioning | positioning  | Yes       | `NotificationPositioning`  | `viewport` | The positioning strategy of the component.                  |

### Methods

| Name   | Type signature         | Description                                                                         |
| ------ | ---------------------- | ------------------------------------------------------------------------------------- |
| show   | `(): Promise<boolean>` | Opens the component. Resolves `false` when it is already open, or when `container` positioning finds no visible ancestor. |
| hide   | `(): Promise<boolean>` | Closes the component. Resolves `false` when it is already closed.                    |
| toggle | `(): Promise<boolean>` | Toggles the component. Resolves `true` when the state changed.                       |

### Events

| Name      | Cancellable | Description                                          |
| --------- | ----------- | ---------------------------------------------------- |
| igcAction | false       | Emitted when the snackbar action button is clicked.  |

### Slots

| Name      | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| (default) | Default slot to render the snackbar content.                             |
| `action`  | Renders the action part of the snackbar. Usually an interactive element. |

### CSS Shadow parts

| Part               | Description                                 |
| ------------------ | ------------------------------------------- |
| `base`             | The base wrapper of the snackbar component. |
| `message`          | The snackbar message.                       |
| `action`           | The default snackbar action button.         |
| `action-container` | The area holding the actions.               |

## Test scenarios

The suite lives in [`snackbar.spec.ts`](./snackbar.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. It also runs the shared `runInvokerCommandsTests` suite from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### DOM

1. The component renders its message, action container and default action.
2. Content projected in the `action` slot replaces the default action button.
3. The component passes the accessibility audit.

### Public API

4. `show`, `hide` and `toggle` transition the open state and resolve with whether it changed.
5. `displayTime` closes the component after the configured interval.
6. `keepOpen` keeps the component open after the display time.
7. The Invoker Commands integration calls `show`, `hide` and `toggle`.

### Positioning tests

8. `position` places the component at the top, the middle and the bottom.
9. `positioning="container"` positions inside the closest visible ancestor, and `show` resolves `false` when there
   is none.

### Events tests

10. `igcAction` is emitted when the action button is clicked.

## Assumptions and limitations

- Only one action is supported.
- Activating the action does not close the snackbar on its own; the application decides.
- The component does not stack or queue several snackbars; that is up to the application.

## Accessibility

### ARIA roles and properties

- The message region is announced politely, so the feedback reaches assistive technology without stealing focus.
- The action is a button and is reachable with the keyboard while the snackbar is open.
- The component does not move focus when it appears.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

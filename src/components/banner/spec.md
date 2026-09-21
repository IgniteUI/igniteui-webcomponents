# Banner specification

- [Banner specification](#banner-specification)
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
      - [Using the available slots](#using-the-available-slots)
      - [Opening and closing](#opening-and-closing)
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
    - [Initialization](#initialization)
    - [Methods tests](#methods-tests)
    - [Interrupted transitions](#interrupted-transitions)
    - [Action tests](#action-tests)
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

The `igc-banner` is a non-modal notification that displays an important, concise message requiring acknowledgement.
It slides into view with an animated grow transition and renders **inline**, pushing the surrounding page content
rather than overlaying it.

Unlike [`igc-toast`](../toast/spec.md) and [`igc-snackbar`](../snackbar/spec.md), a banner does not dismiss itself;
the end-user acknowledges it through an action.

### Key features

- **Inline presentation**: the banner pushes the page content instead of covering it.
- **Animated grow transition** on show and hide.
- **A default action**: an OK dismiss button is rendered when nothing is projected into the actions area.
- **A prefix area** for an icon or illustration that reinforces the message type.
- **Declarative invocation** through the Invoker Commands API, with no JavaScript.

### Acceptance criteria

- The banner must render inline and push the surrounding content rather than overlay it.
- It must display a message, an optional illustration and an action area.
- It must render a default dismiss action when no action content is projected.
- It must expose animated show, hide and toggle methods that report whether the transition happened.
- It must emit a cancelable event before closing through the default action, and a completion event afterwards.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to:

- be shown an important message that does not block the rest of the page.
- understand the type of the message from an accompanying icon.
- acknowledge and dismiss the message with a clear action.

### Developer stories

As a developer, I expect to be able to:

- show an important message inline, without covering the page content.
- provide an icon or illustration alongside the message.
- replace the default dismiss action with my own actions.
- open and close the banner programmatically, with animation, and be told whether it happened.
- cancel the closing sequence when the default action is activated.
- open and close the banner declaratively, without writing JavaScript.

## Functionality

### End-user experience

The banner grows into view at its place in the document, pushing the content below it down. It shows an optional
illustration, the message, and an action area holding a default OK button or the projected actions. Activating the
default button closes the banner with the reverse animation.

### Developer experience

#### Basic initialization

```html
<igc-banner>You have unsaved changes.</igc-banner>
```

```typescript
await banner.show();
```

#### Using the available slots

```html
<igc-banner>
  <igc-icon slot="prefix" name="warning"></igc-icon>
  Your subscription expires in three days.
  <div slot="actions">
    <igc-button variant="flat">Remind me later</igc-button>
    <igc-button>Renew</igc-button>
  </div>
</igc-banner>
```

Content projected into `actions` replaces the default OK dismiss button entirely.

#### Opening and closing

```typescript
await banner.show();
await banner.hide();
await banner.toggle();
```

The three methods animate the transition and resolve with whether it completed - `false` when the banner was already
in that state, or when a newer transition superseded this one. Setting the `open` property instead shows or hides
the banner immediately, without animation and without emitting the close events.

#### Invoker commands

```html
<igc-button commandfor="notice" command="--toggle">Toggle notice</igc-button>
<igc-banner id="notice">You have unsaved changes.</igc-banner>
```

The supported commands are `--show`, `--hide` and `--toggle`, on both Ignite and native buttons.

### Localization

The default action renders the built-in OK label. Everything else - the message and any custom actions - comes from
the application. Project your own actions to control that text.

### Keyboard interactions

None of its own. The actions, whether the default button or projected content, are reachable and activated with the
standard button keys.

## API

### Properties and attributes

| Property | Attribute | Reflected | Type      | Default | Description                                                                 |
| -------- | --------- | --------- | --------- | ------- | ----------------------------------------------------------------------------- |
| open     | open      | Yes       | `boolean` | false   | Whether the banner is open. Setting it skips the animation and the close events. |

### Methods

| Name   | Type signature         | Description                                                    |
| ------ | ---------------------- | ---------------------------------------------------------------- |
| show   | `(): Promise<boolean>` | Opens the banner with an animated grow-in transition.          |
| hide   | `(): Promise<boolean>` | Closes the banner with an animated grow-out transition.        |
| toggle | `(): Promise<boolean>` | Toggles the banner depending on its current state.             |

Each resolves with `true` when the transition completed, and with `false` when the banner was already in that state
or the transition was superseded by a newer one.

### Events

| Name       | Cancellable | Description                                                                                   |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------- |
| igcClosing | true        | Emitted just before the banner closes in response to the default action button being clicked. Call `preventDefault()` to abort the sequence. |
| igcClosed  | false       | Emitted after the banner has fully closed and its exit animation has completed.               |

### Slots

| Name      | Description                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------ |
| (default) | The banner message text content.                                                                     |
| `prefix`  | An icon or illustration rendered before the message, reinforcing the message type.                   |
| `actions` | Custom action elements rendered in the action area. Replaces the default dismiss button when provided. |

### CSS Shadow parts

| Part           | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| `base`         | The root wrapper element of the banner.                         |
| `spacer`       | The inner wrapper controlling the spacing around the content.   |
| `message`      | The container holding the illustration and the text content.    |
| `illustration` | The container for the prefix slot.                              |
| `content`      | The container for the default message slot.                     |
| `actions`      | The container for the action buttons slot.                      |

## Test scenarios

The suite lives in [`banner.spec.ts`](./banner.spec.ts) and runs in a real browser through `@web/test-runner` with
`@open-wc/testing` fixtures and assertions. It also runs the shared `runInvokerCommandsTests` suite from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### Initialization

1. The component is initialized with its default state and passes the accessibility audit.
2. The default OK action is rendered when nothing is projected into `actions`.
3. Content projected into `prefix` and `actions` is rendered in the expected containers.

### Methods tests

4. `show`, `hide` and `toggle` transition the open state with animation and resolve with whether it changed.
5. Setting `open` transitions without animation and without emitting the close events.
6. The Invoker Commands integration calls `show`, `hide` and `toggle`.

### Interrupted transitions

7. A transition superseded by a newer one resolves `false` and settles in the correct final state.

### Action tests

8. Activating the default action closes the banner and emits `igcClosing` and `igcClosed`.
9. Canceling `igcClosing` aborts the closing sequence and keeps the banner open.

## Assumptions and limitations

- The banner is non-modal and inline; it never overlays the page content.
- It does not dismiss itself after a timeout. Use [`igc-toast`](../toast/spec.md) or
  [`igc-snackbar`](../snackbar/spec.md) for transient feedback.
- `igcClosing` is emitted for the default action path; hiding through the API or the `open` property does not emit
  the close events.

## Accessibility

### ARIA roles and properties

- The banner is part of the document flow, so it is reached in reading order without a live region.
- The illustration in the `prefix` slot is decorative; give it an accessible name only when it carries meaning that
  the message does not.
- The default action is a button with an accessible name, reachable with the keyboard.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The illustration and the
action area follow the inline direction.

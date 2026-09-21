# Dialog specification

- [Dialog specification](#dialog-specification)
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
      - [Content areas](#content-areas)
      - [Opening and closing](#opening-and-closing)
      - [Invoker commands](#invoker-commands)
      - [Dismissal behavior](#dismissal-behavior)
      - [Forms and the return value](#forms-and-the-return-value)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [WAI-ARIA tests](#wai-aria-tests)
    - [DOM](#dom)
    - [API tests](#api-tests)
    - [Interrupted transitions](#interrupted-transitions)
    - [Events and behaviors](#events-and-behaviors)
    - [Form](#form)
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

## Overview

The `igc-dialog` is a modal dialog built on the native `dialog` element. It traps focus while open and blocks
interaction with the rest of the page, supports animated open and close transitions, an optional backdrop overlay,
and several content areas through named slots.

Dialogs inform the end-user about a task. They contain important information or require a decision, appear on top of
all other content, and stay on screen until they are confirmed, dismissed, or the required action has been taken.

### Key features

- **Native modal semantics**: focus trapping, inert page content and the top layer come from the platform.
- **Structured content**: a header, a dedicated message area, a general content area and a footer.
- **A default action**: an OK button is rendered when nothing is projected in the footer.
- **Animated transitions** with a backdrop that animates alongside the surface.
- **Declarative invocation** through the Invoker Commands API, with no JavaScript.
- **Form integration**: a `form[method="dialog"]` inside the dialog sets the return value on submit.
- **Configurable dismissal**: <kbd>Escape</kbd> can be blocked, and an outside click can be made to close.

### Acceptance criteria

- The dialog must render as a modal, disabling interaction with the rest of the application while it is open.
- It must expose a title through an attribute and through a slot, a message area, a content area and a footer.
- It must render a default close action when no footer content is projected, unless that is turned off.
- It must support animated show, hide and toggle transitions, and report whether the transition happened.
- It must emit cancelable closing events and completion events.
- It must close with the appropriate return value when a `form[method="dialog"]` inside it is submitted.
- It must optionally keep itself open on <kbd>Escape</kbd>, and optionally close on an outside click.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- get a dialog inside the application, so I am notified about important information.
- read a title, so I know what the dialog is about.
- read a message, so I get the details.
- be told what action I have to take to dismiss the dialog.
- have my focus kept inside the dialog while it is open.

### Developer stories

As a developer, I expect to be able to:

- show a dialog with a title, a message and my own content.
- add buttons to the dialog.
- disable the rest of the application while the dialog is shown, so the end-user must take action.
- decide whether <kbd>Escape</kbd> and an outside click dismiss the dialog.
- read a return value after the dialog closes, including from a submitted dialog form.
- open and close the dialog declaratively, without writing JavaScript.
- customize the appearance of the dialog to fit my application.

## Functionality

### End-user experience

[Design hand-off in Figma with all themes](https://www.figma.com/file/LgTztHpwu79XdpMSJrAJwY/Dialog?node-id=0%3A1)

The dialog fades in over a backdrop that covers the page. The header shows the title, the body shows the message and
any additional content, and the footer holds the actions - by default a single OK button that closes the dialog.
While the dialog is open, focus stays inside it and the rest of the page cannot be interacted with.

### Developer experience

#### Basic initialization

```html
<igc-dialog title="Delete item">
  <span slot="message">This action cannot be undone.</span>
</igc-dialog>
```

#### Content areas

```html
<igc-dialog>
  <h3 slot="title">Delete item</h3>
  <span slot="message">This action cannot be undone.</span>

  <p>Any additional content goes in the default slot.</p>

  <div slot="footer">
    <igc-button variant="flat">Cancel</igc-button>
    <igc-button>Delete</igc-button>
  </div>
</igc-dialog>
```

The `title` slot overrides the `title` attribute. The `message` area is hidden when nothing is assigned to it.
Footer content replaces the default OK button entirely; `hide-default-action` removes that button when no footer
content is projected.

#### Opening and closing

```typescript
await dialog.show();
await dialog.hide();
await dialog.toggle();
```

The three methods animate the transition and resolve with whether it completed - `false` when the dialog was already
in that state, or when a newer transition superseded this one. Setting the `open` property instead opens or closes
the dialog immediately, without animation and without emitting the close events.

#### Invoker commands

The component integrates with the
[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API): a button with
`command` and `commandfor` calls the matching method declaratively.

```html
<igc-button commandfor="confirm" command="--show">Delete</igc-button>
<igc-dialog id="confirm" title="Delete item"></igc-dialog>
```

The supported commands are `--show`, `--hide` and `--toggle`, and both Ignite buttons and native `button` elements
work.

#### Dismissal behavior

```html
<!-- Escape does not close the dialog -->
<igc-dialog keep-open-on-escape></igc-dialog>

<!-- Clicking the backdrop closes the dialog -->
<igc-dialog close-on-outside-click></igc-dialog>
```

#### Forms and the return value

```html
<igc-dialog id="confirm" title="Delete item">
  <form method="dialog">
    <igc-button type="submit" value="cancel">Cancel</igc-button>
    <igc-button type="submit" value="confirm">Delete</igc-button>
  </form>
</igc-dialog>
```

```typescript
dialog.addEventListener('igcClosed', () => {
  if (dialog.returnValue === 'confirm') {
    // ...
  }
});
```

`returnValue` is set automatically from the submitter of a `form[method="dialog"]`, and can also be assigned before
calling `hide()`.

### Localization

None applicable beyond the default action. The title, the message, the content and any custom actions come from the
application.

### Keyboard interactions

| Key combination   | Result                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| <kbd>Escape</kbd> | Closes the dialog, unless `keep-open-on-escape` is set. Inner components that handle the key themselves, such as an open dropdown, consume the first press. |
| <kbd>Tab</kbd>    | Moves focus between the focusable elements inside the dialog; focus is trapped while open.  |

## API

### Properties and attributes

| Property            | Attribute               | Reflected | Type                  | Default | Description                                                              |
| ------------------- | ----------------------- | --------- | --------------------- | ------- | ------------------------------------------------------------------------ |
| open                | open                    | Yes       | `boolean`             | false   | Whether the dialog is open. Setting it skips the animation and the close events. |
| title               | title                   | No        | `string`              | -       | The title displayed in the dialog header. Overridden by the `title` slot. |
| keepOpenOnEscape    | keep-open-on-escape     | No        | `boolean`             | false   | When set, pressing <kbd>Escape</kbd> will not close the dialog.          |
| closeOnOutsideClick | close-on-outside-click  | No        | `boolean`             | false   | When set, clicking the backdrop closes the dialog.                       |
| hideDefaultAction   | hide-default-action     | No        | `boolean`             | false   | When set, the built-in OK button is not rendered.                        |
| returnValue         | -                       | No        | `string \| undefined` | -       | The return value of the dialog.                                          |

### Methods

| Name   | Type signature         | Description                                                                  |
| ------ | ---------------------- | ----------------------------------------------------------------------------- |
| show   | `(): Promise<boolean>` | Opens the dialog with an animated transition.                                |
| hide   | `(): Promise<boolean>` | Closes the dialog with an animated transition.                               |
| toggle | `(): Promise<boolean>` | Toggles the dialog depending on its current state.                           |

Each resolves with `true` when the transition completed, and with `false` when the dialog was already in that state
or the transition was superseded by a newer one.

### Events

| Name       | Cancellable | Description                                                                     |
| ---------- | ----------- | --------------------------------------------------------------------------------- |
| igcClosing | true        | Emitted just before the dialog closes. Call `preventDefault()` to abort the sequence. |
| igcClosed  | false       | Emitted after the dialog has fully closed and its exit animation has completed. |

### Slots

| Name      | Description                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------ |
| (default) | General-purpose content area. Also the target for a `form[method="dialog"]` inside the dialog.  |
| `title`   | Content rendered in the dialog header. Falls back to the `title` attribute when empty.          |
| `message` | A dedicated message area rendered above the default slot. Hidden when no content is assigned.   |
| `footer`  | Content rendered in the dialog footer. When empty, a default OK close button is shown.          |

### CSS Shadow parts

| Part        | Description                                                |
| ----------- | ---------------------------------------------------------- |
| `base`      | The native `dialog` element.                               |
| `title`     | The header element wrapping the title slot.                |
| `content`   | The section element wrapping the message and default slots. |
| `footer`    | The footer element wrapping the footer slot.               |
| `backdrop`  | The decorative backdrop overlay element.                   |
| `animating` | Applied to the backdrop while an animation is running.     |

## Test scenarios

The suite lives in [`dialog.spec.ts`](./dialog.spec.ts) and runs in a real browser through `@web/test-runner` with
`@open-wc/testing` fixtures and assertions. It also runs the shared `runInvokerCommandsTests` suite from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### WAI-ARIA tests

1. The dialog exposes a `dialog` role and is labelled by its title.
2. The component passes the accessibility audit in the open state.

### DOM

3. A header is rendered when `title` is set through the attribute, and when it is set through the `title` slot.
4. Content projected in the `footer` slot is rendered below the header and the content.
5. The default OK action is rendered only when no footer content is projected, and not when `hideDefaultAction` is
   set.

### API tests

6. `show`, `hide` and `toggle` transition the state and emit the corresponding events.
7. Setting `open` transitions without animation and without emitting the close events.
8. The Invoker Commands integration calls `show`, `hide` and `toggle` from `--show`, `--hide` and `--toggle`.

### Interrupted transitions

9. A transition superseded by a newer one resolves `false` and settles in the correct final state.

### Events and behaviors

10. `igcClosing` and `igcClosed` are emitted when the dialog closes.
11. `igcClosing` can be canceled to abort the closing sequence.
12. The dialog closes on an outside click when `closeOnOutsideClick` is set, and does not when it is not.

### Form

13. The dialog closes with the appropriate `returnValue` when a `form[method="dialog"]` inside it is submitted.

### Not covered by the suite

Focus trapping and the two-step <kbd>Escape</kbd> behavior - where an open inner dropdown consumes the first press -
are verified manually rather than by the suite.

## Assumptions and limitations

- The dialog is always modal; a non-modal presentation is not supported.
- Setting `open` skips the animations and the close events by design; the methods are the animated path.
- The backdrop is decorative; its click behavior is opt-in through `closeOnOutsideClick`.

## Accessibility

### ARIA roles and properties

- The dialog is a native `dialog` element shown modally, so the role, the focus trap, the inert page content and the
  top layer come from the platform.
- The dialog is labelled by its title, from the `title` slot or the `title` attribute.
- The backdrop is decorative and is not exposed to assistive technology.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

# igc-dialog

A modal dialog component built on the native `<dialog>` element.

The dialog traps focus while open and blocks interaction with the rest
of the page (modal semantics). It supports animated open/close
transitions, a backdrop overlay, and multiple content areas
through named slots.

The component supports the
[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
A button with `command="--show"`, `"--hide"` or `"--toggle"` and a `commandfor`
that points to this element calls the matching method.

```ts
import { defineComponents, IgcDialogComponent } from 'igniteui-webcomponents';

defineComponents(IgcDialogComponent);
```

## Properties

- `keepOpenOnEscape`: `boolean`. Default: `false`. Attribute: `keep-open-on-escape`.
  Whether the dialog stays open when the user presses the `Escape` key.

  Use it when the dialog guards unsaved work and needs an explicit user
  action to close.
- `closeOnOutsideClick`: `boolean`. Default: `false`. Attribute: `close-on-outside-click`.
  Whether a click on the backdrop, outside the dialog surface, closes the
  dialog. The close emits the close events.

  Has no effect when the dialog is not yet open.
- `hideDefaultAction`: `boolean`. Default: `false`. Attribute: `hide-default-action`.
  Whether the default action button in the footer is hidden.

  Has no effect when content is projected into the `footer` slot, because
  the slot content replaces the default button.
- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the dialog is open.

  Setting it skips the animation and the close events. Use the `show()`,
  `hide()` and `toggle()` methods for an animated transition.
- `title`: `string`. Attribute: `title`.
  The title displayed in the dialog header.

  Overridden by any content projected into the `title` slot.
- `returnValue`: `string | undefined`. No attribute.
  The return value of the dialog.

  Automatically set to the `value` of the submitter element when a
  `<form method="dialog">` inside the dialog is submitted. Can also
  be set programmatically before calling `hide()`.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<IDialogResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Methods

- `show(): Promise<boolean>`
  Opens the dialog with an animated fade-in transition.

  Returns `true` when the dialog was successfully opened, or `false` if it
  was already open or opening, the transition was superseded by a newer one,
  or `open` was set to `false` during it.
- `hide(): Promise<boolean>`
  Closes the dialog with an animated fade-out transition.

  Returns `true` when the dialog was successfully closed, or `false` if it
  was already closed or closing, the transition was superseded by a newer
  one, or `open` was set to `false` and then to `true` during it.
- `toggle(): Promise<boolean>`
  Toggles the dialog open or closed depending on its current state.

  Equivalent to calling `show()` when closed and `hide()` when open.
  Returns `true` when the transition completed successfully, with the same
  `false` cases as these methods.

## Events

- `igcClosing`
  Emitted before the dialog closes on a user action. Cancelable - call `event.preventDefault()` to abort the closing sequence.
- `igcClosed`
  Emitted after the dialog closes on a user action and its exit animation completes.

## Slots

- default: General-purpose content area. A `<form method="dialog">` in this slot closes the dialog on submit.
- `title`: Content rendered in the dialog header. Falls back to the `title` attribute when empty.
- `message`: A dedicated message/body area rendered above the default slot. Hidden when no content is assigned.
- `footer`: Content rendered in the dialog footer. When empty, a default action button is shown (unless `hide-default-action` is set).

## CSS parts

- `base`: The native `<dialog>` element. Style the backdrop with `::part(base)::backdrop`.
- `titled`: Added to the base part when the dialog has a title.
- `footed`: Added to the base part when the footer has slotted content or a default action.
- `title`: The `<header>` element wrapping the title slot.
- `content`: The `<section>` element wrapping the message and default slots.
- `footer`: The `<footer>` element wrapping the footer slot.

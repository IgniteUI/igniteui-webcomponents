# igc-banner

A non-modal notification banner that displays important, concise messages
requiring user acknowledgement.

The banner slides into view with an animated grow transition and renders
inline, pushing the surrounding page content rather than overlaying it.

The component supports the
[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
A button with `command="--show"`, `"--hide"` or `"--toggle"` and a
`commandfor` that points to this element calls the matching method.

```ts
import { defineComponents, IgcBannerComponent } from 'igniteui-webcomponents';

defineComponents(IgcBannerComponent);
```

## Properties

- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the banner is open.

  Setting it skips the animation and the close events. Use the `show()`,
  `hide()` and `toggle()` methods for an animated transition.

## Methods

- `show(): Promise<boolean>`
  Opens the banner with an animated grow-in transition.

  Returns `true` when the banner was successfully opened, or `false` if it
  was already open or opening, the transition was superseded by a newer one,
  or `open` was set to `false` during it.
- `hide(): Promise<boolean>`
  Closes the banner with an animated grow-out transition.

  Returns `true` when the banner was successfully closed, or `false` if it
  was already closed or closing, the transition was superseded by a newer
  one, or `open` was set to `false` and then to `true` during it.
- `toggle(): Promise<boolean>`
  Toggles the banner open or closed depending on its current state.

  Equivalent to calling `show()` when closed and `hide()` when open.
  Returns `true` when the transition completed successfully, with the same
  `false` cases as these methods.

## Events

- `igcClosing`
  Emitted just before the banner closes in response to the default action button being clicked. Cancelable - call `event.preventDefault()` to abort the closing sequence.
- `igcClosed`
  Emitted after the banner has fully closed and its exit animation has completed.

## Slots

- default: The banner message text content.
- `prefix`: An icon or illustration rendered before the message, reinforcing the message type.
- `actions`: Custom action elements rendered in the banner's action area. When provided, replaces the default "OK" dismiss button.

## CSS parts

- `base`: The root wrapper element of the banner.
- `spacer`: The inner wrapper that controls the spacing around the banner content.
- `message`: The container that holds the illustration and text content.
- `illustration`: The container for the prefix slot (icon/illustration).
- `content`: The container for the default message slot.
- `actions`: The container for the action buttons slot.

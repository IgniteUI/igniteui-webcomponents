# igc-nav-drawer

A side navigation container that provides
quick access between views within an application.

The edge positions (`start`, `end`, `top`, `bottom`) render a modal `<dialog>`
with a focus trap and a backdrop. The `relative` position renders an inline
`<nav>` landmark.

Content in the `mini` slot renders a compact variant, which shows while the
drawer is closed.

The component integrates with the
[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):
an Ignite button or a native `<button>` with `command="--show"` / `"--hide"` / `"--toggle"`
and `commandfor` pointing to this element calls the corresponding method
declaratively without any JavaScript.

```ts
import { defineComponents, IgcNavDrawerComponent } from 'igniteui-webcomponents';

defineComponents(IgcNavDrawerComponent);
```

## Properties

- `position`: `'bottom' | 'top' | 'start' | 'end' | 'relative'`. Default: `'start'`. Attribute: `position`, reflected.
  The position of the drawer.

  - `start` - anchored to the inline-start edge (default).
  - `end` - anchored to the inline-end edge.
  - `top` - anchored to the block-start edge.
  - `bottom` - anchored to the block-end edge.
  - `relative` - rendered inline within the page flow; no modal backdrop.
- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the drawer is open.
- `keepOpenOnEscape`: `boolean`. Default: `false`. Attribute: `keep-open-on-escape`.
  Whether the drawer stays open when the user presses Escape. Applies only to the
  edge positions, because Escape does not close a relative drawer.
- `label`: `string | undefined`. Attribute: `label`.
  The accessible label of the `<dialog>`, or of the `<nav>` landmark in the `relative`
  position, and of the mini variant. Give each navigation landmark on a page a distinct label.

## Methods

- `show(): Promise<boolean>`
  Opens the drawer. Returns `true` on success, or `false` when it is already open.
- `hide(): Promise<boolean>`
  Closes the drawer. Returns `true` after the exit, or `false` when it is already closed or a
  reopen ends the exit.
- `toggle(): Promise<boolean>`
  Toggles the open state of the drawer.

## Events

- `igcClosing`
  Emitted before a user interaction closes the drawer. Cancelable - call `event.preventDefault()` to abort the closing sequence.
- `igcClosed`
  Emitted after a user interaction closes the drawer and the exit ends.

## Slots

- default: Renders the main navigation content of the drawer.
- `mini`: Renders the compact mini variant of the drawer.

## CSS parts

- `base`: The base wrapper of the drawer.
- `main`: The main content container of the drawer.
- `mini`: The mini variant container of the drawer.
- `hidden`: Added to the mini part when the mini slot has no content.

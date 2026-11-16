# igc-snackbar

Shows a brief message about an operation, with an optional action.

The component supports the
[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
A button with `command="--show"`, `"--hide"` or `"--toggle"` and a
`commandfor` that points to this element calls the matching method.

```ts
import { defineComponents, IgcSnackbarComponent } from 'igniteui-webcomponents';

defineComponents(IgcSnackbarComponent);
```

## Properties

- `actionText`: `string | undefined`. Attribute: `action-text`.
  The text of the action button.
- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the component is open.

  Setting it skips the fade. Use the `show()`, `hide()` and `toggle()`
  methods for a fade.
- `displayTime`: `number`. Default: `4000`. Attribute: `display-time`.
  The time in milliseconds that the component stays visible. The time
  stops while the pointer or the keyboard focus is in the component, and
  starts again from the full value when both leave. A value of 0 or less
  keeps the component open.
- `keepOpen`: `boolean`. Default: `false`. Attribute: `keep-open`, reflected.
  Whether the component stays open after the `displayTime` is over.
- `position`: `'bottom' | 'middle' | 'top'`. Default: `'bottom'`. Attribute: `position`, reflected.
  The position of the component in the viewport or in the container.
- `positioning`: `'viewport' | 'container'`. Default: `'viewport'`. Attribute: `positioning`, reflected.
  The positioning strategy of the component.

  `viewport` - positions against the viewport, ignoring every ancestor.
  `container` - positions inside the bounding box of the closest visible
  ancestor, at the place that `position` sets.

## Methods

- `show(): Promise<boolean>`
  Opens the component, also during the fade-out of `hide()`. When it is
  already open, the display time starts again, and the promise resolves to
  `false`. It also resolves to `false` when `container` positioning finds no
  visible ancestor, or when `open` is set to `false` during the fade-in.
- `hide(): Promise<boolean>`
  Closes the component. Resolves to `false` when it is already closed or
  fades out, or when `open` is set to `false` and then to `true` during the
  fade-out.
- `toggle(): Promise<boolean>`
  Opens the component when it is closed, and closes it when it is open.
  Resolves to `true` when the state changes.

## Events

- `igcAction`
  Emitted when the user clicks the default action button or the content of the `action` slot.

## Slots

- default: The content of the snackbar.
- `action`: The action of the snackbar, usually a button. Replaces the default action button.

## CSS parts

- `base`: The base wrapper of the snackbar component.
- `message`: The snackbar message.
- `action`: The default snackbar action button.
- `action-container`: The area holding the actions.

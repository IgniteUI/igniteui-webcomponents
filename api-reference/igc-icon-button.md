# igc-icon-button

A button that displays a single icon, designed for compact, icon-only
interactions such as toolbar actions, floating action buttons, or inline
controls.

The icon is sourced from the icon registry via the `name` and `collection`
attributes. Like the normal button, it can render as an anchor element when
`href` is set and is fully form-associated.

```ts
import { defineComponents, IgcIconButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcIconButtonComponent);
```

## Properties

- `name`: `string | undefined`. Attribute: `name`.
  The name of the icon to display.
- `collection`: `string | undefined`. Attribute: `collection`.
  The collection the icon belongs to.
- `mirrored`: `boolean`. Default: `false`. Attribute: `mirrored`.
  Whether the icon is flipped horizontally. Use it for a directional icon
  in a right-to-left layout.
- `variant`: `'contained' | 'flat' | 'outlined'`. Default: `'contained'`. Attribute: `variant`, reflected.
  The variant of the button which determines its visual appearance.
  - `contained` – filled background; highest visual emphasis (default).
  - `outlined` – transparent background with a visible border.
  - `flat` – no background or border; lowest visual emphasis.
- `type`: `'button' | 'reset' | 'submit'`. Default: `'button'`. Attribute: `type`, reflected.
  The type of the button, which determines its behavior and semantics.
  - `'button'` – no default action; useful for custom JavaScript handlers.
  - `'submit'` – submits the associated form when clicked.
  - `'reset'` – resets the associated form fields to their initial values.

  Ignored when the button is rendered as a link (i.e. `href` is set).
- `href`: `string | undefined`. Attribute: `href`.
  The URL the button points to. When set, the component renders as an
  `<a>` element instead of a `<button>`, enabling navigation on click.
  Use together with `target`, `download`, and `rel` for full anchor semantics.
  A disabled link renders a disabled `<button>` with the link role, because an
  anchor has no disabled state.
- `download`: `string | undefined`. Attribute: `download`.
  Prompts the browser to download the linked resource rather than navigating
  to it. The optional value is used as the suggested file name.
  Only effective when `href` is set.
- `target`: `'_blank' | '_parent' | '_self' | '_top' | undefined`. Attribute: `target`.
  Where to open the linked document. Only effective when `href` is set.
  - `'_self'` – current browsing context (default browser behavior).
  - `'_blank'` – new tab or window.
  - `'_parent'` – parent browsing context; falls back to `_self` if none.
  - `'_top'` – top-level browsing context; falls back to `_self` if none.
- `rel`: `string | undefined`. Attribute: `rel`.
  The relationship between the current document and the linked URL.
  Accepts a space-separated list of link types (e.g. `'noopener noreferrer'`).
  Only effective when `href` is set. When `target="_blank"` is used,
  setting `rel="noopener noreferrer"` is strongly recommended for security.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the button is disabled. A disabled button ignores user interaction.
- `command`: `string | undefined`. Attribute: `command`, reflected.
  The command to invoke on the target element specified by `commandfor`.
  Part of the [Invoker Commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) API.
  Custom commands must start with two dashes (e.g. `'--my-command'`).
- `commandfor`: `string | null`. Attribute: `commandfor`.
  The ID of the target element for the invoker command.
  Part of the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
- `commandForElement`: `Element | null`. No attribute.
  The target element for the invoker command. Resolved from the `commandfor` ID.
- `form`: `HTMLFormElement | null`. Read-only. No attribute.
  The `<form>` element the button is associated with.
  Resolved through the standard form-association mechanism - either the
  closest ancestor `<form>` or the form referenced by the button's `form`
  attribute. Returns `null` when no form is associated.
  Relevant only when `type` is `'submit'` or `'reset'`.

## Methods

- `focus(options?: FocusOptions): void`
  Sets focus on the button.
- `blur(): void`
  Removes focus from the button.
- `click(): void`
  Simulates a mouse click on the button, triggering its click handler and any associated form action.

## Slots

- default: Renders content after the icon, such as text or a ripple.

## CSS parts

- `base`: The native button or anchor element.
- `icon`: The icon element of the icon button.

# igc-button

Represents a clickable button, used to submit forms or anywhere in a
document for accessible, standard button functionality.

The button has several visual variants. It renders as an anchor (`<a>`)
element when the `href` attribute is set. It is form-associated and can
act as a native `submit` or `reset` control.

```ts
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent);
```

## Properties

- `variant`: `'contained' | 'flat' | 'outlined' | 'fab'`. Default: `'contained'`. Attribute: `variant`, reflected.
  The variant of the button which determines its visual appearance.
  - `contained` – filled background; highest visual emphasis (default).
  - `outlined` – transparent background with a visible border.
  - `flat` – no background or border; lowest visual emphasis.
  - `fab` – floating action button shape; typically used for primary actions.
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

- default: Renders the label of the button.
- `prefix`: Renders content before the label of the button.
- `suffix`: Renders content after the label of the button.

## CSS parts

- `base`: The native button or anchor element.

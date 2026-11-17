# igc-copy-to-clipboard

Overlays a copy button on its slotted content. The button copies the
rendered text of the content to the clipboard.

```ts
import { defineComponents, IgcCopyToClipboardComponent } from 'igniteui-webcomponents';

defineComponents(IgcCopyToClipboardComponent);
```

## Properties

- `disableInteraction`: `boolean`. Default: `false`. Attribute: `disable-interaction`, reflected.
  Whether the copy button is hidden. The `--copy` command and `copy()`
  still copy the content.
- `format`: `'preserve' | 'plain'`. Default: `'plain'`. Attribute: `format`.
  How the copied text is formatted.
  - `plain`: Collapses whitespace, with one line break between blocks.
  - `preserve`: Keeps paragraph breaks and indentation.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<ICopyToClipboardResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Methods

- `copy(): Promise<IgcCopyToClipboardEventArgs>`
  Copies the content and resolves with the status and the text. The
  component shows and announces the status, but does not emit `igcCopy`.
  Use it where the browser does not support the `--copy` command.

  Browsers accept a clipboard write only during a user action, so call the
  method directly from the event handler, with no `await` before it. A
  component that is not rendered copies nothing and resolves with the
  `error` status.
- `focus(options?: FocusOptions): void`
  Sets focus on the copy button. With `disable-interaction`, the component does not take the focus.
- `blur(): void`
  Removes focus from the copy button.

## Events

- `igcCopy`
  Emitted after each copy action of the user, with its status and the text.

## Slots

- default: The content to display and copy.
- `copy-icon`: Overrides the default copy icon.
- `success-icon`: Overrides the default success icon.
- `error-icon`: Overrides the default error icon.

## CSS parts

- `button`: The copy button.

## CSS custom states

- `ig-success`: The component shows the success icon.
- `ig-error`: The component shows the error icon.

# igc-copy-to-clipboard

Overlays a copy button on its slotted content. The button copies the
rendered text of the content to the clipboard.

```ts
import { defineComponents, IgcCopyToClipboardComponent } from 'igniteui-webcomponents';

defineComponents(IgcCopyToClipboardComponent);
```

## Properties

- `disableInteraction`: `boolean`. Default: `false`. Attribute: `disable-interaction`, reflected.
  Whether the copy button is hidden and disabled. The `--copy` command
  still copies the content.
- `format`: `'preserve' | 'plain'`. Default: `'plain'`. Attribute: `format`.
  How the copied text is formatted.
  - `plain`: Collapses whitespace, with one line break between blocks.
  - `preserve`: Keeps paragraph breaks and indentation.

## Events

- `igcCopy`
  Emitted after each copy action, with its status and the text.

## Slots

- default: The content to display and copy.
- `copy-icon`: Overrides the default copy icon.
- `success-icon`: Overrides the default success icon.
- `error-icon`: Overrides the default error icon.

## CSS parts

- `button`: The copy button.
- `copy-button`: The copy button while it shows the copy icon.
- `success-button`: The copy button while it shows the success icon.
- `error-button`: The copy button while it shows the error icon.

## CSS custom states

- `ig-success`: The component shows the success icon.
- `ig-error`: The component shows the error icon.

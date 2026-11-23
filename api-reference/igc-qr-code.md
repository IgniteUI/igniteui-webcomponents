# igc-qr-code

Generates a QR code from a value and renders it as an SVG image.
Properties set the size, the shapes, the error correction level and an optional logo.

```ts
import { defineComponents, IgcQrCodeComponent } from 'igniteui-webcomponents';

defineComponents(IgcQrCodeComponent);
```

## Properties

- `value`: `string | undefined`. Attribute: `value`.
  The value to encode in the QR code. This can be any string, such as a URL, text, or other data.
  Without a value, the component renders nothing.
- `version`: `number | undefined`. Attribute: `version`.
  The version of the QR code to generate, which determines the size and data capacity of the QR code.
  Valid values are integers from 1 to 40, where each version corresponds to a specific module size and data capacity.

  When it is not set, or it is not an integer from 1 to 40, the component selects the smallest
  version that holds the value and that stays readable under the logo. When the value does not
  fit the version, the component renders nothing. On a version that is set, a logo gets smaller
  to keep the code readable.
- `errorLevel`: `'L' | 'M' | 'Q' | 'H'`. Default: `'M'`. Attribute: `error-level`.
  The error correction level for the QR code, which determines the QR code's ability to be read if it is partially obscured or damaged.
  Valid values are 'L', 'M', 'Q', and 'H', where 'L' provides the lowest level of error correction and 'H' provides the highest level.

  When the level is not set, the code uses 'M'. A logo that is larger than the safe area of 'M'
  raises the level to the smallest level that holds the logo. To restore this behavior, set
  `undefined` or remove the attribute.
- `size`: `number`. Default: `128`. Attribute: `size`.
  The size of the QR code in pixels. This determines the width and height of the generated QR code. The default value is 128 pixels.

  Each module covers a whole number of pixels, so the edges stay sharp. The pixels that are
  left over widen the quiet zone, and the code can be smaller than `size`. An exported image
  gets whole pixels at its own size.
- `margin`: `number`. Default: `4`. Attribute: `margin`.
  The margin (quiet zone) around the QR code, expressed as a number of QR code modules rather
  than pixels. This is the blank border area surrounding the code, which helps ensure that it
  can be properly scanned. It is a minimum: the modules cover whole pixels, and the pixels that
  are left over make the quiet zone wider.
- `logoSrc`: `string | undefined`. Attribute: `logo-src`.
  The source URL of an optional logo image at the center of the QR code.
  The component does not render a logo that fails to load, a `javascript:` or `vbscript:` URL,
  or a data URI that is not an image.
- `logoSize`: `number`. Default: `0.4`. Attribute: `logo-size`.
  The size of the logo, as a ratio of the maximum area that can safely be obscured by a logo
  while the QR code remains scannable (up to 9% of the code's area, at the highest error
  correction level). The value is a number from 0 to 1, where 0 means no logo and 1
  means the logo covers the full safe area (not the entire QR code). Other values are clamped.
  The default value is 0.4, meaning the logo covers 40% of that safe area (~3.6% of the QR code).
  The area of the code leaves out the quiet zone, so `margin` does not change the logo.

  When `error-level` is not set and the logo is larger than the safe area of level 'M', the
  component uses the smallest error correction level that holds the logo. When `error-level`
  is set, the logo does not grow past the safe area of that level.

  On a small code, the logo can hide more codewords than the error correction recovers. The
  component then uses a larger version, or, when `version` is set, a smaller logo.
- `logoMargin`: `number | undefined`. Attribute: `logo-margin`.
  The margin around the logo in pixels. This is the whitespace area surrounding the logo within the QR code,
  which helps ensure that the logo does not interfere with the QR code's scannability.
- `dotStyle`: `'square' | 'circle' | 'rounded' | 'squircle' | 'diamond' | 'plus' | 'liquid' | 'horizontal-bars' | 'vertical-bars'`. Default: `'square'`. Attribute: `dot-style`.
  The style of the data modules (dots) in the QR code. This can be 'square', 'circle',
  'rounded', 'squircle', 'diamond', 'plus', 'liquid', 'horizontal-bars' or 'vertical-bars'.
  'liquid' is 'rounded' with a smooth fill in the inside corners where modules join. The bar
  styles draw each run of dark modules in a row or a column as one bar with round ends.

  The inner dot of each finder-pattern corner uses the same style unless `cornerDotStyle` is
  set. It draws 'diamond' and 'plus' as 'square', and 'liquid' and the bar styles as
  'rounded'.
- `dotScale`: `number`. Default: `1`. Attribute: `dot-scale`.
  The size of each data module, as a ratio of its cell in the module grid. The value is a
  number from 0.7 to 1. Other values are clamped. A value below 1 leaves a gap between the
  modules, so 'rounded' modules do not join their neighbors, and 'liquid' draws as 'rounded'.
  For the bar styles, it sets the thickness of the bars and shortens their ends. The
  finder-pattern corners keep their full size. A smaller value can make the code harder to
  scan with a camera.
- `squareStyle`: `'square' | 'circle' | 'rounded' | 'squircle' | 'leaf'`. Default: `'square'`. Attribute: `square-style`.
  The style of the corner squares in the QR code. This can be 'square', 'circle', 'rounded',
  'squircle' or 'leaf'. A 'leaf' has two opposite round corners on the diagonal toward the
  center of the code. The rings of the alignment patterns use the same style, and a 'leaf'
  ring there has the shape of the top-left corner square.
- `cornerDotStyle`: `'square' | 'circle' | 'rounded' | 'squircle' | 'leaf' | undefined`. Attribute: `corner-dot-style`.
  The style of the inner dot of each finder-pattern corner. This can be 'square', 'circle',
  'rounded', 'squircle' or 'leaf'. When it is not set, the inner dot uses `dotStyle`. The
  centers of the alignment patterns use the same style.

  In a 'circle' corner square, a 'square' or 'leaf' dot draws as 'circle', because scanners
  do not find the pattern reliably with corners in a round ring.

## Methods

- `toBlob(): Promise<Blob>`
  Serializes the QR code to an `image/svg+xml` blob.

  Theme colors are resolved to plain `fill` attributes and a logo that is not a data URI
  is fetched and inlined, so the blob renders identically outside the component.
  A logo that cannot be fetched (for example a cross-origin URL without CORS headers) is omitted.

  Rejects when there is no `value` or it does not fit the `version`.
- `toImage(options?: QrCodeExportOptions): Promise<File>`
  Exports the QR code as an image file.

  The `scale` option multiplies the `size` of the component: a 256px QR code exported
  with `scale: 2` produces a 512x512 image. When `download` is `true` the browser
  download dialog opens for the file.

  Rejects when there is no `value` or it does not fit the `version`, when `format` is not
  supported, when `scale` is not a positive finite number, or when the resulting image
  exceeds the maximum canvas size.
- `copyToClipboard(options?: QrCodeCopyOptions): Promise<QrCodeCopyFormat>`
  Copies the QR code to the clipboard as an image and resolves to the format that the clipboard
  received. A browser that cannot copy SVG gets only the PNG.

  Browsers accept a clipboard write only in a focused document during a user action, so call
  the method directly from the event handler, with no `await` before it.

  Rejects when there is no `value` or it does not fit the `version`, when `format` is not
  supported, when `scale` is not a positive finite number, when the image exceeds the maximum
  canvas size, when the Clipboard API is not available, or when the browser refuses the write.

## CSS parts

- `background`: The background rect of the QR code.
- `dots`: The data modules (dots) of the QR code.
- `corner-square`: The outer corner (finder-pattern) squares of the QR code.
- `corner-dot`: The inner corner (finder-pattern) dots of the QR code.
- `alignment`: The alignment patterns of the QR code, from version 2.

## CSS custom properties

- `--ig-qr-code-background`: The background color of the QR code. Default is `white`.
- `--ig-qr-code-dark-color`: The color of the data modules (dots) and the alignment patterns, and the corner square/dot colors unless overridden below. Default is `black`.
- `--ig-qr-code-corner-square-color`: The color of the outer finder-pattern corner squares. Defaults to `--ig-qr-code-dark-color`.
- `--ig-qr-code-corner-dot-color`: The color of the inner finder-pattern corner dots. Defaults to `--ig-qr-code-dark-color`.

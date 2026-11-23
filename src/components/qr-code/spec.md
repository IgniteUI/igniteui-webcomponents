# QR code specification

- [QR code specification](#qr-code-specification)
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
      - [Size, margin and error correction](#size-margin-and-error-correction)
      - [Pinning a specific version](#pinning-a-specific-version)
      - [Adding a center logo](#adding-a-center-logo)
      - [Module and corner shapes](#module-and-corner-shapes)
      - [Theming colors](#theming-colors)
      - [Exporting](#exporting)
      - [Copying to the clipboard](#copying-to-the-clipboard)
      - [Payloads](#payloads)
      - [Programmatic control](#programmatic-control)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom properties](#css-custom-properties)
  - [Test scenarios](#test-scenarios)
    - [Accessibility tests](#accessibility-tests)
    - [Default property values](#default-property-values)
    - [Rendering](#rendering)
    - [Theming](#theming)
    - [Attribute reflection](#attribute-reflection)
    - [Style variants](#style-variants)
    - [Pixel snapping](#pixel-snapping)
    - [Shape geometry](#shape-geometry)
    - [Logo](#logo)
    - [Export](#export)
    - [Clipboard](#clipboard)
    - [QR model properties](#qr-model-properties)
    - [Host ARIA](#host-aria)
    - [Scanning](#scanning)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                |
| ------: | ---------- | -------------------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                                |
|       2 | 2026-09-28 | Add the property-based model suite; V30-V40/M table fix              |
|       3 | 2026-09-30 | Automatic error level, reactive label, `xlink:href` export           |
|       4 | 2026-10-02 | Forward the host `aria-labelledby` and `aria-describedby` to the SVG |
|       5 | 2026-10-20 | `copyToClipboard()`; exports read `size` after the pending render      |
|       6 | 2026-10-21 | An invalid `version` falls back to the automatic version             |
|       7 | 2026-11-17 | Shapes, `cornerDotStyle`, `dotScale`, logo cutout and version fit  |
|       8 | 2026-11-23 | Mixed-mode segments; no ECI header; payload helpers; export holds only the code; whole-pixel modules; alignment patterns; new dot styles and `leaf`; gradient; `logo-shape` |

## Overview

The `igc-qr-code` renders a scannable QR code as an inline SVG, generated on the client from a string `value`. It
implements the QR model (the data encoding, the error correction and the placement of the modules) internally,
with no external QR library and no network request.

The component also supports visual customization: the shape of the data modules and of the finder-pattern corners,
the colors through CSS custom properties, and an optional center logo that is masked out of the code while the
chosen error correction level is respected. Typical uses are payment and ticketing codes, branded marketing codes,
authentication setup URLs, contact sharing and linking printed material to digital content.

### Key features

- **Automatic encoding**: the value split into numeric, alphanumeric and byte segments with the fewest bits, and the
  smallest version that fits it, unless a `version` is pinned.
- **Configurable error correction** across `L`, `M`, `Q` and `H`, trading capacity for resilience.
- **Center logo** with the modules beneath it masked out, and, when `error-level` is not set, an automatic
  escalation from `M` to the smallest level that keeps the code scannable at the requested logo size. The logo can be
  a square, a circle, a rounded square or a squircle.
- **Visual customization** of the data modules, the outer corner squares and the inner corner dots. The data modules
  have nine styles, among them joined `liquid` modules and bars. A scale for the data modules leaves a gap between
  them. The alignment patterns take the shapes of the corners.
- **Sharp edges**: each module covers a whole number of pixels, on the screen and in an export.
- **Themeable colors** through CSS custom properties, with parts for the background, the dots and each corner
  element, and an optional linear or radial gradient.
- **Configurable size and margin**, the second one expressed in modules.
- **Export** to an SVG blob, or to a PNG, JPEG, WebP or SVG file, optionally scaled and downloaded.
- **Copy to the clipboard** as a PNG or SVG image.
- **Payload helpers** in [`igniteui-webcomponents/extras/qr-payloads`](../../extras/qr-payloads/spec.md) for a Wi-Fi
  login, a contact card, a SEPA payment and a calendar event.
- **Safe by default**: unsafe logo URL schemes and non-image `data:` URIs are rejected.

### Acceptance criteria

- The component must render an SVG whenever a non-empty `value` is set, and nothing when it is not.
- It must split the value into the segments with the fewest bits and pick a version that fits them, unless a
  `version` is pinned.
- `error-level` must drive the error correction of the generated matrix.
- `size` and `margin` must control the rendered pixels and the quiet zone without touching the encoded data. Each
  module that covers at least one pixel must cover a whole number of pixels, and the quiet zone must keep at least
  `margin` modules.
- A valid `logo-src` must be centered over the code with the whole modules beneath it masked out.
- Unsafe logo values must be rejected, and the component must recover when a failed logo is replaced.
- `dot-style`, `square-style` and `corner-dot-style` must control their shapes independently, and the inner corner
  dots must follow `dot-style` while `corner-dot-style` is not set.
- `dot-scale` must shrink the data modules and leave the finder and alignment patterns at full size.
- The colors must be customizable and must not invert with the light and dark theme variants.
- `copyToClipboard()` must start the clipboard write inside the user action that calls it.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and must handle degenerate configurations without throwing.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a QR code I can scan with the camera of a mobile device or with a scanning app;
- scan the code correctly even when a logo sits at its center;
- copy the code as an image and paste it into a document, an email or a chat;
- have the purpose of the code announced by my screen reader when I cannot see it.

### Developer stories

As a developer, I expect to be able to:

- set the value to encode without writing any QR generation logic;
- control the error correction level to balance capacity against resilience;
- pin a version when I need a predictable code size;
- control the rendered size and the quiet zone margin;
- add a center logo, and control how much of the code it may cover and how much whitespace surrounds it;
- rely on the component to pick a safe error correction level for the requested logo size;
- style the modules, the outer corner squares and the inner corner dots independently;
- leave a gap between the modules for a lighter look;
- theme the colors through CSS custom properties and target the internals through parts;
- export the code as a file or a blob, so that it can be printed or stored;
- copy the code to the clipboard from a button, without clipboard code of my own;
- encode a Wi-Fi login, a contact card, a SEPA payment or a calendar event without learning its format;
- provide a custom `aria-label` for what assistive technology announces.

## Functionality

### End-user experience

The component renders a square SVG with the three finder-pattern corners, the data modules and the quiet-zone
margin, plus an optional centered logo with the modules beneath it masked out. There is no direct interaction: the
content follows the properties the application sets, and the SVG updates as soon as one of them changes.

The wiki page of the component carries no design hand-off link.

### Developer experience

#### Basic initialization

```html
<igc-qr-code value="https://www.infragistics.com"></igc-qr-code>
```

This renders a 128×128 pixel code with a 4-module margin, `M` error correction and square modules and corners.

#### Size, margin and error correction

```html
<igc-qr-code value="https://www.infragistics.com" size="256" margin="2" error-level="H"></igc-qr-code>
```

Each module covers `floor(size / (modules + 2 * margin))` whole pixels, so its edges stay sharp. The pixels that are
left over go to the quiet zone, so `margin` is a minimum and the code can be smaller than its box. A fractional
`margin` can make each module 1 pixel smaller, so that the quiet zone keeps its minimum. A module smaller than 1 pixel
is not snapped.

For example, a version 2 code has 25 modules, and 33 with the default margin. At the default size of 128 pixels, each
module covers 3 pixels and the code covers 75 pixels. The quiet zone covers 26 pixels on the left and top, and 27
pixels on the right and bottom.

#### Pinning a specific version

```html
<igc-qr-code value="12345" version="4"></igc-qr-code>
```

The code keeps a fixed size regardless of the length of the value, as long as the value fits the version. With a
logo, a pinned version keeps its size, and the logo gets smaller when the version cannot hold it.

#### Adding a center logo

```html
<igc-qr-code
  value="https://www.infragistics.com"
  logo-src="/assets/logo.png"
  logo-size="0.5"
  logo-margin="4"
></igc-qr-code>
```

`logoSize` is a ratio of the area that can safely be obscured at the resolved error correction level, not of the
whole code. The area of the code leaves out the quiet zone, so `margin` does not change the logo. When `error-level` is not set, the component uses `M`, and a logo larger than the safe area of `M`
escalates the code to the smallest level that accommodates the requested size; a logo never lowers the level below
`M`. `errorLevel` still reads `M` in that case, and setting it to `undefined` or removing the attribute restores the
automatic level. An explicit level, `M` included, caps the logo to the safe area of that level. A logo box that
collapses to zero renders no image and throws nothing.

The cutout under the logo holds whole modules: each module that the logo box covers, in part or in full. No module
is cut in part, and the logo keeps the size of its box.

```html
<igc-qr-code
  value="https://www.infragistics.com"
  logo-src="/assets/logo.png"
  logo-shape="circle"
></igc-qr-code>
```

`logo-shape` takes `square` (the default), `circle`, `rounded` or `squircle`. The shape fills the logo box, so a
`circle` logo with a wide image is an ellipse, and a `rounded` logo has corners with a radius of a quarter of its
shorter side. `logo-size` stays the area of the box. The image is clipped to the shape drawn in the logo box less
`logo-margin` on each side, and the cutout holds only the modules that the shape covers, in part or in full. A shape
other than `square` hides fewer modules, so a pinned version can keep a larger logo.

The `rounded`, `liquid` and bar styles do not join a module under the logo to a module outside it, so the visible
modules end round at the edge of the cutout. The hidden modules stay in the code under the mask: an export whose logo
cannot be fetched drops the mask and shows them.

The code must stay readable under the logo. The cutout must not hide a finder pattern, its separator, or the format
or version information, and no error correction block can lose more codewords than it corrects. A codeword with one
hidden module counts as lost, whatever the logo shows. When `version` is not set, the component selects the smallest
version that holds the value and keeps this rule, so a short value with a logo can get a larger version than the same
value without one. When `version` is set, the logo gets smaller until the rule holds.

Logo sources are validated: `javascript:` and `vbscript:` URLs and non-image `data:` URIs are rejected, and an
image that fails to load leaves the code without a logo until a valid source is assigned.

#### Module and corner shapes

```html
<igc-qr-code value="https://www.infragistics.com" dot-style="rounded" square-style="circle"></igc-qr-code>
```

`dot-style`, `square-style` and `corner-dot-style` take `square`, `circle`, `rounded` or `squircle`. A `squircle` is
a superellipse: a square with soft corners, rounder than `rounded` and squarer than `circle`.

`dot-style` also takes these styles:

- `diamond`: a square turned 45°, with its points at the cell edges.
- `plus`: a cross with arms to the cell edges, so neighbors join along the arms.
- `liquid`: `rounded`, with a smooth fill in the inside corner of each L-join.
- `horizontal-bars` and `vertical-bars`: each run of dark modules in a row or a column is one bar with round ends.

`square-style` and `corner-dot-style` also take `leaf`: a square with two opposite round corners, on the diagonal
toward the center of the code. The radius is a quarter of the side. A leaf with fully round corners fails to decode.

The inner corner dots use `dot-style` until `corner-dot-style` is set. A corner dot is one shape, so it draws
`diamond` and `plus` as `square`, and `liquid` and the bar styles as `rounded`.

From version 2, the code has alignment patterns. Each one is a ring of `square-style` around a center dot of the
corner dot style, so it matches the finder patterns. A `leaf` alignment ring has the shape of the top-left corner
square. A joining style does not join a data module to an alignment pattern.

A `circle` corner square draws a `square` or `leaf` corner dot as a `circle`, in the finder and the alignment
patterns. A scanner such as zxing-cpp also checks the finder pattern on its diagonals, and a dot with corners in a
round ring leaves a gap there. `cornerDotStyle` keeps the value that the application set.

```html
<igc-qr-code
  value="https://www.infragistics.com"
  dot-style="squircle"
  square-style="squircle"
  corner-dot-style="circle"
  dot-scale="0.8"
></igc-qr-code>
```

`dot-scale` sets the size of each data module as a ratio of its cell, from `0.7` to `1`, and clamps other values. A
value below `1` leaves a gap between the modules, so `rounded` modules no longer join their neighbors and `liquid`
draws as `rounded`. For the bar styles, it sets the thickness of the bars and shortens their ends by the same gap. The
finder and alignment patterns keep their full size, so a scanner still finds the code. Each style decodes at `0.7`.

#### Theming colors

```html
<igc-qr-code
  value="https://www.infragistics.com"
  style="
    --ig-qr-code-background: #e8f4ff;
    --ig-qr-code-dark-color: #0066cc;
    --ig-qr-code-corner-square-color: #003366;
  "
></igc-qr-code>
```

The alignment patterns take `--ig-qr-code-dark-color`. The colors do not follow the light and dark variants of the
global theme; a code that inverted itself would stop scanning reliably.

```html
<igc-qr-code
  value="https://www.infragistics.com"
  gradient="linear"
  gradient-angle="45"
  style="--ig-qr-code-gradient-start: #1a237e; --ig-qr-code-gradient-end: #880e4f;"
></igc-qr-code>
```

`gradient` paints the data modules, the alignment patterns and the corners with a `linear` or a `radial` gradient,
from `--ig-qr-code-gradient-start` to `--ig-qr-code-gradient-end`. Another value gives one color. Both colors fall back to
`--ig-qr-code-dark-color`. The gradient spans the matrix, not the quiet zone. A linear gradient goes from left to
right at a `gradient-angle` of `0`, turns clockwise in degrees, and reaches the corners of the matrix. A radial
gradient goes from the center to the corners. An explicit `--ig-qr-code-corner-square-color` or
`--ig-qr-code-corner-dot-color` wins over the gradient for its part. Each instance has its own gradient, so the
codes on a page do not share one. An export writes the colors of the stops.

The component gives no warning for low contrast. Keep the dark color, and both colors of a gradient, much darker than
the background, and do not invert the code. Test the colors with the phones and the apps of your users.

#### Exporting

`toBlob()` serializes the code to an `image/svg+xml` blob, with the theme colors resolved to plain `fill`
attributes and a logo that is not a data URI fetched and inlined, so that the blob renders the same outside the
component. A logo that cannot be fetched, for example a cross-origin URL without CORS headers, is dropped together
with its mask. The logo is written as both `href` and `xlink:href`: SVG 1.1 consumers, such as Illustrator, the
Office import, Batik and older librsvg, read only `xlink:href`, and SVG 2 gives `href` priority when both are
present.

`toImage(options)` exports a file. `scale` multiplies the `size` of the component, `format` takes `png`, `jpeg`,
`webp` or `svg`, `fileName` names the file and gets the extension of the format appended, and `download` opens the
browser download dialog. An export holds only the code: a frame or a caption around the element is not part of it. The export waits for pending property changes to render and then reads `size`, so a `size`
set right after the call applies to the image. Its modules cover whole pixels of the image size, `size * scale`.

```ts
const file = await qrCode.toImage({ format: 'png', scale: 2, download: true });
```

Both methods reject when the component has no value, and `toImage()` also rejects on an unsupported format, a
non-positive or non-finite scale, and a result that exceeds the maximum canvas size.

#### Copying to the clipboard

`copyToClipboard(options)` writes the code to the clipboard. `format` takes `png`, the default, or `svg`, and `scale`
multiplies the `size` of the component, as in `toImage()`. The promise resolves to the format that the clipboard
received:

- `png`: a PNG image.
- `svg`: an SVG image and a PNG image of the same code. An application that does not read SVG pastes the PNG. A
  browser that cannot copy SVG gets only the PNG, and the promise resolves to `png`.

Browsers accept a clipboard write only in a focused document and during a user action. Safari and Firefox measure the
action as a short transient activation, about 5 seconds in WebKit, so a write that starts after a slow `await`, such
as the export of the image, fails. The method starts the write before its first `await` and gives the images to the
clipboard as promises. Thus, call it directly from the event handler, with no `await` before it:

```ts
copyButton.addEventListener('click', async () => {
  const format = await qrCode.copyToClipboard({ format: 'svg', scale: 2 });
  status.textContent = `Copied the QR code as ${format.toUpperCase()}.`;
});
```

The method rejects when the component has no value, on an unsupported format or an invalid scale, without the
Clipboard API (an insecure context), and when the browser refuses the write, for example in a document that does not
have focus.

#### Payloads

Scanner apps turn some text formats into an action. `igniteui-webcomponents/extras/qr-payloads` builds the `value` for
a Wi-Fi login, a contact card, a SEPA payment and a calendar event, and escapes the text. See its
[README](../../extras/qr-payloads/README.md) and its [specification](../../extras/qr-payloads/spec.md).

#### Programmatic control

```ts
const qrCode = document.querySelector('igc-qr-code');

qrCode.value = 'https://www.infragistics.com/products';
qrCode.dotStyle = 'rounded';
qrCode.size = 320;
qrCode.ariaLabel = 'Scan to visit our product page';
```

### Localization

The component renders no visible text. A localized `aria-label` controls the accessible name announced by
assistive technology.

### Keyboard interactions

Not applicable. The component is presentational, is not part of the tab order and takes no keyboard input.

## API

### Properties and attributes

| Property      | Attribute      | Reflected | Type                                | Default | Description                                                              |
| ------------- | -------------- | --------- | ----------------------------------- | ------- | ------------------------------------------------------------------------ |
| `value`       | `value`        | no        | `string \| undefined`               | Not set | The value encoded in the QR code.                                         |
| `version`     | `version`      | no        | `number \| undefined`               | Not set | The version, 1 to 40; the smallest fitting one when unset or invalid.     |
| `errorLevel`  | `error-level`  | no        | `"L" \| "M" \| "Q" \| "H"`          | `M`     | The error correction level.                                               |
| `size`        | `size`         | no        | `number`                            | `128`   | The rendered width and height in pixels; modules cover whole pixels.      |
| `margin`      | `margin`       | no        | `number`                            | `4`     | The smallest quiet-zone margin, in modules.                               |
| `logoSrc`     | `logo-src`     | no        | `string \| undefined`               | Not set | The source of the centered logo image.                                    |
| `logoSize`    | `logo-size`    | no        | `number`                            | `0.4`   | The logo size, as a ratio of the safe area.                               |
| `logoMargin`  | `logo-margin`  | no        | `number \| undefined`               | Not set | The whitespace around the logo, in pixels.                                |
| `dotStyle`    | `dot-style`    | no        | `QrDotStyle`                        | `square`| The shape of the data modules, and of the inner corner dot by default.    |
| `dotScale`    | `dot-scale`    | no        | `number`                            | `1`     | The size of the data modules, from 0.7 to 1 of their cell.                |
| `squareStyle` | `square-style` | no        | `QrCornerSquareStyle`               | `square`| The shape of the outer corner squares and of the alignment rings.         |
| `cornerDotStyle` | `corner-dot-style` | no | `QrCornerDotStyle \| undefined`      | Not set | The shape of the inner corner dots and of the alignment centers; follows `dotStyle` when unset. |
| `logoShape`   | `logo-shape`   | no        | `QrLogoShape`                       | `square`| The shape of the logo: 'square', 'circle', 'rounded' or 'squircle'.        |
| `gradient`    | `gradient`     | no        | `QrGradient \| undefined`           | Not set | The gradient of the dark modules: 'linear' or 'radial'.                    |
| `gradientAngle` | `gradient-angle` | no      | `number`                            | `0`     | The angle of a 'linear' gradient in degrees, clockwise.                   |

`QrDotStyle` is `"square" | "circle" | "rounded" | "squircle" | "diamond" | "plus" | "liquid" | "horizontal-bars" |
"vertical-bars"`. `QrCornerSquareStyle` and `QrCornerDotStyle` are `"square" | "circle" | "rounded" | "squircle" |
"leaf"`. `QrLogoShape` is `"square" | "circle" | "rounded" | "squircle"`, and `QrGradient` is `"linear" | "radial"`.

### Methods

| Method    | Signature                                          | Description                                                          |
| --------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| `toBlob`  | `(): Promise<Blob>`                                | Serializes the code to an `image/svg+xml` blob.                       |
| `toImage` | `(options?: QrCodeExportOptions): Promise<File>`   | Exports the code as a `png`, `jpeg`, `webp` or `svg` file.            |
| `copyToClipboard` | `(options?: QrCodeCopyOptions): Promise<QrCodeCopyFormat>` | Copies the code to the clipboard as a PNG or SVG image. |

`QrCodeExportOptions`

| Option     | Type                                     | Default     | Description                                            |
| ---------- | ---------------------------------------- | ----------- | ------------------------------------------------------ |
| `fileName` | `string`                                 | `qr-code`   | The name of the file; the extension is appended.        |
| `format`   | `"svg" \| "png" \| "jpeg" \| "webp"`     | `png`       | The output format.                                      |
| `scale`    | `number`                                 | `1`         | The multiplier applied to the size of the component.    |
| `download` | `boolean`                                | `false`     | Whether to open the browser download dialog.            |

`QrCodeCopyOptions`

| Option   | Type               | Default | Description                                                         |
| -------- | ------------------ | ------- | ------------------------------------------------------------------- |
| `format` | `QrCodeCopyFormat` (`"png" \| "svg"`) | `png` | The image format; an `svg` copy also holds a PNG image. |
| `scale`  | `number`           | `1`     | The multiplier applied to the size of the component.                 |

### Events

None. The component is presentational and dispatches no events.

### Slots

None. The SVG is rendered entirely from the properties of the component.

### CSS Shadow parts

| Part            | Description                                        |
| --------------- | -------------------------------------------------- |
| `background`    | The background rect of the code.                    |
| `dots`          | The data modules of the code.                       |
| `corner-square` | The outer finder-pattern corner squares.            |
| `corner-dot`    | The inner finder-pattern corner dots.               |
| `alignment`     | The alignment patterns, from version 2.             |

### CSS custom properties

| Property                           | Default | Description                                                                        |
| ---------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `--ig-qr-code-background`          | `white` | The background color of the code.                                                   |
| `--ig-qr-code-dark-color`          | `black` | The color of the data modules and the alignment patterns, and of the corners unless they are overridden. |
| `--ig-qr-code-corner-square-color` | Not set | The color of the outer corner squares; falls back to `--ig-qr-code-dark-color`.     |
| `--ig-qr-code-corner-dot-color`    | Not set | The color of the inner corner dots; falls back to `--ig-qr-code-dark-color`.        |
| `--ig-qr-code-gradient-start`      | Not set | The start color of the `gradient`. Defaults to `--ig-qr-code-dark-color`.          |
| `--ig-qr-code-gradient-end`        | Not set | The end color of the `gradient`. Defaults to `--ig-qr-code-dark-color`.            |

## Test scenarios

| Suite                | File                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| `IgcQrCodeComponent` | `qr-code.spec.ts`                                                      |
| QR model properties  | [`model/qr-model.property.spec.ts`](./model/qr-model.property.spec.ts) |

### Accessibility tests

1. The component passes the accessibility audit when a value is set, and with a gradient and a shaped logo also in
   the light DOM.
2. The SVG carries a `<title>` for screen readers, which uses the `aria-label` when one is provided, follows a
   change of `ariaLabel` alone, and returns to the default when the attribute is removed.

### Default property values

3. `size`, `margin`, `errorLevel`, `dotStyle`, `squareStyle`, `cornerDotStyle`, `dotScale`, `gradient`,
   `gradientAngle` and `value` have their documented defaults, and so do `logoSrc`, `logoSize`, `logoMargin` and
   `logoShape`.

### Rendering

4. No SVG is rendered without a value, one is rendered with a value, and it is cleared when the value is unset.
5. The SVG dimensions follow `size`, including a change at runtime, and the code re-renders on a value change.
6. The SVG holds a background rect, at least one data path and three finder-pattern corner groups.

### Theming

7. The `background`, `dots`, `corner-square`, `corner-dot` and `alignment` parts are exposed.
8. The default colors are the schema ones, and the documented custom properties override them.
9. `--ig-qr-code-dark-color` cascades to the corner square and the corner dot, and an explicit corner override
   wins over the cascade. The alignment patterns take `--ig-qr-code-dark-color`.
10. The colors do not invert when the global theme switches to its dark variant.
11. `gradient` paints the dots, the alignment patterns and the corners with the gradient of the instance, and each
    instance has its own. An explicit corner color wins for its part. The stops take the gradient colors, or else
    the dark color, and a cleared `gradient` or a value other than `linear` and `radial` gives one color.
12. A linear gradient spans the matrix without the quiet zone, along `gradient-angle`, and a radial gradient reaches
    the corners of the matrix from its center. A `gradient-angle` that is not a number is 0.

### Attribute reflection

13. The `dot-style`, `square-style`, `corner-dot-style`, `dot-scale`, `gradient`, `gradient-angle`, `error-level`,
    `version`, `logo-src`, `logo-size`, `logo-margin` and `logo-shape` attributes initialize their properties.

### Style variants

14. Each `dot-style` renders its data path, and each `square-style` renders its corner groups.

### Pixel snapping

15. At the sizes 128 and 256, each module covers the same whole number of pixels, and the code starts on a whole
    pixel. The quiet zone keeps at least `margin` modules on each side, also for a fractional `margin`.
16. An SVG export at the scales 2 and 1.3 puts the modules on whole pixels of the image size, and a module smaller
    than 1 pixel is not snapped.

### Shape geometry

17. A `squircle` data module rounds its corners less than a circle, a `squircle` corner square is a ring, and a
    `squircle` corner dot rounds its corners.
18. The inner corner dots follow `dotStyle` until `cornerDotStyle` is set and again after it is unset, and the data
    modules do not change with `cornerDotStyle`.
19. An alignment pattern is a ring of `squareStyle` around a center dot of the corner dot style. It is not part of the
    data path, keeps its size at any `dotScale`, and a `rounded` module does not join it.
20. A `circle` corner square draws a `square` or `leaf` corner dot as a circle, in the finder and the alignment
    patterns, and `cornerDotStyle` keeps its value.
21. A `diamond` module has its points at the cell edges, and a `plus` module has its arms to the cell edges.
22. A `liquid` L-join has a fill in its inside corner, and below a `dotScale` of 1, `liquid` draws as `rounded`.
23. A bar style draws one bar with round ends for each run of dark modules in a row or a column, and `dotScale` sets
    its thickness.
24. A `leaf` corner square and corner dot round the corners on the diagonal toward the center of the code, and a
    `leaf` alignment ring has the shape of the top-left one.
25. Without `cornerDotStyle`, the corner dots draw `diamond` and `plus` as `square`, and `liquid` and the bar styles
    as `rounded`.
26. A joining style does not join a module under the logo cutout to a module outside it: a `rounded` module ends
    round at the cutout and the hidden module stays, a bar splits at the cutout edge, and a `liquid` fillet needs
    three modules of one zone.
27. `dotScale` shrinks the data modules around their centers, is clamped from 0.7 to 1 with 1 for a value that is not
    a number, and leaves the finder patterns at full size. A scaled `rounded` module rounds the corners toward its dark
    neighbors.

### Logo

28. No `<image>` or `<mask>` is rendered without a logo; a valid one renders both, with the image outside the
    masked group and the mask applied to the group holding the dots and the finders.
29. The mask id is stable across re-renders, and clearing the logo or replacing it with an unsafe URL removes the
    image and the mask.
30. Unsafe schemes and non-image `data:` URIs are blocked, while `data:image/` and `https://` URLs are accepted.
31. A logo that fails to load leaves the code without one, and the component recovers once a valid source is set.
32. A higher error correction level produces a larger code, and the logo area is capped to the safe area of the
    resolved level. Without `error-level`, a large logo escalates the level while `errorLevel` reads `M`, a small
    logo keeps `M`, an explicit `M` caps the logo, and removing the attribute restores the escalation.
33. `logoMargin` reduces the visible logo, stays in pixels when the modules snap to whole pixels, and a margin that
    consumes the whole logo box renders no image.
34. The cutout starts and ends on module boundaries and is centered, and the logo lies inside it, with and without
    `logoMargin`.
35. A logo that would hide more codewords than the level corrects raises the version, and removing the logo restores
    it. A pinned version keeps its size, and the logo gets smaller.
36. A `square` logo has one cut rectangle and no clip. The cutout of a `circle`, `rounded` or `squircle` logo, and of
    a wide `circle` or `squircle` logo, holds each point of the shape and only the modules that the shape covers. The
    image is clipped to the shape drawn in the logo box less `logoMargin`.
37. On a pinned version, a `circle`, `rounded` or `squircle` logo stays larger than a `square` logo.
38. A change of the cutout redraws the data modules.

### Export

39. `toBlob()` returns an SVG blob, resolves the theme colors to `fill` attributes and strips the parts.
40. A data URI logo is kept as it is, a fetched one is inlined as a data URI, a logo assigned right before the
    export is awaited, and one that cannot be fetched is dropped together with its mask. The logo is written as both
    `href` and `xlink:href`, and a code without a logo has no `xlink:href`.
41. A shaped logo keeps its clip. The export writes the colors of the gradient stops and the gradient as the `fill`
    of the parts, and keeps the gradient when the logo cannot be fetched.
42. `toImage()` exports a PNG at the component size by default, scales the raster output, and exports an opaque
    JPEG, a WebP and an SVG with scaled dimensions. A `size` set right after the call applies to the image.
43. An existing matching extension in the file name is kept, and the download dialog opens only when requested.
44. Both methods reject without a value, and `toImage()` rejects invalid options, also a `size` set right after the
    call that makes the image larger than the maximum canvas size. A value that does not fit the pinned version
    renders nothing, warns once and makes the export reject with the encoder error. A version that is not an integer
    from 1 to 40 falls back to the automatic version.

### Clipboard

45. `copyToClipboard()` copies a PNG image at the component size by default, and a `size` set right after the call
    applies to the copy.
46. An `svg` copy holds an SVG image, with the theme colors resolved and the parts stripped, and a PNG image, both
    multiplied by `scale`. A clipboard that does not take SVG gets only the PNG.
47. The clipboard write starts before the first `await` of the method, for a PNG copy and an SVG copy.
48. The method rejects when the clipboard refuses the write and without the Clipboard API. It also rejects on invalid
    options and without a value, and then it writes nothing. A refused write that skips a failed export leaves no
    unhandled rejection.

### QR model properties

49. Each version and error correction level holds as many codewords as the symbol has room for, checked against the
    module count of ISO/IEC 18004.
50. Generated numeric, alphanumeric, byte and mixed data encodes into the smallest version that holds it, with the
    codeword count of that version, and never takes more bits than one segment of the best single mode. A decoder
    reads the bytes of the data back from the matrix.
51. The matrix is square, with the side length of its version, and data over the capacity of a version throws the
    capacity error. A requested version that is not an integer from 1 to 40 throws.

### Host ARIA

52. The host `aria-labelledby` and `aria-describedby` reach the SVG, and the exported SVG has neither attribute.

### Scanning

A decoder (zxing-cpp, from the `zxing-wasm` package) reads the PNG that `toImage()` exports, with at least 6 pixels for
each module.

53. Each basic `dot-style` (`square`, `circle`, `rounded` and `squircle`) decodes with each basic `square-style` and
    `corner-dot-style`, in a Latin square of the three shapes. Each other `dot-style` decodes with the same pairs of
    corner shapes.
54. Each `dot-style` decodes at the smallest `dotScale`, also in a version 12 code.
55. A code with a white or a black logo, at the default and the largest `logoSize`, decodes at each error correction
    level.
56. A white, black or gray logo on codes of version 1 to 3 decodes at each error correction level, at the default and
    the largest `logoSize`, and so does a logo on a pinned version 1, 2 or 3.
57. Values that mix numeric, alphanumeric and byte segments decode, with and without a logo.
58. A `circle` corner square with circle modules decodes with each `corner-dot-style`, at versions 3 and 10 and at 7,
    8 and 9 pixels for each module. Before the alignment rings and the rule for the corner dot, some of these failed.
59. The alignment patterns of each `square-style` decode with each `dot-style` in a version 12 code, at 7 and 8
    pixels for each module.
60. Each new `dot-style` decodes at a `dotScale` of 1, and at the smallest `dotScale` also in a version 12 code.
61. A `leaf` corner square decodes with each `corner-dot-style`, at versions 3 and 12 and at 7 and 9 pixels for each
    module.
62. A `leaf` corner dot decodes in a `square`, `rounded` and `squircle` corner square, at versions 3 and 12 and at 7
    and 9 pixels for each module.
63. A white or black `circle`, `rounded` and `squircle` logo of the largest `logoSize` decodes on codes of versions 1
    to 3 at each error correction level. A wide shaped logo decodes at levels `M` and `H`, and a shaped logo on a
    pinned version 1, 2 or 3 at level `H`.
64. The `rounded`, `liquid` and bar styles decode with a `square` and a `circle` logo of the largest `logoSize`, also
    in a version 12 code.
65. A linear gradient at 0, 45 and 135 degrees and a radial gradient between two dark colors decode, also in a
    version 12 code.

### Not covered by the suite

- `margin` is asserted only as the smallest quiet zone, in the pixel snapping specs.
- The scanning specs use one decoder on clean images. A phone camera adds blur, noise and perspective, and other
  decoders can be stricter or more lenient.
- A real clipboard write: the suite stubs the Clipboard API, because headless Chromium denies a clipboard write
  without a permission grant. A check in headed Chromium 156 on 2026-10-20 read back the PNG copy and the SVG copy.

## Assumptions and limitations

- The code writes text as UTF-8 in byte mode, with no ECI header. Phone readers assume UTF-8, and many readers ignore
  an ECI header, so the component does not write one. A reader that follows the ISO default reads non-ASCII text as
  ISO-8859-1.
- The readability rule for a logo counts every codeword with a hidden module as lost. A real logo spoils fewer
  codewords, so the rule can select a larger version than a scanner needs.
- A `diamond` or `plus` finder center and a `leaf` with fully round corners fail to decode in zxing-cpp at some sizes,
  so the corner dots do not take `diamond` or `plus`, and a `leaf` rounds a quarter of its side.
- The modules cover whole CSS pixels. At a device pixel ratio of 1, 2 or 3 the edges are sharp, and at 1.25 or 1.5
  they can blur, because a CSS pixel is not a whole number of device pixels. An export is always exact.
- The component is presentational: it has no events, no slots and no keyboard interaction.
- `logoSize` is a ratio of the safe area of the resolved error correction level (at most about 9% of the area of
  the code), not of the whole code.
- Logo sources are validated for their scheme and their media type, not for their content.
- The application owns a `version` that cannot hold the value, and a value too long for version 40. The component
  then renders nothing and warns, `toBlob()` and `toImage()` reject with the encoder error, and `copyToClipboard()`
  rejects.
- The colors deliberately do not follow the light and dark theme variants.
- The gradient colors are CSS custom properties of the component only. The igniteui-theming schema has no gradient
  colors, and with `gradient` set, the corner colors of a Sass `qr-code-theme()` do not apply. To keep a corner
  color, set `--ig-qr-code-corner-square-color` or `--ig-qr-code-corner-dot-color`.
- The component does not check the contrast of the colors. The application owns a gradient or a color that a camera
  cannot tell from the background.
- `toImage()` and `copyToClipboard()` are bounded by the maximum canvas size of the browser, so a very large size and
  scale combination is rejected.
- `copyToClipboard()` needs a secure context, a focused document and a user action. The application must call it
  directly from the event handler of the action.
- On 2026-10-20, only Chromium 124 and later copies SVG to the clipboard. The method follows
  `ClipboardItem.supports('image/svg+xml')`, so other browsers get the PNG until they report SVG support.

## Accessibility

### ARIA roles and properties

- The rendered `<svg>` has `role="img"`.
- The `<svg>` holds a `<title>` describing the code, taken from `ariaLabel` when it is set and defaulting to
  `QR code: <value>`. The component observes the `aria-label` attribute, so a new label alone renders a new
  `<title>`.
- A host `aria-labelledby` names the SVG before its `<title>`, and a host `aria-describedby` describes it, by
  element reference. The exported SVG leaves out both relations.

### Keyboard support

Not applicable. The component renders a static graphic and takes no focus.

### Right to Left support

The layout of a QR code, its finder patterns and its data modules, is fixed by the QR standard and must not be
mirrored in a Right-to-Left context. No RTL configuration is required or supported.

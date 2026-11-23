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
    - [Shape geometry](#shape-geometry)
    - [Logo](#logo)
    - [Export](#export)
    - [Clipboard](#clipboard)
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

## Overview

The `igc-qr-code` renders a scannable QR code as an inline SVG, generated on the client from a string `value`. It
implements the QR model — the data encoding, the error correction and the placement of the modules — internally,
with no external QR library and no network request.

The component also supports visual customization: the shape of the data modules and of the finder-pattern corners,
the colors through CSS custom properties, and an optional center logo that is masked out of the code while the
chosen error correction level is respected. Typical uses are payment and ticketing codes, branded marketing codes,
authentication setup URLs, contact sharing and linking printed material to digital content.

### Key features

- **Automatic encoding**: the most compact mode — numeric, alphanumeric or byte — and the smallest version that
  fits the value, unless a `version` is pinned.
- **Configurable error correction** across `L`, `M`, `Q` and `H`, trading capacity for resilience.
- **Center logo** with the modules beneath it masked out, and, when `error-level` is not set, an automatic
  escalation from `M` to the smallest level that keeps the code scannable at the requested logo size.
- **Visual customization** of the data modules, the outer corner squares and the inner corner dots as `square`,
  `circle`, `rounded` or `squircle`, and a scale for the data modules that leaves a gap between them.
- **Themeable colors** through CSS custom properties, with parts for the background, the dots and each corner
  element.
- **Configurable size and margin**, the second one expressed in modules.
- **Export** to an SVG blob, or to a PNG, JPEG, WebP or SVG file, optionally scaled and downloaded.
- **Copy to the clipboard** as a PNG or SVG image.
- **Safe by default**: unsafe logo URL schemes and non-image `data:` URIs are rejected.

### Acceptance criteria

- The component must render an SVG whenever a non-empty `value` is set, and nothing when it is not.
- It must pick an encoding mode and a version that fit the value, unless a `version` is pinned.
- `error-level` must drive the error correction of the generated matrix.
- `size` and `margin` must control the rendered pixels and the quiet zone without touching the encoded data.
- A valid `logo-src` must be centered over the code with the whole modules beneath it masked out.
- Unsafe logo values must be rejected, and the component must recover when a failed logo is replaced.
- `dot-style`, `square-style` and `corner-dot-style` must control their shapes independently, and the inner corner
  dots must follow `dot-style` while `corner-dot-style` is not set.
- `dot-scale` must shrink the data modules and leave the finder patterns at full size.
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
a superellipse: a square with soft corners, rounder than `rounded` and squarer than `circle`. The inner corner dots
use `dot-style` until `corner-dot-style` is set.

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
value below `1` leaves a gap between the modules, so `rounded` modules no longer join their neighbors. The finder
patterns keep their full size, so a scanner still finds the code.

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

The colors do not follow the light and dark variants of the global theme; a code that inverted itself would stop
scanning reliably.

#### Exporting

`toBlob()` serializes the code to an `image/svg+xml` blob, with the theme colors resolved to plain `fill`
attributes and a logo that is not a data URI fetched and inlined, so that the blob renders the same outside the
component. A logo that cannot be fetched, for example a cross-origin URL without CORS headers, is dropped together
with its mask. The logo is written as both `href` and `xlink:href`: SVG 1.1 consumers, such as Illustrator, the
Office import, Batik and older librsvg, read only `xlink:href`, and SVG 2 gives `href` priority when both are
present.

`toImage(options)` exports a file. `scale` multiplies the `size` of the component, `format` takes `png`, `jpeg`,
`webp` or `svg`, `fileName` names the file and gets the extension of the format appended, and `download` opens the
browser download dialog. The export waits for pending property changes to render and then reads `size`, so a `size`
set right after the call applies to the image.

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
| `value`       | `value`        | no        | `string \| undefined`               | —       | The value encoded in the QR code.                                         |
| `version`     | `version`      | no        | `number \| undefined`               | —       | The version, 1 to 40; the smallest fitting one when unset or invalid.     |
| `errorLevel`  | `error-level`  | no        | `"L" \| "M" \| "Q" \| "H"`          | `M`     | The error correction level.                                               |
| `size`        | `size`         | no        | `number`                            | `128`   | The rendered width and height in pixels.                                  |
| `margin`      | `margin`       | no        | `number`                            | `4`     | The quiet-zone margin, in modules.                                        |
| `logoSrc`     | `logo-src`     | no        | `string \| undefined`               | —       | The source of the centered logo image.                                    |
| `logoSize`    | `logo-size`    | no        | `number`                            | `0.4`   | The logo size, as a ratio of the safe area.                               |
| `logoMargin`  | `logo-margin`  | no        | `number \| undefined`               | —       | The whitespace around the logo, in pixels.                                |
| `dotStyle`    | `dot-style`    | no        | `QrDotStyle`                        | `square`| The shape of the data modules, and of the inner corner dot by default.    |
| `dotScale`    | `dot-scale`    | no        | `number`                            | `1`     | The size of the data modules, from 0.7 to 1 of their cell.                |
| `squareStyle` | `square-style` | no        | `QrCornerSquareStyle`               | `square`| The shape of the outer finder-pattern corner squares.                     |
| `cornerDotStyle` | `corner-dot-style` | no | `QrCornerDotStyle \| undefined`      | —       | The shape of the inner corner dots; follows `dotStyle` when unset.        |

`QrDotStyle`, `QrCornerSquareStyle` and `QrCornerDotStyle` are `"square" | "circle" | "rounded" | "squircle"`.

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

### CSS custom properties

| Property                           | Default | Description                                                                        |
| ---------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `--ig-qr-code-background`          | `white` | The background color of the code.                                                   |
| `--ig-qr-code-dark-color`          | `black` | The color of the data modules, and of the corners unless they are overridden.       |
| `--ig-qr-code-corner-square-color` | —       | The color of the outer corner squares; falls back to `--ig-qr-code-dark-color`.     |
| `--ig-qr-code-corner-dot-color`    | —       | The color of the inner corner dots; falls back to `--ig-qr-code-dark-color`.        |

## Test scenarios

| Suite                | File                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| `IgcQrCodeComponent` | `qr-code.spec.ts`                                                      |
| QR model properties  | [`model/qr-model.property.spec.ts`](./model/qr-model.property.spec.ts) |

### Accessibility tests

1. The component passes the accessibility audit when a value is set.
2. The SVG carries a `<title>` for screen readers, which uses the `aria-label` when one is provided, follows a
   change of `ariaLabel` alone, and returns to the default when the attribute is removed.

### Default property values

3. `size`, `margin`, `errorLevel`, `dotStyle`, `squareStyle`, `cornerDotStyle`, `dotScale` and `value` have their
   documented defaults, and so do `logoSrc`, `logoSize` and `logoMargin`.

### Rendering

4. No SVG is rendered without a value, one is rendered with a value, and it is cleared when the value is unset.
5. The SVG dimensions follow `size`, including a change at runtime, and the code re-renders on a value change.
6. The SVG holds a background rect, at least one data path and three finder-pattern corner groups.

### Theming

7. The `background`, `dots`, `corner-square` and `corner-dot` parts are exposed.
8. The default colors are the schema ones, and the documented custom properties override them.
9. `--ig-qr-code-dark-color` cascades to the corner square and the corner dot, and an explicit corner override
   wins over the cascade.
10. The colors do not invert when the global theme switches to its dark variant.

### Attribute reflection

11. The `dot-style`, `square-style`, `corner-dot-style`, `dot-scale`, `error-level`, `version`, `logo-src`,
    `logo-size` and `logo-margin` attributes initialize their properties.

### Style variants

12. Each `dot-style` renders its data path, and each `square-style` renders its corner groups.

### Shape geometry

13. A `squircle` data module rounds its corners less than a circle, a `squircle` corner square is a ring, and a
    `squircle` corner dot rounds its corners.
14. The inner corner dots follow `dotStyle` until `cornerDotStyle` is set and again after it is unset, and the data
    modules do not change with `cornerDotStyle`.
15. `dotScale` shrinks the data modules around their centers, is clamped from 0.7 to 1 with 1 for a value that is not
    a number, and leaves the finder patterns at full size. A scaled `rounded` module rounds the corners toward its dark
    neighbors.

### Logo

16. No `<image>` or `<mask>` is rendered without a logo; a valid one renders both, with the image outside the
    masked group and the mask applied to the group holding the dots and the finders.
17. The mask id is stable across re-renders, and clearing the logo or replacing it with an unsafe URL removes the
    image and the mask.
18. Unsafe schemes and non-image `data:` URIs are blocked, while `data:image/` and `https://` URLs are accepted.
19. A logo that fails to load leaves the code without one, and the component recovers once a valid source is set.
20. A higher error correction level produces a larger code, and the logo area is capped to the safe area of the
    resolved level. Without `error-level`, a large logo escalates the level while `errorLevel` reads `M`, a small
    logo keeps `M`, an explicit `M` caps the logo, and removing the attribute restores the escalation.
21. `logoMargin` reduces the visible logo, and a margin that consumes the whole logo box renders no image.
22. The cutout starts and ends on module boundaries and is centered, and the logo lies inside it, with and without
    `logoMargin`.
23. A logo that would hide more codewords than the level corrects raises the version, and removing the logo restores
    it. A pinned version keeps its size, and the logo gets smaller.

### Export

24. `toBlob()` returns an SVG blob, resolves the theme colors to `fill` attributes and strips the parts.
25. A data URI logo is kept as it is, a fetched one is inlined as a data URI, a logo assigned right before the
    export is awaited, and one that cannot be fetched is dropped together with its mask. The logo is written as both
    `href` and `xlink:href`, and a code without a logo has no `xlink:href`.
26. `toImage()` exports a PNG at the component size by default, scales the raster output, and exports an opaque
    JPEG, a WebP and an SVG with scaled dimensions. A `size` set right after the call applies to the image.
27. An existing matching extension in the file name is kept, and the download dialog opens only when requested.
28. Both methods reject without a value, and `toImage()` rejects invalid options, also a `size` set right after the
    call that makes the image larger than the maximum canvas size. A value that does not fit the pinned version
    renders nothing, warns once and makes the export reject with the encoder error. A version that is not an integer
    from 1 to 40 falls back to the automatic version.

### Clipboard

29. `copyToClipboard()` copies a PNG image at the component size by default, and a `size` set right after the call
    applies to the copy.
30. An `svg` copy holds an SVG image, with the theme colors resolved and the parts stripped, and a PNG image, both
    multiplied by `scale`. A clipboard that does not take SVG gets only the PNG.
31. The clipboard write starts before the first `await` of the method, for a PNG copy and an SVG copy.
32. The method rejects when the clipboard refuses the write and without the Clipboard API. It also rejects on invalid
    options and without a value, and then it writes nothing. A refused write that skips a failed export leaves no
    unhandled rejection.

### QR model properties

33. Each version and error correction level holds as many codewords as the symbol has room for, checked against the
    module count of ISO/IEC 18004.
34. Generated numeric, alphanumeric and byte data encodes into the smallest version that holds it, with the
    codeword count of that version, and the encoding mode matches the characters of the data.
35. The matrix is square, with the side length of its version, and data over the capacity of a version throws the
    capacity error. A requested version that is not an integer from 1 to 40 throws.

### Host ARIA

36. The host `aria-labelledby` and `aria-describedby` reach the SVG, and the exported SVG has neither attribute.

### Scanning

A decoder (zxing-cpp, from the `zxing-wasm` package) reads the PNG that `toImage()` exports, with at least 6 pixels for
each module.

37. Each `dot-style` decodes with each `square-style` and each `corner-dot-style`, in a Latin square of the three
    shapes.
38. Each `dot-style` decodes at the smallest `dotScale`, also in a version 12 code.
39. A code with a white or a black logo, at the default and the largest `logoSize`, decodes at each error correction
    level.
40. A white, black or gray logo on codes of version 1 to 3 decodes at each error correction level, at the default and
    the largest `logoSize`, and so does a logo on a pinned version 1, 2 or 3.

### Not covered by the suite

- `margin` is not asserted on its own.
- The scanning specs use one decoder on clean images. A phone camera adds blur, noise and perspective, and other
  decoders can be stricter or more lenient.
- A real clipboard write: the suite stubs the Clipboard API, because headless Chromium denies a clipboard write
  without a permission grant. A check in headed Chromium 156 on 2026-10-20 read back the PNG copy and the SVG copy.

## Assumptions and limitations

- The readability rule for a logo counts every codeword with a hidden module as lost. A real logo spoils fewer
  codewords, so the rule can select a larger version than a scanner needs.
- On 2026-11-17, zxing-cpp did not read some codes of version 8 and above with `square-style="circle"` at some image
  sizes, with or without a logo. The same codes fail in earlier releases.
- The component is presentational: it has no events, no slots and no keyboard interaction.
- `logoSize` is a ratio of the safe area of the resolved error correction level — at most about 9% of the area of
  the code — and not of the whole code.
- Logo sources are validated for their scheme and their media type, not for their content.
- The application owns a `version` that cannot hold the value, and a value too long for version 40. The component
  then renders nothing and warns, `toBlob()` and `toImage()` reject with the encoder error, and `copyToClipboard()`
  rejects.
- The colors deliberately do not follow the light and dark theme variants.
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

The layout of a QR code — its finder patterns and its data modules — is fixed by the QR standard and must not be
mirrored in a Right-to-Left context. No RTL configuration is required or supported.

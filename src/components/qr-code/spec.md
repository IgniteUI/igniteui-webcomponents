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
    - [Logo](#logo)
    - [Export](#export)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

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
- **Center logo** with the modules beneath it masked out, and, when `error-level` is not set explicitly, an
  automatic escalation to the smallest level that keeps the code scannable at the requested logo size.
- **Visual customization** of the data modules and the finder-pattern corners as `square`, `circle` or `rounded`.
- **Themeable colors** through CSS custom properties, with parts for the background, the dots and each corner
  element.
- **Configurable size and margin**, the second one expressed in modules.
- **Export** to an SVG blob, or to a PNG, JPEG, WebP or SVG file, optionally scaled and downloaded.
- **Safe by default**: unsafe logo URL schemes and non-image `data:` URIs are rejected.

### Acceptance criteria

- The component must render an SVG whenever a non-empty `value` is set, and nothing when it is not.
- It must pick an encoding mode and a version that fit the value, unless a `version` is pinned.
- `error-level` must drive the error correction of the generated matrix.
- `size` and `margin` must control the rendered pixels and the quiet zone without touching the encoded data.
- A valid `logo-src` must be centered over the code with the modules beneath it masked out.
- Unsafe logo values must be rejected, and the component must recover when a failed logo is replaced.
- `dot-style` and `square-style` must control their shapes independently.
- The colors must be customizable and must not invert with the light and dark theme variants.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and must handle degenerate configurations without throwing.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a QR code I can scan with the camera of a mobile device or with a scanning app;
- scan the code correctly even when a logo sits at its center;
- have the purpose of the code announced by my screen reader when I cannot see it.

### Developer stories

As a developer, I expect to be able to:

- set the value to encode without writing any QR generation logic;
- control the error correction level to balance capacity against resilience;
- pin a version when I need a predictable code size;
- control the rendered size and the quiet zone margin;
- add a center logo, and control how much of the code it may cover and how much whitespace surrounds it;
- rely on the component to pick a safe error correction level for the requested logo size;
- style the modules and the finder corners independently;
- theme the colors through CSS custom properties and target the internals through parts;
- export the code as a file or a blob, so that it can be printed or stored;
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

The code keeps a fixed size regardless of the length of the value, as long as the value fits the version.

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
whole code. When `error-level` is not set explicitly, the component escalates to the smallest level that
accommodates the requested size. A logo box that collapses to zero renders no image and throws nothing.

Logo sources are validated: `javascript:` and `vbscript:` URLs and non-image `data:` URIs are rejected, and an
image that fails to load leaves the code without a logo until a valid source is assigned.

#### Module and corner shapes

```html
<igc-qr-code value="https://www.infragistics.com" dot-style="rounded" square-style="circle"></igc-qr-code>
```

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
with its mask.

`toImage(options)` exports a file. `scale` multiplies the `size` of the component, `format` takes `png`, `jpeg`,
`webp` or `svg`, `fileName` names the file and gets the extension of the format appended, and `download` opens the
browser download dialog.

```ts
const file = await qrCode.toImage({ format: 'png', scale: 2, download: true });
```

Both methods reject when the component has no value, and `toImage()` also rejects on an unsupported format, a
non-positive or non-finite scale, and a result that exceeds the maximum canvas size.

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
| `version`     | `version`      | no        | `number \| undefined`               | —       | The version, 1 to 40; the smallest fitting one when unset.                |
| `errorLevel`  | `error-level`  | no        | `"L" \| "M" \| "Q" \| "H"`          | `M`     | The error correction level.                                               |
| `size`        | `size`         | no        | `number`                            | `128`   | The rendered width and height in pixels.                                  |
| `margin`      | `margin`       | no        | `number`                            | `4`     | The quiet-zone margin, in modules.                                        |
| `logoSrc`     | `logo-src`     | no        | `string \| undefined`               | —       | The source of the centered logo image.                                    |
| `logoSize`    | `logo-size`    | no        | `number`                            | `0.4`   | The logo size, as a ratio of the safe area.                               |
| `logoMargin`  | `logo-margin`  | no        | `number \| undefined`               | —       | The whitespace around the logo, in pixels.                                |
| `dotStyle`    | `dot-style`    | no        | `"square" \| "circle" \| "rounded"` | `square`| The shape of the data modules and of the inner corner dot.                |
| `squareStyle` | `square-style` | no        | `"square" \| "circle" \| "rounded"` | `square`| The shape of the outer finder-pattern corner squares.                     |

### Methods

| Method    | Signature                                          | Description                                                          |
| --------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| `toBlob`  | `(): Promise<Blob>`                                | Serializes the code to an `image/svg+xml` blob.                       |
| `toImage` | `(options?: QrCodeExportOptions): Promise<File>`   | Exports the code as a `png`, `jpeg`, `webp` or `svg` file.            |

`QrCodeExportOptions`

| Option     | Type                                     | Default     | Description                                            |
| ---------- | ---------------------------------------- | ----------- | ------------------------------------------------------ |
| `fileName` | `string`                                 | `qr-code`   | The name of the file; the extension is appended.        |
| `format`   | `"svg" \| "png" \| "jpeg" \| "webp"`     | `png`       | The output format.                                      |
| `scale`    | `number`                                 | `1`         | The multiplier applied to the size of the component.    |
| `download` | `boolean`                                | `false`     | Whether to open the browser download dialog.            |

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

| Suite                  | File              |
| ---------------------- | ----------------- |
| `IgcQrCodeComponent`   | `qr-code.spec.ts` |

### Accessibility tests

1. The component passes the accessibility audit when a value is set.
2. The SVG carries a `<title>` for screen readers, which uses the `aria-label` when one is provided.

### Default property values

3. `size`, `margin`, `errorLevel`, `dotStyle`, `squareStyle` and `value` have their documented defaults, and so do
   `logoSrc`, `logoSize` and `logoMargin`.

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

11. The `dot-style`, `square-style`, `error-level`, `version`, `logo-src`, `logo-size` and `logo-margin`
    attributes initialize their properties.

### Style variants

12. Each `dot-style` renders its data path, and each `square-style` renders its corner groups.

### Logo

13. No `<image>` or `<mask>` is rendered without a logo; a valid one renders both, with the image outside the
    masked group and the mask applied to the group holding the dots and the finders.
14. The mask id is stable across re-renders, and clearing the logo or replacing it with an unsafe URL removes the
    image and the mask.
15. Unsafe schemes and non-image `data:` URIs are blocked, while `data:image/` and `https://` URLs are accepted.
16. A logo that fails to load leaves the code without one, and the component recovers once a valid source is set.
17. A higher error correction level produces a larger code, and the logo area is capped to the safe area of the
    resolved level.
18. `logoMargin` reduces the visible logo, and a margin that consumes the whole logo box renders no image.

### Export

19. `toBlob()` returns an SVG blob, resolves the theme colors to `fill` attributes and strips the parts.
20. A data URI logo is kept as it is, a fetched one is inlined as a data URI, a logo assigned right before the
    export is awaited, and one that cannot be fetched is dropped together with its mask.
21. `toImage()` exports a PNG at the component size by default, scales the raster output, and exports an opaque
    JPEG, a WebP and an SVG with scaled dimensions.
22. An existing matching extension in the file name is kept, and the download dialog opens only when requested.
23. Both methods reject without a value, and `toImage()` rejects invalid options.

### Not covered by the suite

- The encoding mode selection and the automatic version choice are covered indirectly, through the rendering and
  the error correction tests, rather than asserted per mode.
- `margin` is not asserted on its own.

## Assumptions and limitations

- The component is presentational: it has no events, no slots and no keyboard interaction.
- `logoSize` is a ratio of the safe area of the resolved error correction level — at most about 9% of the area of
  the code — and not of the whole code.
- Logo sources are validated for their scheme and their media type, not for their content.
- A pinned `version` that cannot hold the value is the responsibility of the application.
- The colors deliberately do not follow the light and dark theme variants.
- `toImage()` is bounded by the maximum canvas size of the browser, so a very large size and scale combination is
  rejected.

## Accessibility

### ARIA roles and properties

- The rendered `<svg>` has `role="img"`.
- The `<svg>` holds a `<title>` describing the code, taken from `ariaLabel` when it is set and defaulting to
  `QR code: <value>`.

### Keyboard support

Not applicable. The component renders a static graphic and takes no focus.

### Right to Left support

The layout of a QR code — its finder patterns and its data modules — is fixed by the QR standard and must not be
mirrored in a Right-to-Left context. No RTL configuration is required or supported.

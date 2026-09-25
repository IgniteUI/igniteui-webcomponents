# Color picker specification

- [Color picker specification](#color-picker-specification)
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
      - [Anchor modes](#anchor-modes)
      - [Value and formats](#value-and-formats)
      - [The picker surface](#the-picker-surface)
      - [Swatches](#swatches)
      - [Copy and eye dropper](#copy-and-eye-dropper)
      - [Validation and form integration](#validation-and-form-integration)
      - [Labeling from the light DOM](#labeling-from-the-light-dom)
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
    - [CSS custom states](#css-custom-states)
  - [Test scenarios](#test-scenarios)
    - [Component suite](#component-suite)
    - [Picker canvas](#picker-canvas)
    - [Color model and parsing](#color-model-and-parsing)
    - [Converters](#converters)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                              |
| ------: | ---------- | -------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                              |
|       2 | 2026-09-24 | Describe the naming order and the host ARIA naming |
|       3 | 2026-09-24 | Keep `aria-expanded` off the input mode text input |

## Overview

The `igc-color-picker` component is a form-associated control that lets end-users pick and edit a color through an
interactive dropdown. It supports two anchor presentations: `mode="default"` renders a trigger button that previews
the current color - a checkered pattern when no value is set - while `mode="input"` renders an editable text field
with a color swatch prefix.

Activating the anchor opens a picker surface containing an HSV saturation and value gradient canvas, a hue slider,
an optional alpha slider, a format-aware color string input, an optional eye dropper, a copy-to-clipboard action and
an optional grid of predefined swatches. The selected color is exposed as a string in one of three formats - `hex`,
`rgb` or `hsl` - can be cleared to an empty value, and participates in standard HTML form submission, `required`
validation and validation message projection.

### Key features

- **Two anchor modes**: a preview trigger button, or an editable text field with a swatch prefix.
- **HSV canvas, hue and alpha sliders**, kept synchronized with the current color at all times.
- **Any CSS color string**: hex, `rgb()`/`rgba()`, `hsl()`/`hsla()` and named colors are parsed and normalized.
- **Three serialization formats**, switchable at run time without altering the represented color.
- **Predefined swatches**, applied with a single click.
- **Platform integrations**: the native `EyeDropper` API where available, and copy to clipboard.
- **Form association**: submits under its name, supports reset, `required` and custom validation.
- **Themeable**: shadow parts for every region, plus CSS custom properties for the slider tracks and the current
  color.

### Acceptance criteria

The `igc-color-picker` must:

- be WAI-ARIA compliant.
- participate in form association - submit its `value` under its `name`, and support reset, `required` and custom
  validation through the form-associated lifecycle.
- parse and accept any valid CSS color string assigned to `value`; an empty, whitespace-only or invalid string
  clears the value.
- render a checkered anchor background while the value is empty.
- serialize its `value` consistently in the currently selected `format`.
- keep the gradient canvas marker, the hue slider, the alpha slider and the color value input synchronized with the
  current color, deriving the canvas position from the HSV saturation and value.
- allow switching between `hex`, `rgb` and `hsl` without losing the represented color.
- optionally hide the format switcher through `hide-formats`, and show the alpha slider through `show-alpha`.
- render an eye dropper action only when the platform `EyeDropper` API is available.
- copy the current color value to the clipboard on demand.
- render a predefined set of color swatches when supplied, and apply a swatch on selection.
- close on an outside click, on <kbd>Escape</kbd> and on <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>, and open on
  <kbd>Alt</kbd> + <kbd>Arrow Down</kbd>, restoring focus to the anchor.
- emit `igcInput` on every interim interaction, and `igcChange` once, when the committed value has changed and focus
  leaves the component entirely.
- project the validation messages and reference them from the anchor through `aria-describedby`.
- expose styling hooks for the slider tracks and the current color through CSS custom properties.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- open the picker from a labelled anchor - a button previewing the current color, or an editable field with a color
  swatch - which shows a checkered pattern when no color is set.
- drag inside the gradient area to adjust saturation and brightness.
- drag the hue slider to change the base color, and the alpha slider to change the opacity.
- type an exact color string into the color value input.
- clear the value by deleting the text of the color value input, or of the anchor input in `input` mode.
- switch between the hex, RGB and HSL representations from a dropdown.
- pick a color from anywhere on my screen using the eye dropper, where it is supported.
- copy the selected color value to my clipboard.
- choose from a set of predefined swatches when they are provided.
- dismiss the picker with <kbd>Escape</kbd>, <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>, or by clicking outside of it.
- see a validation message when the field is required and left empty.

### Developer stories

As a developer, I expect to be able to:

- bind the picker to a form by setting `name`, and read and write its `value` as a string.
- choose the anchor presentation through `mode`.
- choose the serialization `format` of the emitted value.
- provide a list of predefined `swatches`.
- hide the format switcher with `hide-formats`, and show the alpha slider with `show-alpha`.
- mark the control as required, disable it, and surface the validation state through the standard form-associated
  API and the message slots.
- programmatically open, close or toggle the picker.
- react to interim and committed value changes through `igcInput` and `igcChange`, and to the open and close events.
- customize the hue and alpha slider tracks and the current color through CSS custom properties.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/design/RdH7Ndoku2zbujY2FN9bAt/Color-Picker-Component?m=auto&node-id=2134-2900&t=xPPuzZAPKarxiVyp-1)

The anchor previews the current color, or a checkered pattern while the value is empty. Activating it opens the
picker surface, positioned by an internal [`igc-popover`](../popover/spec.md) with flipping and shifting enabled.

Inside the picker the end-user can drag the gradient canvas to set saturation and brightness, drag the hue slider to
set the base color, drag the alpha slider or type an exact alpha value when `show-alpha` is set, type a full color
string into the color value input, activate a predefined swatch, copy the value, or pick a color from the screen
with the eye dropper.

Every interim interaction emits `igcInput`. The component records the value when focus enters it and compares it
when focus leaves entirely, emitting `igcChange` exactly once if it changed - dragging the canvas or the sliders, or
typing, never emits `igcChange` by itself.

### Developer experience

#### Basic initialization

```html
<igc-color-picker label="Brand color" name="brand"></igc-color-picker>
```

#### Anchor modes

```html
<!-- Trigger button previewing the current color (default) -->
<igc-color-picker mode="default" label="Brand color"></igc-color-picker>

<!-- Editable text field with a color swatch prefix -->
<igc-color-picker mode="input" label="Brand color"></igc-color-picker>
```

In `input` mode the label is forwarded to the anchor input; in `default` mode it is rendered as a separate element.
The swatch prefix of the input also opens the picker.

#### Value and formats

```html
<igc-color-picker value="#ff8800" format="rgb"></igc-color-picker>
```

The `value` property accepts any valid CSS color string - hex, `rgb()`/`rgba()`, `hsl()`/`hsla()` and named colors.
On assignment the string is parsed and validated into an internal color model that maintains synchronized RGB, HSL
and HSV representations plus an alpha channel. An empty, whitespace-only or invalid string produces an empty model
rather than a stale color; while empty, the anchor renders a checkered background and the serialized value is `''`.

The active `format` determines how the color is re-serialized into the observable `value`. Changing `format`
re-serializes the existing color without altering it, so no `igcInput` or `igcChange` is emitted.

#### The picker surface

The surface holds, in order: the gradient canvas, a row with the hue slider and the copy and eye dropper buttons, an
optional alpha row, a row with the format switcher and the color value input, and an optional swatch grid.

- Dragging the canvas sets the HSV saturation and value.
- The hue and alpha sliders are native range inputs.
- The color value input accepts a full color string and re-serializes it in the active format. A non-empty but
  invalid string reverts the input to the last valid color; an empty string clears the value.
- `hide-formats` removes the format switcher; `show-alpha` adds the alpha row.

After each change, and on open, the canvas marker is re-synchronized with the saturation and value of the current
color on the next animation frame.

#### Swatches

```typescript
picker.swatches = ['#ff0000', 'rgb(0 128 0)', 'hsl(210 100% 50%)', 'rebeccapurple'];
```

The swatches are rendered as clickable buttons below a divider. Activating one commits its color as the value and
emits `igcInput`.

#### Copy and eye dropper

The copy button writes the current value to the clipboard, silently ignoring a failure or an unavailable API. The
eye dropper button is rendered enabled only when the platform implements the `EyeDropper` API; support is captured
once, at construction time. Picking a color through it sets the value and emits `igcInput`.

#### Validation and form integration

```html
<form>
  <igc-color-picker name="brand" required>
    <span slot="helper-text">Pick the primary brand color</span>
    <span slot="value-missing">A color is required</span>
  </igc-color-picker>
  <button type="submit">Save</button>
</form>
```

The control submits its value under `name`, restores its default value on a form reset, and supports `required` and
custom validity. Validation messages are rendered through the shared validator container; see the
[validation container specification](../validation-container/spec.md).

#### Labeling from the light DOM

In `input` mode the anchor is an [`igc-input`](../input/spec.md), so an external `label` in the light DOM - bound
through `for` or wrapping the host - is resolved through `ElementInternals` and projected onto its native input as
an element reference. The picker projects its own `aria-haspopup` through the same channel. The open state stays on
the swatch button in the prefix as `aria-expanded`, because a text input has no role that allows it.

The name follows the [naming order](../input/spec.md#naming-order), so the host `aria-labelledby` and `aria-label` also
name the control. In `default` mode the trigger button takes its name in the same order, so an external `label` or the
host ARIA replaces the "Open color picker" text.

#### Programmatic control

```typescript
const picker = document.querySelector('igc-color-picker')!;

await picker.show();
await picker.hide();
await picker.toggle();

picker.value = '#336699';
picker.setCustomValidity('Pick a lighter shade');
```

### Localization

The component has no visible copy of its own. The remaining static labels are accessibility-only text: the hue and
alpha slider labels, the visually-hidden labels for the alpha value, the color format and the color value input, the
item text of the format switcher, and the visually-hidden text of the open, copy and eye dropper buttons. Color
values themselves are locale-independent CSS strings.

> [!NOTE]
> These static labels are not currently localizable.

### Keyboard interactions

| Key combination                            | Result                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| <kbd>Alt</kbd> + <kbd>Arrow Down</kbd>     | Opens the picker dropdown.                                                             |
| <kbd>Escape</kbd>                          | Closes the dropdown and returns focus to the anchor.                                   |
| <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>       | Closes the dropdown and returns focus to the anchor.                                   |
| <kbd>Arrow</kbd> keys                      | With the canvas marker focused, moves it one step in the pressed direction, updating the saturation and value. |
| <kbd>Tab</kbd>                             | Moves focus between the interactive elements inside the open picker; focus is trapped while open. |

All of the above are skipped while the component is `disabled`.

## API

### Properties and attributes

| Property          | Attribute       | Reflected | Type                      | Default   | Description                                                              |
| ----------------- | --------------- | --------- | ------------------------- | --------- | ------------------------------------------------------------------------ |
| value             | value           | No        | `string`                  | `''`      | The value as a CSS color string. Accepts hex, rgb(a), hsl(a) and named colors. |
| format            | format          | No        | `ColorFormat`             | `hex`     | The color format of the string value.                                    |
| mode              | mode            | Yes       | `ColorPickerMode`         | `default` | Whether the anchor is a trigger button or an editable text field.        |
| label             | label           | No        | `string \| undefined`     | -         | The label of the component.                                              |
| swatches          | -               | No        | `string[]`                | `[]`      | Pre-defined color strings rendered as clickable swatches.                |
| showAlpha         | show-alpha      | Yes       | `boolean`                 | false     | Whether to show the alpha slider and input.                              |
| hideFormats       | hide-formats    | Yes       | `boolean`                 | false     | Whether to hide the format picker buttons.                               |
| open              | open            | Yes       | `boolean`                 | false     | The open state of the component.                                         |
| scrollStrategy    | scroll-strategy | No        | `PopoverScrollStrategy`   | `hide`    | The behavior of the component when a parent container scrolls.           |
| required          | required        | Yes       | `boolean`                 | false     | Makes the component a required field for validation.                     |
| disabled          | disabled        | Yes       | `boolean`                 | false     | The disabled state of the component.                                     |
| invalid           | invalid         | No        | `boolean`                 | false     | Sets the control into invalid state (visual state only).                 |
| name              | name            | Yes       | `string`                  | -         | The name of the control, submitted with the form data.                   |
| defaultValue      | -               | No        | `string`                  | `''`      | The initial value of the control, restored on a form reset.              |
| form              | -               | No        | `HTMLFormElement \| null` | -         | Read-only. The form associated with this element.                        |
| validity          | -               | No        | `ValidityState`           | -         | Read-only. The validity state of the element.                            |
| validationMessage | -               | No        | `string`                  | -         | Read-only. The validation message of the element.                        |
| willValidate      | -               | No        | `boolean`                 | -         | Read-only. Whether the element is a candidate for constraint validation. |

### Methods

| Name              | Type signature            | Description                                                      |
| ----------------- | ------------------------- | ---------------------------------------------------------------- |
| show              | `(): Promise<boolean>`    | Shows the component.                                             |
| hide              | `(): Promise<boolean>`    | Hides the component.                                             |
| toggle            | `(): Promise<boolean>`    | Toggles the open state of the component.                         |
| checkValidity     | `(): boolean`             | Checks validity and emits `invalid` when the control is invalid. |
| reportValidity    | `(): boolean`             | Checks validity and shows the browser message when invalid.      |
| setCustomValidity | `(message: string): void` | Sets a custom message. Invalid while `message` is not empty.     |

### Events

| Name       | Cancellable | Detail   | Description                                        |
| ---------- | ----------- | -------- | -------------------------------------------------- |
| igcOpening | true        | -        | Emitted just before the picker dropdown is open.    |
| igcOpened  | false       | -        | Emitted after the picker dropdown is open.          |
| igcClosing | true        | -        | Emitted just before the picker dropdown is closed.  |
| igcClosed  | false       | -        | Emitted after closing the picker dropdown.          |
| igcInput   | false       | `string` | Emitted when the value of the component is changed. |
| igcChange  | false       | `string` | Emitted when the value of the component is committed. |

### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| `helper-text`   | Renders content below the picker.                                                |
| `value-missing` | Renders content when the required validation fails.                              |
| `custom-error`  | Renders content when setCustomValidity(message) is set.                          |
| `invalid`       | Renders content when the component is in invalid state (validity.valid = false). |

### CSS Shadow parts

| Part            | Description                                                                              |
| --------------- | ----------------------------------------------------------------------------------------- |
| `anchor`        | The trigger element that opens the picker - the button in default mode, or the swatch prefix in input mode. |
| `empty`         | Applied alongside `anchor` when no color value is set, rendering a checkered background.  |
| `label`         | The label rendered above the anchor in default mode.                                     |
| `picker`        | The popover container holding the canvas, sliders, inputs and swatches.                  |
| `main-row`      | The row containing the hue slider and the copy and eye dropper buttons.                  |
| `alpha-row`     | The row containing the alpha slider and input, rendered when `show-alpha` is set.        |
| `inputs-row`    | The row containing the format select and the color value input.                          |
| `buttons`       | The wrapper around the copy and eye dropper buttons.                                     |
| `hue`           | The hue slider.                                                                          |
| `alpha`         | The alpha slider.                                                                        |
| `copy`          | The button that copies the current color value to the clipboard.                         |
| `eye-dropper`   | The button that activates the EyeDropper API.                                            |
| `format-select` | The select control used to switch the color string format.                               |
| `swatches`      | The container of the pre-defined color swatches.                                         |
| `swatch`        | An individual color swatch button.                                                       |

### CSS custom properties

| Variable                 | Description                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `--current-color`        | The current color, applied to the preview thumb and the slider thumbs. Updated on every change. |
| `--hue-slider-track`     | The background gradient of the hue slider track.                                            |
| `--alpha-slider-track`   | The layered background image of the alpha slider track - a gradient over a checkerboard.    |
| `--alpha-track-position` | The `background-position` list applied to the alpha slider track layers.                    |
| `--alpha-track-size`     | The `background-size` list applied to the alpha slider track layers.                        |

### CSS custom states

| State                | Description                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `:state(ig-invalid)` | Applied to the host while the control is in an invalid state, through the form-associated mixin. |

## Test scenarios

The component is covered by five suites in this directory, all running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`color-picker.spec.ts`](./color-picker.spec.ts) | The component. |
| [`picker-canvas.spec.ts`](./picker-canvas.spec.ts) | The internal gradient canvas. |
| [`model.spec.ts`](./model.spec.ts) | The color model. |
| [`common.spec.ts`](./common.spec.ts) | Color string parsing and validation. |
| [`converters.spec.ts`](./converters.spec.ts) | The color space converters. |

The component suite reuses `createFormAssociatedTestBed`, `runValidationContainerTests`,
`runExternalLabelAssociationTests`, `runAriaProjectionTests` and the `simulate*` helpers from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### Component suite

1. Default state and rendering.
2. ARIA - the anchor semantics, the labels of the sliders and controls, and the described-by relation.
3. Scroll strategy - the `hide`, `scroll` and `close` behaviors of the anchored picker.
4. API - the public properties and methods.
5. Empty value - the checkered anchor, the empty serialized value, and clearing through the inputs.
6. Color value input - typing a color string, reverting an invalid one and clearing on an empty one.
7. `igcChange` - emitted once when focus leaves the component and the value has changed.
8. Color channels, including the alpha input.
9. Swatches - rendering the grid and applying a swatch.
10. Copy and eye dropper, in environments with and without platform support.
11. Open and close - the pointer, keyboard and outside-click paths.
12. Input mode - the anchor input, its label and its prefix.
13. Rendering of the picker surface rows.
14. Form association, the touched state, `defaultValue`, and validation.
15. Validation message slots, generated by `runValidationContainerTests`.
16. External label association and ARIA projection, generated by `runExternalLabelAssociationTests` and
    `runAriaProjectionTests`.

### Picker canvas

17. Rendering of the gradient and the marker.
18. Keyboard interaction - the arrow keys move the marker and update the saturation and value.
19. Pointer interaction - dragging sets the saturation and value.

### Color model and parsing

20. `ColorModel` - construction and factory methods, `parse`, the RGB, HSL and HSV setters, the alpha channel,
    `asString` in each format, the color space conversions, the utility methods and the edge cases.
21. `parseColor` - hex, rgb/rgba, hsl/hsla and named color parsing, a null context, and the edge cases.
22. `isValidColor` - accepting valid strings and rejecting invalid ones.

### Converters

23. The conversions between RGB, HSL, HSV and hex, in both directions, including round-trips.

## Assumptions and limitations

- The eye dropper button is always rendered, but it is only enabled when the platform implements the `EyeDropper`
  API. Support is captured once at construction time, so injecting or removing the global afterwards has no effect.
- Copying to the clipboard depends on the `navigator.clipboard` API and a secure context; it silently does nothing
  where it is unavailable or denied.
- `value` accepts any valid CSS color string, but the observable value is always normalized to the active `format`,
  so round-tripping an input string is not guaranteed to be byte-for-byte identical. An empty, whitespace-only or
  invalid string clears the value, except when it is committed through the popover or anchor color input, where a
  non-empty invalid string reverts to the last valid color.
- Named colors and other non-hex/rgb/hsl strings are resolved through an `OffscreenCanvas` 2D context; environments
  without canvas support resolve to the empty value rather than to a default color.
- The static UI labels are accessibility-only text and are not currently localized.

## Accessibility

### ARIA roles and properties

- The anchor is either a button labelled through visually-hidden text (default mode) or an
  [`igc-input`](../input/spec.md) exposing `label` directly (input mode). Both set `aria-haspopup="dialog"` and
  reference the validation and helper text container through `aria-describedby`, so helper and validation messages
  are announced.
- The trigger button of the default mode and the swatch button of the input mode reflect the open state through
  `aria-expanded`. The text input of the input mode does not carry it.
- The hue and alpha sliders are native range inputs labelled through `aria-label`.
- The gradient canvas marker is focusable and operable with the arrow keys.
- The format switcher is a select with a visually-hidden label, and the color value input carries one as well.
- The copy and eye dropper buttons expose visually-hidden text, and each swatch button exposes its color through
  `aria-label`.
- While the picker is open, focus is trapped within it; the picker content is excluded from the tab order while
  closed.

**References**

- [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper)
- [Clipboard.writeText()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- [`input[type="range"]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range)
- [Form-associated custom elements (ElementInternals)](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
- [CSS Custom State Set](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet)

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The sliders and the picker
layout follow the document direction; color values are direction-independent.

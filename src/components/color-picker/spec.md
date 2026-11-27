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
    - [Default](#default)
    - [ARIA](#aria)
    - [Localization](#localization-1)
    - [Scroll strategy](#scroll-strategy)
    - [API](#api-1)
    - [Empty value](#empty-value)
    - [Color value input](#color-value-input)
    - [igcChange](#igcchange)
    - [Color channels](#color-channels)
    - [Inner events](#inner-events)
    - [Swatches](#swatches-1)
    - [Copy and EyeDropper](#copy-and-eyedropper)
    - [Open and close](#open-and-close)
    - [Input mode](#input-mode)
    - [Rendering](#rendering)
    - [Form associated](#form-associated)
    - [Touched state](#touched-state)
    - [defaultValue](#defaultvalue)
    - [Initial format](#initial-format)
    - [Value state motion](#value-state-motion)
    - [Validation](#validation)
    - [Validation message slots](#validation-message-slots)
    - [External label association](#external-label-association)
    - [Default mode trigger](#default-mode-trigger)
    - [ARIA projection](#aria-projection)
    - [Host ARIA](#host-aria)
    - [Disabled popup](#disabled-popup)
    - [Picker canvas - Marker and color rendering](#picker-canvas---marker-and-color-rendering)
    - [Picker canvas - Keyboard interaction](#picker-canvas---keyboard-interaction)
    - [Picker canvas - Pointer interaction](#picker-canvas---pointer-interaction)
    - [ColorModel - constructor and factory methods](#colormodel---constructor-and-factory-methods)
    - [ColorModel - Color string parsing](#colormodel---color-string-parsing)
    - [ColorModel - RGB property setters](#colormodel---rgb-property-setters)
    - [ColorModel - HSL property setters](#colormodel---hsl-property-setters)
    - [ColorModel - HSV property setters](#colormodel---hsv-property-setters)
    - [ColorModel - alpha property](#colormodel---alpha-property)
    - [ColorModel - asString](#colormodel---asstring)
    - [ColorModel - color space conversions](#colormodel---color-space-conversions)
    - [ColorModel - Extreme values and conversion drift](#colormodel---extreme-values-and-conversion-drift)
    - [ColorModel - HSL and HSV factories and hex parsing](#colormodel---hsl-and-hsv-factories-and-hex-parsing)
    - [ColorModel - Clone, equality and tuple methods](#colormodel---clone-equality-and-tuple-methods)
    - [Color strings - parseColor](#color-strings---parsecolor)
    - [Color strings - isValidColor](#color-strings---isvalidcolor)
    - [Color strings - tryParseColor](#color-strings---tryparsecolor)
    - [Color converters - rgb -> hex](#color-converters---rgb---hex)
    - [Color converters - rgb -> hsl](#color-converters---rgb---hsl)
    - [Color converters - rgb -> hsv](#color-converters---rgb---hsv)
    - [Color converters - hsl -> hsv](#color-converters---hsl---hsv)
    - [Color converters - hsv -> hsl](#color-converters---hsv---hsl)
    - [Color converters - hsl -> rgb](#color-converters---hsl---rgb)
    - [Color converters - hsv -> rgb](#color-converters---hsv---rgb)
    - [Color converters - Color space round-trips](#color-converters---color-space-round-trips)
    - [Color properties - Color converters](#color-properties---color-converters)
    - [Color properties - Color parsing](#color-properties---color-parsing)
    - [Color properties - Color model](#color-properties---color-model)
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
|       4 | 2026-09-28 | Add the property-based color suite                 |
|       5 | 2026-09-30 | Serialize the initial value in the declared format |
|       6 | 2026-10-02 | Focus after form checks; `invalid` only on checks  |
|       7 | 2026-10-02 | Forward the host `aria-describedby`                |
|       8 | 2026-10-19 | Localize the labels through `igniteui-i18n-core`   |
|       9 | 2026-10-21 | API descriptions aligned with the JSDoc.           |
|      10 | 2026-10-23 | The color picker makes a stacking context, so the z-index of the focus ring of the anchor does not compete with the layers of the page |
|      11 | 2026-11-02 | The events of the inner inputs, format select and canvas stay inside the picker |
|      12 | 2026-11-02 | A `focus()` call before the first render applies after the render; `focus()` and `blur()` in the API |
|      13 | 2026-11-06 | A closed picker does not cancel <kbd>Escape</kbd> |
|      14 | 2026-11-11 | The keys that an IME handles do nothing |
|      15 | 2026-11-18 | A change of the user marks the control touched, so a change that fails validation shows the invalid styles at once |
|      16 | 2026-11-18 | A value set from code is not a user change, also while focus is inside, so no `igcChange` reports it |
|      17 | 2026-11-18 | In input mode, the text input shows only the invalid state of the picker, and reports the validity of the picker |
|      18 | 2026-11-23 | A disabled picker stays closed; the shared disabled popup suite |
|      19 | 2026-11-20 | In input mode, a color that the user picks animates the input; a value from code shows at once |
|      20 | 2026-11-25 | `name` updates its attribute at once |
|      21 | 2026-11-27 | Test scenarios mirror the `describe` blocks: one group per component block, and `<suite> - <block>` groups for the unit suites |

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
- **Localization**: the accessible labels come from `igniteui-i18n-core` through `locale` and `resourceStrings`.
- **Themeable**: shadow parts for every region.

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

Every interim interaction emits `igcInput` and marks the control touched, so a change that fails validation shows
the invalid styles at once. When focus leaves the component entirely, it compares the color with the last reported
color - the color of the last `igcChange` or the last value set from code, in any format - and emits `igcChange`
exactly once if it changed. Dragging the canvas or the sliders, or typing, never emits `igcChange` by itself. A value set from code is
not a user change, so it emits no `igcChange`, also while focus is inside the component.

**Motion.** In input mode, a color that the user picks animates the input, such as the Material label that moves up. A
value from code shows at once, also a value that an `igcChange` handler sets. The color picker suite covers a typed
color and a value from code after it; the [input](../input/spec.md) suite covers the motion of the input itself.

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
re-serializes the existing color without altering it, so no `igcInput` or `igcChange` is emitted. The initial value
is serialized in the declared `format` whatever the attribute order, and the re-serialization keeps the pristine
state of the control.

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
[validation container specification](../validation-container/spec.md). In input mode, the text input shows the invalid
state of the picker, and no invalid state of its own.

As for a native control, a failed submit or `form.reportValidity()` moves the focus to the first invalid control of
the form, and `reportValidity()` moves it to the control when it is invalid. `form.checkValidity()` and
`checkValidity()` do not move the focus. The `invalid` event comes only from these checks and from a failed submit,
not while the user edits the control.

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

The component takes its resource strings from the `igniteui-i18n-core` package through the `locale` and
`resourceStrings` properties. Without an explicit `locale`, it takes its own `lang`, else the locale of the nearest
ancestor that has a `locale` (a component) or a `lang`, and then the global locale of the library. A key that the
strings of a locale do not have falls back to its English value. The strings are accessibility-only text: the component
has no visible copy of its own, except the placeholders of the alpha input and the format select.

| Key                          | Default English value             | Used for                                                       |
| ---------------------------- | --------------------------------- | -------------------------------------------------------------- |
| `color_picker_open`          | Open color picker                 | The name of the trigger button and of the input mode prefix.   |
| `color_picker_dialog_label`  | Color picker                      | The name of the picker dialog.                                 |
| `color_picker_hue`           | Hue                               | The name of the hue slider.                                    |
| `color_picker_alpha`         | Alpha slider                      | The name of the alpha slider.                                  |
| `color_picker_alpha_value`   | Alpha value                       | The label and the placeholder of the alpha input.              |
| `color_picker_format`        | Color format                      | The label and the placeholder of the format select.            |
| `color_picker_copy`          | Copy color value to clipboard     | The name of the copy button.                                   |
| `color_picker_eye_dropper`   | Pick a color from the screen      | The name of the eye dropper button.                            |
| `color_picker_canvas_label`  | Saturation and value              | The name of the canvas marker.                                 |
| `color_picker_canvas_value`  | Saturation {0}%, brightness {1}%  | The `aria-valuetext` of the canvas marker. `{0}` is the saturation and `{1}` the brightness. |
| `color_picker_value`         | Color value                       | The label of the color value input.                            |

The item text of the format select (Hex, RGB, HSL) is not localized, because the format names are notation names.
Color values are locale-independent CSS strings.

### Keyboard interactions

| Key combination                            | Result                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| <kbd>Alt</kbd> + <kbd>Arrow Down</kbd>     | Opens the picker dropdown.                                                             |
| <kbd>Escape</kbd>                          | Closes the dropdown and returns focus to the anchor. While the dropdown is closed, it does not cancel the key. |
| <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>       | Closes the dropdown and returns focus to the anchor.                                   |
| <kbd>Arrow</kbd> keys                      | With the canvas marker focused, moves it one step in the pressed direction, updating the saturation and value. |
| <kbd>Tab</kbd>                             | Moves focus between the interactive elements inside the open picker; focus is trapped while open. |

All of the above are skipped while the component is `disabled`. A key that an IME handles, such as the <kbd>Enter</kbd> that commits a composition, does nothing here.

## API

### Properties and attributes

| Property          | Attribute       | Reflected | Type                      | Default   | Description                                                              |
| ----------------- | --------------- | --------- | ------------------------- | --------- | ------------------------------------------------------------------------ |
| value             | value           | No        | `string`                  | `''`      | The value as a CSS color string. Accepts hex, rgb(a), hsl(a) and named colors. |
| format            | format          | No        | `ColorFormat`             | `hex`     | The color format of the string value. A format change renders `value` in the new notation. |
| mode              | mode            | Yes       | `ColorPickerMode`         | `default` | Whether the anchor is a trigger button or an editable text field.        |
| label             | label           | No        | `string \| undefined`     | -         | The label of the component.                                              |
| swatches          | -               | No        | `string[]`                | `[]`      | Pre-defined color strings. The component renders them as clickable swatches below the picker controls. A click on a swatch sets its color as the value. |
| showAlpha         | show-alpha      | Yes       | `boolean`                 | false     | Whether to show the alpha slider and input.                              |
| hideFormats       | hide-formats    | Yes       | `boolean`                 | false     | Whether the format select is hidden.                                     |
| locale            | locale          | No        | `string`                  | -         | The locale for the resource strings. Falls back to the inherited locale, then the global one.    |
| resourceStrings   | -               | No        | `IColorPickerResourceStrings` | EN    | The texts of the component. The strings that you set replace the strings of the current locale. Reading returns all the strings, with your strings over the locale strings.                                   |
| open              | open            | Yes       | `boolean`                 | false     | Whether the component is open. A disabled form control stays closed.   |
| scrollStrategy    | scroll-strategy | No        | `PopoverScrollStrategy`   | `hide`    | The behavior of the component when a parent container scrolls.           |
| required          | required        | Yes       | `boolean`                 | false     | Whether the control is required. A required control that has no value, or is not checked, fails validation.                     |
| disabled          | disabled        | Yes       | `boolean`                 | false     | Whether the control is disabled. A disabled control is not validated, and the form does not submit its value.                                     |
| invalid           | invalid         | No        | `boolean`                 | false     | Whether the control shows the invalid state. It changes only the visual state, not the validity.                 |
| name              | name            | Yes       | `string`                  | -         | The name of the control, submitted with the form data.                   |
| defaultValue      | -               | No        | `string`                  | `''`      | The default value of the control. A form reset restores the value to it. While the value is unchanged since the start or the last form reset, a new default also sets the value. The `value` attribute also sets it.              |
| form              | -               | No        | `HTMLFormElement \| null` | -         | Read-only. The form that the control is associated with, or `null`.                        |
| validity          | -               | No        | `ValidityState`           | -         | Read-only. The validity state of the control.                            |
| validationMessage | -               | No        | `string`                  | -         | Read-only. The validation message of the control. It is empty when the control is valid.                        |
| willValidate      | -               | No        | `boolean`                 | -         | Read-only. Whether the control is a candidate for constraint validation. |

### Methods

| Name              | Type signature                   | Description                                                             |
| ----------------- | -------------------------------- | ----------------------------------------------------------------------- |
| focus             | `(options?: FocusOptions): void` | Sets focus on the color picker.                                         |
| blur              | `(): void`                       | Removes focus from the color picker.                                    |
| show              | `(): Promise<boolean>`           | Opens the component. It does not emit events. The promise resolves to `false` when the component is already open or is a disabled form control, or when a later call replaces this one. |
| hide              | `(): Promise<boolean>`           | Closes the component. It does not emit events. The promise resolves to `false` when the component is already closed, or when a later call replaces this one. |
| toggle            | `(): Promise<boolean>`           | Opens the component when it is closed, and closes it when it is open. It does not emit events. The promise resolves to `true` when the state changes. |
| checkValidity     | `(): boolean`                    | Checks validity and emits `invalid` when the control is invalid. Returns `true` when the control is valid. |
| reportValidity    | `(): boolean`                    | Checks validity. As for a native control, an invalid control emits `invalid` and takes the focus. It shows its own validation messages, not the message of the browser. Returns `true` when the control is valid. |
| setCustomValidity | `(message: string): void`        | Sets a custom validation message. The control is invalid while the message is not empty. An empty string removes the custom error. |

### Events

| Name       | Cancellable | Detail   | Description                                        |
| ---------- | ----------- | -------- | -------------------------------------------------- |
| igcOpening | true        | -        | Emitted before the user opens the picker dropdown. Cancelable. |
| igcOpened  | false       | -        | Emitted after the picker dropdown opens on a user action. |
| igcClosing | true        | -        | Emitted before the user closes the picker dropdown. Cancelable. |
| igcClosed  | false       | -        | Emitted after the picker dropdown closes on a user action. |
| igcInput   | false       | `string` | Emitted when the user changes the color with the canvas, the sliders, the alpha input, a swatch or the eyedropper. |
| igcChange  | false       | `string` | Emitted when the focus leaves the component after the user changed the color. |

The events of the inner inputs, format select and canvas stay inside the picker. Only the events in this table
reach the listeners on the picker.

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
| `color-picker`  | The wrapper of the anchor, the label and the helper text.                                |
| `anchor`        | The trigger element that opens the picker - the button in default mode, or the swatch prefix in input mode. |
| `empty`         | Applied alongside `anchor` when no color value is set, rendering a checkered background.  |
| `input-mode`    | Added to the anchor part in input mode.                                                  |
| `label`         | The label rendered after the anchor in default mode.                                     |
| `picker`        | The popover container holding the canvas, sliders, inputs and swatches.                  |
| `picker-canvas` | The saturation and value canvas.                                                         |
| `marker`        | The marker on the canvas that shows the saturation and value.                            |
| `dragging`      | Added to the marker part while the user drags it.                                        |
| `main-row`      | The row containing the hue slider and the copy and eye dropper buttons.                  |
| `alpha-row`     | The row containing the alpha slider and input, rendered when `show-alpha` is set.        |
| `inputs-row`    | The row containing the format select and the color value input.                          |
| `buttons`       | The wrapper around the copy and eye dropper buttons.                                     |
| `hue`           | The hue slider.                                                                          |
| `alpha`         | The alpha slider.                                                                        |
| `alpha-input`   | The input of the alpha value, rendered when `show-alpha` is set.                         |
| `copy`          | The button that copies the current color value to the clipboard.                         |
| `eye-dropper`   | The button that activates the EyeDropper API.                                            |
| `format-select` | The select control used to switch the color string format.                               |
| `swatches`      | The container of the pre-defined color swatches.                                         |
| `swatch`        | An individual color swatch button.                                                       |

### CSS custom states

| State        | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `ig-invalid` | Set while the control shows its invalid state, that is while `invalid` returns `true`. |

### CSS custom properties

| Property                | Description                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ig-helper-min-lines` | The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`. |

The `--_` variables in its styles, for example `--_current-color`, are internal.

### CSS custom states

| State                | Description                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `:state(ig-invalid)` | Applied to the host while the control is in an invalid state, through the form-associated mixin. |

## Test scenarios

The component is covered by six suites in this directory, all running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`color-picker.spec.ts`](./color-picker.spec.ts) | The component. |
| [`picker-canvas.spec.ts`](./picker-canvas.spec.ts) | The internal gradient canvas: the marker, the keyboard and the pointer. |
| [`model.spec.ts`](./model.spec.ts) | The color model: construction and factory methods, `parse`, the RGB, HSL and HSV setters, the alpha channel, `asString` in each format, the color space conversions, the utility methods and the edge cases. |
| [`common.spec.ts`](./common.spec.ts) | Color string parsing and validation: `parseColor`, `isValidColor` and `tryParseColor`. |
| [`converters.spec.ts`](./converters.spec.ts) | The conversions between RGB, HSL, HSV and hex, in both directions, including round-trips. |
| [`color.property.spec.ts`](./color.property.spec.ts) | Property-based (fuzz) tests for the converters, the parser and the model. |

The component suite reuses `createFormAssociatedTestBed`, `runValidationContainerTests`,
`runExternalLabelAssociationTests`, `runAriaProjectionTests` and the `simulate*` helpers from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks. A group of a unit
suite is titled `<suite> - <block>`.

### Default

1. The picker renders and passes the accessibility audit closed, open, and open with the alpha row.
2. The focus ring of the anchor is painted under an earlier page layer with `z-index: 1`.

### ARIA

3. The open popover is a dialog named "Color picker", and the anchor points at it through `aria-haspopup="dialog"`
   and `aria-controls`.
4. Without helper content, the helper text describes the anchor. In button mode, the anchor lists the helper text
   before the host description, also after the first render.
5. The anchor reflects the open state through `aria-expanded`.
6. The canvas marker gets the saturation and value of the current color. Without a value, the canvas paints the hue
   that the hue slider points at, the alpha ramp and the canvas marker start at white, and the marker starts at the
   white corner.
7. The alpha field is a text field that its `<label>` labels, not a `spinbutton`.

### Localization

8. The labels are the English strings by default, take the strings of `locale`, and follow a change of the global
   locale.
9. The prefix button of the input mode and the color value input take their labels from the locale.
10. `resourceStrings` overrides a single string.

### Scroll strategy

11. With `scroll`, the picker stays open when its container scrolls. With `close`, it closes and emits `igcClosing` and
    `igcClosed`.

### API

12. `toggle()` opens and closes the picker.

### Empty value

13. The value is empty by default, and the anchor is checkered while the value is empty.
14. An empty string, `null` and `undefined` revert the value to empty.

### Color value input

15. A valid color string commits, an invalid one reverts the input, and an empty one clears the value.
16. The placeholder hints the notation of the active format: `#rrggbb`, `rgb(r g b)` or `hsl(h s% l%)`.

### igcChange

17. `igcChange` is emitted when focus leaves the component and the user changed the value.
18. A value set from code while focus is inside, an unchanged value, a focus move inside the component or to slotted
    content, and a change of the format alone emit nothing.
19. A color change together with a format change emits the value in the new format. A color that returns to the
    reported one in another format emits nothing.

### Color channels

20. The hue slider and the alpha slider update the color. An alpha slider move that keeps the alpha emits no
    `igcInput`.
21. The alpha input updates the alpha and shows it as a percentage. The caret stays in front of the `%` suffix,
    non-digits are stripped, the value is clamped to 100, and an emptied input reverts on commit. The arrow keys step
    the alpha, leave the caret in place, stop it at the `%`, and hold at the bounds without a new event.
22. While `showAlpha` is off, an arrow key on the hue slider is not cancelled.
23. The hue and alpha sliders follow a color change from elsewhere.
24. A canvas pick sets the HSV saturation and value and keeps the hue. The canvas marker takes the selected color and
    stays opaque at any alpha.
25. The format select changes the format and the color value input.

### Inner events

26. The `igcInput` of the alpha input, the color value input and the input anchor, the open and close events of the
    format select, and the `igcColorPicked` of the canvas do not reach a listener on the picker.

### Swatches

27. No swatches render by default. A swatch renders and applies its color on click, whatever its accessible name.
28. A swatch click while disabled changes nothing.

### Copy and EyeDropper

29. The copy action writes the value to the clipboard.
30. Without the `EyeDropper` API, the eye dropper button is disabled. With it, the button picks a color, and a pick
    that ends after the picker is disabled changes nothing and emits no `igcInput`.

### Open and close

31. A click on the anchor opens and closes the picker with the opening and closing events.
32. <kbd>Escape</kbd> closes the picker and focuses the anchor. A closed picker does not cancel <kbd>Escape</kbd>, and
    an <kbd>Escape</kbd> that an IME handles keeps the picker open.
33. <kbd>Alt</kbd> + <kbd>Arrow Down</kbd> opens and <kbd>Alt</kbd> + <kbd>Arrow Up</kbd> closes the picker. A disabled
    picker ignores the keys.

### Input mode

34. The anchor is an input instead of a button, and its swatch preview has the orientation of the button anchor. While
    empty, the input hints the notation of the active format, and its label stays floated while the picker is open.
35. The prefix swatch is a keyboard operable button that opens the picker. It carries the open state (the text input
    does not) and reflects `disabled`.
36. The anchor input commits a color, returns to the empty state when cleared, and takes the `required` and invalid
    state of the picker.

### Rendering

37. The label renders only in the default mode with `label` set. The input mode renders no label element.
38. The button anchor reflects `disabled`. The alpha row renders only with `showAlpha`, and `hideFormats` hides the
    format select.
39. The slider tracks run in the direction of the ranges in LTR, and in RTL from an ancestor or from the host `dir`.

### Form associated

40. The picker is form associated, submits nothing without a value, and submits its value under its name.
41. A form reset clears the value, and in input mode also the anchor input.
42. In input mode, the anchor input shows the invalid state of the picker at once.
43. A disabled ancestor disables the picker. The required and custom constraints fail and then pass.

### Touched state

44. Focus that leaves the picker marks it touched. A user change that fails validation shows the invalid styles at
    once, and a form reset clears them.

### defaultValue

45. The picker starts pristine with its `defaultValue`, submits it, and restores it on a form reset.

### Initial format

46. A `value` attribute before or after the `format` attribute is serialized in the format.
47. With a `defaultValue` set before the format, the picker stays pristine, submits the value in the format, and
    restores the value in the format on a form reset.

### Value state motion

In input mode.

48. A typed color marks the anchor input as a user change.
49. A value from code right after it ends the user change, so the input shows it at once.

### Validation

50. `required` fails without a value and passes with a `defaultValue`, and the picker stays pristine.

The focus after the form checks and the `invalid` event rules come from the form-associated mixin. The
[input suite](../input/spec.md#form-validity-checks) covers them.

### Validation message slots

51. The `valueMissing`, `customError` and `invalid` slots, generated by `runValidationContainerTests`.

### External label association

Generated by `runExternalLabelAssociationTests` in input mode, with the native input of the anchor.

52. An external `label` bound through `for`, and a `label` wrapping the host, label the native input. A `label` added
    after the first render labels it from the first focus, and an axe audit passes with only an external `label`.
53. The host `aria-labelledby` and `aria-label` name the native input, an external `label` wins over `aria-label`, and
    the name follows a change and a removal of the host attributes.

### Default mode trigger

54. The same shared suite in the default mode, with the trigger button as the control.

### ARIA projection

55. Generated by `runAriaProjectionTests` in input mode: the anchor input takes the host semantics with
    `aria-haspopup="dialog"`, and the helper text describes it.

### Host ARIA

56. The shared host description suite: the host `aria-describedby` describes the native control after the helper
    text, and follows a change and a removal.
57. The shared focus suite (`runFocusBeforeRenderTests`): a `focus()` call right after the element connects focuses
    the same element as a call after the first render. `blur()`, a later `focus()` on another element and a removal
    that lasts until the render cancel the call, but a move in the same task keeps it. After the render, `focus()`
    takes the focus at once and `blur()` removes it. A `focus()` call before the render on a component with
    `disabled` set does not cancel an earlier call on another element.

### Disabled popup

58. The shared runner `runDisabledPopupTests`, with the anchor as the `aria-expanded` target.

### Picker canvas - Marker and color rendering

59. The marker is focusable and is a slider named "Saturation and value", from 0 to 100. `aria-valuenow` is the
    saturation, and `aria-valuetext` announces both axes in the format of `markerValueFormat`. `markerLabel`
    overrides the name.
60. `getMarkerDimensions()` returns half the marker size, and zero before the marker renders. `x` and `y` set the
    marker position.
61. `currentColor` sets the host color, and `markerColor` fills the marker. Without `markerColor`, the marker has no
    fill.

### Picker canvas - Keyboard interaction

62. The arrow keys move the marker and emit `igcColorPicked` with rounded percentages of the canvas size. At the
    boundaries, the marker stops and no event is emitted.

### Picker canvas - Pointer interaction

63. A pointer down and a pointer move drag the marker. A lost pointer capture ends the drag and focuses the marker,
    and a pointer down of a button other than the main one does nothing.
64. `igcColorPicked` does not bubble.
65. A drag measures the canvas once, not once per move, and a drag after a resize measures it again.

### ColorModel - constructor and factory methods

66. `default()` creates opaque black. `empty()` creates an empty color at the origin of the saturation and value
    plane. A channel write clears the empty state, a clone keeps it, and an empty color does not equal a color that is
    not empty.
67. The constructor takes the RGB channels and an alpha, and clamps the alpha from 0 to 1.

### ColorModel - Color string parsing

68. `parse` reads hex colors (also with alpha), rgb, rgba and named colors. An empty or whitespace string gives an
    empty color.

### ColorModel - RGB property setters

69. Each RGB setter updates its channel, clamps it from 0 to 255, and updates the HSL and HSV values.

### ColorModel - HSL property setters

70. The hue, saturation and lightness setters update their channels and clamp them (hue from 0 to 360, the others
    from 0 to 100), and update the RGB values.

### ColorModel - HSV property setters

71. The value setter updates the value, clamps it from 0 to 100, and updates the RGB and HSL values.

### ColorModel - alpha property

72. `alpha` reads and writes the alpha, clamped from 0 to 1.

### ColorModel - asString

73. The `hex`, `rgb` and `hsl` formats leave out the alpha when it is 1, write it when it is less than 1, and write it
    on request. The hex format writes black and white, and the rgb and hsl formats round their channels.

### ColorModel - color space conversions

74. A color stays the same through the conversions between the spaces, and grayscale and pure colors convert
    correctly.

### ColorModel - Extreme values and conversion drift

75. Black has every channel at 0. White has full RGB channels, no saturation, and full lightness and value.
    Repeated writes of the HSL channels do not change the serialized strings.

### ColorModel - HSL and HSV factories and hex parsing

76. `fromHSL` and `fromHSV` create colors, also with an alpha, and `fromHSV` wraps a negative or out of range hue.
77. `parse` reads a hex string with or without a leading hash, with surrounding spaces and in short form. It reads four
    hex digits as `#RGBA`, and gives an empty color for a string that is not a color.

### ColorModel - Clone, equality and tuple methods

78. `clone()` gives an independent copy, and `equals()` compares the channels and the alpha.
79. `toRGB()`, `toHSL()` and `toHSV()` return tuples, and a change of the array given to the constructor does not
    change the color.

### Color strings - parseColor

80. A null context, an invalid color and an empty string give opaque black.
81. A context that serializes a color as 8-digit hex gives its alpha, and a serialization without hex digits gives
    black.
82. Hex colors parse with 6, 3 and 8 digits and without a hash. rgb and rgba (with spaces and a zero alpha), the named
    colors red, white, black and transparent, and hsl and hsla parse too.
83. An invalid string and a malformed hex color give opaque black, and the result has a `value` tuple and an `alpha`.

### Color strings - isValidColor

84. Valid hex, rgb, rgba and named colors pass. Invalid colors, empty or whitespace strings and a null context fail.

### Color strings - tryParseColor

85. A valid color parses with one validation (four writes of `fillStyle`). An invalid color, an empty string and a
    null context give `null`.

### Color converters - rgb -> hex

86. The primaries and grayscale convert, and out of range channels are rounded and clamped.

### Color converters - rgb -> hsl

87. Known colors convert.

### Color converters - rgb -> hsv

88. Red, green and blue dominant colors convert, and achromatic colors have no hue and no saturation.

### Color converters - hsl -> hsv

89. Colors at or below 50% lightness and above it convert, and the saturation and value stay in range across the
    sweep.

### Color converters - hsv -> hsl

90. Known colors convert, and the saturation stays finite for a tiny saturation at full value.

### Color converters - hsl -> rgb

91. Known colors convert, and achromatic colors convert to gray.

### Color converters - hsv -> rgb

92. Known colors convert.

### Color converters - Color space round-trips

93. RGB to HSV to RGB, RGB to HSL to RGB, and HSL to HSV to HSL keep the color across the hue sweep. The HSL and HSV
    conversions of one color agree on the hue.

### Color properties - Color converters

94. Integer channels round-trip through hex exactly, and colors round-trip through HSL and HSV. HSL converts to the
    same color directly and through HSV, an HSV hue converts the same after any number of full turns, and every
    converted channel stays in range.

### Color properties - Color parsing

95. `parseColor` never throws and returns channels in range for any string. A string that is not a color gives opaque
    black and an empty model. A model string in each format parses back to the same color.

### Color properties - Color model

96. Every color space stays in range for any sequence of channel writes, and a clone equals its source.

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
- The label of the color value input and the format names are not localized. See [Localization](#localization).

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
- A host `aria-describedby` describes the native control after the helper text, by element reference.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The sliders and the picker
layout follow the document direction; color values are direction-independent.

In RTL, the hue and alpha slider tracks go from right to left, as the sliders do. The tracks use the `dir` attribute
through `:dir()`. A `direction: rtl` style without a `dir` attribute reverses the sliders but not the tracks.

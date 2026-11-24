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
      - [Contrast](#contrast)
      - [Confirm mode](#confirm-mode)
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
    - [Host ARIA](#host-aria)
    - [Disabled popup](#disabled-popup)
    - [Value state motion](#value-state-motion)
    - [Color panel](#color-panel)
    - [Confirm mode](#confirm-mode-1)
    - [Color names](#color-names)
    - [Contrast ratio](#contrast-ratio)
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
|      20 | 2026-11-23 | Any CSS color converts to sRGB and clips to its gamut; a color that depends on its context is invalid; the area keys step in percent, with large steps |
|      21 | 2026-11-23 | Input mode: the clear icon, `clear()`, the `field` part and the forwarded parts of the text field ([#2647](https://github.com/IgniteUI/igniteui-webcomponents/issues/2647), [#2637](https://github.com/IgniteUI/igniteui-webcomponents/issues/2637)) |
|      22 | 2026-11-23 | The popup shows an [`igc-color-panel`](../color-panel/spec.md); the parts and the behavior do not change |
|      23 | 2026-11-23 | Swatch children and groups, the swatch listbox and its keys, the no-color swatch, `var()` swatches, `views` and `active-view` |
|      24 | 2026-11-23 | Review fixes: one selected swatch, the format names from the resource strings, the same color keeps the model |
|      25 | 2026-11-23 | The `oklch` format |
|      26 | 2026-11-23 | The confirm mode of `selection-commit`: the draft, the preview, Cancel and Apply, and the `footer` slot |
|      27 | 2026-11-23 | The value text of the sliders, color names, swatch names from the color name, and the copy feedback |
|      28 | 2026-11-24 | In input mode, the picker is a block and the text field fills its container, so the clear icon does not change its width |
|      29 | 2026-11-24 | The contrast readout: `contrast-against` passes to the panel, and the popup shows the WCAG 2 ratio and the AA and AAA levels |

## Overview

The `igc-color-picker` component is a form-associated control that lets end-users pick and edit a color through an
interactive dropdown. It supports two anchor presentations: `mode="default"` renders a trigger button that previews
the current color - a checkered pattern when no value is set - while `mode="input"` renders an editable text field
with a color swatch prefix.

Activating the anchor opens a picker surface, an [`igc-color-panel`](../color-panel/spec.md), containing an HSV
saturation and value gradient canvas, a hue slider,
an optional alpha slider, a format-aware color string input, an optional eye dropper, a copy-to-clipboard action and
an optional grid of predefined swatches. The selected color is exposed as a string in one of four formats (`hex`,
`rgb`, `hsl` or `oklch`), can be cleared to an empty value, and participates in standard HTML form submission, `required`
validation and validation message projection.

### Key features

- **Two anchor modes**: a preview trigger button, or an editable text field with a swatch prefix.
- **HSV canvas, hue and alpha sliders**, kept synchronized with the current color at all times.
- **Any CSS color string**: hex, `rgb()`, `hsl()`, named colors and the other notations, such as `oklch()`, `lab()`,
  `color()` and `color-mix()`, are parsed into sRGB and normalized.
- **Four serialization formats**, switchable at run time without altering the represented color.
- **Predefined swatches**, as the `swatches` property or as `igc-color-swatch` children in labelled groups, with a
  no-color swatch and `var()` colors.
- **Two popup views**, the gradient and the swatches, with a view switcher when both are available.
- **Confirm mode**: with `selection-commit="confirm"`, the changes in the popup are a draft until Apply, beside a
  preview of the initial color.
- **Contrast readout**: with `contrast-against`, the popup shows the WCAG 2 contrast ratio of the color over a
  background, with the AA and AAA levels for normal text.
- **Platform integrations**: the native `EyeDropper` API where available, and copy to clipboard.
- **Form association**: submits under its name, supports reset, `required` and custom validation.
- **Localization**: the accessible labels come from `igniteui-i18n-core` through `locale` and `resourceStrings`.
- **Themeable**: shadow parts for every region.

### Acceptance criteria

The `igc-color-picker` must:

- be WAI-ARIA compliant.
- participate in form association - submit its `value` under its `name`, and support reset, `required` and custom
  validation through the form-associated lifecycle.
- parse and accept any valid CSS color string assigned to `value`, and clip a color outside the sRGB gamut to it;
  an empty, whitespace-only or invalid string clears the value, and so does a color that depends on its context.
- render a checkered anchor background while the value is empty.
- serialize its `value` consistently in the currently selected `format`.
- keep the gradient canvas marker, the hue slider, the alpha slider and the color value input synchronized with the
  current color, deriving the canvas position from the HSV saturation and value.
- allow switching between `hex`, `rgb`, `hsl` and `oklch` without losing the represented color.
- optionally hide the format switcher through `hide-formats`, and show the alpha slider through `show-alpha`.
- render an eye dropper action only when the platform `EyeDropper` API is available.
- copy the current color value to the clipboard on demand.
- render a predefined set of color swatches when supplied, and apply a swatch on selection.
- close on an outside click, on <kbd>Escape</kbd> and on <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>, and open on
  <kbd>Alt</kbd> + <kbd>Arrow Down</kbd>, restoring focus to the anchor.
- emit `igcInput` on every interim interaction, and `igcChange` once, when the committed value has changed and focus
  leaves the component entirely.
- in the confirm mode, keep the changes in the popup as a draft that does not change `value` and emits no events,
  apply it with one `igcChange`, and drop it on Cancel and every other close.
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
- clear the value by deleting the text of the color value input, or of the anchor input in `input` mode, or with the
  clear icon of the anchor input.
- switch between the hex, RGB and HSL representations from a dropdown.
- pick a color from anywhere on my screen using the eye dropper, where it is supported.
- copy the selected color value to my clipboard.
- choose from a set of predefined swatches when they are provided.
- try colors and then apply or cancel them, when the app uses the confirm mode, and go back to the initial color from
  the preview.
- dismiss the picker with <kbd>Escape</kbd>, <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>, or by clicking outside of it.
- see a validation message when the field is required and left empty.

### Developer stories

As a developer, I expect to be able to:

- bind the picker to a form by setting `name`, and read and write its `value` as a string.
- choose the anchor presentation through `mode`.
- choose the serialization `format` of the emitted value.
- provide a list of predefined `swatches`.
- choose through `selection-commit` whether the changes in the popup apply at once or only on Apply.
- add content below the color panel in the popup through the `footer` slot.
- hide the format switcher with `hide-formats`, and show the alpha slider with `show-alpha`.
- mark the control as required, disable it, and surface the validation state through the standard form-associated
  API and the message slots.
- programmatically open, close or toggle the picker, and clear its value.
- style the text field of `input` mode without styling the inputs inside the picker.
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
not a user change, so it emits no `igcChange`, also while focus is inside the component. In the
[confirm mode](#confirm-mode), the changes in the popup wait for Apply.

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

In `input` mode, a clear icon shows in the suffix of the text field while a color is set, as in the date picker. A
click on it clears the value and emits `igcInput`, and `igcChange` follows when the focus leaves the component, as for
any change of the user. The focus stays in the text field. The `clear-icon` slot replaces the icon; to hide it, style
`::part(clear-icon)` with `display: none`. Keyboard users clear the value by deleting the text. `default` mode has no
clear icon.

In `input` mode, the picker is a block and the text field fills its container, as in the date picker. The clear icon
takes its space from the text, so the field keeps its width when the value clears. To keep a narrow field, set the
width of the picker. In `default` mode, the picker is inline.

The text field of `input` mode is the `field` part. A `--ig-input-group-*` variable set on `::part(field)` styles the
field and not the inputs inside the picker. The field also forwards the parts of the select and the combo: `input`
(its container), `native-input`, `label`, `prefix` and `suffix`.

```css
igc-color-picker::part(field) {
  --ig-input-group-border-color: rebeccapurple;
}
```

#### Value and formats

```html
<igc-color-picker value="#ff8800" format="rgb"></igc-color-picker>
```

The `value` property accepts any valid CSS color string: hex, `rgb()`, `hsl()`, named colors and the other
notations, such as `oklch()`, `lab()`, `lch()`, `color()`, relative colors and `color-mix()`. On assignment the string
is parsed and validated into an internal color model that maintains synchronized RGB, HSL and HSV representations
plus an alpha channel. An empty, whitespace-only or invalid string produces an empty model rather than a stale color;
while empty, the anchor renders a checkered background and the serialized value is `''`.

The model is sRGB. A color in another color space converts to sRGB, and a color outside the sRGB gamut clips to it:
`color(display-p3 1 0 0)` becomes `#ff0000`. A color that depends on its context is invalid, because the value must
not change with the element, the theme or the color scheme: `currentcolor`, `var()`, `light-dark()` and the system
colors, such as `Canvas`, also inside `color-mix()` or a relative color.

```html
<!-- The value is #40b1b7 -->
<igc-color-picker value="oklch(70% 0.1 200)"></igc-color-picker>
```

A write of the same color, in any notation, keeps the internal color, as in the
[color panel](../color-panel/spec.md#value-and-format). This keeps the hue of a gray, which a color string does not
carry.

`oklch` writes `oklch(L% C H)`: the lightness in percent with 2 decimals, the chroma with 5 decimals and the hue in
degrees with 2 decimals, from the CSS Color 4 conversion. An alpha below 1 adds ` / A`, as in
`oklch(62.8% 0.25768 29.23 / 0.5)`. A gray writes its hue as 0. Firefox and Safari read every 8-bit color back from
this string. Chromium converts OKLCH with other matrices, so for 0.45 % of the colors a channel near 0 comes back one
step off.

```html
<!-- The value is oklch(62.8% 0.25768 29.23) -->
<igc-color-picker value="#ff0000" format="oklch"></igc-color-picker>
```

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

The surface is an [`igc-color-panel`](../color-panel/spec.md). The picker passes `format`, `show-alpha`,
`hide-formats`, `swatches`, `views`, `active-view`, `contrast-against` and its resource strings to the panel, and takes each change of the
panel as a change of the user. The events of the panel stay inside the picker. A format or a view that the user picks
in the panel becomes the `format` or the `activeView` of the picker. The picker forwards the parts of the panel as its own parts, so `::part(hue)` and the other
surface parts style the panel. The `picker` part, the popup, paints the surface.

#### Swatches

```typescript
picker.swatches = ['#ff0000', 'rgb(0 128 0)', 'hsl(210 100% 50%)', 'rebeccapurple'];
```

The picker also shows its `igc-color-swatch` and `igc-color-swatch-group` children in the popup, after the swatches of
`swatches`. It forwards them to the panel through a nested slot.

```html
<igc-color-picker value="#264653">
  <igc-color-swatch></igc-color-swatch>
  <igc-color-swatch-group>
    <span slot="label">Palette</span>
    <igc-color-swatch color="#264653" label="Charcoal"></igc-color-swatch>
    <igc-color-swatch color="var(--brand-accent)" label="Accent"></igc-color-swatch>
  </igc-color-swatch-group>
</igc-color-picker>
```

All swatches are the options of one listbox below a divider. A click, <kbd>Enter</kbd> or <kbd>Space</kbd> on a swatch
commits its color as the value and emits `igcInput`; `igcChange` follows when the focus leaves the picker. The first
swatch that has the color of the value is selected. A swatch without a color clears the value, and a `var()` swatch writes the
color that it resolves to. The [color panel swatches](../color-panel/spec.md#swatches) describe the details, and the
[recent colors recipe](../color-panel/spec.md#recent-colors) keeps a "Recent" group from `igcChange`.

`views="gradient swatches"` shows a view switcher at the top of the popup, and `views="swatches"` a swatch-only popup.
See [Views](../color-panel/spec.md#views).

#### Copy and eye dropper

The copy button writes the current value to the clipboard. For one second after a copy, it shows a check icon and the
name "Copied", or an error icon and "Copy failed" after a failure or without the clipboard API. See
[Copy](../color-panel/spec.md#copy). The eye dropper button is rendered enabled only when the platform implements the `EyeDropper` API; support is captured
once, at construction time. Picking a color through it sets the value and emits `igcInput`.

#### Contrast

```html
<igc-color-picker label="Text" value="#212121" contrast-against="var(--surface)"></igc-color-picker>
```

With `contrast-against`, the popup shows the WCAG 2 contrast ratio of the color over that background, such as
"Contrast 15.42:1", and "pass" or "fail" for the AA (4.5:1) and AAA (7:1) levels for normal text. The readout is at the
bottom of the panel, above the footer, and shows the draft in the confirm mode. A `var()` resolves from the custom
properties of the popup, and so do `currentcolor`, `light-dark()` and the system colors. An empty value, an empty or
invalid `contrast-against`, and a `var()` that is not a color hide the readout. See
[Contrast](../color-panel/spec.md#contrast).

#### Confirm mode

```html
<igc-color-picker value="#ff0000" selection-commit="confirm"></igc-color-picker>
```

With `selection-commit="confirm"`, a change in the popup is a draft. The canvas, the sliders, the alpha input, the
color value input, a swatch and the eye dropper change the draft, not `value`, and emit no `igcInput`. The anchor and
the text field of the input mode show `value`. A format change applies at once, because it does not change the color.

The footer of the popup shows a preview, Cancel and Apply. The preview has two halves: the initial color, which is
`value`, and the draft. A click on the initial color restores it, and the popup stays open.

- **Apply** writes the draft as a change of the user, emits one `igcChange` at once, and closes the popup. Without a
  change since the last report, it emits nothing. <kbd>Enter</kbd> on the canvas marker, a slider or a swatch also
  applies; on a swatch it picks the swatch first. <kbd>Space</kbd> on a swatch only picks it. <kbd>Enter</kbd> in the
  color value input or the alpha input commits the text into the draft.
- **Cancel**, <kbd>Escape</kbd>, <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>, an outside click, a scroll close, `hide()`,
  `open = false` and `disabled` drop the draft and emit no value events. A canceled `igcClosing` keeps the popup open:
  Cancel then keeps the draft, and Apply has already written it, as the Apply of the combo does.
- A new value from code ends the draft. A write of the same color keeps it, so a wrapper that writes every property
  on each render does not drop it.
- A click on the clear icon drops the draft, then clears the value as a user change. So does a commit of the text
  field of the input mode.
- An eye dropper pick that ends after the popup closes changes nothing.
- A change of `selection-commit` to `immediate` drops the draft.

The `footer` slot renders content below the color panel in both modes. In the confirm mode, the preview, Cancel and
Apply show after it. Style them through the `actions`, `preview`, `preview-initial`, `preview-current`,
`cancel-button` and `apply-button` parts, and change their texts through `resourceStrings`.

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

// Clears the value and the text of the input, with no events.
picker.clear();

picker.value = '#336699';
picker.setCustomValidity('Pick a lighter shade');
```

### Localization

The component takes its resource strings from the `igniteui-i18n-core` package through the `locale` and
`resourceStrings` properties. Without an explicit `locale`, it takes its own `lang`, else the locale of the nearest
ancestor that has a `locale` (a component) or a `lang`, and then the global locale of the library. A key that the
strings of a locale do not have falls back to its English value. Most strings are accessibility-only text. The visible
ones are the placeholders of the alpha input and the format select, the format names, the view switcher texts, and
Cancel and Apply in the confirm mode.

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
| `color_picker_no_color`      | No color                          | The name of a no-color swatch without a label.                 |
| `color_picker_swatches`      | Color swatches                    | The name of the swatch list.                                   |
| `color_picker_view_gradient` | Gradient                          | The text of the gradient button of the view switcher.          |
| `color_picker_view_swatches` | Swatches                          | The text of the swatch button of the view switcher.            |
| `color_picker_format_hex`    | Hex                               | The name of the hex format in the format select.               |
| `color_picker_format_rgb`    | RGB                               | The name of the RGB format in the format select.               |
| `color_picker_format_hsl`    | HSL                               | The name of the HSL format in the format select.               |
| `color_picker_format_oklch`  | OKLCH                             | The name of the OKLCH format in the format select.             |
| `color_picker_clear`         | Clear color                       | The name of the clear icon in input mode.                      |
| `color_picker_apply`         | Apply                             | The text of the Apply button of the confirm mode.              |
| `color_picker_cancel`        | Cancel                            | The text of the Cancel button of the confirm mode.             |
| `color_picker_initial_color` | Initial color                     | The name of the preview button that restores the initial color. |
| `color_picker_copied`        | Copied                            | The name of the copy button for one second after a copy.       |
| `color_picker_copy_failed`   | Copy failed                       | The name of the copy button for one second after a failed copy. |
| `color_picker_value_with_name` | {0}, {1}                        | The value text of the hue slider and the canvas marker. `{0}` is the value and `{1}` the color name or the hue name. |
| `color_picker_name_pattern`  | {0} {1} {2}                       | The word order of a color name. `{0}` is the lightness word, `{1}` the chroma word and `{2}` the hue word. |
| `color_picker_name_with_alpha` | {0}, alpha {1}                  | The name of a swatch that is not opaque. `{0}` is the color name and `{1}` the alpha percentage. |
| `color_picker_name_very_dark`, `color_picker_name_dark`, `color_picker_name_light`, `color_picker_name_very_light` | very dark, dark, light, very light | The lightness words of a color name. |
| `color_picker_name_grayish`, `color_picker_name_vibrant` | grayish, vibrant | The chroma words of a color name. |
| `color_picker_name_red`, `color_picker_name_orange`, `color_picker_name_brown`, `color_picker_name_yellow`, `color_picker_name_yellow_green`, `color_picker_name_green`, `color_picker_name_cyan`, `color_picker_name_blue`, `color_picker_name_purple`, `color_picker_name_magenta`, `color_picker_name_pink` | red, orange, brown, yellow, yellow green, green, cyan, blue, purple, magenta, pink | The hue words of a color name. |
| `color_picker_name_black`, `color_picker_name_white`, `color_picker_name_gray` | black, white, gray | The names of the colors with almost no chroma. |
| `color_picker_contrast_ratio` | Contrast {0}:1                   | The contrast ratio of the readout. `{0}` is the ratio in the number format of the locale. |
| `color_picker_contrast_pass`, `color_picker_contrast_fail` | {0} pass, {0} fail | A level of the contrast readout. `{0}` is the name of the level. |
| `color_picker_contrast_aa`, `color_picker_contrast_aaa` | AA, AAA                       | The names of the WCAG levels of the contrast readout. |

The keys after `color_picker_value` are not in `igniteui-i18n-core` yet. Until they are, every locale shows the English
text, and `resourceStrings` can replace them. Color values are locale-independent CSS strings. The value text of the
sliders uses the number format of the locale. The [color panel](../color-panel/spec.md#value-text-and-color-names)
describes the color names.

### Keyboard interactions

| Key combination                            | Result                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| <kbd>Alt</kbd> + <kbd>Arrow Down</kbd>     | Opens the picker dropdown.                                                             |
| <kbd>Escape</kbd>                          | Closes the dropdown and returns focus to the anchor. While the dropdown is closed, it does not cancel the key. |
| <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>       | Closes the dropdown and returns focus to the anchor.                                   |
| <kbd>Arrow</kbd> keys                      | With the canvas marker focused, moves it 1 % of the canvas in the direction of the arrow, also in RTL, updating the saturation and value. |
| <kbd>Shift</kbd> + <kbd>Arrow</kbd> keys   | With the canvas marker focused, moves it 10 % of the canvas in the direction of the arrow. |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd>  | With the canvas marker focused, moves it 10 % up or down, raising or lowering the value. |
| <kbd>Home</kbd> / <kbd>End</kbd>           | With the canvas marker focused, moves it 10 % left or right, lowering or raising the saturation. |
| <kbd>Arrow</kbd> keys                      | In the swatch list, moves the focus to the previous or next swatch, or to the nearest swatch in the row above or below. |
| <kbd>Home</kbd> / <kbd>End</kbd>           | In the swatch list, moves the focus to the first or last swatch.                       |
| <kbd>Enter</kbd> / <kbd>Space</kbd>        | In the swatch list, picks the focused swatch.                                          |
| <kbd>Enter</kbd>                           | In the confirm mode, on the canvas marker, a slider or a swatch, applies the draft and closes the popup. |
| <kbd>Tab</kbd>                             | Moves focus between the interactive elements inside the open picker; focus is trapped while open. The swatch list is one tab stop. |

All of the above are skipped while the component is `disabled`. A key that an IME handles, such as the <kbd>Enter</kbd> that commits a composition, does nothing here.

## API

### Properties and attributes

| Property          | Attribute       | Reflected | Type                      | Default   | Description                                                              |
| ----------------- | --------------- | --------- | ------------------------- | --------- | ------------------------------------------------------------------------ |
| value             | value           | No        | `string`                  | `''`      | The value as a CSS color string. Accepts any CSS color and clips it to sRGB. A color that depends on its context, such as `currentcolor`, clears it. |
| format            | format          | No        | `ColorFormat`             | `hex`     | The color format of the string value. A format change renders `value` in the new notation. |
| mode              | mode            | Yes       | `ColorPickerMode`         | `default` | Whether the anchor is a trigger button or an editable text field.        |
| label             | label           | No        | `string \| undefined`     | -         | The label of the component.                                              |
| selectionCommit   | selection-commit | No       | `ColorPickerSelectionCommit` | `immediate` | When the changes of the user in the popup apply. With `confirm`, they change a draft: `value` keeps its color, and the popup shows the initial color beside the draft. Apply, or Enter on the canvas marker, a slider or a swatch, applies the draft with one `igcChange`. Cancel and every other close drop it. |
| swatches          | -               | No        | `string[]`                | `[]`      | Pre-defined color strings, rendered as swatches in front of the swatch children. An empty string gives the no-color swatch. |
| views             | views           | No        | `string`                  | `gradient` | The views of the popup, a space-separated list of `gradient` and `swatches`. Both show a view switcher. |
| activeView        | active-view     | No        | `ColorPanelView`          | `gradient` | The view on screen in the popup. The switcher sets it. A view that `views` does not have gives the first view of `views`. |
| contrastAgainst   | contrast-against | No       | `string`                  | `''`    | The background color of the contrast readout in the popup, as any CSS color. A color that depends on its context, such as a `var()`, resolves from the popup. The readout shows the WCAG 2 contrast ratio of the value over this color, with the AA and AAA levels for normal text. An empty or invalid color hides it. |
| showAlpha         | show-alpha      | Yes       | `boolean`                 | false     | Whether to show the alpha slider and input.                              |
| hideFormats       | hide-formats    | Yes       | `boolean`                 | false     | Whether the format select is hidden.                                     |
| locale            | locale          | No        | `string`                  | -         | The locale for the resource strings. Falls back to the inherited locale, then the global one.    |
| resourceStrings   | -               | No        | `ColorPickerResourceStrings` | EN     | The texts of the component. The strings that you set replace the strings of the current locale. Reading returns all the strings, with your strings over the locale strings.                                   |
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
| clear             | `(): void`                       | Clears the value and the text of the input. As for a value set from code, the component emits no events. |
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
| igcInput   | false       | `string` | Emitted when the user changes the color with the canvas, the sliders, the alpha input, a swatch or the eyedropper. In the confirm mode, these changes emit nothing. |
| igcChange  | false       | `string` | Emitted when the focus leaves the component after the user changed the color, and when the user applies the draft of the confirm mode. |

The events of the inner inputs, format select and canvas stay inside the picker. Only the events in this table
reach the listeners on the picker.

### Slots

| Name            | Description                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| `helper-text`   | Renders content below the picker.                                                |
| `clear-icon`    | Renders the clear icon in input mode.                                            |
| `value-missing` | Renders content when the required validation fails.                              |
| `custom-error`  | Renders content when setCustomValidity(message) is set.                          |
| `invalid`       | Renders content when the component is in invalid state (validity.valid = false). |
| (default)       | The `igc-color-swatch` and `igc-color-swatch-group` children, shown in the swatch list of the popup. |
| `footer`        | Renders content below the color panel in the popup. In the confirm mode, the preview, Cancel and Apply show after it. |

### CSS Shadow parts

| Part            | Description                                                                              |
| --------------- | ----------------------------------------------------------------------------------------- |
| `color-picker`  | The wrapper of the anchor, the label and the helper text.                                |
| `anchor`        | The trigger element that opens the picker - the button in default mode, or the swatch prefix in input mode. |
| `empty`         | Applied alongside `anchor` when no color value is set, rendering a checkered background.  |
| `input-mode`    | Added to the anchor part in input mode.                                                  |
| `label`         | The label: the element after the anchor in default mode, or the label of the text field in input mode. |
| `field`         | The text field in input mode. Set the `--ig-input-group-*` variables on it to style the field and not the inputs in the picker. |
| `input`         | The container of the text field in input mode.                                           |
| `native-input`  | The native input of the text field in input mode.                                        |
| `prefix`        | The prefix wrapper of the text field in input mode. It holds the anchor.                 |
| `suffix`        | The suffix wrapper of the text field in input mode. It holds the clear icon.             |
| `clear-icon`    | The clear icon wrapper in input mode. It shows while a color is set.                     |
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
| `swatches`      | The swatch list.                                                                         |
| `swatch`        | A swatch of the `swatches` property.                                                     |
| `selected`      | Added to the swatch part of the selected swatch.                                         |
| `view-switcher` | The view switcher, rendered when `views` has both views.                                 |
| `view-button`   | A button of the view switcher.                                                           |
| `active`        | Added to the view-button part of the view on screen.                                     |
| `contrast`      | The contrast readout, rendered when `contrast-against` has a color and the value is not empty. |
| `contrast-ratio` | The contrast ratio of the value over `contrast-against`.                                |
| `contrast-mark` | A WCAG level of the contrast readout, AA or AAA.                                         |
| `pass`          | Added to the contrast-mark part of a level that the ratio passes.                        |
| `fail`          | Added to the contrast-mark part of a level that the ratio fails.                         |
| `footer`        | The container below the color panel in the popup. It holds the `footer` slot and, in the confirm mode, the actions. |
| `actions`       | The container of the preview, Cancel and Apply in the confirm mode.                      |
| `preview`       | The preview of the initial color and the draft in the confirm mode.                      |
| `preview-initial` | The button that shows the initial color and restores it.                               |
| `preview-current` | The color of the draft.                                                                |
| `cancel-button` | The Cancel button of the confirm mode.                                                   |
| `apply-button`  | The Apply button of the confirm mode.                                                    |

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

The component is covered by ten suites in this directory, all running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`color-picker.spec.ts`](./color-picker.spec.ts) | The component. |
| [`picker-canvas.spec.ts`](./picker-canvas.spec.ts) | The internal gradient canvas. |
| [`model.spec.ts`](./model.spec.ts) | The color model. |
| [`common.spec.ts`](./common.spec.ts) | Color string parsing and validation. |
| [`converters.spec.ts`](./converters.spec.ts) | The color space converters. |
| [`color-name.spec.ts`](./color-name.spec.ts) | The color name rule. |
| [`color-name.property.spec.ts`](./color-name.property.spec.ts) | Property-based tests for the color names. |
| [`contrast.spec.ts`](./contrast.spec.ts) | The contrast ratio and its text. |
| [`contrast.property.spec.ts`](./contrast.property.spec.ts) | Property-based tests for the contrast ratio. |
| [`color.property.spec.ts`](./color.property.spec.ts) | Property-based (fuzz) tests for the converters, the parser and the model. |

The component suite reuses `createFormAssociatedTestBed`, `runValidationContainerTests`,
`runExternalLabelAssociationTests`, `runAriaProjectionTests` and the `simulate*` helpers from
[`src/internals/testing`](../../internals/testing). The groups below mirror the `describe` blocks.

### Component suite

1. Default state and rendering. The focus ring of the anchor is painted under an earlier page layer with `z-index: 1`.
2. ARIA - the anchor semantics, the labels of the sliders and controls, and the described-by relation.
3. Localization - the English defaults, the strings of `locale`, a global locale change, the input mode prefix and
   a single override through `resourceStrings`.
4. Scroll strategy - the `hide`, `scroll` and `close` behaviors of the anchored picker.
5. API - the public properties and methods.
6. Empty value - the checkered anchor, the empty serialized value, clearing through the inputs, and a color that
   depends on its context. Colors outside the legacy syntax - an `oklch()` value in the active format, the gamut
   clip, a typed `lab()` color, and a typed context color that reverts.
7. Color value input - typing a color string, reverting an invalid one and clearing on an empty one.
8. `igcChange` - emitted once when focus leaves the component and the user changed the value. A value set from code
   while focus is inside emits nothing, and neither does a color that returns to the reported one in another format.
9. Color channels, including the alpha input.
10. Inner events - the `igcInput` of the alpha input, the color value input and the input anchor, the open and close
    events of the format select, and the `igcColorPicked` of the canvas do not reach a listener on the picker.
11. Swatches - a hidden swatch list by default, rendering the swatches and applying one, a pick by color and not by
    name. A swatch click while disabled changes nothing.
12. Copy and eye dropper, in environments with and without platform support. An eye dropper pick that ends after
    the picker is disabled changes nothing. In the confirm mode, a pick goes into the draft, and a pick that ends
    after the popup closes changes nothing.
13. Open and close - the pointer, keyboard and outside-click paths. A closed picker does not cancel <kbd>Escape</kbd>. An
    <kbd>Escape</kbd> that an IME handles keeps the picker open.
14. Input mode - the anchor input, its label and its prefix. The clear icon shows only while a color is set and only
    in input mode; the field fills its container, so the clear icon does not change its width; a click clears with
    `igcInput`, `igcChange` follows on focus leave, and the focus stays in the text field (a real mouse click); the
    `clear-icon` slot; no change while disabled; `clear()` clears with no events. The
    `field` part and the forwarded parts style the text field and not the inputs of the picker.
15. Rendering of the picker surface rows, and the direction of the slider tracks in LTR and RTL.
16. Form association, the touched state, `defaultValue`, the initial format, and validation. In input mode, the text
    input shows the invalid state of the picker at once.
17. Validation message slots, generated by `runValidationContainerTests`.
18. External label association and ARIA projection, generated by `runExternalLabelAssociationTests` and
    `runAriaProjectionTests`.

The focus after the form checks and the `invalid` event rules come from the form-associated mixin. The
[input suite](../input/spec.md#form-validity-checks) covers them.

### Picker canvas

18. Rendering of the gradient and the marker, with the marker label, its default value text and the value text that
    the panel gives it.
19. Keyboard interaction - the arrow keys move the marker and update the saturation and value. The marker steps in
    whole percents of the canvas, at any canvas size: 1 % with an arrow, 10 % with <kbd>Shift</kbd> + Arrow, Page Up,
    Page Down, Home and End. Only the axis that moves snaps. The steps stop at the edges, keep the arrow direction in
    RTL, and do nothing while the canvas has no size.
20. Pointer interaction - dragging sets the saturation and value.

### Color model and parsing

21. `ColorModel` - construction and factory methods, `parse`, the RGB, HSL and HSV setters, the alpha channel,
    `asString` in each format (`oklch` with its decimals, the hue of a gray and a hue that rounds to 360), the color
    space conversions, the utility methods and the edge cases.
22. `parseColor` - hex, rgb/rgba, hsl/hsla and named color parsing, a null context, and the edge cases. The notations
    outside the legacy syntax give the same sRGB channels in Chromium, Firefox and WebKit, and a color outside the
    gamut clips. A `color(srgb)` serialization clips and reads `none` as 0, and an unknown serialization is invalid.
    The colors that depend on their context are invalid, and text that is not a color cannot become one through the
    relative color conversion.
23. `isValidColor` - accepting valid strings and rejecting invalid ones and context colors.

### Converters

24. The conversions between RGB, HSL, HSV and hex, in both directions, including round-trips. The saturation stays
    finite for a tiny saturation at full value. RGB to OKLCH gives the values of the CSS Color 4 sample code, and no
    chroma for a gray.

### Color properties

25. Converters - the exact hex round-trip, the HSL and HSV round-trips, HSL to RGB directly and through HSV, and
    every converted channel in range, OKLCH included.
26. Parsing - `parseColor` never throws and returns channels in range. A string that is not a color gives opaque black
    and an empty model. A `color(srgb)` color reads as whole channels in range, and as the same channels inside the
    gamut. Any `oklch()`, `lab()` or `color()` color parses into sRGB. A model string in each format parses back to
    the same color. Any 8-bit color comes back from its `oklch` string, exactly in Firefox and WebKit and within one
    step in Chromium.
27. Model - every color space stays in range for any sequence of channel writes, and a clone equals its source.
28. Color names - every 8-bit color gets a name made of the words of the word set in the order of the pattern, for the
    word orders of English, French and Japanese, and a color with equal channels is black, white or a gray.

### Host ARIA

29. The shared host description suite: the host `aria-describedby` describes the native control after the helper
    text, and follows a change and a removal.
30. In button mode, the anchor lists the helper text before the host description, also after the first
    render.
31. The shared focus suite (`runFocusBeforeRenderTests`): a `focus()` call right after the element connects focuses
    the same element as a call after the first render. `blur()`, a later `focus()` on another element and a removal
    that lasts until the render cancel the call, but a move in the same task keeps it. After the render, `focus()`
    takes the focus at once and `blur()` removes it. A `focus()` call before the render on a component with
    `disabled` set does not cancel an earlier call on another element.

### Disabled popup

32. The shared runner `runDisabledPopupTests`, with the anchor as the `aria-expanded` target.

### Value state motion

In input mode.

33. A typed color marks the anchor input as a user change.
34. A value from code right after it ends the user change, so the input shows it at once.

### Color panel

35. The popup shows the color panel, and the picker forwards the parts of the panel; a `::part(hue)` rule reaches the
    hue slider of the panel. The picker passes its options, `contrast-against` and strings to the panel, and the value of the panel equals
    the value of the picker, also after a format change. The events of the panel stay inside the picker.
36. The picker shows its swatch children in the swatch list of the panel, the swatch list is a stop of the focus trap,
    and a click on a child swatch sets the value. The picker passes `views` and `active-view`, and a click on the view
    switcher sets the `activeView` of the picker.

### Confirm mode

37. The a11y audit. The footer shows the preview, Cancel and Apply only in the confirm mode, and the `footer` slot
    content in both modes.
38. A change in the popup is a draft: `value`, the anchor and the initial half of the preview keep the color, no value
    event is emitted, and the contrast readout shows the draft. Apply writes the draft, emits one `igcChange`, closes
    and focuses the anchor; an Apply without a change emits nothing.
39. Cancel, Escape, Alt + Arrow Up, an outside click, a scroll close, `hide()`, `open = false` and disabling drop
    the draft with no value events. A canceled `igcClosing` keeps the draft on Cancel, and Apply writes it.
40. Enter on a swatch picks and applies, and Space only picks. Enter on the canvas marker and on a slider applies.
    Enter in the color value input commits the text into the draft and does not apply. An alpha commit goes into the
    draft. In the immediate mode, Enter on a slider does not close.
41. The initial half of the preview restores the initial color. The text field of the input mode shows the value
    during a draft. A new value from code ends the draft, and the same color keeps it. A format change keeps the
    draft. The end of the confirm mode drops the draft. The clear icon drops the draft and clears as a user change,
    and a commit of the text field of the input mode drops the draft.

### Color names

42. The grays by lightness, black and white; no lightness word for the pure colors; the lightness compared with the most
    chromatic color of the hue (navy is "dark blue"); grayish colors; a dark orange as brown and a very light red as
    pink; and the hue word of the pure color of each HSV hue, for the hue slider.

### Contrast ratio

43. The WCAG 2 ratio of known pairs (21:1, 1:1, `#767676` and `#595959` on white); the value over the background and
    the background over white, each with its alpha; and two decimals at most, cut and not rounded. The property test
    proves that the ratio is from 1 to 21 and the same for both orders of two opaque colors. The
    [color panel](../color-panel/spec.md#contrast-1) suite covers the readout, and the picker suite covers the readout
    of the draft in the confirm mode.

## Assumptions and limitations

- The eye dropper button is always rendered, but it is only enabled when the platform implements the `EyeDropper`
  API. Support is captured once at construction time, so injecting or removing the global afterwards has no effect.
- Copying to the clipboard depends on the `navigator.clipboard` API and a secure context. Where it is unavailable or
  denied, the copy button shows "Copy failed".
- `value` accepts any valid CSS color string, but the observable value is always normalized to the active `format`,
  so round-tripping an input string is not guaranteed to be byte-for-byte identical. An empty, whitespace-only or
  invalid string clears the value, except when it is committed through the popover or anchor color input, where a
  non-empty invalid string reverts to the last valid color.
- Colors are resolved through an `OffscreenCanvas` 2D context; environments without canvas support resolve to the
  empty value rather than to a default color. Chromium and WebKit keep the notation of a color outside the legacy
  sRGB syntax, so the component converts it to sRGB with relative color syntax.
- The model is sRGB, so a wide-gamut color, such as `color(display-p3 1 0 0)`, clips to the sRGB gamut and does not
  come back as the same color.
- The color panel alone has no confirm mode. Only the color picker keeps a draft.
- A color that depends on its context is invalid. The component finds `currentcolor`, `var()`, `light-dark()` and the
  system colors by name, because the canvas of Chromium and WebKit resolves `currentcolor` to black and a system
  color to its light value.

## Accessibility

### ARIA roles and properties

- The anchor is either a button labelled through visually-hidden text (default mode) or an
  [`igc-input`](../input/spec.md) exposing `label` directly (input mode). Both set `aria-haspopup="dialog"` and
  reference the validation and helper text container through `aria-describedby`, so helper and validation messages
  are announced.
- The trigger button of the default mode and the swatch button of the input mode reflect the open state through
  `aria-expanded`. The text input of the input mode does not carry it.
- The hue and alpha sliders are native range inputs labelled through `aria-label`. Their `aria-valuetext` gives the
  angle and the hue name, such as "120 degrees, green", and the alpha percentage.
- While a color is set, the value text of the gradient canvas marker ends with the color name, such as "dark vibrant
  blue". The gradient
  canvas marker is focusable and operable with the arrow keys, <kbd>Shift</kbd> + Arrow, Page Up, Page
  Down, Home and End.
- The format switcher is a select with a visually-hidden label, and the color value input carries one as well.
- The copy and eye dropper buttons expose visually-hidden text. For one second after a copy, the name of the copy
  button is "Copied" or "Copy failed".
- The clear icon of input mode is a `button` named by `color_picker_clear`, as in the combo. It is not a tab stop;
  the keyboard clears the value through the text field.
- The swatch list is a `listbox` of `option` swatches with `aria-selected`, and a swatch group is a named `group`. A
  swatch without a `label` is named by its color name. See
  the [color panel accessibility](../color-panel/spec.md#aria-roles-and-properties).
- In the confirm mode, the initial half of the preview is a `button` named by `color_picker_initial_color`. The draft
  half is decoration. Cancel and Apply are `igc-button` elements with their text.
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

The saturation and value canvas does not mirror in RTL, so an arrow key moves its marker in the direction of the
arrow.

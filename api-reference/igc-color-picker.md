# igc-color-picker

Color input component.

The user picks a color with the HSV saturation/value canvas, the hue slider
and the optional alpha slider. The user can also type a color string: hex,
rgb(a), hsl(a) or a named CSS color.

The component supports pre-defined swatches and the native EyeDropper API,
where the browser provides one. The anchor is a trigger button
(`mode="default"`) or an editable text field (`mode="input"`).

```ts
import { defineComponents, IgcColorPickerComponent } from 'igniteui-webcomponents';

defineComponents(IgcColorPickerComponent);
```

## Properties

- `label`: `string | undefined`. Attribute: `label`.
  The label of the component.

  In `mode="input"` the component forwards the label to the anchor input.
  In `mode="default"` it renders the label as a separate element.
- `value`: `string`. Attribute: `value`.
  The value of the component as a CSS color string. Accepts hex, rgb(a),
  hsl(a) and named colors.

  An empty, whitespace-only or invalid string clears the value.
- `format`: `'hex' | 'rgb' | 'hsl'`. Default: `'hex'`. Attribute: `format`.
  The color format of the string value.

  A format change renders `value` in the new notation. The color does not
  change, so the component emits no `igcInput` or `igcChange`.
- `hideFormats`: `boolean`. Default: `false`. Attribute: `hide-formats`, reflected.
  Whether the format select is hidden.
- `showAlpha`: `boolean`. Default: `false`. Attribute: `show-alpha`, reflected.
  Whether to show the alpha slider and input.
- `mode`: `'default' | 'input'`. Default: `'default'`. Attribute: `mode`, reflected.
  The mode of the color picker.

  In `"default"` mode the anchor is a trigger button. In `"input"` mode the
  anchor is an editable text field with a color swatch prefix. The prefix
  also opens the picker.
- `swatches`: `string[]`. Default: `[]`. No attribute.
  Pre-defined color strings. The component renders them as clickable
  swatches below the picker controls. A click on a swatch sets its color as
  the value.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<IColorPickerResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.
- `required`: `boolean`. Default: `false`. Attribute: `required`, reflected.
  Whether the control is required. A required control that has no value,
  or is not checked, fails validation.
- `defaultValue`: `unknown`. No attribute.
  The default value of the control. A form reset restores the value to it.
  While the value is unchanged since the start or the last form reset, a
  new default also sets the value. The `value` attribute also sets it.
- `name`: `string`. Attribute: `name`, reflected.
  The name of the control, submitted with the form data.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`.
  Whether the control is disabled. A disabled control is not validated,
  and the form does not submit its value.
- `invalid`: `boolean`. Default: `false`. Attribute: `invalid`.
  Whether the control shows the invalid state. It changes only the visual
  state, not the validity.
- `form`: `HTMLFormElement | null`. Read-only. No attribute.
  The form that the control is associated with, or `null`.
- `validity`: `ValidityState`. Read-only. No attribute.
  The validity state of the control.
- `validationMessage`: `string`. Read-only. No attribute.
  The validation message of the control. It is empty when the control is
  valid.
- `willValidate`: `boolean`. Read-only. No attribute.
  Whether the control is a candidate for constraint validation.
- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the component is open.
- `scrollStrategy`: `'scroll' | 'hide' | 'close'`. Default: `'hide'`. Attribute: `scroll-strategy`.
  The behavior of the component when a parent container scrolls.

  If the value is `hide`, the component hides while the anchor is fully out
  of view. `hide` is the default value.

  If the value is `scroll`, the component stays visible and anchored.

  If the value is `close`, the component closes on each scroll.

## Methods

- `focus(options?: FocusOptions): void`
  Sets focus on the color picker.
- `blur(): void`
  Removes focus from the color picker.
- `reportValidity(): boolean`
  Checks validity. As for a native control, an invalid control emits
  `invalid` and takes the focus. It shows its own validation messages, not
  the message of the browser. Returns `true` when the control is valid.
- `checkValidity(): boolean`
  Checks validity and emits `invalid` when the control is invalid. Returns
  `true` when the control is valid.
- `setCustomValidity(message: string): void`
  Sets a custom validation message. The control is invalid while the
  message is not empty. An empty string removes the custom error.
- `show(): Promise<boolean>`
  Opens the component. It does not emit events. The promise resolves to
  `false` when the component is already open, or when a later call replaces
  this one.
- `hide(): Promise<boolean>`
  Closes the component. It does not emit events. The promise resolves to
  `false` when the component is already closed, or when a later call
  replaces this one.
- `toggle(): Promise<boolean>`
  Opens the component when it is closed, and closes it when it is open. It
  does not emit events. The promise resolves to `true` when the state
  changes.

## Events

- `igcOpening`
  Emitted before the user opens the picker dropdown. Cancelable.
- `igcOpened`
  Emitted after the picker dropdown opens on a user action.
- `igcClosing`
  Emitted before the user closes the picker dropdown. Cancelable.
- `igcClosed`
  Emitted after the picker dropdown closes on a user action.
- `igcInput`
  Emitted when the user changes the color with the canvas, the sliders, the alpha input, a swatch or the eyedropper.
- `igcChange`
  Emitted when the focus leaves the component after the user changed the color.

## Slots

- `value-missing`: Renders content when the required validation fails.
- `custom-error`: Renders content when setCustomValidity(message) is set.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).
- `helper-text`: Renders content below the picker.

## CSS parts

- `color-picker`: The wrapper of the anchor, the label and the helper text.
- `anchor`: The trigger element that opens the picker (the button in default mode, or the swatch prefix in input mode).
- `empty`: Applied alongside `anchor` when no color value is set, rendering a checkered background.
- `input-mode`: Added to the anchor part in input mode.
- `label`: The label rendered after the anchor in default mode.
- `picker`: The popover container holding the canvas, sliders, inputs and swatches.
- `picker-canvas`: The saturation and value canvas.
- `marker`: The marker on the canvas that shows the saturation and value.
- `dragging`: Added to the marker part while the user drags it.
- `main-row`: The row containing the hue slider and the copy/eyedropper buttons.
- `alpha-row`: The row containing the alpha slider and input, rendered when `show-alpha` is set.
- `inputs-row`: The row containing the format select and the color value input.
- `buttons`: The wrapper around the copy and eyedropper buttons.
- `hue`: The hue slider.
- `alpha`: The alpha slider.
- `alpha-input`: The input of the alpha value, rendered when `show-alpha` is set.
- `copy`: The button that copies the current color value to the clipboard.
- `eye-dropper`: The button that activates the EyeDropper API.
- `format-select`: The select control used to switch the color string format.
- `swatches`: The container of the pre-defined color swatches.
- `swatch`: An individual color swatch button.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

# igc-color-picker

Color input component.

The user picks a color with the HSV saturation/value canvas, the hue slider
and the optional alpha slider. The user can also type any CSS color string,
such as hex, `rgb()`, `hsl()`, `oklch()` or a named color.

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
  The value of the component as a CSS color string. Accepts any CSS color,
  such as hex, `rgb()`, `hsl()`, `oklch()`, `color()` or a named color. A
  color outside the sRGB gamut is clipped to it.

  An empty, whitespace-only or invalid string clears the value. So does a
  color that depends on its context: `currentcolor`, `var()`, `light-dark()`
  or a system color.
- `format`: `'hex' | 'rgb' | 'hsl' | 'oklch'`. Default: `'hex'`. Attribute: `format`.
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
- `selectionCommit`: `'immediate' | 'confirm'`. Default: `'immediate'`. Attribute: `selection-commit`.
  When the changes of the user in the popup apply. With `confirm`, they
  change a draft: `value` keeps its color, and the popup shows the initial
  color beside the draft. Apply, or Enter on the canvas marker, a slider or
  a swatch, applies the draft with one `igcChange`. Cancel and every other
  close drop it.
- `swatches`: `string[]`. Default: `[]`. No attribute.
  Pre-defined color strings. The component renders them as swatches in the
  swatch list of its popup, in front of the swatch children. An empty
  string gives the no-color swatch.
- `views`: `string`. Default: `'gradient'`. Attribute: `views`.
  The views of the popup, as a space-separated list of `gradient` and
  `swatches`. With both views, a view switcher shows at the top.

  With only the gradient view, the swatch list shows below the gradient
  controls. With the swatch view, the swatch list shows only in that view.
- `activeView`: `'gradient' | 'swatches'`. Default: `'gradient'`. Attribute: `active-view`.
  The view on screen in the popup: `gradient` or `swatches`. The view
  switcher sets it and emits no event. A view that `views` does not have
  gives the first view of `views`.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<IgcColorPickerResourceStrings>`. No attribute.
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
  Whether the component is open. A disabled form control stays closed.
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
- `clear(): void`
  Clears the value and the text of the input. As for a value set from code,
  the component emits no events.
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
  `false` when the component is already open or is a disabled form control,
  or when a later call replaces this one.
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
  Emitted when the user changes the color with the canvas, the sliders, the alpha input, a swatch or the eyedropper. In the confirm mode of `selectionCommit`, these changes emit nothing.
- `igcChange`
  Emitted when the focus leaves the component after the user changed the color, and when the user applies the draft of the confirm mode.

## Slots

- `value-missing`: Renders content when the required validation fails.
- `custom-error`: Renders content when setCustomValidity(message) is set.
- `invalid`: Renders content when the component is in invalid state (validity.valid = false).
- `helper-text`: Renders content below the picker.
- `clear-icon`: Renders the clear icon in input mode.
- default: The color swatches and swatch groups. The picker shows them in the swatch list of its popup.
- `footer`: Renders content below the color panel in the popup. In the confirm mode of `selectionCommit`, the preview, Cancel and Apply show after it.

## CSS parts

- `color-picker`: The wrapper of the anchor, the label and the helper text.
- `anchor`: The trigger element that opens the picker (the button in default mode, or the swatch prefix in input mode).
- `empty`: Applied alongside `anchor` when no color value is set, rendering a checkered background.
- `input-mode`: Added to the anchor part in input mode.
- `label`: The label: the element after the anchor in default mode, or the label of the text field in input mode.
- `field`: The text field in input mode. Set the `--ig-input-group-*` variables on it to style the field and not the inputs in the picker.
- `input`: The container of the text field in input mode.
- `native-input`: The native input of the text field in input mode.
- `prefix`: The prefix wrapper of the text field in input mode. It holds the anchor.
- `suffix`: The suffix wrapper of the text field in input mode. It holds the clear icon.
- `clear-icon`: The clear icon wrapper in input mode. It shows while a color is set.
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
- `swatches`: The swatch list.
- `swatch`: A swatch of the `swatches` property.
- `selected`: Added to the swatch part when the swatch has the color of the value.
- `view-switcher`: The view switcher, rendered when `views` has both views.
- `view-button`: A button of the view switcher.
- `active`: Added to the view-button part of the view on screen.
- `footer`: The container below the color panel in the popup. It holds the `footer` slot and, in the confirm mode, the actions.
- `actions`: The container of the preview, Cancel and Apply in the confirm mode.
- `preview`: The preview of the initial color and the draft in the confirm mode.
- `preview-initial`: The button that shows the initial color and restores it.
- `preview-current`: The color of the draft.
- `cancel-button`: The Cancel button of the confirm mode.
- `apply-button`: The Apply button of the confirm mode.

## CSS custom properties

- `--ig-helper-min-lines`: The minimum number of lines below the control for the helper text and the validation messages: `1`, `2` or `3`. A message that shows then uses space that is already there, so the content below does not move. Set it on a container, such as a form, to apply it to all the controls in it. Default is `0`.

## CSS custom states

- `ig-invalid`: Set while the control shows its invalid state, that is while `invalid` returns `true`.

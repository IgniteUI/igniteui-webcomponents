# igc-color-panel

A color selection surface that stays in the page.

The user picks a color with the color area, the hue slider and the optional
alpha slider. The area is saturation by value, or lightness by chroma at the
OKLCH hue in the `oklch` format. The user can also type any CSS color string,
such as hex, `rgb()`, `hsl()`, `oklch()` or a named color, pick a swatch, or
pick a color from the screen with the native EyeDropper API, where the
browser provides one.

The panel is not a form control. The color picker shows it in a popup.

```ts
import { defineComponents, IgcColorPanelComponent } from 'igniteui-webcomponents';

defineComponents(IgcColorPanelComponent);
```

## Properties

- `value`: `string`. Attribute: `value`.
  The value of the component as a CSS color string, in `format`. Accepts any
  CSS color, such as hex, `rgb()`, `hsl()`, `oklch()`, `color()` or a named
  color. A color outside the sRGB gamut is clipped to it.

  An empty, whitespace-only or invalid string clears the value. So does a
  color that depends on its context: `currentcolor`, `var()`, `light-dark()`
  or a system color.
- `format`: `'hex' | 'rgb' | 'hsl' | 'oklch'`. Default: `'hex'`. Attribute: `format`.
  The color format of the string value.

  A format change renders `value` in the new notation. The color does not
  change, so the component emits no `igcInput` or `igcChange`.
- `hideFormats`: `boolean`. Default: `false`. Attribute: `hide-formats`.
  Whether the format select is hidden.
- `showAlpha`: `boolean`. Default: `false`. Attribute: `show-alpha`.
  Whether to show the alpha slider and input.
- `swatches`: `string[]`. Default: `[]`. No attribute.
  Pre-defined color strings. The component renders them as swatches in its
  swatch list, in front of the swatch children. An empty string gives the
  no-color swatch.
- `views`: `string`. Default: `'gradient'`. Attribute: `views`.
  The views of the component, as a space-separated list of `gradient` and
  `swatches`. With both views, a view switcher shows at the top.

  With only the gradient view, the swatch list shows below the gradient
  controls. With the swatch view, the swatch list shows only in that view.
- `activeView`: `'gradient' | 'swatches'`. Default: `'gradient'`. Attribute: `active-view`.
  The view on screen: `gradient` or `swatches`. The view switcher sets it
  and emits no event. A view that `views` does not have gives the first
  view of `views`.
- `contrastAgainst`: `string`. Default: `''`. Attribute: `contrast-against`.
  The background color of the contrast readout, as any CSS color. A color
  that depends on its context, such as a `var()`, resolves from the
  component. The readout shows the WCAG 2 contrast ratio of the value over
  this color, with the AA and AAA levels for normal text. An empty or
  invalid color hides it.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<IgcColorPickerResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Events

- `igcInput`
  Emitted when the user changes the color with the canvas, the sliders, the alpha input, a swatch or the eye dropper.
- `igcChange`
  Emitted when the user ends a change of the color: on the release of the canvas or a slider, on each key that moves them, on a commit of the color text or the alpha input, and on a swatch or an eye dropper pick.

## Slots

- default: The color swatches and swatch groups. The panel shows them in its swatch list, after the swatches of `swatches`.

## CSS parts

- `base`: The wrapper of the panel.
- `picker-canvas`: The area: saturation by value, or lightness by chroma in the `oklch` format.
- `marker`: The marker on the area that shows the picked color.
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
- `selected`: Added to the swatch part of the selected swatch.
- `view-switcher`: The view switcher, rendered when `views` has both views.
- `view-button`: A button of the view switcher.
- `active`: Added to the view-button part of the view on screen.
- `contrast`: The contrast readout, rendered when `contrast-against` has a color and the value is not empty.
- `contrast-ratio`: The contrast ratio of the value over `contrast-against`.
- `contrast-mark`: A WCAG level of the contrast readout, AA or AAA.
- `pass`: Added to the contrast-mark part of a level that the ratio passes.
- `fail`: Added to the contrast-mark part of a level that the ratio fails.

# Color panel specification

- [Color panel specification](#color-panel-specification)
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
      - [Value and format](#value-and-format)
      - [The OKLCH area](#the-oklch-area)
      - [Swatches](#swatches)
      - [Views](#views)
      - [Recent colors](#recent-colors)
      - [Events](#events-1)
      - [Value text and color names](#value-text-and-color-names)
      - [Copy](#copy)
      - [Contrast](#contrast)
      - [In the color picker](#in-the-color-picker)
      - [Styling](#styling)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom properties](#css-custom-properties)
    - [igc-color-swatch](#igc-color-swatch)
    - [igc-color-swatch-group](#igc-color-swatch-group)
  - [Test scenarios](#test-scenarios)
    - [Rendering](#rendering)
    - [Value and format](#value-and-format-1)
    - [Events](#events-2)
    - [Eye dropper](#eye-dropper)
    - [Marker](#marker)
    - [Value text](#value-text)
    - [Copy](#copy-1)
    - [Swatches](#swatches-1)
    - [Swatch keyboard](#swatch-keyboard)
    - [Views](#views-1)
    - [Contrast](#contrast-1)
    - [OKLCH area](#oklch-area)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-11-23 | Initial specification |
|       2 | 2026-11-23 | Swatch elements and groups, the swatch listbox, the no-color swatch, `var()` swatches, the gradient and swatch views |
|       3 | 2026-11-23 | Review fixes: one selected swatch, `var()` only, a plain swatch fill, the format names from the resource strings, the panel theme files |
|       4 | 2026-11-23 | The `oklch` format |
|       5 | 2026-11-23 | Enter applies the draft of a color picker in the confirm mode |
|       6 | 2026-11-23 | The value text of the sliders, color names and the copy feedback |
|       7 | 2026-11-24 | The contrast readout: `contrast-against`, the WCAG 2 ratio and the AA and AAA levels |
|       8 | 2026-11-24 | The OKLCH area: in the `oklch` format, the area is lightness by chroma and the hue slider is the OKLCH hue |

## Overview

The `igc-color-panel` component is the color selection surface of the [color picker](../color-picker/spec.md),
alone in the page. It holds an area (HSV saturation by value, or OKLCH lightness by chroma in the `oklch` format), a
hue slider, an optional alpha slider and alpha
input, a format select, a color value input, a copy action, an eye dropper action and an optional swatch list.

The swatches are `igc-color-swatch` children, optionally in labelled `igc-color-swatch-group` children. The panel has
two views: the gradient view with the canvas and the inputs, and the swatch view with the swatch list.

The panel is not a form control: it has no `name`, no validation and no form reset. It suits theme editors,
sidebars and other places where the controls stay visible. The color picker shows a panel in its popup.

### Key features

- **The surface of the color picker**: the same canvas, sliders, inputs, buttons and swatches.
- **Swatch elements**: swatches as light DOM children, in labelled groups, with a no-color swatch and `var()` colors
  that follow the page.
- **Two views**: the gradient view and the swatch view, with a view switcher when both are available.
- **Any CSS color string**: hex, `rgb()`, `hsl()`, named colors and the other notations, such as `oklch()`, `lab()`,
  `color()` and `color-mix()`, are parsed into sRGB and normalized.
- **Four serialization formats**, `hex`, `rgb`, `hsl` and `oklch`, switchable at run time without altering the
  represented color.
- **Contrast readout**: the WCAG 2 contrast ratio of the color over a background that the app sets, with the AA and
  AAA levels for normal text.
- **Change events per gesture**: `igcInput` while the user changes the color, `igcChange` when the change ends, as
  for a native range input.
- **Themeable**: the themes of the color picker, and shadow parts for every region.

### Acceptance criteria

The `igc-color-panel` must:

- be WAI-ARIA compliant.
- parse any valid CSS color string assigned to `value`, and clip a color outside the sRGB gamut to it; an empty,
  whitespace-only or invalid string clears the value, and so does a color that depends on its context.
- serialize `value` in the current `format`, and keep the color when the format changes.
- keep the canvas marker, the sliders and the inputs synchronized with the color.
- emit `igcInput` for each change of the user, and `igcChange` when a change ends with a color that differs from the
  last reported color.
- emit no events for a value from code or a format change.
- keep the events of its inner elements inside.
- show its swatches as the options of one listbox, with one tab stop, and mark the swatch that has the color of the
  value as selected.
- show the swatch view, the gradient view or both, as `views` sets.
- show the WCAG 2 contrast ratio of the value over `contrast-against`, and the AA and AAA levels for normal text,
  while both colors are set.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- drag inside the gradient area to adjust saturation and brightness, and move the marker with the keyboard.
- drag the hue slider to change the base color, and the alpha slider to change the opacity.
- type an exact color string or an alpha percentage.
- switch between the hex, RGB and HSL notations.
- pick a swatch, copy the color, or pick a color from the screen where the browser supports it.
- see which swatch has the current color, and move between the swatches with the arrow keys.
- clear the color with the no-color swatch.
- switch between the gradient and the swatches when the panel offers both.
- see whether the color has enough contrast with the background that it goes on.

### Developer stories

As a developer, I expect to be able to:

- place the panel in a page and read and write its `value` as a string.
- choose the notation of `value` through `format`.
- show live changes with `igcInput` and save finished changes with `igcChange`.
- show the alpha controls, hide the format select, and provide swatches.
- group the swatches under labels, use my design tokens as swatch colors, and keep a list of recent colors.
- offer a swatch-only panel, or both views with a switcher.
- show the contrast of the color with a background of my design, also a design token.
- style each region through its shadow part.

## Functionality

### End-user experience

The panel shows the controls of the color picker popup in place. Every change of the user updates all the controls
at once.

### Developer experience

#### Basic initialization

```html
<igc-color-panel value="#3366cc" show-alpha></igc-color-panel>
```

#### Value and format

```html
<!-- The value is rgb(64 177 183) -->
<igc-color-panel value="oklch(70% 0.1 200)" format="rgb"></igc-color-panel>
```

`value` follows the rules of the [color picker value](../color-picker/spec.md#value-and-formats): any CSS color
converts to sRGB, a color outside the gamut clips, and a color that depends on its context, such as `currentcolor`,
clears the value. Reading `value` gives the color in the current `format`.

A write of the same color, in any notation, keeps the internal color. This keeps the hue of a gray, which a color
string does not carry. A wrapper that writes every property on each render, such as `@lit/react`, does not reset the
hue slider.

#### The OKLCH area

In the `oklch` format, the area shows the OKLCH lightness (0 % at the bottom to 100 % at the top) by the chroma (0 at
the left to 0.33 at the right) at the OKLCH hue of the hue slider. The chroma axis has the same scale for every hue,
just past the largest sRGB chroma (0.3225, at hue 328), so the marker position equals the L and C of the color text.
The hue slider is the OKLCH hue, from 0 to 360, and its track shows the cusp of each hue: its most chromatic sRGB
color. In the other formats, the area is HSV saturation by value and the hue slider is the HSV hue.

The model is sRGB, so part of each OKLCH area is out of gamut. The area paints only the sRGB colors; beyond the gamut
edge it is transparent, and the panel surface shows. A drag or a key beyond the gamut edge keeps the lightness and cuts
the chroma back to the edge, as CSS gamut mapping does, and the marker stops at the edge. A pick that gives the same
color reports nothing, so <kbd>Arrow Right</kbd> at the edge does nothing. A move of the hue slider to a hue with less
gamut cuts the chroma back too.

At the hue of blue (264.05), the black-to-blue edge of sRGB is a thin spike apart from the rest of the area, because
every color from black to `#0000ff` has that hue. The area paints the spike as a line 1 px wide, so the marker of a
pure blue sits on it.

The color keeps its OKLCH lightness, chroma and hue, as it keeps HSV, so a gray keeps the hue that the user set. A
gray takes the hue of the other space through the cusp: HSV hue 210 gives the OKLCH hue of `hsv(210 100% 100%)`, about
256, and back the same way. An empty value starts at white with the hue slider at 29, the OKLCH hue of red.

The OKLCH area is a canvas that the panel paints in CSS pixels, at most once per frame, when the hue or the size
changes. The alpha of a pixel is the share of it inside the gamut, so the gamut edge is smooth and has no steps. A
server render shows the area without colors until the client paints.

#### Swatches

The swatches of the panel are `igc-color-swatch` children. A swatch has a `color` (any CSS color) and an optional
`label`. An `igc-color-swatch-group` puts swatches under a label, which also names the group.

```html
<igc-color-panel value="#3d5a80">
  <igc-color-swatch></igc-color-swatch>
  <igc-color-swatch-group>
    <span slot="label">Brand</span>
    <igc-color-swatch color="var(--brand-primary)" label="Primary"></igc-color-swatch>
    <igc-color-swatch color="var(--brand-accent)" label="Accent"></igc-color-swatch>
  </igc-color-swatch-group>
</igc-color-panel>
```

- **Swatch list.** All swatches are the options of one listbox, named "Color swatches". The swatches of the `swatches`
  property come first, then the children in document order. A swatch can be in any child element, not only in a
  group. The list lays out the swatches in rows of eight; a group starts a new row and its swatches take the same
  columns. Without swatches, the list does not show.
- **Pick.** A click, <kbd>Enter</kbd> or <kbd>Space</kbd> on a swatch sets its color as the value, in the current
  format. A pick is one change: one `igcInput` and one `igcChange`. In the popup of a color picker in the
  [confirm mode](../color-picker/spec.md#confirm-mode), <kbd>Enter</kbd> on a swatch, the canvas marker or a slider
  also applies the draft.
- **Selected swatch.** The first swatch that has the color of the value, alpha included, is selected: `aria-selected`
  is true and the swatch has the `ig-selected` custom state. The list is a single-select listbox, so a second swatch
  with the same color is not selected. A swatch of the `swatches` property also gets the `selected` part.
- **No-color swatch.** A swatch without a `color` (or an empty string in `swatches`) is the no-color swatch. It shows
  the "no color" mark of the empty anchor, it is selected while the value is empty, and a pick clears the value.
- **`var()` colors.** A swatch resolves `var()` from its own computed style. A pick writes the resolved color, and the
  selected state compares the resolved color. Other values that depend on the context, such as `currentcolor` or
  `light-dark()` without `var()`, are invalid. The panel reads the colors again when a swatch connects or changes its color, when the theme
  changes and when the size of the panel changes, as when a hidden panel shows. A custom property that changes at another time takes effect at the next of these.
  Before hydration, a server-rendered swatch shows its color but no selected state.
- **Invalid colors.** A swatch with an invalid color, or a `var()` that does not resolve to a color, is never
  selected, and a pick of it does nothing.
- **Names.** A swatch is named by its `label`, else by its [color name](#value-text-and-color-names), such as "vibrant
  red". The name of a color that is not opaque adds its alpha, such as "vibrant red, alpha 50%". A swatch with an invalid
  color is named by its color string. The no-color swatch without a `label` is named by the `color_picker_no_color`
  string of the panel ("No color").

#### Views

`views` is a space-separated list of `gradient` and `swatches`. The default is `gradient`.

| `views`              | On screen                                                                     |
| -------------------- | ----------------------------------------------------------------------------- |
| `gradient`           | The gradient view, with the swatch list below the inputs.                    |
| `swatches`           | The swatch list only.                                                         |
| `gradient swatches`  | A view switcher at the top, and the view that `active-view` sets.             |

In the swatch view, the swatch list is the only content. The swatch list shows below the gradient controls only when
the panel has no swatch view. `active-view` sets the view on screen; the switcher updates it and emits no event, as the
calendar does for its views. A view that `views` does not have gives the first view of `views`, and reading
`activeView` returns the view on screen. Unknown tokens drop out.

```html
<igc-color-panel views="gradient swatches" active-view="swatches"></igc-color-panel>
```

#### Recent colors

The panel has no API for recent colors. The app owns the list: an `igcChange` handler adds the new color to a swatch
group, for example at the start of a "Recent" group, and removes the oldest swatch over a limit. The app also decides
where to keep the list between visits. The `RecentColors` story of the color picker shows the recipe.

```ts
picker.addEventListener('igcChange', ({ detail }) => {
  if (!detail) return;
  const swatch = document.createElement('igc-color-swatch');
  swatch.color = detail;
  recentGroup.querySelector('[slot="label"]')!.after(swatch);
});
```

#### Events

The panel emits `igcInput` for each change of the user, and `igcChange` when the change ends. It emits `igcChange` only
when the color differs from the color of the last `igcChange` or of the last value from code. A change that returns to
that color emits no `igcChange`.

| User action                                         | `igcInput`  | `igcChange`                  |
| --------------------------------------------------- | ----------- | ---------------------------- |
| A drag on the canvas                                | Each move   | At the release               |
| A step key on the canvas marker                     | Each key    | Each key                     |
| A drag of the hue or alpha slider                   | Each move   | At the release               |
| A key on the hue or alpha slider                    | Each key    | Each key                     |
| Typing in the alpha input                           | Each edit   | At the commit (blur, Enter)  |
| <kbd>Arrow Up</kbd> or <kbd>Arrow Down</kbd> in the alpha input | Each key | Each key          |
| A commit of the color value input (blur, Enter)     | None        | At the commit                |
| A swatch pick (click, <kbd>Enter</kbd>, <kbd>Space</kbd>) | Once  | Once                         |
| An eye dropper pick                                 | Once        | Once                         |
| A format switch                                     | None        | None                         |
| A view switch                                       | None        | None                         |

A commit of the color value input emits no `igcInput`, as in the color picker. A value from code and a format change
emit no events.

#### Value text and color names

Assistive technology reads a value text for each slider:

| Control       | Value text                                             | Example                                            |
| ------------- | ------------------------------------------------------ | -------------------------------------------------- |
| Hue slider    | The angle and the name of the hue at the slider position | 120 degrees, green                               |
| Hue slider in `oklch` | The OKLCH angle and the name of that hue          | 328 degrees, magenta                               |
| Alpha slider  | The alpha percentage                                   | 50%                                                |
| Canvas marker | The saturation, the brightness and the color name      | Saturation 100%, brightness 67%, dark vibrant blue |
| Canvas marker in `oklch` | The lightness, the chroma and the color name | Lightness 70%, chroma 0.322, vibrant magenta |

The numbers use the number format of the locale. A color name has a hue word and can have a lightness word and a
chroma word before it:

- Lightness: very dark, dark, light, very light.
- Chroma: grayish, vibrant.
- Hue: red, orange, brown, yellow, yellow green, green, cyan, blue, purple, magenta, pink.

A color with almost no chroma is black, white or gray, and a gray can have a lightness word. The panel calculates the
words from the OKLCH lightness, chroma and hue of the color:

- The hue word comes from the OKLCH hue. A dark orange is brown, and brown is never vibrant. A very light red is pink.
- The lightness word compares the color with the most chromatic sRGB color of its hue. Pure yellow and pure blue have no
  lightness word, and navy is "dark blue".
- The chroma word compares the chroma with an estimate of the most chroma that sRGB has at the lightness and hue of
  the color. The estimate is a triangle of black, white and the most chromatic color of the hue.

The words and their order come from the resource strings, and `color_picker_value_with_name` joins a value and a name.
See [Localization](#localization). While the value is empty, the value text of the canvas marker has no color name. The
hue slider still names its hue, which is the hue of the canvas.

#### Copy

The copy button writes the value to the clipboard. After a copy, the button shows a check icon and the name "Copied"
for one second. After a failure, it shows an error icon and the name "Copy failed". A copy without the clipboard API,
as outside a secure context, fails. Only the latest copy shows its result, and a copy that ends after the panel leaves
the page shows nothing. The panel has no live region, so a screen reader can miss the new name.

#### Contrast

```html
<igc-color-panel value="#767676" contrast-against="white"></igc-color-panel>
```

With `contrast-against`, the panel shows a contrast readout at its bottom, in both views. The readout gives the WCAG 2
contrast ratio of the value over that color, such as "Contrast 4.54:1", and a mark for each level for normal text:
"AA pass" or "AA fail" for 4.5:1, and "AAA pass" or "AAA fail" for 7:1. The ratio comes from the relative luminance of
the two colors in linear sRGB. A value with alpha goes over the `contrast-against` color, and a `contrast-against`
color with alpha goes over white, as the browser paints them. The ratio shows two decimals at most and drops the
others, so a ratio below a level never reads as that level: 4.4999 reads "4.49".

`contrast-against` takes any CSS color. A color that depends on its context, such as a `var()`, `currentcolor`,
`light-dark()` or a system color, resolves from the computed style of the panel, as a `var()` swatch does. The panel
reads it again when `contrast-against` changes, when the theme changes and when the size of the panel changes, as when
a hidden panel shows. An empty value, an empty or invalid `contrast-against`, and a `var()` that is not a color hide the
readout.

The readout follows each change of the color. It has no live region. A server render has no readout; it shows after
the hydration.

#### In the color picker

The color picker renders a panel in its popup. It passes `format`, `show-alpha`, `hide-formats`, `swatches`, `views`,
`active-view`, `contrast-against` and its resource strings to the panel, and takes each change of the panel as a change of the user. It
forwards its swatch and group children to the panel through a nested slot. A format or a view that the user picks in
the panel updates the `format` or the `activeView` of the picker. The events of the panel do
not leave the picker; the picker emits its own `igcInput`, and its `igcChange` when the focus leaves it. The picker
forwards the parts of the panel as its own parts, except `base`. In the popup, the popup paints the surface and the
`base` part of the panel has no background, border or radius.

#### Styling

The panel uses the themes of the color picker. Alone in the page, its `base` part paints the surface: the picker
background, border and border radius, with no elevation.

```css
igc-color-panel::part(base) {
  border-radius: 12px;
}
```

### Localization

The panel uses the strings of the color picker, from the `igniteui-i18n-core` package, through the `locale` and
`resourceStrings` properties. The [color picker localization](../color-picker/spec.md#localization) lists the keys. In
the color picker, the panel takes the strings of the picker.

The panel uses strings that `igniteui-i18n-core` does not ship yet: `color_picker_no_color` ("No color"),
`color_picker_swatches` ("Color swatches"), `color_picker_view_gradient` ("Gradient"), `color_picker_view_swatches`
("Swatches"), the format names `color_picker_format_hex` ("Hex"), `color_picker_format_rgb` ("RGB"),
`color_picker_format_hsl` ("HSL") and `color_picker_format_oklch` ("OKLCH"), the copy names `color_picker_copied`
("Copied") and `color_picker_copy_failed` ("Copy failed"), `color_picker_value_with_name` ("{0}, {1}") and the color
name strings `color_picker_name_*`, and the contrast strings `color_picker_contrast_ratio` ("Contrast {0}:1"),
`color_picker_contrast_pass` ("{0} pass"), `color_picker_contrast_fail` ("{0} fail"), `color_picker_contrast_aa` ("AA")
and `color_picker_contrast_aaa` ("AAA"), and the OKLCH area strings `color_picker_canvas_oklch_label` ("Lightness and
chroma") and `color_picker_canvas_oklch_value` ("Lightness {0}%, chroma {1}"). Until it does, every locale shows the English text, and `resourceStrings` can
replace them.

A color name takes the words of `color_picker_name_*` in the order of `color_picker_name_pattern` ("{0} {1} {2}"):
`{0}` is the lightness word, `{1}` the chroma word and `{2}` the hue word. A word that a color does not have leaves no
extra space, so a language that puts the adjectives after the noun uses "{2} {0} {1}", and a language with no spaces
uses "{0}{1}{2}". `color_picker_name_with_alpha` ("{0}, alpha {1}") adds the alpha to the name of a swatch.

In the contrast strings, `{0}` is the ratio, in the number format of the locale, or the name of the level. In
`color_picker_canvas_oklch_value`, `{0}` is the lightness in whole percent and `{1}` the chroma with 3 decimals, in the
number format of the locale.

### Keyboard interactions

| Key combination                            | Result                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| <kbd>Arrow</kbd> keys                      | With the canvas marker focused, moves it 1 % of the canvas in the direction of the arrow. |
| <kbd>Shift</kbd> + <kbd>Arrow</kbd> keys   | With the canvas marker focused, moves it 10 % of the canvas.                              |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd>  | With the canvas marker focused, moves it 10 % up or down.                                 |
| <kbd>Home</kbd> / <kbd>End</kbd>           | With the canvas marker focused, moves it 10 % left or right.                              |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Down</kbd> | In the alpha input, steps the alpha by 1 %.                                              |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd> | In the swatch list, moves the focus to the previous or next swatch, in reading order. The ends wrap. |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Down</kbd> | In the swatch list, moves the focus to the nearest swatch in the row above or below.     |
| <kbd>Home</kbd> / <kbd>End</kbd>           | In the swatch list, moves the focus to the first or last swatch.                          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>        | In the swatch list, picks the focused swatch.                                             |
| <kbd>Enter</kbd>                           | In a color picker in the confirm mode, on a swatch, the canvas marker or a slider, also applies the draft. |
| <kbd>Tab</kbd>                             | Moves focus between the controls of the panel. The swatch list is one tab stop.          |

The arrow keys in the swatch list move the focus only; they do not pick. The tab stop of the list is the focused
swatch, else the selected swatch, else the first swatch. The rows come from the layout, so a group and a theme that
changes the column count count.

The hue and alpha sliders are native range inputs and keep their keys.

## API

### Properties and attributes

| Property        | Attribute    | Reflected | Type                          | Default | Description                                                                                           |
| --------------- | ------------ | --------- | ----------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| value           | value        | No        | `string`                      | `''`    | The value as a CSS color string, in `format`. Accepts any CSS color and clips it to sRGB. A color that depends on its context clears it. |
| format          | format       | No        | `ColorFormat`                 | `hex`   | The color format of the string value. A format change renders `value` in the new notation.            |
| showAlpha       | show-alpha   | No        | `boolean`                     | false   | Whether to show the alpha slider and input.                                                           |
| hideFormats     | hide-formats | No        | `boolean`                     | false   | Whether the format select is hidden.                                                                  |
| swatches        | Not set      | No        | `string[]`                    | `[]`    | Pre-defined color strings, rendered as swatches in front of the swatch children. An empty string gives the no-color swatch. |
| views           | views        | No        | `string`                      | `gradient` | The views, a space-separated list of `gradient` and `swatches`. Both show a view switcher.          |
| activeView      | active-view  | No        | `ColorPanelView`              | `gradient` | The view on screen. The switcher sets it. A view that `views` does not have gives the first view of `views`. |
| contrastAgainst | contrast-against | No    | `string`                      | `''`    | The background color of the contrast readout, as any CSS color. A color that depends on its context, such as a `var()`, resolves from the component. The readout shows the WCAG 2 contrast ratio of the value over this color, with the AA and AAA levels for normal text. An empty or invalid color hides it. |
| locale          | locale       | No        | `string`                      | Not set | The locale for the resource strings. Falls back to the inherited locale, then the global one.         |
| resourceStrings | Not set      | No        | `ColorPickerResourceStrings`  | EN      | The texts of the component. The strings that you set replace the strings of the current locale.       |

### Methods

The panel has no public methods.

### Events

| Name      | Cancellable | Detail   | Description                                                                                         |
| --------- | ----------- | -------- | --------------------------------------------------------------------------------------------------- |
| igcInput  | false       | `string` | Emitted when the user changes the color with the canvas, the sliders, the alpha input, a swatch or the eye dropper. |
| igcChange | false       | `string` | Emitted when the user ends a change of the color. See [Events](#events-1).                          |

The events of the inner inputs, the format select, the view switcher and the canvas stay inside the panel.

### Slots

| Name      | Description                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------- |
| (default) | The `igc-color-swatch` and `igc-color-swatch-group` children, shown in the swatch list after the swatches of `swatches`. |

### CSS Shadow parts

| Part            | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| `base`          | The wrapper of the panel. Alone in the page, it paints the surface.        |
| `picker-canvas` | The area: saturation by value, or lightness by chroma in the `oklch` format. |
| `marker`        | The marker on the area that shows the picked color.                         |
| `dragging`      | Added to the marker part while the user drags it.                           |
| `main-row`      | The row containing the hue slider and the copy and eye dropper buttons.    |
| `alpha-row`     | The row containing the alpha slider and input, rendered when `show-alpha` is set. |
| `inputs-row`    | The row containing the format select and the color value input.             |
| `buttons`       | The wrapper around the copy and eye dropper buttons.                        |
| `hue`           | The hue slider.                                                             |
| `alpha`         | The alpha slider.                                                           |
| `alpha-input`   | The input of the alpha value, rendered when `show-alpha` is set.            |
| `copy`          | The button that copies the current color value to the clipboard.            |
| `eye-dropper`   | The button that activates the EyeDropper API.                               |
| `format-select` | The select control used to switch the color string format.                  |
| `swatches`      | The swatch list.                                                            |
| `swatch`        | A swatch of the `swatches` property.                                        |
| `selected`      | Added to the swatch part of the selected swatch.                            |
| `view-switcher` | The view switcher, rendered when `views` has both views.                    |
| `view-button`   | A button of the view switcher.                                              |
| `active`        | Added to the view-button part of the view on screen.                        |
| `contrast`      | The contrast readout, rendered when `contrast-against` has a color and the value is not empty. |
| `contrast-ratio` | The contrast ratio of the value over `contrast-against`.                   |
| `contrast-mark` | A WCAG level of the contrast readout, AA or AAA.                            |
| `pass`          | Added to the contrast-mark part of a level that the ratio passes.           |
| `fail`          | Added to the contrast-mark part of a level that the ratio fails.            |

A swatch child is not a part of the panel. Style it with the `igc-color-swatch` selector, its `base` part and its
`ig-selected` custom state.

### CSS custom properties

The panel has no public custom properties. The `--_` variables in its styles, for example `--_current-color`, are
internal. A swatch takes the color picker theme variables from the panel that shows it.

### igc-color-swatch

A color option of the swatch list. It has no theme of its own; it takes the variables of the panel.

| Property | Attribute | Reflected | Type     | Default | Description                                                                 |
| -------- | --------- | --------- | -------- | ------- | --------------------------------------------------------------------------- |
| color    | color     | No        | `string` | Not set | Any CSS color, also `var()`. Without a color, the swatch is the no-color swatch. |
| label    | label     | No        | `string` | Not set | The accessible name of the swatch. Without it, the name is the color name, such as "vibrant red", or "No color" for the no-color swatch. |

| Part   | Description                                                            |
| ------ | ---------------------------------------------------------------------- |
| `base` | The color fill. |

| Custom state  | Description                                       |
| ------------- | ------------------------------------------------- |
| `ig-selected` | The color of the swatch is the value of the panel. |

### igc-color-swatch-group

A labelled group of swatches. It shares its base with `igc-select-group` and `igc-dropdown-group`.

| Slot      | Description                                          |
| --------- | ---------------------------------------------------- |
| `label`   | The label of the group. Its text also names the group. |
| (default) | The swatches of the group.                            |

| Part    | Description        |
| ------- | ------------------ |
| `label` | The label element. |

## Test scenarios

The panel suite is [`color-panel.spec.ts`](./color-panel.spec.ts). The canvas, the color model, the parser, the
converters and the property-based tests live with the color picker; see the
[color picker test scenarios](../color-picker/spec.md#test-scenarios). The color picker suite also covers the panel in
the popup through the picker. The color name rule has its own suite, `color-name.spec.ts`, with the color picker, and
so has the contrast ratio, `contrast.spec.ts` and `contrast.property.spec.ts`.

### Rendering

The a11y audit, the controls in the `base` part, the alpha row, the format select and the swatches, the surface alone
in the page, and no surface in the color picker popup.

### Value and format

Any CSS color in the current format, a color and the placeholder in `oklch`, the empty value for an invalid color and a
context color, the hue of a gray kept for a write of the same color, the format names from the resource strings, and
no events for a value from code or a format switch.

### Events

`igcInput` and `igcChange` for the sliders, the canvas keys, a canvas drag, the color value commit, a swatch, the alpha
input and its keys; no `igcChange` for a change back to the reported color or to a value from code; the events of the
inner elements stay inside.

### Eye dropper

A pick emits `igcInput` and `igcChange`.

### Marker

The marker moves to a value from code, and takes its place when a hidden panel shows.

### Value text

The angle and the hue name of the hue slider, the alpha percentage of the alpha slider, the color name in the value text
of the canvas marker and no name for an empty value, the numbers in the format of the locale, and the words and the
order from the resource strings.

### Copy

The check icon and "Copied" for one second after a copy, the error icon and "Copy failed" after a failure and without a
clipboard, the a11y audit in both states, the timer restarted by a second copy, only the result of the latest copy, no
result for a copy that ends after a disconnect, and the copy icon again after a disconnect.

### Swatches

The a11y audit with groups, the named listbox, the `swatches` property in front of the children, the names (label,
color name with alpha, "No color", the words and the locale of the panel, the color string of an invalid color, a new
name for a new color), the group name, the selected swatch with alpha, only the first of two
swatches with the same color selected, the `selected` part, the no-color swatch selected while empty, a `var()` swatch
resolved again when the panel shows, the events of a pick, a pick that clears, invalid colors and `var()` values,
swatches that the app adds and removes, and no list without swatches.

### Swatch keyboard

One tab stop, the arrows in reading order with the wrap, the swap in right-to-left, the rows up and down, a shorter
row, Home and End, Enter and Space as one change, no pick on an arrow, and the tab stop on a clicked swatch.

### Views

The a11y audit of both views, the gradient view with the list below it, the switcher for both views, the swatch view, a
switch with no events, the marker after a switch back, the first view for a view that `views` does not have, and
unknown tokens.

### Contrast

The a11y audit, no readout without `contrast-against`, the ratio and the AA and AAA marks with their parts, the
attribute, a color that the user commits, the alpha of the value and of `contrast-against`, no readout for an empty
value, an invalid color, an undefined `var()` or a `var()` that is not a color, `currentcolor`, `light-dark()` and a
`var()` resolved from the panel, a `var()` read again when the panel shows and when the theme changes, the readout at
the end of the panel in both views, and the strings and the number format of the locale. `contrast.spec.ts` covers the
ratio of known pairs, the alpha of both colors and the cut decimals; `contrast.property.spec.ts` covers the range from
1 to 21 and the same ratio for both orders of two opaque colors.

### OKLCH area

The a11y audit, the area and the marker at the lightness and chroma of the value, the OKLCH hue on the hue slider with
its value text, the cusp track and the cusp thumb, and back to HSV in `hex`; the marker name and value text with the
resource strings and the locale; a pick at the OKLCH hue with one `igcInput`; a pick beyond the gamut edge that keeps
the lightness, cuts the chroma and stops the marker, and a second one with no event; no event for
<kbd>Arrow Right</kbd> at the edge; a hue move that cuts the chroma and moves the marker; a gray that keeps its hue;
the hue of an HSV gray through the cusp on a format switch; and an empty value at white with the hue at 29. The color
picker suites cover the gamut runs, the blue spike, the cut-back, the cusps, the paint
(`oklch.spec.ts`, `oklch.property.spec.ts`), the OKLCH space of the model and the canvas of the OKLCH area.

## Assumptions and limitations

- The color model is sRGB. See the [color picker limitations](../color-picker/spec.md#assumptions-and-limitations).
- The eye dropper button is rendered enabled only where the platform implements the `EyeDropper` API. Support is
  captured once, at construction time.
- Copying to the clipboard depends on the `navigator.clipboard` API and a secure context. Where it is unavailable or
  denied, the copy button shows "Copy failed".
- Color names are approximate. The rule that picks the words is the same in all locales; only the words and their
  order change.
- The panel has no `disabled` property. To make it inactive, set `inert` on it.
- A `var()` swatch reads its color again only at the times that [Swatches](#swatches) lists. A context color in
  `contrast-against` reads its color again only at the times that [Contrast](#contrast) lists.
- The OKLCH area shows the sRGB gamut only; the model stays sRGB. At the hue of blue the black-to-blue edge is a thin
  spike, a line 1 px wide. The out-of-gamut look is provisional until the design team gives one.
- A paint of the OKLCH area takes a few milliseconds, once per frame at most during a hue drag.
- The contrast readout gives the WCAG 2 ratio and the levels for normal text only. It has no levels for large text
  (3:1 and 4.5:1), no APCA value and no contrast lines on the canvas.
- The selected mark of a swatch, the swatch focus ring, the group label, the view switcher and the contrast readout
  use provisional styles until the design team gives them.
- In the Material, Fluent and Indigo themes the picker border color is transparent and the popup shows its edge with
  an elevation. Alone in the page, the panel has no elevation, so it has no visible edge on a background of the same
  color. Style `::part(base)` to add one. Bootstrap draws a border.

## Accessibility

### ARIA roles and properties

- The host has no role. The controls inside have their own names.
- The hue and alpha sliders are native range inputs labelled through `aria-label`. Their `aria-valuetext` gives the
  angle and the hue name, and the alpha percentage.
- The canvas marker is a `slider` with `aria-valuetext` for both axes and the color name. In the `oklch` format it is
  named "Lightness and chroma". The painted OKLCH area is hidden from assistive technology.
- The format select and the color value input have visually hidden labels.
- The copy and eye dropper buttons expose visually hidden text. After a copy, the name of the copy button is "Copied"
  or "Copy failed" for one second.
- The swatch list is a `listbox` named "Color swatches". Each swatch is an `option` with `aria-selected`, named by its
  label or its color name. A swatch group is a `group` named by its label. The swatch mirrors its role and name onto
  content attributes, so that tools that read only attributes, such as axe, see them.
- The contrast readout is plain text: the ratio and one mark for each level. Each mark says "pass" or "fail" in text,
  so the result does not depend on the color of the mark. The readout has no live region, so a screen reader reads a
  new ratio only when the user moves to it.
- The view switcher is a button group in single selection: a `radiogroup` of two `radio` buttons with
  `aria-checked`. The texts of the buttons name the views.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The sliders and the layout follow the document direction. The area does not mirror, so an
arrow key moves its marker in the direction of the arrow. In the swatch list, the order of the swatches follows the
direction, and <kbd>Arrow Left</kbd> and <kbd>Arrow Right</kbd> swap.

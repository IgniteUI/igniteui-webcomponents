# Skeleton specification

- [Skeleton specification](#skeleton-specification)
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
      - [Choosing an animation](#choosing-an-animation)
      - [Customizing the colors](#customizing-the-colors)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom properties](#css-custom-properties)
    - [Custom states](#custom-states)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Test scenarios](#test-scenarios)
    - [Accessibility tests](#accessibility-tests)
    - [Defaults](#defaults)
    - [`loading` property](#loading-property)
    - [`animation` property](#animation-property)
    - [Motion](#motion)
    - [Content projection](#content-projection)
    - [Measurement](#measurement)
    - [Lifecycle](#lifecycle)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-25 | Initial specification |
|       2 | 2026-10-12 | Measurement of line boxes, empty containers, SVG, skipped content, `visibility` and `display: contents`; clips in the content and its shadow trees; radius of a covering shadow element or a rounded clip; CSS `zoom`; web fonts; block host; cyclic `wave` delay |
|       3 | 2026-10-13 | Text split into several text nodes gets one shape for each line |
|       4 | 2026-11-16 | Design review: no overlay; `none`, `breathe` (default) and `wave` animations; text shapes as tall as the font size; Figma hand-off; motion tests |
|       5 | 2026-11-16 | Controls and embedded content keep their box also with child elements; web fonts tracked only while loading; merged and removed overlapping tests |
|       6 | 2026-11-16 | Code review: slotted text styles from the slot; vertical text; form-associated custom elements keep their box; `revealing` follows the reveal animation; transforms around the host; a clipped shape layer; unknown `animation` values |

## Overview

The `igc-skeleton` component shows a placeholder for content that is still loading. It wraps the real content and,
while `loading` is set, hides that content and draws a shape over each of its visible parts.

The shapes come from the projected content itself, so the placeholder has the same layout as the content that
replaces it. No separate placeholder markup is necessary.

### Key features

- **Layout-matched placeholders**: one shape for each visible leaf element, and one shape for each line of text. A
  text shape is as tall as the font size, so consecutive lines keep a gap.
- **Live measurement**: the shapes follow content changes, attribute changes, size changes and scrolling while loading.
- **Two animations**: `breathe` (the default) and `wave`, or static shapes with `none`. No animation runs when the user
  prefers reduced motion.
- **Smooth reveal**: the content fades in when loading ends.
- **Themeable**: the colors come from the gray palette of the active theme and can be overridden.

### Acceptance criteria

- While loading, the content must be hidden, inert and unreachable with the keyboard.
- Each visible leaf element must get a shape at its exact position and size, and each line of text must get a shape
  as tall as its font size in the middle of the line. The shapes must be clipped where the content clips its overflow.
- The shapes must follow the content while loading, and the component must do no measurement work while idle.
- The host must report `aria-busy` while loading.
- The component must pass an a11y audit in both states.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see where content will appear before it loads.
- not reach or activate content that I cannot see.
- not see motion when I have asked my system for reduced motion.

### Developer stories

As a developer, I expect to be able to:

- wrap existing markup and toggle one attribute, without writing separate placeholder markup.
- choose the animation style.
- change the placeholder colors and radius to match my design.
- style the reveal with the `revealing` custom state.

## Functionality

### End-user experience

Design hand-off: [Skeleton](https://www.figma.com/design/uWH93MNYwYt2mPBEx5hkQb/Skeleton) in Figma, with a page for
each theme. The shapes in the hand-off (icon, circle, text, button, image) are examples. In code, a shape always
matches the element or the text that it covers.

While loading, the content is transparent and inert, and a shape covers each visible part of the content. Only the
shapes have a fill: nothing is drawn behind them. The shapes animate as `animation` selects:

- `breathe`: opacity 0.6 → 1 → 0.6 and scale 1 → 1.02 → 1, 1.5s, ease-in-out, infinite.
- `wave`: translateY 0 → −6px → 0, 1s, ease-in-out, infinite. Each shape starts 0.1s after the one before it, and the
  delay restarts after 10 shapes.
- `none`: static shapes.

When loading ends, the shapes are removed at once, and the content fades in (opacity 0 → 1) and moves up (translateY
8px → 0) over 600ms, ease-out. The reveal runs for every animation, also for `none`.

When the user prefers reduced motion, no animation runs, including the reveal, and the `revealing` state ends at once.

### Developer experience

#### Basic initialization

```html
<igc-skeleton loading>
  <div style="display: flex; gap: 1rem;">
    <igc-avatar shape="circle"></igc-avatar>
    <div>
      <p>John Smith</p>
      <p>Software Engineer</p>
    </div>
  </div>
</igc-skeleton>
```

Remove the `loading` attribute, or set the `loading` property to `false`, when the data is ready.

#### Choosing an animation

```html
<igc-skeleton loading animation="wave">...</igc-skeleton>
```

Set `animation="none"` for static shapes.

#### Customizing the colors

```css
igc-skeleton {
  --ig-skeleton-shape-color: #dcdcdc;
  --border-radius: 4px;
}
```

### Localization

The component has no resource strings.

### Keyboard interactions

The component has no keyboard interactions. While loading, the content is inert, so the keyboard cannot reach it.

## API

### Properties and attributes

| Property  | Attribute | Reflected | Type                            | Default   | Description                                |
| --------- | --------- | --------- | ------------------------------- | --------- | ------------------------------------------ |
| loading   | loading   | Yes       | `boolean`                       | false     | Whether the skeleton is in a loading state. |
| animation | animation | No        | `'none' \| 'breathe' \| 'wave'` | `breathe` | The animation of the shapes while loading. Another value, or no attribute, gives `breathe`. |

### Methods

The component has no public methods.

### Events

The component emits no events.

### Slots

| Name        | Description                               |
| ----------- | ----------------------------------------- |
| _(default)_ | The default slot for the skeleton content. |

### CSS Shadow parts

| Part      | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| `content` | The wrapper around the slotted content.                                    |
| `shape`   | A placeholder shape over a leaf element or over a line of text.            |

Each `shape` part also carries the name of the active animation, `breathe` or `wave`, for example `shape wave`. With
`none`, the shapes have only the `shape` part.

### CSS custom properties

| Property                    | Description                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `--ig-skeleton-shape-color` | The background color of the placeholder shapes. Defaults to the gray 300 palette color.      |
| `--border-radius`           | The border radius of the text shapes, and of each shape whose source element has no border radius. |

### Custom states

| State       | Description                                                          |
| ----------- | -------------------------------------------------------------------- |
| `revealing` | Set after loading ends, until the content has faded in. Ends at once when loading starts again or the skeleton is disconnected. |

## Assumptions and limitations

- A shape source is a leaf element or text. A leaf element is a visible element with no child elements, an element
  whose child nodes have no area, an inline SVG, a control (`<button>`, `<textarea>`, `<select>`, `<meter>`,
  `<progress>`) or embedded content (`<canvas>`, `<video>`, `<audio>`, `<iframe>`, `<object>`). An SVG, a control and
  embedded content are leaves whatever their children. A custom element with no light DOM children counts as one
  leaf, whatever its shadow DOM contains.
- Text is a text run, or the text of a native leaf element, for example a `<p>`, `<span>`, `<a>`, `<label>` or
  `<h1>`–`<h6>`. A text run is the text nodes between two child elements, without the whitespace-only text nodes at
  its ends, in a parent that has child elements, has `display: contents` or is the host.
- A form-associated custom element, such as `igc-button`, `igc-input` or `igc-checkbox`, counts as a control, so it is
  one leaf also with child elements, for example a prefix icon.
- A leaf element keeps its box when it is a custom element (for example a chip with a text label), an SVG, a control
  or embedded content, or when it has no text or its text has no box. The text of such a leaf is covered by the shape
  of the leaf.
- Text gets one shape for each line. The shape is as long as the text on the line and as thick as the font size, and
  its middle is the middle of the text, which is the middle of the line box when the line has one font. So
  consecutive lines keep a gap of the line height minus the font size: a 12px font in a 16px line gets a 12px shape
  with 2px above and below it. In a vertical writing mode, the lines are columns, and the shapes are as wide as the
  font size. Text slotted into a shadow tree takes its font size, writing mode and visibility from its slot. A leaf element that keeps its box gets one shape for each line box, which is one shape
  for a block. The browser returns a box for each text node, and templates often split text into several text nodes
  (for example `#${id}`), so the boxes of one source that touch on a line join into one shape.
- Elements and text with `visibility: hidden` get no shape. An element with `display: contents` gets no shape, but its
  content does. Skipped content gets no shape, also through `display: contents` and slots: all content of an element
  with `content-visibility: hidden`, which gets one shape over its box instead, and all but the `<summary>` of a closed
  `<details>`.
- The shapes are clipped by each element whose overflow is not `visible` or that has paint containment, in the content
  and in the shadow trees that the content is slotted into, and follow its scroll. An absolutely positioned element that
  escapes the clip of such an ancestor is clipped anyway.
- The host is a block box, so it fills the width of its container. Set `width: fit-content` on the host to shrink it to
  its content.
- A shape over a leaf element keeps the border radius of the element, or of a shadow element at any depth that covers
  it, such as the base part of a component. A shape that fills a rounded clip takes the radius of the clip when the
  clip crops the source, such as an image in a round frame, or when the source has no radius. A shape that a rounded
  clip crops but that does not fill the clip, such as the image at the top of a card, keeps the fallback radius on all
  four corners. Text shapes and the other shapes use `--border-radius`, then a fallback derived from
  `--ig-radius-factor`.
- The shapes are positioned in the local coordinates of the host, from the zoom and the scale of the transforms on
  the host and its ancestors at the time of the measurement. So a transform that ends later, for example the scale
  animation of a panel that opens, does not move them. A pixel radius in content that is zoomed against the host is
  not scaled. A rotation, and a transform inside the content that changes after the measurement, misalign them.
- The shapes are in a layer that covers them, with 32px of room on the block-start and inline-start sides for their
  motion. The layer clips the other sides, so the scale of `breathe` adds no scrollable overflow there, at most 1% of
  the size of a shape at the edge of the layer.
- While loading, every change in the content, every resize of the host or of a rendered content element, every scroll
  in the content and every web font load triggers a measurement, at most once for each animation frame. While idle or
  disconnected, the component observes and listens to nothing. A change
  outside the host that moves the content but resizes nothing in it, for example a new `dir` on an ancestor, is not
  tracked.
- The `wave` delay grows by 0.1s for each shape and restarts after 10 shapes.
- Each shape is a separate element. Content with many leaves renders as many shapes, each with its own running
  animation.
- The `revealing` state ends when the animations of the content part end, so a reveal restyled with a longer
  duration keeps it. A reveal with an infinite animation keeps it until loading starts again.
- The component has no schema in `igniteui-theming` yet. The design gives each theme its own shape color (gray 300 in
  light mode, gray 100 in dark mode) and its own radius (Material 4px, Fluent 2px, Bootstrap 4px, Indigo 6px). Until
  the schema exists, the shapes use gray 300 in both variants and a fallback radius derived from
  `--ig-radius-factor`.
- The component announces nothing when loading ends. Pair it with a live region when the change must be announced.

## Test scenarios

The suite lives in [`skeleton.spec.ts`](./skeleton.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### Accessibility tests

1. The light DOM and the shadow DOM pass the a11y audit in the idle state.
2. The light DOM and the shadow DOM pass the a11y audit in the loading state.
3. The content is inert while loading and focusable after.

### Defaults

4. `loading` is `false` and `animation` is `breathe`.
5. The host fills the width of its container.
6. No shapes render when not loading.

### `loading` property

7. `loading` reflects to its attribute.
8. Setting `loading` renders shapes, and clearing it removes them.
9. The `revealing` state is not set when `loading` was never `true`.
10. `ariaBusy` follows `loading`.

### `animation` property

11. `breathe` and `wave` are applied as a part of every shape. `none` adds no part.
12. Without the attribute, and for another value, `animation` is `breathe`.
13. Changing `animation` replaces the part on the shapes.
14. `wave` sets a `--_wave-delay` that grows in exact 0.1s steps and restarts after 10 shapes. `breathe` and `none`
    set none.

### Motion

The block turns motion on with `allowMotion()`.

15. `breathe` runs a 1.5s infinite animation on each shape, `wave` runs a 1s infinite animation that starts after
    `--_wave-delay`, and `none` runs no animation.
16. At the peak of `breathe`, a shape at the edge of a scroll container adds no scrollable overflow. At the peak of
    `wave`, the layer does not clip the shape.
17. The reveal runs a 600ms animation on the content, also with `none`, and the `revealing` state ends when it ends.
18. A reveal that the styles make longer keeps the `revealing` state until it ends.
19. Setting `loading` again during the reveal ends the `revealing` state and the animation at once, and the end of the
    old reveal does not end a new one.
20. A disconnect during the reveal ends the `revealing` state.
21. Under reduced motion, neither the shapes nor the reveal animate, and the `revealing` state ends at once.

### Content projection

22. Each leaf element gets exactly one shape.

### Measurement

23. The shapes align with their sources when the host has a border, when the host scrolls and when an ancestor is
    zoomed.
24. Text shapes are as tall as the font size and in the middle of each line: a 12px font in 16px lines gets 12px
    shapes with 2px above and below. A zoomed ancestor scales the font size, also for text in `display: contents`. In
    vertical text, the shapes are as wide as the font size. Slotted text takes its font size and visibility from its
    slot. A custom element, a form-associated custom element and a `<button>` with child elements, a `<textarea>` and a
    `<canvas>` with text keep their box. The overflow clip of a text element clips its text, and text shapes take the
    radius in the styles.
25. The shapes keep their place and size when a scale transform on an ancestor ends after the measurement.
26. Each text run next to elements gets a shape, and whitespace-only text gets none. Text projected directly into the
    host and the text of an element with `display: contents` get shapes.
27. Hidden, zero-size and `visibility: hidden` elements and text get no shape, but a visible child of a hidden element
    does.
28. A wrapped inline element gets one shape for each line.
29. A leaf element and a text run whose text is split into several text nodes get one shape for each line, also in a
    right-to-left layout. A source that touches the next one keeps its own shape.
30. An inline SVG, an element whose child nodes have no area (such as a `<select>`) and an element with
    `content-visibility: hidden`, also one with only text, each get one shape over their box. A closed `<details>`
    gets a shape only over the text of its `<summary>`: its other text, elements and `display: contents` children get
    none. Text slotted into a shadow element with `content-visibility: hidden` gets none.
31. Radius: a shape keeps the radius of its source, or of a shadow element that covers the source, or of a rounded
    clip that it fills. A rounded clip that crops the source wins over the radius of the source. Other shapes fall
    back to the radius in the styles. The [DOM utilities](../../internals/utils/dom.spec.ts) test the `0%` radius and
    the covering wrappers.
32. Clipping: the shapes are clipped to scroll containers in the content and in its shadow trees, and follow their
    scroll, and a shadow root keeps its scroll listener across measurements. The clip is the padding box. Paint
    containment clips, and the hidden overflow of an inline element does not. The DOM utilities test the clip of each
    axis.
33. Live updates in a fixed-size host: added content, attribute changes, text changes, source resizes, a zero-size
    source that grows and a web font load all update the shapes. Text in the host reflows its shapes when only the host
    resizes.

### Lifecycle

34. After a reconnect in the idle state, content changes start no measurement.
35. Loading that ends while disconnected starts no reveal.
36. A move in the frame that loading starts still draws the shapes.
37. No measurement runs while disconnected, also when loading starts while disconnected, and a web font load
    schedules none.
38. Resizes and web font loads start no measurement after loading ends.

### Not covered by the suite

- The keyframes of each animation. The suite checks the duration, the iteration count and the delay.
- The colors in each theme and variant.
- Right-to-left layouts, other than split text.

## Accessibility

### ARIA roles and properties

- The host has no role.
- The host has **aria-busy** set to `true` while loading and `false` otherwise, through `ElementInternals`.
- While loading, the content wrapper is `inert`, so the content is hidden from assistive technology and cannot be
  focused.
- The layer of the shapes has **aria-hidden** set to `true`.

### Keyboard support

The component adds no keyboard support. See [Keyboard interactions](#keyboard-interactions).

### Right to Left support

The shapes are measured from the rendered layout, so they follow a right-to-left layout without extra setup.

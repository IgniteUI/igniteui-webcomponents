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

## Overview

The `igc-skeleton` component shows a placeholder for content that is still loading. It wraps the real content and,
while `loading` is set, hides that content and draws an animated shape over each of its visible parts.

The shapes come from the projected content itself, so the placeholder has the same layout as the content that
replaces it. No separate placeholder markup is necessary.

### Key features

- **Layout-matched placeholders**: one shape for each line of each visible leaf element and each run of text next to
  elements.
- **Live measurement**: the shapes follow content changes, attribute changes, size changes and scrolling while loading.
- **Five animations**: `pulse`, `breathe`, `shimmer`, `wave` and `glow`. All stop when the user prefers reduced motion.
- **Smooth reveal**: the content fades in when loading ends.
- **Themeable**: the colors come from the gray palette of the active theme and can be overridden.

### Acceptance criteria

- While loading, the content must be hidden, inert and unreachable with the keyboard.
- Each visible leaf element and each non-whitespace run of text next to elements must get a shape at its exact
  position and size, clipped where the content clips its overflow.
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

While loading, the content is transparent and inert. A translucent overlay covers the whole host, and an animated
shape covers each visible part of the content. When loading ends, the shapes are removed at once, the overlay fades
out and the content fades in over 600ms.

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
<igc-skeleton loading animation="shimmer">...</igc-skeleton>
```

#### Customizing the colors

```css
igc-skeleton {
  --ig-skeleton-overlay-color: #f4f4f4;
  --ig-skeleton-shape-color: #dcdcdc;
  --ig-skeleton-highlight-color: #fff;
  --border-radius: 4px;
}
```

### Localization

The component has no resource strings.

### Keyboard interactions

The component has no keyboard interactions. While loading, the content is inert, so the keyboard cannot reach it.

## API

### Properties and attributes

| Property  | Attribute | Reflected | Type                                                  | Default   | Description                                                   |
| --------- | --------- | --------- | ----------------------------------------------------- | --------- | ------------------------------------------------------------- |
| loading   | loading   | Yes       | `boolean`                                             | false     | Whether the skeleton is in a loading state.                   |
| animation | animation | No        | `'pulse' \| 'breathe' \| 'shimmer' \| 'wave' \| 'glow'` | `breathe` | Defines the animation style for the skeleton when in a loading state. |

### Methods

The component has no public methods.

### Events

The component emits no events.

### Slots

| Name        | Description                               |
| ----------- | ----------------------------------------- |
| _(default)_ | The default slot for the skeleton content. |

### CSS Shadow parts

| Part      | Description                                                                         |
| --------- | ----------------------------------------------------------------------------------- |
| `content` | The wrapper around the slotted content.                                             |
| `overlay` | The translucent layer rendered over the content during loading.                     |
| `shape`   | An individual placeholder shape rendered over a leaf element or a run of text.      |

Each `shape` part also carries the name of the active animation, for example `shape shimmer`.

### CSS custom properties

| Property                        | Description                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `--ig-skeleton-overlay-color`   | Background color of the overlay layer. Defaults to the gray 100 palette color.                     |
| `--ig-skeleton-shape-color`     | Background color of the placeholder shapes. Defaults to the gray 300 palette color.                |
| `--ig-skeleton-highlight-color` | Color of the highlight that the `shimmer` animation sweeps across each shape. Defaults to gray 50. |
| `--border-radius`               | Border radius of the overlay, and of each shape whose source has no border radius.                  |

### Custom states

| State       | Description                                                          |
| ----------- | -------------------------------------------------------------------- |
| `revealing` | Set for 600ms after `loading` changes from `true` to `false`. Ends at once when `loading` is set again or the element is disconnected. |

## Assumptions and limitations

- A shape source is a leaf element or a text run. A text run is the text nodes between two child elements, without
  the whitespace-only text nodes at its ends, in a parent that has child elements, has `display: contents` or is the
  host. A leaf element is a visible element with no child elements, an inline SVG, or an
  element whose child nodes have no area, for example a `<select>` or a `<video>` with `<source>` children. A custom
  element with no light DOM children counts as one leaf, whatever its shadow DOM contains.
- Leaf elements and text runs get one shape for each line box. The text of a leaf element is covered by the shape of
  the element. The browser returns a box for each text node, and templates often split text into several text nodes
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
- A shape keeps the border radius of its source element, or of a shadow element at any depth that covers the source,
  such as the base part of a component. A shape that fills a rounded clip takes the radius of the clip when the clip
  crops the source, such as an image in a round frame, or when the source has no radius. Other shapes use
  `--border-radius`, then a fallback derived from `--ig-radius-factor`.
- The shapes are positioned in the local coordinates of the host and follow CSS `zoom` on the host and its ancestors.
  A pixel radius in content that is zoomed against the host is not scaled. A CSS transform on the host or on an
  ancestor (for example `scale()`) misaligns them.
- While loading, every change in the content, every resize of the host or of a rendered content element, every scroll
  in the content and every web font load triggers a measurement, at most once for each animation frame. A change
  outside the host that moves the content but resizes nothing in it, for example a new `dir` on an ancestor, is not
  tracked.
- The `wave` delay grows by 0.1s for each shape and restarts after 10 shapes.
- Each shape is a separate element. Content with many leaves renders as many shapes, each with its own running
  animation.
- The component has no schema in `igniteui-theming`. It reads the gray palette, so it follows the theme variant, but
  it has no per-theme styles.
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
5. The `loading` attribute is absent when `loading` is `false`.
6. The overlay is always rendered.
7. The host fills the width of its container.
8. No shapes render when not loading.

### `loading` property

9. `loading` reflects to its attribute.
10. Setting `loading` renders shapes, and clearing it removes them.
11. The `revealing` state is set when `loading` changes from `true` to `false`, and removed after 600ms.
12. The `revealing` state is not set when `loading` was never `true`.
13. Setting `loading` again during the reveal ends the `revealing` state at once and clears the reveal timer.
14. `ariaBusy` follows `loading`.
15. A `::part(overlay)` rule sets the overlay opacity.

### `animation` property

16. Each animation name is applied as a part of every shape.
17. Changing `animation` replaces the part on the shapes.
18. The `wave` animation sets a `--_wave-delay` that grows in exact 0.1s steps and restarts after 10 shapes. Other
    animations set none.

### Content projection

19. Slotted content is rendered.
20. Each leaf element gets exactly one shape.

### Measurement

21. The shapes align with their sources when the host has a border, when the host scrolls and when an ancestor is
    zoomed.
22. Each text run next to elements gets a shape, and whitespace-only text gets none. Text projected directly into the
    host and the text of an element with `display: contents` get shapes.
23. Hidden, zero-size and `visibility: hidden` elements and text get no shape, but a visible child of a hidden element
    does.
24. A wrapped inline element gets one shape for each line.
25. A leaf element and a text run whose text is split into several text nodes get one shape for each line, also in a
    right-to-left layout. A source that touches the next one keeps its own shape.
26. An inline SVG, an element whose child nodes have no area (such as a `<select>`) and an element with
    `content-visibility: hidden` each get one shape over their box. A closed `<details>` gets a shape only over its
    `<summary>`, also when its text is in a `display: contents` child, and text slotted into a shadow element with
    `content-visibility: hidden` gets none.
27. Radius: a shape keeps the radius of its source, or of a shadow element that covers the source, also in a covering
    wrapper, or of a rounded clip that it fills. A rounded clip that crops the source wins over the radius of the
    source. Other shapes, and sources with a `0%` radius, fall back to the radius in the styles.
28. Clipping: the shapes are clipped to scroll containers in the content and in its shadow trees, and follow their
    scroll. The clip is the padding box, only in the axes that the overflow clips. Paint containment clips, and the
    hidden overflow of an inline element does not.
29. Live updates in a fixed-size host: added content, attribute changes, text changes, source resizes, a zero-size
    source that grows and a web font load all update the shapes. Text in the host reflows its shapes when only the host
    resizes.

### Lifecycle

30. A disconnect during the reveal clears the reveal timer, and raises no error when the timer would fire.
31. After a reconnect in the idle state, content changes start no measurement.
32. The `revealing` state ends on disconnect, and loading that ends while disconnected starts no reveal.
33. A move in the frame that loading starts still draws the shapes.
34. No measurement runs while disconnected.
35. Resizes start no measurement after loading ends.

### Not covered by the suite

- The visual output of each animation, and their suspension under `prefers-reduced-motion`.
- The colors in each theme and variant.
- Right-to-left layouts.

## Accessibility

### ARIA roles and properties

- The host has no role.
- The host has **aria-busy** set to `true` while loading and `false` otherwise, through `ElementInternals`.
- While loading, the content wrapper is `inert`, so the content is hidden from assistive technology and cannot be
  focused.
- The overlay and the shapes have **aria-hidden** set to `true`.

### Keyboard support

The component adds no keyboard support. See [Keyboard interactions](#keyboard-interactions).

### Right to Left support

The shapes are measured from the rendered layout, so they follow a right-to-left layout without extra setup.

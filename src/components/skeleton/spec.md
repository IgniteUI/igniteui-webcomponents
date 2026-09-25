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
    - [Accessibility](#accessibility-tests)
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

## Overview

The `igc-skeleton` component shows a placeholder for content that is still loading. It wraps the real content and,
while `loading` is set, hides that content and draws an animated shape over each of its visible parts. When loading
ends, the shapes go away and the content fades in.

The shapes come from the projected content itself, so the placeholder has the same layout as the content that
replaces it. No separate placeholder markup is necessary.

### Key features

- **Layout-matched placeholders**: one shape for each visible leaf element and each run of text next to elements.
- **Live measurement**: the shapes follow content changes, attribute changes and size changes while loading.
- **Five animations**: `pulse`, `breathe`, `shimmer`, `wave` and `glow`. All stop when the user prefers reduced motion.
- **Smooth reveal**: the content fades in when loading ends.
- **Themeable**: the colors come from the gray palette of the active theme and can be overridden.

### Acceptance criteria

- While loading, the content must be hidden, inert and unreachable with the keyboard.
- Each visible leaf element and each non-whitespace run of text next to elements must get a shape at its exact
  position and size.
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
| `--border-radius`               | Border radius applied to the overlay and shapes when the element has no explicit border-radius.    |

### Custom states

| State       | Description                                                          |
| ----------- | -------------------------------------------------------------------- |
| `revealing` | Set for 600ms after `loading` changes from `true` to `false`.        |

## Assumptions and limitations

- A shape source is a visible element with no child elements, or a non-whitespace text node whose parent has child
  elements or is the host. A custom element with no light DOM children counts as one leaf, whatever its shadow DOM
  contains. The box of an element with child elements gets no shape of its own, only its leaves and text runs do.
- Text runs get one shape for each line box. The text of a leaf element is covered by the shape of the element.
- A shape keeps the border radius of its source element. Text runs and elements with no radius use `--border-radius`,
  then a fallback derived from `--ig-radius-factor`.
- The shapes are positioned in the local coordinates of the host. A CSS transform on the host or on an ancestor
  (for example `scale()`) misaligns them.
- While loading, every attribute change in the content triggers a measurement, at most once for each animation frame.
  Content that changes attributes on each frame is measured on each frame.
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
7. No shapes render when not loading.

### `loading` property

8. `loading` reflects to its attribute.
9. Setting `loading` renders shapes, and clearing it removes them.
10. The `revealing` state is set when `loading` changes from `true` to `false`, and removed after 600ms.
11. The `revealing` state is not set when `loading` was never `true`.
12. Setting `loading` again during the reveal ends the `revealing` state at once.
13. `ariaBusy` follows `loading`.
14. A `::part(overlay)` rule sets the overlay opacity.

### `animation` property

15. Each animation name is applied as a part of every shape.
16. Changing `animation` replaces the part on the shapes.
17. The `wave` animation sets a `--_wave-delay` that grows in exact 0.1s steps. Other animations set none.

### Content projection

18. Slotted content is rendered.
19. Each leaf element gets exactly one shape.

### Measurement

20. The shapes align with their sources when the host has a border.
21. Each text run next to elements gets a shape, and whitespace-only text gets none.
22. Text projected directly into the host gets a shape.
23. Hidden and zero-size elements get no shape.
24. A shape keeps the border radius of its source, and falls back to the radius in the styles when the source has
    none.
25. Added content gets shapes while loading.
26. An attribute change that moves a source moves its shape.
27. A source that resizes inside a fixed-size host resizes its shape.

### Lifecycle

28. A disconnect during the reveal raises no error when the timer would fire.
29. After a reconnect in the idle state, content changes cause no update.
30. The `revealing` state ends on disconnect.

### Not covered by the suite

- The visual output of each animation, and their suspension under `prefers-reduced-motion`.
- The colors in each theme and variant.
- Right-to-left layouts and hosts that scroll.

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

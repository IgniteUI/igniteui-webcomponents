# igc-carousel

The carousel presents a set of slides by sequentially displaying a subset of one or more.

```ts
import { defineComponents, IgcCarouselComponent } from 'igniteui-webcomponents';

defineComponents(IgcCarouselComponent);
```

## Properties

- `disableLoop`: `boolean`. Default: `false`. Attribute: `disable-loop`, reflected.
  Whether the carousel stops at the first and the last slide instead of looping.
- `disablePauseOnInteraction`: `boolean`. Default: `false`. Attribute: `disable-pause-on-interaction`, reflected.
  Whether the carousel keeps playing when the user hovers over it or moves the
  focus into it.
- `hideNavigation`: `boolean`. Default: `false`. Attribute: `hide-navigation`, reflected.
  Whether the navigation buttons are hidden.
- `hideIndicators`: `boolean`. Default: `false`. Attribute: `hide-indicators`, reflected.
  Whether the indicator controls (dots) are hidden.
- `vertical`: `boolean`. Default: `false`. Attribute: `vertical`, reflected.
  Whether the carousel has vertical alignment.
- `indicatorsOrientation`: `'start' | 'end'`. Default: `'end'`. Attribute: `indicators-orientation`.
  The position of the indicator controls (dots).
- `indicatorsLabelFormat`. Attribute: `indicators-label-format`.
  The format of the `aria-label` of the carousel indicators.
  Each `{0}` changes to the number of the corresponding slide.
- `slidesLabelFormat`. Attribute: `slides-label-format`.
  The format of the `aria-label` of the carousel slides, and of the label that
  shows when the number of slides is greater than `maximumIndicatorsCount`.
  Each `{0}` changes to the number of the slide, and each `{1}` to the total number of slides.
- `interval`: `number | undefined`. Attribute: `interval`.
  The duration in milliseconds between changing the active slide.
  A positive value starts the automatic rotation.
- `maximumIndicatorsCount`: `number`. Default: `10`. Attribute: `maximum-indicators-count`.
  The maximum number of indicator controls (dots) that can be shown. With more slides,
  a label shows instead of the dots.
- `animationType`: `'slide' | 'fade' | 'none'`. Default: `'slide'`. Attribute: `animation-type`.
  The animation type.
- `slides`: `IgcCarouselSlideComponent[]`. Read-only. No attribute.
  The slides of the carousel.
- `total`: `number`. Read-only. No attribute.
  Total number of slides.
- `current`: `number`. Read-only. No attribute.
  The index of the current active slide.
- `isPlaying`: `boolean`. Read-only. No attribute.
  Whether the carousel is in playing state.
- `isPaused`: `boolean`. Read-only. No attribute.
  Whether the carousel is in paused state.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<ICarouselResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Methods

- `focus(options?: FocusOptions): void`
  Sets focus on the carousel.
- `blur(): void`
  Removes focus from the carousel.
- `play(): void`
  Resumes playing of the carousel slides.
- `pause(): void`
  Pauses the rotation of the carousel slides.
- `next(): Promise<boolean>`
  Switches to the next slide, runs any animations, and returns whether the operation
  was successful.
- `prev(): Promise<boolean>`
  Switches to the previous slide, runs any animations, and returns whether the operation
  was successful.
- `select(slide: IgcCarouselSlideComponent, animationDirection?: 'next' | 'prev'): Promise<boolean>`
  Switches to the passed-in slide, runs any animations, and returns whether the operation
  was successful.
- `select(index: number, animationDirection?: 'next' | 'prev'): Promise<boolean>`
  Switches to slide by index, runs any animations, and returns whether the operation
  was successful.
- `select(slideOrIndex: IgcCarouselSlideComponent | number, animationDirection?: 'next' | 'prev'): Promise<boolean>`
  Switches to the passed-in slide or to the slide at the given index, runs any animations,
  and returns whether the operation was successful.

## Events

- `igcSlideChanged`
  Emitted when the current active slide is changed either by user interaction or by the interval callback.
- `igcPlaying`
  Emitted when the carousel enters playing state by a user interaction.
- `igcPaused`
  Emitted when the carousel enters paused state by a user interaction.

## Slots

- default: The slides of the carousel.
- `indicator`: Renders the custom indicators of the carousel. An indicator element sets this slot itself.
- `previous-button`: Renders content inside the previous button.
- `next-button`: Renders content inside the next button.

## CSS parts

- `navigation`: The wrapper container of each carousel navigation button.
- `previous`: The wrapper container of the carousel previous navigation button.
- `next`: The wrapper container of the carousel next navigation button.
- `dot`: The carousel dot indicator container.
- `active`: The carousel active dot indicator container.
- `label`: The label container of the carousel indicators.
- `indicators`: The wrapper of the indicators, or of the label that replaces them.
- `start`: The wrapping container of all carousel indicators when indicators-orientation is set to start.
- `indicator`: Added to the two state wrappers of each default dot indicator, with `active` or `inactive`.
- `inactive`: The wrapper of the inactive state of each default dot indicator.

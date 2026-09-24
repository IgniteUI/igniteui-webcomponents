# Carousel specification

- [Carousel specification](#carousel-specification)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Terms](#terms)
    - [Key features](#key-features)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Basic initialization](#basic-initialization)
      - [Automatic rotation](#automatic-rotation)
      - [Programmatic navigation](#programmatic-navigation)
      - [Custom navigation and indicators](#custom-navigation-and-indicators)
      - [Behaviors](#behaviors)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Initialization](#initialization)
    - [Methods tests](#methods-tests)
    - [Slots tests](#slots-tests)
    - [Focus](#focus)
    - [Click](#click)
    - [Keyboard](#keyboard)
    - [Automatic rotation tests](#automatic-rotation-tests)
    - [Swipe](#swipe)
    - [Autoplay lifecycle](#autoplay-lifecycle)
    - [Slide and indicator integrity](#slide-and-indicator-integrity)
    - [Indicator container](#indicator-container)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

## Overview

The `igc-carousel` presents a set of items, called slides, by displaying one of them at a time. The user moves
through the set with the navigation buttons, with the indicator controls, with the keyboard or with a swipe, and
the carousel can also rotate the slides on its own. A slide may hold any content, although a carousel of images is
the common case.

```html
<igc-carousel interval="2000">
  <igc-carousel-slide>
    <img src="one.jpg" alt="" />
  </igc-carousel-slide>
  <igc-carousel-slide>
    <img src="two.jpg" alt="" />
  </igc-carousel-slide>
</igc-carousel>
```

### Terms

**Slide** — a single content container of the set, the `igc-carousel-slide` component.

**Next and previous slide controls** — the interactive elements, styled as arrows, that move the rotation one
slide forward or backward.

**Slide picker controls** — the group of elements, styled as dots, that pick a specific slide of the set. Each one
is an `igc-carousel-indicator`, and they live in an `igc-carousel-indicator-container`.

### Key features

- **Declarative slides** projected as children, with any content inside them.
- **Automatic rotation** on an interval, which pauses on user interaction and resumes afterwards.
- **Navigation buttons and slide indicators**, both of which can be hidden or given custom content.
- **Horizontal and vertical alignment**, which also decides the direction of the animation and of the swipe.
- **Slide, fade or no animation** between the slides.
- **Looping**, on by default and switchable off.
- **Touch swipe** support on touch-based devices.

### Acceptance criteria

- The carousel must show one `igc-carousel-slide` at a time and render the controls for moving through the set.
- The active slide must be settable from the markup and from code, and readable at any time.
- Automatic rotation must be controllable from code and must pause on user interaction unless that is turned off.
- The navigation and the indicators must be hideable, and their content must be replaceable.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- pause and resume the automatic rotation of the slides;
- move through the slides with the navigation controls;
- pick a specific slide with the indicator controls;
- move through the slides with the keyboard;
- swipe through the slides on a touch device;
- see which slide is the current one and how many there are in total.

### Developer stories

As a developer, I expect to be able to:

- declare the slides and their content;
- hide the default navigation controls, or give them custom content;
- show the slide picker controls, hide them, or project my own;
- align the carousel and its animation horizontally or vertically;
- set the interval between two slides and turn looping off;
- set the initial active slide and change the active slide from code;
- start and stop the rotation from code and read whether the carousel is playing or paused;
- be notified when the active slide changes and when the playing state changes;
- customize the labels announced for the slides and the indicators.

## Functionality

### End-user experience

The carousel renders the active slide, a previous and a next button on its sides, and the indicator dots at the
start or the end of its box. When the number of slides passes `maximumIndicatorsCount`, the dots are replaced by a
label with the position of the active slide in the set.

> [Design hand-off](https://www.figma.com/design/dFAHCCwg1Hrf6kB7aR3zZI/Carousel-Handoff?node-id=2091-7901&t=fA8TAoOmULxOHzZD-0)

### Developer experience

#### Basic initialization

Slides are projected in the default slot. Without an active slide the first one becomes active; with several, the
last one wins.

```html
<igc-carousel vertical animation-type="fade">
  <igc-carousel-slide active>...</igc-carousel-slide>
  <igc-carousel-slide>...</igc-carousel-slide>
</igc-carousel>
```

#### Automatic rotation

Setting `interval` starts the rotation. `play()` and `pause()` control it from code, while `isPlaying` and
`isPaused` report the state. Clearing the interval resets the playing state, and setting a new one restarts the
rotation of a paused carousel.

```ts
carousel.interval = 3000;
carousel.pause();
```

#### Programmatic navigation

`next()`, `prev()` and `select()` change the active slide and resolve once the animation has finished, with
whether the change happened. `select()` takes a slide or an index, and optionally the direction the animation
should run in.

```ts
await carousel.next();
await carousel.select(2, 'prev');
```

`current`, `total` and `slides` report the position, the count and the slide elements.

#### Custom navigation and indicators

The `previous-button` and `next-button` slots replace the content of the navigation buttons. Projecting
`igc-carousel-indicator` elements replaces the default dots; each indicator has its own default and `active` slots
for the two states. An indicator with no matching slide is not activated.

```html
<igc-carousel>
  <igc-icon slot="previous-button" name="arrow_back"></igc-icon>
  <igc-carousel-indicator>
    <span>○</span>
    <span slot="active">●</span>
  </igc-carousel-indicator>
  <igc-carousel-slide>...</igc-carousel-slide>
</igc-carousel>
```

#### Behaviors

- Unless `disablePauseOnInteraction` is set, any interaction with the carousel pauses a running rotation. This
  covers hover, pointer-initiated and keyboard-initiated focus, and focusing an interactive element inside a
  slide. The rotation resumes when the interaction ends, but an explicit `pause()` is kept.
- Swipe gestures are recognized on touch-based devices only, and follow the alignment: horizontal swipes in the
  default orientation, vertical ones while `vertical` is set.
- Removing the active slide moves the active state to another slide, and removing the last one leaves the
  carousel empty without throwing. A slide added to an empty carousel becomes the active one.
- Detaching the carousel stops the rotation, and re-attaching a playing one resumes it.

### Localization

The carousel takes its resource strings from the `igniteui-i18n-core` package through the `locale` and
`resourceStrings` properties. Without an explicit `locale`, it falls back to the global locale of the library.

| Key                       | Default English value | Used for                                         |
| ------------------------- | --------------------- | ------------------------------------------------ |
| `carousel_slide`          | slide                 | The default indicator label, as `slide {0}`.      |
| `carousel_of`             | of                    | The default slide label, as `{0} of {1}`.         |
| `carousel_previous_slide` | previous slide        | The label of the previous navigation button.      |
| `carousel_next_slide`     | next slide            | The label of the next navigation button.          |

The `indicatorsLabelFormat` and `slidesLabelFormat` properties override the two composed labels. `{0}` is replaced
with the index of the slide and `{1}` with the total number of slides.

### Keyboard interactions

The carousel has at most three tab stops: the previous button, the indicator container and the next button. The
indicator container is a single tab stop, and the arrow keys move between the indicators inside it.

| Keys                                    | Context             | Description                                                      |
| --------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd>     | navigation button   | Moves to the previous or the next slide.                          |
| <kbd>←</kbd>                            | indicator container | Moves to the previous indicator and activates its slide.          |
| <kbd>→</kbd>                            | indicator container | Moves to the next indicator and activates its slide.              |
| <kbd>Home</kbd>                         | indicator container | Moves to the first indicator and activates the first slide.       |
| <kbd>End</kbd>                          | indicator container | Moves to the last indicator and activates the last slide.         |

In a right-to-left context, <kbd>←</kbd> and <kbd>→</kbd> swap their meaning.

## API

### Properties and attributes

`igc-carousel`

| Property                    | Attribute                      | Reflected | Type                              | Default | Description                                                          |
| --------------------------- | ------------------------------ | --------- | --------------------------------- | ------- | -------------------------------------------------------------------- |
| `disableLoop`               | `disable-loop`                 | yes       | `boolean`                         | `false` | Whether to stop instead of rotating back to the first slide.          |
| `disablePauseOnInteraction` | `disable-pause-on-interaction` | yes       | `boolean`                         | `false` | Whether to ignore user interactions and keep rotating.                |
| `hideNavigation`            | `hide-navigation`              | yes       | `boolean`                         | `false` | Whether to skip rendering the navigation buttons.                     |
| `hideIndicators`            | `hide-indicators`              | yes       | `boolean`                         | `false` | Whether to skip rendering the indicator controls.                     |
| `vertical`                  | `vertical`                     | yes       | `boolean`                         | `false` | Whether the carousel is vertically aligned.                           |
| `indicatorsOrientation`     | `indicators-orientation`       | no        | `"start" \| "end"`                | `end`   | The position of the indicator controls.                               |
| `indicatorsLabelFormat`     | `indicators-label-format`      | no        | `string`                          | `slide {0}` | The format of the label of an indicator.                          |
| `slidesLabelFormat`         | `slides-label-format`          | no        | `string`                          | `{0} of {1}` | The format of the label of a slide and of the indicators label.  |
| `interval`                  | `interval`                     | no        | `number \| undefined`             | —       | The time in milliseconds between two slides.                          |
| `maximumIndicatorsCount`    | `maximum-indicators-count`     | no        | `number`                          | `10`    | Above this number of slides a label replaces the dots.                |
| `animationType`             | `animation-type`               | no        | `"slide" \| "fade" \| "none"`     | `slide` | The animation played when the active slide changes.                   |
| `slides`                    | —                              | —         | `IgcCarouselSlideComponent[]`     | —       | The slides of the carousel. Read-only.                                |
| `total`                     | —                              | —         | `number`                          | —       | The number of slides. Read-only.                                      |
| `current`                   | —                              | —         | `number`                          | —       | The index of the active slide. Read-only.                             |
| `isPlaying`                 | —                              | —         | `boolean`                         | —       | Whether the carousel is rotating. Read-only.                          |
| `isPaused`                  | —                              | —         | `boolean`                         | —       | Whether the carousel is paused. Read-only.                            |
| `locale`                    | `locale`                       | no        | `string`                          | —       | The locale of the resource strings.                                   |
| `resourceStrings`           | —                              | —         | `ICarouselResourceStrings`        | —       | The resource strings of the component.                                |

`igc-carousel-slide`

| Property   | Attribute  | Reflected | Type      | Default | Description                              |
| ---------- | ---------- | --------- | --------- | ------- | ---------------------------------------- |
| `active`   | `active`   | yes       | `boolean` | `false` | Whether the slide is the active one.      |
| `previous` | `previous` | yes       | `boolean` | `false` | Whether the slide was the previous one.   |

`igc-carousel-indicator`

| Property | Attribute | Reflected | Type      | Default | Description                                  |
| -------- | --------- | --------- | --------- | ------- | -------------------------------------------- |
| `active` | —         | —         | `boolean` | `false` | Whether the indicator is in its active state. |
| `index`  | —         | —         | `number`  | `0`     | The position of the indicator in the set.     |

### Methods

| Method   | Signature                                                                                   | Description                                                      |
| -------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `play`   | `(): void`                                                                                  | Resumes the rotation of the slides.                               |
| `pause`  | `(): void`                                                                                  | Pauses the rotation of the slides.                                |
| `next`   | `(): Promise<boolean>`                                                                      | Moves to the next slide and resolves with whether it happened.    |
| `prev`   | `(): Promise<boolean>`                                                                      | Moves to the previous slide and resolves with whether it happened. |
| `select` | `(slideOrIndex: IgcCarouselSlideComponent \| number, animationDirection?: 'next' \| 'prev'): Promise<boolean>` | Moves to the given slide. |

### Events

| Event             | Detail   | Cancelable | Description                                                                 |
| ----------------- | -------- | ---------- | --------------------------------------------------------------------------- |
| `igcSlideChanged` | `number` | no         | The active slide has changed, through interaction or through the interval.   |
| `igcPlaying`      | —        | no         | The carousel has entered its playing state through user interaction.         |
| `igcPaused`       | —        | no         | The carousel has entered its paused state through user interaction.          |

### Slots

| Component                | Name              | Description                                                                |
| ------------------------ | ----------------- | -------------------------------------------------------------------------- |
| `igc-carousel`           | default           | The slides of the carousel.                                                 |
| `igc-carousel`           | `indicator`       | The custom indicators. An indicator element assigns itself to this slot.     |
| `igc-carousel`           | `previous-button` | The content of the previous navigation button.                              |
| `igc-carousel`           | `next-button`     | The content of the next navigation button.                                  |
| `igc-carousel-slide`     | default           | The content of the slide.                                                   |
| `igc-carousel-indicator` | default           | The inactive state of the indicator.                                        |
| `igc-carousel-indicator` | `active`          | The active state of the indicator.                                          |

### CSS Shadow parts

`igc-carousel`

| Part         | Description                                                            |
| ------------ | ---------------------------------------------------------------------- |
| `navigation` | The wrapper of each navigation button.                                  |
| `previous`   | The wrapper of the previous navigation button.                          |
| `next`       | The wrapper of the next navigation button.                              |
| `dot`        | The container of a dot indicator.                                       |
| `active`     | The container of the active dot indicator.                              |
| `label`      | The label shown in place of the indicators.                             |
| `start`      | The wrapper of the indicators while `indicators-orientation` is `start`. |

`igc-carousel-indicator`

| Part        | Description                                     |
| ----------- | ----------------------------------------------- |
| `indicator` | The wrapper of the indicator.                    |
| `inactive`  | The wrapper of the inactive indicator.           |
| `active`    | The wrapper of the active indicator.             |

`igc-carousel-indicator-container` exposes a single `base` part, the wrapper of all indicators.

## Test scenarios

| Suite                         | File                                    |
| ----------------------------- | --------------------------------------- |
| `Carousel`                    | `carousel.spec.ts`                      |
| `Carousel Indicator Container`| `carousel-indicator-container.spec.ts`  |

### Initialization

1. The component passes the accessibility audit and is initialized with its default state.
2. The carousel, its slides and its controls render correctly, and a slide renders correctly in both its active
   and its inactive state.
3. `hideIndicators` and `hideNavigation` skip rendering the respective controls.
4. A label is rendered instead of the dots when the slides outnumber `maximumIndicatorsCount`, and is not
   rendered while `hideIndicators` is set.
5. The first slide becomes active when none is, and the last one wins when several are marked active.

### Methods tests

6. `play()` and `pause()` change the playing state.
7. `next()` and `prev()` move through the set.
8. `select()` moves to the passed slide.

### Slots tests

9. The `previous-button`, `next-button` and `indicator` slots accept projected content.

### Focus

10. The carousel delegates focus to the active indicator, and to the previous button when the indicator container
    is not rendered.

### Click

11. A click on the next button, on the previous button and on an indicator changes the active slide.
12. `igcSlideChanged` is emitted with the new index.

### Keyboard

13. <kbd>Enter</kbd> and <kbd>Space</kbd> on the navigation buttons move to the next and the previous slide.
14. <kbd>←</kbd>, <kbd>→</kbd>, <kbd>Home</kbd> and <kbd>End</kbd> on an indicator change the active slide, in
    both the left-to-right and the right-to-left direction.

### Automatic rotation tests

15. The slides change on their own once an interval is set, and each change emits `igcSlideChanged`.
16. The rotation pauses and resumes on `pointerenter` and `pointerleave`, and on keyboard interaction.
17. Focusing an interactive element inside a slide pauses the rotation.
18. With `disablePauseOnInteraction`, none of the interactions pause the rotation.

### Swipe

19. A swipe to the left and to the right moves to the next and the previous slide, and the two swap in a
    right-to-left context.
20. Horizontal swipes are ignored while `vertical` is set, and vertical swipes while it is not.
21. A swipe with the mouse does not change the slide.
22. A swipe emits `igcSlideChanged`.

### Autoplay lifecycle

23. Removing the carousel from the DOM stops the rotation, and re-attaching a playing one resumes it.
24. A paused carousel is not resumed by a pointer or a focus interaction.
25. Clearing the interval resets the playing state, and a new interval restarts a paused carousel.
26. An explicit pause is kept after the interaction ends, and the rotation stays paused when the interval changes
    during an interaction.
27. No timer is started while the carousel is detached, and none is left behind at the end stop of `disableLoop`.

### Slide and indicator integrity

28. Removing the active slide moves the active state, removing the last one activates the new last slide, and
    removing the only slide does not throw.
29. The carousel renders with fewer and with more projected indicators than slides, and an indicator with no
    slide is not activated.
30. A slide added to an empty carousel, and to one that was emptied, becomes the active slide.
31. A programmatic change after a key press that did nothing does not steal the focus.
32. `select()` before the first render does not throw.

### Indicator container

33. The container is initialized correctly, applies the `focused` part on `keyup` and removes it on click and on
    `focusout`, but keeps it when the focus moves to another `igc-carousel-indicator`.

### Not covered by the suite

- `animationType` is not asserted per value; the suite exercises the default `slide` animation.
- `indicatorsOrientation` and `vertical` are covered only indirectly, through the swipe and the rendering tests.
- The `locale` and `resourceStrings` properties are not covered; the labels are asserted against the default
  English values and the format properties.

## Assumptions and limitations

- The carousel is not virtualized. Every slide is rendered, and only the active one is shown.
- Swipe gestures are recognized on touch-based devices only; a mouse drag never changes the slide.
- The carousel does not adapt the number of visible slides; it always shows exactly one.
- The `igcSlideChanged`, `igcPlaying` and `igcPaused` events are notifications and cannot be canceled.
- `igcPlaying` and `igcPaused` are emitted for user interaction only, not for the `play()` and `pause()` calls.

## Accessibility

### ARIA roles and properties

- The carousel has `role="region"` and `aria-roledescription="carousel"`.
- A slide has `role="tabpanel"`, `aria-roledescription="slide"` and a label composed from `slidesLabelFormat`.
- The indicator container has `role="tablist"`, and each indicator has `role="tab"`, `aria-selected` for its
  state, `aria-controls` pointing at its slide and a label composed from `indicatorsLabelFormat`.
- The navigation buttons carry the localized previous and next labels and control the slides container.
- The slides container is an `aria-live` region, polite while the carousel is not rotating and off while it is,
  so that an automatic rotation is not announced.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The animation, the
swipe direction and the arrow keys are mirrored.

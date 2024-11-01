# Tooltip specification

- [Tooltip specification](#tooltip-specification)
  - [Owned By](#owned-by)
    - [Requires approval from:](#requires-approval-from)
    - [Signed off by:](#signed-off-by)
    - [Revision history](#revision-history)
  - [Overview](#overview)
  - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Behaviors](#behaviors)
    - [Localization](#localization)
    - [Keyboard navigation](#keyboard-navigation)
  - [API](#api)
    - [IgcTooltipComponent](#igctooltipcomponent)
      - [Properties](#properties)
      - [Methods](#methods)
      - [Events](#events)
      - [Slots](#slots)
      - [CSS Shadow Parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Automation](#automation)
      - [Rendering and initialization](#rendering-and-initialization)
      - [Attributes and properties](#attributes-and-properties)
      - [Behaviors](#behaviors-1)
  - [Accessibility](#accessibility)
    - [ARIA](#aria)
      - [IgcCarouselComponent intrinsic ARIA properties](#igccarouselcomponent-intrinsic-aria-properties)
      - [IgcCarouselSlideComponent intrinsic ARIA properties](#igccarouselslidecomponent-intrinsic-aria-properties)
      - [IgcCarouselIndicatorComponent intrinsic ARIA properties](#igccarouselindicatorcomponent-intrinsic-aria-properties)
      - [References](#references)
    - [RTL](#rtl)
  - [Assumptions and limitations](#assumptions-and-limitations)

## Owned By

**Team Name**: Web Tools

**Developer name**: Radoslav Karaivanov

**Designer name**:

### Requires approval from:

- [ ] Damyan Petev
- [ ] Svilen Dimchevski

### Signed off by:

- [ ] Simeon Simeonov
- [ ] Radoslav Mirchev

### Revision history

| Version | Author              | Date       | Notes         |
| ------: | ------------------- | ---------- | ------------- |
|       - | Radoslav Karaivanov | 2024-06-10 | Initial draft |

## Overview

An `igc-tooltip` component

## Acceptance criteria

The `igc-tooltip` must:

## User stories

### End-user stories

As an end-user I expect to be able to:

- pause/resume automatic rotation of the slides in the carousel.
- navigate through the set of slides via the rendered slide controls.
- navigate through the set of slides via the rendered slide indicator controls.
- navigate through the set of slides via keyboard interaction.
- have an indication of the current active slide and/or the total number of slides.

### Developer stories

As a developer I expect to be able to:

- declaratively provide the slides which will be displayed in the carousel component.
- declaratively provide the content of the slides.
- have default navigation controls as well as the ability to hide said controls.
- show additional slide picker control (dots) where the user can pick and show a specific slide from the set.
- align the carousel navigation/indicators as well as the direction of the slide animation either horizontally or vertically.
- control the default time interval between switching the current active slide.
- enable/disable looping of the slides.
- set initial active slide.
- programmatically control which slide should be shown.
- programmatically control the state of the carousel (playing/paused).
- customize the look and feel of the navigation buttons and the slides picker control

## Functionality

### End-user experience

> Design Handoff

### Behaviors

### Localization

No specific implementation is needed.

### Keyboard navigation

Following the [current WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) patterns, the tooltip
will be dismissed when the user presses the <kbd>Escape</kbd> key.

## API

### IgcTooltipComponent

#### Properties

| Property    | Attribute    | Reflected | Type    | Default | Description                                                                         |
| ----------- | ------------ | --------- | ------- | ------- | ----------------------------------------------------------------------------------- |
| disableLoop | disable-loop | Yes       | Boolean | false   | Whether the carousel should loop back to the first slide after it reaches the last. |

#### Methods

| Name   | Type signature                                                              | Description                                                                                       |
| ------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| play   | `(): void`                                                                  | Resumes playing of the carousel slides.                                                           |
| pause  | `(): void`                                                                  | Pauses the carousel rotation of slides.                                                           |
| next   | `(): Promise<boolean>`                                                      | Switches to the next slide running any animations and returns if the operation was a success.     |
| prev   | `(): Promise<boolean>`                                                      | Switches to the previous slide running any animations and returns if the operation was a success. |
| select | `(slide: IgcCarouselSlide, direction?: 'next' \| 'prev'): Promise<boolean>` | Switches the passed in slide running any animations and returns if the operation was a success.   |

#### Events

| Name            | Cancellable | Description                                                                                              |
| --------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| igcSlideChanged | No          | Emitted when the current active slide is changed either by user interaction or by the interval callback. |
| igcPlaying      | No          | Emitted when the carousel enters playing state by a user interaction.                                    |
| igcPaused       | No          | Emitted when the carousel enters paused state by a user interaction.                                     |

#### Slots

| Name            | Description                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| default         | Default slot for the carousel. Any projected `igc-carousel-slide` components should be projected here. |
| previous-button | Renders content inside the carousel previous navigation button.                                        |
| next-button     | Renders content inside the carousel next navigation button.                                            |

#### CSS Shadow Parts

| Part       | Description                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------- |
| navigation | The wrapper container of each carousel navigation button.                                      |
| previous   | The wrapper container of the carousel previous navigation button.                              |
| next       | The wrapper container of the carousel next navigation button.                                  |
| dot        | The carousel dot indicator container.                                                          |
| active     | The carousel active dot indicator container.                                                   |
| label      | The label container of the carousel indicators.                                                |
| start      | The wrapping container of all carousel indicators when indicators-orientation is set to start. |

## Test scenarios

### Automation

#### Rendering and initialization

- passes the default WAI-ARIA automation.
- is initialized without errors.
- is initialized with appropriate default state.
- is initialized with projected slides.
- should set the first slide as active if none are initially active.
- should set the active slide to be the last one if there are multiple active on initialization.
- should correctly slot user provided content in previous/next button slots.
- should correctly slot user provided content for indicators.

#### Attributes and properties

- should not render indicators if `hideIndicators` is set.
- should not render navigation buttons if `hideNavigation` is set.
- should render a label in the indicators container if the slide count is greater than `maximumIndicatorsCount`.
- should not render a label in the indicators container if the slide count is greater than `maximumIndicatorsCount` and `hideIndicators` is set.
- invoking `prev()` works.
- invoking `next()` works.
- invoking `select()` works.

#### Behaviors

- it should change the active slide when clicking on the next slide button.
- it should change the active slide when clicking on the previous slide button.
- it should change the active slide when clicking on a given indicator.
- it should change the active slide when pressing SpaceBar/Enter on the next slide button.
- it should change the active slide when pressing SpaceBar/Enter on the next previous button.
- it should change the active slide when pressing ArrowLeft/ArrowRight on an indicator.
- it should change the active slide when pressing Home/End on an indicator.
- it should change the active slide when swiping in the context of a touch-based device, both horizontally and vertically.
- it should not change the active slide when swiping in the context of a non-touch-based device, both horizontally and vertically.
- it should pause automatic rotation on a hover when `disablePauseOnInteraction` is not set.
- it should not pause automatic rotation on a hover when `disablePauseOnInteraction` is set.
- it should pause automatic rotation on a keyboard interaction when `disablePauseOnInteraction` is not set.
- it should not pause automatic rotation on a keyboard interaction when `disablePauseOnInteraction` is set.

## Accessibility

### ARIA

#### IgcCarouselComponent intrinsic ARIA properties

**role**: region

**aria-roledescription**: carousel

---

#### IgcCarouselSlideComponent intrinsic ARIA properties

**role**: tabpanel

**aria-roledescription**: slide

**aria-label**: The formatted value from `slidesLabelFormat`. By default that is: _{Index of slide} of {Total slides}_

---

#### IgcCarouselIndicatorComponent intrinsic ARIA properties

**role**: tab

**aria-label**: The formatted value of `indicatorsLabelFormat`. By default that is: _Slide {index of corresponding slide}_

---

#### References

https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/carousel-1-prev-next/

https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/carousel-2-tablist/?moreaccessible=false

### RTL

The component should work in a Right-To-Left context without additional setup or configuration.

## Assumptions and limitations

None applicable.

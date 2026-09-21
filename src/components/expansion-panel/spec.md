# Expansion panel specification

- [Expansion panel specification](#expansion-panel-specification)
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
      - [Header content](#header-content)
      - [The indicator](#the-indicator)
      - [Programmatic control](#programmatic-control)
      - [Disabled state](#disabled-state)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [DOM structure](#dom-structure)
    - [Indicator slots](#indicator-slots)
    - [Properties](#properties)
    - [Methods tests](#methods-tests)
    - [User interactions](#user-interactions)
    - [Events tests](#events-tests)
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

The `igc-expansion-panel` displays information in a toggleable way: a compact summary view with a title and a
description, and an expanded detail view with additional content below the header.

Several panels can be grouped into an [`igc-accordion`](../accordion/spec.md), which adds keyboard navigation across
them and an optional single expansion behavior.

### Key features

- **Structured header**: a title, a subtitle and an expansion indicator.
- **Positionable indicator**: at the start, at the end, or hidden.
- **Separate indicator states**: different content for the collapsed and the expanded indicator.
- **Animated transitions** on expand and collapse.
- **Cancelable events** before opening and before closing.
- **Disabled state** that takes the panel out of user interaction.

### Acceptance criteria

- The panel must render a header with a title and a subtitle, and a content area below it.
- Activating the header must toggle the panel with an animation.
- The indicator must be placeable at the start or the end, or hidden entirely.
- The indicator must be replaceable, with separate content for the expanded state.
- The panel must emit cancelable events before opening and before closing, and completion events afterwards.
- A disabled panel must be ignored for user interaction.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a compact summary of a section, and expand it when I want the details.
- collapse the section again when I am done with it.
- see an indicator that tells me whether the section is expanded.
- expand and collapse the section from the keyboard.
- recognize a section that is unavailable to me.

### Developer stories

As a developer, I expect to be able to:

- show a title and a subtitle in the header of the panel.
- put arbitrary content in the expanded area.
- position the indicator, replace it, and give the expanded state its own indicator.
- expand and collapse the panel programmatically.
- cancel an expansion or a collapse before it happens.
- disable the panel.

## Functionality

### End-user experience

[Design hand-off](https://www.figma.com/file/GjfbpwcQ1Gh1XEsNwmhHMG/Expansion-Panel?node-id=0%3A1)

The panel renders its header with the title, the subtitle and the indicator. Activating the header expands the
panel, animating the content into view and rotating or replacing the indicator. Activating it again collapses the
panel.

### Developer experience

#### Basic initialization

```html
<igc-expansion-panel>
  <span slot="title">Shipping information</span>
  <span slot="subtitle">Delivery in 3-5 days</span>

  <p>The detailed content of the panel.</p>
</igc-expansion-panel>
```

#### Header content

The `title` and `subtitle` slots make up the summary view. Any other content goes in the default slot and is shown
only while the panel is expanded.

#### The indicator

```html
<!-- Position it, or remove it entirely -->
<igc-expansion-panel indicator-position="end">...</igc-expansion-panel>
<igc-expansion-panel indicator-position="none">...</igc-expansion-panel>

<!-- Replace it, with a separate expanded state -->
<igc-expansion-panel>
  <igc-icon slot="indicator" name="chevron_right"></igc-icon>
  <igc-icon slot="indicator-expanded" name="expand_more"></igc-icon>
  <span slot="title">Custom indicator</span>
</igc-expansion-panel>
```

#### Programmatic control

```typescript
const panel = document.querySelector('igc-expansion-panel')!;

panel.show();
panel.hide();
panel.toggle();
```

Setting the `open` property changes the state as well.

#### Disabled state

```html
<igc-expansion-panel disabled>...</igc-expansion-panel>
```

A disabled panel is ignored for user interaction, and is skipped by the keyboard navigation of an accordion.

### Localization

The component renders no strings of its own; the header and content come from the application.

### Keyboard interactions

The keys apply while the header of the panel has focus.

| Key combination                        | Result                           |
| -------------------------------------- | -------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd>    | Toggles the panel.               |
| <kbd>Alt</kbd> + <kbd>Arrow Down</kbd> | Expands the panel.               |
| <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>   | Collapses the panel.             |

## API

### Properties and attributes

| Property          | Attribute          | Reflected | Type                                | Default | Description                                                 |
| ----------------- | ------------------ | --------- | ----------------------------------- | ------- | ------------------------------------------------------------- |
| open              | open               | Yes       | `boolean`                           | false   | Indicates whether the contents of the control are visible.  |
| disabled          | disabled           | Yes       | `boolean`                           | false   | Whether the panel is disabled. Disabled panels are ignored for user interactions. |
| indicatorPosition | indicator-position | Yes       | `ExpansionPanelIndicatorPosition`   | `start` | The indicator position of the expansion panel.              |

### Methods

| Name   | Type signature | Description                          |
| ------ | -------------- | ------------------------------------ |
| show   | `(): void`     | Shows the panel content.             |
| hide   | `(): void`     | Hides the panel content.             |
| toggle | `(): void`     | Toggles the open state of the panel. |

### Events

| Name       | Cancellable | Description                                  |
| ---------- | ----------- | -------------------------------------------- |
| igcOpening | true        | Emitted before opening the expansion panel.  |
| igcOpened  | false       | Emitted after the expansion panel is opened. |
| igcClosing | true        | Emitted before closing the expansion panel.  |
| igcClosed  | false       | Emitted after the expansion panel is closed. |

### Slots

| Name                 | Description                                        |
| -------------------- | -------------------------------------------------- |
| (default)            | Renders the default content of the panel.          |
| `title`              | Renders the title of the panel header.             |
| `subtitle`           | Renders the subtitle of the panel header.          |
| `indicator`          | Renders the expand/collapse indicator.             |
| `indicator-expanded` | Renders the expanded state of the indicator.       |

### CSS Shadow parts

| Part        | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `header`    | The container of the expansion indicator, title and subtitle.  |
| `title`     | The title container.                                           |
| `subtitle`  | The subtitle container.                                        |
| `indicator` | The indicator container.                                       |
| `content`   | The content wrapper of the expansion panel.                    |

## Test scenarios

The suite lives in [`expansion-panel.spec.ts`](./expansion-panel.spec.ts) and runs in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### DOM structure

1. The component renders its header, title, subtitle, indicator and content, and passes the accessibility audit.
2. The content area is hidden while the panel is collapsed.

### Indicator slots

3. The `indicator` slot replaces the default indicator.
4. The `indicator-expanded` slot is rendered while the panel is expanded.

### Properties

5. `open` reflects and shows or hides the content.
6. `disabled` is reflected and takes the panel out of user interaction.
7. `indicatorPosition` places the indicator at the start, at the end, or removes it.

### Methods tests

8. `show`, `hide` and `toggle` change the open state.

### User interactions

9. Activating the header toggles the panel.
10. The keyboard shortcuts expand, collapse and toggle the panel.
11. A disabled panel does not react to pointer or keyboard interaction.

### Events tests

12. `igcOpening` and `igcClosing` are emitted before the transition and can be canceled.
13. `igcOpened` and `igcClosed` are emitted after the transition.
14. No events are emitted for a programmatic change through the `open` property.

## Assumptions and limitations

- The panel animates its content; the methods do not resolve on the animation, unlike the bulk methods of the
  accordion.
- The summary view always renders; only the default slot content is toggled.
- Grouping several panels and navigating between them is the job of [`igc-accordion`](../accordion/spec.md).

## Accessibility

### ARIA roles and properties

- The header is a button that exposes the expanded state and controls the content region.
- The content region is labelled by the header, so assistive technology announces what has been expanded.
- A disabled panel exposes its disabled state and is not focusable.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The indicator position
follows the inline direction.

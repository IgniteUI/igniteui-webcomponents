# Visually hidden specification

- [Visually hidden specification](#visually-hidden-specification)
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
      - [Hiding a label](#hiding-a-label)
      - [A skip link](#a-skip-link)
      - [Naming an icon-only control](#naming-an-icon-only-control)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Default](#default)
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

The `igc-visually-hidden` hides its content from the screen while keeping it available to assistive technology.
The content becomes visible again while the focus is inside it, which is what makes it suitable for skip links.

The component has no wiki page; this specification is written from the implementation.

```html
<igc-visually-hidden>
  <a href="#main-content">Skip to main content</a>
</igc-visually-hidden>
```

### Key features

- **Off-screen without being hidden**: the content stays in the accessibility tree, unlike `display: none` or
  `visibility: hidden`.
- **Visible on focus**, so that a keyboard user sees what they have reached.
- **No layout impact** while it is hidden.

### Acceptance criteria

- The content must not be visible and must not take part in the layout while nothing inside it has focus.
- The content must remain readable by assistive technology at all times.
- The content must become visible while the focus is inside the component.
- The element must project arbitrary content.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- hear the context a screen reader needs, without that text cluttering the screen;
- see a skip link once I reach it with the keyboard.

### Developer stories

As a developer, I expect to be able to:

- keep a label available to assistive technology while the design shows only an icon;
- add a skip navigation link that appears when it is focused;
- add extra context to a control without changing how it looks.

## Functionality

### End-user experience

Nothing of the content is visible or occupies space until something inside it takes focus, at which point it is
rendered in place. A screen reader reads the content either way.

### Developer experience

#### Hiding a label

```html
<igc-visually-hidden>
  <label for="search">Search</label>
</igc-visually-hidden>
<input id="search" type="search" placeholder="Search..." />
```

#### A skip link

```html
<igc-visually-hidden>
  <a href="#main-content">Skip to main content</a>
</igc-visually-hidden>
```

#### Naming an icon-only control

```html
<button>
  <igc-icon name="close"></igc-icon>
  <igc-visually-hidden>Close dialog</igc-visually-hidden>
</button>
```

### Localization

The component has no resource strings. The projected content comes from the application and is what gets
localized.

### Keyboard interactions

The component implements no keyboard handling. Focusable content projected into it is reached with
<kbd>Tab</kbd> as usual, and the component becomes visible for as long as the focus is inside it.

## API

### Properties and attributes

None. The component is configured entirely by what is projected into it.

### Methods

None applicable.

### Events

None applicable.

### Slots

| Name    | Description                              |
| ------- | ---------------------------------------- |
| default | The content to hide visually.             |

### CSS Shadow parts

None applicable.

## Test scenarios

| Suite            | File                      |
| ---------------- | ------------------------- |
| `VisuallyHidden` | `visually-hidden.spec.ts` |

### Default

1. The component passes the accessibility audit.
2. Projected content is rendered, and a slot element is present in the shadow root.
3. The content is hidden from the visual layout while nothing inside has focus.
4. The content becomes visible while the focus is inside the component.

### Not covered by the suite

- Returning to the hidden state after the focus leaves is not asserted separately.

## Assumptions and limitations

- The component hides its content with the standard clipping technique, so the content is still rendered and still
  costs layout work; it is not a replacement for not rendering something at all.
- The visible-on-focus behavior depends on `:focus-within`, so it applies only when the projected content is
  focusable.
- The component has no API of its own; everything is controlled through what is projected into it.

## Accessibility

### ARIA roles and properties

The component applies no roles or ARIA properties. Its whole purpose is to keep the projected content in the
accessibility tree unchanged while removing it from the visual one.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

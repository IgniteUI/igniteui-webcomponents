# Ripple specification

- [Ripple specification](#ripple-specification)
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
      - [Styling the ripple](#styling-the-ripple)
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

The `igc-ripple` gives an element the ripple effect of an interactive surface. It is placed inside the element it
decorates, fills it, and plays an expanding, fading circle from the point of the pointer press.

```html
<div style="position: relative">
  <igc-ripple></igc-ripple>
  Interactive surface
</div>
```

### Key features

- **A press ripple** that starts at the position of the pointer.
- **Primary button only**, so a secondary or middle click does not play it.
- **Self-cleaning**: the element created for the animation is removed when the animation finishes.

### Acceptance criteria

- The ripple must play from the position of the pointer press.
- It must cover the element it decorates.
- It must ignore anything but the primary pointer button.
- It must leave no elements behind after the animation.
- The element must be integrated and themeable with the theming mechanism of the library.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see the surface react where I pressed it, so that I know the press registered.

### Developer stories

As a developer, I expect to be able to:

- add the ripple effect to an element without writing the animation;
- keep the effect out of the way of the content of that element.

## Functionality

### End-user experience

Pressing the surface plays a circle that grows from the point of the press and fades out. The wiki page of the
component carries no design hand-off link.

### Developer experience

#### Basic initialization

The ripple is placed inside a positioned element, which it fills.

```html
<button style="position: relative">
  <igc-ripple></igc-ripple>
  Press me
</button>
```

The components of the library that use a ripple render one themselves; the element is there for surfaces the
application builds.

#### Styling the ripple

The duration, the easing and the color of the ripple come from the styles of the component and from the active
theme, rather than from properties.

### Localization

None applicable.

### Keyboard interactions

None applicable. The ripple reacts to a pointer press only and is not part of the tab order.

## API

### Properties and attributes

None. The component is configured through its styles alone.

### Methods

None applicable.

### Events

None applicable.

### Slots

None applicable.

### CSS Shadow parts

None applicable.

## Test scenarios

| Suite    | File             |
| -------- | ---------------- |
| `Ripple` | `ripple.spec.ts` |

### Default

1. The DOM state is correct before and after the ripple animation, so the animation element is created and then
   cleaned up.
2. No ripple is played for a non-primary pointer button.

### Not covered by the suite

- The position of the ripple relative to the press, and the geometry it is given, are not asserted.
- The accessibility audit is not run for this component.

## Assumptions and limitations

- The ripple fills the element it is placed in, which therefore has to establish a positioning context.
- The effect is triggered by a pointer press only; there is no keyboard-activated ripple.
- The component has no API: the effect cannot be played, stopped or configured from code.
- Only the primary pointer button plays the ripple.

## Accessibility

### ARIA roles and properties

The component is purely decorative and applies no roles or ARIA properties. It renders nothing that assistive
technology needs to announce, and the semantics belong to the surface it decorates.

### Keyboard support

Not applicable; the component is not interactive.

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

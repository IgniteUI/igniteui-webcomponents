# Navigation bar specification

- [Navigation bar specification](#navigation-bar-specification)
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
      - [Start and end content](#start-and-end-content)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Rendering](#rendering)
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

The `igc-navbar` facilitates navigation through a series of hierarchical screens within an application. It renders a
bar with three areas: leading icons, a title, and trailing action icons.

The component is a layout container. It holds no navigation logic and emits no events; the application supplies the
content of each area and handles the interaction.

### Key features

- **Three content areas**: a start area for leading icons, a middle area for the title, and an end area for actions.
- **Themeable** through shadow parts for each area.

### Acceptance criteria

- The component must render a title and the leading and trailing content projected into it.
- Each area must be individually styleable through a shadow part.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to:

- see where I am in the application from the title in the bar.
- reach the navigation and the actions of the current screen from a consistent place.

### Developer stories

As a developer, I expect to be able to:

- render a title for the current screen.
- place navigation icons before the title.
- place action icons after the title.
- style each area of the bar independently.

## Functionality

### End-user experience

The bar renders across the top of the screen with the leading icons, the title and the trailing actions laid out in
a row.

### Developer experience

#### Basic initialization

```html
<igc-navbar>Inbox</igc-navbar>
```

#### Start and end content

```html
<igc-navbar>
  <igc-icon slot="start" name="menu"></igc-icon>
  Inbox
  <igc-icon-button slot="end" name="search"></igc-icon-button>
  <igc-icon-button slot="end" name="more"></igc-icon-button>
</igc-navbar>
```

### Localization

The component renders no strings of its own; the title and the action labels come from the application.

### Keyboard interactions

None of its own. The projected content keeps its native keyboard behavior.

## API

### Properties and attributes

None applicable.

### Methods

None applicable.

### Events

None applicable.

### Slots

| Name      | Description                              |
| --------- | ---------------------------------------- |
| (default) | Renders a title inside the default slot. |
| `start`   | Renders left aligned icons.              |
| `end`     | Renders right aligned action icons.      |

### CSS Shadow parts

| Part     | Description                            |
| -------- | -------------------------------------- |
| `base`   | The base wrapper of the navigation bar. |
| `start`  | The left aligned icon container.       |
| `middle` | The navigation bar title container.    |
| `end`    | The right aligned action icons container. |

## Test scenarios

The suite lives in [`navbar.spec.ts`](./navbar.spec.ts) and runs in a real browser through `@web/test-runner` with
`@open-wc/testing` fixtures and assertions.

### Rendering

1. The component renders its default structure and passes the accessibility audit.
2. Content projected into the default, `start` and `end` slots is rendered in the corresponding containers.

## Assumptions and limitations

- The component is a layout container only: it holds no navigation state, emits no events and takes no properties.
- Making the bar sticky or fixed is left to the application stylesheet.

## Accessibility

### ARIA roles and properties

- The bar is a presentational container. Wrap it in a landmark, such as `header` or `nav`, when the structure of the
  page calls for one.
- The projected icons and buttons keep their own semantics and need accessible names from the application.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The start and end areas
follow the inline direction.

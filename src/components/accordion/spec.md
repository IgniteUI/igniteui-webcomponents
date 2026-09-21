# Accordion specification

- [Accordion specification](#accordion-specification)
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
      - [Single expand](#single-expand)
      - [Programmatic control](#programmatic-control)
      - [Nesting](#nesting)
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
    - [Expand and collapse](#expand-and-collapse)
    - [Keyboard navigation](#keyboard-navigation)
    - [Nested](#nested)
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

The `igc-accordion` is a container that houses multiple [`igc-expansion-panel`](../expansion-panel/spec.md)
components and adds keyboard navigation across them. It optionally enforces that only one panel is expanded at a
time.

### Key features

- **Single or multiple expansion**: either one panel at a time, or any number of them.
- **Keyboard navigation** across the panel headers, including jumping to the first and the last.
- **Bulk control**: expand or collapse every child panel with one call.
- **Nesting**: an accordion can live inside a panel of another accordion, and each one navigates independently.

### Acceptance criteria

- The accordion must render its projected expansion panels and navigate between them with the keyboard.
- With single expansion enabled, expanding a panel must collapse the previously expanded one.
- With single expansion disabled, any number of panels may be expanded at the same time.
- The accordion must expose methods to expand and collapse all of its panels.
- Only the direct panel children must be treated as members, so nested accordions do not interfere.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- expand a section to read its content, and collapse it again.
- have the previously expanded section close when the accordion allows only one at a time.
- move between the section headers with the keyboard, and jump to the first and the last.
- expand and collapse a section from the keyboard.

### Developer stories

As a developer, I expect to be able to:

- group several expansion panels into one navigable container.
- allow only one panel to be expanded at a time, or several.
- expand or collapse all the panels at once.
- nest an accordion inside a panel without the two interfering.
- react to the expansion changes of the individual panels.

## Functionality

### End-user experience

[Design hand-off in Figma with all themes and a prototype](https://www.figma.com/file/lt6YDm7XAej47YwfFXAzYJ/Accordion?node-id=0%3A1)

[Single expand prototype](https://www.figma.com/proto/lt6YDm7XAej47YwfFXAzYJ/Accordion?node-id=2%3A3802&scaling=min-zoom&page-id=2%3A2955&starting-point-node-id=2%3A3802&show-proto-sidebar=1)

[Multiple expand prototype](https://www.figma.com/proto/lt6YDm7XAej47YwfFXAzYJ/Accordion?node-id=2%3A3329&scaling=min-zoom&page-id=2%3A2955&starting-point-node-id=2%3A3329&show-proto-sidebar=1)

The accordion stacks its panels vertically. Each panel shows its header, and activating a header expands the panel
with an animation, revealing its content and pushing the panels below it down. With single expansion enabled, the
previously expanded panel collapses at the same time.

### Developer experience

#### Basic initialization

```html
<igc-accordion>
  <igc-expansion-panel>
    <span slot="title">First section</span>
    <p>Content of the first section.</p>
  </igc-expansion-panel>

  <igc-expansion-panel>
    <span slot="title">Second section</span>
    <p>Content of the second section.</p>
  </igc-expansion-panel>
</igc-accordion>
```

#### Single expand

```html
<igc-accordion single-expand>...</igc-accordion>
```

Expanding a collapsed panel collapses the currently expanded one. Without the property, any number of panels can be
expanded together, and only explicit user interaction or the API changes their state.

#### Programmatic control

```typescript
const accordion = document.querySelector('igc-accordion')!;

await accordion.showAll();
await accordion.hideAll();

const panels = accordion.panels; // the direct expansion panel children
```

Both methods resolve once the animations of the panels have completed.

#### Nesting

```html
<igc-accordion>
  <igc-expansion-panel>
    <span slot="title">Outer</span>
    <igc-accordion>
      <igc-expansion-panel>
        <span slot="title">Inner</span>
      </igc-expansion-panel>
    </igc-accordion>
  </igc-expansion-panel>
</igc-accordion>
```

Only the direct panel children belong to an accordion, so a nested accordion keeps its own navigation and its own
single expansion behavior.

### Localization

The component renders no strings of its own; the panel content comes from the application.

### Keyboard interactions

The keys apply while a panel header inside the accordion has focus.

| Key combination                                  | Result                                                |
| ------------------------------------------------ | ------------------------------------------------------- |
| <kbd>Arrow Down</kbd>                            | Moves focus to the header of the next panel.          |
| <kbd>Arrow Up</kbd>                              | Moves focus to the header of the previous panel.      |
| <kbd>Home</kbd>                                  | Moves focus to the header of the first panel.         |
| <kbd>End</kbd>                                   | Moves focus to the header of the last panel.          |
| <kbd>Alt</kbd> + <kbd>Arrow Down</kbd>           | Expands the focused panel.                            |
| <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>             | Collapses the focused panel.                          |
| <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>Arrow Down</kbd> | Expands every panel, unless single expand is on. |
| <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>Arrow Up</kbd>   | Collapses every panel.                        |

Disabled panels are skipped by the navigation.

## API

### Properties and attributes

| Property     | Attribute     | Reflected | Type                             | Default | Description                                            |
| ------------ | ------------- | --------- | -------------------------------- | ------- | -------------------------------------------------------- |
| singleExpand | single-expand | Yes       | `boolean`                        | false   | Allows only one panel to be expanded at a time.        |
| panels       | -             | No        | `IgcExpansionPanelComponent[]`   | -       | Read-only. All direct expansion panel children.        |

### Methods

| Name     | Type signature        | Description                                          |
| -------- | --------------------- | ---------------------------------------------------- |
| showAll  | `(): Promise<void>`   | Shows the content of all child expansion panels.     |
| hideAll  | `(): Promise<void>`   | Hides the content of all child expansion panels.     |

### Events

None applicable. Listen for the `igcOpening`, `igcOpened`, `igcClosing` and `igcClosed` events of the individual
[expansion panels](../expansion-panel/spec.md#events), which bubble through the accordion.

### Slots

| Name      | Description                                       |
| --------- | ------------------------------------------------- |
| (default) | Renders the expansion panels inside default slot. |

### CSS Shadow parts

None applicable. Style the panels through their own parts.

## Test scenarios

The suite lives in [`accordion.spec.ts`](./accordion.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### Default

1. The component is initialized with its default state, renders its panels and passes the accessibility audit.
2. `panels` returns the direct expansion panel children.

### Expand and collapse

3. Expanding a panel with `singleExpand` collapses the previously expanded one.
4. Without `singleExpand`, several panels stay expanded together.
5. `showAll` and `hideAll` expand and collapse every panel and resolve after the animations.
6. Disabled panels are not affected by the user interaction.

### Keyboard navigation

7. The arrow keys move focus between the panel headers, and <kbd>Home</kbd> and <kbd>End</kbd> jump to the first and
   the last.
8. <kbd>Alt</kbd> with the arrow keys expands and collapses the focused panel.
9. <kbd>Shift</kbd> + <kbd>Alt</kbd> with the arrow keys expands and collapses every panel.
10. Disabled panels are skipped by the navigation.

### Nested

11. A nested accordion keeps its own navigation and single expansion behavior, and does not affect the outer one.

## Assumptions and limitations

- Only direct `igc-expansion-panel` children are members of the accordion.
- The accordion has no expansion events of its own; the panels emit them.
- The accordion does not persist which panels were expanded.

## Accessibility

### ARIA roles and properties

- The accordion is a container; the header and region semantics come from the individual
  [expansion panels](../expansion-panel/spec.md#aria-roles-and-properties).
- The panel headers form the navigable set, and disabled panels are announced as disabled and skipped.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

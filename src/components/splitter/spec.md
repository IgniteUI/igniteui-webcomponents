# Splitter specification

- [Splitter specification](#splitter-specification)
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
      - [Configuring orientation and sizes](#configuring-orientation-and-sizes)
      - [Setting size constraints](#setting-size-constraints)
      - [Disabling user interactions](#disabling-user-interactions)
      - [Customizing visual elements](#customizing-visual-elements)
      - [Programmatic control](#programmatic-control)
      - [Nested splitters](#nested-splitters)
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
    - [Slotted content](#slotted-content)
    - [Properties](#properties)
    - [Methods, events and interactions](#methods-events-and-interactions)
    - [Resizing with constraints](#resizing-with-constraints)
    - [Behavior on splitter and container resize](#behavior-on-splitter-and-container-resize)
    - [Collapsed state integrity](#collapsed-state-integrity)
    - [Size and constraint values](#size-and-constraint-values)
    - [Gesture cancellation](#gesture-cancellation)
    - [Nested splitters tests](#nested-splitters-tests)
    - [RTL tests](#rtl-tests)
    - [Edge scenarios](#edge-scenarios)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

## Overview

The `igc-splitter` component is a layout container that displays two adjacent panes separated by a resizable divider
bar. It enables users to dynamically adjust the relative sizes of the panes by dragging the divider, and optionally
collapse or expand individual panes to maximize workspace efficiency.

The component supports both horizontal (side-by-side) and vertical (stacked) orientations, making it suitable for a
variety of layout scenarios such as:

- **Code editors**: source code pane alongside preview or console output
- **File browsers**: directory tree navigation with file content view
- **Email clients**: inbox list with message preview
- **Admin dashboards**: navigation sidebar with main content area
- **Data analysis tools**: dataset view with visualization or properties pane

### Key features

- **Flexible sizing**: configure initial, minimum, and maximum sizes for each pane using any valid CSS length unit
- **Interactive resize**: drag the splitter bar or use keyboard navigation to adjust pane proportions
- **Collapse/expand**: optionally allow users to completely collapse panes to maximize space for the other pane
- **Expansion state control**: read and set each pane's collapsed state via public properties, and react to
  user-driven changes via a dedicated event, enabling persistence of the user's preferred layout
- **Nested layouts**: compose complex multi-pane layouts by nesting splitters within panes
- **Customization**: control visibility of UI elements (drag handle, collapse buttons)
- **Accessibility-first**: full keyboard navigation and screen reader support following WAI-ARIA guidelines
- **Themeable**: integrates seamlessly with the theming system using CSS custom properties and shadow parts

### Acceptance criteria

- The component must render two distinct panes with slotted content support.
- The splitter bar must be interactive, allowing resize operations via pointer drag and keyboard navigation.
- Both horizontal and vertical orientations must be fully supported and dynamically switchable.
- Pane sizes must respect configured constraints (min/max) during all resize operations.
- Collapse/expand functionality must work via UI buttons, keyboard shortcuts, and programmatic API.
- The current collapsed state of each pane must be readable and settable through public properties, and user-driven
  changes to that state must be observable through a dedicated event.
- All resize operations must emit appropriate events with accurate size and delta information.
- The component must be fully keyboard accessible with proper focus management and ARIA attributes.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant, using the appropriate semantic elements and ARIA roles.
- The component must support RTL layouts without additional configuration.
- Nested splitters must function independently without interference.
- The component must handle edge cases gracefully (invalid sizes, conflicting constraints, rapid interactions).

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see two panes of content, side by side, with a divider bar between them.
- resize the panes by dragging the divider bar.
- focus the divider bar and use the keyboard to resize the panes.
- collapse and expand the panes.

### Developer stories

As a developer, I expect to be able to:

- slot arbitrary content inside the panes of the element.
- slot another splitter inside one of the panes, allowing for more advanced layouts.
- control the display layout of the panes - either horizontal or vertical.
- set whether the panes can be resized by end-user interaction.
- set whether a pane can be collapsed.
- set a default size for each pane.
- set a min and max size for a pane.
- read and programmatically set whether a pane is currently collapsed or expanded.
- be notified when the end-user collapses or expands a pane, so the preferred layout can be persisted and restored.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/design/m26ZFquPMB9hDpR4qExBFm/Splitter-Handoff?node-id=0-1&t=6sHcRmQ1FmjEdovX-1)

The splitter component presents users with a clear, intuitive interface for managing multi-pane layouts:

**Visual structure**

- Two distinct content panes positioned according to the orientation - side by side for horizontal, stacked for
  vertical.
- A visible divider bar between panes that serves as the resize handle.
- Optional drag handle icon on the divider bar indicating interactivity.
- Optional collapse and expand buttons on each side of the divider bar when collapse functionality is enabled.

**Resize interaction**

- **Pointer**: users can press on the splitter bar and drag to resize the panes. The cursor changes to indicate the
  resize direction.
- **Keyboard**: when the splitter bar has focus, the arrow keys resize the panes in 10px increments. The pane sizes
  update in real time as the user navigates.
- **Constraints**: resize operations are visually constrained - users cannot drag beyond the configured minimum or
  maximum sizes, providing clear boundaries.
- **Feedback**: during a resize both panes update smoothly, giving immediate visual feedback of the size changes.

**Collapse and expand interaction**

- **UI buttons**: activating a collapse button completely hides the associated pane, maximizing space for the other
  one. An expand button appears to restore the pane to its previous size.
- **Keyboard shortcuts**: <kbd>Ctrl</kbd> + arrow keys collapse or expand the panes without leaving the keyboard.
- **Single pane constraint**: only one pane can be collapsed at a time, so content is always visible.

**Accessibility experience**

- **Focus indicators**: the splitter bar displays a clear focus ring when it is reached from the keyboard.
- **Screen reader announcements**: the current state of the splitter, including the pane sizes and the collapse and
  expand actions, is announced.
- **Predictable navigation**: the tab order flows naturally and the keyboard shortcuts follow standard conventions.

### Developer experience

#### Basic initialization

The simplest splitter requires only slotted content for the two panes:

```html
<igc-splitter>
  <div slot="start">Start pane content</div>
  <div slot="end">End pane content</div>
</igc-splitter>
```

By default this creates a horizontal splitter with equal-sized panes.

#### Configuring orientation and sizes

```html
<igc-splitter orientation="vertical" start-size="300px">
  <div slot="start">Top pane (300px)</div>
  <div slot="end">Bottom pane (fills the remaining space)</div>
</igc-splitter>
```

> [!NOTE]
> Changing the orientation after the initial render clears the pane sizes and their min and max constraints, along
> with the corresponding attributes: a size authored for one axis rarely makes sense on the other.

#### Setting size constraints

```html
<igc-splitter start-size="250px" start-min-size="150px" start-max-size="400px" end-min-size="200px">
  <div slot="start">Constrained pane</div>
  <div slot="end">Main content</div>
</igc-splitter>
```

The size properties accept a CSS length with an explicit unit - `100px`, `20%` - or a unitless `0`. An `auto` value,
any other unitless or unparsable value, a negative value, or a percentage above 100 removes the constraint, and for
`startSize` and `endSize` falls back to automatic sizing.

#### Disabling user interactions

```html
<!-- Fixed layout, no resizing -->
<igc-splitter disable-resize>...</igc-splitter>

<!-- Resizable, but the panes cannot be collapsed -->
<igc-splitter disable-collapse>...</igc-splitter>
```

`disable-resize` also hides the drag handle, and `disable-collapse` also hides the collapse and expand buttons.

#### Customizing visual elements

```html
<igc-splitter hide-drag-handle hide-collapse-buttons>...</igc-splitter>
```

The collapse buttons are additionally hidden while a pane is collapsed.

#### Programmatic control

```typescript
const splitter = document.querySelector('igc-splitter')!;

splitter.toggle('start');       // collapse or expand the start pane
splitter.endCollapsed = true;   // collapse the end pane

splitter.addEventListener('igcLayoutChanged', ({ detail }) => {
  localStorage.setItem('layout', JSON.stringify(detail));
});
```

`toggle()` does not emit `igcLayoutChanged`: that event reports user-driven changes, and a programmatic call is
already known to the caller. Setting a collapsed property while the other pane is collapsed expands the other one,
keeping the single collapsed pane constraint.

#### Nested splitters

```html
<igc-splitter>
  <div slot="start">Sidebar</div>
  <igc-splitter slot="end" orientation="vertical">
    <div slot="start">Editor</div>
    <div slot="end">Console</div>
  </igc-splitter>
</igc-splitter>
```

Nested splitters operate independently; a resize in one does not disturb the other.

### Localization

The splitter contains no text content that requires localization. All visual elements are icon-based, and
applications can provide localized labels for the collapse and expand buttons.

### Keyboard interactions

| Key combination                          | Result                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| <kbd>Arrow Up</kbd>                      | In vertical orientation, decreases the start pane size by 10px (increases the end pane). |
| <kbd>Arrow Down</kbd>                    | In vertical orientation, increases the start pane size by 10px (decreases the end pane). |
| <kbd>Arrow Left</kbd>                    | In horizontal orientation, decreases the start pane size by 10px (increases the end pane). |
| <kbd>Arrow Right</kbd>                   | In horizontal orientation, increases the start pane size by 10px (decreases the end pane). |
| <kbd>Ctrl</kbd> + <kbd>Arrow Up</kbd>    | In vertical orientation, collapses or expands the start pane (if collapse is enabled).  |
| <kbd>Ctrl</kbd> + <kbd>Arrow Down</kbd>  | In vertical orientation, collapses or expands the end pane (if collapse is enabled).    |
| <kbd>Ctrl</kbd> + <kbd>Arrow Left</kbd>  | In horizontal orientation, collapses or expands the start pane (if collapse is enabled). |
| <kbd>Ctrl</kbd> + <kbd>Arrow Right</kbd> | In horizontal orientation, collapses or expands the end pane (if collapse is enabled).  |
| <kbd>Home</kbd>                          | Resizes to the minimum size of the start pane.                                          |
| <kbd>End</kbd>                           | Resizes to the maximum size of the start pane.                                          |

## API

### Properties and attributes

| Property            | Attribute             | Reflected | Type                        | Default      | Description                                                                 |
| ------------------- | --------------------- | --------- | --------------------------- | ------------ | --------------------------------------------------------------------------- |
| orientation         | orientation           | Yes       | `SplitterOrientation`       | `horizontal` | Orientation layout for the splitter panes.                                  |
| disableCollapse     | disable-collapse      | Yes       | `boolean`                   | false        | Whether collapsing either pane is disabled. Also hides the collapse buttons. |
| disableResize       | disable-resize        | Yes       | `boolean`                   | false        | Whether resizing is disabled. Also hides the drag handle.                   |
| hideDragHandle      | hide-drag-handle      | Yes       | `boolean`                   | false        | Controls the visibility of the drag handle on the splitter bar.             |
| hideCollapseButtons | hide-collapse-buttons | Yes       | `boolean`                   | false        | Controls the visibility of the expand/collapse buttons on the splitter bar. |
| startSize           | start-size            | No        | `string \| undefined`       | -            | The initial display size of the start pane.                                 |
| endSize             | end-size              | No        | `string \| undefined`       | -            | The initial display size of the end pane.                                   |
| startMinSize        | start-min-size        | No        | `string \| undefined`       | -            | The minimum display size for the start pane.                                |
| startMaxSize        | start-max-size        | No        | `string \| undefined`       | -            | The maximum display size for the start pane.                                |
| endMinSize          | end-min-size          | No        | `string \| undefined`       | -            | The minimum display size for the end pane.                                  |
| endMaxSize          | end-max-size          | No        | `string \| undefined`       | -            | The maximum display size for the end pane.                                  |
| startCollapsed      | start-collapsed       | Yes       | `boolean`                   | false        | Gets/sets the collapsed state of the start pane.                            |
| endCollapsed        | end-collapsed         | Yes       | `boolean`                   | false        | Gets/sets the collapsed state of the end pane.                              |

### Methods

| Name   | Type signature                   | Description                                    |
| ------ | -------------------------------- | ---------------------------------------------- |
| toggle | `(pane: 'start' \| 'end'): void` | Toggles the collapsed state of the given pane. |

### Events

| Name             | Cancellable | Description                                                                                          |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| igcResizeStart   | false       | Emitted once when a resize operation begins, through a pointer drag or the keyboard.                 |
| igcResizing      | false       | Emitted continuously while a pane is being resized.                                                  |
| igcResizeEnd     | false       | Emitted once when a resize operation completes.                                                      |
| igcLayoutChanged | false       | Emitted after a user-driven resize or collapse change, with a full snapshot of the layout. Not emitted for a programmatic `toggle()` or property change. |

**Event details**

All resize events emit the following detail object:

```typescript
interface IgcSplitterResizeEventDetail {
  /** The current size of the start pane in pixels */
  startPanelSize: number;
  /** The current size of the end pane in pixels */
  endPanelSize: number;
  /** The change in size since the resize operation started (only for igcResizing and igcResizeEnd) */
  delta?: number;
}
```

The `igcLayoutChanged` event emits the following detail object:

```typescript
interface IgcSplitterLayoutChangedEventArgs {
  /** The current size of the start pane */
  startSize: string;
  /** The current size of the end pane */
  endSize: string;
  /** Whether the start pane is currently collapsed */
  startCollapsed: boolean;
  /** Whether the end pane is currently collapsed */
  endCollapsed: boolean;
}
```

### Slots

| Name    | Description                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| `start` | The start pane of the splitter. In horizontal layout this is the leftmost pane, and in vertical layout the topmost.  |
| `end`   | The end pane of the splitter. In horizontal layout this is the rightmost pane, and in vertical layout the bottom one. |

### CSS Shadow parts

| Part                 | Description                                         |
| -------------------- | --------------------------------------------------- |
| `splitter-bar`       | The resizable bar element between the two panes.    |
| `drag-handle`        | The drag handle icon/element on the splitter bar.   |
| `start-pane`         | The container for the start pane content.           |
| `end-pane`           | The container for the end pane content.             |
| `start-collapse-btn` | The button to collapse the start pane.              |
| `end-collapse-btn`   | The button to collapse the end pane.                |
| `start-expand-btn`   | The button to expand the start pane when collapsed. |
| `end-expand-btn`     | The button to expand the end pane when collapsed.   |

## Test scenarios

The suite lives in [`splitter.spec.ts`](./splitter.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### Rendering

1. The component renders with its default horizontal orientation, both panes, the splitter bar, the drag handle and
   the collapse buttons.
2. Changing the orientation updates the layout, and clears the sizes and constraints along with their attributes.
3. The correct parts are applied for each orientation and state.

### Slotted content

4. Content projected into the `start` and `end` slots is rendered in the corresponding panes.
5. Missing slot content does not break the rendering.

### Properties

6. `startSize` and `endSize` set the initial pane sizes, in every accepted unit.
7. `disableResize` and `disableCollapse` disable the corresponding interactions and hide the matching affordances.
8. `hideDragHandle` and `hideCollapseButtons` control the visibility of those elements.
9. `startCollapsed` and `endCollapsed` reflect and drive the collapsed state.

### Methods, events and interactions

10. `toggle` collapses and expands the given pane, without emitting `igcLayoutChanged`.
11. A pointer drag resizes both panes and emits `igcResizeStart`, `igcResizing` and `igcResizeEnd` with the correct
    sizes and delta.
12. A user-driven resize or collapse emits `igcLayoutChanged` with the full layout snapshot.
13. The collapse and expand buttons collapse and restore the panes.
14. Only one pane can be collapsed at a time; collapsing one expands the other.

### Resizing with constraints

15. Horizontal orientation - the resize is clamped by the start and end min and max sizes.
16. Vertical orientation - the same constraints apply along the block axis.
17. <kbd>Home</kbd> and <kbd>End</kbd> resize to the minimum and maximum of the start pane, including when the
    opposite pane carries the binding constraint.

### Behavior on splitter and container resize

18. The panes adapt when the container size changes.
19. Relative sizes update with the container, and absolute sizes are kept where possible.

### Collapsed state integrity

20. The collapsed state survives resizes, orientation changes and re-renders.
21. Setting a collapsed property to its current value is a no-op.

### Size and constraint values

22. Values with explicit units and a unitless `0` are accepted.
23. `auto`, other unitless values, unparsable values, negative values and percentages above 100 remove the
    constraint or fall back to automatic sizing.

### Gesture cancellation

24. A cancelled pointer gesture restores the sizes from before the drag.

### Nested splitters tests

25. Nested splitters resize independently and do not interfere with one another.

### RTL tests

26. The horizontal layout is mirrored, and the arrow key navigation is reversed accordingly.

### Edge scenarios

27. Rapid resize and collapse interactions settle in a consistent state.
28. Conflicting constraints are resolved without breaking the layout.

## Accessibility

### ARIA roles and properties

Following the [official guidelines](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/), the following ARIA
properties are present on the splitter bar:

- it has an ARIA **role** of **separator**.
- it has **aria-orientation** equal to the **orientation** value of the splitter element.
- if the splitter is interactive - resizable or collapsible - it has a **tabindex** of **0**, otherwise it is
  **-1**.
- the **aria-valuenow**, **aria-valuemin** and **aria-valuemax** attributes report the current position.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The splitter element works in a Right-to-Left context without additional setup or configuration. The horizontal
layout is mirrored and the arrow key navigation follows the inline direction.

# Button group specification

- [Button group specification](#button-group-specification)
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
      - [Selection modes](#selection-modes)
      - [Resolving the initial selection](#resolving-the-initial-selection)
      - [Selection reconciliation](#selection-reconciliation)
      - [Disabled state](#disabled-state)
      - [The toggle button](#the-toggle-button)
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
    - [Properties tests](#properties-tests)
    - [Selection tests](#selection-tests)
    - [UI tests](#ui-tests)
    - [Selection reconciliation tests](#selection-reconciliation-tests)
    - [Disabled state tests](#disabled-state-tests)
    - [ARIA tests](#aria-tests)
    - [Roving tab index](#roving-tab-index)
    - [Arrow navigation](#arrow-navigation)
    - [Toggle button tests](#toggle-button-tests)
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

The `igc-button-group` groups a series of `igc-toggle-button` elements and adds layout, selection and keyboard
navigation across them, which is what makes a toolbar or a segmented control out of them.

An `igc-toggle-button` wraps a native button and adds a `value` and a `selected` property.

```html
<igc-button-group selection="single-required">
  <igc-toggle-button value="left">Left</igc-toggle-button>
  <igc-toggle-button value="center">Center</igc-toggle-button>
  <igc-toggle-button value="right">Right</igc-toggle-button>
</igc-button-group>
```

### Key features

- **Three selection modes**: single, single-required and multiple.
- **A horizontal and a vertical alignment**, which also decides the navigation axis.
- **Selection from code** through `selectedItems` or through the `selected` property of a button.
- **Keyboard navigation** with a roving tab index that follows the selection.
- **A group-wide disabled state** that leaves the own state of each button intact.
- **Runtime changes**: buttons added, removed or moved are reconciled into the selection and the tab order.

### Acceptance criteria

- The group must support the three selection modes and change its semantics with them.
- It must lay its buttons out horizontally and vertically.
- The selection must be settable from code without emitting events, and from the UI with events.
- A `selected` attribute on a button must take priority over `selectedItems` on the first render.
- In the single modes only the last selected button must survive the first render.
- In single-required mode the selected button must not be deselectable through the UI.
- Changing the selection mode at runtime must clear the selection.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must follow the WAI-ARIA guidelines and be operable with a pointer and with the keyboard.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- select one or more buttons of the group, depending on how it is configured;
- see clearly which buttons are selected and which are disabled;
- move through the group with the arrow keys and activate a button with the keyboard;
- be kept from clearing a required selection.

### Developer stories

As a developer, I expect to be able to:

- group buttons and get the toolbar behavior without writing it;
- choose between single, required single and multiple selection;
- lay the group out horizontally or vertically;
- set and read the selection from code, by value or through the buttons;
- be notified when the user selects or deselects a button;
- disable the whole group at once;
- give each button a value and projected content of my own.

## Functionality

### End-user experience

> [Design hand-off](https://www.figma.com/file/0iCinYLqmAN5sbv305sw0C/Button-Group?type=design&node-id=0%3A1&mode=design&t=OrGA5waIsxFqL76N-1)

The buttons are rendered as one connected surface, styled by the active theme, with distinct selected, focused and
disabled states.

### Developer experience

#### Basic initialization

```html
<igc-button-group>
  <igc-toggle-button value="1">First</igc-toggle-button>
  <igc-toggle-button value="2">Second</igc-toggle-button>
</igc-button-group>
```

#### Selection modes

`selection` takes `single`, `single-required` or `multiple`. In `single-required` the group behaves as a radio
group: once something is selected it cannot be deselected through the UI, and interacting with the already
selected button emits nothing. Changing `selection` at runtime clears the current selection.

`selectedItems` gets and sets the values of the selected buttons. Setting it replaces the previous selection, and
an empty array or falsy values clear it. Changing `selected` on a button is reflected in the group but emits no
event.

#### Resolving the initial selection

On the first render, a `selected` attribute on a button takes priority over the `selected-items` attribute of the
group. In the single modes, when several buttons are marked selected, only the last one survives.

#### Selection reconciliation

Buttons added at runtime are folded into the selection and the tab order. The selection moves correctly between
buttons that have no `value` and between buttons sharing the same one, buttons with an empty value still appear in
`selectedItems`, and a toggle button that is not a direct child of the group is ignored.

#### Disabled state

`disabled` on the group disables every button, including those added while it is disabled, and restores the own
disabled state of each button when it is lifted.

#### The toggle button

`igc-toggle-button` exposes `value`, `selected` and `disabled`, plus `focus()`, `blur()` and `click()`. It renders
projected content, and takes its vertical sizing from the group or from a CSS variable set on it.

### Localization

The components have no resource strings. The content of each button comes from the application.

### Keyboard interactions

The group is a single tab stop; the arrow keys move inside it.

| Keys                                    | Description                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves the focus to and from the group.                           |
| <kbd>→</kbd> / <kbd>←</kbd>             | Moves through a horizontal group, wrapping at both ends.                     |
| <kbd>↓</kbd> / <kbd>↑</kbd>             | Moves through a vertical group, wrapping at both ends.                       |
| <kbd>Enter</kbd> / <kbd>Space</kbd>     | Selects or deselects the focused button, according to the selection mode.    |

In the single selection modes the arrow keys move the selection along with the focus, and the navigation does not
deselect the button it lands on in `single-required`. In multiple selection mode the arrow keys do not navigate.
Disabled buttons are skipped, and the direction of the arrow keys follows the writing direction.

## API

### Properties and attributes

`igc-button-group`

| Property        | Attribute       | Reflected | Type                                                | Default      | Description                                      |
| --------------- | --------------- | --------- | ---------------------------------------------------- | ------------ | ------------------------------------------------ |
| `selection`     | `selection`     | no        | `"single" \| "single-required" \| "multiple"`        | `single`     | The selection mode of the group.                  |
| `alignment`     | `alignment`     | yes       | `"horizontal" \| "vertical"`                         | `horizontal` | The orientation of the buttons.                   |
| `disabled`      | `disabled`      | yes       | `boolean`                                            | `false`      | Disables every button of the group.               |
| `selectedItems` | `selectedItems` | no        | `string[]`                                           | `[]`         | The values of the selected buttons.               |

`igc-toggle-button`

| Property   | Attribute  | Reflected | Type      | Default | Description                        |
| ---------- | ---------- | --------- | --------- | ------- | ---------------------------------- |
| `value`    | `value`    | no        | `string`  | —       | The value of the button.            |
| `selected` | `selected` | yes       | `boolean` | `false` | Whether the button is selected.     |
| `disabled` | `disabled` | yes       | `boolean` | `false` | Whether the button is disabled.     |

### Methods

`igc-button-group` has no methods. `igc-toggle-button` exposes:

| Method  | Signature                        | Description                        |
| ------- | -------------------------------- | ---------------------------------- |
| `focus` | `(options?: FocusOptions): void` | Sets the focus on the button.       |
| `blur`  | `(): void`                       | Removes the focus from the button.  |
| `click` | `(): void`                       | Simulates a click on the button.    |

### Events

Emitted by `igc-button-group`, for user interaction only.

| Event        | Detail   | Cancelable | Description                                       |
| ------------ | -------- | ---------- | ------------------------------------------------- |
| `igcSelect`  | `string` | no         | A button was selected by the user.                 |
| `igcDeselect`| `string` | no         | A button was deselected by the user.               |

### Slots

| Component           | Name    | Description                        |
| ------------------- | ------- | ---------------------------------- |
| `igc-button-group`  | default | The toggle buttons of the group.    |
| `igc-toggle-button` | default | The content of the button.          |

### CSS Shadow parts

| Component           | Part      | Description                                                    |
| ------------------- | --------- | -------------------------------------------------------------- |
| `igc-button-group`  | `group`   | The container of the group.                                     |
| `igc-toggle-button` | `toggle`  | The native button element.                                      |
| `igc-toggle-button` | `focused` | The native button while it is focused through the keyboard.      |

## Test scenarios

| Suite           | File                    |
| --------------- | ----------------------- |
| `Button Group`  | `button-group.spec.ts`  |
| `Toggle Button` | `toggle-button.spec.ts` |

### Initialization

1. The group passes the accessibility audit and is initialized with its toggle buttons and its default state.
2. The group renders the correct role and attributes.

### Properties tests

3. The `selection`, `disabled` and `alignment` properties are applied.

### Selection tests

4. The initial selection is resolved from the attribute of the group and from the attributes of the children, and
   the child attribute takes priority.
5. The selection is updated through `selectedItems` and through the `selected` property of a child.
6. In the single modes the last selected button of several wins.
7. Buttons added at runtime update the selection state.
8. Changing the selection mode clears the selection, and so does an empty array or falsy values in
   `selectedItems`.

### UI tests

9. Only one button can be selected through the UI in single mode, several in multiple mode, and a required
   selection cannot be cleared.
10. No interaction is possible while the group is disabled.
11. `igcSelect` and `igcDeselect` are emitted on select and deselect, and the emitted sequence is correct in each
    of the three selection modes.

### Selection reconciliation tests

12. The selection moves between buttons that have no `value` and between buttons sharing the same one.
13. Setting `selectedItems` replaces the previous selection in both the single and the multiple mode.
14. Buttons with an empty `value` stay in `selectedItems`.
15. Toggle buttons that are not direct children of the group are ignored.

### Disabled state tests

16. Buttons added while the group is disabled are disabled as well.
17. The own disabled state of a button is kept intact.

### ARIA tests

18. The group exposes radio semantics in the single selection modes and toggle button semantics in multiple mode.
19. The role sits on the host, so that a label of the author names the group.
20. `aria-orientation` mirrors the alignment, and the semantics are updated when the selection mode changes.

### Roving tab index

21. Without a selection the first button is the only tab stop; with one, the selected button is, and the tab stop
    follows the selection.
22. A disabled button is skipped when the tab stop is picked, and gives up the tab stop when it becomes disabled.
23. Buttons added at runtime update the tab stops.
24. A button taken out of the group gets its tab order restored, a tab order the author set is kept, a button
    moved to another parent is released and taken back over when it is re-attached, and a button moved into
    another group is handed over to it.
25. The tab stops follow the selection mode.

### Arrow navigation

26. The arrows move the focus and the selection to the next and the previous button, and wrap at both ends.
27. Disabled buttons are skipped.
28. The navigation works when the group sits inside another shadow root.
29. The selection events are emitted on navigation, and the navigation never deselects the button it lands on in
    single-required mode.
30. The navigation follows the horizontal and the vertical alignment and the writing direction.
31. There is no navigation in multiple selection mode, nor while the group is disabled.

### Toggle button tests

32. The button passes the accessibility audit, renders correctly and is initialized with its default state.
33. The rendered attributes are correct, and `value`, `selected`, `disabled` and `aria-label` are applied.
34. `focus()`, `blur()` and `click()` behave as expected.

### Not covered by the suite

- The vertical sizing of a button through a CSS variable is not covered.

## Assumptions and limitations

- Only direct `igc-toggle-button` children are members of the group.
- Changing the selection from code emits no events; only user interaction does.
- Changing the selection mode at runtime clears the selection rather than migrating it.
- In single-required mode a selection, once made, cannot be cleared through the UI.
- The arrow keys do not navigate in multiple selection mode.
- The group has no methods; the selection is driven through `selectedItems` or through the buttons.

## Accessibility

### ARIA roles and properties

- In the single selection modes the group exposes radio semantics — a radio group of radios — and in multiple mode
  toggle button semantics. The semantics are updated when the selection mode changes at runtime.
- The role sits on the host, so that a label provided by the author names the group.
- `aria-orientation` mirrors the alignment of the group.
- Each button exposes its selected and disabled state, and is named by its projected content or by its
  `aria-label`.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The arrow navigation
follows the writing direction.

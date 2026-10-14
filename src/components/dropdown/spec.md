# Dropdown specification

This directory hosts four public components: [`igc-dropdown`](#igc-dropdown),
[`igc-dropdown-item`](#igc-dropdown-item), [`igc-dropdown-group`](#igc-dropdown-group) and
[`igc-dropdown-header`](#igc-dropdown-header).

- [Dropdown specification](#dropdown-specification)
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
      - [Target resolution](#target-resolution)
      - [Groups and headers](#groups-and-headers)
      - [Selection](#selection)
      - [Positioning](#positioning)
      - [Open behavior](#open-behavior)
      - [Scroll strategy](#scroll-strategy)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-dropdown](#igc-dropdown)
    - [igc-dropdown-item](#igc-dropdown-item)
    - [igc-dropdown-group](#igc-dropdown-group)
    - [igc-dropdown-header](#igc-dropdown-header)
  - [Test scenarios](#test-scenarios)
    - [DOM](#dom)
    - [Accessibility tests](#accessibility-tests)
    - [Initial selection](#initial-selection)
    - [API tests](#api-tests)
    - [Groups and headers tests](#groups-and-headers-tests)
    - [User interactions](#user-interactions)
    - [Items collection changes](#items-collection-changes)
    - [Events tests](#events-tests)
    - [Detached anchor](#detached-anchor)
    - [Scroll strategy tests](#scroll-strategy-tests)
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

The `igc-dropdown` displays a scrollable list of selectable items anchored to a target element. The items can be
visually grouped and preceded by headers. Activating an item selects it and closes the list, and the list renders in
the top layer through the internal [`igc-popover`](../popover/spec.md), so it appears above the rest of the page
regardless of the surrounding overflow.

The component is not a form control; it is a selection surface. For a form-associated single selection use
[`igc-select`](../select/spec.md), and for a filterable, optionally multiple one use
[`igc-combo`](../combo/spec.md).

### Key features

- **Any anchor**: the target is slotted, or passed to `show` and `toggle` as an element or an IDREF.
- **Grouping**: items can be grouped with a label, and standalone headers can separate sections.
- **Single selection**, preserved across open and close cycles, with programmatic selection by value or index.
- **Positioning**: twelve placements, a distance from the target, optional flipping, and width matching.
- **Open behavior**: optionally stay open after a selection or after an outside click.
- **Scroll strategies**: hide with the anchor, stay anchored, or close on scroll.

### Acceptance criteria

- The component must display a scrollable list of items, which may be visually grouped.
- Activating an item must select it and, by default, close the list.
- The list must render above the other elements on the page.
- The component must be attachable to any kind of anchor element.
- The selection must be settable and clearable programmatically, by value and by index.
- Keyboard navigation must move the active item without changing the selection, and <kbd>Enter</kbd> must commit it.
- <kbd>Escape</kbd> must close the list without changing the selection.
- The component must emit events for the selection change and for each open and close transition.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a dropdown list of the available choices, above the other elements on the page.
- have, or not have, a default selection.
- select a choice with a mouse click, or with <kbd>Enter</kbd> or <kbd>Space</kbd>.
- scroll the list when there are too many choices.
- navigate the items with the arrow keys and with <kbd>Home</kbd> and <kbd>End</kbd>.
- see the choices grouped where that applies.
- close the list by selecting an item or by pressing <kbd>Escape</kbd>.
- have the selection preserved, and be able to change it as often as I want.
- see a visual clue when a choice is not selectable, and when it is selected, active or hovered.
- see long item text truncated with an ellipsis to fit the available width.

### Developer stories

As a developer, I expect to be able to:

- select an item programmatically, and be notified when the selection changes.
- tie the dropdown to any kind of anchor.
- open the dropdown within the viewport, flipping it when there is not enough room.
- set the width of the dropdown, or match it to the width of the target.
- set the height, with a vertical scrollbar once it is exceeded.
- choose the opening position of the list.
- group hierarchical data without flattening it.

## Functionality

### End-user experience

The list appears next to its target on the configured side, showing the items in DOM order with their groups and
headers. The selected item is marked, and the active item - the one the keyboard navigation is on - carries its own
state. Clicking an item selects it and closes the list; clicking outside closes it without changing the selection.

### Developer experience

#### Basic initialization

```html
<igc-dropdown>
  <igc-button slot="target">Open</igc-button>

  <igc-dropdown-item value="1">One</igc-dropdown-item>
  <igc-dropdown-item value="2">Two</igc-dropdown-item>
  <igc-dropdown-item value="3" disabled>Three</igc-dropdown-item>
</igc-dropdown>
```

#### Target resolution

The target is the element slotted in the `target` slot. `show` and `toggle` also accept an element or an IDREF,
which lets a single dropdown serve several anchors:

```typescript
await dropdown.show(document.querySelector('#other-anchor')!);
await dropdown.toggle('another-anchor');
```

#### Groups and headers

```html
<igc-dropdown>
  <igc-button slot="target">Open</igc-button>

  <igc-dropdown-header>Fruits</igc-dropdown-header>
  <igc-dropdown-group>
    <span slot="label">Citrus</span>
    <igc-dropdown-item>Orange</igc-dropdown-item>
    <igc-dropdown-item>Lemon</igc-dropdown-item>
  </igc-dropdown-group>
</igc-dropdown>
```

#### Selection

```typescript
dropdown.select('2');        // by value
dropdown.select(0);          // by index
dropdown.navigateTo('3');    // activate without selecting
dropdown.clearSelection();

const current = dropdown.selectedItem;
```

`select` and `navigateTo` return the matched item, or `null` when nothing matches. An item without an explicit
`value` falls back to its text content.

#### Positioning

```html
<igc-dropdown placement="top-start" distance="4" flip same-width>...</igc-dropdown>
```

#### Open behavior

```html
<igc-dropdown keep-open-on-select keep-open-on-outside-click>...</igc-dropdown>
```

#### Scroll strategy

`scrollStrategy` sets what happens while a parent container scrolls: `hide` - the default - hides the list while the
anchor is fully out of view, `scroll` keeps it visible and anchored, and `close` closes it on each scroll.

### Localization

The component renders no strings of its own. The item, group label and header content come from the application.

### Keyboard interactions

The dropdown itself is not focusable and has no tab index, so the target keeps the focus.

| Key combination                                 | Result                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| <kbd>Arrow Up</kbd> / <kbd>Arrow Down</kbd>     | Activates the previous or next item, without changing the selection. |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd>  | Activates the previous or next item, without changing the selection. |
| <kbd>Home</kbd> / <kbd>End</kbd>                | Activates the first or the last item.                                |
| <kbd>Enter</kbd> / <kbd>Space</kbd>             | Selects the active item and closes the list.                         |
| <kbd>Escape</kbd>                               | Closes the list without changing the selection.                      |
| <kbd>Tab</kbd>                                  | Closes the list and moves focus on.                                  |

## API

### igc-dropdown

#### Properties and attributes

| Property               | Attribute                  | Reflected | Type                                    | Default        | Description                                                     |
| ---------------------- | -------------------------- | --------- | --------------------------------------- | -------------- | ---------------------------------------------------------------- |
| open                   | open                       | Yes       | `boolean`                               | false          | The open state of the component.                                |
| placement              | placement                  | No        | `PopoverPlacement`                      | `bottom-start` | The preferred placement around the target element.              |
| distance               | distance                   | No        | `number`                                | 0              | The distance from the target element.                           |
| flip                   | flip                       | No        | `boolean`                               | false          | Whether to flip to the opposite side when about to overflow.    |
| sameWidth              | same-width                 | No        | `boolean`                               | false          | Whether the width should match the width of the target.         |
| keepOpenOnSelect       | keep-open-on-select        | Yes       | `boolean`                               | false          | Keeps the dropdown open after the user selects an item.         |
| keepOpenOnOutsideClick | keep-open-on-outside-click | Yes       | `boolean`                               | false          | Keeps the dropdown open when the user clicks outside of it.     |
| scrollStrategy         | scroll-strategy            | No        | `PopoverScrollStrategy`                 | `hide`         | The behavior of the component when a parent container scrolls.  |
| items                  | -                          | No        | `IgcDropdownItemComponent[]`            | -              | Read-only. The items of the dropdown.                           |
| groups                 | -                          | No        | `IgcDropdownGroupComponent[]`           | -              | Read-only. The group items of the dropdown.                     |
| selectedItem           | -                          | No        | `IgcDropdownItemComponent \| null`      | `null`         | Read-only. The selected item, or `null`.                        |

#### Methods

| Name           | Type signature                                                     | Description                                                                  |
| -------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| show           | `(target?: HTMLElement \| string): Promise<boolean>`               | Shows the component, optionally against the given target.                    |
| hide           | `(): Promise<boolean>`                                             | Hides the component.                                                         |
| toggle         | `(target?: HTMLElement \| string): Promise<boolean>`               | Toggles the open state, optionally against the given target.                 |
| select         | `(value: string \| number): IgcDropdownItemComponent \| null`      | Selects the item with the given value or index, and returns it.              |
| navigateTo     | `(value: string \| number): IgcDropdownItemComponent \| null`      | Activates the item with the given value or index, and returns it.            |
| clearSelection | `(): void`                                                         | Clears the current selection of the dropdown.                                |

#### Events

| Name       | Cancellable | Description                                 |
| ---------- | ----------- | ------------------------------------------- |
| igcChange  | false       | Emitted when the selected item changes.     |
| igcOpening | true        | Emitted just before the dropdown is opened. |
| igcOpened  | false       | Emitted after the dropdown is opened.       |
| igcClosing | true        | Emitted just before the dropdown is closed. |
| igcClosed  | false       | Emitted after closing the dropdown.         |

#### Slots

| Name      | Description                            |
| --------- | -------------------------------------- |
| `target`  | Renders the target element of the dropdown. |
| (default) | Renders the dropdown list items.       |

#### CSS Shadow parts

| Part   | Description                          |
| ------ | ------------------------------------ |
| `base` | The dropdown list wrapper container. |
| `list` | The dropdown list element.           |

### igc-dropdown-item

Represents an item in a dropdown list.

| Property | Attribute | Reflected | Type      | Default | Description                                                   |
| -------- | --------- | --------- | --------- | ------- | -------------------------------------------------------------- |
| value    | value     | No        | `string`  | -       | The value of the item. Falls back to the text content.        |
| selected | selected  | Yes       | `boolean` | false   | Whether the item is selected.                                 |
| active   | active    | Yes       | `boolean` | false   | Whether the item is active.                                   |
| disabled | disabled  | Yes       | `boolean` | false   | Whether the item is disabled.                                 |

| Slot      | Description                                   |
| --------- | --------------------------------------------- |
| `prefix`  | Renders content before the main content.      |
| (default) | Renders the main content of the item.         |
| `suffix`  | Renders content after the main content.       |

| Part      | Description                                   |
| --------- | --------------------------------------------- |
| `prefix`  | The prefix wrapper of the dropdown item.      |
| `content` | The main content wrapper of the dropdown item. |
| `suffix`  | The suffix wrapper of the dropdown item.      |

### igc-dropdown-group

A container for a group of dropdown items.

| Property | Attribute | Reflected | Type                              | Description             |
| -------- | --------- | --------- | --------------------------------- | ----------------------- |
| items    | -         | No        | `Array<IgcDropdownItemComponent>` | Read-only. All child dropdown items. |

| Slot      | Description                                        |
| --------- | -------------------------------------------------- |
| `label`   | Contains the label of the group.                   |
| (default) | The items belonging to this group.                 |

| Part    | Description               |
| ------- | ------------------------- |
| `label` | The native label element. |

### igc-dropdown-header

Represents a header item in a dropdown list. It renders its default slot and takes no properties.

## Test scenarios

The suite lives in [`dropdown.spec.ts`](./dropdown.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### DOM

1. The component renders its target, list, items, groups and headers as expected.
2. The list is rendered in the top layer and is hidden while closed.

### Accessibility tests

3. The component passes the accessibility audit in the closed and open states.
4. The list, items and groups expose their expected roles and states.

### Initial selection

5. An item marked `selected` in markup becomes the initial selection.
6. The selection survives closing and reopening the list.

### API tests

7. `show`, `hide` and `toggle` transition the open state and resolve with whether it changed.
8. `show` and `toggle` accept a target element and an IDREF.
9. `select` selects by value and by index, and returns the item or `null`.
10. `navigateTo` activates by value and by index without changing the selection.
11. `clearSelection` clears the current selection.
12. `items`, `groups` and `selectedItem` report the current state.

### Groups and headers tests

13. Grouped items are reported both by the group and by the dropdown.
14. Headers are rendered and are not selectable or navigable.

### User interactions

15. Clicking an item selects it and closes the list.
16. `keepOpenOnSelect` keeps the list open after a selection.
17. Clicking outside closes the list, unless `keepOpenOnOutsideClick` is set.
18. Disabled items cannot be selected and are skipped by the keyboard navigation.
19. The arrow keys, <kbd>Home</kbd> and <kbd>End</kbd> move the active item; <kbd>Enter</kbd> selects it;
    <kbd>Escape</kbd> closes without changing the selection.

### Items collection changes

20. Items added or removed at run time are picked up by the component.
21. Removing the selected item updates the reported selection.

### Events tests

22. `igcChange` is emitted when the selection changes through interaction.
23. `igcOpening` and `igcClosing` are emitted and can be canceled.
24. `igcOpened` and `igcClosed` are emitted after the transition.
25. Issue #1123.

### Detached anchor

26. A dropdown with a non-slotted anchor positions and behaves the same as one with a slotted target.

### Scroll strategy tests

27. `hide`, `scroll` and `close` behave as specified while an ancestor scrolls.

## Assumptions and limitations

- Only single selection is supported.
- Keyboard navigation with the arrow keys does not change the selection; <kbd>Enter</kbd> commits it.
- <kbd>Escape</kbd> closes the list but does not update the selection.
- <kbd>Page Up</kbd> and <kbd>Page Down</kbd> are not handled.
- The dropdown is not a form-associated element and submits nothing.

## Accessibility

### ARIA roles and properties

- The dropdown list has a `listbox` role, the items an `option` role, and the groups a `group` role.
- The selected item carries `aria-selected`.
- The target exposes the expanded state and the active descendant relation to the list.
- The dropdown itself has no tab index and is not focusable, so the target keeps the focus.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The placement variants
follow the inline direction.

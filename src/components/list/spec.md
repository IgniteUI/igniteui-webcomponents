# List specification

This directory hosts three public components: [`igc-list`](#igc-list), [`igc-list-item`](#igc-list-item) and
[`igc-list-header`](#igc-list-header).

- [List specification](#list-specification)
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
      - [Item structure](#item-structure)
      - [Headers](#headers)
      - [Selection](#selection)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-list](#igc-list)
    - [igc-list-item](#igc-list-item)
    - [igc-list-header](#igc-list-header)
  - [Test scenarios](#test-scenarios)
    - [List with items](#list-with-items)
    - [List with items and headers](#list-with-items-and-headers)
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

The `igc-list` displays a collection of data items in a templatable list format. Each row is an `igc-list-item`, and
sections can be introduced with an `igc-list-header`.

The list is a layout and semantics container. It does not own a data source, does not virtualize, and does not
manage the selection of its items; each item carries its own selected state.

### Key features

- **Structured items**: a start area, a title, a subtitle, custom content and an end area.
- **Section headers** that separate groups of items.
- **Per-item selected state**, reflected for styling.
- **Themeable** through shadow parts for every region of an item.

### Acceptance criteria

- The list must render its projected items and headers in DOM order.
- An item must expose a start area, a title, a subtitle, an end area and a custom content area.
- The selected state of an item must be settable and reflected.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to:

- see a collection of items as a vertical list.
- see each item with its leading visual, its title and its supporting text.
- see the items grouped under headers where that applies.
- see which items are selected.

### Developer stories

As a developer, I expect to be able to:

- render a collection of items as a list.
- give each item a leading visual, a title, a subtitle and trailing actions.
- put arbitrary content in an item when the structured slots do not fit.
- separate sections of the list with headers.
- mark items as selected.

## Functionality

### End-user experience

The list renders its items stacked vertically. Each item shows its start content, then the title and subtitle block
or the custom content, and finally the end content. Headers separate the sections.

### Developer experience

#### Basic initialization

```html
<igc-list>
  <igc-list-item>
    <span slot="title">First item</span>
  </igc-list-item>
  <igc-list-item>
    <span slot="title">Second item</span>
  </igc-list-item>
</igc-list>
```

#### Item structure

```html
<igc-list-item>
  <igc-avatar slot="start" src="avatar.jpg"></igc-avatar>
  <span slot="title">Jane Doe</span>
  <span slot="subtitle">Product designer</span>
  <igc-icon-button slot="end" name="more"></igc-icon-button>
</igc-list-item>
```

Content placed in the default slot renders alongside the title and subtitle block, for rows that need a custom
layout.

#### Headers

```html
<igc-list>
  <igc-list-header>Team</igc-list-header>
  <igc-list-item>...</igc-list-item>

  <igc-list-header>Guests</igc-list-header>
  <igc-list-item>...</igc-list-item>
</igc-list>
```

#### Selection

```html
<igc-list-item selected>...</igc-list-item>
```

The property is reflected, so the selected state can be styled from the application. The list itself does not manage
the selection.

### Localization

The components render no strings of their own; all content comes from the application.

### Keyboard interactions

None of their own. Interactive content projected into an item keeps its native keyboard behavior.

## API

### igc-list

Displays a collection of data items in a templatable list format.

| Slot      | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| (default) | Renders the list items and list headers inside the default slot.  |

### igc-list-item

A container intended for row items in the list component.

| Property | Attribute | Reflected | Type      | Default | Description                              |
| -------- | --------- | --------- | --------- | ------- | ------------------------------------------ |
| selected | selected  | Yes       | `boolean` | false   | Defines whether the list item is selected. |

| Slot       | Description                               |
| ---------- | ----------------------------------------- |
| (default)  | Renders custom content.                   |
| `start`    | Renders content before all other content. |
| `end`      | Renders content after all other content.  |
| `title`    | Renders the title.                        |
| `subtitle` | Renders the subtitle.                     |

| Part       | Description                              |
| ---------- | ---------------------------------------- |
| `start`    | The start container.                     |
| `end`      | The end container.                       |
| `content`  | The header and custom content container. |
| `header`   | The title and subtitle container.        |
| `title`    | The title container.                     |
| `subtitle` | The subtitle container.                  |

### igc-list-header

A header list item.

| Slot      | Description                              |
| --------- | ---------------------------------------- |
| (default) | Renders the content of the header item.  |

## Test scenarios

The suite lives in [`list.spec.ts`](./list.spec.ts) and runs in a real browser through `@web/test-runner` with
`@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### List with items

1. A list of items renders its structure and passes the accessibility audit.
2. The item slots render into their containers.

### List with items and headers

3. A list combining items and headers renders both in DOM order and passes the accessibility audit.

### Not covered by the suite

The `selected` property of the item has no dedicated case.

## Assumptions and limitations

- The list does not own a data source and does not virtualize. For large collections use
  [`igc-virtual-scroll`](../virtualization/spec.md).
- Selection state lives on the individual items; the list neither enforces nor tracks it.
- The list does not manage focus or keyboard navigation between the items.

## Accessibility

### ARIA roles and properties

- The list exposes list semantics, and its items are exposed as list items, so assistive technology announces the
  size of the collection and the position within it.
- Headers label the section that follows them.
- Interactive content projected into an item keeps its own semantics and needs an accessible name.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The start and end areas of
an item follow the inline direction.

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
      - [Keyboard navigation](#keyboard-navigation)
      - [Empty state](#empty-state)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-list](#igc-list)
    - [igc-list-item](#igc-list-item)
    - [igc-list-header](#igc-list-header)
  - [Test scenarios](#test-scenarios)
    - [List with items](#list-with-items)
    - [List with items and headers](#list-with-items-and-headers)
    - [Headers](#headers-1)
    - [Item structure](#item-structure-1)
    - [Hidden attribute](#hidden-attribute)
    - [Items far from the view](#items-far-from-the-view)
    - [Listbox navigation](#listbox-navigation)
    - [Value state motion](#value-state-motion)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                            |
| ------: | ---------- | ------------------------------------------------ |
|       1 | 2026-09-21 | Initial specification                            |
|       2 | 2026-10-05 | A header has the `listitem` role                 |
|       3 | 2026-10-05 | The title and subtitle container adds no role    |
|       4 | 2026-10-21 | API descriptions aligned with the JSDoc.         |
|       5 | 2026-11-12 | An item far from the view skips its rendering    |
|       6 | 2026-11-20 | A `selected` item from code shows at once; the hover still fades; no transitions with reduced motion; while a change shows at once, the transitions that the app sets on parts and slotted elements stop too |
|       7 | 2026-11-26 | Listbox navigation (`navigation`), the `empty` slot, item names from the title; the `hidden` attribute hides an item and a header |

## Overview

The `igc-list` displays a collection of data items in a templatable list format. Each row is an `igc-list-item`, and
sections can be introduced with an `igc-list-header`.

The list is a layout and semantics container. It does not own a data source, does not virtualize, and does not
manage the selection of its items; each item carries its own selected state. With `navigation="listbox"`, the list
also runs the keyboard model of an ARIA listbox: one tab stop, the arrow keys, type-ahead, and the selected state of
each item for assistive technology. The app still owns the selection.

### Key features

- **Structured items**: a start area, a title, a subtitle, custom content and an end area.
- **Section headers** that separate groups of items.
- **Per-item selected state**, reflected for styling.
- **Listbox navigation** (opt-in): one tab stop, the arrow keys, Home, End, type-ahead, activation with Enter and
  Space, and the selected state exposed to assistive technology.
- **Empty state** through the `empty` slot.
- **Themeable** through shadow parts for every region of an item.

### Acceptance criteria

- The list must render its projected items and headers in DOM order.
- An item must expose a start area, a title, a subtitle, an end area and a custom content area.
- The selected state of an item must be settable and reflected.
- With `navigation="listbox"`, the list must be one tab stop and follow the keyboard model of the APG listbox
  pattern, and each item must expose its selected state.
- The list must show the content of the `empty` slot while it has no items.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to:

- see a collection of items as a vertical list.
- see each item with its leading visual, its title and its supporting text.
- see the items grouped under headers where that applies.
- see which items are selected.
- move through the items with the keyboard, activate one with Enter or Space, and hear which item is selected.
- find out that a list is empty.

### Developer stories

As a developer, I expect to be able to:

- render a collection of items as a list.
- give each item a leading visual, a title, a subtitle and trailing actions.
- put arbitrary content in an item when the structured slots do not fit.
- separate sections of the list with headers.
- mark items as selected.
- turn on keyboard navigation with one property and keep my own selection logic.
- show a message while the list has no items.

## Functionality

### End-user experience

The list renders its items stacked vertically. Each item shows its start content, then the title and subtitle block
or the custom content, and finally the end content. Headers separate the sections.

**Keyboard navigation.** In a list with `navigation="listbox"`, Tab reaches one item: the item focused last, else the
first selected item, else the first item. The arrow keys, Home, End and typed letters move the focus between the
items, and Enter or Space activates the focused item. The next Tab leaves the list. The focused item shows a focus
ring, also when it is selected.

**Motion.** Code sets `selected`, so the item shows it at once, also on the first render. A list that reuses items while
it scrolls does not fade them. The hover still fades, and it turns back on in the first frame with no change from code.
With `prefers-reduced-motion: reduce`, nothing animates.

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
  <igc-list-header><h3>Team</h3></igc-list-header>
  <igc-list-item>...</igc-list-item>

  <igc-list-header><h3>Guests</h3></igc-list-header>
  <igc-list-item>...</igc-list-item>
</igc-list>
```

A heading in each header lets screen reader users move from group to group. See
[ARIA roles and properties](#aria-roles-and-properties).

#### Selection

```html
<igc-list-item selected>...</igc-list-item>
```

The property is reflected, so the selected state can be styled from the application. The list itself does not manage
the selection. In a list with keyboard navigation, `selected` is also the state that assistive technology reads.

#### Keyboard navigation

```html
<igc-list navigation="listbox" aria-label="Employees" aria-multiselectable="true">
  <igc-list-header>Team</igc-list-header>
  <igc-list-item selected>
    <span slot="title">Jane Doe</span>
    <span slot="subtitle">Product designer</span>
    <igc-checkbox slot="end" inert checked></igc-checkbox>
  </igc-list-item>
</igc-list>
```

- Enter and Space dispatch a `click` on the focused item, so the app toggles `selected` in its own `click` handler.
- Give the list a name with `aria-label` or `aria-labelledby`.
- Set `aria-multiselectable="true"` on the list when more than one item can be selected.
- An item holds no interactive content: assistive technology reads the content of an option as plain text. To show
  the selection with a checkbox, make it `inert` and bind it to `selected`. A click on it reaches the item.
- An item with a title is named by the title alone, and described by its subtitle and the header of its group. Put
  the important text in the title or the subtitle. An item without a title is named by its content.
- An `aria-label`, `aria-labelledby` or `aria-describedby` that the app sets on an item wins.

#### Empty state

```html
<igc-list navigation="listbox" aria-label="Search results">
  <span slot="empty">No results</span>
</igc-list>
```

The `empty` slot renders while the list has no items. Headers do not count. In a list with keyboard navigation, the
empty list is a tab stop, and its content is read as an option. When items arrive while the list has the focus, the
focus moves to them.

### Localization

The components render no strings of their own; all content comes from the application.

### Keyboard interactions

A static list (`navigation="none"`) has none of its own. Interactive content projected into an item keeps its native
keyboard behavior.

With `navigation="listbox"`, while an item has the focus:

| Key                  | Action                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| Down / Up            | The next / previous item. Stops at the ends. Headers and items that do not render are skipped. |
| Home / End           | The first / last item.                                                                         |
| Enter / Space        | Dispatches a `click` on the item, once per press. Space does not scroll the page.              |
| Printable characters | Type-ahead: the next item whose title (else its content) starts with the typed letters. A pause of half a second starts a new search. Space is a letter only during a search. |
| Tab / Shift+Tab      | Leaves the list.                                                                               |

When the focused item is removed, the focus moves to the item that took its place, else to the next item that
renders, else to the last item that renders, else to the empty list. After the focus went to no element, as after a
click on the page, a removal does not take it back.

## API

### igc-list

Displays a collection of data items in a templatable list format.

| Property   | Attribute  | Reflected | Type                   | Default  | Description                          |
| ---------- | ---------- | --------- | ---------------------- | -------- | ------------------------------------ |
| navigation | navigation | No        | `'none' \| 'listbox'` | `'none'` | The keyboard navigation of the list. |

| Slot      | Description                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| (default) | Renders the list items and list headers inside the default slot.             |
| `empty`   | Renders content while the list has no items, such as a "No results" message. |

### igc-list-item

A container intended for row items in the list component.

| Property | Attribute | Reflected | Type      | Default | Description                              |
| -------- | --------- | --------- | --------- | ------- | ------------------------------------------ |
| selected | selected  | Yes       | `boolean` | false   | Whether the list item is selected. It changes the visual style of the item. In a list with keyboard navigation, assistive technology also reads it as the selected state of the item. |

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

3. A list that mixes headers with nested content projects every child and passes the accessibility audit.

### Headers

4. A header has the `listitem` role, the only role that a list owns.

### Item structure

5. The title and subtitle container is a `div`, so it adds no role around the title and the subtitle.

### Hidden attribute

6. The `hidden` attribute hides an item and a header, and a hidden item does not hold the tab stop.

### Items far from the view

7. An item far from the view skips its rendering; an item in view renders.
8. An item renders when it scrolls into view, and the item that left the view skips its rendering again.

### Listbox navigation

Roles and states:

9. The list is a `listbox`, and its items are options whose `aria-selected` follows `selected`.
10. The headers are hidden from assistive technology.
11. An item is named by its title, and described by its subtitle and the header of its group.
12. An item without a title is named by its content, and described by its header.
13. An `aria-label` of the app names an item that has a title, and the subtitle and the header still describe it.
14. The list writes no ARIA attribute, so an attribute that the app sets wins.
15. The list passes the accessibility audit.

Static list:

16. A list without navigation keeps the `list` and `listitem` roles, and its items stay out of the tab order.
17. It ignores the navigation keys.

Tab stop:

18. With no selected item, the first item is the tab stop.
19. The first selected item is the tab stop.
20. The item focused last keeps the tab stop, also after a selection elsewhere.
21. An item with the `hidden` attribute is not the tab stop.
22. A tab stop item that gets the `hidden` attribute gives the tab stop to the next item.
23. One Tab reaches the list and the next leaves it, in both directions (real key presses).

Keyboard:

24. Up and Down move over the headers and stop at the ends.
25. Home and End jump to the first and the last item.
26. An item that does not render is skipped.
27. Enter and Space click the focused item once per press, and a repeated key does not click again.
28. Space and the arrow keys do not scroll the page.
29. The keys of content inside an item move nothing and click nothing.

Type-ahead:

30. Typed letters move to the item whose title starts with them.
31. A letter typed again cycles through the items that start with it.
32. The title counts, not the subtitle; an item without a title counts its content.
33. A pause starts a new search.
34. A Space during a search is a letter, not a click.

Empty list:

35. The `empty` content shows as an option while the list has no items, and goes when an item arrives.
36. The empty list is a tab stop, and gives the tab stop to the first item that arrives.
37. The focus moves to the items that arrive while the empty list has it.
38. The focus also moves to an item that rendered before and comes back.
39. The list gives back the `tabindex` of its host.
40. Without content, and in a static list, the empty container has no role.
41. The empty list passes the accessibility audit (see below).

Removal of the focused item:

42. The focus moves to the item that took its place.
43. The focus moves to the new last item.
44. The focus skips a next item that does not render.
45. The focus moves to an item that replaces the focused one.
46. After the focus went to no element, the removal does not take it back.
47. The focus moves to the list when no item is left.
48. The removal of another item leaves the focus alone.
49. The removal of the tab stop item without the focus moves only the tab stop.

Ownership:

50. The list navigates items inside wrapper elements.
51. The list leaves the items of a nested list to it.

Change of the navigation:

52. The navigation turns on at runtime.
53. Turning it off removes every role, state and `tabindex` that the list set, and gives back the app's `tabindex`.

Focus ring:

54. The item that the keyboard focused shows the ring (with the Bootstrap palette adopted).
55. The empty list that has the focus shows the ring.

### Value state motion

Generated by `runValueStateMotionTests` in the Material theme. A hover is the user interaction that animates.

56. A hover starts transitions.
57. A change from code starts none.
58. A first render in the changed state starts none.
59. With reduced motion, a hover starts none.

### Not covered by the suite

- The fixture of the third scenario nests `igc-list` elements between the headers instead of `igc-list-item`
  elements, and asserts only the number of projected children. The DOM order of a header and its items is not
  covered.
- axe does not read roles from `ElementInternals`, so the accessibility audits do not check the roles of the list,
  the items and the headers. The audit of the empty listbox ignores `aria-required-parent`, because axe does not see
  the `listbox` parent of the empty option; scenario 41 asserts the role directly.
- The suite reads the roles, states, names and descriptions from `ElementInternals`. What a screen reader announces
  is not covered.
- The `selected` property of the item has no dedicated case.

## Assumptions and limitations

- While a change from code shows at once, the control turns off every transition in its shadow tree and on its
  slotted elements with `!important`. A transition that the app sets with `::part()` or on slotted content does not
  run in those frames either. The transitions turn on again in the first frame with no change from code.
- The list does not own a data source and does not virtualize. For large collections use
  [`igc-virtual-scroll`](../virtualization/spec.md). An item that is far from the view skips its rendering
  (`content-visibility: auto`). Until its first render, it keeps about the space of an item with a title and a
  subtitle; after it, its real size. To render every item, set `content-visibility: visible` on `igc-list-item`.
- In a container that takes its width from its content, a long list takes the width of the items near the view, and
  the width can change while the user scrolls.
- `innerText` of an item that skips its rendering is an empty string. `textContent` works.
- In Safari before 26, which includes iOS 18, find-in-page does not find the text of an item that skips its
  rendering. Safari 26 and the other browsers find it.
- Selection state lives on the individual items; the list neither enforces nor tracks it.
- A static list does not manage focus or keyboard navigation between the items.
- In a list with keyboard navigation, an item holds no interactive content: an option exposes its content as plain
  text, and the list takes the keys of the item.
- The keyboard navigation does not cover the items of an `igc-virtual-scroll` inside the list: Home, End and
  type-ahead would reach only the rendered items. Do not set `navigation` on such a list.
- Items have no disabled state. An app that needs one sets `aria-disabled="true"` on the item and ignores its clicks.
- An item with the `hidden` attribute cannot hold the tab stop. An item hidden in another way, such as with
  `display: none`, can still hold it, so that Tab skips the list; hide items with `hidden`. The arrow keys, Home, End
  and type-ahead skip every item that does not render.
- Tools that read only ARIA attributes, such as Playwright locators, do not see the names and descriptions that the
  items set through `ElementInternals`.

## Accessibility

### ARIA roles and properties

- The list exposes list semantics, and its items are exposed as list items, so assistive technology announces the
  size of the collection and the position within it.
- A header exposes the `listitem` role, because a list can own only list items. Assistive technology reads the
  content of the header, and counts the header with the items. A heading in the header gives users a way to move
  from group to group. The header does not label the items that follow it.
- The containers in the shadow root of an item add no roles. The `start`, `content` and `end` parts are `section`
  elements without a name, and the `header` part is a `div`, so assistive technology finds only the list item and the
  projected content.
- Interactive content projected into an item keeps its own semantics and needs an accessible name.
- With `navigation="listbox"`, the list exposes the `listbox` role and its items the `option` role, with
  `aria-selected` from `selected`. The headers are hidden, and each item is described by the header of its group,
  so the positions count only the items. An item with a title is named by it and also described by its subtitle.
- The content of the `empty` slot is an option of the empty listbox, so assistive technology reads it when the list
  gets the focus.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The start and end areas of
an item follow the inline direction.

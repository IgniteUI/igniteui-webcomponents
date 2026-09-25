# Tree specification

- [Tree specification](#tree-specification)
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
      - [Selection](#selection)
      - [Expansion](#expansion)
      - [Active and focused item](#active-and-focused-item)
      - [Load on demand](#load-on-demand)
      - [Focusable content](#focusable-content)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Basic](#basic)
    - [Expand and collapse](#expand-and-collapse)
    - [Single branch expand](#single-branch-expand)
    - [Disabled item](#disabled-item)
    - [Selection tests](#selection-tests)
    - [Navigation tests](#navigation-tests)
    - [ARIA tests](#aria-tests)
    - [RTL tests](#rtl-tests)
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

The `igc-tree` presents hierarchical data as a tree view, keeping the parent-child relations of the data. It is
not data bound: the hierarchy is declared with nested `igc-tree-item` elements, which gives the developer full
control over what each item renders.

```html
<igc-tree selection="cascade">
  <igc-tree-item label="Documents" expanded>
    <igc-tree-item label="Invoices"></igc-tree-item>
    <igc-tree-item label="Contracts"></igc-tree-item>
  </igc-tree-item>
  <igc-tree-item label="Pictures"></igc-tree-item>
</igc-tree>
```

### Key features

- **Declarative hierarchy** of nested tree items, with no data binding and no item templates to configure.
- **Expansion** of single items, of a whole branch, or of the entire tree, with cancelable events.
- **Single branch expand**, which keeps at most one expanded item per level.
- **Selection** in three modes: none, multiple and cascade, the last one propagating the state up and down the
  hierarchy through an indeterminate state.
- **Active item**, distinct from the focused one, for marking a point of interest such as the current route.
- **Disabled items**, which take no user interaction and are skipped by the keyboard navigation.
- **Load on demand** support through a loading state that renders a progress indicator in place of the expand
  indicator.
- **Full keyboard navigation** with a roving tab index, and ARIA semantics that follow the focusable content of
  an item.

### Acceptance criteria

- The tree must render nested items in a hierarchy and keep each item aware of its level, parent and path.
- Items must expand and collapse from the UI and from code, and both must be preventable through the `*ing`
  events.
- The three selection modes must be supported, and cascade selection must keep ancestors in sync, including the
  indeterminate state.
- Selection must also be possible from code while user selection is turned off.
- Disabled items must take no user interaction, but must stay reachable through the API.
- The keyboard must reach every navigable item, and must scroll the target item into view when the tree scrolls.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see the items organized in a clear hierarchy, so that I understand how they relate to one another;
- expand and collapse items, so that only the information I need is on the screen;
- see which item is the active one, so that I can relate the tree to the rest of the screen;
- see whether all, some or none of the children of an item are selected;
- select several items at once, so that I can act on all of them together;
- select a parent and have its whole subtree follow, when cascade selection is on;
- reach and operate every item with the mouse or the keyboard alone.

### Developer stories

As a developer, I expect to be able to:

- declare a tree by nesting items, without binding it to a data source;
- template the content of an item, its expand indicator, its indentation and its loading indicator;
- read all items of the tree, the children of an item, and the full path of an item to the root;
- expand and collapse one, several or all items from code;
- turn user selection on and off, and choose between multiple and cascade selection;
- set the selection state of an item from code, even when user selection is off;
- prevent an expansion, a collapse or a selection change from a handler;
- mark an item as active and be notified when the active item changes;
- mark items as disabled so that they are ignored by user interaction;
- keep at most one expanded item per level with a single property;
- let a click anywhere on an item toggle it, instead of only the expand indicator;
- render links or buttons inside an item and keep the tree accessible.

## Functionality

### End-user experience

The tree renders each item as a row made of an indentation area, an expand indicator, an optional selection
checkbox and the label. The expanded and collapsed transitions are animated. The focused item and the active item
have distinct styles, and so do the selected items.

> [Design hand-off](https://share.goabstract.com/6c6e6d3f-ead5-445e-b43e-75699027f324)

### Developer experience

#### Basic initialization

Items are nested directly in one another. An item wrapped in another element is not part of the tree.

```html
<igc-tree>
  <igc-tree-item label="Parent">
    <igc-tree-item label="Child"></igc-tree-item>
  </igc-tree-item>
</igc-tree>
```

The `label` property renders the text of an item. For richer content, project it in the `label` slot.

```html
<igc-tree-item>
  <div slot="label">
    <img src="avatar.png" alt="" />
    <span>Custom content</span>
  </div>
</igc-tree-item>
```

#### Selection

The `selection` property takes `none`, `multiple` or `cascade`. Both selecting modes render a checkbox, which is
the only way an end-user can change the selection. With `cascade`, selecting an item selects its whole subtree and
updates every ancestor, marking the partially selected ones as indeterminate.

The `select()` and `deselect()` methods change the state without emitting `igcSelection`, and work in every mode,
including `none`. Called without arguments they apply to all items.

```ts
tree.select();                 // every item
tree.deselect([item, other]);  // only those two
```

Changing `selection` at runtime clears the current selection.

#### Expansion

`expanded` on an item is the state, and `expand()`, `collapse()` and `toggle()` are its shorthands. The tree-level
`expand()` and `collapse()` take an optional collection and otherwise apply to all items. None of these emit
events.

The user interaction path emits `igcItemExpanding` and `igcItemCollapsing` first. Both are cancelable, and
canceling one leaves the item as it was. The `igcItemExpanded` and `igcItemCollapsed` events follow the animation.

By default only the expand indicator toggles an item. With `toggleNodeOnClick`, a primary click anywhere on the
item toggles it, while a click on the selection checkbox still only changes the selection.

With `singleBranchExpand`, expanding an item collapses its expanded siblings. Turning the property on collapses
everything except the ancestors of the active item. Expansion through the API is not restricted by it.

#### Active and focused item

The tree keeps the two apart. The focused item is where the keyboard navigation currently is, and the active item
is the last one the user acted on. Setting `active` on an item makes it the active one, expands the path to it,
and scrolls it into view when the tree has a scrollbar. If several items are marked active in the markup, the last
one wins. The `igcActiveItem` event carries the new active item.

#### Load on demand

Setting `loading` on an item replaces its expand indicator with an `igc-circular-progress` in the indeterminate
state, or with the content of the `loading` slot. Adding the children later updates the item.

#### Focusable content

When the label of an item contains focusable elements, such as a link, the item moves its `treeitem` role and its
ARIA state onto the first of them and takes `role="none"` itself, so the element the screen reader announces is
also the one the keyboard reaches. Nothing has to be configured for this.

```html
<igc-tree-item>
  <a slot="label" href="https://www.infragistics.com">Infragistics</a>
</igc-tree-item>
```

### Localization

The tree takes its resource strings from the `igniteui-i18n-core` package through the `locale` and
`resourceStrings` properties. Without an explicit `locale`, it falls back to the global locale of the library.

| Key        | Default English value | Used for                                       |
| ---------- | --------------------- | ---------------------------------------------- |
| `expand`   | Expand                | The label of the expand indicator of an item.  |
| `collapse` | Collapse              | The label of the collapse indicator of an item. |

### Keyboard interactions

The tree has a single tab stop. Disabled items and items inside a collapsed branch are not part of the navigable
set. Moving the focus scrolls the target item into view when the tree scrolls.

| Keys                                        | Description                                                                               | Activates |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- | --------- |
| <kbd>↓</kbd>                                | Moves to the next navigable item.                                                          | yes       |
| <kbd>Ctrl</kbd> + <kbd>↓</kbd>              | The same, without changing the active item.                                                | no        |
| <kbd>↑</kbd>                                | Moves to the previous navigable item.                                                      | yes       |
| <kbd>Ctrl</kbd> + <kbd>↑</kbd>              | The same, without changing the active item.                                                | no        |
| <kbd>Home</kbd>                             | Moves to the first navigable item.                                                         | yes       |
| <kbd>End</kbd>                              | Moves to the last navigable item.                                                          | yes       |
| <kbd>→</kbd>                                | Expands a collapsed parent, or moves to its first enabled child when it is already expanded. | yes     |
| <kbd>←</kbd>                                | Collapses an expanded parent, or moves to the parent item.                                 | yes       |
| <kbd>\*</kbd>                               | Expands every enabled sibling of the focused item that has children.                       | no        |
| <kbd>Enter</kbd>                            | Activates the focused item. The default action is not prevented.                            | yes       |
| <kbd>Space</kbd>                            | Activates the focused item and toggles its selection when selection is enabled.             | yes       |
| <kbd>Shift</kbd> + <kbd>Space</kbd>         | Selects the range between the active item and the focused one.                              | yes       |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Leaves the tree for the next or the previous focusable element on the page.         | no        |

<kbd>Shift</kbd> + click on a checkbox selects the same range with the mouse.

## API

### Properties and attributes

`igc-tree`

| Property             | Attribute              | Reflected | Type                                  | Default  | Description                                              |
| -------------------- | ---------------------- | --------- | ------------------------------------- | -------- | -------------------------------------------------------- |
| `selection`          | `selection`            | yes       | `"none" \| "multiple" \| "cascade"`   | `none`   | The selection state of the tree.                          |
| `singleBranchExpand` | `single-branch-expand` | yes       | `boolean`                             | `false`  | Whether more than one item per level can be expanded.     |
| `toggleNodeOnClick`  | `toggle-node-on-click` | yes       | `boolean`                             | `false`  | Whether a click over an item toggles its expanded state.  |
| `items`              | —                      | —         | `IgcTreeItemComponent[]`              | —        | All items of the tree, in document order. Read-only.      |
| `locale`             | `locale`               | no        | `string`                              | —        | The locale of the resource strings.                       |
| `resourceStrings`    | —                      | —         | `ITreeResourceStrings`                | —        | The resource strings of the component.                    |

`igc-tree-item`

| Property   | Attribute  | Reflected | Type                            | Default | Description                                                    |
| ---------- | ---------- | --------- | ------------------------------- | ------- | -------------------------------------------------------------- |
| `label`    | `label`    | no        | `string`                        | `''`    | The text of the item, rendered when the label slot is empty.    |
| `value`    | `value`    | no        | `any`                           | —       | The value the item visualizes.                                  |
| `expanded` | `expanded` | yes       | `boolean`                       | `false` | The expansion state of the item.                                |
| `selected` | `selected` | yes       | `boolean`                       | `false` | The selection state of the item.                                |
| `active`   | `active`   | yes       | `boolean`                       | `false` | Marks the item as the active item of the tree.                  |
| `disabled` | `disabled` | yes       | `boolean`                       | `false` | Disabled items take no user interaction.                        |
| `loading`  | `loading`  | yes       | `boolean`                       | `false` | Renders a loading indicator, for load-on-demand scenarios.       |
| `level`    | —          | —         | `number`                        | `0`     | The depth of the item relative to the root.                     |
| `parent`   | —          | —         | `IgcTreeItemComponent \| null`  | `null`  | The parent item, when there is one.                             |
| `path`     | —          | —         | `IgcTreeItemComponent[]`        | —       | The path to the item, the top-most ancestor first. Read-only.   |
| `tree`     | —          | —         | `IgcTreeComponent \| undefined` | —       | The tree the item belongs to. Read-only.                        |

### Methods

`igc-tree`

| Method       | Signature                                   | Description                                                            |
| ------------ | ------------------------------------------- | ---------------------------------------------------------------------- |
| `select`     | `(items?: IgcTreeItemComponent[]): void`    | Selects the passed items, or all of them. Emits no event.               |
| `deselect`   | `(items?: IgcTreeItemComponent[]): void`    | Deselects the passed items, or all of them. Emits no event.             |
| `expand`     | `(items?: IgcTreeItemComponent[]): void`    | Expands the passed items, or all of them.                               |
| `collapse`   | `(items?: IgcTreeItemComponent[]): void`    | Collapses the passed items, or all of them.                             |

`igc-tree-item`

| Method        | Signature                                                    | Description                                          |
| ------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `getChildren` | `(options?: { flatten: boolean }): IgcTreeItemComponent[]`   | The direct children, or the whole subtree when flattened. |
| `expand`      | `(): void`                                                   | Expands the item.                                    |
| `collapse`    | `(): void`                                                   | Collapses the item.                                  |
| `toggle`      | `(): void`                                                   | Toggles the expansion state of the item.             |

### Events

All events are emitted by `igc-tree`, including those caused by an item.

| Event               | Detail                     | Cancelable | Description                                                    |
| ------------------- | -------------------------- | ---------- | -------------------------------------------------------------- |
| `igcSelection`      | `{ newSelection: Item[] }` | yes        | The selection is about to change through user interaction.      |
| `igcItemExpanding`  | `IgcTreeItemComponent`     | yes        | An item is about to expand.                                     |
| `igcItemExpanded`   | `IgcTreeItemComponent`     | no         | An item has expanded and its animation has finished.             |
| `igcItemCollapsing` | `IgcTreeItemComponent`     | yes        | An item is about to collapse.                                    |
| `igcItemCollapsed`  | `IgcTreeItemComponent`     | no         | An item has collapsed and its animation has finished.            |
| `igcActiveItem`     | `IgcTreeItemComponent`     | no         | The active item of the tree has changed.                         |

### Slots

| Component       | Name          | Description                                                     |
| --------------- | ------------- | --------------------------------------------------------------- |
| `igc-tree`      | default       | The tree items.                                                  |
| `igc-tree-item` | default       | The nested tree items.                                           |
| `igc-tree-item` | `label`       | The content of the item, in place of the `label` property.        |
| `igc-tree-item` | `indicator`   | The expand indicator of the item.                                 |
| `igc-tree-item` | `loading`     | The loading indicator of the item.                                |
| `igc-tree-item` | `indentation` | The area before the item, empty by default.                       |

### CSS Shadow parts

`igc-tree` exposes no parts of its own. `igc-tree-item` exposes:

| Part        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `wrapper`   | The wrapper of the item.                                      |
| `selected`  | Marks the selected state. Applies to `wrapper`.               |
| `focused`   | Marks the focused state. Applies to `wrapper`.                |
| `active`    | Marks the active state. Applies to `wrapper`.                 |
| `indicator` | The expand indicator.                                         |
| `label`     | The content area of the item.                                 |
| `text`      | The text rendered from the `label` property.                  |
| `select`    | The checkbox of the item, when selection is enabled.          |

## Test scenarios

The suite of the component lives in four files. `tree-utils.spec.ts` holds no tests; it is the shared helper
module with the fixtures, the selectors and the assertion helpers the other three use.

| Suite            | File                       |
| ---------------- | -------------------------- |
| `Tree`           | `tree.spec.ts`             |
| `Tree Selection` | `tree-selection.spec.ts`   |
| `Tree Navigation`| `tree-navigation.spec.ts`  |

### Basic

1. The tree renders its items, and an item reports its full ancestor path, root first.
2. Several levels of nesting are supported, and each item computes its `path` and `level` from the hierarchy.
3. The `value` and `label` properties are settable, and the label renders as text.
4. The children of a collapsed item are not rendered, and an item with no children renders no expand indicator.
5. With `selection` set to `none` no select marker is rendered.
6. The default expand indicator and the default select marker follow the state of the item.
7. The `indicator`, `indentation`, `label` and `loading` slots accept custom content.
8. `igcActiveItem` is emitted when the active item changes, and the last item marked active in the markup wins.
9. An item marked active initially, or activated through the API, is scrolled into view in both directions when
   the tree has a scrollbar.
10. Adding and removing items recomputes the collection of visible items.
11. An item wrapped in another element is not recognized as a child.

### Expand and collapse

12. `tree.expand()` and `tree.collapse()` apply to every item, disabled ones included, and their overloads apply
    only to the passed items.
13. A click on the expand indicator toggles the item in both directions.
14. Setting `expanded` and calling `expand()`, `collapse()` and `toggle()` change the state from code.
15. With `toggleNodeOnClick`, a click on the item toggles it; without it, only the indicator does.
16. A right click does not toggle an item, and neither does a click on its checkbox.
17. Turning `toggleNodeOnClick` on or off at runtime keeps a single toggle per indicator click.
18. `igcItemExpanding` and `igcItemCollapsing` can be canceled.

### Single branch expand

19. With `singleBranchExpand`, only one item per level stays expanded.
20. Setting `active` expands the path to the item and keeps the other branches as they were.
21. Expanding through the API does not collapse the currently expanded items.
22. Turning the property on collapses everything except the ancestors of the active item.

### Disabled item

23. A disabled item can still be selected, activated and expanded through the API.
24. A disabled item takes no user interaction.
25. <kbd>→</kbd> does not move the focus when every child of the expanded item is disabled, and moves it to the
    first enabled child otherwise.
26. <kbd>↑</kbd> and <kbd>↓</kbd> skip the disabled items.
27. <kbd>\*</kbd> expands only the enabled expandable items of the group.

### Selection tests

28. All three selection modes are settable, and changing the mode clears the selection.
29. `select()` and `deselect()` apply to all items or to the passed ones.
30. Deleting an item keeps its selection state.
31. In multiple mode, `selected` is settable, a click on the checkbox toggles the item and emits `igcSelection`
    with the new selection, and the event can be canceled.
32. <kbd>Shift</kbd> + click selects the range, and in multiple mode does not select the children of the parents
    in it; with no previous selection it selects a single item.
33. In cascade mode, selecting an item selects its children, and selecting or deselecting all children of a
    parent updates that parent and every ancestor.
34. An initially selected nested item puts its ancestors into the correct state.
35. Adding and removing children updates the state of the ancestors, including the indeterminate one.
36. In cascade mode, <kbd>Shift</kbd> + click selects the children of the parents in the range as well.
37. Removing a subtree reconciles the selection in a single pass and updates the ancestors; moving a subtree
    keeps its state.

### Navigation tests

38. Connecting the tree does not move the DOM focus into it, but seeds the roving tab index on the first enabled
    item, which takes focus when the user tabs in.
39. The navigable set skips disabled items but still descends into their subtrees, and never enters a collapsed
    branch.
40. The navigable set is walked in document order, and <kbd>End</kbd> lands on its last item.
41. When the focused item is collapsed out of view, moving forward lands on the first navigable item and moving
    backward stays.
42. <kbd>Home</kbd> and <kbd>End</kbd> focus and activate the first and the last item.
43. <kbd>←</kbd> does nothing on a collapsed root item, and moves to the parent of an expanded one.
44. <kbd>→</kbd> does nothing on an item with no children, expands a collapsed one, and moves to the first child
    of an expanded one.
45. <kbd>↑</kbd> and <kbd>↓</kbd> move the focus and the active item, and with <kbd>Ctrl</kbd> move only the focus.
46. <kbd>\*</kbd> expands the siblings of the focused item.
47. <kbd>Enter</kbd> activates the focused item.
48. <kbd>Space</kbd> only activates the item when `selection` is `none`, and also toggles the selection otherwise.
49. <kbd>Shift</kbd> + <kbd>Space</kbd> selects the range and moves the active item.
50. An item whose label holds tabbable elements assigns them the correct tab index on focus.

### ARIA tests

51. The tree and its items render the correct roles and attributes.
52. `aria-expanded` follows the expansion state of an item.
53. Selection is not advertised when `selection` is `none`, `aria-selected` follows the state otherwise, and the
    attribute is dropped when selection is turned back off.
54. `aria-disabled` follows the disabled state.
55. The ARIA state moves onto the focusable label element together with the role.
56. The default state, the state with selection enabled and the state with disabled items each pass the
    accessibility audit.

### RTL tests

57. The expand indicator mirrors after the direction changes at runtime.
58. <kbd>→</kbd> collapses and <kbd>←</kbd> expands when the direction is right to left.

### Not covered by the suite

- The `loading` state and the `loading` slot are exercised only through the slot rendering test; there is no
  load-on-demand scenario in the suite.
- The `locale` and `resourceStrings` properties are not covered; the indicator labels are asserted against their
  default English values.

## Assumptions and limitations

- The tree is not data bound. The hierarchy is the DOM, and items must be nested directly in one another; an item
  inside a wrapper element is not part of the tree.
- End-user selection is only possible through the checkbox of an item. A click on the label never changes the
  selection.
- The tree is not virtualized. Every item is rendered, so very large hierarchies should be built with load on
  demand.
- Cascade selection derives the state of a parent from its children, so setting `selected` on a parent and on a
  child inconsistently resolves in favor of the cascade.
- The tree does not restrict what an item renders, so the developer is responsible for the accessibility of any
  custom label content beyond the role delegation the item performs.

## Accessibility

### ARIA roles and properties

- The tree has `role="tree"`, and `aria-multiselectable` while `selection` is not `none`.
- An item has `role="treeitem"`, and the container of its children has `role="group"`, which is inert while the
  item is collapsed.
- An item whose label contains focusable elements moves the `treeitem` role and its ARIA state onto the first of
  them, and takes `role="none"` itself.
- `aria-expanded` is rendered only for items with children, `aria-selected` only while selection is enabled, and
  `aria-disabled` only for disabled items.
- The indentation area, the expand indicator and the selection checkbox are hidden from assistive technology; the
  indicator icon carries the localized expand or collapse label.
- A label or a heading associated with the tree has to be linked by the developer with `aria-labelledby`.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The expand indicator is
mirrored, and <kbd>←</kbd> and <kbd>→</kbd> swap their meaning.

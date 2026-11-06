# igc-tree

The tree allows users to represent hierarchical data in a tree-view structure,
maintaining parent-child relationships, as well as to define static tree-view structure without a corresponding data model.

```ts
import { defineComponents, IgcTreeComponent } from 'igniteui-webcomponents';

defineComponents(IgcTreeComponent);
```

## Properties

- `singleBranchExpand`: `boolean`. Default: `false`. Attribute: `single-branch-expand`, reflected.
  Whether only one branch of the tree can be expanded at a time. When the user
  expands an item, the items outside its path collapse.
- `toggleNodeOnClick`: `boolean`. Default: `false`. Attribute: `toggle-node-on-click`, reflected.
  Whether a click on an item toggles its expanded state.
- `selection`: `'none' | 'multiple' | 'cascade'`. Default: `'none'`. Attribute: `selection`, reflected.
  The selection mode of the tree. A change clears the current selection.
- `items`: `IgcTreeItemComponent[]`. Read-only. No attribute.
  All items of the tree, in document order. Empty during server-side rendering.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<ITreeResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Methods

- `select(items?: IgcTreeItemComponent[]): void`
  Selects the passed items. Without an argument, selects all items. Emits no event.
- `deselect(items?: IgcTreeItemComponent[]): void`
  Deselects the passed items. Without an argument, deselects all items. Emits no event.
- `expand(items?: IgcTreeItemComponent[]): void`
  Expands all of the passed items.
  If no items are passed, expands ALL items.
- `collapse(items?: IgcTreeItemComponent[]): void`
  Collapses all of the passed items.
  If no items are passed, collapses ALL items.

## Events

- `igcSelection`
  Emitted when item selection is changing, before the selection completes. Cancelable.
- `igcItemCollapsed`
  Emitted when tree item is collapsed.
- `igcItemCollapsing`
  Emitted when tree item is about to collapse. Cancelable.
- `igcItemExpanded`
  Emitted when tree item is expanded.
- `igcItemExpanding`
  Emitted when tree item is about to expand. Cancelable.
- `igcActiveItem`
  Emitted when the tree's `active` item changes.

## Slots

- default: Renders the tree items inside default slot.

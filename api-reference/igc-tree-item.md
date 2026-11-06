# igc-tree-item

The tree-item component represents a child item of the tree component or another tree item.

```ts
import { defineComponents, IgcTreeItemComponent } from 'igniteui-webcomponents';

defineComponents(IgcTreeItemComponent);
```

## Properties

- `tree`: `IgcTreeComponent | undefined`. Read-only. No attribute.
  A reference to the tree the item is a part of.
- `parent`: `IgcTreeItemComponent | null`. Default: `null`. No attribute.
  The parent item of the current tree item (if any)
- `level`: `number`. Default: `0`. No attribute.
  The depth of the item, relative to the root.
- `label`: `string`. Default: `''`. Attribute: `label`.
  The tree item label.
- `expanded`: `boolean`. Default: `false`. Attribute: `expanded`, reflected.
  Whether the tree item is expanded.
- `active`: `boolean`. Default: `false`. Attribute: `active`, reflected.
  Whether the item is the active item of the tree. When true, the ancestors of
  the item expand.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the tree item is disabled. A disabled item does not respond to user interaction.
- `selected`: `boolean`. Default: `false`. Attribute: `selected`, reflected.
  Whether the tree item is selected.
- `loading`: `boolean`. Default: `false`. Attribute: `loading`, reflected.
  Whether the item is loading data, for load-on-demand scenarios. The item
  shows a loading indicator in place of the expand indicator.
- `value`: `any`. Attribute: `value`.
  The value that the tree item represents. The component does not use it.
- `path`: `IgcTreeItemComponent[]`. Read-only. No attribute.
  The full path to the tree item, starting from the top-most ancestor.

## Methods

- `getChildren(options: { flatten: boolean } = { flatten: false }): IgcTreeItemComponent[]`
  Returns the child items. With `flatten: true` it returns all the
  descendant items, otherwise only the direct children.
- `toggle(): void`
  Toggles tree item expansion state.
- `expand(): void`
  Expands the tree item.
- `collapse(): void`
  Collapses the tree item.

## Slots

- default: Renders nested tree-item component.
- `label`: Renders the content of the tree item, in place of the `label` property.
- `indicator`: Renders the expand indicator container.
- `loading`: Renders the tree item loading indicator container.
- `indentation`: Renders the container (by default the space) before the tree item.

## CSS parts

- `wrapper`: The wrapper for the tree item.
- `indentation`: The indentation area before the tree item.
- `selected`: Indicates selected state. Applies to `wrapper`.
- `focused`: Indicates focused state. Applies to `wrapper`.
- `active`: Indicates an active state. Applies to `wrapper`.
- `indicator`: The expand indicator of the tree item.
- `label`: The tree item content.
- `text`: The tree item displayed text.
- `select`: The checkbox of the tree item when selection is enabled.

# igc-tile-manager

The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.

```ts
import { defineComponents, IgcTileManagerComponent } from 'igniteui-webcomponents';

defineComponents(IgcTileManagerComponent);
```

## Properties

- `resizeMode`: `'none' | 'hover' | 'always'`. Default: `'none'`. Attribute: `resize-mode`.
  The resize mode of the tiles. `none` turns resizing off.
- `dragMode`: `'none' | 'tile-header' | 'tile'`. Default: `'none'`. Attribute: `drag-mode`.
  The drag mode of the tiles. `none` turns drag and drop off.
- `columnCount`: `number`. Default: `0`. Attribute: `column-count`.
  The number of columns, truncated to a whole number. A value of 0 or less
  gives a responsive layout.
- `minColumnWidth`: `string | undefined`. Attribute: `min-column-width`.
  The minimum width of a column.
- `minRowHeight`: `string | undefined`. Attribute: `min-row-height`.
  The minimum height of a row.
- `gap`: `string | undefined`. Attribute: `gap`.
  The gap between the tiles.
- `locale`: `string`. Attribute: `locale`.
  The locale of the tiles. A tile without its own locale takes this one.
  Without it, the manager takes its own `lang`, else the locale of the
  nearest ancestor that has a `locale` (a component) or a `lang`, and then
  the global locale.
- `tiles`: `IgcTileComponent[]`. Read-only. No attribute.
  The tiles, sorted by their position in the layout.

## Methods

- `saveLayout(): string`
  Returns the tile properties as a JSON string. The content of the tiles is not saved.
- `loadLayout(data: string): void`
  Applies a layout from `saveLayout` to the tiles with the same `id`. Invalid JSON throws.

## Slots

- default: Default slot for the tile manager. Only tile elements are projected inside the CSS grid container.

## CSS parts

- `base`: The tile manager CSS Grid container.
- `maximized-tile`: Indicates that a tile is maximized. Applies to `base`.

## CSS custom properties

- `--column-count`: The number of columns for the tile manager, a whole number. The `column-count` attribute sets this variable. Without the attribute, set it in a style sheet, for example in a media query. `initial` gives the responsive layout.
- `--min-col-width`: The minimum width of the columns. The `min-column-width` attribute sets this variable.
- `--min-row-height`: The minimum height of the rows. The `min-row-height` attribute sets this variable.
- `--grid-gap`: The gap size of the underlying CSS grid container. The `gap` attribute sets this variable.
- `--grid-padding`: The padding of the underlying CSS grid container. Defaults to 1.25rem. The default resize handles stand out of the tiles by at most this value, and stay inside with more than one value.

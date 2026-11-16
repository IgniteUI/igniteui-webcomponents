# igc-tile

The tile component is used within the tile manager as a container
for displaying various types of information.

```ts
import { defineComponents, IgcTileComponent } from 'igniteui-webcomponents';

defineComponents(IgcTileComponent);
```

## Properties

- `colSpan`: `number`. Default: `1`. Attribute: `col-span`.
  The number of columns the tile spans. A value is truncated to a whole
  number, at least 1. The tile spans at most the columns from its start to
  the last column, and the value stays.
- `rowSpan`: `number`. Default: `1`. Attribute: `row-span`.
  The number of rows the tile spans. A value is truncated to a whole
  number, at least 1.
- `colStart`: `number | null`. Default: `null`. Attribute: `col-start`.
  The start column of the tile. A value below 1 removes the explicit start.
  A start after the last column moves the tile back so that its span fits,
  and the value stays. A resize that changes the column span of such a tile
  sets the start to the column where the tile is.
- `rowStart`: `number | null`. Default: `null`. Attribute: `row-start`.
  The start row of the tile. A value below 1 removes the explicit start.
- `fullscreen`: `boolean`. Read-only. No attribute.
  Whether the tile occupies the whole screen.
- `maximized`: `boolean`. Default: `false`. Attribute: `maximized`, reflected.
  Whether the tile occupies all available space within the layout.
- `disableResize`: `boolean`. Default: `false`. Attribute: `disable-resize`, reflected.
  Whether to disable resizing of the tile, whatever the resize mode of the
  manager.
- `disableFullscreen`: `boolean`. Default: `false`. Attribute: `disable-fullscreen`, reflected.
  Whether to hide the `fullscreen-action` slot and the default fullscreen
  action.
- `disableMaximize`: `boolean`. Default: `false`. Attribute: `disable-maximize`, reflected.
  Whether to hide the `maximize-action` slot and the default maximize action.
- `position`: `number`. Default: `-1`. Attribute: `position`.
  The visual position of the tile in the layout, as the CSS `order`. A value
  is truncated to a whole number.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<ITileResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Events

- `igcTileFullscreen`
  Fired when the fullscreen state changes, with the new state in `detail.state`. Cancelable before the default action changes it. Not cancelable after a change by the browser, for example on Escape.
- `igcTileMaximize`
  Fired before the default maximize action changes the maximized state, with the new state in `detail.state`. Cancelable.
- `igcTileDragStart`
  Fired when a drag operation on a tile is about to begin. Cancelable.
- `igcTileDragEnd`
  Fired when a drag completes, after its last swap applies.
- `igcTileDragCancel`
  Fired when a drag is canceled, for example on Escape, after the start positions are back.
- `igcTileResizeStart`
  Fired when a resize operation on a tile is about to begin. Cancelable.
- `igcTileResizeEnd`
  Fired when a resize operation on a tile is successfully completed.
- `igcTileResizeCancel`
  Fired when a resize is canceled, for example on Escape.

## Slots

- default: Default slot for the tile's content.
- `title`: Renders the title of the tile header.
- `maximize-action`: Renders the maximize action element of the tile header.
- `fullscreen-action`: Renders the fullscreen action element of the tile header.
- `actions`: Renders items after the default actions in the tile header.
- `side-adorner`: Renders the side resize handle of the tile.
- `corner-adorner`: Renders the corner resize handle of the tile.
- `bottom-adorner`: Renders the bottom resize handle of the tile.

## CSS parts

- `base`: The wrapper for the entire tile content, header and content.
- `header`: The container for the tile header, including title and actions.
- `title`: The title container of the tile.
- `actions`: The actions container of the tile header.
- `content-container`: The container wrapping the tile’s main content.
- `tile-container`: The wrapper around the tile content and its resize adorners. Present only while the tile can resize.
- `trigger-side`: The side resize handle of the tile.
- `trigger`: The corner resize handle of the tile.
- `trigger-bottom`: The bottom resize handle of the tile.
- `draggable`: Indicates that drag and drop is on. Applies to `base`.
- `resizable`: Indicates that resizing is on. Applies to `base`.
- `dragging`: Indicates a running drag operation. Applies to `base`.
- `resizing`: Indicates a running resize operation. Applies to `base`.
- `maximized`: Indicates the maximized state. Applies to `base`.
- `fullscreen`: Indicates the fullscreen state. Applies to `base`.
- `active`: Indicates that the resize adorners show. Applies to `tile-container`.
- `custom`: Indicates a slotted custom adorner. Applies to `trigger-side`, `trigger` and `trigger-bottom`.

# Tile manager specification

This directory hosts two public components: [`igc-tile-manager`](#igc-tile-manager) and [`igc-tile`](#igc-tile).

- [Tile manager specification](#tile-manager-specification)
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
      - [The grid](#the-grid)
      - [Spans and placement](#spans-and-placement)
      - [Drag and drop](#drag-and-drop)
      - [Resizing](#resizing)
      - [Maximize and fullscreen](#maximize-and-fullscreen)
      - [Serialization](#serialization)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-tile-manager](#igc-tile-manager)
    - [igc-tile](#igc-tile)
  - [Test scenarios](#test-scenarios)
    - [Initialization](#initialization)
    - [Column spans](#column-spans)
    - [Maximize](#maximize)
    - [Slot assignment](#slot-assignment)
    - [Tile state changes](#tile-state-changes)
    - [Serialization tests](#serialization-tests)
    - [API tests](#api-tests)
    - [Positioning](#positioning)
    - [Drag and drop tests](#drag-and-drop-tests)
    - [Resize tests](#resize-tests)
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

The `igc-tile-manager` enables the dynamic arrangement, resizing and interaction of tiles. It renders a CSS grid
container and lays its [`igc-tile`](#igc-tile) children out in it, each tile spanning a configurable number of
columns and rows.

End-users can rearrange the tiles by dragging them, resize them with the adorners on their edges, maximize a tile
within the layout or take it fullscreen. The resulting arrangement can be serialized and restored.

### Key features

- **Responsive CSS grid**: a fixed column count, or a responsive layout derived from a minimum column width.
- **Spans and placement**: per-tile column and row spans, and explicit start positions.
- **Drag and drop** reordering, with a configurable drag mode.
- **Resizing** through side, bottom and corner adorners, with a configurable resize mode.
- **Maximize and fullscreen** actions in the tile header, each disable-able per tile.
- **Serialization**: the whole layout can be saved to JSON and restored.
- **Cancelable interactions**: the drag and resize operations can be prevented before they begin.

### Acceptance criteria

- The manager must lay its tiles out in a CSS grid, with a fixed or a responsive column count.
- A tile must be able to span several columns and rows, and to be placed at an explicit start position.
- Drag and drop reordering and resizing must each be enable-able through their own mode property.
- A tile must be able to be maximized within the layout, and taken fullscreen.
- The drag and resize operations must emit cancelable start events and completion or cancellation events.
- The layout must be serializable to JSON and restorable from it.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a dashboard of tiles arranged in a grid.
- rearrange the tiles by dragging them to another place in the grid.
- resize a tile from its edges and its corner.
- maximize a tile to fill the layout, and restore it.
- take a tile fullscreen.
- have my arrangement preserved between visits, when the application saves it.

### Developer stories

As a developer, I expect to be able to:

- lay out a dashboard of tiles with a fixed or a responsive number of columns.
- set the gap, the minimum column width and the minimum row height of the grid.
- give each tile a column and row span, and an explicit position.
- enable or disable dragging and resizing.
- disable the maximize or the fullscreen action of an individual tile.
- template the tile header - its title, its actions and its resize adorners.
- cancel a drag or a resize before it starts.
- save the current layout and restore it later.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/design/aMomp13hi0ZSmwtPCqS0Wn/Tile-Manager-Handoff?m=auto&node-id=0-1&t=A9xXyQU0f3b8ZAYo-1)

The tiles are arranged in a grid. Each tile renders a header with its title and its actions - maximize and
fullscreen by default - and its content below. While dragging is enabled, a tile can be picked up and dropped in
another position, and the rest of the tiles reflow around it. While resizing is enabled, adorners appear on the
side, the bottom and the corner of a tile, and dragging them changes its span.

### Developer experience

#### Basic initialization

```html
<igc-tile-manager>
  <igc-tile>
    <span slot="title">Revenue</span>
    <p>The content of the tile.</p>
  </igc-tile>

  <igc-tile col-span="2" row-span="2">
    <span slot="title">Traffic</span>
    <p>A larger tile.</p>
  </igc-tile>
</igc-tile-manager>
```

#### The grid

```html
<igc-tile-manager column-count="4" min-column-width="200px" min-row-height="120px" gap="16px">
  ...
</igc-tile-manager>
```

A `columnCount` of zero or less produces a responsive layout derived from `minColumnWidth`. Each of these properties
is also exposed as a CSS custom property, so the grid can be driven from a stylesheet.

#### Spans and placement

```html
<igc-tile col-span="2" row-span="2" col-start="1" row-start="1">...</igc-tile>
```

`position` sets the visual order of a tile in the layout, corresponding to the CSS `order` property.

#### Drag and drop

```html
<igc-tile-manager drag-mode="tile">...</igc-tile-manager>
```

The drag mode selects what starts a drag - the whole tile, its header, or nothing. A drag emits
`igcTileDragStart`, which is cancelable, and then either `igcTileDragEnd` or `igcTileDragCancel`.

#### Resizing

```html
<igc-tile-manager resize-mode="always">...</igc-tile-manager>
```

Resizing is off by default. A tile can opt out with `disable-resize` regardless of the manager setting. The
adorners are exposed as slots and parts, so they can be replaced and styled. A resize emits `igcTileResizeStart`,
which is cancelable, and then either `igcTileResizeEnd` or `igcTileResizeCancel`.

#### Maximize and fullscreen

```html
<igc-tile maximized>...</igc-tile>
<igc-tile disable-maximize disable-fullscreen>...</igc-tile>
```

A maximized tile occupies all the available space within the layout; a fullscreen tile occupies the whole screen.
Both actions are rendered in the tile header and emit `igcTileMaximize` and `igcTileFullscreen`.

#### Serialization

```typescript
const manager = document.querySelector('igc-tile-manager')!;

const layout = manager.saveLayout();     // a JSON payload
localStorage.setItem('dashboard', layout);

manager.loadLayout(localStorage.getItem('dashboard')!);
```

### Localization

The components render no strings of their own; the titles and the content come from the application. The default
maximize and fullscreen actions are icon buttons and take their accessible names from the library resources.

### Keyboard interactions

The tile actions - maximize and fullscreen - are buttons and are activated with the standard button keys. Dragging
and resizing are pointer interactions.

## API

### igc-tile-manager

#### Properties and attributes

| Property       | Attribute         | Reflected | Type                      | Default | Description                                                               |
| -------------- | ----------------- | --------- | ------------------------- | ------- | --------------------------------------------------------------------------- |
| columnCount    | column-count      | No        | `number`                  | 0       | The number of columns. A value of zero or less triggers a responsive layout. |
| minColumnWidth | min-column-width  | No        | `string \| undefined`     | -       | The minimum width for a column unit.                                      |
| minRowHeight   | min-row-height    | No        | `string \| undefined`     | -       | The minimum height for a row unit.                                        |
| gap            | gap               | No        | `string \| undefined`     | -       | The gap size between the tiles.                                           |
| dragMode       | drag-mode         | No        | `TileManagerDragMode`     | `none`  | Whether drag and drop operations are enabled.                             |
| resizeMode     | resize-mode       | No        | `TileManagerResizeMode`   | `none`  | Whether resize operations are enabled.                                    |
| tiles          | -                 | No        | `IgcTileComponent[]`      | -       | Read-only. The tiles, sorted by their position in the layout.              |

#### Methods

| Name       | Type signature            | Description                                                          |
| ---------- | ------------------------- | ---------------------------------------------------------------------- |
| saveLayout | `(): string`              | Returns the properties of the current tile collection as a JSON payload. |
| loadLayout | `(data: string): void`    | Restores a previously serialized state produced by `saveLayout`.     |

#### Events

None applicable. The tiles emit the drag, resize, maximize and fullscreen events, which bubble through the manager.

#### Slots

| Name      | Description                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------- |
| (default) | Default slot for the tile manager. Only tile elements are projected inside the grid container. |

#### CSS Shadow parts

| Part   | Description                          |
| ------ | ------------------------------------ |
| `base` | The tile manager CSS grid container. |

#### CSS custom properties

| Property           | Description                                                                 |
| ------------------ | ----------------------------------------------------------------------------- |
| `--column-count`   | The number of columns. The `column-count` attribute sets this variable.     |
| `--min-col-width`  | The minimum size of the columns. The `min-column-width` attribute sets it.  |
| `--min-row-height` | The minimum size of the rows. The `min-row-height` attribute sets it.       |
| `--grid-gap`       | The gap of the underlying CSS grid. The `gap` attribute sets it.            |

### igc-tile

A container within the tile manager for displaying various types of information.

#### Properties and attributes

| Property          | Attribute           | Reflected | Type              | Default | Description                                                             |
| ----------------- | ------------------- | --------- | ----------------- | ------- | ------------------------------------------------------------------------- |
| colSpan           | col-span            | No        | `number`          | 1       | The number of columns the tile spans.                                   |
| rowSpan           | row-span            | No        | `number`          | 1       | The number of rows the tile spans.                                      |
| colStart          | col-start           | No        | `number \| null`  | `null`  | The starting column for the tile.                                       |
| rowStart          | row-start           | No        | `number \| null`  | `null`  | The starting row for the tile.                                          |
| position          | position            | No        | `number`          | -1      | The visual position of the tile in the layout, as the CSS `order`.      |
| maximized         | maximized           | Yes       | `boolean`         | false   | Whether the tile occupies all available space within the layout.        |
| fullscreen        | -                   | No        | `boolean`         | false   | Whether the tile occupies the whole screen.                             |
| disableResize     | disable-resize      | Yes       | `boolean`         | false   | Disables resizing regardless of the tile manager setting.               |
| disableMaximize   | disable-maximize    | Yes       | `boolean`         | false   | Disables the maximize action and its slot.                              |
| disableFullscreen | disable-fullscreen  | Yes       | `boolean`         | false   | Disables the fullscreen action and its slot.                            |

#### Events

| Name                | Cancellable | Description                                                    |
| ------------------- | ----------- | -------------------------------------------------------------- |
| igcTileMaximize     | false       | Fired when the maximize state of the tile changes.             |
| igcTileFullscreen   | false       | Fired when the fullscreen state of the tile changes.           |
| igcTileDragStart    | true        | Fired when a drag operation on a tile is about to begin.       |
| igcTileDragEnd      | false       | Fired when a drag operation completes successfully.            |
| igcTileDragCancel   | false       | Fired when a tile drag operation is canceled by the user.      |
| igcTileResizeStart  | true        | Fired when a resize operation on a tile is about to begin.     |
| igcTileResizeEnd    | false       | Fired when a resize operation completes successfully.          |
| igcTileResizeCancel | false       | Fired when a resize operation is canceled by the user.         |

#### Slots

| Name                | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| (default)           | Default slot for the content of the tile.                       |
| `title`             | Renders the title of the tile header.                           |
| `maximize-action`   | Renders the maximize action element of the tile header.         |
| `fullscreen-action` | Renders the fullscreen action element of the tile header.       |
| `actions`           | Renders items after the default actions in the tile header.     |
| `side-adorner`      | Renders the side resize handle of the tile.                     |
| `corner-adorner`    | Renders the corner resize handle of the tile.                   |
| `bottom-adorner`    | Renders the bottom resize handle of the tile.                   |

#### CSS Shadow parts

| Part                | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `base`              | The wrapper for the entire tile, header and content.            |
| `header`            | The container for the tile header, including title and actions. |
| `title`             | The title container of the tile.                                |
| `actions`           | The actions container of the tile header.                       |
| `content-container` | The container wrapping the main content of the tile.            |
| `tile-container`    | The wrapper around the tile content and its resize adorners.    |
| `trigger-side`      | The side resize handle of the tile.                             |
| `trigger`           | The corner resize handle of the tile.                           |
| `trigger-bottom`    | The bottom resize handle of the tile.                           |

## Test scenarios

The component is covered by three suites in this directory, all running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`tile-manager.spec.ts`](./tile-manager.spec.ts) | The manager: layout, spans, maximize, slots, serialization and API. |
| [`tile-dnd.spec.ts`](./tile-dnd.spec.ts) | Drag and drop of the tiles. |
| [`tile-resize.spec.ts`](./tile-resize.spec.ts) | Resizing of the tiles. |

The groups below mirror the `describe` blocks.

### Initialization

1. The manager renders its grid container and projects only tile elements into it.
2. The default property values are applied, and the CSS custom properties follow the attributes.
3. The component passes the accessibility audit.

### Column spans

4. `colSpan` and `rowSpan` size the tiles in the grid.
5. A fixed `columnCount` and a responsive layout derived from `minColumnWidth` both lay the tiles out correctly.

### Maximize

6. `maximized` makes the tile occupy the layout, and restoring it returns the previous arrangement.
7. `disableMaximize` removes the action and its slot.

### Slot assignment

8. Manual slot assignment places the tile content in the expected containers.
9. The header slots - title, actions, maximize and fullscreen actions - render as expected.
10. The resize adorner slots render the side, bottom and corner handles.

### Tile state changes

11. Changing the state of a tile - maximized, fullscreen, disabled interactions - updates the layout and emits the
    matching events.

### Serialization tests

12. `saveLayout` returns a JSON payload describing the current tiles.
13. `loadLayout` restores a previously saved arrangement.

### API tests

14. `tiles` returns the tiles sorted by their position.

### Positioning

15. `position`, `colStart` and `rowStart` place the tiles at the expected coordinates.

### Drag and drop tests

16. A tile drag reorders the tiles, in the tile and the header drag modes.
17. `igcTileDragStart` is cancelable, and `igcTileDragEnd` and `igcTileDragCancel` report the outcome.
18. Special scenarios - dragging over a maximized tile, dragging outside the manager - settle consistently.

### Resize tests

19. Dragging the side, bottom and corner adorners changes the span of the tile.
20. `igcTileResizeStart` is cancelable, and `igcTileResizeEnd` and `igcTileResizeCancel` report the outcome.
21. `disableResize` on a tile prevents resizing regardless of the manager mode.

## Assumptions and limitations

- Only `igc-tile` elements are projected into the grid; other content is ignored.
- The manager holds no data source: each tile renders its own content.
- The serialized payload describes the arrangement, not the content of the tiles.
- Dragging and resizing are pointer interactions and have no keyboard equivalent.

## Accessibility

### ARIA roles and properties

- The grid container is presentational; each tile is a region labelled by its title, so assistive technology can
  navigate between the tiles.
- The maximize and fullscreen actions are buttons with accessible names and expose their pressed state.
- The resize adorners are pointer affordances and are not part of the tab order.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The grid flow and the
adorner positions follow the inline direction.

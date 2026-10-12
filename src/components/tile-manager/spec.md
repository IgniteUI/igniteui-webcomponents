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
    - [Serialization properties](#serialization-properties)
    - [Accessibility tests](#accessibility-tests)
    - [Fullscreen sync](#fullscreen-sync)
    - [Right-to-left resize](#right-to-left-resize)
    - [Layout and input](#layout-and-input)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                        |
| ------: | ---------- | ------------------------------------------------------------ |
|       1 | 2026-09-21 | Initial specification                                        |
|       2 | 2026-09-28 | `loadLayout` copies only the tile properties; property suite |
|       3 | 2026-10-07 | Tile region, action names, reading order, fullscreen sync, RTL resize, cancelable events |
|       4 | 2026-10-08 | Nested managers: own placement of the inner tiles, swap transitions of an outer tile |

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
- **Cancelable interactions**: the drag, resize, maximize and fullscreen operations can be prevented before they begin.

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

Maximize, restore, a resize and a swap animate with a view transition. A tile that changes its size keeps its
content at its real size while its box grows or shrinks, so the text stays sharp. Its new content fades in during
the first 40% of the transition. The tiles that a maximized tile covers fade in place. The drag ghost stays on the
pointer during a swap. The view transition pseudo-elements belong to the document, so the theme style sheets
(`themes/light/*.css` and `themes/dark/*.css`) hold their rules. They select the view transition classes
`igc-tile-resize` and `igc-tile-rtl`, and the `dragged-tile-ghost` name. Without a theme style sheet, the tiles use
the default transition, and so does a size change in a browser without view transition classes.

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

A `columnCount` of zero or less produces a responsive layout derived from `minColumnWidth`. A column is never wider
than the manager, so in a manager that is narrower than `minColumnWidth` the column takes the width of the manager. Each
of these properties is also exposed as a CSS custom property, so the grid can be driven from a stylesheet.

#### Spans and placement

```html
<igc-tile col-span="2" row-span="2" col-start="1" row-start="1">...</igc-tile>
```

`position` sets the visual order of a tile in the layout, corresponding to the CSS `order` property. The tiles of a
nested manager do not take the spans or the starts of the tile that holds the manager.

#### Drag and drop

```html
<igc-tile-manager drag-mode="tile">...</igc-tile-manager>
```

The drag mode selects what starts a drag - the whole tile, its header, or nothing. A drag emits
`igcTileDragStart`, which is cancelable, and then either `igcTileDragEnd` or `igcTileDragCancel`. These two fire after
the view transition applies the new or the restored positions, so a handler can call `saveLayout()`. They still come
before the `igcTileDragStart` of the next drag. Escape, a
`pointercancel` from the browser and a tile that leaves the page cancel the drag. Only the pointer that started it
moves it. In nested tile managers, only the innermost tile under the pointer drags, and it swaps only with the tiles
of its own manager. The swaps of a tile that holds a nested manager also animate.

Only the direct `igc-tile` children of a manager are its tiles. A tile outside a manager has no drag and no resize.
When tiles move in the DOM, for example when a framework reorders a list, they keep their positions.

#### Resizing

```html
<igc-tile-manager resize-mode="always">...</igc-tile-manager>
```

Resizing is off by default. A tile can opt out with `disable-resize` regardless of the manager setting. The
adorners are exposed as slots and parts, so they can be replaced and styled. A resize emits `igcTileResizeStart`,
which is cancelable, and then either `igcTileResizeEnd` or `igcTileResizeCancel`. The spans and the starts are whole
numbers. The drag and resize previews render in the closest top-layer element that holds the manager, such as a modal
dialog or a fullscreen element, else in the document body.

#### Maximize and fullscreen

```html
<igc-tile maximized>...</igc-tile>
<igc-tile disable-maximize disable-fullscreen>...</igc-tile>
```

A maximized tile occupies all the available space within the layout; a fullscreen tile occupies the whole screen.
Both actions are rendered in the tile header. Before the default action changes the state, the tile emits
`igcTileMaximize` or `igcTileFullscreen` with the new state in `detail.state`. Both events are cancelable. While a
tile is maximized, the other tiles are hidden, so that Tab does not move the focus under it.

The browser can also change the fullscreen state, for example on Escape, or reject a request or an exit. The tile follows the
change and emits `igcTileFullscreen`, which is then not cancelable. While an element inside the tile is fullscreen,
the tile stays fullscreen. A custom `fullscreen-action` uses the browser API, and the tile follows it the same way:

```typescript
button.addEventListener('click', () => {
  tile.fullscreen ? document.exitFullscreen() : tile.requestFullscreen();
});
```

The content of a tile is clipped to its size. For content that can be taller than the tile, let the content container
fill the tile and scroll an element of your own. Give a scrolling element `tabindex="0"` and a name, so that keyboard
users can scroll it:

```css
igc-tile::part(base) {
  display: flex;
  flex-direction: column;
}

igc-tile::part(content-container) {
  flex: 1;
  min-height: 0;
}
```

#### Serialization

```typescript
const manager = document.querySelector('igc-tile-manager')!;

const layout = manager.saveLayout();     // a JSON payload
localStorage.setItem('dashboard', layout);

manager.loadLayout(localStorage.getItem('dashboard')!);
```

`loadLayout` treats the layout as untrusted. It copies only the serialized tile properties (spans, positions, flags
and `id`) to the tiles with a matching `id`. It ignores other keys, a value that is not an array, and an entry that is
not an object. Invalid JSON throws a `SyntaxError`.

### Localization

The titles and the content come from the application. The default maximize and fullscreen actions are icon buttons
with English names: "Maximize" and "Restore", "Enter full screen" and "Exit full screen". `igniteui-i18n-core` has no
tile strings, so the names have no resource strings. To localize them, put your own buttons in the `maximize-action`
and `fullscreen-action` slots.

### Keyboard interactions

The tile actions - maximize and fullscreen - are buttons and are activated with the standard button keys. The focus
stays on the action when the state changes. Where the browser supports `reading-flow` (Chromium), Tab moves through the
tiles in the order of the layout: by rows, after `position` and the dense packing. Other browsers use the DOM order.
Dragging and resizing are pointer interactions.

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
| `maximized-tile` | Indicates that a tile is maximized. Applies to `base`. |

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
| igcTileMaximize     | true        | Fired before the default action changes the maximized state. `detail.state` is the new state. |
| igcTileFullscreen   | true        | Fired before the default action changes the fullscreen state. `detail.state` is the new state. Also fired, not cancelable, after the browser changes the state. |
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
| `draggable`         | Indicates that drag and drop is on. Applies to `base`.          |
| `resizable`         | Indicates that resizing is on. Applies to `base`.               |
| `dragging`          | Indicates a running drag operation. Applies to `base`.          |
| `resizing`          | Indicates a running resize operation. Applies to `base`.        |
| `maximized`         | Indicates the maximized state. Applies to `base`.               |
| `fullscreen`        | Indicates the fullscreen state. Applies to `base`.              |
| `active`            | Indicates that the resize adorners show. Applies to `tile-container`. |
| `custom`            | Indicates a slotted custom adorner. Applies to the three handle parts. |

During a drag or a resize, the `part` attribute of the tile host also has `dragging` or `resizing`.

## Test scenarios

The component is covered by four suites in this directory, all running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`tile-manager.spec.ts`](./tile-manager.spec.ts) | The manager: layout, spans, maximize, slots, serialization and API. |
| [`tile-dnd.spec.ts`](./tile-dnd.spec.ts) | Drag and drop of the tiles. |
| [`tile-resize.spec.ts`](./tile-resize.spec.ts) | Resizing of the tiles. |
| [`serializer.property.spec.ts`](./serializer.property.spec.ts) | Property-based (fuzz) tests for the layout serialization. |

The groups below mirror the `describe` blocks.

### Initialization

1. The manager renders its grid container and projects only tile elements into it.
2. The default property values are applied, and the CSS custom properties follow the attributes.
3. The component passes the accessibility audit.

### Column spans

4. `colSpan` and `rowSpan` size the tiles in the grid. A tile of a nested manager does not take the placement of the
   tile that holds the manager.
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
14. `loadLayout` copies only the serialized tile properties, and ignores a value that is not an array of tiles.

### API tests

15. `tiles` returns the tiles sorted by their position.

### Positioning

16. `position`, `colStart` and `rowStart` place the tiles at the expected coordinates.

### Drag and drop tests

17. A tile drag reorders the tiles, in the tile and the header drag modes.
18. `igcTileDragStart` is cancelable, and `igcTileDragEnd` and `igcTileDragCancel` report the outcome.
19. Special scenarios - dragging over a maximized tile, dragging outside the manager - settle consistently.

### Resize tests

20. Dragging the side, bottom and corner adorners changes the span of the tile.
21. `igcTileResizeStart` is cancelable, and `igcTileResizeEnd` and `igcTileResizeCancel` report the outcome.
22. `disableResize` on a tile prevents resizing regardless of the manager mode.

### Serialization properties

23. For generated layouts, `loadLayout` restores what `saveLayout` returned. For any layout, with keys such as
    `innerHTML` and `__proto__`, it applies only the serialized properties, and each tile keeps its class and
    content. A JSON value that is not a layout changes nothing.

### Accessibility tests

24. A tile is a region that its title names. A change of the title element and an `aria-label` on the host change the
    name.
25. The default actions are named by what they do next, and the header divider is hidden from assistive technology.
26. While a tile is maximized, the other tiles are hidden and their content is skipped, also when a descendant sets
    `visibility: visible`. A covered tile that goes fullscreen stays visible. Removing the maximized tile releases the
    grid height.
27. Maximize and fullscreen keep the focus on the action, also when the tile can be resized.
28. Where the browser supports `reading-flow`, Tab follows `position` and the dense packing.

### Fullscreen sync

29. The tile follows the browser after Escape, also when a listener cancels the exit event, after a custom action
    calls `requestFullscreen()`, and after the browser rejects a request or an exit. The event after such a change is not
    cancelable. While an element inside the tile is fullscreen, the tile stays fullscreen.

### Right-to-left resize

30. In RTL, from a `dir` attribute or a CSS `direction`, the side and corner handles sit on the inline-end edge, and
    the tile and its ghost grow toward it. The `resizable` directive measures the width from the inline-start edge.

### Layout and input

31. A tile that moves in the DOM keeps its position, and so do the other tiles.
32. In a manager that is narrower than `minColumnWidth`, a responsive column fits the manager.
33. A maximized tile does not cancel `touchstart`, so its content scrolls by touch. In `tile-header` mode, only the
    header cancels `touchstart` and `dragstart`.
34. Several tiles that move in one task keep their positions. `loadLayout` gives every tile a unique position, and a
    fractional position becomes a whole number. A value that applies to no tile changes no position.
35. Escape after a drag that swaps a tile back and forth restores every tile. The positions stay whole when tiles
    leave or move to another manager during the drag, and when the next drag starts before the restore applies. A start
    column that a smaller column count removed, and a layout from `loadLayout()`, stay. A swap with a tile that leaves
    before the swap applies does not happen.
36. A tile that leaves the page during a drag or a resize cancels the operation, and so does `pointercancel`. The
    events of another pointer are ignored, and an error in the start callback ends the operation. A start listener that
    moves the tile cancels the operation.
37. Resizing works with a grid placement from author CSS, and the spans and starts are whole numbers. A start from a
    negative or a named line comes from the place of the tile. A minimum row height in `rem` makes the same new rows as
    the same height in pixels.
38. In nested tile managers, only the innermost tile drags, and it does not swap with an outer tile. A drag swaps with
    a tile that the pointer reaches straight from another tile. A swap of tiles that hold nested managers animates.
39. The drag and resize ghosts render over the tile in the closest top-layer element, such as a modal dialog, also
    through slots. A ghost there is fixed, so the border, scroll and overflow of that element do not move or clip it.
    A translate or a scale on that element does not move the ghost off the tile. A rotation is not supported.
40. A fullscreen tile that leaves the page is not fullscreen when it returns.
41. A tile outside a manager has no drag and no resize. The tiles of a manager that the browser defines later connect
    to it, and a tile that moves to another manager takes its features.
42. Two quick maximize clicks set the state that their events report.
43. In the page body, the drag and resize ghosts cover the tile, also with a body margin, a positioned or filtered
    body and a page scroll during the operation.
44. `igcTileDragEnd` and `igcTileDragCancel` fire after the view transition applies the positions, and before the
    start event of the next drag.
45. A maximize, a restore or a resize marks the tile with `igc-tile-resize` (and `igc-tile-rtl` in RTL) until its view
    transition ends, also after two quick clicks. The view transition classes of the author stay, and an inline one
    returns when the transition ends. While a tile is maximized, the covered tiles have no view transition name. With a
    theme style sheet, the new content of a maximizing tile fades in, and the drag ghost has no animation in a swap.

## Assumptions and limitations

- Only `igc-tile` elements are projected into the grid; other content is ignored.
- The manager holds no data source: each tile renders its own content.
- The serialized payload describes the arrangement, not the content of the tiles.
- Dragging and resizing are pointer interactions and have no keyboard equivalent. To meet WCAG 2.1.1 and 2.5.7, give
  users buttons that change `position`, `colSpan` and `rowSpan`.
- `position` sets the CSS `order` and does not move the tiles in the DOM. Only Chromium supports `reading-flow`, so in
  other browsers Tab and screen readers follow the DOM order. To restore a saved layout in the same order there, render
  the tiles in the order of their saved positions.
- The content of a tile is clipped to its size. See [Maximize and fullscreen](#maximize-and-fullscreen) for a scroll
  recipe.
- The names of the default actions are in English.

## Accessibility

### ARIA roles and properties

- The grid container has no role. Each tile has the `region` role through `ElementInternals`, and the content of its
  `title` slot names it, so screen readers list the tiles as landmarks. An `aria-label` or `aria-labelledby` on the
  tile replaces the title as the name, and a `role` on the tile replaces the region. A tile with no title and no name
  is not a landmark.
- The maximize and fullscreen actions are buttons. Their names tell what they do next ("Maximize" or "Restore",
  "Enter full screen" or "Exit full screen"), so they expose no pressed state.
- The divider under the header is hidden from assistive technology.
- While a tile is maximized, the other tiles are hidden and their content is skipped (`content-visibility: hidden`),
  so Tab and screen readers do not reach them, also when a descendant sets `visibility: visible`. A covered tile that
  goes fullscreen stays visible.
- The resize adorners are pointer affordances and are not part of the tab order.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The grid flow follows the
inline direction. The side and corner adorners sit on the inline-end edge, and a resize grows the tile toward it. Both
follow the computed `direction`, so a CSS `direction` without a `dir` attribute works too.

# igc-splitter

A splitter component that provides a resizable split-pane layout, dividing the view
into two panels - *start* and *end* - separated by a draggable bar.

Panels can be resized by dragging the bar, using keyboard shortcuts, or collapsed/expanded
using the built-in collapse buttons or the programmatic `toggle()` API.
Nested splitters are supported for more complex layouts.

## Keyboard interactions

When the splitter bar is focused:

| Key | Action |
|---|---|
| `Arrow Left` / `Arrow Right` | Resize panes (horizontal orientation) |
| `Arrow Up` / `Arrow Down` | Resize panes (vertical orientation) |
| `Home` | Snap start pane to its minimum size |
| `End` | Snap start pane to its maximum size |
| `Ctrl + Arrow Left` / `Ctrl + Arrow Up` | Expand the end pane if it is collapsed, else toggle the start pane |
| `Ctrl + Arrow Right` / `Ctrl + Arrow Down` | Expand the start pane if it is collapsed, else toggle the end pane |

In a right-to-left context, `Arrow Left` and `Arrow Right` swap their actions.

```ts
import { defineComponents, IgcSplitterComponent } from 'igniteui-webcomponents';

defineComponents(IgcSplitterComponent);
```

## Properties

- `orientation`: `'horizontal' | 'vertical'`. Default: `'horizontal'`. Attribute: `orientation`, reflected.
  The orientation of the splitter, which determines the direction of resizing and collapsing.

  Changing the orientation after the initial render returns the panes to the
  sizes set through `startSize` and `endSize`, or to automatic sizing. The
  sizes from a drag, a key press or a collapse were measured on the other
  axis, so they are dropped. The minimum and maximum sizes stay.
- `disableCollapse`: `boolean`. Default: `false`. Attribute: `disable-collapse`, reflected.
  Whether collapsing either pane is disabled. When `true`, this also hides
  the expand/collapse buttons on the splitter bar.
- `disableResize`: `boolean`. Default: `false`. Attribute: `disable-resize`, reflected.
  Whether resizing the panes by dragging the splitter bar or using keyboard
  shortcuts is disabled. When `true`, this also hides the drag handle on the
  splitter bar.
- `hideCollapseButtons`: `boolean`. Default: `false`. Attribute: `hide-collapse-buttons`, reflected.
  Whether the expand/collapse buttons on the splitter bar are hidden.

  The buttons are also hidden when `disable-collapse` is true. While a pane
  is collapsed, only its expand button shows.
- `hideDragHandle`: `boolean`. Default: `false`. Attribute: `hide-drag-handle`, reflected.
  Whether the drag handle on the splitter bar is hidden.

  The drag handle is also hidden when `disable-resize` is true.
- `startMinSize`: `string | undefined`. Attribute: `start-min-size`.
  The minimum size of the start pane.

  Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a
  unitless `0`. Setting `auto`, any other unitless or unparsable value, a
  negative value, or a percentage above 100 removes the constraint.
- `endMinSize`: `string | undefined`. Attribute: `end-min-size`.
  The minimum size of the end pane.

  Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a
  unitless `0`. Setting `auto`, any other unitless or unparsable value, a
  negative value, or a percentage above 100 removes the constraint.
- `startMaxSize`: `string | undefined`. Attribute: `start-max-size`.
  The maximum size of the start pane.

  Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a
  unitless `0`. Setting `auto`, any other unitless or unparsable value, a
  negative value, or a percentage above 100 removes the constraint.
- `endMaxSize`: `string | undefined`. Attribute: `end-max-size`.
  The maximum size of the end pane.

  Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a
  unitless `0`. Setting `auto`, any other unitless or unparsable value, a
  negative value, or a percentage above 100 removes the constraint.
- `startSize`: `string | undefined`. Attribute: `start-size`.
  The size of the start pane.

  Accepts a CSS length with an explicit unit, e.g. `200px` or `50%`, or a
  unitless `0`. Setting `auto`, any other unitless or unparsable value, a
  negative value, or a percentage above 100 falls back to automatic sizing.
- `endSize`: `string | undefined`. Attribute: `end-size`.
  The size of the end pane.

  Accepts a CSS length with an explicit unit, e.g. `200px` or `50%`, or a
  unitless `0`. Setting `auto`, any other unitless or unparsable value, a
  negative value, or a percentage above 100 falls back to automatic sizing.
- `startCollapsed`: `boolean`. Default: `false`. Attribute: `start-collapsed`, reflected.
  Whether the start pane is currently collapsed. Set this property to
  collapse or expand the pane programmatically.
- `endCollapsed`: `boolean`. Default: `false`. Attribute: `end-collapsed`, reflected.
  Whether the end pane is currently collapsed. Set this property to
  collapse or expand the pane programmatically.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<ISplitterResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Methods

- `toggle(position: PanePosition): void`
  Toggles the collapsed state of the specified pane.

  Does not emit `igcLayoutChanged` - that event reports user-driven changes,
  and a programmatic call is already known to the caller.

## Events

- `igcResizeStart`
  Emitted once when a resize operation begins (pointer drag or keyboard).
- `igcResizing`
  Emitted continuously while a pane is being resized.
- `igcResizeEnd`
  Emitted once when a resize operation completes.
- `igcLayoutChanged`
  Emitted after a user-driven resize or expansion change, with a full snapshot of the current layout (pane sizes and collapsed states).

## Slots

- `start`: Content projected into the start panel, at the inline start or the top.
- `end`: Content projected into the end panel, at the inline end or the bottom.

## CSS parts

- `base`: The container of the panels and the splitter bar.
- `splitter-bar`: The resizable bar element between the two panels.
- `drag-handle`: The drag handle icon/element on the splitter bar.
- `start-pane`: The container for the start panel content.
- `end-pane`: The container for the end panel content.
- `start-collapse-btn`: The button to collapse the start panel.
- `end-collapse-btn`: The button to collapse the end panel.
- `start-expand-btn`: The button to expand the start panel when collapsed.
- `end-expand-btn`: The button to expand the end panel when collapsed.

## CSS custom states

- `start-collapsed`: Set while the start pane is collapsed.
- `end-collapsed`: Set while the end pane is collapsed.

# igc-virtual-scroll

A virtual scroll component for large lists. Only the items visible in the
viewport are rendered.

The component renders into its light DOM, so `::part()` does not apply to its
parts. Select them with attribute selectors, such as `[part~="virtualization-track"]`.

```ts
import { defineComponents, IgcVirtualScrollComponent } from 'igniteui-webcomponents';

defineComponents(IgcVirtualScrollComponent);
```

## Properties

- `data`: `T[]`. Default: `[]`. No attribute.
  The array of items to virtualize.

  Compared by reference: a mutation in place (`data.push(...)`) causes no
  update. Assign a new array instead. The `igcDataRequest` flow also
  expects a new array.
- `orientation`: `'horizontal' | 'vertical'`. Default: `'vertical'`. Attribute: `orientation`, reflected.
  The scroll axis of the component.
- `overScan`: `number`. Default: `2`. Attribute: `over-scan`.
  Number of extra items to render beyond the visible area of the viewport.
  Higher values reduce blank flashes during fast scrolling but can lower performance.
- `estimatedItemSize`: `number`. Default: `50`. Attribute: `estimated-item-size`.
  Estimated item size in pixels, used before an item is measured in the DOM.
  After the first render of an item, the engine replaces the estimate with the measured size.
  The average measured size also replaces the estimate of the items that are not measured
  yet, so the scrollbar follows the real content.
- `itemTemplate`: `VirtualScrollItemTemplate<T> | null`. Default: `null`. No attribute.
  A function that renders each item in the virtual scroll list.
  Receives a VirtualScrollItemContext<T> with the item data, its index, and the total count.
  Without it, nothing is rendered.

  Items are measured by their border box, so margins accumulate as drift
  down the list. Use padding on the item, or a gap on a wrapper, instead.

  Only the current window is in the DOM, so assistive technology cannot
  infer an item's position from the markup. In a template that renders a
  role with set semantics (`option`, `listitem`, `row`, ...), map the
  context's `index` and `count` to `aria-posinset` and `aria-setsize`.

  Item elements are recycled (see `keyFunction`), so DOM state that the
  template does not bind moves to another item, for example the state of a
  checkbox without a `checked` binding. Bind all item state. Lit compares a
  binding with the value that it set last, not with the element, so bind
  state that the user changes with Lit's `live` directive. Also write user
  changes back to the item, or they are lost when the item leaves the window.
  To get new DOM for each item, wrap the content in Lit's `keyed` directive
  with the item key: `` html`${keyed(ctx.value.id, content)}` ``.
- `keyFunction`: `VirtualScrollKeyFunction<T> | null`. Default: `null`. No attribute.
  A function that returns a unique key for an item. Receives the item and its index in `data`.

  An item keeps its rendered element while its key stays in the rendered window. The elements
  of keys that leave the window are reused for keys that enter it. Without it, the index is the
  key, so after a `data` change an index keeps its element and shows its new item. Set it when
  items move within `data`, for example on sort, insert or remove.
- `layoutComplete`: `Promise<void>`. Read-only. No attribute.
  Resolves when the virtual scroll has settled: the current render pass is
  complete, the item-size measurements it triggers are complete, and so
  are the renders those measurements schedule.

  `updateComplete` covers one Lit render pass. This covers `data` changes,
  scrolls, and viewport resizes, where the stable DOM state comes after
  one or more follow-up renders.

## Methods

- `scrollToIndex(index: number, options?: ScrollIntoViewOptions): Promise<void>`
  Scrolls to the specified item index.

  `block` (`inline` in the horizontal orientation) positions the item as in
  `scrollIntoView`, and defaults to `start`. With `nearest`, the item
  scrolls the smallest distance that brings it into view.

  Items outside the rendered window have only an estimated size, so the
  first jump can miss the target. The items at the landing point are then
  measured, and the scroll position is corrected. This repeats until the
  offset is stable.

  A hidden or detached list cannot scroll. It keeps the call and scrolls
  when it shows. A newer call replaces the kept one.

  The returned promise resolves when the scroll settles on the final,
  corrected offset, or when a newer call replaces this one. Callers that
  need only the first, approximate scroll can ignore it.

## Events

- `igcStateChange`
  Emitted when the rendered window, the viewport size or the total content size changes.
- `igcDataRequest`
  Emitted when the rendered window comes within a few items of the end of `data`. Also emitted on the first render, when the loaded items do not fill the viewport.

## CSS parts

- `virtualization-track`: The full-size element that gives the host its scrollable extent.
- `virtualization-content`: The wrapper that holds the rendered items, translated into position within the track.

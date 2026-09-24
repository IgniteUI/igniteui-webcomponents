# Virtual scroll specification

- [Virtual scroll specification](#virtual-scroll-specification)
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
      - [Size measurement](#size-measurement)
      - [Item elements and keys](#item-elements-and-keys)
      - [Scrolling to an index](#scrolling-to-an-index)
      - [Infinite scrolling](#infinite-scrolling)
      - [Coordinate compression](#coordinate-compression)
      - [Waiting for the layout](#waiting-for-the-layout)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Accessibility tests](#accessibility-tests)
    - [Default values](#default-values)
    - [Orientation](#orientation)
    - [Rendering](#rendering)
    - [Events tests](#events-tests)
    - [Scroll handling](#scroll-handling)
    - [Public API](#public-api)
    - [Engine integration](#engine-integration)
    - [Item elements](#item-elements)
    - [RTL tests](#rtl-tests)
    - [Engine unit tests](#engine-unit-tests)
    - [Recycle directive tests](#recycle-directive-tests)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                                      |
| ------: | ---------- | ------------------------------------------------------------------------------------------ |
|       1 | 2026-09-21 | Initial specification                                                                      |
|       2 | 2026-09-23 | Recycled item elements and `keyFunction`, adapted size estimate, `nearest` edge alignment  |
|       3 | 2026-09-23 | Fewer element moves on large scrolls, focus kept on reorders, unbound DOM state guidance   |
|       4 | 2026-09-24 | Detached elements stay in the document of the list                                         |

## Overview

The `igc-virtual-scroll` renders a large list by keeping only the items inside the viewport, plus an over-scan
buffer, in the DOM. As the user scrolls, the elements of the items that leave the viewport are reused for the ones
that enter it. A track element carries the full virtual size, so the scrollbar of the browser represents the whole
data set.

The component supports a vertical and a horizontal orientation, fixed and variable item sizes, and an infinite or
remote loading pattern through its `igcDataRequest` event.

```ts
const scroll = document.querySelector('igc-virtual-scroll');

scroll.data = people;
scroll.itemTemplate = (ctx) => html`<div>${ctx.index}: ${ctx.value.name}</div>`;
```

### Key features

- **Windowed rendering** with a configurable over-scan buffer.
- **A correct scrollbar** for the whole data set, without rendering it.
- **Vertical and horizontal** orientation.
- **Self-correcting sizes**: each rendered item is measured, and the measurement replaces the estimate. The average
  measured size also becomes the estimate of the items that are not measured yet.
- **Recycled item elements**, keyed by index or by a `keyFunction`, so a scroll creates no DOM once the window has
  its full size.
- **Infinite scrolling** through a data request emitted near the end of the loaded items.
- **Programmatic scrolling** to an index, corrected until the offset is stable.
- **Coordinate compression** for data sets whose virtual size exceeds the maximum scroll coordinate of the
  browser.

### Acceptance criteria

- Only the items in the viewport plus the over-scan buffer must be rendered.
- The scrollbar must represent the full virtual size of the content.
- Both orientations and both fixed and variable item sizes must be supported.
- Each rendered item must be measured, and its estimate replaced by the measurement.
- An item that stays in the rendered window must keep its element.
- `igcStateChange` must be emitted after each render with the current window.
- `igcDataRequest` must be emitted when the window comes near the end of the loaded data.
- `scrollToIndex` must land on the requested item even when the sizes were estimates.
- `scrollToIndex` with `nearest` must scroll the smallest distance that brings the item into view.
- The component must integrate into the document or into any shadow root without leaking styles.
- The element must pass accessibility audits and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- scroll through a long list smoothly, without blank flashes;
- rely on the scrollbar to tell me where I am in the whole data set;
- see the items at their real size rather than at a uniform estimate.

### Developer stories

As a developer, I expect to be able to:

- provide a data array of any type and a template function for an item;
- choose between a vertical and a horizontal orientation;
- tune how many extra items are rendered, trading DOM size for scroll smoothness;
- provide an estimated item size for the layout before the items are measured;
- learn which items are visible, so that I can react to the window;
- append more data when the user approaches the end of what is loaded;
- scroll to a specific index from code and know when the scroll has settled;
- nest the component inside other components, including shadow roots, without style bleed.

## Functionality

### End-user experience

The host is a scroll container. The items sit in an absolutely positioned content wrapper that is translated to
match the scroll position, inside a track that carries the full virtual size. Scrolling swaps the rendered window;
the over-scan buffer keeps extra items around it so that fast scrolling does not show blank areas.

The wiki page of the component carries no design hand-off link.

### Developer experience

#### Basic initialization

The component needs two things: a `data` array and an `itemTemplate` function that receives a
`VirtualScrollItemContext<T>` and returns a template.

```ts
const template = (ctx: VirtualScrollItemContext<Person>) => html`
  <div class="item">${ctx.index}: ${ctx.value.name}</div>
`;

scroll.data = people;
scroll.itemTemplate = template;
```

`VirtualScrollItemContext<T>` carries `value`, `index` and `count`, plus the derived `isFirst` and `isLast`.

`data` is compared by reference: mutating the array in place changes nothing, and a new array has to be assigned.

#### Size measurement

Each rendered item is wrapped in a `<div data-vs-index="N">`, which ties a `ResizeObserver` measurement back to
its index. When the measured size differs from the current one, the engine is updated and a new render is
scheduled, so variable sizes correct themselves with no configuration. Items are measured by their border box, so
margins accumulate as drift down the list; padding on the item, or a gap on a wrapper, avoids that.

`estimatedItemSize` applies to items that have not been measured yet; measured ones keep their measurements.

The average measured size replaces the estimate of the unmeasured items, so the scrollbar follows the real items even
when `estimatedItemSize` is far off. After the first change, a new average applies only while every item before the
rendered window is measured, so the rendered items cannot move. A data change keeps the average. A new
`estimatedItemSize` replaces it, and the next average counts only the items measured after it, because older sizes
can be out of date.

#### Item elements and keys

Each item is rendered through an internal `recycle` directive and keyed by its index in `data`, or by the value
that `keyFunction` returns. An item whose key stays in the window keeps its element. The elements of the keys that
leave are reused for the keys that enter, and unused elements are kept detached in the document of the list, up to
the window size, so once the window has reached its largest size a scroll creates no DOM nodes.

The reused elements that keep their order and have the largest total weight stay in place, and the other elements
move. A kept element weighs twice a recycled one: a moved element needs a new style and layout, and a recycled element
needs a new layout for its new item anyway. On a scroll, the kept elements move instead of the recycled ones only when
they are fewer than half the recycled ones, that is, on a scroll by more than two thirds of the window. A kept element
that holds the focus does not move, so it keeps the focus. The browser's `moveBefore`, which keeps the state of a
moved element, is not used: in Chromium it makes the style recalculation of a moved element slower, and Safari does
not have it.

With the default index keys, an index keeps its element after a `data` change and shows its new item. A
`keyFunction` keeps the element with the item instead, which suits sorting, inserting and removing:

```ts
scroll.keyFunction = (person) => person.id;
```

Because elements are recycled, templates must bind all item state. Lit compares a binding with the value that it set
last, not with the element, so a property that the user changes, such as `checked` or `value`, must be bound with
`live`. The change must also be written back to the item, or it is lost when the item leaves the window. A template
that needs new DOM for each item, as `repeat` gives, wraps its content in `keyed` with the item key:

```ts
scroll.itemTemplate = (ctx) => html`${keyed(ctx.value.id, html`<person-card .person=${ctx.value}></person-card>`)}`;
```

#### Scrolling to an index

`scrollToIndex(index, options)` takes the standard `ScrollIntoViewOptions`, including `block` and `behavior`.
`nearest` follows native `scrollIntoView`: an item in view, or one that covers the viewport, does not scroll, and any
other item scrolls the smallest distance that brings it into view. Revealing the next item therefore scrolls by one
item.

Items outside the rendered window carry only an estimate, so the first jump can miss; the items at the landing
point are then measured and the offset is corrected, repeatedly, until it is stable. The returned promise resolves
on the final offset, and a caller that only needs the approximate scroll can ignore it.

#### Infinite scrolling

When the rendered window comes within five items of the end of `data`, `igcDataRequest` is emitted with the first
index that has no data and how many items to append. It is also emitted on the first render when the loaded items
do not fill the viewport. Further emissions are suppressed until a new `data` reference is assigned, and a
reassignment that does not grow the array does not request the same items again.

```ts
scroll.addEventListener('igcDataRequest', async ({ detail }) => {
  const page = await load(detail.startIndex, detail.count);
  scroll.data = [...scroll.data, ...page];
});
```

#### Coordinate compression

When the virtual size of the content passes the maximum scroll coordinate of the browser, the component maps the
virtual positions onto the DOM scroll positions through a ratio. The rendered window is still sized by the
viewport rather than by the ratio, and the alignment slack is converted into DOM space. Nothing has to be
accounted for by the application.

#### Waiting for the layout

`updateComplete` covers a single Lit render pass. `layoutComplete` resolves once the whole component has settled:
the current render, the measurements it triggers, and the renders those measurements schedule. It is the promise
to await after a data change, a scroll or a viewport resize.

### Localization

None applicable. The component renders no text of its own.

### Keyboard interactions

The component itself is not focusable. The arrow keys, <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Home</kbd>
and <kbd>End</kbd> scroll the host natively, as in any `overflow: auto` container. Focus management inside the
items belongs to the `itemTemplate`.

## API

### Properties and attributes

| Property            | Attribute             | Reflected | Type                                    | Default    | Description                                                        |
| ------------------- | --------------------- | --------- | --------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `data`              | —                     | —         | `T[]`                                   | `[]`       | The items to virtualize; compared by reference.                     |
| `orientation`       | `orientation`         | yes       | `"vertical" \| "horizontal"`            | `vertical` | The scroll axis of the component.                                   |
| `overScan`          | `over-scan`           | no        | `number`                                | `2`        | The extra items rendered beyond the visible area.                   |
| `estimatedItemSize` | `estimated-item-size` | no        | `number`                                | `50`       | The size in pixels used before an item is measured.                 |
| `itemTemplate`      | —                     | —         | `VirtualScrollItemTemplate<T> \| null`  | `null`     | The renderer of an item; nothing is rendered without it.            |
| `keyFunction`       | —                     | —         | `VirtualScrollKeyFunction<T> \| null`   | `null`     | Returns the key of an item; the index is the key without it.        |
| `layoutComplete`    | —                     | —         | `Promise<void>`                         | —          | Resolves once the component has settled. Read-only.                 |

### Methods

| Method          | Signature                                                          | Description                                                      |
| --------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `scrollToIndex` | `(index: number, options?: ScrollIntoViewOptions): Promise<void>`  | Scrolls to the item at `index` and resolves on the final offset.  |

### Events

| Event            | Detail                      | Cancelable | Description                                                                 |
| ---------------- | --------------------------- | ---------- | --------------------------------------------------------------------------- |
| `igcStateChange` | `VirtualScrollState`        | no         | The rendered window changed.                                                 |
| `igcDataRequest` | `VirtualScrollDataRequest`  | no         | The window came within five items of the end of the loaded data.             |

`VirtualScrollState`

| Property       | Type     | Description                                         |
| -------------- | -------- | --------------------------------------------------- |
| `startIndex`   | `number` | The first rendered item, inclusive.                  |
| `endIndex`     | `number` | The last rendered item, inclusive.                   |
| `viewportSize` | `number` | The size of the viewport in pixels.                  |
| `totalSize`    | `number` | The total virtual size of the content in pixels.     |

`VirtualScrollDataRequest`

| Property     | Type     | Description                                                  |
| ------------ | -------- | ------------------------------------------------------------ |
| `startIndex` | `number` | The first index that has no data yet.                         |
| `count`      | `number` | How many items to append, starting at `startIndex`.           |

### Slots

None. The items are created by the `itemTemplate` rather than projected.

### CSS Shadow parts

| Part                     | Description                                                                     |
| ------------------------ | ------------------------------------------------------------------------------- |
| `virtualization-track`   | The full-size element that gives the host its scrollable extent.                 |
| `virtualization-content` | The wrapper of the rendered items, translated into position inside the track.     |

The host styles are injected as a constructable stylesheet into the tree scope the component lives in, so it
integrates into the document and into a shadow root alike.

## Test scenarios

| Suite                 | File                       |
| --------------------- | -------------------------- |
| `VirtualScroll`       | `virtualization.spec.ts`   |
| `VirtualScrollEngine` | `engine.spec.ts`           |
| `recycle directive`   | `recycle.spec.ts`          |

### Accessibility tests

1. The component passes the accessibility audit.

### Default values

2. The component initializes with its documented defaults.

### Orientation

3. The `orientation` attribute is reflected, defaults to vertical, and a change re-reads the scroll offset from
   the new axis.

### Rendering

4. Nothing is rendered without an `itemTemplate`, and the track and the content elements are rendered with one.

### Events tests

5. `igcStateChange` is emitted after a render with data and a template, and is not emitted again while the window
   is unchanged.
6. `igcDataRequest` is emitted when the scroll comes near the end of the data, is not repeated when the data is
   reassigned without growing, and is emitted again once the data actually grows.

### Scroll handling

7. A scroll that stays inside the same window causes no render.
8. The scroll handling is registered again after the component is reconnected.

### Public API

9. `scrollToIndex` sets `scrollTop` in the vertical orientation and `scrollLeft` in the horizontal one.
10. It settles on the last index instead of waiting out the scroll timeout, and does nothing for `block: nearest`
    when the item is already in view, including an item that already fills the viewport.
11. It keeps the requested index aligned once the real item sizes differ from the estimate, including a far-away
    index reached with a smooth scroll in a large list.
12. `layoutComplete` settles even when no animation frames are served.
13. `scrollToIndex` with `nearest` scrolls by one item to reveal the item after the last visible one, aligns an item
    after the viewport to its end, and aligns an item before the viewport to its start.

### Engine integration

14. The track is resized when the data changes.
15. A new `estimatedItemSize` is applied when the item count is unchanged.
16. Measurements are retained on an append and discarded on a replacement, including a swap of data of the same
    length.
17. The size of an item already measured in the DOM is not overridden, and a reused item element is measured
    again when it hosts a different index.
18. The unmeasured items follow the average measured size instead of `estimatedItemSize`.

### Item elements

19. An item that stays in the window on a scroll keeps its element.
20. Once the window has its full size, a scroll creates no item elements, and the elements stay in index order.
21. With a `keyFunction`, an item that moves in `data` keeps its element; without one, an index keeps its element.
    An item template in `keyed` gives each entering item new DOM in a recycled element.

### RTL tests

22. `scrollToIndex` passes a negative left value to `scrollTo`, and a negative `scrollLeft` is normalized to a
    positive engine offset.
23. The content element gets a negative `translateX` when scrolled, `igcStateChange` carries valid indices, and
    the first data item is rendered as the right-most one.

### Engine unit tests

24. **Sizing**: new items take the estimate, an unsized engine reports zero, a measurement applies to the later
    offsets, out-of-range measurements are ignored, offsets are clamped to the item count, and a range sum is
    clamped the same way.
25. **Estimated size**: a new estimate applies only to unmeasured items, and a measurement equal to the current
    size still counts as a measurement.
26. **Adapted estimate**: the average measured size replaces the estimate, the first average applies anywhere, a
    later one waits until each item before the window is measured, the average survives a resize and a replacement,
    a new configured estimate replaces it, only the sizes measured since then count, and a change notifies.
27. **Resizing**: measured sizes survive an append and a removal, are discarded at and beyond the retained count
    and marked unmeasured again, a changed estimate reaches every unmeasured item, and a matching length with
    everything retained is a no-op.
28. **Change notifications**: a resize, a measurement and an estimate change notify, and nothing notifies when
    nothing changes.
29. **Visible range**: an empty range without items or viewport, coverage of the viewport from the top, an offset
    exactly on an item boundary, the expansion by the over-scan clamped to the item count, and measured sizes.
30. **Alignment**: leading, centered and trailing alignment, never a negative offset, clamping to the largest
    reachable offset, the in-view report including an item larger than the viewport, an out-of-range index, and an
    empty tree.
31. **Scroll offset resolution**: `start`, `center` and `end` match the alignment math, an unknown position is
    `start`, and `nearest` keeps an item in view, aligns an item after or before the viewport to the closer edge,
    scrolls an item larger than the viewport until it covers it, and keeps the offset on an empty tree.
32. **Coordinate compression**: the DOM size clamped to the browser maximum and untouched below it, the mapping of
    DOM scroll positions onto the virtual space, a rendered window sized by the viewport rather than by the ratio,
    the alignment slack converted into DOM space, `nearest` resolved in DOM space, and a document probed only once,
    including from an already scrolled document.

### Recycle directive tests

33. Items render in order; the element of a key that stays is kept; a full replacement of the keys reuses every
    element without a DOM move; a shift moves only the recycled elements, unless the kept elements are fewer than
    half the recycled ones.
34. No element is created once the window has its full size, each item keeps exactly two markers, and no comment
    node leaks.
35. Any change of keys, including reversals, shuffles, growth, shrinkage, duplicate keys and random changes, gives key
    order.
36. A focused element in a kept item keeps the focus while the keys shift, reverse, or the other kept elements move.
37. Removed parts disconnect their async directives; the directive takes over from and gives way to other content.
38. **Pool**: a detached part is reused when the window grows, the pool holds at most as many parts as the window,
    an empty window drops the pool, pooled parts disconnect their async directives and reconnect on reuse, and a
    detached part stays in the document of the list, also after the list moves to another document.
39. **Unbound DOM state** moves with a recycled element to the entering key, and stays with its key in a `keyed`
    template.

### Not covered by the suite

- `overScan` is exercised through the engine unit tests rather than through the component.
- The `ResizeObserver` measurement path is covered through the engine integration tests, not directly.

## Assumptions and limitations

- `data` is treated as an immutable snapshot. A mutation in place does not trigger a render; a new array has to be
  assigned.
- `estimatedItemSize` does not apply retroactively to items that were already measured.
- The `itemTemplate` runs once per rendered item per render pass, so expensive work in it should be memoized by
  the application.
- Items are virtualized as a single flat sequence. A multi-column grid layout has to be handled inside the item
  template.
- Item elements are recycled. An element that leaves the window is reused for an item that enters it, so DOM state
  that the template does not bind, such as an unbound input value or a scroll offset inside the item, moves to the
  new item. See [Item elements and keys](#item-elements-and-keys).
- When the item that holds the focus leaves the window, its element is recycled. The element loses the focus if it
  moves, and keeps it, with the new item, if it does not.
- A kept element that moves, on a reorder or on a scroll by more than two thirds of the window, loses transient DOM
  state such as a running CSS transition or the loaded page of an `iframe`. Form state and the element itself stay
  with the item.
- The adapted estimate is an average: when the first items differ in size from the rest, the scrollbar is less
  accurate until more items are measured.
- Items are measured by their border box, so margins on an item accumulate as drift.
- The component does not manage focus inside the list.

## Accessibility

### ARIA roles and properties

- The component is a transparent scroll container with no intrinsic role. The track and the content wrapper are
  presentational.
- Only the current window is in the DOM, so assistive technology cannot infer the position of an item from the
  markup. A template that renders a role with set semantics — `option`, `listitem`, `row` and the like — should
  map the `index` and the `count` of the context onto `aria-posinset` and `aria-setsize`.
- An infinite list that has to be fully keyboard navigable should implement the ARIA `feed` pattern on top of the
  component.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The horizontal orientation works in a Right-to-Left context without additional configuration. The component
normalizes the negative `scrollLeft` browsers report there and translates the content accordingly, so the first
item is the right-most one.

# Popover specification

- [Popover specification](#popover-specification)
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
      - [Anchoring](#anchoring)
      - [Placement and offset](#placement-and-offset)
      - [Flipping and shifting](#flipping-and-shifting)
      - [The arrow element](#the-arrow-element)
      - [Matching the anchor width](#matching-the-anchor-width)
      - [Scroll strategies](#scroll-strategies)
      - [Position strategies](#position-strategies)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Slotted anchor element](#slotted-anchor-element)
    - [Non-slotted anchor element](#non-slotted-anchor-element)
    - [Anchor resolution](#anchor-resolution)
    - [Open state](#open-state)
    - [Placement and middleware](#placement-and-middleware)
    - [Arrow element tests](#arrow-element-tests)
    - [Anchor visibility](#anchor-visibility)
    - [Scroll strategy tests](#scroll-strategy-tests)
    - [Fallback positioning strategy](#fallback-positioning-strategy)
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

The `igc-popover` is an **internal** positioning primitive. It renders its content in the top layer, anchored to
another element, and keeps it positioned while the page scrolls or resizes. It is not exported from the public entry
point and is not intended for application code; the components of the library use it as the surface for their
overlays.

It is the successor of the `igcToggle` directive and its controller, which it replaced entirely.

Consumers inside the library include [`igc-dropdown`](../dropdown/spec.md), [`igc-select`](../select/spec.md),
[`igc-combo`](../combo/spec.md), [`igc-tooltip`](../tooltip/spec.md), [`igc-date-picker`](../date-picker/spec.md),
[`igc-date-range-picker`](../date-range-picker/spec.md) and [`igc-color-picker`](../color-picker/spec.md).

### Key features

- **Top layer rendering**: the content is shown through the native popover API, so it escapes overflow and stacking
  contexts without a portal.
- **Two position strategies**: native CSS anchor positioning where the browser implements it, and a lazily loaded
  floating fallback everywhere else.
- **Flexible anchoring**: an element reference, an IDREF, or an element slotted into the `anchor` slot.
- **Twelve placements** with an offset along the main axis, plus optional flipping to keep the content in view.
- **Arrow support**: an application-provided element is positioned against the resolved side.
- **Width matching**: the content can be constrained to the width of its anchor.
- **Scroll strategies**: hide with the anchor, stay anchored, or ask the owner to close.
- **No own open logic**: the owning component controls `open`, so the popover never fights it for state.

### Acceptance criteria

- The popover must render its content in the top layer, above the rest of the page.
- It must resolve its anchor from a property holding an element, from an IDREF, or from the `anchor` slot.
- It must support the twelve placements, an offset, flipping and width matching.
- It must position an application-provided arrow element against the resolved side.
- It must reposition while an ancestor scrolls or the anchor resizes, according to the scroll strategy.
- It must use the native CSS anchor positioning of the browser where it is available, and fall back to the floating
  implementation everywhere else, without a difference in behavior.
- It must not load the fallback implementation in a browser that uses the native strategy.
- It must hide its content when the anchor leaves the DOM, and show it again when a new anchor resolves.
- It must not own the open state; the component that uses it decides when it opens and closes.

## User stories

### End-user stories

As an end-user, I expect:

- an overlay to appear next to the control that opened it, never clipped by a scrolling container or a parent with
  `overflow: hidden`.
- an overlay to follow its control while I scroll, or to get out of the way, depending on what the control does.
- an overlay to flip to the other side of the control rather than be cut off by the edge of the window.

### Developer stories

As a developer building a component of the library, I expect to be able to:

- anchor a surface to an element by reference, by id, or by slotting it.
- choose the placement and the offset of the surface, and let it flip when there is no room.
- render an arrow that points at the anchor.
- make the surface as wide as its anchor, for dropdown-like widgets.
- decide what happens on scroll, and be notified when my component is expected to close.
- rely on one implementation, without writing browser checks for CSS anchor positioning.

## Functionality

### End-user experience

The popover has no visual design of its own. It contributes the positioning behavior: the content appears on the
configured side of the anchor, offset by the configured distance, flips to the opposite side when there is not
enough room, and stays aligned while the page scrolls.

### Developer experience

#### Anchoring

The anchor is resolved, in order, from the `anchor` property when it holds an element, from an IDREF in the same
root when it holds a string, and otherwise from the element assigned to the `anchor` slot:

```html
<!-- Slotted anchor -->
<igc-popover>
  <button slot="anchor">Open</button>
  <div>Content</div>
</igc-popover>

<!-- IDREF -->
<button id="trigger">Open</button>
<igc-popover anchor="trigger">
  <div>Content</div>
</igc-popover>
```

```typescript
popover.anchor = document.querySelector('#trigger')!;
```

An IDREF that does not resolve keeps the current target, so a popover finds an anchor that renders later, on its
next open. When the anchor leaves the DOM, the content hides while `open` keeps its value, so the popover shows
again once a new anchor resolves.

#### Placement and offset

```html
<igc-popover placement="top-end" offset="8">...</igc-popover>
```

`placement` accepts the twelve `PopoverPlacement` values, and the placement is resolved against the writing
direction, so the `start` and `end` variants mirror in an RTL context.

#### Flipping and shifting

```html
<igc-popover flip>...</igc-popover>
```

With `flip`, the popover changes its placement along the main axis to keep the content in view. Shifting along the
cross axis is applied by the position strategies so the content stays within the viewport.

#### The arrow element

```typescript
popover.arrow = arrowElement;
popover.arrowOffset = 4;
```

The arrow is an element the consumer owns and renders; the popover positions it against the resolved side and keeps
it in place when the placement flips.

#### Matching the anchor width

```html
<igc-popover same-width>...</igc-popover>
```

#### Scroll strategies

`scrollStrategy` sets what happens while an ancestor scroll container scrolls and the popover is open:

| Value            | Behavior                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `hide` (default) | The popover hides while the anchor is fully out of view, and shows again when the anchor returns.     |
| `scroll`         | The popover stays visible and anchored, also while the anchor is out of view.                        |
| `close`          | As `hide`, and additionally emits `igcPopoverScrollClose` on each scroll.                            |

The popover does not control its own `open` state, so with `close` the owning component listens for the event and
closes itself:

```typescript
popover.addEventListener('igcPopoverScrollClose', () => {
  this.open = false;
});
```

The event does not bubble, so the listener has to be added on the popover element itself.

#### Position strategies

The popover picks one of two strategies per anchor, and swaps between them when the anchor changes:

| Strategy   | When it is used                                                                 |
| ---------- | -------------------------------------------------------------------------------- |
| `native`   | The browser implements CSS anchor positioning and the implicit anchor of `showPopover({ source })`. |
| `floating` | Everywhere else. The implementation is imported on demand, at the first attach.  |

Native support is probed once, on first use, by measuring a real popover rather than through `CSS.supports` alone,
because some Chromium versions pass the CSS test while ignoring the `source` option. A browser that takes the native
path never loads the fallback module, and because the published build is ESM, a consumer bundler can split it out.

### Localization

None applicable. The component renders no strings.

### Keyboard interactions

None applicable. The popover is a positioning surface; the keyboard behavior, including dismissal, belongs to the
component that owns it.

## API

### Properties and attributes

| Property       | Attribute       | Reflected | Type                                | Default          | Description                                                          |
| -------------- | --------------- | --------- | ----------------------------------- | ---------------- | -------------------------------------------------------------------- |
| open           | open            | Yes       | `boolean`                           | false            | The visibility state of the popover component.                       |
| anchor         | anchor          | No        | `Element \| string \| undefined`    | -                | An element reference or an IDREF to use as the anchor target.        |
| placement      | placement       | No        | `PopoverPlacement`                  | `bottom-start`   | Where to place the floating element relative to the anchor.          |
| offset         | offset          | No        | `number`                            | 0                | Translates the floating element along the main axis.                 |
| flip           | flip            | Yes       | `boolean`                           | false            | Changes the placement to keep the floating element in view.          |
| sameWidth      | same-width      | Yes       | `boolean`                           | false            | Matches the width of the floating element to that of its anchor.     |
| arrow          | -               | No        | `HTMLElement \| null`               | `null`           | Element to render as an arrow element for the current popover.       |
| arrowOffset    | arrow-offset    | No        | `number`                            | 0                | Additional offset to apply to the arrow element if enabled.          |
| scrollStrategy | scroll-strategy | No        | `PopoverScrollStrategy`             | `hide`           | The behavior of the popover when an ancestor scroll container scrolls. |

```typescript
type PopoverPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'right' | 'right-start' | 'right-end'
  | 'left' | 'left-start' | 'left-end';
```

### Methods

None applicable. The popover is driven entirely through its properties.

### Events

| Name                    | Bubbles | Description                                                                                 |
| ----------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `igcPopoverScrollClose` | No      | Emitted on each document scroll while the popover shows against its anchor and the scroll strategy is `close`. The owner of the `open` state must close the popover. |

### Slots

| Name      | Description                                 |
| --------- | ------------------------------------------- |
| (default) | Content of the popover.                     |
| `anchor`  | The element the popover will be anchored to. |

### CSS Shadow parts

| Part        | Description                                                |
| ----------- | ---------------------------------------------------------- |
| `container` | The container wrapping the slotted content in the popover. |

## Test scenarios

The suite lives in [`popover.spec.ts`](./popover.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. It runs the positioning groups against both strategies, forcing
each one through the internal `setPopoverPositionStrategy` helper, so the native and the fallback paths are held to
the same expectations. The groups below mirror the `describe` blocks.

### Slotted anchor element

1. With an initial open state, the content is shown and positioned against the slotted anchor.
2. With an initial closed state, the content is hidden until `open` is set.

### Non-slotted anchor element

3. With an initial open state, the content is shown and positioned against the anchor given by property or IDREF.
4. With an initial closed state, the content is hidden until `open` is set.

### Anchor resolution

5. An element assigned to `anchor` takes precedence over a slotted anchor.
6. An IDREF is resolved from the root of the popover.
7. An IDREF that does not resolve keeps the previous target.
8. Changing the anchor re-attaches the position strategy.

### Open state

9. Toggling `open` shows and hides the container.
10. Disconnecting the popover closes the container, and reconnecting restores the state.
11. The update cycle waits for the position strategy, so the container has a position when the update completes.

### Placement and middleware

12. Each placement positions the container on the expected side of the anchor.
13. The offset translates the container along the main axis.
14. `flip` changes the placement when there is not enough room.
15. `same-width` matches the container width to the anchor width.

### Arrow element tests

16. The arrow is positioned against the resolved side of the placement.
17. The arrow offset is applied.
18. The arrow follows the placement when it flips.

### Anchor visibility

19. The content hides when the anchor leaves the DOM, and shows again when a new anchor resolves.
20. The content tracks the anchor as it scrolls into and out of view.

### Scroll strategy tests

21. `hide` hides the content while the anchor is fully out of view, and shows it again afterwards.
22. `scroll` keeps the content visible and anchored.
23. `close` emits `igcPopoverScrollClose` on each scroll, without changing `open` itself.

### Fallback positioning strategy

24. The whole positioning surface is re-run with the floating strategy forced, covering the browsers without native
    CSS anchor positioning.

## Assumptions and limitations

- The component is internal. It is not exported from the public entry point, and only the `PopoverPlacement` type is
  part of the public API surface.
- The popover does not own its `open` state, does not trap focus and does not dismiss itself. Those belong to the
  component that uses it.
- The arrow element is rendered by the consumer; the popover only positions it.
- Native support is probed once per document and cached, so a change of the capability at run time has no effect.
- The `*-self-*` `position-area` keywords are not implemented across browsers, so the native strategy resolves the
  placements without them.

## Accessibility

### ARIA roles and properties

- The popover carries no role and contributes no ARIA. The component that owns it provides the semantics of the
  surface - for example a `listbox` for a select, or a `dialog` for a picker - and the relation between the anchor
  and the content.
- Because the content lives in the top layer, relations that cross the boundary must travel as element references
  rather than IDREFs.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. The `start` and `end`
placement variants are resolved against the writing direction.

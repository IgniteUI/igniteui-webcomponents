# Tooltip specification

- [Tooltip specification](#tooltip-specification)
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
      - [Declarative anchor target](#declarative-anchor-target)
      - [Programmatic anchor target](#programmatic-anchor-target)
      - [Message and content slots](#message-and-content-slots)
      - [Show and hide triggers](#show-and-hide-triggers)
      - [Delays](#delays)
      - [Placement and the arrow](#placement-and-the-arrow)
      - [Sticky mode](#sticky-mode)
      - [Scroll strategy](#scroll-strategy)
      - [Programmatic control](#programmatic-control)
      - [At a point or a rectangle](#at-a-point-or-a-rectangle)
    - [Behaviors](#behaviors)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Initialization](#initialization)
    - [Properties](#properties)
    - [Methods tests](#methods-tests)
    - [showAt tests](#showat-tests)
    - [Scroll strategy tests](#scroll-strategy-tests)
    - [Arrow tests](#arrow-tests)
    - [Behaviors tests](#behaviors-tests)
    - [State transitions](#state-transitions)
    - [Events tests](#events-tests)
    - [Keyboard interaction tests](#keyboard-interaction-tests)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                         |
| ------: | ---------- | ------------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                         |
|       2 | 2026-10-02 | An anchor that forwards its description passes the tooltip on |
|       3 | 2026-10-19 | Localize the name of the default close button                 |
|       4 | 2026-10-21 | API descriptions aligned with the JSDoc.                      |
|       5 | 2026-10-26 | The arrow is centered on the anchor also on the first show    |
|       6 | 2026-10-30 | `showAt()` shows the tooltip at a point or a rectangle        |
|       7 | 2026-10-30 | Triggers bind once; a changed `anchor` resolves before `show` |
|       8 | 2026-11-03 | A change of `open` ends a queued or running transition; a hide trigger during the show animation ends the animation |
|       9 | 2026-11-03 | White space between the tags no longer hides `message` |

## Overview

The `igc-tooltip` displays supplementary information related to an element when the end-user interacts with it -
by hovering, focusing, or another configured trigger. It offers placement customization, show and hide delays, a
sticky mode that keeps the tooltip visible until it is actively dismissed, and animations.

The tooltip positions itself through the internal [`igc-popover`](../popover/spec.md), so its content renders in the
top layer and is never clipped by a scrolling ancestor.

### Key features

- **Flexible anchoring**: an IDREF or an element reference, set declaratively or programmatically, plus a transient
  anchor passed to `show`.
- **A point or a rectangle**: `showAt` places the tooltip at a point, such as the pointer over a chart, or against a
  rectangle that the application computes, in viewport coordinates.
- **Content or message**: a plain text `message` property, or arbitrary slotted content that takes precedence.
- **Configurable triggers**: the events that show and hide the tooltip are declared as comma or space separated
  lists.
- **Delays**: separate show and hide delays, applied to end-user interaction only.
- **Sticky mode**: the tooltip ignores its hide triggers and is dismissed through a close button, <kbd>Escape</kbd>
  or the API.
- **Placement with an optional arrow**, repositioned automatically near the viewport edges.
- **Animated transitions** that respect `prefers-reduced-motion`.

### Acceptance criteria

The `igc-tooltip` must:

- support rendering user-provided slotted content or a simple text message.
- support setting an anchor element, both declaratively and programmatically.
- expose a declarative way to configure the end-user interactions that show and hide it.
- expose an API to programmatically show, hide, toggle and position it.
- show at a point or a rectangle in viewport coordinates, and move there with no animation.
- keep the tooltip in view by repositioning when the content would be clipped.
- be dismissible with <kbd>Escape</kbd> regardless of its configuration.
- be WAI-ARIA compliant.
- be integrated and themeable with the theming mechanism of the library.
- support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see supplementary information for an element when I hover or focus it.
- dismiss the tooltip by hovering away from it by default, or through another configured interaction.
- dismiss any tooltip by pressing <kbd>Escape</kbd>, regardless of its configuration.
- interact with the content of the tooltip when the scenario requires it.

### Developer stories

As a developer, I expect to be able to:

- display a tooltip for a DOM element when the end-user hovers over it.
- hide a shown tooltip when the end-user hovers out of it or out of its anchor, or clicks.
- configure the anchor element declaratively and programmatically.
- configure the set of interactions that show and hide the tooltip.
- configure the delay before showing and before hiding.
- configure where the tooltip attempts to place itself in the viewport.
- configure a sticky mode where the end-user must actively dismiss the tooltip.
- provide basic text content through a property, or a custom DOM structure through projection.
- change the default close icon in sticky mode, through the icon service or by slotting one.
- create and configure tooltips programmatically - anchors, positioning, open state.
- show a tooltip at the pointer over a canvas, a chart or an SVG drawing, and move it with the pointer.
- show rich content, such as the details of the data item under the pointer, in a tooltip at a point.
- style the tooltip to match the application.

## Functionality

### End-user experience

[Design Hand-off](https://www.figma.com/design/6HS97pQmX6waDxvUTk6qph/Tooltip-Handoff?m=auto&node-id=3023-2&t=T7BncfHz3cqWHxmL-1)

The tooltip appears next to its anchor after the show delay, on the configured side, optionally with an arrow
pointing at the anchor. It disappears after the hide delay once a hide trigger fires, unless the pointer moves onto
the tooltip itself. In sticky mode it stays until the close button is activated, <kbd>Escape</kbd> is pressed, or it
is closed programmatically.

### Developer experience

#### Declarative anchor target

```html
<igc-button id="hover-button">Hover me</igc-button>

<igc-tooltip anchor="hover-button">Supplementary information</igc-tooltip>
```

#### Programmatic anchor target

```html
<igc-button>Hover me</igc-button>
<igc-tooltip>Supplementary information</igc-tooltip>
```

```typescript
const tooltip = document.querySelector('igc-tooltip')!;
tooltip.anchor = document.querySelector('igc-button')!;
```

#### Message and content slots

```html
<!-- Plain text through the property -->
<igc-tooltip message="Hello World"></igc-tooltip>

<!-- Slotted content -->
<igc-tooltip>Hello World</igc-tooltip>

<!-- Slotted content wins -->
<igc-tooltip message="I will not be shown">I will be shown</igc-tooltip>
```

#### Show and hide triggers

```html
<igc-tooltip show-triggers="pointerenter focus" hide-triggers="pointerleave blur click">
  Custom triggers
</igc-tooltip>
```

The defaults are `pointerenter,focusin` for showing and `pointerleave,click,focusout` for hiding.

> [!NOTE]
> The triggers accept the event names as a comma separated string, a space separated string, or a mixture of both.

#### Delays

```html
<igc-tooltip show-delay="500" hide-delay="100">Delayed</igc-tooltip>
```

The delays apply to end-user interaction only. Showing or hiding through the API ignores them.

#### Placement and the arrow

```html
<igc-tooltip placement="top" offset="10" with-arrow>Above the anchor</igc-tooltip>
```

The tooltip respects the given placement and repositions itself when the content would be clipped at a viewport
edge.

#### Sticky mode

```html
<igc-tooltip sticky>
  This stays until dismissed
  <igc-icon slot="close-button" name="close"></igc-icon>
</igc-tooltip>
```

In sticky mode the hide triggers are ignored and a close button is rendered. The `close-button` slot is only
rendered in sticky mode.

#### Scroll strategy

`scrollStrategy` sets the behavior while a parent container scrolls: `hide` - the default - hides the tooltip while
the anchor is fully out of view, `scroll` keeps it visible and anchored, and `close` closes it on each scroll. The
`close` strategy also closes a sticky tooltip; <kbd>Escape</kbd> behaves the same way.

#### Programmatic control

```typescript
await tooltip.show();              // uses the configured anchor
await tooltip.show(otherElement);  // transient anchor
await tooltip.hide();
await tooltip.toggle();
```

`show`, `hide` and `toggle` resolve once the corresponding animation completes, and resolve with whether the state
changed. Setting `open` transitions the tooltip without delays and without animations.

A change of `open` ends a show or a hide that waits for its delay or animates, and the tooltip keeps the new state.
For example, `open = true` during the show delay shows the tooltip at once, and `open = false` and then `open = true`
during the hide delay keeps it open. The method then resolves `false`, and the tooltip sends no `igcOpened` or
`igcClosed`. A set of the current value is not a change: `open = true` during the hide delay does not keep the tooltip
open, and `open = false` during the show delay does not stop the show. `open = false` also drops a transient anchor, so
call `show()` to keep the tooltip open on it during the hide delay.

#### At a point or a rectangle

A chart that draws on a canvas has no element for each data item, so the tooltip cannot use an anchor. `showAt`
places the tooltip at the pointer, and the tooltip shows the details of the data item as slotted content:

```html
<canvas
  id="chart"
  role="img"
  aria-label="Deployments per day: Monday 12, 1 failed; Tuesday 19, 0 failed; ..."
></canvas>

<igc-tooltip id="chart-tip" placement="bottom-start" offset="16"></igc-tooltip>

<style>
  /* The pointer does not leave the chart when it goes over the tooltip. */
  #chart-tip {
    pointer-events: none;
  }
</style>
```

```typescript
import { html, render } from 'lit';

const chart = document.querySelector('#chart')!;
const tooltip = document.querySelector('igc-tooltip')!;
let current: DeploymentDay | undefined;

chart.addEventListener('pointermove', (event) => {
  const item = itemAt(event);

  // The tooltip announces each change of its content, so render only for a new item.
  if (item !== current) {
    current = item;
    render(
      html`
        <div class="chart-tip">
          <strong>${item.day}</strong>
          <span>${item.count} deployments</span>
          <span>${item.failed} failed</span>
        </div>
      `,
      tooltip
    );
  }

  tooltip.showAt({ x: event.clientX, y: event.clientY });
});

chart.addEventListener('pointerleave', () => {
  current = undefined;
  tooltip.hide();
});

// Against a rectangle, such as a bar. A DOMRect fits the type.
tooltip.showAt(barRect);
```

`showAt` takes a `TooltipRect` in viewport coordinates. Without `width` and `height`, the rectangle is a point.
`placement`, `offset`, `withArrow` and the flip at the viewport edges apply, as for an element anchor.

- A call while the tooltip shows at a rectangle moves it. There is no animation and no event, and the call resolves
  with `false`. A move during the show animation keeps the animation. A call during the hide animation shows the
  tooltip again with the show animation and resolves with `true`, as `show` does.
- A call while the tooltip shows at an element closes it and shows it again at the rectangle, as `show` with a new
  target does. `show` with a target while the tooltip shows at a rectangle does the same.
- The rectangle binds no triggers and writes no `aria-describedby`. The triggers of the configured `anchor` also wait
  until the tooltip closes. The tooltip does not hide when the pointer leaves it. The application shows and hides it.
  <kbd>Escape</kbd> still closes it.
- After the tooltip closes, the configured `anchor` applies again. A new `anchor` while the tooltip shows at a
  rectangle applies then too.
- The tooltip keeps the rectangle when it moves in the DOM. A `showAt` before the tooltip connects shows it at the
  rectangle when it connects.
- Missing, `null` and non-finite values become 0, and a negative size becomes 0. A call with no rectangle shows the
  tooltip at 0,0. The tooltip keeps a copy of the values, not the object.
- The slotted content replaces `message`, as for an element anchor. The example renders it with Lit, but any change
  to the children of the tooltip works. When the content changes size, the tooltip keeps its placement. For
  example, with `top`, its bottom edge stays `offset` px above the point.

### Behaviors

- The tooltip respects its given placement, and repositions when the content would be clipped at a viewport edge.
- Slotted content in the default slot takes precedence over the `message` property. Text that is only white space,
  such as a line break between the tags, is not content, and the tooltip shows `message`.
- Once shown, the tooltip stays open until a hide trigger fires, the end-user hovers in and out of the tooltip
  itself, or it is closed programmatically.
- In sticky mode a shown tooltip ignores its hide triggers and the hover-out behavior; it is dismissed through the
  close button, <kbd>Escape</kbd>, or the API.
- Content slotted in the `close-button` slot is rendered only in sticky mode.
- A tooltip that is open on the first render stays shown until the end-user interacts with it or with its anchor.
- The show and hide delays affect end-user interaction only; the API ignores them.
- `show`, `hide` and `toggle` wait for the corresponding animation to complete.
- Setting `open` transitions the tooltip without delays and animations.
- A change of `open` ends a queued or running transition, and the tooltip keeps the new state.
- A hide trigger during the show animation ends the animation at once, so the pointer can move onto the tooltip during
  the hide delay.
- Calling `show` with a target treats it as a transient anchor: the triggers are attached to it and it acts as the
  anchor until the tooltip is dismissed, after which a previously set anchor is restored.
- Calling `showAt` replaces the anchor with a rectangle until the tooltip closes. The rectangle has no triggers and
  no ARIA relation, and the pointer on the tooltip does not hide it.
- A changed `anchor` resolves before `show(target)`, so the target of the later call shows.
- An event in both trigger lists, such as `click` with `show-triggers="click"`, is handled one time.

### Localization

The tooltip takes its resource strings from the `igniteui-i18n-core` package through the `locale` and `resourceStrings`
properties. Without an explicit `locale`, it takes its own `lang`, else the locale of the nearest ancestor that has a
`locale` (a component) or a `lang`, and then the global locale of the library.

| Key             | Default English value | Used for                                             |
| --------------- | --------------------- | ---------------------------------------------------- |
| `tooltip_close` | Close                 | The name of the default close button in sticky mode. |

The `message` property and the slotted content come from the application.

### Keyboard interactions

| Key combination   | Result                                                            |
| ----------------- | ------------------------------------------------------------------ |
| <kbd>Escape</kbd> | Closes the last shown tooltip on the active page.                  |

## API

### Properties and attributes

| Property       | Attribute       | Reflected | Type                             | Default                          | Description                                                     |
| -------------- | --------------- | --------- | -------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| open           | open            | Yes       | `boolean`                        | false                            | Whether the tooltip is showing.                                 |
| anchor         | anchor          | No        | `Element \| string \| undefined` | -                                | An element instance or an IDREF to use as the anchor.           |
| message        | message         | No        | `string`                         | `''`                             | The plain-text content of the tooltip. Slotted content replaces it. |
| placement      | placement       | No        | `PopoverPlacement`               | `bottom`                         | Where to place the tooltip relative to its anchor.              |
| offset         | offset          | No        | `number`                         | 6                                | The offset of the tooltip from the anchor, in pixels.           |
| withArrow      | with-arrow      | Yes       | `boolean`                        | false                            | Whether to render an arrow indicator for the tooltip.           |
| showTriggers   | show-triggers   | No        | `string`                         | `pointerenter,focusin`           | The anchor events that show the tooltip.                        |
| hideTriggers   | hide-triggers   | No        | `string`                         | `pointerleave,click,focusout`    | The anchor events that hide the tooltip.                        |
| showDelay      | show-delay      | No        | `number`                         | 200                              | The time in milliseconds before a show trigger opens the tooltip. |
| hideDelay      | hide-delay      | No        | `number`                         | 300                              | The time in milliseconds before a hide trigger closes the tooltip. |
| sticky         | sticky          | Yes       | `boolean`                        | false                            | Whether the tooltip stays visible until the user closes it with the close button or the `Escape` key. |
| scrollStrategy | scroll-strategy | No        | `PopoverScrollStrategy`          | `hide`                           | The behavior of the tooltip when an ancestor scroll container scrolls. |
| locale         | locale          | No        | `string`                         | -                                | The locale for the resource strings. Falls back to the inherited locale, then the global one. |
| resourceStrings | -               | No        | `ITooltipResourceStrings`        | EN                               | The texts of the component. The strings that you set replace the strings of the current locale. Reading returns all the strings, with your strings over the locale strings.                           |

### Methods

| Name   | Type signature                                | Description                                                                          |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| show   | `(target?: Element \| string): Promise<boolean>` | Shows the tooltip if not already showing. A target is used as a transient anchor. |
| showAt | `(rect: TooltipRect): Promise<boolean>`       | Shows the tooltip at a point or against a rectangle in viewport coordinates. A call while it shows at a rectangle moves it. |
| hide   | `(): Promise<boolean>`                        | Hides the tooltip if not already hidden.                                             |
| toggle | `(): Promise<boolean>`                        | Toggles the tooltip between the shown and hidden state.                              |

### Events

| Name       | Cancellable | Description                                                        |
| ---------- | ----------- | ------------------------------------------------------------------ |
| igcOpening | true        | Emitted before the tooltip opens on a user interaction. Can be canceled to prevent opening. |
| igcOpened  | false       | Emitted after the tooltip opens on a user interaction and is visible. |
| igcClosing | true        | Emitted before the tooltip closes on a user interaction. Can be canceled to prevent closing. Not emitted for the `Escape` key. |
| igcClosed  | false       | Emitted after the tooltip closes on a user interaction and is no longer visible. |

### Slots

| Name           | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| (default)      | The content of the tooltip. Replaces the `message` text.             |
| `close-button` | Slot for a custom sticky-mode close action, such as an icon or button. |

### CSS Shadow parts

| Part           | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `base`         | The wrapping container of the tooltip content.                     |
| `simple-text`  | Added to the base part when the tooltip shows the `message` text, not slotted content. |
| `close-button` | The default sticky-mode close button.                              |

## Test scenarios

The suite lives in [`tooltip.spec.ts`](./tooltip.spec.ts) and runs in a real browser through `@web/test-runner`
with `@open-wc/testing` fixtures and assertions. The groups below mirror the `describe` blocks.

### Initialization

1. The component is initialized with its default state and passes the accessibility audit.
2. A tooltip that starts open renders shown.
3. The anchor is resolved from an IDREF and from an element reference.

### Properties

4. `message` renders as plain text, also with only white space between the tags, and slotted content takes
   precedence over it.
5. `placement`, `offset` and `withArrow` are applied to the positioning surface.
6. `showTriggers` and `hideTriggers` accept comma separated, space separated and mixed lists.
7. `showDelay` and `hideDelay` are honoured for end-user interaction.
8. `sticky` renders the close button, named in the locale of the tooltip, and ignores the hide triggers.

### Methods tests

9. `show` shows the tooltip and resolves when the animation completes.
10. `show` with a target uses it as a transient anchor, restoring the previous anchor afterwards.
11. `hide` and `toggle` transition the state and resolve with whether it changed.
12. The methods ignore the configured delays.
13. `show` with a target after an `anchor` change in the same task shows at the target. The new anchor applies after
    `hide`.
14. Setting the same `anchor` again keeps a transient target.
15. An `anchor` set to the transient target binds its triggers one time.

### showAt tests

The group runs with each position strategy forced.

16. `showAt` with a point shows the tooltip `offset` px from the point, on each side.
17. `showAt` with a rectangle, or a `DOMRect`, places the tooltip against the rectangle.
18. A second call while the tooltip shows moves it, with no animation and no events, and resolves with `false`.
19. A second call during the show animation keeps the animation.
20. No element is described while the tooltip shows at a point. The anchor gets its description back after `hide`.
21. The pointer that enters and leaves the tooltip does not hide it.
22. <kbd>Escape</kbd> closes the tooltip, and the configured anchor applies again.
23. A point replaces an element target, and an element target replaces a point.
24. With `withArrow`, the arrow points at the point.
25. The tooltip flips at the bottom edge of the viewport.
26. Inside a transformed ancestor, the tooltip is at the viewport coordinates.
27. Non-finite, `null` and negative values become 0, and no rectangle shows at 0,0. A change to the argument after
    the call has no effect.
28. The tooltip passes the accessibility audit while it shows at a point.
29. A change of the slotted content size keeps the placement while the tooltip shows at a point.
30. A new `anchor` while the tooltip shows at a point applies after `hide`. An `anchor` change in the same task
    before `showAt` does not replace the point.
31. The triggers of the configured anchor do not act while the tooltip shows at a point. They act again after `hide`.
32. After a show at a point and a show at the configured anchor, the anchor emits each trigger event one time.
33. A call during the hide animation shows the tooltip again and resolves with `true`. The `hide` call resolves with
    `false`.
34. A move in the DOM keeps the point, and <kbd>Escape</kbd> still closes the tooltip. A `showAt` before the tooltip
    connects shows it at the point.
35. A tooltip that is removed during its show animation, or that never connects, does not take the
    <kbd>Escape</kbd> key from a visible tooltip.
36. A `showAt` and a removal in the same task do not throw.
37. The tooltip shows at a point on the left edge of the viewport.
38. The tooltip stays at the point while the page scrolls, also before the next position update.
39. After a flip at an element near the viewport bottom and a hide of a frame, `showAt` starts from `placement`.
40. With `withArrow` and an aligned placement, the arrow stays inside the tooltip, within half its width of the
    point.
41. Inside a zoomed ancestor, the tooltip, its offset and its arrow are at the viewport coordinates.
42. Inside a zoomed ancestor, an aligned tooltip starts at the point, and its arrow stays within half its width of
    the point.
43. A tooltip with no `anchor` clears the point on `hide`, so a later `show` does not show it at the point.

### Scroll strategy tests

44. `hide` hides the tooltip while the anchor is out of view.
45. `scroll` keeps the tooltip anchored.
46. `close` closes the tooltip on scroll, including in sticky mode.

### Arrow tests

47. With `withArrow` and an aligned placement on an anchor wider than the tooltip, the arrow is 8 px from the end.
48. With `withArrow`, the arrow is centered on the anchor on the first show.

### Behaviors tests

49. Moving the pointer from the anchor onto the tooltip keeps it open.
50. A tooltip open on the first render stays shown until an interaction.
51. Setting `open` transitions without delays and animations.
52. An event in both trigger lists is handled one time.

### State transitions

53. Interrupted show and hide transitions settle in the correct final state. A change of `open` ends a queued or
    running transition: the animation stops, the tooltip is not inert, the method resolves `false`, and no `igcOpened`
    or `igcClosed` follows. A change in an `igcOpening` handler also ends it, and `open = undefined` closes the
    tooltip. A set of the current value does not end a queued show or hide.
54. The tooltip is inert while it is closed and during the animations. A hide trigger during the show animation ends
    the animation, and the tooltip is not inert during the hide delay, also after a change of `open` or a new show
    trigger. A show trigger keeps an `inert` that the application set.

### Events tests

55. `igcOpening` and `igcClosing` are emitted and can be canceled to prevent the transition.
56. `igcOpened` and `igcClosed` are emitted after the transition completes.

### Keyboard interaction tests

57. <kbd>Escape</kbd> closes the last shown tooltip, including in sticky mode.

## Assumptions and limitations

- The tooltip is not focusable and does not manage focus. Focus management, where a scenario needs it, is up to the
  application.
- The delays apply only to end-user interaction; the imperative API is immediate.
- One anchor is active at a time; a transient anchor passed to `show` replaces the configured one until dismissal.
- The rectangle of `showAt` is in viewport coordinates. It stays at the same place in the viewport when the page
  scrolls. Call `showAt` again, or hide the tooltip, on a scroll. For the same reason, the `hide` scroll strategy does
  not hide a tooltip at a rectangle.
- The rectangle is in viewport pixels, also inside an ancestor with `zoom`. The `offset` scales with the zoom, as the
  content does.
- With the native position strategy, a tooltip that flipped stays on the flipped side while it shows. A new target
  while it shows can keep the flip. The next show starts from `placement`, if the tooltip was hidden for a frame.
- With an aligned placement (`-start`, `-end`) and a point, the point is at the edge of the tooltip. The arrow stays
  inside the tooltip there, up to half its width from the point.

## Accessibility

The component follows the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). Developers
choose how the open state is initiated through the trigger properties, and whether the tooltip stays until actively
dismissed through `sticky`; the component itself is not focusable and manages no focus state.

### ARIA roles and properties

| ARIA attribute | Default                                              |
| -------------- | ---------------------------------------------------- |
| `role`         | `tooltip`, or `status` while in sticky mode          |
| `aria-atomic`  | `true`                                               |
| `aria-live`    | `polite`                                             |

- In sticky mode the default close icon carries `aria-hidden`.
- While the tooltip is not shown, its internal popover is inert.
- During the show and hide animations the tooltip is inert.
- The animations respect `prefers-reduced-motion`: with the preference enabled they run with a duration of zero.
- A tooltip at a point or a rectangle describes no element. The application must give another way to reach the same
  information, such as a keyboard path through the chart data. The tooltip announces each change of its content
  (`aria-live="polite"`), so change `message` only when the data item changes, not on each pointer move.

**References**

- [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)
- [WAI-ARIA 1.2 tooltip role](https://www.w3.org/TR/wai-aria-1.2/#tooltip)
- A library component that forwards its host `aria-describedby`, such as a button or an input, passes the tooltip on
  to its native element.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional configuration. The placement variants follow the
inline direction.

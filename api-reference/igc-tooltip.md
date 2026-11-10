# igc-tooltip

Shows supplementary information about an element when the user interacts with it, for example on hover or focus.
It supports custom placement, delays, a sticky mode and animations.

```ts
import { defineComponents, IgcTooltipComponent } from 'igniteui-webcomponents';

defineComponents(IgcTooltipComponent);
```

## Properties

- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the tooltip is showing.
- `withArrow`: `boolean`. Default: `false`. Attribute: `with-arrow`, reflected.
  Whether to render an arrow indicator for the tooltip.
- `offset`: `number`. Default: `6`. Attribute: `offset`.
  The offset of the tooltip from the anchor in pixels.
- `placement`: `'bottom' | 'top' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left' | 'right' | 'right-start' | 'right-end' | 'left-start' | 'left-end'`. Default: `'bottom'`. Attribute: `placement`.
  Where to place the tooltip relative to its anchor element.
- `scrollStrategy`: `'scroll' | 'hide' | 'close'`. Default: `'hide'`. Attribute: `scroll-strategy`.
  The behavior of the tooltip when an ancestor scroll container scrolls.

  If the value is `hide`, the tooltip hides while the anchor is fully out
  of view. `hide` is the default value.

  If the value is `scroll`, the tooltip stays visible and anchored.

  If the value is `close`, the tooltip closes on each scroll, also in
  sticky mode. The `Escape` key also closes a sticky tooltip.
- `anchor`: `Element | string | undefined`. Attribute: `anchor`.
  An element instance or an IDREF to use as the anchor for the tooltip.
- `showTriggers`: `string`. Default: `pointerenter,focusin`. Attribute: `show-triggers`.
  The anchor events that show the tooltip.
  A list of event names, separated by commas or spaces.
- `hideTriggers`: `string`. Default: `pointerleave,click,focusout`. Attribute: `hide-triggers`.
  The anchor events that hide the tooltip.
  A list of event names, separated by commas or spaces.
- `showDelay`: `number`. Default: `200`. Attribute: `show-delay`.
  The time in milliseconds before a show trigger opens the tooltip.
  A negative value is the same as 0.
- `hideDelay`: `number`. Default: `300`. Attribute: `hide-delay`.
  The time in milliseconds before a hide trigger closes the tooltip.
  A negative value is the same as 0.
- `message`: `string`. Default: `''`. Attribute: `message`.
  The plain-text content of the tooltip. Slotted content replaces it.
- `sticky`: `boolean`. Default: `false`. Attribute: `sticky`, reflected.
  Whether the tooltip stays visible until the user closes it with the close button or the `Escape` key.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<ITooltipResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Methods

- `show(target?: Element | string): Promise<boolean>`
  Shows the tooltip if not already showing.
  If a target is provided, sets it as a transient anchor.
- `showAt(rect: TooltipRect): Promise<boolean>`
  Shows the tooltip at a point or against a rectangle, in viewport
  coordinates, for example at the `clientX` and `clientY` of a pointer event.
  Without `width` and `height`, the rectangle is a point.
- `hide(): Promise<boolean>`
  Hides the tooltip if not already hidden.
- `toggle(): Promise<boolean>`
  Toggles the tooltip between shown/hidden state.

## Events

- `igcOpening`
  Emitted before the tooltip opens on a user interaction. Can be canceled to prevent opening.
- `igcOpened`
  Emitted after the tooltip opens on a user interaction and is visible.
- `igcClosing`
  Emitted before the tooltip closes on a user interaction. Can be canceled to prevent closing. Not emitted for the `Escape` key.
- `igcClosed`
  Emitted after the tooltip closes on a user interaction and is no longer visible.

## Slots

- default: The content of the tooltip. Replaces the `message` text.
- `close-button`: Slot for custom sticky-mode close action (e.g., an icon/button).

## CSS parts

- `base`: The wrapping container of the tooltip content.
- `simple-text`: Added to the base part when the tooltip shows the `message` text, not slotted content.
- `close-button`: The default sticky-mode close button.

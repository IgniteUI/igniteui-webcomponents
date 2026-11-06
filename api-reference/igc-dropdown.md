# igc-dropdown

Shows a list of items in a popup next to a target element. The user
selects one item from the list.

```ts
import { defineComponents, IgcDropdownComponent } from 'igniteui-webcomponents';

defineComponents(IgcDropdownComponent);
```

## Properties

- `placement`: `'bottom' | 'top' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left' | 'right' | 'right-start' | 'right-end' | 'left-start' | 'left-end'`. Default: `'bottom-start'`. Attribute: `placement`.
  The preferred placement of the component around the target element.
- `flip`: `boolean`. Default: `false`. Attribute: `flip`.
  Whether the dropdown flips to the opposite side of the target when it does not fit in the visible area.
  It flips back when its preferred side has enough space again.
- `distance`: `number`. Default: `0`. Attribute: `distance`.
  The distance from the target element.
- `sameWidth`: `boolean`. Default: `false`. Attribute: `same-width`.
  Whether the dropdown has the same width as the target.
- `items`: `IgcDropdownItemComponent[]`. Read-only. No attribute.
  Returns the items of the dropdown.
- `groups`: `IgcDropdownGroupComponent[]`. Read-only. No attribute.
  Returns the group items of the dropdown.
- `selectedItem`: `IgcDropdownItemComponent | null`. Read-only. No attribute.
  Returns the selected item from the dropdown or null.
- `keepOpenOnSelect`: `boolean`. Default: `false`. Attribute: `keep-open-on-select`, reflected.
  Whether the component stays open after the user selects an item.
- `keepOpenOnOutsideClick`: `boolean`. Default: `false`. Attribute: `keep-open-on-outside-click`, reflected.
  Whether the component stays open when the user clicks outside of it.
- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the component is open.
- `scrollStrategy`: `'scroll' | 'hide' | 'close'`. Default: `'hide'`. Attribute: `scroll-strategy`.
  The behavior of the component when a parent container scrolls.

  If the value is `hide`, the component hides while the anchor is fully out
  of view. `hide` is the default value.

  If the value is `scroll`, the component stays visible and anchored.

  If the value is `close`, the component closes on each scroll.

## Methods

- `show(target?: HTMLElement | string): Promise<boolean>`
  Opens the dropdown. It does not emit events. The optional `target` is the
  anchor element, or its ID. The promise resolves to `false` when the
  dropdown is already open or has no anchor, or when a later call replaces
  this one.
- `toggle(target?: HTMLElement | string): Promise<boolean>`
  Opens the dropdown when it is closed, and closes it when it is open. It
  does not emit events. The optional `target` is the anchor element for
  the open, or its ID. The promise resolves to `true` when the state
  changes.
- `navigateTo(value: string): IgcDropdownItemComponent | null`
  Navigates to the item with the specified value. If it exists, returns the found item, otherwise - null.
- `navigateTo(index: number): IgcDropdownItemComponent | null`
  Navigates to the item at the specified index. If it exists, returns the found item, otherwise - null.
- `navigateTo(value: string | number): IgcDropdownItemComponent | null`
  Navigates to the specified item. If it exists, returns the found item, otherwise - null.
- `select(value: string): IgcDropdownItemComponent | null`
  Selects the item with the specified value. If it exists, returns the found item, otherwise - null.
- `select(index: number): IgcDropdownItemComponent | null`
  Selects the item at the specified index. If it exists, returns the found item, otherwise - null.
- `select(value: string | number): IgcDropdownItemComponent | null`
  Selects the specified item. If it exists, returns the found item, otherwise - null.
- `clearSelection(): void`
  Clears the current selection of the dropdown.
- `hide(): Promise<boolean>`
  Closes the component. It does not emit events. The promise resolves to
  `false` when the component is already closed, or when a later call
  replaces this one.

## Events

- `igcChange`
  Emitted when the user selects a different item. The detail is the item.
- `igcOpening`
  Emitted before the user opens the dropdown. Cancelable.
- `igcOpened`
  Emitted after the dropdown opens on a user action.
- `igcClosing`
  Emitted before the user closes the dropdown. Cancelable.
- `igcClosed`
  Emitted after the dropdown closes on a user action.

## Slots

- `target`: Renders the dropdown's target element.
- default: Renders the dropdown list items.

## CSS parts

- `base`: The dropdown list wrapper container.
- `list`: The dropdown list element.

# igc-toggle-button

The toggle button wraps a native button element and exposes additional `value` and `selected` properties.
Use it in a button group to make a toolbar or a set of options.

```ts
import { defineComponents, IgcToggleButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcToggleButtonComponent);
```

## Properties

- `value`: `string`. Attribute: `value`.
  The value of the control.
- `selected`: `boolean`. Default: `false`. Attribute: `selected`, reflected.
  Whether the button is selected.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the button is disabled.

## Methods

- `focus(options?: FocusOptions): void`
  Sets focus on the button.
- `blur(): void`
  Removes focus from the button.
- `click(): void`
  Simulates a mouse click on the element.

## Slots

- default: Renders the label/content of the button.

## CSS parts

- `toggle`: The native button element.
- `focused`: Added to the toggle part when the button has keyboard focus.

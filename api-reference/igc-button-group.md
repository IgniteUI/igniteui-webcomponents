# igc-button-group

Groups a series of toggle buttons together, exposing features such as layout and selection.

```ts
import { defineComponents, IgcButtonGroupComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonGroupComponent);
```

## Properties

- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether all buttons in the group are disabled.
- `alignment`: `'horizontal' | 'vertical'`. Default: `'horizontal'`. Attribute: `alignment`, reflected.
  The orientation of the buttons in the group.
- `selection`: `'multiple' | 'single' | 'single-required'`. Default: `'single'`. Attribute: `selection`.
  The selection mode of the group. A change of the mode clears the selection.
- `selectedItems`: `string[]`. Attribute: `selected-items`.
  The values of the selected buttons. A button without a value is not in
  the list.

  When set, selects the buttons with these values. A single selection mode
  selects only the first matching button.

## Events

- `igcSelect`
  Emitted when a button is selected through user interaction.
- `igcDeselect`
  Emitted when a button is deselected through user interaction.

## Slots

- default: Renders the toggle buttons of the group.

## CSS parts

- `group`: The button group container.

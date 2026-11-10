# igc-radio-group

Unifies one or more radio components into a single group.

```ts
import { defineComponents, IgcRadioGroupComponent } from 'igniteui-webcomponents';

defineComponents(IgcRadioGroupComponent);
```

## Properties

- `alignment`: `'horizontal' | 'vertical'`. Default: `'vertical'`. Attribute: `alignment`, reflected.
  Alignment of the radio controls inside this group.
- `defaultValue`: `string`. No attribute.
  The value of the radio that is checked by default. A form reset checks
  the radio with this value.
- `name`: `string`. Attribute: `name`, reflected.
  The name applied to all radio buttons in the group.
- `value`: `string`. Attribute: `value`.
  The value of the group, reflecting the value of the currently checked radio button.
  Setting it checks the radio button in the group with a matching value.

## Slots

- default: The radio controls of the group. They must be direct children of the group - radios nested in a wrapper element are neither part of it, nor laid out by it.

## CSS custom states

- `disabled`: Set when the group has radios and all of them are disabled.
- `label-before`: Set when a radio in the group has its label before the control.

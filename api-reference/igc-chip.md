# igc-chip

Chips help people enter information, make selections, filter content, or trigger actions.

```ts
import { defineComponents, IgcChipComponent } from 'igniteui-webcomponents';

defineComponents(IgcChipComponent);
```

## Properties

- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the chip is disabled.
- `removable`: `boolean`. Default: `false`. Attribute: `removable`, reflected.
  Whether the chip shows a remove control. A disabled chip hides it.
- `outlined`: `boolean`. Default: `false`. Attribute: `outlined`, reflected.
  Whether the chip is outlined.
- `selectable`: `boolean`. Default: `false`. Attribute: `selectable`, reflected.
  Whether the chip can be selected.
- `selected`: `boolean`. Default: `false`. Attribute: `selected`, reflected.
  Whether the chip is selected.
- `variant`: `'primary' | 'info' | 'success' | 'warning' | 'danger' | undefined`. Attribute: `variant`, reflected.
  The color variant of the chip.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.
- `resourceStrings`: `Required<IChipResourceStrings>`. No attribute.
  The texts of the component. The strings that you set replace the
  strings of the current locale. Reading returns all the strings, with
  your strings over the locale strings.

## Methods

- `focus(options?: FocusOptions): void`
  Sets focus on the chip.
- `blur(): void`
  Removes focus from the chip.

## Events

- `igcRemove`
  Emitted when the user activates the remove control. The chip does not remove itself.
- `igcSelect`
  Emitted when the user selects or deselects the chip. The detail is the new selected state.

## Slots

- default: Renders the label of the chip.
- `prefix`: Renders content at the start of the chip, before the default content.
- `start`: Renders content at the start of the chip, before the prefix content.
- `suffix`: Renders content at the end of the chip after the default content.
- `end`: Renders content at the end of the chip, after the suffix content.
- `select`: Renders content while a selectable chip is selected. It replaces the default selected icon.
- `remove`: Renders content that replaces the default remove icon.

## CSS parts

- `base`: The base wrapper of the chip.
- `action`: The selection control of the chip, wrapping the chip content.
- `content`: The wrapper element around the default slot of the chip.
- `prefix`: The prefix container of the chip.
- `suffix`: The suffix container of the chip.
- `remove`: The container of the remove control of the chip.

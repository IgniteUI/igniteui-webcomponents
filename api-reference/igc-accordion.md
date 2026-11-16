# igc-accordion

The Accordion is a container-based component that can house multiple expansion panels
and offers keyboard navigation.

```ts
import { defineComponents, IgcAccordionComponent } from 'igniteui-webcomponents';

defineComponents(IgcAccordionComponent);
```

## Properties

- `singleExpand`: `boolean`. Default: `false`. Attribute: `single-expand`, reflected.
  Whether only one panel can be expanded at a time. When the user expands a
  panel, the other panels collapse.
- `panels`: `IgcExpansionPanelComponent[]`. Read-only. No attribute.
  The direct expansion panel children of the accordion.

## Methods

- `hideAll(): Promise<void>`
  Hides all of the child expansion panels' contents.
- `showAll(): Promise<void>`
  Shows all of the child expansion panels' contents.

## Slots

- default: Renders the expansion panels inside default slot.

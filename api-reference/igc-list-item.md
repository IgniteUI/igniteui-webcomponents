# igc-list-item

The list-item component is a container
intended for row items in the list component.

```ts
import { defineComponents, IgcListItemComponent } from 'igniteui-webcomponents';

defineComponents(IgcListItemComponent);
```

## Properties

- `selected`: `boolean`. Default: `false`. Attribute: `selected`, reflected.
  Whether the list item is selected. It changes only the visual style of the
  item.

## Slots

- default: Renders custom content.
- `start`: Renders content before all other content.
- `end`: Renders content after all other content.
- `title`: Renders the title.
- `subtitle`: Renders the subtitle.

## CSS parts

- `start`: The start container.
- `end`: The end container.
- `content`: The header and custom content container.
- `header`: The title and subtitle container.
- `title`: The title container.
- `subtitle`: The subtitle container.

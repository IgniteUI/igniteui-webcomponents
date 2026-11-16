# igc-card-header

A container component for the card's header section.
Displays header content including an optional thumbnail, title, subtitle, and additional content.

```ts
import { defineComponents, IgcCardHeaderComponent } from 'igniteui-webcomponents';

defineComponents(IgcCardHeaderComponent);
```

## Slots

- `thumbnail`: Renders header media such as an icon or small image.
- `title`: Renders the card title (typically a heading element).
- `subtitle`: Renders the card subtitle (typically a smaller heading or text).
- default: Renders additional content under the title and the subtitle.

## CSS parts

- `header`: The card header text container.
- `title`: The title slot wrapper.
- `subtitle`: The subtitle slot wrapper.

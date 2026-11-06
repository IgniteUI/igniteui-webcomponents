# igc-expansion-panel

Shows a header with a title and a subtitle, and content that the user can
expand and collapse.

```ts
import { defineComponents, IgcExpansionPanelComponent } from 'igniteui-webcomponents';

defineComponents(IgcExpansionPanelComponent);
```

## Properties

- `open`: `boolean`. Default: `false`. Attribute: `open`, reflected.
  Whether the panel is expanded and its content is visible.
- `disabled`: `boolean`. Default: `false`. Attribute: `disabled`, reflected.
  Whether the panel is disabled. A disabled panel does not respond to user
  interaction.
- `indicatorPosition`: `'none' | 'start' | 'end'`. Default: `'start'`. Attribute: `indicator-position`, reflected.
  The indicator position of the expansion panel.

## Methods

- `toggle(): `
  Toggles the panel open/close state.
- `hide(): `
  Hides the panel content.
- `show(): `
  Shows the panel content.

## Events

- `igcOpening`
  Emitted before the user opens the panel. Cancelable.
- `igcOpened`
  Emitted after the expansion panel is opened.
- `igcClosing`
  Emitted before the user closes the panel. Cancelable.
- `igcClosed`
  Emitted after the expansion panel is closed.

## Slots

- default: Renders the default content of the panel.
- `title`: Renders the title of the panel header.
- `subtitle`: Renders the subtitle of the panel header.
- `indicator`: Renders the expand/collapse indicator.
- `indicator-expanded`: Renders the expanded state of the indicator.

## CSS parts

- `header`: The container of the expansion indicator, title and subtitle.
- `title`: The title container.
- `subtitle`: The subtitle container.
- `indicator`: The indicator container.
- `content`: The expansion panel's content wrapper.

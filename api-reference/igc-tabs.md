# igc-tabs

Tabs organize and allow navigation between groups of content that are related and at the same level of hierarchy.

```ts
import { defineComponents, IgcTabsComponent } from 'igniteui-webcomponents';

defineComponents(IgcTabsComponent);
```

## Properties

- `alignment`: `'start' | 'end' | 'center' | 'justify'`. Default: `'start'`. Attribute: `alignment`, reflected.
  The alignment of the tab headers in the header strip.

  In a column, `start` is the top and `end` is the bottom.
- `headerPosition`: `'top' | 'start' | 'end'`. Default: `'top'`. Attribute: `header-position`, reflected.
  The side of the panels on which the tab headers are placed.

  With `top`, the headers form a row above the panels. With `start` and `end`, they
  form a column before or after the panels in the text direction, so `start` is on
  the right in a right-to-left layout. In a column, the Up and Down arrow keys move
  between the tabs. When the headers do not fit in the height of the tabs, scroll
  buttons above and below them scroll the column.
- `activation`: `'manual' | 'auto'`. Default: `'auto'`. Attribute: `activation`.
  The activation behavior of the tabs.

  With `auto`, a tab is selected when it receives keyboard focus.
  With `manual`, a tab is selected only on click, or on Enter or Space.
- `tabs`: `IgcTabComponent[]`. Read-only. No attribute.
  The tab children of the component.
- `selected`: `string`. Read-only. No attribute.
  The label of the selected tab, or its `id` when the tab has no label.
  An empty string when no tab is selected.
- `selectedTab`: `IgcTabComponent | null`. Read-only. No attribute.
  The selected tab, or `null` when no tab is selected.

## Methods

- `select(idOrLabel: string): void`
  Selects the tab matching the passed IDREF or label and displays the corresponding panel.

  Disabled tabs and values not matching any tab are ignored.
- `select(ref: IgcTabComponent): void`
  Selects the passed tab and displays the corresponding panel.

  A disabled tab, or a tab that is not a child of the component, is ignored.
- `select(ref: IgcTabComponent | string): void`
  Selects a tab by reference, IDREF or label, and displays the corresponding panel.

  Disabled tabs and values not matching any tab are ignored.

## Events

- `igcChange`
  Emitted when the selected tab changes.

## Slots

- default: Renders the tab components inside the default slot.

## CSS parts

- `header`: The header strip behind the tab headers.
- `start-scroll-button`: The start scroll button displayed when the tabs overflow.
- `end-scroll-button`: The end scroll button displayed when the tabs overflow.
- `selected-indicator`: The indicator that shows which tab is selected.
- `tabs`: The scroll container of the tab headers.
- `inner`: The wrapper of the tab headers, the scroll buttons and the selected indicator.
- `scrollable`: Added to the inner part while the scroll buttons show.

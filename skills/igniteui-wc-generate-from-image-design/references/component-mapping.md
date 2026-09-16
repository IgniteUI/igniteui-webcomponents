# Ignite UI Web Components Component Mapping Reference

## Table of Contents
- [Dashboard & Layout Components](#dashboard--layout-components)
- [Chart Components](#chart-components)
- [Data Display Components](#data-display-components)
- [Form & Input Components](#form--input-components)
- [Calendar & Scheduling Components](#calendar--scheduling-components)
- [Package Requirements](#package-requirements)
- [Import Patterns](#import-patterns)

> **MCP lookup pattern (applies to all sections):**
> - Find doc names → `list_components({ framework: "webcomponents", filter: "<keyword>" })`
> - Usage examples and slots → `get_doc({ framework: "webcomponents", name: "<doc-name>" })`
> - Find exact class names → `search_api({ platform: "webcomponents", query: "<keyword>" })`
> - Full property/method/event API → `get_api_reference({ platform: "webcomponents", component: "<ClassName>" })`

## Dashboard & Layout Components

| UI Pattern | Ignite UI Component |
|---|---|
| Top navigation bar | `IgcNavbarComponent` |
| Side navigation | `IgcNavDrawerComponent` |
| Content cards/panels | `IgcCardComponent` |
| Tabbed content | `IgcTabsComponent` |
| Accordion sections | `IgcAccordionComponent` |
| Split layouts | `IgcSplitterComponent` |
| Tile dashboard | `IgcTileManagerComponent` |
| IDE-style dock layout | `IgcDockManagerComponent` |

Decision rule:

- Use `IgcNavbarComponent` for a top horizontal bar when its slot structure and behavior match the screenshot. Use slotted content and CSS flex overrides to achieve multi-zone layouts inside it. Use a plain `<header>` when that is a closer structural fit.
- Use `IgcNavDrawerComponent` for a sidebar or side-navigation panel when drawer structure and behavior match the screenshot. Configure `open`, `position`, and mini content according to whether the design shows fixed, collapsible, or icon-only navigation. Use a plain `<aside>` when a static custom sidebar matches the screenshot better.
- Use `IgcTabsComponent` for a horizontal tab strip when the screenshot clearly shows tabbed state switching.
- Use `IgcDockManagerComponent` only when the screenshot truly shows docked, floating, or IDE-like panels. Do not substitute it for a simple dashboard grid.

Component decision matrix (by visual pattern, domain-neutral):

| Visual Pattern | Recommended Component | Notes |
|---|---|---|
| Repeated rows with icon/text/action | `IgcListComponent` + `IgcListItemComponent` | Use when the row anatomy and interaction model match; use `slot="title"`, `slot="subtitle"`, `slot="start"`, `slot="end"`. Use native `<ul>/<li>` or custom containers when that is a closer visual fit |
| Spreadsheet-like editable or sortable table | `IgcGridComponent` | Use `igniteui-grid-lite` for lightweight tables and advanced grid packages when the screenshot needs built-in editing, paging, filtering, grouping, summaries, hierarchy, or pivoting |
| Hierarchical or tree-structured table | `IgcTreeGridComponent` or `IgcHierarchicalGridComponent` | Use when rows have parent-child or master-detail relationships |
| Content blocks / summary cards | `IgcCardComponent` | Use when card chrome helps match the panel shape and structure. Use header/content/actions subcomponents with slotted content. Use plain `<div>` containers for flat or highly custom tiles |
| Any text input field | `IgcInputComponent` | Use when the input anatomy matches the screenshot, including search fields and inline editors. Apply CSS and tokens to match the screenshot's border/radius style |
| Dropdown or select | `IgcSelectComponent` | Use when the screenshot clearly shows select/dropdown behavior |
| Form fields with labels and inputs | `IgcInputComponent`, `IgcSelectComponent`, `IgcComboComponent`, `IgcDatePickerComponent` | Cover text, select, combo, and date inputs |
| Multi-step form / wizard | `IgcStepperComponent` | Use when a sequence of steps is visually present |
| Filter chips / tag inputs | `IgcChipComponent` | Use when chip anatomy matches status badges, filter tags, or removable labels in the screenshot |
| Calendar or date picker as a primary view element | `IgcCalendarComponent`, `IgcDatePickerComponent`, `IgcDateRangePickerComponent` | Use when scheduling or date selection is the core UI |
| Top icon/action bar | `IgcNavbarComponent` with slotted icon buttons | Use when a navbar structure matches the screenshot; use plain icon buttons or custom containers when that is a closer fit |

## Chart Components

> Use the lookup pattern above with `filter: "chart"` to find all chart doc names.

| UI Pattern | Ignite UI Component |
|---|---|
| Area chart | `IgcCategoryChartComponent` |
| Line chart | `IgcCategoryChartComponent` |
| Column chart | `IgcCategoryChartComponent` |
| Bar chart | `IgcDataChartComponent` |
| Sparkline (mini chart) | `IgcSparklineComponent` |
| Pie chart | `IgcPieChartComponent` |
| Donut chart | `IgcDoughnutChartComponent` |
| Financial chart | `IgcFinancialChartComponent` |
| Complex multi-series | `IgcDataChartComponent` |

Decision rule:

- Financial or OHLC screenshot: prefer `IgcFinancialChartComponent`.
- Simple or moderate trend panel: prefer `IgcCategoryChartComponent`; move to `IgcDataChartComponent` when you need lower-level per-series control.
- Highly custom sparkline or microchart: use `IgcSparklineComponent` or a custom fallback if the built-in anatomy is not a close visual match.

## Data Display Components

| UI Pattern | Ignite UI Component |
|---|---|
| Item list | `IgcListComponent` + `IgcListItemComponent` |
| User avatar | `IgcAvatarComponent` |
| Status badge | `IgcBadgeComponent` |
| Icons | `IgcIconComponent` |
| Progress bar | `IgcLinearProgressComponent` |
| Circular progress | `IgcCircularProgressComponent` |
| Flat data grid | `IgcGridComponent` |
| Hierarchical/tree data grid | `IgcTreeGridComponent` / `IgcHierarchicalGridComponent` |
| Filter/tag chips | `IgcChipComponent` |

Decision rule:

- Use `IgcListComponent` for repeated-row content lists when its row structure and interaction model match the screenshot. The component adds accessible keyboard navigation, item structure, and theming when those benefits fit the design. Use native `<ul>/<li>` or custom containers when they are a closer visual fit.
- Choose `IgcGridComponent` only when the image is truly tabular (flat rows and columns, spreadsheet-style). Resolve whether the lightweight or advanced grid package is the right fit from the required behavior.
- Choose `IgcTreeGridComponent` or `IgcHierarchicalGridComponent` when rows have parent-child or nested structure.
- Use `IgcChipComponent` when chip anatomy matches the screenshot's status badges, tags, or label pills. Use custom badge or pill markup when a simpler or more exact visual match is needed.

## Form & Input Components

| UI Pattern | Ignite UI Component |
|---|---|
| Text input | `IgcInputComponent` |
| Dropdown select | `IgcSelectComponent` |
| Searchable multi-select | `IgcComboComponent` |
| Date picker | `IgcDatePickerComponent` |
| Time or date-time entry | `IgcDateTimeInputComponent` |
| Toggle switch | `IgcSwitchComponent` |
| Checkbox | `IgcCheckboxComponent` |
| Radio button group | `IgcRadioGroupComponent` + `IgcRadioComponent` |
| Slider | `IgcSliderComponent` |
| Multi-step wizard | `IgcStepperComponent` + `IgcStepComponent` |
| Chip filter bar | `IgcChipComponent` or `IgcButtonGroupComponent` |

## Calendar & Scheduling Components

| UI Pattern | Ignite UI Component |
|---|---|
| Calendar view | `IgcCalendarComponent` |
| Date range picker | `IgcDateRangePickerComponent` |
| Month/year picker | `IgcCalendarComponent` |

## Package Requirements

See [`igniteui-wc-choose-components`](../../igniteui-wc-choose-components/SKILL.md) for the full package routing table (general UI, grids, charts, dock manager, trial vs. licensed).

Install only the packages required by the components you actually selected.

## Import Patterns

Treat this file as a component selection reference, not as authoritative import guidance for a specific repo. Confirm exact imports and registration from `detect_platform`, the current workspace, framework setup, and `get_doc` results.

For direct Web Components usage, import the component classes from the selected package and register only the needed elements with `defineComponents(...)`. If the host app uses React, Angular, Vue, or another wrapper pattern around Web Components, follow [`igniteui-wc-integrate-with-framework`](../../igniteui-wc-integrate-with-framework/SKILL.md) for the final setup details.

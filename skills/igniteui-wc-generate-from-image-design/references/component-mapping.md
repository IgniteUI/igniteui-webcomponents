# Ignite UI Web Components Component Mapping Reference

## Table of Contents
- [Dashboard & Layout Components](#dashboard--layout-components)
- [Chart Components](#chart-components)
- [Data Display Components](#data-display-components)
- [Form & Input Components](#form--input-components)
- [Calendar & Scheduling Components](#calendar--scheduling-components)
- [Map Components](#map-components)
- [Gauge Components](#gauge-components)
- [Package Requirements](#package-requirements)
- [Import Patterns](#import-patterns)

## Dashboard & Layout Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Top navigation bar | `IgcNavbarComponent` | `slot="start"`, default slot, `slot="end"` |
| Side navigation | `IgcNavDrawerComponent` | `open`, `position`, default slot, `slot="mini"` |
| Content cards/panels | `IgcCardComponent` | `<igc-card-header>`, `<igc-card-content>`, `<igc-card-actions>` |
| Tabbed content | `IgcTabsComponent` | `<igc-tab>` children, `alignment`, `activation` |
| Accordion sections | `IgcAccordionComponent` | `IgcExpansionPanelComponent` children |
| Split layouts | `IgcSplitterComponent` | pane-based layout, nested split regions |
| Tile dashboard | `IgcTileManagerComponent` | drag/resize tiles |
| IDE-style dock layout | `IgcDockManagerComponent` | floating/docking panels (Commercial) |

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

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Area chart | `IgcCategoryChartComponent` | `chartType`, `markerTypes`, `brushes`, `outlines` |
| Line chart | `IgcCategoryChartComponent` | `chartType`, `markerTypes`, `brushes` |
| Column/bar chart | `IgcCategoryChartComponent` or `IgcDataChartComponent` | `chartType`, `markerTypes`, series configuration |
| Sparkline (mini chart) | `IgcSparklineComponent` | `displayType`, `valueMemberPath` |
| Pie/donut chart | `IgcPieChartComponent` / `IgcDoughnutChartComponent` | `valueMemberPath`, `labelMemberPath` |
| Financial chart | `IgcFinancialChartComponent` | OHLC/candlestick data |
| Complex multi-series | `IgcDataChartComponent` | multiple series plus axes |

Decision rule:

- Financial or OHLC screenshot: prefer `IgcFinancialChartComponent`.
- Simple or moderate trend panel: prefer `IgcCategoryChartComponent`; move to `IgcDataChartComponent` when you need lower-level per-series control.
- Highly custom sparkline or microchart: use `IgcSparklineComponent` or a custom fallback if the built-in anatomy is not a close visual match.

## Data Display Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Item list | `IgcListComponent` + `IgcListItemComponent` | `slot="title"`, `slot="subtitle"`, `slot="start"`, `slot="end"` |
| User avatar | `IgcAvatarComponent` | `initials`, `shape`, `src` |
| Status badge | `IgcBadgeComponent` | `value`, styling |
| Icons | `IgcIconComponent` | `name`, `collection`, styling |
| Progress bar | `IgcLinearProgressComponent` | `value`, `max` |
| Circular progress | `IgcCircularProgressComponent` | `value`, `max` |
| Flat data grid | `IgcGridComponent` | Grid Lite or full Data Grid depending features |
| Hierarchical/tree data grid | `IgcTreeGridComponent` / `IgcHierarchicalGridComponent` | hierarchical data support |
| Filter/tag chips | `IgcChipComponent` | `removable`, `selectable` |

Decision rule:

- Use `IgcListComponent` for repeated-row content lists when its row structure and interaction model match the screenshot. The component adds accessible keyboard navigation, item structure, and theming when those benefits fit the design. Use native `<ul>/<li>` or custom containers when they are a closer visual fit.
- Choose `IgcGridComponent` only when the image is truly tabular (flat rows and columns, spreadsheet-style). Resolve whether the lightweight or advanced grid package is the right fit from the required behavior.
- Choose `IgcTreeGridComponent` or `IgcHierarchicalGridComponent` when rows have parent-child or nested structure.
- Use `IgcChipComponent` when chip anatomy matches the screenshot's status badges, tags, or label pills. Use custom badge or pill markup when a simpler or more exact visual match is needed.

## Form & Input Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Text input | `IgcInputComponent` | `type`, `value`, prefix/suffix/helper slots |
| Dropdown select | `IgcSelectComponent` | `<igc-select-item>` children, prefix/suffix slots |
| Searchable multi-select | `IgcComboComponent` | data binding, display/value keys, selection mode |
| Date picker | `IgcDatePickerComponent` | `value`, `min`, `max` |
| Time or date-time entry | `IgcDateTimeInputComponent` | typed editing for date/time fields |
| Toggle switch | `IgcSwitchComponent` | checked state, change events |
| Checkbox | `IgcCheckboxComponent` | checked state, validation |
| Radio button group | `IgcRadioGroupComponent` + `IgcRadioComponent` | grouped selection |
| Slider | `IgcSliderComponent` | `min`, `max`, labels/ticks |
| Multi-step wizard | `IgcStepperComponent` + `IgcStepComponent` | orientation, linear step flow |
| Chip filter bar | `IgcChipComponent` or `IgcButtonGroupComponent` | choose based on chip versus segmented-control anatomy |

## Calendar & Scheduling Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Calendar view | `IgcCalendarComponent` | `value`, selection mode |
| Date range picker | `IgcDateRangePickerComponent` | `value`, range selection |
| Month/year picker | `IgcCalendarComponent` | month/year modes when the calendar UI is primary |

## Package Requirements

The main `igniteui-webcomponents` package contains general UI components (list, avatar, navbar, drawer, card, badge, progress, icon, inputs, scheduling, layout, etc.).

Additional packages may be required beyond the main package:

| Capability | Additional packages |
|---|---|
| Lightweight tabular data | `igniteui-grid-lite` |
| Advanced grids | `igniteui-webcomponents-grids` (trial) or `@infragistics/igniteui-webcomponents-grids` (licensed) |
| Charts / sparklines | `igniteui-webcomponents-core` + `igniteui-webcomponents-charts` (trial) or licensed equivalents |
| Dock manager | `igniteui-dockmanager` (trial) or `@infragistics/igniteui-dockmanager` (licensed) |

Install only the packages required by the components you actually selected. Resolve the exact package layout from the current workspace before installing or importing.

## Import Patterns

Treat this file as a component selection reference, not as authoritative import guidance for a specific repo. Confirm exact imports and registration from `detect_platform`, the current workspace, framework setup, and `get_doc` results.

For direct Web Components usage, import the component classes from the selected package and register only the needed elements with `defineComponents(...)`. If the host app uses React, Angular, Vue, or another wrapper pattern around Web Components, follow [`igniteui-wc-integrate-with-framework`](../../igniteui-wc-integrate-with-framework/SKILL.md) for the final setup details.

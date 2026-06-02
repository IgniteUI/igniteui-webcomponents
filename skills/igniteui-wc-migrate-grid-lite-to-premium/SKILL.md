---
name: igniteui-wc-migrate-grid-lite-to-premium
description: Step-by-step migration guide from igniteui-grid-lite (IgcGridLite) to the premium igniteui-webcomponents-grids (IgcGridComponent), covering every import, class name, HTML tag, property, event, template, sorting, filtering, and theming API change.
user-invocable: true
---

# Migrate from Grid Lite to Premium Data Grid (Web Components)

## Purpose

This skill automates the migration from **Grid Lite** (`igniteui-grid-lite`, MIT licensed, `<igc-grid-lite>`) to the **Premium Data Grid** (`igniteui-webcomponents-grids`, commercially licensed, `<igc-grid>`). Use it when a project outgrows Grid Lite's read-only capabilities and needs enterprise features such as editing, selection, paging, grouping, summaries, Excel export, or state persistence.

## MANDATORY AGENT PROTOCOL

> **DO NOT write any code from memory.** Grid APIs change between versions.

Before producing migration code:

1. **Identify the current Grid Lite usage** - read the user's existing TypeScript and HTML files to understand their column configuration, cell templates, data binding, and any `dataPipelineConfiguration` usage.
2. **Use the MCP server** - call `mcp_igniteui-cli_get_api_reference` or `mcp_igniteui-cli_get_doc` (framework: `webcomponents`) to verify current API details when in doubt.
3. **Only then produce output** - base all code on verified references, not memory.

---

## When to Migrate

Migrate from Grid Lite to the Premium Grid when the user needs **any** of these features:

| Required Feature | Grid Lite | Premium Grid |
|---|---|---|
| Cell / Row / Batch editing | No | Yes |
| Row adding / deleting | No | Yes |
| Row / Cell / Column selection | No | Yes |
| Paging (client or remote) | No | Yes |
| GroupBy | No | Yes |
| Summaries (built-in & custom) | No | Yes |
| Column pinning | No | Yes |
| Column moving | No | Yes |
| Master-Detail rows | No | Yes |
| Export (Excel / CSV) | No | Yes |
| Toolbar | No | Yes |
| State persistence | No | Yes |
| Advanced filtering | No | Yes |
| Action strip | No | Yes |
| Row drag | No | Yes |
| Clipboard support | No | Yes |
| Cell merging | No | Yes |

> **IMPORTANT:** The upgrade path from Grid Lite is **always** to `IgcGridComponent` (`<igc-grid>`). Never recommend a different component type as a substitute.

---

## Step 1 - Install / Verify the Premium Package

Grid Lite uses the separate `igniteui-grid-lite` npm package. The Premium Grid ships in `igniteui-webcomponents-grids` (or `@infragistics/igniteui-webcomponents-grids` for licensed builds).

> **AGENT INSTRUCTION:** Check `package.json` to determine which package variant is installed. If only `igniteui-grid-lite` is present, the user needs to install the premium package.

```bash
# Remove Grid Lite
npm uninstall igniteui-grid-lite

# Open-source / trial (shows watermark)
npm install igniteui-webcomponents-grids

# OR licensed package (requires private registry)
npm install @infragistics/igniteui-webcomponents-grids
```

## Step 2 - Update Imports and Registration

**Before (Grid Lite):**

```typescript
import { IgcGridLite, IgcGridLiteColumn } from 'igniteui-grid-lite';
import type { BaseIgcCellContext } from 'igniteui-grid-lite';
import 'igniteui-webcomponents/themes/light/bootstrap.css';
```

**After (Premium Grid):**

```typescript
// Side-effect import - registers all premium grid custom elements; must come first
import 'igniteui-webcomponents-grids/grids/combined.js';

// Type imports
import type {
  IgcGridComponent,
  IgcColumnComponent,
  IgcCellTemplateContext,
  IgcColumnTemplateContext,
  IgcSortingEventArgs,
  IgcFilteringEventArgs,
  IgcSortingExpression,
} from 'igniteui-webcomponents-grids';

// Value imports
import {
  SortingDirection,
  IgcStringFilteringOperand,
  IgcNumberFilteringOperand,
  IgcBooleanFilteringOperand,
  IgcDateFilteringOperand,
  IgcFilteringExpressionsTree,
  FilteringLogic,
  IgcNoopSortingStrategy,
  IgcNoopFilteringStrategy,
} from 'igniteui-webcomponents-grids';

// Theme - change to the grids-specific path
// Available: light|dark x bootstrap|material|fluent|indigo
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';
```

## Step 3 - Update HTML Tags

| Grid Lite | Premium Grid |
|---|---|
| `<igc-grid-lite>` | `<igc-grid>` |
| `<igc-grid-lite-column>` | `<igc-column>` |
| Bare boolean attrs (`sortable`, `filterable`, `hidden`) | Quoted values (`sortable="true"`, `filterable="true"`, `hidden="true"`) |
| No grid-level filter toggle | `allow-filtering="true"` required on `<igc-grid>` |
| No height requirement | `height` attribute required for row virtualization |

**Before:**

```html
<igc-grid-lite id="grid" auto-generate>
  <igc-grid-lite-column field="name" sortable filterable resizable></igc-grid-lite-column>
  <igc-grid-lite-column field="price" data-type="number" sortable></igc-grid-lite-column>
</igc-grid-lite>
```

**After:**

```html
<!-- height is required for row virtualization; set it here or on a fixed-height parent -->
<igc-grid id="grid" auto-generate="true" allow-filtering="true" height="600px">
  <igc-column field="name" sortable="true" filterable="true" resizable="true"></igc-column>
  <igc-column field="price" data-type="number" sortable="true"></igc-column>
</igc-grid>
```

> **Note:** `allow-filtering="true"` on `<igc-grid>` is required to enable filtering. Grid Lite had no grid-level filter toggle.

## Step 4 - Update TypeScript References

```typescript
// Before
const grid   = document.getElementById('grid') as IgcGridLite;
const column = document.querySelector('igc-grid-lite-column[field="name"]') as IgcGridLiteColumn;

// After
const grid   = document.getElementById('grid') as IgcGridComponent;
const column = document.querySelector('igc-column[field="name"]') as IgcColumnComponent;

// grid.data = myArray  - unchanged
```

## Step 5 - Migrate Column Properties

| Grid Lite Property | Premium Grid Property | Notes |
|---|---|---|
| `field` | `field` | Unchanged |
| `header` | `header` | Unchanged |
| `width` | `width` | Unchanged |
| `hidden` | `hidden` | Unchanged |
| `resizable` | `resizable` | Unchanged |
| `sortable` | `sortable` | Unchanged |
| `filterable` | `filterable` | Unchanged |
| `dataType` | `dataType` | Premium adds `dateTime`, `time`, `currency`, `percent` |
| `filteringCaseSensitive` | `filteringIgnoreCase` | **Logic inverted** - `true` becomes `false` |
| `sortingCaseSensitive` | `sortingIgnoreCase` | **Logic inverted** - `true` becomes `false` |
| `sortConfiguration: { comparer }` | `sortStrategy: IgcSortingStrategy` | Class-based (see below) |
| _(none)_ | `editable`, `pinned`, `groupable`, `hasSummary`, `disableHiding`, `disablePinning`, `selectable`, `searchable`, `formatter`, `minWidth`, `maxWidth` | Premium-only |

**Custom sort strategy migration:**

```typescript
// Before (Grid Lite) - function comparer on column
column.sortConfiguration = { comparer: (a, b) => a.length - b.length };

// After (Premium Grid) - class extending DefaultSortingStrategy
import { DefaultSortingStrategy } from 'igniteui-webcomponents-grids';

class LengthSort extends DefaultSortingStrategy {
  override compareValues(a: string, b: string) { return a.length - b.length; }
}
column.sortStrategy = new LengthSort();
```

## Step 6 - Migrate Cell and Header Templates

| Aspect | Grid Lite | Premium Grid |
|---|---|---|
| Cell template property | `column.cellTemplate` | `column.bodyTemplate` |
| Cell context type | `BaseIgcCellContext` | `IgcCellTemplateContext` |
| Cell value | `ctx.value` | `ctx.implicit` |
| Row data | `ctx.row` | `ctx.cell.row.data` |
| Header template | no params | `IgcColumnTemplateContext` param |

**Cell template migration:**

```typescript
// Before (Grid Lite)
column.cellTemplate = (ctx) => html`<span class=${ctx.value}>${ctx.value}</span>`;

// After (Premium Grid)
column.bodyTemplate = (ctx: IgcCellTemplateContext) =>
  html`<span class=${ctx.implicit}>${ctx.implicit}</span>`;
```

**Header template migration:**

```typescript
// Before (Grid Lite) - no parameters
column.headerTemplate = () => html`<strong>Name</strong>`;

// After (Premium Grid) - receives IgcColumnTemplateContext
column.headerTemplate = (ctx: IgcColumnTemplateContext) =>
  html`<strong>${ctx.column.header ?? ctx.column.field}</strong>`;
```

## Step 7 - Migrate Remote Data Operations

Grid Lite uses `dataPipelineConfiguration` (async callbacks). The Premium Grid uses **noop strategies + events**.

**Before (Grid Lite):**

```typescript
grid.dataPipelineConfiguration = {
  sort:   async ({ grid }) => dataService.sortRemote(grid.sortingExpressions),
  filter: async ({ grid }) => dataService.filterRemote(grid.filterExpressions),
};
```

**After (Premium Grid):**

```typescript
const grid = document.getElementById('grid') as IgcGridComponent;

// Disable built-in sort/filter so the grid does not process data locally
grid.sortStrategy   = IgcNoopSortingStrategy.instance();
grid.filterStrategy = IgcNoopFilteringStrategy.instance();

// React to done events and reload data from the server
grid.addEventListener('sortingDone', async () => {
  grid.data = await dataService.sortRemote(grid.sortingExpressions);
});

grid.addEventListener('filteringDone', async () => {
  grid.data = await dataService.filterRemote(grid.filteringExpressionsTree);
});
```

## Step 8 - Migrate Sort / Filter Events

| Grid Lite Event | Premium Grid Event | Notes |
|---|---|---|
| `sorting` | `sorting` | Same name - both cancellable (`e.detail.cancel = true`) |
| `sorted` | `sortingDone` | Name changed - `CustomEvent<IgcSortingExpression[]>` |
| `filtering` | `filtering` | Same name - both cancellable |
| `filtered` | `filteringDone` | Name changed - `CustomEvent<IgcFilteringExpressionsTree>` |

```typescript
// Cancel a sort before it applies
grid.addEventListener('sorting', (e: CustomEvent<IgcSortingEventArgs>) => {
  e.detail.cancel = true;
});

// React after sort completes
grid.addEventListener('sortingDone', (e: CustomEvent<IgcSortingExpression[]>) => {
  console.log('Sorted by', e.detail);
});

// Cancel a filter before it applies
grid.addEventListener('filtering', (e: CustomEvent<IgcFilteringEventArgs>) => {
  e.detail.cancel = true;
});

// React after filter completes
grid.addEventListener('filteringDone', (e: CustomEvent<IgcFilteringExpressionsTree>) => {
  console.log('Filter tree', e.detail);
});
```

## Step 9 - Migrate Programmatic Sort / Filter API

**Grid Lite API:**

```typescript
grid.sort({ key: 'name', direction: 'ascending' });
grid.filter({ key: 'age', condition: 'greaterThan', searchTerm: 21 });
grid.clearSort();
grid.clearFilter();
```

**Premium Grid API:**

```typescript
import { SortingDirection, IgcNumberFilteringOperand } from 'igniteui-webcomponents-grids';

// Sorting - fieldName + SortingDirection enum (Asc = 1, Desc = 2, None = 0)
grid.sort([{ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true }]);
grid.clearSort('name');   // clear one column
grid.clearSort();           // clear all

// Filtering - positional arguments with typed operand instances
grid.filter('age', 21, IgcNumberFilteringOperand.instance().condition('greaterThan'), true);
grid.clearFilter('age');   // clear one column
grid.clearFilter();          // clear all

// Multi-column filtering via expression tree
const tree = new IgcFilteringExpressionsTree(FilteringLogic.And);
tree.filteringOperands.push({
  fieldName: 'age',
  condition: IgcNumberFilteringOperand.instance().condition('greaterThan'),
  searchVal: 21,
  ignoreCase: true,
});
grid.filteringExpressionsTree = tree;
```

**Key expression shape changes:**

| Aspect | Grid Lite | Premium Grid |
|---|---|---|
| Sort target field | `key` | `fieldName` |
| Sort direction | `direction: 'ascending'` (string) | `dir: SortingDirection.Asc` (enum) |
| Filter target field | `key` | `fieldName` |
| Filter search value | `searchTerm` | `searchVal` (expression tree) |
| Case sensitivity (sort) | `caseSensitive: true` | `ignoreCase: false` (**inverted**) |
| Case sensitivity (filter) | `caseSensitive: true` | `ignoreCase: false` (**inverted**) |
| Filter criteria | `criteria` string | `FilteringLogic` enum on the tree |

---

## Adding Enterprise Features Post-Migration

Once on the Premium Grid, enable the features that motivated the migration:

### Row Editing

```html
<igc-grid id="grid" row-editable="true" primary-key="id" height="600px">
  <igc-column field="name" editable="true"></igc-column>
  <igc-column field="price" data-type="number" editable="true"></igc-column>
</igc-grid>
```

> **Note:** `primary-key` is strongly recommended whenever editing, selection, or row-targeted APIs (`getRowByKey`, row pinning, transactions) are used. Without it the grid falls back to object identity, which breaks across virtualization and remote data.

### Row Selection

```html
<igc-grid id="grid" row-selection="multiple" primary-key="id" height="600px">
  <!-- columns -->
</igc-grid>
```

```typescript
grid.addEventListener('rowSelectionChanging', (e: CustomEvent<IgcRowSelectionEventArgs>) => {
  console.log('Selected rows:', e.detail.added);
});
```

### Paging

```html
<igc-grid id="grid" primary-key="id" height="600px">
  <!-- columns -->
  <igc-paginator per-page="15"></igc-paginator>
</igc-grid>
```

### GroupBy

```html
<igc-grid id="grid" primary-key="id" height="600px">
  <igc-column field="category" groupable="true"></igc-column>
</igc-grid>
```

```typescript
grid.groupBy([{ fieldName: 'category', dir: SortingDirection.Asc }]);
```

### Column Pinning

```typescript
const column = grid.getColumnByName('name');
column.pin();    // pin to start (default)
column.unpin();
```

### Summaries

```html
<igc-column field="price" data-type="number" has-summary="true"></igc-column>
```

### Toolbar (Column Hiding, Pinning, Export)

```html
<igc-grid id="grid" auto-generate="true" height="600px">
  <igc-grid-toolbar>
    <igc-grid-toolbar-title>My Grid</igc-grid-toolbar-title>
    <igc-grid-toolbar-actions>
      <igc-grid-toolbar-advanced-filtering></igc-grid-toolbar-advanced-filtering>
      <igc-grid-toolbar-hiding></igc-grid-toolbar-hiding>
      <igc-grid-toolbar-pinning></igc-grid-toolbar-pinning>
      <igc-grid-toolbar-exporter></igc-grid-toolbar-exporter>
    </igc-grid-toolbar-actions>
  </igc-grid-toolbar>
  <!-- columns -->
</igc-grid>
```

### Advanced Filtering Dialog

```typescript
grid.allowAdvancedFiltering = true;
grid.openAdvancedFilteringDialog();
```

### Excel-Style Filter UI

```typescript
grid.filterMode = 'excelStyleFilter';  // default is 'quickFilter'
```

### Batch Editing

```html
<igc-grid id="grid" batch-editing="true" row-editable="true" primary-key="id" height="600px">
  <igc-column field="name" editable="true"></igc-column>
</igc-grid>
```

---
## Related Skills

- **[`igniteui-wc-integrate-with-framework`](../igniteui-wc-integrate-with-framework/SKILL.md)** - Framework integration setup
- **[`igniteui-wc-customize-component-theme`](../igniteui-wc-customize-component-theme/SKILL.md)** - Theming and styling
- **[`igniteui-wc-choose-components`](../igniteui-wc-choose-components/SKILL.md)** - Choosing the right grid component

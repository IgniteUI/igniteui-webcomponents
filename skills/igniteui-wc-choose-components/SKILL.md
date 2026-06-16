---
name: igniteui-wc-choose-components
description: Identify and select the right Ignite UI Web Components for your app UI, then navigate to official docs, usage examples, and API references
user-invocable: true
---

# Choose the Right Ignite UI Components

This skill helps AI agents and developers identify the best Ignite UI components for any UI requirement, then provides direct links to official documentation, usage examples, and API references.

## Prerequisites

- The **Ignite UI CLI MCP server** (`igniteui-cli`) available as a tool provider

> **AGENT INSTRUCTION — MCP Server Setup (REQUIRED)**
>
> Before using the Ignite UI CLI MCP tools, you MUST verify the MCP server is available
> by calling `list_components`. If the tool is not available or the call fails,
> you MUST automatically configure it by following the setup instructions in
> [`reference/mcp-setup.md`](./reference/mcp-setup.md).
>
> After writing the file, inform the user that the MCP server has been
> configured and they may need to reload the editor for the tools to activate.
> Start the MCP server and wait for that MCP server to start before continuing the component-related work.
> Do NOT skip this step or ask the user to do it manually.

## Setting Up the Ignite UI CLI MCP Server

> **Full setup instructions for VS Code, Cursor, Claude Desktop, and JetBrains IDEs are in [`reference/mcp-setup.md`](./reference/mcp-setup.md).** Read that file for editor-specific configuration steps and verification.

## Before You Answer

- Choose the package before writing imports or install steps.
- If the required package is not present in `package.json`, add or install the correct Ignite UI dependency first. Absence from `package.json` does not mean the package is invalid.
- If the user also needs setup or code, then load [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md).

## Example Usage

- "What component should I use to display a list of items with actions?"
- "I need a date picker for a booking form"
- "How do I show file upload progress?"
- "What's the best component for a navigation sidebar?"
- "I need a searchable dropdown with multi-select"
- "Build a dashboard layout with cards and a data grid"
- "I want to display hierarchical/tree data"
- "Show me components for notifications and alerts"

## Related Skills

- [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) — Set up chosen components in React, Angular, Vue, or vanilla JS
- [igniteui-wc-customize-component-theme](../igniteui-wc-customize-component-theme/SKILL.md) — Style and theme the components you select
- [igniteui-wc-optimize-bundle-size](../igniteui-wc-optimize-bundle-size/SKILL.md) — Import only the components you actually use

## When to Use

- Agent or user needs to decide which component fits a UI requirement
- User describes a UI pattern and needs a matching component name
- User wants to explore what components are available
- User needs links to official docs or live examples for a specific component
- Starting a new feature and mapping requirements to components
- Reworking existing UI with new or different component requirements

---

## Available Packages

| Component family | License | Trial install | Licensed install |
|---|---|---|---|
| General UI components | MIT | `npm install igniteui-webcomponents` | (same) |
| Advanced grids | Commercial | `npm install igniteui-webcomponents-grids` | `npm install @infragistics/igniteui-webcomponents-grids` |
| Grid Lite | MIT | `npm install igniteui-grid-lite` | (same) |
| Dock Manager | Commercial | `npm install igniteui-dockmanager` | `npm install @infragistics/igniteui-dockmanager` |
| Charts | Commercial | `npm install igniteui-webcomponents-core igniteui-webcomponents-charts` | `npm install @infragistics/igniteui-webcomponents-core @infragistics/igniteui-webcomponents-charts` |

If the request only says "grid", choose by features:

- Advanced features (editing, paging, summaries, grouping, hierarchical data, pivot) → `igniteui-webcomponents-grids`
- Lightweight table → `igniteui-grid-lite`

## Component Catalogue by UI Pattern

> **Use MCP to discover the live component catalogue.** Call `list_components({ framework: "webcomponents" })` — it returns all 300+ available docs with doc names, summaries, and premium status. Then call `get_doc` with the exact doc `name` field to get usage patterns, HTML examples, and slots; call `get_api_reference` with the component class name (e.g. `IgcCarouselComponent`) for the full property/method/event API.
>
> ```
> list_components({ framework: "webcomponents", filter: "<keyword>" })
> get_doc({ framework: "webcomponents", name: "<doc-name-from-list>" })
> ```
>
> Use `filter` to narrow results: `"input"`, `"grid"`, `"chart"`, `"nav"`, `"date"`, `"combo"`, etc.

The tables below are a **quick routing reference** for the most common UI patterns. Component tags and package assignments are stable; for usage examples call `get_doc`, for full property/method/event API call `get_api_reference`.

### Inputs & Forms

All inputs are form-associated and integrate natively with `<form>`.

| UI Need | Component | Tag |
|---|---|---|
| Text field / text input | Input | `<igc-input>` |
| Multi-line text | Textarea | `<igc-textarea>` |
| Checkbox | Checkbox | `<igc-checkbox>` |
| On/off toggle | Switch | `<igc-switch>` |
| Single choice from a list | Radio / Radio Group | `<igc-radio>` / `<igc-radio-group>` |
| Star / score rating | Rating | `<igc-rating>` |
| Formatted / masked text input | Mask Input | `<igc-mask-input>` |
| Date and time input | Date Time Input | `<igc-date-time-input>` |
| File upload | File Input | `<igc-file-input>` |
| Simple dropdown / select | Select | `<igc-select>` |
| Searchable dropdown, single or multi-select | Combo | `<igc-combo>` |
| Grouped toggle buttons | Button Group | `<igc-button-group>` |
| Range / numeric slider | Slider | `<igc-slider>` |
| Range slider (two handles) | Range Slider | `<igc-range-slider>` |

### Buttons & Actions

| UI Need | Component | Tag |
|---|---|---|
| Standard clickable button | Button | `<igc-button>` |
| Icon-only button | Icon Button | `<igc-icon-button>` |
| Click ripple effect | Ripple | `<igc-ripple>` |
| Removable tag / filter chip | Chip | `<igc-chip>` |

### Scheduling & Date Pickers

| UI Need | Component | Tag |
|---|---|---|
| Full calendar view | Calendar | `<igc-calendar>` |
| Date picker (popup calendar) | Date Picker | `<igc-date-picker>` |
| Date range selection | Date Range Picker | `<igc-date-range-picker>` |

### Notifications & Feedback

| UI Need | Component | Tag |
|---|---|---|
| Brief auto-dismiss notification | Toast | `<igc-toast>` |
| Actionable dismissible notification bar | Snackbar | `<igc-snackbar>` |
| Persistent status banner (e.g. warning, error) | Banner | `<igc-banner>` |
| Modal confirmation or content dialog | Dialog | `<igc-dialog>` |
| Tooltip on hover | Tooltip | `<igc-tooltip>` |
| Small count / status indicator | Badge | `<igc-badge>` |

### Progress Indicators

| UI Need | Component | Tag |
|---|---|---|
| Horizontal progress bar | Linear Progress | `<igc-linear-progress>` |
| Circular / spinner progress | Circular Progress | `<igc-circular-progress>` |

### Layouts & Containers

| UI Need | Component | Tag |
|---|---|---|
| Generic content card | Card | `<igc-card>` |
| User avatar / profile image | Avatar | `<igc-avatar>` |
| Icon display | Icon | `<igc-icon>` |
| Horizontal or vertical divider line | Divider | `<igc-divider>` |
| Collapsible section | Expansion Panel | `<igc-expansion-panel>` |
| Multiple collapsible sections (accordion) | Accordion | `<igc-accordion>` |
| Tabbed content panels | Tabs | `<igc-tabs>` |
| Image / content slideshow | Carousel | `<igc-carousel>` |
| Multi-step wizard / onboarding flow | Stepper | `<igc-stepper>` |
| Resizable, draggable dashboard tiles | Tile Manager | `<igc-tile-manager>` |
| IDE-style docking / floating panels | Dock Manager | `<igc-dockmanager>` |

### Navigation

| UI Need | Component | Tag |
|---|---|---|
| Top application bar / toolbar | Navbar | `<igc-navbar>` |
| Side navigation drawer | Navigation Drawer | `<igc-nav-drawer>` |
| Context menu / actions dropdown | Drop Down | `<igc-dropdown>` |

### Lists & Data Display

| UI Need | Component | Tag |
|---|---|---|
| Simple scrollable list | List | `<igc-list>` |
| Hierarchical / tree data | Tree | `<igc-tree>` |
| Tabular data (MIT, lightweight) | Grid Lite | `<igc-grid>` |
| Full-featured tabular data grid | Data Grid | `<igc-grid>` |
| Nested / master-detail grid | Hierarchical Grid | `<igc-hierarchical-grid>` |
| Parent-child relational tree grid | Tree Grid | `<igc-tree-grid>` |
| Cross-tabulation / BI pivot table | Pivot Grid | `<igc-pivot-grid>` |

### Charting & Visualization

> Charts are provided by the **`igniteui-webcomponents-charts`** package (commercial). Use `IgcCategoryChartComponent` or `IgcFinancialChartComponent` for simpler domain-specific scenarios; use `IgcDataChartComponent` for full flexibility (mixed series, numeric/time axes, scatter, polar, etc.).
>
> Call `list_components({ framework: "webcomponents", filter: "chart" })` for the full chart doc list, then `get_doc` on the specific chart type before coding.

| UI Need | Component | Tag |
|---|---|---|
| Column / Line / Area / Spline / Step charts | Category Chart | `<igc-category-chart>` |
| Pie chart | Pie Chart | `<igc-pie-chart>` |
| Doughnut chart | Doughnut Chart | `<igc-doughnut-chart>` |
| Financial / stock chart (OHLC, candlestick) | Financial Chart | `<igc-financial-chart>` |
| Bar / Scatter / Bubble / Polar / Composite charts | Data Chart | `<igc-data-chart>` |
| Sparkline (inline mini-chart) | Sparkline | `<igc-sparkline>` |
| Treemap | Treemap | `<igc-treemap>` |

### Conversational / AI

| UI Need | Component | Tag |
|---|---|---|
| Chat / AI assistant message thread | Chat | `<igc-chat>` |

---

## Step-by-Step: Choosing Components for a UI

Follow these steps when an agent or user describes a UI requirement:

### Step 1 — Identify UI patterns

Break the described UI into atomic patterns. Examples:
- "A booking form" → date input, text inputs, button, maybe a calendar picker
- "An admin dashboard" → navbar, nav drawer, cards, data grid, charts
- "A notification center" → snackbar or toast, badge, list
- "A settings page" → tabs or accordion, switch, input, select, button

### Step 2 — Map patterns to components

Use the **Component Catalogue** tables above to find matching components. When in doubt:

| If the user needs… | Prefer… | Over… |
|---|---|---|
| Simple static list | `<igc-list>` | Data Grid |
| Basic dropdown | `<igc-select>` | `<igc-combo>` |
| Searchable or multi-select dropdown | `<igc-combo>` | `<igc-select>` |
| Tabular data with basic display and functionality | Grid Lite | Data Grid (commercial) |
| Tabular data, advanced features needed | Data Grid | Grid Lite |
| Single dismissible message | Toast | Snackbar |
| Message requiring user action | Snackbar | Toast |
| Collapsible single section | Expansion Panel | Accordion |
| Multiple collapsible sections | Accordion | Expansion Panel |
| Stepped wizard UI | Stepper | Tabs |
| Content tabs / view switching | Tabs | Stepper |

### Step 3 — Check the package

Confirm which package provides the component:

- **MIT components** (inputs, layout, notifications, scheduling, chat) → `igniteui-webcomponents`
- **Advanced grids** (Data Grid, Tree Grid, Hierarchical Grid, Pivot Grid) → `igniteui-webcomponents-grids` *(commercial)*
- **Lightweight grid** (Grid Lite) → `igniteui-grid-lite` *(MIT)*
- **Docking layout** → `igniteui-dockmanager` *(commercial)*
- **Charts & visualizations** (Category Chart, Data Chart, Financial Chart, Pie Chart, Sparkline, Treemap, etc.) → `igniteui-webcomponents-charts` *(commercial)*

### Step 4 — Look up component documentation

These tools serve different data sources — call the right one to avoid guessing:

- **Usage patterns, HTML examples, slots** → `get_doc` serves the component's **topic-page** (prose guide, code samples, slot names, CSS examples). Use the kebab-case doc `name` returned by `list_components`:
  ```
  get_doc({ framework: "webcomponents", name: "<doc-name>" })
  ```

- **Full property/method/event API** → `get_api_reference` serves **class-level reflection data** (every `@property`, method signature, event name with types). It does NOT overlap with `get_doc` — the topic page rarely lists all properties. Use `search_api` first when you don't know the exact class name (e.g. `IgcCarouselComponent`):
  ```
  search_api({ platform: "webcomponents", query: "<component keyword>" })
  get_api_reference({ platform: "webcomponents", component: "<ClassName>" })
  ```

For feature-based questions (e.g., "how does combo filtering work"), use `search_docs` instead:

```
search_docs({ framework: "webcomponents", query: "<feature keyword>" })
```

### Step 5 — Provide a starter code snippet

Once components are identified, give the user a minimal working snippet. Example for an admin dashboard shell:

```typescript
import {
  defineComponents,
  IgcNavbarComponent,
  IgcNavDrawerComponent,
  IgcCardComponent,
  IgcButtonComponent,
} from 'igniteui-webcomponents';

defineComponents(IgcNavbarComponent, IgcNavDrawerComponent, IgcCardComponent, IgcButtonComponent);
```

```html
<igc-navbar><h1>My Dashboard</h1></igc-navbar>
<igc-nav-drawer>
  <igc-nav-drawer-item><span slot="content">Home</span></igc-nav-drawer-item>
</igc-nav-drawer>
<igc-card>
  <igc-card-header><h3 slot="title">Summary</h3></igc-card-header>
  <igc-card-content>Content goes here</igc-card-content>
</igc-card>
```

---

## Common UI Scenarios → Recommended Component Sets

### Login / Authentication Form
- `<igc-input>` — email and password fields
- `<igc-checkbox>` — "Remember me"
- `<igc-button>` — submit
- `<igc-snackbar>` — error/success feedback

### User Profile / Settings Page
- `<igc-avatar>` — profile picture
- `<igc-tabs>` — section navigation (Profile, Security, Notifications)
- `<igc-input>` / `<igc-textarea>` — editable fields
- `<igc-switch>` — feature toggles
- `<igc-select>` — preference dropdowns
- `<igc-button>` — save/cancel actions

### Data Table / Admin List View
- `<igc-input>` — search bar
- `<igc-combo>` — filter dropdowns
- `<igc-grid>` (Grid Lite) or Data Grid — tabular data
- `<igc-button>` / `<igc-icon-button>` — actions
- `<igc-dialog>` — confirm delete modal
- `<igc-badge>` — status indicators

### Booking / Reservation Form
- `<igc-date-range-picker>` — check-in / check-out
- `<igc-input>` — guest details
- `<igc-select>` — room type
- `<igc-stepper>` — multi-step booking flow
- `<igc-button>` — next / confirm
- `<igc-toast>` — booking confirmation

### Analytics / Reporting Dashboard
- `<igc-navbar>` — top bar
- `<igc-nav-drawer>` — side navigation
- `<igc-card>` — KPI summary cards
- `<igc-tabs>` or `<igc-tile-manager>` — section layout
- Data Grid or Pivot Grid — detailed data tables
- `<igc-linear-progress>` / `<igc-circular-progress>` — loading states

### Notification / Activity Feed
- `<igc-list>` — activity items
- `<igc-avatar>` — user avatars in each item
- `<igc-badge>` — unread count
- `<igc-snackbar>` — real-time alerts
- `<igc-chip>` — filter tags (All, Mentions, Replies)

### AI / Chatbot Interface
- `<igc-chat>` — full chat UI with message threading
- `<igc-input>` or `<igc-textarea>` — message input
- `<igc-icon-button>` — send button
- `<igc-avatar>` — bot and user avatars
- `<igc-circular-progress>` — "thinking" indicator

---

## Common Issues & Solutions

### "I can't find a component for X"

1. Call `list_components({ framework: "webcomponents" })` or use `search_docs` with a feature keyword to find the best match
2. Consider composing two simpler components (e.g., `<igc-card>` + `<igc-list>` for a list card)

### "Which grid should I use?"

| Scenario | Component | Package | License |
|---|---|---|---|
| Simple table with basic features | Grid Lite | `igniteui-grid-lite` | MIT |
| Advanced/excel-style filtering, paging, editing | Data Grid | `igniteui-webcomponents-grids` | Commercial |
| Master-detail / nested rows | Hierarchical Grid | `igniteui-webcomponents-grids` | Commercial |
| Parent-child with shared columns | Tree Grid | `igniteui-webcomponents-grids` | Commercial |
| Cross-tabulation / OLAP analysis | Pivot Grid | `igniteui-webcomponents-grids` | Commercial |

### "I need React support"

Use the [`igniteui-react`](https://www.npmjs.com/package/igniteui-react) package. Components are wrapped with React-friendly event bindings and props. See the [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) skill for setup.

### "How do I get commercial components?"

Visit [https://www.infragistics.com/products/ignite-ui-web-components](https://www.infragistics.com/products/ignite-ui-web-components) or contact [Infragistics sales](https://www.infragistics.com/about-us/contact-us) for licensing information.

---

## Additional Resources

| Resource | Link |
|---|---|
| Getting started guide | [https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/general-getting-started](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/general-getting-started) |
| GitHub repository | [https://github.com/IgniteUI/igniteui-webcomponents](https://github.com/IgniteUI/igniteui-webcomponents) |
| Changelog | [https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md) |
| Discord community | [https://discord.gg/39MjrTRqds](https://discord.gg/39MjrTRqds) |
| Infragistics contact | [https://www.infragistics.com/about-us/contact-us](https://www.infragistics.com/about-us/contact-us) |

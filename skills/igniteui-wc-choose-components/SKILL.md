---
name: igniteui-wc-choose-components
description: Identify and select the right Ignite UI Web Components for your app UI, then navigate to official docs, usage examples, and API references
user-invokable: true
---

# Choose the Right Ignite UI Components

This skill helps AI agents and developers identify the best Ignite UI components for any UI requirement, then provides direct links to official documentation, usage examples, and API references.

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

Ignite UI for Web Components is distributed across several packages depending on your needs:

| Package | License | Install | Best For |
|---|---|---|---|
| [`igniteui-webcomponents`](https://www.npmjs.com/package/igniteui-webcomponents) | MIT | `npm install igniteui-webcomponents` | General UI components (inputs, layouts, notifications, scheduling) |
| [`igniteui-webcomponents-grids`](https://www.npmjs.com/package/igniteui-webcomponents-grids) | Commercial | `npm install igniteui-webcomponents-grids` (trial) | Advanced data grids (Data Grid, Tree Grid, Hierarchical Grid, Pivot Grid) with many built-in functionaries  |
| [`igniteui-grid-lite`](https://www.npmjs.com/package/igniteui-grid-lite) | MIT | `npm install igniteui-grid-lite` | Lightweight data grid for simpler tabular data |
| [`igniteui-dockmanager`](https://www.npmjs.com/package/igniteui-dockmanager) | Commercial | `npm install igniteui-dockmanager` (trial) | Windowing / docking layouts (IDE-style panels) |

---

## Component Catalogue by UI Pattern

Use the table below to map a UI need to the right component, then follow the documentation link.

### Inputs & Forms

All inputs are form-associated and integrate natively with `<form>`.

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Text field / text input | Input | `<igc-input>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/input) |
| Multi-line text | Textarea | `<igc-textarea>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/text-area) |
| Checkbox | Checkbox | `<igc-checkbox>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/checkbox) |
| On/off toggle | Switch | `<igc-switch>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/switch) |
| Single choice from a list | Radio / Radio Group | `<igc-radio>` / `<igc-radio-group>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/radio) |
| Star / score rating | Rating | `<igc-rating>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/rating) |
| Formatted / masked text input | Mask Input | `<igc-mask-input>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/input) |
| Date and time input | Date Time Input | `<igc-date-time-input>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/date-time-input) |
| File upload | File Input | `<igc-file-input>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/file-input) |
| Simple dropdown / select | Select | `<igc-select>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/select) |
| Searchable dropdown, single or multi-select | Combo | `<igc-combo>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/combo/overview) |
| Grouped toggle buttons | Button Group | `<igc-button-group>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/button-group) |
| Range / numeric slider | Slider | `<igc-slider>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/slider) |
| Range slider (two handles) | Range Slider | `<igc-range-slider>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/slider) |

### Buttons & Actions

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Standard clickable button | Button | `<igc-button>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/button) |
| Icon-only button | Icon Button | `<igc-icon-button>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/icon-button) |
| Click ripple effect | Ripple | `<igc-ripple>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/ripple) |
| Removable tag / filter chip | Chip | `<igc-chip>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/chip) |

### Scheduling & Date Pickers

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Full calendar view | Calendar | `<igc-calendar>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/scheduling/calendar) |
| Date picker (popup calendar) | Date Picker | `<igc-datepicker>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/scheduling/date-picker) |
| Date range selection | Date Range Picker | `<igc-date-range-picker>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/scheduling/date-range-picker) |

### Notifications & Feedback

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Brief auto-dismiss notification | Toast | `<igc-toast>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/toast) |
| Actionable dismissible notification bar | Snackbar | `<igc-snackbar>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/snackbar) |
| Persistent status banner (e.g. warning, error) | Banner | `<igc-banner>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/banner) |
| Modal confirmation or content dialog | Dialog | `<igc-dialog>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/dialog) |
| Tooltip on hover | Tooltip | `<igc-tooltip>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/tooltip) |
| Small count / status indicator | Badge | `<igc-badge>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/badge) |

### Progress Indicators

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Horizontal progress bar | Linear Progress | `<igc-linear-progress>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/linear-progress) |
| Circular / spinner progress | Circular Progress | `<igc-circular-progress>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/circular-progress) |

### Layouts & Containers

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Generic content card | Card | `<igc-card>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/card) |
| User avatar / profile image | Avatar | `<igc-avatar>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/avatar) |
| Icon display | Icon | `<igc-icon>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/icon) |
| Horizontal or vertical divider line | Divider | `<igc-divider>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/divider) |
| Collapsible section | Expansion Panel | `<igc-expansion-panel>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/expansion-panel) |
| Multiple collapsible sections (accordion) | Accordion | `<igc-accordion>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/accordion) |
| Tabbed content panels | Tabs | `<igc-tabs>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/tabs) |
| Image / content slideshow | Carousel | `<igc-carousel>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/carousel) |
| Multi-step wizard / onboarding flow | Stepper | `<igc-stepper>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/stepper) |
| Resizable, draggable dashboard tiles | Tile Manager | `<igc-tile-manager>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/tile-manager) |
| IDE-style docking / floating panels | Dock Manager | `<igc-dockmanager>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/dock-manager) |

### Navigation

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Top application bar / toolbar | Navbar | `<igc-navbar>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/menus/navbar) |
| Side navigation drawer | Navigation Drawer | `<igc-nav-drawer>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/menus/navigation-drawer) |
| Context menu / actions dropdown | Drop Down | `<igc-dropdown>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/dropdown) |

### Lists & Data Display

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Simple scrollable list | List | `<igc-list>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/list) |
| Hierarchical / tree data | Tree | `<igc-tree>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/tree) |
| Tabular data (MIT, lightweight) | Grid Lite | `<igc-grid>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grid-lite/overview) |
| Full-featured tabular data grid | Data Grid | `<igc-grid>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/grid/overview) |
| Nested / master-detail grid | Hierarchical Grid | `<igc-hierarchical-grid>` | [Docs](https://www.infragistics.com/webcomponentssite/components/grids/hierarchical-grid/overview) |
| Parent-child relational tree grid | Tree Grid | `<igc-tree-grid>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/tree-grid/overview) |
| Cross-tabulation / BI pivot table | Pivot Grid | `<igc-pivot-grid>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/pivot-grid/overview) |

### Conversational / AI

| UI Need | Component | Tag | Docs |
|---|---|---|---|
| Chat / AI assistant message thread | Chat | `<igc-chat>` | [Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/interactivity/chat) |

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

### Step 4 — Link to official resources

Always direct the user to the official documentation linked in the tables above. Key entry points:

- **Component overview**: [Ignite UI Web Components Docs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/general-getting-started)
- **Live Storybook demos**: [https://igniteui.github.io/igniteui-webcomponents](https://igniteui.github.io/igniteui-webcomponents)
- **npm package**: [https://www.npmjs.com/package/igniteui-webcomponents](https://www.npmjs.com/package/igniteui-webcomponents)
- **GitHub repository**: [https://github.com/IgniteUI/igniteui-webcomponents](https://github.com/IgniteUI/igniteui-webcomponents)
- **Changelog / releases**: [https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md)

### Step 5 — Provide a starter code snippet

Once components are identified, give the user a minimal working snippet. Example for an admin dashboard shell:

```typescript
import {
  defineComponents,
  IgcNavbarComponent,
  IgcNavDrawerComponent,
  IgcCardComponent,
  IgcIconComponent,
  IgcButtonComponent,
  registerIconFromText,
} from 'igniteui-webcomponents';

defineComponents(
  IgcNavbarComponent,
  IgcNavDrawerComponent,
  IgcCardComponent,
  IgcIconComponent,
  IgcButtonComponent
);

registerIconFromText('menu', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>', 'material');
registerIconFromText('home', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>', 'material');
registerIconFromText('build', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>', 'material');
```

```html
<igc-navbar>
  <igc-icon name="menu" collection="material" slot="start"></igc-icon>
  <h1>My Dashboard</h1>
</igc-navbar>

<igc-nav-drawer>
  <igc-nav-drawer-item>
    <igc-icon name="home" collection="material" slot="icon"></igc-icon>
    <span slot="content">Home</span>
  </igc-nav-drawer-item>
  <igc-nav-drawer-item>
    <igc-icon name="build" collection="material" slot="icon"></igc-icon>
    <span slot="content">Settings</span>
  </igc-nav-drawer-item>
</igc-nav-drawer>

<igc-card>
  <igc-card-header>
    <h3 slot="title">Summary</h3>
  </igc-card-header>
  <igc-card-content>Dashboard content here</igc-card-content>
</igc-card>
```

---

## Common UI Scenarios → Recommended Component Sets

### Login / Authentication Form
- `<igc-input>` — email and password fields
- `<igc-checkbox>` — "Remember me"
- `<igc-button>` — submit
- `<igc-snackbar>` — error/success feedback
- **Docs**: [Input](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/input) · [Button](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/button) · [Snackbar](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/snackbar)

### User Profile / Settings Page
- `<igc-avatar>` — profile picture
- `<igc-tabs>` — section navigation (Profile, Security, Notifications)
- `<igc-input>` / `<igc-textarea>` — editable fields
- `<igc-switch>` — feature toggles
- `<igc-select>` — preference dropdowns
- `<igc-button>` — save/cancel actions
- **Docs**: [Avatar](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/avatar) · [Tabs](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/tabs) · [Switch](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/switch)

### Data Table / Admin List View
- `<igc-input>` — search bar
- `<igc-combo>` — filter dropdowns
- `<igc-grid>` (Grid Lite) or Data Grid — tabular data
- `<igc-button>` / `<igc-icon-button>` — actions
- `<igc-dialog>` — confirm delete modal
- `<igc-badge>` — status indicators
- **Docs**: [Grid Lite](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grid-lite/overview) · [Data Grid](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/grid/overview) · [Dialog](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/notifications/dialog)

### Booking / Reservation Form
- `<igc-date-range-picker>` — check-in / check-out
- `<igc-input>` — guest details
- `<igc-select>` — room type
- `<igc-stepper>` — multi-step booking flow
- `<igc-button>` — next / confirm
- `<igc-toast>` — booking confirmation
- **Docs**: [Date Range Picker](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/scheduling/date-range-picker) · [Stepper](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/stepper)

### Analytics / Reporting Dashboard
- `<igc-navbar>` — top bar
- `<igc-nav-drawer>` — side navigation
- `<igc-card>` — KPI summary cards
- `<igc-tabs>` or `<igc-tile-manager>` — section layout
- Data Grid or Pivot Grid — detailed data tables
- `<igc-linear-progress>` / `<igc-circular-progress>` — loading states
- **Docs**: [Tile Manager](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/tile-manager) · [Pivot Grid](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/pivot-grid/overview)

### Notification / Activity Feed
- `<igc-list>` — activity items
- `<igc-avatar>` — user avatars in each item
- `<igc-badge>` — unread count
- `<igc-snackbar>` — real-time alerts
- `<igc-chip>` — filter tags (All, Mentions, Replies)
- **Docs**: [List](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/list) · [Badge](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/badge) · [Chip](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/inputs/chip)

### AI / Chatbot Interface
- `<igc-chat>` — full chat UI with message threading
- `<igc-input>` or `<igc-textarea>` — message input
- `<igc-icon-button>` — send button
- `<igc-avatar>` — bot and user avatars
- `<igc-circular-progress>` — "thinking" indicator
- **Docs**: [Chat](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/interactivity/chat) · [Avatar](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/avatar)

---

## Common Issues & Solutions

### "I can't find a component for X"

1. Check the [full component list](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/general-getting-started) in the official docs
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

# Figma Components → Ignite UI Web Components Map

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 2a to resolve every row of the Phase 1g Table A to a tag, component class, package, and `get_doc` name. It has two entry points:
>
> - **Canonical Role Index** (next section). Use it for **Tier B and Tier C** layers: components from any other UI kit, or un-componentized frames, after they are normalized with [design-provenance.md](design-provenance.md).
> - **Kit Component Name** tables (the sections after it). Use them for **Tier A** layers from the Infragistics **Indigo.Design UI Kits** (Material, Fluent, Bootstrap, Indigo variants), whose layer names map to Ignite UI directly.
>
> When a role or layer name is in neither, call `list_components` then `get_doc` on the closest match.

---

## Canonical Role Index

Normalized roles from `design-provenance.md` → the Ignite UI tag, and the section below that holds its full row (class, package, doc name, key attributes).

| Canonical role (+ normalized props) | Ignite UI Web Components | Section |
| --- | --- | --- |
| `button` · high | `<igc-button variant="contained">` | Button Components |
| `button` · medium (outlined) | `<igc-button variant="outlined">` | Button Components |
| `button` · medium (tonal / secondary fill) | `<igc-button variant="contained">` + `contained-button` tokens set to the **measured** tonal fill and text colors (usually a light shade such as `var(--ig-primary-100)`). Do not use the plain `secondary` palette: on a `material` baseline it holds the brand color, so tonal buttons would look like high-emphasis ones | Button Components |
| `button` · low | `<igc-button variant="flat">` | Button Components |
| `button` · link | `<igc-button variant="flat" href="…">`, or a plain `<a>` styled as a link | Button Components |
| `button` · elevated | `<igc-button variant="contained">` + elevation via tokens | Button Components |
| `button` · danger | Same variant + tokens bound to `--ig-error-*` | Button Components |
| `icon-button` | `<igc-icon-button variant="flat\|outlined\|contained">` | Button Components |
| `fab` | `<igc-button variant="fab">` | Button Components |
| `toggle-group` | `<igc-button-group>` + `<igc-toggle-button>` | Button Components |
| `text-field` · outlined | `<igc-input outlined>` | Form Controls |
| `text-field` · filled / underlined | `<igc-input>` (close the look with `input-group` tokens) | Form Controls |
| `textarea` | `<igc-textarea>` | Form Controls |
| `select` | `<igc-select>` | Form Controls |
| `combobox` (single, searchable) | `<igc-combo single-select>` | Form Controls |
| `combobox` (multi / tags) | `<igc-combo>` | Form Controls |
| `checkbox` / `radio` / `switch` | `<igc-checkbox>` / `<igc-radio-group>`+`<igc-radio>` / `<igc-switch>` | Form Controls |
| `slider` / `range-slider` | `<igc-slider>` / `<igc-range-slider>` | Form Controls |
| `rating` | `<igc-rating>` | Form Controls |
| `file-upload` | `<igc-file-input>` | Form Controls |
| `color-picker` | `<igc-color-picker>` | Form Controls |
| `date-picker` / `date-range-picker` / `calendar` | `<igc-date-picker>` / `<igc-date-range-picker>` / `<igc-calendar>` | Date & Time |
| `time-picker` | `<igc-date-time-input>` with a time format | Date & Time |
| `app-bar` | `<igc-navbar>` | Navigation |
| `side-nav` (expanded, always visible) | `<igc-nav-drawer position="relative" open>` | Navigation |
| navigation rail (icon-only) | `<igc-nav-drawer position="relative">` (**not** `open`) with the rail items in the `mini` slot. The mini rail is hidden while the drawer is open | Navigation |
| `tabs` | `<igc-tabs>` | Navigation |
| `breadcrumbs` | `<igc-breadcrumbs>` + `<igc-breadcrumb>` | Navigation |
| `stepper` | `<igc-stepper>` | Navigation |
| `menu` | `<igc-dropdown>` | Form Controls |
| `accordion` / `expansion-panel` | `<igc-accordion>` / `<igc-expansion-panel>` | Layout |
| `card` | `<igc-card>` (only when header/media/content/actions anatomy fits) | Data Display |
| `list` | `<igc-list>` | Data Display |
| `tree` | `<igc-tree>` | Data Display |
| `data-table` (simple, read-only) | `<igc-grid-lite>` | Grids |
| `data-table` (editing, grouping, paging, summaries…) | `<igc-grid>` and family | Grids |
| `avatar` | `<igc-avatar>` | Data Display |
| `tag` / `count-badge` | `<igc-badge>` | Data Display |
| `chip` | `<igc-chip>` | Data Display |
| `progress-linear` / `progress-circular` | `<igc-linear-progress>` / `<igc-circular-progress>` | Data Display |
| `divider` | `<igc-divider>` | Data Display |
| `carousel` | `<igc-carousel>` | Data Display |
| `dialog` | `<igc-dialog>` | Feedback / Overlay |
| `toast` (text only) / (with action) | `<igc-toast>` / `<igc-snackbar>` | Feedback / Overlay |
| `inline-alert` | `<igc-banner>` | Feedback / Overlay |
| `tooltip` | `<igc-tooltip>` | Feedback / Overlay |
| `qr-code` | `<igc-qr-code>` | Data Display |
| `chart-*` / `gauge-*` / `map` | See the DV table | Charts, Gauges, and Maps |
| `bottom-nav`, `sheet`, `skeleton`, `pagination` (standalone) | No direct component | Components With No Web Components Equivalent |

---

## How to Use the Kit Tables

1. Find the kit component name (as it appears in the Figma layers panel or the Indigo.Design kit library) in the **Kit Component Name** column.
2. Read the **Tag**, **Class**, and **Package** columns for the markup and imports.
3. Call `get_doc({ framework: "webcomponents", name: "<doc name>" })` for usage patterns and slots, then `get_api_reference({ platform: "webcomponents", component: "<Class>" })` for the full property/method/event API.
4. Consult **Key attributes / slots** for the properties most commonly configured from Figma variants. These are starting points, not a substitute for the docs.

> The kit component names are identical across all four kit variants (Material, Fluent, Bootstrap, Indigo). The kit variant determines the theme, not the component name.

### Doc-name rules you will hit immediately

- **Doc names are topic-page names, not tag names.** `navigation-drawer`, `text-area`, `data-grid`, `circular-progress`.
- **`get_doc` normalizes and aliases input.** It strips the `Igc` prefix and the `Component` suffix, so `IgcCarouselComponent` resolves to `carousel`. It also aliases these Web Components names:

  | You pass | Resolves to |
  | --- | --- |
  | `combo`, `combo-box`, `combobox` | `overview` |
  | `grid` | `data-grid` |
  | `tree-grid` | `tree-grid-overview` |
  | `hierarchical-grid` | `hierarchical-grid-overview` |
  | `pivot-grid` | `pivot-grid-overview` |
  | `grid-lite` | `grid-lite-overview` |
  | `treemap` | `treemap-chart` |
  | `radio-group` | `radio` |
  | `range-slider` | `slider` |
  | `geographic-map` | `geo-map` |

- Combo has several topic pages (`overview`, `features`, `single-selection`, `templates`); read `overview` first, then the specific one the design needs.
- Always confirm against a live `list_components({ framework: "webcomponents" })` — the catalog is the source of truth, this table is a shortcut.

### Registration cheat sheet

| Package | Registration |
| --- | --- |
| `igniteui-webcomponents` | `defineComponents(IgcNavbarComponent, IgcCardComponent, …)` |
| `igniteui-webcomponents-grids` | `IgcGridComponent.register()` (per grid type) |
| `igniteui-grid-lite` | `IgcGridLite.register()`, or `import 'igniteui-grid-lite/define'`; the column tag is `igc-grid-lite-column` |
| `igniteui-webcomponents-charts` / `-gauges` / `-maps` | `ModuleManager.register(IgcCategoryChartModule, …)` from `igniteui-webcomponents-core` |
| `igniteui-dockmanager` | `defineComponents(IgcDockManagerComponent)` from `igniteui-dockmanager` (`defineCustomElements()` is deprecated since 2.0.0) |

Licensed projects use the same names prefixed with `@infragistics/` (e.g. `@infragistics/igniteui-webcomponents-grids`, `@infragistics/igniteui-dockmanager`). `igniteui-webcomponents` itself is MIT and has no licensed variant. Resolve the layout once in Phase 0b and keep it consistent.

---

## Button Components

| Kit Component Name                     | Tag                                    | Class                    | Package                  | Doc           | Key attributes / slots                                     |
| -------------------------------------- | -------------------------------------- | ------------------------ | ------------------------ | ------------- | ---------------------------------------------------------- |
| `_Button/Flat`                         | `<igc-button variant="flat">`          | `IgcButtonComponent`     | `igniteui-webcomponents` | `button`      | `variant`, `disabled`, `href`; slots `prefix`, `suffix`    |
| `_Button/Outlined`                     | `<igc-button variant="outlined">`      | `IgcButtonComponent`     | `igniteui-webcomponents` | `button`      | `variant="outlined"`                                       |
| `_Button/Contained` / `_Button/Raised` | `<igc-button variant="contained">`     | `IgcButtonComponent`     | `igniteui-webcomponents` | `button`      | `variant="contained"` (default)                            |
| `_FAB` / `Fab`                         | `<igc-button variant="fab">`           | `IgcButtonComponent`     | `igniteui-webcomponents` | `button`      | `variant="fab"`                                            |
| `_Icon Button/*`                       | `<igc-icon-button variant="flat">`     | `IgcIconButtonComponent` | `igniteui-webcomponents` | `icon-button` | `variant` (`flat\|contained\|outlined`), `name`, `collection` |
| `_Button Group`                        | `<igc-button-group>`                   | `IgcButtonGroupComponent` | `igniteui-webcomponents` | `button-group` | `selection`, `alignment`; `<igc-toggle-button>` children |

> `variant` is an **attribute** on the element itself — there is no directive equivalent of Angular's `igxButton`. Icon-only buttons need an `aria-label` for the Phase 5g check.

---

## Form Controls

> **Input variants.** The kits express `line` / `box` / `border` input types. Web Components expose a single boolean **`outlined`** attribute on `igc-input`, `igc-textarea`, `igc-mask-input`, `igc-date-time-input`, `igc-file-input`, `igc-select`, `igc-combo`, `igc-date-picker`, and `igc-date-range-picker`. Map `_Input/Border` → `outlined`; `_Input/Line` and `_Input/Box` → default. There is **no** global injection-token equivalent of Angular's `IGX_INPUT_GROUP_TYPE` — set the attribute per control, and close residual differences with `input-group` component tokens (Phase 3d), never with internal class selectors.

| Kit Component Name             | Tag                       | Class                           | Package                  | Doc                 | Key attributes / slots                                                     |
| ------------------------------ | ------------------------- | ------------------------------- | ------------------------ | ------------------- | --------------------------------------------------------------------------- |
| `_Input/Line`, `_Input/Box`    | `<igc-input>`             | `IgcInputComponent`             | `igniteui-webcomponents` | `input`             | `type`, `label`, `placeholder`, `value`, `disabled`; slots `prefix`, `suffix`, `helper-text` |
| `_Input/Border`                | `<igc-input outlined>`    | `IgcInputComponent`             | `igniteui-webcomponents` | `input`             | `outlined`                                                                  |
| `_Input/Search`                | `<igc-input type="search">` | `IgcInputComponent`           | `igniteui-webcomponents` | `input`             | Add a search `igc-icon` in the `prefix` slot                                |
| `_Text Area`                   | `<igc-textarea>`          | `IgcTextareaComponent`          | `igniteui-webcomponents` | `text-area`         | `label`, `rows`, `resize`, `outlined`                                       |
| `_Masked Input`                | `<igc-mask-input>`        | `IgcMaskInputComponent`         | `igniteui-webcomponents` | `mask-input`        | `mask`, `prompt`, `value-mode`                                         |
| `_File Upload`                 | `<igc-file-input>`        | `IgcFileInputComponent`         | `igniteui-webcomponents` | `file-input`        | `multiple`, `accept`, `label`                                               |
| `_Combo` / `_ComboBox`         | `<igc-combo>`             | `IgcComboComponent`             | `igniteui-webcomponents` | `combo` → `overview` | `.data`, `display-key`, `value-key`, `group-key`, `single-select`, `outlined` |
| `_Simple Combo`                | `<igc-combo single-select>` | `IgcComboComponent`           | `igniteui-webcomponents` | `single-selection`  | `single-select` — theme key is `simple-combo`                               |
| `_Select` / `_Dropdown`        | `<igc-select>`            | `IgcSelectComponent`            | `igniteui-webcomponents` | `select`            | `<igc-select-item>` / `igc-select-group` / `igc-select-header` children      |
| `_Dropdown` (menu, not a field) | `<igc-dropdown>`         | `IgcDropdownComponent`          | `igniteui-webcomponents` | `dropdown`          | `open`, `placement`; `<igc-dropdown-item>` children                         |
| `_Checkbox`                    | `<igc-checkbox>`          | `IgcCheckboxComponent`          | `igniteui-webcomponents` | `checkbox`          | `checked`, `indeterminate`, `label-position`, `disabled`                     |
| `_Radio` / `_Radio Button`     | `<igc-radio>`             | `IgcRadioComponent`             | `igniteui-webcomponents` | `radio`             | `value`, `checked`; wrap in `<igc-radio-group>`                             |
| `_Switch` / `_Toggle`          | `<igc-switch>`            | `IgcSwitchComponent`            | `igniteui-webcomponents` | `switch`            | `checked`, `label-position`                                                 |
| `_Slider`                      | `<igc-slider>`            | `IgcSliderComponent`            | `igniteui-webcomponents` | `slider`            | `min`, `max`, `step`, `value`, `discrete-track`                              |
| `_Range Slider`                | `<igc-range-slider>`      | `IgcRangeSliderComponent`       | `igniteui-webcomponents` | `slider`            | `lower`, `upper`                                                            |
| `_Rating`                      | `<igc-rating>`            | `IgcRatingComponent`            | `igniteui-webcomponents` | `rating`            | `value`, `max`, `step`, `single`, `allow-reset`, `hover-preview`, `readonly`; slots `symbol`, `value-label`; `igcChange` event                          |
| `_Color Picker`                | `<igc-color-picker>`      | `IgcColorPickerComponent`       | `igniteui-webcomponents` | confirm via `list_components` | `value`, `format`, `label`, `mode`, `show-alpha`, `hide-formats`             |

---

## Date & Time

| Kit Component Name   | Tag                         | Class                           | Package                  | Doc                 | Key attributes / slots                                              |
| -------------------- | --------------------------- | ------------------------------- | ------------------------ | ------------------- | -------------------------------------------------------------------- |
| `_Date Picker`       | `<igc-date-picker>`         | `IgcDatePickerComponent`        | `igniteui-webcomponents` | `date-picker`       | `value`, `min`, `max`, `mode` (`dropdown\|dialog`), `label`, `outlined` |
| `_Date Range Picker` | `<igc-date-range-picker>`   | `IgcDateRangePickerComponent`   | `igniteui-webcomponents` | `date-range-picker` | `value`, `mode`, `use-two-inputs`                                    |
| `_Time Picker`       | `<igc-date-time-input>`     | `IgcDateTimeInputComponent`     | `igniteui-webcomponents` | `date-time-input`   | **No dedicated time picker in Web Components** — use a time `input-format` |
| `_Calendar`          | `<igc-calendar>`            | `IgcCalendarComponent`          | `igniteui-webcomponents` | `calendar`          | `selection` (`single\|multiple\|range`), `value`, `values`, `visible-months`, `week-start`, `show-week-numbers`, `header-orientation` |

> The date pickers are **compound** — their dropdown and calendar surfaces are separate themes. Follow the related-theme chain from `get_component_design_tokens`.

---

## Navigation

| Kit Component Name                 | Tag                       | Class                          | Package                  | Doc                   | Key attributes / slots                                                         |
| ---------------------------------- | ------------------------- | ------------------------------ | ------------------------ | --------------------- | -------------------------------------------------------------------------------- |
| `_Navbar`                          | `<igc-navbar>`            | `IgcNavbarComponent`           | `igniteui-webcomponents` | `navbar`              | Slots `start`, `end`, default (title). No `title` attribute — slot the title in.  |
| `_Navigation Drawer` / `_Side Nav` | `<igc-nav-drawer>`        | `IgcNavDrawerComponent`        | `igniteui-webcomponents` | `navigation-drawer`   | `open`, `position` (`start\|end\|top\|bottom\|relative`), `label`; slot `mini`; `<igc-nav-drawer-item>` / `<igc-nav-drawer-header-item>` children |
| `_Tabs`                            | `<igc-tabs>`              | `IgcTabsComponent`             | `igniteui-webcomponents` | `tabs`                | `alignment`, `activation`; `<igc-tab label="…">` children with `prefix`/`suffix` slots |
| `_Bottom Navigation`               | —                         | —                              | —                        | —                     | **Not available in Web Components.** Use `igc-tabs` or custom markup; document the substitution. |
| `_Stepper`                         | `<igc-stepper>`           | `IgcStepperComponent`          | `igniteui-webcomponents` | `stepper`             | `orientation`, `step-type`, `linear`, `title-position`; `<igc-step>` children     |
| `_Breadcrumbs`                     | `<igc-breadcrumbs>` | `IgcBreadcrumbsComponent` | `igniteui-webcomponents` | confirm via `list_components` | `separator`; default slot contains `<igc-breadcrumb>` children; wrap in `<nav aria-label="…">` |
| `_Breadcrumb`                      | `<igc-breadcrumb>`  | `IgcBreadcrumbComponent`  | `igniteui-webcomponents` | confirm via `list_components` | `current`, `disabled`; slots `prefix`, `suffix`, `separator` |

> A design showing a persistent, always-visible sidebar maps to `<igc-nav-drawer position="relative" open>` — not the modal default. The drawer's width comes from the `navdrawer` design tokens `size` and `size--mini`, exposed as `--ig-nav-drawer-size` (default 15rem) and `--ig-nav-drawer-size--mini`. Set them through `create_component_theme` like any other token.

---

## Layout

| Kit Component Name | Tag                     | Class                        | Package                     | Doc                | Key attributes / slots                                        |
| ------------------ | ----------------------- | ---------------------------- | --------------------------- | ------------------ | -------------------------------------------------------------- |
| `_Accordion`       | `<igc-accordion>`       | `IgcAccordionComponent`      | `igniteui-webcomponents`    | `accordion`        | `single-expand`; `<igc-expansion-panel>` children              |
| `_Expansion Panel` | `<igc-expansion-panel>` | `IgcExpansionPanelComponent` | `igniteui-webcomponents`    | `expansion-panel`  | `open`, `disabled`, `indicator-position`; slots `title`, `subtitle`, `indicator-expanded`     |
| `_Splitter`        | `<igc-splitter>`        | `IgcSplitterComponent`       | `igniteui-webcomponents`    | `splitter`         | Orientation and pane sizing — confirm from `get_doc`           |
| `_Tile Manager`    | `<igc-tile-manager>`    | `IgcTileManagerComponent`    | `igniteui-webcomponents`    | `tile-manager`     | `<igc-tile>` children; `column-count`, `gap`, `min-column-width`, `resize-mode`, `drag-mode`        |
| `_Dock Manager`    | `<igc-dockmanager>`     | `IgcDockManagerComponent`    | `igniteui-dockmanager`      | `dock-manager`     | `.layout` JSON assigned as a **property**                      |

---

## Data Display

| Kit Component Name                   | Tag                        | Class                             | Package                  | Doc                  | Key attributes / slots                                                   |
| ------------------------------------ | -------------------------- | --------------------------------- | ------------------------ | -------------------- | -------------------------------------------------------------------------- |
| `_List`                              | `<igc-list>`               | `IgcListComponent`                | `igniteui-webcomponents` | `list`               | `<igc-list-item>` children with slots `start`, `title`, `subtitle`, `end`; `<igc-list-header>` |
| `_Tree` / `_Tree View`               | `<igc-tree>`               | `IgcTreeComponent`                | `igniteui-webcomponents` | `tree`               | `selection`; `<igc-tree-item>` children                                    |
| `_Card`                              | `<igc-card>`               | `IgcCardComponent`                | `igniteui-webcomponents` | `card`               | `<igc-card-header>` (slots `thumbnail`, `title`, `subtitle`), `<igc-card-media>`, `<igc-card-content>`, `<igc-card-actions>` |
| `_Chip` / `_Chips`                   | `<igc-chip>`               | `IgcChipComponent`                | `igniteui-webcomponents` | `chip`               | `removable`, `selectable`, `selected`, `disabled`, `outlined`, `variant`; slots `prefix`, `suffix`, `start`, `end` — there is **no chips-area**, lay chips out with flex |
| `_Avatar`                            | `<igc-avatar>`             | `IgcAvatarComponent`              | `igniteui-webcomponents` | `avatar`             | `src`, `alt`, `initials`, `shape` (`circle\|rounded\|square`)                     |
| `_Badge`                             | `<igc-badge>`              | `IgcBadgeComponent`               | `igniteui-webcomponents` | `badge`              | `variant` (`primary\|info\|success\|warning\|danger`), `shape`, `outlined`, `dot`             |
| `_Icon`                              | `<igc-icon>`               | `IgcIconComponent`                | `igniteui-webcomponents` | `icon`               | `name`, `collection` — icons must be **registered first** (see below)     |
| `_Carousel`                          | `<igc-carousel>`           | `IgcCarouselComponent`            | `igniteui-webcomponents` | `carousel`           | `<igc-carousel-slide>` children; `interval`, `vertical`, `disable-loop`, `hide-indicators`, `hide-navigation`                     |
| `_Linear Progress` / `_Progress Bar` | `<igc-linear-progress>`    | `IgcLinearProgressComponent`      | `igniteui-webcomponents` | `linear-progress`    | `value`, `max`, `indeterminate`, `variant`, `striped` — theme key `progress-linear` |
| `_Circular Progress`                 | `<igc-circular-progress>`  | `IgcCircularProgressComponent`    | `igniteui-webcomponents` | `circular-progress`  | `value`, `max`, `indeterminate` — theme key `progress-circular`           |
| `_Divider`                           | `<igc-divider>`            | `IgcDividerComponent`             | `igniteui-webcomponents` | `divider`            | `type` (`solid\|dashed`), `vertical`, `middle`                            |
| `_Chat`                              | `<igc-chat>`               | `IgcChatComponent`                | `igniteui-webcomponents` | `chat`               | `.messages`, `.options` assigned as properties                            |
| `_QR Code`                          | `<igc-qr-code>`            | `IgcQrCodeComponent`              | `igniteui-webcomponents` | confirm via `list_components` | `value`, `size`, `error-level`, `logo-src`, `dot-style`, `square-style` |
| `_Paginator`                         | `<igc-paginator>`          | grid package                      | `igniteui-webcomponents-grids` | search `grid-paging` | Part of the grid packages, not a standalone core component           |

---

## Feedback / Overlay

| Kit Component Name | Tag              | Class                  | Package                  | Doc        | Key attributes / slots                                          |
| ------------------ | ---------------- | ---------------------- | ------------------------ | ---------- | ----------------------------------------------------------------- |
| `_Dialog`          | `<igc-dialog>`   | `IgcDialogComponent`   | `igniteui-webcomponents` | `dialog`   | `open`, `title`, `close-on-outside-click`, `keep-open-on-escape`, `hide-default-action`; slots `title`, `message`, `footer`; `show()` / `hide()` |
| `_Toast`           | `<igc-toast>`    | `IgcToastComponent`    | `igniteui-webcomponents` | `toast`    | `open`, `display-time`, `keep-open`, `position`; `show()` / `hide()`                            |
| `_Snackbar`        | `<igc-snackbar>` | `IgcSnackbarComponent` | `igniteui-webcomponents` | `snackbar` | `open`, `display-time`, `keep-open`, `action-text`; slot `action`; `show()`                          |
| `_Banner`          | `<igc-banner>`   | `IgcBannerComponent`   | `igniteui-webcomponents` | `banner`   | Slots `prefix`, `actions`; compound with `flat-button` for theming |
| `_Tooltip`         | `<igc-tooltip>`  | `IgcTooltipComponent`  | `igniteui-webcomponents` | `tooltip`  | `anchor`, `placement`, `message`, `show-delay`, `hide-delay`, `sticky`, `with-arrow` — a component, not a directive |

---

## Grids

| Kit Component Name     | Tag                        | Class                          | Package                        | Doc                            | Key attributes / slots                                  |
| ---------------------- | -------------------------- | ------------------------------ | ------------------------------ | ------------------------------ | --------------------------------------------------------- |
| `_Grid` / `_Data Grid` | `<igc-grid>`               | `IgcGridComponent`             | `igniteui-webcomponents-grids` | `grid` → `data-grid`           | `.data` property, `primary-key`, `row-editable`; `<igc-column>` children |
| Lightweight table      | `<igc-grid-lite>`          | grid-lite package              | `igniteui-grid-lite`           | `grid-lite` → `grid-lite-overview` | `<igc-grid-lite-column>` children                     |
| `_Tree Grid`           | `<igc-tree-grid>`          | `IgcTreeGridComponent`         | `igniteui-webcomponents-grids` | `tree-grid` → `tree-grid-overview` | `primary-key`, `foreign-key` or `child-data-key`     |
| `_Hierarchical Grid`   | `<igc-hierarchical-grid>`  | `IgcHierarchicalGridComponent` | `igniteui-webcomponents-grids` | `hierarchical-grid` → `…-overview` | nested `<igc-row-island>`                             |
| `_Pivot Grid`          | `<igc-pivot-grid>`         | `IgcPivotGridComponent`        | `igniteui-webcomponents-grids` | `pivot-grid` → `…-overview`    | `.pivotConfiguration` property                           |

Grid rules that differ from Angular:

- Register per grid type: `IgcGridComponent.register()`.
- The grid packages ship their **own theme CSS** — `igniteui-webcomponents-grids/grids/themes/<variant>/<design-system>.css` — in addition to the core theme. Inside a Lit component, import it `?inline` and inject it into the shadow root; at app level, import it normally.
- `data` is a property, not an attribute: `.data=${rows}` / `grid.data = rows`.
- Leave at least one `<igc-column>` without a `width` so it fills the remaining space.
- Feature docs are separate pages (`grid-editing`, `grid-filtering`, `grid-paging`, …) — fetch the ones the artboard actually shows.

---

## Charts, Gauges, and Maps

> These are DV components. They have **no design tokens** — do not call `get_component_design_tokens` for them. Configure everything through properties, and take series colors from `theming_get_chart_series_colors` plus the Figma values captured in Phase 1d.
>
> Registration for all three packages goes through `ModuleManager.register(IgcXxxModule, …)` imported from `igniteui-webcomponents-core`. Array and function values must be **assigned as properties**, never as attributes.

| Kit Component Name                                        | Tag                       | Class                        | Package                          | Doc                                          |
| --------------------------------------------------------- | ------------------------- | ---------------------------- | -------------------------------- | --------------------------------------------- |
| `_Category Chart` / `_Line` / `_Area` / `_Column` charts  | `<igc-category-chart>`    | `IgcCategoryChartComponent`  | `igniteui-webcomponents-charts`  | `column-chart`, `line-chart`, `area-chart`, `bar-chart` |
| `_Pie Chart`                                              | `<igc-pie-chart>`         | `IgcPieChartComponent`       | `igniteui-webcomponents-charts`  | `pie-chart`                                   |
| `_Donut Chart`                                            | `<igc-doughnut-chart>`    | `IgcDoughnutChartComponent`  | `igniteui-webcomponents-charts`  | `donut-chart`                                 |
| `_Financial Chart` / `_Stock Chart`                       | `<igc-financial-chart>`   | `IgcFinancialChartComponent` | `igniteui-webcomponents-charts`  | `stock-chart`                                 |
| `_Sparkline`                                              | `<igc-sparkline>`         | `IgcSparklineComponent`      | `igniteui-webcomponents-charts`  | `sparkline-chart`                             |
| `_Data Chart` / `_Scatter` / `_Bubble` / `_Polar`         | `<igc-data-chart>`        | `IgcDataChartComponent`      | `igniteui-webcomponents-charts`  | `scatter-chart`, `bubble-chart`, `polar-chart`, `composite-chart` |
| `_Treemap`                                                | `<igc-treemap>`           | `IgcTreemapComponent`        | `igniteui-webcomponents-charts`  | `treemap` → `treemap-chart`                   |
| `_Funnel Chart`                                           | `<igc-funnel-chart>`      | `IgcFunnelChartComponent`    | `igniteui-webcomponents-charts`  | no topic page — use `search_api` + `get_api_reference` |
| `_Linear Gauge`                                           | `<igc-linear-gauge>`      | `IgcLinearGaugeComponent`    | `igniteui-webcomponents-gauges`  | `linear-gauge`                                |
| `_Radial Gauge`                                           | `<igc-radial-gauge>`      | `IgcRadialGaugeComponent`    | `igniteui-webcomponents-gauges`  | `radial-gauge`                                |
| `_Bullet Graph`                                           | `<igc-bullet-graph>`      | `IgcBulletGraphComponent`    | `igniteui-webcomponents-gauges`  | `bullet-graph`                                |
| `_Geographic Map`                                         | `<igc-geographic-map>`    | `IgcGeographicMapComponent`  | `igniteui-webcomponents-maps`    | `geographic-map` → `geo-map`                  |

DV specifics worth knowing before Phase 4:

- Gauge and chart **attributes are kebab-case** (`minimum-value`, `maximum-value`, `chart-type`), while collection-valued members such as `dataSource` are properties.
- `plotAreaBackground` and `areaFillOpacity` are inherited from parent classes and will not appear in `get_api_reference` for `IgcCategoryChartComponent` — find them with `search_api`.
- Category charts show markers by default; if the design has none, set the documented no-marker value.
- Give charts an explicit height (and their grid track a `min-height`) or they collapse.

---

## Icons

`igc-icon` renders from a **registry** — nothing is bundled by default. Register before use:

```typescript
import { registerIcon, registerIconFromText } from 'igniteui-webcomponents';

// From an SVG string (preferred — no network dependency)
registerIconFromText('home', '<svg …></svg>', 'material');

// From a URL
await registerIcon('search', 'https://example.com/icons/search.svg');
```

For the Material Icons Extended set used by the Indigo.Design UI Kit for Material — Figma component descriptions carry the suffix **"material extended"**:

```bash
npm install @igniteui/material-icons-extended
```

```typescript
import { all } from '@igniteui/material-icons-extended';
import { registerIconFromText } from 'igniteui-webcomponents';

for (const icon of all) {
  registerIconFromText(icon.name, icon.value);
}
```

```html
<igc-icon name="credit-cards"></igc-icon>
```

**Detection in Phase 1d:** scan `data-name` values and component descriptions for "material extended". If found, add the package to the required list and get approval before Phase 4. `setIconRef(name, collection, meta)` lets you alias one registered icon to another name when the design reuses a glyph under a different label.

Registered icons are never extracted as image assets — see `asset-extraction.md`.

### Icons from other kits

Third-party kits come with their own icon sets. Identify the set from the icon instance names (`lucide/chevron-down`, `ic_fluent_…`, `Icon / arrow-right`, `Symbols/…`), from the component descriptions, or from the kit fingerprint in `design-provenance.md`. Then register glyphs **from that set's SVG package**, so names, weights, and stroke widths match the design:

| Icon set | SVG source package (confirm name, version, and license before installing) |
| --- | --- |
| Material Symbols | `@material-symbols/svg-400` (pick the weight/fill the design uses) |
| Fluent System Icons | `@fluentui/svg-icons` |
| Lucide (shadcn/ui kits) | `lucide-static` |
| Bootstrap Icons | `bootstrap-icons` |
| Heroicons | `heroicons` |
| Phosphor | `@phosphor-icons/core` |
| Ant Design Icons | `@ant-design/icons-svg` |

```typescript
import chevronDown from 'lucide-static/icons/chevron-down.svg?raw';
registerIconFromText('chevron-down', chevronDown, 'lucide');
```

```html
<igc-icon name="chevron-down" collection="lucide"></igc-icon>
```

Register only the glyphs the design uses: importing a whole set inflates the bundle. When the set is paid (for example Untitled UI Icons Pro) or unknown, or is not licensed for the web (SF Symbols), extract the used glyphs as SVG with Tier 1 Method B from `asset-extraction.md` and register those instead. Tell the user which icons came from a licensed set.

---

## Components With No Web Components Equivalent

Check this list before assuming a 1:1 mapping exists. When you hit one, substitute and document the substitution in a code comment and in the Phase 2d plan.

| Kit component / role | Status in Web Components | Substitute                                                      |
| ----------------- | ------------------------- | ------------------------------------------------------------------ |
| `_Bottom Navigation` | Not available          | `igc-tabs`, or custom markup styled from the design                |
| `_Time Picker`    | Not available as a picker | `igc-date-time-input` with a time input format                     |
| `_Autocomplete`   | Not available             | `igc-combo` with filtering, or `igc-input` + `igc-dropdown`         |
| `_Action Strip`   | Grid packages only (`igc-action-strip`) | Inside grids, use `igc-action-strip`; elsewhere, slotted icon buttons positioned over the row/card |
| `_Chips Area`     | Not a component           | A flex container around `igc-chip` elements                         |
| `_Query Builder`  | Grid packages only        | `query-builder` doc — confirm availability for the installed package |
| Sheet / side sheet (other kits) | Not available           | `igc-nav-drawer` for navigation; `igc-dialog` or custom markup for content panels |
| Skeleton loader (other kits) | Not available             | Custom markup with a CSS shimmer bound to palette variables          |
| Standalone pagination (other kits) | Grid packages only (`igc-paginator`) | `igc-paginator` when paging a grid; otherwise custom markup with `igc-icon-button`s |

---

## Unmapped Layers

When you encounter a Figma layer that is **not in this file**:

1. Normalize it with [design-provenance.md](design-provenance.md) (Tier B variant properties, or Tier C structure) and retry the Canonical Role Index. Otherwise, extract the visual pattern (is it a list? a form field? a card?).
2. Call `list_components({ framework: "webcomponents", filter: "<keyword>" })` and scan for the closest match.
3. Call `get_doc` (and `get_api_reference` when you need the full API) before writing code.
4. If no Ignite UI component matches after a genuine attempt, use plain semantic HTML and document the reason in a code comment.

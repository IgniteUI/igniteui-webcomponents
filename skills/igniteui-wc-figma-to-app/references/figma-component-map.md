# Figma Components → Ignite UI Web Components Map

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 2a to resolve every row of the Phase 1g Table A to a tag, component class, package, and `get_doc` name. It has two entry points:
>
> - **Canonical Role Index** (next section). Use it for **Tier B and Tier C** layers: components from any other UI kit, or un-componentized frames, after you normalize them with [design-provenance.md](design-provenance.md).
> - **Kit Component Name** tables (the sections after it). Use them for **Tier A** layers from the Infragistics **Indigo.Design UI Kits** (Material, Fluent, Bootstrap, Indigo variants). The layer names of these kits map to Ignite UI directly.
>
> If a role or layer name is in neither part, call `list_components`. Then call `get_doc` on the closest match.

---

## Canonical Role Index

This index maps each normalized role from `design-provenance.md` to the Ignite UI tag. It also gives the section below that holds the full row (class, package, doc name, key attributes).

| Canonical role (+ normalized props) | Ignite UI Web Components | Section |
| --- | --- | --- |
| `button` · high | `<igc-button variant="contained">` | Button Components |
| `button` · medium (outlined) | `<igc-button variant="outlined">` | Button Components |
| `button` · medium (tonal / secondary fill) | `<igc-button variant="contained">` + `contained-button` tokens set to the **measured** tonal fill and text colors (usually a light shade such as `var(--ig-primary-100)`). Do not use the plain `secondary` palette. On a `material` baseline, it holds the brand color, so tonal buttons look like high-emphasis buttons | Button Components |
| `button` · low | `<igc-button variant="flat">` | Button Components |
| `button` · link | `<igc-button variant="flat" href="…">`, or a plain `<a>` styled as a link | Button Components |
| `button` · elevated | `<igc-button variant="contained">` + elevation set through tokens | Button Components |
| `button` · danger | Same variant + tokens bound to `--ig-error-*` | Button Components |
| `icon-button` | `<igc-icon-button variant="flat\|outlined\|contained">` | Button Components |
| `fab` | `<igc-button variant="fab">` | Button Components |
| `toggle-group` | `<igc-button-group>` + `<igc-toggle-button>` | Button Components |
| `text-field` · outlined | `<igc-input outlined>` | Form Controls |
| `text-field` · filled / underlined | `<igc-input>` (use `input-group` tokens to match the look) | Form Controls |
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

1. Find the kit component name in the **Kit Component Name** column. Use the name from the Figma layers panel or the Indigo.Design kit library.
2. Read the **Tag**, **Class**, and **Package** columns for the markup and imports.
3. Call `get_doc({ framework: "webcomponents", name: "<doc name>" })` for usage patterns and slots.
4. Call `get_api_reference({ platform: "webcomponents", component: "<Class>" })` for the full property, method, and event API.
5. Read **Key attributes / slots** for the properties that Figma variants configure most frequently. These are starting points. They do not replace the docs.

> The kit component names are the same in all four kit variants (Material, Fluent, Bootstrap, Indigo). The kit variant sets the theme, not the component name.

### Doc-name rules you will hit immediately

- **Doc names are topic-page names, not tag names.** For example: `navigation-drawer`, `text-area`, `data-grid`, `circular-progress`.
- **`get_doc` normalizes and aliases input.** It removes the `Igc` prefix and the `Component` suffix, so `IgcCarouselComponent` resolves to `carousel`. It also aliases these Web Components names:

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

- Combo has several topic pages (`overview`, `features`, `single-selection`, `templates`). Read `overview` first, then read the page that the design needs.
- Always confirm with a live `list_components({ framework: "webcomponents" })` call. The catalog is the source of truth. This table is only a shortcut.

### Registration cheat sheet

| Package | Registration |
| --- | --- |
| `igniteui-webcomponents` | `defineComponents(IgcNavbarComponent, IgcCardComponent, …)` |
| `igniteui-webcomponents-grids` | `IgcGridComponent.register()` (per grid type) |
| `igniteui-grid-lite` | `IgcGridLite.register()`, or `import 'igniteui-grid-lite/define'`; the column tag is `igc-grid-lite-column` |
| `igniteui-webcomponents-charts` / `-gauges` / `-maps` | `ModuleManager.register(IgcCategoryChartModule, …)` from `igniteui-webcomponents-core` |
| `igniteui-dockmanager` | `defineComponents(IgcDockManagerComponent)` from `igniteui-dockmanager` (`defineCustomElements()` is deprecated since 2.0.0) |

Licensed projects use the same names with the prefix `@infragistics/` (for example, `@infragistics/igniteui-webcomponents-grids`, `@infragistics/igniteui-dockmanager`). `igniteui-webcomponents` has the MIT license and has no licensed variant. Resolve the layout once in Phase 0b and keep it consistent.

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

> `variant` is an **attribute** on the element. There is no directive equivalent of Angular's `igxButton`. Icon-only buttons need an `aria-label` for the Phase 5g check.

---

## Form Controls

> **Input variants.** The kits use the `line`, `box`, and `border` input types. Web Components have one boolean **`outlined`** attribute on `igc-input`, `igc-textarea`, `igc-mask-input`, `igc-date-time-input`, `igc-file-input`, `igc-select`, `igc-combo`, `igc-date-picker`, and `igc-date-range-picker`. Map `_Input/Border` → `outlined`; `_Input/Line` and `_Input/Box` → default. There is **no** global injection-token equivalent of Angular's `IGX_INPUT_GROUP_TYPE`. Set the attribute on each control. Close the remaining differences with `input-group` component tokens (Phase 3d), never with internal class selectors.

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

> The date pickers are **compound** components. Their dropdown and calendar surfaces use separate themes. Follow the related-theme chain from `get_component_design_tokens`.

---

## Navigation

| Kit Component Name                 | Tag                       | Class                          | Package                  | Doc                   | Key attributes / slots                                                         |
| ---------------------------------- | ------------------------- | ------------------------------ | ------------------------ | --------------------- | -------------------------------------------------------------------------------- |
| `_Navbar`                          | `<igc-navbar>`            | `IgcNavbarComponent`           | `igniteui-webcomponents` | `navbar`              | Slots `start`, `end`, default (title). No `title` attribute — put the title in the default slot. |
| `_Navigation Drawer` / `_Side Nav` | `<igc-nav-drawer>`        | `IgcNavDrawerComponent`        | `igniteui-webcomponents` | `navigation-drawer`   | `open`, `position` (`start\|end\|top\|bottom\|relative`), `label`; slot `mini`; `<igc-nav-drawer-item>` / `<igc-nav-drawer-header-item>` children |
| `_Tabs`                            | `<igc-tabs>`              | `IgcTabsComponent`             | `igniteui-webcomponents` | `tabs`                | `alignment`, `activation`; `<igc-tab label="…">` children with `prefix`/`suffix` slots |
| `_Bottom Navigation`               | —                         | —                              | —                        | —                     | **Not available in Web Components.** Use `igc-tabs` or custom markup; document the substitution. |
| `_Stepper`                         | `<igc-stepper>`           | `IgcStepperComponent`          | `igniteui-webcomponents` | `stepper`             | `orientation`, `step-type`, `linear`, `title-position`; `<igc-step>` children     |
| `_Breadcrumbs`                     | `<igc-breadcrumbs>` | `IgcBreadcrumbsComponent` | `igniteui-webcomponents` | confirm via `list_components` | `separator`; default slot contains `<igc-breadcrumb>` children; wrap in `<nav aria-label="…">` |
| `_Breadcrumb`                      | `<igc-breadcrumb>`  | `IgcBreadcrumbComponent`  | `igniteui-webcomponents` | confirm via `list_components` | `current`, `disabled`; slots `prefix`, `suffix`, `separator` |

> If a design shows a persistent sidebar that is always visible, map it to `<igc-nav-drawer position="relative" open>`, not to the modal default. The `navdrawer` design tokens `size` and `size--mini` set the drawer width. They are available as `--ig-nav-drawer-size` (default 15rem) and `--ig-nav-drawer-size--mini`. Set them through `create_component_theme`, as you do for other tokens.

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
| `_Chip` / `_Chips`                   | `<igc-chip>`               | `IgcChipComponent`                | `igniteui-webcomponents` | `chip`               | `removable`, `selectable`, `selected`, `disabled`, `outlined`, `variant`; slots `prefix`, `suffix`, `start`, `end` — there is **no chips-area**; use a flex layout for chips |
| `_Avatar`                            | `<igc-avatar>`             | `IgcAvatarComponent`              | `igniteui-webcomponents` | `avatar`             | `src`, `alt`, `initials`, `shape` (`circle\|rounded\|square`)                     |
| `_Badge`                             | `<igc-badge>`              | `IgcBadgeComponent`               | `igniteui-webcomponents` | `badge`              | `variant` (`primary\|info\|success\|warning\|danger`), `shape`, `outlined`, `dot`             |
| `_Icon`                              | `<igc-icon>`               | `IgcIconComponent`                | `igniteui-webcomponents` | `icon`               | `name`, `collection` — you must **register icons first** (see below)      |
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
- The grid packages include their **own theme CSS** (`igniteui-webcomponents-grids/grids/themes/<variant>/<design-system>.css`) in addition to the core theme. In a Lit component, import it with `?inline` and inject it into the shadow root. At app level, import it normally.
- `data` is a property, not an attribute: `.data=${rows}` / `grid.data = rows`.
- Leave at least one `<igc-column>` without a `width` so it fills the remaining space.
- Feature docs are separate pages (`grid-editing`, `grid-filtering`, `grid-paging`, …). Get the pages for the features that the artboard shows.

---

## Charts, Gauges, and Maps

> These are DV components. They have **no design tokens**. Do not call `get_component_design_tokens` for them. Configure all settings through properties. Take series colors from `theming_get_chart_series_colors` and the Figma values that you recorded in Phase 1d.
>
> To register components from all three packages, use `ModuleManager.register(IgcXxxModule, …)` from `igniteui-webcomponents-core`. You must **assign array and function values as properties**, never as attributes.

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

DV details to know before Phase 4:

- Gauge and chart **attributes are kebab-case** (`minimum-value`, `maximum-value`, `chart-type`). Collection-valued members such as `dataSource` are properties.
- `plotAreaBackground` and `areaFillOpacity` come from parent classes. They do not appear in `get_api_reference` for `IgcCategoryChartComponent`. Find them with `search_api`.
- Category charts show markers by default. If the design has no markers, set the documented no-marker value.
- Set an explicit height on charts and a `min-height` on their grid track. If you do not, the charts collapse.

---

## Icons

`igc-icon` renders icons from a **registry**. By default, the package bundles no icons. Register each icon before you use it:

```typescript
import { registerIcon, registerIconFromText } from 'igniteui-webcomponents';

// From an SVG string (preferred — no network dependency)
registerIconFromText('home', '<svg …></svg>', 'material');

// From a URL
await registerIcon('search', 'https://example.com/icons/search.svg');
```

The Indigo.Design UI Kit for Material uses the Material Icons Extended set. For icons from this set, Figma component descriptions have the suffix **"material extended"**. To use the set:

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

**Detection in Phase 1d:** look for "material extended" in `data-name` values and component descriptions. If you find it, add the package to the required list. Get approval before Phase 4. If the design uses a glyph again under a different label, use `setIconRef(name, collection, meta)` to alias the registered icon to the new name.

Do not extract registered icons as image assets (see `asset-extraction.md`).

### Icons from other kits

Third-party kits have their own icon sets. Identify the set from the icon instance names (`lucide/chevron-down`, `ic_fluent_…`, `Icon / arrow-right`, `Symbols/…`), from the component descriptions, or from the kit fingerprint in `design-provenance.md`. Then register glyphs **from that set's SVG package**, so that names, weights, and stroke widths match the design:

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

Register only the glyphs that the design uses. If you import a full set, the bundle becomes larger. The set can be paid (for example, Untitled UI Icons Pro), unknown, or not licensed for the web (SF Symbols). In these cases, export the glyphs that the design uses as SVG with Tier 1 Method B from `asset-extraction.md`. Then register these SVGs instead. Tell the user which icons came from a licensed set.

---

## Components With No Web Components Equivalent

Before you assume that a 1:1 mapping exists, check this list. If the component is in this list, use the substitute. Document the substitution in a code comment and in the Phase 2d plan.

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

If a Figma layer is **not in this file**, do these steps:

1. Normalize it with [design-provenance.md](design-provenance.md) (Tier B variant properties, or Tier C structure). Then try the Canonical Role Index again. If you do not find a match, identify the visual pattern (is it a list, a form field, or a card?).
2. Call `list_components({ framework: "webcomponents", filter: "<keyword>" })`. Find the closest match in the result.
3. Before you write code, call `get_doc`. If you need the full API, also call `get_api_reference`.
4. If no Ignite UI component matches after a careful search, use plain semantic HTML. Document the reason in a code comment.

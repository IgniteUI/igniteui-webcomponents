---
name: igniteui-wc-build-grids
description: End-to-end guide for building a data grid feature with Ignite UI Web Components — package selection, single-design-system theme loading, Shadow DOM theme/icon injection for Lit host components, safe component registration, fluid grid layout, enabling sorting/filtering, and a clean-run verification checklist. Use when setting up a new grid in an app, when a grid renders unstyled or with broken dimensions inside a custom element/Shadow DOM, or when sorting/filtering/icons don't work as expected.
user-invocable: true
---

# Build a Data Grid with Ignite UI Web Components

## Purpose

This skill covers the practical steps to add a working, correctly themed grid to a Web Components (typically Lit-based) application — not just the grid's own API, but the surrounding setup that most commonly goes wrong: package choice, theme loading, Shadow DOM boundaries, component registration, layout, and verification.

## MANDATORY AGENT PROTOCOL

> **Do not write grid APIs from memory beyond what is verified in this file.** Column/toolbar/paginator property and event names change between releases.

1. **Resolve the package first** (Grid Lite vs. Premium grids) — see Step 1.
2. **Reuse the verified import paths in this file as-is** (`grids/combined.js`, `grids/themes/<variant>/<design>.css`). For anything not shown here (toolbar components, export, summaries, pivot/tree/hierarchical-specific APIs), look it up with `list_components` / `search_api` / `get_doc` / `get_api_reference` (`framework`/`platform: "webcomponents"`) instead of guessing a deep import path or property name.
3. Only then write code.

---

## Related Skills

- [igniteui-wc-choose-components](../igniteui-wc-choose-components/SKILL.md) — full grid-type decision guide (Grid Lite vs. Data Grid vs. Tree Grid vs. Hierarchical Grid vs. Pivot Grid)
- [igniteui-wc-migrate-grid-lite-to-premium](../igniteui-wc-migrate-grid-lite-to-premium/SKILL.md) — deep API reference for the Premium Grid (sorting/filtering events, column templates, editing, paging, groupBy, toolbar, export)
- [igniteui-wc-customize-component-theme](../igniteui-wc-customize-component-theme/SKILL.md) — design-system palette/typography/component-token customization beyond the baseline theme
- [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) — React/Angular/Vue/vanilla-JS wiring
- [igniteui-wc-optimize-bundle-size](../igniteui-wc-optimize-bundle-size/SKILL.md) — trimming imports after the grid works

---

## Step 1 — Choose the grid type and package

| Need | Component | Package |
|---|---|---|
| Read-only table, sorting/filtering, no editing/selection/paging | `<igc-grid-lite>` | `igniteui-grid-lite` (MIT) |
| Editing, selection, paging, grouping, summaries, export, toolbar | `<igc-grid>` | `igniteui-webcomponents-grids` (trial) / `@infragistics/igniteui-webcomponents-grids` (licensed) |
| Parent-child, single schema (e.g. `managerId` or nested `children`) | `<igc-tree-grid>` | `igniteui-webcomponents-grids` |
| Parent-child, different schema per level | `<igc-hierarchical-grid>` | `igniteui-webcomponents-grids` |
| Cross-tab / OLAP analysis | `<igc-pivot-grid>` | `igniteui-webcomponents-grids` |

If the grid type is ambiguous, follow the full decision guide in [igniteui-wc-choose-components](../igniteui-wc-choose-components/SKILL.md) before continuing. Never mix `igc-grid-lite` and `igc-grid` (or other premium grid types) for the same table — pick one.

---

## Step 2 — Pick exactly ONE design system + variant

Ignite UI ships four design systems (`material`, `bootstrap`, `fluent`, `indigo`), each with a `light` and `dark` variant. **Pick one design system and one variant for the whole app baseline** (e.g. `light` + `material`). Do not:

- Load two different design systems together (e.g. `material` + `fluent`) — their CSS custom properties collide and produce inconsistent, broken-looking components.
- Load both a `light` and a `dark` theme file at the same time — the one loaded last silently wins for shared tokens, causing inconsistent contrast.

If dark mode is required, toggle between the two matching files for the *same* design system (e.g. `light/material.css` ↔ `dark/material.css`), not a mix of design systems.

---

## Step 3 — Load BOTH the base theme and the grid theme, for the same design system + variant

The base `igniteui-webcomponents` theme styles the app's general components (buttons, inputs, checkboxes used inside cells, etc.). The grid's own internal structure (headers, cells, sort/filter icons, resize handles) is styled by a **separate** theme file shipped in the grid package. Both are required, and both must reference the same design system and variant:

```typescript
// Entry point — pick ONE design system + variant and use it for both imports
import 'igniteui-webcomponents/themes/light/material.css';
import 'igniteui-webcomponents-grids/grids/themes/light/material.css';
```

| Package | Path pattern |
|---|---|
| `igniteui-webcomponents` | `igniteui-webcomponents/themes/<light\|dark>/<material\|bootstrap\|fluent\|indigo>.css` |
| `igniteui-webcomponents-grids` | `igniteui-webcomponents-grids/grids/themes/<light\|dark>/<material\|bootstrap\|fluent\|indigo>.css` |

> These document-level imports style content in the **light DOM** only. If the grid (or the component that hosts it) renders inside a Shadow root, continue to Step 5 — a bare import here does not reach inside a shadow root.

---

## Step 4 — Register only the components actually used

Side-effect-import the grid module, which registers the custom elements for that grid family:

```typescript
// Registers igc-grid, igc-column, igc-paginator, etc. — import once, before first use
import 'igniteui-webcomponents-grids/grids/combined.js';
```

For the base package, register individual components instead of `defineAllComponents()`:

```typescript
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcInputComponent);
```

Do not call `defineAllComponents()` or import an entire package's combined bundle "just in case" — only pull in the grid type and components the feature actually renders. See [igniteui-wc-optimize-bundle-size](../igniteui-wc-optimize-bundle-size/SKILL.md) if bundle size becomes a concern later.

**Icons:** built-in grid glyphs (sort direction, filter, column actions, expand/collapse) come from the library's internal SVG icon collection and render automatically once `igc-icon` is registered as part of the grid module import above — no icon font and no manual `registerIcon`/`registerIconFromText` call is needed for these. Only call `registerIcon` / `registerIconFromText` for *custom* icons the app adds itself (e.g. inside a cell template).

---

## Step 5 — Inject the theme (and any custom icon styles) into the Shadow DOM

This is the single most common source of "grid looks broken" reports. A `<link>`/`import '...css'` at the document level **never** crosses into a Shadow root. If a Lit component's `render()` places `<igc-grid>` inside its own shadow tree, that shadow tree needs its own copy of the grid theme.

Import the theme as an inline string (`?inline`, supported by Vite and similar bundlers) and inject it as a `<style>` tag inside the component's `render()`:

```typescript
import { html, LitElement } from 'lit';
import gridTheme from 'igniteui-webcomponents-grids/grids/themes/light/material.css?inline';

class MyGridPanel extends LitElement {
  // Keep Shadow DOM styling encapsulated — do not disable shadow rendering as a workaround
  render() {
    return html`
      <style>${gridTheme}</style>
      <igc-grid .data=${this.data} allow-filtering="true" height="100%">
        <igc-column field="name" sortable="true" filterable="true"></igc-column>
      </igc-grid>
    `;
  }
}
```

Without this, the grid's internal elements (checkboxes, resize handles, sort/filter icons) receive no sizing rules and can render with broken dimensions (e.g. a checkbox expanding to over 1000px wide and collapsing the rest of the layout). **If this happens, the fix is to inject the missing theme — not to hand-write fallback CSS overrides that mask the symptom.**

If the component also defines custom CSS (via `static styles` or an imported stylesheet), that stays separate from the theme injection — append the `<style>${gridTheme}</style>` tag alongside it rather than merging the two.

---

## Step 6 — Keep the grid layout fluid

Let the grid fill the space given to it by its container instead of hardcoding pixel heights on nested wrappers. A typical shell:

```css
.app-shell {
  display: flex;
  flex-direction: column;
  block-size: 100vh; /* or 100%, depending on the host page */
}

.app-header {
  flex: 0 0 auto; /* fixed-height header row */
}

.app-content {
  flex: 1 1 auto;
  min-height: 0; /* required so this row can shrink instead of overflowing */
  display: flex;
  flex-direction: column;
}

igc-grid {
  flex: 1 1 auto;
  min-height: 0;
  block-size: 100%; /* grid fills whatever space app-content resolves to */
}
```

- `igc-grid`/`igc-tree-grid`/`igc-hierarchical-grid` still need a resolvable height for row virtualization to work — but that height should come from the fluid layout above (`100%` of a flex/grid ancestor with a real size), not a guessed fixed pixel value on the grid itself.
- Omit column `width` unless a column genuinely needs a fixed size — columns are fluid by default and fill remaining space. If some columns need a fixed width, leave at least one column without `width` so it absorbs the remainder.
- `min-height: 0` is the fix for the classic flex/grid child-overflow bug — add it on any flex/grid item that contains the grid and is not growing as expected.

---

## Step 7 — Enable sorting and filtering

Both are opt-in per grid and per column:

```html
<igc-grid allow-filtering="true" height="100%">
  <igc-column field="name" sortable="true" filterable="true"></igc-column>
  <igc-column field="price" data-type="number" sortable="true" filterable="true"></igc-column>
</igc-grid>
```

- `allow-filtering="true"` on the grid is required for the filtering UI (filter row/icons) to appear at all — a column's own `filterable="true"` has no visible effect without it.
- Boolean-looking grid/column attributes take **quoted string values** (`sortable="true"`, not the bare `sortable`).
- For remote/server-side sort or filter, or for programmatic sort/filter APIs, cell templates, or events, read [igniteui-wc-migrate-grid-lite-to-premium](../igniteui-wc-migrate-grid-lite-to-premium/SKILL.md) (the API surface is identical whether or not the app is migrating from Grid Lite).

---

## Step 8 — Verify with a clean run

Before calling the feature done, confirm all of the following in the browser:

- [ ] No console errors or warnings (missing custom element definitions, CSS import errors, unhandled promise rejections).
- [ ] The grid is fully styled — headers, cell borders, row hover/selection colors, and resize handles all match the chosen design system (not unstyled browser-default table look).
- [ ] Sort and filter icons render as actual glyphs (arrows/funnel), not empty boxes, missing squares, or literal ligature text — if they don't, re-check Step 4 (icon component registered) and Step 5 (theme injected into the correct shadow root) before adding workarounds.
- [ ] The filtering UI (filter row or filter icon per column) is visible when `allow-filtering="true"` is set.
- [ ] Sorting a column and filtering a column both work interactively.
- [ ] Resizing the browser window keeps the grid filling its container — no leftover empty space next to the last column, no clipped rows.
- [ ] No leftover commented-out theme `<link>`/`<style>` blocks from an earlier design-system attempt.

---

## Do / Don't Quick Reference

| Do | Don't |
|---|---|
| Use `igniteui-webcomponents-grids` for editing/paging/grouping/summaries/export; `igniteui-grid-lite` for read-only tables | Don't reach for a non-grid component as a substitute when a grid outgrows Grid Lite — migrate to `igc-grid` |
| Pick exactly one design system + variant for the whole app | Don't mix two design systems (e.g. material + fluent) or mix light and dark theme files together |
| Load both the base theme and the grid theme, same design system + variant | Don't assume a document-level `<link>`/CSS import styles content inside a Shadow root |
| Use the verified import paths (`grids/combined.js`, `grids/themes/<variant>/<design>.css`) and look up anything else via `list_components`/`search_api`/`get_doc`/`get_api_reference` | Don't guess deep import paths for toolbar/export/pivot/tree/hierarchical-specific modules |
| Register only the grid type and base components actually used | Don't call `defineAllComponents()` or import combined bundles "just in case" |
| Inject theme (and custom icon styles, if any) inside the Shadow root that renders the grid | Don't hardcode many custom overrides before the baseline theme is confirmed working |
| Let the grid fill its container via flex/grid + `min-height: 0` + `block-size: 100%` | Don't set fixed pixel heights on grid containers unless a fixed size is explicitly required |
| Set `allow-filtering="true"` on the grid plus `sortable`/`filterable` per column | Don't leave commented-out legacy theme blocks in the codebase |
| Fix a missing/incorrect Shadow DOM theme injection at the source | Don't paper over a missing-import symptom (e.g. an oversized checkbox) with random fallback CSS |

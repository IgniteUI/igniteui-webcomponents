---
license: MIT
name: igniteui-wc-grids
description: "Configure a data grid with Ignite UI Web Components: grid selection, single-design-system theming, Shadow DOM theme injection, component registration, fluid layout, and sorting/filtering. WHEN TO USE: adding a grid to a Web Components app; fixing an unstyled, mis-sized, or broken grid inside a custom element or Shadow DOM; or needing the correct package, theme, layout, or sorting/filter setup. WHEN NOT TO USE: general component selection (use choose-components), Grid Lite to premium migration (use migrate-grid-lite-to-premium), framework wiring (use integrate-with-framework), app-wide theming (use customize-component-theme), bundle optimization (use optimize-bundle-size), or non-tabular components such as charts, lists, or tree views."
user-invocable: true
---

# Using the Ignite UI for Web Components grids

## Required Workflow

1. **Pick the grid type/package** from the table below. If the choice is not clear, ask the user.
2. **Use only the verified import paths in this file** (`igniteui-webcomponents-grids`, `grids/combined.js`, `themes/<variant>/<design>.css`). For anything else (toolbar, export, pivot/tree/hierarchical APIs, properties/events), find it with `list_components({ framework: "webcomponents", ... })` / `get_doc({ framework: "webcomponents", name: "<doc-name>" })` / `search_api({ platform: "webcomponents", query: "<keyword>" })` / `get_api_reference({ platform: "webcomponents", component: "<ClassName>" })`. Do not guess.

## Choosing the Grid

| Need | Component | Package |
|---|---|---|
| Read-only table, sorting/filtering only | `<igc-grid-lite>` | `igniteui-grid-lite` (MIT) |
| Editing, selection, paging, grouping, summaries, export, toolbar | `<igc-grid>` | `igniteui-webcomponents-grids` (trial) / `@infragistics/igniteui-webcomponents-grids` (licensed; replace the package name in all imports below) |
| Parent-child, single schema (`managerId`/nested `children`) | `<igc-tree-grid>` | `igniteui-webcomponents-grids` (trial) / `@infragistics/igniteui-webcomponents-grids` (licensed) |
| Parent-child, different schema per level | `<igc-hierarchical-grid>` | `igniteui-webcomponents-grids` (trial) / `@infragistics/igniteui-webcomponents-grids` (licensed) |
| Cross-tab / OLAP analysis | `<igc-pivot-grid>` | `igniteui-webcomponents-grids` (trial) / `@infragistics/igniteui-webcomponents-grids` (licensed) |

Do not mix `igc-grid-lite` with a premium grid type for the same table. Pick one. To upgrade Grid Lite to `igc-grid`, use the migration skill above.

For Grid Lite, import the `igniteui-grid-lite` package and its elements directly. Load only the base Ignite UI theme. Do not import the premium grid package or the grid theme:

```typescript
import { IgcGridLite, IgcGridLiteColumn } from 'igniteui-grid-lite';
import 'igniteui-webcomponents/themes/light/material.css';
```

## Theming Setup

- **Pick exactly one design system** (`material` | `bootstrap` | `fluent` | `indigo`) **and one variant** (`light` | `dark`) for the whole app. Do not load two design systems together. Do not load a light and a dark file at the same time. Instead, toggle between the matching light/dark pair of the *same* design system.
- **For premium grids only** (`igc-grid`, `igc-tree-grid`, `igc-hierarchical-grid`, `igc-pivot-grid`), load the base theme and the grid theme with the same design system + variant. The grid package has its own theme file for its internal structure (headers, cells, sort/filter icons, resize handles):

  ```typescript
  import 'igniteui-webcomponents/themes/light/material.css';
  import 'igniteui-webcomponents-grids/grids/themes/light/material.css';
  ```

  Path pattern for both packages: `themes/<light|dark>/<material|bootstrap|fluent|indigo>.css` (grid package: `igniteui-webcomponents-grids/grids/themes/...`).

- These are document-level imports. They style only the light DOM. A bare import never goes into a shadow root. If the grid renders inside a Shadow root, see **Shadow DOM** below.

## Registering Components

For premium grids, register only the selected grid type:

```typescript
import { IgcGridComponent } from 'igniteui-webcomponents-grids';
IgcGridComponent.register();

// Base package — register only what you use, not defineAllComponents()
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';
defineComponents(IgcButtonComponent);
```

Use the corresponding `Igc*GridComponent.register()` method for tree, hierarchical, or pivot grids. Use `igniteui-webcomponents-grids/grids/combined.js` only when the application intentionally uses all premium grid types.

Built-in grid glyphs (sort direction, filter, expand/collapse) come from the internal SVG icon collection of the library. They render automatically after you register the grid module above. They do not need an icon font or a manual `registerIcon`/`registerIconFromText` call. Register icons only for custom glyphs that the app adds itself.

## Shadow DOM

The most common cause of a "broken grid" (for example, a checkbox that expands to 1000px+ wide) is a missing theme. A Lit component renders `<igc-grid>` in its own shadow tree, and the grid theme does not reach that tree. To fix this, import the theme as an inline string. Then inject it as a `<style>` tag in `render()`:

```typescript
import { html, LitElement } from 'lit';
import gridTheme from 'igniteui-webcomponents-grids/grids/themes/light/material.css?inline';

class MyGridPanel extends LitElement {
  private readonly data: Array<{ name: string }> = [
    { name: 'Ada Lovelace' },
  ];

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

The ?inline suffix is Vite-specific. In other bundlers, use their equivalent method for raw-string CSS imports. If the grid looks broken, fix the missing theme injection. Do not hide the symptom with fallback CSS overrides.

## Fluid Layout

Make the grid fill its container. Do not hardcode pixel heights:

```css
.app-shell { display: flex; flex-direction: column; block-size: 100vh; }
.app-header { flex: 0 0 auto; }                 /* fixed-height header */
.app-content { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }  /* min-height: 0 lets this row shrink instead of overflow */
igc-grid { flex: 1 1 auto; min-height: 0; block-size: 100%; }
```

- The grid still needs a resolvable height for row virtualization. Get this height from the fluid layout (`100%` of a sized ancestor). Do not set a guessed fixed pixel value on the grid itself.
- Columns are fluid by default. Do not set a column `width` unless the column needs a fixed size. Keep at least one column without `width` to fill the remaining space.

## Sorting & Filtering

```html
<igc-grid allow-filtering="true" height="100%">
  <igc-column field="name" sortable="true" filterable="true"></igc-column>
</igc-grid>
```

The filtering UI shows only when the grid has `allow-filtering="true"`. A column's `filterable="true"` alone has no visible effect. Boolean-looking attributes take quoted string values (`sortable="true"`, not bare `sortable`). For events, remote sort/filter, or programmatic APIs, see the migration skill above. The API is the same for apps that migrate from Grid Lite and for apps that do not.

## Verify with a Clean Run

- [ ] No console errors/warnings (missing element definitions, CSS import errors)
- [ ] Grid fully styled per the chosen design system — no unstyled/browser-default look
- [ ] Sort/filter icons render as glyphs, not empty boxes or ligature text
- [ ] Filtering UI is visible. Sorting and filtering both work interactively
- [ ] Grid continues to fill its container on resize — no trailing empty space, no clipped rows
- [ ] No leftover commented-out theme blocks from an earlier attempt

## Key Rules

1. Use one design system and one variant everywhere. Do not mix design systems or light/dark files.
2. Always load both the base theme and the grid theme for that same design system + variant.
3. Inject the grid theme into every Shadow root that renders `<igc-grid>`/`<igc-tree-grid>`/`<igc-hierarchical-grid>`/`<igc-pivot-grid>`.
4. Register only the selected grid type and the components that the app uses. Do not use `defineAllComponents()`. Do not add bundles for possible future use.
5. Do not guess deep import paths or APIs that this file does not verify. Search for them with the MCP tools.
6. Use a fluid layout by default: `min-height: 0` + `flex`/`grid` sizing. Use fixed pixel heights only when they are explicitly required.
7. To enable the sorting/filtering UI, set `allow-filtering="true"` on the grid and `sortable`/`filterable` per column.
8. Fix root causes (missing theme/registration). Do not hide symptoms with fallback CSS.

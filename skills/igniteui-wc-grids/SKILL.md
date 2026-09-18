---
name: igniteui-wc-grids
description: Set up a data grid feature with Ignite UI Web Components — grid selection, single-design-system theming (base + grid theme), Shadow DOM theme injection, component registration, fluid layout, and sorting/filtering. Use when adding a grid to an app, or when a grid renders unstyled, mis-sized, or broken inside a custom element/Shadow DOM.
user-invocable: true
---

# Build a Data Grid with Ignite UI Web Components

## Required Workflow

1. **Pick the grid type/package** using the table below; ask if ambiguous.
2. **Use only the verified import paths in this file** (`grids/combined.js`, `themes/<variant>/<design>.css`). For anything else (toolbar, export, pivot/tree/hierarchical APIs, properties/events), look it up with `list_components` / `search_api` / `get_doc` / `get_api_reference` (`platform: "webcomponents"`) instead of guessing.
3. **Read the linked skill** for the task at hand rather than duplicating it from memory — this file only owns setup/integration.

## Related Skills

| Task | Skill |
|---|---|
| Full grid-type decision guide | [igniteui-wc-choose-components](../igniteui-wc-choose-components/SKILL.md) |
| Column APIs, sorting/filtering events, editing, paging, groupBy, toolbar, export | [igniteui-wc-migrate-grid-lite-to-premium](../igniteui-wc-migrate-grid-lite-to-premium/SKILL.md) |
| Palette/typography/component-token customization | [igniteui-wc-customize-component-theme](../igniteui-wc-customize-component-theme/SKILL.md) |
| React/Angular/Vue/vanilla-JS wiring | [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) |
| Trimming imports after the grid works | [igniteui-wc-optimize-bundle-size](../igniteui-wc-optimize-bundle-size/SKILL.md) |

## Choosing the Grid

| Need | Component | Package |
|---|---|---|
| Read-only table, sorting/filtering only | `<igc-grid-lite>` | `igniteui-grid-lite` (MIT) |
| Editing, selection, paging, grouping, summaries, export, toolbar | `<igc-grid>` | `igniteui-webcomponents-grids` (trial) / `@infragistics/igniteui-webcomponents-grids` (licensed) |
| Parent-child, single schema (`managerId`/nested `children`) | `<igc-tree-grid>` | `igniteui-webcomponents-grids` |
| Parent-child, different schema per level | `<igc-hierarchical-grid>` | `igniteui-webcomponents-grids` |
| Cross-tab / OLAP analysis | `<igc-pivot-grid>` | `igniteui-webcomponents-grids` |

Never mix `igc-grid-lite` with a premium grid type for the same table — pick one. For upgrading Grid Lite to `igc-grid`, use the migration skill above.

## Theming Setup

- **Pick exactly one design system** (`material` | `bootstrap` | `fluent` | `indigo`) **and one variant** (`light` | `dark`) for the whole app. Never load two design systems together, and never load both a light and a dark file at once — toggle between the matching light/dark pair of the *same* design system instead.
- **Load both the base theme and the grid theme**, same design system + variant — the grid package ships its own theme file for its internal structure (headers, cells, sort/filter icons, resize handles):

  ```typescript
  import 'igniteui-webcomponents/themes/light/material.css';
  import 'igniteui-webcomponents-grids/grids/themes/light/material.css';
  ```

  Path pattern for both packages: `themes/<light|dark>/<material|bootstrap|fluent|indigo>.css` (grid package: `igniteui-webcomponents-grids/grids/themes/...`).

- These are document-level imports — they style the light DOM only. If the grid renders inside a Shadow root, see **Shadow DOM** below; a bare import never crosses into a shadow root.

## Registering Components

```typescript
// Side-effect import — registers igc-grid, igc-column, igc-paginator, etc.
import 'igniteui-webcomponents-grids/grids/combined.js';

// Base package — register only what you use, not defineAllComponents()
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';
defineComponents(IgcButtonComponent);
```

Built-in grid glyphs (sort direction, filter, expand/collapse) come from the library's internal SVG icon collection and render automatically once the grid module above is registered — no icon font and no manual `registerIcon`/`registerIconFromText` call is needed for them. Only register icons for custom glyphs the app adds itself.

## Shadow DOM

The most common cause of a "broken grid" (e.g. a checkbox expanding to 1000px+ wide) is a Lit component rendering `<igc-grid>` in its own shadow tree without the grid theme reaching that tree. Import the theme as an inline string and inject it as a `<style>` tag in `render()`:

```typescript
import { html, LitElement } from 'lit';
import gridTheme from 'igniteui-webcomponents-grids/grids/themes/light/material.css?inline';

class MyGridPanel extends LitElement {
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

If the grid looks broken, fix the missing theme injection — do not mask the symptom with fallback CSS overrides.

## Fluid Layout

Let the grid fill its container instead of hardcoding pixel heights:

```css
.app-shell { display: flex; flex-direction: column; block-size: 100vh; }
.app-header { flex: 0 0 auto; }                 /* fixed-height header */
.app-content { flex: 1 1 auto; min-height: 0; }  /* min-height: 0 lets this row shrink instead of overflow */
igc-grid { flex: 1 1 auto; min-height: 0; block-size: 100%; }
```

- The grid still needs a resolvable height for row virtualization — get it from the fluid layout (`100%` of a sized ancestor), not a guessed fixed pixel value on the grid itself.
- Omit column `width` unless a column needs a fixed size — columns are fluid by default; leave at least one column without `width` to absorb remaining space.

## Sorting & Filtering

```html
<igc-grid allow-filtering="true" height="100%">
  <igc-column field="name" sortable="true" filterable="true"></igc-column>
</igc-grid>
```

`allow-filtering="true"` on the grid is required for the filtering UI to appear — a column's `filterable="true"` alone has no visible effect. Boolean-looking attributes take quoted string values (`sortable="true"`, not bare `sortable`). For events, remote sort/filter, or programmatic APIs, see the migration skill above (same API whether or not the app is migrating from Grid Lite).

## Verify with a Clean Run

- [ ] No console errors/warnings (missing element definitions, CSS import errors)
- [ ] Grid fully styled per the chosen design system — no unstyled/browser-default look
- [ ] Sort/filter icons render as glyphs, not empty boxes or ligature text
- [ ] Filtering UI is visible; sorting and filtering both work interactively
- [ ] Grid keeps filling its container on resize — no trailing empty space, no clipped rows
- [ ] No leftover commented-out theme blocks from an earlier attempt

## Key Rules

1. One design system, one variant, everywhere — never mix design systems or light/dark files.
2. Always load both the base theme and the grid theme for that same design system + variant.
3. Inject the grid theme into every Shadow root that renders `<igc-grid>`/`<igc-tree-grid>`/`<igc-hierarchical-grid>`/`<igc-pivot-grid>`.
4. Register only the grid type and components actually used — no `defineAllComponents()`, no "just in case" bundles.
5. Never guess deep import paths or APIs beyond what's verified here — look them up.
6. Fluid layout by default: `min-height: 0` + `flex`/`grid` sizing; fixed pixel heights only when explicitly required.
7. `allow-filtering="true"` on the grid + `sortable`/`filterable` per column to enable sorting/filtering UI.
8. Fix root causes (missing theme/registration) instead of papering over symptoms with fallback CSS.

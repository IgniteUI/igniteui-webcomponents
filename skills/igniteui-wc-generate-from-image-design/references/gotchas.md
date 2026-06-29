# Ignite UI Web Components Gotchas & Pitfalls

## Table of Contents
- [Component Registration](#component-registration)
- [Chart Properties](#chart-properties)
- [Component Properties](#component-properties)
- [Theming Pitfalls](#theming-pitfalls)
- [Dark Theme Specifics](#dark-theme-specifics)

## Component Registration

### `defineComponents(...)` is required for direct Web Components usage
Register only the custom elements you actually use, and register them from the correct package:
```ts
import {
  defineComponents,
  IgcCardComponent,
  IgcNavbarComponent,
} from 'igniteui-webcomponents';

defineComponents(IgcNavbarComponent, IgcCardComponent);
```

If the current app uses React, Angular, Vue, or another integration layer around Web Components, follow [`igniteui-wc-integrate-with-framework`](../../igniteui-wc-integrate-with-framework/SKILL.md) instead of duplicating registration patterns blindly.

### Package family matters
Do not assume everything comes from `igniteui-webcomponents`. Advanced grids, charts, and dock manager live in separate packages and may have trial versus licensed package names. Resolve the package first, then register components from that package.

## Chart Properties

> **Always use the MCP lookup pattern before coding any chart.** Chart APIs are extensive and change between versions.
> - Find doc names → `list_components({ framework: "webcomponents", filter: "chart" })`
> - Usage examples and slots → `get_doc({ framework: "webcomponents", name: "<doc-name>" })`
> - Find exact class names → `search_api({ platform: "webcomponents", query: "<keyword>" })`
> - Full property/method/event API → `get_api_reference({ platform: "webcomponents", component: "<ClassName>" })`

### Markers shown by default
Category charts can show markers by default. If the screenshot does not show markers, set `markerTypes` to the matching no-marker option documented for the component. Confirm the exact value shape from `get_doc`.

### `plotAreaBackground` and `areaFillOpacity` are inherited — not visible in `get_api_reference`
Both properties exist but are defined on parent classes, so `get_api_reference({ platform: "webcomponents", component: "IgcCategoryChartComponent" })` will not list them. Use `search_api` to find them:
```ts
chart.plotAreaBackground = 'transparent';  // inherited from IgcSeriesViewerComponent
chart.areaFillOpacity = 0.3;               // inherited from IgcDomainChartComponent (not on IgcSparklineComponent)
```

### `includedProperties` must be a real array
Assign it as an array through JavaScript or TypeScript, not as a serialized string:
```ts
const chart = document.querySelector('igc-category-chart');
chart.includedProperties = ['fieldOne', 'fieldTwo', 'fieldThree'];
```
Replace `'fieldOne'`, `'fieldTwo'`, etc. with the actual data property names from your mock data.

### Chart callback properties must be assigned as functions
Function-valued chart APIs should be assigned on the element instance, not passed as string attributes:
```ts
const chart = document.querySelector('igc-category-chart');
chart.xAxisFormatLabel = labelFormatter;
```

### Smooth area charts
For smooth-looking area charts where the data should appear continuous rather than spiky:
- Increase data density until the line or area reads as continuous at the rendered size.
- Apply smoothing only when the source shape in the design looks smoothed rather than point-to-point.
- Hide markers unless the screenshot clearly shows visible data points.
- Tune fill opacity and label density to match the screenshot instead of relying on a fixed default.

### Charts inside CSS Grid can collapse
In a flexible CSS Grid track, set the grid cell and chart sizing values explicitly so the chart does not collapse:
```css
.chart-panel {
  min-height: <resolved-grid-cell-min-height>;
}

igc-category-chart {
  display: <resolved-chart-display>;
  height: <resolved-chart-height>;
}
```

## Component Properties

### List item title and subtitle are slots
Use the Web Components slot anatomy:
```html
<igc-list-item>
  <span slot="start"><resolved-leading-content></span>
  <span slot="title"><resolved-title></span>
  <span slot="subtitle"><resolved-subtitle></span>
  <span slot="end"><resolved-trailing-content></span>
</igc-list-item>
```

### Avatar background color via CSS
```html
<igc-avatar style="--ig-avatar-background: <resolved-avatar-background-token>;"></igc-avatar>
```

### Nav drawer width
Width is controlled by two CSS custom properties exposed on the host — they are **not** design tokens and won't appear in `get_component_design_tokens`. Override them directly:
```css
igc-nav-drawer {
  --menu-full-width: 280px;  /* default: 240px */
  --menu-mini-width: 56px;   /* no default — collapses to content width if unset */
}
```

### Omit column `width` — both grid types are fluid by default
Adding explicit pixel widths prevents columns from filling the container and leaves trailing empty space. Both `igc-grid-lite-column` and `igc-column` are fluid by default when `width` is not set.

When some columns need a fixed size, apply `width` only to those and leave **at least one column without `width`** so it fills the remaining space. The pattern is the same regardless of grid type — replace the tag name to match whichever grid is in use:

```html
<!-- replace igc-grid-lite-column with igc-column for the Premium Grid -->
<igc-grid-lite-column field="id"     header="#"      width="60px"></igc-grid-lite-column>
<igc-grid-lite-column field="status" header="Status" width="100px"></igc-grid-lite-column>
<igc-grid-lite-column field="name"   header="Name">{/* no width — fills remaining space */}</igc-grid-lite-column>
```

When a Grid Lite column has `width` set and `resizable` enabled, use `px` — not `%` or other relative units — to prevent layout shifts during resize.

## Theming Pitfalls

### Never hardcode colors after palette generation
Once a palette or theme exists, use `get_color` and palette-backed CSS custom properties such as `<resolved-palette-token-reference>` or semantic CSS variables derived from them. Do not leave raw hex values in component styles, theme overrides, or one-off CSS rules unless the value is intentionally outside the theme system.

### Compound components require child theming
`igc-select`, `igc-combo`, `igc-date-picker`, and `igc-date-range-picker` are compound components. Follow the related-theme chain returned by `get_component_design_tokens` instead of styling only the parent selector.

### Component theme functions
For core UI component theming, prefer `create_component_theme` and apply the returned theme block as generated by the MCP server.

### Grid theming is package-specific
`igniteui-grid-lite` and the premium grid packages do not map to Angular's `igx-grid__*` internal class structure. Use `get_component_design_tokens("grid")`, the exact grid package docs, and exposed tokens or parts for the package present in the workspace.

### `igniteui-webcomponents-grids` theme must be injected into the shadow root

A bare CSS import (`import '...material.css'`) lands in the document head and is blocked by a LitElement shadow root — it never reaches the grid's internal `igx-*` components (toolbar checkboxes, column-actions panels, dropdown overlays). Without it those elements render with broken dimensions; checkboxes can expand to 1,100 px wide and collapse the entire grid UI.

Import the theme as an inline string (requires bundler support for `?inline`, e.g. Vite) and render it as a `<style>` tag at the top of `render()`:

```typescript
import gridTheme from 'igniteui-webcomponents-grids/grids/themes/light/material.css?inline';

render() {
  return html`
    <style>${gridTheme}</style>
    <igc-grid ...></igc-grid>
  `;
}
```

Apply the same `?inline` + `<style>` approach for dark or other theme variants.

### Read luminance warnings from palette generation
If palette generation returns a luminance warning for a generated surface, do not ignore it. If the design needs multiple surface depths, use `create_custom_palette` or define semantic CSS variables such as `--surface-1` and `--surface-2` in the main stylesheet instead of relying on a single generated surface color.


## Dark Theme Specifics

### Use the resolved dark variant for dark themes
If the project uses pre-built CSS themes, import the dark variant that matches the chosen design system in the app entry point:
```ts
import 'igniteui-webcomponents/themes/dark/material.css';
```

### CSS custom properties for dark panels
When the design uses multiple dark surface depths (panels, sidebars, cards on a dark background), define reusable semantic tokens using palette references or values derived from the design intent:

```css
:root {
  --surface-primary: <resolved-surface-primary-token>;
  --surface-secondary: <resolved-surface-secondary-token>;
  --accent-strong: <resolved-accent-token>;
  --text-primary: <resolved-text-primary-token>;
  --text-secondary: <resolved-text-secondary-token>;
}
```

If palette generation returns a single surface color that does not cover all depth levels visible in the design, define additional surface tokens (`--surface-1`, `--surface-2`, etc.) for each distinct depth.

### Use `::part(...)` only when tokens are not enough
When a visual adjustment goes beyond component design tokens, target documented `::part(...)` selectors from the current component docs or source. Scope the selector to the smallest practical wrapper so the override stays local to the generated view.

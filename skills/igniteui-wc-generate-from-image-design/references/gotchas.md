# Ignite UI Web Components Gotchas & Pitfalls

## Table of Contents
- [Component Registration](#component-registration)
- [Chart Properties](#chart-properties)
- [Component Properties](#component-properties)
- [Theming Pitfalls](#theming-pitfalls)
- [Dark Theme Specifics](#dark-theme-specifics)

## Component Registration

### `defineComponents(...)` is required for direct Web Components usage
Register only the custom elements that you use. Register them from the correct package:
```ts
import {
  defineComponents,
  IgcCardComponent,
  IgcNavbarComponent,
} from 'igniteui-webcomponents';

defineComponents(IgcNavbarComponent, IgcCardComponent);
```

If the current app uses React, Angular, Vue, or another integration layer around Web Components, follow [`igniteui-wc-integrate-with-framework`](../../igniteui-wc-integrate-with-framework/SKILL.md). Do not copy these registration patterns without a check.

### Package family matters
Do not assume that all components come from `igniteui-webcomponents`. Advanced grids, charts, and dock manager are in separate packages. These packages can have different names for the trial and the licensed versions. First, resolve the package. Then register components from that package.

## Chart Properties

> **Always use the MCP lookup pattern before you write code for a chart.** Chart APIs are large and change between versions.
> - Find doc names → `list_components({ framework: "webcomponents", filter: "chart" })`
> - Usage examples and slots → `get_doc({ framework: "webcomponents", name: "<doc-name>" })`
> - Find exact class names → `search_api({ platform: "webcomponents", query: "<keyword>" })`
> - Full property/method/event API → `get_api_reference({ platform: "webcomponents", component: "<ClassName>" })`

### Markers shown by default
Category charts can show markers by default. If the screenshot does not show markers, set `markerTypes` to the matching no-marker option documented for the component. Confirm the exact value shape from `get_doc`.

### `plotAreaBackground` and `areaFillOpacity` are inherited — not visible in `get_api_reference`
Both properties exist, but parent classes define them. Thus, `get_api_reference({ platform: "webcomponents", component: "IgcCategoryChartComponent" })` does not list them. Use `search_api` to find them:
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
Assign function-valued chart APIs on the element instance. Do not pass them as string attributes:
```ts
const chart = document.querySelector('igc-category-chart');
chart.xAxisFormatLabel = labelFormatter;
```

### Smooth area charts
For a smooth area chart in which the data must look continuous, not spiky:
- Increase data density until the line or area looks continuous at the rendered size.
- Apply smoothing only when the source shape in the design looks smoothed, not point-to-point.
- Hide markers unless the screenshot clearly shows visible data points.
- Tune fill opacity and label density to match the screenshot. Do not use a fixed default.

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
The `navdrawer` design tokens `size` and `size--mini` set the width. They are exposed as `--ig-nav-drawer-size` (default 15rem) and `--ig-nav-drawer-size--mini` (the default depends on the design system). Set them with `create_component_theme("navdrawer", …)`, or set them directly:
```css
igc-nav-drawer {
  --ig-nav-drawer-size: 280px;
  --ig-nav-drawer-size--mini: 56px;
}
```

### Omit column `width` — both grid types are fluid by default
Explicit pixel widths prevent columns from filling the container and leave empty space at the end. When `width` is not set, both `igc-grid-lite-column` and `igc-column` are fluid by default.

When some columns need a fixed size, apply `width` only to those columns. Leave **at least one column without `width`** so that it fills the remaining space. The pattern is the same for both grid types. Change the tag name to match the grid that you use:

```html
<!-- replace igc-grid-lite-column with igc-column for the Premium Grid -->
<igc-grid-lite-column field="id"     header="#"      width="60px"></igc-grid-lite-column>
<igc-grid-lite-column field="status" header="Status" width="100px"></igc-grid-lite-column>
<igc-grid-lite-column field="name"   header="Name">{/* no width — fills remaining space */}</igc-grid-lite-column>
```

When a Grid Lite column has `width` set and `resizable` enabled, use `px`. Do not use `%` or other relative units, because they cause layout shifts during resize.

## Theming Pitfalls

### Never hardcode colors after palette generation
After a palette or theme exists, use `get_color` and palette-backed CSS custom properties, such as `<resolved-palette-token-reference>`. You can also use semantic CSS variables that derive from them. Do not leave raw hex values in component styles, theme overrides, or one-off CSS rules. The only exception is a value that is intentionally outside the theme system.

### Compound components require child theming
`igc-select`, `igc-combo`, `igc-date-picker`, and `igc-date-range-picker` are compound components. Follow the related-theme chain that `get_component_design_tokens` returns. Do not style only the parent selector.

### Component theme functions
To theme core UI components, prefer `create_component_theme`. Apply the returned theme block as the MCP server generates it.

### Grid theming is package-specific
`igniteui-grid-lite` and the premium grid packages do not map to Angular's `igx-grid__*` internal class structure. Use `get_component_design_tokens("grid")` and the docs of the exact grid package. Also use the exposed tokens or parts of the package in the workspace.

### `igniteui-webcomponents-grids` theme must be injected into the shadow root

A bare CSS import (`import '...material.css'`) goes into the document head. Selector rules outside a Shadow root do not apply inside it. When the grid renders inside a Shadow root, inject the theme there too. The theme targets the internal structure and elements of the grid. Without it, internal grid elements render with incorrect dimensions. Checkboxes can expand to 1,100 px wide and collapse the full grid UI.

Import the theme as an inline string. This requires bundler support for `?inline`, for example Vite. Inject the theme as a `<style>` tag inside the shadow root. The exact approach depends on the framework. For a LitElement component, render the tag at the top of `render()`:

```typescript
import { html } from 'lit';
import gridTheme from 'igniteui-webcomponents-grids/grids/themes/light/material.css?inline';

// LitElement example — adapt to your Shadow DOM approach (Stencil, FAST, vanilla attachShadow, etc.)
render() {
  return html`
    <style>${gridTheme}</style>
    <igc-grid ...></igc-grid>
  `;
}
```

Apply the same `?inline` + `<style>` approach for dark or other theme variants.

### Read luminance warnings from palette generation
If palette generation returns a luminance warning for a generated surface, do not ignore it. If the design needs multiple surface depths, use `create_custom_palette`, or define semantic CSS variables such as `--surface-1` and `--surface-2` in the main stylesheet. Do not use only one generated surface color.


## Dark Theme Specifics

### Use the resolved dark variant for dark themes
If the project uses pre-built CSS themes, import the dark variant that matches the chosen design system in the app entry point:
```ts
import 'igniteui-webcomponents/themes/dark/material.css';
```

### CSS custom properties for dark panels
When the design uses multiple dark surface depths (panels, sidebars, cards on a dark background), define reusable semantic tokens. Use palette references or values that come from the design intent:

```css
:root {
  --surface-primary: <resolved-surface-primary-token>;
  --surface-secondary: <resolved-surface-secondary-token>;
  --accent-strong: <resolved-accent-token>;
  --text-primary: <resolved-text-primary-token>;
  --text-secondary: <resolved-text-secondary-token>;
}
```

Palette generation can return one surface color that does not cover all depth levels in the design. In that case, define an additional surface token (`--surface-1`, `--surface-2`, and so on) for each distinct depth.

### Use `::part(...)` only when tokens are not enough
When component design tokens cannot make a visual adjustment, target the documented `::part(...)` selectors from the current component docs or source. Scope the selector to the smallest practical wrapper. This keeps the override local to the generated view.

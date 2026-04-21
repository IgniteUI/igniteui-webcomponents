# Ignite UI Web Components Gotchas & Pitfalls

## Table of Contents
- [Sass Conflicts](#sass-conflicts)
- [Component Registration](#component-registration)
- [Chart Properties](#chart-properties)
- [Component Properties](#component-properties)
- [Theming Pitfalls](#theming-pitfalls)
- [Missing Direct Mappings](#missing-direct-mappings)
- [Dark Theme Specifics](#dark-theme-specifics)

## Sass Conflicts

### `contrast()` function collision
The CSS `contrast()` filter function can collide with `igniteui-theming`'s `contrast()` Sass function. When you need the native CSS function, call it explicitly via `sass:meta`:
```scss
@use "sass:meta";

.uses-css-contrast {
  filter: meta.call(meta.get-function("contrast", $css: true), <contrast-value>);
}
```
Prefer this approach over string escaping when a native CSS function name collides with a Sass function.

### Font family in typography mixin
Comma-separated font families are parsed as multiple Sass arguments. Wrap in parentheses:
```scss
// BAD
@include typography($font-family: "Primary Font", "Fallback Font", sans-serif);

// GOOD
@include typography($font-family: ("Primary Font", "Fallback Font", sans-serif));
```
Replace `"Primary Font"` and `"Fallback Font"` with the font families extracted from the design image.

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

### Markers shown by default
Category charts can show markers by default. If the screenshot does not show markers, set `markerTypes` to the matching no-marker option documented for the component. Confirm the exact value shape from `get_doc`.

### `plotAreaBackground` does NOT exist on `igc-category-chart`
Use CSS to style the chart container background instead.

### `areaFillOpacity` exists on `IgcCategoryChartComponent`
It does NOT exist on `IgcSparklineComponent`.

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
```scss
.chart-panel {
  min-height: <resolved-grid-cell-min-height>;
}

igc-category-chart {
  display: <resolved-chart-display>;
  height: <resolved-chart-height>;
}
```

## Component Properties

### Avatar shape is controlled by `shape`
Use the supported `shape` API (`circle`, `rounded`, `square`, etc. as documented for the component).

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
The drawer sizing hooks in the current implementation are `--menu-full-width` and `--menu-mini-width`:
```css
igc-nav-drawer {
  --menu-full-width: <extracted-sidebar-width>;
  --menu-mini-width: <extracted-mini-drawer-width>;
}
```

## Theming Pitfalls

### Never hardcode colors after palette generation
Once a palette or theme exists, use `get_color` and palette-backed CSS custom properties such as `<resolved-palette-token-reference>` or semantic CSS variables derived from them. Do not leave raw hex values in component styles, theme overrides, or one-off CSS rules unless the value is intentionally outside the theme system.

### Compound components require child theming
`igc-select`, `igc-combo`, `igc-date-picker`, and `igc-date-range-picker` are compound components. Follow the related-theme chain returned by `get_component_design_tokens` instead of styling only the parent selector.

### Component theme functions
For core UI component theming, prefer `create_component_theme` and apply the returned theme block as generated by the MCP server.

### Grid theming is package-specific
`igniteui-grid-lite` and the advanced grid packages do not map to Angular's `igx-grid__*` internal class structure. Use `get_component_design_tokens("grid")`, the exact grid package docs, and exposed tokens or parts for the package present in the workspace.

### Read luminance warnings from theme generation
If `create_theme` returns a luminance warning for a generated surface, do not ignore it. If the design needs multiple surface depths, use `create_custom_palette` or define semantic CSS variables such as `--surface-1` and `--surface-2` in the main stylesheet instead of relying on a single generated surface color.


## Dark Theme Specifics

### Use the resolved dark variant for dark themes
If the project uses pre-built CSS themes, import the dark variant that matches the chosen design system. If Sass is configured, apply the dark schema explicitly:
```scss
@use 'igniteui-theming' as *;

$dark-palette: palette(
  $primary: <resolved-primary-color>,
  $secondary: <resolved-secondary-color>,
  $surface: <resolved-surface-color>
);

@include palette($dark-palette, $schema: <resolved-dark-schema>);
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

If `create_theme` returns a single surface color that does not cover all depth levels visible in the design, define additional surface tokens (`--surface-1`, `--surface-2`, etc.) for each distinct depth.

### Use `::part(...)` only when tokens are not enough
When a visual adjustment goes beyond component design tokens, target documented `::part(...)` selectors from the current component docs or source. Scope the selector to the smallest practical wrapper so the override stays local to the generated view.

---
license: MIT
name: igniteui-wc-customize-component-theme
description: "Theme and style Ignite UI Web Components (and igniteui-react) apps with CSS custom properties, optional Sass, and the igniteui-theming MCP server. WHEN TO USE: the user wants to apply or switch a pre-built theme (Material, Fluent, Bootstrap, Indigo, light/dark), create a custom palette or global theme, restyle a specific component with design tokens or ::part, scope a theme to a container, adjust sizing/spacing/roundness, or toggle light/dark mode. WHEN NOT TO USE: choosing which component to use (use choose-components), building a full view from a design image or Figma file (use generate-from-image-design or figma-to-app, which include theming), installing packages or framework setup (use integrate-with-framework), or styling non-Ignite UI elements or libraries."
user-invocable: true
---

# Ignite UI Web Components — Theming Skill

## Description

This skill shows AI agents how to theme Ignite UI Web Components (and React through `igniteui-react`) applications. It supports two approaches:

- **CSS custom properties** — works in any project without additional build tooling
- **Sass** — available when the project has Sass configured. It gives the full palette/typography/elevation API

The skill also covers component-level theming, layout controls (spacing, sizing, roundness), and how to use the **Ignite UI Theming MCP server** for AI-assisted code generation.

## Prerequisites

- A project with `igniteui-webcomponents` (or `igniteui-react`) installed
- The **Ignite UI Theming MCP server** (`igniteui-theming`) available as a tool provider
- **Optional**: Sass configured in the project (enables the Sass-based theming API)

> **AGENT INSTRUCTION — MCP Server Setup (REQUIRED)**
>
> Before you use any theming tools, you MUST make sure that the MCP server is available.
> To do this, call `detect_platform`. If the tool is not available or the call fails,
> you MUST configure the server automatically. Follow the setup steps below.
>
> After you write the file, tell the user that the MCP server is configured.
> Also tell the user that it can be necessary to reload the editor to activate the tools.
> Start the MCP server. Wait until the MCP server starts, then continue the theming work.
> Do NOT skip this step. Do NOT ask the user to do it manually.

## Setting Up the Theming MCP Server

See [references/mcp-setup.md](references/mcp-setup.md) for VS Code, Cursor, Claude Desktop, and WebStorm configuration instructions.

To make sure that the server is running, call `detect_platform`. It reads your `package.json` and returns the detected platform (for example, `webcomponents`).

## Theming Architecture

The theming system has four pillars:

| Pillar | Description |
|---|---|
| **Palette** | Color families: `primary`, `secondary`, `surface`, `gray`, `info`, `success`, `warn`, `error` — each with shades 50–900 |
| **Typography** | Font family and type scale (headings, body, captions, etc.) |
| **Elevations** | Box-shadow levels (0–24) |
| **Schema** | Per-component recipes that map palette tokens to component-level CSS custom properties |

Four built-in design systems are available. Each has light and dark variants:

| Design System | Variants |
|---|---|
| **Material** | `light/material.css`, `dark/material.css` |
| **Bootstrap** | `light/bootstrap.css`, `dark/bootstrap.css` |
| **Fluent** | `light/fluent.css`, `dark/fluent.css` |
| **Indigo** | `light/indigo.css`, `dark/indigo.css` |

For the full live reference (palette families, design system schemas, variant constraints, and preset palettes), call:

```
read_resource({ uri: "theming://platforms/webcomponents" })
```

Additional guidance resources:
- `read_resource({ uri: "theming://guidance/colors/roles" })` — which components use primary vs secondary vs surface, and where to use each shade (50/500/900)
- `read_resource({ uri: "theming://guidance/colors/rules" })` — surface and gray luminance rules for light/dark variants (why gray is inverted from surface, WCAG contrast thresholds)

## Pre-built Themes

To theme an app quickly, import a pre-built CSS file in your entry point:

```typescript
import 'igniteui-webcomponents/themes/light/bootstrap.css';
```

Available pre-built CSS files:

| Import path | Theme |
|---|---|
| `igniteui-webcomponents/themes/light/bootstrap.css` | Bootstrap Light |
| `igniteui-webcomponents/themes/dark/bootstrap.css` | Bootstrap Dark |
| `igniteui-webcomponents/themes/light/material.css` | Material Light |
| `igniteui-webcomponents/themes/dark/material.css` | Material Dark |
| `igniteui-webcomponents/themes/light/fluent.css` | Fluent Light |
| `igniteui-webcomponents/themes/dark/fluent.css` | Fluent Dark |
| `igniteui-webcomponents/themes/light/indigo.css` | Indigo Light |
| `igniteui-webcomponents/themes/dark/indigo.css` | Indigo Dark |

The components contain the styles of all four themes. If the app uses only one theme, an `igc-theme-<name>` bundler condition removes the other three from the bundle. See [igniteui-wc-optimize-bundle-size](../igniteui-wc-optimize-bundle-size/SKILL.md).

## Custom Theme via CSS Custom Properties

> Sass is not necessary. This approach works in any project after you import a pre-built theme.

After you import a pre-built theme, override the `*-500` base shade to change a color family. CSS relative color syntax calculates all other shades (50–900) from the 500 value automatically:

```css
:root {
  /* Override the 500 (base) shade — all other shades update automatically */
  --ig-primary-500: #1976D2;
  --ig-secondary-500: #FF9800;
}
```

To scope overrides to a specific container:

```css
.admin-panel {
  --ig-primary-500: #6200EA;
}
```

For dark mode, either import a dark theme CSS file directly or toggle overrides with a class or media query:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --ig-surface-500: #121212;
    --ig-primary-500: #90CAF9; /* lighter tint works better on dark backgrounds */
  }
}

/* Or manually with a class */
.dark-theme {
  --ig-surface-500: #222;
}
```

## Custom Theme via Sass

> This approach requires Sass configured in the project. First, check whether the project has a Sass setup (for example, a `styles.scss` entry file, `sass` in `devDependencies`, or a Vite/webpack Sass plugin).

The Sass API for `igniteui-webcomponents` uses `@use 'igniteui-theming'` with individual mixins. It does **not** use the Angular-specific `core()` / `theme()` combined mixins.

Call `create_theme` to generate production-ready Sass for palette + typography + elevations in one step:

```
create_theme({
  platform: "webcomponents",
  designSystem: "material",    // or "bootstrap", "fluent", "indigo"
  primaryColor: "#1976D2",
  secondaryColor: "#FF9800",
  surfaceColor: "#FAFAFA",
  variant: "light",
  fontFamily: "'Roboto', sans-serif",
  includeTypography: true,
  includeElevations: true
})
```

For a dark theme, pass a dark `surfaceColor` (for example, `"#121212"`) and `variant: "dark"`. `create_theme` selects the correct dark schema automatically.

To generate only a palette (when typography/elevations are already set), use `create_palette`. To scope a theme to a container, put the generated `@include palette(...)` block inside the target selector.

## Component-Level Theming

To override the appearance of individual components, use component theme functions and the `tokens` mixin.

> **AGENT INSTRUCTION — No Hardcoded Colors (CRITICAL)**
>
> After palette generation (`palette()` in Sass, or `create_palette` / `create_theme` through MCP),
> **every color reference MUST come from the generated palette tokens**. Do not hardcode hex/RGB/HSL values.
>
> In CSS, use `var(--ig-primary-500)`, `var(--ig-secondary-300)`, `var(--ig-surface-500)`, etc.
> Or, use the `get_color` MCP tool to get the correct token reference.
>
> **WRONG** (hardcoded hex — this breaks theme switching and ignores the palette):
> ```css
> igc-avatar {
>   --ig-avatar-background: #E91E63;  /* ✗ hardcoded */
>   --ig-avatar-color: #FFFFFF;       /* ✗ hardcoded */
> }
> ```
>
> **RIGHT — CSS** (palette token — this stays synchronized with the theme):
> ```css
> igc-avatar {
>   --ig-avatar-background: var(--ig-primary-500);
>   --ig-avatar-color: var(--ig-primary-500-contrast);
> }
> ```
>
> **RIGHT — Sass** (when Sass is configured):
> ```scss
> $custom-avatar: avatar-theme(
>   $schema: $light-material-schema,
>   $background: var(--ig-primary-500),
>   $color: var(--ig-primary-500-contrast)
> );
> ```
>
> This rule applies to **all** style code: component themes, custom CSS rules, and inline styles.
> Use raw hex values only in the **initial `palette()` call** that seeds the color system.
> All other style code must reference the palette.

```css
igc-avatar {
  --ig-avatar-background: var(--ig-primary-500);
  --ig-avatar-color: var(--ig-primary-500-contrast);
}
```

When Sass is configured, use `create_component_theme` to generate the correct `avatar-theme(...)` + `@include tokens(...)` block:

```
create_component_theme({
  platform: "webcomponents",
  component: "avatar",
  tokens: { "background": "var(--ig-primary-500)", "color": "var(--ig-primary-500-contrast)" }
})
```

Pass `output: "css"` if you want CSS custom properties instead of Sass.

### Discovering Available Tokens

Each component has its own set of design tokens (themeable CSS custom properties). Before you theme a component, you must know which tokens exist. To find them, use the **MCP tool** `get_component_design_tokens`.

### Compound Components

Some components (for example, `combo`, `grid`, `date-picker`, `select`) are **compound**. They contain internal child components, and each child component requires its own theme. For example, `date-picker` uses `calendar`, `flat-button`, and `input-group` internally.

Workflow for compound components:
1. Call `get_component_design_tokens` for the parent (for example, `date-picker`)
2. Find the related themes and scope selectors in the response
3. For each child, call `create_component_theme` with the parent's selector as the wrapper

## Layout Controls

Use the MCP layout tools to generate the correct CSS or Sass output:

```
set_size({ size: "medium" })                              // global, CSS
set_size({ size: "small", component: "grid" })            // component-scoped, CSS
set_size({ size: "medium", output: "sass" })              // Sass output

set_spacing({ spacing: 0.75 })                            // compact, global
set_spacing({ spacing: 0.75, component: "grid" })         // component-scoped

set_roundness({ radiusFactor: 0.5 })                      // global
set_roundness({ radiusFactor: 0.0 })                      // square
```

By default, all three tools give CSS output. Add `output: "sass"` when the project has Sass configured.

The underlying CSS custom properties are `--ig-size`, `--ig-spacing`, and `--ig-radius-factor`. You can also set them directly on `:root` or on a scoped selector. Do this when a one-off override is simpler than a tool call.

## Using the Theming MCP Server

The Ignite UI Theming MCP server has tools for AI-assisted theme code generation.

> **IMPORTANT — File Safety Rule**: When you generate or update theme code, **never overwrite existing style files directly**. Always **propose the changes as an update**. Let the user review and approve the changes before you write to disk. If a `styles.scss` (or any target file) already exists, show the generated code as a diff or suggestion. Do not replace the file contents. This prevents accidental loss of custom styles that the user already wrote.

Quick tool sequence. For full parameter details, see the earlier sections:

| Step | Tool | Purpose |
|---|---|---|
| 1 | `detect_platform` | Always first — detects the platform from `package.json` automatically |
| 2 | `create_theme` | Full Sass theme: palette + typography + elevations in one call |
| 3 | `get_component_design_tokens` | Find valid token names before you call `create_component_theme` |
| 4 | `create_component_theme` | Scoped component override — all token values must use `var(--ig-*)` |
| 5 | `create_palette` | Palette only, when a full Sass theme is not necessary |
| 6 | `set_size` / `set_spacing` / `set_roundness` | Layout controls — add `output: "sass"` for Sass output |
| 7 | `get_color` | Resolve color intent to `var(--ig-<family>-<shade>)` token reference |

### Loading Reference Data

Use `read_resource` with these URIs for preset values and documentation:

| URI | Content |
|---|---|
| `theming://presets/palettes` | Preset palette colors |
| `theming://presets/typography` | Typography presets |
| `theming://presets/elevations` | Elevation shadow presets |
| `theming://guidance/colors/usage` | Which shades for which purpose |
| `theming://guidance/colors/roles` | Semantic color roles |
| `theming://guidance/colors/rules` | Light/dark theme rules |
| `theming://platforms/webcomponents` | Web Components platform specifics |
| `theming://platforms` | All supported platforms |

## Referencing Colors in Custom Styles

After you apply a theme, the palette is available as CSS custom properties on `:root`. Use these tokens in all custom CSS. Do not add standalone hex/RGB variables for colors that the palette already has.

### Correct: Palette Tokens

```css
/* All colors come from the theme — respects palette changes and dark/light switching */
.sidebar {
  background: var(--ig-surface-500);
  color: var(--ig-gray-900);
  border-right: 1px solid var(--ig-gray-200);
}

.accent-badge {
  background: var(--ig-secondary-500);
  color: var(--ig-secondary-500-contrast);
}

.hero-section {
  /* Semi-transparent primary overlay */
  background: hsl(from var(--ig-primary-500) h s l / 0.12);
}
```

### Incorrect: Hardcoded Values

```css
/* WRONG — these break when the palette changes and ignore dark/light mode */
.sidebar {
  background: #F0F5FA;  /* ✗ not a palette token */
  color: #333;          /* ✗ not a palette token */
}
```

### When Raw Hex Values Are OK

Raw hex values are acceptable **only** in these contexts:

1. **`palette()` call** — the initial seed colors that generate the full palette
2. **`create_palette` / `create_theme` MCP tool inputs** — the base colors that you pass to the tool
3. **Non-palette decorative values** — for example, a one-off SVG illustration color that intentionally does not change with the theme

All other colors must use `var(--ig-<family>-<shade>)` tokens.

## Common Patterns

### Switching Between Light and Dark Themes — CSS approach

Import the applicable theme CSS. Then toggle with a class or a media query:

```typescript
// In your entry point — choose one variant as the default
import 'igniteui-webcomponents/themes/light/bootstrap.css';
```

```css
/* Override surface base color for dark mode */
.dark-theme {
  --ig-surface-500: #121212;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ig-surface-500: #121212;
    --ig-primary-500: #90CAF9; /* lighter tint works better on dark backgrounds */
  }
}
```

Or, change the stylesheet dynamically at runtime:

```typescript
function setTheme(variant: 'light' | 'dark', design = 'bootstrap') {
  const link = document.getElementById('igc-theme') as HTMLLinkElement;
  link.href = `node_modules/igniteui-webcomponents/themes/${variant}/${design}.css`;
}
```

### Switching Between Light and Dark Themes — Sass approach

When Sass is configured, generate both theme blocks with `create_theme`. Call it once with `variant: "light"` and once with `variant: "dark"`. For the dark variant, put the generated `@include palette(...)` call inside `.dark-theme { }`. The tool selects the correct schema automatically for each variant.

### Scoping a Theme to a Container — CSS approach

```css
.admin-panel {
  --ig-primary-500: #6200EA;
}
```

### Scoping a Theme to a Container — Sass approach

Generate the palette block with `create_palette` and put it in the target container selector manually. For component-scoped overrides, you can also pass a custom `selector` to `create_component_theme`.

## Key Rules

1. **Never overwrite existing files directly**. Always propose theme code as an update for user review. Do not replace existing style files without confirmation
2. **Always call `detect_platform` first** when you use MCP tools
3. **Always call `get_component_design_tokens` before `create_component_theme`** to discover valid token names
4. **Palette shades 50 = lightest, 900 = darkest** for all chromatic colors. Do not invert them for dark themes (only gray inverts)
5. **Surface color must match the variant** — light color for `light`, dark color for `dark`
6. **Sass only**: Use `create_theme` (or `create_palette` / `create_typography` / `create_elevations` individually) to generate correct Sass. The theming module for Web Components is `igniteui-theming`, not `igniteui-angular/theming`. The Angular-specific `core()` / `theme()` combined mixins do **not** apply here
7. **Sass only**: Component themes use `create_component_theme` to generate `@include tokens($theme)` inside the correct selector
8. **For compound components**, follow the full checklist that `get_component_design_tokens` returns. Theme each child component with its scoped selector
9. **Never hardcode colors after palette generation**. After you create a palette, every color in component themes, custom CSS, and Sass variables must use `var(--ig-<family>-<shade>)` palette tokens (for example, `var(--ig-primary-500)`, `var(--ig-gray-200)`). Raw hex/RGB/HSL values are acceptable only in the initial `palette()` seed call. This keeps themes consistent, switchable (light/dark), and maintainable

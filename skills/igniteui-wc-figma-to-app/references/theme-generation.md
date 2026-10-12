# Theme Generation

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 3 to generate the global theme and per-component tokens. Read it in full, together with [`design-token-bridge.md`](design-token-bridge.md), before you call a theming tool.

> **Tool names:** like SKILL.md, this file writes theming tools as `theming_<tool>`. Find each tool by its base name (`create_palette`, `create_theme`, `create_component_theme`, …) on the connected `igniteui-theming` server. Your client can show them as `mcp__igniteui-theming__create_palette` or a similar name. The `licensed` parameter is for Angular only. Do not pass it for Web Components.

**Goal:** produce theming code that matches the visual language of the Figma design. Use the kit variables from Phase 1e (Path A), or the color census and measurements from Phase 1d (Path B).

> **Output format decision — make it once, here.** Pass `output: "css"` (the default) when the project has no Sass. Pass `output: "sass"` only when Phase 0b found a Sass setup. Every theming tool that generates code (`create_*`, `set_size`, `set_spacing`, `set_roundness`) accepts `output`. Do not write Sass into a project that cannot compile it. Do not use the Angular-only `core()` / `theme()` mixins. The Web Components Sass API uses `igniteui-theming` with individual `palette()`, `typography()`, `elevations()`, and `spacing()` mixins.

## 3a: Inspect the Existing Theme (Guard)

Check **all three** places that a theme can come from: `index.html`, the app entry point (`src/index.ts` / `main.ts`), and the global stylesheet (`styles.css` or the project's equivalent). Look for:

- a pre-built theme import or `<link>`, such as `igniteui-webcomponents/themes/dark/material.css`
- `--ig-theme` / `--ig-theme-variant` declarations on `:root`
- a `configureTheme(...)` call
- existing palette overrides (`--ig-primary-500`, …) or app-level semantic variables

Then classify what you found:

| Found | Meaning | Action |
| --- | --- | --- |
| Nothing | No theme | Continue with 3b–3c |
| Only the CLI scaffold's theme: a `<link rel="stylesheet" href="./node_modules/igniteui-webcomponents/themes/light/<bootstrap\|material>.css">` in `index.html` (the template decides which), with no `--ig-*` palette overrides and no `configureTheme` call | The scaffold's starter theme, not a choice made for this app | Treat it as no theme. In 3c, **replace** that `<link>` with the resolved design system and variant. Never load two pre-built themes |
| Any other theme | A theme the app's authors chose | Keep it for now. Finish the comparison below after 3b |

**Existing app theme — compare after 3b.** Reuse it, and skip to 3d, only when **all three** match the design:

1. the light/dark **variant** (the import path, or `--ig-theme-variant`);
2. the **design system** (the import path, or `--ig-theme`);
3. the **primary color**: the seed color on the high-emphasis controls, as seen in the design (Path A: the kit variables; Path B: the color census).

If one of them is different, **ask the user** before you change the global theme. The global theme affects every existing view in the app.

If the user does not agree, do not change the global theme. Instead, scope the design's palette overrides, type-style variables, and component tokens to the new view's host selector, not to `:root`. You cannot scope the design system and variant, because components read `--ig-theme` and `--ig-theme-variant` from the document root. Pass the app's `designSystem` / `variant` to `create_component_theme`. Tell the user which anatomy differences will remain.

Find the variant of the Figma design from Phase 1e. If a `color/mode` variable exists, use its value. Otherwise, use the artboard background color: near-black (`#121212`, `#1a1a1a`, `#000`) → `"dark"`; near-white (`#fff`, `#f5f5f5`) → `"light"`.

## 3b: Resolve the Design System

**Choose the path from the dominant Phase 1f tier** (see `design-token-bridge.md § Two Paths`):

- **Path B (mostly Tier B/C):** the design system is the **closest baseline**, not a match. Use `design-token-bridge.md § B1` to choose it, in this order: the user's request, then the kit's direct counterpart (Material 3 → `material`, Fluent 2 → `fluent`, Bootstrap → `bootstrap`), then text-field label placement, then control heights. If the fields of a design have labels *above* them, do not use `material`. Then apply B2–B4 in 3c and B5–B8 in 3d.
- **Path A (mostly Tier A):** use this **strict precedence order**. Stop at the first signal that gives a clear answer:

1. **Explicit user request** — "make it Material", "use Fluent", etc.
2. **Library source name in design context** — the `figma_get_design_context` or `figma_get_metadata` response can contain the source library file name (for example, `"Indigo.Design UI Kit for Material"` → `material`).
3. **Variable collection names from Phase 1e** — collection names like `Material/color/primary` identify the kit variant directly.
4. **Elevation variable structure** — inspect the `Elevations/*` variables:
   - **Three-layer DROP_SHADOW** (umbra + penumbra + ambient) → **Material**
   - **Single-layer DROP_SHADOW** → Indigo, Fluent, or Bootstrap
5. **Palette shade naming** — `primary/500`, `primary/100`–`primary/900` follows the Material 100–900 convention → likely **Material**.
6. **Visual heuristics** (only when all signals above give no clear answer): layered shadows + ripple effects → `"material"`; flat surfaces + sharp corners + Segoe/Inter font → `"fluent"`; component borders + Bootstrap grid → `"bootstrap"`; rounded purple/indigo accents without Material shadows → `"indigo"`.

> **Never use font name as a primary signal.** "Titillium Web" is the default body font in the Indigo.Design UI Kit for Material. It is not unique to one kit variant.

Supported values: `material`, `bootstrap`, `fluent`, `indigo`.

> **Web Components read the active design system from CSS variables for the initial theme.** Components read `--ig-theme` and `--ig-theme-variant`. When these variables are absent, components use `bootstrap` / `light`. A generated palette alone does **not** switch the design system. To switch it, use the pre-built theme CSS or the generated `:root` block. `configureTheme(ds, variant)` switches the registered components at runtime, but it does not change those root variables.

## 3c: Generate the Global Theme

Use [design-token-bridge.md](design-token-bridge.md) to extract these values:

```
Path A (Indigo.Design kits) — from Phase 1e variables:
primaryColor    ← from "color/primary/500" or "primary/500"
secondaryColor  ← from "color/secondary/500" or "secondary/500"
surfaceColor    ← from "color/surface" or "surface/default"
fontFamily      ← from "typography/font-family" or "typography/body/font-family"

Path B (any other kit, or none) — from the Phase 1d color census (`design-token-bridge.md § B2`):
primaryColor    ← color painted on high-emphasis buttons / active indicators
secondaryColor  ← a second accent actually used, else = primary
                  (material baseline: controls use secondary — seed it with the button color)
surfaceColor    ← page background
fontFamily      ← family of the text styles in use
type overrides  ← kit type ramp by role (`design-token-bridge.md § B3`), incl. button text transform (§ B4)
```

Read the theming guidance resources before you generate code. This makes sure that you extract only values that the theme system accepts:

```
theming_read_resource({ uri: "theming://guidance/colors/rules" })   // luminance + variant rules
theming_read_resource({ uri: "theming://platforms/webcomponents" }) // platform specifics
```

> **Parameter names differ between tools.** `theming_create_palette` uses `primary`, `secondary`, `surface`, `gray`, `success`, `warn`, `error`, `info`, and `variant`. `theming_create_theme` uses `primaryColor`, `secondaryColor`, `surfaceColor`, and has no `gray` or status colors. Do not confuse them.

**CSS path (default — no Sass in the project):**

1. Load the pre-built theme CSS for the resolved design system and variant. Load it in the app entry point, or replace the scaffold's `<link>` in `index.html` (see 3a). This one line sets `--ig-theme`, `--ig-theme-variant`, the full palette, typography, and elevations:

   ```typescript
   import 'igniteui-webcomponents/themes/dark/material.css';
   ```

2. Generate the palette overrides from the seed colors (add `gray` and the status colors when the design needs them):

   ```
   theming_create_palette({
     primary: primaryColor,
     secondary: secondaryColor,
     surface: surfaceColor,
     variant: "<light|dark>",
     platform: "webcomponents",
     output: "css"
   })
   ```

   Apply the generated custom properties to `:root` in the global stylesheet. The overrides must load **after** the theme. Load both through the same mechanism, in this order. Import the theme CSS and then `styles.css` from the entry module. Alternatively, put both as `<link>` tags in `index.html`, with the theme first. (Vite injects CSS imported from JS after any `<link>` in `index.html`, so if you mix the two mechanisms, the theme can take precedence.)

3. Apply the font family with plain CSS (`--ig-font-family` or `font-family`) or with the CSS output of `theming_create_typography({ fontFamily, designSystem, platform: "webcomponents", output: "css" })`. Do not pass `customScale`: the tool accepts it, but its generators ignore it. Do not write Sass typography mixins into a CSS-only app.

4. Read each **luminance warning** that the palette tools return, and make the necessary changes. The design can have several distinct surface depths that one generated surface color cannot express. In that case, use `theming_create_custom_palette`, or define semantic variables (`--surface-1`, `--surface-2`) for the extra depths.

**Sass path (only when Sass is configured):**

```
theming_create_theme({
  platform: "webcomponents",
  designSystem: "<resolved design system>",
  primaryColor, secondaryColor, surfaceColor,
  variant: "<light|dark>",
  fontFamily,
  includeTypography: true,
  includeElevations: true,
  includeSpacing: true,
  output: "sass"
})
```

`theming_create_theme` generates the `@use 'igniteui-theming'` imports, the `palette()` / `elevations()` / `typography()` / `spacing()` mixin calls, and the `:root` block with `--ig-theme` and `--ig-theme-variant`. Apply its output as the response instructs. For `gray`, status colors, or a full custom ramp, add the output of `theming_create_palette` or `theming_create_custom_palette` **after** it. Its `:root` palette variables override the generated ones. Remove the scaffold's theme `<link>` from `index.html` (3a), so that only one theme loads.

> `theming_create_elevations` takes **`designSystem`** (`"material"` or `"indigo"`). It has no `preset` parameter.

**Path B type overrides (both paths).** After the theme, add a `:root` block that sets the `--ig-<style>-<property>` variables. Set them for the type styles that differ from the baseline, including the button's text transform. See `design-token-bridge.md § B4`.

**Runtime switching.** When the design needs light and dark at runtime, replace the pre-built stylesheet (or the palette block). **Also** call the library API with the same design system and variant. Components cache the design system that they read from `--ig-theme` on first use. Thus, one step alone does not switch both the palette and the component styles:

```typescript
import { configureTheme } from 'igniteui-webcomponents';
// after loading the dark material stylesheet:
configureTheme('material', 'dark');
```

**Grid and chart packages carry their own themes.** The premium grids need `igniteui-webcomponents-grids/grids/themes/<variant>/<design-system>.css` in addition to the core theme. In a Lit component, import that CSS with `?inline` and inject it into the shadow root:

```typescript
import gridTheme from 'igniteui-webcomponents-grids/grids/themes/dark/material.css?inline';
// in render(): html`<style>${gridTheme}</style> <igc-grid ...></igc-grid>`
```

## 3d: Per-Component Token Mapping

> **Scope:** this section applies to every Ignite UI family that has design tokens: card, inputs, select, combo, navbar, nav drawer, list, tabs, date pickers, chips, grids, and others. Charts, gauges, and maps have **no design tokens**. Configure them through component properties (see 3e).

For **every** Ignite UI component in your plan, run this loop:

1. `theming_get_component_design_tokens({ component: "<theme-key>" })`: examine all token names, types, and descriptions. Also examine the **related themes** that the result lists for compound components. Theme keys are not always the tag name: inputs are `input-group`, and the nav drawer is `navdrawer`. Progress bars are `progress-linear` / `progress-circular`, and a single-select combo is `simple-combo`. Buttons need the variant name (`contained-button`, `flat-icon-button`, …). See `design-token-bridge.md § Per-Component Token Resolution` for the full map.
2. Find the values for this component's surfaces (background, text, border, hover state). **Path A:** get them from the Phase 1e kit variables. **Path B:** get them from the Phase 1d color census and measurements. When variables exist, they only confirm these values.
3. `theming_create_component_theme({ component: "<theme-key>", platform: "webcomponents", designSystem: "<3b result>", variant: "<light|dark>", tokens: { <only differing tokens> }, output: "css" | "sass" })`. Always pass `designSystem` and `variant`. Without them, the tool uses Material light and computes the theme against the wrong schema.
4. Apply the generated block exactly as the tool returns it, to the component selector or to the `selector` that you passed. Color token values must refer to palette variables (`var(--ig-primary-500)`), never to raw hex values.
5. A compound component is a component whose `get_component_design_tokens` result lists related themes. Examples are `combo`, `select`, the date pickers, `card`, `navbar`, `dialog`, `banner`, and the grids. For compound components, follow the related-theme chain from step 1, and theme each child with its scoped selector. If you style only the parent, the dropdown or calendar does not match the theme. Exception: the grid theme **derives** its children (`action-strip`, `column-actions`, toolbar, paginator, …). Theme the grid, and do not call `create_component_theme` for those keys separately.

**Path B additions to this loop** (see `design-token-bridge.md § B5–B8`). Include these tokens in the same `theming_create_component_theme` call:

- the component's **radius** tokens, at the measured px value
- its **border** and **shadow/elevation** tokens, as the design shows them
- its hover/focus/disabled **state** tokens, from the kit's state variants

Choose `--ig-size` for each component family from the measured control heights (`design-token-bridge.md § B7`). Do this before you tune individual components.

A specific component can need a density or spacing that is different from the global default. For that component, use `theming_set_size` or `theming_set_spacing` with the `component` parameter. This scopes `--ig-size` or `--ig-spacing` to the component's selector, not globally. For compound components, use `scope` with a sub-component selector. Apply these globally (`:root`) only when the entire app has a clearly different density (Path B: when every component family moves the same way, see `design-token-bridge.md § B7`).

Keep `theming_set_roundness` at its default unless the user explicitly asks for a change. For Path B, use per-component tokens for radius, because one global factor cannot reproduce the radii of a kit. Never derive multiplier values from Figma pixel values. See `design-token-bridge.md § Spacing, Sizing, and Roundness`.

## 3e: Chart Series Colors

Charts have no design tokens. By default, they use their own brush palette, which does not match the Figma series colors. Before you implement a chart, make these calls:

```
theming_get_chart_series_colors({ chartType: "<e.g. category-chart>" })
theming_get_chart_series_colors({ customBrushes: ["#9DE772", "#6DB1FF"] })   // validate Figma colors
```

The first call lists the theme tokens on that chart type that accept a brush list. The second call validates the colors that you extracted in Phase 1d. It also identifies pairs of colors that are difficult to distinguish. Apply the result through the brush properties of the chart, and assign them on the element. Use `brushes` / `outlines` on most charts, `brush` on `igc-sparkline`, and `fillBrushes` on `igc-treemap`. On a doughnut chart, use `brushes` / `outlines` on each `igc-ring-series`.

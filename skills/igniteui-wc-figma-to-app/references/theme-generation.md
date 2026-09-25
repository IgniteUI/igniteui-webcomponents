# Theme Generation

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 3 to generate the global theme and per-component tokens. Read in
> full, together with [`design-token-bridge.md`](design-token-bridge.md), before calling any
> theming tool.

> **Tool names:** like SKILL.md, this file writes theming tools as `theming_<tool>`. Match by
> the tool's base name (`create_palette`, `create_theme`, `create_component_theme`, …) on
> the connected `igniteui-theming` server; your client may show them as
> `mcp__igniteui-theming__create_palette` or similar. The `licensed` parameter is for
> Angular only — do not pass it for Web Components.

**Goal:** produce theming code that matches the Figma design's visual language, using the
kit variables from Phase 1e (Path A) or the color census and measurements from Phase 1d
(Path B).

> **Output format decision — make it once, here.** Pass `output: "css"` (the default) when
> the project has no Sass; pass `output: "sass"` only when Phase 0b found a Sass setup.
> Every theming tool that generates code (`create_*`, `set_size`, `set_spacing`,
> `set_roundness`) accepts `output`. Do not emit Sass into a project that cannot
> compile it, and do not use the Angular-only `core()` / `theme()` mixins — the Web
> Components Sass API uses `igniteui-theming` with individual `palette()`, `typography()`,
> `elevations()`, and `spacing()` mixins.

## 3a: Inspect the Existing Theme (Guard)

Check **all three** places a theme can come from: `index.html`, the app entry point
(`src/index.ts` / `main.ts`), and the global stylesheet (`styles.css` or the project's
equivalent). Look for:

- a pre-built theme import or `<link>`, such as `igniteui-webcomponents/themes/dark/material.css`
- `--ig-theme` / `--ig-theme-variant` declarations on `:root`
- a `configureTheme(...)` call
- existing palette overrides (`--ig-primary-500`, …) or app-level semantic variables

Then classify what you found:

| Found | Meaning | Action |
| --- | --- | --- |
| Nothing | No theme | Continue with 3b–3c |
| Only the CLI scaffold's theme: a `<link rel="stylesheet" href="./node_modules/igniteui-webcomponents/themes/light/<bootstrap\|material>.css">` in `index.html` (the template decides which), with no `--ig-*` palette overrides and no `configureTheme` call | The scaffold's starter theme, not a choice made for this app | Treat it as no theme. In 3c, **replace** that `<link>` with the resolved design system and variant; never load two pre-built themes |
| Any other theme | A theme the app's authors chose | Keep it for now. Finish the comparison below after 3b |

**Existing app theme — compare after 3b.** Reuse it, and skip to 3d, only when **all three**
match the design:

1. the light/dark **variant** (the import path, or `--ig-theme-variant`);
2. the **design system** (the import path, or `--ig-theme`);
3. the **primary color**: the seed color on the high-emphasis controls, as seen in the
   design (Path A: the kit variables; Path B: the color census).

If any of them differs, **ask the user** before changing the global theme. It affects every
existing view in the app. If the user declines, scope the design's palette overrides,
type-style variables, and component tokens to the new view's host selector instead of
`:root`. The design system and variant cannot be scoped: components read `--ig-theme` and
`--ig-theme-variant` from the document root. Pass the app's `designSystem` / `variant` to
`create_component_theme`, and tell the user which anatomy differences will remain.

Detect the Figma design's variant from Phase 1e: if a `color/mode` variable exists, use its
value. Otherwise use the artboard background color: near-black (`#121212`, `#1a1a1a`,
`#000`) → `"dark"`; near-white (`#fff`, `#f5f5f5`) → `"light"`.

## 3b: Resolve the Design System

**Choose the path from the dominant Phase 1f tier** (see
`design-token-bridge.md § Two Paths`):

- **Path B (mostly Tier B/C):** the design system is the **closest baseline**, not a match.
  Choose it with `design-token-bridge.md § B1`, in this order: the user's request, then
  the kit's direct counterpart (Material 3 → `material`, Fluent 2 → `fluent`, Bootstrap →
  `bootstrap`), then text-field label placement, then control heights. A design whose
  fields have labels *above* them should not get `material`. Then continue: apply B2–B4
  in 3c and B5–B8 in 3d.
- **Path A (mostly Tier A):** use this **strict precedence order**. Stop at the first
  signal that gives a clear answer:

1. **Explicit user request** — "make it Material", "use Fluent", etc.
2. **Library source name in design context** — the `figma_get_design_context` or
   `figma_get_metadata` response may reference the source library file name
   (e.g. `"Indigo.Design UI Kit for Material"` → `material`).
3. **Variable collection names from Phase 1e** — collection names like
   `Material/color/primary` identify the kit variant directly.
4. **Elevation variable structure** — inspect the `Elevations/*` variables:
   - **Three-layer DROP_SHADOW** (umbra + penumbra + ambient) → **Material**
   - **Single-layer DROP_SHADOW** → Indigo, Fluent, or Bootstrap
5. **Palette shade naming** — `primary/500`, `primary/100`–`primary/900` follows the
   Material 100–900 convention → likely **Material**.
6. **Visual heuristics** (only when all above are inconclusive):
   layered shadows + ripple effects → `"material"`;
   flat surfaces + sharp corners + Segoe/Inter font → `"fluent"`;
   component borders + Bootstrap grid → `"bootstrap"`;
   rounded purple/indigo accents without Material shadows → `"indigo"`.

> **Never use font name as a primary signal.** "Titillium Web" is the default body font in
> the Indigo.Design UI Kit for Material — it is not exclusive to any single kit variant.

Supported values: `material`, `bootstrap`, `fluent`, `indigo`.

> **Web Components read the active design system from CSS variables for the initial theme.**
> Components read `--ig-theme` and `--ig-theme-variant` (falling back to `bootstrap` /
> `light` when absent). A generated palette alone does **not** switch the design system —
> use the pre-built theme CSS or generated `:root` block for that. `configureTheme(ds, variant)`
> switches registered components at runtime but does not rewrite those root variables.

## 3c: Generate the Global Theme

Extract the following using [design-token-bridge.md](design-token-bridge.md):

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

Read the theming guidance resources before generating, so you extract only values the
theme system actually accepts:

```
theming_read_resource({ uri: "theming://guidance/colors/rules" })   // luminance + variant rules
theming_read_resource({ uri: "theming://platforms/webcomponents" }) // platform specifics
```

> **Parameter names differ between tools** — `theming_create_palette` uses `primary`,
> `secondary`, `surface`, `gray`, `success`, `warn`, `error`, `info`, and `variant`.
> `theming_create_theme` uses `primaryColor`, `secondaryColor`, `surfaceColor`, and has no
> `gray` or status colors. Do not mix them up.

**CSS path (default — no Sass in the project):**

1. Load the pre-built theme CSS for the resolved design system and variant — in the app
   entry point, or by replacing the scaffold's `<link>` in `index.html` (per 3a). This sets `--ig-theme`,
   `--ig-theme-variant`, the full palette, typography, and elevations in one line:

   ```typescript
   import 'igniteui-webcomponents/themes/dark/material.css';
   ```

2. Generate the palette overrides from the seed colors (add `gray` and the status colors
   when the design needs them):

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

   Apply the generated custom properties to `:root` in the global stylesheet. The overrides
   must load **after** the theme: load both through the same mechanism, in order — import
   the theme CSS and then `styles.css` from the entry module, or put both as `<link>` tags in
   `index.html`, theme first. (Vite injects CSS imported from JS after any `<link>` in
   `index.html`, so mixing the two can let the theme win.)

3. Apply the font family with plain CSS (`--ig-font-family` or `font-family`) or the CSS
   output of `theming_create_typography({ fontFamily, designSystem, platform: "webcomponents", output: "css" })`.
   Do not pass `customScale`: the tool accepts it but its generators ignore it. Do not emit
   Sass typography mixins into a CSS-only app.

4. Read and act on any **luminance warning** the palette tools return. When the design has
   several distinct surface depths that one generated surface color cannot express, use
   `theming_create_custom_palette`, or define semantic variables (`--surface-1`,
   `--surface-2`) for the extra depths.

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

`theming_create_theme` emits the `@use 'igniteui-theming'` imports, the `palette()` /
`elevations()` / `typography()` / `spacing()` mixin calls, and the `:root` block with
`--ig-theme` and `--ig-theme-variant`. Apply its output as instructed in the response. For
`gray`, status colors, or a full custom ramp, add the output of `theming_create_palette` or
`theming_create_custom_palette` **after** it; its `:root` palette variables override the
generated ones. Remove the scaffold's theme `<link>` from `index.html` (3a), so only one
theme loads.

> `theming_create_elevations` takes **`designSystem`** (`"material"` or `"indigo"`) — there
> is no `preset` parameter.

**Path B type overrides (both paths).** After the theme, add a `:root` block that sets the
`--ig-<style>-<property>` variables for the type styles that differ from the baseline,
including the button's text transform. See `design-token-bridge.md § B4`.

**Runtime switching.** When the design needs light and dark at runtime, swap the pre-built
stylesheet (or the palette block) **and** call the library API with the same design system
and variant. Components cache the design system they read from `--ig-theme` on first use,
so neither step alone switches both the palette and the component styles:

```typescript
import { configureTheme } from 'igniteui-webcomponents';
// after loading the dark material stylesheet:
configureTheme('material', 'dark');
```

**Grid and chart packages carry their own themes.** The premium grids need
`igniteui-webcomponents-grids/grids/themes/<variant>/<design-system>.css` in addition to
the core theme, and inside a Lit component that CSS must be imported `?inline` and injected
into the shadow root:

```typescript
import gridTheme from 'igniteui-webcomponents-grids/grids/themes/dark/material.css?inline';
// in render(): html`<style>${gridTheme}</style> <igc-grid ...></igc-grid>`
```

## 3d: Per-Component Token Mapping

> **Scope:** applies to every Ignite UI family that exposes design tokens — card, inputs,
> select, combo, navbar, nav drawer, list, tabs, date pickers, chips, grids, etc. Charts,
> gauges, and maps have **no design tokens**; configure those through component properties
> (see 3e).

For **every** Ignite UI component in your plan, run this loop:

1. `theming_get_component_design_tokens({ component: "<theme-key>" })` — review all token
   names, types, and descriptions, plus any **related themes** listed for compound
   components. Theme keys are not always the tag name: inputs are `input-group`, the nav
   drawer is `navdrawer`, progress bars are `progress-linear` / `progress-circular`, a
   single-select combo is `simple-combo`, and buttons need the variant name
   (`contained-button`, `flat-icon-button`, …). See
   `design-token-bridge.md § Per-Component Token Resolution` for the full map.
2. Find the values for this component's surfaces (background, text, border, hover state).
   **Path A:** from the Phase 1e kit variables. **Path B:** from the Phase 1d color census
   and measurements. Variables, when they exist, only confirm them.
3. `theming_create_component_theme({ component: "<theme-key>", platform: "webcomponents", designSystem: "<3b result>", variant: "<light|dark>", tokens: { <only differing tokens> }, output: "css" | "sass" })`.
   Always pass `designSystem` and `variant`: the tool defaults to Material light and would
   compute the theme against the wrong schema.
4. Apply the generated block exactly as returned — to the component selector or to the
   `selector` you passed. Color token values must reference palette variables
   (`var(--ig-primary-500)`), never raw hex.
5. For compound components — any component whose `get_component_design_tokens` result lists related themes (for example `combo`, `select`, the date pickers, `card`, `navbar`, `dialog`, `banner`, and the grids) — follow the related-theme chain from step 1 and
   theme each child with its scoped selector. Styling only the parent leaves the dropdown or
   calendar off-theme. Exception: the grid theme **derives** its children (`action-strip`,
   `column-actions`, toolbar, paginator, …); theme the grid and do not call
   `create_component_theme` for those keys separately.

**Path B additions to this loop** (see `design-token-bridge.md § B5–B8`): include the
component's **radius** tokens at the measured px value, its **border** and
**shadow/elevation** tokens as the design shows them, and its hover/focus/disabled **state**
tokens from the kit's state variants, in the same `theming_create_component_theme` call.
Choose `--ig-size` per component family from the measured control heights (`design-token-bridge.md § B7`) before
tuning individual components.

When a specific component needs a different density or spacing from the global default, use
`theming_set_size` or `theming_set_spacing` with the `component` parameter — this scopes
`--ig-size` or `--ig-spacing` to that component's selector rather than applying globally.
For compound components, use `scope` with a sub-component selector. Only apply these
globally (`:root`) when the entire app has a clearly distinct density (Path B: when every
component family moves the same way, see `design-token-bridge.md § B7`). Leave
`theming_set_roundness` at its default unless the user explicitly requests a change. For
Path B, express radius through per-component tokens instead, because one global factor
cannot reproduce a kit's radii. Never derive multiplier values from Figma pixel values —
see `design-token-bridge.md § Spacing, Sizing, and Roundness`.

## 3e: Chart Series Colors

Charts have no design tokens, and they default to their own brush palette — which will not
match the Figma series colors. Before implementing any chart:

```
theming_get_chart_series_colors({ chartType: "<e.g. category-chart>" })
theming_get_chart_series_colors({ customBrushes: ["#9DE772", "#6DB1FF"] })   // validate Figma colors
```

The first call lists which theme tokens on that chart type accept a brush list; the second
validates the colors you extracted in Phase 1d and flags pairs that are hard to tell apart.
Apply the result through the chart's brush properties, assigned on the element: `brushes` /
`outlines` on most charts, `brush` on `igc-sparkline`, `fillBrushes` on `igc-treemap`, and
`brushes` / `outlines` on each `igc-ring-series` of a doughnut chart.

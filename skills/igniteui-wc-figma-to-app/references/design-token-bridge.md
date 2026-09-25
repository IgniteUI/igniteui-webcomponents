# Figma Variables → Ignite UI Web Components Theming Bridge

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 3 to translate Figma variable values (from `figma_get_variable_defs`) into Ignite UI Theming MCP inputs. Read it in full before calling any theming tool. For the theming system itself — palette semantics, token rules, compound components — the source of truth is [`igniteui-wc-customize-component-theme`](../../igniteui-wc-customize-component-theme/SKILL.md).

> **Tool names:** like SKILL.md, this file refers to theming tools by their base name. Match by the tool's base name (`create_palette`, `create_theme`, `create_component_theme`, …) on the connected `igniteui-theming` server; your client may show them as `mcp__igniteui-theming__create_palette` or similar. The `licensed` parameter is for Angular only — do not pass it for Web Components.

---

## Two Paths

Which path you take depends on the provenance tiers recorded in Phase 1f ([design-provenance.md](design-provenance.md)):

| Path | When | What sets the look |
| --- | --- | --- |
| **A — Indigo.Design UI Kit** | Most components are Tier A | The kit variant **is** an Ignite UI design system. Palette and font come from the kit variables. Component proportions are already calibrated, so leave size, spacing, and roundness at their defaults. |
| **B — Any other kit, or no kit** | Most components are Tier B or C | The design system is only the **closest baseline**. Fidelity comes from palette seeds inferred from usage, type-style overrides, per-component radius tokens, and a measured `--ig-size`. See [Path B](#path-b--any-other-kit-or-no-kit). |

**Mixed files.** Count only the Table A rows that map to an Ignite UI component. Decorative Tier C frames that stay plain HTML do not count. The larger group chooses the path for the global theme; on a tie, ask the user. Then style the other group through component themes scoped to **those instances only**:

- Put a class on the minority instances (for example `class="kit-b"`), and pass it as `selector` to `create_component_theme`. Do not scope by the tag alone: a Tier A and a Tier B button are both `igc-button`, so that would restyle both.
- Tier B/C instances in a Path A app get the Path B token work (B2, B5–B8) in those scoped component themes.
- Tier A instances in a Path B app get their **kit's** design system: pass that kit's `designSystem` to their scoped component themes. Do not give them Path B treatment.

---

## Path A — How the Indigo.Design UI Kits Organize Variables

The **Indigo.Design UI Kits** are Figma component libraries published by Infragistics. Designers build their own app frames in Figma using these kits as shared libraries. The kits come in four design-system variants, each with light and dark themes:

| Kit variant            | Figma library name pattern                      | `designSystem` value |
| ---------------------- | ----------------------------------------------- | -------------------- |
| Material (most common) | `Indigo.Design UI Kit for Material`             | `"material"`         |
| Fluent                 | `Indigo.Design UI Kit for Fluent`               | `"fluent"`           |
| Bootstrap              | `Indigo.Design UI Kit for Bootstrap`            | `"bootstrap"`        |
| Indigo                 | `Indigo.Design UI Kit` / `Indigo.Design System` | `"indigo"`           |

**Identifying the active kit variant** is the first task in Phase 3 because it sets the design system for the whole app. Use these signals in **strict precedence order** — stop at the first clear match:

1. **Explicit user request** — "make it Material", "use Fluent", etc.
2. **Library source name** — `figma_get_design_context` / `figma_get_metadata` may reference the source library file name.
3. **Variable collection name** — `figma_get_variable_defs` may return collection names that include the design system (e.g. `Material/color/primary`).
4. **Elevation variable structure** — inspect `Elevations/*`:
   - **Three-layer DROP_SHADOW** (umbra + penumbra + ambient, `Elevations/Shadow 01-03`) → **Material**
   - **Single-layer DROP_SHADOW** → Indigo, Fluent, or Bootstrap
5. **Palette shade naming** — `primary/500`, `primary/100`–`primary/900` follows the Material 100–900 convention → likely **Material**.
6. **Visual heuristics** — see the [Design System Detection table](#design-system-detection-from-figma).

> **Never use font name as a primary signal.** "Titillium Web" is the default body font in the Indigo.Design UI Kit for Material — it is not exclusive to any kit variant.

All four kit variants share the same variable naming conventions:

```
Primitives collection  → raw palette values (e.g. blue/500 = #6200EE)
Semantic collection    → role-based aliases (e.g. color/primary = alias → blue/500)
Component collection   → per-component overrides (e.g. button/background = alias → color/primary)
```

---

## The Web Components Theming Contract

Before mapping any value, understand what actually drives a Web Components theme. This is the single biggest difference from the Angular flow.

| Layer | What it is | How it gets set |
| --- | --- | --- |
| **Design system + variant** | `--ig-theme`, `--ig-theme-variant` on `:root` | A pre-built theme CSS import or the `:root` block generated by `create_theme`; `configureTheme(ds, variant)` switches component themes at runtime but does not rewrite these CSS variables |
| **Palette** | `--ig-<family>-<shade>` and `--ig-<family>-<shade>-contrast` custom properties | `create_palette` / `create_theme`, or overriding the `*-500` base shade by hand |
| **Typography** | `--ig-font-family` plus the type scale | `create_typography`, or plain CSS in a CSS-only project |
| **Elevations** | shadow custom properties | `create_elevations` (`designSystem: "material" \| "indigo"`) |
| **Layout** | `--ig-size`, `--ig-spacing`, `--ig-radius-factor` | `set_size` / `set_spacing` / `set_roundness` |
| **Per component** | component design tokens | `get_component_design_tokens` → `create_component_theme` |

Components read the design system **at runtime from CSS variables** and fall back to `bootstrap` / `light` when they are absent. A correct palette with a missing `--ig-theme` gives you the right colors on the wrong component anatomy.

**Every theming tool that generates code (`create_*`, `set_size`, `set_spacing`, `set_roundness`) accepts `output: "css" | "sass"`, defaulting to CSS.** Choose once in Phase 3 based on whether the project has Sass, and stay consistent. The Web Components Sass API is `@use 'igniteui-theming'` with individual `palette()`, `typography()`, `elevations()`, and `spacing()` mixins — the Angular `core()` / `theme()` mixins do not exist here.

---

## Path B — Any Other Kit (or No Kit)

A third-party kit was not built for Ignite UI. Its variable names do not follow Ignite UI conventions, and its component proportions, radii, and type ramp differ from every Ignite UI design system. Treat theming as **fitting a baseline**: choose the closest design system, then override what the design measurably does differently.

### B1 — Choose the Baseline Design System by Anatomy

Use the first rule that gives a clear answer:

1. **Explicit user request.**
2. **Kit with a direct counterpart:** Material 3 / Material kits → `material`; Fluent 2 → `fluent`; Bootstrap kits → `bootstrap`.
3. **Otherwise, score the anatomy.** These are properties of the Ignite UI themes that you cannot fully override with tokens, so they decide the baseline:

| Observable in the design | `material` | `fluent` | `bootstrap` | `indigo` |
| --- | --- | --- | --- | --- |
| Text-field label | **Floating inside the field** (notched outline) | Above the field | Above the field | Above the field |
| Default button height | 36px | 32px | 38px | 28px |
| Default input height | 48px | 40px | 38px | 28px |
| Button label casing in the type preset | UPPERCASE | Capitalize | none | UPPERCASE |

The label position is the strongest signal. A design with labels above its fields (shadcn, Untitled UI, Ant, Tailwind-style kits, most in-house kits) should **not** use `material`, however "Material-like" its colors look. Among the label-above systems, choose the one whose default heights are closest to the measured controls. When heights are close to 36–40px buttons and 36–44px inputs, `bootstrap` or `fluent` is usually the better starting point. Casing is overridable (B4), so it only breaks ties.

These numbers come from the `igniteui-theming` component schemas and type presets at the default `--ig-size`. If a result looks off, confirm it with `get_component_design_tokens`.

### B2 — Infer Color Roles From Usage, Not Names

Third-party variable names do not tell you which Ignite UI palette slot they fill. Kits call the brand color `primary`, `brand/600`, `colorBrandBackground`, `md.sys.color.primary`, or nothing at all. Build a **color census** from the design context of the target artboards, and take each seed from where it is **used**:

| Ignite UI palette input | Take the color from |
| --- | --- |
| `primary` | The fill of high-emphasis buttons. If there are none, the active tab indicator, checked checkbox/switch, or focused-field accent. |
| `secondary` | A second accent actually used on components: tonal/secondary buttons, selected chips, FAB. If none exists, reuse `primary`. Do not invent one. |
| `surface` | The page / artboard background. Additional depths (cards, sidebars) → B6. |
| `gray` | Omit at first. Pass it only if the generated grays visibly diverge from the design's borders and secondary text. |
| `error` / `warn` / `success` / `info` | Destructive buttons, error-state fields, alert and status colors |

In the **CSS path** these all go to `create_palette`, which takes `gray` and the status colors. In the **Sass path**, `create_theme` takes only `primaryColor`, `secondaryColor`, and `surfaceColor`: to set `gray` or a status color, also call `create_palette` (or `create_custom_palette`) and place its output **after** the theme output, so its `:root` palette variables override the generated ones.

**Seed-shade rule.** Ignite UI components paint their main fills with the **500** shade of a palette color. Pass the color that is *visible on the component* as the seed, whatever the kit calls it. Examples: Untitled UI buttons use `Brand/600`, Tailwind-style kits use `blue-600`, and Material 3 uses the tone-40 `primary`. Passing the kit's own `…/500` variable when the buttons are painted with `…/600` makes every component one step too light.

**Material baseline trap.** In the Ignite UI `material` schema, **control accents use the `secondary` palette**: contained-button fill, flat-button text, checkbox fill, and switch thumb. The navbar and tab indicators use `primary`. `fluent`, `bootstrap`, and `indigo` use `primary` for those controls. Most third-party kits, Material 3 included, paint buttons and checkboxes with their primary color. On a `material` baseline, therefore, seed `secondary` with the brand color seen on the buttons as well. Seed `primary` with the color used on app bars and tab indicators, which is often the same color. Otherwise every button comes out in an unrelated accent. Check the resolved roles with `read_resource({ uri: "theming://guidance/colors/roles" })`.

When the variables are available, resolve their alias chains and use them to *name* and *confirm* what the census found. When the variables and the census disagree, the census wins: it describes what the designer actually drew.

**Full ramps.** If the design visibly uses several shades of one color (hover, pressed, tinted backgrounds), use `create_custom_palette` with `mode: "explicit"` for that color. The explicit mode needs **all 14 shades** (`50`–`900` plus `A100`, `A200`, `A400`, `A700`). Align the kit's stops by lightness, not by label (Tailwind and Untitled UI have `25` and `950` stops that Ignite UI does not). Derive the accent shades from the neighboring stops. Use `mode: "shades"` for every color whose ramp the design does not show.

**Dark variant.** Decide it from the page background, as in [Light vs Dark Mode Detection](#light-vs-dark-mode-detection). Material 3 tonal surfaces (`surface-container-low` … `-highest`) are multiple surface depths. Handle them with B6, not with a lighter `surface` seed.

### B3 — Typography

1. **Family:** take it from the text styles actually used (the design context `font-['…']` classes). Load it in the app. Kits often use Inter, Geist, Roboto Flex, or SF Pro. SF Pro is licensed for Apple platforms only, so substitute a web font and say so.
2. **Scale:** map the kit's ramp to Ignite UI type styles **by role and size ranking**, not by name. Override only the styles that differ (see [B4](#b4--button-casing-and-other-type-driven-anatomy) for how):

| Kit role (examples) | Ignite UI type style |
| --- | --- |
| Display / Hero / Heading XL | `h1`–`h3` (largest three) |
| Headline / Heading L–M / Title L | `h4`–`h6` |
| Title M–S / Subtitle / Label L (emphasized body) | `subtitle-1`, `subtitle-2` |
| Body L / Body M / Text md | `body-1`, `body-2` |
| Label M on buttons | `button` |
| Body S / Caption / Text xs | `caption` |
| Label S / Overline / Eyebrow | `overline` |

### B4 — Button Casing and Other Type-Driven Anatomy

The `material` and `indigo` type presets set `button` to `text-transform: uppercase`. `fluent` uses `capitalize`. Nearly every current third-party kit, Material 3 included, uses sentence case. Unless the design shows uppercase labels, set the button's text transform to `none`, together with its measured size and weight.

**How to override type styles.** The theme's typography writes every property of every type style to a CSS variable on `:root`, named `--ig-<style>-<property>`, and the components read those variables inside their shadow roots. Add a `:root` block **after** the theme import or theme output that sets only the values that differ:

```css
/* After the theme import in styles.css */
:root {
  --ig-button-text-transform: none;
  --ig-button-font-size: 0.875rem;
  --ig-button-font-weight: 500;
  --ig-h1-font-size: 2.25rem;
  --ig-body-1-line-height: 1.5rem;
}
```

Property names are `font-family`, `font-size`, `font-weight`, `font-style`, `line-height`, `letter-spacing`, `text-transform`, `margin-top`, and `margin-bottom`.

Ignite UI components read these variables inside their own shadow roots, so the overrides reach them. Inside a Lit view's shadow root, document CSS such as `.ig-typography h1` does not reach native headings. Apply the variables in the view's `static styles` yourself, for example `h1 { font-size: var(--ig-h1-font-size); font-weight: var(--ig-h1-font-weight); line-height: var(--ig-h1-line-height); }`.

> **Do not rely on `customScale`.** `create_typography` accepts a `customScale` argument, but `igniteui-theming` 29.0.0 drops it from the generated code (CSS and Sass) without a warning. Use the variable overrides above, and measure the result in Phase 5.

### B5 — Radius: Per-Component Tokens, Not a Global Factor

`set_roundness` sets a single `radiusFactor` (0–1) that interpolates each component between **its own** minimum and maximum radius, and those ranges differ. For example, the button range is 0–20px, the card 0–24px, the dialog 0–36px, and the chip 0–16px. One factor therefore cannot reproduce a kit's radius language, such as "everything is 8px" or "pill buttons, 12px cards".

Instead, set the radius tokens that `get_component_design_tokens` returns for each component (`border-radius`, or variants such as `box-border-radius` / `border-border-radius` on `input-group`) to the **measured px value**, in the same `create_component_theme` call as the component's colors. A pill shape is half the control height, or a large value such as `9999px`.

### B6 — Surfaces and Elevation

- **Depths:** kits built on borders instead of shadows (shadcn, Untitled UI, Fluent 2) use 2–4 surface tones. Express them with `create_custom_palette` surface shades or semantic variables (`--surface-1`, `--surface-2`), as in [Multiple Surface Depths](#multiple-surface-depths).
- **Shadows:** `create_elevations` only has the `material` and `indigo` presets. When the design is flat or border-first, keep the global elevations and set the components' shadow/elevation tokens to `none` or the measured `box-shadow` value. When the design uses shadows, pick the closer preset and verify the depth of cards, menus, and dialogs in Phase 5.
- **Borders:** a 1px neutral border on cards, inputs, and menus is part of the anatomy of most modern kits. Set it through the components' border tokens, bound to a gray or surface palette variable.

### B7 — Density

Choose `--ig-size` **per component family**. Compare the measured height of each family (buttons, inputs, list rows, …) with that family's size steps in the baseline. Each component has its **own default step**. For example, on `material` the button default is large (36px) while the input default is medium (48px). So a design with 36px buttons and 48px inputs already matches both defaults and needs no change. The steps (default in bold):

| Design system | Button small / medium / large | Input small / medium / large |
| --- | --- | --- |
| `material` | 24 / 30 / **36px** | 40 / **48** / 56px |
| `fluent` | 24 / **32** / 38px | 32 / **40** / 48px |
| `bootstrap` | 32 / **38** / 48px | 32 / **38** / 48px |
| `indigo` | 24 / **28** / 32px | 24 / **28** / 32px |

For other families, read the steps and the default from `get_component_design_tokens`. For each family whose nearest step differs from its default, call `set_size` with that `component`. Set `--ig-size` globally only when **every** family moves in the same direction. Close a remaining 2–4px mismatch with the component's padding or height tokens, if it has them. Otherwise leave it: Phase 5 rates a difference of 4px or less as Cosmetic. It is never an anatomy delta. The `set_spacing` rule is unchanged: never convert a Figma pixel value into a multiplier.

### B8 — States and Focus

Hover, pressed, disabled, and error variants in the kit are **token inputs**. Map their colors onto the matching state tokens (`hover-background`, `focus-*`, `disabled-*`, …) in the same component theme. Focus rings differ strongly between kits (a 2–3px offset ring in shadcn and Untitled UI, a bottom accent in Fluent). If the design specifies one, it belongs in the component tokens. Keep focus visible whatever the design shows: accessibility is not optional.

---

## Global Palette Mapping

> Path A name patterns. For Path B, use these tables only to *label* a variable after the color census (B2) has decided the role.

### Primary Color

| Figma Variable Pattern | Theming Input                 | Notes                                   |
| ---------------------- | ----------------------------- | --------------------------------------- |
| `color/primary`        | `primary` in `create_palette` | Use the resolved hex value              |
| `primary/500`          | `primary`                     | The 500 shade is the seed color         |
| `Primary/Default`      | `primary`                     | Alternative naming in some kit versions |
| `palette/primary/500`  | `primary`                     | Prefixed naming pattern                 |

> **Parameter names differ between tools.** `create_palette` takes `primary`, `secondary`, `surface`, `gray`, `info`, `success`, `warn`, `error`. `create_theme` takes `primaryColor`, `secondaryColor`, `surfaceColor`. Do not mix them up.

### Secondary / Accent Color

| Figma Variable Pattern | Theming Input                   | Notes                              |
| ---------------------- | ------------------------------- | ---------------------------------- |
| `color/secondary`      | `secondary` in `create_palette` | —                                  |
| `secondary/500`        | `secondary`                     | —                                  |
| `Secondary/Default`    | `secondary`                     | —                                  |
| `color/accent`         | `secondary`                     | Some kit variants call it "accent" |

### Surface / Background Color

| Figma Variable Pattern | Theming Input                 | Notes               |
| ---------------------- | ----------------------------- | ------------------- |
| `color/surface`        | `surface` in `create_palette` | The main background |
| `surface/default`      | `surface`                     | —                   |
| `Surface`              | `surface`                     | —                   |
| `color/background`     | `surface`                     | Alternative naming  |

### Gray / Neutral Palette

The gray scale is derived automatically from the surface color, and **gray is inverted relative to surface** in dark themes. Do not pass gray unless the Figma grays clearly diverge from the generated ones. Read `theming://guidance/colors/rules` before overriding.

### Semantic Status Colors

| Figma Variable Pattern           | Theming Input | Notes    |
| -------------------------------- | ------------- | -------- |
| `color/success` or `success/500` | `success`     | Optional |
| `color/warning` or `warning/500` | `warn`        | Optional — the parameter is `warn`, not `warning` |
| `color/error` or `error/500`     | `error`       | Optional |
| `color/info` or `info/500`       | `info`        | Optional |

### Multiple Surface Depths

Designs frequently use two or three surface depths (page, panel, card) that a single generated `surface` cannot express. When that happens:

- use `create_custom_palette` for explicit per-shade control, or
- define semantic variables (`--surface-1`, `--surface-2`) alongside the palette and use them in view CSS.

Never satisfy a second depth with a raw hex value in component styles.

### Resolving Colors Back Out

Use `get_color({ color, variant, contrast, opacity })` to turn a color intent into the correct `var(--ig-<family>-<shade>)` reference — including contrast colors and transparency — instead of hand-writing variable names.

---

## Typography Mapping

| Figma Variable Pattern           | Theming Input                          | Notes                                 |
| -------------------------------- | -------------------------------------- | ------------------------------------- |
| `typography/font-family`         | `fontFamily` in `create_typography`    | Primary font                          |
| `typography/body/font-family`    | `fontFamily`                           | Body font family                      |
| `typography/heading/font-family` | `fontFamily`                           | Use if the heading font differs       |
| `font/primary`                   | `fontFamily`                           | Alternative naming                    |

`create_typography` also accepts `designSystem` (which type scale to start from). Its `customScale` argument is currently ignored by the generators; override individual type styles with the `--ig-<style>-<property>` variables instead (see [B4](#b4--button-casing-and-other-type-driven-anatomy)).

In a CSS-only project, apply typography as plain CSS `font-family` / `font-size` / `font-weight` rules, or the CSS output of `create_typography`. **Do not emit Sass typography mixins into an app that has no Sass.**

Web fonts must be loaded by the app (a `<link>` to the font provider or a local `@font-face`); setting a font family the browser cannot resolve silently falls back and fails Phase 5.

---

## Spacing, Sizing, and Roundness — Do Not Map Directly

> **These tools are NOT equivalent to Figma spacing values.** Do not create a mapping between Figma pixel values and these tools.

`set_spacing` takes a **multiplier** (`1.0` = default, plus optional `inline` / `block` multipliers). `set_roundness` takes a `radiusFactor` between **0 and 1**. `set_size` takes a **density** (`small` / `medium` / `large`, or `1`–`3`). Passing a Figma `spacing/md = 16` as `set_spacing({ spacing: 16 })` would produce a 1600% increase.

### When to touch these tools (sparingly)

| Tool             | Use only when                                                                                                   | Never because                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `set_size`       | Path A: the design consistently uses a noticeably tighter or looser density than the design system default. Path B: per family, as in B7 | A Figma spacing variable happens to be named "compact"           |
| `set_spacing`    | Explicitly requested, or required to match a specific density contract; start at the default                    | A Figma `spacing/*` pixel value looks like the multiplier number |
| `set_roundness`  | The user explicitly asks for it. For Path B, use per-component radius tokens instead (B5)                        | A Figma `border-radius/md = 8` maps numerically to a multiplier  |

### The correct adjustment path

Scope `--ig-size` and `--ig-spacing` to the component that needs it — both tools take a `component` parameter (and `scope` for a sub-component or container selector) that generates exactly this:

```
set_size({ component: "calendar", size: "small", platform: "webcomponents" })
// → igc-calendar { --ig-size: var(--ig-size-small); }

set_spacing({ component: "calendar", spacing: 0.75, platform: "webcomponents" })
// → igc-calendar { --ig-spacing: 0.75; }

set_size({ scope: ".compact-toolbar", size: "small", platform: "webcomponents" })
```

Or set the custom properties directly:

```css
igc-calendar {
  --ig-size: var(--ig-size-small);
  --ig-spacing: 0.75;
}
```

The Indigo.Design kit's component proportions are already calibrated per design system — start from the defaults and adjust only when there is a clear visual reason.

**Path B differs.** A third-party kit's proportions are *not* calibrated to Ignite UI, so the defaults are not a safe resting point. The prohibition still holds: never convert a px value into a multiplier. But do make the **categorical** choices from measurements: pick `--ig-size` from the nearest height step (B7), and set each component's radius token to the measured px value (B5). These are not multiplier conversions. They use each tool the way it was designed.

---

## Light vs Dark Mode Detection

| Figma Signal                                             | Action                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Dark artboard background (`#121212`, `#1a1a1a`, similar) | `variant: "dark"` + the dark theme CSS (`themes/dark/<ds>.css`)          |
| Light artboard background (`#fff`, `#f5f5f5`, similar)   | `variant: "light"` + the light theme CSS                                 |
| Multiple artboards — one light, one dark                 | Ask the user which variant is primary. Generate it as the global theme and run Phase 5 against it. Then add the other variant (the other pre-built theme or a second theme output) under a class or `prefers-color-scheme`, and call `configureTheme` with the same design system and variant when switching at runtime (see `theme-generation.md § 3c`). Validate it against its own artboard |
| `color/mode` variable present                            | Its value (`light` or `dark`) is the authoritative signal                |

Surface color must match the variant: a light surface with `variant: "dark"` produces unreadable components and a luminance warning from the palette tools. Read the warnings.

---

## Design System Detection from Figma

> Path A (Indigo.Design kits) only. For any other kit, choose the baseline with the anatomy rubric in [B1](#b1--choose-the-baseline-design-system-by-anatomy).

| Figma Visual Signal                                                | Likely Design System       | `designSystem` Value |
| ------------------------------------------------------------------ | -------------------------- | -------------------- |
| Three-layer `DROP_SHADOW` on elevation variables (`Shadow 01-03`)  | Material Design            | `"material"`         |
| Prominent layered shadows, rounded cards, ripple effects           | Material Design            | `"material"`         |
| Flat surfaces, sharp corners, Segoe/Inter font                     | Microsoft Fluent           | `"fluent"`           |
| Component borders, Bootstrap-like grid                             | Bootstrap                  | `"bootstrap"`        |
| Purple/indigo accents, rounded corners, single shadow              | Infragistics Indigo        | `"indigo"`           |
| `primary/500`, `primary/900` palette shade naming                  | Material (100–900 palette) | `"material"`         |

`create_elevations` accepts only `"material"` or `"indigo"` as its `designSystem` — for a Fluent or Bootstrap design, pick the closer of the two (usually `material`).

---

## Per-Component Token Resolution

### Step 1: Use the right theme key

Theme keys are **not** tag names. Pass the key to `get_component_design_tokens` and `create_component_theme`:

| Component in the design | Theme key           | Selector it generates for        |
| ----------------------- | ------------------- | --------------------------------- |
| Text input              | `input-group`       | `igc-input` (other fields get it through their related themes; `igc-textarea` uses `textarea`) |
| Navigation drawer       | `navdrawer`         | `igc-nav-drawer`                  |
| Linear progress bar     | `progress-linear`   | `igc-linear-progress`             |
| Circular progress       | `progress-circular` | `igc-circular-progress`           |
| Single-select combo     | `simple-combo`      | `igc-combo[single-select]`        |
| Flat / contained / outlined button | `flat-button`, `contained-button`, `outlined-button` | `igc-button[variant="…"]` |
| Icon button variants    | `flat-icon-button`, `contained-icon-button`, `outlined-icon-button` | `igc-icon-button[variant="…"]` |
| Premium grid            | `grid`              | `igc-grid`                        |
| Lightweight grid        | `grid-lite`         | `igc-grid-lite`                   |
| Dropdown menu           | `drop-down`         | `igc-dropdown`                    |
| App scrollbars          | `scrollbar`         | `.ig-scrollbar`                   |

Most other components use their obvious key (`card`, `list`, `navbar`, `chip`, `avatar`, `badge`, `calendar`, `date-picker`, `select`, `combo`, `tabs`, `stepper`, `tree`, `dialog`, `toast`, `snackbar`, `banner`, `tooltip`, `divider`, `rating`, `slider`, `switch`, `checkbox`, `radio`, `carousel`, `chat`, `expansion-panel`, `accordion`, `splitter`, `file-input`, `date-time-input`, `textarea`, `icon`, `ripple`, `highlight`).

**Keys with no standalone Web Components selector in the theming tool** — do not call the theming tools for these: `action-strip`, `bottom-nav`, `column-actions`, `overlay`, `query-builder`, `time-picker`, `date-range-start`, `date-range-end`. (`action-strip` and `column-actions` are themed through the `grid` theme, which derives them.) Sub-part keys (`card-header`, `list-item`, `step`, `tab-item`, `accordion-header`, `expansion-panel-header`, `drop-down-item`, `nav-drawer-item`) have no standalone selector either — style them through the parent's tokens, their documented `::part(...)`, or slotted content.

### Step 2: Discover the tokens

```
get_component_design_tokens({ component: "<theme key>" })
```

The result lists every token with name, type, and description — and, for compound components, the **related themes** you must also theme.

### Step 3: Match Figma variables to token names

> **Path B:** third-party kits rarely have component variables in this form, and Tier C files usually have none. Take the component's colors, radius, borders, and state colors from the Phase 1d color census and measurements (B2, B5–B8). Use variables, when they exist, only to confirm them.

Kit component variables follow `<component>/<role>/<state>`:

- `button/background` → token `background`
- `button/foreground` → token `foreground-color`
- `chip/background/selected` → token `selected-chip-color`
- `grid/header-background` → token `header-background`
- `navbar/background` → token `background`

Lookup process: strip the component prefix, match the remainder against the token list, and when there is no exact match pick the token whose description names the same visual role.

| Component | Figma Variable             | Likely Token Name       | Notes                   |
| --------- | -------------------------- | ----------------------- | ----------------------- |
| Button    | `button/background`        | `background`            | Per variant key         |
| Button    | `button/foreground`        | `foreground-color`      | Text color              |
| Button    | `button/border`            | `border-color`          | Outlined variant        |
| Chip      | `chip/background`          | `background`            | Default state           |
| Chip      | `chip/selected-background` | `selected-chip-color`   | —                       |
| Grid      | `grid/header/background`   | `header-background`     | —                       |
| Grid      | `grid/row/background`      | `content-background`    | —                       |
| Grid      | `grid/row/hover`           | `row-hover-background`  | —                       |
| Navbar    | `navbar/background`        | `background`            | —                       |
| Input     | `input/background`         | `box-background`        | Filled appearance       |
| Input     | `input/border`             | `border-color`          | `outlined` appearance   |
| Card      | `card/background`          | `background`            | —                       |
| List      | `list/item/background`     | `item-background`       | —                       |
| List      | `list/item/hover`          | `item-hover-background` | —                       |
| Dialog    | `dialog/background`        | `background`            | —                       |

### Step 4: Generate the component theme

Pass **only tokens that differ from the global theme**, and express values as palette references — never raw hex:

```
create_component_theme({
  component: "<theme key>",
  platform: "webcomponents",
  designSystem: "<resolved>",
  variant: "<light|dark>",
  tokens: {
    "background": "var(--ig-surface-100)",
    "foreground-color": "var(--ig-gray-900)"
  },
  selector: "<optional scope, e.g. .dashboard igc-card>",
  output: "css"
})
```

Apply the generated block exactly as returned. Use `selector` to scope an override to one region instead of every instance in the app.

### Step 5: Compound components

Compound components — any component whose `get_component_design_tokens` result lists related themes (for example `combo`, `select`, the date pickers, `card`, `navbar`, `dialog`, `banner`, and the grids) — render internal children with their own themes. Theme each related theme returned in Step 1 using the parent's selector as the wrapper. Styling only the parent leaves dropdown surfaces, calendars, and action buttons off-theme — a guaranteed Phase 5 failure.

---

## Chart Colors

Charts have no design tokens. Take the series colors from the Figma design context and run them through the theming MCP before use:

```
get_chart_series_colors({ chartType: "category-chart" })         // which properties accept a brush list
get_chart_series_colors({ customBrushes: ["#9DE772", "#6DB1FF"] }) // validate the Figma colors
get_chart_series_colors({ mode: "color-blind" })                  // accessible alternative palette
```

Assign the result to the chart's brush **properties**: `brushes` / `outlines` on most charts, `brush` on `igc-sparkline`, `fillBrushes` on `igc-treemap`, and `brushes` / `outlines` on each `igc-ring-series` of a doughnut chart. Without an explicit assignment the chart uses its own default palette and will not match the design.

---

## Variable Resolution Priority

When multiple Figma variables could map to the same theming input:

1. **Component-scoped variable** (e.g. `button/background`) → per-component token
2. **Semantic role variable** (e.g. `color/primary`) → global palette input
3. **Primitive variable** (e.g. `primary/500`) → global palette seed color
4. **Raw hex/rgb value** (no variable) → extract directly from the design context

---

## What to Skip

Do **not** call theming tools for:

- Chart, gauge, and map components → configure via properties; series colors via `get_chart_series_colors`
- Pure layout CSS (margins, grid columns, flex gaps) → write it directly in the view's styles
- Icon colors → set `color` on the `igc-icon` host or its parent

Dock Manager **is** themed with the tools: use the theme key `dock-manager` (selector `igc-dockmanager`) like any other component. It also exposes its own CSS custom properties.

---

## Loading Reference Data

| URI | Content |
| --- | --- |
| `theming://platforms/webcomponents` | Web Components platform specifics |
| `theming://guidance/colors/rules`   | Surface/gray luminance rules for light and dark |
| `theming://guidance/colors/roles`   | Which components use primary vs secondary vs surface |
| `theming://guidance/colors/usage`   | Which shade for which purpose |
| `theming://guidance/colors/charts`  | Chart color guidance |
| `theming://presets/palettes`        | Preset palette colors |
| `theming://presets/typography`      | Typography presets |
| `theming://presets/elevations`      | Elevation shadow presets |

Read them with `read_resource({ uri: "<uri>" })`.

# Figma Variables → Ignite UI Web Components Theming Bridge

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 3 to translate Figma variable values (from `figma_get_variable_defs`) into Ignite UI Theming MCP inputs. Read all of it before you call a theming tool. For the theming system (palette semantics, token rules, compound components), the source of truth is [`igniteui-wc-customize-component-theme`](../../igniteui-wc-customize-component-theme/SKILL.md).

> **Tool names:** like SKILL.md, this file refers to theming tools by their base name. Find each tool by its base name (`create_palette`, `create_theme`, `create_component_theme`, …) on the connected `igniteui-theming` server. Your client can show them as `mcp__igniteui-theming__create_palette` or a similar name. The `licensed` parameter is for Angular only. Do not pass it for Web Components.

---

## Two Paths

The provenance tiers that you recorded in Phase 1f ([design-provenance.md](design-provenance.md)) tell you which path to use:

| Path | When | What sets the look |
| --- | --- | --- |
| **A — Indigo.Design UI Kit** | Most components are Tier A | The kit variant **is** an Ignite UI design system. Palette and font come from the kit variables. Component proportions are already calibrated, so leave size, spacing, and roundness at their defaults. |
| **B — Any other kit, or no kit** | Most components are Tier B or C | The design system is only the **closest baseline**. Fidelity comes from palette seeds inferred from usage, type-style overrides, per-component radius tokens, and a measured `--ig-size`. See [Path B](#path-b--any-other-kit-or-no-kit). |

**Mixed files.** Count only the Table A rows that map to an Ignite UI component. Decorative Tier C frames that stay plain HTML do not count. The larger group sets the path for the global theme. If the groups are equal, ask the user. Then style the other group through component themes scoped to **those instances only**:

- Put a class on the minority instances (for example, `class="kit-b"`), and pass it as `selector` to `create_component_theme`. Do not scope by the tag alone. A Tier A button and a Tier B button are both `igc-button`, so a tag scope restyles both.
- In a Path A app, Tier B/C instances get the Path B token work (B2, B5–B8) in those scoped component themes.
- In a Path B app, Tier A instances get their **kit's** design system. Pass that kit's `designSystem` to their scoped component themes. Do not give them Path B treatment.

---

## Path A — How the Indigo.Design UI Kits Organize Variables

The **Indigo.Design UI Kits** are Figma component libraries from Infragistics. Designers use these kits as shared libraries to build their own app frames in Figma. The kits have four design-system variants. Each variant has light and dark themes:

| Kit variant            | Figma library name pattern                      | `designSystem` value |
| ---------------------- | ----------------------------------------------- | -------------------- |
| Material (most common) | `Indigo.Design UI Kit for Material`             | `"material"`         |
| Fluent                 | `Indigo.Design UI Kit for Fluent`               | `"fluent"`           |
| Bootstrap              | `Indigo.Design UI Kit for Bootstrap`            | `"bootstrap"`        |
| Indigo                 | `Indigo.Design UI Kit` / `Indigo.Design System` | `"indigo"`           |

**Identifying the active kit variant** is the first task in Phase 3 because it sets the design system for the whole app. Use these signals in **strict precedence order**. Stop at the first clear match:

1. **Explicit user request** — for example, "make it Material" or "use Fluent".
2. **Library source name** — `figma_get_design_context` / `figma_get_metadata` can reference the source library file name.
3. **Variable collection name** — `figma_get_variable_defs` can return collection names that include the design system (for example, `Material/color/primary`).
4. **Elevation variable structure** — inspect `Elevations/*`:
   - **Three-layer DROP_SHADOW** (umbra + penumbra + ambient, `Elevations/Shadow 01-03`) → **Material**
   - **Single-layer DROP_SHADOW** → Indigo, Fluent, or Bootstrap
5. **Palette shade naming** — `primary/500`, `primary/100`–`primary/900` follows the Material 100–900 convention → likely **Material**.
6. **Visual heuristics** — see the [Design System Detection table](#design-system-detection-from-figma).

> **Never use font name as a primary signal.** "Titillium Web" is the default body font in the Indigo.Design UI Kit for Material. It is not specific to one kit variant.

All four kit variants use the same variable naming conventions:

```
Primitives collection  → raw palette values (e.g. blue/500 = #6200EE)
Semantic collection    → role-based aliases (e.g. color/primary = alias → blue/500)
Component collection   → per-component overrides (e.g. button/background = alias → color/primary)
```

---

## The Web Components Theming Contract

Before you map a value, learn what controls a Web Components theme. This is the largest difference from the Angular flow.

| Layer | What it is | How it gets set |
| --- | --- | --- |
| **Design system + variant** | `--ig-theme`, `--ig-theme-variant` on `:root` | A pre-built theme CSS import, or the `:root` block that `create_theme` generates. `configureTheme(ds, variant)` switches component themes at runtime, but it does not rewrite these CSS variables |
| **Palette** | `--ig-<family>-<shade>` and `--ig-<family>-<shade>-contrast` custom properties | `create_palette` / `create_theme`, or a manual override of the `*-500` base shade |
| **Typography** | `--ig-font-family` plus the type scale | `create_typography`, or plain CSS in a CSS-only project |
| **Elevations** | shadow custom properties | `create_elevations` (`designSystem: "material" \| "indigo"`) |
| **Layout** | `--ig-size`, `--ig-spacing`, `--ig-radius-factor` | `set_size` / `set_spacing` / `set_roundness` |
| **Per component** | component design tokens | `get_component_design_tokens` → `create_component_theme` |

Components read the design system **at runtime from CSS variables**. When these variables are not present, components fall back to `bootstrap` / `light`. If the palette is correct but `--ig-theme` is missing, you get the correct colors on the wrong component anatomy.

**Every theming tool that generates code (`create_*`, `set_size`, `set_spacing`, `set_roundness`) accepts `output: "css" | "sass"`. The default is CSS.** Choose the output once in Phase 3, from whether the project has Sass. Then use the same output for all calls. The Web Components Sass API is `@use 'igniteui-theming'` with individual `palette()`, `typography()`, `elevations()`, and `spacing()` mixins. The Angular `core()` / `theme()` mixins do not exist in Web Components.

---

## Path B — Any Other Kit (or No Kit)

A third-party kit does not target Ignite UI. Its variable names do not follow Ignite UI conventions. Its component proportions, radii, and type ramp are different from all Ignite UI design systems. Treat theming as **fitting a baseline**: choose the closest design system, then override the values that you measure as different in the design.

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

The label position is the strongest signal. Do **not** use `material` for a design with labels above its fields (shadcn, Untitled UI, Ant, Tailwind-style kits, most in-house kits), even if its colors look "Material-like". Among the label-above systems, choose the one whose default heights are closest to the measured controls. When the buttons are approximately 36–40px and the inputs approximately 36–44px, `bootstrap` or `fluent` is usually the better starting point. You can override casing (B4), so use casing only to choose between two equal systems.

These numbers come from the `igniteui-theming` component schemas and type presets at the default `--ig-size`. If a result looks incorrect, confirm it with `get_component_design_tokens`.

### B2 — Infer Color Roles From Usage, Not Names

Third-party variable names do not tell you which Ignite UI palette slot they fill. Kits call the brand color `primary`, `brand/600`, `colorBrandBackground`, `md.sys.color.primary`, or give it no name. Build a **color census** from the design context of the target artboards. Take each seed from the location where the design **uses** it:

| Ignite UI palette input | Take the color from |
| --- | --- |
| `primary` | The fill of high-emphasis buttons. If there are none, the active tab indicator, checked checkbox/switch, or focused-field accent. |
| `secondary` | A second accent that the components use: tonal/secondary buttons, selected chips, FAB. If none exists, use `primary` again. Do not invent one. |
| `surface` | The page / artboard background. Additional depths (cards, sidebars) → B6. |
| `gray` | Do not pass it at first. Pass it only if the generated grays are visibly different from the design's borders and secondary text. |
| `error` / `warn` / `success` / `info` | Destructive buttons, error-state fields, alert and status colors |

In the **CSS path**, all of these colors go to `create_palette`, which takes `gray` and the status colors. In the **Sass path**, `create_theme` takes only `primaryColor`, `secondaryColor`, and `surfaceColor`. To set `gray` or a status color, also call `create_palette` (or `create_custom_palette`). Put its output **after** the theme output, so that its `:root` palette variables override the generated variables.

**Seed-shade rule.** Ignite UI components paint their main fills with the **500** shade of a palette color. Pass the color that is *visible on the component* as the seed, whatever its name in the kit. Examples: Untitled UI buttons use `Brand/600`, Tailwind-style kits use `blue-600`, and Material 3 uses the tone-40 `primary`. If the buttons use `…/600` and you pass the kit's own `…/500` variable, every component is one step too light.

**Material baseline trap.** In the Ignite UI `material` schema, **control accents use the `secondary` palette**: contained-button fill, flat-button text, checkbox fill, and switch thumb. The navbar and tab indicators use `primary`. `fluent`, `bootstrap`, and `indigo` use `primary` for those controls.

Most third-party kits, including Material 3, paint buttons and checkboxes with their primary color. Thus, on a `material` baseline, also seed `secondary` with the brand color from the buttons. Seed `primary` with the color from app bars and tab indicators, which is frequently the same color. If you do not, every button shows an unrelated accent color. Check the resolved roles with `read_resource({ uri: "theming://guidance/colors/roles" })`.

When the variables are available, resolve their alias chains. Use them to *name* and *confirm* what the census found. If the variables and the census do not agree, use the census: it shows what the designer drew.

**Full ramps.** If the design visibly uses several shades of one color (hover, pressed, tinted backgrounds), use `create_custom_palette` with `mode: "explicit"` for that color. The explicit mode needs **all 14 shades** (`50`–`900` plus `A100`, `A200`, `A400`, `A700`). Align the kit's stops by lightness, not by label (Tailwind and Untitled UI have `25` and `950` stops that Ignite UI does not have). Derive the accent shades from the neighboring stops. Use `mode: "shades"` for every color whose ramp the design does not show.

**Dark variant.** Decide it from the page background, as in [Light vs Dark Mode Detection](#light-vs-dark-mode-detection). Material 3 tonal surfaces (`surface-container-low` … `-highest`) are multiple surface depths. Handle them with B6, not with a lighter `surface` seed.

### B3 — Typography

1. **Family:** take it from the text styles that the design uses (the design context `font-['…']` classes). Load it in the app. Kits frequently use Inter, Geist, Roboto Flex, or SF Pro. SF Pro is licensed for Apple platforms only. Use a different web font instead, and tell the user.
2. **Scale:** map the kit's ramp to Ignite UI type styles **by role and size ranking**, not by name. Override only the styles that differ (see [B4](#b4--button-casing-and-other-type-driven-anatomy) for the procedure):

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

The `material` and `indigo` type presets set `button` to `text-transform: uppercase`. `fluent` uses `capitalize`. Almost all current third-party kits, including Material 3, use sentence case. If the design does not show uppercase labels, set the button's text transform to `none`. Also set its measured size and weight.

**How to override type styles.** The theme's typography writes each property of each type style to a CSS variable on `:root`, named `--ig-<style>-<property>`. The components read those variables inside their shadow roots. Add a `:root` block **after** the theme import or theme output. In this block, set only the values that differ:

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

`set_roundness` sets a single `radiusFactor` (0–1) that interpolates each component between **its own** minimum and maximum radius. These ranges are different for each component. For example, the button range is 0–20px, the card 0–24px, the dialog 0–36px, and the chip 0–16px. Thus one factor cannot reproduce the radius style of a kit, such as "everything is 8px" or "pill buttons, 12px cards".

Instead, set the radius tokens of each component to the **measured px value**. Use the tokens that `get_component_design_tokens` returns (`border-radius`, or variants such as `box-border-radius` / `border-border-radius` on `input-group`). Set them in the same `create_component_theme` call as the component's colors. For a pill shape, use half the control height or a large value such as `9999px`.

### B6 — Surfaces and Elevation

- **Depths:** kits that use borders instead of shadows (shadcn, Untitled UI, Fluent 2) use 2–4 surface tones. Express them with `create_custom_palette` surface shades or semantic variables (`--surface-1`, `--surface-2`), as in [Multiple Surface Depths](#multiple-surface-depths).
- **Shadows:** `create_elevations` only has the `material` and `indigo` presets. If the design is flat or border-first, keep the global elevations. Set the components' shadow/elevation tokens to `none` or to the measured `box-shadow` value. If the design uses shadows, pick the closer preset. Then verify the depth of cards, menus, and dialogs in Phase 5.
- **Borders:** a 1px neutral border on cards, inputs, and menus is part of the anatomy of most modern kits. Set it through the components' border tokens, bound to a gray or surface palette variable.

### B7 — Density

Choose `--ig-size` **per component family**. Compare the measured height of each family (buttons, inputs, list rows, …) with that family's size steps in the baseline. Each component has its **own default step**. For example, on `material`, the button default is large (36px), and the input default is medium (48px). Thus a design with 36px buttons and 48px inputs already matches both defaults and needs no change. The steps (default in bold):

| Design system | Button small / medium / large | Input small / medium / large |
| --- | --- | --- |
| `material` | 24 / 30 / **36px** | 40 / **48** / 56px |
| `fluent` | 24 / **32** / 38px | 32 / **40** / 48px |
| `bootstrap` | 32 / **38** / 48px | 32 / **38** / 48px |
| `indigo` | 24 / **28** / 32px | 24 / **28** / 32px |

For other families, read the steps and the default from `get_component_design_tokens`. If the nearest step of a family differs from its default, call `set_size` with that `component`. Set `--ig-size` globally only when **every** family moves in the same direction.

If a 2–4px mismatch remains, close it with the component's padding or height tokens, if the component has them. If it does not, do not change the mismatch: Phase 5 rates a difference of 4px or less as Cosmetic. It is never an anatomy delta. The `set_spacing` rule does not change: never convert a Figma pixel value into a multiplier.

### B8 — States and Focus

Hover, pressed, disabled, and error variants in the kit are **token inputs**. Map their colors to the matching state tokens (`hover-background`, `focus-*`, `disabled-*`, …) in the same component theme. Focus rings are very different between kits (a 2–3px offset ring in shadcn and Untitled UI, a bottom accent in Fluent). If the design specifies a focus ring, set it in the component tokens. Always keep focus visible, whatever the design shows: accessibility is not optional.

---

## Global Palette Mapping

> These tables show Path A name patterns. For Path B, use them only to *label* a variable after the color census (B2) sets its role.

### Primary Color

| Figma Variable Pattern | Theming Input                 | Notes                                   |
| ---------------------- | ----------------------------- | --------------------------------------- |
| `color/primary`        | `primary` in `create_palette` | Use the resolved hex value              |
| `primary/500`          | `primary`                     | The 500 shade is the seed color         |
| `Primary/Default`      | `primary`                     | Alternative naming in some kit versions |
| `palette/primary/500`  | `primary`                     | Prefixed naming pattern                 |

> **Parameter names differ between tools.** `create_palette` takes `primary`, `secondary`, `surface`, `gray`, `info`, `success`, `warn`, `error`. `create_theme` takes `primaryColor`, `secondaryColor`, `surfaceColor`. Do not confuse them.

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

The gray scale comes automatically from the surface color. In dark themes, **gray is inverted relative to surface**. Do not pass gray unless the Figma grays are clearly different from the generated grays. Read `theming://guidance/colors/rules` before you override gray.

### Semantic Status Colors

| Figma Variable Pattern           | Theming Input | Notes    |
| -------------------------------- | ------------- | -------- |
| `color/success` or `success/500` | `success`     | Optional |
| `color/warning` or `warning/500` | `warn`        | Optional — the parameter is `warn`, not `warning` |
| `color/error` or `error/500`     | `error`       | Optional |
| `color/info` or `info/500`       | `info`        | Optional |

### Multiple Surface Depths

Designs frequently use two or three surface depths (page, panel, card) that a single generated `surface` cannot express. In that case:

- use `create_custom_palette` for explicit per-shade control, or
- define semantic variables (`--surface-1`, `--surface-2`) alongside the palette and use them in view CSS.

Never use a raw hex value in component styles for a second depth.

### Resolving Colors Back Out

Use `get_color({ color, variant, contrast, opacity })` to change a color intent into the correct `var(--ig-<family>-<shade>)` reference, including contrast colors and transparency. Do not write variable names by hand.

---

## Typography Mapping

| Figma Variable Pattern           | Theming Input                          | Notes                                 |
| -------------------------------- | -------------------------------------- | ------------------------------------- |
| `typography/font-family`         | `fontFamily` in `create_typography`    | Primary font                          |
| `typography/body/font-family`    | `fontFamily`                           | Body font family                      |
| `typography/heading/font-family` | `fontFamily`                           | Use if the heading font differs       |
| `font/primary`                   | `fontFamily`                           | Alternative naming                    |

`create_typography` also accepts `designSystem` (the type scale to start from). The generators currently ignore its `customScale` argument. Override individual type styles with the `--ig-<style>-<property>` variables instead (see [B4](#b4--button-casing-and-other-type-driven-anatomy)).

In a CSS-only project, apply typography as plain CSS `font-family` / `font-size` / `font-weight` rules, or use the CSS output of `create_typography`. **Do not emit Sass typography mixins into an app that has no Sass.**

The app must load web fonts (a `<link>` to the font provider or a local `@font-face`). If the browser cannot resolve a font family, it uses a fallback font without a warning, and Phase 5 fails.

---

## Spacing, Sizing, and Roundness — Do Not Map Directly

> **These tools are NOT equivalent to Figma spacing values.** Do not create a mapping between Figma pixel values and these tools.

`set_spacing` takes a **multiplier** (`1.0` = default, plus optional `inline` / `block` multipliers). `set_roundness` takes a `radiusFactor` between **0 and 1**. `set_size` takes a **density** (`small` / `medium` / `large`, or `1`–`3`). If you pass a Figma `spacing/md = 16` as `set_spacing({ spacing: 16 })`, the result is a 1600% increase.

### When to touch these tools (sparingly)

| Tool             | Use only when                                                                                                   | Never because                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `set_size`       | Path A: the design consistently uses a noticeably tighter or looser density than the design system default. Path B: per family, as in B7 | A Figma spacing variable has the name "compact"                  |
| `set_spacing`    | Explicitly requested, or required to match a specific density contract; start at the default                    | A Figma `spacing/*` pixel value looks like the multiplier number |
| `set_roundness`  | The user explicitly asks for it. For Path B, use per-component radius tokens instead (B5)                        | A Figma `border-radius/md = 8` maps numerically to a multiplier  |

### The correct adjustment path

Scope `--ig-size` and `--ig-spacing` to the component that needs them. Both tools take a `component` parameter (and `scope` for a sub-component or container selector) that generates this CSS:

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

The Indigo.Design kit's component proportions are already calibrated for each design system. Start from the defaults. Adjust them only when there is a clear visual reason.

**Path B differs.** A third-party kit's proportions are *not* calibrated to Ignite UI, so the defaults are not a safe final state. The prohibition still applies: never convert a px value into a multiplier. But make the **categorical** choices from measurements:

- Pick `--ig-size` from the nearest height step (B7).
- Set each component's radius token to the measured px value (B5).

These choices are not multiplier conversions. They use each tool the way it was designed.

---

## Light vs Dark Mode Detection

| Figma Signal                                             | Action                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Dark artboard background (`#121212`, `#1a1a1a`, similar) | `variant: "dark"` + the dark theme CSS (`themes/dark/<ds>.css`)          |
| Light artboard background (`#fff`, `#f5f5f5`, similar)   | `variant: "light"` + the light theme CSS                                 |
| Multiple artboards — one light, one dark                 | Ask the user which variant is primary. Generate it as the global theme and run Phase 5 against it. Then add the other variant (the other pre-built theme or a second theme output) under a class or `prefers-color-scheme`. When you switch at runtime, call `configureTheme` with the same design system and variant (see `theme-generation.md § 3c`). Validate it against its own artboard |
| `color/mode` variable present                            | Its value (`light` or `dark`) is the authoritative signal                |

The surface color must match the variant. A light surface with `variant: "dark"` makes components unreadable, and the palette tools give a luminance warning. Read the warnings.

---

## Design System Detection from Figma

> Use this table for Path A (Indigo.Design kits) only. For any other kit, choose the baseline with the anatomy rubric in [B1](#b1--choose-the-baseline-design-system-by-anatomy).

| Figma Visual Signal                                                | Likely Design System       | `designSystem` Value |
| ------------------------------------------------------------------ | -------------------------- | -------------------- |
| Three-layer `DROP_SHADOW` on elevation variables (`Shadow 01-03`)  | Material Design            | `"material"`         |
| Prominent layered shadows, rounded cards, ripple effects           | Material Design            | `"material"`         |
| Flat surfaces, sharp corners, Segoe/Inter font                     | Microsoft Fluent           | `"fluent"`           |
| Component borders, Bootstrap-like grid                             | Bootstrap                  | `"bootstrap"`        |
| Purple/indigo accents, rounded corners, single shadow              | Infragistics Indigo        | `"indigo"`           |
| `primary/500`, `primary/900` palette shade naming                  | Material (100–900 palette) | `"material"`         |

`create_elevations` accepts only `"material"` or `"indigo"` as its `designSystem`. For a Fluent or Bootstrap design, pick the closer of the two (usually `material`).

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

**Keys with no standalone Web Components selector in the theming tool:** do not call the theming tools for `action-strip`, `bottom-nav`, `column-actions`, `overlay`, `query-builder`, `time-picker`, `date-range-start`, `date-range-end`. (The `grid` theme derives `action-strip` and `column-actions`, so theme them through the `grid` theme.) Sub-part keys (`card-header`, `list-item`, `step`, `tab-item`, `accordion-header`, `expansion-panel-header`, `drop-down-item`, `nav-drawer-item`) also have no standalone selector. Style them through the parent's tokens, their documented `::part(...)`, or slotted content.

### Step 2: Discover the tokens

```
get_component_design_tokens({ component: "<theme key>" })
```

The result lists every token with its name, type, and description. For compound components, it also lists the **related themes** that you must also theme.

### Step 3: Match Figma variables to token names

> **Path B:** third-party kits rarely have component variables in this form, and Tier C files usually have none. Take the component's colors, radius, borders, and state colors from the Phase 1d color census and measurements (B2, B5–B8). If variables exist, use them only to confirm these values.

Kit component variables follow `<component>/<role>/<state>`:

- `button/background` → token `background`
- `button/foreground` → token `foreground-color`
- `chip/background/selected` → token `selected-chip-color`
- `grid/header-background` → token `header-background`
- `navbar/background` → token `background`

Lookup process:

1. Remove the component prefix.
2. Find the remainder in the token list.
3. If there is no exact match, pick the token whose description names the same visual role.

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

Pass **only tokens that differ from the global theme**. Express values as palette references, never as raw hex:

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

Apply the generated block exactly as the tool returns it. Use `selector` to scope an override to one region instead of every instance in the app.

### Step 5: Compound components

A compound component is a component whose `get_component_design_tokens` result lists related themes (for example, `combo`, `select`, the date pickers, `card`, `navbar`, `dialog`, `banner`, and the grids). Compound components render internal children with their own themes. Theme each related theme returned in Step 1, and use the parent's selector as the wrapper. If you style only the parent, dropdown surfaces, calendars, and action buttons stay off-theme. Phase 5 then fails.

---

## Chart Colors

Charts have no design tokens. Take the series colors from the Figma design context. Before you use them, call the theming MCP:

```
get_chart_series_colors({ chartType: "category-chart" })         // which properties accept a brush list
get_chart_series_colors({ customBrushes: ["#9DE772", "#6DB1FF"] }) // validate the Figma colors
get_chart_series_colors({ mode: "color-blind" })                  // accessible alternative palette
```

Assign the result to the chart's brush **properties**: `brushes` / `outlines` on most charts, `brush` on `igc-sparkline`, `fillBrushes` on `igc-treemap`, and `brushes` / `outlines` on each `igc-ring-series` of a doughnut chart. If you do not assign them explicitly, the chart uses its own default palette and does not match the design.

---

## Variable Resolution Priority

If more than one Figma variable can map to the same theming input, use this priority:

1. **Component-scoped variable** (e.g. `button/background`) → per-component token
2. **Semantic role variable** (e.g. `color/primary`) → global palette input
3. **Primitive variable** (e.g. `primary/500`) → global palette seed color
4. **Raw hex/rgb value** (no variable) → extract directly from the design context

---

## What to Skip

Do **not** call theming tools for:

- Chart, gauge, and map components → configure them through properties; get series colors from `get_chart_series_colors`
- Pure layout CSS (margins, grid columns, flex gaps) → write it directly in the view's styles
- Icon colors → set `color` on the `igc-icon` host or its parent

The theming tools **do** support Dock Manager: use the theme key `dock-manager` (selector `igc-dockmanager`), as for other components. It also exposes its own CSS custom properties.

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

---
license: MIT
name: igniteui-wc-generate-from-image-design
description: "Implement application views from design images (screenshots, mockups, wireframes) with Ignite UI Web Components. Use the igniteui-cli and igniteui-theming MCP servers for component discovery, theme generation, and best practices. WHEN TO USE: the user gives a design image and wants a working view from it, or asks to 'implement this design', 'build this UI', 'convert this mockup', or 'create a page from this image' in an Ignite UI Web Components project. WHEN NOT TO USE: the design source is a Figma file or URL (use figma-to-app), the user gives no image and needs only component suggestions (use choose-components), the task is only theming or restyling of existing views (use customize-component-theme), or the task is package installation/framework setup (use integrate-with-framework)."
user-invocable: true
---

# Implementing Ignite UI Web Components Views from Design Images

## MANDATORY AGENT PROTOCOL

Before you write implementation code, do these steps in this order:

1. Analyze the image and identify all visible regions and UI patterns.
2. Read [references/component-mapping.md](references/component-mapping.md) and [references/gotchas.md](references/gotchas.md).
3. This skill is Web Components-first. Check the package layout or licensing only when package choice, component registration, or theming depends on them.
4. To apply a theme, use the theming workflow from this skill and the dedicated `igniteui-wc-customize-component-theme` skill. Use the `igniteui-theming` MCP tools. Do not style from memory.
5. Call `get_doc` for every chosen component family before you use it.
6. Only then start to write code.

## Workflow

1. **Analyze the design image** - Read the image. Identify every UI section, component, and layout structure.
2. **Confirm package layout if needed** - Web Components packages are split by component family. Check the package layout or licensing only when package choice, component registration, or theming depends on them.
3. **Discover components** - Call `list_components` with targeted filters to find matching components for each UI pattern.
4. **Look up component docs** - Call `get_doc` for every chosen component family before coding.
5. **Generate theme** - (a) To generate a theme, first extract the colors. Create a color palette with `create_palette` or `create_custom_palette`, as the scenario requires. Then extract the elevations and call `create_elevations`. Then extract the typography and call `create_typography`. Then call `create_theme` when Sass is configured, or import the closest pre-built theme CSS. (b) After a theme exists, use design tokens or scoped semantic CSS variables instead of raw literals where possible. (c) For every Ignite UI component family that exposes design tokens, call `get_component_design_tokens`. Map the extracted image tokens to token roles. Then call `create_component_theme` with the component tokens that are different from the global theme.
6. **Implement** - Build the screenshot-first layout, data, and view components.
7. **Refine** - Use the `set_size`, `set_spacing`, `set_roundness` tools to refine the visual fidelity of the view against the image. Then change the implementation and theming again until the view closely matches the design.
8. **Validate** - Build, test, run, compare against the image, and fix differences.

## Step 1: Analyze the Design Image

Read the input image carefully. For each visual section, identify:

- **Layout structure**: grid rows/columns, sidebar, navbar, content area proportions, and estimated fixed widths or percentages for major regions.
> Note: Do not guess the exact CSS properties at this stage. Identify only the high-level structure and relative proportions. Do not try to fit the view into exact breakpoints or pixel values. Generate a flexible layout that keeps the observed proportions and adapts to different screen sizes. You refine the exact CSS rules in Step 8, after you build a first version of the view.
- **Component type**: chart, list, card, grid, form, navigation, etc.
- **Color palette**: primary, secondary, surface/background, accent, text colors.
- **Typography**: font sizes, weights, letter-spacing patterns.
- **Surface styling**: borders, border-radius, shadows, elevation, divider treatments.
- **Data patterns**: the mock data that the view needs (time series, lists, KPIs, tabular, scheduling).
- **Spacing system**: translate observed padding and gaps into a small reusable scale derived from the design.

Before you write code, create a decomposition table. Give each visible region one row with these columns:

| Region | Visual role | Candidate component | Custom CSS required | Data type |
|---|---|---|---|---|
| Example: sidebar item list | repeated rows with icon + label | `IgcListComponent` + `IgcListItemComponent` | yes - item height, icon size | domain-appropriate mock data |
| Example: top bar | brand + tabs + search | `IgcNavbarComponent` | yes - multi-zone slot layout | n/a |
| Example: side panel | always-visible navigation | `IgcNavDrawerComponent` | yes - width, item styling | n/a |

Start every region with the most applicable Ignite UI component from [references/component-mapping.md](references/component-mapping.md). First, try CSS overrides, tokens, slots, and documented `::part(...)` selectors. Use plain semantic HTML only when the component DOM structure is still fundamentally incompatible with the design. Write the reason for each plain-HTML fallback in a code comment.

Before you write code, write a compact implementation brief that includes:

- chosen components per region
- fallback HTML regions
- theme strategy
- package needs
- component registration needs
- major assumptions

After the table, translate the image into CSS Grid rows and columns first. Keep the desktop proportions before you add responsive behavior. Then define explicit breakpoint stacking rules for smaller screens.

## Step 2-3: Use MCP Tools for Discovery

This skill is Web Components-first. Check the package layout or licensing only when package choice, component registration, or theming depends on them.

- The project can be unlicensed or use the trial package layout. In that case, do not mark documented trial packages as blocked or licensed-only during implementation.
- If the result shows a licensed package layout, use the licensed import paths from the component reference when necessary.

Then, to find the components that match each UI pattern, call `list_components` with `framework: "webcomponents"` and relevant filters. Common filters:

- `chart`, `sparkline` - for data visualization
- `list view`, `card`, `avatar`, `badge` - for data display
- `nav`, `navbar`, `drawer`, `dock manager` - for navigation and shell layouts
- `progress` - for metrics
- `grid lite`, `data grid`, `tree grid` - for tabular data
- `calendar`, `date picker`, `combo`, `select`, `input` - for forms and scheduling

Use narrow search terms to get fewer unrelated MCP results. Search for the specific UI pattern that you need, for example `list view` instead of `list`.

For component-to-Ignite-UI mapping, see [references/component-mapping.md](references/component-mapping.md).

## Step 4: Look Up Component API

Before you write code, use both tools for every chosen component category:

- **Usage patterns, HTML examples, slots, registration** → `get_doc({ framework: "webcomponents", name: "<doc-name>" })` — use the `name` field from `list_components`, not the display title
- **Full property/method/event API** → `get_api_reference({ platform: "webcomponents", component: "<ClassName>" })` — use `search_api` first to find the exact class name if needed

Call `search_docs` for feature-based questions (for example, "how to configure [component] for [specific behavior or styling need]").

## Step 5: Generate Theme with MCP

Use this skill for the image-to-view theming workflow only. The dedicated [`igniteui-wc-customize-component-theme`](../igniteui-wc-customize-component-theme/SKILL.md) skill is the primary reference for palette-token behavior, global theme rules, and general theming-system guidance.

### 5a - Existing app guard (always run first)

Before you generate theme code, examine the entry point and main stylesheet(s) of the project (usually `main.ts`, `main.js`, `index.ts`, `app.ts`, `styles.css`, or the main theme stylesheet of the app). Look for:

- an imported pre-built theme CSS file such as `igniteui-webcomponents/themes/light/material.css`
- existing palette tokens or semantic CSS variables already exposed by the app
- existing app-level typography or elevation variables already exposed by the app

- **Existing theme found** -> the global theme is already set. Do **not** call `create_palette` unless the user explicitly wants a global theme change. Instead:
  1. Examine the existing theme import, palette definition, and any exposed semantic CSS variables.
  2. Reuse the current design system, variant, and palette tokens wherever they already match the design image.
  3. Skip to **5c** and apply only minimal scoped overrides for the components of the new view.
- **No theme found / blank theme setup** -> continue with **5b** to generate a new CSS-based theme baseline.

### 5b - Global theme generation (new projects only)

Follow this order - MCP guidance first, image extraction second:

1. **Read MCP guidance first** - call `theming://guidance/colors/rules` (or `get_theming_guidance`) before you look at the image. The guidance gives the available theme inputs and any luminance or variant constraints.
2. **Resolve the design system** - find it from the existing workspace, an explicit user request, or the closest visual match in the design. Do not assume a design system if a stronger signal exists.
3. **Extract from the image** - you now know the available slots. Extract values only for the inputs that you need.
4. **Call `create_palette` or `create_custom_palette`** with the extracted seed values:

```
create_palette({
  primary: "<color extracted from image for primary slot>",
  secondary: "<color extracted from image for secondary slot>",
  surface: "<color extracted from image for surface/background slot>",
  variant: "<resolved theme variant>",
  platform: "webcomponents"
})
```

Import the closest built-in theme CSS for the resolved design system and variant. Then use `get_color` to translate the generated palette into CSS custom properties, semantic app tokens, and component token values. Apply typography decisions with standard CSS `font-family`, `font-size`, and `font-weight` rules. Apply elevations with CSS box-shadow values or semantic shadow variables.

Read all returned luminance warnings and make the necessary changes. The design can need multiple surface depths that one generated surface color does not cover. In that case, use `create_custom_palette` or define semantic CSS variables for the additional depths in the main stylesheet.

Use `create_palette` for designs with a small, coherent color system. Use `create_custom_palette` when the design has multiple distinct surface depths or several accent families. Also use it when the generated palette cannot reliably match the screenshot.

### 5c - Per-component token discovery and mapping (always run)

> **Scope:** This step applies to every Ignite UI Web Components family that exposes design tokens. The primary targets are the core components: cards, inputs, select, combo, navbar, nav drawer, list, tabs, date pickers, chips, and others. Some packages or components do not expose a practical token surface in the current project. For them, use documented properties, `::part(...)` selectors, or wrapper styles. Do not invent unsupported tokens.

For **every** chosen Ignite UI component family in Steps 3-4, follow this MCP-first loop. Query MCP before you look at the image:

1. **Discover (MCP first)** - call `get_component_design_tokens(component)` before you look at the image for that component. Read the full token list with names, types, and descriptions. Identify the tokens that correspond to visible surfaces, text, borders, icons, and interaction states.
2. **Extract (image second)** - you now know the exact token names. Go to the image region for that component. Read the exact token value for each relevant token slot. Do not guess. Zoom into the component region.
3. **Generate** - call `create_component_theme(component, platform, licensed, tokens)`. Give it only the tokens whose resolved value is different from the global theme. The result is the minimal set of scoped theme overrides for the component.

**Example - theming a grid:**
- `get_component_design_tokens("grid")` returns `header-background`, `content-background`, `row-hover-background`, and many other tokens.
- Look at the grid region in the image -> extract the color intent for header, row background, and hover state.
- Resolve each value to a palette token or local semantic CSS variable.
- Call `create_component_theme("grid", ...)` with only `{ "header-background": "<resolved token>", "content-background": "<resolved token>", "row-hover-background": "<resolved token>" }`.

Apply the generated theme blocks to the component selector or a scoped wrapper exactly as the `create_component_theme` output shows.

Do not run `create_component_theme` for regions that use only custom HTML/CSS.

### 5d - Theming sequence summary

Apply in this exact order:

1. Examine the entry point and main stylesheet(s) -> existing theme or blank?
2. Create or update a theme baseline: pre-built theme import plus palette-backed CSS variables and token overrides (Step 5b)
3. For each Ignite UI component: `get_component_design_tokens` -> map image design tokens -> resolve values to design tokens or semantic CSS variables -> `create_component_theme` (Step 5c)
4. Use `get_color` after palette generation whenever a palette token can represent the final color intent

Use standard CSS `font-family` lists in stylesheets or CSS variables for typography. Do not write Sass typography mixins for Ignite UI Web Components apps.

## Step 6: Install Required Packages

General UI components are in `igniteui-webcomponents`. For lightweight tabular data, you can use `igniteui-grid-lite`. Advanced grids, dock manager, and charts require additional packages. These packages can be different for the trial and the licensed package layout. Resolve the selected component families against the current workspace and [references/component-mapping.md](references/component-mapping.md).

After you select the packages, register only the custom elements that you use. Use `defineComponents(...)` in the applicable entry point or setup module. Do not do this if the host framework integration already handles registration differently. Use [`igniteui-wc-integrate-with-framework`](../igniteui-wc-integrate-with-framework/SKILL.md) when framework-specific setup details are important.

If required packages are missing, first identify the exact packages and versions that are required. Then ask for approval before you install packages or change dependency manifests.

## Step 7: Implement

### Structure

- **Layout**: use Ignite UI layout and data-display components as the starting point for standard regions. Then apply CSS Grid/Flexbox and component overrides to match the screenshot. Use plain semantic HTML only when an Ignite UI component is still structurally incompatible after a genuine attempt.
- **Data**: use typed mock data that matches the density and domain of the design. Add models/services only when they help the implementation.
- **View**: keep layout, spacing, typography, and surface styling in CSS, not in inline attributes.
- **Theming**: apply the resolved design system and theme variant from Step 5. Keep color usage aligned with palette tokens or local semantic CSS variables.

### Implementation Checks

- Follow repo conventions from `.github/copilot-instructions.md` and `.github/CODING_GUIDELINES.md`.
- Use [references/component-mapping.md](references/component-mapping.md) for component-choice and semantic-fallback rules.
- Use [references/gotchas.md](references/gotchas.md) for component, theming, registration, and API edge cases. Do not repeat those rules inline.
- Use Ignite UI components instead of custom HTML when both approaches can give similar visual fidelity.
- Register only the custom elements that you use. Put the registration in the existing entry-point pattern of the project.
- Use slots, parts, and documented component APIs before you try shadow-DOM workarounds.
- Keep the spacing, hierarchy, and data density before you add extra interactivity.
- Do not use generic placeholders when the image shows domain-specific content.
- When the image is ambiguous, write down short assumptions. Do not guess silently.

## Step 8: Refine

After the first implementation pass, use the `set_size`, `set_spacing`, and `set_roundness` tools to adjust the visual properties of the view. Make the view match the image more closely. Start with the most visually distinctive elements (for example, panel proportions, chart shape, button prominence). Then tune the smaller details (for example, row heights, spacing between regions).

## Step 9: Validate

Use this validation loop:

1. Build
2. Test
3. Run the app
4. Visually compare against the image
5. Adjust and repeat

In terminal-only environments, the user does the visual comparison and gives feedback about mismatches. Do the visual check yourself only when the environment gives the agent browser and screenshot capabilities.

Use this checklist during the first visual comparison:

- panel proportions
- control density
- chart shape
- legend placement
- button prominence
- row heights
- spacing between regions

During the build/test steps, fix TypeScript, registration, markup, or build errors immediately. To remove the remaining differences, use the build output, component docs, [references/gotchas.md](references/gotchas.md), and the visual feedback from the user. Typical adjustments include:

- revisiting chart data density, smoothing, or marker visibility
- adjusting layout ratios, region spacing, or row heights
- correcting navigation mode, panel chrome, package choice, or component choice
- tuning theme tokens, component overrides, and dark-surface hierarchy
- re-examining the original design for overlooked sections or missing registration/imports

After the build completes with zero errors, refine the layout proportions, color values, missing sections, and typography until the view closely matches the design.

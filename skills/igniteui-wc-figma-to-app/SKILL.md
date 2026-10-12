---
license: MIT
name: igniteui-wc-figma-to-app
description: "Builds Ignite UI Web Components views from Figma designs. Supports Indigo.Design kits, third-party kits (Material 3, Fluent 2, shadcn/ui, Untitled UI, in-house), and plain frames. Uses the Figma, Ignite UI CLI, Ignite UI Theming, and Playwright MCP servers. WHEN TO USE: implementing a Figma design, artboard, or Figma URL with Ignite UI Web Components, including inside React, Angular, or Vue apps. WHEN NOT TO USE: screenshots or mockups without a Figma file (use igniteui-wc-generate-from-image-design), component selection or theme-only changes (use igniteui-wc-choose-components or igniteui-wc-customize-component-theme), or the native Ignite UI for Angular or Blazor packages."
user-invocable: true
---

# Ignite UI for Web Components — Figma to App

Translate Figma app screens into production Web Components applications built with Ignite UI. The skill accepts designs from three kinds of source. A single file often mixes them, so classify every component separately (Phase 1f):

| Tier | Source | How it maps to Ignite UI |
| --- | --- | --- |
| **A** | The Infragistics **Indigo.Design UI Kits** (Material, Fluent, Bootstrap, Indigo variants, light and dark) | Directly, by kit layer name. The kit variant *is* the Ignite UI design system. |
| **B** | Any other component library: public kits such as Material 3, Fluent 2, Bootstrap, shadcn/ui, Untitled UI, or Ant, and in-house design systems | The skill normalizes the variant properties to a canonical role, then maps the role. It fits the theme to the closest baseline design system. |
| **C** | Plain frames, groups, and detached instances | The skill infers the role from structure and visuals, with lower confidence. The user confirms the role. |

Tier A gives the highest fidelity for the least effort. For Tiers B and C, token overrides give high fidelity. Do not hide the remaining **anatomy deltas** (structural differences between the design's components and Ignite UI's). Record them for the user to approve.

> **Web Components ≠ Angular.** The frameworks share the kits, but not the implementation. The tags are `igc-*`. You must register components with `defineComponents(...)`. Theming is **CSS-custom-property-first** (Sass is optional). Every component renders in **shadow DOM**, which changes how you style and how you measure. Each phase identifies these differences.

---

## Required Workflow

Complete all phases in order. Do not skip phases, and do not generate component code from memory. Take every tag name, attribute, slot, and import path from `get_doc` / `get_api_reference` results. The reference files of the sibling `igniteui-wc-choose-components` skill are also a valid source. Never guess these values.

Read each reference file before the phase that uses it:

- [references/project-setup.md](references/project-setup.md): before Phase 0b (and its layout section in Phase 4)
- [references/figma-exploration.md](references/figma-exploration.md): before Phase 1
- [references/design-provenance.md](references/design-provenance.md): before Phase 1f
- [references/asset-extraction.md](references/asset-extraction.md): before Phase 1h
- [references/figma-component-map.md](references/figma-component-map.md): before Phase 2
- [references/theme-generation.md](references/theme-generation.md): before Phase 3
- [references/design-token-bridge.md](references/design-token-bridge.md): before Phase 3
- [references/validation-patterns.md](references/validation-patterns.md): before Phase 5

---

## Phase 0 — Prerequisites

> **Tool naming:** this skill writes MCP tool names as `<server>_<tool>` (for example, `figma_get_metadata`, `theming_create_theme`). The exact name depends on the client. Claude Code shows them as `mcp__<server>__<tool>` (for example, `mcp__figma__get_metadata`). Find each tool by its base name on the connected server.

### 0a: Verify All Four MCP Servers

Run these checks **silently** in parallel. If a server is not connected, its verification call does nothing. Do not show raw errors to the user at this step.

| Server                | Verification call                                   | Success signal                   |
| --------------------- | --------------------------------------------------- | -------------------------------- |
| **Figma**             | Inspect the Figma tools (no call — quotas are small) | The tools are listed. The configured server URL (or `fileKey` in the tool schema) shows if the server is remote or desktop |
| **Ignite UI CLI**     | `list_components` with `framework: "webcomponents"` | Returns component list           |
| **Ignite UI Theming** | `theming_detect_platform`                           | Returns `webcomponents` platform |
| **Playwright**        | `playwright_browser_navigate` to `about:blank`      | Navigates without error          |

If **any server fails**, fix the setup **for that server only** before you continue. Configure `igniteui-cli` and `igniteui-theming` yourself: run `npx -y igniteui-cli ai-config` (or `ig ai-config`) from the project root. This command configures both servers. Also add a missing Playwright entry yourself.

The Figma servers need the user's action, so guide the user through the Figma setup. The user enables the desktop server in the Figma desktop app, and signs in to the remote server through Figma OAuth. [references/mcp-setup.md](references/mcp-setup.md) has the full setup instructions for all servers. The tools of a newly configured MCP server appear only after an editor/session reload. Ask the user to reload, then stop.

### 0b: Detect or Scaffold a Web Components Project

Check whether the working directory contains a `package.json` that lists `igniteui-webcomponents`, and a `src/` entry module.

- **Project found:** note the package layout. `igniteui-webcomponents` is MIT, and grids, charts, and dock manager come as trial or `@infragistics` licensed packages. Note the host setup (plain Lit/vanilla, or a React/Angular/Vue wrapper). Note whether Sass is configured, because it decides the Phase 3 output format. Make sure that the MCP configuration has all four server entries.
- **No project found:** offer to scaffold a project with `npx -y igniteui-cli new`, or to use an existing project directory. Wait for the user's choice.

Read [references/project-setup.md](references/project-setup.md) for the detection checklist, the exact messages to show the user, template selection, and the scaffolding steps.

---

## Phase 1 — Figma Design Exploration

**Goal:** understand the full design structure, and capture all data for implementation and validation before you write code.

Read [references/figma-exploration.md](references/figma-exploration.md) in full before the first Figma MCP call. It contains the call budget and how to identify the two Figma servers. It also contains the exact tool arguments, the extraction checklists, and the table templates for each step:

| Step | What to do |
| ---- | ---------- |
| **1a** | Find the pages and artboards with `figma_get_metadata`. Record the width and height of each target artboard. Phase 5 resizes the browser to these dimensions |
| **1b** | List the artboards. Wait for the user to choose the artboards to implement |
| **1c** | Capture one reference screenshot for each artboard. The screenshots are the ground truth for Phase 5 |
| **1d** | Extract the design context for each artboard: layers and variant props, layout, typography, surfaces, input variants, chart colors, color census, control heights, action controls, provenance signals |
| **1e** | Extract design tokens with `figma_get_variable_defs`, once per target page |
| **1f** | Classify the provenance of every component (Tier A Indigo.Design kit / B other library / C plain frames). Normalize it to a canonical role. Check the Code Connect mappings |
| **1g** | Build Table A (Ignite UI components, with tier, confidence, token work, and suspected anatomy deltas) and Table B (layout surfaces). Show both tables to the user for review, with low-confidence mappings first |
| **1h** | Extract every image asset to the assets directory of the project (zero-placeholder policy) |

Key constraints:

- **Rate limits:** the limits depend on the Figma **seat**. A View/Collab seat allows 6 calls a month (20 on Starter). This quota possibly does not cover one artboard. Before you start, compare the call estimate with the user's quota. Use `figma_get_metadata` first to find the structure.
- **Two Figma MCP servers:** the **remote** server (`mcp.figma.com`) takes `fileKey` and `nodeId`, so you can move between artboards yourself. The **desktop** server (`127.0.0.1:3845`) works only on the file that is open in the Figma desktop app. With the desktop server, pass the node ID from a frame link and check the response. Alternatively, ask the user to select each artboard, and do not batch those calls.
- **Any UI kit:** do not assume the Indigo.Design kits. Classify each component in 1f. A third-party kit's names, variables, and Code Connect mappings are evidence of the component's role. Never copy them into the code.
- **React + Tailwind output:** `figma_get_design_context` returns React + Tailwind code. Read it for information only. Never copy it into the project, and never use its asset URLs as final assets.

---

## Phase 2 — Component Discovery (Ignite UI CLI MCP)

**Goal:** find the exact tags, attributes, slots, events, and registration requirements for every component from Phase 1. Never generate component code from memory.

### 2a: Read the Component Map

Read [references/figma-component-map.md](references/figma-component-map.md) in full. For each row of the Phase 1g Table A:

- **Tier A:** find the Indigo.Design kit name in the kit tables.
- **Tier B/C:** find the canonical role in the **Canonical Role Index**, then the row it points to in the named section.

That row gives the tag, the component class, the package, and a `get_doc` starting point. It also gives the key attributes and slots that you set most frequently from Figma variants.

### 2b: Fetch Component Docs

> **Doc names are not tag names** (`navigation-drawer`, `text-area`, `data-grid`, `overview` for combo). Never guess a doc name. See `figma-component-map.md § Doc-name rules you will hit immediately`.

Call `list_components({ framework: "webcomponents" })` **once** to get the live catalog, then:

- Find the exact doc `name` of each component in that list. Then call `get_doc({ framework: "webcomponents", name: "<doc-name>" })` for all components in a single parallel batch. Never make these calls sequentially. `get_doc` gives usage patterns, HTML examples, and slot names.
- For the full property/method/event API, call `get_api_reference({ platform: "webcomponents", component: "<ClassName>" })`. If you do not know the exact class name, use `search_api({ platform: "webcomponents", query: "<keyword>" })` first. Use the `section` or `member` parameters to keep the responses small.
- When necessary, use `get_project_setup_guide({ framework: "webcomponents" })` to confirm registration, theme import, and package wiring.

Do **not** write any component markup until you have read its doc or API entry.

### 2c: Search for Feature Docs

Use `search_docs` for feature-level questions about the artboard, for example:

```
search_docs({ framework: "webcomponents", query: "grid row editing" })
search_docs({ framework: "webcomponents", query: "grid virtualization" })
search_docs({ framework: "webcomponents", query: "column pinning" })
```

Feature docs are mandatory when the artboard shows grid editing, filtering, sorting, pinning, or other advanced feature states.

### 2d: Document the Final Component Plan

After you read all docs, confirm or revise the Phase 1g table with:

- Exact tags (for example, `<igc-grid>`, `<igc-navbar>`) and component classes
- The **package** of each component. For the commercial packages (grids, charts, dock manager), record whether the project uses the trial package or the `@infragistics` licensed package
- The **registration** that each component needs. See the registration cheat sheet in `figma-component-map.md` (`defineComponents(...)`, `IgcXxxComponent.register()`, `IgcGridLite.register()`, `ModuleManager.register(...)`, and `defineComponents` from `igniteui-dockmanager`)
- Any additional theme CSS that a package requires (the grid packages have their own theme CSS)

**Anatomy delta ledger (Tier B and C).** The anatomy of some mapped components differs from the design. If tokens, `::part(...)`, or slotted content **cannot** close the difference, add a ledger entry:

| Component | Design shows | Ignite UI renders | Options | Decision |
| --- | --- | --- | --- | --- |
| _e.g._ Text fields (shadcn) | Label above the field | Label above (baseline `bootstrap`) | — | none needed |
| _e.g._ M3 segmented button | Check icon on the selected segment | `igc-toggle-button`, no check icon | Slot an `igc-icon` in the selected item / accept | ask |
| _e.g._ Bottom sheet | Sheet sliding from the bottom | No sheet component | `igc-dialog` styled / custom markup | ask |

Do not add ledger entries for differences that tokens *can* close. Color, radius, border, casing, height, and spacing are implementation work, not deltas. For every interactive control, the Ignite UI component with a recorded delta is better than hand-built markup. The keyboard, focus, ARIA, and form behavior of the component are more important than a pixel-exact but inert copy. Phase 5 classifies approved entries as **Accepted**.

If you need new packages (including an icon package for a third-party kit), identify the exact packages and versions. Then **ask for approval before installing**. Show this updated plan, with the ledger, to the user. Wait for confirmation before Phase 3.

---

## Phase 3 — Theme Generation (Ignite UI Theming MCP)

**Goal:** produce theming code that matches the visual language of the Figma design. Use the kit variables from Phase 1e (Path A), or the color census and measurements from Phase 1d (Path B).

Read [references/theme-generation.md](references/theme-generation.md) and [references/design-token-bridge.md](references/design-token-bridge.md) in full before you run a theming tool. The steps are:

| Step | What to do |
| ---- | ---------- |
| **3a** | Inspect the entry point and the global stylesheet. The starter theme of the CLI scaffold counts as no theme. Reuse the app's own theme only if its variant, design system, and primary color all match the design. Otherwise, ask before you change it |
| **3b** | Use the dominant Phase 1f tier to choose the path. **Path A** (Indigo.Design kits): use the strict precedence order to resolve the design system. **Path B** (other kits or none): choose the closest baseline. Use the user's request, then the kit's direct counterpart, then input label placement, then control heights. In a mixed file, count only the rows that map to a component |
| **3c** | CSS path: import the pre-built theme for the design system and variant. Then add `theming_create_palette` overrides. Sass path: make one `theming_create_theme` call (plus `theming_create_palette` for `gray` or status colors). **Path B:** seed the palette from the color census. Then use `--ig-<style>-<property>` CSS variables to override the type styles that differ (including button casing). Do not use `customScale`: `theming_create_typography` accepts it, but its generators ignore it |
| **3d** | Map the per-component tokens for every Ignite UI component in the plan. Always pass `designSystem` and `variant`. Path B also sets radius, border, shadow, and state tokens. It also uses the measured heights to choose `--ig-size` for each component family |
| **3e** | Validate the chart series colors with `theming_get_chart_series_colors`. Assign them to the brush properties of the chart (`brushes`/`outlines`; `brush` on sparkline, `fillBrushes` on treemap, the ring series on doughnut) |

Key constraints:

- **Output format:** CSS is the default. Use Sass only when the project is configured for it. Never use the Angular-only `core()` / `theme()` mixins.
- `theming_create_palette` takes `primary`/`secondary`/`surface`/`gray`/`success`/`warn`/`error`/`info` and `variant`. `theming_create_theme` takes `primaryColor`/`secondaryColor`/`surfaceColor` (no `gray`).
- `theming_create_elevations` takes `designSystem` (`material` or `indigo`). It has no `preset` parameter.
- Never use the font name as the primary design-system signal.
- Never convert Figma pixel values into `theming_set_spacing` or `theming_set_roundness` multipliers. `--ig-size` is different: it is a size step (`small` / `medium` / `large`), not a multiplier. Path A keeps the default. Path B chooses the nearest step for each component family (3d).
- **Path B:** seed the palette with the color painted on the component, not the variable named `…/500`. On a `material` baseline, buttons, checkboxes, and switches use `secondary`. Thus, seed the secondary color with the button color.

---

## Phase 4 — Implementation

**Goal:** build the view(s) that match the artboard decomposition from Phase 2.

### Implementation Rules

1. **Never generate component markup before you read its doc or API entry.** Use the `get_doc` result, or the skill reference file when the catalog has no doc (Phase 2b).
2. **Section by section** — layout → navigation → primary content → secondary → data.
3. **Register every custom element that you use, once, in the correct place.**
   ```typescript
   import { defineComponents, IgcNavbarComponent, IgcCardComponent } from 'igniteui-webcomponents';
   defineComponents(IgcNavbarComponent, IgcCardComponent);
   ```
   Grids use `IgcGridComponent.register()`, and Grid Lite uses `IgcGridLite.register()`. Charts and gauges use `ModuleManager.register(IgcCategoryChartModule, …)` from `igniteui-webcomponents-core`. The dock manager uses `defineComponents(IgcDockManagerComponent)` from `igniteui-dockmanager` (trial) or `@infragistics/igniteui-dockmanager` (licensed). In a framework-wrapped app, follow [`igniteui-wc-integrate-with-framework`](../igniteui-wc-integrate-with-framework/SKILL.md) instead. If you register components that you do not use, the bundle becomes larger (see [`igniteui-wc-optimize-bundle-size`](../igniteui-wc-optimize-bundle-size/SKILL.md)).
4. **Respect the shadow DOM boundary.** Page CSS does not reach the internals of a component. Use these methods in this order of preference: component **design tokens** (Phase 3d) → documented `::part(...)` selectors → slotted content that you style yourself. Never target internal class names. CSS custom properties **do** inherit through shadow roots. For this reason, all color work goes through palette variables.
5. **Slots, not attributes, carry content.** `igc-list-item` uses `start` / `title` / `subtitle` / `end`. `igc-navbar` uses `start` / `end`. `igc-card` contains `igc-card-header`, `igc-card-content`, `igc-card-actions`, `igc-card-media`. Before you write markup, confirm the slot names from `get_doc`.
6. **Bind non-primitive values as properties, not attributes.** Assign arrays, objects, and functions (grid `data`, chart `dataSource`, combo `data`) on the element (`.data=${rows}` in Lit, `el.dataSource = rows` in plain JS). A serialized attribute fails silently. Also assign chart brushes as properties.
7. **Events are `igc*`-prefixed** (`igcChange`, `igcInput`, `igcClosing`, …). Take the exact names from `get_api_reference`. There is no two-way binding.
8. Use CSS Grid first to match the Figma frame proportions. Add Flexbox for sub-regions.
9. Apply theming through the tokens and palette variables from Phase 3. Do not put raw hex values in view code.
10. Use typed mock data that matches the design's density and domain.
11. Keep layout, spacing, and typography in stylesheets (or the component's `static styles`), not in inline styles.
12. **Input variants:** the Indigo.Design kits have `line` / `box` / `border` input types. Web Components have a single boolean **`outlined`** attribute on `igc-input`, `igc-textarea`, `igc-select`, `igc-combo`, `igc-date-picker`, `igc-date-range-picker`, and the other input-base components. Map `_Input/Border` → `outlined`, and map `_Input/Line` and `_Input/Box` → default (no `outlined`). For other kits, map the normalized style: **outlined** → `outlined`; **filled** / **underlined** → default. Label placement comes from the baseline design system (3b), not from an attribute.

    There is **no** global injection token equivalent, so set the attribute on each control. Close any remaining gap with `input-group` component tokens, not with internal CSS.
13. **Layout surfaces:** every entry in the Phase 1g Table B (Layout Surfaces) needs a CSS class. Give the class the recorded `background`, `border-radius`, `padding`, `border`, and `box-shadow`. If the Figma surface has a background, never leave the section transparent. If a section floats on the page background in the design, never add a background to it.
14. **Implement only controls that appear in the Figma artboard.** Do not add toolbar buttons, actions, or UI elements that are not in the design context output for that artboard. This rule also applies when they look useful.
15. After each major section, check it in the browser if the dev server is running.

### Layout and File Structure

Translate the Figma frame dimensions into CSS Grid first. Match the desktop proportions before you add breakpoints. Put each view where the project expects it. [references/project-setup.md § Implementation Layout](references/project-setup.md#implementation-layout) has the grid pattern, the Lit host-display pitfall, and the per-view file layout.

---

## Phase 5 — Visual Validation (Playwright MCP)

**Goal:** measure the running app and compare it with the Figma reference screenshots from Phase 1c. Use the measurement-driven loop: compare numbers, not impressions.

Read [references/validation-patterns.md](references/validation-patterns.md) in full before you run a Playwright tool.

### 5a: Ensure the Dev Server Is Running

If you do not know the local dev URL, ask the user for it (Vite default: `http://localhost:5173`).

```
playwright_browser_navigate({ url: "http://localhost:5173" })
playwright_browser_console_messages()   // check for startup errors
```

An unregistered custom element fails silently. It renders as an empty inline box, and the console shows no error. If a section is missing, check `defineComponents` first.

### 5b: Match Viewport to Artboard Dimensions

```
playwright_browser_resize({ width: <artboard.width>, height: <artboard.height> })
playwright_browser_navigate({ url: "<target route>" })  // re-navigate after resize
```

> **Always re-navigate after resize.** The browser can reset to `about:blank` when the viewport changes. This is a known Playwright MCP problem.

### 5c: Capture and Compare Screenshots

For **each target artboard** (run the full 5c–5f loop once per page):

1. Navigate the browser to the corresponding route.
2. Take a browser screenshot:
   ```
   playwright_browser_take_screenshot({ type: "png" })
   ```
3. Do a **section-by-section** comparison with the Phase 1c reference file: top bar → sidebar → **every section in the Phase 1g Table B** → footer.
4. Do **not** go to the next artboard until only Cosmetic and Accepted items remain on the current artboard.

### 5d: Measure Computed Styles

Use `playwright_browser_evaluate` to get exact values for each section with visible differences. **You must also do this for every entry in the Phase 1g Table B.** Pass the code as a **plain JavaScript function string** in the `function` parameter.

> **Shadow DOM changes every measurement.** `document.querySelector('igc-card .title')` returns `null`, because the inner nodes are in a shadow root. Measure the host element for box metrics. For internals, pierce the shadow root with `el.shadowRoot.querySelector(...)` (or `::part` targets). `references/validation-patterns.md` has a reusable deep-query helper. Use it, not ad-hoc selectors.

Run the three mandatory audits from `validation-patterns.md` on every page. Compare all returned values with the Figma spec from Phase 1d:

- **Surfaces audit** — every Table B section has the recorded background (or no background, when it floats on the page). Each section encloses the children that Figma shows inside it.
- **Action controls audit** — every visible control, shadow roots included, is in the Phase 1d inventory. Any other control is fabricated. Remove it.
- **Registration audit** — every `igc-*` tag on the page is a defined custom element.

### 5e: Classify and Report Mismatches

| Severity     | Category        | Example                                   | Action                      |
| ------------ | --------------- | ----------------------------------------- | --------------------------- |
| **Critical** | Missing element | Button in Figma, absent in code           | Fix                         |
| **Major**    | Wrong component | Figma shows dropdown, code has text input | Fix                         |
| **Major**    | Token-fixable   | Wrong color shade, radius, border, casing, or height > 4px | Fix             |
| **Minor**    | Spacing off     | 24px gap in Figma, 16px in code           | Fix                         |
| **Cosmetic** | Rounding only   | `rgb(51, 51, 51)` vs `#333333`; ≤ 4px size | Report only                |
| **Accepted** | Approved delta  | A ledger entry the user approved          | Report only; not a retry    |

`validation-patterns.md § Mismatch Severity Classification` has the full table and the definitions. A visibly different color is Major, not Cosmetic. **Accepted** needs the user's approval of a ledger entry. The entry comes from Phase 2d, or you add it during Phase 5.

For each mismatch, write this report:

```
ISSUE: <description>
LOCATION: <section or component>
FIGMA: <spec value>
RENDERED: <measured value>
SEVERITY: <Critical / Major / Minor / Cosmetic / Accepted>
FIX: <specific code change>
```

### 5f: Apply Corrections

Fix Critical, Major, and Minor issues. After you apply the fixes, re-navigate and take a new screenshot to confirm them:

```
playwright_browser_navigate({ url: "<target route>" })
playwright_browser_take_screenshot({ type: "png" })
```

Repeat the measure → fix → re-verify loop until only Cosmetic and Accepted items remain.

### 5g: Accessibility Snapshot

```
playwright_browser_snapshot()
```

Check that:

- Interactive elements have accessible labels (slotted icon-only buttons need `aria-label`)
- Headings follow a logical hierarchy
- Navigation landmarks are present

---

## Critical Rules

- **Phase 0 is not optional.** Never skip MCP verification. Before Phase 1, identify which Figma MCP server is connected.
- **Classify provenance per instance (Phase 1f).** Do not assume the Indigo.Design kits. A third-party kit's names and variables are evidence to normalize, not to copy.
- **Never import from Code Connect of another library.** Code Connect snippets that point to shadcn, MUI, or an in-house package confirm the role only. The code is always Ignite UI.
- **Seed the palette from usage on Path B.** Use the color painted on the component, not the variable named `…/500`. On a `material` baseline, controls use `secondary`.
- **Record in the ledger what tokens cannot fix. Fix what tokens can fix.** Send structural anatomy deltas to the user in Phase 2d. Fix color, radius, casing, and height mismatches.
- **Phase 2b before code.** Never write a tag, attribute, or slot that you did not read in a doc or API entry. When no doc exists, use the skill reference file. Doc names are not tag names.
- **Register what you use.** An unregistered element fails silently.
- **Phase 1c screenshots are immutable ground truth.** Save them. Never overwrite them.
- **Re-navigate after resize** in Phase 5 to prevent the Playwright browser reset bug.
- **Respect the shadow boundary.** Use tokens and parts, never internal class names.
- **Match the theming output format to the project.** Use CSS by default. Use Sass only when the project is configured for it.
- **Rate-limit Figma MCP calls.** Use `figma_get_metadata` for discovery. Then make one targeted `figma_get_design_context` call for each artboard, and one `figma_get_variable_defs` call for each target page. On the desktop server, make sure that each response describes the requested artboard. When you use the selection, first ask the user to select each artboard. Do not batch those calls.
- **Fail fast on 3 retries.** If the same correction fails three times, stop. Report the issue to the user, and ask for guidance.
- **Do not change dependency manifests or lock files without asking.** Identify the exact packages and versions that are necessary. Then get approval before you install them.

---

## Related Skills

- [`igniteui-wc-choose-components`](../igniteui-wc-choose-components/SKILL.md) — component catalogue, package routing, doc lookup patterns
- [`igniteui-wc-customize-component-theme`](../igniteui-wc-customize-component-theme/SKILL.md) — source of truth for palette behavior, global theme rules, and the theming system
- [`igniteui-wc-integrate-with-framework`](../igniteui-wc-integrate-with-framework/SKILL.md) — registration and binding in React, Angular, Vue, or vanilla JS hosts
- [`igniteui-wc-generate-from-image-design`](../igniteui-wc-generate-from-image-design/SKILL.md) — fallback when no Figma file is available (static image input)
- [`igniteui-wc-optimize-bundle-size`](../igniteui-wc-optimize-bundle-size/SKILL.md) — keep registrations and package imports small

---
license: MIT
name: igniteui-wc-figma-to-app
description: "Builds Ignite UI Web Components views from Figma designs, supporting Indigo.Design kits, third-party kits (Material 3, Fluent 2, shadcn/ui, Untitled UI, in-house), and plain frames. Uses the Figma, Ignite UI CLI, Ignite UI Theming, and Playwright MCP servers. WHEN TO USE: implementing a Figma design, artboard, or Figma URL with Ignite UI Web Components, including inside React, Angular, or Vue apps. WHEN NOT TO USE: screenshots or mockups without a Figma file (use igniteui-wc-generate-from-image-design), component selection or theme-only changes (use igniteui-wc-choose-components or igniteui-wc-customize-component-theme), or the native Ignite UI for Angular or Blazor packages."
user-invocable: true
---

# Ignite UI for Web Components — Figma to App

Translate Figma app screens into production Web Components applications built with
Ignite UI. The skill accepts designs from three kinds of source. A single file often mixes
them, so every component is classified individually (Phase 1f):

| Tier | Source | How it maps to Ignite UI |
| --- | --- | --- |
| **A** | The Infragistics **Indigo.Design UI Kits** (Material, Fluent, Bootstrap, Indigo variants, light and dark) | Directly, by kit layer name. The kit variant *is* the Ignite UI design system. |
| **B** | Any other component library: public kits such as Material 3, Fluent 2, Bootstrap, shadcn/ui, Untitled UI, or Ant, and in-house design systems | Variant properties are normalized to a canonical role, then mapped. The theme is fitted to a closest baseline design system. |
| **C** | Plain frames, groups, and detached instances | The role is inferred from structure and visuals, with lower confidence, and the user confirms it. |

Tier A gives the highest fidelity for the least effort. Tiers B and C reach high fidelity
through token overrides, and record the remaining **anatomy deltas** (structural
differences between the design's components and Ignite UI's) for the user to approve
instead of hiding them.

> **Web Components ≠ Angular.** The kits are shared across frameworks, but the
> implementation is not: tags are `igc-*`, components must be registered with
> `defineComponents(...)`, theming is **CSS-custom-property-first** (Sass optional),
> and every component renders in **shadow DOM** — which changes how you style and how
> you measure. These differences are called out in each phase.

---

## Required Workflow

Complete all phases in order — do not skip phases or generate component code from
memory. Every tag name, attribute, slot, and import path must come from `get_doc` /
`get_api_reference` results, or from the reference files of the sibling
`igniteui-wc-choose-components` skill — never guessed.

Read [references/project-setup.md](references/project-setup.md) before Phase 0b (and its layout section in Phase 4).
Read [references/figma-exploration.md](references/figma-exploration.md) before Phase 1.
Read [references/design-provenance.md](references/design-provenance.md) before Phase 1f.
Read [references/asset-extraction.md](references/asset-extraction.md) before Phase 1h.
Read [references/figma-component-map.md](references/figma-component-map.md) before Phase 2.
Read [references/theme-generation.md](references/theme-generation.md) before Phase 3.
Read [references/design-token-bridge.md](references/design-token-bridge.md) before Phase 3.
Read [references/validation-patterns.md](references/validation-patterns.md) before Phase 5.

---

## Phase 0 — Prerequisites

> **Tool naming:** this skill writes MCP tool names as `<server>_<tool>` (e.g.
> `figma_get_metadata`, `theming_create_theme`). The exact name depends on the client —
> Claude Code exposes them as `mcp__<server>__<tool>` (e.g. `mcp__figma__get_metadata`).
> Match by the tool's base name on whatever server is connected.

### 0a: Verify All Four MCP Servers

Run these checks **silently** in parallel. Each verification call is a no-op if the
server is not connected; do not surface raw errors to the user at this point.

| Server                | Verification call                                   | Success signal                   |
| --------------------- | --------------------------------------------------- | -------------------------------- |
| **Figma**             | Inspect the Figma tools (no call — quotas are small) | Tools listed. The configured server URL (or `fileKey` in the tool schema) tells remote from desktop |
| **Ignite UI CLI**     | `list_components` with `framework: "webcomponents"` | Returns component list           |
| **Ignite UI Theming** | `theming_detect_platform`                           | Returns `webcomponents` platform |
| **Playwright**        | `playwright_browser_navigate` to `about:blank`      | Navigates without error          |

If **any server fails**, fix setup **for that server only** before continuing. For
`igniteui-cli` and `igniteui-theming`, configure them yourself — run
`npx -y igniteui-cli ai-config` (or `ig ai-config`) from the project root, which configures
both. Add a missing Playwright entry yourself as well. The Figma servers need the user's
action — the desktop server is enabled in the Figma desktop app, and the remote server
signs in through Figma OAuth — so guide the user through the Figma setup. Full setup
instructions for all servers are in [references/mcp-setup.md](references/mcp-setup.md).
Newly configured MCP servers require an editor/session reload before their tools appear —
ask the user to reload, then stop.

### 0b: Detect or Scaffold a Web Components Project

Check whether the working directory contains a `package.json` that lists
`igniteui-webcomponents`, and a `src/` entry
module.

- **Project found:** note the package layout (trial or `@infragistics` licensed), the host
  setup (plain Lit/vanilla, or a React/Angular/Vue wrapper), and whether Sass is configured
  (it decides the Phase 3 output format). Confirm the MCP configuration has all four
  server entries.
- **No project found:** offer to scaffold one with `npx -y igniteui-cli new`, or to use an
  existing project directory, and wait for the user's choice.

Read [references/project-setup.md](references/project-setup.md) for the detection
checklist, the exact messages to show the user, template selection, and the scaffolding
steps.

---

## Phase 1 — Figma Design Exploration

**Goal:** understand the full design structure and capture all data needed for
implementation and validation before writing any code.

Read [references/figma-exploration.md](references/figma-exploration.md) in full before the
first Figma MCP call. It has the call budget, how to tell the two Figma servers apart,
exact tool arguments, extraction checklists, and table templates for each step:

| Step | What to do |
| ---- | ---------- |
| **1a** | Discover pages and artboards with `figma_get_metadata`. Record each target artboard's width and height — Phase 5 resizes the browser to them |
| **1b** | List the artboards and wait for the user to choose which to implement |
| **1c** | Capture one reference screenshot per artboard — the ground truth for Phase 5 |
| **1d** | Extract design context per artboard: layers and variant props, layout, typography, surfaces, input variants, chart colors, color census, control heights, action controls, provenance signals |
| **1e** | Extract design tokens with `figma_get_variable_defs`, once per target page |
| **1f** | Classify every component's provenance (Tier A Indigo.Design kit / B other library / C plain frames) and normalize it to a canonical role; check Code Connect mappings |
| **1g** | Build Table A (Ignite UI components, with tier, confidence, token work, and suspected anatomy deltas) and Table B (layout surfaces), then present both for review — low-confidence mappings first |
| **1h** | Extract every image asset to the project's assets directory — zero-placeholder policy |

Key constraints:

- **Rate limits:** limits depend on the Figma **seat**. A View/Collab seat allows 6 calls a
  month (20 on Starter), which may not cover one artboard. Compare the call estimate with
  the user's quota before starting, and discover structure with `figma_get_metadata` first.
- **Two Figma MCP servers:** the **remote** server (`mcp.figma.com`) takes `fileKey` and
  `nodeId`, so you can move between artboards yourself. The **desktop** server
  (`127.0.0.1:3845`) works only on the file open in the Figma desktop app. Pass the node ID
  from a frame link and check the response, or ask the user to select each artboard and do
  not batch those calls.
- **Any UI kit:** do not assume the Indigo.Design kits. Classify each component in 1f.
  A third-party kit's names, variables, and Code Connect mappings are evidence of the
  component's role. Never copy them into the code.
- **React + Tailwind output:** `figma_get_design_context` returns React + Tailwind code.
  Read it for information only — never copy it into the project, and never use its asset
  URLs as final assets.

---

## Phase 2 — Component Discovery (Ignite UI CLI MCP)

**Goal:** look up exact tags, attributes, slots, events, and registration requirements for
every component identified in Phase 1. Never generate component code from memory.

### 2a: Read the Component Map

Read [references/figma-component-map.md](references/figma-component-map.md) in full.
For each row of the Phase 1g Table A:

- **Tier A:** find the Indigo.Design kit name in the kit tables.
- **Tier B/C:** find the canonical role in the **Canonical Role Index**, then the row it
  points to in the named section.

That row gives you the tag, the component class, the package, a `get_doc` starting point,
and the key attributes and slots most often configured from Figma variants.

### 2b: Fetch Component Docs

> **Doc names are not tag names** (`navigation-drawer`, `text-area`, `data-grid`,
> `overview` for combo). Never guess one — see `figma-component-map.md § Doc-name rules you will hit immediately`.

Call `list_components({ framework: "webcomponents" })` **once** to get the live catalog,
then:

- Resolve each component to its exact doc `name` from that list, and call
  `get_doc({ framework: "webcomponents", name: "<doc-name>" })` — all in a single parallel
  batch, never sequentially. `get_doc` gives usage patterns, HTML examples, and slot names.
- For the full property/method/event API, call
  `get_api_reference({ platform: "webcomponents", component: "<ClassName>" })`. Use
  `search_api({ platform: "webcomponents", query: "<keyword>" })` first when the exact
  class name is unknown, and use the `section` or `member` parameters to keep responses small.
- `get_project_setup_guide({ framework: "webcomponents" })` confirms registration, theme
  import, and package wiring when needed.

Do **not** write any component markup until you have read its doc or API entry.

### 2c: Search for Feature Docs

Use `search_docs` for feature-level questions raised by the artboard, for example:

```
search_docs({ framework: "webcomponents", query: "grid row editing" })
search_docs({ framework: "webcomponents", query: "grid virtualization" })
search_docs({ framework: "webcomponents", query: "column pinning" })
```

Feature docs are mandatory when the artboard shows grid editing, filtering, sorting,
pinning, or other advanced feature states.

### 2d: Document the Final Component Plan

After reading all docs, confirm or revise the Phase 1g table with:

- Exact tags (e.g. `<igc-grid>`, `<igc-navbar>`) and component classes
- The **package** each component comes from, and trial vs. `@infragistics` licensed paths
- The **registration** each one needs — see the registration cheat sheet in
  `figma-component-map.md` (`defineComponents(...)`, `IgcXxxComponent.register()`,
  `IgcGridLite.register()`, `ModuleManager.register(...)`, and `defineComponents` from
  `igniteui-dockmanager`)
- Any additional theme CSS a package requires (the grid packages ship their own)

**Anatomy delta ledger (Tier B and C).** For every mapped component whose anatomy differs
from the design in a way that tokens, `::part(...)`, or slotted content **cannot** close,
add a ledger entry:

| Component | Design shows | Ignite UI renders | Options | Decision |
| --- | --- | --- | --- | --- |
| _e.g._ Text fields (shadcn) | Label above the field | Label above (baseline `bootstrap`) | — | none needed |
| _e.g._ M3 segmented button | Check icon on the selected segment | `igc-toggle-button`, no check icon | Slot an `igc-icon` in the selected item / accept | ask |
| _e.g._ Bottom sheet | Sheet sliding from the bottom | No sheet component | `igc-dialog` styled / custom markup | ask |

Do not ledger differences that tokens *can* close: color, radius, border, casing, height,
and spacing are implementation work, not deltas. For every interactive control, prefer the
Ignite UI component with a recorded delta over hand-built markup. The component's keyboard,
focus, ARIA, and form behavior are worth more than a pixel-exact but inert copy.
Approved entries are classified **Accepted** in Phase 5.

If new packages are required (including an icon package for a third-party kit), identify
exact packages and versions, then **ask for approval before installing**. Present this
updated plan, with the ledger, to the user and wait for confirmation before Phase 3.

---

## Phase 3 — Theme Generation (Ignite UI Theming MCP)

**Goal:** produce theming code that matches the Figma design's visual language, using the
kit variables from Phase 1e (Path A) or the color census and measurements from Phase 1d
(Path B).

Read [references/theme-generation.md](references/theme-generation.md) and
[references/design-token-bridge.md](references/design-token-bridge.md) in full before
running any theming tool. The steps are:

| Step | What to do |
| ---- | ---------- |
| **3a** | Inspect the entry point and global stylesheet. The CLI scaffold's starter theme counts as no theme. Reuse an app's own theme only if its variant, design system, and primary color all match the design; otherwise ask before changing it |
| **3b** | Choose the path from the dominant Phase 1f tier. **Path A** (Indigo.Design kits): resolve the design system with the strict precedence order. **Path B** (other kits or none): pick the closest baseline — the user's request, then the kit's direct counterpart, then input label placement, then control heights. In a mixed file, count only rows that map to a component |
| **3c** | CSS path: import the pre-built theme for the design system and variant, then add `theming_create_palette` overrides. Sass path: one `theming_create_theme` call (plus `theming_create_palette` for `gray` or status colors). **Path B:** seed from the color census, then override the type styles that differ (including button casing) with `--ig-<style>-<property>` CSS variables. Do not rely on `customScale`: `theming_create_typography` accepts it, but its generators ignore it |
| **3d** | Map per-component tokens for every Ignite UI component in the plan, always passing `designSystem` and `variant`. Path B also sets radius, border, shadow, and state tokens, and picks `--ig-size` per component family from measured heights |
| **3e** | Validate chart series colors with `theming_get_chart_series_colors` and assign them to the chart's brush properties (`brushes`/`outlines`; `brush` on sparkline, `fillBrushes` on treemap, the ring series on doughnut) |

Key constraints:

- **Output format:** CSS by default; Sass only when the project is configured for it.
  Never use the Angular-only `core()` / `theme()` mixins.
- `theming_create_palette` takes `primary`/`secondary`/`surface`/`gray`/`success`/`warn`/`error`/`info`
  and `variant`, while `theming_create_theme` takes `primaryColor`/`secondaryColor`/`surfaceColor`
  (no `gray`).
- `theming_create_elevations` takes `designSystem` (`material` or `indigo`); there is no
  `preset` parameter.
- Never use the font name as the primary design-system signal.
- Never convert Figma pixel values into `theming_set_spacing` or `theming_set_roundness`
  multipliers. `--ig-size` is different: it is a size step (`small` / `medium` / `large`),
  not a multiplier. Path A keeps the default; Path B picks the nearest step per component
  family (3d).
- **Path B:** seed the palette with the color painted on the component, not the variable
  named `…/500`. On a `material` baseline, buttons, checkboxes, and switches use
  `secondary`, so seed it with the button color.

---

## Phase 4 — Implementation

**Goal:** build the view(s) that match the artboard decomposition from Phase 2.

### Implementation Rules

1. **Never generate component markup without reading its doc or API entry first** — the
   `get_doc` result, or the skill reference file when the catalog has no doc (Phase 2b).
2. **Section by section** — layout → navigation → primary content → secondary → data.
3. **Register every custom element you use, once, in the right place.**
   ```typescript
   import { defineComponents, IgcNavbarComponent, IgcCardComponent } from 'igniteui-webcomponents';
   defineComponents(IgcNavbarComponent, IgcCardComponent);
   ```
   Grids use `IgcGridComponent.register()`, Grid Lite `IgcGridLite.register()`, charts and
   gauges `ModuleManager.register(IgcCategoryChartModule, …)` from
   `igniteui-webcomponents-core`, and the dock manager `defineComponents(IgcDockManagerComponent)`
   from `igniteui-dockmanager` (trial) or `@infragistics/igniteui-dockmanager` (licensed).
   In a framework-wrapped app, follow
   [`igniteui-wc-integrate-with-framework`](../igniteui-wc-integrate-with-framework/SKILL.md)
   instead. Registering components you do not use inflates the bundle — see
   [`igniteui-wc-optimize-bundle-size`](../igniteui-wc-optimize-bundle-size/SKILL.md).
4. **Respect the shadow DOM boundary.** Page CSS does not reach a component's internals.
   In order of preference: component **design tokens** (Phase 3d) → documented
   `::part(...)` selectors → slotted content you style yourself. Never target internal
   class names. CSS custom properties **do** inherit through shadow roots, which is why all
   color work goes through palette variables.
5. **Slots, not attributes, carry content.** `igc-list-item` uses `start` / `title` /
   `subtitle` / `end`; `igc-navbar` uses `start` / `end`; `igc-card` composes
   `igc-card-header`, `igc-card-content`, `igc-card-actions`, `igc-card-media`. Confirm the
   slot names from `get_doc` before writing markup.
6. **Bind non-primitive values as properties, not attributes.** Arrays, objects, and
   functions (grid `data`, chart `dataSource`, combo `data`) must be assigned on the element
   (`.data=${rows}` in Lit, `el.dataSource = rows` in plain JS). A serialized attribute
   silently fails. Assign chart brushes as properties too.
7. **Events are `igc*`-prefixed** (`igcChange`, `igcInput`, `igcClosing`, …) — take the
   exact names from `get_api_reference`, and remember there is no two-way binding.
8. Use CSS Grid first to match Figma frame proportions; add Flexbox for sub-regions.
9. Apply theming via the tokens and palette variables generated in Phase 3 — no raw hex
   values in view code.
10. Use typed mock data that matches the design's density and domain.
11. Keep layout, spacing, and typography in stylesheets (or the component's `static styles`)
    — not inline styles.
12. **Input variants:** the Indigo.Design kits express `line` / `box` / `border` input
    types; Web Components expose a single boolean **`outlined`** attribute on `igc-input`,
    `igc-textarea`, `igc-select`, `igc-combo`, `igc-date-picker`, `igc-date-range-picker`,
    and the other input-base components. Map `_Input/Border` → `outlined`; map `_Input/Line`
    and `_Input/Box` → default (no `outlined`). For other kits, map the normalized style:
    **outlined** → `outlined`; **filled** / **underlined** → default. Label placement comes
    from the baseline design system (3b), not from an attribute. There is **no** global
    injection token equivalent — set the attribute on each control, and close any remaining
    gap with `input-group` component tokens rather than internal CSS.
13. **Layout surfaces:** for every entry in the Phase 1g Table B (Layout Surfaces), add a CSS class
    with the recorded `background`, `border-radius`, `padding`, `border`, and `box-shadow`.
    Never leave a section transparent if the Figma surface has a background; never add a
    background to a section that floats on the page background in the design.
14. **Implement only controls that appear in the Figma artboard.** Do not add toolbar
    buttons, actions, or UI elements that look useful but are not in the design context
    output for that artboard.
15. After each major section, check it in the browser if the dev server is running.

### Layout and File Structure

Translate Figma frame dimensions into CSS Grid first, matching desktop proportions before
adding breakpoints, and place each view where the project expects it. The grid pattern,
the Lit host-display pitfall, and the per-view file layout are in
[references/project-setup.md § Implementation Layout](references/project-setup.md#implementation-layout).

---

## Phase 5 — Visual Validation (Playwright MCP)

**Goal:** measure and compare the running app against the Figma reference screenshots from
Phase 1c. Use the measurement-driven loop — compare numbers, not impressions.

Read [references/validation-patterns.md](references/validation-patterns.md) in full before
running any Playwright tool.

### 5a: Ensure the Dev Server Is Running

Ask the user for the local dev URL if not already known (Vite default:
`http://localhost:5173`).

```
playwright_browser_navigate({ url: "http://localhost:5173" })
playwright_browser_console_messages()   // check for startup errors
```

Unregistered custom elements are a silent failure mode: the element renders as an empty
inline box with no console error. If a section is missing, check `defineComponents` first.

### 5b: Match Viewport to Artboard Dimensions

```
playwright_browser_resize({ width: <artboard.width>, height: <artboard.height> })
playwright_browser_navigate({ url: "<target route>" })  // re-navigate after resize
```

> **Always re-navigate after resize.** The browser may reset to `about:blank` on viewport
> change. This is a known Playwright MCP pitfall.

### 5c: Capture and Compare Screenshots

For **each target artboard** (run the full 5c–5f loop once per page):

1. Navigate the browser to the corresponding route.
2. Take a browser screenshot:
   ```
   playwright_browser_take_screenshot({ type: "png" })
   ```
3. Do a **section-by-section** comparison against the Phase 1c reference file:
   top bar → sidebar → **every section in the Phase 1g Table B** → footer.
4. Do **not** advance to the next artboard until only Cosmetic and Accepted items remain on
   the current one.

### 5d: Measure Computed Styles

For each section with visible differences — and **mandatorily for every entry in the Phase
1g Table B** — use `playwright_browser_evaluate` to extract exact values. Pass code
as a **plain JavaScript function string** using the `function` parameter.

> **Shadow DOM changes every measurement.** `document.querySelector('igc-card .title')`
> returns `null` — the inner nodes live in a shadow root. Measure the host element for box
> metrics, and pierce with `el.shadowRoot.querySelector(...)` (or `::part` targets) for
> internals. `references/validation-patterns.md` provides a reusable deep-query helper —
> use it instead of writing ad-hoc selectors.

Run the three mandatory audits from `validation-patterns.md` on every page, and compare
all returned values against the Figma spec from Phase 1d:

- **Surfaces audit** — every Table B section has the recorded background (or none, when it
  floats on the page), and encloses the children shown inside it in Figma.
- **Action controls audit** — every visible control, shadow roots included, is in the
  Phase 1d inventory. Anything else is fabricated and must be removed.
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

The full table and the definitions are in `validation-patterns.md § Mismatch Severity
Classification`. A visibly different color is Major, not Cosmetic. **Accepted** needs the
user's approval of a ledger entry, from Phase 2d or added during Phase 5.

For each mismatch, produce:

```
ISSUE: <description>
LOCATION: <section or component>
FIGMA: <spec value>
RENDERED: <measured value>
SEVERITY: <Critical / Major / Minor / Cosmetic / Accepted>
FIX: <specific code change>
```

### 5f: Apply Corrections

Fix Critical, Major, and Minor issues. After applying fixes, re-navigate and take a
fresh screenshot to confirm:

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

- **Phase 0 is not optional.** Never skip MCP verification, and establish which Figma MCP
  server is connected before Phase 1.
- **Classify provenance per instance (Phase 1f).** Do not assume the Indigo.Design kits.
  A third-party kit's names and variables are evidence to normalize, not to copy.
- **Never import from Code Connect of another library.** Code Connect snippets that point
  at shadcn, MUI, or an in-house package confirm the role only. The code is always Ignite UI.
- **Seed the palette from usage on Path B.** Use the color painted on the component, not
  the variable named `…/500`. On a `material` baseline, controls use `secondary`.
- **Ledger what tokens cannot fix; fix what they can.** Structural anatomy deltas go to the
  user in Phase 2d. Color, radius, casing, and height mismatches get fixed.
- **Phase 2b before code.** Never write a tag, attribute, or slot you have not read from a
  doc or API entry (or the skill reference file when no doc exists). Doc names are not tag
  names.
- **Register what you use.** An unregistered element fails silently.
- **Phase 1c screenshots are immutable ground truth.** Save them; never overwrite them.
- **Re-navigate after resize** in Phase 5 to avoid Playwright's browser reset bug.
- **Respect the shadow boundary** — tokens and parts, never internal class names.
- **Match the theming output format to the project** — CSS by default, Sass only when
  configured.
- **Rate-limit Figma MCP calls.** Use `figma_get_metadata` for discovery, then targeted
  `figma_get_design_context` per artboard, and `figma_get_variable_defs` once per target
  page. On the desktop server, check that each response describes the requested artboard.
  When you rely on the selection, ask the user to select each artboard first and do not
  batch those calls.
- **Fail fast on 3 retries.** If the same correction fails three times, stop, report the
  issue to the user, and ask for guidance.
- **Do not modify dependency manifests or lock files without asking.** Identify the exact
  packages and versions required, then get approval before installing.

---

## Related Skills

- [`igniteui-wc-choose-components`](../igniteui-wc-choose-components/SKILL.md) — component catalogue, package routing, doc lookup patterns
- [`igniteui-wc-customize-component-theme`](../igniteui-wc-customize-component-theme/SKILL.md) — source of truth for palette behavior, global theme rules, and the theming system
- [`igniteui-wc-integrate-with-framework`](../igniteui-wc-integrate-with-framework/SKILL.md) — registration and binding in React, Angular, Vue, or vanilla JS hosts
- [`igniteui-wc-generate-from-image-design`](../igniteui-wc-generate-from-image-design/SKILL.md) — fallback when no Figma file is available (static image input)
- [`igniteui-wc-optimize-bundle-size`](../igniteui-wc-optimize-bundle-size/SKILL.md) — keeping registrations and package imports lean

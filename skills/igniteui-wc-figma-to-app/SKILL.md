---
name: igniteui-wc-figma-to-app
description: Translate Figma app screens designed with the Indigo.Design UI Kits into production Ignite UI for Web Components applications. The Indigo.Design UI Kits are Figma component libraries available in four design-system variants — Material, Fluent, Bootstrap, and Indigo — each with light and dark themes. Designers build their own app frames in Figma using these kit libraries, and every kit component instance maps to an Ignite UI Web Components control. The active kit variant also determines the design system used in the app theme. Uses the Figma MCP for design data, the Ignite UI CLI MCP for component docs, the Ignite UI Theming MCP for palette and component-level styling, and the Playwright MCP for visual validation against the original Figma design. Triggers on "implement this Figma design", "build from Figma", "translate Figma to Web Components", "implement this artboard", "generate app from Figma", or when a Figma URL is shared with implementation intent in an Ignite UI Web Components context.
user-invocable: true
---

# Ignite UI for Web Components — Figma to App

Translate Figma app screens built with the **Indigo.Design UI Kits** into production
Web Components applications. Designers create their own frames in Figma using the
Indigo.Design component libraries as shared libraries — these kits come in four
design-system variants (**Material**, **Fluent**, **Bootstrap**, **Indigo**) with light
and dark themes each. Every component instance in the design maps to an Ignite UI Web
Components control, and the active kit variant directly determines which design system
to configure in the app theme.

This skill orchestrates four MCP servers: **Figma** (design data), **Ignite UI CLI**
(component docs), **Ignite UI Theming** (styles), and **Playwright** (visual validation).

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

Read [references/figma-component-map.md](references/figma-component-map.md) before Phase 2.
Read [references/design-token-bridge.md](references/design-token-bridge.md) before Phase 3.
Read [references/asset-extraction.md](references/asset-extraction.md) before Phase 1h.
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

| Server                | Verification call                                      | Success signal                      |
| --------------------- | ------------------------------------------------------ | ----------------------------------- |
| **Figma**             | `figma_get_metadata` (see 0c for the call shape)       | Returns page list or node XML       |
| **Ignite UI CLI**     | `list_components` with `framework: "webcomponents"`    | Returns component list              |
| **Ignite UI Theming** | `theming_detect_platform`                              | Returns `webcomponents` platform    |
| **Playwright**        | `playwright_browser_navigate` to `about:blank`         | Navigates without error             |

If **any server fails**, stop and guide the user through setup **for that server only**
before continuing. For `igniteui-cli` and `igniteui-theming`, the fastest path is
`npx -y igniteui-cli ai-config`, which configures both. Full setup instructions for all
servers are in [references/mcp-setup.md](references/mcp-setup.md). Newly configured MCP
servers require an editor/session reload before their tools appear.

### 0b: Detect or Scaffold a Web Components Project

Check whether the current working directory contains a valid Web Components + Ignite UI
project:

```
1. Does package.json exist?
2. Does it list "igniteui-webcomponents" OR "@infragistics/igniteui-webcomponents" in dependencies?
3. Is there a src/ directory with an entry module (src/index.ts, src/main.ts, or similar)?
```

**If a valid project is found:**

- Note the package layout: `igniteui-webcomponents` (open source / trial) or
  `@infragistics/igniteui-webcomponents` (licensed). The same split applies to the
  commercial packages — `igniteui-webcomponents-grids`, `igniteui-webcomponents-charts`,
  `igniteui-webcomponents-core`, `igniteui-dockmanager`.
- Note the host setup: plain Lit/vanilla app, or a framework wrapper (React/Angular/Vue).
  If a wrapper is in play, registration and event binding follow
  [`igniteui-wc-integrate-with-framework`](../igniteui-wc-integrate-with-framework/SKILL.md),
  not the raw `defineComponents` pattern.
- Note whether **Sass** is configured (a `.scss` entry file, `sass` in `devDependencies`,
  or a bundler Sass plugin). This decides the Phase 3 output format — CSS or Sass.
- **Check the MCP configuration for all four required server entries** — `figma`,
  `igniteui-cli`, `igniteui-theming`, and `playwright` (in `.vscode/mcp.json` or the
  client's equivalent). If `igniteui-cli` or `igniteui-theming` is missing, run
  `npx -y igniteui-cli ai-config` from the project root — it configures both servers and
  copies the Agent Skills, preserving existing entries. Add missing `figma` and
  `playwright` entries from [references/mcp-setup.md](references/mcp-setup.md).
  Projects scaffolded with `npx igniteui-cli new` already have `igniteui-cli` **and**
  `igniteui-theming` wired; they typically lack `figma` and `playwright`. A reload is
  required before newly configured servers' tools appear.
- Inform the user: "Found existing Ignite UI Web Components project. Proceeding with the
  Figma workflow."

**If no valid project is found:**
Present this message and wait for the user's choice:

> "No Ignite UI Web Components project found in the current directory. Would you like me
> to scaffold a new one using the Ignite UI CLI before implementing the Figma design?
>
> `npx -y igniteui-cli new` creates a Vite + Lit + TypeScript project pre-configured with
> `igniteui-webcomponents`, a theme already wired in `styles.css`, and the Ignite UI CLI
> and Theming MCP servers auto-wired into `.vscode/mcp.json`. No global install required.
>
> Alternatively, point me at an existing project directory."

If the user confirms scaffolding:

1. Ask for a project name. If the user has already shared a Figma URL, suggest a name
   derived from the Figma file name; otherwise prompt.

2. Choose the project template based on the artboard structure. Because Phase 1 has not
   run yet, use the lightest signal available:

   | Signal                                                               | Template to use                                 |
   | -------------------------------------------------------------------- | ----------------------------------------------- |
   | User mentions a persistent sidebar or multiple routed views          | `side-nav`                                      |
   | User mentions an icon-rail / collapsible sidebar                     | `side-nav-mini`                                 |
   | No strong signal — default                                           | `empty` (routing + home page; easiest to extend) |

3. Create the project:

   ```bash
   npx -y igniteui-cli new <project-name> --framework=webcomponents --type=igc-ts --template=<empty|side-nav|side-nav-mini>
   ```

   This produces a standard Vite workspace and additionally:
   - Installs and configures `igniteui-webcomponents` and `lit`
   - Wires `@vaadin/router` routing in `src/app/app-routing.ts`
   - Generates `.vscode/mcp.json` with the `igniteui-cli` **and** `igniteui-theming`
     MCP server entries already set
   - Copies static assets from `src/assets` via `vite-plugin-static-copy`

4. `cd <project-name>`

5. Open the auto-generated `.vscode/mcp.json` and **append** the Figma and Playwright
   server entries from `references/mcp-setup.md`. The `igniteui-cli` and
   `igniteui-theming` entries are already present — do not duplicate them.

6. Confirm the project starts cleanly:
   ```bash
   npm start        # vite --open, default http://localhost:5173
   ```
   Then continue to Phase 1.

### 0c: Determine Which Figma MCP Variant Is Connected

Two Figma MCP variants exist and they are driven differently. Establish which one you
have **before** Phase 1, because it decides whether you can navigate artboards yourself.

| Variant                     | Signal                                                            | How you drive it                                                                        |
| --------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Remote / addressable**    | `get_design_context` / `get_metadata` require `fileKey` + `nodeId` | Pass `fileKey` and `nodeId` explicitly. You can iterate artboards without the user.      |
| **Desktop / session-bound** | Tools take no required params and act on the current selection     | Ask the user to click each frame in Figma before every call. Any `nodeId` is ignored.    |

Check the tool signature of `figma_get_metadata`. If `fileKey` is required, you have the
addressable variant — **prefer it**, and ask the user once for the file URL:

```
https://figma.com/design/:fileKey/:fileName?node-id=1-2   →   fileKey = ":fileKey", nodeId = "1:2"
```

Every Figma call below shows the addressable form. When only the session-bound variant is
available, drop `fileKey`/`nodeId` and insert this step before each call:

> *"In Figma, please click the **[Artboard Name]** frame to select it, then confirm."*

Wait for confirmation before calling. Never batch session-bound calls.

---

## Phase 1 — Figma Design Exploration

**Goal:** understand the full design structure and capture all data needed for
implementation and validation before writing any code.

> **Rate-limit awareness:** Figma MCP calls count against plan quotas
> (indicative, subject to change — verify against the user's current Figma plan:
> Starter **6 calls/month**, Organization 200/day, Enterprise 600/day).
>
> Estimated call budget for a 5-artboard design:
> `figma_get_metadata` ×2 + `figma_get_screenshot` ×5 + `figma_get_design_context` ×5 + `figma_get_variable_defs` ×1 + `figma_get_code_connect_map` ×5 = **~18 calls**.
> **Starter plan users will exceed their monthly quota in a single session.** Strategies:
> 1. Call `figma_get_variable_defs` only **once** for the root page (variables are file-scoped, not artboard-scoped).
> 2. `figma_get_design_context` already returns a screenshot — do not also call
>    `figma_get_screenshot` for the same node unless you need a larger `maxDimension`.
> 3. For large files, consider implementing one artboard per monthly budget cycle.

### 1a: Discover Pages and Artboards

Call `figma_get_metadata` with the `fileKey` and no `nodeId` — it returns the top-level
page list. Then call it again per relevant page (`nodeId` = page id, e.g. `0:1`) to get
the artboard tree with node IDs, names, positions, and sizes.

Record each target artboard's **width and height** — Phase 5 resizes the browser to them.

### 1b: Select Target Artboards

If there are multiple pages or artboards, show the user a list:

> "I found these artboards in your Figma file:
>
> - Page 1: [list artboard names + node IDs]
> - Page 2: [list artboard names + node IDs]
>
> Which artboards should I implement? (You can say 'all' or list specific names.)"

Wait for confirmation before proceeding.

### 1c: Capture Reference Screenshots

For each target artboard:

```
figma_get_screenshot({ fileKey: "<fileKey>", nodeId: "<artboardId>", maxDimension: 2048 })
```

The response returns a short-lived URL plus a `curl` command, and metadata with both the
rendered size and the node's natural size. **Download each screenshot to disk** (e.g.
`.figma-reference/<artboard-name>.png`) — the URL expires, and Phase 5 compares against
these files. Record `{ artboardName, nodeId, file, width, height }`.

After all artboards are captured, confirm the count:
> *"I have N reference screenshots: [list artboard names]. Proceeding to design context extraction."*

> Never skip this step. The screenshots are your ground truth for Phase 5 validation.

### 1d: Extract Design Context

> **Output format:** `figma_get_design_context` returns **React + Tailwind CSS reference
> code**, not structured Web Components metadata. Do **not** copy that code into the
> project. Read the JSX to extract the information below. Asset URLs in the response are
> short-lived — see Phase 1h and `references/asset-extraction.md`.

For **each** target artboard:

```
figma_get_design_context({
  fileKey: "<fileKey>",
  nodeId: "<artboardId>",
  clientLanguages: "typescript,html,css",
  clientFrameworks: "lit,web-components"
})
```

From the React+Tailwind output, extract:

- **Component layer names** (`data-name` attributes in the JSX) — match against
  `references/figma-component-map.md`
- **Layout structure** — `flex`, `grid`, `gap-*`, `p-*`, `w-*`, `h-*` classes on containers
- **Typography** — `font-['...']`, `text-[...]`, weight classes
- **Surface colors** — `bg-[#XXXXXX]` on container `<div>` elements that wrap major
  sections (these become plain `<div>` wrappers in the view, not Ignite UI components)
- **Border / roundness** — `rounded-[...]`, `border`, `border-[...]` on containers and cards
- **Input variant indicators** — hidden zero-size nodes (`size-[0.5px]`) whose `data-name`
  contains a component type (e.g. `"Date Picker Type"`, `"Combo Input"`). These are the
  Indigo.Design kit's **variant indicator nodes**; their name encodes which input variant
  (border/line/box) is active. See the input-variant note in Phase 4 — Web Components
  expose this as the boolean `outlined` attribute, not a three-way type.
- **Chart series colors** — for any chart layer, note the fill colors on its series paths
- **Action controls** — list every button, icon button, and toolbar action visible in the
  artboard; this is your authoritative inventory — do not add actions not present in the design
- **Active kit variant** — look for library component references whose source file name
  contains "Material", "Fluent", "Bootstrap", or "Indigo". If not found here, defer to
  Phase 1e variable names and [references/design-token-bridge.md](references/design-token-bridge.md).

Record all surface containers in the **Surfaces Spec** (Table B in Phase 1g).

### 1e: Extract Design Tokens

> Figma variables are **file-scoped**, not artboard-scoped. Call once for the root page
> node — not once per artboard.

```
figma_get_variable_defs({ fileKey: "<fileKey>", nodeId: "<pageId>" })
```

The response maps variable names to values, e.g.:

```
"color/primary/500": "#6200EE"
"color/surface": "#FFFFFF"
"typography/body/font-family": "Roboto"
```

Use `references/design-token-bridge.md` to map color and typography variables to Ignite UI
theming inputs in Phase 3. Do **not** attempt to map Figma spacing or sizing values — see
`references/design-token-bridge.md § Spacing, Sizing, and Roundness` for why.

### 1f: Check for Existing Code Connect Mappings

```
figma_get_code_connect_map({ fileKey: "<fileKey>", nodeId: "<artboardId>" })
```

If mappings exist, they confirm which components correspond to which Figma nodes — use
them to validate or augment your Phase 2 component mapping.

### 1g: Build the Decomposition Table

Before writing any code, produce **two tables** for **each artboard**.

#### Table A — Ignite UI Components

| Figma Layer Name           | Visual Role        | Ignite UI Tag / Class                  | Package                  | Design Tokens Used  | Data Type       |
| -------------------------- | ------------------ | -------------------------------------- | ------------------------ | ------------------- | --------------- |
| _e.g._ `_NavBar`           | Top navigation bar | `<igc-navbar>` / `IgcNavbarComponent`  | `igniteui-webcomponents` | `color/primary/500` | n/a             |
| _e.g._ `_Grid/Default`     | Data table         | `<igc-grid>` / `IgcGridComponent`      | `igniteui-webcomponents-grids` | `color/surface` | Tabular records |
| _e.g._ `_Button/Contained` | Primary CTA        | `<igc-button variant="contained">`     | `igniteui-webcomponents` | `color/primary/500` | n/a             |

The **Package** column is not optional in Web Components: general UI, grids, charts, and
dock manager ship as separate packages with trial and `@infragistics` licensed variants.

Fall back to plain semantic HTML only when no Ignite UI component can match the layer
after consulting `references/figma-component-map.md`. Document the reason inline.

#### Table B — Layout Surfaces

Record every **non-`igc-*` container** that carries visual properties (background color,
border, padding, shadow). These are plain `<div>` wrappers in the view — not Ignite UI
components — but they are critical to visual fidelity. Populate this table from the
`bg-[...]`, `rounded-[...]`, `border`, `p-[...]`, and `shadow-[...]` classes observed on
container divs in the Phase 1d output.

| Figma Frame / Container Name | Background | Border-Radius | Padding | Border | Shadow | Encloses (child sections) |
| ---------------------------- | ---------- | ------------- | ------- | ------ | ------ | ------------------------- |
| _e.g._ `Budget Categories`  | `#222222`  | `4px`         | `24px`  | none   | none   | Categories list, Add button |
| _e.g._ `Friend Card`        | `#222222`  | `8px`         | `24px 16px` | `1px solid #333` | none | Avatar, name, phone, email, buttons |

> **Rule:** if a section sits on a surface in Figma (its container has a non-transparent
> background), it **must** have that background in the implementation. If a section floats
> on the page background (transparent), do **not** add a surface wrapper. Always derive
> surface structure from the design context of the specific artboard being implemented.

Present both tables to the user for review before proceeding.

### 1h: Extract Image Assets

Read [references/asset-extraction.md](references/asset-extraction.md) in full before
running any extraction.

**Zero-placeholder policy:** every image visible in the Figma design must be extracted and
committed to the project's assets directory before Phase 4. Gradient placeholders are not
acceptable.

From the decomposition tables, identify every layer that is a **static image asset**
(photo, background, logo, custom icon, illustration) rather than an Ignite UI component.
Do **not** extract Indigo.Design UI Kit component instances, and do not extract icons that
`igc-icon` can render from a registered collection.

**Use the four-tier decision tree from `asset-extraction.md`:**

| Tier | Method | When to use |
| ---- | ------ | ----------- |
| **1** | REST API `/v1/files/:key/images` (Method A) or `/v1/images/:key` (Method B) | File key available — always the highest fidelity |
| **2** | Download the asset URLs returned by `figma_get_design_context` with `curl`     | File key unavailable; URLs still live |
| **3** | `figma_get_screenshot` per node                                               | No file key, no asset URLs |
| **4** | CSS gradient/color placeholder with a `// TODO` comment                        | Only for confirmed pure-color fills — never as a shortcut |

Save assets under the project's static directory — `src/assets/images/` and
`src/assets/icons/` in a CLI-scaffolded Vite project (copied to the build output by
`vite-plugin-static-copy`); `public/` in a stock Vite app. Match whatever the project
already uses.

Build a concise asset manifest (see `asset-extraction.md § Build an Asset Manifest`) so
the implementation phase uses consistent paths.

If you used Tier 2 or Tier 3 for any asset, tell the user which ones need re-export once
the file key becomes available.

---

## Phase 2 — Component Discovery (Ignite UI CLI MCP)

**Goal:** look up exact tags, attributes, slots, events, and registration requirements for
every component identified in Phase 1. Never generate component code from memory.

### 2a: Read the Component Map

Read [references/figma-component-map.md](references/figma-component-map.md) in full. Find
the row for each Figma layer name from your Phase 1 decomposition table. Each row gives
you the tag, the component class, the package, a `get_doc` starting point, and the key
attributes and slots most often configured from Figma variants.

### 2b: Fetch Component Docs

> **Web Components doc names are not tag names.** The catalog uses topic-page names such
> as `navigation-drawer` (nav drawer), `text-area` (textarea), `data-grid` (premium grid),
> `grid-lite-overview`, `circular-progress`, and combo docs split across `overview`,
> `features`, `single-selection`, and `templates`. Never guess a doc name.

Call `list_components({ framework: "webcomponents" })` **once** to get the live catalog,
then:

- Resolve each component to its exact doc `name` from that list, and call
  `get_doc({ framework: "webcomponents", name: "<doc-name>" })` — all in a single parallel
  batch, never sequentially. `get_doc` gives usage patterns, HTML examples, and slot names.
- For the full property/method/event API, call
  `get_api_reference({ platform: "webcomponents", component: "<ClassName>" })`. Use
  `search_api({ platform: "webcomponents", query: "<keyword>" })` first when the exact
  class name is unknown, and use the `section` or `member` parameters to keep responses small.
- `get_project_setup_guide({ framework: "webcomponents" })` is available when the project's
  setup (registration, theme import, package wiring) needs confirming.

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
- The **registration** each one needs — `defineComponents(...)` for `igniteui-webcomponents`,
  `IgcXxxComponent.register()` for the grid packages, `ModuleManager.register(...)` from
  `igniteui-webcomponents-core` for charts and gauges
- Any additional theme CSS a package requires (the grid packages ship their own)

If new packages are required, identify exact packages and versions, then **ask for approval
before installing**. Present this updated plan to the user and wait for confirmation before
Phase 3.

---

## Phase 3 — Theme Generation (Ignite UI Theming MCP)

**Goal:** produce theming code that matches the Figma design's visual language using the
design tokens extracted in Phase 1e.

Read [references/design-token-bridge.md](references/design-token-bridge.md) in full before
running any theming tool.

> **Output format decision — make it once, here.** Pass `output: "css"` (the default) when
> the project has no Sass; pass `output: "sass"` only when Phase 0b found a Sass setup.
> Every theming tool below accepts `output`. Do not emit Sass into a project that cannot
> compile it, and do not use the Angular-only `core()` / `theme()` mixins — the Web
> Components Sass API uses `igniteui-theming` with individual `palette()`, `typography()`,
> `elevations()`, and `spacing()` mixins.

### 3a: Inspect the Existing Theme (Guard)

Open the app entry point and global stylesheet (`src/index.ts` / `main.ts`, `styles.css`,
or the project's equivalent). Look for:

- a pre-built theme import such as `igniteui-webcomponents/themes/dark/material.css`
- `--ig-theme` / `--ig-theme-variant` declarations on `:root`
- a `configureTheme(...)` call
- existing palette overrides (`--ig-primary-500`, …) or app-level semantic variables

Then:

- **Theme found, but variant mismatch** — if the existing theme is **light** and the Figma
  design is **dark** (or vice versa), treat this as a theme change and proceed with 3b–3c.
  A light theme applied to a dark design produces wrong background colors on every
  component and will fail every Phase 5 check.
- **Theme found, variant matches** → do **not** regenerate the global theme unless the user
  explicitly asks. Reuse the existing palette and skip to 3d.
- **No theme found** → proceed with 3b.

Detect the Figma design's variant from Phase 1e: if a `color/mode` variable exists, use its
value. Otherwise use the artboard background color: near-black (`#121212`, `#1a1a1a`,
`#000`) → `"dark"`; near-white (`#fff`, `#f5f5f5`) → `"light"`.

### 3b: Resolve the Design System

To determine the design system, use this **strict precedence order**. Stop at the first
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
   prominent shadows + ripple effects → `"material"`;
   flat surfaces + sharp corners + Segoe/Inter font → `"fluent"`;
   component borders + Bootstrap grid → `"bootstrap"`;
   rounded purple/indigo accents without Material shadows → `"indigo"`.

> **Never use font name as a primary signal.** "Titillium Web" is the default body font in
> the Indigo.Design UI Kit for Material — it is not exclusive to the Indigo design system.

Supported values: `material`, `bootstrap`, `fluent`, `indigo`.

> **Web Components resolve the active design system at runtime from CSS variables.**
> Components read `--ig-theme` and `--ig-theme-variant` (falling back to `bootstrap` /
> `light` when absent). A generated palette alone does **not** switch the design system —
> the pre-built theme CSS, the generated `:root` block, or a `configureTheme(ds, variant)`
> call must set them. Getting this wrong yields correct colors with the wrong component
> anatomy.

### 3c: Generate the Global Theme

Extract the following from Phase 1e variables using
[references/design-token-bridge.md](references/design-token-bridge.md):

```
primaryColor    ← from "color/primary/500" or "primary/500"
secondaryColor  ← from "color/secondary/500" or "secondary/500"
surfaceColor    ← from "color/surface" or "surface/default"
fontFamily      ← from "typography/font-family" or "typography/body/font-family"
```

Read the theming guidance resources before generating, so you extract only values the
theme system actually accepts:

```
theming_read_resource({ uri: "theming://guidance/colors/rules" })   // luminance + variant rules
theming_read_resource({ uri: "theming://platforms/webcomponents" }) // platform specifics
```

**CSS path (default — no Sass in the project):**

1. Import the pre-built theme CSS for the resolved design system and variant in the app
   entry point. This sets `--ig-theme`, `--ig-theme-variant`, the full palette, typography,
   and elevations in one line:

   ```typescript
   import 'igniteui-webcomponents/themes/dark/material.css';
   ```

2. Generate the palette overrides from the Figma seed colors:

   ```
   theming_create_palette({
     primary: primaryColor,
     secondary: secondaryColor,
     surface: surfaceColor,
     variant: "<light|dark>",
     platform: "webcomponents",
     licensed: <true if @infragistics package>,
     output: "css"
   })
   ```

   Apply the generated custom properties to `:root` in the global stylesheet. Overriding
   the `*-500` base shade is enough — the remaining shades derive from it.

3. Apply typography with plain CSS (`font-family`, `font-size`, `font-weight`) or the CSS
   output of `theming_create_typography`. Do not emit Sass typography mixins into a
   CSS-only app.

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
  licensed: <true if @infragistics package>,
  output: "sass"
})
```

`theming_create_theme` emits the `@use 'igniteui-theming'` imports, the `palette()` /
`elevations()` / `typography()` / `spacing()` mixin calls, and the `:root` block with
`--ig-theme` and `--ig-theme-variant`. Apply its output as instructed in the response.
Use `theming_create_palette` / `theming_create_typography` / `theming_create_elevations`
individually only when you need one piece.

> `theming_create_elevations` takes **`designSystem`** (`"material"` or `"indigo"`) — there
> is no `preset` parameter.

**Runtime switching.** When the design needs light and dark at runtime, either swap the
pre-built stylesheet or call the library API:

```typescript
import { configureTheme } from 'igniteui-webcomponents';
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

### 3d: Per-Component Token Mapping

> **Scope:** applies to every Ignite UI family that exposes design tokens — card, inputs,
> select, combo, navbar, nav drawer, list, tabs, date pickers, chips, grids, etc. Charts,
> gauges, and maps have **no design tokens**; configure those through component properties
> (see 3e).

For **every** Ignite UI component in your plan, run this loop:

1. `theming_get_component_design_tokens({ component: "<theme-key>" })` — review all token
   names, types, and descriptions, plus any **related themes** listed for compound
   components. Theme keys are not always the tag name: inputs are `input-group`, the nav
   drawer is `navdrawer`, progress bars are `progress-linear` / `progress-circular`, and a
   single-select combo is `simple-combo`. See
   [references/design-token-bridge.md](references/design-token-bridge.md) for the full map.
2. Go back to the Phase 1e variable map and find the Figma variables that correspond to
   this component's surfaces (background, text, border, hover state).
3. `theming_create_component_theme({ component: "<theme-key>", platform: "webcomponents", designSystem: "<resolved>", variant: "<light|dark>", tokens: { <only differing tokens> }, output: "css" | "sass" })`
4. Apply the generated block exactly as returned — to the component selector or to the
   `selector` you passed. Token values must reference palette variables
   (`var(--ig-primary-500)`), never raw hex.
5. For compound components (`combo`, `select`, `date-picker`, `date-range-picker`, `grid`),
   follow the related-theme chain from step 1 and theme each child with its scoped selector.
   Styling only the parent leaves the dropdown or calendar off-theme.

When a specific component needs a different density or spacing from the global default, use
`theming_set_size` or `theming_set_spacing` with the `component` parameter — this scopes
`--ig-size` or `--ig-spacing` to that component's selector rather than applying globally.
For compound components, use `scope` with a sub-component selector. Only apply these
globally (`:root`) when the entire app has a clearly distinct density. Leave
`theming_set_roundness` at its default unless the user explicitly requests a change. Never
derive multiplier values from Figma pixel values — see
`references/design-token-bridge.md § Spacing, Sizing, and Roundness`.

### 3e: Chart Series Colors

Charts have no design tokens, and they default to their own brush palette — which will not
match the Figma series colors. Before implementing any chart:

```
theming_get_chart_series_colors({ chartType: "<e.g. category-chart>" })
theming_get_chart_series_colors({ customBrushes: ["#9DE772", "#6DB1FF"] })   // validate Figma colors
```

The first call lists which theme tokens on that chart type accept a brush list; the second
validates the colors you extracted in Phase 1d and flags pairs that are hard to tell apart.
Apply the result through the chart's `brushes` / `outlines` properties (assigned as arrays
on the element, not as attributes).

---

## Phase 4 — Implementation

**Goal:** build the view(s) that match the artboard decomposition from Phase 2.

### Implementation Rules

1. **Never generate component markup without reading its doc or API entry first** (Phase 2b).
2. **Section by section** — layout → navigation → primary content → secondary → data.
3. **Register every custom element you use, once, in the right place.**
   ```typescript
   import { defineComponents, IgcNavbarComponent, IgcCardComponent } from 'igniteui-webcomponents';
   defineComponents(IgcNavbarComponent, IgcCardComponent);
   ```
   Grids use `IgcGridComponent.register()`; charts and gauges use
   `ModuleManager.register(IgcCategoryChartModule, …)` from `igniteui-webcomponents-core`.
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
   functions (chart `brushes`, grid `data`, combo `data`) must be assigned on the element
   (`.data=${rows}` in Lit, `el.brushes = [...]` in plain JS). A serialized attribute
   silently fails.
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
    and `_Input/Box` → default (no `outlined`). There is **no** global injection token
    equivalent — set the attribute on each control, and close any remaining gap with
    `input-group` component tokens rather than internal CSS.
13. **Layout surfaces:** for every entry in the Phase 1g Surfaces table, add a CSS class
    with the recorded `background`, `border-radius`, `padding`, `border`, and `box-shadow`.
    Never leave a section transparent if the Figma surface has a background; never add a
    background to a section that floats on the page background in the design.
14. **Implement only controls that appear in the Figma artboard.** Do not add toolbar
    buttons, actions, or UI elements that look useful but are not in the design context
    output for that artboard.
15. After implementing each major section, save and check in the browser (if the dev server
    is running).

### Layout Strategy

Translate Figma frame dimensions into CSS Grid first:

```css
/* Artboard: 1440×900px, sidebar 280px, content 1160px */
.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 64px 1fr;
  min-height: 100vh;
}
```

Match desktop proportions before adding responsive breakpoints.

> A Lit component's host is `display: inline` by default — set `:host { display: block }`
> (or `grid`/`flex`) or the layout collapses. Charts and grids inside a flexible grid track
> need an explicit height on both the track and the element.

### Project Structure

For a new view generated from a Figma artboard in a CLI-scaffolded project:

```
src/app/
  <artboard-name>/
    <artboard-name>.ts        ← Lit component: template, static styles, registration
    data.ts                   ← typed mock data for the view
    _assets.ts                ← asset manifest from Phase 1h (when the view has images)
```

Register the route in `src/app/app-routing.ts` when the project uses routing. In a
non-Lit project, follow the structure already in the repository.

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
   top bar → sidebar → **every section in the Phase 1g Surfaces table** → footer.
4. Do **not** advance to the next artboard until no Critical/Major issues remain on the
   current one.

### 5d: Measure Computed Styles

For each section with visible differences — and **mandatorily for every entry in the Phase
1g Surfaces table** — use `playwright_browser_evaluate` to extract exact values. Pass code
as a **plain JavaScript function string** using the `function` parameter.

> **Shadow DOM changes every measurement.** `document.querySelector('igc-card .title')`
> returns `null` — the inner nodes live in a shadow root. Measure the host element for box
> metrics, and pierce with `el.shadowRoot.querySelector(...)` (or `::part` targets) for
> internals. `references/validation-patterns.md` provides a reusable deep-query helper —
> use it instead of writing ad-hoc selectors.

**Surfaces audit (mandatory for every page):** for every section in the Phase 1g Surfaces
table, assert:
- `backgroundColor` is **not** `rgba(0, 0, 0, 0)` when the surface has a background color
- `backgroundColor` **is** `rgba(0, 0, 0, 0)` when the design shows the section floating on
  the page background
- all child elements shown inside the surface card in Figma are enclosed within the card's
  bounding rect in the DOM

**Action controls audit (mandatory for every page):** count and name all visible action
buttons and toolbar controls, including those inside shadow roots. Compare against the
Phase 1d inventory — any control not recorded in the Figma design context is fabricated and
must be removed.

**Registration audit:** assert that every `igc-*` tag used on the page is a defined custom
element (`customElements.get(tag)`); an undefined tag means a missing registration.

Compare all returned values against the Figma spec from Phase 1d.

### 5e: Classify and Report Mismatches

| Severity     | Category        | Example                                   | Action                      |
| ------------ | --------------- | ----------------------------------------- | --------------------------- |
| **Critical** | Missing element | Button in Figma, absent in code           | Auto-fix                    |
| **Major**    | Wrong component | Figma shows dropdown, code has text input | Auto-fix                    |
| **Minor**    | Spacing off     | 24px gap in Figma, 16px in code           | Auto-fix if straightforward |
| **Cosmetic** | Color shade     | `#333` vs `#2d2d2d`                       | Report only                 |

For each mismatch, produce:

```
ISSUE: <description>
LOCATION: <section or component>
FIGMA: <spec value>
RENDERED: <measured value>
SEVERITY: <Critical / Major / Minor / Cosmetic>
FIX: <specific code change>
```

### 5f: Apply Corrections

Fix Critical and Major issues immediately. After applying fixes, re-navigate and take a
fresh screenshot to confirm:

```
playwright_browser_navigate({ url: "<target route>" })
playwright_browser_take_screenshot({ type: "png" })
```

Repeat the measure → fix → re-verify loop until no Critical or Major issues remain.

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
  variant is connected before Phase 1.
- **Phase 2b before code.** Never write a tag, attribute, or slot you have not read from a
  doc or API entry. Doc names are not tag names.
- **Register what you use.** An unregistered element fails silently.
- **Phase 1c screenshots are immutable ground truth.** Download them; never overwrite them.
- **Re-navigate after resize** in Phase 5 to avoid Playwright's browser reset bug.
- **Respect the shadow boundary** — tokens and parts, never internal class names.
- **Match the theming output format to the project** — CSS by default, Sass only when
  configured.
- **Rate-limit Figma MCP calls.** Use `figma_get_metadata` for discovery, then targeted
  `figma_get_design_context` per artboard, and `figma_get_variable_defs` once per file.
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

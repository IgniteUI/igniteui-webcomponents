# Figma Design Exploration

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 1 to explore the Figma design and to capture all data that implementation and validation need. Read it in full before the first Figma MCP call.

**Goal:** understand the full design structure, and capture all data for implementation and validation before you write code.

> **Rate-limit awareness:** Figma MCP limits depend on the **seat**, not only the plan (as published in September 2026; verify at https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/): **View/Collab seats** get up to 6 calls/month (20 on Starter). **Dev/Full seats** get 200/day (Starter, Professional) or 600/day (Organization, Enterprise), with 10–20/min.
>
> Estimated call budget for a 5-artboard design: `figma_get_metadata` ×2 + `figma_get_screenshot` ×5 + `figma_get_design_context` ×5 + `figma_get_variable_defs` ×1 per target page + `figma_get_code_connect_map` ×5 + `figma_get_libraries` ×1 = **~19 calls**. Retries and sparse-response follow-up calls increase this number. **Compare the estimate with the user's remaining quota before you start.**
>
> On a View/Collab seat (6/month on Professional and above), possibly even one artboard does not fit. The Starter View/Collab limit (20/month) is sufficient for a small design with no retries. If the estimate does not fit, tell the user. Then suggest a Dev/Full seat, or the REST API with a personal access token for metadata and assets. Strategies:
> 1. Call `figma_get_variable_defs` once per **target page**, not once per artboard. It returns the variables used inside the node that you pass, so one page-level call covers every artboard on that page.
> 2. If the quota is small, give `figma_get_design_context` priority over additional screenshots.
> 3. For large files, you can implement one artboard in each monthly budget cycle.
>
> Use `figma_get_metadata` first to find the structure at a low cost. Then call `figma_get_design_context` only for the artboards that you will implement.

## Before the First Call: Determine the Figma MCP Variant

Figma has two official MCP servers (setup: `mcp-setup.md § 1. Figma MCP`). Identify which one is connected **before** Phase 1, because the server decides how you address artboards.

| Variant | How to recognize it | How you drive it |
| --- | --- | --- |
| **Remote** | Configured URL `https://mcp.figma.com/mcp`; the tools take `fileKey` | Pass `fileKey` and a `nodeId` (page or artboard) on **every** call. You can move between artboards without the user's help. |
| **Desktop** | Configured URL `http://127.0.0.1:3845/mcp`; the tools take no `fileKey` | Works only on the file **open in the Figma desktop app**. Pass the `nodeId` from a frame link, or use the current selection. |

If both variants are available, use the remote variant. Ask the user once for the file URL:

```
https://figma.com/design/:fileKey/:fileName?node-id=1-2   →   fileKey = ":fileKey", nodeId = "1:2"
```

On the remote variant, always pass both `fileKey` and `nodeId`, also when the schema marks `nodeId` as optional. The server does not reliably support calls without a node.

On the desktop variant:

1. Make sure the user has the design file **open** in the desktop app.
2. If the user can share frame links (right-click → **Copy link to selection**), pass the `nodeId` of each frame. Then **check that the response describes the requested frame** (same name and size as in the Phase 1a metadata).
3. If the response describes a different node, or the user cannot share links, use the selection instead. Ask *"In Figma, please click the **[Artboard Name]** frame to select it, then confirm."* Wait for confirmation, then call the tool with no node. Never batch selection-based calls, because each call depends on what the user has selected at that moment.

## 1a: Discover Pages and Artboards

List the pages, then get the artboard tree of each relevant page. The calls are different for each variant:

```
// Remote variant: fileKey and nodeId are both required
figma_get_metadata({ fileKey: "<fileKey>", nodeId: "<pageId>" })

// Desktop variant: a nodeId from a page or frame link, or no arguments to use the current selection
figma_get_metadata({ nodeId: "<pageId>" })
figma_get_metadata({})
```

**Remote variant.** Choose the starting `nodeId` like this:

1. If the shared URL has a `node-id`, use it (replace `-` with `:`, for example `1-2` → `1:2`). URL format: `https://figma.com/design/:fileKey/:name?node-id=1-2`.
2. Otherwise, list the pages with the REST API when a token is available. It uses no MCP quota: `GET https://api.figma.com/v1/files/:fileKey?depth=1` returns `document.children[]` with each page's `id` and `name`.
3. Otherwise, ask the user to copy the link to the page or a frame (right-click → **Copy link to selection**). Then take its `node-id`.

If that node is a single frame and not a page, the response covers only the subtree of that frame. To see its sibling artboards, get the page's `id` (step 2 or 3), and call `figma_get_metadata` again with it. Repeat for each page that looks relevant.

**Desktop variant.** The user must have the file open in the desktop app. If you have a link to the page or a frame, pass its `nodeId` and check the response. Otherwise, ask the user to open the relevant page and select its top-level frames (or the page in the Layers panel). Then call `figma_get_metadata({})`. Repeat for each relevant page, and wait for confirmation each time.

## 1b: Select Target Artboards

If there are multiple pages or artboards, show the user a list:

> "I found these artboards in your Figma file:
>
> - Page 1: [list artboard names + node IDs]
> - Page 2: [list artboard names + node IDs]
>
> Which artboards should I implement? (You can say 'all' or list specific names.)"

Wait for confirmation before you continue.

## 1c: Capture Reference Screenshots

For each target artboard:

1. **Remote variant:** call `figma_get_screenshot({ fileKey: "<fileKey>", nodeId: "<artboardId>", maxDimension: 2048 })`. **Desktop variant:** call `figma_get_screenshot({ nodeId: "<artboardId>" })` and check that the image shows the requested artboard. If it does not, or you have no node ID, ask the user to select the artboard. Wait for confirmation, then call `figma_get_screenshot({})`. Do **not** batch selection-based calls.
2. **Save each screenshot to disk** (for example, `.figma-reference/<artboard-name>.png`). Phase 5 compares against these files. If the tool returns a URL, download it immediately, because the URL is short-lived. The tool can return the image inline, and you possibly cannot write it to disk. In that case, export the node through the REST API when a token is available (`GET /v1/images/:fileKey?ids=<nodeId>&format=png&scale=2`, see `asset-extraction.md`). If you have no token, keep the image in context for Phase 5.

   Record `{ artboardName, nodeId, file, width, height }`.

After you capture all artboards, confirm the count:

> *"I have N reference screenshots: [list artboard names]. Proceeding to design context extraction."*

If screenshots are missing, capture them again. On the remote server, use the `nodeId`. On the desktop server, ask the user to select the artboard.

> Never skip this step. The screenshots are your ground truth for Phase 5 validation.

## 1d: Extract Design Context

> **Output format:** `figma_get_design_context` returns **React + Tailwind CSS reference code**, not structured Web Components metadata. Do **not** copy that code into the project. Read the JSX to extract the information below. Asset URLs in the output (localhost on the desktop server, https on the remote server) are short-lived previews. Do **not** use them as final assets (see Phase 1h and `references/asset-extraction.md`).

For **each** target artboard:

1. On the remote variant, pass `fileKey` and `nodeId`. On the desktop variant, pass the `nodeId` and check the response, or use the selection instead (see [Before the First Call](#before-the-first-call-determine-the-figma-mcp-variant)).
2. Call:
   ```
   figma_get_design_context({
     fileKey: "<fileKey>",     // remote variant only
     nodeId: "<artboardId>",   // both variants (desktop: check the response)
   })
   ```
3. From the React+Tailwind output, extract:

   - **Component layer names and props** — the `data-name` attributes and any component props or variant values in the JSX. Phase 1f classifies and normalizes them.
   - **Layout structure** — `flex`, `grid`, `gap-*`, `p-*`, `w-*`, `h-*` Tailwind classes on container divs
   - **Typography** — `font-['...']`, `text-[...]`, `font-weight` classes
   - **Surface colors** — `bg-[#XXXXXX]` classes on container `<div>` elements that wrap major sections (these become plain `<div>` wrappers in the view, not Ignite UI components)
   - **Border/roundness** — `rounded-[...]`, `border`, `border-[...]` classes on containers and cards
   - **Input type variants** *(Tier A only)* — look for hidden zero-size nodes (`size-[0.5px]`) whose `data-name` contains a component type (for example, `"Date Picker Type"`, `"Combo Input"`). These nodes are the Indigo.Design kit's **variant indicator nodes**. Their name encodes the active input variant (border/line/box) for that component. For other kits, read the field style from its variant property or its visuals (outlined / filled / underlined, label floating or above). Web Components show this as the boolean `outlined` attribute, not as a three-way type (SKILL.md Phase 4, rule 12).
   - **Chart series colors** — for any chart layer, note the fill colors on its series paths
   - **Color census** — which colors appear on which kinds of element: high-emphasis button fills, page and card backgrounds, borders, primary and secondary text, error states. For Tier B/C designs, Phase 3 seeds the palette from this census (see `design-token-bridge.md § B2`), not from variable names.
   - **Measured control heights** — button, input, and list-row heights. Phase 3 uses them to pick `--ig-size`.
   - **Action controls** — list every button, icon button, and toolbar action that is visible in the artboard. This list is your authoritative inventory. Do not add actions that are not in the design
   - **Provenance signals** — library/source file names (for example, `Indigo.Design UI Kit for Material`, `Material 3 Design Kit`, `shadcn/ui`), naming conventions (`_Button/…` vs `Button` with `Variant=…`), and un-componentized frames. Phase 1f uses them to set a tier for each instance.

4. Record all surface containers for **Table B — Layout Surfaces** (Phase 1g).

## 1e: Extract Design Tokens

> `figma_get_variable_defs` returns the variables and styles **used inside the node you pass** (or the current selection), not every variable in the file. Call it **once per target page**, with the page's node ID. One call covers every target artboard on the page, so you do not use a call for each artboard. If the targets are on two pages, call it twice.

```
// Remote variant
figma_get_variable_defs({ fileKey: "<fileKey>", nodeId: "<pageId>" })

// Desktop variant: the page's nodeId (check the response), or select the page and pass nothing
figma_get_variable_defs({ nodeId: "<pageId>" })
figma_get_variable_defs({})
```

The response contains a map of variable names to values, for example:

```
"color/primary/500": "#6200EE"
"color/surface": "#FFFFFF"
"typography/body/font-family": "Roboto"
```

Use `references/design-token-bridge.md` to map color and typography variables to Ignite UI theming inputs in Phase 3. Third-party kits name variables differently (`md.sys.color.primary`, `Colors/Brand/600`, `colorBrandBackground`, `primary-foreground`, …). Record them without changes. Phase 3 matches them to roles by **usage** (the Phase 1d color census), not by name.

Files without variables are normal for Tier C designs. For these files, the color census gives every seed. Do **not** try to map Figma spacing or sizing values. See `references/design-token-bridge.md § Spacing, Sizing, and Roundness` for the reason.

## 1f: Classify Provenance and Normalize Components

Read [design-provenance.md](design-provenance.md) in full.

1. Call `figma_get_libraries` **once per file**, if the connected server has it. The subscribed library names (`Indigo.Design UI Kit for Material`, `Material 3 Design Kit`, `shadcn/ui`, an in-house library) are the fastest provenance signal.
2. Check for Code Connect mappings:

   ```
   figma_get_code_connect_map({ fileKey: "<fileKey>", nodeId: "<artboardId>" })      // remote variant
   figma_get_code_connect_map({ nodeId: "<artboardId>" })                            // desktop variant
   ```

   Mappings are strong evidence of a component's **role and props**. They can point to **another library** (for example, a shadcn kit connected to `@/components/ui/button`). Never copy their imports or tags. The target is always Ignite UI for Web Components.

3. Classify **every** component-like layer as **Tier A** (Indigo.Design kit), **Tier B** (any other component library), or **Tier C** (un-componentized). Classify per instance, not per file.
4. Use their variant properties to normalize Tier B instances to a canonical role + emphasis/style + measured height. When names are ambiguous and a file key and token are available, read the exact `componentProperties` from the REST API (`design-provenance.md § Step 1`).
5. Infer Tier C roles from structure and visuals. Mark them **low confidence**.
6. Record the dominant tier. It selects the Phase 3 theming path (A or B).

## 1g: Build the Decomposition Table

Before you write code, produce **two tables** for **each artboard**.

### Table A — Ignite UI Components

| Figma Layer Name | Tier | Kit / Source | Canonical Role + Props | Ignite UI Tag | Package | Confidence | Token Work | Suspected Anatomy Deltas | Data Type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| _e.g._ `_NavBar` | A | Indigo.Design (Material) | `app-bar` | `<igc-navbar>` | `igniteui-webcomponents` | high | — | — | n/a |
| _e.g._ `_Grid/Default` | A | Indigo.Design (Material) | `data-table` | `<igc-grid>` | `igniteui-webcomponents-grids` | high | — | — | Tabular records |
| _e.g._ `Button` (`Variant=outline, Size=sm`) | B | shadcn/ui | `button` · medium · 32px | `<igc-button variant="outlined">` | `igniteui-webcomponents` | high | radius, casing, size | — | n/a |
| _e.g._ `Text field` (`Style=Filled`) | B | M3 Design Kit | `text-field` · filled · label-floating · 56px | `<igc-input>` | `igniteui-webcomponents` | high | height, fill color | — | n/a |
| _e.g._ `Segmented button` | B | M3 Design Kit | `toggle-group` · 40px | `<igc-button-group>` | `igniteui-webcomponents` | high | radius, colors | check icon on the selected segment | n/a |
| _e.g._ `Frame 427` | C | — | `tag` · pill · 24px | `<igc-badge>` | `igniteui-webcomponents` | low | radius, colors | — (confirm the role) | n/a |

The **Package** column is not optional in Web Components. General UI (`igniteui-webcomponents`, MIT), grids, charts, and dock manager ship as separate packages. The commercial packages come in trial and `@infragistics` licensed variants.

- **Token Work** lists what Phase 3 must set: colors, radius, borders, casing, size. These are implementation work. They are **never** anatomy deltas and never become Accepted.
- **Suspected Anatomy Deltas** lists only structural differences that tokens, documented `::part(...)` selectors, and slotted content cannot close. At this point, they are only suspicions. You know what Ignite UI renders only after you read its doc in Phase 2b. Confirm them in the Phase 2d ledger.

Use plain semantic HTML only when no Ignite UI component can match the layer. Make this decision after you read `references/figma-component-map.md`. Document the reason inline.

### Table B — Layout Surfaces

Record every **non-`igc-*` container** that has visual properties (background color, border, padding, shadow). These containers are plain `<div>` wrappers in the view, not Ignite UI components. But they are critical to visual fidelity. Fill this table from the `bg-[...]`, `rounded-[...]`, `border`, `p-[...]`, and `shadow-[...]` Tailwind classes on container divs. These classes are in the Phase 1d design context output.

| Figma Frame / Container Name | Background | Border-Radius | Padding | Border | Shadow | Encloses (child sections) |
| ---------------------------- | ---------- | ------------- | ------- | ------ | ------ | ------------------------- |
| _e.g._ `Budget Categories`  | `#222222`  | `4px`         | `24px`  | none   | none   | Categories list, Add button |
| _e.g._ `Friend Card`        | `#222222`  | `8px`         | `24px 16px` | `1px solid #333` | none | Avatar, name, phone, email, buttons |

> **Rule:** if a section is on a surface in Figma, it **must** have that background in the implementation. (A section is on a surface when its container has a non-transparent background.) If a section floats on the page background (transparent), do **not** add a surface wrapper. Never infer the surface structure from another page. Always derive it from the design context of the artboard that you implement.

Show both tables to the user for review before you continue. List the **low-confidence** mappings first, and ask the user to confirm or correct them. After Phase 4, a wrong role is the most expensive mistake to fix.

## 1h: Extract Image Assets

Read [references/asset-extraction.md](asset-extraction.md) in full before you start an extraction.

**Zero-placeholder policy:** before Phase 4, extract every image that is visible in the Figma design. Commit each image to the project's assets directory. Do not use gradient placeholders.

**Step 0 — File key and token.** Reuse the file key from Phase 1 (the remote server always has one). On the desktop server, if you have no file key, ask the user for the file URL (Figma desktop: right-click the file tab → **Copy link**). Tier 1 also needs a REST API token (`mcp-setup.md § Personal access token`). Without both, use Tier 2 or 3.

From the decomposition tables, identify every layer that is a **static image asset** (photo, background, logo, custom icon, illustration), not an Ignite UI component. Do **not** extract component instances that Table A maps to a component, from any kit. Also do not extract icons that a registerable icon package supplies (`figma-component-map.md § Icons`, which also covers third-party kit icon sets).

**Use the four-tier decision tree from `asset-extraction.md`** (these asset tiers 1–4 are unrelated to the provenance Tiers A–C):

| Tier | Method | When to use |
| ---- | ------ | ----------- |
| **1** | REST API `/v1/files/:key/images` (Method A) or `/v1/images/:key` (Method B) | `FILE_KEY` **and** `FIGMA_TOKEN` available — always the highest fidelity |
| **2** | Download the asset URLs from `figma_get_design_context` (localhost on desktop, https on remote), or `figma_download_assets` on remote | No REST access; the design context returned asset URLs |
| **3** | `figma_get_screenshot` per node (`nodeId`, or the selection on desktop) | No REST access and no asset URL for this node |
| **4** | CSS gradient/color placeholder with `// TODO` comment | Only for confirmed pure-color fills — never as a shortcut |

Save assets in the project's static directory. In a CLI-scaffolded Vite project, this is `src/assets/images/` and `src/assets/icons/` (`vite-plugin-static-copy` copies them to the build output). In a stock Vite app, this is `public/`. Use the directory that the project already uses.

Build a concise asset manifest (see `asset-extraction.md § Build an Asset Manifest`), so that the implementation phase uses consistent paths.

If you used Tier 2 or Tier 3 for an asset, tell the user. Identify the assets that need a new export when the file key and a REST API token are available.

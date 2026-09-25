# Asset Extraction from Figma

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 1h to identify and extract image assets from Figma artboards before implementation. Read it in full before calling any extraction tool.
>
> **Zero-placeholder policy:** every image asset visible in the Figma design must be extracted and committed before Phase 4 begins. Gradient placeholders and empty `<div>` boxes are not acceptable. If the highest-fidelity method is unavailable, use the next tier — but always extract something real.

---

## Step 0 — Decide Where Assets Live

Match the project you are in before downloading anything:

| Project shape | Asset directory | Referenced as |
| --- | --- | --- |
| CLI-scaffolded (`igniteui-cli new --framework=webcomponents`) | `src/assets/images/`, `src/assets/icons/` | `/assets/images/hero.jpg` — copied to the build output by `vite-plugin-static-copy` |
| Stock Vite / plain bundler | `public/images/`, `public/icons/` | `/images/hero.jpg` |
| Bundler-processed (hashed) assets | anywhere under `src/` | `import heroUrl from '../assets/hero.jpg'` then bind the URL |

Create the directories before the first `curl`:

```bash
mkdir -p src/assets/images src/assets/icons     # or public/images public/icons
```

---

## Step 1 — Acquire the Figma File Key (Required for the REST API)

The Figma REST API needs a **file key** — the identifier in every Figma file URL — and a **personal access token**. Reuse the file key from Phase 1 when you have it (the remote Figma server always has one). If not, ask:

> "To extract image assets at the highest quality, I need the Figma file key. In the Figma desktop app: right-click the file tab → **Copy link**. The URL looks like `https://www.figma.com/design/ABCDEF1234567890/My-File-Name` — the file key is the segment after `/design/`: **`ABCDEF1234567890`**. If you cannot access it right now, I will use the fallback methods and note which assets need re-exporting at higher quality."

```bash
echo "https://www.figma.com/design/ABCDEF1234567890/My-App" \
  | sed -E 's|.*/design/([^/]+)/.*|\1|'
# → ABCDEF1234567890
export FILE_KEY="ABCDEF1234567890"
export FIGMA_TOKEN="your-personal-access-token"   # REST API only — see below
```

The Figma MCP servers do **not** use a personal access token, so this is a separate token (see `mcp-setup.md § Personal access token`). Ask the user to export it in the agent's shell, and never write it into a project file.

---

## Two Fundamentally Different Types of Image Assets

| Type             | What it is                                                                             | Figma signal                                            | Best extraction method                   |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| **Image fill**   | A photo, texture, or raster image dragged/pasted into Figma, stored as an IMAGE fill    | Layer has a fill of type `IMAGE`; `imageRef` in node data | REST API Method A → original source file |
| **Vector asset** | A logo, icon, or illustration drawn in Figma with vector tools                           | Node type `VECTOR`, `BOOLEAN_OPERATION`, or `GROUP`     | REST API Method B → clean SVG            |

Do **not** confuse either with component instances — from the Indigo.Design UI Kits or any other kit — that Phase 1f mapped to a canonical role. Those become Ignite UI components, not extracted assets.

---

## Step 2 — Identify Image Nodes

### Naming patterns to look for in `figma_get_metadata`

| Naming pattern                                   | Likely asset type | Action                                    |
| ------------------------------------------------ | ----------------- | ----------------------------------------- |
| `_Image`, `_Photo`, `_Picture`, `image`, `photo` | Raster image fill | Extract as PNG                            |
| `_Hero`, `_Banner`, `_Cover`                     | Large raster fill | Extract as PNG (2× scale)                 |
| `_Thumbnail`, `_Avatar`, `_Illustration`         | Raster image fill | Extract as PNG                            |
| `_Logo`, `_Brand`                                | Vector or raster  | If vector: SVG; if raster: PNG            |
| `_Icon/` prefix (custom icons)                   | Custom SVG icon   | Extract as SVG, then **register** it      |
| `_Background`, `_Bg`                             | Large raster fill | Extract as PNG                            |
| `_Art`, `_Pattern`                               | Vector or raster  | Classify before extracting                |

> **Ignore these** — do NOT extract them as image assets:
>
> - Any layer that Table A maps to a component (`_Button`, `_Input`, `Button`, `Text field`, … — kit component instances from any kit)
> - Icon glyphs available from a registerable package (Material Icons Extended, Material Symbols, Lucide, Fluent, …; see `figma-component-map.md § Icons`). Register them with `registerIconFromText` and render `<igc-icon>` instead
> - Artboard/frame boundaries themselves

### Size heuristic

Large rectangles (width or height > 200px) at key layout positions (hero area, sidebar background, card thumbnail slot) are almost always image fills. Small nodes (< 48×48px) with icon-like names are usually SVG icons.

### Confirm with design context

`figma_get_design_context` returns the reference code **plus a JSON block of download URLs for the assets it references**. Each entry confirms the node is a real asset and gives you a directly downloadable URL. Note them — Tier 2 depends on them, and they are short-lived.

---

## Step 3 — Extract at the Highest Available Fidelity

```
Do you have BOTH the FILE_KEY and a FIGMA_TOKEN?
├─ YES → Tier 1 (REST API). Always the best.
└─ NO  → Did figma_get_design_context return an asset URL for this node?
          (desktop server: http://localhost:3845/assets/…; remote server: short-lived https URLs)
          ├─ YES → Tier 2 (download that URL now).
          └─ NO  → Can you render the node on its own?
                    ├─ YES → Tier 3 (figma_get_screenshot per node).
                    └─ NO  → Tier 4 (CSS placeholder + TODO — last resort only).
```

The remote server also offers `figma_download_assets` (up to 20 nodes per call, exports and original images). If it is in the tool list, use it for Tier 2 when there is no FIGMA_TOKEN.

**At the end of Phase 1h, if you used Tier 2 or Tier 3 for any asset:**

> Tell the user: "The following assets were extracted at reduced quality because the Figma REST API was not available (no file key or no personal access token): [list]. To replace them with the original source files, run the Tier 1 REST API commands once you have both."

---

### Tier 1 — REST API (Highest Fidelity)

**Requires:** `FILE_KEY` and `FIGMA_TOKEN`.

#### Method A — Original Image Fills

Downloads the **original uploaded file** at native resolution — never a re-render.

```bash
# A.1 — all image fill URLs in the file
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/images" \
  -o /tmp/figma_image_fills.json
# Response: { "images": { "<imageRef>": "<cdn-url>", ... } }

# A.2 — node fill data, to match imageRef → node
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=$NODE_IDS" \
  -o /tmp/figma_nodes.json
# Look for: "fills": [{ "type": "IMAGE", "imageRef": "abc123" }]

# A.3 — download
IMAGE_URL=$(jq -r '.images["<imageRef>"]' /tmp/figma_image_fills.json)
curl -sL "$IMAGE_URL" -o src/assets/images/hero-background.jpg
```

> **URL expiry:** image fill URLs expire in **14 days**. Download during the session.

#### Method B — Node Export (SVG, PNG, JPG)

```bash
# SVG export (logos, icons, illustrations)
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$NODE_IDS&format=svg&svg_outline_text=false&contents_only=true" \
  -o /tmp/figma_svg_export.json

jq -r '.images | to_entries[] | "\(.key)\t\(.value)"' /tmp/figma_svg_export.json | \
while IFS=$'\t' read -r nodeId url; do
  filename="$(echo "$nodeId" | tr ':' '-').svg"
  curl -sL "$url" -o "src/assets/icons/$filename"
done

# PNG export at 2× (hero banners, raster compositions)
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$NODE_IDS&format=png&scale=2&contents_only=true" \
  -o /tmp/figma_png_export.json

jq -r '.images | to_entries[] | "\(.key)\t\(.value)"' /tmp/figma_png_export.json | \
while IFS=$'\t' read -r nodeId url; do
  filename="$(echo "$nodeId" | tr ':' '-').png"
  curl -sL "$url" -o "src/assets/images/$filename"
done
```

| Parameter          | Value   | When to use                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| `format`           | `svg`   | Logos, icons, vector illustrations                   |
| `format`           | `png`   | Hero backgrounds, thumbnails — always pair `scale=2` |
| `format`           | `jpg`   | Photos without transparency — use `scale=2`          |
| `scale`            | `2`     | **Always for PNG/JPG** — retina-quality output       |
| `svg_outline_text` | `false` | Keep text as `<text>` elements (smaller, accessible) |
| `contents_only`    | `true`  | Render the node in isolation                         |

> **Export URL expiry:** export URLs expire in **30 days**. Download immediately, then rename each file by purpose.

---

### Tier 2 — Download the Design Context Asset URLs

**Use when:** Tier 1 is unavailable, but `figma_get_design_context` returned asset URLs for the node.

```bash
curl -sL "<asset-url-from-design-context>" -o src/assets/images/hero-background.png
curl -sL "<asset-url-from-design-context>" -o src/assets/icons/logo.svg
```

Where the URLs appear in the response:

- the JSON block of download URLs accompanying the reference code, and
- `const imgXxx = "…";` declarations at the top of the generated code, referenced by `<img src={imgXxx} />` or `background-image`

**Limitations:** these are renderer outputs, not originals — vectors may come back rasterized, and the URLs expire (a desktop-server URL dies when the Figma desktop app closes; a remote-server URL expires after a short time). Download before doing anything else, rename descriptively, and flag them in the manifest:

```typescript
// TODO: re-export via Tier 1 REST API once FILE_KEY and FIGMA_TOKEN are available
heroBg: '/assets/images/hero-background.png',
```

---

### Tier 3 — `figma_get_screenshot` per Node

Address the node the same way as in Phase 1 (`figma-exploration.md § Before the First Call`):

```
// Remote server
figma_get_screenshot({ fileKey: "<fileKey>", nodeId: "<nodeId>", maxDimension: 2048 })
// Desktop server: the node ID (check the image), or ask the user to select the layer
figma_get_screenshot({ nodeId: "<nodeId>", maxDimension: 2048 })
figma_get_screenshot({})
```

If the response is a URL, download it straight into the assets directory (it is short-lived); if the image comes back inline, save it from there. Raise `maxDimension` for detail.

**Limitations:** a render, not a source file; vectors are rasterized; may include surrounding canvas. Label them:

```typescript
// TODO: re-export at higher fidelity via Tier 1 — current version is a node render
heroBg: '/assets/images/hero-background.png',
```

---

### Tier 4 — CSS Fallback (Last Resort Only)

**Use only when** the layer is confirmed to be a pure color fill or gradient — never because extraction felt difficult.

```css
.hero-banner {
  /* TODO: replace with real asset — extraction blocked (no REST token and no design-context asset URL) */
  background: linear-gradient(135deg, #0d1b3e 0%, #1a0533 100%);
}
```

Include every Tier 4 use in the post-session handoff notes.

---

## Step 4 — Build an Asset Manifest

```typescript
// src/app/<page>/_assets.ts — generated during Phase 1h

export const PAGE_ASSETS = {
  // Figma node 123:456 — "Hero/Background"  · Tier 1 REST API PNG @2×
  heroBg: '/assets/images/hero-background.jpg',

  // Figma node 789:012 — "_Logo/Main"       · Tier 1 REST API SVG
  logo: '/assets/icons/logo.svg',

  // Figma node 345:678 — "Card/Thumbnail"   · Tier 2 (TODO: re-export)
  cardThumbnail: '/assets/images/card-thumbnail.png',
} as const;
```

Name files by layer purpose, never by node ID.

---

## Step 5 — Using Assets in Web Components Views

### Static images in a Lit template

```typescript
import { PAGE_ASSETS } from './_assets.js';

render() {
  return html`
    <img
      src=${PAGE_ASSETS.heroBg}
      alt="Dashboard hero background"
      width="1440" height="600"
      fetchpriority="high"
    />
  `;
}
```

Always set `width`/`height` (or a CSS aspect ratio) to avoid layout shift, and `alt` for the Phase 5g accessibility check. Use `loading="lazy"` for below-the-fold images and `fetchpriority="high"` for the LCP image.

### Background images in component styles

```typescript
static styles = css`
  .dashboard-hero {
    background-image: url('/assets/images/hero-background.jpg');
    background-size: cover;
    background-position: center;
  }
`;
```

> **Use root-absolute paths inside `css`.** A Lit `css` template is not a stylesheet file on disk — relative URLs resolve against the *document*, not the component, so `url('../x.png')` breaks on nested routes. Either use `/assets/...`, or let the bundler hash the asset:
>
> ```typescript
> import heroUrl from '../../assets/images/hero-background.jpg';
> // then: style=${`background-image:url(${heroUrl})`} or a CSS custom property
> ```

### Images inside Ignite UI components

Use the component's slot rather than absolute positioning:

```html
<igc-card>
  <igc-card-media><img src="/assets/images/card-thumbnail.png" alt="" /></igc-card-media>
</igc-card>

<igc-avatar src="/assets/images/person.jpg" alt="Jane Doe"></igc-avatar>
```

### Icons are registered, not extracted

```typescript
import { registerIconFromText } from 'igniteui-webcomponents';
import logoSvg from '../../assets/icons/logo.svg?raw';   // Vite: ?raw gives the SVG text

registerIconFromText('brand-logo', logoSvg, 'app');
```

```html
<igc-icon name="brand-logo" collection="app"></igc-icon>
```

Registering an extracted SVG lets it inherit `color` and the theme, which a plain `<img>` cannot. See `figma-component-map.md § Icons` for the Material Icons Extended setup.

---

## Pitfalls

| Pitfall                                                      | Consequence                                                      | Fix                                                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Skipping asset extraction (gradient placeholders)            | Implementation looks nothing like the design; Phase 5 fails      | Always use at least Tier 2 or Tier 3 — never skip                                    |
| Not asking for the file key before starting                  | Falls back to Tier 2/3 when Tier 1 was possible                  | Reuse the Phase 1 file key, or ask for it in Step 1, and ask for a REST token      |
| Leaving design-context or CDN URLs in source code            | URLs expire in hours to 30 days; production breaks               | Download during the session; reference only local paths                              |
| Naming assets by node ID (`node-123-456.png`)                | Unmaintainable                                                   | Name by purpose: `hero-background.jpg`, `company-logo.svg`                            |
| Relative `url()` inside a Lit `css` template                 | 404s on nested routes — the URL resolves against the document     | Use `/assets/...` or a bundler import                                                |
| Putting assets in `src/` in a stock Vite app                 | Served in dev, but not emitted by `vite build` unless imported or copied (the Ignite UI CLI scaffold copies `src/assets`); 404 in production | Use `public/`, or import the asset so the bundler emits it                            |
| Using a node screenshot for an SVG logo                      | Rasterized logo, no scaling, no theming                          | Tier 1 Method B with `format=svg`                                                     |
| Exporting PNG at `scale=1`                                   | Blurry on HiDPI screens                                          | Always `scale=2`                                                                      |
| `svg_outline_text=true` (the default)                        | Text converted to paths; larger file; no accessibility           | Set `svg_outline_text=false`                                                          |
| Extracting kit component instances as images                 | A static picture instead of a working component                  | Check Table A / `figma-component-map.md` — those are components, whatever kit they came from |
| Extracting registerable icons as PNGs                        | Icons cannot inherit theme color                                 | Register the SVG and use `<igc-icon>`                                                 |
| Extracting background colors or gradients as images          | Bundle bloat, breaks theming                                     | Colors → palette variables and component tokens                                       |
| Not creating asset directories before `curl`                 | Silent failures or files in the wrong place                      | `mkdir -p` first                                                                      |

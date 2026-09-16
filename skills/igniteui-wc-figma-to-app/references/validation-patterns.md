# Playwright Visual Validation Patterns — Web Components

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 5 for the measurement-driven validation loop. Read it in full
> before calling any Playwright tool.

---

## Core Philosophy

**Measure, don't eyeball.** The goal is not visual regression (did this change since last
week?) but design fidelity (does this match the Figma spec?). Screenshots give you the
gestalt; `playwright_browser_evaluate` gives you the numbers; numbers drive corrections.

**The Web Components twist:** almost everything you want to measure lives inside a shadow
root. `document.querySelector('igc-card .title')` returns `null` — not because the element
is missing, but because the selector cannot cross the boundary. Every snippet below is
shadow-aware. Use them instead of writing ad-hoc selectors.

---

## Phase 5 Tool Sequence

```
1.  playwright_browser_navigate       → open the app at the target route
2.  playwright_browser_console_messages → catch startup/registration errors
3.  playwright_browser_resize          → match the Figma artboard dimensions
4.  playwright_browser_navigate        → re-navigate after resize (required)
5.  playwright_browser_evaluate        → registration + theme audit (fail fast)
6.  playwright_browser_take_screenshot → capture the full viewport
7.  [Visual comparison]                → against the Phase 1c reference, section by section
8.  playwright_browser_evaluate        → measure EVERY section in the Phase 1g Surfaces table
9.  [Surfaces audit]                   → assert background, radius, padding, border
10. [Action controls audit]            → count and name every control, shadow roots included
11. [Input variant audit]              → check `outlined` against the Phase 1d variant
12. [Classify mismatches]              → severity table
13. [Apply fixes]                      → edit source files
14. playwright_browser_navigate        → reload after fixes
15. Repeat 6–14 until no Critical/Major issues remain
16. Do NOT advance to the next artboard until all checks pass on this one
17. playwright_browser_snapshot        → final accessibility check
```

---

## Known Pitfalls

### 1. Viewport reset after resize

After `playwright_browser_resize`, the browser may navigate itself to `about:blank`, and
subsequent screenshots and measurements come back empty.

```
playwright_browser_resize({ width: 1440, height: 900 })
playwright_browser_navigate({ url: "http://localhost:5173/dashboard" })
// NOW safe to screenshot and measure
```

### 2. `playwright_browser_evaluate` uses `function`, not `script`

Passing `script` fails with *"Invalid input: expected string, received undefined"*.

```
// WRONG
playwright_browser_evaluate({ script: "return document.title;" })

// CORRECT
playwright_browser_evaluate({ function: "() => document.title" })
```

### 3. Measuring before the components have upgraded

Custom elements upgrade asynchronously, and Lit renders on a microtask. Measuring too early
returns pre-upgrade box metrics (often `height: 0`). Wait for definition and render:

```
playwright_browser_evaluate({
  function: "async () => { const tags = [...new Set([...document.querySelectorAll('*')].map(e => e.tagName.toLowerCase()).filter(t => t.startsWith('igc-')))]; await Promise.all(tags.map(t => customElements.whenDefined(t))); const els = [...document.querySelectorAll('*')].filter(e => e.tagName.startsWith('IGC-')); await Promise.all(els.map(e => e.updateComplete).filter(Boolean)); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return { upgraded: tags.length }; }"
})
```

### 4. An unregistered element fails silently

A missing `defineComponents(...)` produces **no console error** — the tag renders as an
empty inline box. Run the registration audit before blaming CSS.

### 5. Dev server must be running

```
playwright_browser_navigate({ url: "http://localhost:5173" })
playwright_browser_console_messages()
```

`ERR_CONNECTION_REFUSED` or a blank page means the Vite dev server is not running — ask the
user to run `npm start`. Note the port: Vite defaults to **5173**.

---

## The Deep-Query Helper

Every measurement snippet below assumes this helper. It walks shadow roots, so a selector
like `igc-card >>> [part="header"]` resolves.

```javascript
// Paste as the first statements of any evaluate() function.
const deepQuery = (path, root = document) =>
  path.split('>>>').map(s => s.trim()).reduce(
    (node, sel) => node && (node.shadowRoot || node).querySelector(sel),
    root
  );

const deepQueryAll = (sel, root = document) => {
  const out = [];
  const walk = (node) => {
    if (!node) return;
    out.push(...node.querySelectorAll(sel));
    node.querySelectorAll('*').forEach(el => el.shadowRoot && walk(el.shadowRoot));
  };
  walk(root);
  return out;
};
```

Prefer measuring the **host element** (`igc-card`) for box metrics — width, height,
position, margin — and pierce only for internals that the design calls out (header height,
row padding). When you must pierce, target documented `::part(...)` names from `get_doc`,
never internal class names.

---

## Reusable Measurement Snippets

All snippets use the `function` parameter.

### Registration + theme audit (run first, every page)

```
playwright_browser_evaluate({
  function: "() => { const tags = [...new Set(deepQueryAll('*').map(e => e.tagName.toLowerCase()).filter(t => t.startsWith('igc-')))]; const undefinedTags = tags.filter(t => !customElements.get(t)); const s = getComputedStyle(document.documentElement); return { tags, undefinedTags, theme: s.getPropertyValue('--ig-theme').trim(), variant: s.getPropertyValue('--ig-theme-variant').trim(), primary500: s.getPropertyValue('--ig-primary-500').trim(), surface500: s.getPropertyValue('--ig-surface-500').trim(), fontFamily: s.getPropertyValue('--ig-font-family').trim() }; }"
})
```

Assert: `undefinedTags` is empty; `theme` and `variant` match the design system and variant
resolved in Phase 3. An empty `theme` means no theme CSS is loaded — components silently
fall back to `bootstrap` / `light`.

### Measure a single element (shadow-aware)

```
playwright_browser_evaluate({
  function: "() => { const deepQuery = (path, root = document) => path.split('>>>').map(s => s.trim()).reduce((n, sel) => n && (n.shadowRoot || n).querySelector(sel), root); const el = deepQuery('<YOUR_SELECTOR_PATH>'); if (!el) return { error: 'element not found' }; const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return { fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, color: s.color, backgroundColor: s.backgroundColor, padding: s.padding, margin: s.margin, gap: s.gap, borderRadius: s.borderRadius, border: s.border, boxShadow: s.boxShadow, width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) }; }"
})
```

> A host element with `display: inline` (the Lit default) reports a misleading box. If width
> or height look wrong, check for a missing `:host { display: block }` before chasing padding.

### Surfaces audit (mandatory — every page, every Phase 1g surface)

```
playwright_browser_evaluate({
  function: "() => { const sections = { /* fill from the Phase 1g Surfaces table */ sectionA: '.section-a', sectionB: '.section-b' }; const deepQuery = (path, root = document) => path.split('>>>').map(s => s.trim()).reduce((n, sel) => n && (n.shadowRoot || n).querySelector(sel), root); const out = {}; for (const [key, sel] of Object.entries(sections)) { const el = deepQuery(sel); if (!el) { out[key] = 'NOT FOUND'; continue; } const s = getComputedStyle(el); const r = el.getBoundingClientRect(); out[key] = { bg: s.backgroundColor, radius: s.borderRadius, padding: s.padding, border: s.border, shadow: s.boxShadow, w: Math.round(r.width), h: Math.round(r.height) }; } return out; }"
})
```

**Assert for each entry:**

- Figma surface has a background → `bg !== 'rgba(0, 0, 0, 0)'`
- Figma section floats on the page background → `bg === 'rgba(0, 0, 0, 0)'` (do not over-surface)
- `radius`, `padding`, `border`, `shadow` match the Phase 1g values
- children shown inside the card in Figma are inside the card's bounding rect in the DOM

### Action controls audit (mandatory, every page)

```
playwright_browser_evaluate({
  function: "() => { const out = []; const walk = (root) => { root.querySelectorAll('igc-button, igc-icon-button, button, [role=button]').forEach(b => { if (b.tagName === 'BUTTON' && b.getRootNode().host?.matches('igc-button, igc-icon-button')) return; out.push((b.textContent || '').trim().replace(/\\s+/g, ' ') || b.getAttribute('aria-label') || b.getAttribute('name') || '(unlabeled)'); }); root.querySelectorAll('*').forEach(el => el.shadowRoot && walk(el.shadowRoot)); }; walk(document); return { count: out.length, controls: out }; }"
})
```

Compare against the Phase 1d inventory. Any control not in the design context output is
fabricated and must be removed. `(unlabeled)` entries are also an accessibility failure —
icon-only buttons need `aria-label`.

### Input variant audit (every page with form controls)

```
playwright_browser_evaluate({
  function: "() => { const tags = ['igc-input','igc-textarea','igc-mask-input','igc-date-time-input','igc-file-input','igc-select','igc-combo','igc-date-picker','igc-date-range-picker']; const out = {}; tags.forEach(t => { const els = deepQueryAll(t); if (els.length) out[t] = { count: els.length, outlined: els.filter(e => e.hasAttribute('outlined')).length }; }); return out; }"
})
```

Compare against the variant detected in Phase 1d. If the design uses border-style inputs
everywhere, every control should report `outlined === count`.

### Property-binding audit (charts, grids, combos)

```
playwright_browser_evaluate({
  function: "() => { const out = {}; document.querySelectorAll('igc-category-chart, igc-data-chart, igc-pie-chart, igc-grid, igc-grid-lite, igc-combo').forEach((el, i) => { out[el.tagName.toLowerCase() + '#' + i] = { dataLength: Array.isArray(el.dataSource) ? el.dataSource.length : (Array.isArray(el.data) ? el.data.length : null), brushes: el.brushes || null, height: Math.round(el.getBoundingClientRect().height) }; }); return out; }"
})
```

`dataLength: null` means the collection was set as an attribute (or not at all) instead of
as a property. `brushes: null` on a chart means it is still using the default palette, not
the Figma series colors. `height: 0` means the element or its grid track has no height.

### Measure the gap between two elements

```
playwright_browser_evaluate({
  function: "() => { const a = document.querySelector('<SELECTOR_A>'); const b = document.querySelector('<SELECTOR_B>'); if (!a || !b) return { error: 'one or both elements not found' }; const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect(); return { gapBetween: Math.round(rb.top - ra.bottom), aHeight: Math.round(ra.height), bTop: Math.round(rb.top) }; }"
})
```

### Measure typography scale

```
playwright_browser_evaluate({
  function: "() => { const sels = ['h1','h2','h3','p','.subtitle','.caption']; const out = {}; sels.forEach(sel => { const el = document.querySelector(sel); if (el) { const s = getComputedStyle(el); out[sel] = { fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, fontFamily: s.fontFamily }; } }); return out; }"
})
```

### Measure grid layout proportions

```
playwright_browser_evaluate({
  function: "() => { const el = document.querySelector('<LAYOUT_CONTAINER>'); if (!el) return { error: 'layout container not found' }; const s = getComputedStyle(el); return { display: s.display, gridTemplateColumns: s.gridTemplateColumns, gridTemplateRows: s.gridTemplateRows, gap: s.gap, width: Math.round(el.getBoundingClientRect().width) }; }"
})
```

### Inspect a component's parts (when a token override is not landing)

```
playwright_browser_evaluate({
  function: "() => { const host = document.querySelector('<igc-tag>'); if (!host || !host.shadowRoot) return { error: 'host or shadow root not found' }; return [...host.shadowRoot.querySelectorAll('[part]')].map(el => ({ part: el.getAttribute('part'), bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color })); }"
})
```

Use the reported `part` names — they are the supported styling surface when a design token
does not exist for a detail the design requires.

---

## Mismatch Severity Classification

| Severity     | Category                   | Decision rule                                               | Action                      |
| ------------ | -------------------------- | ----------------------------------------------------------- | --------------------------- |
| **Critical** | Missing element            | Present in Figma, absent from DOM                           | Auto-fix                    |
| **Critical** | Unregistered component     | Tag present but `customElements.get()` is undefined         | Auto-fix (add registration) |
| **Critical** | Broken layout              | Overlapping elements, content outside bounds, zero-height   | Auto-fix                    |
| **Critical** | Wrong design system active | `--ig-theme` does not match the Phase 3 resolution          | Auto-fix (theme import)     |
| **Major**    | Wrong component            | Figma shows a combo, code has a select                      | Auto-fix                    |
| **Major**    | Wrong variant              | `variant="flat"` when the design shows contained            | Auto-fix                    |
| **Major**    | Collection not bound       | `data` / `dataSource` / `brushes` set as an attribute       | Auto-fix                    |
| **Minor**    | Spacing off by > 4px       | `gap: 24px` measured, Figma shows `16px`                    | Auto-fix if a single property |
| **Minor**    | Font size wrong by > 2px   | `16px` measured, Figma shows `14px`                         | Auto-fix                    |
| **Cosmetic** | Color shade                | `rgb(50,50,50)` vs `#333333` (perceptually identical)       | Report only                 |
| **Cosmetic** | Spacing off by ≤ 4px       | Rounding or sub-pixel difference                            | Report only                 |

### Mismatch report format

```
ISSUE:    <concise description of the mismatch>
LOCATION: <component/section in the view>
FIGMA:    <value from the design context>
RENDERED: <value measured by Playwright>
SEVERITY: <Critical | Major | Minor | Cosmetic>
FIX:      <specific, one-line code change>
```

Example:

```
ISSUE:    Card surface is transparent
LOCATION: igc-card in the "Budget Categories" section
FIGMA:    background = #222222 (Surfaces table row 1)
RENDERED: backgroundColor = rgba(0, 0, 0, 0)
SEVERITY: Critical
FIX:      create_component_theme("card", tokens: { background: "var(--ig-surface-100)" })
          and apply the generated block — do not set background on a wrapper div.

ISSUE:    Chart series colors are the default palette
LOCATION: igc-category-chart in the "Spending" panel
FIGMA:    series = #9DE772, #6DB1FF
RENDERED: brushes = null
SEVERITY: Major
FIX:      chart.brushes = ['#9DE772', '#6DB1FF'] assigned as a property after validating
          with get_chart_series_colors({ customBrushes: [...] }).
```

---

## Section-by-Section Comparison Checklist

| Section              | What to check                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Top navigation       | Height, background, slotted `start`/`end` content alignment, action icon positions                                       |
| Sidebar / nav drawer | Width (`--menu-full-width`), `position="relative"` vs modal, item spacing, icon + label alignment, selected state          |
| Page header          | Typography size and weight, breadcrumb spacing, action button prominence                                                  |
| Data grid            | Column widths (at least one fluid), header background, row height, cell padding, grid theme CSS actually loaded           |
| Cards / panels       | **Background** (must not be `rgba(0,0,0,0)` when Figma shows a surface), border, radius, shadow, padding                   |
| Surface containers   | Every entry in the Phase 1g Surfaces table; children enclosed within the card's bounding rect                             |
| Form fields          | `outlined` presence matching the Phase 1d variant; label placement; helper text slot                                      |
| Action controls      | Count and names vs the Phase 1d inventory; `aria-label` on icon-only buttons                                              |
| Buttons              | `variant` (flat/outlined/contained/fab), color, typography, padding                                                       |
| Charts               | Chart type, **series colors** (explicit `brushes`), marker visibility, legend placement, non-zero height                  |
| Lists                | Slot usage (`start`/`title`/`subtitle`/`end`), item height, divider treatment                                             |
| Footer / paginator   | Alignment, spacing, font size                                                                                             |

---

## Accessibility Snapshot Checks

After `playwright_browser_snapshot()`, verify:

| Check                 | What to look for                                                        |
| --------------------- | ------------------------------------------------------------------------ |
| Heading hierarchy     | `h1` → `h2` → `h3` without skipping levels                               |
| Button labels         | Every button has text or `aria-label` — icon-only buttons especially     |
| Input labels          | Inputs use the `label` attribute or an associated `<label>`              |
| Navigation landmark   | `<nav>` or `role="navigation"` wraps the main navigation                 |
| Main content landmark | `<main>` or `role="main"` wraps the primary content region               |
| Image alt text        | Meaningful `<img>` elements have non-empty `alt`                         |
| Drawer labelling      | `igc-nav-drawer` has a `label` when more than one nav landmark exists    |

---

## Common Fix Patterns

### Style correction — in order of preference

1. **Component design token** — `get_component_design_tokens` → `create_component_theme`
2. **Documented `::part(...)`** — for details with no token
3. **Slotted content you own** — style it in your own CSS
4. Never internal class names; never attempts to reach into a shadow root from page CSS

### Density and spacing

```
set_size({ component: "calendar", size: "small", platform: "webcomponents" })
set_spacing({ component: "calendar", spacing: 0.75, platform: "webcomponents" })
set_size({ scope: ".compact-toolbar", size: "small", platform: "webcomponents" })
```

Or directly:

```css
igc-calendar {
  --ig-size: var(--ig-size-small);
  --ig-spacing: 0.75;
}
```

Choose the multiplier by visual judgment — never by mapping a Figma pixel value.

### Color correction

```css
/* never a raw hex once a palette exists */
background: var(--ig-primary-500);
color: var(--ig-primary-500-contrast);
```

Use `get_color({ color: "primary", variant: "500", contrast: true })` when unsure of the
exact variable name.

### Missing element

If an element is in Figma but absent from the DOM, check in this order: registration
(`customElements.get`) → import path → the slot name it should occupy → then go back to
Phase 2 and re-read the component doc. A wrong slot name renders nothing and reports nothing.

# Project Detection and Scaffolding

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 0b to detect an existing Ignite UI Web Components project or
> scaffold a new one, and in Phase 4 for the view layout and file structure
> ([Implementation Layout](#implementation-layout)). Read the setup part in full before
> checking the project or running `igniteui-cli new`.

Check whether the current working directory contains a valid Web Components + Ignite UI
project:

```
1. Does package.json exist?
2. Does it list "igniteui-webcomponents" OR "@infragistics/igniteui-webcomponents" in dependencies?
3. Is there a src/ directory with an entry module (src/index.ts, src/main.ts, or similar)?
```

## If a valid project is found

- Note the package layout: `igniteui-webcomponents` (open source / trial) or
  `@infragistics/igniteui-webcomponents` (licensed). The same split applies to the
  commercial packages — `igniteui-webcomponents-grids`, `igniteui-webcomponents-charts`,
  `igniteui-webcomponents-core`, `igniteui-dockmanager`.
- Note the host setup: plain Lit/vanilla app, or a framework wrapper (React/Angular/Vue).
  If a wrapper is in play, registration and event binding follow
  [`igniteui-wc-integrate-with-framework`](../../igniteui-wc-integrate-with-framework/SKILL.md),
  not the raw `defineComponents` pattern.
- Note whether **Sass** is configured (a `.scss` entry file, `sass` in `devDependencies`,
  or a bundler Sass plugin). This decides the Phase 3 output format — CSS or Sass.
- **Check the MCP configuration for all four required server entries** — a Figma entry
  (`figma` or `figma-desktop`), `igniteui-cli`, `igniteui-theming`, and `playwright`, in the
  config file your client reads (`.vscode/mcp.json`, `.cursor/mcp.json`, or `.mcp.json`).
  If `igniteui-cli` or `igniteui-theming` is missing, run `npx -y igniteui-cli ai-config`
  (or `ig ai-config` when `igniteui-cli` is installed globally) from the project root
  yourself — it configures both servers and copies the Agent Skills, preserving existing
  entries. Add a missing Figma entry and `playwright` from [mcp-setup.md](mcp-setup.md).
  Projects scaffolded with `npx igniteui-cli new` already have `igniteui-cli` **and**
  `igniteui-theming` wired; they typically lack Figma and Playwright. A reload is required
  before newly configured servers' tools appear: ask the user to reload, then stop.
- Inform the user: "Found existing Ignite UI Web Components project. Proceeding with the
  Figma workflow."

## If no valid project is found

Present this message and wait for the user's choice:

> "No Ignite UI Web Components project found in the current directory. Would you like me
> to scaffold a new one using the Ignite UI CLI before implementing the Figma design?
>
> `npx -y igniteui-cli new` creates a Vite + Lit + TypeScript project pre-configured with
> `igniteui-webcomponents`, a starter theme, and the Ignite UI CLI and Theming MCP servers
> wired into `.vscode/mcp.json`. No global install required.
>
> Alternatively, point me at an existing project directory."

If the user confirms scaffolding:

1. Ask for a project name. If the user has already shared a Figma URL, suggest a name
   derived from the Figma file name; otherwise prompt.

2. Choose the project template based on the artboard structure. Because Phase 1 has not
   run yet, use the lightest signal available:

   | Signal                                                      | Template to use                                  |
   | ----------------------------------------------------------- | ------------------------------------------------ |
   | User mentions a persistent sidebar or multiple routed views | `side-nav`                                       |
   | User mentions an icon-rail / collapsible sidebar            | `side-nav-mini`                                  |
   | No strong signal — default                                  | `empty` (routing + home page; easiest to extend) |

3. Create the project:

   ```bash
   npx -y igniteui-cli new <project-name> --framework=webcomponents --type=igc-ts --template=<empty|side-nav|side-nav-mini>
   ```

   This produces a standard Vite workspace and additionally:
   - Installs and configures `igniteui-webcomponents` and `lit`, with a starter theme: a
     `<link>` in `index.html` to `themes/light/bootstrap.css` or `themes/light/material.css`,
     depending on the template (Phase 3a treats it as "no theme")
   - Wires `@vaadin/router` routing in `src/app/app-routing.ts`
   - Generates `.vscode/mcp.json` with the `igniteui-cli` **and** `igniteui-theming`
     MCP server entries already set
   - Copies static assets from `src/assets` via `vite-plugin-static-copy`

4. `cd <project-name>`.

5. Add the Figma and Playwright entries from [mcp-setup.md](mcp-setup.md), in the config
   file **your client reads**: `.vscode/mcp.json` (VS Code), `.cursor/mcp.json` (Cursor),
   or `.mcp.json` (Claude Code). For clients other than VS Code, also run
   `npx -y igniteui-cli ai-config` in the new folder so the Ignite UI entries land in that
   client's config.

6. Confirm the project builds:
   ```bash
   npm run build
   ```
   Do not run `npm start` in the foreground: the Vite dev server never exits. Start it in
   the background, or ask the user to run it, when Phase 5 needs it (default
   `http://localhost:5173`).

7. The new servers and the new folder only take effect in a new session. Ask the user to
   **reopen the editor or agent session in the new project folder**, then stop. Phase 1
   continues in that session.

## Implementation Layout

Used in Phase 4.

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

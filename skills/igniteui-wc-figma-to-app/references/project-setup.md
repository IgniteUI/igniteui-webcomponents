# Project Detection and Scaffolding

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 0b to detect an existing Ignite UI Web Components project or to scaffold a new one. Use it in Phase 4 for the view layout and file structure ([Implementation Layout](#implementation-layout)). Read the setup part in full before you check the project or run `igniteui-cli new`.

Check whether the current working directory contains a valid Web Components + Ignite UI project:

```
1. Does package.json exist?
2. Does it list "igniteui-webcomponents" in dependencies?
3. Is there a src/ directory with an entry module (src/index.ts, src/main.ts, or similar)?
```

## If a valid project is found

- Note the package layout: `igniteui-webcomponents` (MIT). The commercial packages are `igniteui-webcomponents-grids` (trial) / `@infragistics/igniteui-webcomponents-grids` (licensed), `igniteui-webcomponents-charts` (trial) / `@infragistics/igniteui-webcomponents-charts` (licensed), `igniteui-webcomponents-core` (trial) / `@infragistics/igniteui-webcomponents-core` (licensed), `igniteui-dockmanager` (trial) / `@infragistics/igniteui-dockmanager` (licensed).
- Note the host setup: plain Lit/vanilla app, or a framework wrapper (React/Angular/Vue). If the app uses a wrapper, follow [`igniteui-wc-integrate-with-framework`](../../igniteui-wc-integrate-with-framework/SKILL.md) for registration and event binding, not the raw `defineComponents` pattern.
- Note whether **Sass** is configured (a `.scss` entry file, `sass` in `devDependencies`, or a bundler Sass plugin). This decides the Phase 3 output format: CSS or Sass.
- **Check the MCP configuration for all four required server entries**: a Figma entry (`figma` or `figma-desktop`), `igniteui-cli`, `igniteui-theming`, and `playwright`. Look in the config file that your client reads (`.mcp.json`, `.vscode/mcp.json`, `.cursor/mcp.json`, …). If `igniteui-cli` or `igniteui-theming` is missing, run `npx -y igniteui-cli ai-config` yourself from the project root. Use `ig ai-config` when `igniteui-cli` is installed globally. The command configures both servers and copies the Agent Skills. It keeps the existing entries.

  Add a missing Figma entry and `playwright` from [mcp-setup.md](mcp-setup.md). Projects scaffolded with `npx igniteui-cli new` already have `igniteui-cli` **and** `igniteui-theming` configured. Usually, they do not have Figma and Playwright. The tools of newly configured servers appear only after a reload. Ask the user to reload, then stop.
- Tell the user: "Found an existing Ignite UI Web Components project. Proceeding with the Figma workflow."

## If no valid project is found

Show this message and wait for the user's choice:

> "I did not find an Ignite UI Web Components project in the current directory. Do you want me to scaffold a new project with the Ignite UI CLI before I implement the Figma design?
>
> `npx -y igniteui-cli new` creates a Vite + Lit + TypeScript project. The project has `igniteui-webcomponents`, a starter theme, and the Ignite UI CLI and Theming MCP servers configured for your coding assistant. You do not need a global install.
>
> You can also give me the path to an existing project directory."

If the user confirms scaffolding:

1. Ask for a project name. If the user already shared a Figma URL, suggest a name from the Figma file name. Otherwise, ask the user for a name.

2. Choose the project template from the artboard structure. Phase 1 has not run yet, so use the lightest signal available:

   | Signal                                                      | Template to use                                  |
   | ----------------------------------------------------------- | ------------------------------------------------ |
   | User mentions a persistent sidebar or multiple routed views | `side-nav`                                       |
   | User mentions an icon-rail / collapsible sidebar            | `side-nav-mini`                                  |
   | No strong signal — default                                  | `empty` (routing + home page; easiest to extend) |

3. Create the project:

   ```bash
   npx -y igniteui-cli new <project-name> --framework=webcomponents --type=igc-ts --template=<empty|side-nav|side-nav-mini> --assistants=<generic|vscode|cursor|gemini|junie> --agents=<generic|claude|copilot|cursor|…>
   ```

   `--assistants` selects the MCP config file: `generic` → `.mcp.json` (the default; Claude Code, GitHub Copilot, and others), `vscode` → `.vscode/mcp.json`, `cursor` → `.cursor/mcp.json`, `gemini` → `.gemini/settings.json`, `junie` → `.junie/mcp/mcp.json`. `--agents` selects where the CLI copies the Agent Skills (`generic` → `.agents/skills`, `claude` → `.claude/skills`, `copilot` → `.github/skills`, …). Pass both flags. Without them, the CLI asks interactively.

   This command creates a standard Vite workspace. It also:
   - Installs and configures `igniteui-webcomponents` and `lit`, with a starter theme. The theme is a `<link>` in `index.html` to `themes/light/bootstrap.css` or `themes/light/material.css`, and the template decides which file. Phase 3a treats it as "no theme"
   - Configures `@vaadin/router` routing in `src/app/app-routing.ts`
   - Runs the `ai-config` setup. This setup adds the `igniteui-cli` **and** `igniteui-theming` MCP servers to the config file of the chosen assistant. It also copies the Agent Skills for the chosen agents
   - Copies static assets from `src/assets` with `vite-plugin-static-copy`

4. `cd <project-name>`.

5. Add the Figma and Playwright entries from [mcp-setup.md](mcp-setup.md) to the config file that the scaffold wrote (the file for `--assistants`).

6. Make sure that the project builds:
   ```bash
   npm run build
   ```
   Do not run `npm start` in the foreground, because the Vite dev server never exits. When Phase 5 needs the dev server, start it in the background or ask the user to start it (default `http://localhost:5173`).

7. The new servers and the new folder take effect only in a new session. Ask the user to **reopen the editor or agent session in the new project folder**, then stop. Phase 1 continues in that session.

## Implementation Layout

Phase 4 uses this section.

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

Match the desktop proportions before you add responsive breakpoints.

> By default, the host of a Lit component is `display: inline`. Set `:host { display: block }` (or `grid`/`flex`), or the layout collapses. Charts and grids in a flexible grid track need an explicit height on the track and on the element.

### Project Structure

Use this structure for a new view from a Figma artboard in a CLI-scaffolded project:

```
src/app/
  <artboard-name>/
    <artboard-name>.ts        ← Lit component: template, static styles, registration
    data.ts                   ← typed mock data for the view
    _assets.ts                ← asset manifest from Phase 1h (when the view has images)
```

Register the route in `src/app/app-routing.ts` when the project uses routing. In a non-Lit project, follow the structure already in the repository.

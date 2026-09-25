# MCP Server Setup — All Four Servers

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> This file contains setup instructions for all four MCP servers required by this skill.
> Configure all four before running the Figma-to-app workflow.

---

## Overview

| Server                                     | Purpose                                             | Verify with                                    |
| ------------------------------------------ | --------------------------------------------------- | ---------------------------------------------- |
| **Figma**                                  | Read artboard structure, screenshots, design tokens | Tool listed; configured URL (no call)          |
| **Ignite UI CLI** (`igniteui-cli`)         | Component docs, API reference                       | `list_components`                              |
| **Ignite UI Theming** (`igniteui-theming`) | Palette + component-level theming code              | `theming_detect_platform`                      |
| **Playwright**                             | Browser automation, screenshots, DOM measurement    | `playwright_browser_navigate` to `about:blank` |

> **Fast path for the two Ignite UI servers:** run `npx -y igniteui-cli ai-config` in the
> project root. It configures `igniteui-cli` **and** `igniteui-theming` and copies the Agent
> Skills, preserving existing entries. Projects created with
> `npx igniteui-cli new --framework=webcomponents` already have both wired in
> `.vscode/mcp.json` — they normally need only Figma and Playwright added.

---

## 1. Figma MCP

Figma provides two official MCP servers. Both are HTTP servers — there is **no npm
package** to install for either one. Source:
https://developers.figma.com/docs/figma-mcp-server/

| Server | URL | Authentication | How tools find a node |
| --- | --- | --- | --- |
| **Desktop** (local) | `http://127.0.0.1:3845/mcp` | None — the Figma desktop app must be running with the server enabled | The **file open in the desktop app**: the current selection, or the node ID taken from a pasted frame link |
| **Remote** | `https://mcp.figma.com/mcp` | Figma OAuth sign-in on first use | A **link** to a frame or layer, from which the file key and node ID are taken. No selection |

Prefer the **remote** server when the user can share file links: you can move between
artboards without asking the user to click anything. Use the **desktop** server when the
file is only available in the user's desktop app.

### Desktop server

1. In the Figma desktop app, open the design file and switch to **Dev Mode**.
2. In the inspect panel's **MCP server** section, select **Enable desktop MCP server**.
   A confirmation appears at the bottom of the screen.
3. Add the server to the client:

**VS Code** (`.vscode/mcp.json`):

```json
{
  "servers": {
    "figma-desktop": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```

**JetBrains IDEs:** **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**,
then add an HTTP server with the URL `http://127.0.0.1:3845/mcp`.

Official guide: https://developers.figma.com/docs/figma-mcp-server/local-server-installation/

### Remote server

**VS Code** (`.vscode/mcp.json`):

```json
{
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

**Cursor:** use the one-click install link from Figma's guide, or add the same URL as an
HTTP server in `.cursor/mcp.json`.

**Claude Code:**

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

The client opens Figma's OAuth flow the first time a tool is called.

Official guide: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/

> Neither server needs a secret in the config file, so both entries are safe to commit.

### Personal access token (REST API only)

The MCP servers do **not** use a personal access token. You need one only for the Figma
**REST API** calls in this skill: Tier 1 asset export (`asset-extraction.md`) and reading
exact variant properties (`design-provenance.md § Step 1`).

1. Figma → avatar → **Settings** → **Security** → **Personal access tokens** →
   **Generate new token**, with read access to file content.
2. Ask the user to export it in the shell that runs the agent (`export FIGMA_TOKEN=…`).
   **Never** write it into a project file, `mcp.json`, or source control.

Without a token, asset extraction falls back to Tier 2/3 and variant properties come from
the design context only.

### Verifying Figma MCP

Check that the Figma tools (`figma_get_metadata`, `figma_get_design_context`, …) are listed.
Do not spend a call just to verify: View/Collab seats have very small quotas. Tell which
server is connected from its **configured URL** (`127.0.0.1:3845` → desktop,
`mcp.figma.com` → remote); see `figma-exploration.md` for how each is driven.

> **Rate limits** (per seat; verify at
> https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/): View/Collab seats
> get up to 6 calls/month (20 on Starter). Dev/Full seats get 200/day on Starter and
> Professional, and 600/day on Organization and Enterprise, with per-minute caps of 10–20.
> Use `figma_get_metadata` for structural discovery and `figma_get_design_context` only for
> target artboards to conserve quota.

### Troubleshooting Figma MCP

| Problem                               | Fix                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `figma_get_metadata` returns an error | Desktop: the Figma desktop app is closed, the server is not enabled in Dev Mode, or no file is open. Remote: sign in again through OAuth |
| Tools not available after config      | Restart the editor/IDE                                                                                                    |
| `File not found`                      | Verify the Figma file URL and your access; `/design/` URLs only (not `/board/`, `/make/`)                                  |
| Monthly/daily call quota exceeded     | A View/Collab seat allows 6 calls/month (20 on Starter) — use a Dev/Full seat, or the Figma REST API with a personal access token for metadata and assets |

---

## 2. Ignite UI CLI MCP (`igniteui-cli`)

> Projects created with `npx igniteui-cli new` already have this configured. For existing
> projects, `npx -y igniteui-cli ai-config` sets up this server and the theming server in one
> step. Use the manual steps below only when `ai-config` is unavailable or does not cover
> your editor.

### VS Code

```json
{
  "servers": {
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    }
  }
}
```

### Cursor

```json
{
  "mcpServers": {
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add igniteui-cli -- npx -y igniteui-cli mcp
```

### JetBrains IDEs

1. **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**
2. Command: `npx`, Arguments: `-y igniteui-cli mcp`

### Verifying Ignite UI CLI MCP

Ask: *"List all available Ignite UI Web Components."* The `list_components` tool should
return the catalog for `framework: "webcomponents"`.

Tools this skill relies on: `list_components`, `get_doc`, `search_docs`, `search_api`,
`get_api_reference`, `get_project_setup_guide`.

---

## 3. Ignite UI Theming MCP (`igniteui-theming`)

> `npx -y igniteui-cli ai-config` configures this server too (see section 2).

### VS Code

```json
{
  "servers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### Cursor

```json
{
  "mcpServers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add igniteui-theming -- npx -y igniteui-theming igniteui-theming-mcp
```

### JetBrains IDEs

1. **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**
2. Command: `npx`, Arguments: `-y igniteui-theming igniteui-theming-mcp`

### Verifying Ignite UI Theming MCP

Ask: *"Detect which Ignite UI platform my project uses."* `detect_platform` should analyze
`package.json` and return `webcomponents`.

Tools this skill relies on: `detect_platform`, `create_palette`, `create_custom_palette`,
`create_typography`, `create_elevations`, `create_theme`, `get_component_design_tokens`,
`create_component_theme`, `get_color`, `get_chart_series_colors`, `set_size`, `set_spacing`,
`set_roundness`, `read_resource`.

---

## 4. Playwright MCP

### VS Code

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Cursor

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

### JetBrains IDEs

1. **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**
2. Command: `npx`, Arguments: `-y @playwright/mcp@latest`

### Verifying Playwright MCP

Ask: *"Navigate the browser to `about:blank`."* `playwright_browser_navigate` should
open the page without error.

### Troubleshooting Playwright MCP

| Problem                                               | Fix                                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Screenshots are blank                                 | Make sure the dev server is running (`npm start`; Vite defaults to port 5173)             |
| Page resets to `about:blank` after resize             | Always re-navigate after `playwright_browser_resize`                                      |
| `ERR_CONNECTION_REFUSED`                              | The dev server is not running, or the port differs from 5173                               |
| `browser_evaluate` fails with *"Invalid input: expected string, received undefined"* | Pass code via the `function` parameter, not `script`                                       |
| Selector returns `null` for something clearly visible | It is inside a shadow root — use the deep-query helper in `validation-patterns.md`         |
| Element measures `0` height                           | Measured before upgrade/render, or the host lacks `display: block` — see the same file     |

---

## Combined JSON Config (All Four Servers)

> **If your project was created with `npx igniteui-cli new`:** `.vscode/mcp.json` already
> contains `igniteui-cli` and `igniteui-theming`. Add only the `figma` and `playwright`
> entries to the existing `"servers"` block — do not duplicate the others.
>
> **Fresh setup:** use the complete blocks below. They use Figma's **remote** server; for the
> desktop server, replace the `figma` entry with the desktop entry from section 1
> (`http://127.0.0.1:3845/mcp`). No Figma token belongs in these files.

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    },
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    },
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp"
    },
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    },
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Claude Code (`.mcp.json` in the project root)

```json
{
  "mcpServers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    },
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"]
    },
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

> Newly added MCP servers require an editor or session reload before their tools appear.

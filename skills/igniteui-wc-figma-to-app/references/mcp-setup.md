# MCP Server Setup — All Four Servers

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> This file contains setup instructions for all four MCP servers required by this skill.
> Configure all four before running the Figma-to-app workflow.

---

## Overview

| Server                                     | Purpose                                             | Verify with                                    |
| ------------------------------------------ | --------------------------------------------------- | ---------------------------------------------- |
| **Figma**                                  | Read artboard structure, screenshots, design tokens | `figma_get_metadata`                           |
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

The Figma MCP server connects your AI tool to Figma. It requires a **Figma personal access
token**.

### Get a Figma access token

1. Open Figma → click your avatar (top-right) → **Settings**
2. Scroll to **Personal access tokens** → **Generate new token**
3. Name it (e.g. `mcp-agent`) and copy the value

> **Never write the token itself into a project-local config file.** These files
> (`.vscode/mcp.json`, `.cursor/mcp.json`, `.mcp.json`) are commonly committed or shared, and a
> hard-coded token would leak into source control. Use the mechanisms below instead, and add
> the config file to `.gitignore` if your tool has no way to keep the value out of it.

### VS Code

Create or edit `.vscode/mcp.json`, using an `input` so VS Code prompts for the token instead
of storing it in the file:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "figma-access-token",
      "description": "Figma personal access token",
      "password": true
    }
  ],
  "servers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${input:figma-access-token}"
      }
    }
  }
}
```

### Cursor

Cursor does not support prompted or environment-variable substitution inside `mcp.json` — any
value written there is stored literally. Configure the `figma` server in your **user-level**
`~/.cursor/mcp.json` instead of the project-local `.cursor/mcp.json`, so the token never enters
the repo:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

### Claude Code

Add the server at **user scope** so the token is stored in your local Claude config rather than
the project's `.mcp.json`:

```bash
claude mcp add figma --scope user -- npx -y @figma/mcp@latest --figma-access-token YOUR_TOKEN_HERE
```

### JetBrains IDEs

1. **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**
2. Command: `npx`, Arguments: `-y @figma/mcp@latest`
3. Environment: `FIGMA_ACCESS_TOKEN=YOUR_TOKEN_HERE`

   (This is stored in the IDE's user settings, not a project file.)

### Figma desktop app plugin

If you work in the Figma desktop app, the plugin-based setup is also supported. Follow
Figma's official installation guide:
https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/

### Which variant am I talking to? (matters for Phase 1)

| Variant                     | Signal                                                            | How the skill drives it                                                          |
| --------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Remote / addressable**    | `get_design_context` / `get_metadata` require `fileKey` + `nodeId` | Pass both explicitly; iterate artboards without user interaction                  |
| **Desktop / session-bound** | Tools take no required parameters and act on the current selection | Ask the user to click each frame before every call; any `nodeId` passed is ignored |

With the session-bound variant the correct pattern is always:

```
// 1. Ask the user
"In Figma, please click the [Artboard Name] frame to select it, then confirm."
// 2. Wait for confirmation
// 3. Only then call the tool
figma_get_screenshot({})
```

### Verifying Figma MCP

Call `figma_get_metadata` (with `fileKey` if required). It should return the top-level page
list or the node XML.

> **Rate limits** (per seat; verify at
> https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/): View/Collab seats
> get up to 6 calls/month (20 on Starter). Dev/Full seats get 200/day on Starter and
> Professional, and 600/day on Organization and Enterprise, with per-minute caps of 10–20.
> Use `figma_get_metadata` for structural discovery and `figma_get_design_context` only for
> the artboards you will implement.

### Troubleshooting Figma MCP

| Problem                               | Fix                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| `figma_get_metadata` returns an error | Token may be expired or invalid — regenerate it                                         |
| Tools not available after config      | Restart the editor/IDE                                                                  |
| `File not found`                      | Verify the Figma file URL and your access; `/design/` URLs only (not `/board/`, `/make/`) |
| Monthly call quota exceeded           | Upgrade the plan, or use the Figma REST API with a personal access token for asset work  |

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

Ask: *"Navigate the browser to `https://example.com`."* `playwright_browser_navigate` should
open the page without error.

### Troubleshooting Playwright MCP

| Problem                                               | Fix                                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Screenshots are blank                                 | Make sure the dev server is running (`npm start`; Vite defaults to port 5173)             |
| Page resets to `about:blank` after resize             | Always re-navigate after `playwright_browser_resize`                                      |
| `ERR_CONNECTION_REFUSED`                              | The dev server is not running, or the port differs from 5173                               |
| `browser_evaluate` fails with `__name is not defined` | Pass code via the `function` parameter, not `script`                                       |
| Selector returns `null` for something clearly visible | It is inside a shadow root — use the deep-query helper in `validation-patterns.md`         |
| Element measures `0` height                           | Measured before upgrade/render, or the host lacks `display: block` — see the same file     |

---

## Combined JSON Config (All Four Servers)

> **If your project was created with `npx igniteui-cli new`:** `.vscode/mcp.json` already
> contains `igniteui-cli` and `igniteui-theming`. Add only the `figma` and `playwright`
> entries to the existing `"servers"` block — do not duplicate the others.
>
> **Fresh setup:** use the complete blocks below. As in section 1, never write the raw Figma
> token into a project-local file — use the VS Code `input` prompt, or a user-level config for
> Cursor/Claude Code, and add the file to `.gitignore` if it must stay project-local.

### VS Code (`.vscode/mcp.json`)

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "figma-access-token",
      "description": "Figma personal access token",
      "password": true
    }
  ],
  "servers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${input:figma-access-token}"
      }
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

Keep the `figma` entry in your **user-level** `~/.cursor/mcp.json` (see section 1) and add only
the remaining, secret-free servers to the project-local file:

```json
{
  "mcpServers": {
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

Add `figma` at **user scope** (see section 1) and keep only the remaining, secret-free servers
in the project's `.mcp.json`:

```json
{
  "mcpServers": {
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

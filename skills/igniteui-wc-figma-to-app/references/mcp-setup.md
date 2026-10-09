# MCP Server Setup — All Four Servers

> **Part of the [`igniteui-wc-figma-to-app`](../SKILL.md) skill.**
>
> This file contains setup instructions for all four MCP servers that this skill requires. Configure all four servers before you run the Figma-to-app workflow.

---

## Overview

| Server                                     | Purpose                                             | Verify with                                    |
| ------------------------------------------ | --------------------------------------------------- | ---------------------------------------------- |
| **Figma**                                  | Read artboard structure, screenshots, design tokens | Tool listed; configured URL (no call)          |
| **Ignite UI CLI** (`igniteui-cli`)         | Component docs, API reference                       | `list_components`                              |
| **Ignite UI Theming** (`igniteui-theming`) | Palette + component-level theming code              | `theming_detect_platform`                      |
| **Playwright**                             | Browser automation, screenshots, DOM measurement    | `playwright_browser_navigate` to `about:blank` |

> **Fast path for the two Ignite UI servers:** run `npx -y igniteui-cli ai-config` in the project root. It configures `igniteui-cli` **and** `igniteui-theming`, and copies the Agent Skills. It keeps the existing entries. Projects created with `npx igniteui-cli new --framework=webcomponents` already have both servers. They are in the config file of the assistant chosen with `--assistants` (`.mcp.json` by default). These projects usually need only the Figma and Playwright entries.

---

## 1. Figma MCP

Figma provides two official MCP servers. Both are HTTP servers. There is **no npm package** to install for either server. Source: https://developers.figma.com/docs/figma-mcp-server/

| Server | URL | Authentication | How tools find a node |
| --- | --- | --- | --- |
| **Desktop** (local) | `http://127.0.0.1:3845/mcp` | None. The Figma desktop app must be running with the server enabled | The **file open in the desktop app**: the current selection, or the node ID taken from a pasted frame link |
| **Remote** | `https://mcp.figma.com/mcp` | Figma OAuth sign-in on first use | A **link** to a frame or layer. The tools take the file key and node ID from the link. No selection |

When the user can share file links, use the **remote** server. You can then move between artboards without asking the user to click anything. Use the **desktop** server when the file is only available in the user's desktop app.

### Desktop server

1. In the Figma desktop app, open the design file and switch to **Dev Mode**.
2. In the inspect panel's **MCP server** section, select **Enable desktop MCP server**. A confirmation appears at the bottom of the screen.
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

**JetBrains IDEs:** go to **Settings → Tools → AI Assistant → MCP Servers → + Add MCP Server**. Then add an HTTP server with the URL `http://127.0.0.1:3845/mcp`.

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

**Cursor:** use the one-click install link from Figma's guide, or add the same URL as an HTTP server in `.cursor/mcp.json`.

**Claude Code:**

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

The client opens Figma's OAuth flow the first time that you call a tool.

Official guide: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/

> Neither server needs a secret in the config file, so both entries are safe to commit.

### Personal access token (REST API only)

The MCP servers do **not** use a personal access token. You need one only for the Figma **REST API** calls in this skill: Tier 1 asset export (`asset-extraction.md`) and reading exact variant properties (`design-provenance.md § Step 1`).

1. Go to Figma → avatar → **Settings** → **Security** → **Personal access tokens** → **Generate new token**. Give the token read access to file content.
2. Ask the user to export it in the shell that runs the agent (`export FIGMA_TOKEN=…`). **Never** write it into a project file, `mcp.json`, or source control.

Without a token, asset extraction uses Tier 2/3, and the variant properties come only from the design context.

### Verifying Figma MCP

Make sure that the Figma tools (`figma_get_metadata`, `figma_get_design_context`, …) are listed. Do not use a call only to verify the server, because View/Collab seats have very small quotas. Use the **configured URL** to identify the connected server (`127.0.0.1:3845` → desktop, `mcp.figma.com` → remote). See `figma-exploration.md` for how to drive each server.

> **Rate limits** (per seat; verify at https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/): View/Collab seats get up to 6 calls/month (20 on Starter). Dev/Full seats get 200/day on Starter and Professional, and 600/day on Organization and Enterprise, with per-minute caps of 10–20. To use less quota, use `figma_get_metadata` for structural discovery, and use `figma_get_design_context` only for target artboards.

### Troubleshooting Figma MCP

| Problem                               | Fix                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `figma_get_metadata` returns an error | Desktop: the Figma desktop app is closed, the server is not enabled in Dev Mode, or no file is open. Remote: sign in again through OAuth |
| Tools not available after config      | Restart the editor/IDE                                                                                                    |
| `File not found`                      | Verify the Figma file URL and your access; `/design/` URLs only (not `/board/`, `/make/`)                                  |
| Monthly/daily call quota exceeded     | A View/Collab seat allows 6 calls/month (20 on Starter). Use a Dev/Full seat, or the Figma REST API with a personal access token for metadata and assets |

---

## 2. Ignite UI CLI MCP (`igniteui-cli`)

> Projects created with `npx igniteui-cli new` already have this server configured. For existing projects, `npx -y igniteui-cli ai-config` configures this server and the theming server in one step. Use the manual steps below only when `ai-config` is not available or does not support your editor.

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

Ask: *"List all available Ignite UI Web Components."* Make sure that the `list_components` tool returns the catalog for `framework: "webcomponents"`.

Tools that this skill uses: `list_components`, `get_doc`, `search_docs`, `search_api`, `get_api_reference`, `get_project_setup_guide`.

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

Ask: *"Detect which Ignite UI platform my project uses."* Make sure that `detect_platform` analyzes `package.json` and returns `webcomponents`.

Tools that this skill uses: `detect_platform`, `create_palette`, `create_custom_palette`, `create_typography`, `create_elevations`, `create_theme`, `get_component_design_tokens`, `create_component_theme`, `get_color`, `get_chart_series_colors`, `set_size`, `set_spacing`, `set_roundness`, `read_resource`.

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

Ask: *"Navigate the browser to `about:blank`."* Make sure that `playwright_browser_navigate` opens the page without an error.

### Troubleshooting Playwright MCP

| Problem                                               | Fix                                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Screenshots are blank                                 | Make sure the dev server is running (`npm start`; Vite defaults to port 5173)             |
| Page resets to `about:blank` after resize             | Always re-navigate after `playwright_browser_resize`                                      |
| `ERR_CONNECTION_REFUSED`                              | The dev server is not running, or the port differs from 5173                               |
| `browser_evaluate` fails with *"Invalid input: expected string, received undefined"* | Pass code in the `function` parameter, not `script`                                        |
| Selector returns `null` for something clearly visible | It is inside a shadow root — use the deep-query helper in `validation-patterns.md`         |
| Element measures `0` height                           | Measured before upgrade/render, or the host lacks `display: block` — see the same file     |

---

## Combined JSON Config (All Four Servers)

> **If your project was created with `npx igniteui-cli new`:** `igniteui-cli` and `igniteui-theming` are already in your client's config file (the one chosen with `--assistants`; `.mcp.json` by default). Add only the Figma and Playwright entries below. Do not duplicate the other entries.
>
> **Fresh setup:** use the complete blocks below. They use Figma's **remote** server. For the desktop server, replace the `figma` entry with the desktop entry from section 1 (`http://127.0.0.1:3845/mcp`). Do not put a Figma token in these files.

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

> The tools of newly added MCP servers appear only after an editor or session reload.

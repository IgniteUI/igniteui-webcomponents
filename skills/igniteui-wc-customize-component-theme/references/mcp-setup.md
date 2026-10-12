# Setting Up the Ignite UI Theming MCP Server

> **Part of the [`igniteui-wc-customize-component-theme`](../SKILL.md) skill.**

With the Ignite UI Theming MCP server, AI assistants can generate production-ready theming code. You must configure the server in your editor before the theming tools become available.

## VS Code

Create or edit `.vscode/mcp.json` in your project:

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

This configuration works when `igniteui-theming` is installed locally in `node_modules`. It also works when `npx` must download `igniteui-theming` from the npm registry. `npx -y` handles both cases.

## Cursor

Create or edit `.cursor/mcp.json`:

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

## Claude Desktop

Edit the Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

## WebStorm / JetBrains IDEs

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **+ Add MCP Server**
3. Set Command to `npx`
4. Set Arguments to `igniteui-theming igniteui-theming-mcp`
5. Click OK
6. Restart the AI Assistant

## Verifying the Setup

After you configure the MCP server, ask your AI assistant:

> "Detect which Ignite UI platform my project uses"

If the MCP server is running, the `detect_platform` tool analyzes your `package.json` and returns the detected platform (for example, `webcomponents`).

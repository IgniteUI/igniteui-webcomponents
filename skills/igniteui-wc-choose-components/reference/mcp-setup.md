# Setting Up the Ignite UI CLI MCP Server

> **Part of the [`igniteui-wc-choose-components`](../SKILL.md) skill hub.**

## Contents

- [VS Code](#vs-code)
- [Cursor](#cursor)
- [Claude Desktop](#claude-desktop)
- [WebStorm / JetBrains IDEs](#webstorm--jetbrains-ides)
- [Verifying the Setup](#verifying-the-setup)

The Ignite UI CLI MCP server enables AI assistants to discover Ignite UI components, access component documentation, and support related Ignite UI workflows. It must be configured in your editor before these tools become available.

> **Note:** The MCP server feature is currently only available in the `@next` pre-release channel of `igniteui-cli`. Once MCP support is promoted to the stable release, you can replace `igniteui-cli@next` with `igniteui-cli` (or a specific stable version) in the configurations below.

## VS Code

Create or edit `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli@next", "mcp"]
    }
  }
}
```

This works whether `igniteui-cli` is installed locally in `node_modules` or needs to be pulled from the npm registry — `npx -y` handles both cases.

## Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli@next", "mcp"]
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
    "igniteui-cli": {
      "command": "npx",
      "args": ["-y", "igniteui-cli@next", "mcp"]
    }
  }
}
```

## WebStorm / JetBrains IDEs

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **+ Add MCP Server**
3. Set Command to `npx` and Arguments to `-y igniteui-cli@next mcp`
4. Click OK and restart the AI Assistant

> The `-y` flag skips interactive prompts if `igniteui-cli` is not already installed locally.

## Verifying the Setup

After configuring the MCP server, ask your AI assistant:

> "List all available Ignite UI components"

If the MCP server is running, the `list_components` tool will return all available components for the detected framework.

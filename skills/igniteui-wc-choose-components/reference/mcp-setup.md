# Setting Up the Ignite UI CLI MCP Server

> **Part of the [`igniteui-wc-choose-components`](../SKILL.md) skill hub.**

## Contents

- [Setting Up the Ignite UI CLI MCP Server](#setting-up-the-ignite-ui-cli-mcp-server)
  - [Contents](#contents)
  - [VS Code](#vs-code)
  - [Cursor](#cursor)
  - [Claude Desktop](#claude-desktop)
  - [WebStorm / JetBrains IDEs](#webstorm--jetbrains-ides)
  - [Verifying the Setup](#verifying-the-setup)

With the Ignite UI CLI MCP server, AI assistants can find Ignite UI components, read component documentation, and support related Ignite UI workflows. You must configure the server in your editor before these tools become available.

## VS Code

Create or edit `.vscode/mcp.json` in your project:

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

This configuration works when `igniteui-cli` is installed locally in `node_modules`. It also works when `npx` must download `igniteui-cli` from the npm registry. `npx -y` handles both cases.

## Cursor

Create or edit `.cursor/mcp.json`:

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

## Claude Desktop

Edit the Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

## WebStorm / JetBrains IDEs

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **+ Add MCP Server**
3. Set Command to `npx`
4. Set Arguments to `-y igniteui-cli mcp`
5. Click OK
6. Restart the AI Assistant

> The `-y` flag skips interactive prompts if `igniteui-cli` is not already installed locally.

## Verifying the Setup

After you configure the MCP server, ask your AI assistant:

> "List all available Ignite UI components"

If the MCP server is running, the `list_components` tool returns all available components for the detected framework.

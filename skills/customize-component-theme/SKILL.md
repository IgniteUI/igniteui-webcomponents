---
name: customize-component-theme
description: Customize Ignite UI Web Components styling using the igniteui-theming MCP server for AI-assisted theming
user-invokable: true
---

# Customize Component Theme

This skill helps you customize the appearance of Ignite UI Web Components by connecting you with the **igniteui-theming MCP server** - a specialized AI assistant for theming and styling these components.

## What is the igniteui-theming MCP?

The igniteui-theming MCP (Model Context Protocol) server is a specialized tool that provides AI assistants like GitHub Copilot with deep knowledge about:

- 🎨 Component theming system and CSS custom properties
- 🎯 Available CSS parts for styling Shadow DOM internals
- 🌗 Light/dark mode theming strategies
- 🔧 Framework-specific styling patterns
- 📚 Complete theming API documentation
- 🎭 Pre-built theme configurations (Material, Fluent, Bootstrap, Indigo)

Instead of manually searching documentation, the MCP server gives your AI assistant direct access to theming expertise.

## Example Usage

- "How do I change the button colors?"
- "Customize the input component styling"
- "Apply my brand colors to all components"
- "Create a dark mode theme"
- "Style the internal parts of a component"
- "What CSS custom properties are available for the card component?"

## Related Skills

- [integrate-with-framework](../integrate-with-framework/) - Set up components first
- [optimize-bundle-size](../optimize-bundle-size/) - Optimize after theming

## When to Use

- User wants to apply custom colors or styling
- User needs to match components to their brand
- User asks about theming or styling components
- User wants to override default component styles
- User needs guidance on CSS custom properties or CSS parts

## Setup: Connect to the igniteui-theming MCP Server

To enable AI-assisted theming, you need to configure your AI assistant (like GitHub Copilot, Claude Desktop, or other MCP-compatible tools) to connect to the igniteui-theming MCP server.

The MCP server is included in the `igniteui-theming` package and provides tools for theme generation, color system management, and component styling guidance.

### Prerequisites

- **Node.js** v18 or later installed
- **npm** or **npx** available
- An MCP-compatible AI tool (Claude Desktop, GitHub Copilot with MCP support, etc.)

### For Claude Desktop

1. **Download and install Claude Desktop** from [claude.ai](https://claude.ai/download)

2. **Configure the MCP server** by editing Claude's configuration file:

   **On macOS:**
   ```bash
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   **On Windows:**
   ```bash
   code %APPDATA%\Claude\claude_desktop_config.json
   ```

   **On Linux:**
   ```bash
   code ~/.config/Claude/claude_desktop_config.json
   ```

3. **Add the igniteui-theming MCP configuration:**

   ```json
   {
     "mcpServers": {
       "igniteui-theming": {
         "command": "npx",
         "args": [
           "-y",
           "igniteui-theming@latest",
           "node_modules/igniteui-theming/dist/mcp/index.js"
         ]
       }
     }
   }
   ```

   **Alternative: Use local installation**

   If you prefer to install the package locally first:

   ```bash
   npm install -g igniteui-theming
   ```

   Then configure Claude Desktop to use the installed package:

   ```json
   {
     "mcpServers": {
       "igniteui-theming": {
         "command": "node",
         "args": [
           "/usr/local/lib/node_modules/igniteui-theming/dist/mcp/index.js"
         ]
       }
     }
   }
   ```

   **For project-local installation:**

   Install in your project:
   ```bash
   npm install igniteui-theming
   ```

   Configure with relative path:
   ```json
   {
     "mcpServers": {
       "igniteui-theming": {
         "command": "node",
         "args": [
           "node_modules/igniteui-theming/dist/mcp/index.js"
         ],
         "cwd": "/path/to/your/project"
       }
     }
   }
   ```

4. **Restart Claude Desktop** to load the MCP server

5. **Verify the connection:**
   - Open Claude Desktop
   - Look for a hammer icon (🔨) or MCP indicator in the interface
   - Ask: "What theming tools are available?"
   - Claude should respond with information about available tools like:
     - `generate_theme` - Generate complete theme configurations
     - `get_color_palette` - Get color palettes for themes
     - `get_component_info` - Get component styling information
     - And more...

### For GitHub Copilot in VS Code

**Note:** GitHub Copilot's MCP support may vary by version. Check the [latest Copilot documentation](https://code.visualstudio.com/docs/copilot/chat) for current MCP support status.

If MCP support is available, configure it similarly to Claude Desktop using VS Code's MCP settings.

### For Other MCP-Compatible Tools

Consult your tool's documentation for MCP server configuration. Use these connection details:

- **Package:** `igniteui-theming`
- **MCP Server Path:** `node_modules/igniteui-theming/dist/mcp/index.js`
- **Installation:** `npm install igniteui-theming`
- **Source:** [GitHub - IgniteUI/igniteui-theming](https://github.com/IgniteUI/igniteui-theming)
- **MCP Documentation:** [MCP README](https://github.com/IgniteUI/igniteui-theming/blob/master/src/mcp/README.md)

## How to Use the MCP Server for Theming

Once connected, your AI assistant has access to specialized theming tools through the MCP server. The server provides several tools that can be invoked to help with theming tasks:

### Available Tools

- **`generate_theme`** - Creates complete theme configurations based on your requirements
- **`get_color_palette`** - Retrieves color palettes and provides color system guidance
- **`get_component_info`** - Returns styling information for specific components

### Getting Started with Basic Theming

**Ask natural questions:**

```
"Generate a theme with primary color #FF5733"

"How do I change the primary color of all Ignite UI components to #FF5733?"

"Show me how to create a custom theme with my brand colors"

"What CSS custom properties control the button appearance?"

"How do I make all inputs larger?"
```

**The MCP server provides:**
- ✅ Complete theme generation using the `generate_theme` tool
- ✅ Exact CSS custom property names
- ✅ Complete code examples
- ✅ HSL color conversion help
- ✅ Component-specific styling guidance

### Working with Specific Components

**Ask component-specific questions:**

```
"Get component info for igc-button"

"How do I style the igc-button component?"

"What CSS parts are available for igc-input?"

"Show me all theming options for igc-card"

"How do I customize the igc-select dropdown?"
```

**The MCP server knows:**
- All available CSS custom properties per component (via `get_component_info`)
- CSS part names and their purpose
- Component-specific theming patterns
- Common customization scenarios

### Creating Complete Themes

**Request theme generation:**

```
"Generate a dark mode theme for my app"

"Create a Material Design theme with purple as primary color"

"Generate a theme matching these brand colors: #1E3A8A (primary), #10B981 (success)"

"Generate a Fluent-style theme configuration"

"Create a custom theme with these HSL values: h=211, s=100%, l=50%"
```

**The MCP server can:**
- Generate complete theme configurations using the `generate_theme` tool
- Provide light and dark mode variants with the `get_color_palette` tool
- Create themed component examples
- Suggest complementary color palettes
- Output ready-to-use CSS custom properties

### Framework-Specific Theming

**Get framework-tailored advice:**

```
"How do I apply custom CSS properties to components in React?"

"Show me Angular template syntax for theming components"

"What's the best way to theme components in Vue 3?"

"Help me set up dynamic theming in my Next.js app"
```

**The MCP server provides:**
- Framework-specific code examples
- Integration patterns
- Dynamic theming strategies
- Best practices per framework

## Common Theming Workflows

### Workflow 1: Brand Color Application

1. **Ask the MCP:** "Generate a theme with primary color #0066CC for Ignite UI components"

2. **The MCP uses its tools** to:
   - Use `generate_theme` to create a complete theme configuration
   - Convert hex to HSL automatically
   - Generate CSS custom properties
   - Provide implementation guidance

3. **Receive complete code** including:
   - CSS custom property definitions
   - Where to place the theme CSS
   - How to test the changes

4. **Apply the theme** using the provided code

5. **Iterate** by asking follow-up questions like:
   - "How do I make it darker for hover states?"
   - "Generate success and error colors to match this theme"

### Workflow 2: Component-Specific Customization

1. **Ask the MCP:** "Get styling information for igc-card component"

2. **The MCP uses `get_component_info`** to provide:
   - Available CSS custom properties
   - CSS parts for styling with `::part()`
   - Example customizations
   - Browser compatibility notes

3. **Ask for customization:** "I want rounded corners and a shadow on the card"

4. **Receive specific code** for your requirement

5. **Implement and refine** using the guidance

### Workflow 3: Dark Mode Implementation

1. **Ask the MCP:** "Generate a dark mode theme for my Ignite UI components"

2. **The MCP uses `generate_theme`** to provide:
   - Complete dark mode configuration
   - CSS custom property setup for light/dark variants
   - Media query patterns with `prefers-color-scheme`
   - JavaScript toggle implementation (if needed)
   - Framework integration examples

3. **Receive a complete implementation:**
   - Light and dark theme CSS
   - Toggle mechanism code
   - Best practices for theme switching

4. **Deploy** with confidence using tested patterns

### Workflow 4: Debugging Styles

1. **Ask the MCP:** "Why isn't my CSS applying to the button's text?"

2. **Get diagnostic help:**
   - Shadow DOM explanation
   - Correct selector syntax (use `::part()` or CSS custom properties)
   - Available styling approaches
   - Browser DevTools tips

3. **Ask for component details:** "Get component info for igc-button to see available parts"

4. **Resolve the issue** with expert guidance

## What the MCP Server Knows

The igniteui-theming MCP server (located at `igniteui-theming/dist/mcp/index.js`) provides specialized tools and comprehensive knowledge for theming Ignite UI Web Components:

### Available MCP Tools

- **`generate_theme`** - Generate complete theme configurations with custom colors and styles
- **`get_color_palette`** - Retrieve color palettes and color system information
- **`get_component_info`** - Get detailed styling information for specific components
- **Theme analysis tools** - Analyze and optimize theme configurations
- **CSS custom property lookup** - Find available CSS variables for components

### CSS Custom Properties (Design Tokens)

### CSS Custom Properties (Design Tokens)

- **Color system:**
  - `--ig-primary-h/s/l` - Primary color (HSL)
  - `--ig-surface-h/s/l` - Surface color
  - `--ig-error-h/s/l`, `--ig-success-h/s/l`, `--ig-warning-h/s/l`, `--ig-info-h/s/l`
  - And many more semantic colors

- **Typography:**
  - `--ig-font-family` - Base font
  - `--ig-body-1-font-size`, `--ig-h1-font-size`, etc.
  - Font weight and line height tokens

- **Spacing & Layout:**
  - `--ig-spacing` - Base spacing unit
  - `--ig-size` - Component size variants
  - `--ig-radius` - Border radius

### CSS Parts (Shadow DOM Styling)

- Part names for all components
- Which parts control which visual elements
- How to style parts with `::part()` selector
- Common part styling patterns

### Pre-Built Themes

- Material Design theme
- Fluent Design theme
- Bootstrap theme
- Indigo theme
- Custom theme creation patterns

### Advanced Theming

- Dynamic theme switching
- CSS-in-JS theming
- Theme generation from brand guidelines
- Color palette generation
- Accessibility considerations (WCAG contrast)

## Benefits of Using the MCP Server

### For Developers

✅ **Instant answers** - No documentation searching needed
✅ **Context-aware** - Knows your framework and setup
✅ **Code examples** - Get working code immediately
✅ **Best practices** - Learn proper patterns as you go
✅ **Error prevention** - Avoid common pitfalls

### For Teams

✅ **Consistent theming** - Everyone uses the same patterns
✅ **Faster onboarding** - New team members get guided help
✅ **Knowledge sharing** - AI assistant knows team conventions
✅ **Documentation as code** - Themes are self-documenting

## Troubleshooting MCP Connection

### Issue: MCP server not showing up

**Check:**
1. Configuration file syntax is valid JSON
2. File is saved in the correct location
3. Claude Desktop (or your tool) has been restarted
4. You have internet connection (for npx download)
5. Node.js v18+ is installed

**Solution:**
```bash
# Verify Node.js version
node --version

# Test running the MCP server directly
npm install igniteui-theming
node node_modules/igniteui-theming/dist/mcp/index.js
```

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Install the package locally
npm install igniteui-theming

# Update your config to use the local path
{
  "mcpServers": {
    "igniteui-theming": {
      "command": "node",
      "args": ["node_modules/igniteui-theming/dist/mcp/index.js"]
    }
  }
}
```

### Issue: "Permission denied" errors

**On macOS/Linux:**
```bash
# Ensure the config file is readable
chmod 644 ~/.config/Claude/claude_desktop_config.json

# Ensure the MCP server file is executable
chmod +x node_modules/igniteui-theming/dist/mcp/index.js
```

### Issue: MCP server crashes or disconnects

**Check:**
1. Node.js is installed (v18 or later recommended)
2. The `igniteui-theming` package is properly installed
3. Firewall isn't blocking the connection
4. Check Claude Desktop logs for error messages

**Debug with verbose output:**
```bash
# Run the server manually to see error messages
node node_modules/igniteui-theming/dist/mcp/index.js
```

### Issue: Tools not appearing in Claude

**Solution:**
After configuring the server, restart Claude Desktop completely (quit and reopen). The MCP tools should appear under the hammer icon (🔨) in the chat interface.

**Available tools should include:**
- `generate_theme` - Generate theme configurations
- `get_color_palette` - Retrieve color palettes
- `get_component_info` - Get component styling details
- Additional theming tools

For more detailed troubleshooting, see the [MCP documentation](https://github.com/IgniteUI/igniteui-theming/blob/master/src/mcp/README.md).

## Alternative: Manual Theming Reference

If you cannot use the MCP server, here are the basic theming approaches:

### CSS Custom Properties

```css
:root {
  --ig-primary-h: 211deg;
  --ig-primary-s: 100%;
  --ig-primary-l: 50%;
}
```

### CSS Parts

```css
igc-button::part(base) {
  padding: 12px 24px;
}
```

### For complete theming documentation
Visit the [official documentation](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/themes/overview).

However, we **strongly recommend using the MCP server** for:
- Interactive guidance
- Context-aware help
- Framework-specific examples
- Real-time problem solving

## Next Steps

1. **Set up the MCP server** using the instructions above
2. **Ask your AI assistant** theming questions naturally
3. **Iterate quickly** with instant feedback
4. **Share your theme** configurations with your team

For component integration, see the [integrate-with-framework](../integrate-with-framework/) skill.

## Additional Resources

- [igniteui-theming Package on GitHub](https://github.com/IgniteUI/igniteui-theming)
- [igniteui-theming MCP Documentation](https://github.com/IgniteUI/igniteui-theming/blob/master/src/mcp/README.md)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Claude Desktop Download](https://claude.ai/download)
- [Ignite UI Theming Documentation](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/themes/overview)
- [igniteui-webcomponents on npm](https://www.npmjs.com/package/igniteui-webcomponents)

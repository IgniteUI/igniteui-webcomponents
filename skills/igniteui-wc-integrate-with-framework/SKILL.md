---
license: MIT
name: igniteui-wc-integrate-with-framework
description: "Install and integrate Ignite UI Web Components packages into React, Angular, Vue 3, LitElement, or vanilla JS/HTML apps. Identify the framework and apply the framework-specific setup: package choice, component registration, theme imports, schemas and configuration, events and property binding. WHEN TO USE: the user wants to add Ignite UI Web Components or igniteui-react to a project, create a new app with them, fix registration or 'unknown element' errors, or needs framework-specific configuration for templates, events, or forms. WHEN NOT TO USE: selecting the components to use (use choose-components), customizing themes or styles (use customize-component-theme), reducing bundle size or import granularity (use optimize-bundle-size), building a view from a design (use generate-from-image-design or figma-to-app), or projects that use Ignite UI for Angular/Blazor native packages instead of Web Components."
user-invocable: true
---

# Integrate with Framework

Use this skill to integrate Ignite UI Web Components into an application. Identify the framework or platform, then load the step-by-step integration reference for it.

## Before You Answer

- Choose the package first, then load the framework reference.
- Do not assume every setup flow uses `igniteui-webcomponents`.
- If `package.json` does not contain the necessary package, add or install the correct Ignite UI dependency first. A package that is not in `package.json` can still be valid.

### Package Routing

| Component family | Package |
|---|---|
| General UI components | `igniteui-webcomponents` |
| Advanced grids | `igniteui-webcomponents-grids` (trial) `@infragistics/igniteui-webcomponents-grids` (licensed) |
| Grid Lite | `igniteui-grid-lite` |
| Dock Manager | `igniteui-dockmanager` (trial) `@infragistics/igniteui-dockmanager` (licensed) |
| Charts | `igniteui-webcomponents-charts` (trial) `@infragistics/igniteui-webcomponents-charts` (licensed) |

If the request only says "grid", use the requested features to select the package:

- Use `igniteui-webcomponents-grids` for editing, paging, sorting, filtering, summaries, grouping, hierarchical data, or pivot features.
- Use `igniteui-grid-lite` for lightweight tabular data.

## Example Usage

- "How do I use igniteui-webcomponents in my React app?"
- "Integrate the button component in Angular"
- "Set up igniteui-webcomponents in Vue 3"
- "Help me add web components to my vanilla JS project"

## Related Skills

- [igniteui-wc-optimize-bundle-size](../igniteui-wc-optimize-bundle-size/SKILL.md) - Reduce bundle size after integration
- [igniteui-wc-customize-component-theme](../igniteui-wc-customize-component-theme/SKILL.md) - Style components after setup

## When to Use

- The user wants to add igniteui-webcomponents to a framework project
- The user has framework-specific integration problems
- The user needs help with component imports and registration
- The user asks about React, Angular, Vue, or vanilla JS setup

---

## Framework Detection

Before you load a reference, use the project context to identify the target framework. Check these signals in sequence:

### 1. Detect React

**Evidence:**
- `package.json` contains `"react"` or `"react-dom"` in `dependencies` or `devDependencies`
- Files with `.tsx` or `.jsx` extensions exist in `src/`
- The entry point imports `ReactDOM` or `createRoot`
- `vite.config.ts` uses `@vitejs/plugin-react` or `@vitejs/plugin-react-swc`

→ **Load:** [react.md](./references/react.md)

---

### 2. Detect Angular

**Evidence:**
- `package.json` contains `"@angular/core"` in `dependencies`
- An `angular.json` file exists in the workspace root
- Files with `.component.ts`, `.module.ts`, or `.component.html` patterns exist
- The entry point calls `bootstrapApplication` or `platformBrowserDynamic`

→ **Load:** [angular.md](./references/angular.md)

---

### 3. Detect Vue 3

**Evidence:**
- `package.json` contains `"vue"` in `dependencies` or `devDependencies`
- Files with `.vue` extensions exist in `src/`
- `vite.config.ts` uses `@vitejs/plugin-vue`
- The entry point calls `createApp`

→ **Load:** [vue.md](./references/vue.md)

---

### 4. Vanilla JavaScript / HTML (fallback)

**Evidence:**
- `package.json` does not contain a major framework
- Plain `.html` files reference a `<script type="module">`
- The entry point is a plain `.js` or `.ts` file without framework imports
- `package.json` contains "lit". Start with the vanilla JS reference. If the app uses Shadow DOM, follow the Shadow root theming note for grids.
- The user asks directly for vanilla JS, HTML, or LitElement integration

→ **Load:** [vanilla-js.md](./references/vanilla-js.md)

---

## If the Framework Cannot Be Determined

Ask the user directly:

> "What framework or platform are you using? (React, Angular, Vue 3, Vanilla JS / HTML, or LitElement)"

Then load the matching reference from the options above.

---

## Framework Reference Files

| Framework / Platform | Reference |
|----------------------|-----------|
| React | [react.md](./references/react.md) |
| Angular | [angular.md](./references/angular.md) |
| Vue 3 | [vue.md](./references/vue.md) |
| Vanilla JS / HTML / LitElement | [vanilla-js.md](./references/vanilla-js.md) |

Each reference contains:

- Installation
- Theme import (required for styling)
- Component registration
- Usage examples
- TypeScript support
- Platform-specific considerations
- Common problems and solutions


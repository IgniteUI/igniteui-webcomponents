---
name: igniteui-wc-integrate-with-framework
description: Integrate igniteui-webcomponents into React, Angular, Vue, or vanilla JS applications with framework-specific configurations
user-invokable: true
---

# Integrate with Framework

This skill helps users integrate Ignite UI Web Components into their application. It detects the framework or platform in use and loads the appropriate step-by-step integration reference.

## Example Usage

- "How do I use igniteui-webcomponents in my React app?"
- "Integrate the button component in Angular"
- "Set up igniteui-webcomponents in Vue 3"
- "Help me add web components to my vanilla JS project"

## Related Skills

- [igniteui-wc-optimize-bundle-size](../igniteui-wc-optimize-bundle-size/SKILL.md) - Reduce bundle size after integration
- [igniteui-wc-customize-component-theme](../igniteui-wc-customize-component-theme/SKILL.md) - Style components after setup

## When to Use

- User wants to add igniteui-webcomponents to a framework project
- User is experiencing framework-specific integration issues
- User needs help with component imports and registration
- User asks about React, Angular, Vue, or vanilla JS setup

---

## Framework Detection

Before loading a reference, identify the target framework from the project context. Check the following signals in order:

### 1. Detect React

**Evidence to look for:**
- `package.json` contains `"react"` or `"react-dom"` in `dependencies` or `devDependencies`
- Files with `.tsx` or `.jsx` extensions exist in `src/`
- Entry point imports `ReactDOM` or `createRoot`
- `vite.config.ts` uses `@vitejs/plugin-react` or `@vitejs/plugin-react-swc`

→ **Load:** [react.md](./references/react.md)

---

### 2. Detect Angular

**Evidence to look for:**
- `package.json` contains `"@angular/core"` in `dependencies`
- `angular.json` file exists in the workspace root
- Files with `.component.ts`, `.module.ts`, or `.component.html` patterns exist
- Entry point calls `bootstrapApplication` or `platformBrowserDynamic`

→ **Load:** [angular.md](./references/angular.md)

---

### 3. Detect Vue 3

**Evidence to look for:**
- `package.json` contains `"vue"` in `dependencies` or `devDependencies`
- Files with `.vue` extensions exist in `src/`
- `vite.config.ts` uses `@vitejs/plugin-vue`
- Entry point calls `createApp`

→ **Load:** [vue.md](./references/vue.md)

---

### 4. Vanilla JavaScript / HTML (fallback)

**Evidence to look for:**
- No major framework found in `package.json`
- Plain `.html` files reference a `<script type="module">`
- Entry point is a plain `.js` or `.ts` file with no framework imports
- User explicitly asks for vanilla JS or HTML integration

→ **Load:** [vanilla-js.md](./references/vanilla-js.md)

---

## If the Framework Cannot Be Determined

Ask the user directly:

> "What framework or platform are you using? (React, Angular, Vue 3, or Vanilla JS / HTML)"

Then load the matching reference from the options above.

---

## Framework Reference Files

| Framework / Platform | Reference |
|----------------------|-----------|
| React | [react.md](./references/react.md) |
| Angular | [angular.md](./references/angular.md) |
| Vue 3 | [vue.md](./references/vue.md) |
| Vanilla JS / HTML | [vanilla-js.md](./references/vanilla-js.md) |

Each reference covers:

- Installation
- Theme import (required for styling)
- Component registration
- Usage examples
- TypeScript support
- Platform-specific considerations
- Common issues and solutions


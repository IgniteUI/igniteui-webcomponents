---
license: MIT
name: igniteui-wc-optimize-bundle-size
description: "Reduce the application bundle size with Ignite UI Web Components. Register only the necessary components with named imports from the package root and defineComponents, not defineAllComponents. Lazy-load large components, bundle one theme, and use bundle analysis to verify tree-shaking. WHEN TO USE: the user reports a large bundle or a slow load, asks how to import components one at a time, wants to ship only one of the four themes, wants to lazy-load grids, charts, or dock manager, or needs to audit Ignite UI imports in Vite/webpack/Rollup builds. WHEN NOT TO USE: initial package installation or framework configuration (use integrate-with-framework), choosing components (use choose-components), theming (use customize-component-theme), or general performance problems that are not related to bundle size, such as runtime rendering or data virtualization."
user-invocable: true
---

# Optimize Bundle Size

Use this skill to reduce the bundle size of an application that uses Ignite UI Web Components. Import only the necessary components. Follow the best practices for tree-shaking.

## Example Usage

- "My bundle size is too large"
- "How do I reduce the size of igniteui-webcomponents?"
- "Import only the components I need"
- "Tree-shake unused components"
- "Optimize imports for production"

## Related Skills

- [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) - Correct integration setup
- [igniteui-wc-customize-component-theme](../igniteui-wc-customize-component-theme/SKILL.md) - Theming after optimization

## When to Use

- The user's bundle size is too large
- The user wants to optimize the app for production
- The user imports more components than necessary
- The user asks about tree-shaking or optimization
- The user wants faster load times

## Key Principles

1. **Import only what you use** - Do not use `defineAllComponents()`
2. **Use named imports** - Named imports enable tree-shaking
3. **Analyze your bundle** - Identify what the bundle includes
4. **Lazy load when possible** - Load components only when the app needs them
5. **Bundle one theme** - Set an `igc-theme-<name>` condition if the app uses only one theme

## Import Strategies

### ❌ Bad: Import Everything

```typescript
// DON'T DO THIS - imports ALL components (~500KB+)
import { defineAllComponents } from 'igniteui-webcomponents';

defineAllComponents();
```

**Impact:** The bundle includes all 60+ components, also the components that you do not use.

### ✅ Good: Import Specific Components

```typescript
// DO THIS - import only what you need
import {
  defineComponents,
  IgcButtonComponent,
  IgcInputComponent,
  IgcCardComponent
} from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcInputComponent, IgcCardComponent);
```

**Impact:** The bundle includes only 3 components and their dependencies.

## React Applications

If you use React, you can use the **`igniteui-react`** package instead of `igniteui-webcomponents`. It has the same components with React-friendly wrappers. It usually gives better tree-shaking:

```bash
npm install igniteui-react
```

```tsx
import { IgrButton, IgrInput, IgrCard } from 'igniteui-react';

// No need to call defineComponents - components register automatically
function MyComponent() {
  return (
    <div>
      <IgrButton variant="contained">Click me</IgrButton>
      <IgrInput label="Name" />
      <IgrCard>Content</IgrCard>
    </div>
  );
}
```

**Benefits for bundle size:**
- Automatic tree-shaking (the bundle includes only the imported components)
- No component registration overhead
- Better integration with React build tools

For more details, see the [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) skill.

## Analyzing Your Bundle

Use a bundle analyzer to identify the contents of the bundle before and after optimization.

**Vite projects** — [rollup-plugin-visualizer](https://www.npmjs.com/package/rollup-plugin-visualizer):
```bash
npm install --save-dev rollup-plugin-visualizer
```
Add `visualizer()` to the Vite `plugins` array. Then run `npm run build`. The plugin opens a treemap in the browser.

**Webpack projects** — [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer):
```bash
npm install --save-dev webpack-bundle-analyzer
```
Add `BundleAnalyzerPlugin` to the plugins in `webpack.config.js`. Then run `npm run build`.

**Framework-agnostic** — [source-map-explorer](https://www.npmjs.com/package/source-map-explorer):
```bash
npm install --save-dev source-map-explorer
# Then: source-map-explorer 'dist/**/*.js'
```

## Audit Your Component Usage

### 1. Find What Components You're Actually Using

Search your codebase for component usage:

```bash
# Search for component tags in templates
grep -r "igc-" src/ --include="*.html" --include="*.tsx" --include="*.vue"

# List unique components
grep -roh "igc-[a-z-]*" src/ | sort | uniq
```

### 2. Compare with Your Imports

Compare the components that you import with the components that you use:

```typescript
// Find in your code
import {
  defineComponents,
  IgcButtonComponent,
  IgcInputComponent,
  IgcCardComponent,
  IgcSelectComponent,  // ← Are you using this?
  IgcComboComponent,   // ← Are you using this?
} from 'igniteui-webcomponents';
```

### 3. Remove Unused Imports

Remove the components that you do not use:

```typescript
// Before: 5 components imported
import {
  defineComponents,
  IgcButtonComponent,
  IgcInputComponent,
  IgcCardComponent,
  IgcSelectComponent,
  IgcComboComponent,
} from 'igniteui-webcomponents';

defineComponents(
  IgcButtonComponent,
  IgcInputComponent,
  IgcCardComponent,
  IgcSelectComponent,
  IgcComboComponent
);

// After: Only 3 components needed
import {
  defineComponents,
  IgcButtonComponent,
  IgcInputComponent,
  IgcCardComponent,
} from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcInputComponent, IgcCardComponent);
```

## Lazy Loading Components

To make the initial bundle smaller, load components only when the app needs them.

### Vanilla JavaScript / TypeScript

```typescript
// Load immediately (increases initial bundle)
import { defineComponents, IgcDialogComponent } from 'igniteui-webcomponents';
defineComponents(IgcDialogComponent);

// Lazy load (smaller initial bundle)
async function showDialog() {
  const { defineComponents, IgcDialogComponent } = await import('igniteui-webcomponents');
  defineComponents(IgcDialogComponent);

  const dialog = document.createElement('igc-dialog');
  // ... use dialog
}
```

### React (using igniteui-react)

```tsx
import React, { lazy, Suspense, useState } from 'react';

// Lazy load the dialog component
const IgrDialog = lazy(() =>
  import('igniteui-react').then(module => ({ default: module.IgrDialog }))
);

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button onClick={() => setShowDialog(true)}>Open Dialog</button>
      {showDialog && (
        <Suspense fallback={<div>Loading...</div>}>
          <IgrDialog open>
            <h2>Dialog Content</h2>
          </IgrDialog>
        </Suspense>
      )}
    </>
  );
}
```

### React (using web components directly)

```tsx
import React, { useState } from 'react';

// Lazy load component registration
const lazyLoadDialog = async () => {
  const { defineComponents, IgcDialogComponent } = await import('igniteui-webcomponents');
  defineComponents(IgcDialogComponent);
};

function MyComponent() {
  const [dialogReady, setDialogReady] = useState(false);

  const openDialog = async () => {
    if (!dialogReady) {
      await lazyLoadDialog();
      setDialogReady(true);
    }
    // Show dialog
  };

  return (
    <button onClick={openDialog}>Open Dialog</button>
  );
}
```

### Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';

const dialogReady = ref(false);

async function openDialog() {
  if (!dialogReady.value) {
    const { defineComponents, IgcDialogComponent } = await import('igniteui-webcomponents');
    defineComponents(IgcDialogComponent);
    dialogReady.value = true;
  }
  // Show dialog
}
</script>

<template>
  <button @click="openDialog">Open Dialog</button>
  <igc-dialog v-if="dialogReady" open>
    <h2>Dialog Content</h2>
  </igc-dialog>
</template>
```

### Angular

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  template: `
    <button (click)="openDialog()">Open Dialog</button>
    <igc-dialog *ngIf="dialogReady" [open]="true">
      <h2>Dialog Content</h2>
    </igc-dialog>
  `
})
export class MyComponent {
  dialogReady = false;

  async openDialog() {
    if (!this.dialogReady) {
      const { defineComponents, IgcDialogComponent } = await import('igniteui-webcomponents');
      defineComponents(IgcDialogComponent);
      this.dialogReady = true;
    }
  }
}
```

## Route-Based Code Splitting

Load Ignite UI components only for the routes that need them. To do this, put the `defineComponents(...)` calls in the lazy-loaded route module for each framework.

### React (using React.lazy)

Put the component imports and `defineComponents` at the top of each page module. React `lazy()` + `Suspense` does the async split:

```tsx
// pages/Dashboard.tsx
import { IgrCard, IgrButton } from 'igniteui-react';

function Dashboard() {
  return (
    <div>
      <IgrCard>
        <h2>Dashboard</h2>
        <p>Dashboard content here</p>
      </IgrCard>
    </div>
  );
}
```

To put `pages/Dashboard` in a separate chunk, refer to the lazy-loading documentation of your router (React Router, TanStack Router, etc.).

### Vue 3

Use `onMounted` to register components only when the route mounts:

```vue
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(async () => {
  // Load components only for this route
  const { defineComponents, IgcCardComponent } = await import('igniteui-webcomponents');
  defineComponents(IgcCardComponent);
});
</script>
```

Refer to the Vue Router documentation for the `() => import('./views/Dashboard.vue')` lazy-route syntax.

### Angular

Put `defineComponents(...)` in the module or component of the route. Then only that lazy chunk includes it. Refer to the Angular Router documentation for `loadChildren` / `loadComponent` lazy loading.

## Build Configuration Optimizations

Make sure that your build tool runs in production mode with minification enabled. For Vite, `vite build` does this by default. For Webpack, set `mode: 'production'`.

To reduce chunk-size warnings from Ignite UI components, increase the `chunkSizeWarningLimit` in Vite. In Webpack, configure `splitChunks` to put the `igniteui-*` packages in a named vendor chunk. For the exact configuration options, refer to the documentation of your build tool.

## Bundle Only One Theme

Each component ships the styles of all four themes (Material, Bootstrap, Indigo and Fluent) and applies the active one. If the app uses only one theme, set the `igc-theme-<name>` condition in the bundler. The bundle then contains only the component styles of that theme, light and dark, and is approximately 15–17% smaller after gzip.

For example, in Vite:

```typescript
// vite.config.ts
import { defaultClientConditions, defineConfig } from 'vite';

export default defineConfig({
  resolve: { conditions: ['igc-theme-bootstrap', ...defaultClientConditions] },
});
```

| Tool | Setting |
|---|---|
| Vite | `resolve: { conditions: ['igc-theme-bootstrap', ...defaultClientConditions] }`, with `defaultClientConditions` imported from `vite`. For SSR, also set `ssr.resolve.conditions` with `defaultServerConditions`. |
| webpack | `resolve: { conditionNames: ['igc-theme-bootstrap', '...'] }` |
| esbuild | `conditions: ['igc-theme-bootstrap']` |
| Rollup | `nodeResolve({ exportConditions: ['igc-theme-bootstrap'] })` |
| Node.js (SSR) | `node --conditions=igc-theme-bootstrap server.js` |

- The conditions are `igc-theme-material`, `igc-theme-bootstrap`, `igc-theme-indigo` and `igc-theme-fluent`. Set only one.
- Use the condition only if the app does not call `configureTheme()` with another theme. A theme that is not in the bundle gives only the structural styles.
- The app still loads the global theme CSS, for example `igniteui-webcomponents/themes/light/bootstrap.css`.
- `igniteui-react` uses `igniteui-webcomponents`, so the same condition applies.

## Size Comparison

The actual sizes depend mostly on the components that you import. Grid and chart components are much larger than UI components. Use your bundle analyzer to measure the real effect in your project. Do not rely on generic estimates.

The key rule: import a subset of components with `defineComponents()`, not all components with `defineAllComponents()`. The bundle then decreases by the size of each component that you do not include. It also decreases by the size of all exclusive dependencies of these components.

## Best Practices Checklist

- [ ] **Do not use `defineAllComponents()`** if the app does not need every component
- [ ] **Use `defineComponents()` with the specific components** that you need
- [ ] **Audit your imports regularly** - remove the components that you do not use
- [ ] **Lazy load rarely-used components** (dialogs, modals, etc.)
- [ ] **Set an `igc-theme-<name>` condition** if the app uses only one theme
- [ ] **Split by routes** - load components only for active routes
- [ ] **Analyze your bundle** - use bundle analyzer tools
- [ ] **Enable tree-shaking** - use named imports, not side-effect imports
- [ ] **Minify in production** - enable minification in the build tool
- [ ] **Use compression** - enable gzip/brotli on your server

## Common Issues and Solutions

### Issue: Bundle still large after following best practices

**Investigate:**

1. Check if you import many components at the same time
2. Make sure that tree-shaking works (check the build output)
3. Search for duplicate dependencies
4. Check if the production build includes source maps
5. For React, make sure that you use `igniteui-react` instead of `igniteui-webcomponents`

**Solutions:**

```typescript
// Review your imports - are you using all of these?
import {
  defineComponents,
  IgcButtonComponent,
  IgcInputComponent,
  IgcSelectComponent,
  IgcComboComponent,
  IgcDatePickerComponent
} from 'igniteui-webcomponents';

// Consider lazy loading components you don't need immediately
async function loadDialog() {
  const { defineComponents, IgcDialogComponent } = await import('igniteui-webcomponents');
  defineComponents(IgcDialogComponent);
}
```

### Issue: Components not working after optimizing imports

**Cause:** You did not import a component that you use.

**Solution:**

```typescript
// Error: <igc-button> not working
// You're using igc-button but didn't import it

import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';
defineComponents(IgcButtonComponent); // Add this
```

### Issue: TypeScript errors after changing imports

**Solution:** Update the type imports:

```typescript
// Import types separately if needed
import type { IgcButtonComponent } from 'igniteui-webcomponents';
```

## Monitoring Bundle Size

To monitor the bundle size in CI continuously, you can use tools such as [bundlesize](https://www.npmjs.com/package/bundlesize), [size-limit](https://www.npmjs.com/package/size-limit), or the [Bundlewatch GitHub Action](https://github.com/apps/bundlewatch). These tools can fail a pull request if the bundle is larger than a defined limit. After you complete the import optimization, configure a size limit that is applicable to the component set of your project.

## Next Steps

- Profile your application with the Chrome DevTools Performance tab
- Use lazy loading for large components
- If possible, use a CDN for static assets
- Enable HTTP/2 for better resource loading
- Check [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) for the correct setup

## Additional Resources

- [Webpack Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [Web Performance Optimization](https://web.dev/fast/)
- [Bundle Size Analysis Tools](https://bundlephobia.com/)

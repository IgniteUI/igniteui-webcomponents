---
name: igniteui-wc-optimize-bundle-size
description: Optimize application bundle size by importing only necessary components and using tree-shaking effectively
user-invocable: true
---

# Optimize Bundle Size

This skill helps users minimize their application's bundle size when using Ignite UI Web Components by importing only the components they need and following best practices for tree-shaking.

## Example Usage

- "My bundle size is too large"
- "How do I reduce the size of igniteui-webcomponents?"
- "Import only the components I need"
- "Tree-shake unused components"
- "Optimize imports for production"

## Related Skills

- [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) - Proper integration setup
- [igniteui-wc-customize-component-theme](../igniteui-wc-customize-component-theme/SKILL.md) - Theming after optimization

## When to Use

- User's bundle size is too large
- User wants to optimize for production
- User is importing more components than needed
- User asks about tree-shaking or optimization
- User wants to improve load times

## Key Principles

1. **Import only what you use** - Don't use `defineAllComponents()`
2. **Use named imports** - Enable tree-shaking
3. **Analyze your bundle** - Identify what's being included
4. **Lazy load when possible** - Load components on demand

## Import Strategies

### ❌ Bad: Import Everything

```typescript
// DON'T DO THIS - imports ALL components (~500KB+)
import { defineAllComponents } from 'igniteui-webcomponents';

defineAllComponents();
```

**Impact:** Includes all 60+ components whether you use them or not.

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

**Impact:** Bundle includes only 3 components and their dependencies.

## React Applications

If you're using React, consider using the **`igniteui-react`** package instead of `igniteui-webcomponents`. It provides the same components with React-friendly wrappers and typically results in better tree-shaking:

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
- Automatic tree-shaking (only imported components are included)
- No need for component registration overhead
- Better integration with React build tools

For more details, see the [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) skill.

## Analyzing Your Bundle

Use a bundle analyzer to identify what's being included before and after optimization.

**Vite projects** — [rollup-plugin-visualizer](https://www.npmjs.com/package/rollup-plugin-visualizer):
```bash
npm install --save-dev rollup-plugin-visualizer
```
Add `visualizer()` to the Vite `plugins` array and run `npm run build`. The plugin opens a treemap in the browser.

**Webpack projects** — [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer):
```bash
npm install --save-dev webpack-bundle-analyzer
```
Add `BundleAnalyzerPlugin` to `webpack.config.js` plugins and run `npm run build`.

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

Check what you're importing vs what you're using:

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

Remove components you're not using:

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

Load components only when needed to reduce initial bundle size.

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

Load Ignite UI components only for the routes that need them by placing `defineComponents(...)` calls inside the lazy-loaded route module for each framework.

### React (using React.lazy)

Put component imports and `defineComponents` at the top of each page module. React's `lazy()` + `Suspense` handles the async split:

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

Refer to your router's lazy-loading docs (React Router, TanStack Router, etc.) for how to split `pages/Dashboard` into its own chunk.

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

Refer to Vue Router docs for the `() => import('./views/Dashboard.vue')` lazy-route syntax.

### Angular

Place `defineComponents(...)` inside the route's module or component so it's included only in that lazy chunk. Refer to Angular Router docs for `loadChildren` / `loadComponent` lazy loading.

## Build Configuration Optimizations

Ensure your build tool is running in production mode with minification enabled. For Vite, this is the default for `vite build`. For Webpack, set `mode: 'production'`.

To reduce chunk-size warnings from Ignite UI components, increase the `chunkSizeWarningLimit` in Vite or configure `splitChunks` in Webpack to place `igniteui-*` packages in a named vendor chunk. Consult your build tool's documentation for the exact configuration options.

## Size Comparison

Actual sizes depend heavily on which components you import (grid and chart components are significantly larger than UI components). Use your bundle analyzer to measure the real impact in your project rather than relying on generic estimates.

The key rule: importing a subset of components with `defineComponents()` instead of `defineAllComponents()` will reduce the bundle by the weight of every component you don't include, plus all of their exclusive dependencies.

## Best Practices Checklist

- [ ] **Never use `defineAllComponents()`** unless you truly need every component
- [ ] **Use `defineComponents()` with specific components** you need
- [ ] **Audit your imports regularly** - remove unused components
- [ ] **Lazy load rarely-used components** (dialogs, modals, etc.)
- [ ] **Split by routes** - load components only for active routes
- [ ] **Analyze your bundle** - use bundle analyzer tools
- [ ] **Enable tree-shaking** - use named imports, not side-effect imports
- [ ] **Minify in production** - ensure build tool minification is enabled
- [ ] **Use compression** - enable gzip/brotli on your server

## Common Issues and Solutions

### Issue: Bundle still large after following best practices

**Investigate:**

1. Check if you're importing many components at once
2. Verify tree-shaking is working (check build output)
3. Look for duplicate dependencies
4. Check if source maps are included in production
5. For React, ensure you're using `igniteui-react` instead of `igniteui-webcomponents`

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

**Cause:** Forgot to import a component you're using

**Solution:**

```typescript
// Error: <igc-button> not working
// You're using igc-button but didn't import it

import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';
defineComponents(IgcButtonComponent); // Add this
```

### Issue: TypeScript errors after changing imports

**Solution:** Update type imports:

```typescript
// Import types separately if needed
import type { IgcButtonComponent } from 'igniteui-webcomponents';
```

## Monitoring Bundle Size

For ongoing bundle size monitoring in CI, tools like [bundlesize](https://www.npmjs.com/package/bundlesize), [size-limit](https://www.npmjs.com/package/size-limit), or the [Bundlewatch GitHub Action](https://github.com/apps/bundlewatch) can fail a pull request when the bundle exceeds a defined threshold. Configure a size limit appropriate for your project's component set after you've completed the import optimization.

## Next Steps

- Profile your application with Chrome DevTools Performance tab
- Implement lazy loading for heavy components
- Consider using CDN for static assets
- Enable HTTP/2 for better resource loading
- Check [igniteui-wc-integrate-with-framework](../igniteui-wc-integrate-with-framework/SKILL.md) for proper setup

## Additional Resources

- [Webpack Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [Web Performance Optimization](https://web.dev/fast/)
- [Bundle Size Analysis Tools](https://bundlephobia.com/)

---
name: optimize-bundle-size
description: Optimize application bundle size by importing only necessary components and using tree-shaking effectively
user-invokable: true
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

- [integrate-with-framework](../integrate-with-framework/) - Proper integration setup
- [customize-component-theme](../customize-component-theme/) - Theming after optimization

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

For more details, see the [integrate-with-framework](../integrate-with-framework/) skill.

## Analyzing Your Bundle

### Using Webpack Bundle Analyzer

**Installation:**

```bash
npm install --save-dev webpack-bundle-analyzer
```

**Configuration (`webpack.config.js`):**

```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

**Run analysis:**

```bash
npm run build
# Open bundle-report.html to see what's included
```

### Using Vite Bundle Analyzer

**Installation:**

```bash
npm install --save-dev rollup-plugin-visualizer
```

**Configuration (`vite.config.ts`):**

```typescript
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
});
```

**Run analysis:**

```bash
npm run build
# Opens stats.html automatically
```

### Using source-map-explorer

**Installation:**

```bash
npm install --save-dev source-map-explorer
```

**Package.json:**

```json
{
  "scripts": {
    "analyze": "source-map-explorer 'dist/**/*.js'"
  }
}
```

**Run:**

```bash
npm run build
npm run analyze
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
import React, { lazy, Suspense } from 'react';

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
import React, { useEffect, useState } from 'react';

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

Load components only for specific routes.

### React Router

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load route components
const HomePage = lazy(() => import('./pages/Home'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**In route component (`pages/Dashboard.tsx`):**

```tsx
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

### Vue Router

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue') // Lazy load
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue') // Lazy load
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
```

**In route component (`views/Dashboard.vue`):**

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

### Angular

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

## Build Configuration Optimizations

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true
      }
    },

    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'vendor': ['igniteui-webcomponents'],
        }
      }
    },

    // Set chunk size warning limit
    chunkSizeWarningLimit: 600,
  },

  // Optimize deps
  optimizeDeps: {
    include: ['igniteui-webcomponents']
  }
});
```

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        igniteui: {
          test: /[\\/]node_modules[\\/]igniteui-webcomponents[\\/]/,
          name: 'igniteui',
          priority: 20,
        }
      }
    },
    minimize: true,
  },

  // Tree shaking
  mode: 'production',
};
```

## Size Comparison

Here's what you can expect in terms of bundle size:

| Import Strategy | Approximate Size (gzipped) | Components Included |
|----------------|---------------------------|---------------------|
| `defineAllComponents()` | ~500KB+ | All 60+ components |
| 10 components via `defineComponents()` | ~150-200KB | 10 components + deps |
| 5 components via `defineComponents()` | ~100-150KB | 5 components + deps |
| 3 components via `defineComponents()` | ~80-120KB | 3 components + deps |
| 1 component via `defineComponents()` | ~50-80KB | 1 component + deps |

**Note:** Sizes vary based on which components you import (some have more dependencies than others).

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

### Set up bundle size monitoring in CI/CD

**Using bundlesize (for any build tool):**

```bash
npm install --save-dev bundlesize
```

**Package.json:**

```json
{
  "scripts": {
    "test:size": "bundlesize"
  },
  "bundlesize": [
    {
      "path": "./dist/**/*.js",
      "maxSize": "300 kB"
    }
  ]
}
```

**Run in CI:**

```bash
npm run build
npm run test:size
```

### GitHub Actions Example

```yaml
name: Bundle Size Check

on: [pull_request]

jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:size
```

## Expected Results

After optimization, you should see:

- **Initial load time reduced** by 40-60%
- **Bundle size reduced** by 50-80%
- **Better Core Web Vitals** scores
- **Faster time to interactive**
- **Lower bandwidth usage** for users

## Next Steps

- Profile your application with Chrome DevTools Performance tab
- Implement lazy loading for heavy components
- Consider using CDN for static assets
- Enable HTTP/2 for better resource loading
- Check [integrate-with-framework](../integrate-with-framework/) for proper setup

## Additional Resources

- [Webpack Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [Web Performance Optimization](https://web.dev/fast/)
- [Bundle Size Analysis Tools](https://bundlephobia.com/)

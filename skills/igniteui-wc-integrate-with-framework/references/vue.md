# Integrating Ignite UI Web Components — Vue 3

> Package note: This page shows the default setup for `igniteui-webcomponents`. If the routing step selected `igniteui-webcomponents-charts`, `igniteui-webcomponents-grids`, `igniteui-grid-lite`, or `igniteui-dockmanager`, use the setup of that package for the package-specific steps below. These are the install, import, and registration steps.

## Installation

```bash
npm install igniteui-webcomponents
```

## Setup

### Step 1 — Configure Vue to recognize custom elements

Vue must know which tags are custom elements. If it does not know, Vue shows warnings about unknown components.

**With Vite** (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all igc-* tags as custom elements
          isCustomElement: (tag) => tag.startsWith('igc-')
        }
      }
    })
  ]
});
```

**With Vue CLI** (`vue.config.js`):

```javascript
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('igc-')
        }
      }));
  }
};
```

### Step 2 — Register the theme and components

In `src/main.ts`, import a theme and register the components before you mount the app:

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcInputComponent);

createApp(App).mount('#app');
```

## Available Themes

| Theme     | Light                                                  | Dark                                                  |
|-----------|--------------------------------------------------------|-------------------------------------------------------|
| Bootstrap | `igniteui-webcomponents/themes/light/bootstrap.css`    | `igniteui-webcomponents/themes/dark/bootstrap.css`    |
| Material  | `igniteui-webcomponents/themes/light/material.css`     | `igniteui-webcomponents/themes/dark/material.css`     |
| Fluent    | `igniteui-webcomponents/themes/light/fluent.css`       | `igniteui-webcomponents/themes/dark/fluent.css`       |
| Indigo    | `igniteui-webcomponents/themes/light/indigo.css`       | `igniteui-webcomponents/themes/dark/indigo.css`       |

## Usage in Components

```vue
<template>
  <div>
    <igc-button variant="contained" @click="handleClick">
      Click me
    </igc-button>

    <igc-input
      :label="inputLabel"
      placeholder="Enter your name"
      :required="true"
      @igcChange="handleChange">
    </igc-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputLabel = ref('Name');

const handleClick = () => {
  console.log('Button clicked');
};

const handleChange = (event: CustomEvent) => {
  console.log('Input changed', event.detail);
};
</script>
```

## Working with Complex Properties

Attributes accept only strings. Use a template ref to pass objects and arrays:

```vue
<template>
  <igc-combo ref="comboRef"></igc-combo>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const comboRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (comboRef.value) {
    (comboRef.value as any).data = [
      { value: 1, label: 'Item 1' },
      { value: 2, label: 'Item 2' },
    ];
  }
});
</script>
```

## Key Considerations

| Concern | Details |
|---------|---------|
| **isCustomElement** | Required in Vite/CLI config so that Vue does not treat `igc-*` tags as unresolved components |
| **Event binding** | Use `@igcInput`, `@igcChange`, etc. — not `@input` or `@change` |
| **Property binding** | Use `:property="value"` or `v-bind:property="value"` for reactive data |
| **Complex data** | Use a template ref and set the property in `onMounted` |

## TypeScript Support

The `igniteui-webcomponents` package automatically registers all component types in `HTMLElementTagNameMap`. DOM queries are fully typed:

```typescript
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent);

// Automatically typed as IgcButtonComponent | null
const button = document.querySelector('igc-button');
```

## Common Issues

### Vue warns "Unknown custom element: igc-button"

Configure `isCustomElement` in `vite.config.ts` (or `vue.config.js`) so that Vue does not try to resolve `igc-*` tags.

### Events not firing

Use the Vue `@igcInput` / `@igcChange` syntax. Ignite UI components emit custom events with a prefix. Standard DOM events such as `input` or `change` behave differently.

### No styles applied

Make sure that you import a theme CSS file in `main.ts` before `createApp`. Without it, components render without styles.

### Complex data not reflecting

Use a `ref` in `onMounted` to set objects and arrays. Do not bind them as HTML attributes. Attributes accept only serialized strings.

---

## Next Steps

- [Optimize bundle size](../../igniteui-wc-optimize-bundle-size/) — import only the components that you use
- [Customize themes](../../igniteui-wc-customize-component-theme/) — apply your brand colors
- [Component documentation](https://igniteui.github.io/igniteui-webcomponents) — the full API reference

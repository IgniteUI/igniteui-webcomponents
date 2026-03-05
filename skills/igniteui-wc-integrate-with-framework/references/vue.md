# Integrating Ignite UI Web Components — Vue 3

## Installation

```bash
npm install igniteui-webcomponents
```

## Setup

### Step 1 — Configure Vue to recognize custom elements

Vue needs to know which tags are custom elements so it does not warn about unknown components.

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

In `src/main.ts`, import a theme and register the components before mounting:

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

Attributes only accept strings. Pass objects and arrays using a template ref:

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
| **isCustomElement** | Required in Vite/CLI config so Vue doesn't treat `igc-*` tags as unresolved components |
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

Configure `isCustomElement` in `vite.config.ts` (or `vue.config.js`) so Vue skips resolution for `igc-*` tags.

### Events not firing

Use Vue's `@igcInput` / `@igcChange` syntax. Ignite UI components emit prefixed custom events — standard DOM events like `input` or `change` behave differently.

### No styles applied

Ensure you import a theme CSS file in `main.ts` before `createApp`. Without it, components render unstyled.

### Complex data not reflecting

Set objects and arrays via a `ref` in `onMounted`. Do not bind them as HTML attributes — attributes only accept serialized strings.

---

## Next Steps

- [Optimize bundle size](../../igniteui-wc-optimize-bundle-size/) — import only the components you use
- [Customize themes](../../igniteui-wc-customize-component-theme/) — apply your brand colors
- [Component documentation](https://igniteui.github.io/igniteui-webcomponents) — full API reference

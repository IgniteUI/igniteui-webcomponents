---
name: integrate-with-framework
description: Integrate igniteui-webcomponents into React, Angular, Vue, or vanilla JS applications with framework-specific configurations
user-invokable: true
---

# Integrate with Framework

This skill helps users integrate Ignite UI Web Components into their preferred framework or vanilla JavaScript application.

## Example Usage

- "How do I use igniteui-webcomponents in my React app?"
- "Integrate the button component in Angular"
- "Set up igniteui-webcomponents in Vue 3"
- "Help me add web components to my vanilla JS project"

## Related Skills

- [optimize-bundle-size](../optimize-bundle-size/) - Reduce bundle size after integration
- [customize-component-theme](../customize-component-theme/) - Style components after setup

## When to Use

- User wants to add igniteui-webcomponents to a framework project
- User is experiencing framework-specific integration issues
- User needs help with component imports and registration
- User asks about React, Angular, Vue, or vanilla JS setup

## Prerequisites

Before starting, ensure:

- [ ] Framework or vanilla JS is identified
- [ ] Package manager (npm, yarn, pnpm) is available
- [ ] Project is already initialized

## Common Integration Patterns

### 1. Vanilla JavaScript / HTML

**Installation:**

```bash
npm install igniteui-webcomponents
```

**Import and register components (in your main JS file):**

```typescript
// Option 1: Import specific components (recommended)
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcInputComponent);

// Option 2: Import all components (larger bundle)
import { defineAllComponents } from 'igniteui-webcomponents';

defineAllComponents();
```

**Usage in HTML:**

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./main.js"></script>
</head>
<body>
  <igc-button variant="contained">Click me</igc-button>
  <igc-input label="Name" placeholder="Enter your name"></igc-input>
</body>
</html>
```

### 2. React

#### Option A: Using igniteui-react (Recommended)

For React applications, we provide a dedicated **`igniteui-react`** package that wraps the web components with React-specific bindings. This package addresses React's pain points with web components, including:

- ✅ Proper event handling (no need for `addEventListener`)
- ✅ TypeScript support with full type definitions
- ✅ Automatic global type declarations (`HTMLElementTagNameMap`)
- ✅ React-friendly props (camelCase instead of kebab-case)
- ✅ Automatic property binding for complex data
- ✅ Better integration with React DevTools

**Installation:**

```bash
npm install igniteui-react
```

**Usage:**

```tsx
import { IgrButton, IgrInput } from 'igniteui-react';

function MyComponent() {
  const handleClick = (event: CustomEvent) => {
    console.log('Button clicked', event.detail);
  };

  const handleChange = (event: CustomEvent) => {
    console.log('Input changed', event.detail);
  };

  return (
    <div>
      {/* Use PascalCase components with proper event props */}
      <IgrButton variant="contained" onClick={handleClick}>
        Click me
      </IgrButton>

      {/* Props work naturally */}
      <IgrInput
        label="Name"
        placeholder="Enter your name"
        required
        onChange={handleChange}
      />
    </div>
  );
}
```

**Complex data example:**

```tsx
import { IgrCombo } from 'igniteui-react';

function MyComponent() {
  const data = [
    { value: 1, label: 'Item 1' },
    { value: 2, label: 'Item 2' }
  ];

  return <IgrCombo data={data} />;
}
```

For more information, see the [igniteui-react documentation](https://www.npmjs.com/package/igniteui-react).

---

#### Option B: Using Web Components Directly

If you prefer or need to use the web components directly without the React wrapper:

**Installation:**

```bash
npm install igniteui-webcomponents
```

**Create a setup file (e.g., `src/igniteui-setup.ts`):**

```typescript
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

// Register components once at app startup
defineComponents(IgcButtonComponent, IgcInputComponent);
```

**Import in your main entry point (`src/main.tsx` or `src/index.tsx`):**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './igniteui-setup'; // Import before App
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Usage in React components:**

```tsx
import React, { useRef, useEffect } from 'react';

function MyComponent() {
  const buttonRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const button = buttonRef.current;

    // Handle custom events with addEventListener
    const handleClick = (event: CustomEvent) => {
      console.log('Button clicked', event.detail);
    };

    button?.addEventListener('igcClick', handleClick as EventListener);

    return () => {
      button?.removeEventListener('igcClick', handleClick as EventListener);
    };
  }, []);

  return (
    <div>
      {/* Use lowercase for web components in JSX */}
      <igc-button ref={buttonRef} variant="contained">
        Click me
      </igc-button>

      {/* Pass primitives as attributes */}
      <igc-input
        label="Name"
        placeholder="Enter your name"
        required
      />
    </div>
  );
}
```

**Important Considerations When Using Web Components Directly:**

1. **Event Handling**: React's synthetic events don't work with custom events. Use `addEventListener` with refs.
2. **Attribute Naming**: Use lowercase kebab-case for attributes (React converts them properly).
3. **Boolean Attributes**: Pass boolean values directly: `required` or `disabled`.
4. **Complex Data**: For objects/arrays, use refs to set properties directly:

```tsx
const comboRef = useRef<any>(null);

useEffect(() => {
  if (comboRef.current) {
    comboRef.current.data = [{ value: 1, label: 'Item 1' }];
  }
}, []);

return <igc-combo ref={comboRef}></igc-combo>;
```

### 3. Angular

**Installation:**

```bash
npm install igniteui-webcomponents
```

**Enable custom elements schema in your module or component:**

For standalone components (`app.config.ts` or component file):

```typescript
import { ApplicationConfig, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
  ],
  // Add schema
};

// In your standalone component:
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <igc-button variant="contained">Click me</igc-button>
  `
})
export class MyComponent {}
```

For NgModule-based apps (`app.module.ts`):

```typescript
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class AppModule {}
```

**Register components in `main.ts`:**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

// Register components before bootstrapping
defineComponents(IgcButtonComponent, IgcInputComponent);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

**Usage in Angular templates:**

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-my-component',
  template: `
    <igc-button
      #myButton
      variant="contained"
      (igcClick)="handleClick($event)">
      Click me
    </igc-button>

    <igc-input
      [label]="inputLabel"
      [placeholder]="'Enter your name'"
      [required]="true"
      (igcChange)="handleChange($event)">
    </igc-input>
  `
})
export class MyComponent implements AfterViewInit {
  @ViewChild('myButton') buttonRef!: ElementRef;

  inputLabel = 'Name';

  ngAfterViewInit() {
    // Access element directly if needed
    const button = this.buttonRef.nativeElement;
    console.log(button);
  }

  handleClick(event: CustomEvent) {
    console.log('Button clicked', event.detail);
  }

  handleChange(event: CustomEvent) {
    console.log('Input changed', event.detail);
  }
}
```

**Important Angular Considerations:**

1. **CUSTOM_ELEMENTS_SCHEMA**: Required to use web components in templates.
2. **Event Binding**: Use Angular's event binding syntax `(eventName)="handler($event)"`.
3. **Property Binding**: Use `[property]="value"` for complex data.
4. **Form Integration**: Web components work with Angular Forms using `ngModel` or form controls.

### 4. Vue 3

**Installation:**

```bash
npm install igniteui-webcomponents
```

**Configure Vue to recognize custom elements (`vite.config.ts` or `vue.config.js`):**

For Vite:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all tags starting with 'igc-' as custom elements
          isCustomElement: (tag) => tag.startsWith('igc-')
        }
      }
    })
  ]
});
```

For Vue CLI (`vue.config.js`):

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

**Register components in `main.ts`:**

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

// Register components
defineComponents(IgcButtonComponent, IgcInputComponent);

createApp(App).mount('#app');
```

**Usage in Vue components:**

```vue
<template>
  <div>
    <!-- Use kebab-case for web components -->
    <igc-button
      variant="contained"
      @igcClick="handleClick">
      Click me
    </igc-button>

    <!-- Bind properties with : or v-bind -->
    <igc-input
      :label="inputLabel"
      placeholder="Enter your name"
      :required="true"
      @igcChange="handleChange">
    </igc-input>

    <!-- For complex data, set via ref -->
    <igc-combo ref="comboRef"></igc-combo>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const inputLabel = ref('Name');
const comboRef = ref<HTMLElement | null>(null);

const handleClick = (event: CustomEvent) => {
  console.log('Button clicked', event.detail);
};

const handleChange = (event: CustomEvent) => {
  console.log('Input changed', event.detail);
};

onMounted(() => {
  // Set complex properties via ref
  if (comboRef.value) {
    (comboRef.value as any).data = [
      { value: 1, label: 'Item 1' },
      { value: 2, label: 'Item 2' }
    ];
  }
});
</script>
```

**Important Vue Considerations:**

1. **isCustomElement**: Must configure Vue to recognize web components prefix.
2. **Event Binding**: Use `@eventName` for custom events.
3. **Property Binding**: Use `:property` or `v-bind:property` for reactive data.
4. **Complex Data**: Use refs to access and set complex properties.

## TypeScript Support

### Using igniteui-react

The `igniteui-react` package automatically provides:

- ✅ **Full TypeScript type definitions** for all components and props
- ✅ **Automatic global type declarations** for HTML elements (`HTMLElementTagNameMap`)
- ✅ **IntelliSense support** out of the box

No additional TypeScript configuration is needed!

```tsx
import { IgrButton } from 'igniteui-react';

// TypeScript knows about IgrButton props automatically
function MyComponent() {
  return <IgrButton variant="contained">Click</IgrButton>;
}

// DOM queries are also typed automatically
const button = document.querySelector('igc-button'); // Typed as IgcButtonComponent | null
```

---

### Using Web Components Directly

The `igniteui-webcomponents` package **automatically provides global type declarations** for all HTML elements via `HTMLElementTagNameMap`. You don't need to manually declare types!

**Import types for better IntelliSense:**

```typescript
import type {
  IgcButtonComponent,
  IgcInputComponent
} from 'igniteui-webcomponents';

// Use in type annotations
const buttonElement: IgcButtonComponent = document.querySelector('igc-button')!;
```

**DOM queries are automatically typed:**

```typescript
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent);

// TypeScript automatically knows the type - no manual declarations needed!
const button = document.querySelector('igc-button'); // Typed as IgcButtonComponent | null

// IntelliSense works automatically
button?.setAttribute('variant', 'contained');
```

The package exports type definitions and registers all component types in the global `HTMLElementTagNameMap` interface, so your IDE will provide full autocomplete and type checking without any additional configuration.

## Common Issues and Solutions

### Issue: Components not rendering

**Solution:** Ensure components are registered before they're used in the DOM:

```typescript
// ❌ Wrong - component used before registration
document.body.innerHTML = '<igc-button>Click</igc-button>';
defineComponents(IgcButtonComponent);

// ✅ Correct - register first
defineComponents(IgcButtonComponent);
document.body.innerHTML = '<igc-button>Click</igc-button>';
```

### Issue: Events not firing in React

**Best Solution:** Use the `igniteui-react` package which handles events properly:

```tsx
import { IgrButton } from 'igniteui-react';

// ✅ Events work naturally with igniteui-react
<IgrButton onIgcClick={handleClick}>Click</IgrButton>
```

**Alternative Solution (using web components directly):** Use `addEventListener` with refs:

```tsx
// ❌ Wrong - React synthetic events don't work with web components
<igc-button onClick={handleClick}>Click</igc-button>

// ✅ Correct - use addEventListener with web components
const buttonRef = useRef<HTMLElement>(null);
useEffect(() => {
  const handler = (e: Event) => handleClick(e);
  buttonRef.current?.addEventListener('igcClick', handler);
  return () => buttonRef.current?.removeEventListener('igcClick', handler);
}, []);
return <igc-button ref={buttonRef}>Click</igc-button>;
```

### Issue: Vue warns about unknown custom element

**Solution:** Configure `isCustomElement` in Vue config (see Vue section above).

### Issue: Angular template errors

**Solution:** Add `CUSTOM_ELEMENTS_SCHEMA` to your component or module (see Angular section above).

### Issue: Complex properties not updating

**Solution:** Set complex properties (objects, arrays) via DOM properties, not attributes:

```typescript
// ❌ Wrong - attributes only accept strings
<igc-combo data="[{...}]"></igc-combo>

// ✅ Correct - set via property
const combo = document.querySelector('igc-combo');
combo.data = [{ value: 1, label: 'Item' }];
```

## Testing Integration

Verify your integration by checking:

1. Components render in the DOM
2. Events fire and are handled correctly
3. Properties update reactively
4. No console errors or warnings

## Next Steps

After integration:

- [Optimize bundle size](../optimize-bundle-size/) - Import only needed components
- [Customize themes](../customize-component-theme/) - Apply your brand colors
- Review [component documentation](https://igniteui.github.io/igniteui-webcomponents) for specific component APIs

## Additional Resources

- [igniteui-react Package](https://www.npmjs.com/package/igniteui-react) - React wrapper for Ignite UI Web Components
- [Lit Documentation - Using Lit with frameworks](https://lit.dev/docs/frameworks/overview/)
- [Web Components Best Practices](https://web.dev/custom-elements-best-practices/)

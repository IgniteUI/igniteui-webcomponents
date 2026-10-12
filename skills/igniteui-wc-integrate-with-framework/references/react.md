# Integrating Ignite UI Web Components — React

React integration uses the **`igniteui-react`** package. This package contains React-native wrappers for Ignite UI Web Components:

- ✅ Native React event handling
- ✅ Full TypeScript types and IntelliSense for all props
- ✅ Automatic global type declarations (`HTMLElementTagNameMap`)
- ✅ camelCase props instead of kebab-case attributes
- ✅ Complex data binding (objects and arrays work as props)
- ✅ React DevTools integration

Components use the `Igr` prefix (for example, `IgrButton`, `IgrInput`, `IgrCombo`).

> Package note: This page shows the default React wrapper setup for general UI components. If the routing step selected `igniteui-webcomponents-charts`, `igniteui-webcomponents-grids`, `igniteui-grid-lite`, or `igniteui-dockmanager`, use the setup of that package. Do not use the `igniteui-react` and `Igr*` instructions below without changes.

### Installation

```bash
npm install igniteui-react
```

### Setup

Import a theme in your application entry point (`src/main.tsx` or `src/index.tsx`):

```typescript
import 'igniteui-webcomponents/themes/light/bootstrap.css';
```

### Available Themes

| Theme     | Light                                                  | Dark                                                  |
|-----------|--------------------------------------------------------|-------------------------------------------------------|
| Bootstrap | `igniteui-webcomponents/themes/light/bootstrap.css`    | `igniteui-webcomponents/themes/dark/bootstrap.css`    |
| Material  | `igniteui-webcomponents/themes/light/material.css`     | `igniteui-webcomponents/themes/dark/material.css`     |
| Fluent    | `igniteui-webcomponents/themes/light/fluent.css`       | `igniteui-webcomponents/themes/dark/fluent.css`       |
| Indigo    | `igniteui-webcomponents/themes/light/indigo.css`       | `igniteui-webcomponents/themes/dark/indigo.css`       |

### Usage

```tsx
import { IgrButton, IgrInput } from 'igniteui-react';

function MyComponent() {
  // onClick is a standard React mouse event
  const handleClick = (e: React.MouseEvent) => console.log('Clicked');

  // onChange receives the component's change event
  const handleChange = (e: CustomEvent) => console.log(`Changed: ${e.detail}`);

  return (
    <div>
      <IgrButton variant="contained" onClick={handleClick}>
        Click me
      </IgrButton>

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

### Complex Data

Objects and arrays bind directly as props with `igniteui-react`:

```tsx
import { IgrCombo } from 'igniteui-react';

function MyComponent() {
  const items = [
    { value: 1, label: 'Item 1' },
    { value: 2, label: 'Item 2' },
  ];

  return <IgrCombo data={items} />;
}
```

### TypeScript Support

The `igniteui-react` package contains full type definitions. You do not need more configuration:

```tsx
import { IgrButton } from 'igniteui-react';

// TypeScript knows about all IgrButton props
<IgrButton variant="contained">Click</IgrButton>

// DOM queries are also typed automatically (via igniteui-webcomponents peer)
const button = document.querySelector('igc-button'); // IgcButtonComponent | null
```

---

## Common Issues

### Components not rendering

The `igniteui-react` package registers components automatically when you import them. Make sure that the package is installed. Make sure that you import the components before the component tree renders.

### No styles applied

Make sure that you import a theme CSS file in your entry point. Without it, components render without styles.

---

## Next Steps

- [Optimize bundle size](../../igniteui-wc-optimize-bundle-size/) — import only the components that you use
- [Customize themes](../../igniteui-wc-customize-component-theme/) — apply your brand colors
- [igniteui-react on npm](https://www.npmjs.com/package/igniteui-react) — React wrapper documentation
- [Component documentation](https://igniteui.github.io/igniteui-webcomponents) — the full API reference

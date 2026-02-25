# Integrating Ignite UI Web Components — Vanilla JavaScript / HTML

## Installation

```bash
npm install igniteui-webcomponents
```

## Setup

In your main JavaScript/TypeScript entry file, import a theme and register the components you need:

```typescript
// 1. Import a theme (required for correct styling)
import 'igniteui-webcomponents/themes/light/bootstrap.css';

// 2. Import and register specific components (recommended)
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcInputComponent);
```

To register all components at once (increases bundle size):

```typescript
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import { defineAllComponents } from 'igniteui-webcomponents';

defineAllComponents();
```

## Available Themes

| Theme     | Light                                                  | Dark                                                  |
|-----------|--------------------------------------------------------|-------------------------------------------------------|
| Bootstrap | `igniteui-webcomponents/themes/light/bootstrap.css`    | `igniteui-webcomponents/themes/dark/bootstrap.css`    |
| Material  | `igniteui-webcomponents/themes/light/material.css`     | `igniteui-webcomponents/themes/dark/material.css`     |
| Fluent    | `igniteui-webcomponents/themes/light/fluent.css`       | `igniteui-webcomponents/themes/dark/fluent.css`       |
| Indigo    | `igniteui-webcomponents/themes/light/indigo.css`       | `igniteui-webcomponents/themes/dark/indigo.css`       |

## Usage in HTML

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

## TypeScript Support

The `igniteui-webcomponents` package automatically provides global type declarations for all components via `HTMLElementTagNameMap`. DOM queries are fully typed without any extra configuration:

```typescript
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent);

// Automatically typed as IgcButtonComponent | null
const button = document.querySelector('igc-button');
button?.setAttribute('variant', 'outlined');
```

You can also import component types directly for annotations:

```typescript
import type { IgcButtonComponent } from 'igniteui-webcomponents';

const button = document.querySelector('igc-button') as IgcButtonComponent;
```

## Working with Complex Properties

Attributes only accept strings. For objects and arrays, set properties via JavaScript:

```typescript
// ❌ Wrong — attributes only accept strings
// <igc-combo data="[{...}]"></igc-combo>

// ✅ Correct — set via DOM property
const combo = document.querySelector('igc-combo');
combo.data = [
  { value: 1, label: 'Item 1' },
  { value: 2, label: 'Item 2' }
];
```

## Common Issues

### Components not rendering

Register components **before** they appear in the DOM:

```typescript
// ❌ Wrong
document.body.innerHTML = '<igc-button>Click</igc-button>';
defineComponents(IgcButtonComponent);

// ✅ Correct
defineComponents(IgcButtonComponent);
document.body.innerHTML = '<igc-button>Click</igc-button>';
```

### No styles applied

Ensure you import a theme CSS file in your entry point. Without it, components render unstyled.

## Next Steps

- [Optimize bundle size](../../igniteui-wc-optimize-bundle-size/SKILL.md) — import only the components you use
- [Customize themes](../../igniteui-wc-customize-component-theme/) — apply your brand colors
- [Component documentation](https://igniteui.github.io/igniteui-webcomponents) — full API reference

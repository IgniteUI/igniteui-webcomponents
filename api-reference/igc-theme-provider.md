# igc-theme-provider

Provides a theme to its descendant components through Lit context.

Use it to scope a theme to a part of the page. The library components in
the provider use its theme instead of the global theme.

```ts
import { defineComponents, IgcThemeProviderComponent } from 'igniteui-webcomponents';

defineComponents(IgcThemeProviderComponent);
```

## Properties

- `theme`: `'material' | 'bootstrap' | 'indigo' | 'fluent'`. Default: `'bootstrap'`. Attribute: `theme`, reflected.
  The theme to provide to descendant components.
- `variant`: `'light' | 'dark'`. Default: `'light'`. Attribute: `variant`, reflected.
  The theme variant to provide to descendant components.

## Slots

- default: The content that receives the provided theme.

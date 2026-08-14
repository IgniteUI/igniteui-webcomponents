---
name: update-component-styles
description: Update component styling following the SCSS to Lit CSS workflow with proper theme support
---

# Update Component Styles

Updates component styles through the project's SCSS → Lit CSS workflow and the
`igniteui-theming` schema system.

## When to Use

- "Update the badge component border radius"
- "Add hover styles to the button component"
- "Fix the chip colors in the Indigo dark theme"

## Related Skills

- [create-new-component](../create-new-component/) - Scaffolding the theme files of a new component

## How the styles are organized

```
themes/
├── [component].base.scss       # Structure and layout, theme-agnostic
├── shared/
│   ├── [component].common.scss # Cross-theme styling; reads the CSS variables
│   └── [component].{bootstrap,material,fluent,indigo}.scss
├── light/
│   ├── _themes.scss            # digest-schema() of the light schemas
│   ├── [component].shared.scss # Full variable set from $base
│   └── [component].{bootstrap,material,fluent,indigo}.scss  # diff($base, $theme)
├── dark/
│   ├── _themes.scss            # digest-schema() of the dark schemas
│   └── [component].{bootstrap,material,fluent,indigo}.scss  # diff(light.$base, $theme)
└── themes.ts                   # Aggregates everything into the `all` export
```

Where a change belongs:

| Change                                  | File                                        |
| --------------------------------------- | ------------------------------------------- |
| Layout, sizing, structure               | `[component].base.scss`                     |
| Styling driven by theme variables       | `shared/[component].common.scss`            |
| One theme differs structurally          | `shared/[component].[theme].scss`           |
| A color/elevation value for one theme   | `light/` or `dark/[component].[theme].scss` |
| A new variable for every theme          | `light/[component].shared.scss`             |

## Steps

### 1. Edit the SCSS

SCSS resolves against the `src` and `node_modules` load paths, so global helpers use
package-style specifiers. Indentation is 4 spaces.

```scss
// ✅ DO
@use 'styles/utilities' as *;

// ❌ DON'T
@use '../../../styles/utilities' as *;
```

Theme values come from the digested schemas and are read with `var-get()`:

```scss
// shared/[component].common.scss
@use 'styles/utilities' as *;
@use '../light/themes' as *;

$theme: $material;

:host {
    --component-size: var(--ig-size, #{var-get($theme, 'default-size')});
}

[part~='base'] {
    background: var-get($theme, 'background');
    color: var-get($theme, 'text-color');
    box-shadow: var-get($theme, 'elevation');
}
```

Per-theme overrides only emit the difference against the light base:

```scss
// dark/[component].bootstrap.scss
@use 'styles/utilities' as *;
@use 'themes' as *;
@use '../light/themes' as light;

$theme: $bootstrap;

:host {
    @include css-vars-from-theme(diff(light.$base, $theme));
}
```

Rules:

- **Never hardcode colors or sizes.** Use `var-get()`, `color()`, `contrast-color()`,
  `sizable()` and the `--ig-size` scale.
- **Match parts with `[part~='name']`**, not `[part='name']` — `partMap` produces a
  space-separated list and an exact-match selector silently stops applying.
- Keep selector specificity low so consumers can override through parts and custom properties.
- A value that consumers should be able to set belongs in a documented CSS custom property;
  purely internal ones are prefixed with `--_`.

### 2. Add a new schema value (if needed)

`var-get($theme, 'foo')` only resolves for keys present in the `igniteui-theming` schema. If
the value doesn't exist yet, either add it upstream in `igniteui-theming` or declare a local
CSS variable in `shared/[component].common.scss`.

### 3. Expose and document new parts or custom properties

```ts
/**
 * @csspart base - The main container
 * @csspart content - The content wrapper
 * @cssproperty --component-padding - The internal padding
 */
protected override render() {
  return html`
    <div part=${partMap({ base: true, filled: this._hasValue })}>
      <span part="content"><slot></slot></span>
    </div>
  `;
}
```

Descriptions ship verbatim into the public API docs — no `igc-` tag names in the prose. After
editing them, regenerate:

```bash
npm run cem && npm run build:meta
```

### 4. Transpile

```bash
npm run build:styles
```

> [!IMPORTANT]
> This generates a `.css.ts` next to each `.scss` (imported as `.css.js`). The generated files
> are **gitignored** — never edit or commit them. Only files matching
> `*.{base,common,shared,material,bootstrap,indigo,fluent}.scss` under `src/components/**` are
> compiled; a differently named partial is skipped without a warning, so prefix helpers with
> `_` and `@use` them.

`npm run storybook` and `npm run test:watch` run the style watcher for you.

### 5. Verify

```bash
npm run lint:styles  # stylelint
npm run storybook    # visual check
```

Check every theme in both light and dark mode, and confirm the parts and custom properties are
still styleable from outside the component.

## Validation Checklist

- [ ] Only `.scss` files edited — no `.css.ts` changes staged
- [ ] Load-path specifiers used (`@use 'styles/utilities' as *`)
- [ ] Values read through `var-get()` / theming functions, nothing hardcoded
- [ ] Part selectors use `[part~='…']`
- [ ] Dark themes emit only the `diff()` against the light base
- [ ] New parts and custom properties documented with `@csspart` / `@cssproperty`
- [ ] `npm run build:styles` run, `npm run lint:styles` clean
- [ ] All four themes checked in light and dark mode
- [ ] CHANGELOG updated if the change is user-visible

## Common Pitfalls

| Symptom                                   | Cause / Fix                                                          |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Style changes don't show up               | `npm run build:styles` not run, or the filename misses the build glob |
| Changes vanish on the next build          | A `.css.ts` file was edited directly — edit the `.scss`               |
| Style applies in one theme only           | Put in a theme file instead of `shared/[component].common.scss`       |
| A part selector stopped matching          | `[part='base']` against a multi-name `partMap` — use `[part~='base']` |
| `var-get()` emits nothing                 | The key is missing from the schema                                    |
| Dark theme looks like light               | Missing `diff(light.$base, $theme)` or a missing `themes.ts` entry    |
| Consumers can't override a style          | Selector specificity too high, or the element isn't exposed as a part |

## Reference Examples

- `src/components/badge/themes/` — compact, complete scaffold of the pattern above
- `src/components/input/themes/` — multiple parts, notched material layout, state selectors
</content>

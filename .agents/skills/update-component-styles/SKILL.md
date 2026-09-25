---
name: update-component-styles
description: Update component styling following the SCSS to Lit CSS workflow with proper theme support
---

# Update Component Styles

Changes component styles through the SCSS → Lit CSS build and the `igniteui-theming` schemas.
The directory layout and rules are in
[Styles and Theming](../../../.github/CODING_GUIDELINES.md#styles-and-theming).

Related: [create-new-component](../create-new-component/) for a new theme scaffold.

## Where a Change Goes

| Change                                | File                                        |
| ------------------------------------- | ------------------------------------------- |
| Layout, sizing, structure             | `[component].base.scss`                     |
| Styling that reads theme variables    | `shared/[component].common.scss`            |
| One theme is structurally different   | `shared/[component].[theme].scss`           |
| A color or elevation for one theme    | `light/` or `dark/[component].[theme].scss` |
| A new variable for every theme        | `light/[component].shared.scss`             |

## Steps

### 1. Edit the SCSS

Use 4-space indentation and load-path specifiers (`@use 'styles/utilities' as *`), not
relative paths into `src/styles`. Read theme values with `var-get()`:

```scss
// shared/[component].common.scss
@use 'styles/utilities' as *;
@use '../light/themes' as *;

$theme: $material;

[part~='base'] {
    background: var-get($theme, 'background');
    color: var-get($theme, 'text-color');
}
```

```scss
// dark/[component].bootstrap.scss: emit only the difference from the light base
@use 'styles/utilities' as *;
@use 'themes' as *;
@use '../light/themes' as light;

$theme: $bootstrap;

:host {
    @include css-vars-from-theme(diff(light.$base, $theme));
}
```

- Do not hardcode colors or sizes. Use `var-get()`, `color()`, `contrast-color()`,
  `sizable()` and `--ig-size`.
- Match parts with `[part~='name']`. `partMap` emits a space-separated list.
- Keep specificity low. Document the custom properties that consumers can set, and prefix
  internal ones with `--_`.
- Key composite-anchor selectors off `data-role` / `data-haspopup`, not `role` / `aria-*`
  (see [ARIA across shadow boundaries](../../../.github/CODING_GUIDELINES.md#aria-across-shadow-boundaries)).
- `var-get()` resolves only keys that are in the schema. For a new key, add it to
  `igniteui-theming`, or declare a local variable in `shared/[component].common.scss`.

### 2. Document new parts or custom properties

```ts
/**
 * @csspart base - The main container.
 * @cssproperty --component-padding - The internal padding.
 */
```

Run `npm run cem && npm run build:meta`. Parts and custom properties are public API, so also
add a row to `### CSS Shadow parts` or `### CSS custom properties` in `spec.md`, add a TOC entry
for a new section, and add a row to `## Revision history`. A visual change that adds no part or
property does not change the spec, unless it contradicts documented behavior.

### 3. Transpile and verify

```bash
npm run build:styles
npm run lint:styles
npm run storybook
```

`npm run storybook` and `npm run test:watch` also rebuild the styles when you save. Check all
four themes in light and dark mode.

> [!IMPORTANT]
> The generated `.css.ts` files are gitignored. Do not edit or commit them. The build compiles
> only `*.{base,common,shared,material,bootstrap,indigo,fluent}.scss`. Give helper partials a
> `_` prefix and `@use` them.

## Validation Checklist

- [ ] Only `.scss` files are in the diff
- [ ] Load-path specifiers. Values come from the theming functions.
- [ ] `[part~='…']` selectors
- [ ] Dark files emit only `diff(light.$base, $theme)`
- [ ] New parts and custom properties are in the JSDoc and in `spec.md`
- [ ] `build:styles` and `lint:styles` pass. All themes checked.
- [ ] CHANGELOG updated if the change is user-visible

## Common Pitfalls

| Symptom                           | Cause / Fix                                                        |
| --------------------------------- | ------------------------------------------------------------------ |
| Change does not show              | `build:styles` did not run, or the filename is outside the glob    |
| Change is gone after a build      | A `.css.ts` file was edited. Edit the `.scss`.                     |
| Applies in one theme only         | It is in a theme file, not in `shared/[component].common.scss`     |
| Part selector stopped matching    | `[part='x']` with a multi-name `partMap`                           |
| `var-get()` emits nothing         | The key is not in the schema                                       |
| Dark looks like light             | `diff(light.$base, …)` is missing, or an entry is missing in `themes.ts` |
| Consumers cannot override         | Specificity is too high, or the element is not a part              |

## Reference Examples

- `src/components/badge/themes/`: a complete, compact scaffold
- `src/components/input/themes/`: many parts, material notch, `data-role` selectors
- `src/components/rating/spec.md`: parts and custom properties documented together

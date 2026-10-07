# Theme provider specification

- [Theme provider specification](#theme-provider-specification)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Key features](#key-features)
    - [Acceptance criteria](#acceptance-criteria)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
    - [Developer experience](#developer-experience)
      - [Basic initialization](#basic-initialization)
      - [Colors, typography and elevations](#colors-typography-and-elevations)
      - [Registration order](#registration-order)
      - [Nesting](#nesting)
      - [Interaction with the icon registry](#interaction-with-the-icon-registry)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Default](#default)
    - [Context provider](#context-provider)
    - [Theme and variant combinations](#theme-and-variant-combinations)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                      |
| ------: | ---------- | ---------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                      |
|       2 | 2026-10-07 | Describe the theme variables that the provider keeps as-is |

## Overview

The `igc-theme-provider` scopes a theme to a part of the page. Every component of the library inside it uses the
theme and the variant it provides instead of the global ones. It passes them down through the Lit context
mechanism rather than through CSS inheritance.

The component has no wiki page; this specification is written from the implementation.

```html
<igc-theme-provider theme="material" variant="dark">
  <igc-button>Material dark button</igc-button>
  <igc-input label="Material dark input"></igc-input>
</igc-theme-provider>
```

### Key features

- **A scoped theme**, so that different parts of one page can use different themes.
- **A scoped variant**, light or dark, independent of the global one.
- **Reactive updates**: changing the theme or the variant reaches the descendants.
- **No layout impact**: the host renders as `display: contents`.
- **Nesting**, with the closest provider winning.

### Acceptance criteria

- The provider must supply a theme and a variant to every component of the library beneath it.
- A change of either at runtime must reach the descendants.
- Descendants added later must receive the current values.
- Nested providers must each apply to their own subtree.
- The host must not affect the layout of the content it wraps.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a consistent look across a section of the application, including when that section differs from the rest.

### Developer stories

As a developer, I expect to be able to:

- scope a theme to a part of the page instead of setting it globally;
- switch the theme or the variant of a section at runtime;
- nest providers and have the closest one apply;
- wrap content without that wrapper changing the layout.

## Functionality

### End-user experience

The provider itself renders nothing: it wraps content that takes the look of the theme it provides.

### Developer experience

#### Basic initialization

```html
<igc-theme-provider theme="material" variant="dark">
  <igc-button>Material dark</igc-button>
</igc-theme-provider>

<igc-theme-provider theme="fluent" variant="light">
  <igc-button>Fluent light</igc-button>
</igc-theme-provider>
```

#### Colors, typography and elevations

The provider changes the styles of the components. The colors, the typography and the elevations are CSS custom
properties that the theme file sets on `:root`, and the provider does not change them. So a provider with another
theme or variant than the page needs these properties too. Without them, a dark provider on a light page gives the
dark styles of the components with the light colors. The sizes and the spacing are the same in all themes.

Set the properties on the provider. The host renders as `display: contents`, so it has no box, but its content
inherits custom properties and inherited properties, such as `color` and `font-family`, from it. Only box styles, such
as a background, need an element inside the provider.

With Sass, include the mixins of `igniteui-theming` in a selector. In a selector, `palette()`, `typography()` and
`elevations()` set the properties on that selector instead of `:root`.

The theme file sets the scrollbar colors on `:root` too, outside of these mixins. They refer to the gray palette, but a
custom property resolves its `var()` references on the element that declares it. So the provider inherits the
scrollbar colors of the page, and you must declare them on the provider again. All themes use gray 400 for the thumb
and gray 100 for the track, but Indigo uses gray 200 for the track.

```scss
@use 'igniteui-theming' as *;
@use 'igniteui-theming/sass/color/presets/dark/material' as *;
@use 'igniteui-theming/sass/elevations/presets' as elevation;
@use 'igniteui-theming/sass/typography/presets/material' as type;

igc-theme-provider.material-dark {
  @include palette($palette);
  @include typography($font-family: type.$typeface, $type-scale: type.$type-scale);
  @include elevations(elevation.$material-elevations);

  --ig-scrollbar-thumb-background: var(--ig-gray-400);
  --ig-scrollbar-track-background: var(--ig-gray-100);

  color: var(--ig-surface-500-contrast);
  font-family: var(--ig-font-family);
}

// The host has no box, so the background goes on an element inside it.
.material-dark > .panel {
  background: var(--ig-surface-500);
}
```

```html
<igc-theme-provider class="material-dark" theme="material" variant="dark">
  <div class="panel">
    <igc-button>Material dark</igc-button>
  </div>
</igc-theme-provider>
```

Without Sass, copy all the `:root` rules of the theme file into a rule for the provider, or into an `@scope` block
with `:scope` in place of `:root`. The theme file has more than one `:root` rule, and the scrollbar colors are in a
rule of their own.

#### Registration order

The provider has to be registered before the components that consume its context, so that the provider exists by
the time they look it up.

```ts
import { defineComponents, IgcThemeProviderComponent, IgcButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcThemeProviderComponent, IgcButtonComponent);
```

#### Nesting

Providers nest, and the closest one above a component decides its theme. A descendant added after the first render
receives the current values as well.

#### Interaction with the icon registry

The theme also drives the theme-aware aliases of the [icon registry](../icon/spec.md), so the same icon name can
resolve to a different glyph under two providers on the same page.

### Localization

None applicable. The component renders no content of its own.

### Keyboard interactions

None applicable. The provider is not focusable and takes no keyboard input.

## API

### Properties and attributes

| Property  | Attribute | Reflected | Type                                                  | Default     | Description                                 |
| --------- | --------- | --------- | ----------------------------------------------------- | ----------- | ------------------------------------------- |
| `theme`   | `theme`   | yes       | `"material" \| "bootstrap" \| "indigo" \| "fluent"`   | `bootstrap` | The theme provided to the descendants.       |
| `variant` | `variant` | yes       | `"light" \| "dark"`                                   | `light`     | The variant provided to the descendants.     |

### Methods

None applicable.

### Events

None applicable.

### Slots

| Name    | Description                                           |
| ------- | ----------------------------------------------------- |
| default | The content that should receive the provided theme.    |

### CSS Shadow parts

None applicable.

## Test scenarios

| Suite            | File                      |
| ---------------- | ------------------------- |
| `Theme Provider` | `theme-provider.spec.ts`  |

### Default

1. The component passes the accessibility audit and is initialized with its default values.
2. The `theme` and `variant` properties are accepted through their attributes and reflected back when they change.
3. Projected content is rendered, and the host has `display: contents`.

### Context provider

4. The theme context reaches the descendant components.
5. The context is updated when the `theme` and the `variant` properties change.
6. Nested providers with different themes each apply to their own subtree.
7. Descendants added at runtime receive the context.

### Theme and variant combinations

8. Every combination of the four themes and the two variants is supported.

### Not covered by the suite

- The visual result of a theme is not asserted here; the provider is covered for the context it supplies.
- The scoped theme variables of [Colors, typography and elevations](#colors-typography-and-elevations) are application
  CSS, not behavior of the provider.

## Assumptions and limitations

- The provider has to be registered before the components that consume its context.
- Only components of the library react to it; plain HTML inside it is unaffected.
- It does not change the colors, the typography or the elevations. See
  [Colors, typography and elevations](#colors-typography-and-elevations).
- The theme is supplied through the Lit context, so a component that is not a DOM descendant of the provider — for
  example one portalled elsewhere — does not receive it.
- The host renders as `display: contents`, so it cannot be styled or positioned as a box itself.

## Accessibility

### ARIA roles and properties

The component applies no roles or ARIA properties. It renders as `display: contents`, so it adds nothing to the
accessibility tree and leaves the semantics of its content untouched.

### Keyboard support

Not applicable; the component is not interactive.

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

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

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-09-21 | Initial specification |

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

## Assumptions and limitations

- The provider has to be registered before the components that consume its context.
- Only components of the library react to it; plain HTML inside it is unaffected.
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

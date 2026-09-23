# Icon specification

- [Icon specification](#icon-specification)
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
      - [Registering an icon](#registering-an-icon)
      - [Stripping the SVG metadata](#stripping-the-svg-metadata)
      - [Using an icon](#using-an-icon)
      - [Icon references](#icon-references)
      - [Theme-aware icons](#theme-aware-icons)
      - [Sharing the registry across tabs](#sharing-the-registry-across-tabs)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Registry functions](#registry-functions)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Icon registry](#icon-registry)
    - [Referential icons](#referential-icons)
    - [Icon broadcast service](#icon-broadcast-service)
    - [Internal icons library](#internal-icons-library)
    - [Icon component tests](#icon-component-tests)
    - [ARIA tests](#aria-tests)
    - [Multi-theme support](#multi-theme-support)
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

The `igc-icon` draws an SVG icon from a registry of pre-registered collections. The icons themselves are
registered through module-level functions rather than through the component, from a URL or from SVG text.

```ts
import { registerIcon } from 'igniteui-webcomponents';

await registerIcon('search', '/icons/search.svg', 'material');
```

```html
<igc-icon name="search" collection="material"></igc-icon>
```

### Key features

- **A registry of named collections**, filled from a URL or from SVG text.
- **Icon references**, so that a name can be an alias for another icon and be swapped at runtime.
- **Theme-aware aliases**, which resolve a name differently per theme and fall back to the default one.
- **Metadata stripping**, which removes `<title>` and `<desc>` to suppress native browser tooltips while keeping
  the title as the accessible name.
- **Cross-tab synchronization** of the registry through a broadcast channel, surviving the back-forward cache.
- **Mirroring** for icons that have to flip in a right-to-left layout.

### Acceptance criteria

- The component must take an icon name and a collection.
- Icons must be registerable by name and collection, from a URL or from SVG text.
- The component must update once an icon it refers to is registered.
- A failed registration must throw a descriptive error.
- The component must be able to mirror its icon.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see the icon that stands for an action or a state, and have it announced when it carries meaning.

### Developer stories

As a developer, I expect to be able to:

- name an icon and the collection it comes from;
- register an icon from a URL or from SVG text;
- alias one icon name to another and change the target at runtime;
- have an icon resolve differently per theme, with a fallback to the default;
- strip the metadata of an SVG so that the browser shows no native tooltip;
- mirror an icon in a right-to-left layout;
- keep the registry in sync across the tabs of my application.

## Functionality

### End-user experience

The component renders the registered SVG, sized by the styles applied to it. The wiki page of the component
carries a design hand-off placeholder with no real link.

### Developer experience

#### Registering an icon

`registerIcon` fetches the SVG from a URL and `registerIconFromText` takes the markup directly. Both take either a
collection name or an options object, and both default to the `default` collection. A failed fetch throws with the
status of the response.

```ts
await registerIcon('search', '/icons/search.svg', 'material');
registerIconFromText('bug', '<svg xmlns="http://www.w3.org/2000/svg">…</svg>');
```

#### Stripping the SVG metadata

The options object of both functions accepts `stripMeta`, which removes the `<title>` and `<desc>` elements of the
SVG, nested ones included, so that the browser shows no native tooltip on hover. The title text is still captured
as the accessible name of the icon. References in `aria-labelledby` to the stripped elements are cleaned up, while
those pointing elsewhere are kept.

```ts
await registerIcon('home', '/icons/home.svg', { collection: 'my-lib', stripMeta: true });
```

#### Using an icon

```html
<igc-icon name="bug"></igc-icon>
<igc-icon name="search" collection="material" mirrored></igc-icon>
```

The component renders the SVG within its first update cycle, and updates itself when the icon it names is
registered later.

#### Icon references

`setIconRef` makes a name an alias for another icon, so that the icons the components of the library use can be
replaced without touching the markup. A reference can be changed at runtime, and resolves as soon as its target is
registered.

```ts
setIconRef('close', 'default', { name: 'x-mark', collection: 'material' });
```

#### Theme-aware icons

The references of the default collection resolve per theme, falling back to the default theme when the active one
has no icon of its own. A reference set by the application wins over a theme-based alias, and an icon with no
reference is returned as it is. Two [theme providers](../theme-provider/spec.md) on the same page therefore
resolve the same name to different icons.

#### Sharing the registry across tabs

The registry broadcasts what is registered in it, so that the tabs of an application stay in sync. A peer that
asks for a synchronization receives the registered icons and the external references, but not the internal ones.
Several broadcast services in one document do not synchronize with one another, the channel is disposed on
`pagehide` and recreated on `pageshow`, and the payloads are plain `Map` objects so that they survive structured
cloning.

### Localization

The component has no resource strings. The accessible name of an icon comes from the `<title>` of its SVG or from
an `aria-label` set by the application, both of which the application localizes.

### Keyboard interactions

None applicable. The icon is presentational and is not part of the tab order.

## API

### Properties and attributes

| Property     | Attribute    | Reflected | Type      | Default   | Description                                          |
| ------------ | ------------ | --------- | --------- | --------- | ---------------------------------------------------- |
| `name`       | `name`       | no        | `string`  | `''`      | The name of the icon to draw.                         |
| `collection` | `collection` | no        | `string`  | `default` | The registered collection to look the icon up in.     |
| `mirrored`   | `mirrored`   | yes       | `boolean` | `false`   | Flips the icon horizontally.                          |

### Registry functions

| Function               | Signature                                                                                             | Description                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `registerIcon`         | `(name: string, url: string, collectionOrOptions?: string \| RegisterIconOptions): Promise<void>`     | Registers an icon fetched from a URL.            |
| `registerIconFromText` | `(name: string, iconText: string, collectionOrOptions?: string \| RegisterIconOptions): void`         | Registers an icon from SVG markup.               |
| `setIconRef`           | `(name: string, collection: string, icon: IconMeta): void`                                            | Aliases a name to another registered icon.       |
| `getIconRegistry`      | `(): IconsRegistry`                                                                                   | Returns the registry instance.                   |

`RegisterIconOptions`

| Option       | Type      | Default   | Description                                                   |
| ------------ | --------- | --------- | ------------------------------------------------------------- |
| `collection` | `string`  | `default` | The collection to register the icon in.                        |
| `stripMeta`  | `boolean` | `false`   | Removes `<title>` and `<desc>` from the registered SVG.        |

### Events

None applicable.

### Slots

None. An icon is provided through the registry, not through projected content.

### CSS Shadow parts

None applicable.

## Test scenarios

| Suite                                                | File           |
| ---------------------------------------------------- | -------------- |
| `Icon registry`                                      | `icon.spec.ts` |
| `Icon broadcast service`                             | `icon.spec.ts` |
| `Icon BFCache (pageshow/pagehide) handling`          | `icon.spec.ts` |
| `Broadcast payload serialization for cross-browser compatibility` | `icon.spec.ts` |
| `Internal icons library`                             | `icon.spec.ts` |
| `Icon component`                                     | `icon.spec.ts` |

### Icon registry

1. The registry is registered and carries the default internal collection.
2. Icons are registered from a fetch and from text, and subscribers are notified once per microtask.
3. `stripMeta` is off by default, and when it is on it removes `<title>` and `<desc>`, including nested ones,
   while still capturing the title as the icon title.
4. References in `aria-labelledby` to stripped elements are cleaned up, and those pointing elsewhere are kept.
5. The title is taken from the root `<svg>` and nested ones are ignored.
6. Stripping works through the options-object form of both registration functions, and the older
   string-collection API still registers without stripping.

### Referential icons

7. Icons render by reference, the SVG is swapped when the reference changes, and a reference renders once its
   target is registered.
8. The underlying icon of a reference can be read back.

### Icon broadcast service

9. The event state is correct when registering one icon and several, and when setting a reference directly and
   through the class.
10. No event is sent for a reference set with `external` set to false.
11. Several broadcast services do not synchronize with one another.
12. A peer that requests a synchronization receives the registered icons but not the non-external references.
13. The channel is disposed on `pagehide` and recreated on `pageshow`, without duplicating an existing one,
    handles messages after the recreation, and sends nothing while it is disposed.
14. The broadcast collections and references are sent as plain `Map` objects, and nested ones survive structured
    cloning.

### Internal icons library

15. Every internal icon is well-formed and scales with its box.

### Icon component tests

16. The component passes the accessibility audit.
17. An icon renders by name from the default collection, and the same name resolves per collection.
18. The component updates after an icon is registered, and renders the SVG within its first update cycle.
19. A failed registration throws a descriptive error.
20. `mirrored` flips the icon.

### ARIA tests

21. The title of an icon is exposed as an image label.
22. An icon with no title is left out of the accessibility tree.
23. The image role is kept when the host is labelled by the author.

### Multi-theme support

24. References resolve per theme, fall back to the default theme, and are overridden by a reference the
    application set.
25. An icon with no reference is returned as it is, resolution works without a theme parameter, and theme-based
    aliases apply to the default collection only.
26. Two theme providers resolve different icons for the same name, an icon updates when the application sets a new
    reference, and aliased and non-aliased icons coexist across themes.

### Not covered by the suite

- The sizing of the icon is not covered; it is governed by the styles applied to the component.

## Assumptions and limitations

- Only SVG icons are supported; there is no icon font support.
- There are no built-in application icons; only the ones the components of the library need are pre-registered.
- The component has no `src` property and no slot: an icon has to go through the registry first.
- `mirrored` is not direction-aware. A mirrored icon is flipped regardless of the writing direction.
- The icon has no size property; its dimensions come from the styles applied to it.
- Theme-based aliases apply to the default collection only.

## Accessibility

### ARIA roles and properties

- An icon whose SVG carries a `<title>`, or whose host is labelled by the author, takes `role="img"` and is named
  by that title.
- An icon without a title and without an author label is left out of the accessibility tree entirely, which is the
  correct treatment for a decorative icon.
- `stripMeta` removes the `<title>` element from the DOM to suppress the native tooltip, but keeps its text as the
  accessible name.

### Keyboard support

Not applicable; the component is not interactive.

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration. An icon that has to be
flipped there is marked with `mirrored` by the application.

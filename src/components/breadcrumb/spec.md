# Breadcrumbs specification

- [Breadcrumbs specification](#breadcrumbs-specification)
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
      - [The default separator](#the-default-separator)
      - [Overriding the separator of an item](#overriding-the-separator-of-an-item)
      - [Prefix and suffix content](#prefix-and-suffix-content)
      - [Disabled items](#disabled-items)
      - [Programmatic control](#programmatic-control)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
    - [Initialization](#initialization)
    - [Current property](#current-property)
    - [Separator](#separator)
    - [Prefix and suffix slots](#prefix-and-suffix-slots)
    - [Disabled property](#disabled-property)
    - [Separator property](#separator-property)
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

The `igc-breadcrumbs` renders an ordered trail of `igc-breadcrumb` items separated by a configurable icon. It
shows where the user is inside the hierarchy of a site and offers a way back to the pages above.

The pair fits file browsers, category trails in an online shop, nested sections of a wizard and the current
location inside a nested administration menu.

```html
<nav aria-label="Breadcrumb">
  <igc-breadcrumbs>
    <igc-breadcrumb><a href="/home">Home</a></igc-breadcrumb>
    <igc-breadcrumb><a href="/home/category">Category</a></igc-breadcrumb>
    <igc-breadcrumb current><a href="/home/category/item">Item</a></igc-breadcrumb>
  </igc-breadcrumbs>
</nav>
```

### Key features

- **Two composable elements**: a container that holds the shared state, and an item that renders arbitrary
  projected content, usually a link.
- **A default separator icon**, set on the container and propagated to every item through context.
- **A per-item separator override** through a dedicated slot.
- **Current page marking**, reflected as `aria-current="page"`.
- **Disabled items**, which are announced as disabled and leave the tab order.
- **Prefix and suffix slots** on an item for icons, badges and the like.
- **No trailing separator** after the last item.
- **The ARIA list pattern**, with the separator icon mirrored in a right-to-left layout.

### Acceptance criteria

- The container must render its items with the `list` role, and each item must expose the `listitem` role.
- The container must expose a `separator` property that sets the default icon of every descendant item.
- An item must be able to override the separator through a slot.
- No separator must be rendered after the last item.
- An item must be able to mark itself as the current page, reflecting `aria-current="page"`.
- An item must support prefix and suffix content around its main content.
- A disabled item must be announced as disabled and must take its projected content out of the tab order.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and must mirror the separator icon in RTL layouts without additional
  configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a trail of links from a top-level page down to the one I am on;
- see a separator between the items of the trail;
- tell which item stands for the page I am currently on;
- go back to any of the pages above by activating its link.

### Developer stories

As a developer, I expect to be able to:

- project arbitrary content, usually a link, into an item;
- set the default separator icon of a whole trail;
- override the separator of a single item;
- mark an item as the current page and read that state back;
- project prefix and suffix content around the main content of an item;
- disable an item so that it is neither focusable nor announced as available;
- wrap the trail in a `nav` landmark with a label of my own.

## Functionality

### End-user experience

> [Design hand-off](https://www.figma.com/design/B6BpAtRGepZS0t3bCExofc/Breadcrumbs-Handoff?m=auto&node-id=2002-2&t=EjR41j72y7bO86x9-1)

The trail is a horizontal, wrapping row of items. Each one renders its content followed by a separator icon, and
the last one gets none. The item of the current page is styled apart and is not interactive. In a right-to-left
layout the separator icon is mirrored. Screen readers announce the trail as a list, its items, and the current
page through `aria-current="page"`.

### Developer experience

#### Basic initialization

```html
<nav aria-label="Breadcrumb">
  <igc-breadcrumbs>
    <igc-breadcrumb><a href="/home">Home</a></igc-breadcrumb>
    <igc-breadcrumb current><a href="/home/item">Item</a></igc-breadcrumb>
  </igc-breadcrumbs>
</nav>
```

The label of the trail belongs on the `nav` landmark, not on the list, which is what the ARIA breadcrumb pattern
asks for.

#### The default separator

`separator` takes an icon name and defaults to `tree_expand`. It reaches every item through context, so a change
at runtime updates the whole trail.

```html
<igc-breadcrumbs separator="chevron_right">…</igc-breadcrumbs>
```

#### Overriding the separator of an item

```html
<igc-breadcrumb>
  <a href="/home">Home</a>
  <span slot="separator">/</span>
</igc-breadcrumb>
```

#### Prefix and suffix content

```html
<igc-breadcrumb>
  <igc-icon slot="prefix" name="home"></igc-icon>
  <a href="/home">Home</a>
</igc-breadcrumb>
```

#### Disabled items

`disabled` sets `aria-disabled="true"` on the item and takes the projected content out of the tab sequence. A tab
index the author set is restored when the item is enabled again, and content projected after the initialization
picks up the state as well.

#### Programmatic control

```ts
const items = document.querySelectorAll('igc-breadcrumb');

for (const item of items) {
  item.current = false;
}
items[items.length - 1].current = true;
```

### Localization

The elements render no text of their own. The label of the `nav` landmark and the text of the projected links come
from the application.

### Keyboard interactions

The elements implement no keyboard handling of their own. Navigation relies on the native behavior of the
projected content.

| Keys                                               | Description                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves between the interactive elements projected into the items.   |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                | Activates the focused element, as that element natively behaves.   |

## API

### Properties and attributes

`igc-breadcrumbs`

| Property    | Attribute   | Reflected | Type     | Default       | Description                                            |
| ----------- | ----------- | --------- | -------- | ------------- | ------------------------------------------------------ |
| `separator` | `separator` | yes       | `string` | `tree_expand` | The icon name used as the default separator.            |

`igc-breadcrumb`

| Property   | Attribute  | Reflected | Type      | Default | Description                                                     |
| ---------- | ---------- | --------- | --------- | ------- | --------------------------------------------------------------- |
| `current`  | `current`  | yes       | `boolean` | `false` | Marks the item as the current page.                              |
| `disabled` | `disabled` | yes       | `boolean` | `false` | Disables the item and removes its content from the tab sequence.  |

### Methods

None applicable.

### Events

None applicable.

### Slots

| Component         | Name        | Description                                                              |
| ----------------- | ----------- | ------------------------------------------------------------------------ |
| `igc-breadcrumbs` | default     | The breadcrumb items.                                                     |
| `igc-breadcrumb`  | default     | The content of the item, typically an anchor.                             |
| `igc-breadcrumb`  | `prefix`    | Content before the main content.                                          |
| `igc-breadcrumb`  | `suffix`    | Content after the main content.                                           |
| `igc-breadcrumb`  | `separator` | Replaces the default separator of this item; hidden from assistive technology. |

### CSS Shadow parts

`igc-breadcrumbs` exposes no parts of its own. `igc-breadcrumb` exposes:

| Part        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `label`     | The wrapper of the prefix, the default and the suffix slots.   |
| `separator` | The wrapper of the separator content.                          |

## Test scenarios

| Suite         | State                  |
| ------------- | ---------------------- |
| `Breadcrumbs` | `breadcrumbs.spec.ts`  |

### Initialization

1. The component passes the accessibility audit, including with disabled items and custom separators.
2. An item is initialized with `current` set to `false`.

### Current property

3. `current` sets `aria-current="page"` through the element internals.
4. The `current` attribute is reflected, the state toggles from code, and setting the property to `true` sets the
   attribute.

### Separator

5. The separator is hidden from assistive technology.
6. No separator is rendered for the last item of the trail.
7. Content projected in the `separator` slot replaces the icon of that item.

### Prefix and suffix slots

8. Content projected in the `prefix` and the `suffix` slots is rendered around the main content.

### Disabled property

9. The `disabled` attribute is reflected, and `aria-disabled` is toggled through the element internals.
10. Projected links leave the tab sequence while the item is disabled, and an author-provided tab index is
    restored when it is enabled again.
11. Links projected after the initialization pick up the disabled state.

### Separator property

12. The separator defaults to the `tree_expand` icon, and the attribute is reflected.
13. The separator reaches the child items, and a change of the property updates their icons.

### Not covered by the suite

- The `list` and `listitem` roles are covered only through the accessibility audits, not asserted directly.
- An empty trail and a trail with a single item are not covered as separate cases.
- The mirroring of the separator icon in a right-to-left context is not covered.

## Assumptions and limitations

- The elements provide no navigation of their own: what an item does when it is activated is up to the projected
  content.
- The `nav` landmark and its label are the responsibility of the application; the container is only the list.
- `current` is not enforced to be unique, and does not have to sit on the last item; keeping the trail consistent
  is up to the application.
- The separator of an item is decided by the context of the container and by the `separator` slot of that item;
  there is no per-item separator property.
- The trail wraps rather than collapsing; there is no overflow or truncation behavior.

## Accessibility

### ARIA roles and properties

- `igc-breadcrumbs` has `role="list"` and `igc-breadcrumb` has `role="listitem"`.
- An item with `current` carries `aria-current="page"`, and the attribute is removed when the state is cleared.
- A disabled item carries `aria-disabled="true"` and takes its projected content out of the tab sequence.
- The separator is hidden from assistive technology.
- The trail should be wrapped in a `<nav aria-label="…">` landmark; the label belongs on the landmark rather than
  on the list, per the ARIA breadcrumb pattern.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The default separator
icon is mirrored automatically.

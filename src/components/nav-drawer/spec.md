# Navigation drawer specification

This directory hosts three public components: [`igc-nav-drawer`](#igc-nav-drawer),
[`igc-nav-drawer-item`](#igc-nav-drawer-item) and [`igc-nav-drawer-header-item`](#igc-nav-drawer-header-item).

- [Navigation drawer specification](#navigation-drawer-specification)
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
      - [Position and presentation](#position-and-presentation)
      - [The mini variant](#the-mini-variant)
      - [Items and headers](#items-and-headers)
      - [Opening and closing](#opening-and-closing)
      - [Invoker commands](#invoker-commands)
      - [Labeling](#labeling)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-nav-drawer](#igc-nav-drawer)
    - [igc-nav-drawer-item](#igc-nav-drawer-item)
    - [igc-nav-drawer-header-item](#igc-nav-drawer-header-item)
  - [Test scenarios](#test-scenarios)
    - [Accessibility tests](#accessibility-tests)
    - [DOM](#dom)
    - [API tests](#api-tests)
    - [Events and behaviors](#events-and-behaviors)
    - [Mini slot popover](#mini-slot-popover)
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

The `igc-nav-drawer` is a side navigation container that provides quick access between the views of an application.

Its presentation depends on the position. For the `start`, `end`, `top` and `bottom` positions the drawer renders as
a native `dialog` element, so it comes with modal semantics, automatic focus trapping and a backdrop. For the
`relative` position it renders inline as a `nav` landmark, in the flow of the page.

When content is provided in the `mini` slot, a compact icon-only variant is always displayed alongside the main
drawer, hidden only while the full drawer is open.

### Key features

- **Five positions**: the four edges, plus an inline `relative` presentation.
- **Modal semantics for free**: the native dialog provides the backdrop, the focus trap and the top layer.
- **A mini variant**: a compact icon-only rail that stays visible while the drawer is closed.
- **Structured items**: an icon and a content area per item, plus header items for sections.
- **Declarative invocation** through the Invoker Commands API, with no JavaScript.
- **Configurable dismissal**: <kbd>Escape</kbd> can be blocked for the modal positions.

### Acceptance criteria

- The drawer must render as a modal dialog for the edge positions and inline for the relative position.
- It must render the navigation items and header items projected into it.
- It must render a mini variant when content is provided for it, and hide it while the drawer is open.
- It must expose show, hide and toggle methods that report whether the state changed.
- It must emit a cancelable event before a user-driven close, and a completion event afterwards.
- It must accept an accessible label for the dialog and for the navigation landmark.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- open a side panel with the navigation of the application, and close it again.
- see which view I am currently on.
- keep a compact icon rail visible while the full panel is closed.
- have my focus kept inside the panel while it is open over the page.
- close the panel with <kbd>Escape</kbd> or by clicking outside of it.

### Developer stories

As a developer, I expect to be able to:

- anchor the drawer to any edge of the screen, or render it inline with the content.
- provide a compact mini variant for the closed state.
- group the navigation items under headers.
- mark an item as active or disabled.
- open and close the drawer programmatically or declaratively.
- cancel a user-driven close.
- label the drawer so it can be told apart from other navigation landmarks.

## Functionality

### End-user experience

For an edge position the drawer slides in over the page with a backdrop, and focus is trapped inside it until it is
dismissed. For the relative position it takes its place in the layout and pushes the content next to it. When a mini
variant is provided, the compact rail is shown whenever the drawer is closed.

### Developer experience

#### Basic initialization

```html
<igc-nav-drawer label="Main navigation">
  <igc-nav-drawer-header-item>Views</igc-nav-drawer-header-item>

  <igc-nav-drawer-item active>
    <igc-icon slot="icon" name="home"></igc-icon>
    <span slot="content">Home</span>
  </igc-nav-drawer-item>

  <igc-nav-drawer-item disabled>
    <igc-icon slot="icon" name="archive"></igc-icon>
    <span slot="content">Archive</span>
  </igc-nav-drawer-item>
</igc-nav-drawer>
```

#### Position and presentation

```html
<igc-nav-drawer position="end">...</igc-nav-drawer>
<igc-nav-drawer position="relative">...</igc-nav-drawer>
```

| Position   | Presentation                                                      |
| ---------- | ------------------------------------------------------------------ |
| `start`    | Anchored to the inline-start edge. Modal. The default.            |
| `end`      | Anchored to the inline-end edge. Modal.                           |
| `top`      | Anchored to the block-start edge. Modal.                          |
| `bottom`   | Anchored to the block-end edge. Modal.                            |
| `relative` | Rendered inline within the page flow, with no modal backdrop.     |

#### The mini variant

```html
<igc-nav-drawer>
  <igc-nav-drawer-item slot="mini">
    <igc-icon slot="icon" name="home"></igc-icon>
  </igc-nav-drawer-item>

  <igc-nav-drawer-item>
    <igc-icon slot="icon" name="home"></igc-icon>
    <span slot="content">Home</span>
  </igc-nav-drawer-item>
</igc-nav-drawer>
```

The mini rail is rendered whenever content is provided for it, and is hidden while the full drawer is open.

#### Items and headers

An item exposes an `icon` and a `content` slot, and reflects its `active` and `disabled` state. Header items
separate the sections of the navigation.

#### Opening and closing

```typescript
await drawer.show();
await drawer.hide();
await drawer.toggle();
```

Each resolves with whether the state changed.

#### Invoker commands

```html
<igc-button commandfor="drawer" command="--toggle">Menu</igc-button>
<igc-nav-drawer id="drawer">...</igc-nav-drawer>
```

The supported commands are `--show`, `--hide` and `--toggle`, on both Ignite and native buttons.

#### Labeling

```html
<igc-nav-drawer label="Main navigation"></igc-nav-drawer>
```

The label is applied to the modal dialog in the edge positions, and to the `nav` landmark in the relative position.
Give each navigation landmark on a page a distinct label.

### Localization

The components render no strings of their own; the item content and the label come from the application.

### Keyboard interactions

| Key combination   | Result                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| <kbd>Escape</kbd> | Closes a modal drawer, unless `keep-open-on-escape` is set. It does not close a relative drawer. |
| <kbd>Tab</kbd>    | Moves focus between the items; focus is trapped inside a modal drawer.                        |

## API

### igc-nav-drawer

#### Properties and attributes

| Property         | Attribute             | Reflected | Type                    | Default | Description                                                     |
| ---------------- | --------------------- | --------- | ----------------------- | ------- | ----------------------------------------------------------------- |
| open             | open                  | Yes       | `boolean`               | false   | Whether the drawer is open.                                     |
| position         | position              | Yes       | `NavDrawerPosition`     | `start` | The position of the drawer.                                     |
| label            | label                 | No        | `string \| undefined`   | -       | An accessible label for the drawer.                             |
| keepOpenOnEscape | keep-open-on-escape   | No        | `boolean`               | false   | Whether the drawer stays open when <kbd>Escape</kbd> is pressed. Only applies to the non-relative positions. |

#### Methods

| Name   | Type signature         | Description                                                         |
| ------ | ---------------------- | --------------------------------------------------------------------- |
| show   | `(): Promise<boolean>` | Opens the drawer. Resolves `false` when it was already open.        |
| hide   | `(): Promise<boolean>` | Closes the drawer. Resolves `false` when it was already closed.     |
| toggle | `(): Promise<boolean>` | Toggles the open state, delegating to `show` or `hide`.             |

#### Events

| Name       | Cancellable | Description                                                                                 |
| ---------- | ----------- | --------------------------------------------------------------------------------------------- |
| igcClosing | true        | Emitted just before the drawer is closed by a user interaction. Call `preventDefault()` to abort. |
| igcClosed  | false       | Emitted just after the drawer is closed by a user interaction.                              |

#### Slots

| Name      | Description                                            |
| --------- | ------------------------------------------------------ |
| (default) | Renders the main navigation content of the drawer.     |
| `mini`    | Renders the compact mini variant of the drawer.        |

#### CSS Shadow parts

| Part   | Description                                  |
| ------ | -------------------------------------------- |
| `base` | The base wrapper of the drawer.              |
| `main` | The main content container of the drawer.    |
| `mini` | The mini variant container of the drawer.    |

### igc-nav-drawer-item

Represents a navigation drawer item.

| Property | Attribute | Reflected | Type      | Default | Description                                  |
| -------- | --------- | --------- | --------- | ------- | ---------------------------------------------- |
| active   | active    | Yes       | `boolean` | false   | Determines whether the drawer item is active. |
| disabled | disabled  | Yes       | `boolean` | false   | Determines whether the drawer item is disabled. |

| Slot      | Description                              |
| --------- | ---------------------------------------- |
| `icon`    | The icon of the drawer item.             |
| `content` | The content of the drawer item.          |

| Part      | Description                          |
| --------- | ------------------------------------ |
| `base`    | The base wrapper of the drawer item. |
| `icon`    | The icon container.                  |
| `content` | The content container.               |

### igc-nav-drawer-header-item

Represents a navigation drawer header item. It renders its default slot and takes no properties.

## Test scenarios

The suite lives in [`nav-drawer.spec.ts`](./nav-drawer.spec.ts) and runs in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions. It also runs the shared
`runInvokerCommandsTests` suite from [`src/internals/testing`](../../internals/testing). The groups below mirror the
`describe` blocks.

### Accessibility tests

1. The component passes the accessibility audit in the open and closed states.
2. The label is applied to the dialog in the edge positions and to the navigation landmark in the relative position.

### DOM

3. The drawer renders as a native dialog for the edge positions, and inline for the relative position.
4. The items, the header items and the mini variant render in their containers.
5. The mini variant is hidden while the drawer is open.

### API tests

6. `show`, `hide` and `toggle` transition the open state and resolve with whether it changed.
7. The Invoker Commands integration calls `show`, `hide` and `toggle`.

### Events and behaviors

8. `igcClosing` and `igcClosed` are emitted for a user-driven close.
9. Canceling `igcClosing` keeps the drawer open.
10. <kbd>Escape</kbd> closes a modal drawer, and does not when `keepOpenOnEscape` is set.
11. A relative drawer is not closed by <kbd>Escape</kbd>.

### Mini slot popover

12. The mini rail behaves correctly alongside the main drawer, including the transitions between the two.

## Assumptions and limitations

- The drawer holds no routing logic: the `active` state of an item is set by the application.
- The modal positions rely on the native dialog, so the backdrop, the focus trap and the top layer behavior come
  from the platform.
- A relative drawer is not modal and is not dismissed by <kbd>Escape</kbd> or by an outside click.

## Accessibility

### ARIA roles and properties

- In the edge positions the drawer is a modal `dialog`, so the focus trap, the inert page content and the top layer
  come from the platform. In the relative position it is a `nav` landmark.
- The `label` provides the accessible name for both presentations; distinct labels let screen reader users tell
  several navigation landmarks apart.
- The `active` and `disabled` properties of an item are reflected as attributes for styling only. The item renders
  a plain container with no role, no `aria-disabled` and no focus management, so content projected into a disabled
  item stays focusable and operable. An application that needs the state to reach assistive technology, or a
  disabled item to be skipped by the keyboard, sets that on the content it projects.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The `start` and `end`
positions follow the inline direction.

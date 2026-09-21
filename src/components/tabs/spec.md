# Tabs specification

This directory hosts two public components: [`igc-tabs`](#igc-tabs) and [`igc-tab`](#igc-tab).

- [Tabs specification](#tabs-specification)
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
      - [Selection](#selection)
      - [Alignment](#alignment)
      - [Activation mode](#activation-mode)
      - [Prefix and suffix content](#prefix-and-suffix-content)
      - [Overflow and scrolling](#overflow-and-scrolling)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [igc-tabs](#igc-tabs)
    - [igc-tab](#igc-tab)
  - [Test scenarios](#test-scenarios)
    - [Rendering and defaults](#rendering-and-defaults)
    - [Selection state](#selection-state)
    - [Scrolling](#scrolling)
    - [Composition](#composition)
    - [Tab component](#tab-component)
    - [Regressions](#regressions)
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

Tabs organize and allow navigation between groups of content that are related and at the same level of hierarchy.
The `igc-tabs` component renders a header strip of tab headers and shows the body of the selected
[`igc-tab`](#igc-tab) below it.

Each tab carries both its header and its body: the header content comes from the `label` property or the `label`
slot, and the body from the default slot.

### Key features

- **One element per tab**: the header and the body live together in a single `igc-tab`.
- **Automatic or manual activation**: focusing a header can select it, or selection can require an explicit action.
- **Alignment**: the header strip can be aligned in several ways.
- **Overflow scrolling**: scroll buttons appear when the headers do not fit.
- **Prefix and suffix** content in a tab header.
- **Programmatic selection** by reference, by IDREF, or by label.

### Acceptance criteria

- The component must render a header strip and show the body of the selected tab only.
- Selection must be possible through the pointer, the keyboard and the API.
- The activation behavior must be configurable between automatic and manual.
- Disabled tabs must be skipped and must not be selectable.
- Scroll buttons must appear when the headers overflow, and must scroll the strip.
- The component must emit an event when the selected tab changes through interaction.
- The elements must be integrated and themeable with the theming mechanism of the library.
- The elements must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see a row of tab headers and the content of the selected one.
- switch tabs with the pointer or with the keyboard.
- see which tab is selected from a clear indicator.
- scroll the header strip when there are more tabs than fit.
- recognize a tab that is unavailable to me.

### Developer stories

As a developer, I expect to be able to:

- declare a tab with its header and its body in one element.
- select a tab programmatically, by reference, IDREF or label.
- read which tab is currently selected.
- align the header strip to match my design.
- choose whether moving focus selects a tab.
- add icons or badges before and after a tab label.
- be notified when the selection changes.

## Functionality

### End-user experience

[Design hand-off](https://www.figma.com/file/ehPlFd2vk3t60b22mXpqoJ/Tabs?node-id=0%3A1)

The header strip renders the tab headers in a row with an indicator under the selected one. The body of the selected
tab is shown below the strip. When the headers overflow the available width, scroll buttons appear at both ends of
the strip.

### Developer experience

#### Basic initialization

```html
<igc-tabs>
  <igc-tab label="Overview">
    <p>The overview content.</p>
  </igc-tab>
  <igc-tab label="Details" selected>
    <p>The details content.</p>
  </igc-tab>
  <igc-tab label="Archive" disabled>
    <p>Not available.</p>
  </igc-tab>
</igc-tabs>
```

#### Selection

```typescript
const tabs = document.querySelector('igc-tabs')!;

tabs.select('Details');                  // by label
tabs.select('details-tab');              // by IDREF
tabs.select(tabs.tabs[0]);               // by reference

tabs.selected;     // the label of the selected tab, or its IDREF when no label is set
tabs.selectedTab;  // the selected tab element, or null
```

Disabled tabs and values that match no tab are ignored.

#### Alignment

```html
<igc-tabs alignment="center">...</igc-tabs>
```

#### Activation mode

```html
<igc-tabs activation="manual">...</igc-tabs>
```

With `auto` - the default - a tab is selected as soon as its header receives focus. With `manual`, moving focus only
moves focus; the tab is selected on click or with <kbd>Enter</kbd> or <kbd>Space</kbd>.

#### Prefix and suffix content

```html
<igc-tab>
  <igc-icon slot="prefix" name="inbox"></igc-icon>
  <span slot="label">Inbox</span>
  <igc-badge slot="suffix">12</igc-badge>

  <p>The body of the tab.</p>
</igc-tab>
```

The `label` slot takes precedence over the `label` property.

#### Overflow and scrolling

Scroll buttons appear at the start and the end of the header strip when the headers overflow, and are exposed as
shadow parts so they can be styled.

### Localization

The components render no strings of their own; the labels and the body content come from the application.

### Keyboard interactions

The keys apply while a tab header has focus.

| Key combination                                | Result                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd> | Moves focus to the previous or next enabled tab header, wrapping at the ends. |
| <kbd>Home</kbd> / <kbd>End</kbd>               | Moves focus to the first or the last enabled tab header.                  |
| <kbd>Enter</kbd> / <kbd>Space</kbd>            | Selects the focused tab.                                                  |
| <kbd>Tab</kbd>                                 | Moves focus out of the header strip and into the body of the selected tab. |

With `activation="auto"`, moving focus also selects the tab. Disabled tabs are skipped, and the horizontal arrow
keys follow the writing direction.

## API

### igc-tabs

#### Properties and attributes

| Property    | Attribute  | Reflected | Type                        | Default | Description                                                          |
| ----------- | ---------- | --------- | --------------------------- | ------- | ---------------------------------------------------------------------- |
| alignment   | alignment  | Yes       | `TabsAlignment`             | `start` | Determines the alignment of the tabs header strip.                   |
| activation  | activation | No        | `TabsActivation`            | `auto`  | Whether a tab is selected when its header receives focus.            |
| tabs        | -          | No        | `IgcTabComponent[]`         | -       | Read-only. The direct tab children of this element.                  |
| selected    | -          | No        | `string`                    | `''`    | Read-only. The label of the selected tab, or its IDREF when unlabelled. |
| selectedTab | -          | No        | `IgcTabComponent \| null`   | `null`  | Read-only. The currently selected tab, if any.                       |

#### Methods

| Name   | Type signature                                  | Description                                                                  |
| ------ | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| select | `(ref: IgcTabComponent \| string): void`        | Selects the tab matching the passed reference, IDREF or label. Disabled tabs and values matching no tab are ignored. |

#### Events

| Name      | Cancellable | Description                          |
| --------- | ----------- | ------------------------------------ |
| igcChange | false       | Emitted when the selected tab changes. |

#### Slots

| Name      | Description                                       |
| --------- | ------------------------------------------------- |
| (default) | Renders the tab components inside the default slot. |

#### CSS Shadow parts

| Part                   | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `start-scroll-button`  | The start scroll button displayed when the tabs overflow. |
| `end-scroll-button`    | The end scroll button displayed when the tabs overflow. |
| `selected-indicator`   | The indicator that shows which tab is selected.         |

### igc-tab

A tab nested in a tabs component.

| Property | Attribute | Reflected | Type      | Default | Description                              |
| -------- | --------- | --------- | --------- | ------- | ------------------------------------------ |
| label    | label     | No        | `string`  | `''`    | The tab item label.                      |
| selected | selected  | Yes       | `boolean` | false   | Determines whether the tab is selected.  |
| disabled | disabled  | Yes       | `boolean` | false   | Determines whether the tab is disabled.  |

| Slot      | Description                          |
| --------- | ------------------------------------ |
| (default) | Renders the content of the tab.      |
| `label`   | Renders the label of the tab header. |
| `prefix`  | Renders the prefix of the tab header. |
| `suffix`  | Renders the suffix of the tab header. |

| Part         | Description                                                                       |
| ------------ | --------------------------------------------------------------------------------- |
| `tab-header` | The header of a single tab.                                                       |
| `prefix`     | The label prefix of the tab header.                                               |
| `content`    | The label slot container of the tab header.                                       |
| `suffix`     | The label suffix of the tab header.                                               |
| `tab-body`   | Holds the body content of a single tab; only the body of the selected tab is visible. |

## Test scenarios

The component is covered by two suites in this directory, both running in a real browser through
`@web/test-runner` with `@open-wc/testing` fixtures and assertions:

| Suite | Scope |
| ----- | ----- |
| [`tabs.spec.ts`](./tabs.spec.ts) | The tabs container: rendering, selection, scrolling and composition. |
| [`tab.spec.ts`](./tab.spec.ts)   | The individual tab element. |

The groups below mirror the `describe` blocks.

### Rendering and defaults

1. The component renders its header strip and the body of the selected tab, and passes the accessibility audit.
2. The default alignment and activation are applied.
3. `tabs`, `selected` and `selectedTab` report the current state.

### Selection state

4. A tab marked `selected` in markup becomes the initial selection.
5. `select` works by reference, by IDREF and by label, and ignores disabled tabs and unmatched values.
6. Clicking a header selects the tab and emits `igcChange`.
7. The keyboard navigation moves focus, wraps at the ends and skips disabled tabs.
8. With `activation="auto"` focus selects the tab; with `manual` it does not.

### Scrolling

9. The scroll buttons appear when the headers overflow and scroll the strip.
10. Selecting a tab outside the visible area scrolls it into view.

### Composition

11. Tabs added or removed at run time are picked up, and the selection is updated when the selected tab is removed.
12. Prefix, label and suffix content renders in the header.

### Tab component

13. The tab renders its header and body parts, reflects `selected` and `disabled`, and resolves its label from the
    property and the slot.

### Regressions

14. Issue #1140.
15. Issue #713.

## Assumptions and limitations

- A tab owns both its header and its body; the two cannot be declared separately.
- Only one tab is selected at a time.
- The header strip is horizontal; a vertical arrangement is not supported.

## Accessibility

### ARIA roles and properties

- The header strip is a tab list, each header is a tab, and each body is a tab panel labelled by its header,
  following the WAI-ARIA tabs pattern.
- The header strip is a single tab stop: the selected header carries the tab index and the arrow keys move within
  the strip.
- Disabled tabs expose their disabled state and are skipped by the navigation.
- The scroll buttons are presentational affordances and are not part of the tab order.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The header strip order,
the scroll buttons and the horizontal arrow navigation follow the inline direction.

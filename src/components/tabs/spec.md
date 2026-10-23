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
      - [Link tabs](#link-tabs)
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
    - [Host ARIA](#host-aria)
    - [Link tabs](#link-tabs-1)
    - [Layout](#layout)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                   |
| ------: | ---------- | ----------------------------------------------------------------------- |
|       1 | 2026-09-21 | Initial specification                                                   |
|       2 | 2026-10-02 | Forward the host `aria-label`, `aria-labelledby` and `aria-describedby` |
|       3 | 2026-10-05 | `header` shadow part, painted with the `header-background` theme token; `alignment` applies in every theme, and `justify` gives every tab the same width; a tab selected through `selected` is scrolled into view, confined to the header strip; the scroll buttons are shown by the width of the tab headers |
|       4 | 2026-10-06 | The selection follows the state of the tabs after each change: an added or new selected tab wins, also when the selected tab is deselected or removed in the same task; a selected tab that moves keeps the selection; of several tabs selected at once, the last one in document order wins |
|       5 | 2026-10-21 | API descriptions aligned with the JSDoc.                                 |
|       6 | 2026-10-23 | Link tabs: `href`, `target` and `rel` render the tab header as a link with the tab role, Enter and Space click it, the target of a `<base>` element applies, and the cancelable `igcNavigate` event of a link tab lets the application route on the client; only keys pressed on a tab header navigate; the header slots take non-interactive content; tabs projected through a slot, and changes made while detached, are followed; the arrow keys skip a tab that does not render; the strip is measured when a tab header or the strip width changes, in its own CSS pixels under an ancestor `zoom`; the indicator and the scroll-button arrows follow the direction; no scroll snap |
|       7 | 2026-10-23 | The tabs make a stacking context, so the z-index of the headers, the indicator and the scroll buttons does not compete with the layers of the page |

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
- **Link tabs**: a tab with a URL renders its header as a link, which the user can open in a new browser tab.

### Acceptance criteria

- The component must render a header strip and show the body of the selected tab only.
- Selection must be possible through the pointer, the keyboard and the API.
- The activation behavior must be configurable between automatic and manual.
- Disabled tabs must be skipped and must not be selectable.
- Scroll buttons must appear when the headers overflow, and must scroll the strip.
- The component must emit an event when the selected tab changes through interaction.
- A tab with a URL must render its header as a link and keep the keyboard behavior and the tab stop of a tab.
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
- open the page of a tab in a new browser tab, or copy its link.

### Developer stories

As a developer, I expect to be able to:

- declare a tab with its header and its body in one element.
- select a tab programmatically, by reference, IDREF or label.
- read which tab is currently selected.
- align the header strip to match my design.
- choose whether moving focus selects a tab.
- add icons or badges before and after a tab label.
- be notified when the selection changes.
- give a tab a URL, and route its activation with a client-side router.

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

The `selected` attribute of the tabs also sets the selection, after each change of the tabs. When several tabs become
selected at once, the last one in document order wins, as in the initial markup. A selected tab that moves keeps the
selection.

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

The `label`, `prefix` and `suffix` slots take non-interactive content, such as text, icons and badges. Do not put
buttons, links, inputs or other controls in them. The header is a tab, and ARIA does not allow interactive content in a
tab. A click on such a control also selects the tab, moves the focus to the header and, on a link tab, follows the link.

#### Overflow and scrolling

Scroll buttons appear at the start and the end of the header strip when the headers overflow, and are exposed as
shadow parts so they can be styled.

#### Link tabs

```html
<igc-tabs activation="manual">
  <igc-tab label="Dashboard" href="/events/42/dashboard"></igc-tab>
  <igc-tab label="Agenda" href="/events/42/agenda" selected>
    <p>The agenda content.</p>
  </igc-tab>
</igc-tabs>
```

With `href`, the tab header renders as an `<a>` with the tab role. The user can open the link in a new browser tab
and copy its address, and the browser shows the URL on hover. `target` and `rel` go to the anchor. A disabled tab
keeps the anchor but has no URL.

| Input on a link tab                       | Selection and `igcChange`                              | Navigation                                          |
| ----------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| Plain click                               | The tab is selected and the event is emitted.          | The tab emits `igcNavigate`. The browser follows the link, unless the event is canceled. |
| Click with Ctrl, Cmd, Shift or Alt        | No change.                                             | The browser handles it, for example a new tab.      |
| Middle click                              | No change.                                             | The browser opens the link in a new tab.            |
| Click on a tab whose `target` (or, without one, the target of the page's `<base>`) is not `_self` | No change. | The browser opens the link in that target. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>        | As a plain click: the keys click the header.           | As a plain click.                                   |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> | No change.                                   | The browser opens the link in a new tab.            |
| Arrow keys with `activation="auto"`       | The tab is selected, except a tab whose `target` is not `_self`. | None.                                     |

Set `selected` from the current URL, so the selection survives a reload and the back and forward buttons. Use
`activation="manual"` when each tab loads a page.

To route on the client, listen to `igcNavigate` on the tab, call `preventDefault()` and route. The tab emits it when
the browser is about to follow the link (see the table), after `igcChange`, also when the tab is already selected. A
disabled tab and a click that is already canceled emit no event. The event does not bubble, so a listener on a tab
never gets the event of a tab nested in its panel.

Do not route from `click` on the tab. The panel is a child of the tab, so the listener also gets the clicks in the
panel, for example on a submit button or a link, and routes them to the URL of the tab.

The `navigate` function of the Vue Router `RouterLink` (with `custom`) cancels the event and routes:

```html
<RouterLink v-slot="{ href, navigate }" to="/events/42/agenda" custom>
  <igc-tab label="Agenda" :href="href" @igcNavigate="navigate"></igc-tab>
</RouterLink>
```

The Angular `routerLink` directive routes from `click` on an element that is not an anchor, and does not cancel the
click. Do not put it on a tab. Route from the event instead:

```typescript
protected route(event: Event, url: string): void {
  event.preventDefault();
  this.router.navigateByUrl(url);
}
```

```html
<igc-tab label="Agenda" [href]="agendaUrl" (igcNavigate)="route($event, agendaUrl)"></igc-tab>
```

A router that takes over the navigations of the page through the `navigate` event of the Navigation API needs no
listener: the header is a real link, so its navigation gets to the router as any other link does.

### Localization

The components render no strings of their own; the labels and the body content come from the application.

### Keyboard interactions

The keys apply while a tab header has focus.

| Key combination                                | Result                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| <kbd>Arrow Left</kbd> / <kbd>Arrow Right</kbd> | Moves focus to the previous or next enabled tab header, wrapping at the ends. |
| <kbd>Home</kbd> / <kbd>End</kbd>               | Moves focus to the first or the last enabled tab header.                  |
| <kbd>Enter</kbd> / <kbd>Space</kbd>            | Selects the focused tab. On a link tab, clicks the header, which also follows the link. |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> | On a link tab, the browser opens the link in a new tab. The selection does not change. |
| <kbd>Tab</kbd>                                 | Moves focus out of the header strip and into the body of the selected tab. |

With `activation="auto"`, moving focus also selects the tab, except a link tab whose `target` is not `_self`.
Disabled tabs and tabs that do not render, such as a tab with the `hidden` attribute, are skipped, and the horizontal
arrow keys follow the writing direction. The keys apply only to the header itself.

## API

### igc-tabs

#### Properties and attributes

| Property    | Attribute  | Reflected | Type                        | Default | Description                                                          |
| ----------- | ---------- | --------- | --------------------------- | ------- | ---------------------------------------------------------------------- |
| alignment   | alignment  | Yes       | `TabsAlignment`             | `start` | The alignment of the tab headers in the header strip.                |
| activation  | activation | No        | `TabsActivation`            | `auto`  | The activation behavior of the tabs. With `auto`, a tab is selected when it receives keyboard focus. With `manual`, a tab is selected only on click, or on Enter or Space. |
| tabs        | -          | No        | `IgcTabComponent[]`         | -       | Read-only. The tab children of the component.                        |
| selected    | -          | No        | `string`                    | `''`    | Read-only. The label of the selected tab, or its `id` when the tab has no label. An empty string when no tab is selected. |
| selectedTab | -          | No        | `IgcTabComponent \| null`   | `null`  | Read-only. The selected tab, or `null` when no tab is selected.      |

#### Methods

| Name   | Type signature                                  | Description                                                                  |
| ------ | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| select | `(ref: IgcTabComponent \| string): void`        | Selects a tab by reference, IDREF or label, and displays the corresponding panel. Disabled tabs and values not matching any tab are ignored. |

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
| `header`               | The header strip behind the tab headers.                |
| `start-scroll-button`  | The start scroll button displayed when the tabs overflow. |
| `end-scroll-button`    | The end scroll button displayed when the tabs overflow. |
| `selected-indicator`   | The indicator that shows which tab is selected.         |
| `tabs`                 | The scroll container of the tab headers.                |
| `inner`                | The wrapper of the tab headers, the scroll buttons and the selected indicator. |
| `scrollable`           | Added to the inner part while the scroll buttons show.  |

### igc-tab

A tab nested in a tabs component.

| Property | Attribute | Reflected | Type      | Default | Description                              |
| -------- | --------- | --------- | --------- | ------- | ------------------------------------------ |
| label    | label     | No        | `string`  | `''`    | The tab item label.                      |
| selected | selected  | Yes       | `boolean` | false   | Whether the tab is selected.             |
| disabled | disabled  | Yes       | `boolean` | false   | Whether the tab is disabled.             |
| href     | href      | No        | `string \| undefined` | -  | The URL of the tab. When set, the tab header renders as a link. A disabled tab has no URL. |
| target   | target    | No        | `'_blank' \| '_parent' \| '_self' \| '_top' \| undefined` | - | Where to open the URL. A click on a tab whose target is not `_self` does not change the selection. |
| rel      | rel       | No        | `string \| undefined` | -  | The relationship between the current document and the linked URL. |

| Event       | Cancellable | Description |
| ----------- | ----------- | ----------- |
| igcNavigate | true        | Emitted when a plain click, Enter or Space activates a link tab, before the browser follows the link. Cancel it to route on the client. Does not bubble. |

| Slot      | Description                          |
| --------- | ------------------------------------ |
| (default) | Renders the content of the tab.      |
| `label`   | Renders the label of the tab header. |
| `prefix`  | Renders the prefix of the tab header. |
| `suffix`  | Renders the suffix of the tab header. |

| Part         | Description                                                                       |
| ------------ | --------------------------------------------------------------------------------- |
| `tab-header` | The header of a single tab.                                                       |
| `base`       | The wrapper of the prefix, the label and the suffix in the tab header.            |
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

1. The component renders its header strip and the body of the selected tab, and passes the accessibility audit. The
   selected indicator starts at the start of the strip, also when the page sets `text-align` on the host.
2. The default alignment and activation are applied.
3. `tabs`, `selected` and `selectedTab` report the current state.

### Selection state

4. A tab marked `selected` in markup becomes the initial selection.
5. `select` works by reference, by IDREF and by label, and ignores disabled tabs and unmatched values.
6. Clicking a header selects the tab and emits `igcChange`.
7. The keyboard navigation moves focus, wraps at the ends and skips disabled tabs and tabs that do not render.
8. With `activation="auto"` focus selects the tab; with `manual` it does not.

### Scrolling

9. The scroll buttons appear when the headers overflow and scroll the strip. Their arrows point along the writing
   direction, also when `dir` is on the tabs or on an ancestor.
10. Selecting a tab outside the visible area scrolls it into view. Under an ancestor `zoom`, the strip is measured in its
    own CSS pixels.

### Composition

11. Tabs added or removed at run time are picked up, and the selection is updated when the selected tab is removed.
    A tab added as selected takes the selection, also when the selected tab is deselected in the same task or the
    markup is replaced. A selected tab that moves keeps the selection, and of several tabs selected at once the last one
    in document order wins. Tabs projected through the slot of another component are picked up, work with the
    keyboard, and are followed when their state changes or tabs are added or removed. Changes made while the tabs are
    detached apply when they connect again.
12. Prefix, label and suffix content renders in the header.

### Tab component

13. The tab renders its header and body parts, reflects `selected` and `disabled`, and resolves its label from the
    property and the slot.

### Regressions

14. Issue #1140.
15. Issue #713.
16. Issue #2416. Tabs removed in the same task, after a microtask or after their first update throw no error. Tabs
    added again after such a removal follow a change of size.

### Host ARIA

17. The shared `runHostAriaTests` suite: the host `aria-label`, `aria-labelledby` and `aria-describedby` reach the
    target and follow a change, and an axe audit passes with a host label.

### Link tabs

18. A tab with `href` renders an anchor with the tab role, `href`, `target`, `rel`, the selected state, the panel
    reference, the set position and the roving tab index, and passes the accessibility audit and the host ARIA suite.
    The link header has no underline and the color of a plain header.
19. A disabled link tab has no `href` and keeps the same header element. Without `href`, the plain header renders
    again. A focused header keeps the focus when `href` is added or removed, and focus in the panel stays there.
20. A plain click selects the tab, emits `igcChange` and follows the link. When the application cancels the click,
    the tab is still selected, the link is not followed and no `igcNavigate` is emitted.
21. A click with a modifier key or another button, and a click on a tab whose `target` is not `_self`, change no
    selection, emit no event and are not canceled by the tabs. The target of a `<base>` element applies, without regard
    to case.
22. Enter and Space click the header of a link tab: the keydown is canceled, the tab is selected and the link is
    followed. Ctrl+Enter is left to the browser.
23. With `activation="auto"`, the arrow keys select link tabs without a click, and do not select a tab whose `target`
    is not `_self`.
24. Link and plain tabs navigate alike, and a disabled link tab is skipped.
25. A key pressed on an element other than a tab header, such as an element slotted into a label, is not canceled,
    and does not select or focus a tab.
26. A plain click, Enter or Space on a link tab emits `igcNavigate` on the tab, also on the selected tab, and the
    event does not bubble. When the application cancels it, the tabs cancel the click and the link is not followed.
    A plain or disabled tab, and a click in the panel, emit no event.

### Layout

27. Changes inside a panel, such as new content or a change of height, do not make the tabs measure the strip.
28. A click selection is handled once: the `selected` attribute that the tabs reflect does not run it again. An
    application that deselects the tab in the `igcChange` handler leaves no selection.
29. A change of size of a tab header, also of a header that a change of `href` replaced, moves the selected
    indicator. So does a change of direction, also on an ancestor.
30. The tab headers are painted under an earlier page layer with `z-index: 1`.

## Assumptions and limitations

- A tab owns both its header and its body; the two cannot be declared separately.
- Only one tab is selected at a time.
- The header strip is horizontal; a vertical arrangement is not supported.
- The `label`, `prefix` and `suffix` slots take non-interactive content only. See
  [Prefix and suffix content](#prefix-and-suffix-content).
- With `activation="auto"`, the arrow keys select a link tab but never follow its link.
- Do not put the Angular `routerLink` directive on a tab. See [Link tabs](#link-tabs).

## Accessibility

### ARIA roles and properties

- The header strip is a tab list, each header is a tab, and each body is a tab panel labelled by its header,
  following the WAI-ARIA tabs pattern.
- The header strip is a single tab stop: the selected header carries the tab index and the arrow keys move within
  the strip.
- Disabled tabs expose their disabled state and are skipped by the navigation.
- The scroll buttons are presentational affordances and are not part of the tab order.
- The host `aria-label`, `aria-labelledby` and `aria-describedby` of a tab name and describe its `role="tab"`
  element.
- A link tab renders its header as `<a href role="tab">`, which ARIA in HTML allows. Screen readers announce a tab, not
  a link, and the anchor holds no nested interactive element.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The components work in a Right-to-Left context without additional setup or configuration. The header strip order,
the scroll buttons and the horizontal arrow navigation follow the inline direction, which `dir` sets on the tabs or on
any ancestor.

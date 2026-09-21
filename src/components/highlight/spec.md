# Highlight specification

- [Highlight specification](#highlight-specification)
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
      - [Navigating the matches](#navigating-the-matches)
      - [Dynamic content](#dynamic-content)
      - [Styling](#styling)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom properties](#css-custom-properties)
  - [Test scenarios](#test-scenarios)
    - [Initial render](#initial-render)
    - [DOM](#dom)
    - [Highlight stylesheet tree scope](#highlight-stylesheet-tree-scope)
    - [API tests](#api-tests)
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

The `igc-highlight` highlights the text nodes projected into it that match a search string. It uses the native
[CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API), so it never
modifies the DOM of the content it searches. It supports case-sensitive and case-insensitive matching, navigation
between the matches, and styling through CSS custom properties.

```html
<igc-highlight search-text="lorem">
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</igc-highlight>
```

### Key features

- **Non-destructive highlighting** through the CSS Custom Highlight API; the projected DOM is left untouched.
- **Case-sensitive and case-insensitive** matching.
- **An active match**, styled apart from the others, with wrapping navigation between the matches.
- **Scroll into view** of the new active match, which can be turned off per call.
- **Re-search on demand** for content that changes after the first search.
- **Separate styling** of the resting and the active highlight through CSS custom properties.

### Acceptance criteria

- The component must not alter the DOM structure of the projected content.
- It must highlight every match of the search string.
- It must distinguish the active match from the rest visually.
- It must support case-sensitive and case-insensitive matching.
- It must support navigation between the matches, wrapping at both ends.
- It must be able to search again after the projected content changes.
- The resting and the active highlight must be stylable through CSS custom properties.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- see clearly which parts of the text match what was searched for;
- tell the match I am currently on from the rest.

### Developer stories

As a developer, I expect to be able to:

- set a search string and have every matching piece of text highlighted;
- style the highlight and the active highlight;
- decide whether the matching is case sensitive;
- move the active highlight from code, in order to walk the user through the matches.

## Functionality

### End-user experience

The matched text is highlighted in place, and the active match is highlighted in a second style. Nothing in the
page layout shifts, since no element is inserted around the matched text.

The wiki page of the component carries a design hand-off heading with no link behind it.

### Developer experience

#### Basic initialization

Setting `searchText` starts a search over the projected content. An empty string clears the highlights.
`caseSensitive` decides whether only the exact case matches.

```html
<igc-highlight search-text="lorem" case-sensitive>
  <p>Lorem ipsum. lorem ipsum.</p>
</igc-highlight>
```

`size` reports how many matches there are, and `current` the zero-based index of the active one. Both are `0` when
there is nothing to show.

#### Navigating the matches

`next()` and `previous()` move the active match and wrap at the ends, and `setActive(index)` jumps to a specific
one. All three scroll the new active match into view, which `preventScroll` turns off.

```ts
const highlight = document.querySelector('igc-highlight');

highlight.next();
highlight.previous({ preventScroll: true });
highlight.setActive(3);
```

#### Dynamic content

The component does not observe the projected content. After it changes — lazily loaded or mutated from code —
`search()` runs the matching again against the current DOM.

#### Styling

The highlight styles live in a stylesheet that is adopted by the tree scope of the projected content rather than
by the render root of the component, because the matched text nodes belong to that scope. The component
re-targets the stylesheet when the host moves to another scope and removes it when the host disconnects.

The four custom properties are set on the host:

```html
<igc-highlight style="--background: gold; --background-active: orangered; --foreground-active: white">
  …
</igc-highlight>
```

### Localization

None applicable. The component renders no text of its own.

### Keyboard interactions

None applicable. The component is not focusable by default and takes no keyboard input.

## API

### Properties and attributes

| Property        | Attribute        | Reflected | Type      | Default | Description                                                          |
| --------------- | ---------------- | --------- | --------- | ------- | -------------------------------------------------------------------- |
| `searchText`    | `search-text`    | no        | `string`  | `''`    | The string to search for; setting it starts a new search.             |
| `caseSensitive` | `case-sensitive` | yes       | `boolean` | `false` | Whether the matching distinguishes upper and lower case.              |
| `size`          | —                | —         | `number`  | `0`     | The number of matches. Read-only.                                     |
| `current`       | —                | —         | `number`  | `0`     | The index of the active match. Read-only.                             |

### Methods

| Method      | Signature                                                | Description                                                        |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| `next`      | `(options?: HighlightNavigation): void`                  | Moves to the next match, wrapping to the first one.                 |
| `previous`  | `(options?: HighlightNavigation): void`                  | Moves to the previous match, wrapping to the last one.              |
| `setActive` | `(index: number, options?: HighlightNavigation): void`   | Moves to the match at the given zero-based index.                   |
| `search`    | `(): void`                                               | Runs the search again against the current projected content.        |

`HighlightNavigation`

| Option          | Type      | Default | Description                                                       |
| --------------- | --------- | ------- | ----------------------------------------------------------------- |
| `preventScroll` | `boolean` | `false` | Keeps the component from scrolling the new active match into view. |

### Events

None applicable.

### Slots

| Name    | Description                                                                          |
| ------- | ------------------------------------------------------------------------------------ |
| default | The content to search. Only content projected here takes part in the matching.        |

### CSS Shadow parts

None applicable.

### CSS custom properties

| Property              | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `--foreground`        | The text color of a highlighted text node.              |
| `--background`        | The background color of a highlighted text node.        |
| `--foreground-active` | The text color of the active highlighted text node.     |
| `--background-active` | The background color of the active highlighted text node. |

## Test scenarios

| Suite       | File                |
| ----------- | ------------------- |
| `Highlight` | `highlight.spec.ts` |

### Initial render

1. A `search-text` set in the markup produces its matches on the first render.

### DOM

2. The component is defined and passes the accessibility audit.

### Highlight stylesheet tree scope

3. The stylesheet is adopted by the tree scope of the projected content, not by the render root of the component.
4. The stylesheet is re-targeted when the host moves to another tree scope.
5. The stylesheet is removed from its tree scope when the host disconnects.

### API tests

6. Changing `searchText` produces the matching number of matches.
7. `caseSensitive` restricts the matching to the exact case.
8. `next()` and `previous()` move the active match, and `previous()` wraps to the last one from the first.
9. `setActive()` sets the active match to the given index.
10. `search()` picks up content that was added or removed after the previous search.

### Not covered by the suite

- The scroll-into-view behavior and the `preventScroll` option are not covered.
- The CSS custom properties are not covered.
- Clearing `searchText` back to an empty string is not asserted on its own.

## Assumptions and limitations

- Only text nodes that are descendants of the component take part in the matching. Content that a child component
  renders or portals outside of it is not matched.
- Only DOM text nodes are matched. Values inside form controls and text produced through the CSS `content`
  property are not.
- Shadow roots are skipped while matching.
- The component does not observe its content; `search()` has to be called after it changes.
- The component relies on the CSS Custom Highlight API, so it needs a browser that implements it.

## Accessibility

### ARIA roles and properties

The highlight is purely visual, so the component applies no ARIA properties of its own. Any roles or relations the
scenario needs — for example announcing how many matches there are, or which one is active — are up to the
application.

### Keyboard support

Not applicable; the component is not focusable by default.

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

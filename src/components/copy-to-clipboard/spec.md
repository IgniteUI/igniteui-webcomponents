# Copy to clipboard specification

- [Copy to clipboard specification](#copy-to-clipboard-specification)
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
      - [Copy format](#copy-format)
      - [Custom icons](#custom-icons)
      - [Copying from another element](#copying-from-another-element)
      - [Naming the copy button](#naming-the-copy-button)
      - [Reacting to the result](#reacting-to-the-result)
      - [Styling](#styling)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Commands](#commands)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
    - [CSS custom states](#css-custom-states)
  - [Test scenarios](#test-scenarios)
    - [Default](#default)
    - [Host ARIA](#host-aria)
    - [Accessibility](#accessibility)
    - [User Interaction](#user-interaction)
    - [Copy Functionality](#copy-functionality)
    - [Copy Status](#copy-status)
    - [Custom Icon Slot](#custom-icon-slot)
    - [Whitespace Normalization](#whitespace-normalization)
    - [Copy Format](#copy-format-1)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility-1)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                 |
| ------: | ---------- | --------------------- |
|       1 | 2026-10-14 | Initial specification |

## Overview

The `igc-copy-to-clipboard` overlays a copy button on its slotted content. The button writes the rendered text of
the content to the clipboard through the asynchronous
[Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API). It then shows the result with a
status icon, announces it through a live region and emits it in the `igcCopy` event.

```html
<igc-copy-to-clipboard>
  <p>Some text the user can copy to the clipboard.</p>
</igc-copy-to-clipboard>
```

### Key features

- **Rendered text only.** The component reads the content with the `innerText` algorithm, so hidden elements and
  the icon slots are never copied.
- **Two formats.** `plain` collapses whitespace, and `preserve` keeps paragraph breaks and code indentation.
- **Reveal on demand.** The button appears on hover or when focus moves inside the component. On a device without
  hover it stays visible.
- **Status feedback.** A success or error icon replaces the copy icon for one second, and a live region announces
  the result.
- **Result event and states.** `igcCopy` gives the status and the text of each copy action, and the
  `:state(ig-success)` and `:state(ig-error)` custom states match while the status icon shows.
- **Custom icons** for each of the three states, through slots.
- **The `--copy` command** of the Invoker Commands API, which works also when the button is turned off.
- **Host naming.** The host `aria-label`, `aria-labelledby` and `aria-describedby` name and describe the button.

### Acceptance criteria

- The component must copy only the rendered text of the content in the default slot.
- It must not copy the content of the icon slots.
- Keyboard users must reach the button, also when the content has no focusable element.
- The button must be visible whenever it has focus.
- The component must report the result of each copy action visually, to assistive technology and to the page.
- It must fail without an exception when the Clipboard API rejects or is not available.
- `disable-interaction` must remove the button from the page and from the accessibility tree, while the `--copy`
  command keeps working.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- copy a text or a code snippet with one click, without selecting it first;
- reach and use the copy button with the keyboard;
- know whether the copy worked, also with a screen reader;
- see the copy button on a touch screen, where there is no hover.

### Developer stories

As a developer, I expect to be able to:

- wrap any content to make it copyable;
- choose whether the copied text keeps its whitespace;
- replace the icons of the button;
- start the copy action from my own button;
- react to the result of a copy action, for example with my own feedback or a manual-copy fallback;
- give each copy button on a page its own accessible name.

## Functionality

### End-user experience

The copy button sits in the top inline-end corner of the content. At rest it is transparent and ignores the
pointer. It fades in while the pointer is over the component or while focus is inside it. On a device that has no
hover (`@media (hover: none)`), the button is always visible.

After a copy action, the success icon (or the error icon, if the clipboard rejects the write) shows for one second.
Then the copy icon returns. A new copy action in that second starts the delay again.

There is no design hand-off link for the component.

### Developer experience

#### Basic initialization

Put the content in the default slot. Any HTML is allowed.

```html
<igc-copy-to-clipboard>
  <p>First paragraph.</p>
  <p>Second paragraph.</p>
</igc-copy-to-clipboard>
```

#### Copy format

Both formats start from the `innerText` of the component, with the icon slots left out.

| Format     | Result                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plain`    | Each run of spaces and tabs becomes one space, the spaces around a line break are removed, each run of line breaks becomes one, and the result is trimmed. |
| `preserve` | Only the leading and trailing line breaks are removed. Paragraph breaks and indentation stay.                                                              |

```html
<igc-copy-to-clipboard format="preserve">
  <pre><code>function greet(name) {
  return `Hello, ${name}!`;
}</code></pre>
</igc-copy-to-clipboard>
```

#### Custom icons

The `copy-icon`, `success-icon` and `error-icon` slots replace the built-in icon of their state. When a slot has
content, the button renders no built-in icon for that state.

```html
<igc-copy-to-clipboard>
  <igc-icon name="copy" slot="copy-icon" aria-hidden="true"></igc-icon>
  <p>Content to copy.</p>
</igc-copy-to-clipboard>
```

#### Copying from another element

The `--copy` command runs the copy action. It works also when `disable-interaction` hides the built-in button.

```html
<igc-copy-to-clipboard id="snippet" disable-interaction>
  <p>Some text to copy.</p>
</igc-copy-to-clipboard>
<button command="--copy" commandfor="snippet">Copy the snippet</button>
```

#### Naming the copy button

The default name of the button is "Copy to clipboard". When a page has several copy buttons, give each one a
specific name through the host:

```html
<igc-copy-to-clipboard aria-label="Copy the install command">
  <pre><code>npm install igniteui-webcomponents</code></pre>
</igc-copy-to-clipboard>
```

#### Reacting to the result

The component emits [`igcCopy`](#events) after each copy action. The `text` is there also on failure, so the page
can show it for a manual copy.

```ts
const snippet = document.querySelector('igc-copy-to-clipboard')!;

snippet.addEventListener('igcCopy', ({ detail }) => {
  if (detail.status === 'error') {
    showManualCopyDialog(detail.text);
  }
});
```

#### Styling

The button is an icon button with the `button` part, and one more part for its state: `copy-button`,
`success-button` or `error-button`. Its offsets and its padding follow the `--ig-spacing` scale.

The reveal is pure CSS, so a rule on the part can keep the button visible:

```css
igc-copy-to-clipboard::part(button) {
  opacity: 1;
  pointer-events: auto;
}
```

The `ig-success` and `ig-error` custom states style the content while the status icon shows:

```css
igc-copy-to-clipboard:state(ig-success) pre {
  outline: 2px solid var(--ig-success-500);
}
```

### Localization

The component has no `locale` or `resourceStrings`, because `igniteui-i18n-core` has no resource strings for it.
Its three strings are English and fixed:

| Use                         | String                                                   |
| --------------------------- | -------------------------------------------------------- |
| The default button name     | "Copy to clipboard"                                      |
| The announcement on success | "Content copied to clipboard successfully."              |
| The announcement on failure | "Failed to copy content to clipboard. Please try again." |

A host `aria-label` replaces the button name.

### Keyboard interactions

| Key                 | Action                                                                        |
| ------------------- | ----------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Moves focus to and from the copy button. The button shows while it has focus. |
| `Enter` / `Space`   | Copies the content, through the native button.                                |

## API

### Properties and attributes

| Property             | Attribute             | Reflected | Type                    | Default   | Description                                                                                    |
| -------------------- | --------------------- | --------- | ----------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `disableInteraction` | `disable-interaction` | yes       | `boolean`               | `false`   | Whether the copy button is hidden and disabled. The `--copy` command still copies the content. |
| `format`             | `format`              | no        | `'plain' \| 'preserve'` | `'plain'` | How the copied text is formatted.                                                              |

### Methods

None applicable.

### Events

| Event     | Detail                        | Cancelable | Description                                                                   |
| --------- | ----------------------------- | ---------- | ----------------------------------------------------------------------------- |
| `igcCopy` | `IgcCopyToClipboardEventArgs` | no         | Emitted after each copy action, from the button or from the `--copy` command. |

`IgcCopyToClipboardEventArgs` has two fields:

| Field    | Type                   | Description                                      |
| -------- | ---------------------- | ------------------------------------------------ |
| `status` | `'success' \| 'error'` | Whether the text reached the clipboard.          |
| `text`   | `string`               | The text that the component copied, or tried to. |

The event is emitted after the custom state changes, so a listener sees `:state(ig-success)` or
`:state(ig-error)` already.

### Commands

| Command  | Action                                                                 |
| -------- | ---------------------------------------------------------------------- |
| `--copy` | Runs the copy action. It works also when `disable-interaction` is set. |

### Slots

| Name           | Description                         |
| -------------- | ----------------------------------- |
| default        | The content to display and copy.    |
| `copy-icon`    | Overrides the default copy icon.    |
| `success-icon` | Overrides the default success icon. |
| `error-icon`   | Overrides the default error icon.   |

### CSS Shadow parts

| Part             | Description                                      |
| ---------------- | ------------------------------------------------ |
| `button`         | The copy button.                                 |
| `copy-button`    | The copy button while it shows the copy icon.    |
| `success-button` | The copy button while it shows the success icon. |
| `error-button`   | The copy button while it shows the error icon.   |

### CSS custom states

| State                | Description                                       |
| -------------------- | ------------------------------------------------- |
| `:state(ig-success)` | Applied to the host while the success icon shows. |
| `:state(ig-error)`   | Applied to the host while the error icon shows.   |

A disconnected component leaves both states.

## Test scenarios

| Suite               | File                        |
| ------------------- | --------------------------- |
| `Copy to clipboard` | `copy-to-clipboard.spec.ts` |

The suite stubs `navigator.clipboard.writeText`. It uses the real mouse for hover and a real invoker button for
the `--copy` command. The whitespace scenarios put their text in a `<pre>`, because `innerText` already
collapses whitespace in other elements.

### Default

1. The component passes the accessibility audit.
2. `format` defaults to `plain`, and the host has no attributes.
3. The content of the default slot is rendered.
4. The shadow root renders an icon button.
5. The visually hidden text of the button is "Copy to clipboard".

### Host ARIA

The shared `runHostAriaTests` suite runs with the icon button as the target.

### Accessibility

6. A host `aria-label` reaches the native button inside the icon button.
7. A host `aria-labelledby` reaches the native button as an element reference.
8. The live region has `role="status"` and no explicit `aria-live`.
9. The component passes the accessibility audit with `disable-interaction`.

### User Interaction

10. At rest the button is not shown, but it is not disabled or hidden either.
11. The pointer over the component shows the button.
12. The pointer leaving the component hides the button.
13. Focus on the button shows it.
14. Blur hides the button.
15. The focused button stays shown when the pointer leaves the component.
16. `disable-interaction` set while the pointer is over the component hides the button.
17. With `disable-interaction`, neither the pointer nor focus shows the button, and it is disabled and hidden.

### Copy Functionality

18. A simple text is copied as it is.
19. Runs of spaces and the indentation around the text are normalized.
20. A run of empty lines in a `<pre>` becomes one line break.
21. Adjacent block elements are separated by one line break in the `plain` format.
22. The text of hidden elements is not copied.
23. The text of nested elements is copied.
24. An empty component copies an empty string.
25. A component with only whitespace copies an empty string.

### Copy Status

26. A successful copy shows the success icon and announces the success.
27. A rejected write shows the error icon and announces the failure.
28. The button name stays the same while the state changes.
29. The copy icon returns after one second, and the live region is cleared.
30. A new copy action in that second starts the delay again.
31. A reconnected component shows the copy icon again.
32. The `--copy` command copies the content when `disable-interaction` is set.
33. A successful copy emits `igcCopy` from the host, with the `success` status and the copied text. The event is
    composed and not cancelable.
34. A rejected write emits `igcCopy` with the `error` status and the text.
35. The `--copy` command with `disable-interaction` emits `igcCopy`.
36. The host is in the `ig-success` state when `igcCopy` fires, and leaves it after one second.
37. A rejected write puts the host in the `ig-error` state, and it leaves it after one second.
38. A successful copy after a failed one changes the state from `ig-error` to `ig-success`.
39. A disconnected component leaves the result state.

### Custom Icon Slot

40. Content in the `copy-icon` slot replaces the built-in icon.
41. The content of the icon slots is not copied in the `plain` format.
42. The content of the icon slots is not copied in the `preserve` format.

### Whitespace Normalization

43. A run of spaces becomes one space.
44. A run of tabs becomes one space.
45. Single line breaks stay.
46. Leading and trailing whitespace is removed.
47. A mix of spaces, tabs and empty lines is normalized.

### Copy Format

48. `format` defaults to `plain` and is not reflected.
49. The `format` attribute sets `preserve`.
50. The `plain` format joins paragraphs with one line break.
51. The `preserve` format keeps an empty line between paragraphs.
52. The `preserve` format keeps the indentation of a code block.

### Not covered by the suite

- The always visible button on a device without hover. The test browser reports hover.
- The transition and its `prefers-reduced-motion` override.
- The error state when `navigator.clipboard` is not available.
- The `success-icon` and `error-icon` slots.
- The placement of the button in a Right-to-Left context.

## Assumptions and limitations

- The Clipboard API needs a secure context, and most browsers also need the document to have focus. When the API
  rejects or is not available, the component shows the error state.
- Only plain text is written. The component writes no HTML or other formats.
- The text comes from the `innerText` of the component, so the content must be rendered. Text that a child
  component renders only in its own shadow root, and the values of form controls, are not copied.
- The status icon, and the `ig-success` or `ig-error` state, last for a fixed delay of one second.
- The button is absolutely positioned over the top inline-end corner of the content. Leave room there, for example
  with an end padding, so that the button does not cover text. Its size depends on the theme and `--ig-size`.
- The live region announces a change of the result. When the same result repeats inside the delay, the text does
  not change, and a screen reader does not announce it again.
- The strings are English only. See [Localization](#localization).

## Accessibility

### ARIA roles and properties

| Element       | Role / property                      | Value                                                                                     |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| Copy button   | native `<button>` in the icon button | Named by its visually hidden text, "Copy to clipboard".                                   |
| Copy button   | `aria-label` / `aria-labelledby`     | The host `aria-label` or `aria-labelledby`, when set. They replace the default name.      |
| Copy button   | `aria-describedby`                   | The host `aria-describedby`, when set.                                                    |
| Built-in icon | `aria-hidden`                        | `true`                                                                                    |
| Live region   | `role`                               | `status`, with its implicit polite live setting. It holds the result message, or nothing. |

- The host has no role. It uses `delegatesFocus`, so `focus()` on the host moves focus to the button.
- Slotted icons are part of the button content. Give them `aria-hidden="true"`, so that they do not change the
  default name.

### Keyboard support

The button is a native button in the tab sequence, so `Tab`, `Enter` and `Space` work as for any button. The
button is shown while it has focus, so the focus indicator is always visible (WCAG 2.4.7).

### Right to Left support

The button is placed with logical properties (`inset-inline-end`), so it moves to the top-left corner in a
Right-to-Left context without additional setup or configuration.

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
    - [Localization](#localization-1)
    - [Custom Icon Slot](#custom-icon-slot)
    - [Whitespace Normalization](#whitespace-normalization)
    - [Copy Format](#copy-format-1)
    - [Text format properties](#text-format-properties)
    - [Not covered by the suite](#not-covered-by-the-suite)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility-1)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                                              |
| ------: | ---------- | -------------------------------------------------------------------------------------------------- |
|       1 | 2026-10-14 | Initial specification                                                                              |
|       2 | 2026-11-17 | `copy()`, `focus()` and `blur()`; resource strings; no status parts; announcement and status rules |

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
  the icon slots are never copied. A component that is not rendered or not visible copies nothing.
- **Two formats.** `plain` collapses whitespace, and `preserve` keeps paragraph breaks and code indentation.
- **Reveal on demand.** The button appears on hover or when focus moves inside the component. On a device without
  hover it stays visible.
- **Status feedback.** A success or error icon replaces the copy icon for one second, and a live region announces
  the result, also when the same result repeats.
- **Result event and states.** `igcCopy` gives the status and the text of each copy action, and the
  `:state(ig-success)` and `:state(ig-error)` custom states match while the status icon shows.
- **Custom icons** for each of the three states, through slots.
- **The `--copy` command** of the Invoker Commands API, which works also when the button is turned off, and the
  `copy()` method for browsers without that API.
- **Host naming.** The host `aria-label`, `aria-labelledby` and `aria-describedby` name and describe the button.
- **Localization.** The button name and the announcements come from resource strings.

### Acceptance criteria

- The component must copy only the rendered text of the content in the default slot.
- It must not copy the content of the icon slots.
- A component that is not rendered or not visible must copy nothing and report an error.
- A click in the content must not move focus to the button.
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
Then the copy icon returns. A new copy action in that second starts the delay again. When copy actions overlap,
the latest one sets the icon.

A click in the content does not move focus to the button, so `Space` after a click scrolls the page and does not
copy.

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

| Format     | Result                                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plain`    | Each run of whitespace other than line breaks becomes one space, the spaces around a line break are removed, each run of line breaks becomes one, and the result is trimmed. |
| `preserve` | Only the leading and trailing line breaks are removed. Paragraph breaks and indentation stay.                                                                                |

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

The command needs the Invoker Commands API (Chrome and Edge 135, Firefox 144, Safari 26.2). In older browsers, call
`copy()` from the click handler of your button. Call it before any `await`, because browsers accept a clipboard
write only during a user action. `copy()` shows the status and announces it, but does not emit `igcCopy`; it
resolves with the same status and text.

```ts
copyButton.addEventListener('click', async () => {
  const { status, text } = await snippet.copy();

  if (status === 'error') {
    showManualCopyDialog(text);
  }
});
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

The component emits [`igcCopy`](#events) after each copy action from the button or the `--copy` command. The
`text` is there also on failure, so the page can show it for a manual copy.

```ts
const snippet = document.querySelector('igc-copy-to-clipboard')!;

snippet.addEventListener('igcCopy', ({ detail }) => {
  if (detail.status === 'error') {
    showManualCopyDialog(detail.text);
  }
});
```

#### Styling

The button is an icon button with the `button` part. Its offsets and its padding follow the `--ig-spacing` scale.

The reveal is pure CSS, so a rule on the part can keep the button visible:

```css
igc-copy-to-clipboard::part(button) {
  opacity: 1;
  pointer-events: auto;
}
```

The `ig-success` and `ig-error` custom states style the content and the button while the status icon shows:

```css
igc-copy-to-clipboard:state(ig-success) pre {
  outline: 2px solid var(--ig-success-500);
}

igc-copy-to-clipboard:state(ig-success)::part(button) {
  --ig-contained-icon-button-background: var(--ig-success-500);
}
```

### Localization

The component takes its strings from `CopyToClipboardResourceStringsEN` of `igniteui-i18n-core`, through
`I18nMixin`. Set `locale`, or register the strings of a locale with `registerI18n()`, to change the language, and set
`resourceStrings` to replace single strings.

| Key                         | Use                         | English string                                           |
| --------------------------- | --------------------------- | -------------------------------------------------------- |
| `copy_to_clipboard_label`   | The default button name     | "Copy to clipboard"                                      |
| `copy_to_clipboard_success` | The announcement on success | "Content copied to clipboard successfully."              |
| `copy_to_clipboard_error`   | The announcement on failure | "Failed to copy content to clipboard. Please try again." |

A host `aria-label` replaces the button name.

### Keyboard interactions

| Key                 | Action                                                                        |
| ------------------- | ----------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Moves focus to and from the copy button. The button shows while it has focus. |
| `Enter` / `Space`   | Copies the content, through the native button.                                |

## API

### Properties and attributes

| Property             | Attribute             | Reflected | Type                              | Default   | Description                                                                                    |
| -------------------- | --------------------- | --------- | --------------------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `disableInteraction` | `disable-interaction` | yes       | `boolean`                         | `false`   | Whether the copy button is hidden. The `--copy` command and `copy()` still copy the content.   |
| `format`             | `format`              | no        | `CopyToClipboardFormat`           | `'plain'` | How the copied text is formatted: `'plain'` or `'preserve'`.                                   |
| `locale`             | `locale`              | no        | `string`                          |           | The locale of the strings. Without it, the component takes the locale of the page.             |
| `resourceStrings`    |                       | no        | `ICopyToClipboardResourceStrings` |           | Strings that replace the strings of the current locale.                                        |

### Methods

| Method    | Returns                                | Description                                                                                                                                                 |
| --------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `copy()`  | `Promise<IgcCopyToClipboardEventArgs>` | Copies the content, shows the status and announces it, and resolves with the status and the text. It does not emit `igcCopy`. Call it during a user action. |
| `focus()` | `void`                                 | Moves focus to the copy button, also before a pending render. With `disable-interaction`, the component does not take the focus.                            |
| `blur()`  | `void`                                 | Removes focus from the copy button.                                                                                                                         |

### Events

| Event     | Detail                        | Cancelable | Description                                                                   |
| --------- | ----------------------------- | ---------- | ----------------------------------------------------------------------------- |
| `igcCopy` | `IgcCopyToClipboardEventArgs` | no         | Emitted after each copy action, from the button or from the `--copy` command. |

A component that is not rendered or not visible emits `igcCopy` with the `error` status and an empty `text`. Each
copy action of the user emits the event when it settles while the component is connected, also after a move in the
page. A copy action that settles while the component is disconnected emits nothing. `copy()` does not emit the
event.

`IgcCopyToClipboardEventArgs` has two fields:

| Field    | Type                   | Description                                      |
| -------- | ---------------------- | ------------------------------------------------ |
| `status` | `'success' \| 'error'` | Whether the text reached the clipboard.          |
| `text`   | `string`               | The text that the component copied, or tried to. |

For the latest copy action, the event is emitted after the custom state changes, so a listener sees
`:state(ig-success)` or `:state(ig-error)` already. When copy actions overlap, the state shows the latest one.

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

| Part     | Description      |
| -------- | ---------------- |
| `button` | The copy button. |

To style the button for a status, combine the part with a [custom state](#css-custom-states), for example
`:state(ig-success)::part(button)`.

### CSS custom states

| State                | Description                                       |
| -------------------- | ------------------------------------------------- |
| `:state(ig-success)` | Applied to the host while the success icon shows. |
| `:state(ig-error)`   | Applied to the host while the error icon shows.   |

A disconnected component leaves both states. When copy actions overlap, the latest one sets the state.

## Test scenarios

| Suite                           | File                        |
| ------------------------------- | --------------------------- |
| `Copy to clipboard`             | `copy-to-clipboard.spec.ts` |
| `Copy to clipboard text format` | `format.property.spec.ts`   |

The suite stubs `navigator.clipboard.writeText`. It uses the real mouse for hover and clicks, and a real invoker
button for the `--copy` command. The whitespace scenarios put their text in a `<pre>`, because `innerText` already
collapses whitespace in other elements. The live region gets the result 100 ms after the status, so the scenarios
that read it advance the fake timers.

### Default

1. The component passes the accessibility audit.
2. The host has no attributes by default.
3. The content of the default slot is rendered.
4. The shadow root renders an icon button.
5. The visually hidden text of the button is "Copy to clipboard".

### Host ARIA

The shared `runHostAriaTests` suite runs with the icon button as the target.

### Focus before the first render

The shared `runFocusBeforeRenderTests` suite checks that `focus()` before the first render moves focus to the
copy button after the render.

### Accessibility

6. A host `aria-label` reaches the native button inside the icon button.
7. A host `aria-labelledby` reaches the native button as an element reference.
8. The live region has `role="status"` and no explicit `aria-live`.
9. The component passes the accessibility audit with `disable-interaction`.

### User Interaction

10. At rest the button is not shown, but it is not hidden either.
11. The pointer over the component shows the button.
12. The pointer leaving the component hides the button.
13. Focus on the button shows it.
14. Blur hides the button.
15. The focused button stays shown when the pointer leaves the component.
16. `disable-interaction` set while the pointer is over the component hides the button.
17. A click in the content does not move focus to the button.
18. `focus()` moves focus to the button and shows it, and `blur()` removes the focus.
19. `focus()` right after `disable-interaction` is turned off, in the same task, moves focus to the button.
20. `autofocus` on the host moves focus to the button.
21. With `disable-interaction`, `focus()` does not move the focus.
22. With `disable-interaction`, neither the pointer nor focus shows the button, and it is hidden.

### Copy Functionality

23. A simple text is copied as it is.
24. Runs of spaces and the indentation around the text are normalized.
25. A run of empty lines in a `<pre>` becomes one line break.
26. Adjacent block elements are separated by one line break in the `plain` format.
27. The text of hidden elements is not copied.
28. The text of nested elements is copied.
29. An empty component copies an empty string.
30. A component with only whitespace copies an empty string.
31. A component that is not rendered writes nothing, and `igcCopy` has the `error` status and an empty text.
32. Without `navigator.clipboard`, the copy emits `igcCopy` with the `error` status and sets `ig-error`.
33. An `igc-button` with `command="--copy"` copies the content.
34. `copy()` right after the component is added, before its first render, copies the content.
35. A component with `visibility: hidden` writes nothing, and `igcCopy` has the `error` status and an empty text.

### Copy Status

36. A successful copy shows the success icon, and then the live region announces the success.
37. A rejected write shows the error icon, and then the live region announces the failure.
38. The button has only the `button` part in each status.
39. A second equal result clears the live region at once and announces the message again after the gap.
40. The button name stays the same while the state changes.
41. The copy icon returns after one second, and the live region is cleared.
42. A new copy action in that second starts the delay again.
43. A reconnected component shows the copy icon again, and the live region is empty.
44. Other commands than `--copy` do not copy.
45. The `--copy` command copies the content when `disable-interaction` is set.
46. A successful copy emits `igcCopy` from the host, with the `success` status and the copied text. The event is
    composed and not cancelable.
47. A rejected write emits `igcCopy` with the `error` status and the text.
48. The `--copy` command with `disable-interaction` emits `igcCopy`.
49. The host is in the `ig-success` state when `igcCopy` fires, and leaves it after one second.
50. A rejected write puts the host in the `ig-error` state, and it leaves it after one second.
51. A successful copy after a failed one changes the state from `ig-error` to `ig-success`.
52. A disconnected component leaves the result state.
53. A write that settles after a disconnect sets no state, emits nothing and starts no timer.
54. When an older write settles after a newer one, the state of the newer one stays, and each action emits
    `igcCopy` with its own status.
55. A click whose write a `copy()` call overtakes still emits `igcCopy`.
56. A component that moves in the page during the write shows the result and emits `igcCopy`.
57. `copy()` on a disconnected component sets no state and starts no timer.
58. `copy()` resolves with the status and the text, sets the state and announces the result, but does not emit
    `igcCopy`.
59. `copy()` resolves with the `error` status when the write fails.
60. A copy right after the status changes, before the render, does not copy the custom icon that still shows.

### Localization

61. With `locale="bg"`, the button name and the announcement are in Bulgarian.
62. `resourceStrings` replaces the button name and the announcement.

### Custom Icon Slot

63. Content in the `copy-icon` slot replaces the built-in icon.
64. The content of the icon slots is not copied in the `plain` format.
65. The content of the icon slots is not copied in the `preserve` format.
66. The `success-icon` content is not copied while it shows.
67. The `error-icon` content is not copied while it shows.

### Whitespace Normalization

68. A run of spaces becomes one space.
69. A run of tabs becomes one space.
70. A run of non-breaking spaces becomes one space.
71. Single line breaks stay.
72. Leading and trailing whitespace is removed.
73. A mix of spaces, tabs and empty lines is normalized.

### Copy Format

74. `format` defaults to `plain` and is not reflected.
75. The `format` attribute sets `preserve`.
76. The `plain` format joins paragraphs with one line break.
77. The `preserve` format keeps an empty line between paragraphs.
78. The `preserve` format keeps the indentation of a code block.

### Text format properties

The fast-check suite runs `formatCopiedText()` on strings with spaces, tabs, line breaks, carriage returns and
Unicode spaces, and on arbitrary strings.

- `plain` is idempotent, keeps the other characters in their order, and leaves only single spaces and single line
  breaks, with no space next to a line break and no whitespace at the ends.
- `preserve` is idempotent, has no line break at the ends, and changes nothing but those line breaks.

### Not covered by the suite

- The always visible button on a device without hover. The test browser reports hover.
- The transition and its `prefers-reduced-motion` override.
- The `--copy` command in a browser without the Invoker Commands API.
- The announcement in a real screen reader.
- The placement of the button in a Right-to-Left context.

## Assumptions and limitations

- The Clipboard API needs a secure context, and most browsers also need the document to have focus. When the API
  rejects or is not available, the component shows the error state.
- Only plain text is written. The component writes no HTML or other formats.
- The text comes from the `innerText` of the component, so the content must be rendered. Without a layout box,
  `innerText` returns all the text, also that of hidden elements and icons, and under `visibility: hidden` it is
  empty. So a component that is not rendered or not visible, for example in a `display: none` container, copies
  nothing and reports the `error` status. A pending render is applied before the read, so `copy()` works also
  right after the component is added. Text that a child
  component renders only in its own shadow root, and the values of form controls, are not copied.
- The `--copy` command needs the Invoker Commands API. Safari supports it from 26.2; in older browsers, use `copy()`.
- The status icon, and the `ig-success` or `ig-error` state, last for a fixed delay of one second.
- The button is absolutely positioned over the top inline-end corner of the content. Leave room there, for example
  with an end padding, so that the button does not cover text. Its size depends on the theme and `--ig-size`.
- The live region is cleared at each result and gets the message 100 ms later, so a screen reader announces also
  an equal result again. The message clears with the status icon.
- When copy actions overlap, only the latest one sets the status and the announcement, and each copy action of the
  user emits `igcCopy`. A write that settles while the component is disconnected changes nothing.

## Accessibility

### ARIA roles and properties

| Element       | Role / property                      | Value                                                                                     |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| Copy button   | native `<button>` in the icon button | Named by its visually hidden text, the `copy_to_clipboard_label` string.                  |
| Copy button   | `aria-label` / `aria-labelledby`     | The host `aria-label` or `aria-labelledby`, when set. They replace the default name.      |
| Copy button   | `aria-describedby`                   | The host `aria-describedby`, when set.                                                    |
| Built-in icon | `aria-hidden`                        | `true`                                                                                    |
| Live region   | `role`                               | `status`, with its implicit polite live setting. It holds the result, or nothing.         |

- The host has no role and does not take the focus. `focus()` and `autofocus` on the host move focus to the button.
  The component does not use `delegatesFocus`, so a click in the content does not move focus to the button.
- Slotted icons are part of the button content. Give them `aria-hidden="true"`, so that they do not change the
  default name.

### Keyboard support

The button is a native button in the tab sequence, so `Tab`, `Enter` and `Space` work as for any button. The
button is shown while it has focus, so the focus indicator is always visible (WCAG 2.4.7).

### Right to Left support

The button is placed with logical properties (`inset-inline-end`), so it moves to the top-left corner in a
Right-to-Left context without additional setup or configuration.

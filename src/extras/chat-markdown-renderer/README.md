# Chat Markdown renderer

`createMarkdownRenderer()` renders the messages of `igc-chat` from Markdown. It highlights the code blocks with
[shiki](https://shiki.style) and sanitizes the HTML with [DOMPurify](https://github.com/cure53/DOMPurify).

```ts
import { createMarkdownRenderer } from 'igniteui-webcomponents/extras';
```

## Install

The renderer uses three optional peer dependencies. Install them in the application:

```sh
npm install marked dompurify shiki
```

The renderer loads shiki only when it highlights code, and only the languages and themes that you give it.

## Usage

Give the renderer to the `messageContent` renderer of the chat:

```ts
const markdown = await createMarkdownRenderer({
  languages: ['typescript', 'html', 'shellscript'],
});

chat.options = {
  renderers: {
    messageContent: ({ message }) => markdown(message),
  },
};
```

The returned function takes a chat message and resolves to a Lit template. It keeps the result for each message object
and converts the message again only when its `text` changes.

To convert Markdown outside the chat, use `setupMarkdownRenderer()`. Its `parse(text)` resolves to the sanitized HTML,
and its `marked` property gives the [marked](https://marked.js.org) instance for extensions.

```ts
import { setupMarkdownRenderer } from 'igniteui-webcomponents/extras';

const renderer = await setupMarkdownRenderer({ noHighlighter: true });
const html = await renderer.parse('**Hello**');
```

## Options

| Option              | Type                                           | Default                                         | Description                                                                                   |
| ------------------- | ---------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `languages`         | `string[]`                                     | `['javascript', 'typescript', 'html', 'css']`   | The languages to highlight.                                                                   |
| `theme`             | `string \| { light?: string; dark?: string }`  | `{ light: 'github-light', dark: 'github-dark' }` | The shiki theme, or one theme for the light mode and one for the dark mode.                  |
| `noHighlighter`     | `boolean`                                      | `false`                                         | Turns off the highlighting, so shiki does not load.                                           |
| `colorReplacements` | `Record<string, string>`                       | Not set                                         | Maps the hex colors of the theme to CSS variables, for all themes.                            |
| `sanitizer`         | `(html: string) => string`                     | DOMPurify                                       | Replaces the sanitizer. It must make the HTML safe, because the chat renders it as is.        |

## Links

With the default sanitizer, an `http` or `https` link to another origin opens in a new tab, with
`rel="noopener noreferrer"`. Other links open in the same tab. A custom sanitizer gets these attributes on the
Markdown links only. The chat emits `igcNavigate` when the user opens a link, see
[Links in messages](../../components/chat/spec.md#links-in-messages).

## Code colors

With the default GitHub themes, CSS variables such as `--shiki-bg` and `--shiki-red` set the colors of the code. See
[Code highlighting](../../components/chat/spec.md#code-highlighting) in the chat specification.

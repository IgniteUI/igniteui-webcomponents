# Rich Text Editor specification

- [Rich Text Editor specification](#rich-text-editor-specification)
  - [Revision history](#revision-history)
  - [Overview](#overview)
    - [Key features](#key-features)
    - [Acceptance criteria](#acceptance-criteria)
    - [Scope](#scope)
  - [Open questions](#open-questions)
    - [Architecture and scope](#architecture-and-scope)
    - [Design points](#design-points)
    - [Points raised by this draft](#points-raised-by-this-draft)
  - [User stories](#user-stories)
    - [End-user stories](#end-user-stories)
    - [Developer stories](#developer-stories)
  - [Functionality](#functionality)
    - [End-user experience](#end-user-experience)
      - [Design files](#design-files)
      - [Anatomy](#anatomy)
      - [Toolbar](#toolbar)
      - [Menus and pickers](#menus-and-pickers)
      - [Contextual toolbars](#contextual-toolbars)
      - [Editor states](#editor-states)
      - [Themes and sizes](#themes-and-sizes)
    - [Developer experience](#developer-experience)
      - [Basic initialization](#basic-initialization)
      - [Value formats](#value-formats)
      - [Toolbar configuration](#toolbar-configuration)
      - [Links](#links)
      - [Images](#images)
      - [Tables](#tables)
      - [Paste and sanitization](#paste-and-sanitization)
      - [Forms and validation](#forms-and-validation)
      - [Read-only and disabled](#read-only-and-disabled)
    - [Localization](#localization)
    - [Keyboard interactions](#keyboard-interactions)
      - [Markdown typing shortcuts](#markdown-typing-shortcuts)
  - [API](#api)
    - [Properties and attributes](#properties-and-attributes)
    - [Methods](#methods)
    - [Events](#events)
    - [Slots](#slots)
    - [CSS Shadow parts](#css-shadow-parts)
  - [Test scenarios](#test-scenarios)
  - [Assumptions and limitations](#assumptions-and-limitations)
  - [Accessibility](#accessibility)
    - [ARIA roles and properties](#aria-roles-and-properties)
    - [Keyboard support](#keyboard-support)
    - [Right to Left support](#right-to-left-support)

## Revision history

| Version | Date       | Notes                                                                    |
| ------: | ---------- | ------------------------------------------------------------------------ |
|       1 | 2026-11-13 | Initial draft: scope, design and open questions. Nothing is implemented. |

## Overview

> [!NOTE]
> This is a draft for review. The component is not implemented. The scope, the behavior and the API in this
> document are proposals. The decisions in [Open questions](#open-questions) are proposed or open, not final.

The `igc-rich-text-editor` is a form control for formatted text. The user formats the text from a toolbar, from a
toolbar on the selection, with keyboard shortcuts, or with Markdown patterns typed in the text. The application reads
and writes the content as HTML or as Markdown.

```html
<igc-rich-text-editor name="notes" placeholder="Write something, or paste content here"></igc-rich-text-editor>
```

The tag name `igc-rich-text-editor`, the class name `IgcRichTextEditorComponent` and the folder
`src/components/rich-text-editor` are working proposals.

### Key features

- **Toolbar** that the application configures, with overflow and keyboard support.
- **Inline formats**: bold, italic, underline, strikethrough, inline code, text color, highlight and clear formatting.
- **Block formats**: paragraph, headings, bulleted and numbered lists with nesting, quote, code block, horizontal
  rule, alignment and indent.
- **Undo and redo.**
- **Links**, with a link bubble to open, edit and remove a link, and auto-link for typed and pasted URLs.
- **Images** by URL, and by paste and by drag and drop through an upload hook, with alternative text.
- **Tables**, inserted from a size picker and edited from a toolbar on the table.
- **Selection toolbar** that shows the common formats next to the selected text.
- **Markdown typing shortcuts** that convert a typed pattern into the format.
- **Placeholder, word and character count**, and a character limit.
- **HTML and Markdown values**, and sanitized paste.
- **Form integration**: association, validation, and the read-only and disabled states.
- **Themes**: four themes in light and dark, three sizes, Right-to-Left layouts and localization.

### Acceptance criteria

- The user must be able to write and format a document with the keyboard alone and with the pointer.
- Each formatting tool must show the format of the selection, and apply to the selection or to the text typed next.
- The value must be readable and writable as HTML and as Markdown. A value that the editor writes must give the same
  document when the editor reads it again.
- Pasted content and a value set from code must not bring scripts, event handlers or unsafe URLs into the content.
- The component must take part in form submission, form reset and constraint validation.
- The read-only and disabled states must prevent editing. The read-only content must stay readable and selectable.
- Every user-facing string must be localizable.
- Unexpected input, such as an invalid value or a rejected image, must not break the component.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must meet WCAG 2.1 AA and support RTL layouts without additional configuration.

### Scope

The scope comes from the [competitor analysis](https://claude.ai/artifact/FLwuUNptdPNwJ4p7BBLQ87). The scope table
in the analysis lists tables and Markdown as a fast follow. The comments on its open questions move both to version
1, and this table follows the comments.

| Stage        | What goes in |
| ------------ | ------------ |
| Version 1    | Configurable toolbar with overflow and keyboard support. Bold, italic, underline, strikethrough, inline code, text color, highlight, clear formatting. Paragraph, headings, lists with nesting, quote, code block, horizontal rule, alignment, indent. Undo and redo. |
| Version 1    | Links with a link bubble and auto-link. Images by URL, paste and drop through an upload hook, with alternative text. Tables. |
| Version 1    | Selection toolbar. Markdown typing shortcuts. Placeholder, character count and limit. |
| Version 1    | HTML and Markdown values. Sanitized paste. Form association, validation, read-only and disabled. Four themes in light and dark, three sizes, RTL, localization, WCAG 2.1 AA. |
| Fast follow  | Image resize and captions. Mentions and a slash menu on one suggestion popup. Task lists. Find and replace. Font family and size. Fullscreen. |
| Later        | AI commands with a model that the application supplies (a possible version 2 item). Variables as locked chips. Format painter. HTML source view. Syntax highlighting. Block drag handle. PDF export. Comments and collaboration. |
| Out of scope | Word-style document editing: pagination, headers and footers, DOCX round trip, server mail merge. A bundled spell checker, a file manager and a bundled AI model. |

## Open questions

`Proposed` means that a position exists and is not confirmed. `Open` means that there is no position yet.

### Architecture and scope

| Question     | Position | Status |
| ------------ | -------- | ------ |
| Engine       | Our own engine. No headless editor such as ProseMirror or Lexical. The engine could be split from the UI, so that an application can plug in its own UI, but that would probably add complexity. | Proposed |
| Packaging    | A separate barrel, for code splitting. Applications that do not use the editor do not load it. | Proposed |
| Value format | HTML and Markdown from the start. | Proposed |
| Tables       | Version 1. | Proposed |
| AI           | Not now. The library does not offer plug-in AI functionality today, and the rich text editor should not be the first component to add it. A possible version 2 item. | Proposed |
| Shadow DOM   | Does the editable area live in the light DOM? Text selection across shadow roots is a known browser constraint for editors. | Open |

Notes on the engine: TinyMCE and CKEditor 5 are free only under the GPL, so they cannot ship in this MIT package.
ProseMirror and Lexical are MIT, but each is a new runtime dependency, which the repository avoids.

Notes on the Shadow DOM question:

- **Editable area in the shadow root.** The content styles are encapsulated and themed like every other part. The
  engine must read the selection across the shadow boundary (`Selection.getComposedRanges()`). The browser support,
  IME input, the spell checker and browser extensions need a spike.
- **Editable area in the light DOM.** Selection, the spell checker and browser extensions work as in a page. The
  page styles reach the content, the content styles must ship outside the shadow root, and the application can see
  and change the editable DOM.

In both cases, the toolbar, the footer and the popups stay in the shadow root.

### Design points

| Point | Status |
| ----- | ------ |
| In the Bootstrap theme, the button group makes the toolbar solid primary blue. | Open |
| In the Material theme, the design overrides the block format button to a neutral color. Material colors a flat button with the secondary color. | Open |
| All four themes use Material icons for now. | Open |
| The editor frame per theme (border, radius, focus ring, toolbar tint) is a proposal. See [Themes and sizes](#themes-and-sizes). | Proposed |
| The component name and the folder path are working proposals. | Proposed |

### Points raised by this draft

These points came up while the specification was written. They are not in the analysis or in the design notes.

| Point | Status |
| ----- | ------ |
| Markdown cannot express every version 1 format: text color, highlight, underline, alignment, indent and merged cells. Does the Markdown value keep them as inline HTML, or drop them? | Open |
| A separate barrel conflicts with two repository rules: a component is exported from `src/index.ts` and listed in `defineAllComponents.ts`. `npm run check` verifies both, and the public API snapshot reads only `src/index.ts`. The checks, the snapshot and both package manifests must learn the new entry point. The folder can also move. | Open |
| The design has no label. The form controls of the library have a `label`. Does the editor get one? | Open |
| The design has an Insert image tool, but no board for the image flow: URL, alternative text, upload progress, upload error, and a selected image. | Open |
| The table toolbar in the design has insert row below, insert column right, merge cells and delete table. It has no delete row, delete column, insert above, insert left, split cell, header row or column resize. Which ones are in version 1? | Open |
| The design has a More formatting menu with fixed items, but no board for a toolbar that is too narrow for its tools. Do the tools that do not fit move into that menu? | Open |
| Without an upload hook, what happens to a pasted or dropped image: is it rejected, or embedded as a data URL? | Open |
| The color palette has a More colors button. Does it open [the color picker](../color-picker/spec.md)? | Open |
| The theme schema (`igniteui-theming`), the resource strings (`igniteui-i18n-core`) and the icon aliases are shared with other packages and with the other Ignite UI frameworks. Each needs a change outside this repository. | Open |
| The contributing rules ask for a replaceable sanitizer where a component renders HTML, and for an update of `THREAT-MODEL.md` and `PRIVACY.md` when a change adds a way for data to reach the DOM, a network request or a browser capability. The editor adds all three: a value, a paste and a drop render HTML, an image in the content makes the browser request its URL, and a paste reads the clipboard. | Open |
| <kbd>Tab</kbd> in the content: does it always indent, or only in a list and in a table? See [Keyboard interactions](#keyboard-interactions). | Open |

## User stories

### End-user stories

As an end-user, I expect to be able to:

- write text and format it as bold, italic, underlined, struck through or inline code;
- change the text color and the highlight color, and clear the formatting of a selection;
- turn a block into a paragraph, a heading, a quote or a code block, and add a horizontal rule;
- make bulleted and numbered lists, and nest the items;
- align and indent a block;
- undo and redo my changes;
- add a link, see where a link goes, and open, edit or remove it;
- have a URL that I type or paste become a link;
- add an image by its URL, by paste or by drag and drop, and give it alternative text;
- insert a table, add rows and columns, merge cells and delete the table;
- format the selected text from a toolbar next to the selection;
- type Markdown patterns, such as `# ` for a heading, and have them converted;
- paste from a web page or from a word processor and keep the structure, not the clutter;
- see how many words and characters I wrote, and how many characters I can still write;
- see why the content is not valid;
- use the whole component with the keyboard alone, and with a screen reader.

### Developer stories

As a developer, I expect to be able to:

- read and write the content as HTML or as Markdown;
- use the editor in a form, with a name, a required rule and a character limit, and show my own validation messages;
- set a placeholder;
- choose which tools the toolbar shows and their order, or hide the toolbar;
- upload a pasted or dropped image to my server, and give the editor its URL;
- be notified when the user changes the content;
- make the editor read-only or disabled;
- localize every string of the editor;
- style the editor through its parts and with the themes of the library;
- be sure that pasted content cannot run script in my page;
- load the editor only in the applications and pages that use it.

## Functionality

### End-user experience

#### Design files

- [Design, HTML, all 16 boards](https://claude.ai/artifact/1nNK717m72iBgqcCvoLEPq)
- [Design canvas, the same boards, for review](https://claude.ai/artifact/XkBDodEzzK9dLrAaASQ4et)
- [`design/rich-text-editor-design.html`](design/rich-text-editor-design.html): the same boards as one
  self-contained file. Open it in a browser. It embeds a build of the library, so the controls are live components
  with the real theme styles, and it does not follow later changes of the library.
- [Competitor analysis, proposed scope and open questions](https://claude.ai/artifact/FLwuUNptdPNwJ4p7BBLQ87)

There is no Figma file.

The design has two sets of eight boards, one board for each theme (Indigo, Material, Bootstrap, Fluent) in light and
in dark:

1. **Editor in use**: a focused editor with content.
2. **States and popups**: the toolbar sizes, the menus and pickers, the contextual toolbars and the editor states.

#### Anatomy

```text
┌───────────────────────────────────────────────────────────────┐
│ ↶ ↷ │ Paragraph ▾ │ B I U S │ A ✎ │ ≡ ≡ ≡ ≡ │ • 1. ⇤ ⇥ │ ⋯    │  toolbar
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Content area                                                 │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ Bulleted list                      105 words · 541 characters │  footer
└───────────────────────────────────────────────────────────────┘
  Helper text
```

- **Toolbar**: the formatting tools, in groups.
- **Content area**: the editable document.
- **Footer**: the block type at the caret on the start side, and the word and character counts on the end side.
  With a character limit, the footer shows the count against the limit, for example `0 / 2000 characters`.
- **Helper text**: below the editor. In the invalid state, it shows the validation message.

#### Toolbar

The toolbar is built from existing components. An `igc-divider` separates the groups.

| Group           | Tools                                                             | Built from                                                                     |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| History         | Undo, Redo                                                        | `igc-icon-button`                                                              |
| Block format    | Paragraph, Heading 1, Heading 2, Heading 3, Quote, Code block     | `igc-dropdown` with an `igc-button` target                                     |
| Inline format   | Bold, Italic, Underline, Strikethrough                            | `igc-button-group` with multiple selection and `igc-toggle-button`             |
| Color           | Text color, Highlight                                             | `igc-icon-button`. Each icon has a bar in the current color.                    |
| Alignment       | Align left, Align center, Align right, Justify                    | `igc-button-group` with single required selection and `igc-toggle-button`      |
| Lists           | Bulleted list, Numbered list                                      | `igc-button-group` with single selection and `igc-toggle-button`               |
| Indent          | Decrease indent, Increase indent                                  | `igc-icon-button`                                                              |
| Insert          | Insert link, Insert image, Insert table                           | `igc-icon-button`                                                              |
| More formatting | Inline code, Quote, Code block, Horizontal rule, Clear formatting | `igc-dropdown` with an `igc-icon-button` target and `igc-icon` in the items     |

A toggle tool is pressed while the selection has its format. The block format tool shows the block type of the
selection. Undo and Redo are disabled while there is nothing to undo or to redo.

#### Menus and pickers

| Popup             | Content |
| ----------------- | ------- |
| Block format menu | Paragraph, Heading 1, Heading 2, Heading 3, Quote and Code block. The current block type is selected. |
| Color palette     | Three rows of eight swatches: grays, saturated colors and tints. The current color is marked. Two buttons: Automatic, which removes the color, and More colors. Text color and Highlight use the same palette. |
| Table picker      | A grid of eight columns by six rows. The user marks the size of the table. A text below the grid states it, for example `4 columns by 3 rows`. |
| More menu         | Inline code, Quote, Code block, Horizontal rule and Clear formatting, each with an icon. |

#### Contextual toolbars

A contextual toolbar floats next to the content that it acts on.

| Toolbar        | Shows on                    | Tools |
| -------------- | --------------------------- | ----- |
| Text selection | A selection of text          | Bold, Italic, Underline, Strikethrough, Insert link, Text color, Highlight, Clear formatting |
| Link, view     | The caret in a link          | The URL of the link, Open link, Edit link, Remove link |
| Link, edit     | Edit link, or Insert link    | A Link input and a Text input (`igc-input`), Cancel and Apply |
| Table          | The caret in a table cell    | Insert row below, Insert column right, Merge cells, Delete table |

#### Editor states

| State     | Design |
| --------- | ------ |
| Focused   | The border takes the focus color, and the theme adds its focus ring. |
| Empty     | The content area shows the placeholder. With a limit, the footer shows `0 / 2000 characters`. |
| Invalid   | The border takes the error color. The helper text below the editor shows the message in the error color, for example `This field is required`. |
| Disabled  | The editor is dimmed, and every tool is disabled. |
| Read-only | The toolbar is hidden. The content area has a tinted background. The footer keeps the counts. |

#### Themes and sizes

The toolbar has three sizes: small, medium and large. Small is the default. The size follows `--ig-size`, as in the
other components.

The frame of the editor per theme is a proposal. The values are theme variables.

| Property     | Indigo                         | Material         | Bootstrap                      | Fluent           |
| ------------ | ------------------------------ | ---------------- | ------------------------------ | ---------------- |
| Radius       | 4px                            | 4px              | 4px                            | 2px              |
| Border       | gray 300                       | gray 500         | gray 400                       | gray 700         |
| Background   | White in light, surface in dark | surface         | White in light, surface in dark | surface         |
| Toolbar tint | gray 50                        | surface          | gray 100                       | gray 100         |
| Focus border | primary 500, primary 400 in dark | primary 500    | primary 300                    | primary 500      |
| Focus ring   | 3px, primary 400 at 40%        | 1px, primary 500 | 4px, primary 500 at 25%        | 1px, primary 500 |
| Popup radius | 6px                            | 4px              | 4px                            | 2px              |
| Popup border | 1px, gray 300                  | None             | 1px, gray 300                  | None             |
| Popup shadow | elevation 3                    | elevation 8      | elevation 4                    | elevation 4      |

In all themes, the divider between the toolbar, the content and the footer is gray 300 (gray 200 in Indigo), a link
has the primary color (a lighter shade in dark), and inline code and code blocks have a gray 200 background.

### Developer experience

The API in this section is a proposal. See [API](#api).

#### Basic initialization

```html
<igc-rich-text-editor name="notes" placeholder="Write something, or paste content here"></igc-rich-text-editor>
```

```ts
const editor = document.querySelector('igc-rich-text-editor');

editor.value = '<h2>Release notes</h2><p>Each entry links to its <strong>pull request</strong>.</p>';
editor.addEventListener('igcChange', ({ detail }) => save(detail));
```

#### Value formats

`valueFormat` sets the format of `value`, of the event details and of the submitted form value: `html`, the
default, or `markdown`.

```ts
editor.valueFormat = 'markdown';
editor.value = '## Release notes\n\nEach entry links to its **pull request**.';
```

- The editor keeps the content as a document model. It parses a value into the model and serializes the model into
  the value. The value that the application reads can differ in notation from the value that it set, but both give
  the same document.
- A change of `valueFormat` keeps the document and changes the notation of `value`.
- An empty document has the value `''`. A document is empty when it has only one empty paragraph.
- How Markdown stores the formats that it cannot express is an [open question](#points-raised-by-this-draft).

#### Toolbar configuration

`tools` sets the tools of the toolbar and their order. Each inner array is a group, and a divider separates the
groups. An empty array hides the toolbar.

```ts
editor.tools = [
  ['undo', 'redo'],
  ['blockFormat'],
  ['bold', 'italic', 'underline', 'strikethrough'],
  ['link'],
];
```

The default value is the toolbar of the design. The tool names are `undo`, `redo`, `blockFormat`, `bold`, `italic`,
`underline`, `strikethrough`, `textColor`, `highlight`, `alignLeft`, `alignCenter`, `alignRight`, `alignJustify`,
`bulletedList`, `numberedList`, `outdent`, `indent`, `link`, `image`, `table`, `inlineCode`, `quote`, `codeBlock`,
`horizontalRule` and `clearFormatting`.

A format whose tool is not in the toolbar stays available through its keyboard shortcut and its Markdown pattern.
The configuration API has no design yet. This is a first proposal.

#### Links

- Insert link opens the link editor with a Link input and a Text input. Apply adds the link.
- While the caret is in a link, the link bubble shows the URL and three actions: open, edit and remove.
- A URL that the user types becomes a link when the user types a space or presses <kbd>Enter</kbd> after it.
- A URL that the user pastes becomes a link. A URL that the user pastes over selected text links that text.
- A link in the content does not navigate on a plain click while the editor is editable. The user opens it from the
  link bubble.

#### Images

- Insert image adds an image by its URL, with alternative text.
- A pasted or dropped image file goes through the upload hook. The hook receives the file and returns the URL of
  the image.

```ts
editor.imageUploader = async (file: File) => {
  const response = await fetch('/api/images', { method: 'POST', body: file });
  const { url } = await response.json();
  return url;
};
```

The image flow has no design yet. See [Points raised by this draft](#points-raised-by-this-draft).

#### Tables

- Insert table opens the table picker. The user marks the number of columns and rows.
- While the caret is in a cell, the table toolbar shows the table actions.
- <kbd>Tab</kbd> and <kbd>Shift</kbd> + <kbd>Tab</kbd> move between the cells.
- The first row of a new table is a header row, as in the design.

#### Paste and sanitization

- The editor converts pasted HTML into the document model. Only the elements, attributes and styles of the model
  remain. The structure stays: headings, lists, links, tables and inline formats. Fonts, sizes, class names and
  layout styles of the source are dropped.
- The same conversion applies to a value that the application sets.
- A script, an event handler attribute and a URL with an unsafe protocol, such as `javascript:`, never reach the
  content.
- Pasted plain text becomes paragraphs.
- Whether the application can replace the sanitization is an [open point](#points-raised-by-this-draft).

#### Forms and validation

The editor is a form-associated control, as [the text area](../textarea/spec.md) is. It submits its value under
`name`, restores its default value on a form reset, and takes part in constraint validation.

| Constraint  | Validity flag  | Rule |
| ----------- | -------------- | ---- |
| `required`  | `valueMissing` | The document is empty. |
| `maxLength` | `tooLong`      | The text of the document has more characters than the limit. |

- The character count is the number of characters of the text, not of the HTML or Markdown value.
- `maxLength` is a validation rule. It does not stop the user from typing or pasting. The footer shows the count
  against the limit.
- The invalid styles show after the control is touched, as in the other form controls.
- The `helper-text`, `value-missing`, `too-long`, `custom-error` and `invalid` slots set the messages.

#### Read-only and disabled

- **Read-only**: the toolbar and the contextual toolbars are hidden, and the content cannot be edited. The user can
  focus, select and copy the content. The form submits the value.
- **Disabled**: the toolbar stays, with every tool disabled. The content cannot be focused or edited. The control is
  not validated, and the form does not submit its value.

### Localization

The editor takes its strings from the `igniteui-i18n-core` package through the `locale` and `resourceStrings`
properties, as the other localized components do. The strings do not exist in that package yet. The table has the
English strings of the design. The keys are set when the strings are added.

| Area               | English strings |
| ------------------ | --------------- |
| Toolbar names      | Formatting, Selection formatting, Table |
| History            | Undo, Redo |
| Block format       | Block format, Paragraph, Heading 1, Heading 2, Heading 3, Quote, Code block |
| Inline format      | Bold, Italic, Underline, Strikethrough, Inline code, Clear formatting |
| Color              | Text color, Highlight, Automatic, More colors, Color {0} |
| Alignment          | Align left, Align center, Align right, Justify |
| Lists and indent   | Bulleted list, Numbered list, Decrease indent, Increase indent |
| Insert             | Insert link, Insert image, Insert table, Horizontal rule, More formatting |
| Link               | Link, Text, Open link, Edit link, Remove link, Cancel, Apply |
| Table              | {0} columns by {1} rows, Insert row below, Insert column right, Merge cells, Delete table |
| Footer             | {0} words, {0} characters, {0} / {1} characters |

The placeholder and the validation messages come from the application.

### Keyboard interactions

The keyboard model is a proposal. On macOS, <kbd>Cmd</kbd> replaces <kbd>Ctrl</kbd>.

| Keys | Context | Description |
| ---- | ------- | ----------- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | page | The toolbar is one tab stop, and the content area is one tab stop. |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | toolbar | Moves the focus to the previous or the next tool. In RTL, the directions swap. |
| <kbd>Home</kbd> / <kbd>End</kbd> | toolbar | Moves the focus to the first or the last tool. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | tool | Activates the tool, or opens its popup. |
| <kbd>Escape</kbd> | popup | Closes the popup and returns the focus to its tool. |
| <kbd>Escape</kbd> | toolbar, contextual toolbar | Returns the focus to the content area. The selection stays. |
| <kbd>Alt</kbd> + <kbd>F10</kbd> | content area | Moves the focus to the contextual toolbar that shows, else to the toolbar. |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> / <kbd>I</kbd> / <kbd>U</kbd> | content area | Toggles bold, italic or underline. |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | content area | Opens the link editor for the selection or for the link at the caret. |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | content area | Undoes the last change. |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | content area | Redoes the last undone change. |
| <kbd>Enter</kbd> | content area | Starts a new paragraph or a new list item. In an empty list item, it ends the list. |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | content area | Adds a line break in the block. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | list item | Nests the item one level deeper, or one level back. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | table cell | Moves to the next or the previous cell. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | other content | Moves the focus out of the content area. |

Because <kbd>Tab</kbd> edits in a list and in a table, the user leaves the content area from there with
<kbd>Alt</kbd> + <kbd>F10</kbd> and then <kbd>Tab</kbd>. Whether this is sufficient is an
[open point](#points-raised-by-this-draft).

#### Markdown typing shortcuts

The editor converts a pattern when the user completes it. The design shows the `#`, `-`, `1.`, `>` and `**`
patterns. The other patterns are a proposal.

| The user types | At | Result |
| -------------- | -- | ------ |
| `#`, `##` or `###`, then a space | the start of a block | Heading 1, 2 or 3 |
| `-` or `*`, then a space | the start of a block | Bulleted list |
| `1.`, then a space | the start of a block | Numbered list |
| `>`, then a space | the start of a block | Quote |
| Three backticks, then <kbd>Enter</kbd> | the start of a block | Code block |
| `---` | an empty block | Horizontal rule |
| `**text**` | any position | Bold |
| `*text*` or `_text_` | any position | Italic |
| `~~text~~` | any position | Strikethrough |
| `` `text` `` | any position | Inline code |

- An undo right after a conversion restores the typed characters.
- A pattern does not convert in a code block or in inline code.
- A pattern does not convert during an IME composition.

## API

The API is a proposal. It becomes final after the answers to the [open questions](#open-questions), and the tables
then follow the code.

### Properties and attributes

| Property          | Attribute     | Reflected | Type                             | Default           | Description |
| ----------------- | ------------- | --------- | -------------------------------- | ----------------- | ----------- |
| value             | value         | No        | `string`                         | `''`              | The content of the editor, in the format of `valueFormat`. |
| valueFormat       | value-format  | No        | `'html' \| 'markdown'`           | `html`            | The format of the value, of the event details and of the submitted form value. |
| placeholder       | placeholder   | No        | `string`                         | -                 | The text that shows while the editor is empty. |
| maxLength         | maxlength     | No        | `number`                         | -                 | The maximum number of characters of the text. The footer shows the count against it. |
| readOnly          | readonly      | Yes       | `boolean`                        | false             | Whether the control is read-only. |
| required          | required      | Yes       | `boolean`                        | false             | Whether the control is required. A required control that has no value fails validation. |
| disabled          | disabled      | Yes       | `boolean`                        | false             | Whether the control is disabled. A disabled control is not validated, and the form does not submit its value. |
| invalid           | invalid       | No        | `boolean`                        | false             | Whether the control shows the invalid state. It changes only the visual state, not the validity. |
| name              | name          | Yes       | `string`                         | -                 | The name of the control, submitted with the form data. |
| tools             | -             | No        | `IgcRichTextEditorTool[][]`      | The design toolbar | The tools of the toolbar, in groups. An empty array hides the toolbar. |
| imageUploader     | -             | No        | `(file: File) => Promise<string>` | -                | The function that uploads a pasted or dropped image and returns its URL. |
| locale            | locale        | No        | `string`                         | global            | The locale of the resource strings. |
| resourceStrings   | -             | No        | `IRichTextEditorResourceStrings` | English           | The resource strings of the component. |
| defaultValue      | -             | No        | `string`                         | `''`              | The default value of the control. A form reset restores the value to it. |
| form              | -             | No        | `HTMLFormElement \| null`        | -                 | Read-only. The form that the control is associated with, or `null`. |
| validity          | -             | No        | `ValidityState`                  | -                 | Read-only. The validity state of the control. |
| validationMessage | -             | No        | `string`                         | -                 | Read-only. The validation message of the control. It is empty when the control is valid. |
| willValidate      | -             | No        | `boolean`                        | -                 | Read-only. Whether the control is a candidate for constraint validation. |

`IgcRichTextEditorTool` is the union of the tool names in [Toolbar configuration](#toolbar-configuration).

### Methods

| Name              | Type signature                   | Description |
| ----------------- | -------------------------------- | ----------- |
| focus             | `(options?: FocusOptions): void` | Sets focus on the content area. |
| blur              | `(): void`                       | Removes focus from the control. |
| undo              | `(): void`                       | Undoes the last change. |
| redo              | `(): void`                       | Redoes the last undone change. |
| checkValidity     | `(): boolean`                    | Checks validity and emits `invalid` when the control is invalid. Returns `true` when the control is valid. |
| reportValidity    | `(): boolean`                    | Checks validity. An invalid control emits `invalid`, takes the focus and shows its validation message. Returns `true` when the control is valid. |
| setCustomValidity | `(message: string): void`        | Sets a custom validation message. The control is invalid while the message is not empty. |

A method that runs a formatting command from the code of the application belongs to the engine question. It is not
in this proposal.

### Events

| Name      | Cancellable | Detail   | Description |
| --------- | ----------- | -------- | ----------- |
| igcInput  | false       | `string` | Emitted when the user changes the content. |
| igcChange | false       | `string` | Emitted when the user commits a change: the control loses the focus with a value that differs from the value at the focus. |

The detail is the value in the format of `valueFormat`. The events of the components in the toolbar and in the
popups stay inside the editor.

### Slots

| Name            | Description |
| --------------- | ----------- |
| `helper-text`   | Renders content below the editor. |
| `value-missing` | Renders content when the required validation fails. |
| `too-long`      | Renders content when the maxlength validation fails. |
| `custom-error`  | Renders content when a custom message is set with `setCustomValidity()`. |
| `invalid`       | Renders content when the component is in the invalid state. |

### CSS Shadow parts

| Part          | Description |
| ------------- | ----------- |
| `container`   | The frame around the toolbar, the content area and the footer. |
| `toolbar`     | The toolbar. |
| `content`     | The content area. It is a part only if the editable area is in the shadow root. |
| `footer`      | The footer. |
| `block-type`  | The block type in the footer. |
| `count`       | The word and character counts in the footer. |
| `helper-text` | The helper text wrapper. |

The parts of the popups and of the contextual toolbars follow their design.

## Test scenarios

There is no suite yet. The scenarios are written together with the tests, one subsection for each `describe` block.

The suite must cover at least:

- the a11y audit, in each state;
- the default values, the properties and the attributes;
- each formatting tool, with the pointer, with the keyboard shortcut and with the Markdown pattern;
- the toolbar, the popups and the contextual toolbars with the keyboard;
- undo and redo;
- the HTML and Markdown values, with property-based tests of the parsers and the serializers (`*.property.spec.ts`):
  a round trip keeps the document, and no input throws;
- the sanitization of pasted content and of a value set from code, with property-based tests: no script, event
  handler or unsafe URL reaches the content;
- the form integration, with `createFormAssociatedTestBed` and the shared label and validation suites;
- IME composition;
- the Right-to-Left layout and the localized strings.

## Assumptions and limitations

- Nothing in this specification is implemented.
- The editor adds no runtime dependency. This follows from the proposed engine.
- The editor is a form control for formatted text. It is not a word processor: see the out of scope row in
  [Scope](#scope).
- The browser checks the spelling. The editor has no spell checker of its own.
- The Markdown value cannot express every format. See [Points raised by this draft](#points-raised-by-this-draft).
- `maxLength` does not restrict the input, which differs from [the text area](../textarea/spec.md). To truncate
  formatted content at a character position gives a result that the user does not expect.
- The theme schema, the resource strings and the icons need changes in other packages before the implementation can
  use them.
- The design file embeds a build of the library from the date of the design. It is a reference for review, and no
  build publishes it.

## Accessibility

### ARIA roles and properties

The roles are a proposal.

- The content area has the `textbox` role and `aria-multiline="true"`. Its name comes from the host
  `aria-labelledby`, an external `<label>` or the host `aria-label`. It exposes `aria-placeholder`,
  `aria-readonly`, `aria-required`, `aria-invalid` and `aria-disabled`, and the helper text describes it.
- The toolbar has the `toolbar` role and a localized name (`Formatting`), and it references the content area with
  `aria-controls`. The selection toolbar (`Selection formatting`) and the table toolbar (`Table`) have the same
  role.
- A toolbar is one tab stop with a roving tab index.
- Each tool has a localized name. A toggle tool exposes `aria-pressed`. A tool that opens a popup exposes
  `aria-haspopup` and `aria-expanded`.
- The block format menu and the More menu are `igc-dropdown` lists. See
  [the dropdown](../dropdown/spec.md).
- Each swatch of the color palette is a button with a name. The design names a swatch by its hex value. A color
  name is easier to understand.
- The table picker must work with the keyboard, and it must announce the size that the user marks. In the design,
  its cells are not focusable.
- An image has alternative text. The image flow asks for it.
- A contextual toolbar does not take the focus when it shows. The user reaches it with
  <kbd>Alt</kbd> + <kbd>F10</kbd>.
- With a character limit, the editor announces the count politely when the user comes near the limit and passes it,
  not on each keystroke.
- The invalid state does not depend on color alone: the helper text states the error.
- The frame, the focus ring, the placeholder and the disabled state are not audited for contrast yet. Each must meet
  the WCAG 2.1 AA contrast ratios in the four themes, in light and in dark.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

- The toolbar, the footer and the popups follow the direction of the host. The tool order mirrors.
- The content takes the direction of the host. The default alignment of a block is the start side.
- Align left and Align right are physical: they keep their meaning in RTL.
- The indent, the list markers and the quote border are on the start side.
- The Decrease indent and Increase indent icons mirror in RTL.

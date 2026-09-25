# Chat specification

- [Chat specification](#chat-specification)
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
      - [Component structure](#component-structure)
      - [Basic initialization](#basic-initialization)
      - [Messages and the draft message](#messages-and-the-draft-message)
      - [Options](#options)
      - [Attachments](#attachments)
      - [Suggestions](#suggestions)
      - [Custom renderers](#custom-renderers)
      - [Message content and sanitization](#message-content-and-sanitization)
      - [Adopting the document styles](#adopting-the-document-styles)
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
    - [Slots tests](#slots-tests)
    - [Templates](#templates)
    - [Click](#click)
    - [Drag and drop](#drag-and-drop)
    - [Keyboard](#keyboard)
    - [Events tests](#events-tests)
    - [Adopted root styles](#adopted-root-styles)
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
|       2 | 2026-09-23 | Remove the `prefix` and `title` parts and add the `input-container` part |

## Overview

The `igc-chat` renders a chat interface: a header, a scrollable list of messages, an optional set of quick reply
suggestions and a composer with a growing text area, a file picker and a send button. It holds no transport of its
own — the application owns the message collection and reacts to the events of the component.

```html
<igc-chat></igc-chat>
```

```ts
const chat = document.querySelector('igc-chat');

chat.options = { currentUserId: 'me', headerText: 'Support' };
chat.messages = [{ id: '1', text: 'Hello', sender: 'them' }];

chat.addEventListener('igcMessageCreated', ({ detail }) => send(detail));
```

### Key features

- **Message list** in chronological order, with the messages of the current user styled apart, and automatic
  scrolling to the newest one.
- **Composer** with a text area that grows with its content, sending on <kbd>Enter</kbd> and a new line on
  <kbd>Shift</kbd> + <kbd>Enter</kbd>.
- **Attachments** through the file picker and through drag and drop, with previews before sending and an accepted
  file type filter.
- **Quick reply suggestions**, rendered below the messages or below the input, which send on click.
- **Typing indicator** for the other side, and a typing state for the local user with a configurable idle delay.
- **Message actions**: copy, like, dislike and regenerate.
- **Markdown rendering** with sanitized output.
- **Custom renderers** for almost every region of the component, and slots for the header, the suggestions and the
  empty state.

### Acceptance criteria

- The component must render a message history and let the user compose and send a message with the keyboard and
  with the pointer.
- Sending must be preventable, so that the application can validate or reject a message.
- Attachments must be addable from the file picker and by dropping files, limited to the accepted types, and
  removable before the message is sent.
- Every user-facing string must be localizable, and the layout must work in both directions.
- Unexpected input, such as an empty message or a rejected file type, must not break the component.
- The element must be integrated and themeable with the theming mechanism of the library.
- The element must be WAI-ARIA compliant and support RTL layouts without additional configuration.

## User stories

### End-user stories

As an end-user, I expect to be able to:

- write a multi-line message and send it with <kbd>Enter</kbd> or with the send button;
- see my message appear in the list as soon as I send it;
- keep an unsent message while I do something else in the page;
- read the messages in order, with the sender and the time, and tell my own messages from the others;
- have the list follow the newest message, unless I scrolled away from the bottom;
- see that the other side is typing, and see the indicator disappear afterwards;
- attach a file, see it before I send it, and remove it if I picked the wrong one;
- pick a quick reply and have it sent right away;
- copy a message, and react to it with a like or a dislike;
- use the whole component with the keyboard alone.

### Developer stories

As a developer, I expect to be able to:

- own the message collection and set it from my own transport;
- be notified when a message is created and be able to reject it;
- be notified when attachments are added, removed, dragged, dropped or clicked;
- be notified when the user starts and stops typing, and control how long the idle delay is;
- show a typing indicator for the other side;
- restrict the accepted file types, or turn attachments off entirely;
- provide quick reply suggestions and choose where they are rendered;
- replace any region of the component with my own renderer, and project content in the header;
- style the component through its parts, and scroll to a specific message from code;
- be sure the rendered message content is sanitized.

## Functionality

### End-user experience

Figma specification:

1. [Material light](https://www.figma.com/design/yXNLb6Yfxzu4S3ruqkcvg7/AI-Chat-Component---Material-Theme?node-id=1-10336&m=dev)
2. [Indigo theme](https://www.figma.com/design/oyCqNZd4VJlNjnxvMC7dAW/AI-Chat-Component---Indigo-Theme?node-id=1-10336&m=dev)
3. [Bootstrap](https://www.figma.com/design/bulROSTu5FiC8ui4yd9zzv/AI-Chat-Component---Bootstrap-Theme?node-id=1-10336&m=dev)
4. [Fluent](https://www.figma.com/design/4qeEuCoAefRvfIHMv17BuA/AI-Chat-Component---Fluent-Theme?node-id=1-10336&m=dev)

### Developer experience

#### Component structure

```text
|─────────────────────────────────────────────|
│ [prefix] Title                    [actions] │
├─────────────────────────────────────────────┤
│             Chat message area               │
│  [message] [message] [message] ...          │
│  [suggestions]                              │
├─────────────────────────────────────────────┤
│ [attachment chips]                          │
│ [file] [ Input field            ] [ Send ]  │
|─────────────────────────────────────────────|
```

#### Basic initialization

```html
<igc-chat .messages=${messages} .options=${options}></igc-chat>
```

#### Messages and the draft message

`messages` is the whole history, as an array of `IgcChatMessage` objects with an `id`, a `text`, a `sender` and
optionally a `timestamp`, `attachments` and `reactions`. A message whose `sender` equals `options.currentUserId`
is rendered as an outgoing one.

`draftMessage` is the message being composed, with its text and its attachments. It can be read to persist an
unsent message and written to restore one.

Sending emits a cancelable `igcMessageCreated` with the new message; the component appends it to `messages` unless
the event is canceled. `scrollToMessage(id)` brings a specific message into view.

#### Options

Everything configurable lives on the `options` object rather than on separate attributes.

```ts
chat.options = {
  currentUserId: 'me',
  headerText: 'Support',
  inputPlaceholder: 'Type a message…',
  acceptedFiles: 'image/*,.pdf',
  disableInputAttachments: false,
  disableAutoScroll: false,
  isTyping: false,
  stopTypingDelay: 3000,
  suggestions: ['Yes', 'No'],
  suggestionsPosition: 'below-messages',
};
```

#### Attachments

Unless `disableInputAttachments` is set, the composer renders a file picker and accepts dropped files. The
`acceptedFiles` option is forwarded to the underlying file input and also filters what a drop accepts. Adding and
removing attachments emits the cancelable `igcAttachmentAdded` and `igcAttachmentRemoved`, the drag operation
emits `igcAttachmentDrag` and `igcAttachmentDrop`, and a click on an attachment of a sent message emits
`igcAttachmentClick`.

#### Suggestions

`options.suggestions` renders a list of quick replies. Clicking one sends it as a message immediately. Their
position follows `suggestionsPosition`, either `below-messages`, the default, or `below-input`. The
`suggestions`, `suggestions-header`, `suggestions-actions` and `suggestion` slots replace the rendered list.

#### Custom renderers

`options.renderers` holds a renderer per region. Each one receives a context object with the chat instance, and
for the message and attachment renderers also the message and the attachment, and returns a template.

```ts
chat.options = {
  renderers: {
    messageContent: ({ message }) => html`<b>${message.text}</b>`,
    sendButton: () => html`<igc-button>Send</igc-button>`,
  },
};
```

The available renderers are `message`, `messageHeader`, `messageContent`, `messageActions`, `messageAttachments`,
`attachment`, `attachmentHeader`, `attachmentContent`, `input`, `inputActions`, `inputActionsStart`,
`inputActionsEnd`, `inputAttachments`, `fileUploadButton`, `sendButton` and `suggestionPrefix`.

#### Message content and sanitization

The text of a message is sanitized with DOMPurify before it is rendered, and can be rendered through a markdown
renderer. Sanitization is not optional and applies to the default rendering path.

#### Adopting the document styles

`options.adoptRootStyles` copies the stylesheets of the document into the shadow root of the component, so that
content produced by a custom renderer inherits the page styles. It is a last resort: it breaks encapsulation and
lets global styles leak into the component. The parts API, a linked stylesheet or an inline `<style>` in the
template are the recommended paths. The adoption keeps up with the document, so stylesheets added, populated or
removed later are handled, as is a theme change and a reconnect of the host.

### Localization

The chat takes its resource strings from the `igniteui-i18n-core` package through the `resourceStrings` property.

| Key                         | Default English value        | Used for                                    |
| --------------------------- | ---------------------------- | ------------------------------------------- |
| `chat_suggestions_header`   | Suggestions                  | The header of the suggestions list.          |
| `chat_reaction_copy`        | Copy                         | The copy action of a message.                |
| `chat_reaction_like`        | Like                         | The like action of a message.                |
| `chat_reaction_dislike`     | Dislike                      | The dislike action of a message.             |
| `chat_reaction_regenerate`  | Regenerate                   | The regenerate action of a message.          |
| `chat_attachment_label`     | Attachment                   | The label of a single attachment.            |
| `chat_attachments_list_label` | Attachments                | The label of the attachments list.           |
| `chat_message_copied`       | Message copied to clipboard  | The confirmation shown after a copy.         |

The older `IgcChatResourceStrings` interface is deprecated since 7.2.0 in favor of `IChatResourceStrings` and the
global `registerI18n` mechanism, and both shapes are accepted by the property.

### Keyboard interactions

| Keys                                  | Context           | Description                                                 |
| ------------------------------------- | ----------------- | ----------------------------------------------------------- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | anywhere | Moves between the header actions, the message list, the file picker, the text area, the send button and the attachment chips. |
| <kbd>Enter</kbd>                      | text area         | Sends the composed message.                                  |
| <kbd>Shift</kbd> + <kbd>Enter</kbd>   | text area         | Inserts a new line instead of sending.                        |
| <kbd>Enter</kbd> / <kbd>Space</kbd>   | suggestion, send button, message action | Activates the control.                 |

## API

### Properties and attributes

`igc-chat` is configured through properties only; it has no attributes of its own.

| Property          | Type                                              | Default | Description                                                     |
| ----------------- | ------------------------------------------------- | ------- | --------------------------------------------------------------- |
| `messages`        | `IgcChatMessage[]`                                | `[]`    | The messages currently displayed.                                |
| `draftMessage`    | `IgcChatDraftMessage`                             | —       | The message being composed, with its text and its attachments.   |
| `options`         | `IgcChatOptions \| undefined`                     | —       | The behavior and appearance configuration of the chat.           |
| `resourceStrings` | `IChatResourceStrings`                            | English | The resource strings of the component.                            |

`IgcChatOptions`

| Option                    | Type                                       | Default           | Description                                                  |
| ------------------------- | ------------------------------------------ | ----------------- | ------------------------------------------------------------ |
| `currentUserId`           | `string`                                   | —                 | The sender that is treated as the local user.                 |
| `headerText`              | `string`                                   | —                 | The title rendered in the header.                             |
| `inputPlaceholder`        | `string`                                   | —                 | The placeholder of the composer.                              |
| `acceptedFiles`           | `string`                                   | —                 | The accepted file types of the file picker.                   |
| `disableInputAttachments` | `boolean`                                  | `false`           | Turns attachments off.                                        |
| `disableAutoScroll`       | `boolean`                                  | `false`           | Stops the list from scrolling to the newest message.          |
| `isTyping`                | `boolean`                                  | `false`           | Shows the typing indicator of the other side.                 |
| `stopTypingDelay`         | `number`                                   | `3000`            | The idle time before the typing state is reported as stopped. |
| `suggestions`             | `string[]`                                 | —                 | The quick replies to render.                                  |
| `suggestionsPosition`     | `"below-messages" \| "below-input"`        | `below-messages`  | Where the quick replies are rendered.                         |
| `adoptRootStyles`         | `boolean`                                  | `false`           | Copies the document stylesheets into the shadow root.         |
| `renderers`               | `ChatRenderers`                            | —                 | The custom renderers per region.                              |

### Methods

| Method            | Signature                        | Description                               |
| ----------------- | -------------------------------- | ----------------------------------------- |
| `scrollToMessage` | `(messageId: string): void`      | Scrolls the list to the given message.     |

### Events

| Event                  | Detail                        | Cancelable | Description                                                     |
| ---------------------- | ----------------------------- | ---------- | --------------------------------------------------------------- |
| `igcMessageCreated`    | `IgcChatMessage`              | yes        | A message was composed and sent.                                 |
| `igcMessageReact`      | `IgcChatMessageReaction`      | no         | A message was reacted to.                                        |
| `igcAttachmentAdded`   | `IgcChatMessageAttachment[]`  | yes        | Attachments were added, by the picker or by a drop.              |
| `igcAttachmentRemoved` | `IgcChatMessageAttachment`    | yes        | An attachment was removed by the user.                           |
| `igcAttachmentClick`   | `IgcChatMessageAttachment`    | no         | An attachment of a message was clicked.                          |
| `igcAttachmentDrag`    | —                             | no         | A file is being dragged over the composer.                       |
| `igcAttachmentDrop`    | —                             | no         | A file was dropped into the composer.                            |
| `igcTypingChange`      | `boolean`                     | no         | The typing state of the local user changed.                      |
| `igcInputFocus`        | —                             | no         | The composer received focus.                                     |
| `igcInputBlur`         | —                             | no         | The composer lost focus.                                         |
| `igcInputChange`       | `string`                      | no         | The content of the composer changed.                             |

### Slots

| Name                  | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `prefix`              | Content before the title, such as an avatar or an icon.      |
| `title`               | The title of the header.                                     |
| `actions`             | The actions of the header.                                   |
| `suggestions-header`  | The header of the suggestions list.                          |
| `suggestions`         | The whole suggestions list.                                  |
| `suggestions-actions` | Additional actions next to the suggestions.                  |
| `suggestion`          | A single suggestion.                                         |
| `empty-state`         | The content shown while there are no messages.               |
| `typing-indicator`    | The typing indicator of the other side.                      |

### CSS Shadow parts

The component exposes a part for every region it renders. The main groups are:

| Group       | Parts                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Container   | `chat-container`, `header`, `message-area-container`, `empty-state`                                          |
| Messages    | `message-list`, `message-item`, `message-container`, `message-header`, `message-content`, `message-sent`, `message-actions-container`, `message-attachments-container`, `message-attachment` |
| Typing      | `typing-indicator`, `typing-dot`                                                                               |
| Suggestions | `suggestions-container`, `suggestions-header`, `suggestion`, `suggestion-prefix`, `suggestion-title`           |
| Composer    | `input-area-container`, `input-area`, `input-container`, `text-input`, `input-actions-container`, `input-actions-start`, `input-actions-end`, `file-upload-container`, `file-upload`, `send-button-container`, `send-button` |
| Attachments | `input-attachments-container`, `input-attachment-container`, `input-attachment-name`, `input-attachment-icon`, `attachment-header`, `attachment-content`, `attachment-icon`, `file-name` |

## Test scenarios

| Suite  | File           |
| ------ | -------------- |
| `Chat` | `chat.spec.ts` |

### Initialization

1. The component is initialized with its default state, and an empty chat renders correctly.
2. Initially set messages render, and the messages of the current user render differently.
3. The message in `draftMessage` renders in the composer.
4. `headerText` and `inputPlaceholder` are applied.
5. The send button is enabled and disabled according to the composed content.
6. `disableInputAttachments` removes the attachment button, and `acceptedFiles` reaches the file input.
7. The attachment chips render for the composed attachments.
8. The suggestions container is rendered only when suggestions are provided, and follows
   `suggestionsPosition` for the empty state, below the messages and below the input.
9. `isTyping` renders the typing indicator.

### Slots tests

10. The `prefix`, `title` and `actions` slots of the header accept content.
11. The `empty-state`, `suggestions-header`, `suggestions` and `suggestions-actions` slots accept content.

### Templates

12. The `attachment`, `attachmentHeader` and `attachmentContent` renderers are used.
13. The `message`, `messageHeader`, `messageContent` and `messageActions` renderers are used.
14. The typing indicator and the text area renderers are used.

### Click

15. The send button appends the composed message to the list.
16. A click on a suggestion sends it as a message.
17. The remove button of an attachment chip removes it, and removing every attachment disables the send button.
18. The like and dislike actions toggle their state, and the copy action copies the message.

### Drag and drop

19. Files are dropped into the composer, filtered by the types listed in `acceptedFiles`.

### Keyboard

20. <kbd>Enter</kbd> in the focused text area sends the composed message.

### Events tests

21. `igcAttachmentClick`, `igcInputFocus`, `igcInputBlur`, `igcInputChange` and `igcMessageReact` are emitted.
22. `igcTypingChange` is emitted for the start and the stop of typing, is emitted after a message is sent, is not
    emitted for <kbd>Tab</kbd>, and its stop is deferred when `stopTypingDelay` grows while the timer runs.
23. `igcMessageCreated` and the attachment change event can be canceled.

### Adopted root styles

24. `adoptRootStyles` adopts the document stylesheets when set and skips them when not, and re-applies them after
    a theme change.
25. Toggling the option in both directions adopts and removes the styles, including over several toggles.
26. Stylesheets added to the document afterwards are adopted, including one appended empty and populated later,
    and one populated through the CSSOM on the next synchronization.
27. Removing a stylesheet from the document removes its adopted copy, the component styles are not dropped by the
    adoption, and reconnecting the host re-adopts the document styles.

### Not covered by the suite

- Automatic scrolling, `disableAutoScroll` and `scrollToMessage` are not covered.
- Markdown rendering and the sanitization of the message content are not covered by the component suite.
- The `locale` fallback and the localized strings are not asserted; the suite runs against the English defaults.
- Keyboard navigation inside the message list is neither implemented nor covered.

## Assumptions and limitations

- The component is stateless with respect to the transport. It does not send, receive, retry or persist anything;
  the application owns `messages` and reacts to the events.
- The message list is not virtualized, so a very long history is rendered in full.
- There is no message status, no avatar handling, no emoji picker, no URL preview, no search and no contextual
  menu. These are planned and not part of this version.
- The message list is a single tab stop and has no arrow key navigation between the messages.
- `adoptRootStyles` intentionally breaks shadow DOM encapsulation and is documented as a last resort.
- Sanitization protects the rendered content, but an application that supplies its own renderers is responsible
  for what those render.

## Accessibility

### ARIA roles and properties

- The message list is a focusable scroll container, so that the history can be reached and scrolled with the
  keyboard alone.
- The composer text area, the file picker, the upload button and the send button each carry their own label.
- The attachment chips of the composer form a labelled list, with each chip a list item.
- An attachment of a sent message is exposed as a button, since clicking it emits `igcAttachmentClick`.
- The message actions are icon buttons with the localized copy, like, dislike and regenerate labels, and the copy
  action confirms itself through a tooltip.

### Keyboard support

Already covered by the [relevant section of the specification](#keyboard-interactions).

### Right to Left support

The component works in a Right-to-Left context without additional setup or configuration.

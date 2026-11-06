# igc-chat

A chat UI component for displaying messages, attachments, and input interaction.

```ts
import { defineComponents, IgcChatComponent } from 'igniteui-webcomponents';

defineComponents(IgcChatComponent);
```

## Properties

- `messages`: `IgcChatMessage[]`. No attribute.
  The list of chat messages currently displayed.
  Use this property to set or update the message history.
- `draftMessage`: `IgcChatDraftMessage`. No attribute.
  The chat message currently being composed but not yet sent.
  Includes the draft text and any attachments.
- `options`: `IgcChatOptions | undefined`. No attribute.
  The configuration object of the chat: behavior and appearance options,
  suggestions and custom renderers.
- `resourceStrings`: `IgcChatResourceStrings & IChatResourceStrings`. No attribute.
  The resource strings of the chat.
- `locale`: `string`. Attribute: `locale`.
  The locale of the component. Without it, the component takes its own
  `lang`, else the locale of the nearest ancestor that has a `locale` (a
  component) or a `lang`, and then the global locale.

## Methods

- `scrollToMessage(messageId: string): void`
  Scrolls the view to a specific message by id.
- `focusInput(options?: FocusOptions): Promise<void>`
  Moves the focus to the text area of the chat input, after the first render
  of a new chat. The promise resolves when the focus moves. A disconnected
  chat does not wait. Does nothing when a custom `input` renderer replaces
  the text area.

## Events

- `igcMessageCreated`
  Dispatched when the user sends a message, also with a click on a suggestion. Cancelable: a canceled event does not add the message.
- `igcMessageReact`
  Dispatched when the user clicks an action button of a message, for example like or copy.
- `igcAttachmentClick`
  Dispatched when the user clicks the header of a message attachment.
- `igcNavigate`
  Dispatched when a plain click or Enter opens a link in a message in the same tab, before the browser navigates. Cancel it to route on the client. Does not bubble.
- `igcAttachmentAdded`
  Dispatched when the user adds attachments with drag and drop or with the default file input. Cancelable: a canceled event does not add them.
- `igcAttachmentRemoved`
  Dispatched when the user removes an attachment from the input. Cancelable: a canceled event keeps the attachment.
- `igcAttachmentDrag`
  Dispatched when the user drags files into the input area.
- `igcAttachmentDrop`
  Dispatched when the user drops files on the input area.
- `igcTypingChange`
  Dispatched when the user starts or stops typing. The detail is `true` while the user types.
- `igcInputFocus`
  Dispatched when the chat input field gains focus.
- `igcInputBlur`
  Dispatched when the chat input field loses focus.
- `igcInputChange`
  Dispatched when the content of the chat input changes.

## Slots

- `prefix`: Content before the title, such as an avatar or an icon.
- `title`: The title of the header.
- `actions`: The actions of the header.
- `suggestions-header`: The header of the suggestions list.
- `suggestions`: The whole suggestions list.
- `suggestions-actions`: Additional actions next to the suggestions.
- `suggestion`: Suggestions that replace the default items.
- `empty-state`: The content shown while there are no messages.
- `typing-indicator`: The typing indicator of the other side.

## CSS parts

- `chat-container`: Styles the main chat container.
- `header`: Styles the chat header container.
- `message-area-container`: Styles the container holding the messages and (optional) suggestions.
- `message-list`: Styles the message list container.
- `message-item`: Styles each message wrapper.
- `typing-indicator`: Styles the typing indicator container.
- `typing-dot`: Styles individual typing indicator dots.
- `suggestions-container`: Styles the container holding all suggestions.
- `suggestions-header`: Styles the suggestions header.
- `suggestion`: Styles each suggestion item.
- `suggestion-prefix`: Styles the icon or prefix in a suggestion.
- `suggestion-title`: Styles the text/title of a suggestion.
- `empty-state`: Styles the empty state container when there are no messages.
- `input-area-container`: Styles the wrapper around the chat input area.
- `input-area`: Styles the input area: the attachments, the text input and the actions.
- `input-container`: Styles the wrapper around the text input.
- `input-attachments-container`: Styles the container for attachments in the input.
- `input-attachment-container`: Styles a single attachment in the input area.
- `input-attachment-name`: Styles the file name of an attachment.
- `input-attachment-icon`: Styles the icon of an attachment.
- `text-input`: Styles the text input field for typing messages.
- `input-actions-container`: Styles the container for input actions.
- `input-actions-start`: Styles the group of actions at the start of the input after the default file upload.
- `input-actions-end`: Styles the group of actions at the end of the input.
- `file-upload-container`: Styles the container for the file upload input.
- `file-upload`: Styles the label that holds the file upload button and the file input.
- `send-button-container`: Styles the container around the send button.
- `send-button`: Styles the send button.
- `message-container`: Styles the container of a single message.
- `message-header`: Styles the header of a message. The header is empty without a `messageHeader` renderer.
- `message-content`: Styles the text content of a message.
- `message-attachments-container`: Styles the container for message attachments.
- `message-attachment`: Styles a single message attachment.
- `message-actions-container`: Styles the container holding message actions.
- `message-sent`: Added to the message container of a message from the current user.
- `attachment-header`: Styles the header of an attachment block.
- `attachment-content`: Styles the content of an attachment block.
- `attachment-icon`: Styles the icon of an attachment.
- `file-name`: Styles the file name shown in an attachment.

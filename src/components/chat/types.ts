import type IgcChatComponent from './chat.js';

/**
 * Represents a single chat message in the conversation.
 */
export interface IgcChatMessage {
  /**
   * A unique identifier for the message.
   */
  id: string;

  /**
   * The textual content of the message.
   */
  text: string;

  /**
   * The identifier or name of the sender of the message.
   */
  sender: string;

  /**
   * The timestamp indicating when the message was sent.
   */
  timestamp?: string;

  /**
   * Optional list of attachments associated with the message,
   * such as images, files, or links.
   */
  attachments?: IgcChatMessageAttachment[];

  /**
   * Optional list of reactions associated with the message.
   */
  reactions?: string[];
}

/**
 * Represents an attachment associated with a chat message.
 */
export interface IgcChatMessageAttachment {
  /**
   * A unique identifier for the attachment.
   */
  id: string;

  /**
   * The display name of the attachment (e.g. file name).
   */
  name: string;

  /**
   * The URL from which the attachment can be downloaded or viewed.
   * Typically used for attachments stored on a server or CDN.
   */
  url?: string;

  /**
   * The actual File object, if the attachment was provided locally (e.g. via upload).
   */
  file?: File;

  /**
   * The MIME type or a custom type identifier for the attachment (e.g. "image/png", "pdf", "audio").
   */
  type?: string;

  /**
   * Optional URL to a thumbnail preview of the attachment (e.g. for images or videos).
   */
  thumbnail?: string;
}

/**
 * Configuration options for customizing the behavior and appearance of the chat component.
 */
export type IgcChatOptions = {
  /**
   * The ID of the current user. Used to differentiate between incoming and outgoing messages.
   */
  currentUserId?: string;
  /**
   * If `true`, prevents the chat from automatically scrolling to the latest message.
   */
  disableAutoScroll?: boolean;
  /**
   * If `true`, disables the ability to upload and send attachments.
   * Defaults to `false`.
   */
  disableInputAttachments?: boolean;
  /**
   * Indicates whether the other user is currently typing a message.
   */
  isTyping?: boolean;
  /**
   * The accepted files that could be attached.
   * Defines the file types as a list of comma-separated values (e.g. "image/*,.pdf") that the file input should accept.
   */
  acceptedFiles?: string;
  /**
   * Optional header text to display at the top of the chat component.
   */
  headerText?: string;
  /**
   * Optional placeholder text for the chat input area.
   * Provides a hint to the user about what they can type (e.g. "Type a message...").
   */
  inputPlaceholder?: string;
  /**
   * Suggested text snippets or quick replies that can be shown as user-selectable options.
   */
  suggestions?: string[];
  /**
   * Controls the position of the chat suggestions within the component layout.
   *
   * - `"below-input"`: Renders suggestions below the chat input area.
   * - `"below-messages"`: Renders suggestions below the chat messages area.
   *
   * Default is `"below-messages"`.
   */
  suggestionsPosition?: ChatSuggestionsPosition;
  /**
   * Time in milliseconds to wait before dispatching a stop typing event.
   * Default is `3000`.
   */
  stopTypingDelay?: number;

  /**
   * A boolean flag that, when `true`, enables a **quick and dirty workaround** for styling
   * components rendered within the Shadow DOM, from custom message renderers, by allowing them
   * to inherit styles from the document's root. This can be useful for developers who prefer not to handle
   * Shadow DOM encapsulation, but it is **not the recommended approach**.
   *
   * It is highly advised to use standard Web Component styling methods first, in this order:
   *
   * 1.  **CSS Variables and Parts API**: Use the exposed `::part` API with custom CSS variables to style
   * your content in your custom renderers.
   *
   * 2.  **`link` elements**: For larger style sheets, link them directly within the Shadow DOM to maintain
   * encapsulation.
   *
   * 3.  **Inline `<style>` tags**: Use these for small, self-contained styles within a template.
   *
   * This property should be used as a **last resort** as it can lead to **style leakage**, where
   * global styles unexpectedly bleed into the component, breaking encapsulation and causing
   * unpredictable visual issues.
   *
   */
  adoptRootStyles?: boolean;

  /**
   * An object containing a collection of custom renderers for different parts of the chat UI.
   */
  renderers?: ChatRenderers;
};

/**
 * Represents a user's reaction to a specific chat message.
 */
export interface IgcChatMessageReaction {
  /**
   * The chat message that the reaction is associated with.
   */
  message: IgcChatMessage;
  /**
   * The string representation of the reaction, such as an emoji or a string;
   */
  reaction: string;
}

/**
 * A collection of optional rendering functions that allow for custom UI rendering.
 * Each property is a function that takes a context object and returns a template result.
 */
export interface ChatRenderers {
  /**
   * Custom renderer for a single chat message attachment.
   */
  attachment?: ChatTemplateRenderer<ChatAttachmentRenderContext>;
  /**
   * Custom renderer for the content of an attachment.
   */
  attachmentContent?: ChatTemplateRenderer<ChatAttachmentRenderContext>;
  /**
   * Custom renderer for the header of an attachment.
   */
  attachmentHeader?: ChatTemplateRenderer<ChatAttachmentRenderContext>;
  /**
   * Custom renderer for the file upload button in the input area.
   */
  fileUploadButton?: ChatTemplateRenderer<ChatRenderContext>;
  /**
   * Custom renderer for the main chat input field.
   */
  input?: ChatTemplateRenderer<ChatInputRenderContext>;
  /**
   * Custom renderer for the actions container within the input area.
   */
  inputActions?: ChatTemplateRenderer<ChatRenderContext>;
  /**
   * Custom renderer for the actions at the end of the input area.
   */
  inputActionsEnd?: ChatTemplateRenderer<ChatRenderContext>;
  /**
   * Custom renderer for the actions at the start of the input area.
   */
  inputActionsStart?: ChatTemplateRenderer<ChatRenderContext>;
  /**
   * Custom renderer for the attachment previews within the input field.
   */
  inputAttachments?: ChatTemplateRenderer<ChatInputRenderContext>;
  /**
   * Custom renderer for an entire chat message bubble.
   */
  message?: ChatTemplateRenderer<ChatMessageRenderContext>;
  /**
   * Custom renderer for message-specific actions (e.g., reply or delete buttons).
   */
  messageActions?: ChatTemplateRenderer<ChatMessageRenderContext>;
  /**
   * Custom renderer for the attachments associated with a message.
   */
  messageAttachments?: ChatTemplateRenderer<ChatMessageRenderContext>;
  /**
   * Custom renderer for the main text and content of a message.
   */
  messageContent?: ChatTemplateRenderer<ChatMessageRenderContext>;
  /**
   * Custom renderer for the header of a message, including sender and timestamp.
   */
  messageHeader?: ChatTemplateRenderer<ChatMessageRenderContext>;
  /**
   * Custom renderer for the "is typing" indicator.
   *
   * @deprecated since 6.4.0. Use the `typing-indicator` slot.
   */
  typingIndicator?: ChatTemplateRenderer<ChatRenderContext>;
  /**
   * Custom renderer for the message send button.
   */
  sendButton?: ChatTemplateRenderer<ChatRenderContext>;
  /**
   * Custom renderer for the prefix text shown before suggestions.
   */
  suggestionPrefix?: ChatTemplateRenderer<ChatRenderContext>;
}

/**
 * A generic type for a function that serves as a custom renderer.
 * It takes a context object of type T and returns a template result.
 */
export type ChatTemplateRenderer<T> = (ctx: T) => unknown;

/**
 * A string literal type defining the two possible positions for chat suggestions.
 */
export type ChatSuggestionsPosition = 'below-input' | 'below-messages';

/**
 * The base context object passed to custom renderer functions, containing the chat component instance.
 */
export interface ChatRenderContext {
  /**
   * The instance of the IgcChatComponent.
   */
  instance: IgcChatComponent;
}

/**
 * The context object for renderers that deal with the chat input area.
 * It extends the base context with input-specific properties.
 */
export interface ChatInputRenderContext extends ChatRenderContext {
  /**
   * The list of attachments currently in the input area.
   */
  attachments: IgcChatMessageAttachment[];
  /**
   * The current value of the input field.
   */
  value: string;
}

/**
 * The context object for renderers that deal with a specific chat message.
 * It extends the base context with the message data.
 */
export interface ChatMessageRenderContext extends ChatRenderContext {
  /**
   * The specific chat message being rendered.
   */
  message: IgcChatMessage;
}

/**
 * The context object for renderers that deal with a specific attachment within a message.
 * It extends the message context with the attachment data.
 */
export interface ChatAttachmentRenderContext extends ChatMessageRenderContext {
  /**
   * The specific attachment being rendered.
   */
  attachment: IgcChatMessageAttachment;
}

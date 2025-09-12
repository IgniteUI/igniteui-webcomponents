import type IgcChatComponent from './chat.js';

/**
 * Represents a single chat message in the conversation.
 */
export interface IgcMessage {
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
  attachments?: IgcMessageAttachment[];

  /**
   * Optional list of reactions associated with the message.
   */
  reactions?: string[];
}

/**
 * Represents an attachment associated with a chat message.
 */
export interface IgcMessageAttachment {
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
  suggestionsPosition?: 'below-input' | 'below-messages';
  /**
   * Time in milliseconds to wait before dispatching a stop typing event.
   * Default is `3000`.
   */
  stopTypingDelay?: number;

  renderers?: Partial<ChatRenderers>;
};

export type ChatRenderers = {
  attachment?: ChatTemplateRenderer<AttachmentRendererContext>;
  attachmentContent?: ChatTemplateRenderer<AttachmentRendererContext>;
  attachmentHeader?: ChatTemplateRenderer<AttachmentRendererContext>;
  fileUploadButton?: ChatTemplateRenderer<ChatRendererContext>;
  input?: ChatTemplateRenderer<InputRendererContext>;
  inputActions?: ChatTemplateRenderer<ChatRendererContext>;
  inputActionsEnd?: ChatTemplateRenderer<ChatRendererContext>;
  inputActionsStart?: ChatTemplateRenderer<ChatRendererContext>;
  inputAttachments?: ChatTemplateRenderer<InputRendererContext>;
  message?: ChatTemplateRenderer<MessageRendererContext>;
  messageActions?: ChatTemplateRenderer<MessageRendererContext>;
  messageAttachments?: ChatTemplateRenderer<MessageRendererContext>;
  messageContent?: ChatTemplateRenderer<MessageRendererContext>;
  messageHeader?: ChatTemplateRenderer<MessageRendererContext>;
  typingIndicator?: ChatTemplateRenderer<ChatRendererContext>;
  sendButton?: ChatTemplateRenderer<ChatRendererContext>;
  suggestionPrefix?: ChatTemplateRenderer<ChatRendererContext>;
};

export type ChatTemplateRenderer<T> = (ctx: T) => unknown;

export interface ChatRendererContext {
  instance: IgcChatComponent;
}

export interface InputRendererContext extends ChatRendererContext {
  attachments: IgcMessageAttachment[];
  value: string;
}

export interface MessageRendererContext extends ChatRendererContext {
  message: IgcMessage;
}

export interface AttachmentRendererContext extends MessageRendererContext {
  attachment: IgcMessageAttachment;
}

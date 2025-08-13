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
  timestamp: Date;

  /**
   * Optional list of attachments associated with the message,
   * such as images, files, or links.
   */
  attachments?: IgcMessageAttachment[];
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
 * A function type used to render a group of attachments in a chat message.
 *
 * This allows consumers to customize how message attachments are displayed
 * (e.g. rendering thumbnails, file icons, or download links).
 *
 * @param {IgcMessageAttachment[]} attachments - The list of attachments to render.
 * @returns {unknown} A custom rendered representation of the attachments.
 */
export type AttachmentTemplate = (
  attachments: IgcMessageAttachment[]
) => unknown;

/**
 * A function type used to render a single chat message.
 *
 * This allows consumers to fully customize the display of a message,
 * including its text, sender info, timestamp, and any attachments.
 *
 * @param {IgcMessage} message - The chat message to render.
 * @returns {unknown} A custom rendered representation of the message.
 */
export type MessageTemplate = (message: IgcMessage) => unknown;
export type MessageTemplateFn = (
  message: IgcMessage,
  ctx?: {
    textContent: unknown;
    templates: Required<IgcChatTemplates>;
  }
) => unknown;
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
  disableAttachments?: boolean;
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
  /**
   * A set of template override functions used to customize rendering of messages, attachments, etc.
   */
  templates?: Partial<IgcChatTemplates>;

  /**
   * Optional custom renderer for chat messages.
   * If provided, this will be used to render all messages instead of the default rendering logic.
   */
  messageRenderer?: ChatMessageRenderer;
};

/**
 * A collection of template functions used to customize different parts of the chat component.
 * Each template allows you to override the rendering of a specific part of the component.
 */
export type IgcChatTemplates = {
  /**
   * Template for rendering an attachment in a message.
   */
  attachmentTemplate?: MessageTemplate;

  /**
   * Template for rendering a custom header above the attachment in a message.
   */
  attachmentHeaderTemplate?: MessageTemplate;

  /**
   * Template for rendering custom action buttons or controls related to an attachment
   * (e.g. download, preview, delete).
   */
  attachmentActionsTemplate?: MessageTemplate;

  /**
   * Template for rendering the main content of an attachment, such as a thumbnail or file preview.
   */
  attachmentContentTemplate?: MessageTemplate;

  /**
   * Template for rendering a single chat message.
   * Use this to customize message layout, formatting, or metadata.
   */
  messageTemplate?: MessageTemplateFn;

  /**
   * Template for rendering message-specific actions such as edit, delete, reply, etc.
   */
  messageActionsTemplate?: MessageTemplate;

  /**
   * Template used to show an indicator when the other user is typing (e.g. “User is typing...”).
   */
  typingIndicatorTemplate?: unknown;

  /**
   * Template for customizing the text input element (usually a `<textarea>` or `<input>`).
   *
   * @param text - The current value of the text input.
   * @returns {unknown} A custom rendered representation of the text input.
   */
  textInputTemplate?: (text: string) => unknown;

  /**
   * Template for rendering additional controls in the message input area,
   * such as send buttons, emoji pickers, or voice recorders.
   */
  textAreaActionsTemplate?: unknown;

  /**
   * Template for rendering attachments that are currently queued for sending (in the input area).
   */
  textAreaAttachmentsTemplate?: AttachmentTemplate;
};

/**
 * @interface
 * Interface for rendering chat messages within a component, such as in a Lit-based chat UI.
 *
 * Defines how a given {@link IgcMessage} should be rendered.
 *
 * @export
 */
export interface ChatMessageRenderer {
  /**
   * Renders a given message.
   * @param {IgcMessage} message The message to render.
   * @returns {unknown} The rendered output, typically an HTMLElement, DocumentFragment, or a lit-html TemplateResult,
   * depending on the renderer implementation.
   */
  render(
    message: IgcMessage,
    ctx?: {
      templates: Required<IgcChatTemplates>;
      renderText: (message: IgcMessage) => unknown;
    }
  ): unknown;

  /**
   * Performs optional asynchronous initialization.
   * This method is called before any rendering occurs and can be used to load resources
   * like syntax highlighters or fonts.
   * @async
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  init?(): Promise<void>;
}

export const attachmentIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z"/></svg>';
export const sendButtonIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>';
export const closeIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';
export const fileIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>';
export const imageIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"/></svg>';
export const moreIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/></svg>';
export const previewIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>';
export const fileImageIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M6.75 1.5L5.3775 3H3C2.175 3 1.5 3.675 1.5 4.5V13.5C1.5 14.325 2.175 15 3 15H15C15.825 15 16.5 14.325 16.5 13.5V4.5C16.5 3.675 15.825 3 15 3H12.6225L11.25 1.5H6.75ZM9 12.75C6.93 12.75 5.25 11.07 5.25 9C5.25 6.93 6.93 5.25 9 5.25C11.07 5.25 12.75 6.93 12.75 9C12.75 11.07 11.07 12.75 9 12.75Z"/></svg>';
export const fileDocumentIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M4.5 1.5C3.675 1.5 3.0075 2.175 3.0075 3L3 15C3 15.825 3.6675 16.5 4.4925 16.5H13.5C14.325 16.5 15 15.825 15 15V6L10.5 1.5H4.5ZM9.75 6.75V2.625L13.875 6.75H9.75Z"/></svg>';

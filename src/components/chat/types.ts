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
export type MessageTemplate = (
  message: IgcMessage,
  ctx: { textContent: unknown; templates: Partial<IgcChatTemplates> }
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

  messageRenderer?: ChatMessageRenderer;
};

/**
 * A collection of template functions used to customize different parts of the chat component.
 * Each template allows you to override the rendering of a specific part of the component.
 */
export type IgcChatTemplates = {
  /**
   * Template for rendering the attachments of a message.
   */
  attachmentsTemplate?: (m: IgcMessage) => unknown;

  /**
   * Template for rendering an attachment in a message.
   * This allows customization of how each attachment is displayed.
   */
  attachmentTemplate?: (attachment: IgcMessageAttachment) => unknown;

  /**
   * Template for rendering a custom header above the attachment in a message.
   */
  attachmentHeaderTemplate?: (attachment: IgcMessageAttachment) => unknown;

  /**
   * Template for rendering the main content of an attachment, such as a thumbnail or file preview.
   */
  attachmentContentTemplate?: (attachment: IgcMessageAttachment) => unknown;

  /**
   * Template for rendering a single chat message.
   * Use this to customize message layout, formatting, or metadata.
   */
  messageTemplate?: MessageTemplate;

  /**
   * Template for rendering the actions available for a message (e.g. copy, like, dislike, regenerate).
   * This allows customization of the buttons or controls shown for each message.
   */
  messageActionsTemplate?: (message: IgcMessage) => unknown;

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
  textAreaActionsTemplate?: () => unknown;

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
      renderText: (message: IgcMessage) => unknown;
      templates: Partial<IgcChatTemplates>;
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
export const copyIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>';
export const thumbUpIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/></svg>';
export const thumbDownIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/></svg>';
export const regenerateIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>';
export const starIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25"><path d="M6.58624 4.76825C6.72103 4.41058 7.23629 4.41058 7.37112 4.76825L7.92907 6.24921C7.94973 6.30414 7.98177 6.35321 8.02248 6.39423C8.06524 6.43719 8.11758 6.47089 8.17626 6.49213L9.6841 7.04022C10.0484 7.17255 10.0484 7.67865 9.6841 7.81097L8.17626 8.35907C8.10738 8.38422 8.04729 8.42621 8.00109 8.48016C7.97045 8.51605 7.94595 8.55707 7.92907 8.60199L7.37112 10.0829C7.23629 10.4409 6.72103 10.4409 6.58624 10.0829L6.02828 8.60199C5.98589 8.48944 5.89559 8.40082 5.78106 8.35907L4.27322 7.81097C3.90893 7.67865 3.90893 7.17255 4.27322 7.04022L5.78106 6.49213C5.89559 6.45062 5.98589 6.36176 6.02828 6.24921L6.58624 4.76825Z" /><path d="M12.2095 8.05023C12.481 7.31659 13.519 7.31659 13.7905 8.05023L14.9144 11.0876C14.9997 11.3183 15.1816 11.5002 15.4123 11.5856L18.4496 12.7094C19.1835 12.9809 19.1835 14.019 18.4496 14.2905L15.4123 15.4142C15.1816 15.4997 14.9997 15.6816 14.9144 15.9123L13.7905 18.9496C13.519 19.6833 12.481 19.6833 12.2095 18.9496L11.0856 15.9123C11.0002 15.6816 10.8183 15.4997 10.5876 15.4142L7.55038 14.2905C6.81652 14.019 6.81652 12.9809 7.55038 12.7094L10.5876 11.5856C10.8183 11.5002 11.0002 11.3183 11.0856 11.0876L12.2095 8.05023Z" /><path d="M6.63354 16.7551C6.75942 16.415 7.24056 16.415 7.36645 16.7551L7.67638 17.5927C7.71597 17.6996 7.80029 17.7839 7.90725 17.8234L8.74487 18.1335C9.08504 18.2595 9.08504 18.7404 8.74487 18.8664L7.90725 19.1765C7.85857 19.1945 7.8146 19.2216 7.7774 19.256C7.73281 19.2973 7.69796 19.3488 7.67638 19.4072L7.36645 20.2448C7.24056 20.5849 6.75942 20.5849 6.63354 20.2448L6.3236 19.4072C6.3055 19.3583 6.27807 19.3141 6.2434 19.2768C6.2022 19.2326 6.15081 19.1979 6.09274 19.1765L5.25512 18.8664C4.91494 18.7404 4.91494 18.2595 5.25512 18.1335L6.09274 17.8234C6.1997 17.7839 6.28402 17.6996 6.3236 17.5927L6.63354 16.7551Z" /><path d="M18.3664 5.75507C18.2406 5.41498 17.7594 5.41498 17.6335 5.75507L17.3236 6.59271C17.284 6.69965 17.1997 6.78387 17.0928 6.82343L16.2551 7.13348C15.915 7.25946 15.915 7.74042 16.2551 7.86639L17.0928 8.17645C17.1997 8.216 17.284 8.30023 17.3236 8.40717L17.6335 9.24481C17.7594 9.5849 18.2406 9.5849 18.3664 9.24481L18.6764 8.40717C18.716 8.30023 18.8003 8.216 18.9072 8.17645L19.7449 7.86639C20.085 7.74042 20.085 7.25946 19.7449 7.13348L18.9072 6.82343C18.8003 6.78387 18.716 6.69965 18.6764 6.59271L18.3664 5.75507Z" /></svg>';

import DOMPurify from 'dompurify';
import { html, nothing, type TemplateResult } from 'lit';
import type IgcTextareaComponent from '../textarea/textarea.js';
import type IgcChatComponent from './chat.js';
import type { IgcChatComponentEventMap } from './chat.js';
import { renderMarkdown } from './markdown-util.js';
import type {
  IgcChatDefaultTemplates,
  IgcChatOptions,
  IgcMessage,
  IgcMessageAttachment,
} from './types.js';

/**
 * Internal state manager for the `<igc-chat>` component.
 *
 * Manages messages, input value, attachments, options, and event emissions.
 */
export class ChatState {
  //#region Internal properties and state /** The host `<igc-chat>` component instance */
  private readonly _host: IgcChatComponent;
  /** Reference to the text area input component */
  private _textArea: IgcTextareaComponent | null = null;
  /** The current list of messages */
  private _messages: IgcMessage[] = [];
  /** Chat options/configuration */
  private _options?: IgcChatOptions;
  /** List of current input attachments */
  private _inputAttachments: IgcMessageAttachment[] = [];
  /** Current input text */
  private _inputValue = '';
  /** Default templates of the chat components */
  private _defaultTemplates: IgcChatDefaultTemplates = {
    defaultMessageAttachment: undefined,
    defaultMessageAttachmentHeader: this.defaultAttachmentHeader.bind(this),
    defaultMessageAttachmentContent: this.defaultAttachmentContent.bind(this),
    defaultMessage: this.defaultMessageTemplate.bind(this),
    defaultComposingIndicator: this.defaultComposingIndicatorTemplate,
    defaultAttachmentsArea: this.defaultAttachmentsArea(),
    defaultTextArea: () => this.defaultTextArea(),
    defaultFileUploadButton: this.defaultFileUploadButton(),
    defaultSendButton: () => this.defaultSendButton(),
  };
  /**
   * Cache of accepted file types, organized into extensions, mimeTypes, and wildcardTypes
   */
  private _acceptedTypesCache: {
    extensions: Set<string>;
    mimeTypes: Set<string>;
    wildcardTypes: Set<string>;
  } | null = null;
  /** Default position of the suggestions */
  private _suggestionsPosition: 'below-input' | 'below-messages' =
    'below-messages';
  /** Default time in milliseconds before dispatching stop typing event */
  private _stopTypingDelay = 3000;
  //#endregion

  //#region Public properties
  /**
   * Gets the list of chat messages.
   */
  public get messages(): IgcMessage[] {
    return this._messages;
  }

  /**
   * Sets the list of chat messages.
   * Also sorts messages by timestamp and requests host update.
   */
  public set messages(value: IgcMessage[]) {
    this._messages = value;
    this._host.requestUpdate();
  }

  /**
   * Gets current chat options.
   */
  public get options(): IgcChatOptions | undefined {
    return this._options;
  }

  /**
   * Sets chat options and requests host update.
   */
  public set options(value: IgcChatOptions) {
    this._options = value;
    this._host.requestUpdate();
    // Notify context consumers about the state change
    if (this._host.updateContextValue) {
      this._host.updateContextValue();
    }
  }

  /**
   * Gets the current user ID from options or returns 'user' as fallback.
   */
  public get currentUserId(): string {
    return this._options?.currentUserId ?? 'user';
  }

  /**
   * Gets the current suggestionsPosition from options or returns the default value 'below-messages'.
   */
  public get suggestionsPosition(): string {
    return this._options?.suggestionsPosition ?? this._suggestionsPosition;
  }

  /**
   * Gets the current stopTypingDelay from options or returns the default value `3000`.
   */
  public get stopTypingDelay(): number {
    return this._options?.stopTypingDelay ?? this._stopTypingDelay;
  }

  /**
   * Gets the text area component.
   */
  public get textArea(): IgcTextareaComponent | null {
    return this._textArea;
  }

  /**
   * Sets the text area component.
   */
  public set textArea(value: IgcTextareaComponent) {
    this._textArea = value;
  }

  /**
   * Gets the list of attachments currently attached to input.
   */
  public get inputAttachments(): IgcMessageAttachment[] {
    return this._inputAttachments;
  }

  /**
   * Sets the input attachments and requests host update.
   */
  public set inputAttachments(value: IgcMessageAttachment[]) {
    this._inputAttachments = value;
    this._host.requestUpdate(); // Notify the host component to re-render
    // Notify context consumers about the state change
    if (this._host.updateContextValue) {
      this._host.updateContextValue();
    }
  }

  /**
   * Gets the current input value.
   */
  public get inputValue(): string {
    return this._inputValue;
  }

  /**
   * Sets the current input value and requests host update.
   */
  public set inputValue(value: string) {
    this._inputValue = value;
    this._host.requestUpdate();
    // Notify context consumers about the state change
    if (this._host.updateContextValue) {
      this._host.updateContextValue();
    }
  }

  /** Returns all default templates applied in the chat component. */
  public get defaultTemplates(): IgcChatDefaultTemplates | undefined {
    return this._defaultTemplates;
  }

  /** Sets the default templates applied in the chat component. */
  public set defaultTemplates(templates: IgcChatDefaultTemplates) {
    this._defaultTemplates = { ...templates };
  }
  //#endregion

  /**
   * Creates an instance of ChatState.
   * @param chat The host `<igc-chat>` component.
   */
  constructor(chat: IgcChatComponent) {
    this._host = chat;
  }

  //#region Event handlers

  /**
   * Emits a custom event from the host component.
   * @param name Event name (key of IgcChatComponentEventMap)
   * @param args Event detail or options
   * @returns true if event was not canceled, false otherwise
   */
  public emitEvent(name: keyof IgcChatComponentEventMap, args?: any) {
    return this._host.emitEvent(name, args);
  }

  /**
   * Handles input text changes.
   * Updates internal inputValue and emits 'igcInputChange' event.
   * @param value New input value
   */
  public handleInputChange(e: Event): void {
    const target = e.target as HTMLTextAreaElement;
    this.inputValue = target.value;
    this.emitEvent('igcInputChange', { detail: { value: this.inputValue } });
  }

  //#endregion

  //#region Default Templates renderers
  /**
   * Default attachments area template used when no custom template is provided.
   * Renders the list of input attachments as chips.
   * @returns TemplateResult containing the attachments area
   */
  public defaultAttachmentsArea(): TemplateResult {
    return html`${this.inputAttachments?.map(
      (attachment, index) => html`
        <div part="attachment-wrapper" role="listitem">
          <igc-chip removable @igcRemove=${() => this.removeAttachment(index)}>
            <span part="attachment-name">${attachment.name}</span>
          </igc-chip>
        </div>
      `
    )} `;
  }

  /**
   * Default text area template used when no custom template is provided.
   * Renders a text area for user input.
   * @returns TemplateResult containing the text area
   */
  public defaultTextArea(): TemplateResult {
    return html` <igc-textarea
      part="text-input"
      .placeholder=${this.options?.inputPlaceholder}
      resize="auto"
      rows="1"
      .value=${this.inputValue}
      @input=${this.handleInputChange.bind(this)}
      @keydown=${this.handleKeyDown.bind(this)}
      @focus=${this.handleFocus.bind(this)}
      @blur=${this.handleBlur.bind(this)}
    ></igc-textarea>`;
  }

  /**
   * Default file upload button template used when no custom template is provided.
   * Renders a file input for attaching files.
   * @returns TemplateResult containing the file upload button
   */
  public defaultFileUploadButton(): TemplateResult {
    return html`
      <igc-file-input
        multiple
        .accept=${this.options?.acceptedFiles}
        @igcChange=${this.handleFileUpload.bind(this)}
      >
        <igc-icon
          slot="file-selector-text"
          name="attachment"
          collection="material"
        ></igc-icon>
      </igc-file-input>
    `;
  }

  /**
   * Default send button template used when no custom template is provided.
   * Renders a send button that submits the current input value and attachments.
   * @returns TemplateResult containing the send button
   */
  public defaultSendButton(): TemplateResult {
    return html` <igc-icon-button
      aria-label="Send message"
      name="send-message"
      collection="material"
      variant="contained"
      part="send-button"
      ?disabled=${!this.inputValue.trim() && this.inputAttachments.length === 0}
      @click=${this.sendMessage.bind(this)}
    ></igc-icon-button>`;
  }

  /**
   * Default composing indicator template used when no custom template is provided.
   * Renders a simple typing indicator with three dots.
   * @returns TemplateResult containing the typing indicator
   */
  public get defaultComposingIndicatorTemplate(): TemplateResult {
    return html`<div part="typing-indicator">
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
    </div>`;
  }

  /**
   * Default message template used when no custom template is provided.
   * Renders the message text, sanitized for security.
   * @param message The chat message to render
   * @returns TemplateResult containing the rendered message
   */
  public defaultMessageTemplate(message: IgcMessage): TemplateResult {
    const sanitizedMessageText = DOMPurify.sanitize(message?.text.trim() || '');
    const renderer = this.options?.markdownRenderer || renderMarkdown;
    return html` ${sanitizedMessageText
      ? html`<div>${renderer(sanitizedMessageText)}</div>`
      : nothing}`;
  }

  /**
   * Default attachment header template used when no custom template is provided.
   * Renders the attachment icon and name.
   * @param attachment The message attachment to render
   * @returns TemplateResult containing the rendered attachment header
   */
  public defaultAttachmentHeader(attachment: IgcMessageAttachment) {
    return html`${attachment.type === 'image' ||
      attachment.file?.type.startsWith('image/')
        ? html`<igc-icon
            name="image"
            collection="material"
            part="attachment-icon"
          ></igc-icon>`
        : html`<igc-icon
            name="file"
            collection="material"
            part="attachment-icon"
          ></igc-icon>`}
      <span part="file-name">${attachment.name}</span> `;
  }

  /**
   * Default attachment content template used when no custom template is provided.
   * Renders the attachment content based on its type.
   * @param attachment The message attachment to render
   * @returns TemplateResult containing the rendered attachment content
   */
  public defaultAttachmentContent(attachment: IgcMessageAttachment) {
    return html`${attachment.type === 'image' ||
    attachment.file?.type.startsWith('image/')
      ? html`<img
          part="image-attachment"
          src=${this.getURL(attachment)}
          alt=${attachment.name}
        />`
      : nothing}`;
  }
  //#endregion

  //#region Public API

  /**
   * Adds a new chat message.
   * Emits 'igcMessageCreated' event which can be canceled to prevent adding.
   * Clears input value and attachments on success.
   * @param message Partial message object with optional id, sender, timestamp
   */
  public addMessage(message: {
    id?: string;
    text: string;
    sender?: string;
    timestamp?: Date;
    attachments?: IgcMessageAttachment[];
  }): void {
    const newMessage: IgcMessage = {
      id: message.id ?? Date.now().toString(),
      text: message.text,
      sender: message.sender ?? this.currentUserId,
      timestamp: message.timestamp ?? new Date(),
      attachments: message.attachments || [],
    };

    const allowed = this.emitEvent('igcMessageCreated', {
      detail: newMessage,
      cancelable: true,
    });

    if (allowed) {
      if (!this.messages.some((msg) => msg.id === newMessage.id)) {
        this.messages = [...this.messages, newMessage];
      }
      this.inputValue = '';
      this.inputAttachments = [];
    }
  }

  /**
   * Adds files as attachments to the input.
   * Emits 'igcAttachmentChange' event which can be canceled to prevent adding.
   * @param files Array of File objects to attach
   */
  public attachFiles(files: File[]) {
    const newAttachments: IgcMessageAttachment[] = [];
    let count = this.inputAttachments.length;
    files.forEach((file) => {
      if (this.inputAttachments.find((a) => a.name === file.name)) {
        return;
      }

      const isImage = file.type.startsWith('image/');
      newAttachments.push({
        id: Date.now().toString() + count++,
        url: URL.createObjectURL(file),
        name: file.name,
        file: file,
        thumbnail: isImage ? URL.createObjectURL(file) : undefined,
      });
    });

    const allowed = this.emitEvent('igcAttachmentChange', {
      detail: [...this.inputAttachments, ...newAttachments],
      cancelable: true,
    });
    if (allowed) {
      this.inputAttachments = [...this.inputAttachments, ...newAttachments];
    }
  }

  /**
   * Handles when a suggestion is clicked.
   * Adds the suggestion as a new message and focuses the text area.
   * @param suggestion The suggestion string clicked
   */
  public handleSuggestionClick(suggestion: string): void {
    this.addMessage({ text: suggestion });
    if (this.textArea) {
      this.textArea.focus();
    }
  }

  /**
   * Updates the chat options partially.
   * @param options Partial options to merge with current options
   */
  public updateOptions(options: Partial<IgcChatOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Updates the internal cache for accepted file types.
   * Parses the acceptedFiles string option into extensions, mimeTypes, and wildcard types.
   */
  public updateAcceptedTypesCache() {
    if (!this.options?.acceptedFiles) {
      this._acceptedTypesCache = null;
      return;
    }

    const types = this.options?.acceptedFiles
      .split(',')
      .map((type) => type.trim().toLowerCase());
    this._acceptedTypesCache = {
      extensions: new Set(types.filter((t) => t.startsWith('.'))),
      mimeTypes: new Set(
        types.filter((t) => !t.startsWith('.') && !t.endsWith('/*'))
      ),
      wildcardTypes: new Set(
        types.filter((t) => t.endsWith('/*')).map((t) => t.slice(0, -2))
      ),
    };
  }

  /**
   * Checks if a file's type or extension is accepted by the chat's acceptedFiles setting.
   * @param file File object to check
   * @param type Optional MIME type override if no file provided
   * @returns True if accepted, false otherwise
   */
  public isFileTypeAccepted(file: File, type = ''): boolean {
    if (!this._acceptedTypesCache) return true;

    if (file === null && type === '') return false;

    const fileType =
      file != null ? file.type.toLowerCase() : type.toLowerCase();
    const fileExtension =
      file != null
        ? `.${file.name.split('.').pop()?.toLowerCase()}`
        : `.${type.split('/').pop()?.toLowerCase()}`;

    // Check file extension
    if (this._acceptedTypesCache.extensions.has(fileExtension)) {
      return true;
    }

    // Check exact MIME type
    if (this._acceptedTypesCache.mimeTypes.has(fileType)) {
      return true;
    }

    // Check wildcard MIME types
    const [fileBaseType] = fileType.split('/');
    return this._acceptedTypesCache.wildcardTypes.has(fileBaseType);
  }

  /**
   * Checks if a slot is empty.
   * @param name Slot name to check
   * @returns True if the slot has content, false otherwise
   */
  public hasSlotContent(name: string): boolean {
    return (
      this._host.renderRoot.querySelector<HTMLSlotElement>(`slot[name=${name}]`)
        ?.childNodes.length !== 0
    );
  }
  //#endregion

  private getURL(attachment: IgcMessageAttachment): string {
    if (attachment.url) {
      return attachment.url;
    }
    if (attachment.file) {
      return URL.createObjectURL(attachment.file);
    }
    return '';
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    } else {
      this.emitEvent('igcTypingChange', {
        detail: { isTyping: true },
      });

      // wait 3 seconds and dispatch a stop-typing event
      setTimeout(() => {
        this.emitEvent('igcTypingChange', {
          detail: { isTyping: false },
        });
      }, 3000);
    }
  }

  private handleFocus() {
    this.emitEvent('igcInputFocus');
  }

  private handleBlur() {
    this.emitEvent('igcInputBlur');
  }

  private sendMessage() {
    if (!this.inputValue.trim() && this.inputAttachments.length === 0) return;

    this.addMessage({
      text: this.inputValue,
      attachments: this.inputAttachments,
    });
    this.inputValue = '';

    if (this._textArea) {
      this._textArea.style.height = 'auto';
    }

    this._host.updateComplete.then(() => {
      this._textArea?.focus();
    });
  }

  private handleFileUpload(e: Event) {
    const input = (e.target as any).input as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.attachFiles(files);
    this._host.requestUpdate();
  }

  public removeAttachment(index: number) {
    const allowed = this.emitEvent('igcAttachmentChange', {
      detail: this.inputAttachments.filter((_, i) => i !== index),
      cancelable: true,
    });
    if (allowed) {
      this.inputAttachments = this.inputAttachments.filter(
        (_, i) => i !== index
      );
    }
    this._host.requestUpdate();
    // Notify context consumers about the state change
    if (this._host.updateContextValue) {
      this._host.updateContextValue();
    }
  }
}

export function createChatState(host: IgcChatComponent): ChatState {
  return new ChatState(host);
}

import { nothing } from 'lit';
import { createRef, type Ref } from 'lit/directives/ref.js';
import { enterKey } from '../common/controllers/key-bindings.js';
import { IgcChatResourceStringEN } from '../common/i18n/chat.resources.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import type IgcTextareaComponent from '../textarea/textarea.js';
import type IgcChatComponent from './chat.js';
import type { IgcChatComponentEventMap } from './chat.js';
import { DefaultChatRenderer } from './chat-renderer.js';
import { PlainTextRenderer } from './plain-text-renderer.js';
import {
  copyIcon,
  type IgcChatOptions,
  type IgcChatTemplates,
  type IgcMessage,
  type IgcMessageAttachment,
  regenerateIcon,
  thumbDownIcon,
  thumbUpIcon,
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

  public _isTyping = false;
  private _lastTyped = Date.now();

  private _fileIcon = new URL('./assets/file.png', import.meta.url).href;
  private _jsonIcon = new URL('./assets/json.png', import.meta.url).href;
  private _linkIcon = new URL('./assets/link.png', import.meta.url).href;

  private readonly _textAreaRef = createRef<IgcTextareaComponent>();

  private _chatRenderer?: DefaultChatRenderer;
  public resourceStrings = IgcChatResourceStringEN;

  /** Default templates of the chat components */
  private _defaultTemplates: Required<IgcChatTemplates> = {
    attachmentTemplate: (_att: IgcMessageAttachment, _m: IgcMessage) => nothing,
    // this.renderDefaultAttachmentTemplate(att, m),
    attachmentsTemplate: (
      _m: IgcMessage,
      _ctx: { templates: Partial<IgcChatTemplates> }
    ) => nothing, //this.renderDefaultAttachmentsTemplate(m),
    attachmentHeaderTemplate: (_att: IgcMessageAttachment, _msg: IgcMessage) =>
      nothing, // this.renderDefaultAttachmentHeader(att, msg),
    attachmentContentTemplate: (_att: IgcMessageAttachment) => nothing, // this.renderDefaultAttachmentContent(att),
    messageAuthorTemplate: () => {},
    messageTemplate: (
      _m: IgcMessage,
      _ctx: { textContent: unknown; templates: Partial<IgcChatTemplates> }
    ) => nothing, //this.renderDefaultMessageTemplate(m, ctx),
    messageActionsTemplate: (_message: IgcMessage) => nothing,
    // this.renderDefaultMessageActionsTemplate(message),
    suggestionPrefixTemplate: () => {},
    typingIndicatorTemplate: () => nothing, //this.renderDefaultTypingIndicator(),
    textInputTemplate: () => nothing, //this.renderDefaultTextArea(),
    textAreaActionsTemplate: () => nothing, //this.renderDefaultActionsArea(),
    textAreaAttachmentsTemplate: (_attachments: IgcMessageAttachment[]) =>
      nothing, //this.renderDefaultAttachmentsArea(attachments),
  };

  /** The tooltip component used for showing action tooltips. */
  // private get _sharedTooltip(): IgcTooltipComponent | undefined {
  //   return this._sharedTooltipRef?.value;
  // }

  public getIconName(fileType: string | undefined): string {
    if (fileType?.startsWith('image')) {
      return 'file-image';
    }
    return 'file-document';
  }
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
   * Gets the text area component.
   */
  public get textAreaRef(): Ref<IgcTextareaComponent> {
    return this._textAreaRef;
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
  public get defaultTemplates(): Required<IgcChatTemplates> {
    return this._defaultTemplates;
  }

  /** Sets the default templates applied in the chat component. */
  public set defaultTemplates(templates: Required<IgcChatTemplates>) {
    this._defaultTemplates = { ...templates };
  }

  public get chatRenderer(): DefaultChatRenderer | undefined {
    if (
      !this._chatRenderer ||
      this._chatRenderer !== this.options?.messageRenderer
    ) {
      this._chatRenderer = new DefaultChatRenderer(
        this.options?.messageRenderer ?? new PlainTextRenderer(),
        this.defaultTemplates
      );
      this.options?.messageRenderer?.init?.();
    }
    return this._chatRenderer;
  }

  //#endregion

  /**
   * Creates an instance of ChatState.
   * @param chat The host `<igc-chat>` component.
   */
  constructor(chat: IgcChatComponent) {
    this._host = chat;
    registerIconFromText('copy-response', copyIcon, 'material');
    registerIconFromText('good-response', thumbUpIcon, 'material');
    registerIconFromText('bad-response', thumbDownIcon, 'material');
    registerIconFromText('redo', regenerateIcon, 'material');
  }

  //#region Event handlers

  /**
   * Emits a custom event from the host component.
   * @param name Event name (key of IgcChatComponentEventMap)
   * @param args Event detail or options
   * @returns true if event was not canceled, false otherwise
   */
  public emitEvent = (name: keyof IgcChatComponentEventMap, args?: any) => {
    return this._host.emitEvent(name, args);
  };

  //#endregion

  //#region Public API

  /**
   * Adds a new chat message.
   * Emits 'igcMessageCreated' event which can be canceled to prevent adding.
   * Clears input value and attachments on success.
   * @param message Partial message object with optional id, sender, timestamp
   */
  public addMessage = (message: {
    id?: string;
    text: string;
    sender?: string;
    timestamp?: Date;
    attachments?: IgcMessageAttachment[];
  }): void => {
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
  };

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

  public getURL = (attachment: IgcMessageAttachment): string => {
    if (attachment.url) {
      return attachment.url;
    }
    if (attachment.file) {
      return URL.createObjectURL(attachment.file);
    }
    return '';
  };

  public isImageAttachment(attachment: IgcMessageAttachment): boolean {
    return (
      attachment.type === 'image' ||
      !!attachment.file?.type.startsWith('image/')
    );
  }

  public _fileIconMap: Record<string, string> = {
    pdf: this._fileIcon,
    doc: this._fileIcon,
    docx: this._fileIcon,
    xls: this._fileIcon,
    xlsx: this._fileIcon,
    txt: this._fileIcon,
    json: this._jsonIcon,
    link: this._linkIcon,
    default: this._fileIcon, // A fallback icon
  };

  public getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    if (parts.length > 1) {
      return parts.pop()!.toLowerCase();
    }
    return '';
  }

  public handleKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === enterKey.toLowerCase() && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    } else {
      this._lastTyped = Date.now();
      if (!this._isTyping) {
        this.emitEvent('igcTypingChange', {
          detail: { isTyping: true },
        });
        this._isTyping = true;
      }

      const stopTypingDelay = this.stopTypingDelay;
      setTimeout(() => {
        if (
          this._isTyping &&
          stopTypingDelay &&
          this._lastTyped + stopTypingDelay < Date.now()
        ) {
          this.emitEvent('igcTypingChange', {
            detail: { isTyping: false },
          });
          this._isTyping = false;
        }
      }, stopTypingDelay);
    }
  };

  public sendMessage = () => {
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
  };

  /**
   * Removes an attachment by index.
   * Emits 'igcAttachmentChange' event which can be canceled to prevent removal.
   * @param index Index of the attachment to remove
   */
  public removeAttachment = (index: number): void => {
    const allowed = this.emitEvent('igcAttachmentChange', {
      detail: this.inputAttachments.filter((_, i) => i !== index),
      cancelable: true,
    });
    if (allowed) {
      this.inputAttachments = this.inputAttachments.filter(
        (_, i) => i !== index
      );
    }
  };

  /**
   * Handles when a suggestion is clicked.
   * Adds the suggestion as a new message and focuses the text area.
   * @param suggestion The suggestion string clicked
   */
  public handleSuggestionClick = (suggestion: string): void => {
    this.addMessage({ text: suggestion });
    if (this.textArea) {
      this.textArea.focus();
    }
  };

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
  public updateAcceptedTypesCache = () => {
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
  };

  /**
   * Checks if a file's type or extension is accepted by the chat's acceptedFiles setting.
   * @param file File object to check
   * @param type Optional MIME type override if no file provided
   * @returns True if accepted, false otherwise
   */
  public isFileTypeAccepted = (file: File, type = ''): boolean => {
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
  };

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
}

export function createChatState(host: IgcChatComponent): ChatState {
  return new ChatState(host);
}

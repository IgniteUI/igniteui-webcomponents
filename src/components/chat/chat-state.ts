import { createRef, type Ref } from 'lit/directives/ref.js';
import { enterKey } from '../common/controllers/key-bindings.js';
import { IgcChatResourceStringEN } from '../common/i18n/chat.resources.js';
import { nanoid } from '../common/util.js';
import type IgcTextareaComponent from '../textarea/textarea.js';
import type IgcChatComponent from './chat.js';
import type { IgcChatComponentEventMap } from './chat.js';
import type {
  IgcChatOptions,
  IgcMessage,
  IgcMessageAttachment,
} from './types.js';
import { type ChatAcceptedFileTypes, parseAcceptedFileTypes } from './utils.js';

/**
 * Internal state manager for the `<igc-chat>` component.
 *
 * Manages messages, input value, attachments, options, and event emissions.
 */
export class ChatState {
  //#region Internal properties and state /** The host `<igc-chat>` component instance */
  private readonly _host: IgcChatComponent;

  private readonly _contextUpdateFn: () => unknown;
  private readonly _userInputContextUpdateFn: () => unknown;

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
  private _acceptedTypesCache: ChatAcceptedFileTypes | null = null;
  /** Default position of the suggestions */
  private _suggestionsPosition: 'below-input' | 'below-messages' =
    'below-messages';
  /** Default time in milliseconds before dispatching stop typing event */
  private _stopTypingDelay = 3000;

  public _isTyping = false;
  private _lastTyped = Date.now();

  private readonly _textAreaRef = createRef<IgcTextareaComponent>();

  public resourceStrings = IgcChatResourceStringEN;

  //#endregion

  //#region Public properties

  public get acceptedFileTypes() {
    return this._acceptedTypesCache;
  }

  public get disableAutoScroll(): boolean {
    return this._options?.disableAutoScroll ?? false;
  }

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
    this._contextUpdateFn.call(this._host);
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
    this._userInputContextUpdateFn.call(this._host);
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
    this._userInputContextUpdateFn.call(this._host);
  }

  //#endregion

  constructor(
    chat: IgcChatComponent,
    contextUpdateFn: () => unknown,
    userInputContextUpdateFn: () => unknown
  ) {
    this._host = chat;
    this._contextUpdateFn = contextUpdateFn;
    this._userInputContextUpdateFn = userInputContextUpdateFn;
  }

  public isCurrentUserMessage(message?: IgcMessage): boolean {
    return this.currentUserId === message?.sender;
  }

  //#region Event handlers

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
  public addMessage(message: Partial<IgcMessage>): void {
    const newMessage: IgcMessage = {
      id: message.id ?? nanoid(),
      text: message.text ?? '',
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
      this._host.requestUpdate('messages');

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
    const fileNames = new Set(
      this.inputAttachments.map((attachment) => attachment.file?.name ?? '')
    );

    for (const file of files) {
      if (fileNames.has(file.name)) {
        continue;
      }

      const isImage = file.type.startsWith('image/');
      const url = URL.createObjectURL(file);

      newAttachments.push({
        id: nanoid(),
        url,
        name: file.name,
        file,
        thumbnail: isImage ? url : undefined,
      });
    }

    const allowed = this.emitEvent('igcAttachmentChange', {
      detail: [...this.inputAttachments, ...newAttachments],
      cancelable: true,
    });
    if (allowed) {
      this.inputAttachments = [...this.inputAttachments, ...newAttachments];
    }
  }

  public isImageAttachment(attachment: IgcMessageAttachment): boolean {
    return (
      attachment.type === 'image' ||
      !!attachment.file?.type.startsWith('image/')
    );
  }

  public _fileIconMap: Record<string, string> = {
    css: 'file_generic',
    csv: 'file_generic',
    doc: 'file_generic',
    docx: 'file_generic',
    htm: 'file_generic',
    html: 'file_generic',
    js: 'file_generic',
    json: 'file_json',
    pdf: 'file_generic',
    rtf: 'file_generic',
    svg: 'file_generic',
    txt: 'file_generic',
    url: 'file_link',
    xls: 'file_generic',
    xlsx: 'file_json',
    xml: 'file_link',
    zip: 'file_generic',
    default: 'file_generic', // A fallback icon
  };

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
  public updateAcceptedTypesCache(): void {
    this._acceptedTypesCache = this.options?.acceptedFiles
      ? parseAcceptedFileTypes(this.options.acceptedFiles)
      : null;
  }

  //#endregion
}

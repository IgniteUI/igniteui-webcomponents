import type IgcChatComponent from './chat.js';
import type { IgcChatComponentEventMap } from './chat.js';
import type {
  IgcChatOptions,
  IgcMessage,
  IgcMessageAttachment,
  IgcRendererConfig,
} from './types.js';

export class ChatState {
  //#region Internal properties and state
  private readonly _host: IgcChatComponent;
  private _messages: IgcMessage[] = [];
  private _options?: IgcChatOptions;
  private _inputAttachments: IgcMessageAttachment[] = [];
  private _inputValue = '';
  // Cache for accepted file types
  private _acceptedTypesCache: {
    extensions: Set<string>;
    mimeTypes: Set<string>;
    wildcardTypes: Set<string>;
  } | null = null;

  private _rendererConfig: IgcRendererConfig | undefined;
  //#endregion

  //#region Public properties

  /** Chat message list. */
  public get messages(): IgcMessage[] {
    return this._messages;
  }

  /** Sets the chat message list. */
  public set messages(value: IgcMessage[]) {
    this._messages = value;
    this._host.requestUpdate();
  }

  /** Chat config options. */
  public get options(): IgcChatOptions | undefined {
    return this._options;
  }

  /** Sets the chat options. */
  public set options(value: IgcChatOptions) {
    this._options = value;
    this._host.requestUpdate();
  }

  /** Gets the current user id. */
  public get currentUserId(): string {
    return this._options?.currentUserId ?? 'user';
  }

  /** Input attachments. */
  public get inputAttachments(): IgcMessageAttachment[] {
    return this._inputAttachments;
  }

  /** Sets input attachments. */
  public set inputAttachments(value: IgcMessageAttachment[]) {
    this._inputAttachments = value;
    this._host.requestUpdate(); // Notify the host component to re-render
  }

  /** Input value. */
  public get inputValue(): string {
    return this._inputValue;
  }

  public set inputValue(value: string) {
    this._inputValue = value;
    this._host.requestUpdate();
  }

  public get rendererConfig(): IgcRendererConfig | undefined {
    return this._rendererConfig;
  }

  public set rendererConfig(value: IgcRendererConfig) {
    this._rendererConfig = value;
    this._host.requestUpdate();
  }
  //#endregion

  constructor(chat: IgcChatComponent) {
    this._host = chat;
  }

  //#region Event handlers

  /** Emmits chat events. */
  public emitEvent(name: keyof IgcChatComponentEventMap, args?: any) {
    return this._host.emitEvent(name, args);
  }

  /** Handles input changes. */
  public handleInputChange(value: string): void {
    this.inputValue = value;
    this.emitEvent('igcInputChange', { detail: { value: this.inputValue } });
  }

  //#endregion

  //#region Public API

  /** Adds a new message to the chat. */
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
      this.messages = [...this.messages, newMessage];
      this.inputAttachments = [];
    }
  }

  /** Adds a new attachmnet to the attachments list. */
  public attachFiles(files: File[]) {
    const newAttachments: IgcMessageAttachment[] = [];
    let count = this.inputAttachments.length;
    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      newAttachments.push({
        id: Date.now().toString() + count++,
        // type: isImage ? 'image' : 'file',
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

  /** Removes an attachment by index. */
  public removeAttachment(index: number): void {
    const allowed = this.emitEvent('igcAttachmentChange', {
      detail: this.inputAttachments.filter((_, i) => i !== index),
      cancelable: true,
    });
    if (allowed) {
      this.inputAttachments = this.inputAttachments.filter(
        (_, i) => i !== index
      );
    }
  }

  /** Updates chat options dynamically. */
  public updateOptions(options: Partial<IgcChatOptions>): void {
    this.options = { ...this.options, ...options };
  }

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

  /** Checks if a file could be attached based on the acceptedFiles. */
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

  public async updateRendererConfig(config?: IgcRendererConfig): Promise<void> {
    if (!config || config.type === 'plain') {
      this.rendererConfig = { type: 'plain' };
      return;
    }

    if (config.type === 'custom' && config.renderFn) {
      this.rendererConfig = {
        type: 'custom',
        renderFn: config.renderFn,
      };
      return;
    }

    if (
      config.type === 'markdown' &&
      !config.markdown?.disableDefaultHighlighter
    ) {
      const { registerHlLanguages, configureDefaultHighlighter } = await import(
        './markdown-util.js'
      );
      registerHlLanguages(config.markdown?.languages || {});
      configureDefaultHighlighter();
    }

    this.rendererConfig = config;
    return;
  }
  //#endregion
}

export function createChatState(host: IgcChatComponent): ChatState {
  return new ChatState(host);
}

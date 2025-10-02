import { IgcChatResourceStringEN } from '../common/i18n/EN/chat.resources.js';
import { isEmpty, nanoid } from '../common/util.js';
import IgcToastComponent from '../toast/toast.js';
import IgcTooltipComponent from '../tooltip/tooltip.js';
import type IgcChatComponent from './chat.js';
import type { IgcChatComponentEventMap } from './chat.js';
import type {
  ChatSuggestionsPosition,
  IgcChatMessage,
  IgcChatMessageAttachment,
  IgcChatMessageReaction,
  IgcChatOptions,
} from './types.js';
import {
  type ChatAcceptedFileTypes,
  isImageAttachment,
  parseAcceptedFileTypes,
} from './utils.js';

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

  private _actionsTooltip?: IgcTooltipComponent;
  private _actionToast?: IgcToastComponent;

  /** The current list of messages */
  private _messages: IgcChatMessage[] = [];
  /** Chat options/configuration */
  private _options?: IgcChatOptions;

  /** List of current input attachments */
  private _inputAttachments: IgcChatMessageAttachment[] = [];
  /** Current input text */
  private _inputValue = '';
  /**
   * Cache of accepted file types, organized into extensions, mimeTypes, and wildcardTypes
   */
  private _acceptedTypesCache: ChatAcceptedFileTypes | null = null;

  public _isTyping = false;
  private _lastTyped = Date.now();

  public resourceStrings = IgcChatResourceStringEN;

  //#endregion

  //#region Public properties

  public get host(): IgcChatComponent {
    return this._host;
  }

  public get acceptedFileTypes(): ChatAcceptedFileTypes | null {
    return this._acceptedTypesCache;
  }

  public get disableAutoScroll(): boolean {
    return this._options?.disableAutoScroll ?? false;
  }

  /**
   * Gets the list of chat messages.
   */
  public get messages(): IgcChatMessage[] {
    return this._messages;
  }

  /**
   * Sets the list of chat messages.
   */
  public set messages(value: IgcChatMessage[]) {
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
    this._setAcceptedTypesCache();
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
  public get suggestionsPosition(): ChatSuggestionsPosition {
    return this._options?.suggestionsPosition ?? 'below-messages';
  }

  /**
   * Gets the current stopTypingDelay from options or returns the default value `3000`.
   */
  public get stopTypingDelay(): number {
    return this._options?.stopTypingDelay ?? 3000;
  }

  /**
   * Gets the list of attachments currently attached to input.
   */
  public get inputAttachments(): IgcChatMessageAttachment[] {
    return this._inputAttachments;
  }

  /**
   * Sets the input attachments and requests host update.
   */
  public set inputAttachments(value: IgcChatMessageAttachment[]) {
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

  /**
   * Returns whether the default chat input textarea has a trimmed value payload.
   * @internal
   */
  public get hasInputValue(): boolean {
    return !!this._inputValue.trim();
  }

  /**
   * Returns whether the default file input of the chat has any attached files.
   * @internal
   */
  public get hasInputAttachments(): boolean {
    return !isEmpty(this._inputAttachments);
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

  public isCurrentUserMessage(message?: IgcChatMessage): boolean {
    return this.currentUserId === message?.sender;
  }

  //#region Event handlers

  public emitEvent(name: keyof IgcChatComponentEventMap, args?: any): boolean {
    return this._host.emitEvent(name, args);
  }

  /** @internal */
  public emitMessageCreated(message: IgcChatMessage): boolean {
    return this._host.emitEvent('igcMessageCreated', {
      detail: message,
      cancelable: true,
    });
  }

  /** @internal */
  public emitAttachmentsAdded(
    attachments: IgcChatMessageAttachment[]
  ): boolean {
    return this._host.emitEvent('igcAttachmentAdded', {
      detail: attachments,
      cancelable: true,
    });
  }

  /** @internal */
  public emitAttachmentRemoved(attachment: IgcChatMessageAttachment): boolean {
    return this._host.emitEvent('igcAttachmentRemoved', {
      detail: attachment,
      cancelable: true,
    });
  }

  /** @internal */
  public emitMessageReaction(reaction: IgcChatMessageReaction): boolean {
    return this._host.emitEvent('igcMessageReact', { detail: reaction });
  }

  /**
   * @internal
   */
  public showActionsTooltip(target: Element, message: string): void {
    if (!this._actionsTooltip) {
      this._actionsTooltip = document.createElement(
        IgcTooltipComponent.tagName
      );
      this._actionsTooltip.hideTriggers = 'pointerleave,click,blur';
      this._actionsTooltip.hideDelay = 100;
      this._host.renderRoot.appendChild(this._actionsTooltip);
    }
    this._actionsTooltip.message = message;
    this._actionsTooltip.show(target);
  }

  /**
   * @internal
   */
  public showActionToast(content: string): void {
    if (!this._actionToast) {
      this._actionToast = document.createElement(IgcToastComponent.tagName);
      this._actionToast.displayTime = 3000;
      this._host.renderRoot.appendChild(this._actionToast);
    }
    this._actionToast.textContent = content;
    this._actionToast.show();
  }

  //#endregion

  /**
   * Updates the internal cache for accepted file types.
   * Parses the acceptedFiles string option into extensions, mimeTypes, and wildcard types.
   */
  private _setAcceptedTypesCache(): void {
    this._acceptedTypesCache = this.options?.acceptedFiles
      ? parseAcceptedFileTypes(this.options.acceptedFiles)
      : null;
  }

  protected _createMessage(message: Partial<IgcChatMessage>): IgcChatMessage {
    return {
      id: message.id ?? nanoid(),
      text: message.text ?? '',
      sender: message.sender ?? this.currentUserId,
      timestamp: message.timestamp ?? Date.now().toString(),
      attachments: message.attachments || [],
    };
  }

  public addMessage(message: Partial<IgcChatMessage>) {
    this.messages.push(this._createMessage(message));
    this._host.requestUpdate('messages');
  }

  //#region Public API

  /**
   * Adds a new chat message.
   * Emits 'igcMessageCreated' event which can be canceled to prevent adding.
   * Clears input value and attachments on success.
   * @internal
   */
  public addMessageWithEvent(message: Partial<IgcChatMessage>): void {
    const newMessage = this._createMessage(message);

    if (this.emitMessageCreated(newMessage)) {
      this.addMessage(newMessage);
      this.inputValue = '';
      this.inputAttachments = [];
    }
  }

  /**
   * Adds files as attachments to the input.
   * Emits 'igcAttachmentChange' event which can be canceled to prevent adding.
   * @internal
   */
  public attachFilesWithEvent(files: File[]): void {
    const newAttachments: IgcChatMessageAttachment[] = [];
    const fileNames = new Set(
      this.inputAttachments.map((attachment) => attachment.file?.name ?? '')
    );

    for (const file of files) {
      if (fileNames.has(file.name)) {
        continue;
      }

      const url = URL.createObjectURL(file);
      const attachment: IgcChatMessageAttachment = {
        id: nanoid(),
        url,
        name: file.name,
        file,
      };

      if (isImageAttachment(file)) {
        attachment.thumbnail = url;
      }
      newAttachments.push(attachment);
    }

    if (this.emitAttachmentsAdded(newAttachments)) {
      this.inputAttachments = [...this.inputAttachments, ...newAttachments];
    }
  }

  public handleKeyDown = (_: KeyboardEvent) => {
    this._lastTyped = Date.now();
    if (!this._isTyping) {
      this.emitEvent('igcTypingChange', {
        detail: { isTyping: true },
      });
      this._isTyping = true;

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

  //#endregion
}

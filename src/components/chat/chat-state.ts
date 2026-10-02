import type { IChatResourceStrings } from 'igniteui-i18n-core';
import type { IgcChatResourceStrings } from '#internals/i18n/EN/chat.resources.js';
import type { UnpackCustomEvent } from '#internals/mixins/event-emitter.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { nanoid } from '#internals/utils/strings.js';
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

/** Internal state manager for `<igc-chat>`. */
export class ChatState {
  //#region Internal properties and state
  private readonly _host: IgcChatComponent;

  private readonly _contextUpdateFn: () => unknown;
  private readonly _userInputContextUpdateFn: () => unknown;

  private _actionsTooltip?: IgcTooltipComponent;
  private _actionToast?: IgcToastComponent;

  private _messages: IgcChatMessage[] = [];
  private _options?: IgcChatOptions;

  private _inputAttachments: IgcChatMessageAttachment[] = [];
  private _inputValue = '';
  /** Parsed `acceptedFiles`: extensions, MIME types and wildcard types. */
  private _acceptedTypesCache: ChatAcceptedFileTypes | null = null;

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

  public get messages(): IgcChatMessage[] {
    return this._messages;
  }

  public set messages(value: IgcChatMessage[]) {
    this._messages = value;
  }

  public get options(): IgcChatOptions | undefined {
    return this._options;
  }

  public set options(value: IgcChatOptions) {
    this._options = value;
    this._setAcceptedTypesCache();
    this._contextUpdateFn.call(this._host);
  }

  /** Defaults to `'user'`. */
  public get currentUserId(): string {
    return this._options?.currentUserId ?? 'user';
  }

  /** Defaults to `'below-messages'`. */
  public get suggestionsPosition(): ChatSuggestionsPosition {
    return this._options?.suggestionsPosition ?? 'below-messages';
  }

  /** Defaults to `3000`. */
  public get stopTypingDelay(): number {
    return this._options?.stopTypingDelay ?? 3000;
  }

  public get inputAttachments(): IgcChatMessageAttachment[] {
    return this._inputAttachments;
  }

  public set inputAttachments(value: IgcChatMessageAttachment[]) {
    this._inputAttachments = value;
    this._userInputContextUpdateFn.call(this._host);
  }

  public get inputValue(): string {
    return this._inputValue;
  }

  public set inputValue(value: string) {
    this._inputValue = value;
    this._userInputContextUpdateFn.call(this._host);
  }

  /**
   * Whether the textarea holds more than whitespace.
   * @internal
   */
  public get hasInputValue(): boolean {
    return !!this._inputValue.trim();
  }

  /**
   * Whether the input holds attachments.
   * @internal
   */
  public get hasInputAttachments(): boolean {
    return !isEmpty(this._inputAttachments);
  }

  public get resourceStrings(): IgcChatResourceStrings & IChatResourceStrings {
    return this._host.resourceStrings;
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

  public emitEvent<
    K extends keyof IgcChatComponentEventMap,
    D extends UnpackCustomEvent<IgcChatComponentEventMap[K]>,
  >(event: K, eventInitDict?: CustomEventInit<D>): boolean {
    return this._host.emitEvent(event, eventInitDict);
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

  /** @internal */
  public emitUserTypingState(state: boolean): boolean {
    return this._host.emitEvent('igcTypingChange', { detail: state });
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
   * Emits the cancelable `igcMessageCreated` event.
   * On success, adds the message and clears the input.
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
   * Emits the cancelable `igcAttachmentAdded` event.
   * On success, adds the new files as attachments.
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

  //#endregion
}

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
  IgcChatOptions,
} from './types.js';
import {
  type ChatAcceptedFileTypes,
  getFileURL,
  isImageAttachment,
  parseAcceptedFileTypes,
  revokeFileURL,
} from './utils.js';

/** The context that republishes on an option change. A new option fails to compile until listed. */
const OPTION_READERS: Record<
  keyof IgcChatOptions,
  'messages' | 'input' | 'both' | 'host'
> = {
  currentUserId: 'messages',
  isTyping: 'messages',
  // The input reads it through the message context.
  adoptRootStyles: 'messages',
  renderers: 'both',
  acceptedFiles: 'input',
  inputPlaceholder: 'input',
  disableInputAttachments: 'input',
  stopTypingDelay: 'host',
  suggestions: 'host',
  suggestionsPosition: 'host',
  headerText: 'host',
  disableAutoScroll: 'host',
};

function optionsChanged(
  previous: IgcChatOptions | undefined,
  next: IgcChatOptions | undefined,
  context: 'messages' | 'input'
): boolean {
  return (Object.keys(OPTION_READERS) as (keyof IgcChatOptions)[]).some(
    (key) =>
      (OPTION_READERS[key] === context || OPTION_READERS[key] === 'both') &&
      previous?.[key] !== next?.[key]
  );
}

/** Internal state manager for `<igc-chat>`. */
export class ChatState {
  //#region Internal properties and state
  private readonly _host: IgcChatComponent;

  private readonly _contextUpdateFn: () => unknown;
  private readonly _userInputContextUpdateFn: () => unknown;

  private _actionsTooltip?: IgcTooltipComponent;
  private _actionToast?: IgcToastComponent;

  private _options?: IgcChatOptions;

  private _inputAttachments: IgcChatMessageAttachment[] = [];
  private _inputValue = '';
  /** Parsed `acceptedFiles`: extensions, MIME types and wildcard types. */
  private _acceptedTypesCache: ChatAcceptedFileTypes | null = null;

  //#endregion

  //#region Public properties

  public messages: IgcChatMessage[] = [];

  public get host(): IgcChatComponent {
    return this._host;
  }

  public get acceptedFileTypes(): ChatAcceptedFileTypes | null {
    return this._acceptedTypesCache;
  }

  public get options(): IgcChatOptions | undefined {
    return this._options;
  }

  public set options(value: IgcChatOptions) {
    const previous = this._options;

    this._options = value;

    if (value?.acceptedFiles !== previous?.acceptedFiles) {
      this._acceptedTypesCache = value?.acceptedFiles
        ? parseAcceptedFileTypes(value.acceptedFiles)
        : null;
    }

    // Streaming sets options per chunk; republish only a context whose fields changed.
    if (optionsChanged(previous, value, 'messages')) {
      this._contextUpdateFn();
    }
    if (optionsChanged(previous, value, 'input')) {
      this._userInputContextUpdateFn();
    }
  }

  public get currentUserId(): string {
    return this._options?.currentUserId ?? 'user';
  }

  public get suggestionsPosition(): ChatSuggestionsPosition {
    return this._options?.suggestionsPosition ?? 'below-messages';
  }

  public get stopTypingDelay(): number {
    return this._options?.stopTypingDelay ?? 3000;
  }

  public get inputAttachments(): IgcChatMessageAttachment[] {
    return this._inputAttachments;
  }

  public set inputAttachments(value: IgcChatMessageAttachment[]) {
    this._inputAttachments = value;
    this._userInputContextUpdateFn();
  }

  public get inputValue(): string {
    return this._inputValue;
  }

  public set inputValue(value: string) {
    this._inputValue = value;
    this._userInputContextUpdateFn();
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

  /** @internal */
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

  protected _createMessage(message: Partial<IgcChatMessage>): IgcChatMessage {
    return {
      id: message.id ?? nanoid(),
      text: message.text ?? '',
      sender: message.sender ?? this.currentUserId,
      timestamp: message.timestamp ?? Date.now().toString(),
      attachments: message.attachments || [],
    };
  }

  //#region Public API

  /**
   * Emits the cancelable `igcMessageCreated` event.
   * On success, adds the message and clears the input.
   * @internal
   */
  public addMessageWithEvent(message: Partial<IgcChatMessage>): void {
    const newMessage = this._createMessage(message);

    if (
      this.emitEvent('igcMessageCreated', {
        detail: newMessage,
        cancelable: true,
      })
    ) {
      this.messages.push(this._createMessage(newMessage));
      this._host.requestUpdate('messages');
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

      const url = getFileURL(file);
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

    if (
      this.emitEvent('igcAttachmentAdded', {
        detail: newAttachments,
        cancelable: true,
      })
    ) {
      this.inputAttachments = [...this.inputAttachments, ...newAttachments];
    }
  }

  /**
   * Emits the cancelable `igcAttachmentRemoved` event.
   * On success, removes the attachment and revokes the URL of a file that no
   * sent message shows.
   * @internal
   */
  public removeAttachmentWithEvent(attachment: IgcChatMessageAttachment): void {
    const current = this.inputAttachments;

    if (
      !this.emitEvent('igcAttachmentRemoved', {
        detail: attachment,
        cancelable: true,
      })
    ) {
      return;
    }

    this.inputAttachments = current.toSpliced(current.indexOf(attachment), 1);

    const { file } = attachment;

    // A sent message still shows the file.
    if (
      file &&
      !this.messages.some((message) =>
        message.attachments?.some((each) => each.file === file)
      )
    ) {
      revokeFileURL(file);
    }
  }

  //#endregion
}

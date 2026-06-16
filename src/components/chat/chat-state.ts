import type { IChatResourceStrings } from 'igniteui-i18n-core';
import type { IgcChatResourceStrings } from '../common/i18n/EN/chat.resources.js';
import type { UnpackCustomEvent } from '../common/mixins/event-emitter.js';
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
  IgcChatMessagesChange,
  IgcChatOptions,
} from './types.js';
import {
  type ChatAcceptedFileTypes,
  isImageAttachment,
  parseAcceptedFileTypes,
} from './utils.js';

/**
 * Action info passed to MessagesArray change listeners.
 */
export type MessagesChangeAction =
  | { type: 'add'; index: number; item: IgcChatMessage }
  | { type: 'remove'; index: number; item: IgcChatMessage }
  | {
      type: 'replace';
      index: number;
      oldItem: IgcChatMessage;
      newItem: IgcChatMessage;
    }
  | { type: 'reset' };

/**
 * Array subclass that retains full Array semantics (length, indexing, iteration,
 * Array.isArray) for backward-compatible customer access, while also exposing
 * collection-style methods (add/insert/remove/removeAt/clear/item/count) and a
 * change listener so the Blazor wrapper's SyncableObservableCollection can
 * propagate single-item deltas across the JS/.NET bridge.
 */
export class MessagesArray extends Array<IgcChatMessage> {
  // Listeners
  private readonly _listeners: Set<(args: MessagesChangeAction) => void> =
    new Set();
  // multicast `collectionChanged` field for parity with ObservableCollection$1
  public collectionChanged:
    | ((sender: any, e: MessagesChangeAction) => void)
    | null = null;

  static override get [Symbol.species]() {
    // Ensure derived ops like slice/map return plain arrays (avoids accidentally
    // creating fresh MessagesArray instances that lack listeners).
    return Array;
  }

  addListener(listener: (args: MessagesChangeAction) => void): void {
    this._listeners.add(listener);
  }
  removeListener(listener: (args: MessagesChangeAction) => void): void {
    this._listeners.delete(listener);
  }
  private _fire(args: MessagesChangeAction): void {
    for (const l of this._listeners) {
      l(args);
    }
    if (this.collectionChanged != null) {
      this.collectionChanged(this, args);
    }
  }

  // Mutating Array methods that fire events
  override push(...items: IgcChatMessage[]): number {
    const start = this.length;
    const result = super.push(...items);
    for (let i = 0; i < items.length; i++) {
      this._fire({ type: 'add', index: start + i, item: items[i] });
    }
    return result;
  }
  override splice(
    start: number,
    deleteCount?: number,
    ...items: IgcChatMessage[]
  ): IgcChatMessage[] {
    const removed = super.splice(start, deleteCount ?? 0, ...items);
    for (let i = 0; i < removed.length; i++) {
      this._fire({ type: 'remove', index: start, item: removed[i] });
    }
    for (let i = 0; i < items.length; i++) {
      this._fire({ type: 'add', index: start + i, item: items[i] });
    }
    return removed;
  }
  override pop(): IgcChatMessage | undefined {
    const idx = this.length - 1;
    const item = super.pop();
    if (item !== undefined) {
      this._fire({ type: 'remove', index: idx, item });
    }
    return item;
  }
  override shift(): IgcChatMessage | undefined {
    const item = super.shift();
    if (item !== undefined) {
      this._fire({ type: 'remove', index: 0, item });
    }
    return item;
  }
  override unshift(...items: IgcChatMessage[]): number {
    const result = super.unshift(...items);
    for (let i = 0; i < items.length; i++) {
      this._fire({ type: 'add', index: i, item: items[i] });
    }
    return result;
  }

  // ObservableCollection-style API
  add(item: IgcChatMessage): void {
    this.push(item);
  }
  insert(index: number, item: IgcChatMessage): void {
    this.splice(index, 0, item);
  }
  remove(item: IgcChatMessage): boolean {
    const idx = this.indexOf(item);
    if (idx < 0) {
      return false;
    }
    this.splice(idx, 1);
    return true;
  }
  removeAt(index: number): void {
    this.splice(index, 1);
  }
  clear(): void {
    if (this.length === 0) {
      return;
    }
    super.splice(0, this.length);
    this._fire({ type: 'reset' });
  }
  item(index: number, value?: IgcChatMessage): IgcChatMessage {
    if (value !== undefined) {
      const oldItem = this[index];
      this[index] = value;
      this._fire({ type: 'replace', index, oldItem, newItem: value });
      return value;
    }
    return this[index];
  }
  get count(): number {
    return this.length;
  }

  /** Replace contents in place (preserving identity + listeners). */
  replaceAll(values: readonly IgcChatMessage[]): void {
    super.splice(0, this.length);
    for (const v of values) {
      super.push(v);
    }
    this._fire({ type: 'reset' });
  }
}

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

  /**
   * The current list of messages.
   *
   * Stored as a `MessagesArray` (an Array subclass with observable methods)
   * so that the Blazor wrapper's `SyncableObservableCollection` can hook into
   * single-item add/remove/replace deltas instead of re-reading the full
   * collection on every change. From a customer perspective this remains an
   * `IgcChatMessage[]` — `Array.isArray`, indexing, `.length`, `.push`,
   * iteration all work identically.
   */
  private _messages: MessagesArray = new MessagesArray();
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
   *
   * Replaces the contents of the existing `MessagesArray` in place so that
   * the observable identity (and any attached listeners on the JS side)
   * is preserved across assignments. Customers can still pass a plain
   * `IgcChatMessage[]`.
   */
  public set messages(value: IgcChatMessage[]) {
    if (value instanceof MessagesArray) {
      // Replace contents in place to preserve the existing observable identity.
      this._messages.replaceAll(value);
    } else {
      this._messages.replaceAll(value ?? []);
    }
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

    // Bridge MessagesArray mutations to a public `igcMessagesChanged` CustomEvent
    // so external consumers (e.g. the Blazor wrapper) can mirror the collection
    // with single-item deltas instead of re-reading the full array.
    //
    // Also call `requestUpdate('messages')` so Lit re-renders the chat UI on
    // every mutation path. The original `set messages(value) { this._messages = value }`
    // reassigned the property, which Lit's reactivity machinery detected
    // automatically; in-place mutations on the new MessagesArray (push, splice,
    // replaceAll, etc.) don't trigger that, so we have to nudge Lit ourselves.
    this._messages.addListener((change) => {
      this._host.requestUpdate('messages');

      let detail: IgcChatMessagesChange;
      switch (change.type) {
        case 'add':
          detail = {
            action: 'add',
            index: change.index,
            oldItems: [],
            newItems: [change.item],
          };
          break;
        case 'remove':
          detail = {
            action: 'remove',
            index: change.index,
            oldItems: [change.item],
            newItems: [],
          };
          break;
        case 'replace':
          detail = {
            action: 'replace',
            index: change.index,
            oldItems: [change.oldItem],
            newItems: [change.newItem],
          };
          break;
        case 'reset':
          detail = {
            action: 'reset',
            index: -1,
            oldItems: [],
            // Send the full new state on reset — the only O(N) path, used for
            // bulk reassignments like `chat.messages = [...]`.
            newItems: [...this._messages],
          };
          break;
      }
      this._host.emitEvent('igcMessagesChanged', { detail });
    });
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

  //#endregion
}

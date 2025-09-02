import { ContextProvider } from '@lit/context';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { repeat } from 'lit/directives/repeat.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import { chatContext } from '../common/context.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcChatResourceStringEN } from '../common/i18n/chat.resources.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { isEmpty } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcListComponent from '../list/list.js';
import IgcListHeaderComponent from '../list/list-header.js';
import IgcListItemComponent from '../list/list-item.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageComponent from './chat-message.js';
import { createChatState } from './chat-state.js';
import { styles } from './themes/chat.base.css.js';
import { styles as shared } from './themes/shared/chat.common.css.js';
import { all } from './themes/themes.js';
import type {
  IgcChatOptions,
  IgcMessage,
  IgcMessageAttachment,
} from './types.js';

/**
 * Defines the custom events dispatched by the `<igc-chat>` component.
 */
export interface IgcChatComponentEventMap {
  /**
   * Dispatched when a new chat message is created (sent).
   *
   * @event igcMessageCreated
   * @type {CustomEvent<IgcMessage>}
   * @detail The message that was created.
   */
  igcMessageCreated: CustomEvent<IgcMessage>;

  /**
   * Dispatched when a message is reacted to.
   *
   * @event igcMessageReact
   * @type {CustomEvent<IgcMessage, string>}
   * @detail The message that was reacted to and the reaction.
   */
  igcMessageReact: CustomEvent<{ message: IgcMessage; reaction: string }>;

  /**
   * Dispatched when a chat message attachment is clicked.
   *
   * @event igcAttachmentClick
   * @type {CustomEvent<IgcMessageAttachment>}
   * @detail The attachment that was clicked.
   */
  igcAttachmentClick: CustomEvent<IgcMessageAttachment>;

  /**
   * Dispatched when an attachment is changed (e.g., updated or removed).
   *
   * @event igcAttachmentChange
   * @type {CustomEvent<IgcMessageAttachment>}
   * @detail The attachment that was changed.
   */
  igcAttachmentChange: CustomEvent<IgcMessageAttachment>;

  /**
   * Dispatched during an attachment drag operation.
   *
   * @event igcAttachmentDrag
   * @type {CustomEvent<any>}
   * @detail The drag event payload.
   */
  igcAttachmentDrag: CustomEvent<any>;

  /**
   * Dispatched when an attachment is dropped (e.g., in a drag-and-drop operation).
   *
   * @event igcAttachmentDrop
   * @type {CustomEvent<any>}
   * @detail The drop event payload.
   */
  igcAttachmentDrop: CustomEvent<any>;

  /**
   * Dispatched when the typing status changes (e.g., user starts or stops typing).
   *
   * @event igcTypingChange
   * @type {CustomEvent<boolean>}
   * @detail `true` if typing started, `false` if stopped.
   */
  igcTypingChange: CustomEvent<boolean>;

  /**
   * Dispatched when the chat input field gains focus.
   *
   * @event igcInputFocus
   * @type {CustomEvent<any>}
   * @detail Focus event payload.
   */
  igcInputFocus: CustomEvent<any>;

  /**
   * Dispatched when the chat input field loses focus.
   *
   * @event igcInputBlur
   * @type {CustomEvent<any>}
   * @detail Blur event payload.
   */
  igcInputBlur: CustomEvent<any>;

  /**
   * Dispatched when the content of the chat input changes.
   *
   * @event igcInputChange
   * @type {CustomEvent<string>}
   * @detail The current text value of the input.
   */
  igcInputChange: CustomEvent<string>;
}

const Slots = setSlots(
  'prefix',
  'title',
  'actions',
  'suggestions-header',
  'suggestions',
  'suggestions-actions',
  'suggestion',
  'empty-state'
);

/**
 * A chat UI component for displaying messages, attachments, and input interaction.
 *
 * @element igc-chat
 *
 * @fires igcMessageCreated - Dispatched when a new chat message is created (sent).
 * @fires igcMessageReact - Dispatched when a message is reacted to.
 * @fires igcAttachmentClick - Dispatched when a chat message attachment is clicked.
 * @fires igcAttachmentChange - Dispatched when a message attachment is changed (e.g., updated or removed).
 * @fires igcAttachmentDrag - Dispatched during an attachment drag operation.
 * @fires igcAttachmentDrop - Dispatched when an attachment is dropped (e.g., in a drag-and-drop operation).
 * @fires igcTypingChange - Dispatched when the typing status changes (e.g., user starts or stops typing).
 * @fires igcInputFocus - Dispatched when the chat input field gains focus.
 * @fires igcInputBlur - Dispatched when the chat input field loses focus.
 * @fires igcInputChange - Dispatched when the content of the chat input changes.
 *
 * @slot prefix - Slot for injecting content (e.g., avatar or icon) before the chat title.
 * @slot title - Slot for overriding the chat title content.
 * @slot actions - Slot for injecting header actions (e.g., buttons, menus).
 * @slot suggestions-header - Slot for rendering a custom header for the suggestions list.
 * @slot suggestions - Slot for rendering a custom list of quick reply suggestions.
 * @slot suggestions-actions - Slot for rendering additional actions.
 * @slot suggestion - Slot for rendering a single suggestion item.
 * @slot empty-state - Slot shown when there are no messages.
 *
 * @csspart header - Styles the header container.
 * @csspart prefix - Styles the element before the title (e.g., avatar).
 * @csspart title - Styles the chat header title.
 * @csspart suggestions - Styles the suggestion container.
 * @csspart suggestion - Styles each suggestion item.
 */
export default class IgcChatComponent extends EventEmitterMixin<
  IgcChatComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-chat';

  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcChatComponent,
      IgcChatInputComponent,
      IgcChatMessageComponent,
      IgcButtonComponent,
      IgcIconComponent,
      IgcListComponent,
      IgcListItemComponent,
      IgcListHeaderComponent
    );
  }

  private readonly _chatState = createChatState(this);

  private readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  private _context = new ContextProvider(this, {
    context: chatContext,
    initialValue: this._chatState,
  });

  /**
   * The list of chat messages currently displayed.
   * Use this property to set or update the message history.
   */
  @property({ attribute: false })
  public set messages(value: IgcMessage[]) {
    this._chatState.messages = value;
  }

  public get messages(): IgcMessage[] {
    return this._chatState.messages;
  }

  /**
   * The chat message currently being composed but not yet sent.
   * Includes the draft text and any attachments.
   */
  @property({ attribute: false })
  public set draftMessage(value: {
    text: string;
    attachments?: IgcMessageAttachment[];
  }) {
    if (this._chatState && value) {
      this._chatState.inputValue = value.text;
      this._chatState.inputAttachments = value.attachments || [];
      this.requestUpdate();
    }
  }

  public get draftMessage(): {
    text: string;
    attachments?: IgcMessageAttachment[];
  } {
    return {
      text: this._chatState?.inputValue,
      attachments: this._chatState?.inputAttachments,
    };
  }

  /**
   * Controls the chat behavior and appearance through a configuration object.
   * Use this to toggle UI options, provide suggestions, templates, etc.
   */
  @property({ attribute: false })
  public set options(value: IgcChatOptions) {
    this._chatState.options = value;
  }

  public get options(): IgcChatOptions | undefined {
    return this._chatState.options;
  }

  /**
   * The resource strings of the chat.
   */
  @property({ attribute: false })
  public resourceStrings = IgcChatResourceStringEN;

  constructor() {
    super();
    addThemingController(this, all);
  }

  @watch('messages')
  @watch('draftMessage')
  @watch('options')
  protected contextChanged() {
    this._context.setValue(this._chatState, true);
  }

  // REVIEW: Maybe accept an `IgcMessage` type as well?
  /**
   * Scrolls the view to a specific message by id.
   * @param messageId - The id of the message to scroll to
   */
  public scrollToMessage(messageId: string): void {
    if (!isEmpty(this.messages)) {
      const message = this.renderRoot.querySelector(`#message-${messageId}`);
      message?.scrollIntoView({ block: 'center', inline: 'center' });
    }
  }

  /**
   * Updates the context value to notify all consumers that the chat state has changed.
   * This ensures that components consuming the chat context will re-render.
   */
  public updateContextValue() {
    this._context.setValue(this._chatState, true);
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('messages') && !this._chatState.disableAutoScroll) {
      this._scrollToBottom();
    }
  }

  private _scrollToBottom(): void {
    if (!isEmpty(this.messages)) {
      const lastMessage = this.renderRoot
        .querySelectorAll(IgcChatMessageComponent.tagName)
        .item(this.messages.length - 1);

      requestAnimationFrame(() =>
        lastMessage.scrollIntoView({ block: 'end', inline: 'end' })
      );
    }
  }

  private _renderHeader() {
    const hasContent =
      this._slots.hasAssignedElements('prefix') ||
      this._slots.hasAssignedElements('title') ||
      this._slots.hasAssignedElements('actions') ||
      this._chatState.options?.headerText;

    return html`
      <div part="header" ?hidden=${!hasContent}>
        <slot name="prefix" part="prefix"></slot>
        <slot name="title" part="title"
          >${this._chatState.options?.headerText}</slot
        >
        <slot name="actions" part="actions"></slot>
      </div>
    `;
  }

  private _renderMessages() {
    const messages = this._chatState?.messages ?? [];

    return html`
      <div part="message-list" tabindex="0">
        ${repeat(
          messages,
          (message) => message.id,
          (message) => {
            return html`
              <igc-chat-message
                id=${`message-${message.id}`}
                part="message-item"
                .message=${message}
                exportparts="message-container, message-text, message-attachments, message-actions,
                    attachments-container, attachment, attachment-header, attachment-content, attachment-icon, file-name, actions: attachment-actions"
              >
              </igc-chat-message>
            `;
          }
        )}
        ${this._chatState?.options?.isTyping
          ? (this._chatState?.options?.renderers?.typingIndicator?.({
              param: undefined,
              defaults: {
                typingIndicator: () => this._renderLoadingTemplate(),
              },
              options: this._chatState?.options,
            }) ?? this._renderLoadingTemplate())
          : nothing}
      </div>
    `;
  }

  private _renderLoadingTemplate() {
    return html`
      <div part="typing-indicator">
        <div part="typing-dot"></div>
        <div part="typing-dot"></div>
        <div part="typing-dot"></div>
        <div part="typing-dot"></div>
      </div>
    `;
  }

  private _renderSuggestionPrefix() {
    return html`
      <span slot="start">
        <igc-icon name="star-icon" collection="material"></igc-icon>
      </span>
    `;
  }

  private _renderSuggestions() {
    const hasContent = this._slots.hasAssignedElements('suggestions-header');
    const suggestions = this._chatState.options?.suggestions ?? [];

    return html`
      <div part="suggestions-container">
        <igc-list>
          <igc-list-header part="suggestions-header">
            <span ?hidden=${hasContent}>
              ${this.resourceStrings.suggestionsHeader}
            </span>
            <slot name="suggestions-header"></slot>
          </igc-list-header>
          <slot name="suggestions" part="suggestions">
            ${suggestions.map(
              (suggestion) => html`
                <slot name="suggestion" part="suggestion">
                  <igc-list-item
                    @click=${() =>
                      this._chatState?.handleSuggestionClick(suggestion)}
                  >
                    ${this._renderSuggestionPrefix()}
                    <span slot="title">${suggestion}</span>
                  </igc-list-item>
                </slot>
              `
            )}
          </slot>
          <slot name="suggestions-actions" part="suggestions-actions"></slot>
        </igc-list>
      </div>
    `;
  }

  private _renderEmptyState() {
    return html`
      <div part="empty-state">
        <slot name="empty-state"></slot>
      </div>
    `;
  }

  protected override render() {
    const hasMessages = !isEmpty(this.messages);
    const suggestions = isEmpty(this._chatState.options?.suggestions ?? [])
      ? nothing
      : this._renderSuggestions();

    return html`
      <div
        part="chat-container"
        exportparts="
          chat-container,
          header,
          prefix,
          title,
          actions,
          chat-wrapper,
          chat-messages,
          empty-state,
          suggestions-container,
          suggestions-header,
          suggestions,
          suggestions-actions,
          suggestion,
          message-container,
          message-list,
          message-item,
          message,
          message-text,
          message-attachments,
          message-actions,
          typing-indicator,
          attachments-container,
          attachment,
          attachment-header,
          attachment-content,
          attachment-icon,
          file-name,
          attachment-actions
        "
      >
        ${this._renderHeader()}

        <div part="chat-wrapper">
          ${cache(
            hasMessages ? this._renderMessages() : this._renderEmptyState()
          )}
          ${this._chatState.suggestionsPosition === 'below-messages'
            ? suggestions
            : nothing}
        </div>

        <igc-chat-input
          exportparts="
              input-container,
              input-wrapper,
              attachments: input-attachments-container,
              attachments-wrapper: input-attachment,
              attachment-name: input-attachment-name,
              text-input,
              buttons-container: input-buttons-container,
              upload-button,
              send-button"
        >
        </igc-chat-input>
        ${this._chatState.suggestionsPosition === 'below-input'
          ? suggestions
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    /** The `<igc-chat>` custom element. */
    'igc-chat': IgcChatComponent;
  }
}

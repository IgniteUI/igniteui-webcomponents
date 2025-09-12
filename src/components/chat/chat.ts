import { ContextProvider } from '@lit/context';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { repeat } from 'lit/directives/repeat.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import { chatContext, chatUserInputContext } from '../common/context.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcChatResourceStringEN } from '../common/i18n/chat.resources.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { isEmpty, last } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcListComponent from '../list/list.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageComponent from './chat-message.js';
import { ChatState } from './chat-state.js';
import { styles } from './themes/chat.base.css.js';
import { styles as shared } from './themes/shared/chat.common.css.js';
import { all } from './themes/themes.js';
import type {
  ChatRendererContext,
  ChatTemplateRenderer,
  IgcChatOptions,
  IgcMessage,
  IgcMessageAttachment,
} from './types.js';

type DefaultChatRenderers = {
  typingIndicator: ChatTemplateRenderer<ChatRendererContext>;
  suggestionPrefix: ChatTemplateRenderer<ChatRendererContext>;
};

/**
 * Defines the custom events dispatched by the `<igc-chat>` component.
 */
export interface IgcChatComponentEventMap {
  /**
   * Dispatched when a new chat message is created (sent).
   */
  igcMessageCreated: CustomEvent<IgcMessage>;

  /**
   * Dispatched when a message is reacted to.
   */
  igcMessageReact: CustomEvent<{ message: IgcMessage; reaction: string }>;

  /**
   * Dispatched when a chat message attachment is clicked.
   */
  igcAttachmentClick: CustomEvent<IgcMessageAttachment>;

  /**
   * Dispatched when an attachment is changed (e.g., updated or removed).
   */
  igcAttachmentChange: CustomEvent<IgcMessageAttachment>;

  /**
   * Dispatched during an attachment drag operation.
   */
  igcAttachmentDrag: CustomEvent<void>;

  /**
   * Dispatched when an attachment is dropped (e.g., in a drag-and-drop operation).
   */
  igcAttachmentDrop: CustomEvent<void>;

  /**
   * Dispatched when the typing status changes (e.g., user starts or stops typing).
   */
  igcTypingChange: CustomEvent<boolean>;

  /**
   * Dispatched when the chat input field gains focus.
   */
  igcInputFocus: CustomEvent<void>;

  /**
   * Dispatched when the chat input field loses focus.
   */
  igcInputBlur: CustomEvent<void>;

  /**
   * Dispatched when the content of the chat input changes.
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
      IgcListComponent
    );
  }

  private readonly _state = new ChatState(
    this,
    this._updateContext,
    this._updateUserInputContext
  );

  private readonly _defaults = Object.freeze<DefaultChatRenderers>({
    typingIndicator: () => this._renderLoadingTemplate(),
    suggestionPrefix: () => this._renderSuggestionPrefix(),
  });

  private readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  private readonly _context = new ContextProvider(this, {
    context: chatContext,
    initialValue: this._state,
  });

  private readonly _userInputContext = new ContextProvider(this, {
    context: chatUserInputContext,
    initialValue: this._state,
  });

  private _updateContext(): void {
    this._context.setValue(this._state, true);
  }

  private _updateUserInputContext(): void {
    this._userInputContext.setValue(this._state, true);
  }

  /**
   * The list of chat messages currently displayed.
   * Use this property to set or update the message history.
   */
  @property({ attribute: false })
  public set messages(value: IgcMessage[]) {
    this._state.messages = value;
  }

  public get messages(): IgcMessage[] {
    return this._state.messages;
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
    if (this._state && value) {
      this._state.inputValue = value.text;
      this._state.inputAttachments = value.attachments || [];
      this.requestUpdate();
    }
  }

  public get draftMessage(): {
    text: string;
    attachments?: IgcMessageAttachment[];
  } {
    return {
      text: this._state.inputValue,
      attachments: this._state.inputAttachments,
    };
  }

  /**
   * Controls the chat behavior and appearance through a configuration object.
   * Use this to toggle UI options, provide suggestions, templates, etc.
   */
  @property({ attribute: false })
  public set options(value: IgcChatOptions) {
    this._state.options = value;
  }

  public get options(): IgcChatOptions | undefined {
    return this._state.options;
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

  private _getRenderer<U extends keyof DefaultChatRenderers>(
    name: U
  ): DefaultChatRenderers[U] {
    return this._state.options?.renderers
      ? (this._state.options.renderers[name] ?? this._defaults[name])
      : this._defaults[name];
  }

  // REVIEW: Maybe accept an `IgcMessage` type as well?
  /**
   * Scrolls the view to a specific message by id.
   * @param messageId - The id of the message to scroll to
   */
  public scrollToMessage(messageId: string): void {
    if (!isEmpty(this.messages)) {
      const message = this.renderRoot.querySelector(`#message-${messageId}`);
      message?.scrollIntoView({ block: 'end', inline: 'end' });
    }
  }

  // REVIEW
  public addMessage(message: Partial<IgcMessage>): IgcMessage {
    this._state.addMessage(message);
    return last(this.messages);
  }

  // REVIEW
  public updateMessage(
    message: IgcMessage,
    data: Partial<IgcMessage>,
    scrollIntoView = false
  ) {
    Object.assign(message, data);
    const messageElement =
      this.renderRoot.querySelector<IgcChatMessageComponent>(
        `#message-${message.id}`
      );

    if (messageElement) {
      messageElement.requestUpdate();
      if (scrollIntoView) {
        messageElement.updateComplete.then(() =>
          messageElement.scrollIntoView({ block: 'end', inline: 'end' })
        );
      }
    } else {
      this.requestUpdate('messages');
    }
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('messages') && !this._state.disableAutoScroll) {
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
      this._state.options?.headerText;

    return html`
      <div part="header" ?hidden=${!hasContent}>
        <slot
          name="prefix"
          part="prefix"
          ?hidden=${!this._slots.hasAssignedElements('prefix')}
        ></slot>
        <slot name="title" part="title"
          >${this._state.options?.headerText}</slot
        >
        <slot name="actions" part="actions"></slot>
      </div>
    `;
  }

  private _renderMessages() {
    const ctx = { defaults: this._defaults, instance: this };

    return html`
      <div part="message-list" tabindex="0">
        ${repeat(
          this._state.messages,
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
        ${this._state.options?.isTyping
          ? this._getRenderer('typingIndicator')(ctx)
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
    return html`<igc-icon name="auto_suggest"></igc-icon>`;
  }

  private _renderSuggestions() {
    const hasContent = this._slots.hasAssignedElements('suggestions-header');
    const suggestions = this._state.options?.suggestions ?? [];
    const ctx = { instance: this };

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
                      this._state?.handleSuggestionClick(suggestion)}
                  >
                    <span slot="start">
                      ${this._getRenderer('suggestionPrefix')(ctx)}
                    </span>
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
    const suggestions = isEmpty(this._state.options?.suggestions ?? [])
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
            hasMessages || this._state.options?.isTyping
              ? this._renderMessages()
              : this._renderEmptyState()
          )}
          ${this._state.suggestionsPosition === 'below-messages'
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
        ${this._state.suggestionsPosition === 'below-input'
          ? suggestions
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat': IgcChatComponent;
  }
}

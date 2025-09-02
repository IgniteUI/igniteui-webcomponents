import { ContextProvider } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
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
 * This component is part of the Ignite UI Web Components suite.
 *
 * @element igc-chat
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
  /**
   * Registers the chat component and its child components.
   * Should be called once before using the component.
   *
   * @example
   * IgcChatComponent.register();
   */
  public static register() {
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
  constructor() {
    super();
    addThemingController(this, all);
  }

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

  /**
   * Scrolls the view to a specific message by id.
   * @param messageId - The id of the message to scroll to
   */
  public scrollToMessage(messageId: string) {
    // Find the message list component
    const messageListComponent = this.shadowRoot?.querySelector(
      'div[part="message-list"]'
    );
    if (!messageListComponent) {
      return;
    }

    // Look for the message element inside the message list's shadow DOM
    const messageElement = messageListComponent.shadowRoot?.querySelector(
      `#message-${messageId}`
    );

    if (!messageElement) {
      return;
    }

    // Scroll the message into view with smooth behavior
    messageElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }

  @watch('messages')
  @watch('draftMessage')
  @watch('options')
  protected contextChanged() {
    this._context.setValue(this._chatState, true);
  }

  /**
   * Scrolls to bottom unless auto-scroll is disabled.
   */
  protected override updated() {
    if (!this._chatState?.options?.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Scrolls the container to the bottom, typically called after new messages are rendered.
   * @private
   */
  private async scrollToBottom() {
    // TODO: fix
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    setTimeout(() => {
      const container = this.shadowRoot?.host as HTMLElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  private renderHeader() {
    const hasContent =
      this._slots.hasAssignedElements('prefix') ||
      this._slots.hasAssignedElements('title') ||
      this._slots.hasAssignedElements('actions') ||
      this._chatState.options?.headerText;
    return html` <div part="header" ?hidden=${!hasContent}>
      <slot name="prefix" part="prefix"></slot>
      <slot name="title" part="title"
        >${this._chatState.options?.headerText}</slot
      >
      <slot name="actions" part="actions"></slot>
    </div>`;
  }

  private renderMessages() {
    const messages = this._chatState?.messages ?? [];

    return html`
      <div
        part="message-list"
        aria-label="Message list"
        role="group"
        tabindex="0"
      >
        ${repeat(
          messages,
          (message) => message.id,
          (message) => {
            const messageId = `message-${message.id}`;
            return html`
              <igc-chat-message
                id=${messageId}
                role="option"
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
                typingIndicator: () => this.renderLoadingTemplate(),
              },
              options: this._chatState?.options,
            }) ?? this.renderLoadingTemplate())
          : nothing}
      </div>
    `;
  }

  private *renderLoadingTemplate() {
    yield html`<div part="typing-indicator">
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
    </div>`;
  }

  private renderSuggestionPrefix() {
    return html`<span slot="start">
      <igc-icon name="star-icon" collection="material"></igc-icon>
    </span>`;
  }

  private renderSuggestions() {
    const hasContent = this._slots.hasAssignedElements('suggestions-header');
    return html`<div part="suggestions-container">
      <igc-list role="list" aria-label="Suggestions">
        <igc-list-header part="suggestions-header">
          <span ?hidden=${hasContent}>
            ${this.resourceStrings.suggestionsHeader}
          </span>
          <slot name="suggestions-header"></slot>
        </igc-list-header>
        <slot name="suggestions" part="suggestions">
          ${this._chatState.options?.suggestions?.map(
            (suggestion) => html`
              <slot name="suggestion" part="suggestion" role="listitem">
                <igc-list-item
                  @click=${() =>
                    this._chatState?.handleSuggestionClick(suggestion)}
                >
                  ${this.renderSuggestionPrefix()}
                  <span slot="title">${suggestion}</span>
                </igc-list-item>
              </slot>
            `
          )}
        </slot>
        <slot name="suggestions-actions" part="suggestions-actions"></slot>
      </igc-list>
    </div>`;
  }

  /**
   * Updates the context value to notify all consumers that the chat state has changed.
   * This ensures that components consuming the chat context will re-render.
   */
  public updateContextValue() {
    this._context.setValue(this._chatState, true);
  }

  protected override render() {
    const hasSuggestions =
      this._chatState.options?.suggestions &&
      this._chatState.options.suggestions.length > 0;
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
        ${this.renderHeader()}
        <div part="chat-wrapper">
          ${this.messages.length === 0
            ? html`<div part="empty-state">
                <slot name="empty-state"> </slot>
              </div>`
            : this.renderMessages()}
          ${hasSuggestions &&
          this._chatState.suggestionsPosition === 'below-messages'
            ? this.renderSuggestions()
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
        ${hasSuggestions &&
        this._chatState.suggestionsPosition === 'below-input'
          ? this.renderSuggestions()
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

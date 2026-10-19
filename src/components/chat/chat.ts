import {
  ChatResourceStringsEN,
  type IChatResourceStrings,
} from 'igniteui-i18n-core';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { guard } from 'lit/directives/guard.js';
import { repeat } from 'lit/directives/repeat.js';
import { chatContext, chatUserInputContext } from '#internals/context.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { IgcChatResourceStrings } from '#internals/i18n/EN/chat.resources.js';
import { addI18nController } from '#internals/i18n/i18n-controller.js';
import { chatResourcesMap } from '#internals/i18n/utils.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { all } from '#themes/chat/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconComponent from '../icon/icon.js';
import IgcListHeaderComponent from '../list/list-header.js';
import IgcListItemComponent from '../list/list-item.js';
import IgcListComponent from '../list/list.js';
import IgcToastComponent from '../toast/toast.js';
import IgcTooltipComponent from '../tooltip/tooltip.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageComponent from './chat-message.js';
import { ChatState } from './chat-state.js';
import { styles } from './themes/chat.base.css.js';
import { styles as shared } from './themes/shared/chat.common.css.js';
import type {
  ChatRenderContext,
  ChatTemplateRenderer,
  IgcChatDraftMessage,
  IgcChatMessage,
  IgcChatMessageAttachment,
  IgcChatMessageReaction,
  IgcChatOptions,
} from './types.js';

/** The distance from the bottom, in pixels, that still counts as the bottom. */
const BOTTOM_TOLERANCE = 2;

type DefaultChatRenderers = {
  suggestionPrefix: ChatTemplateRenderer<ChatRenderContext>;
};

/**
 * Defines the custom events dispatched by the chat component.
 */
export interface IgcChatComponentEventMap {
  /**
   * Dispatched when a new chat message is created (sent).
   */
  igcMessageCreated: CustomEvent<IgcChatMessage>;

  /**
   * Dispatched when a message is reacted to.
   */
  igcMessageReact: CustomEvent<IgcChatMessageReaction>;

  /**
   * Dispatched when a chat message attachment is clicked.
   */
  igcAttachmentClick: CustomEvent<IgcChatMessageAttachment>;

  /* blazorSuppress */
  /**
   * Dispatched when attachment(s) are added either through drag & drop or through
   * the default file input.
   */
  igcAttachmentAdded: CustomEvent<IgcChatMessageAttachment[]>;

  /* blazorSuppress */
  /**
   * Dispatched when an attachment is removed by the user.
   */
  igcAttachmentRemoved: CustomEvent<IgcChatMessageAttachment>;

  /* blazorSuppress */
  /**
   * Dispatched during an attachment drag operation.
   */
  igcAttachmentDrag: CustomEvent<void>;

  /* blazorSuppress */
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
  'empty-state',
  'typing-indicator'
);

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/**
 * A chat UI component for displaying messages, attachments, and input interaction.
 *
 * @element igc-chat
 *
 * @fires igcMessageCreated - Dispatched when a new chat message is created (sent).
 * @fires igcMessageReact - Dispatched when a message is reacted to.
 * @fires igcAttachmentClick - Dispatched when a chat message attachment is clicked.
 * @fires igcAttachmentAdded - Dispatched when attachment(s) are added either through drag & drop or through the default file input.
 * @fires igcAttachmentRemoved - Dispatched when an attachment is removed by the user.
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
 * @slot typing-indicator - Slot for the "is typing" indicator.
 *
 * @csspart chat-container - Styles the main chat container.
 * @csspart header - Styles the chat header container.
 *
 * @csspart message-area-container - Styles the container holding the messages and (optional) suggestions.
 * @csspart message-list - Styles the message list container.
 * @csspart message-item - Styles each message wrapper.
 * @csspart typing-indicator - Styles the typing indicator container.
 * @csspart typing-dot - Styles individual typing indicator dots.
 *
 * @csspart suggestions-container - Styles the container holding all suggestions.
 * @csspart suggestions-header - Styles the suggestions header.
 * @csspart suggestion - Styles each suggestion item.
 * @csspart suggestion-prefix - Styles the icon or prefix in a suggestion.
 * @csspart suggestion-title - Styles the text/title of a suggestion.
 *
 * @csspart empty-state - Styles the empty state container when there are no messages.
 *
 * @csspart input-area-container - Styles the wrapper around the chat input area.
 * @csspart input-area - Styles the main text input area.
 * @csspart input-container - Styles the wrapper around the text input.
 * @csspart input-attachments-container - Styles the container for attachments in the input.
 * @csspart input-attachment-container - Styles a single attachment in the input area.
 * @csspart input-attachment-name - Styles the file name of an attachment.
 * @csspart input-attachment-icon - Styles the icon of an attachment.
 * @csspart text-input - Styles the text input field for typing messages.
 * @csspart input-actions-container - Styles the container for input actions.
 * @csspart input-actions-start - Styles the group of actions at the start of the input after the default file upload.
 * @csspart input-actions-end - Styles the group of actions at the end of the input.
 * @csspart file-upload-container - Styles the container for the file upload input.
 * @csspart file-upload - Styles the file upload input itself.
 * @csspart send-button-container - Styles the container around the send button.
 * @csspart send-button - Styles the send button.
 *
 * @csspart message-container - Styles the container of a single message.
 * @csspart message-header - Styles the header of a message (e.g., sender, timestamp).
 * @csspart message-content - Styles the text content of a message.
 * @csspart message-attachments-container - Styles the container for message attachments.
 * @csspart message-attachment - Styles a single message attachment.
 * @csspart message-actions-container - Styles the container holding message actions.
 * @csspart message-sent - Styles messages marked as sent by the current user.
 * @csspart attachment-header - Styles the header of an attachment block.
 * @csspart attachment-content - Styles the content of an attachment block.
 * @csspart attachment-icon - Styles the icon of an attachment.
 * @csspart file-name - Styles the file name shown in an attachment.
 */
export default class IgcChatComponent extends EventEmitterMixin<IgcChatComponentEventMap>(
  LitElement
) {
  public static readonly tagName = 'igc-chat';

  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcChatComponent,
      IgcChatInputComponent,
      IgcChatMessageComponent,
      IgcButtonComponent,
      IgcIconComponent,
      IgcListComponent,
      IgcListHeaderComponent,
      IgcListItemComponent,
      IgcTooltipComponent,
      IgcToastComponent
    );
  }

  private readonly _state: ChatState = new ChatState(
    this,
    () => this._context.publish(),
    () => this._userInputContext.publish()
  );

  private readonly _defaults = Object.freeze<DefaultChatRenderers>({
    suggestionPrefix: () => this._renderSuggestionPrefix(),
  });

  private readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  // Before the context providers, so they publish the strings of the current locale.
  private readonly _i18nController = addI18nController<
    IgcChatResourceStrings | IChatResourceStrings
  >(this, {
    defaultEN: ChatResourceStringsEN,
    resourceMap: chatResourcesMap,
  });

  // The input and the messages read the labels through this context.
  private readonly _context = addContextProvider(this, {
    context: chatContext,
    value: () => this._state,
    watch: ['resourceStrings'],
  });

  private readonly _userInputContext = addContextProvider(this, {
    context: chatUserInputContext,
    value: () => this._state,
  });

  @query(IgcChatInputComponent.tagName)
  private readonly _input?: IgcChatInputComponent;

  @query('[part="message-area-container"]', true)
  private readonly _scrollContainer!: HTMLElement;

  /** Whether the list follows the newest message. */
  private _followNewest = true;
  private _lastScrollTop = 0;
  private _lastMessageId?: string;

  /**
   * The list of chat messages currently displayed.
   * Use this property to set or update the message history.
   */
  @property({ attribute: false })
  public set messages(value: IgcChatMessage[]) {
    this._state.messages = value;
  }

  public get messages(): IgcChatMessage[] {
    return this._state.messages;
  }

  /**
   * The chat message currently being composed but not yet sent.
   * Includes the draft text and any attachments.
   */
  @property({ attribute: false })
  public set draftMessage(value: IgcChatDraftMessage) {
    if (value) {
      this._state.inputValue = value.text;
      this._state.inputAttachments = value.attachments || [];
    }
  }

  public get draftMessage(): IgcChatDraftMessage {
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

  /* blazorSuppress */
  /**
   * The resource strings of the chat.
   */
  @property({ attribute: false })
  public set resourceStrings(
    value: IgcChatResourceStrings | IChatResourceStrings
  ) {
    this._i18nController.resourceStrings = value;
  }

  /* blazorSuppress */
  public get resourceStrings(): IgcChatResourceStrings & IChatResourceStrings {
    return this._i18nController.resourceStrings;
  }

  constructor() {
    super();
    addThemingController(this, all);
  }

  private _getRenderer<U extends keyof DefaultChatRenderers>(
    name: U
  ): DefaultChatRenderers[U] {
    return this._state.options?.renderers?.[name] ?? this._defaults[name];
  }

  private _handleSuggestionClick(text: string): void {
    this._state.addMessageWithEvent({ text });
    this._input?.focusInput();
  }

  /**
   * Scrolls the view to a specific message by id.
   */
  public scrollToMessage(messageId: string): void {
    this.renderRoot
      .querySelector(`#message-${messageId}`)
      ?.scrollIntoView({ block: 'end', inline: 'end' });
  }

  /**
   * Moves the focus to the text area of the chat input. Does nothing when a
   * custom `input` renderer replaces the text area.
   */
  public focusInput(options?: FocusOptions): void {
    this._input?.focusInput(options);
  }

  private _handleScroll(): void {
    const { scrollTop, scrollHeight, clientHeight } = this._scrollContainer;

    if (scrollHeight - scrollTop - clientHeight <= BOTTOM_TOLERANCE) {
      this._followNewest = true;
    } else if (scrollTop < this._lastScrollTop) {
      // New content and the scroll to the bottom never move the list up.
      this._followNewest = false;
    }

    this._lastScrollTop = scrollTop;
  }

  /** Follows again for a new message of the current user, or for replaced messages. */
  private _updateFollowNewest(): void {
    const messages = this._state.messages;
    const previous = messages.findLastIndex(
      ({ id }) => id === this._lastMessageId
    );

    // One update can add a message of the current user and a reply after it.
    this._followNewest ||=
      (previous < 0 && this._lastMessageId !== undefined) ||
      messages
        .slice(previous + 1)
        .some((message) => this._state.isCurrentUserMessage(message));

    this._lastMessageId = messages.at(-1)?.id;
  }

  protected override updated(properties: PropertyValues<this>): void {
    this._updateFollowNewest();

    if (this._state.options?.disableAutoScroll || !this._followNewest) {
      return;
    }

    if (properties.has('messages') || this._contentAdded(properties)) {
      this._scrollToBottom();
    }
  }

  /** Whether the typing indicator or new suggestions appeared. */
  private _contentAdded(properties: PropertyValues<this>): boolean {
    if (!properties.has('options')) {
      return false;
    }

    const previous = properties.get('options');
    const current = this.options;

    return (
      (Boolean(current?.isTyping) && !previous?.isTyping) ||
      (current?.suggestions !== previous?.suggestions &&
        Boolean(current?.suggestions?.length))
    );
  }

  private _scrollToBottom(): void {
    // Read in the frame, after the layout that the update caused.
    requestAnimationFrame(() => {
      // The user can scroll up before the frame.
      if (!this._followNewest) {
        return;
      }

      const { scrollTop, scrollHeight } = this._scrollContainer;
      this._scrollContainer.scrollBy({ top: scrollHeight - scrollTop });
    });
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
          ?hidden=${!this._slots.hasAssignedElements('prefix')}
        ></slot>
        <slot name="title">${this._state.options?.headerText}</slot>
        <slot name="actions"></slot>
      </div>
    `;
  }

  private _renderMessages() {
    return html`
      <div part="message-list" tabindex="0">
        ${repeat(
          this._state.messages,
          (message) => message.id,
          // The message element updates only for a new message object.
          (message) =>
            guard(
              [message],
              () => html`
                <igc-chat-message
                  id=${`message-${message.id}`}
                  part="message-item"
                  .message=${message}
                  exportparts="
                  message-container,
                  message-header,
                  plain-text: message-content,
                  message-attachments: message-attachments-container,
                  attachment: message-attachment,
                  message-actions: message-actions-container,
                  sent: message-sent,
                  attachment-header,
                  attachment-content,
                  attachment-icon,
                  file-name,
                "
                >
                </igc-chat-message>
              `
            )
        )}
        ${
          this._state.options?.isTyping
            ? html`
                <div part="typing-indicator">
                  <slot name="typing-indicator"
                    >${this._renderLoadingTemplate()}</slot
                  >
                </div>
              `
            : nothing
        }
      </div>
    `;
  }

  private _renderLoadingTemplate() {
    return html`
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
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
              ${this.resourceStrings.chat_suggestions_header}
            </span>
            <slot name="suggestions-header"></slot>
          </igc-list-header>
          <slot name="suggestions">
            ${suggestions.map(
              (suggestion) => html`
                <slot name="suggestion">
                  <igc-list-item
                    part="suggestion"
                    @click=${() => this._handleSuggestionClick(suggestion)}
                  >
                    <span slot="start" part="suggestion-prefix">
                      ${this._getRenderer('suggestionPrefix')(ctx)}
                    </span>
                    <span slot="title" part="suggestion-title"
                      >${suggestion}</span
                    >
                  </igc-list-item>
                </slot>
              `
            )}
          </slot>
          <slot name="suggestions-actions"></slot>
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
      <div part="chat-container">
        ${this._renderHeader()}

        <div part="message-area-container" @scroll=${this._handleScroll}>
          ${cache(
            hasMessages || this._state.options?.isTyping
              ? this._renderMessages()
              : this._renderEmptyState()
          )}
          ${
            this._state.suggestionsPosition === 'below-messages'
              ? suggestions
              : nothing
          }
        </div>

        <div part="input-area-container">
          <igc-chat-input
            exportparts="
                input-container: input-area,
                input-wrapper: input-container,
                attachments: input-attachments-container,
                attachment-wrapper: input-attachment-container,
                attachment-name: input-attachment-name,
                attachment-icon: input-attachment-icon,
                text-input,
                actions-container: input-actions-container,
                input-actions-start,
                input-actions-end,
                file-upload-container,
                file-upload,
                send-button-container,
                send-button"
          >
          </igc-chat-input>
          ${
            this._state.suggestionsPosition === 'below-input'
              ? suggestions
              : nothing
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat': IgcChatComponent;
  }
}

import { consume } from '@lit/context';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { chatContext } from '../common/context.js';
import {
  addKeybindings,
  arrowDown,
  arrowUp,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcChatMessageComponent from './chat-message.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/message-list.base.css.js';
import { styles as shared } from './themes/shared/message-list.common.css.js';
import type { IgcChatDefaultTemplates, IgcMessage } from './types.js';

/**
 * A chat message list component that displays a list of chat messages grouped by date.
 *
 * @element igc-chat-message-list
 *
 * This component:
 * - Renders messages using the `<igc-chat-message>` component.
 * - Supports keyboard navigation between messages (Home, End, ArrowUp, ArrowDown).
 * - Manages focus highlighting on active messages.
 * - Automatically scrolls to the bottom when new messages arrive, unless auto-scroll is disabled.
 * - Displays a typing indicator if the chat state option `isComposing` is true.
 *
 * Accessibility:
 * - Uses ARIA roles and properties for grouping and active descendant management.
 * - Message items have role="option" for assistive technologies.
 *
 */
export default class IgcChatMessageListComponent extends LitElement {
  /** Tag name of the custom element. */
  public static readonly tagName = 'igc-chat-message-list';

  /** Styles applied to the component */
  public static override styles = [styles, shared];

  /**
   * Consumed chat state context providing messages, options, and user data.
   * @private
   */
  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  /**
   * Currently active message id used for focus and keyboard navigation.
   * @private
   */
  @state()
  private _activeMessageId = '';

  /**
   * Registers this component and its dependencies.
   * Used internally for component setup.
   */
  /* blazorSuppress */
  public static register() {
    registerComponent(IgcChatMessageListComponent, IgcChatMessageComponent);
  }

  constructor() {
    super();
    addKeybindings(this)
      .set(homeKey, this.navigateToMessage)
      .set(endKey, this.navigateToMessage)
      .set(arrowUp, this.navigateToMessage)
      .set(arrowDown, this.navigateToMessage);
  }

  /**
   * Formats a date to a human-readable label.
   * Returns 'Today', 'Yesterday', or localized date string.
   * @param date - Date object to format
   * @returns formatted string
   * @private
   */
  private formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Groups messages by their date labels.
   * @param messages - Array of messages to group
   * @returns Array of groups with date label and messages
   * @private
   */
  private groupMessagesByDate(
    messages: IgcMessage[]
  ): { date: string; messages: IgcMessage[] }[] {
    const grouped: { [key: string]: IgcMessage[] } = {};

    messages.forEach((message) => {
      const dateStr = this.formatDate(message.timestamp);
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(message);
    });

    return Object.keys(grouped).map((date) => ({
      date,
      messages: grouped[date],
    }));
  }

  /**
   * Scrolls the container to the bottom, typically called after new messages are rendered.
   * @private
   */
  private scrollToBottom() {
    requestAnimationFrame(() => {
      const container = this.shadowRoot?.host as HTMLElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  /**
   * Scrolls the view to a specific message by id.
   * @param messageId - The id of the message to scroll to
   * @private
   */
  private scrollToMessage(messageId: string) {
    const messageElement = this.shadowRoot?.querySelector(
      `#message-${messageId}`
    );
    messageElement?.scrollIntoView();
  }

  /**
   * Handles focus entering the message list container.
   * Sets the active message to the last message for keyboard navigation.
   * @private
   */
  private handleFocusIn() {
    if (!this._chatState?.messages || this._chatState.messages.length === 0) {
      return;
    }
    const lastMessage = this._chatState.sortedMessagesIds?.pop() ?? '';
    this._activeMessageId = lastMessage !== '' ? `message-${lastMessage}` : '';
  }

  /**
   * Handles focus leaving the message list container.
   * Clears the active message.
   * @private
   */
  private handleFocusOut() {
    this._activeMessageId = '';
  }

  /**
   * Handles keyboard navigation within the message list.
   * Supports Home, End, ArrowUp, ArrowDown keys to move active message focus.
   * @param e KeyboardEvent from user input
   * @private
   */
  private navigateToMessage(e: KeyboardEvent) {
    if (!this._chatState?.messages || this._chatState.messages.length === 0) {
      return;
    }

    const currentIndex = this._chatState?.sortedMessagesIds.findIndex(
      (id) => `message-${id}` === this._activeMessageId
    );
    let activeMessageId = '';
    const key = e.key.toLowerCase();

    switch (key) {
      case 'home':
        activeMessageId = this._chatState.sortedMessagesIds[0];
        break;
      case 'end':
        activeMessageId =
          this._chatState.sortedMessagesIds[
            this._chatState.sortedMessagesIds.length - 1
          ];
        break;
      case 'arrowup':
        if (currentIndex > 0) {
          activeMessageId = this._chatState.sortedMessagesIds[currentIndex - 1];
        }
        break;
      case 'arrowdown':
        if (currentIndex < this._chatState?.messages.length - 1) {
          activeMessageId = this._chatState.sortedMessagesIds[currentIndex + 1];
        }
        break;
      default:
        return; // Ignore other keys
    }

    this._activeMessageId = `message-${activeMessageId}`;
    this.scrollToMessage(activeMessageId);
  }

  private get defaultComposingIndicatorTemplate(): TemplateResult {
    return html`<div part="typing-indicator">
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
    </div>`;
  }

  /**
   * Lifecycle: called when the component updates.
   * Scrolls to bottom unless auto-scroll is disabled.
   */
  protected override updated() {
    if (!this._chatState?.options?.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Lifecycle: called after first render.
   * Scrolls to bottom unless auto-scroll is disabled.
   */
  protected override firstUpdated() {
    if (this._chatState) {
      if (!this._chatState.options?.disableAutoScroll) {
        this.scrollToBottom();
      }
      this._chatState.defaultTemplates = {
        ...this._chatState?.defaultTemplates,
        defaultComposingIndicator: this.defaultComposingIndicatorTemplate,
      } as IgcChatDefaultTemplates;
    }
  }

  /**
   * Renders the typing indicator template if composing.
   * @protected
   */
  protected *renderLoadingTemplate() {
    yield html`${this._chatState?.options?.templates?.composingIndicatorTemplate
      ? this._chatState.options.templates.composingIndicatorTemplate
      : this.defaultComposingIndicatorTemplate}`;
  }

  /**
   * Main render method.
   * Groups messages by date and renders each message.
   * Shows the typing indicator if applicable.
   */
  protected override render() {
    const groupedMessages = this.groupMessagesByDate(
      this._chatState?.messages ?? []
    );

    return html`
      <div
        part="message-container"
        aria-activedescendant=${this._activeMessageId}
        role="group"
        aria-label="Message list"
        tabindex="0"
        @focusin=${this.handleFocusIn}
        @focusout=${this.handleFocusOut}
      ></div>
        <div part="message-list">
          ${repeat(
            groupedMessages,
            (group) => group.date,
            (group) => html`
              ${repeat(
                group.messages,
                (message) => message.id,
                (message) => {
                  const messageId = `message-${message.id}`;
                  return html`
                    <igc-chat-message
                      id=${messageId}
                      role="option"
                      part="message-item ${this._activeMessageId === messageId
                        ? 'active'
                        : ''}"
                      .message=${message}
                    >
                    </igc-chat-message>
                  `;
                }
              )}
            `
          )}
          ${
            this._chatState?.options?.isComposing
              ? this.renderLoadingTemplate()
              : nothing
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message-list': IgcChatMessageListComponent;
  }
}

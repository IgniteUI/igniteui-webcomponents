import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcChatMessageComponent from './chat-message.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/message-list.base.css.js';
import { styles as shared } from './themes/shared/message-list.common.css.js';
import type { IgcMessage } from './types.js';

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
   * Registers this component and its dependencies.
   * Used internally for component setup.
   */
  /* blazorSuppress */
  public static register() {
    registerComponent(IgcChatMessageListComponent, IgcChatMessageComponent);
  }

  /**
   * Consumed chat state context providing messages, options, and user data.
   * @private
   */
  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

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
    }
  }

  /**
   * Renders the typing indicator template if composing.
   * @protected
   */
  protected *renderLoadingTemplate() {
    yield html`${this._chatState?.options?.templates?.composingIndicatorTemplate
      ? this._chatState.options.templates.composingIndicatorTemplate
      : this._chatState?.defaultComposingIndicatorTemplate}`;
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
        role="group"
        aria-label="Message list"
        tabindex="0"
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
                      part="message-item"
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

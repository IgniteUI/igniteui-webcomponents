import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { chatContext } from '../common/context.js';
import {
  arrowDown,
  arrowUp,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcChatMessageComponent from './chat-message.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/message-list.base.css.js';
import type { IgcMessage } from './types.js';

/**
 *
 * @element igc-chat-message-list
 *
 */
export default class IgcChatMessageListComponent extends LitElement {
  public static readonly tagName = 'igc-chat-message-list';

  public static override styles = styles;

  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  @state()
  private _activeMessageId = '';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcChatMessageListComponent, IgcChatMessageComponent);
  }

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

  private scrollToBottom() {
    requestAnimationFrame(() => {
      const container = this.shadowRoot?.host as HTMLElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  private scrollToMessage(messageId: string) {
    const messageElement = this.shadowRoot?.querySelector(
      `#message-${messageId}`
    );
    messageElement?.scrollIntoView();
  }

  private handleFocusIn() {
    if (!this._chatState?.messages || this._chatState.messages.length === 0) {
      return;
    }
    const lastMessage = this._chatState.sortedMessagesIds?.pop() ?? '';
    this._activeMessageId = lastMessage !== '' ? `message-${lastMessage}` : '';
  }

  private handleFocusOut() {
    this._activeMessageId = '';
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this._chatState?.messages || this._chatState.messages.length === 0) {
      return;
    }

    const currentIndex = this._chatState?.sortedMessagesIds.findIndex(
      (id) => `message-${id}` === this._activeMessageId
    );
    let activeMessageId = '';

    switch (e.key) {
      case homeKey:
        activeMessageId = this._chatState.sortedMessagesIds[0];
        break;
      case endKey:
        activeMessageId =
          this._chatState.sortedMessagesIds[
            this._chatState.sortedMessagesIds.length - 1
          ];
        break;
      case arrowUp:
        if (currentIndex > 0) {
          activeMessageId = this._chatState.sortedMessagesIds[currentIndex - 1];
        }
        break;
      case arrowDown:
        if (currentIndex < this._chatState?.messages.length - 1) {
          activeMessageId = this._chatState.sortedMessagesIds[currentIndex + 1];
        }
        break;
      default:
        return; // Exit if the key is not one of the specified keys
    }

    this._activeMessageId = `message-${activeMessageId}`;
    this.scrollToMessage(activeMessageId);
  }

  protected override updated() {
    if (!this._chatState?.options?.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  protected override firstUpdated() {
    if (!this._chatState?.options?.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  protected *renderLoadingTemplate() {
    yield html`${this._chatState?.options?.templates?.composingIndicatorTemplate
      ? this._chatState.options.templates.composingIndicatorTemplate
      : html`<div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>`}`;
  }

  protected override render() {
    const groupedMessages = this.groupMessagesByDate(
      this._chatState?.messages ?? []
    );

    return html`
      <div
        class='message-container'
        aria-activedescendant=${this._activeMessageId}
        role="group"
        aria-label="Message list"
        tabindex='0'
        @focusin=${this.handleFocusIn}
        @focusout=${this.handleFocusOut}
        @keydown=${this.handleKeyDown}></div>
        <div class="message-list">
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
                      class=${this._activeMessageId === messageId
                        ? 'active'
                        : ''}
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

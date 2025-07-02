import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import type IgcChatComponent from './chat.js';
import IgcChatMessageComponent from './chat-message.js';
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
  private _chat?: IgcChatComponent;

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

  protected override updated() {
    if (!this._chat?.options?.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  protected override firstUpdated() {
    if (!this._chat?.options?.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  protected *renderLoadingTemplate() {
    yield html` ${this._chat?.options?.templates?.composingIndicatorTemplate
      ? this._chat.options.templates.composingIndicatorTemplate
      : html`<div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>`}`;
  }

  protected override render() {
    const groupedMessages = this.groupMessagesByDate(
      this._chat?.messages ?? []
    );

    return html`
      <div class='message-container'></div>
        <div class="message-list">
          ${repeat(
            groupedMessages,
            (group) => group.date,
            (group) => html`
              ${repeat(
                group.messages,
                (message) => message.id,
                (message) => html`
                  <igc-chat-message .message=${message}></igc-chat-message>
                `
              )}
            `
          )}
          ${
            this._chat?.options?.isComposing ? this.renderLoadingTemplate() : ''
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

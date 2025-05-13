import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcChatMessageComponent from './chat-message.js';
import { styles } from './themes/message-list.base.css.js';
import type { IgcMessage, IgcUser } from './types.js';

/**
 *
 * @element igc-chat-message-list
 *
 */
export default class IgcChatMessageListComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-chat-message-list';

  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcChatMessageListComponent, IgcChatMessageComponent);
  }

  @property({ reflect: true, attribute: false })
  public user: IgcUser | undefined;

  @property({ reflect: true, attribute: false })
  public messages: IgcMessage[] = [];

  @property({ reflect: true, attribute: false })
  public typingUsers: IgcUser[] = [];

  @property({ type: Boolean, attribute: 'hide-avatar' })
  public hideAvatar = false;

  @property({ type: Boolean, attribute: 'hide-user-name' })
  public hideUserName = false;

  @property({ type: Boolean, attribute: 'hide-meta-data' })
  public hideMetaData = false;

  @property({ type: Boolean, attribute: 'disable-auto-scroll' })
  public disableAutoScroll = false;

  @property({ type: Boolean, attribute: 'disable-reactions' })
  public disableReactions = false;

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
    if (!this.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  protected override firstUpdated() {
    if (!this.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  protected override render() {
    const groupedMessages = this.groupMessagesByDate(this.messages);

    return html`
      <div class="message-list">
        ${repeat(
          groupedMessages,
          (group) => group.date,
          (group) => html`
            <div class="day-separator">${group.date}</div>
            ${repeat(
              group.messages,
              (message) => message.id,
              (message) => html`
                <igc-chat-message
                  .message=${message}
                  .user=${this.user}
                  .disableReactions=${this.disableReactions}
                  .hideAvatar=${this.hideAvatar}
                  .hideUserName=${this.hideUserName}
                  .hideMetaData=${this.hideMetaData}
                ></igc-chat-message>
              `
            )}
          `
        )}
        ${this.typingUsers.filter((u) => u !== this.user).length > 0
          ? html`
              <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message-list': IgcChatMessageListComponent;
  }
}

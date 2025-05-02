import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcMessageAttachmentsComponent } from './message-attachments.js';
import { IgcMessageReactionsComponent } from './message-reactions.js';
import { styles } from './themes/message.base.css.js';
import type { IgcMessage, IgcUser } from './types.js';

/**
 *
 * @element igc-chat-message
 *
 */
export default class IgcChatMessageComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-chat-message';

  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatMessageComponent,
      IgcMessageAttachmentsComponent,
      IgcMessageReactionsComponent,
      IgcAvatarComponent
    );
  }

  @property({ reflect: true })
  public message: IgcMessage | undefined;

  @property({ reflect: true })
  public user: IgcUser | undefined;

  @property({ type: Boolean, attribute: 'enable-reactions' })
  public enableReactions = true;

  private formatTime(date: Date | undefined): string | undefined {
    return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private renderStatusIcon(status: string) {
    if (status === 'sent') {
      return '✓';
    }

    if (status === 'delivered') {
      return '✓✓';
    }

    if (status === 'read') {
      return '✓✓';
    }
    return '';
  }

  private handleAddReaction(e: CustomEvent) {
    const emoji = e.detail.emoji;

    this.dispatchEvent(
      new CustomEvent('add-reaction', {
        detail: { messageId: this.message?.id, emoji },
        bubbles: true,
        composed: true,
      })
    );
  }

  private isCurrentUser() {
    return this.message?.sender.id === this.user?.id;
  }

  protected override render() {
    const sender = this.message?.sender;
    const containerClass = `message-container ${this.isCurrentUser() ? 'sent' : 'received'}`;

    return html`
      <div class=${containerClass}>
        <igc-avatar src=${sender?.avatar} alt=${sender?.name} shape="circle">
        </igc-avatar>
        <div class="message-content">
          ${this.message?.text.trim()
            ? html` <div class="bubble">${this.message?.text}</div>`
            : ''}
          <div class="meta">
            <span class="time"
              >${this.formatTime(this.message?.timestamp)}</span
            >
            ${this.isCurrentUser()
              ? html`<span class="status"
                  >${this.renderStatusIcon(
                    this.message?.status || 'sent'
                  )}</span
                >`
              : ''}
          </div>
          ${this.message?.attachments && this.message?.attachments.length > 0
            ? html`<igc-message-attachments
                .attachments=${this.message?.attachments}
              >
              </igc-message-attachments>`
            : ''}
        </div>
        ${this.enableReactions
          ? html`<igc-message-reactions
              .reactions=${this.message?.reactions}
              .messageId=${this.message?.id}
              .currentUserId=${this.isCurrentUser() ? sender?.id : ''}
              @add-reaction=${this.handleAddReaction}
            ></igc-message-reactions>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message': IgcChatMessageComponent;
  }
}

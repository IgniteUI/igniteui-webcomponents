import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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

  @property({ reflect: true, attribute: false })
  public message: IgcMessage | undefined;

  @property({ reflect: true, attribute: false })
  public user: IgcUser | undefined;

  @property({ type: Boolean, attribute: 'hide-avatar' })
  public hideAvatar = false;

  @property({ type: Boolean, attribute: 'hide-user-name' })
  public hideUserName = false;

  @property({ type: Boolean, attribute: 'hide-meta-data' })
  public hideMetaData = false;

  @property({ type: Boolean, attribute: 'disable-reactions' })
  public disableReactions = false;

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
    const { emojiId } = e.detail;

    this.dispatchEvent(
      new CustomEvent('add-reaction', {
        detail: { messageId: this.message?.id, emojiId },
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
        ${this.hideAvatar
          ? ''
          : html`<igc-avatar
              src=${ifDefined(sender?.avatar)}
              alt=${ifDefined(sender?.name)}
              shape="circle"
            >
            </igc-avatar>`}

        <div class="message-content">
          ${this.hideUserName || this.isCurrentUser()
            ? ''
            : html`<span class="meta">${ifDefined(sender?.name)}</span>`}
          ${this.message?.text.trim()
            ? html` <div class="bubble">${this.message?.text}</div>`
            : ''}
          ${this.message?.attachments && this.message?.attachments.length > 0
            ? html`<igc-message-attachments
                .attachments=${this.message?.attachments}
              >
              </igc-message-attachments>`
            : ''}
          ${this.hideMetaData
            ? ''
            : html`
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
              `}
        </div>
        ${this.disableReactions
          ? ''
          : html`<igc-message-reactions
              .reactions=${this.message?.reactions}
              .messageId=${this.message?.id}
              .currentUserId=${this.isCurrentUser() ? sender?.id : ''}
              @add-reaction=${this.handleAddReaction}
            ></igc-message-reactions>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message': IgcChatMessageComponent;
  }
}

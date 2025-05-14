import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { registerComponent } from '../common/definitions/register.js';
import { renderMarkdown } from './markdown-util.js';
import { IgcMessageAttachmentsComponent } from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import type { IgcMessage } from './types.js';

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
      IgcAvatarComponent
    );
  }

  @property({ reflect: true, attribute: false })
  public message: IgcMessage | undefined;

  @property({ reflect: true, attribute: false })
  public isResponse = false;

  private formatTime(date: Date | undefined): string | undefined {
    return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  protected override render() {
    const containerClass = `message-container ${!this.isResponse ? 'sent' : ''}`;

    return html`
      <div class=${containerClass}>
        ${this.message?.text.trim()
          ? html` <div class="bubble">
              ${renderMarkdown(this.message?.text)}
            </div>`
          : ''}
        ${this.message?.attachments && this.message?.attachments.length > 0
          ? html`<igc-message-attachments
              .attachments=${this.message?.attachments}
            >
            </igc-message-attachments>`
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

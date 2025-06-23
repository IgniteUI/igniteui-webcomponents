import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import type IgcChatComponent from './chat.js';
import { renderMarkdown } from './markdown-util.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
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

  @consume({ context: chatContext, subscribe: true })
  private _chat?: IgcChatComponent;

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

  protected override render() {
    const containerClass = `message-container ${this.message?.sender === 'user' ? 'sent' : ''}`;

    return html`
      <div class=${containerClass}>
        <div class="bubble">
          ${this.message?.text.trim()
            ? html` <div>${renderMarkdown(this.message?.text)}</div>`
            : ''}
          ${this.message?.attachments && this.message?.attachments.length > 0
            ? html`<igc-message-attachments
                .attachments=${this.message?.attachments}
              >
              </igc-message-attachments>`
            : ''}
          ${this._chat?.options?.templates?.messageActionsTemplate &&
          this.message
            ? this._chat.options.templates.messageActionsTemplate(this.message)
            : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message': IgcChatMessageComponent;
  }
}

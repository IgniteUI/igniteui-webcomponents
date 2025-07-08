import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import type { ChatState } from './chat-state.js';
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
  public static readonly tagName = 'igc-chat-message';

  public static override styles = styles;

  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatMessageComponent,
      IgcMessageAttachmentsComponent,
      IgcAvatarComponent
    );
  }

  @property({ attribute: false })
  public message: IgcMessage | undefined;

  protected override render() {
    const containerClass = `message-container ${this.message?.sender === this._chatState?.currentUserId ? 'sent' : ''}`;

    return html`
      <div class=${containerClass}>
        <div class="bubble">
          ${this._chatState?.options?.templates?.messageTemplate && this.message
            ? this._chatState.options.templates.messageTemplate(this.message)
            : html` ${this.message?.text.trim()
                ? html`<div>${renderMarkdown(this.message?.text)}</div>`
                : nothing}
              ${this.message?.attachments &&
              this.message?.attachments.length > 0
                ? html`<igc-message-attachments
                    .attachments=${this.message?.attachments}
                  >
                  </igc-message-attachments>`
                : nothing}`}
          ${this._chatState?.options?.templates?.messageActionsTemplate &&
          this.message
            ? this._chatState.options.templates.messageActionsTemplate(
                this.message
              )
            : nothing}
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

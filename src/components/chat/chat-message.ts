import { consume } from '@lit/context';
import DOMPurify from 'dompurify';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { ChatState } from './chat-state.js';
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

  private sanitizeMessageText(text: string): string {
    return DOMPurify.sanitize(text);
  }

  @state()
  private _renderedMarkdown: TemplateResult | null = null;

  @watch('message')
  async processMarkdown() {
    const text = this.sanitizeMessageText(this.message?.text.trim() || '');

    if (this._chatState?.options?.supportsMarkdown !== true) {
      this._renderedMarkdown = html`${text}`;
      return;
    }

    const renderer = this._chatState?.options?.markdownRenderer;
    if (renderer) {
      this._renderedMarkdown = renderer(text);
    } else {
      const { renderMarkdown } = await import('./markdown-util.js');
      this._renderedMarkdown = await renderMarkdown(text);
    }
  }

  protected override render() {
    const containerClass = `message-container ${this.message?.sender === this._chatState?.currentUserId ? 'sent' : ''}`;
    return html`
      <div class=${containerClass}>
        <div class="bubble">
          ${this._chatState?.options?.templates?.messageTemplate && this.message
            ? this._chatState.options.templates.messageTemplate(this.message)
            : html` ${this._renderedMarkdown
                ? html`<div>${this._renderedMarkdown}</div>`
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

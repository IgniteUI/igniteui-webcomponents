import { consume } from '@lit/context';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import type { ChatState } from './chat-state.js';
import { renderMarkdown } from './markdown-util.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import type { IgcMessage, IgcRendererConfig } from './types.js';
import { styles as shared } from './themes/shared/chat-message.common.css.js';

/**
 * A chat message component for displaying individual messages in `<igc-chat>`.
 *
 * @element igc-chat-message
 *
 * This component renders a single chat message including:
 * - Message text (sanitized)
 * - Attachments (if any)
 * - Custom templates for message content and actions (if provided via chat options)
 *
 * It distinguishes sent messages from received messages by comparing
 * the message sender with the current user ID from chat state.
 *
 * The message text is sanitized with DOMPurify before rendering,
 * and can be rendered with a markdown renderer if provided.
 */
export default class IgcChatMessageComponent extends LitElement {
  /** Tag name of the custom element. */
  public static readonly tagName = 'igc-chat-message';

  /** Styles applied to the component. */
  public static override styles = [styles, shared];

  /**
   * Injected chat state context. Provides message data, user info, and options.
   * @private
   */
  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  /**
   * Registers this component and its dependencies.
   * This is used internally to set up the component definitions.
   */
  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatMessageComponent,
      IgcMessageAttachmentsComponent,
      IgcAvatarComponent
    );
  }

  /**
   * The chat message to render.
   */
  @property({ attribute: false })
  public message: IgcMessage | undefined;

  private renderDefaultMarkdown(text: string): string | TemplateResult {
    return renderMarkdown(text);
  }

  private renderCustomMarkdown(
    text: string,
    rendererConfig: IgcRendererConfig
  ): string | TemplateResult {
    if (rendererConfig?.renderFn) {
      return rendererConfig.renderFn(text) as TemplateResult;
    }
    return this.renderDefaultMarkdown(text);
  }

  /**
   * Renders the chat message template.
   * - Applies 'sent' CSS class if the message sender matches current user.
   * - Uses markdown rendering if configured.
   * - Renders attachments and custom templates if provided.
   */
  protected override render() {
    const containerClass = `message-container ${this.message?.sender === this._chatState?.currentUserId ? 'sent' : ''}`;
    const sanitizedMessageText = this.message?.text.trim() || '';
    const rendererConfig = this._chatState?.options?.rendererConfig!;
    const isPlainText = rendererConfig?.type === 'plain';

    return html`
      <div part=${containerClass}>
        <div part="bubble">
          ${this._chatState?.options?.templates?.messageTemplate && this.message
            ? this._chatState.options.templates.messageTemplate(this.message)
            : html` ${!isPlainText
                ? html`<div>
                    ${this.renderCustomMarkdown(
                      sanitizedMessageText,
                      rendererConfig
                    )}
                  </div>`
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

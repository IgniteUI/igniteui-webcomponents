import { consume } from '@lit/context';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { ChatState } from './chat-state.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import { styles as shared } from './themes/shared/chat-message.common.css.js';
import type { IgcMessage } from './types.js';

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

  @state()
  private _renderedMarkdown: TemplateResult | null = null;

  @watch('message')
  async processMarkdown() {
    const text = this.message?.text.trim() || '';

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

  /**
   * Renders the chat message template.
   * - Applies 'sent' CSS class if the message sender matches current user.
   * - Uses markdown rendering if configured.
   * - Renders attachments and custom templates if provided.
   */
  protected override render() {
    const containerPart = `message-container ${this.message?.sender === this._chatState?.currentUserId ? 'sent' : ''}`;

    return html`
      <div part=${containerPart}>
        <div part="bubble">
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

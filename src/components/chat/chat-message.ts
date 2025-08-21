import { consume } from '@lit/context';
// import DOMPurify from 'dompurify';
import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import type { ChatState } from './chat-state.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import { all } from './themes/message.js';
import { styles as shared } from './themes/shared/chat-message/chat-message.common.css.js';
import '../tooltip/tooltip.js';
import { IgcChatResourceStringEN } from '../common/i18n/chat.resources.js';
import IgcTooltipComponent from '../tooltip/tooltip.js';
import {
  thumbDownIcon as badResponseIcon,
  copyIcon as copyResponseIcon,
  thumbUpIcon as goodResponseIcon,
  type IgcMessage,
  regenerateIcon as redoIcon,
} from './types.js';

/**
 * A chat message component for displaying individual messages in `<igc-chat>`.
 *
 * @element igc-chat-message
 *
 * @fires igcMessageReact - Fired when a message is reacted to.
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
   * Registers this component and its dependencies.
   * This is used internally to set up the component definitions.
   */
  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatMessageComponent,
      IgcMessageAttachmentsComponent,
      IgcAvatarComponent,
      IgcTooltipComponent
    );
  }

  /**
   * Injected chat state context. Provides message data, user info, and options.
   * @private
   */
  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  /**
   * The chat message to render.
   */
  @property({ attribute: false })
  public message: IgcMessage | undefined;

  /** The resource strings. */
  @property({ attribute: false })
  public resourceStrings = IgcChatResourceStringEN;

  /** The tooltip component used for showing action tooltips. */
  @query('#sharedTooltip')
  private _sharedTooltip!: IgcTooltipComponent;

  /**
   * Sanitizes message text to prevent XSS or invalid HTML.
   * @param text The raw message text
   * @returns Sanitized text safe for HTML rendering
   * @private
   */
  private sanitizeMessageText(text: string): string {
    return text.trim();
  }

  constructor() {
    super();
    addThemingController(this, all);
    registerIconFromText('copy-response', copyResponseIcon, 'material');
    registerIconFromText('good-response', goodResponseIcon, 'material');
    registerIconFromText('bad-response', badResponseIcon, 'material');
    registerIconFromText('redo', redoIcon, 'material');
  }

  private get defaultMessageActionsTemplate() {
    const isLastMessage = this.message === this._chatState?.messages.at(-1);
    return this.message?.sender !== this._chatState?.currentUserId &&
      this.message?.text.trim() &&
      (!isLastMessage || !this._chatState?.options?.isTyping)
      ? html`<div part="message-actions">
          <igc-icon-button
            id="copy-response-button"
            @pointerenter=${() =>
              this.showTooltip(
                'copy-response-button',
                this.resourceStrings.reactionCopyResponse
              )}
            name="copy-response"
            collection="material"
            variant="flat"
            @click=${this.handleMessageActionClick}
          ></igc-icon-button>
          <igc-icon-button
            id="good-response-button"
            @pointerenter=${() =>
              this.showTooltip(
                'good-response-button',
                this.resourceStrings.reactionGoodResponse
              )}
            name="good-response"
            collection="material"
            variant="flat"
            @click=${this.handleMessageActionClick}
          ></igc-icon-button>
          <igc-icon-button
            id="bad-response-button"
            @pointerenter=${() =>
              this.showTooltip(
                'bad-response-button',
                this.resourceStrings.reactionBadResponse
              )}
            name="bad-response"
            variant="flat"
            collection="material"
            @click=${this.handleMessageActionClick}
          ></igc-icon-button>
          <igc-icon-button
            id="redo-button"
            @pointerenter=${() =>
              this.showTooltip(
                'redo-button',
                this.resourceStrings.reactionRedo
              )}
            name="redo"
            variant="flat"
            collection="material"
            @click=${this.handleMessageActionClick}
          ></igc-icon-button>
          <igc-tooltip id="sharedTooltip"></igc-tooltip>
        </div>`
      : nothing;
  }

  private showTooltip(elementId: string, text: string) {
    this._sharedTooltip.message = text;
    this._sharedTooltip.show(elementId);
  }

  private handleMessageActionClick(event: MouseEvent): void {
    const reaction = (event.target as HTMLElement).getAttribute('name');
    this._chatState?.emitEvent('igcMessageReact', {
      detail: { message: this.message, reaction: reaction },
    });
  }

  /**
   * Renders the chat message template.
   * - Applies 'sent' CSS class if the message sender matches current user.
   * - Uses markdown rendering if configured.
   * - Renders attachments and custom templates if provided.
   */
  protected override render() {
    const containerPart = `message-container ${this.message?.sender === this._chatState?.currentUserId ? 'sent' : ''}`;
    const sanitizedMessageText = this.sanitizeMessageText(
      this.message?.text.trim() || ''
    );
    // const renderer =
    //   this._chatState?.options?.markdownRenderer || renderMarkdown;

    return html`
      <div part=${containerPart}>
        <div part="bubble">
          ${this._chatState?.options?.templates?.messageTemplate && this.message
            ? this._chatState.options.templates.messageTemplate(this.message)
            : html`${sanitizedMessageText ? html`<slot></slot>` : nothing}`}
          ${this.message?.attachments && this.message?.attachments.length > 0
            ? html` <igc-message-attachments
                .message=${this.message}
                part="message-attachments"
                exportparts="message-attachments,attachments-container, attachment, attachment-header, attachment-content, attachment-icon, file-name, actions: attachment-actions"
              >
              </igc-message-attachments>`
            : nothing}
          ${this._chatState?.options?.templates?.messageActionsTemplate &&
          this.message
            ? this._chatState.options.templates.messageActionsTemplate(
                this.message
              )
            : this.defaultMessageActionsTemplate}
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

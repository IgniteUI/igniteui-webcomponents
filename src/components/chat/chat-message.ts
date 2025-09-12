import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { until } from 'lit/directives/until.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { isEmpty } from '../common/util.js';
import type { ChatState } from './chat-state.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import { all } from './themes/message.js';
import { styles as shared } from './themes/shared/chat-message/chat-message.common.css.js';
import type {
  ChatMessageRenderContext,
  ChatTemplateRenderer,
  IgcChatMessage,
} from './types.js';
import { chatMessageAdoptPageStyles } from './utils.js';

const LIKE_INACTIVE = 'thumb_up_inactive';
const LIKE_ACTIVE = 'thumb_up_active';
const DISLIKE_INACTIVE = 'thumb_down_inactive';
const DISLIKE_ACTIVE = 'thumb_down_active';
const COPY_CONTENT = 'copy_content';
const REGENERATE = 'regenerate';

type DefaultMessageRenderers = {
  message: ChatTemplateRenderer<ChatMessageRenderContext>;
  messageHeader: ChatTemplateRenderer<ChatMessageRenderContext>;
  messageContent: ChatTemplateRenderer<ChatMessageRenderContext>;
  messageAttachments: ChatTemplateRenderer<ChatMessageRenderContext>;
  messageActions: ChatTemplateRenderer<ChatMessageRenderContext>;
};

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
  public static readonly tagName = 'igc-chat-message';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcChatMessageComponent,
      IgcMessageAttachmentsComponent,
      IgcIconButtonComponent
    );
  }

  private readonly _defaults = Object.freeze<DefaultMessageRenderers>({
    message: () => this._renderMessage(),
    messageHeader: () => this._renderHeader(),
    messageContent: () => this._renderContent(),
    messageAttachments: () => this._renderAttachments(),
    messageActions: () => this._renderActions(),
  });

  @consume({ context: chatContext, subscribe: true })
  private readonly _state!: ChatState;

  /**
   * The chat message to render.
   */
  @property({ attribute: false })
  public message?: IgcChatMessage;

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override firstUpdated(): void {
    chatMessageAdoptPageStyles(this);
  }

  private _getRenderer(name: keyof DefaultMessageRenderers) {
    return this._state.options?.renderers
      ? (this._state.options.renderers[name] ?? this._defaults[name])
      : this._defaults[name];
  }

  private async _handleCopy() {
    if (!this.message) return;

    let clipboardText = this.message.text;

    const resourceStrings = this._state.resourceStrings!;
    if (this.message.attachments && !isEmpty(this.message.attachments)) {
      const attachmentList = this.message.attachments
        .map(
          (att) =>
            `${att.name ?? resourceStrings.attachmentLabel}: ${att.url ?? ''}`
        )
        .join('\n');
      clipboardText += `${clipboardText ? '\n\n' : ''}${resourceStrings.attachmentsListLabel}:\n${attachmentList}`;
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(clipboardText);
        this._state.showActionToast(resourceStrings.messageCopied);
      } catch (err) {
        throw new Error(`Failed to copy message via Clipboard API: ${err}`);
      }
    }
  }

  private _handleMessageActionClick(event: PointerEvent): void {
    const targetButton = event.target as HTMLElement;
    const button = targetButton.closest(IgcIconButtonComponent.tagName);
    if (!button || !this.message) return;

    let reaction = button.name;

    switch (reaction) {
      case LIKE_INACTIVE:
      case LIKE_ACTIVE:
        reaction = this.message.reactions?.includes(LIKE_ACTIVE)
          ? LIKE_INACTIVE
          : LIKE_ACTIVE;
        break;
      case DISLIKE_INACTIVE:
      case DISLIKE_ACTIVE:
        reaction = this.message.reactions?.includes(DISLIKE_ACTIVE)
          ? DISLIKE_INACTIVE
          : DISLIKE_ACTIVE;
        break;
      case COPY_CONTENT:
        reaction = COPY_CONTENT;
        this._handleCopy();
        break;
      case REGENERATE:
        reaction = REGENERATE;
        break;
      default:
        reaction = undefined;
    }

    this.message.reactions = reaction ? [reaction] : [];
    this.requestUpdate();

    this._state.emitEvent('igcMessageReact', {
      detail: { message: this.message, reaction },
    });
  }

  private _renderHeader() {
    return nothing;
  }

  private _renderContent() {
    return this.message?.text
      ? html`<pre part="plain-text">${this.message.text}</pre>`
      : nothing;
  }

  private _renderActions() {
    const isSent = this.message?.sender === this._state.currentUserId;
    const hasText = this.message?.text.trim();
    const hasAttachments =
      this.message?.attachments && !isEmpty(this.message?.attachments);
    const isTyping = this._state._isTyping;
    const isLastMessage = this.message === this._state.messages.at(-1);
    const resourceStrings = this._state.resourceStrings!;

    if (isSent || !(hasText || hasAttachments) || (isLastMessage && isTyping)) {
      return nothing;
    }

    return html`
      <div @click=${this._handleMessageActionClick} part="message-actions">
        ${this._renderActionButton(COPY_CONTENT, resourceStrings.reactionCopy)}
        ${this._renderActionButton(
          this.message?.reactions?.includes(LIKE_ACTIVE)
            ? LIKE_ACTIVE
            : LIKE_INACTIVE,
          resourceStrings.reactionLike
        )}
        ${this._renderActionButton(
          this.message?.reactions?.includes(DISLIKE_ACTIVE)
            ? DISLIKE_ACTIVE
            : DISLIKE_INACTIVE,
          resourceStrings.reactionDislike
        )}
        ${this._renderActionButton(
          REGENERATE,
          resourceStrings.reactionRegenerate
        )}
      </div>
    `;
  }

  private _renderActionButton(name: string, tooltipMessage: string) {
    return html`
      <igc-icon-button
        id=${`${name}-button`}
        name=${name}
        variant="flat"
        @pointerenter=${({ target }: PointerEvent) =>
          this._state.showActionsTooltip(target as Element, tooltipMessage)}
        @focus=${({ target }: FocusEvent) =>
          this._state.showActionsTooltip(target as Element, tooltipMessage)}
      ></igc-icon-button>
    `;
  }

  // Default rendering logic for attachments
  private _renderAttachments() {
    return isEmpty(this.message?.attachments ?? [])
      ? nothing
      : html`
          <igc-message-attachments
            .message=${this.message}
          ></igc-message-attachments>
        `;
  }

  private _renderMessage() {
    return this.message
      ? html`${this._renderHeader()}${this._renderContent()}${this._renderAttachments()}${this._renderActions()}`
      : nothing;
  }

  protected override render() {
    const ctx: ChatMessageRenderContext = {
      message: this.message!,
      instance: this._state.host,
    };

    const parts = {
      'message-container': true,
      sent: this._state.isCurrentUserMessage(this.message),
    };

    return html`
      ${cache(
        this.message
          ? html`
              <div part=${partMap(parts)}>
                ${cache(
                  this._state.options?.renderers?.message
                    ? html`${until(this._getRenderer('message')(ctx))}`
                    : html`
                        ${until(this._getRenderer('messageHeader')(ctx))}
                        ${until(this._getRenderer('messageContent')(ctx))}
                        ${until(this._getRenderer('messageAttachments')(ctx))}
                        ${until(this._getRenderer('messageActions')(ctx))}
                      `
                )}
              </div>
            `
          : nothing
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message': IgcChatMessageComponent;
  }
}

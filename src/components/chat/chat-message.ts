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
  messageHeader: ChatTemplateRenderer<ChatMessageRenderContext>;
  messageContent: ChatTemplateRenderer<ChatMessageRenderContext>;
  messageAttachments: ChatTemplateRenderer<ChatMessageRenderContext>;
  messageActions: ChatTemplateRenderer<ChatMessageRenderContext>;
};

/* blazorSuppress */
/**
 * A chat message component for displaying individual messages in `<igc-chat>`.
 *
 * @element igc-chat-message
 *
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
  public message!: IgcChatMessage;

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override firstUpdated(): void {
    if (this._state.options?.adoptRootStyles) {
      chatMessageAdoptPageStyles(this);
    }
  }

  private _getRenderer(name: keyof DefaultMessageRenderers) {
    return this._state.options?.renderers
      ? (this._state.options.renderers[name] ?? this._defaults[name])
      : this._defaults[name];
  }

  private async _handleCopy(): Promise<void> {
    const text = this.message.text;
    const separator = text ? '\n\n' : '';
    const attachments = this.message.attachments ?? [];
    const { attachmentLabel, attachmentsListLabel, messageCopied } =
      this._state.resourceStrings!;

    const attachmentsText = isEmpty(attachments)
      ? ''
      : attachments
          .map(({ name, url }) => `${name ?? attachmentLabel}: ${url ?? ''}`)
          .join('\n');

    const payload = attachmentsText
      ? `${text}${separator}${attachmentsListLabel}:\n${attachmentsText}`
      : text;

    try {
      await navigator.clipboard.writeText(payload);
      this._state.showActionToast(messageCopied);
    } catch (err) {
      throw new Error(`Failed to copy message: ${err}`);
    }
  }

  private _handleMessageActionClick(event: PointerEvent): void {
    const targetButton = event.target as HTMLElement;
    const button = targetButton.closest(IgcIconButtonComponent.tagName);

    if (!button) {
      return;
    }

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
        reaction = '';
    }

    this.message.reactions = reaction ? [reaction] : [];
    this._state.emitMessageReaction({ message: this.message, reaction });
    this.requestUpdate();
  }

  private _renderHeader() {
    return nothing;
  }

  private _renderContent() {
    return html`${this.message.text}`;
  }

  private _renderActions() {
    const isSent = this.message.sender === this._state.currentUserId;
    const hasText = this.message.text.trim();
    const hasAttachments = !isEmpty(this.message.attachments ?? []);
    const isTyping = this._state._isTyping;
    const isLastMessage = this.message === this._state.messages.at(-1);
    const resourceStrings = this._state.resourceStrings!;

    if (isSent || !(hasText || hasAttachments) || (isLastMessage && isTyping)) {
      return nothing;
    }

    return html`
      ${this._renderActionButton(COPY_CONTENT, resourceStrings.reactionCopy)}
      ${this._renderActionButton(
        this.message.reactions?.includes(LIKE_ACTIVE)
          ? LIKE_ACTIVE
          : LIKE_INACTIVE,
        resourceStrings.reactionLike
      )}
      ${this._renderActionButton(
        this.message.reactions?.includes(DISLIKE_ACTIVE)
          ? DISLIKE_ACTIVE
          : DISLIKE_INACTIVE,
        resourceStrings.reactionDislike
      )}
      ${this._renderActionButton(
        REGENERATE,
        resourceStrings.reactionRegenerate
      )}
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

  private _renderAttachments() {
    return isEmpty(this.message.attachments ?? [])
      ? nothing
      : html`
          <igc-message-attachments
            .message=${this.message}
          ></igc-message-attachments>
        `;
  }

  private _renderMessage() {
    const ctx: ChatMessageRenderContext = {
      message: this.message,
      instance: this._state.host,
    };

    return html`
      <div part="message-header">
        ${until(this._getRenderer('messageHeader')(ctx))}
      </div>
      <div part="plain-text">
        ${until(this._getRenderer('messageContent')(ctx))}
      </div>
      <div part="message-attachments">
        ${until(this._getRenderer('messageAttachments')(ctx))}
      </div>
      <div part="message-actions" @click=${this._handleMessageActionClick}>
        ${until(this._getRenderer('messageActions')(ctx))}
      </div>
    `;
  }

  protected override render() {
    const messageRenderer = this._state.options?.renderers?.message;
    const ctx: ChatMessageRenderContext = {
      message: this.message,
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
                  messageRenderer ? messageRenderer(ctx) : this._renderMessage()
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

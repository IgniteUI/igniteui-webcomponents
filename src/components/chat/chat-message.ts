import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { isEmpty } from '../common/util.js';
import IgcTooltipComponent from '../tooltip/tooltip.js';
import type { ChatState } from './chat-state.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import { all } from './themes/message.js';
import { styles as shared } from './themes/shared/chat-message/chat-message.common.css.js';
import type { ChatTemplateRenderer, IgcMessage } from './types.js';
import { chatMessageAdoptPageStyles, showChatActionsTooltip } from './utils.js';

const LIKE_INACTIVE = 'thumb_up_inactive';
const LIKE_ACTIVE = 'thumb_up_active';
const DISLIKE_INACTIVE = 'thumb_down_inactive';
const DISLIKE_ACTIVE = 'thumb_down_active';

type DefaultMessageRenderers = {
  message: ChatTemplateRenderer<IgcMessage>;
  messageHeader: ChatTemplateRenderer<IgcMessage>;
  messageContent: ChatTemplateRenderer<IgcMessage>;
  messageAttachments: ChatTemplateRenderer<IgcMessage>;
  messageActions: ChatTemplateRenderer<IgcMessage>;
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
      IgcAvatarComponent,
      IgcTooltipComponent
    );
  }

  /**
   * Injected chat state context. Provides message data, user info, and options.
   */
  @consume({ context: chatContext, subscribe: true })
  private readonly _chatState?: ChatState;

  private readonly _defaults: Readonly<DefaultMessageRenderers> = Object.freeze(
    {
      message: () => this._renderMessage(),
      messageHeader: () => this._renderHeader(),
      messageContent: () => this._renderContent(),
      messageAttachments: () => this._renderAttachments(),
      messageActions: () => this._renderActions(),
    }
  );

  /**
   * The chat message to render.
   */
  @property({ attribute: false })
  public message?: IgcMessage;

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override firstUpdated(): void {
    chatMessageAdoptPageStyles(this);
  }

  private _getRenderer(name: keyof DefaultMessageRenderers) {
    return this._chatState?.options?.renderers
      ? (this._chatState.options.renderers[name] ?? this._defaults[name])
      : this._defaults[name];
  }

  private _handleMessageActionClick(event: PointerEvent): void {
    const targetButton = event.target as HTMLElement;
    const button = targetButton.closest('igc-icon-button');
    if (!button) return;

    let reaction = button.getAttribute('name');
    if (this.message) {
      if (reaction === LIKE_INACTIVE) {
        reaction = LIKE_ACTIVE;
        this.message.reactions = [reaction];
      } else if (reaction === DISLIKE_INACTIVE) {
        reaction = DISLIKE_ACTIVE;
        this.message.reactions = [reaction];
      } else if (reaction === this.message.reactions?.[0]) {
        reaction = null;
        this.message.reactions = [];
      }

      this.requestUpdate();
    }

    this._chatState?.emitEvent('igcMessageReact', {
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
    const isSent = this.message?.sender === this._chatState?.currentUserId;
    const hasText = this.message?.text.trim();
    const isTyping = this._chatState?._isTyping;
    const isLastMessage = this.message === this._chatState?.messages.at(-1);
    const resourceStrings = this._chatState?.resourceStrings!;

    if (isSent || !hasText || (isLastMessage && isTyping)) {
      return nothing;
    }

    return html`
      <div @click=${this._handleMessageActionClick}>
        ${this._renderActionButton(
          'copy_content',
          resourceStrings.reactionCopy
        )}
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
          'regenerate',
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
          showChatActionsTooltip(target as Element, tooltipMessage)}
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

  /**
   * Default message template used when no custom template is provided.
   * Renders the message text, sanitized for security.
   * @param message The chat message to render
   * @returns TemplateResult containing the rendered message
   */
  private _renderMessage() {
    return this.message
      ? html`${this._renderHeader()}${this._renderContent()}${this._renderAttachments()}${this._renderActions()}`
      : nothing;
  }

  /**
   * Renders the chat message template.
   * - Applies 'sent' CSS class if the message sender matches current user.
   * - Uses markdown rendering if configured.
   * - Renders attachments and custom templates if provided.
   */
  protected override render() {
    if (!this.message) {
      return nothing;
    }

    const parts = {
      'message-container': true,
      sent: this._chatState?.currentUserId === this.message.sender,
    };

    const options = this._chatState?.options;
    const ctx = {
      param: this.message,
      defaults: this._defaults,
      options,
    };

    if (options?.renderers?.message) {
      return html`
        <div part=${partMap(parts)}>
          ${until(options.renderers.message(ctx))}
        </div>
      `;
    }

    return html`
      <div part=${partMap(parts)}>
        ${until(this._getRenderer('messageHeader')(ctx))}
        ${until(this._getRenderer('messageContent')(ctx))}
        ${until(this._getRenderer('messageAttachments')(ctx))}
        ${until(this._getRenderer('messageActions')(ctx))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message': IgcChatMessageComponent;
  }
}

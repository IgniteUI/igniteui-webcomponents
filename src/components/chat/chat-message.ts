import { html, isServer, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { until } from 'lit/directives/until.js';
import { registerComponent } from '#internals/definitions/register.js';
import { HydrationMixin } from '#internals/mixins/hydration.js';
import { partMap } from '#internals/part-map.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { trimmedHtml } from '#internals/utils/lit.js';
import { all } from '#themes/chat/themes/message.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import type { ChatState } from './chat-state.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import { addChatStateConsumer } from './state-consumer.js';
import { styles } from './themes/message.base.css.js';
import { styles as shared } from './themes/shared/chat-message/chat-message.common.css.js';
import type {
  ChatMessageRenderContext,
  ChatTemplateRenderer,
  IgcChatMessage,
} from './types.js';

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
 * A chat message component for displaying individual messages in the chat component.
 *
 * This component renders a single chat message including:
 * - Message text
 * - Attachments (if any)
 * - Custom templates for message content and actions (if provided via chat options)
 *
 * It distinguishes sent messages from received messages by comparing
 * the message sender with the current user ID from chat state.
 *
 * The default renderer shows the message text as plain text. A `messageContent`
 * renderer in the chat options can replace it, for example with a markdown renderer.
 *
 * @element igc-chat-message
 */
export default class IgcChatMessageComponent extends HydrationMixin(
  LitElement
) {
  public static readonly tagName = 'igc-chat-message';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcChatMessageComponent,
      IgcMessageAttachmentsComponent,
      IgcIconButtonComponent
    );
  }

  private readonly _chat = addChatStateConsumer(this);

  private readonly _defaults = Object.freeze<DefaultMessageRenderers>({
    messageHeader: () => this._renderHeader(),
    messageContent: () => this._renderContent(),
    messageAttachments: () => this._renderAttachments(),
    messageActions: () => this._renderActions(),
  });

  private get _state(): ChatState {
    return this._chat.state!;
  }

  /**
   * The chat message to render.
   */
  @property({ attribute: false })
  public message!: IgcChatMessage;

  constructor() {
    super();
    addThemingController(this, all, {
      themeChange: () => this._chat.refreshStyles(),
    });
  }

  private _getRenderer(name: keyof DefaultMessageRenderers) {
    return this._state.options?.renderers?.[name] ?? this._defaults[name];
  }

  private async _handleCopy(): Promise<void> {
    const text = this.message.text;
    const separator = text ? '\n\n' : '';
    const attachments = this.message.attachments ?? [];
    const {
      chat_attachment_label,
      chat_attachments_list_label,
      chat_message_copied,
    } = this._state.resourceStrings;

    const attachmentsText = isEmpty(attachments)
      ? ''
      : attachments
          .map(
            ({ name, url }) => `${name ?? chat_attachment_label}: ${url ?? ''}`
          )
          .join('\n');

    const payload = attachmentsText
      ? `${text}${separator}${chat_attachments_list_label}:\n${attachmentsText}`
      : text;

    try {
      await navigator.clipboard.writeText(payload);
      this._state.showActionToast(chat_message_copied!);
    } catch {
      // The clipboard rejects without permission or document focus. Skip the
      // confirmation toast; nothing was copied.
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
    this._state.emitEvent('igcMessageReact', {
      detail: { message: this.message, reaction },
    });
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
    const isTyping = this._state.options?.isTyping;
    const isLastMessage = this.message === this._state.messages.at(-1);
    const resourceStrings = this._state.resourceStrings!;

    if (isSent || !(hasText || hasAttachments) || (isLastMessage && isTyping)) {
      return nothing;
    }

    const liked = this.message.reactions?.includes(LIKE_ACTIVE);
    const disliked = this.message.reactions?.includes(DISLIKE_ACTIVE);

    return html`
      ${this._renderActionButton(
        COPY_CONTENT,
        resourceStrings.chat_reaction_copy!
      )}
      ${this._renderActionButton(
        liked ? LIKE_ACTIVE : LIKE_INACTIVE,
        resourceStrings.chat_reaction_like!,
        liked ? 'true' : 'false'
      )}
      ${this._renderActionButton(
        disliked ? DISLIKE_ACTIVE : DISLIKE_INACTIVE,
        resourceStrings.chat_reaction_dislike!,
        disliked ? 'true' : 'false'
      )}
      ${this._renderActionButton(
        REGENERATE,
        resourceStrings.chat_reaction_regenerate!
      )}
    `;
  }

  /** Pass `pressed` for a toggle action, such as like. */
  private _renderActionButton(
    name: string,
    label: string,
    pressed?: 'true' | 'false'
  ) {
    return html`
      <igc-icon-button
        id=${`${name}-button`}
        name=${name}
        variant="flat"
        aria-label=${label}
        aria-pressed=${ifDefined(pressed)}
        @pointerenter=${({ target }: PointerEvent) =>
          this._state.showActionsTooltip(target as Element, label)}
        @focus=${({ target }: FocusEvent) =>
          this._state.showActionsTooltip(target as Element, label)}
      ></igc-icon-button>
    `;
  }

  private _renderAttachments() {
    return isEmpty(this.message.attachments ?? [])
      ? nothing
      : html`
          <igc-message-attachments
            .message=${this.message}
            exportparts="
              attachment,
              attachment-header,
              attachment-icon,
              file-name,
              attachment-content"
          ></igc-message-attachments>
        `;
  }

  private _renderMessage() {
    const ctx: ChatMessageRenderContext = {
      message: this.message,
      instance: this._state.host,
    };

    return trimmedHtml`
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
    // No chat provides the state outside a chat or during SSR. A hydrating
    // host matches that empty server render.
    if (isServer || this._hydrating || !this._chat.state) {
      return nothing;
    }

    const messageRenderer = this._state.options?.renderers?.message;
    const ctx: ChatMessageRenderContext = {
      message: this.message,
      instance: this._state.host,
    };

    const parts = {
      'message-container': true,
      received: !this._state.isCurrentUserMessage(this.message),
      sent: this._state.isCurrentUserMessage(this.message),
    };

    return html`
      ${cache(
        this.message
          ? html`
              <div part=${partMap(parts)}>
                ${cache(
                  messageRenderer
                    ? until(messageRenderer(ctx))
                    : this._renderMessage()
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

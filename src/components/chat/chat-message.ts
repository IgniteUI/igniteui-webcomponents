import { consume } from '@lit/context';
import { adoptStyles, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import IgcTooltipComponent from '../tooltip/tooltip.js';
import type { ChatState } from './chat-state.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import { all } from './themes/message.js';
import { styles as shared } from './themes/shared/chat-message/chat-message.common.css.js';
import type { ChatRenderers, IgcMessage } from './types.js';
import { showChatActionsTooltip } from './utils.js';

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

  private _defaults: Partial<ChatRenderers>;
  private _cachedRenderers?: {
    custom: Partial<ChatRenderers>;
    merged: Partial<ChatRenderers>;
  };

  private get _renderers() {
    if (!this._chatState?.options?.renderers) {
      return this._defaults;
    }

    const custom = this._chatState.options.renderers;
    if (this._cachedRenderers?.custom === custom) {
      return this._cachedRenderers.merged;
    }

    const merged = {
      ...this._defaults,
      ...custom,
    };

    this._cachedRenderers = { custom, merged };
    return merged;
  }

  /**
   * The chat message to render.
   */
  @property({ attribute: false })
  public message?: IgcMessage;

  constructor() {
    super();
    addThemingController(this, all);
    this._defaults = {
      message: () => this._renderMessage(),
      messageHeader: () => this._renderHeader(),
      messageContent: () => this._renderContent(),
      messageAttachments: () => this._renderAttachments(),
      messageActions: () => this._renderActions(),
    };
  }

  protected override firstUpdated(): void {
    adoptPageStyles(this);
  }

  private _handleMessageActionClick(event: PointerEvent): void {
    const targetButton = event.target as HTMLElement;
    const button = targetButton.closest('igc-icon-button');
    if (!button) return;

    const reaction = button.getAttribute('name');
    this._chatState?.emitEvent('igcMessageReact', {
      detail: { message: this.message, reaction },
    });
  }

  private _renderHeader() {
    return nothing;
  }

  private _renderContent() {
    if (!this.message || !this.message.text) return nothing;

    return html`<pre part="plain-text">${this.message.text}</pre>`;
  }

  private _renderActions() {
    const isSent = this.message?.sender === this._chatState?.currentUserId;
    const hasText = this.message?.text.trim();
    const isTyping = this._chatState?._isTyping;
    const isLastMessage = this.message === this._chatState?.messages.at(-1);

    if (isSent || !hasText || (isLastMessage && isTyping)) {
      return nothing;
    }

    return html` <div @click=${this._handleMessageActionClick}>
      <igc-icon-button
        id="copy-response-button"
        @pointerenter=${(ev: PointerEvent) =>
          showChatActionsTooltip(
            ev.target as Element,
            this._chatState?.resourceStrings.reactionCopyResponse!
          )}
        name="copy-response"
        collection="material"
        variant="flat"
      ></igc-icon-button>
      <igc-icon-button
        id="good-response-button"
        @pointerenter=${(ev: PointerEvent) =>
          showChatActionsTooltip(
            ev.target as Element,
            this._chatState?.resourceStrings.reactionGoodResponse!
          )}
        name="good-response"
        collection="material"
        variant="flat"
      ></igc-icon-button>
      <igc-icon-button
        id="bad-response-button"
        @pointerenter=${(ev: PointerEvent) =>
          showChatActionsTooltip(
            ev.target as Element,
            this._chatState?.resourceStrings.reactionBadResponse!
          )}
        name="bad-response"
        variant="flat"
        collection="material"
      ></igc-icon-button>
      <igc-icon-button
        id="redo-button"
        @pointerenter=${(ev: PointerEvent) =>
          showChatActionsTooltip(
            ev.target as Element,
            this._chatState?.resourceStrings.reactionRedo!
          )}
        name="redo"
        variant="flat"
        collection="material"
      ></igc-icon-button>
    </div>`;
  }

  // Default rendering logic for attachments
  private _renderAttachments() {
    if (!this.message?.attachments?.length) return nothing;
    return html`<igc-message-attachments
      .message=${this.message}
    ></igc-message-attachments>`;
  }

  /**
   * Default message template used when no custom template is provided.
   * Renders the message text, sanitized for security.
   * @param message The chat message to render
   * @returns TemplateResult containing the rendered message
   */
  private _renderMessage() {
    if (!this.message) return nothing;

    return html` ${this._renderHeader()} ${this._renderContent()}
    ${this._renderAttachments()} ${this._renderActions()}`;
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

    const isSent = this._chatState?.currentUserId === this.message.sender;
    const parts = {
      'message-container': true,
      sent: isSent,
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
        ${this._renderers.messageHeader?.(ctx)}
        ${this._renderers.messageContent?.(ctx)}
        ${this._renderers.messageAttachments?.(ctx)}
        ${this._renderers.messageActions?.(ctx)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message': IgcChatMessageComponent;
  }
}

// REVIEW: Maybe put that behind a configuration flag as this is nasty.
function adoptPageStyles(message: IgcChatMessageComponent): void {
  const sheets: CSSStyleSheet[] = [];

  for (const sheet of document.styleSheets) {
    try {
      const constructed = new CSSStyleSheet();
      for (const rule of sheet.cssRules) {
        constructed.insertRule(rule.cssText);
      }
      sheets.push(constructed);
    } catch {}
  }

  const ctor = message.constructor as typeof LitElement;
  adoptStyles(message.shadowRoot!, [...ctor.elementStyles, ...sheets]);
}

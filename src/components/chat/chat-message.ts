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
import type { IgcMessage } from './types.js';

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
  private _chatState?: ChatState;

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
    adoptPageStyles(this);
  }

  /**
   * Renders the chat message template.
   * - Applies 'sent' CSS class if the message sender matches current user.
   * - Uses markdown rendering if configured.
   * - Renders attachments and custom templates if provided.
   */
  protected override render() {
    const parts = {
      'message-container': true,
      sent: this._chatState?.currentUserId === this.message?.sender,
    };

    return this.message && this._chatState?.chatRenderer
      ? html`
          <div part=${partMap(parts)}>
            ${until(this._chatState.chatRenderer.render(this.message))}
          </div>
        `
      : nothing;
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

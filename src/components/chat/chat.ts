import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcChatHeaderComponent from './chat-header.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageListComponent from './chat-message-list.js';
import { styles } from './themes/chat.base.css.js';
import type { IgcMessage, IgcMessageReaction, IgcUser } from './types.js';

export interface IgcChatComponentEventMap {
  igcMessageEntered: CustomEvent<IgcMessage>;
}

/**
 *
 * @element igc-chat
 *
 */
export default class IgcChatComponent extends EventEmitterMixin<
  IgcChatComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static readonly tagName = 'igc-chat';

  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatComponent,
      IgcChatHeaderComponent,
      IgcChatInputComponent,
      IgcChatMessageListComponent
    );
  }

  @property({ attribute: false })
  public user: IgcUser | undefined;

  @property({ reflect: true, attribute: false })
  public messages: IgcMessage[] = [];

  @property({ reflect: true, attribute: false })
  public typingUsers: IgcUser[] = [];

  @property({ type: Boolean, attribute: 'hide-avatar' })
  public hideAvatar = false;

  @property({ type: Boolean, attribute: 'hide-user-name' })
  public hideUserName = false;

  @property({ type: Boolean, attribute: 'hide-meta-data' })
  public hideMetaData = false;

  @property({ type: Boolean, attribute: 'scroll-bottom' })
  public scrollBottom = true;

  @property({ type: Boolean, attribute: 'disable-reactions' })
  public disableReactions = false;

  @property({ type: Boolean, attribute: 'disable-attachments' })
  public disableAttachments = false;

  @property({ type: Boolean, attribute: 'disable-emojis' })
  public disableEmojis = false;

  @property({ type: String, attribute: 'header-text', reflect: true })
  public headerText = '';

  public override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'add-reaction',
      this.handleAddReaction as EventListener
    );
    this.addEventListener(
      'message-send',
      this.handleSendMessage as EventListener
    );
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'message-send',
      this.handleSendMessage as EventListener
    );
    this.removeEventListener(
      'add-reaction',
      this.handleAddReaction as EventListener
    );
  }

  private handleSendMessage(e: CustomEvent) {
    const text = e.detail.text;
    const attachments = e.detail.attachments || [];

    if ((!text.trim() && attachments.length === 0) || !this.user) return;

    const newMessage: IgcMessage = {
      id: Date.now().toString(),
      text,
      sender: this.user,
      timestamp: new Date(),
      status: 'sent',
      attachments,
      reactions: [],
    };

    this.messages = [...this.messages, newMessage];
    this.emitEvent('igcMessageEntered', { detail: newMessage });
  }

  private handleAddReaction(e: CustomEvent) {
    const { messageId, emojiId, emoji } = e.detail;

    if (!messageId) return;

    this.messages = this.messages.map((message) => {
      if (message.id === messageId) {
        const userReaction = message.reactions?.find(
          (r) => this.user && r.users.includes(this.user.id)
        );

        if (userReaction) {
          // Remove reaction
          message.reactions?.forEach((r) => {
            if (r.id === userReaction.id) {
              r.count -= 1;
              r.users = (r.users ?? []).filter((id) => id !== this.user?.id);
            }
          });

          message.reactions =
            message.reactions?.filter((r) => r.count > 0) || [];
        }

        const existingReaction = message.reactions?.find(
          (r) => r.id === emojiId
        );

        if (existingReaction) {
          // Add reaction
          message.reactions?.forEach((r) => {
            if (r.id === emojiId) {
              r.count += 1;
              if (this.user) {
                r.users.push(this.user.id);
              }
            }
          });

          message.reactions = message.reactions ?? [];
        }

        if (!existingReaction && userReaction?.id !== emojiId) {
          // Create new reaction
          const newReaction: IgcMessageReaction = {
            id: emojiId,
            emoji,
            count: 1,
            users: this.user ? [this.user.id] : [],
          };

          message.reactions = [...(message.reactions || []), newReaction];
        }
      }

      return { ...message };
    });
  }

  protected override render() {
    return html`
      <div class="chat-container">
        <igc-chat-header .text=${this.headerText}></igc-chat-header>
        <igc-chat-message-list
          .messages=${this.messages}
          .user=${this.user}
          .typingUsers=${this.typingUsers}
          .scrollBottom=${this.scrollBottom}
          .disableReactions=${this.disableReactions}
          .hideAvatar=${this.hideAvatar}
          .hideUserName=${this.hideUserName}
          .hideMetaData=${this.hideMetaData}
        >
        </igc-chat-message-list>
        <igc-chat-input
          .disableAttachments=${this.disableAttachments}
          .disableEmojis=${this.disableEmojis}
          @message-send=${this.handleSendMessage}
        ></igc-chat-input>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat': IgcChatComponent;
  }
}

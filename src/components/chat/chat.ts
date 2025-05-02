import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcChatHeaderComponent from './chat-header.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageListComponent from './chat-message-list.js';
import { styles } from './themes/chat.base.css.js';
import type { IgcMessage, IgcUser } from './types.js';

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

  @property()
  public user: IgcUser | undefined;

  @property({ reflect: true })
  public messages: IgcMessage[] = [];

  @property({ reflect: true, attribute: 'typing-users' })
  public typingUsers: IgcUser[] = [];

  @property({ type: Boolean, attribute: 'scroll-bottom' })
  public scrollBottom = true;

  @property({ type: Boolean, attribute: 'enable-reactions' })
  public enableReactions = true;

  @property({ type: Boolean, attribute: 'enable-attachments' })
  public enableAttachments = true;

  @property({ type: Boolean, attribute: 'enable-emoji-picker' })
  public enableEmojiPicker = true;

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
    const { messageId, emoji } = e.detail;

    this.messages.map((message) => {
      if (message.id === messageId) {
        const existingReaction = message.reactions?.find(
          (r) => r.emoji === emoji
        );

        if (existingReaction && this.user) {
          // Toggle reaction for current user
          const userId = this.user.id;
          const hasReacted = existingReaction.users.includes(userId);

          if (hasReacted) {
            // Remove reaction
            const updatedReactions =
              message.reactions
                ?.map((r) => {
                  if (r.emoji === emoji) {
                    return {
                      ...r,
                      count: r.count - 1,
                      users: r.users.filter((id) => id !== userId),
                    };
                  }
                  return r;
                })
                .filter((r) => r.count > 0) || [];

            return {
              ...message,
              reactions: updatedReactions,
            };
          }

          // Add reaction
          const updatedReactions =
            message.reactions?.map((r) => {
              if (r.emoji === emoji) {
                return {
                  ...r,
                  count: r.count + 1,
                  users: [...r.users, userId],
                };
              }
              return r;
            }) || [];

          return {
            ...message,
            reactions: updatedReactions,
          };
        }

        // Create new reaction
        const newReaction = {
          emoji,
          count: 1,
          users: [this.user?.id],
        };

        return {
          ...message,
          reactions: [...(message.reactions || []), newReaction],
        };
      }
      return message;
    });
  }

  protected override render() {
    return html`
      <div class="chat-container">
        <igc-chat-header .text=${this.headerText}></igc-chat-header>
        <igc-chat-message-list
          .messages=${this.messages}
          .user=${this.user}
          .typing-users=${this.typingUsers}
          .scroll-bottom=${this.scrollBottom}
          .enable-reactions=${this.enableReactions}
        >
        </igc-chat-message-list>
        <igc-chat-input
          .enable-attachments=${this.enableAttachments}
          .enable-emoji-picker=${this.enableEmojiPicker}
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

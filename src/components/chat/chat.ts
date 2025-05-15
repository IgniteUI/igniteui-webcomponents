import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcButtonComponent from '../button/button.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageListComponent from './chat-message-list.js';
import { styles } from './themes/chat.base.css.js';
import type { IgcMessage } from './types.js';

export interface IgcChatComponentEventMap {
  igcMessageSend: CustomEvent<IgcMessage>;
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
      IgcChatInputComponent,
      IgcChatMessageListComponent,
      IgcButtonComponent
    );
  }

  @property({ reflect: true, attribute: false })
  public messages: IgcMessage[] = [];

  @property({ reflect: true, attribute: false })
  public isAiResponding = false;

  @property({ type: Boolean, attribute: 'hide-avatar' })
  public hideAvatar = false;

  @property({ type: Boolean, attribute: 'hide-user-name' })
  public hideUserName = false;

  @property({ type: Boolean, attribute: 'disable-auto-scroll' })
  public disableAutoScroll = false;

  @property({ type: Boolean, attribute: 'disable-attachments' })
  public disableAttachments = false;

  @property({ type: String, attribute: 'header-text', reflect: true })
  public headerText = '';

  public override connectedCallback() {
    super.connectedCallback();
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
  }

  private handleSendMessage(e: CustomEvent) {
    const text = e.detail.text;
    const attachments = e.detail.attachments || [];

    if (!text.trim() && attachments.length === 0) return;

    const newMessage: IgcMessage = {
      id: Date.now().toString(),
      text,
      isResponse: false,
      timestamp: new Date(),
      attachments,
    };

    this.messages = [...this.messages, newMessage];
    this.emitEvent('igcMessageSend', { detail: newMessage });
  }

  protected override render() {
    return html`
      <div class="chat-container">
        <div class="header" part="header">
          <div class="info">
            <slot name="prefix" part="prefix"></slot>
            <slot name="title" part="title">${this.headerText}</slot>
          </div>
          <slot name="actions" class="actions">
            <igc-button variant="flat">⋯</igcbutton>
          </slot>
        </div>
        <igc-chat-message-list
          .messages=${this.messages}
          .disableAutoScroll=${this.disableAutoScroll}
          .isAiResponding=${this.isAiResponding}
        >
        </igc-chat-message-list>
        <igc-chat-input
          .disableAttachments=${this.disableAttachments}
          .isAiResponding=${this.isAiResponding}
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

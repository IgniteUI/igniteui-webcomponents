import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcButtonComponent from '../button/button.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageListComponent from './chat-message-list.js';
import { styles } from './themes/chat.base.css.js';
import type {
  AttachmentTemplate,
  IgcMessage,
  IgcMessageAttachment,
  MessageActionsTemplate,
} from './types.js';

export interface IgcChatComponentEventMap {
  igcMessageCreated: CustomEvent<IgcMessage>;
  igcAttachmentClick: CustomEvent<IgcMessageAttachment>;
  igcAttachmentChange: CustomEvent<IgcMessageAttachment>;
  igcTypingChange: CustomEvent<boolean>;
  igcInputFocus: CustomEvent<void>;
  igcInputBlur: CustomEvent<void>;
  igcInputChange: CustomEvent<string>;
  igcMessageCopied: CustomEvent<IgcMessage>;
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

  @property({ type: Boolean, attribute: 'hide-avatar' })
  public hideAvatar = false;

  @property({ type: Boolean, attribute: 'hide-user-name' })
  public hideUserName = false;

  @property({ type: Boolean, attribute: 'disable-auto-scroll' })
  public disableAutoScroll = false;

  @property({ type: Boolean, attribute: 'disable-attachments' })
  public disableAttachments = false;

  /**
   * The accepted files that could be attached.
   * Defines the file types as a list of comma-separated values that the file input should accept.
   * @attr
   */
  @property({ type: String })
  public acceptedFiles = '';

  @property({ type: String, attribute: 'header-text', reflect: true })
  public headerText = '';

  @property({ type: Function })
  public attachmentTemplate?: AttachmentTemplate;

  @property({ type: Function })
  public attachmentHeaderTemplate?: AttachmentTemplate;

  @property({ type: Function })
  public attachmentActionsTemplate?: AttachmentTemplate;

  @property({ type: Function })
  public attachmentContentTemplate?: AttachmentTemplate;

  @property({ type: Function })
  public messageActionsTemplate?: MessageActionsTemplate;

  public override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'message-created',
      this.handleSendMessage as EventListener
    );
    this.addEventListener(
      'attachment-click',
      this.handleAttachmentClick as EventListener
    );
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'message-created',
      this.handleSendMessage as EventListener
    );
    this.removeEventListener(
      'attachment-click',
      this.handleAttachmentClick as EventListener
    );
  }

  private handleSendMessage(e: CustomEvent) {
    const text = e.detail.text;
    const attachments = e.detail.attachments || [];

    if (!text.trim() && attachments.length === 0) return;

    const newMessage: IgcMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      attachments,
    };

    this.messages = [...this.messages, newMessage];
    this.emitEvent('igcMessageCreated', { detail: newMessage });
  }

  private handleAttachmentClick(e: CustomEvent) {
    const attachmentArgs = e.detail.attachment;
    this.emitEvent('igcAttachmentClick', { detail: attachmentArgs });
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
            <igc-button variant="flat">⋯</igc-button>
          </slot>
        </div>
        <igc-chat-message-list
          .messages=${this.messages}
          .disableAutoScroll=${this.disableAutoScroll}
          .attachmentTemplate=${this.attachmentTemplate}
          .attachmentHeaderTemplate=${this.attachmentHeaderTemplate}
          .attachmentActionsTemplate=${this.attachmentActionsTemplate}
          .attachmentContentTemplate=${this.attachmentContentTemplate}
          .messageActionsTemplate=${this.messageActionsTemplate}
        >
        </igc-chat-message-list>
        <igc-chat-input
          .disableAttachments=${this.disableAttachments}
          .acceptedFiles=${this.acceptedFiles}
          @message-created=${this.handleSendMessage}
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

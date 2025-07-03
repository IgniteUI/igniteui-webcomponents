import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import IgcButtonComponent from '../button/button.js';
import { chatContext } from '../common/context.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageListComponent from './chat-message-list.js';
import { styles } from './themes/chat.base.css.js';
import type {
  IgcChatOptions,
  IgcMessage,
  IgcMessageAttachment,
} from './types.js';

export interface IgcChatComponentEventMap {
  igcMessageCreated: CustomEvent<IgcMessage>;
  igcAttachmentClick: CustomEvent<IgcMessageAttachment>;
  igcAttachmentChange: CustomEvent<IgcMessageAttachment>;
  igcAttachmentDrag: CustomEvent<any>;
  igcAttachmentDrop: CustomEvent<any>;
  igcTypingChange: CustomEvent<boolean>;
  igcInputFocus: CustomEvent<any>;
  igcInputBlur: CustomEvent<any>;
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

  private _context = new ContextProvider(this, {
    context: chatContext,
    initialValue: this,
  });

  @state()
  private inputAttachments: IgcMessageAttachment[] = [];

  @property({ type: String, reflect: true, attribute: 'current-user-id' })
  public currentUserId = 'user';

  @property({ reflect: true, attribute: false })
  public messages: IgcMessage[] = [];

  @property({ attribute: false })
  public options?: IgcChatOptions;

  @watch('currentUserId')
  @watch('messages')
  @watch('options')
  protected contextChanged() {
    this._context.setValue(this, true);
  }

  constructor() {
    super();
    this.addEventListener(
      'attachment-click',
      this.handleAttachmentClick as EventListener
    );
  }

  private handleSendMessage(e: CustomEvent) {
    const text = e.detail.text;
    const attachments = e.detail.attachments || [];

    if (!text.trim() && attachments.length === 0) return;

    this.addMessage({ text, attachments });
  }

  private handleAttachmentClick(e: CustomEvent) {
    const attachmentArgs = e.detail.attachment;
    this.emitEvent('igcAttachmentClick', { detail: attachmentArgs });
  }

  private handleAttachmentChange(e: CustomEvent) {
    const allowed = this.emitEvent('igcAttachmentChange', {
      detail: e.detail,
      cancelable: true,
    });
    if (allowed) {
      this.inputAttachments = [...e.detail];
    }
  }

  private addMessage(message: {
    id?: string;
    text: string;
    sender?: string;
    timestamp?: Date;
    attachments?: IgcMessageAttachment[];
  }) {
    const newMessage: IgcMessage = {
      id: message.id ?? Date.now().toString(),
      text: message.text,
      sender: message.sender ?? this.currentUserId,
      timestamp: message.timestamp ?? new Date(),
      attachments: message.attachments || [],
    };
    const allowed = this.emitEvent('igcMessageCreated', {
      detail: newMessage,
      cancelable: true,
    });

    if (allowed) {
      this.messages = [...this.messages, newMessage];
      this.inputAttachments = [];
    }
  }

  private renderHeader() {
    return html` <div class="header" part="header">
      <div class="info">
        <slot name="prefix" part="prefix"></slot>
        <slot name="title" part="title">${this.options?.headerText}</slot>
      </div>
      <slot name="actions" class="actions">
        <igc-button variant="flat">⋯</igc-button>
      </slot>
    </div>`;
  }

  private renderSuggestions() {
    return html` <div class="suggestions-container">
      <slot name="suggestions" part="suggestions">
        ${this.options?.suggestions?.map(
          (suggestion) => html`
            <slot name="suggestion" part="suggestion">
              <igc-chip @click=${() => this.addMessage({ text: suggestion })}>
                <span>${suggestion}</span>
              </igc-chip>
            </slot>
          `
        )}
      </slot>
    </div>`;
  }

  private renderInputArea() {
    return html` <igc-chat-input
      .attachments=${this.inputAttachments}
      @message-created=${this.handleSendMessage}
      @typing-change=${(e: CustomEvent) => {
        this.emitEvent('igcTypingChange', { detail: e.detail });
      }}
      @input-change=${(e: CustomEvent) => {
        this.emitEvent('igcInputChange', { detail: e.detail });
      }}
      @attachment-change=${this.handleAttachmentChange}
      @drop-attachment=${() => this.emitEvent('igcAttachmentDrop')}
      @drag-attachment=${() => this.emitEvent('igcAttachmentDrag')}
      @focus-input=${() => {
        this.emitEvent('igcInputFocus');
      }}
      @blur-input=${() => {
        this.emitEvent('igcInputBlur');
      }}
    ></igc-chat-input>`;
  }

  protected override firstUpdated() {
    this._context.setValue(this, true);
  }

  protected override render() {
    return html`
      <div class="chat-container">
        ${this.renderHeader()}
        <igc-chat-message-list> </igc-chat-message-list>
        ${this.renderSuggestions()} ${this.renderInputArea()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat': IgcChatComponent;
  }
}

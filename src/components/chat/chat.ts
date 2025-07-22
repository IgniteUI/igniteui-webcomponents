import { ContextProvider } from '@lit/context';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import IgcButtonComponent from '../button/button.js';
import { chatContext } from '../common/context.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageListComponent from './chat-message-list.js';
import { createChatState } from './chat-state.js';
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

  private readonly _chatState = createChatState(this);

  private _context = new ContextProvider(this, {
    context: chatContext,
    initialValue: this._chatState,
  });

  /**
   * The list of chat messages currently displayed.
   */
  @property({ reflect: true, attribute: false })
  public set messages(value: IgcMessage[]) {
    this._chatState.messages = value;
  }

  public get messages(): IgcMessage[] {
    return this._chatState.messages;
  }

  /**
   * The chat message that is still unsend.
   */
  @property({ reflect: true, attribute: false })
  public set draftMessage(value: {
    text: string;
    attachments?: IgcMessageAttachment[];
  }) {
    if (this._chatState) {
      this._chatState.inputValue = value.text;
      this._chatState.inputAttachments = value.attachments || [];
      this.requestUpdate();
    }
  }

  public get draftMessage(): {
    text: string;
    attachments?: IgcMessageAttachment[];
  } {
    return {
      text: this._chatState?.inputValue,
      attachments: this._chatState?.inputAttachments,
    };
  }

  /**
   * Controls the chat configuration and how it will be displayed.
   */

  @property({ attribute: false })
  public set options(value: IgcChatOptions) {
    this._chatState.options = value;
  }

  public get options(): IgcChatOptions | undefined {
    return this._chatState.options;
  }

  @watch('messages')
  @watch('draftMessage')
  @watch('options')
  protected contextChanged() {
    this._context.setValue(this._chatState, true);
  }

  private renderHeader() {
    return html` <div class="header" part="header">
      <div class="info">
        <slot name="prefix" part="prefix"></slot>
        <slot name="title" part="title"
          >${this._chatState.options?.headerText}</slot
        >
      </div>
      <slot name="actions" class="actions">
        <igc-button variant="flat">⋯</igc-button>
      </slot>
    </div>`;
  }

  private renderSuggestions() {
    return html` <div
      class="suggestions-container"
      role="list"
      aria-label="Suggestions"
    >
      <slot name="suggestions" part="suggestions">
        ${this._chatState.options?.suggestions?.map(
          (suggestion) => html`
            <slot name="suggestion" part="suggestion" role="listitem">
              <igc-chip
                @click=${() =>
                  this._chatState?.handleSuggestionClick(suggestion)}
              >
                <span>${suggestion}</span>
              </igc-chip>
            </slot>
          `
        )}
      </slot>
    </div>`;
  }

  protected override firstUpdated() {
    this._context.setValue(this._chatState, true);
  }

  protected override render() {
    return html`
      <div class="chat-container">
        ${this.renderHeader()}
        <igc-chat-message-list> </igc-chat-message-list>
        ${this.renderSuggestions()}
        <igc-chat-input></igc-chat-input>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat': IgcChatComponent;
  }
}

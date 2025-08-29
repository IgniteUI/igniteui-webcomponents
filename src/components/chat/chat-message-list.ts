import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcChatMessageComponent from './chat-message.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/message-list.base.css.js';
import { styles as shared } from './themes/shared/message-list.common.css.js';

/**
 * A chat message list component that displays a list of chat messages grouped by date.
 *
 * @element igc-chat-message-list
 *
 * This component:
 * - Renders messages using the `<igc-chat-message>` component.
 * - Manages focus highlighting on active messages.
 * - Automatically scrolls to the bottom when new messages arrive, unless auto-scroll is disabled.
 * - Displays a typing indicator if the chat state option `isTyping` is true.
 *
 * Accessibility:
 * - Uses ARIA roles and properties for grouping and active descendant management.
 * - Message items have role="option" for assistive technologies.
 *
 */
export default class IgcChatMessageListComponent extends LitElement {
  /** Tag name of the custom element. */
  public static readonly tagName = 'igc-chat-message-list';

  /** Styles applied to the component */
  public static override styles = [styles, shared];

  /**
   * Registers this component and its dependencies.
   * Used internally for component setup.
   */
  /* blazorSuppress */
  public static register() {
    registerComponent(IgcChatMessageListComponent, IgcChatMessageComponent);
  }

  /**
   * Consumed chat state context providing messages, options, and user data.
   * @private
   */
  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  /**
   * Scrolls the container to the bottom, typically called after new messages are rendered.
   * @private
   */
  private scrollToBottom() {
    requestAnimationFrame(() => {
      const container = this.shadowRoot?.host as HTMLElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  /**
   * Scrolls the view to a specific message by id.
   * @param messageId - The id of the message to scroll to
   * @private
   */
  public scrollToMessage(messageId: string) {
    const messageElement = this.shadowRoot?.querySelector(
      `#message-${messageId}`
    );
    messageElement?.scrollIntoView();
  }

  /**
   * Lifecycle: called when the component updates.
   * Scrolls to bottom unless auto-scroll is disabled.
   */
  protected override updated() {
    if (!this._chatState?.options?.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Lifecycle: called after first render.
   * Scrolls to bottom unless auto-scroll is disabled.
   */
  protected override firstUpdated() {
    if (!this._chatState?.options?.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Renders the typing indicator template.
   * @protected
   */
  protected *renderLoadingTemplate() {
    yield html`<div part="typing-indicator">
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
      <div part="typing-dot"></div>
    </div>`;
  }

  /**
   * Main render method.
   * Groups messages by date and renders each message.
   * Shows the typing indicator if applicable.
   */
  protected override render() {
    const messages = this._chatState?.messages ?? [];

    return html`
      <div
        part="message-container"
        role="group"
        aria-label="Message list"
        tabindex="0"
      ></div>
        <div part="message-list">
           ${repeat(
             messages,
             (message) => message.id,
             (message) => {
               const messageId = `message-${message.id}`;
               return html`
                 <igc-chat-message
                   id=${messageId}
                   role="option"
                   part="message-item"
                   .message=${message}
                   exportparts="message-container, message-text, message-attachments, message-actions,
                   attachments-container, attachment, attachment-header, attachment-content, attachment-icon, file-name, actions: attachment-actions"
                 >
                 </igc-chat-message>
               `;
             }
           )}
          ${
            this._chatState?.options?.isTyping
              ? (this._chatState?.options?.renderers?.typingIndicator?.render({
                  param: undefined,
                  defaults: {
                    typingIndicator: {
                      render: () => this.renderLoadingTemplate(),
                    },
                  },
                  options: this._chatState?.options,
                }) ?? this.renderLoadingTemplate())
              : nothing
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message-list': IgcChatMessageListComponent;
  }
}

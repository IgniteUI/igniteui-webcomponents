import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { registerComponent } from '../common/definitions/register.js';
import { renderMarkdown } from './markdown-util.js';
import { IgcMessageAttachmentsComponent } from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import type {
  AttachmentTemplate,
  IgcMessage,
  MessageActionsTemplate,
} from './types.js';

/**
 *
 * @element igc-chat-message
 *
 */
export default class IgcChatMessageComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-chat-message';

  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatMessageComponent,
      IgcMessageAttachmentsComponent,
      IgcAvatarComponent
    );
  }

  @property({ reflect: true, attribute: false })
  public message: IgcMessage | undefined;

  @property({ reflect: true, attribute: false })
  public isResponse = false;

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

  protected override render() {
    const containerClass = `message-container ${!this.isResponse ? 'sent' : ''}`;

    return html`
      <div class=${containerClass}>
        <div class="bubble">
          ${this.message?.text.trim()
            ? html` <div>${renderMarkdown(this.message?.text)}</div>`
            : ''}
          ${this.message?.attachments && this.message?.attachments.length > 0
            ? html`<igc-message-attachments
                .attachments=${this.message?.attachments}
                .attachmentTemplate=${this.attachmentTemplate}
                .attachmentHeaderTemplate=${this.attachmentHeaderTemplate}
                .attachmentActionsTemplate=${this.attachmentActionsTemplate}
                .attachmentContentTemplate=${this.attachmentContentTemplate}
              >
              </igc-message-attachments>`
            : ''}
          ${this.messageActionsTemplate && this.message
            ? this.messageActionsTemplate(this.message)
            : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message': IgcChatMessageComponent;
  }
}

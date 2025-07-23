import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/message-attachments.base.css.js';
import {
  closeIcon,
  fileIcon,
  type IgcMessageAttachment,
  imageIcon,
  moreIcon,
  previewIcon,
} from './types.js';

/**
 *
 * @element igc-message-attachments
 *
 */
export default class IgcMessageAttachmentsComponent extends LitElement {
  public static readonly tagName = 'igc-message-attachments';

  public static override styles = styles;

  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcMessageAttachmentsComponent,
      IgcIconComponent,
      IgcIconButtonComponent,
      IgcExpansionPanelComponent
    );
  }
  @property({ attribute: false })
  attachments: IgcMessageAttachment[] = [];

  @property({ attribute: false })
  previewImage = '';

  constructor() {
    super();
    registerIconFromText('close', closeIcon, 'material');
    registerIconFromText('file', fileIcon, 'material');
    registerIconFromText('image', imageIcon, 'material');
    registerIconFromText('preview', previewIcon, 'material');
    registerIconFromText('more', moreIcon, 'material');
  }

  private handleToggle(e: CustomEvent, attachment: IgcMessageAttachment) {
    this._chatState?.emitEvent('igcAttachmentClick', { detail: attachment });
    e.preventDefault();
  }

  private getURL(attachment: IgcMessageAttachment): string {
    if (attachment.url) {
      return attachment.url;
    }
    if (attachment.file) {
      return URL.createObjectURL(attachment.file);
    }
    return '';
  }

  private renderAttachmentHeaderText(attachment: IgcMessageAttachment) {
    return html`<div part="details">
      ${this._chatState?.options?.templates?.attachmentHeaderTemplate
        ? this._chatState.options.templates.attachmentHeaderTemplate(
            this.attachments
          )
        : html`
            <slot name="attachment-icon">
              ${attachment.type === 'image' ||
              attachment.file?.type.startsWith('image/')
                ? html`<igc-icon
                    name="image"
                    collection="material"
                    part="attachment-icon"
                  ></igc-icon>`
                : html`<igc-icon
                    name="file"
                    collection="material"
                    part="attachment-icon"
                  ></igc-icon>`}
            </slot>
            <slot name="attachment-name">
              <span part="file-name">${attachment.name}</span>
            </slot>
          `}
    </div>`;
  }

  private renderAttachmentHeaderActions() {
    return html`<div part="actions">
      ${this._chatState?.options?.templates?.attachmentActionsTemplate
        ? this._chatState.options.templates.attachmentActionsTemplate(
            this.attachments
          )
        : nothing}
    </div>`;
  }

  private renderAttachmentContent(attachment: IgcMessageAttachment) {
    return html` ${this._chatState?.options?.templates
      ?.attachmentContentTemplate
      ? this._chatState.options.templates.attachmentContentTemplate(
          this.attachments
        )
      : html`
          <slot name="attachment-content">
            ${attachment.type === 'image' ||
            attachment.file?.type.startsWith('image/')
              ? html` <img
                  part="image-attachment"
                  src=${this.getURL(attachment)}
                  alt=${attachment.name}
                />`
              : nothing}
          </slot>
        `}`;
  }

  private renderDefaultAttachmentsTemplate() {
    return html`${this.attachments.map(
      (attachment) =>
        html`<igc-expansion-panel
          indicator-position="none"
          .open=${attachment.type === 'image' ||
          attachment.file?.type.startsWith('image/') ||
          this._chatState?.options?.templates?.attachmentContentTemplate}
          @igcClosing=${(ev: CustomEvent) => this.handleToggle(ev, attachment)}
          @igcOpening=${(ev: CustomEvent) => this.handleToggle(ev, attachment)}
        >
          <div slot="title" part="attachment">
            ${this.renderAttachmentHeaderText(attachment)}
            ${this.renderAttachmentHeaderActions()}
          </div>

          ${this.renderAttachmentContent(attachment)}
        </igc-expansion-panel>`
    )}`;
  }

  protected override render() {
    return html`
      <div part="attachments-container">
        ${this._chatState?.options?.templates?.attachmentTemplate
          ? this._chatState.options.templates.attachmentTemplate(
              this.attachments
            )
          : this.renderDefaultAttachmentsTemplate()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-message-attachments': IgcMessageAttachmentsComponent;
  }
}

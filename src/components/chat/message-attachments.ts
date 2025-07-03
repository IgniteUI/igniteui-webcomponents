import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import type IgcChatComponent from './chat.js';
import { styles } from './themes/message-attachments.base.css.js';
import {
  type IgcMessageAttachment,
  closeIcon,
  fileIcon,
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
  private _chat?: IgcChatComponent;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcMessageAttachmentsComponent,
      IgcIconComponent,
      IgcIconButtonComponent,
      IgcExpansionPanelComponent
    );
  }
  @property({ type: Array })
  attachments: IgcMessageAttachment[] = [];

  @property({ type: String })
  previewImage = '';

  constructor() {
    super();
    registerIconFromText('close', closeIcon, 'material');
    registerIconFromText('file', fileIcon, 'material');
    registerIconFromText('image', imageIcon, 'material');
    registerIconFromText('preview', previewIcon, 'material');
    registerIconFromText('more', moreIcon, 'material');
  }

  private openImagePreview(attachment: IgcMessageAttachment) {
    this.previewImage = this.getURL(attachment);
  }

  private closeImagePreview() {
    this.previewImage = '';
  }

  private handleToggle(e: CustomEvent, attachment: IgcMessageAttachment) {
    this.handleAttachmentClick(attachment);
    e.preventDefault();
  }

  private handleAttachmentClick(attachment: IgcMessageAttachment) {
    this.dispatchEvent(
      new CustomEvent('attachment-click', {
        detail: { attachment },
        bubbles: true,
        composed: true,
      })
    );
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
    return html` <div class="details">
      ${this._chat?.options?.templates?.attachmentHeaderTemplate
        ? this._chat.options.templates.attachmentHeaderTemplate(
            this.attachments
          )
        : html`
            <slot name="attachment-icon">
              ${attachment.type === 'image' ||
              attachment.file?.type.startsWith('image/')
                ? html`<igc-icon
                    name="image"
                    collection="material"
                    class="medium"
                  ></igc-icon>`
                : html`<igc-icon
                    name="file"
                    collection="material"
                    class="medium"
                  ></igc-icon>`}
            </slot>
            <slot name="attachment-name">
              <span class="file-name">${attachment.name}</span>
            </slot>
          `}
    </div>`;
  }

  private renderAttachmentHeaderActions(attachment: IgcMessageAttachment) {
    return html` <div class="actions">
      ${this._chat?.options?.templates?.attachmentActionsTemplate
        ? this._chat.options.templates.attachmentActionsTemplate(
            this.attachments
          )
        : html`
            <slot name="attachment-actions">
              ${attachment.type === 'image' ||
              attachment.file?.type.startsWith('image/')
                ? html` <igc-icon-button
                    name="preview"
                    collection="material"
                    variant="flat"
                    class="small"
                    @click=${() => this.openImagePreview(attachment)}
                  ></igc-icon-button>`
                : ''}
              <igc-icon-button
                name="more"
                collection="material"
                variant="flat"
                class="small"
              ></igc-icon-button>
            </slot>
          `}
    </div>`;
  }

  private renderAttachmentContent(attachment: IgcMessageAttachment) {
    return html` ${this._chat?.options?.templates?.attachmentContentTemplate
      ? this._chat.options.templates.attachmentContentTemplate(this.attachments)
      : html`
          <slot name="attachment-content">
            ${attachment.type === 'image' ||
            attachment.file?.type.startsWith('image/')
              ? html` <img
                  class="image-attachment"
                  src=${this.getURL(attachment)}
                  alt=${attachment.name}
                />`
              : ''}
          </slot>
        `}`;
  }

  private renderDefaultAttachmentsTemplate() {
    return html` ${this.attachments.map(
      (attachment) =>
        html` <igc-expansion-panel
          indicator-position="none"
          .open=${attachment.type === 'image' ||
          attachment.file?.type.startsWith('image/') ||
          this._chat?.options?.templates?.attachmentContentTemplate}
          @igcClosing=${(ev: CustomEvent) => this.handleToggle(ev, attachment)}
          @igcOpening=${(ev: CustomEvent) => this.handleToggle(ev, attachment)}
        >
          <div slot="title" class="attachment">
            ${this.renderAttachmentHeaderText(attachment)}
            ${this.renderAttachmentHeaderActions(attachment)}
          </div>

          ${this.renderAttachmentContent(attachment)}
        </igc-expansion-panel>`
    )}`;
  }

  private renderImagePreview() {
    return html` ${this.previewImage
      ? html`
          <div class="image-overlay" @click=${this.closeImagePreview}>
            <img class="overlay-image" src=${this.previewImage} />
            <igc-icon-button
              name="close"
              collection="material"
              variant="contained"
              class="small"
              @click=${this.closeImagePreview}
            ></igc-icon-button>
          </div>
        `
      : ''}`;
  }

  protected override render() {
    return html`
      <div class="attachments-container">
        ${this._chat?.options?.templates?.attachmentTemplate
          ? this._chat.options.templates.attachmentTemplate(this.attachments)
          : this.renderDefaultAttachmentsTemplate()}
      </div>

      ${this.renderImagePreview()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-message-attachments': IgcMessageAttachmentsComponent;
  }
}

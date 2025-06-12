import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import { styles } from './themes/message-attachments.base.css';
import {
  type AttachmentTemplate,
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
  /** @private */
  public static readonly tagName = 'igc-message-attachments';

  public static override styles = styles;

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

  @property({ attribute: false })
  attachmentTemplate: AttachmentTemplate | undefined;

  @property({ attribute: false })
  attachmentHeaderTemplate: AttachmentTemplate | undefined;

  @property({ attribute: false })
  attachmentActionsTemplate: AttachmentTemplate | undefined;

  @property({ attribute: false })
  attachmentContentTemplate: AttachmentTemplate | undefined;

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

  private getFile(attachment: IgcMessageAttachment): File | undefined {
    if (attachment.file) {
      return attachment.file;
    }
    if (attachment.url) {
      const url = new URL(attachment.url);
      const fileName = url.pathname.split('/').pop() || 'attachment';
      return new File([], fileName, {
        type: attachment.type || 'application/octet-stream',
      });
    }
    return undefined;
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

  protected override render() {
    return html`
      <div class="attachments-container">
        ${this.attachmentTemplate
          ? this.attachmentTemplate(this.attachments)
          : html` ${this.attachments.map(
              (attachment) =>
                html` <igc-expansion-panel
                  indicator-position="none"
                  .open=${attachment.type === 'image' ||
                  attachment.file?.type.startsWith('image/')}
                  @igcClosing=${(ev: CustomEvent) =>
                    this.handleToggle(ev, attachment)}
                  @igcOpening=${(ev: CustomEvent) =>
                    this.handleToggle(ev, attachment)}
                >
                  <div slot="title" class="attachment">
                    <div class="details">
                      ${this.attachmentHeaderTemplate
                        ? this.attachmentHeaderTemplate(this.attachments)
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
                    </div>
                    <div class="actions">
                      ${this.attachmentActionsTemplate
                        ? this.attachmentActionsTemplate(this.attachments)
                        : html`
                            <slot name="attachment-actions">
                              ${attachment.type === 'image' ||
                              attachment.file?.type.startsWith('image/')
                                ? html` <igc-icon-button
                                    name="preview"
                                    collection="material"
                                    variant="flat"
                                    class="small"
                                    @click=${() =>
                                      this.openImagePreview(attachment)}
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
                    </div>
                  </div>

                  ${this.attachmentContentTemplate
                    ? this.attachmentContentTemplate(this.attachments)
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
                      `}
                </igc-expansion-panel>`
            )}`}
      </div>

      ${this.previewImage
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
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-message-attachments': IgcMessageAttachmentsComponent;
  }
}

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
export class IgcMessageAttachmentsComponent extends LitElement {
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

  @property({ type: Function })
  attachmentTemplate: AttachmentTemplate | undefined;

  @property({ type: Function })
  attachmentHeaderTemplate: AttachmentTemplate | undefined;

  @property({ type: Function })
  attachmentActionsTemplate: AttachmentTemplate | undefined;

  @property({ type: Function })
  attachmentContentTemplate: AttachmentTemplate | undefined;

  constructor() {
    super();
    registerIconFromText('close', closeIcon, 'material');
    registerIconFromText('file', fileIcon, 'material');
    registerIconFromText('image', imageIcon, 'material');
    registerIconFromText('preview', previewIcon, 'material');
    registerIconFromText('more', moreIcon, 'material');
  }

  private openImagePreview(url: string) {
    this.previewImage = url;
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

  protected override render() {
    return html`
      <div class="attachments-container">
        ${this.attachmentTemplate
          ? this.attachmentTemplate(this.attachments)
          : html` ${this.attachments.map(
              (attachment) =>
                html` <igc-expansion-panel
                  indicator-position="none"
                  .open=${attachment.file?.type.startsWith('image/')}
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
                              ${attachment.file?.type.startsWith('image/')
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
                              ${attachment.file?.type.startsWith('image/')
                                ? html` <igc-icon-button
                                    name="preview"
                                    collection="material"
                                    variant="flat"
                                    class="small"
                                    @click=${() =>
                                      this.openImagePreview(attachment.url)}
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
                          ${attachment.file?.type.startsWith('image/')
                            ? html` <img
                                class="image-attachment"
                                src=${attachment.url}
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

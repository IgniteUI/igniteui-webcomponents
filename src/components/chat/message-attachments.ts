import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import { styles } from './themes/message-attachments.base.css';
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

  constructor() {
    super();
    registerIconFromText('close', closeIcon, 'material');
    registerIconFromText('file', fileIcon, 'material');
    registerIconFromText('image', imageIcon, 'material');
    registerIconFromText('preview', previewIcon, 'material');
    registerIconFromText('more', moreIcon, 'material');
  }

  private formatFileSize(bytes = 0): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        ${this.attachments.map(
          (attachment) => html`
            <igc-expansion-panel
              indicator-position="none"
              .open=${attachment.type === 'image'}
              @igcClosing=${(ev: CustomEvent) =>
                this.handleToggle(ev, attachment)}
              @igcOpening=${(ev: CustomEvent) =>
                this.handleToggle(ev, attachment)}
            >
              <div slot="title" class="attachment">
                <div class="details">
                  ${attachment.type === 'image'
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
                  <span class="file-name">${attachment.name}</span>
                </div>
                <div class="actions">
                  ${attachment.type === 'image'
                    ? html` <igc-icon-button
                        name="preview"
                        collection="material"
                        variant="flat"
                        class="small"
                        @click=${() => this.openImagePreview(attachment.url)}
                      ></igc-icon-button>`
                    : ''}
                  <igc-icon-button
                    name="more"
                    collection="material"
                    variant="flat"
                    class="small"
                  ></igc-icon-button>
                </div>
              </div>

              ${attachment.type === 'image'
                ? html` <img
                    class="image-attachment"
                    src=${attachment.url}
                    alt=${attachment.name}
                  />`
                : ''}
            </igc-expansion-panel>
          `
        )}
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

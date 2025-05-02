import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import { styles } from './themes/message-attachments.base.css';
import { type IgcMessageAttachment, closeIcon, fileIcon } from './types.js';

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
      IgcIconButtonComponent
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

  protected override render() {
    return html`
      <div class="attachments-container">
        ${this.attachments.map((attachment) =>
          attachment.type === 'image'
            ? html`
                <div class="attachment-preview">
                  <img
                    class="image-attachment"
                    src=${attachment.url}
                    alt=${attachment.name}
                    @click=${() => this.openImagePreview(attachment.url)}
                  />
                </div>
              `
            : html`
                <a
                  class="file-attachment"
                  href=${attachment.url}
                  target="_blank"
                  download=${attachment.name}
                >
                  <igc-icon
                    name="file"
                    collection="material"
                    class="large"
                  ></igc-icon>
                  <div class="file-info">
                    <div class="file-name">${attachment.name}</div>
                    <div class="file-size">
                      ${this.formatFileSize(attachment.size)}
                    </div>
                  </div>
                </a>
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
    'igc-message-attachmants': IgcMessageAttachmentsComponent;
  }
}

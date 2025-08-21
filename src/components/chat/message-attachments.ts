import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/message-attachments.base.css.js';
import { styles as shared } from './themes/shared/message-attachments.common.css.js';
import {
  closeIcon,
  fileIcon,
  type IgcMessage,
  type IgcMessageAttachment,
  imageIcon,
  moreIcon,
  previewIcon,
} from './types.js';

/**
 * A component that renders message attachments within a chat.
 *
 * Displays attachments such as images or files, supporting custom templates
 * and default rendering using expansion panels.
 *
 * @element igc-message-attachments
 *
 * @csspart attachments-container - Container wrapping all attachments.
 * @csspart attachment - Wrapper for a single attachment.
 * @csspart attachment-header - Wrapper for a single attachment header.
 * @csspart attachments-content - Part representing the attachment preview.
 * @csspart attachment-icon - Icon part representing the attachment type.
 * @csspart file-name - Part representing the attachment's file name.
 * @csspart actions - Container for header action buttons.
 * @csspart image-attachment - Part for the image element inside an image attachment.
 *
 * @fires igcAttachmentClick - Fired when an attachment header is toggled (clicked).
 */
export default class IgcMessageAttachmentsComponent extends LitElement {
  public static readonly tagName = 'igc-message-attachments';

  public static override styles = [styles, shared];

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

  /**
   * The array of attachments to render.
   */
  @property({ attribute: false })
  message: IgcMessage | undefined;

  constructor() {
    super();
    registerIconFromText('close', closeIcon, 'material');
    registerIconFromText('file', fileIcon, 'material');
    registerIconFromText('image', imageIcon, 'material');
    registerIconFromText('preview', previewIcon, 'material');
    registerIconFromText('more', moreIcon, 'material');
  }

  private handleHeaderClick(attachment: IgcMessageAttachment) {
    this._chatState?.emitEvent('igcAttachmentClick', { detail: attachment });
  }

  private isImageAttachment(attachment: IgcMessageAttachment): boolean {
    return (
      attachment.type === 'image' ||
      !!attachment.file?.type.startsWith('image/')
    );
  }

  private _fileIcon = new URL('./assets/file.png', import.meta.url).href;
  private _jsonIcon = new URL('./assets/json.png', import.meta.url).href;
  private _linkIcon = new URL('./assets/link.png', import.meta.url).href;

  private _fileIconMap: Record<string, string> = {
    pdf: this._fileIcon,
    doc: this._fileIcon,
    docx: this._fileIcon,
    xls: this._fileIcon,
    xlsx: this._fileIcon,
    txt: this._fileIcon,
    json: this._jsonIcon,
    link: this._linkIcon,
    default: this._fileIcon, // A fallback icon
  };

  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    if (parts.length > 1) {
      return parts.pop()!.toLowerCase();
    }
    return '';
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

  private renderDefaultAttachmentContent(attachment: IgcMessageAttachment) {
    const ext = this.getFileExtension(attachment.name);
    const isImage = this.isImageAttachment(attachment);
    const url = isImage
      ? this.getURL(attachment)
      : (this._fileIconMap[ext] ?? this._fileIconMap['default']);
    const partName = isImage ? 'image-attachment' : 'file-attachment';
    return html` <img part="${partName}" src=${url} alt=${attachment.name} />`;
  }

  private renderAttachmentHeaderText(attachment: IgcMessageAttachment) {
    return html`<div part="details">
      ${this._chatState?.options?.templates?.attachmentHeaderTemplate &&
      this.message
        ? this._chatState.options.templates.attachmentHeaderTemplate(
            this.message
          )
        : html`${attachment.type === 'image' ||
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
            <span part="file-name">${attachment.name}</span> `}
    </div>`;
  }

  private renderAttachmentHeaderActions() {
    return html`<div part="actions">
      ${this._chatState?.options?.templates?.attachmentActionsTemplate &&
      this.message
        ? this._chatState.options.templates.attachmentActionsTemplate(
            this.message
          )
        : nothing}
    </div>`;
  }

  private renderAttachmentContent(attachment: IgcMessageAttachment) {
    return html`<div part="attachment-content">
      ${this._chatState?.options?.templates?.attachmentContentTemplate &&
      this.message
        ? this._chatState.options.templates.attachmentContentTemplate(
            this.message
          )
        : this.renderDefaultAttachmentContent(attachment)}
    </div>`;
  }

  private renderDefaultAttachmentsTemplate() {
    const parts = {
      'attachment-header': true,
      sent: this.message?.sender === this._chatState?.currentUserId,
    };

    return html`${this.message?.attachments?.map(
      (attachment) =>
        html`<div part="attachment">
          ${this.message?.sender === this._chatState?.currentUserId
            ? this.renderAttachmentContent(attachment)
            : nothing}
          <div
            part=${partMap(parts)}
            role="button"
            @click=${() => this.handleHeaderClick(attachment)}
          >
            ${this.renderAttachmentHeaderText(attachment)}
            ${this.renderAttachmentHeaderActions()}
          </div>

          ${this.message?.sender !== this._chatState?.currentUserId
            ? this.renderAttachmentContent(attachment)
            : nothing}
        </div>`
    )}`;
  }

  protected override render() {
    return html`
      <div part="attachments-container">
        ${this._chatState?.options?.templates?.attachmentTemplate &&
        this.message
          ? this._chatState.options.templates.attachmentTemplate(this.message)
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

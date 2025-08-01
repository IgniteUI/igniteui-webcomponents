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
import { styles as shared } from './themes/shared/message-attachments.common.css.js';
import {
  closeIcon,
  fileIcon,
  type IgcChatDefaultTemplates,
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

  private _defaultTemplateAssigned = false;

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
  attachments: IgcMessageAttachment[] = [];

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

  private getURL(attachment: IgcMessageAttachment): string {
    if (attachment.url) {
      return attachment.url;
    }
    if (attachment.file) {
      return URL.createObjectURL(attachment.file);
    }
    return '';
  }

  private defaultAttachmentContent(attachment: IgcMessageAttachment) {
    return html`${attachment.type === 'image' ||
    attachment.file?.type.startsWith('image/')
      ? html`<img
          part="image-attachment"
          src=${this.getURL(attachment)}
          alt=${attachment.name}
        />`
      : nothing}`;
  }

  private defaultAttachmentHeader(attachment: IgcMessageAttachment) {
    return html`${attachment.type === 'image' ||
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
      <span part="file-name">${attachment.name}</span> `;
  }

  private renderAttachmentHeader(attachment: IgcMessageAttachment) {
    return html` ${this._chatState?.options?.templates?.attachmentHeaderTemplate
      ? this._chatState.options.templates.attachmentHeaderTemplate(
          this.attachments
        )
      : this.defaultAttachmentHeader(attachment)}`;
  }

  private renderAttachmentContent(attachment: IgcMessageAttachment) {
    return html`<div part="attachment-content">
      ${this._chatState?.options?.templates?.attachmentContentTemplate
        ? this._chatState.options.templates.attachmentContentTemplate(
            this.attachments
          )
        : this.defaultAttachmentContent(attachment)}
    </div>`;
  }

  private defaultAttachmentsTemplate(attachments: IgcMessageAttachment[]) {
    return html`${attachments.map(
      (attachment) =>
        html`<div part="attachment">
          <div
            part="attachment-header"
            role="button"
            @click=${() => this.handleHeaderClick(attachment)}
          >
            ${this.renderAttachmentHeader(attachment)}
          </div>

          ${attachment.type === 'image' ||
          attachment.file?.type.startsWith('image/') ||
          this._chatState?.options?.templates?.attachmentContentTemplate
            ? this.renderAttachmentContent(attachment)
            : nothing}
          ${this._chatState?.options?.templates?.attachmentFooterTemplate
            ? this._chatState?.options?.templates?.attachmentFooterTemplate(
                this.attachments
              )
            : nothing}
        </div>`
    )}`;
  }

  /**
   * Ensures the default message attachments templates sre assigned to chat state
   * before rendering occurs.
   */
  private ensureDefaultTemplateAssigned() {
    if (this._chatState && !this._defaultTemplateAssigned) {
      this._chatState.defaultTemplates = {
        ...this._chatState?.defaultTemplates,
        defaultMessageAttachment: this.defaultAttachmentsTemplate.bind(this),
        defaultMessageAttachmentHeader: this.defaultAttachmentHeader.bind(this),
        defaultMessageAttachmentContent:
          this.defaultAttachmentContent.bind(this),
      } as IgcChatDefaultTemplates;
      this._defaultTemplateAssigned = true;
    }
  }

  protected override willUpdate() {
    this.ensureDefaultTemplateAssigned();
  }

  protected override firstUpdated() {
    this.ensureDefaultTemplateAssigned();
  }

  protected override render() {
    return html`
      <div part="attachments-container">
        ${this._chatState?.options?.templates?.attachmentTemplate
          ? this._chatState.options.templates.attachmentTemplate(
              this.attachments
            )
          : this.defaultAttachmentsTemplate(this.attachments)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-message-attachments': IgcMessageAttachmentsComponent;
  }
}

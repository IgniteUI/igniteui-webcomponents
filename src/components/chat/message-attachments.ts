import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
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
  type ChatRenderers,
  closeIcon,
  fileIcon,
  type IgcChatOptions,
  type IgcMessage,
  type IgcMessageAttachment,
  imageIcon,
  moreIcon,
  previewIcon,
} from './types.js';
import { createAttachmentURL, getFileExtension } from './utils.js';

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
  public static register(): void {
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
  public message?: IgcMessage;

  private _defaults: Partial<ChatRenderers>;
  private _renderers: Partial<ChatRenderers>;

  constructor() {
    super();
    this._defaults = {
      attachment: { render: (ctx: any) => this.renderAttachment(ctx) },
      attachmentHeader: { render: (ctx: any) => this.renderHeader(ctx.param) },
      attachmentContent: {
        render: (ctx: any) => this.renderContent(ctx.param),
      },
    };

    this._renderers = {
      ...this._defaults,
      ...this._chatState?.options?.renderers,
    };

    registerIconFromText('close', closeIcon, 'material');
    registerIconFromText('file', fileIcon, 'material');
    registerIconFromText('image', imageIcon, 'material');
    registerIconFromText('preview', previewIcon, 'material');
    registerIconFromText('more', moreIcon, 'material');
  }

  private _handleHeaderClick(attachment: IgcMessageAttachment) {
    this._chatState?.emitEvent('igcAttachmentClick', { detail: attachment });
  }
  /**
   * Default attachment header template used when no custom template is provided.
   * Renders the attachment icon and name.
   * @param attachment The message attachment to render
   * @returns TemplateResult containing the rendered attachment header
   */
  private renderHeader(attachment: IgcMessageAttachment) {
    const isCurrentUser =
      this.message?.sender === this._chatState?.currentUserId;
    const iconName =
      attachment.type === 'image' || attachment.file?.type.startsWith('image/')
        ? 'image'
        : 'file';

    return html`
      ${!isCurrentUser
        ? html`<igc-icon
            name=${iconName}
            collection="material"
            part="attachment-icon"
          ></igc-icon>`
        : nothing}
      <span part="file-name">${attachment.name}</span>
    `;
  }

  /**
   * Default attachment content template used when no custom template is provided.
   * Renders the attachment content based on its type.
   * @param attachment The message attachment to render
   * @returns TemplateResult containing the rendered attachment content
   */
  private renderContent(attachment: IgcMessageAttachment) {
    const ext = getFileExtension(attachment.name);
    const isImage = this._chatState?.isImageAttachment(attachment);
    const url = isImage
      ? createAttachmentURL(attachment)
      : (this._chatState?._fileIconMap[ext!] ??
        this._chatState?._fileIconMap['default']);
    const partName = isImage ? 'image-attachment' : 'file-attachment';

    return html`<img part="${partName}" src=${url!} alt=${attachment.name} />`;
  }

  private renderAttachment(ctx: {
    param: IgcMessageAttachment;
    defaults: Partial<ChatRenderers>;
    options?: IgcChatOptions;
  }) {
    const { param: attachment } = ctx;
    const isCurrentUser =
      this.message?.sender === this._chatState?.currentUserId;
    const attachmentParts = {
      attachment: true,
      sent: isCurrentUser,
    };
    const contentParts = {
      'attachment-content': true,
      sent: isCurrentUser,
    };
    const headerParts = {
      'attachment-header': true,
      sent: isCurrentUser,
    };

    const content = html`<div part=${partMap(contentParts)}>
      ${this._renderers.attachmentContent?.render(ctx)}
    </div>`;
    const header = html` <div
      part=${partMap(headerParts)}
      role="button"
      @click=${() => this._handleHeaderClick(attachment)}
    >
      <div part="details">${this._renderers.attachmentHeader?.render(ctx)}</div>
    </div>`;

    return html`
      <div part=${partMap(attachmentParts)}>
        ${isCurrentUser ? content : nothing} ${header}
        ${!isCurrentUser ? content : nothing}
      </div>
    `;
  }

  protected override render() {
    if (!this.message) {
      return nothing;
    }

    return html`
      <div part="attachments-container">
        ${(this.message.attachments ?? []).map(
          (attachment) =>
            html`${until(
              this._renderers.attachment?.render({
                param: attachment,
                defaults: this._defaults,
                options: this._chatState?.options!,
              }) || nothing
            )}`
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-message-attachments': IgcMessageAttachmentsComponent;
  }
}

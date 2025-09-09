import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import IgcIconComponent from '../icon/icon.js';
import type { ChatState } from './chat-state.js';
import { all } from './themes/attachments.js';
import { styles } from './themes/message-attachments.base.css.js';
import { styles as shared } from './themes/shared/message-attachments/message-attachments.common.css.js';
import type {
  ChatTemplateRenderer,
  IgcMessage,
  IgcMessageAttachment,
} from './types.js';
import {
  ChatFileTypeIcons,
  createAttachmentURL,
  getFileExtension,
} from './utils.js';

type DefaultAttachmentRenderers = {
  attachment: ChatTemplateRenderer<IgcMessageAttachment>;
  attachmentHeader: ChatTemplateRenderer<IgcMessageAttachment>;
  attachmentContent: ChatTemplateRenderer<IgcMessageAttachment>;
};

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

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcMessageAttachmentsComponent,
      IgcIconComponent,
      IgcIconButtonComponent,
      IgcExpansionPanelComponent
    );
  }

  private readonly _defaults: Readonly<DefaultAttachmentRenderers> =
    Object.freeze<DefaultAttachmentRenderers>({
      attachment: (ctx) => this._renderAttachment(ctx.param),
      attachmentHeader: (ctx) => this.renderHeader(ctx.param),
      attachmentContent: (ctx) => this._renderContent(ctx.param),
    });

  @consume({ context: chatContext, subscribe: true })
  private readonly _state!: ChatState;

  /**
   * The array of attachments to render.
   */
  @property({ attribute: false })
  public message?: IgcMessage;

  constructor() {
    super();
    addThemingController(this, all);
  }

  private _getRenderers(name: keyof DefaultAttachmentRenderers) {
    return this._state.options?.renderers
      ? (this._state.options.renderers[name] ?? this._defaults[name])
      : this._defaults[name];
  }

  private _handleHeaderClick = (attachment: IgcMessageAttachment) => {
    this._state.emitEvent('igcAttachmentClick', { detail: attachment });
  };
  /**
   * Default attachment header template used when no custom template is provided.
   * Renders the attachment icon and name.
   * @param attachment The message attachment to render
   * @returns TemplateResult containing the rendered attachment header
   */
  private renderHeader(attachment: IgcMessageAttachment) {
    const isCurrentUser = this._state.isCurrentUserMessage(this.message);
    const iconName =
      attachment.type === 'image' || attachment.file?.type.startsWith('image/')
        ? 'attach_image'
        : 'document_thumbnail';

    return html`
      ${!isCurrentUser
        ? html`<igc-icon name=${iconName} part="attachment-icon"></igc-icon>`
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
  private _renderContent(attachment: IgcMessageAttachment) {
    const ext = getFileExtension(attachment.name);
    const isImage = this._state.isImageAttachment(attachment);
    const iconName =
      ChatFileTypeIcons.get(ext) ?? ChatFileTypeIcons.get('default')!;

    return isImage
      ? html`
          <img
            part="image-attachment"
            src=${createAttachmentURL(attachment)}
            alt=${attachment.name}
          />
        `
      : html`<igc-icon part="file-attachment" name=${iconName}></igc-icon>`;
  }

  private _renderAttachment(attachment: IgcMessageAttachment) {
    const isCurrentUser = this._state.isCurrentUserMessage(this.message);
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

    const ctx = {
      param: attachment,
      defaults: this._defaults,
      options: this._state.options,
    };

    const content = html`<div part=${partMap(contentParts)}>
      ${until(this._getRenderers('attachmentContent')(ctx))}
    </div>`;
    const header = html` <div
      part=${partMap(headerParts)}
      role="button"
      @click=${() => this._handleHeaderClick(attachment)}
    >
      <div part="details">
        ${until(this._getRenderers('attachmentHeader')(ctx))}
      </div>
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
              this._getRenderers('attachment')({
                param: attachment,
                defaults: this._defaults,
                options: this._state.options,
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

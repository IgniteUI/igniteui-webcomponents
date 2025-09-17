import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { repeat } from 'lit/directives/repeat.js';
import { until } from 'lit/directives/until.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import IgcIconComponent from '../icon/icon.js';
import type { ChatState } from './chat-state.js';
import { all } from './themes/attachments.js';
import { styles } from './themes/message-attachments.base.css.js';
import { styles as shared } from './themes/shared/message-attachments/message-attachments.common.css.js';
import type {
  ChatAttachmentRenderContext,
  ChatTemplateRenderer,
  IgcChatMessage,
  IgcChatMessageAttachment,
} from './types.js';
import {
  ChatFileTypeIcons,
  createAttachmentURL,
  getFileExtension,
  isImageAttachment,
} from './utils.js';

type DefaultAttachmentRenderers = {
  attachment: ChatTemplateRenderer<ChatAttachmentRenderContext>;
  attachmentHeader: ChatTemplateRenderer<ChatAttachmentRenderContext>;
  attachmentContent: ChatTemplateRenderer<ChatAttachmentRenderContext>;
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
      IgcIconButtonComponent
    );
  }

  private readonly _defaults: Readonly<DefaultAttachmentRenderers> =
    Object.freeze<DefaultAttachmentRenderers>({
      attachment: (ctx) => this._renderAttachment(ctx.attachment),
      attachmentHeader: (ctx) => this.renderHeader(ctx.attachment),
      attachmentContent: (ctx) => this._renderContent(ctx.attachment),
    });

  @consume({ context: chatContext, subscribe: true })
  private readonly _state!: ChatState;

  /**
   * The array of attachments to render.
   */
  @property({ attribute: false })
  public message?: IgcChatMessage;

  constructor() {
    super();
    addThemingController(this, all);
  }

  private _getRenderer(name: keyof DefaultAttachmentRenderers) {
    return this._state.options?.renderers
      ? (this._state.options.renderers[name] ?? this._defaults[name])
      : this._defaults[name];
  }

  private _handleHeaderClick = (attachment: IgcChatMessageAttachment) => {
    this._state.emitEvent('igcAttachmentClick', { detail: attachment });
  };
  /**
   * Default attachment header template used when no custom template is provided.
   * Renders the attachment icon and name.
   * @param attachment The message attachment to render
   * @returns TemplateResult containing the rendered attachment header
   */
  private renderHeader(attachment: IgcChatMessageAttachment) {
    const isCurrentUser = this._state.isCurrentUserMessage(this.message);
    const iconName = isImageAttachment(attachment)
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
  private _renderContent(attachment: IgcChatMessageAttachment) {
    const iconName =
      ChatFileTypeIcons.get(getFileExtension(attachment.name)) ??
      ChatFileTypeIcons.get('default')!;

    return isImageAttachment(attachment)
      ? html`
          <img
            part="image-attachment"
            src=${createAttachmentURL(attachment)}
            alt=${attachment.name}
          />
        `
      : html`<igc-icon part="file-attachment" name=${iconName}></igc-icon>`;
  }

  private _renderAttachment(attachment: IgcChatMessageAttachment) {
    const isCurrentUser = this._state.isCurrentUserMessage(this.message);

    const contentParts = {
      'attachment-content': true,
      sent: isCurrentUser,
    };
    const headerParts = {
      'attachment-header': true,
      sent: isCurrentUser,
    };

    const ctx: ChatAttachmentRenderContext = {
      attachment,
      message: this.message!,
      instance: this._state.host,
    };

    const content = html`<div part=${partMap(contentParts)}>
      ${until(this._getRenderer('attachmentContent')(ctx))}
    </div>`;
    const header = html` <div
      part=${partMap(headerParts)}
      role="button"
      @click=${() => this._handleHeaderClick(attachment)}
    >
      <div part="details">
        ${until(this._getRenderer('attachmentHeader')(ctx))}
      </div>
    </div>`;

    return html`
      ${isCurrentUser ? content : nothing} ${header}
      ${!isCurrentUser ? content : nothing}
    `;
  }

  protected override render() {
    const attachments = this.message?.attachments ?? [];
    const isCurrentUser = this._state.isCurrentUserMessage(this.message);
    const attachmentParts = {
      attachment: true,
      sent: isCurrentUser,
    };
    return html`${cache(
      this.message
        ? html`
            <div part="attachments-container">
              ${repeat(
                attachments,
                (attachment) => attachment.id,
                (attachment) => html`
                  <div part="${partMap(attachmentParts)}">
                    ${until(
                      this._getRenderer('attachment')({
                        attachment,
                        message: this.message!,
                        instance: this._state.host,
                      })
                    )}
                  </div>
                `
              )}
            </div>
          `
        : nothing
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-message-attachments': IgcMessageAttachmentsComponent;
  }
}

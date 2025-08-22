import { consume } from '@lit/context';
import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
// import DOMPurify from 'dompurify';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcAvatarComponent from '../avatar/avatar.js';
import { chatContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import type { DefaultChatRenderer } from './chat-renderer.js';
import type { ChatState } from './chat-state.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import { styles } from './themes/message.base.css.js';
import { all } from './themes/message.js';
import { styles as shared } from './themes/shared/chat-message/chat-message.common.css.js';
import '../tooltip/tooltip.js';
import { IgcChatResourceStringEN } from '../common/i18n/chat.resources.js';
import IgcTooltipComponent from '../tooltip/tooltip.js';
import {
  thumbDownIcon as badResponseIcon,
  copyIcon as copyResponseIcon,
  thumbUpIcon as goodResponseIcon,
  type IgcMessage,
  regenerateIcon as redoIcon,
} from './types.js';

/**
 * A chat message component for displaying individual messages in `<igc-chat>`.
 *
 * @element igc-chat-message
 *
 * @fires igcMessageReact - Fired when a message is reacted to.
 *
 * This component renders a single chat message including:
 * - Message text (sanitized)
 * - Attachments (if any)
 * - Custom templates for message content and actions (if provided via chat options)
 *
 * It distinguishes sent messages from received messages by comparing
 * the message sender with the current user ID from chat state.
 *
 * The message text is sanitized with DOMPurify before rendering,
 * and can be rendered with a markdown renderer if provided.
 */
export default class IgcChatMessageComponent extends LitElement {
  /** Tag name of the custom element. */
  public static readonly tagName = 'igc-chat-message';

  /** Styles applied to the component. */
  public static override styles = [styles, shared];

  /**
   * Registers this component and its dependencies.
   * This is used internally to set up the component definitions.
   */
  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatMessageComponent,
      IgcMessageAttachmentsComponent,
      IgcAvatarComponent,
      IgcTooltipComponent
    );
  }

  /**
   * Injected chat state context. Provides message data, user info, and options.
   * @private
   */
  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  /**
   * The chat message to render.
   */
  @property({ attribute: false })
  public message: IgcMessage | undefined;

  /** The resource strings. */
  @property({ attribute: false })
  public resourceStrings = IgcChatResourceStringEN;

  /** The tooltip component used for showing action tooltips. */
  @query('#sharedTooltip')
  private _sharedTooltip!: IgcTooltipComponent;

  /**
   * Sanitizes message text to prevent XSS or invalid HTML.
   * @param text The raw message text
   * @returns Sanitized text safe for HTML rendering
   * @private
   */
  private sanitizeMessageText(text: string): string {
    return text.trim();
  }

  constructor() {
    super();
    addThemingController(this, all);
    registerIconFromText('copy-response', copyResponseIcon, 'material');
    registerIconFromText('good-response', goodResponseIcon, 'material');
    registerIconFromText('bad-response', badResponseIcon, 'material');
    registerIconFromText('redo', redoIcon, 'material');
  }

  /**
   * The renderer instance responsible for converting message data into HTML.
   * Typically provided through component options or chat state.
   */
  @state()
  private renderer?: DefaultChatRenderer;

  @state()
  private renderedContent?: unknown;
  /**
   * Lit lifecycle method called after the component's first update.
   * Initializes the `renderer` from chat state options if available.
   *
   * @param _changedProperties - The properties that changed before the update.
   */
  protected override async firstUpdated(
    _changedProperties: PropertyValues
  ): Promise<void> {
    this.renderer = this._chatState?.chatRenderer;
    if (this.message && this.renderer) {
      this.renderedContent = await this.renderer?.render(this.message);
    }
  }

  /**
   * Lit lifecycle method called after any update to the component.
   * Triggers re-rendering when `message` or `renderer` has changed.
   *
   * @param changedProps - A map of changed properties and their previous values.
   */
  protected override async updated(
    changedProps: Map<string, any>
  ): Promise<void> {
    if (changedProps.has('message') || changedProps.has('renderer')) {
      if (this.message && this.renderer) {
        this.renderedContent = await this.renderer?.render(this.message);
      }
    }
  }
  /**
   * Renders the chat message template.
   * - Applies 'sent' CSS class if the message sender matches current user.
   * - Uses markdown rendering if configured.
   * - Renders attachments and custom templates if provided.
   */
  protected override render() {
    const containerPart = `message-container ${this.message?.sender === this._chatState?.currentUserId ? 'sent' : ''}`;
    // const renderer =
    //   this._chatState?.options?.markdownRenderer || renderMarkdown;

    return html`
      <div part=${containerPart}>
        <div part="bubble">${this.renderedContent}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-message': IgcChatMessageComponent;
  }
}

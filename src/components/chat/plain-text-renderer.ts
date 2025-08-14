import { html, nothing } from 'lit';
import type {
  ChatMessageRenderer,
  IgcChatTemplates,
  IgcMessage,
} from './types.js';

/**
 * A simple renderer that outputs plain text messages without any formatting or parsing.
 * The message content is wrapped in a <pre> tag to preserve whitespace and formatting.
 *
 * @implements {ChatMessageRenderer}
 */
export class PlainTextRenderer implements ChatMessageRenderer {
  /**
   * Renders the given message as plain text.
   * @param {IgcMessage} message - The chat message to render.
   * @returns {TemplateResult} A lit-html template containing the plain text wrapped in a <pre> element.
   */
  render(message: IgcMessage): unknown {
    return html`<pre part="plain-text">${message.text}</pre>`;
  }
}

export class DefaultChatRenderer implements ChatMessageRenderer {
  private cache = new Map<string, { text: string; rendered: unknown }>();

  constructor(
    private baseTextRenderer: ChatMessageRenderer, // e.g. markdown/plaintext renderer
    private userTemplates?: Partial<IgcChatTemplates>
  ) {
    this.templates = this.mergeTemplates(
      this.defaultTemplates(),
      this.userTemplates
    );
  }

  public templates: Required<IgcChatTemplates>;

  private defaultTemplates(): Required<IgcChatTemplates> {
    return {
      attachmentTemplate: (m) =>
        html`<igc-message-attachments .message=${m}></igc-message-attachments>`,
      attachmentHeaderTemplate: () => nothing,
      attachmentActionsTemplate: () => nothing,
      attachmentContentTemplate: () => nothing,

      messageTemplate: (m, ctx) => html`
        ${ctx?.textContent}
        ${m.attachments?.length
          ? ctx?.templates.attachmentTemplate(m)
          : nothing}
        ${ctx?.templates.messageActionsTemplate(m)}
      `,

      messageActionsTemplate: () => nothing,
      typingIndicatorTemplate: () => nothing,
      textInputTemplate: (text) => html`<textarea .value=${text}></textarea>`,
      textAreaActionsTemplate: () => nothing,
      textAreaAttachmentsTemplate: () => nothing,
    };
  }

  private mergeTemplates(
    defaults: Required<IgcChatTemplates>,
    user?: Partial<IgcChatTemplates>
  ): Required<IgcChatTemplates> {
    return { ...defaults, ...(user ?? {}) };
  }

  /** Cached renderer for message text */
  protected async renderText(message: IgcMessage) {
    if (!message.id) return await this.baseTextRenderer.render(message);
    if (this.cache.has(message.id)) {
      const cached = this.cache.get(message.id);
      if (cached && cached.text === message.text) {
        return cached.rendered;
      }
      this.cache.delete(message.id);
    }
    if (!message.text) {
      return html``;
    }
    const rendered = await this.baseTextRenderer.render(message);
    this.cache.set(message.id, { text: message.text, rendered });
    return rendered;
  }

  /** Main render entry point */
  public async render(
    message: IgcMessage,
    ctx?: { templates?: Required<IgcChatTemplates> }
  ) {
    const templates = ctx?.templates ?? this.templates;
    const textContent = await this.renderText(message);
    return templates.messageTemplate(message, {
      textContent,
      templates,
    });
  }
}

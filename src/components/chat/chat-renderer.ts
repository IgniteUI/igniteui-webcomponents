import { html, nothing } from 'lit';
import type {
  ChatMessageRenderer,
  IgcChatTemplates,
  IgcMessage,
} from './types.js';

export class ChatRenderer implements ChatMessageRenderer {
  private cache = new Map<string, { text: string; rendered: unknown }>();
  public templates: Required<IgcChatTemplates>;

  constructor(
    private baseTextRenderer: ChatMessageRenderer, // e.g. PlainTextRenderer, MarkdownMessageRenderer
    userTemplates?: Partial<IgcChatTemplates>
  ) {
    this.templates = {
      ...this.defaultTemplates(),
      ...(userTemplates ?? {}),
    };
  }

  /** ---- Default message-related templates ---- */
  private defaultTemplates(): Required<IgcChatTemplates> {
    return {
      attachmentTemplate: (m) =>
        html`<igc-message-attachments .message=${m}></igc-message-attachments>`,
      attachmentHeaderTemplate: () => nothing,
      attachmentActionsTemplate: () => nothing,
      attachmentContentTemplate: () => nothing,

      messageTemplate: (m, ctx) => html`
        ${ctx?.textContent ?? m.text}
        ${m.attachments?.length
          ? ctx?.templates.attachmentTemplate(m)
          : nothing}
        ${ctx?.templates.messageActionsTemplate(m)}
      `,

      messageActionsTemplate: () => nothing,
      typingIndicatorTemplate: () => html`<div>Someone is typing...</div>`,
      textInputTemplate: (text) => html`<textarea .value=${text}></textarea>`,
      textAreaActionsTemplate: () => nothing,
      textAreaAttachmentsTemplate: () => nothing,
    };
  }

  /** Cache-aware message text rendering */
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
  ): Promise<unknown> {
    const templates = ctx?.templates ?? this.templates;
    const textContent = await this.renderText(message);

    return templates.messageTemplate(message, {
      textContent,
      templates,
    });
  }

  public clearCache() {
    this.cache.clear();
  }
}

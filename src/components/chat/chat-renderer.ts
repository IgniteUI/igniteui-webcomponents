import type {
  ChatMessageRenderer,
  IgcChatTemplates,
  IgcMessage,
} from './types.js';

export class DefaultChatRenderer implements ChatMessageRenderer {
  private cache = new Map<string, { text: string; rendered: unknown }>();
  public templates: Required<IgcChatTemplates>;

  constructor(
    private baseTextRenderer: ChatMessageRenderer, // e.g. PlainTextRenderer, MarkdownMessageRenderer
    private defaultTemplates: Required<IgcChatTemplates>,
    userTemplates?: Partial<IgcChatTemplates>
  ) {
    this.templates = {
      ...this.defaultTemplates,
      ...(userTemplates ?? {}),
    };
  }

  public async renderText(message: IgcMessage) {
    const rendered = await this.baseTextRenderer.render(message);
    return rendered;
  }

  public async render(
    message: IgcMessage,
    ctx?: { templates?: Partial<IgcChatTemplates> }
  ): Promise<unknown> {
    const templates = { ...this.templates, ...ctx?.templates };
    if (!message.id) {
      // No caching for messages without an ID
      const textContent = await this.baseTextRenderer.render(message);
      return templates.messageTemplate(message, { textContent, templates });
    }

    if (this.cache.has(message.id)) {
      const cached = this.cache.get(message.id);
      if (cached && cached.text === message.text) {
        return cached.rendered;
      }
    }

    // Cache miss or message text changed
    const textContent = await this.baseTextRenderer.render(message);
    const rendered = templates.messageTemplate(message, {
      textContent,
      templates,
    });
    this.cache.set(message.id, { text: message.text, rendered });

    return rendered;
  }

  public clearCache() {
    this.cache.clear();
  }
}

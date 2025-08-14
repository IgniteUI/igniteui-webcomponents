import { html } from 'lit';
import type { ChatMessageRenderer, IgcMessage } from './types.js';

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

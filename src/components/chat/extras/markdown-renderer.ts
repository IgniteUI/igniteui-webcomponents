import DOMPurify from 'dompurify';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Marked } from 'marked';
import markedShiki from 'marked-shiki';
import { getSingletonHighlighter } from 'shiki';
import type { IgcMessage } from '../types.js';

/**
 * Options to configure the MarkdownMessageRenderer.
 */
export interface MarkdownRendererOptions {
  /**
   * If true, disables syntax highlighting entirely.
   */
  noHighlighter?: boolean;

  /**
   * List of programming languages to support in syntax highlighting.
   */
  languages?: string[];

  /**
   * The theme used by the syntax highlighter (e.g., 'github-light').
   */
  theme?: string;

  /**
   * A custom HTML sanitization function. Defaults to DOMPurify.sanitize.
   */
  sanitizer?: (html: string) => string;
}

export async function createMarkdownRenderer(
  options?: MarkdownRendererOptions
) {
  const sanitizer = options?.sanitizer ?? DOMPurify.sanitize;

  const markedInstance = new Marked({
    breaks: true,
    gfm: true,
    extensions: [
      {
        name: 'link',
        renderer({ href, title, text }) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
        },
      },
    ],
  });

  if (!options?.noHighlighter) {
    const themes = [options?.theme ?? 'github-light'];
    const langs = options?.languages
      ? options.languages
      : ['javascript', 'typescript', 'html', 'css'];

    const shikiInstance = await getSingletonHighlighter({
      themes,
      langs,
    });

    markedInstance.use(
      markedShiki({
        highlight(code, lang, _) {
          return shikiInstance.codeToHtml(code, {
            lang,
            themes: { light: themes[0] },
          });
        },
      })
    );
  }

  return async (message: IgcMessage): Promise<unknown> => {
    return message.text
      ? unsafeHTML(sanitizer(await markedInstance.parse(message.text)))
      : '';
  };
}

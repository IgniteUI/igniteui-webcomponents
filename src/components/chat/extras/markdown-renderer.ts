import DOMPurify from 'dompurify';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Marked } from 'marked';
import markedShiki from 'marked-shiki';
import { bundledThemes, createHighlighter } from 'shiki/bundle/web';
import type { IgcChatMessage } from '../types.js';

const DEFAULT_LANGUAGES = ['javascript', 'typescript', 'html', 'css'];
const DEFAULT_THEME = {
  light: 'github-light',
  dark: 'github-dark',
};

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
  theme?: {
    light?: string;
    dark?: string;
  };

  /**
   * A custom HTML sanitization function. Defaults to DOMPurify.sanitize.
   */
  sanitizer?: (html: string) => string;
}

export async function createMarkdownRenderer(
  options?: MarkdownRendererOptions
) {
  const sanitizer = options?.sanitizer ?? DOMPurify.sanitize;

  const markdown = new Marked({
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
    const themes = options?.theme ?? DEFAULT_THEME;
    const langs = options?.languages ?? DEFAULT_LANGUAGES;

    const highlighter = await createHighlighter({
      langs,
      themes: Object.keys(bundledThemes),
    });

    markdown.use(
      markedShiki({
        highlight(code, lang, _) {
          try {
            return highlighter.codeToHtml(code, { lang, themes });
          } catch {
            return `<pre><code>${sanitizer(code)}</code></pre>`;
          }
        },
      })
    );
  }

  return async (message: IgcChatMessage): Promise<unknown> => {
    return message.text
      ? unsafeHTML(sanitizer(await markdown.parse(message.text)))
      : '';
  };
}

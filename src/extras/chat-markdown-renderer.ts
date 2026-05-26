import DOMPurify from 'dompurify';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Marked } from 'marked';
import markedShiki from 'marked-shiki';
import { bundledThemes, createHighlighter } from 'shiki/bundle/web';
import type { IgcChatMessage } from '../components/chat/types.js';

const DEFAULT_LANGUAGES = ['javascript', 'typescript', 'html', 'css'];
const DEFAULT_THEME = {
  light: 'github-light',
  dark: 'github-dark',
};

/**
 * Configuration options for setting up the markdown parser and highlighter.
 * This provides more granular control over the markdown processing pipeline.
 */
export interface MarkdownRendererOptions {
  /**
   * If true, disables syntax highlighting entirely.
   */
  noHighlighter?: boolean;

  /**
   * List of programming languages to support in syntax highlighting.
   * @default ['javascript', 'typescript', 'html', 'css']
   */
  languages?: string[];

  /**
   * The theme(s) used by the syntax highlighter.
   * Can be a single theme name or separate themes for light and dark modes.
   * @default { light: 'github-light', dark: 'github-dark' }
   */
  theme?: string | { light?: string; dark?: string };

  /**
   * A custom HTML sanitization function.
   * @default DOMPurify.sanitize
   */
  sanitizer?: (html: string) => string;

  /**
   * Custom color replacements for syntax highlighting.
   * Maps hex colors to CSS variable names.
   */
  colorReplacements?: Record<string, string>;
}

/**
 * Represents a markdown renderer instance that can process markdown text.
 */
export interface MarkdownRenderer {
  /**
   * Parses markdown text and returns rendered HTML.
   * @param text - The markdown text to parse
   * @returns The sanitized HTML string
   */
  parse(text: string): Promise<string>;

  /**
   * The underlying marked instance for advanced usage.
   */
  readonly marked: Marked;
}

/**
 * Sets up a markdown renderer with syntax highlighting and sanitization.
 * This is the core setup function that can be used in any framework.
 *
 * @param options - Configuration options for the markdown renderer
 * @returns A MarkdownRenderer instance
 *
 * @example
 * ```typescript
 * // Basic usage
 * const renderer = await setupMarkdownRenderer();
 * const html = await renderer.parse('# Hello **World**');
 *
 * // With custom options
 * const renderer = await setupMarkdownRenderer({
 *   languages: ['javascript', 'python', 'rust'],
 *   theme: 'monokai',
 *   noHighlighter: false
 * });
 *
 * // With custom sanitizer
 * const renderer = await setupMarkdownRenderer({
 *   sanitizer: (html) => myCustomSanitizer(html)
 * });
 * ```
 */
export async function setupMarkdownRenderer(
  options?: MarkdownRendererOptions
): Promise<MarkdownRenderer> {
  const sanitizer = options?.sanitizer ?? DOMPurify.sanitize;

  // Normalize theme option
  const theme =
    typeof options?.theme === 'string'
      ? { light: options.theme, dark: options.theme }
      : (options?.theme ?? DEFAULT_THEME);

  // Create marked instance with default configuration
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

  // Setup syntax highlighting if not disabled
  if (!options?.noHighlighter) {
    const langs = options?.languages ?? DEFAULT_LANGUAGES;
    const colorReplacements = options?.colorReplacements ?? {
      '#6f42c1': 'var(--shiki-purple)',
      '#032f62': 'var(--shiki-dark-blue)',
      '#24292e': 'var(--shiki-navy)',
      '#d73a49': 'var(--shiki-red)',
      '#005cc5': 'var(--shiki-blue)',
      '#22863a': 'var(--shiki-green)',
      '#e36209': 'var(--shiki-orange)',
    };

    const highlighter = await createHighlighter({
      langs,
      themes: Object.keys(bundledThemes),
    });

    markdown.use(
      markedShiki({
        highlight(code, lang, _) {
          try {
            return highlighter.codeToHtml(code, {
              lang,
              themes: theme,
              colorReplacements: {
                'github-light': {
                  ...colorReplacements,
                  '#fff': 'var(--shiki-bg)',
                  '#24292e': 'var(--shiki-fg)',
                },
                'github-dark': {
                  ...colorReplacements,
                  '#24292e': 'var(--shiki-bg)',
                  '#e1e4e8': 'var(--shiki-fg)',
                },
              },
              defaultColor: 'light-dark()',
            });
          } catch {
            return `<pre><code>${sanitizer(code)}</code></pre>`;
          }
        },
      })
    );
  }

  return {
    async parse(text: string): Promise<string> {
      const result = await markdown.parse(text);
      return sanitizer(String(result));
    },
    get marked(): Marked<string, string> {
      return markdown;
    },
  };
}

/**
 * Creates a markdown renderer specifically for igc-chat messages.
 * This function wraps the renderer to work with IgcChatMessage objects
 * and returns Lit's unsafeHTML directive for rendering.
 *
 * @param options - Configuration options for the markdown renderer
 * @returns A function that takes an IgcChatMessage and returns a Lit template result
 *
 * @example
 * ```typescript
 * const renderer = await createMarkdownRenderer();
 * const message = { text: '# Hello **World**' };
 * const template = await renderer(message);
 * ```
 */
export async function createMarkdownRenderer(
  options?: MarkdownRendererOptions
) {
  const renderer = await setupMarkdownRenderer(options);

  return async (message: IgcChatMessage): Promise<unknown> => {
    return message.text ? unsafeHTML(await renderer.parse(message.text)) : '';
  };
}

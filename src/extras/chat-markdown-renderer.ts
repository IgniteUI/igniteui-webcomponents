import DOMPurify from 'dompurify';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Marked, Renderer, type Tokens } from 'marked';
import type { Highlighter } from 'shiki/bundle/web';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import type { IgcChatMessage } from '../components/chat/types.js';

const DEFAULT_LANGUAGES = ['javascript', 'typescript', 'html', 'css'];
const DEFAULT_THEME = {
  light: 'github-light',
  dark: 'github-dark',
};
const GITHUB_COLOR_REPLACEMENTS = {
  '#6f42c1': 'var(--shiki-purple)',
  '#032f62': 'var(--shiki-dark-blue)',
  '#d73a49': 'var(--shiki-red)',
  '#005cc5': 'var(--shiki-blue)',
  '#22863a': 'var(--shiki-green)',
  '#e36209': 'var(--shiki-orange)',
};

// Holds the finished code blocks of a message while each streamed chunk parses it again.
const HIGHLIGHT_CACHE_SIZE = 32;

// A code block that still streams highlights again for each chunk, at about 12 ms per KB.
// Above this size, it shows as plain code until its closing fence arrives.
const OPEN_BLOCK_HIGHLIGHT_LIMIT = 2048;

// Nothing disposes the highlighter of a dropped renderer, so equal configurations share one.
const highlighters = new Map<string, Promise<Highlighter>>();

// Stands in for 'none' next to another theme: shiki writes `inherit` for the missing
// colors of 'none', which `light-dark()` rejects.
const plainTheme = {
  name: 'plain',
  type: 'light' as const,
  fg: 'currentColor',
  bg: 'transparent',
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
   * By default, DOMPurify sanitizes the HTML, and each link opens in a new tab.
   */
  sanitizer?: (html: string) => string;

  /**
   * Custom color replacements for syntax highlighting.
   * Maps hex colors to CSS variable names. The map applies to every theme, and replaces
   * the default replacements of the GitHub themes.
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

// Only link elements: the named controls of a form can replace its methods.
function openLinksInNewTab(node: Element): void {
  const isLink =
    node instanceof HTMLAnchorElement ||
    node instanceof HTMLAreaElement ||
    node instanceof SVGAElement;

  // Constant values, so the HTML cannot choose the window.
  if (
    isLink &&
    (node.hasAttribute('href') || node.hasAttribute('xlink:href'))
  ) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
}

// Hooked for this call only: the app's DOMPurify config applies, other callers are unaffected.
function sanitizeHtml(html: string): string {
  DOMPurify.addHook('afterSanitizeAttributes', openLinksInNewTab);
  try {
    return DOMPurify.sanitize(html);
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes', openLinksInNewTab);
  }
}

// Marked ends a fenced code block without a closing fence at the end of the text,
// which in a streaming message means that the block still grows.
function isOpen({ raw }: Tokens.Code): boolean {
  const lines = raw.trimEnd().split('\n');
  const fence = /^ {0,3}(`{3,}|~{3,})/.exec(lines[0])?.[1];
  const last = lines.length > 1 ? lines.at(-1)!.trim() : '';
  return (
    fence !== undefined && !(last.startsWith(fence) && /^(`+|~+)$/.test(last))
  );
}

async function addHighlighter(
  markdown: Marked,
  options?: MarkdownRendererOptions
): Promise<void> {
  const theme =
    typeof options?.theme === 'string'
      ? { light: options.theme, dark: options.theme }
      : {
          light: options?.theme?.light ?? DEFAULT_THEME.light,
          dark: options?.theme?.dark ?? DEFAULT_THEME.dark,
        };

  // A dynamic import keeps shiki out of bundles that do not highlight.
  const { bundledThemes, createHighlighter, isSpecialTheme } =
    await import('shiki/bundle/web');

  const resolve = (name: string): string | undefined => {
    if (isSpecialTheme(name)) {
      return theme.light === theme.dark ? name : plainTheme.name;
    }
    return Object.hasOwn(bundledThemes, name) ? name : undefined;
  };
  const light = resolve(theme.light);
  const dark = resolve(theme.dark);

  if (!light || !dark) {
    return;
  }

  const langs = options?.languages ?? DEFAULT_LANGUAGES;
  const configuration = JSON.stringify([[...langs].sort(), light, dark]);
  const shiki = await getOrInsertComputed(highlighters, configuration, () => {
    const created = createHighlighter({
      langs,
      themes: [light, dark].map((name) =>
        name === plainTheme.name ? plainTheme : name
      ),
    });
    created.catch(() => highlighters.delete(configuration));
    return created;
  });

  // Shiki applies a flat entry to every theme, and then the entries of the theme's own key.
  const githubColors = options?.colorReplacements
    ? {}
    : GITHUB_COLOR_REPLACEMENTS;
  const shikiOptions = {
    // `themes` tokenizes the code once for each theme, so one theme goes as `theme`.
    ...(light === dark
      ? { theme: light }
      : { themes: { light, dark }, defaultColor: 'light-dark()' as const }),
    colorReplacements: {
      ...options?.colorReplacements,
      'github-light': {
        ...githubColors,
        '#fff': 'var(--shiki-bg)',
        '#24292e': 'var(--shiki-fg)',
      },
      'github-dark': {
        ...githubColors,
        '#24292e': 'var(--shiki-bg)',
        '#e1e4e8': 'var(--shiki-fg)',
      },
    },
  };

  // `undefined` leaves the token to marked, which renders it as escaped plain code.
  const highlight = (code: string, lang: string): string | undefined => {
    try {
      return shiki.codeToHtml(code, { lang, ...shikiOptions });
    } catch {
      return undefined;
    }
  };

  const cache = new Map<string, string>();
  const highlightFinished = (
    code: string,
    lang: string
  ): string | undefined => {
    // `lang` has no spaces, so the first space ends it.
    const key = `${lang} ${code}`;
    const html = cache.get(key) ?? highlight(code, lang);
    if (html !== undefined) {
      cache.delete(key);
      cache.set(key, html);
      if (cache.size > HIGHLIGHT_CACHE_SIZE) {
        cache.delete(cache.keys().next().value!);
      }
    }
    return html;
  };

  markdown.use({
    walkTokens(token) {
      if (token.type !== 'code') {
        return;
      }

      const code = token as Tokens.Code;
      const lang = code.lang?.split(' ')[0] || 'text';
      const html = !isOpen(code)
        ? highlightFinished(code.text, lang)
        : code.text.length <= OPEN_BLOCK_HIGHLIGHT_LIMIT
          ? highlight(code.text, lang)
          : undefined;

      if (html !== undefined) {
        Object.assign(token, { type: 'html', block: true, text: `${html}\n` });
      }
    },
  });
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
  const sanitizer = options?.sanitizer ?? sanitizeHtml;

  const markdown = new Marked({
    breaks: true,
    gfm: true,
    renderer: {
      // The attributes also apply when a custom sanitizer replaces the default one.
      link(token) {
        return Renderer.prototype.link
          .call(this, token)
          .replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
      },
    },
  });

  if (!options?.noHighlighter) {
    await addHighlighter(markdown, options);
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
 * Creates a markdown renderer specifically for chat messages.
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
  // The chat renders its messages again on many updates; only a changed text needs parsing.
  const results = new WeakMap<
    IgcChatMessage,
    { text: string; result: Promise<unknown> }
  >();

  return (message: IgcChatMessage): Promise<unknown> => {
    const entry = results.get(message);
    if (entry?.text === message.text) {
      return entry.result;
    }

    const result = message.text
      ? renderer.parse(message.text).then(unsafeHTML)
      : Promise.resolve('');
    results.set(message, { text: message.text, result });
    return result;
  };
}

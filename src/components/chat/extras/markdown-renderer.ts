import DOMPurify from 'dompurify';
import { html, type TemplateResult } from 'lit';
import { Marked, Renderer } from 'marked';
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

/**
 * A renderer that converts markdown chat messages to HTML using `marked`,
 * with optional syntax highlighting powered by `shiki`.
 *
 */
export class MarkdownMessageRenderer {
  private highlighter?: any;
  private theme: string;
  private langs: string[];
  private _marked: Marked;
  private initialized = false;
  private _sanitizer: (html: string) => string;

  /**
   * Creates a new MarkdownMessageRenderer.
   *
   * @param {MarkdownRendererOptions} [opts={}] - Configuration options.
   */
  constructor(private opts: MarkdownRendererOptions = {}) {
    this.theme = opts.theme ?? 'github-light';
    this.langs = opts.languages ?? ['javascript', 'typescript', 'html', 'css'];

    this._marked = new Marked();
    this.initMarked();
    this._sanitizer = this.initSanitizer();
  }

  /**
   * Initializes the `marked` instance with custom renderer options.
   * Currently modifies link rendering to open in a new tab with safe attributes.
   *
   * @private
   */
  private initMarked() {
    const renderer = new Renderer();

    // Customize link rendering
    renderer.link = (href, title, text) => {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
    };

    this._marked.setOptions({
      gfm: true,
      breaks: true,
      renderer,
    });
  }

  private initSanitizer() {
    return this.opts?.sanitizer ?? DOMPurify.sanitize;
  }

  /**
   * Performs async initialization for syntax highlighting.
   * Loads Shiki and configures the `marked` instance with `marked-shiki`.
   * This is called lazily during rendering unless pre-called explicitly.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves once initialization is complete.
   */
  async init(): Promise<void> {
    if (this.highlighter || this.opts.noHighlighter) {
      this.initialized = true;
      return;
    }

    this.highlighter = await getSingletonHighlighter({
      themes: [this.theme],
      langs: this.langs,
    });

    this._marked.use(
      markedShiki({
        highlight: (code: any, lang: string) => {
          try {
            const safeLang =
              lang && this.highlighter.getLoadedLanguages?.().includes(lang)
                ? lang
                : 'text';

            return (
              this.highlighter?.codeToHtml(code, {
                lang: safeLang,
                themes: { light: this.theme },
              }) ?? code
            );
          } catch (_err) {
            // if Shiki still throws for some reason, just return escaped code
            return `<pre><code>${DOMPurify.sanitize(code)}</code></pre>`;
          }
        },
      })
    );

    this.initialized = true;
  }

  /**
   * Renders the given chat message as markdown, with optional syntax highlighting.
   *
   * @param {IgcMessage} message - The message to render.
   * @returns {Promise<TemplateResult>} A lit template containing the rendered markdown content.
   */
  async render(message: IgcMessage): Promise<TemplateResult> {
    if (!this.initialized) {
      await this.init();
    }

    if (!message.text) return html``;

    const rendered = await this._marked?.parse(message.text);
    const cleanHtml = this._sanitizer(rendered);
    const template = document.createElement('template');
    template.innerHTML = cleanHtml ?? message.text;

    return html`${template.content}`;
  }
}

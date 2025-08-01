import { html, type TemplateResult } from 'lit';
import { Marked, Renderer } from 'marked';
import type { ChatMessageRenderer, IgcMessage } from './types.js';

/**
 * Options to configure the MarkdownMessageRenderer.
 */
export interface MarkdownRendererOptions {
  /**
   * If true, disables syntax highlighting entirely.
   */
  noHighlighter?: boolean;

  /**
   * A custom syntax highlighter compatible with Shiki's `codeToHtml()` API.
   */
  highlighter?: any;

  /**
   * List of programming languages to support in syntax highlighting.
   */
  languages?: string[];

  /**
   * The theme used by the syntax highlighter (e.g., 'github-light').
   */
  theme?: string;
}

/**
 * A renderer that converts markdown chat messages to HTML using `marked`,
 * with optional syntax highlighting powered by `shiki` or a custom highlighter.
 *
 * @implements {ChatMessageRenderer}
 */
export class MarkdownMessageRenderer implements ChatMessageRenderer {
  private highlighter?: any;
  private theme: string;
  private langs: string[];
  private _marked: Marked;
  private initialized = false;

  /**
   * Creates a new MarkdownMessageRenderer.
   *
   * @param {MarkdownRendererOptions} [opts={}] - Configuration options.
   */
  constructor(private opts: MarkdownRendererOptions = {}) {
    this.theme = opts.theme ?? 'github-light';
    this.langs = opts.languages ?? ['javascript', 'typescript', 'html', 'css'];
    this.highlighter = opts.highlighter;

    this._marked = new Marked();
    this.initMarked();
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

    const shiki = await import('shiki');
    this.highlighter = await shiki.getSingletonHighlighter({
      themes: [this.theme],
      langs: this.langs,
    });

    const markedShiki = await import('marked-shiki');
    this._marked.use(
      markedShiki.default({
        highlight: (code, lang) =>
          this.highlighter?.codeToHtml(code, {
            lang,
            themes: { light: this.theme },
          }) ?? code,
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
    const template = document.createElement('template');
    template.innerHTML = rendered ?? message.text;

    return html`${template.content}`;
  }
}

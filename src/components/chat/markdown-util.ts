import { html, type TemplateResult } from 'lit';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { CodeHighlighter, createMarkdownHighlighter } from './highlighter.js';
import type { ICodeHighlighter } from './types.js';

const renderer = new marked.Renderer();

// Customize link rendering
renderer.link = (href, title, text) => {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
};

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

const languageModules: Record<string, () => Promise<any>> = {
  javascript: () => import('@shikijs/langs/javascript'),
  typescript: () => import('@shikijs/langs/typescript'),
  json: () => import('@shikijs/langs/json'),
  markdown: () => import('@shikijs/langs/markdown'),
  // etc.
};

function loadLanguage(name: string): Promise<any> {
  const loader = languageModules[name];
  if (!loader) {
    return Promise.resolve(undefined); // fallback to text
  }
  return loader();
}

const themeModules: Record<string, () => Promise<any>> = {
  'github-light': () => import('@shikijs/themes/github-light'),
  'github-dark': () => import('@shikijs/themes/github-dark'),
  'min-light': () => import('@shikijs/themes/min-light'),
  'min-dark': () => import('@shikijs/themes/min-dark'),
  // etc.
};

function loadTheme(name: string): Promise<any> {
  const loader = themeModules[name];
  if (!loader) {
    return Promise.resolve(undefined);
  }
  return loader();
}

// This will be our local marked instance — one per configuration
// let localMarked: Marked | null = null;

export async function configureMarkdownHighlighter(
  highlighterConfig?: ICodeHighlighter
) {
  if (highlighterConfig) {
    const languageImports = highlighterConfig.languages.map(loadLanguage);
    const themeImports = highlighterConfig.themes.map(loadTheme);

    const [langs, themes] = await Promise.all([
      Promise.all(languageImports),
      Promise.all(themeImports),
    ]);

    const highlighter = new CodeHighlighter(langs, themes);

    marked.use(
      markedHighlight({
        async: true,
        highlight: createMarkdownHighlighter(highlighter),
      })
    );
  }
}

export async function renderMarkdown(text: string): Promise<TemplateResult> {
  if (!text) return html``;
  const rendered = await marked.parse(text);
  const template = document.createElement('template');
  template.innerHTML = rendered;

  return html`${template.content}`;
}

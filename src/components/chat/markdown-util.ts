import hljs from 'highlight.js/lib/core';
import { html, type TemplateResult } from 'lit';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';

const renderer = new marked.Renderer();

// Customize link rendering
renderer.link = (href, title, text) => {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
};

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      try {
        return hljs.highlight(code, { language }).value;
      } catch (_e) {
        return code;
      }
    },
  })
);

export function renderMarkdown(text: string): TemplateResult {
  if (!text) return html``;

  const rendered = marked.parse(text).toString();
  const template = document.createElement('template');
  template.innerHTML = rendered;

  return html`${template.content}`;
}

export function registerHlLanguages(languages: HlLanguages) {
  const registeredLanguages: Set<string> = new Set();
  for (const [name, languageModule] of Object.entries(languages)) {
    // Only register if not already registered by this component instance
    // or if hljs.getLanguage doesn't return anything (meaning it's not globally registered yet)
    if (!registeredLanguages.has(name) && !hljs.getLanguage(name)) {
      try {
        hljs.registerLanguage(name, languageModule);
        registeredLanguages.add(name);
      } catch (_e) {}
    } else if (hljs.getLanguage(name) && !registeredLanguages.has(name)) {
      // If already registered globally but not by this component, track it
      registeredLanguages.add(name);
    }
  }
  return registerHlLanguages;
}

export type HlLanguages = { [key: string]: any };

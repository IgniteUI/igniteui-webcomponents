import hljs from 'highlight.js/lib/core';
import { html, type TemplateResult } from 'lit';
import { Marked, Renderer } from 'marked';
import { markedHighlight } from 'marked-highlight';
import type { HlLanguages } from './types.js';

const localMarkedInstance = new Marked();
const renderer = new Renderer();
renderer.link = (href, title, text) => {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
};

localMarkedInstance.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Enable GFM line breaks
  renderer,
});

export function renderMarkdown(text: string): string | TemplateResult {
  if (!text) return html``;

  const rendered = localMarkedInstance.parse(text).toString();
  const template = document.createElement('template');
  template.innerHTML = rendered;

  return html`${template.content}`;
}

export function configureDefaultHighlighter() {
  localMarkedInstance.use(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang);
        if (!language) {
          return code; // If no language is found, return the code as is
        }

        return hljs.highlight(code, { language: lang }).value;
      },
    })
  );
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

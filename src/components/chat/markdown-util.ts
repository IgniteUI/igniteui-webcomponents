import { type TemplateResult, html } from 'lit';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: true,
  smartLists: true,
  smartypants: true,
});

const renderer = new marked.Renderer();

// Customize code rendering
renderer.code = (code, language) => {
  return `<pre><code class="language-${language}">${code}</code></pre>`;
};

// Customize link rendering
renderer.link = (href, title, text) => {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
};

export function renderMarkdown(text: string): TemplateResult {
  if (!text) return html``;

  const rendered = marked(text, { renderer });
  const template = document.createElement('template');
  template.innerHTML = rendered;

  return html`${template.content}`;
}

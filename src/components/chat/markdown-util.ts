// Highlight.js imports
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import cssLanguage from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript'; // Example: Add TypeScript
import htmlLanguage from 'highlight.js/lib/languages/xml'; // HTML is often under 'xml' in hljs
import { html, type TemplateResult } from 'lit';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';

// Register the languages with highlight.js
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript); // Common alias
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript); // Common alias
hljs.registerLanguage('css', cssLanguage);
hljs.registerLanguage('html', htmlLanguage);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash); // Common alias
hljs.registerLanguage('diff', diff);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python); // Common alias

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

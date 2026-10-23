import { expect, fixture, html } from '@open-wc/testing';
import DOMPurify from 'dompurify';
import { spy, stub } from 'sinon';
import type { IgcChatMessage } from '../components/chat/types.js';
import {
  createMarkdownRenderer,
  type MarkdownRenderer,
  type MarkdownRendererOptions,
  setupMarkdownRenderer,
} from './chat-markdown-renderer.js';

// Read before any test runs: a static import of shiki would already show here.
const shikiLoadedOnImport = performance
  .getEntriesByType('resource')
  .some(({ name }) => name.includes('/node_modules/shiki/'));

async function parse(
  renderer: MarkdownRenderer,
  markdown: string
): Promise<DocumentFragment> {
  const template = document.createElement('template');
  template.innerHTML = await renderer.parse(markdown);
  return template.content;
}

const code = 'const tag = "<b>bold</b>";';
const codeBlock = ['```typescript', code, '```'].join('\n');

async function highlightedPre(
  options?: MarkdownRendererOptions
): Promise<HTMLPreElement> {
  const renderer = await setupMarkdownRenderer(options);
  return (await parse(renderer, codeBlock)).querySelector('pre')!;
}

function expectPlainCode(result: DocumentFragment): void {
  expect(result.querySelector('.shiki, b')).to.be.null;
  expect(
    result.querySelector('pre > code.language-typescript')?.textContent
  ).to.equal(`${code}\n`);
}

describe('Chat Markdown renderer', () => {
  it('does not load shiki with the module', () => {
    expect(shikiLoadedOnImport).to.be.false;
  });

  describe('without the highlighter', () => {
    let renderer: MarkdownRenderer;

    before(async () => {
      renderer = await setupMarkdownRenderer({ noHighlighter: true });
    });

    it('renders Markdown with line breaks', async () => {
      const result = await parse(renderer, '# Hello **World**\nfirst\nsecond');

      expect(result.querySelector('h1')?.innerHTML).to.equal(
        'Hello <strong>World</strong>'
      );
      expect(result.querySelector('p br')).to.exist;
    });

    it('opens links to another origin in a new tab without access to the opener', async () => {
      const links = (
        await parse(
          renderer,
          [
            '[**Docs**](https://example.com/?a=1&b=2 "Read the \\"docs\\"")',
            '<a href="https://example.com">HTML</a>',
            '<a href="https://example.com" target="docs" rel="opener">Named</a>',
            '<svg><a xlink:href="https://example.com"><text>SVG</text></a></svg>',
          ].join(' ')
        )
      ).querySelectorAll('a');

      expect(links).to.have.length(4);
      expect(links[0].getAttribute('href')).to.equal(
        'https://example.com/?a=1&b=2'
      );
      expect(links[0].title).to.equal('Read the "docs"');
      expect(links[0].innerHTML).to.equal('<strong>Docs</strong>');
      for (const link of links) {
        expect(link.getAttribute('target')).to.equal('_blank');
        expect(link.getAttribute('rel')).to.equal('noopener noreferrer');
      }
    });

    it('opens other links in the same tab', async () => {
      const links = (
        await parse(
          renderer,
          [
            '[Register](/register)',
            `[Schedule](${location.origin}/schedule)`,
            '[Top](#top)',
            '[Mail](mailto:info@example.com)',
            '<a href="/register">HTML</a>',
            '<a href="http://[invalid">Invalid</a>',
            '<svg><a xlink:href="/register"><text>SVG</text></a></svg>',
          ].join(' ')
        )
      ).querySelectorAll('a');

      expect(links).to.have.length(7);
      for (const link of links) {
        expect(link.hasAttribute('target')).to.be.false;
        expect(link.hasAttribute('rel')).to.be.false;
      }
    });

    it('removes the target of a link in the same origin', async () => {
      DOMPurify.setConfig({ ADD_ATTR: ['target'] });
      try {
        const result = await parse(
          renderer,
          '<a href="/register" target="_top">Register</a>'
        );
        expect(result.querySelector('a')?.hasAttribute('target')).to.be.false;
      } finally {
        DOMPurify.clearConfig();
      }
    });

    it('applies the rule to http links and image map areas', async () => {
      const result = await parse(
        renderer,
        [
          '[HTTP](http://example.com)',
          '<map name="pages"><area href="https://example.com" alt="Docs"><area href="/register" alt="Register"></map>',
        ].join(' ')
      );
      const [external, internal] = result.querySelectorAll('area');

      expect(result.querySelector('a')?.target).to.equal('_blank');
      expect(external.target).to.equal('_blank');
      expect(external.rel).to.equal('noopener noreferrer');
      expect(internal.hasAttribute('target')).to.be.false;
    });

    it('compares links with the global origin', async () => {
      // In a srcdoc frame, `location.origin` is "null", and the global `origin` is the page's.
      const origin = stub(globalThis, 'origin').value('https://example.com');
      try {
        const [docs, register] = (
          await parse(
            renderer,
            '[Docs](https://example.com/docs) [Register](/register)'
          )
        ).querySelectorAll('a');

        expect(docs.hasAttribute('target')).to.be.false;
        expect(register.target).to.equal('_blank');
      } finally {
        origin.restore();
      }
    });

    it('sanitizes a form with a control named like a form method', async () => {
      const result = await parse(
        renderer,
        '<form><input name="hasAttribute"></form>'
      );
      expect(result.querySelector('form input')).to.exist;
    });

    it('uses the global DOMPurify configuration', async () => {
      DOMPurify.setConfig({ FORBID_TAGS: ['img'] });
      try {
        const result = await parse(renderer, '<img src="photo.png">');
        expect(result.querySelector('img')).to.be.null;
      } finally {
        DOMPurify.clearConfig();
      }
    });

    it('leaves no hook on the global DOMPurify', async () => {
      await renderer.parse('[Docs](https://example.com)');

      expect(
        DOMPurify.sanitize('<a href="https://example.com">Docs</a>')
      ).to.equal('<a href="https://example.com">Docs</a>');
    });

    it('removes unsafe HTML', async () => {
      const result = await parse(
        renderer,
        '<img src="x" onerror="alert(1)"><script>alert(1)</script>\n\n[x](javascript:alert(1))'
      );

      expect(result.querySelector('img')?.hasAttribute('onerror')).to.be.false;
      expect(result.querySelector('script')).to.be.null;
      expect(result.querySelector('a')?.hasAttribute('href')).to.be.false;
    });

    it('uses a custom sanitizer', async () => {
      const sanitizer = spy((_html: string) => '<p>clean</p>');
      const custom = await setupMarkdownRenderer({
        noHighlighter: true,
        sanitizer,
      });

      expect(
        await custom.parse('[Docs](https://example.com) [Register](/register)')
      ).to.equal('<p>clean</p>');
      expect(sanitizer.calledOnce).to.be.true;
      // Without the default sanitizer, the link renderer opens the new tab.
      expect(sanitizer.firstCall.args[0]).to.contain(
        '<a target="_blank" rel="noopener noreferrer" href="https://example.com">'
      );
      expect(sanitizer.firstCall.args[0]).to.contain('<a href="/register">');
    });

    it('decides for a custom sanitizer by the href that the browser follows', async () => {
      const custom = await setupMarkdownRenderer({
        noHighlighter: true,
        sanitizer: (html) => html,
      });
      const [entity, backslash, fragment, mail] = (
        await parse(
          custom,
          [
            '[Docs](&#104;ttps://example.com)',
            '[Home](/\\example.com)',
            '[Top](#top)',
            '[Mail](mailto:info@example.com)',
          ].join(' ')
        )
      ).querySelectorAll('a');

      expect(entity.getAttribute('href')).to.equal('https://example.com');
      expect(entity.target).to.equal('_blank');
      expect(entity.rel).to.equal('noopener noreferrer');
      expect(backslash.getAttribute('href')).to.equal('/%5Cexample.com');
      for (const link of [backslash, fragment, mail]) {
        expect(link.hasAttribute('target')).to.be.false;
      }
    });

    it('renders code blocks as plain code', async () => {
      expectPlainCode(await parse(renderer, codeBlock));
    });
  });

  describe('createMarkdownRenderer', () => {
    const message: IgcChatMessage = { id: '1', text: '', sender: 'user' };

    it('renders the message text', async () => {
      const render = await createMarkdownRenderer({ noHighlighter: true });
      const element = await fixture<HTMLElement>(
        html`<div>${await render({ ...message, text: '**Hi**' })}</div>`
      );

      expect(element.querySelector('strong')?.textContent).to.equal('Hi');
    });

    it('parses a message again only when its text changes', async () => {
      const render = await createMarkdownRenderer({ noHighlighter: true });
      const hi = { ...message, text: '**Hi**' };
      const result = await render(hi);

      expect(await render(hi)).to.equal(result);
      hi.text = '**Hello**';
      expect(await render(hi)).to.not.equal(result);
    });

    it('renders nothing for a message without text', async () => {
      const render = await createMarkdownRenderer({ noHighlighter: true });
      expect(await render(message)).to.equal('');
    });
  });

  describe('with the highlighter', () => {
    let renderer: MarkdownRenderer;

    // The first setup loads shiki, its WebAssembly engine and the grammars.
    before(async function () {
      this.timeout(20_000);
      renderer = await setupMarkdownRenderer();
    });

    it('highlights code with the light and the dark theme', async () => {
      const pre = (await parse(renderer, codeBlock)).querySelector('pre')!;

      expect([...pre.classList]).to.include.members([
        'shiki',
        'github-light',
        'github-dark',
      ]);
      expect(pre.getAttribute('style')).to.contain('var(--shiki-bg)');
      expect(pre.textContent).to.equal(code);
    });

    it('uses the default for a theme that is not set', async () => {
      const pre = await highlightedPre({ theme: { dark: 'github-dark' } });

      expect([...pre.classList]).to.include.members([
        'github-light',
        'github-dark',
      ]);
    });

    it('highlights once with one theme for both modes', async () => {
      const pre = await highlightedPre({ theme: 'github-dark' });

      expect([...pre.classList]).to.eql(['shiki', 'github-dark']);
      expect(pre.getAttribute('style')).to.contain('var(--shiki-bg)');
    });

    it("highlights with shiki's special theme 'none'", async () => {
      const pre = await highlightedPre({ theme: 'none' });

      expect(pre.classList.contains('shiki')).to.be.true;
      expect(pre.textContent).to.equal(code);
      // No colors of its own, so the styles of the app apply.
      expect(pre.getAttribute('style') ?? '').to.not.match(
        /transparent|currentColor/
      );
    });

    it("gives valid colors when 'none' pairs with another theme", async () => {
      const pre = await highlightedPre({
        theme: { light: 'none', dark: 'github-dark' },
      });
      const declarations = [pre, ...pre.querySelectorAll('[style]')]
        .flatMap((element) => element.getAttribute('style')!.split(';'))
        .filter(Boolean);

      expect(declarations).to.not.be.empty;
      for (const declaration of declarations) {
        const colon = declaration.indexOf(':');
        expect(
          CSS.supports(
            declaration.slice(0, colon),
            declaration.slice(colon + 1)
          ),
          declaration
        ).to.be.true;
      }
    });

    it('applies custom color replacements to every theme', async () => {
      const pre = await highlightedPre({
        theme: 'nord',
        colorReplacements: { '#2e3440ff': 'var(--code-background)' },
      });
      expect(pre.getAttribute('style')).to.contain('var(--code-background)');
    });

    it('keeps code blocks apart when the language or the code has a NUL', async () => {
      const fresh = await setupMarkdownRenderer();
      const block = '```typescript\nfoo\0bar\n```';

      await renderer.parse('```typescript\0foo\nbar\n```');
      expect(await renderer.parse(block)).to.equal(await fresh.parse(block));
    });

    it('keeps the highlighted code of each language apart', async () => {
      const typescript = await renderer.parse(codeBlock);
      const text = await renderer.parse(
        codeBlock.replace('typescript', 'text')
      );

      expect(text).to.not.equal(typescript);
      expect(await renderer.parse(codeBlock)).to.equal(typescript);
    });

    it('shares one highlighter between renderers with the same configuration', async () => {
      const warn = spy(console, 'warn');
      try {
        for (let i = 0; i < 10; i++) {
          await setupMarkdownRenderer();
        }
        expect(warn.calledWithMatch('[Shiki]')).to.be.false;
      } finally {
        warn.restore();
      }
    });

    it('highlights a small code block while it streams', async () => {
      const result = await parse(renderer, '```typescript\nconst answer = 42;');
      expect(result.querySelector('.shiki')).to.exist;
    });

    const largeCode = Array.from(
      { length: 150 },
      (_, i) => `const value${i} = ${i};`
    ).join('\n');
    const largeBlockCases: [string, string[], boolean][] = [
      [
        'highlights a large block after its closing fence',
        ['```typescript', largeCode, '```'],
        true,
      ],
      [
        'accepts a longer closing fence',
        ['~~~typescript', largeCode, '~~~~'],
        true,
      ],
      [
        'shows a large block as plain code while it streams',
        ['```typescript', largeCode],
        false,
      ],
      [
        'does not end a fence with a shorter one',
        ['````typescript', largeCode, '```'],
        false,
      ],
    ];

    for (const [name, lines, highlighted] of largeBlockCases) {
      it(name, async () => {
        const result = await parse(renderer, lines.join('\n'));

        expect(Boolean(result.querySelector('.shiki'))).to.equal(highlighted);
        expect(result.querySelector('pre')?.textContent).to.contain(
          'const value149 = 149;'
        );
      });
    }

    it('skips the highlighter for a theme that is not in the bundle', async () => {
      const custom = await setupMarkdownRenderer({
        theme: { light: 'github-light', dark: 'no-such-theme' },
      });
      expect(custom.marked.defaults.walkTokens).to.not.be.ok;
    });

    const plainCodeCases: [string, MarkdownRendererOptions][] = [
      ['a theme that is not in the bundle', { theme: 'no-such-theme' }],
      ['a theme named like an object method', { theme: 'valueOf' }],
      ['a language that is not loaded', { languages: ['css'] }],
    ];

    for (const [name, options] of plainCodeCases) {
      it(`renders plain code for ${name}`, async () => {
        const custom = await setupMarkdownRenderer(options);
        expectPlainCode(await parse(custom, codeBlock));
      });
    }
  });
});

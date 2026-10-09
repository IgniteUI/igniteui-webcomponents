import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, html as litHtml } from 'lit';
import { spy } from 'sinon';

import { defineComponents } from '#internals/definitions/defineComponents.js';
import { configureTheme } from '#theming/config.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcHighlightComponent from './highlight.js';
import { all } from './themes/themes.js';

describe('Highlight', () => {
  before(() => defineComponents(IgcHighlightComponent));

  let highlight: IgcHighlightComponent;

  function createHighlightWithInitialMatch() {
    return html`<igc-highlight search-text="lorem">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente in
      recusandae aliquam placeat! Saepe hic reiciendis quae, dolorum totam ab
      mollitia, tempora excepturi blanditiis repellat dolore nemo cumque illum
      quas.
    </igc-highlight>`;
  }

  function createHighlight() {
    return html`<igc-highlight>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente in
      recusandae aliquam placeat! Saepe hic reiciendis quae, dolorum totam ab
      mollitia, tempora excepturi blanditiis repellat dolore nemo cumque illum
      quas.
    </igc-highlight>`;
  }

  describe('Initial render', () => {
    beforeEach(async () => {
      highlight = await fixture(createHighlightWithInitialMatch());
    });

    it('is correctly matched', async () => {
      expect(highlight.size).to.equal(1);
    });
  });

  describe('DOM', () => {
    beforeEach(async () => {
      highlight = await fixture(createHighlight());
    });

    it('is defined', async () => {
      expect(highlight).to.not.be.undefined;
    });

    it('is accessible', async () => {
      await expect(highlight).shadowDom.to.be.accessible();
      await expect(highlight).lightDom.to.be.accessible();
    });
  });

  describe('Highlight stylesheet tree scope', () => {
    function hasHighlightSheet(root: DocumentOrShadowRoot): boolean {
      return root.adoptedStyleSheets.some((sheet) =>
        Array.from(sheet.cssRules).some((rule) =>
          rule.cssText.includes('::highlight(igc-highlight-')
        )
      );
    }

    it('is adopted by the tree scope of the slotted content, not the render root', async () => {
      highlight = await fixture(createHighlightWithInitialMatch());

      // `::highlight()` rules are tree-scoped. In the render root they show nothing in Firefox.
      expect(hasHighlightSheet(document)).to.be.true;
      expect(hasHighlightSheet(highlight.renderRoot as ShadowRoot)).to.be.false;
    });

    it('re-targets the stylesheet when the host moves to another tree scope', async () => {
      highlight = await fixture(createHighlightWithInitialMatch());

      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      document.body.append(host);

      shadow.append(highlight);
      await elementUpdated(highlight);

      expect(hasHighlightSheet(shadow)).to.be.true;
      expect(hasHighlightSheet(document)).to.be.false;

      host.remove();
    });

    it('keeps the stylesheet in a themed shadow root on a theme change', async () => {
      const tag = defineCE(
        class extends LitElement {
          constructor() {
            super();
            addThemingController(this, all);
          }

          protected override render() {
            return litHtml`<igc-highlight search-text="lorem">Lorem</igc-highlight>`;
          }
        }
      );
      const host = await fixture<LitElement>(
        html`<${unsafeStatic(tag)}></${unsafeStatic(tag)}>`
      );
      expect(hasHighlightSheet(host.shadowRoot!)).to.be.true;

      try {
        configureTheme('material');
        expect(hasHighlightSheet(host.shadowRoot!)).to.be.true;
      } finally {
        configureTheme('bootstrap');
      }
    });

    it('adopts the stylesheet only once when attached again', async () => {
      highlight = await fixture(createHighlightWithInitialMatch());

      const countSheets = () =>
        document.adoptedStyleSheets.filter((sheet) =>
          Array.from(sheet.cssRules).some((rule) =>
            rule.cssText.includes('::highlight(igc-highlight-')
          )
        ).length;

      expect(countSheets()).to.equal(1);

      // No public route re-runs the attach step without a disconnect.
      (
        highlight as unknown as { _service: { attachStylesheet(): void } }
      )._service.attachStylesheet();

      expect(countSheets()).to.equal(1);
    });

    it('removes the stylesheet from its tree scope on disconnect', async () => {
      highlight = await fixture(createHighlightWithInitialMatch());

      highlight.remove();
      await elementUpdated(highlight);

      expect(hasHighlightSheet(document)).to.be.false;
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      highlight = await fixture(createHighlight());
    });

    it('matches on changing `search` value', async () => {
      expect(highlight.size).to.equal(0);

      highlight.searchText = 'lorem';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(1);

      highlight.searchText = '';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(0);
    });

    it('matches with case sensitivity', async () => {
      highlight.caseSensitive = true;
      highlight.searchText = 'lorem';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(0);

      highlight.searchText = 'Lorem';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(1);
    });

    it('matches a space in the search text with any run of whitespace', async () => {
      // A text node keeps the whitespace, which a formatter can change in a template.
      highlight.replaceChildren(
        document.createTextNode(
          'cold\n      brew, cold  \t brew, cold brew, coldbrew'
        )
      );
      highlight.searchText = 'cold brew';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(3);

      highlight.searchText = 'cold \t brew';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(3);
    });

    it('moves to the next match when `next()` is invoked', async () => {
      highlight.searchText = 'e';
      await elementUpdated(highlight);

      expect(highlight.size).greaterThan(0);
      expect(highlight.current).to.equal(0);

      highlight.next();
      expect(highlight.current).to.equal(1);
    });

    it('moves to the previous when `previous()` is invoked', async () => {
      highlight.searchText = 'e';
      await elementUpdated(highlight);

      expect(highlight.size).greaterThan(0);
      expect(highlight.current).to.equal(0);

      // Wrap around to the last one
      highlight.previous();
      expect(highlight.current).to.equal(highlight.size - 1);
    });

    it('setActive called', async () => {
      highlight.searchText = 'e';
      await elementUpdated(highlight);

      highlight.setActive(15);
      expect(highlight.current).to.equal(15);
    });

    it('does nothing on navigation without matches', async () => {
      const scrollSpy = spy(highlight, 'scrollIntoView');

      highlight.next();
      highlight.previous();
      highlight.setActive(3);

      expect(highlight.size).to.equal(0);
      expect(highlight.current).to.equal(0);
      expect(scrollSpy).not.called;
    });

    it('scrolls the active match into view unless `preventScroll` is set', async () => {
      highlight.searchText = 'e';
      await elementUpdated(highlight);

      const scrollSpy = spy(highlight, 'scrollIntoView');

      highlight.next({ preventScroll: true });
      expect(highlight.current).to.equal(1);
      expect(scrollSpy).not.called;

      highlight.next();
      expect(highlight.current).to.equal(2);
      expect(scrollSpy).calledOnceWith({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      });
    });

    it('refresh called', async () => {
      highlight.searchText = 'lorem';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(1);

      const node = document.createElement('div');
      node.textContent = 'Lorem '.repeat(9);

      highlight.append(node);
      highlight.search();

      expect(highlight.size).to.equal(10);

      node.remove();
      highlight.search();

      expect(highlight.size).to.equal(1);
    });
  });
});

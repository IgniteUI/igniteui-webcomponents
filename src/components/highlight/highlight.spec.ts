import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcHighlightComponent from './highlight.js';

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

      // `::highlight()` rules are tree-scoped, so they must live in the scope owning the
      // slotted text nodes. Attaching them to the component's own shadow root renders no
      // highlight in browsers that enforce the scoping (Firefox).
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

import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcHighlightComponent from './highlight.js';

describe('Highlight', () => {
  before(() => defineComponents(IgcHighlightComponent));

  let highlight: IgcHighlightComponent;

  function createHighlightWithInitialMatch() {
    return html`<igc-highlight search="lorem">
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

  describe('API', () => {
    beforeEach(async () => {
      highlight = await fixture(createHighlight());
    });

    it('default theme keys are registered with correct priority', async () => {
      const theme = CSS.highlights.get(highlight.theme)!;
      const activeTheme = CSS.highlights.get(highlight.activeTheme)!;

      expect(theme).to.exist;
      expect(activeTheme).to.exist;
      expect(activeTheme.priority).greaterThan(theme.priority);
    });

    it('matches on changing `search` value', async () => {
      expect(highlight.size).to.equal(0);

      highlight.search = 'lorem';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(1);

      highlight.search = '';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(0);
    });

    it('matches on changing `condition`', async () => {
      expect(highlight.size).to.equal(0);

      highlight.search = 'dolor';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(3);

      highlight.condition = 'startsWith';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(0);

      highlight.condition = 'contains';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(3);
    });

    it('matches with case sensitivity', async () => {
      highlight.caseSensitive = true;
      highlight.search = 'lorem';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(0);

      highlight.search = 'Lorem';
      await elementUpdated(highlight);

      expect(highlight.size).to.equal(1);
    });

    it('moves to the next match when `next()` is invoked', async () => {
      highlight.search = 'e';
      await elementUpdated(highlight);

      expect(highlight.size).greaterThan(0);
      expect(highlight.current).to.equal(0);

      highlight.next();
      expect(highlight.current).to.equal(1);
    });

    it('moves to the previous when `previous()` is invoked', async () => {
      highlight.search = 'e';
      await elementUpdated(highlight);

      expect(highlight.size).greaterThan(0);
      expect(highlight.current).to.equal(0);

      highlight.next();
      highlight.previous();

      expect(highlight.current).to.equal(0);
    });
  });
});

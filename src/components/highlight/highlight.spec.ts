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
import { withDocumentSheets } from '#internals/testing/helpers.spec.js';
import { configureTheme } from '#theming/config.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
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

  describe('Highlight colors', () => {
    type Color = { backgroundColor: string; color: string };
    type Colors = { resting: Color; active: Color };
    type Names = { resting: string; active: string };

    const red = 'rgb(255, 0, 0)';
    const redColors: Colors = {
      resting: { backgroundColor: red, color: red },
      active: { backgroundColor: red, color: red },
    };
    const customColors: Colors = {
      resting: { backgroundColor: 'rgb(1, 2, 3)', color: 'rgb(4, 5, 6)' },
      active: { backgroundColor: 'rgb(7, 8, 9)', color: 'rgb(10, 11, 12)' },
    };

    function toStyle({ resting, active }: Colors): string {
      return `--background: ${resting.backgroundColor}; --foreground: ${resting.color}; --background-active: ${active.backgroundColor}; --foreground-active: ${active.color}`;
    }

    /** The highlight names that have a match in the node. */
    function getHighlightNames(node: Node): Names {
      const entries = Array.from(CSS.highlights).filter(([, entry]) =>
        Array.from(entry as Iterable<Range>).some((range) =>
          node.contains(range.startContainer)
        )
      );

      const getName = (priority: number): string => {
        const entry = entries.find(([, value]) => value.priority === priority);
        expect(entry, `a highlight with priority ${priority}`).to.exist;
        return entry![0];
      };

      return { resting: getName(0), active: getName(1) };
    }

    function getColors(element: Element, names: Names): Colors {
      const read = (name: string): Color => {
        const { backgroundColor, color } = getComputedStyle(
          element,
          `::highlight(${name})`
        );
        return { backgroundColor, color };
      };

      return { resting: read(names.resting), active: read(names.active) };
    }

    it('paints the matches inside an element that sets the same custom property names', async () => {
      // Without a palette, every match is transparent.
      await withDocumentSheets([bootstrap.styleSheet!], async () => {
        highlight = await fixture(
          html`<igc-highlight search-text="ele">
            <p>Elena Kolev</p>
            <div style=${toStyle(redColors)}>
              <p>Elena Marinova</p>
            </div>
          </igc-highlight>`
        );

        const [outer, inner] = highlight.querySelectorAll('p');
        const names = getHighlightNames(highlight);
        const colors = getColors(outer, names);

        expect(highlight.size).to.equal(2);
        expect(colors.resting.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
        expect(colors.active.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
        expect(getColors(inner, names)).to.deep.equal(colors);
      });
    });

    it('paints the matches with the custom properties set on the host', async () => {
      highlight = await fixture(
        html`<igc-highlight search-text="ele" style=${toStyle(customColors)}>
          <div style=${toStyle(redColors)}>
            <p>Elena Marinova</p>
          </div>
        </igc-highlight>`
      );

      const text = highlight.querySelector('p')!;

      expect(getColors(text, getHighlightNames(text))).to.deep.equal(
        customColors
      );
    });

    it('keeps the host colors after a theme change', async () => {
      highlight = await fixture(
        html`<igc-highlight search-text="ele" style=${toStyle(customColors)}>
          <p>Elena</p>
        </igc-highlight>`
      );

      const text = highlight.querySelector('p')!;
      const names = getHighlightNames(text);

      try {
        configureTheme('material');
        expect(getColors(text, names)).to.deep.equal(customColors);
      } finally {
        configureTheme('bootstrap');
      }
    });

    it('paints the matches inside a nested highlight with its own colors', async () => {
      highlight = await fixture(
        html`<igc-highlight search-text="ele" style=${toStyle(customColors)}>
          <p>Elena</p>
          <igc-highlight search-text="kol" style=${toStyle(redColors)}>
            <p>Elena</p>
            <p>Kolev</p>
          </igc-highlight>
        </igc-highlight>`
      );

      const [outer, inner, innerOwn] = highlight.querySelectorAll('p');

      expect(getColors(inner, getHighlightNames(outer))).to.deep.equal(
        customColors
      );
      expect(getColors(innerOwn, getHighlightNames(innerOwn))).to.deep.equal(
        redColors
      );
    });

    it('adopts the color sheet of the host only once across reconnects', async () => {
      highlight = await fixture(createHighlightWithInitialMatch());

      const countSheets = () =>
        highlight.shadowRoot!.adoptedStyleSheets.filter((sheet) =>
          Array.from(sheet.cssRules).some((rule) =>
            rule.cssText.includes('--_igc-highlight-')
          )
        ).length;

      expect(countSheets()).to.equal(1);

      const parent = highlight.parentElement!;
      highlight.remove();
      parent.append(highlight);
      await elementUpdated(highlight);

      expect(countSheets()).to.equal(1);
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

    it('keeps the active match when the search is set again to its values', async () => {
      highlight.searchText = 'e';
      await elementUpdated(highlight);

      highlight.next();
      highlight.searchText = 'e';
      highlight.caseSensitive = false;
      await elementUpdated(highlight);

      expect(highlight.current).to.equal(1);

      highlight.caseSensitive = true;
      await elementUpdated(highlight);

      expect(highlight.current).to.equal(0);
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

import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import {
  getBorderRadius,
  getCSSZoom,
  getDeepActiveElement,
  getDeepBorderRadius,
  getOverflowClip,
  getPaddingBox,
  getScaleFactor,
  getVisibleAncestor,
  hasNegativeTabIndex,
  intersectBoxes,
  isEmptyBox,
  isSameBox,
  iterNodes,
  normalizedTextContent,
  pointToFraction,
  resolveCssLength,
  roundByDPR,
  setOrRemoveAttribute,
  skipsRendering,
} from './dom.js';

describe('DOM utilities', () => {
  describe('setOrRemoveAttribute', () => {
    it('sets a value, keeps an empty string, and removes on null or undefined', () => {
      const element = document.createElement('div');

      setOrRemoveAttribute(element, 'aria-label', 'Name');
      expect(element.getAttribute('aria-label')).to.equal('Name');

      setOrRemoveAttribute(element, 'aria-label', '');
      expect(element.getAttribute('aria-label')).to.equal('');

      setOrRemoveAttribute(element, 'aria-label', null);
      expect(element.hasAttribute('aria-label')).to.be.false;

      element.setAttribute('aria-label', 'Name');
      setOrRemoveAttribute(element, 'aria-label', undefined);
      expect(element.hasAttribute('aria-label')).to.be.false;
    });
  });

  describe('hasNegativeTabIndex', () => {
    it('is true only for `tabindex="-1"`', () => {
      const element = document.createElement('div');
      expect(hasNegativeTabIndex(element)).to.be.false;

      element.setAttribute('tabindex', '0');
      expect(hasNegativeTabIndex(element)).to.be.false;

      element.setAttribute('tabindex', '-1');
      expect(hasNegativeTabIndex(element)).to.be.true;
    });
  });

  describe('pointToFraction', () => {
    let element: HTMLDivElement;

    beforeEach(async () => {
      element = await fixture<HTMLDivElement>(
        html`<div style="width: 200px; height: 10px;"></div>`
      );
    });

    it('should map a client coordinate to a fraction of the element width', () => {
      const { left } = element.getBoundingClientRect();

      expect(pointToFraction(element, left)).to.equal(0);
      expect(pointToFraction(element, left + 50)).to.equal(0.25);
      expect(pointToFraction(element, left + 200)).to.equal(1);
    });

    it('should measure from the right edge in RTL', () => {
      const { left, right } = element.getBoundingClientRect();

      expect(pointToFraction(element, right, false)).to.equal(0);
      expect(pointToFraction(element, left + 150, false)).to.equal(0.25);
      expect(pointToFraction(element, left, false)).to.equal(1);
    });

    it('should clamp coordinates outside the element to [0, 1]', () => {
      const { left, right } = element.getBoundingClientRect();

      expect(pointToFraction(element, left - 100)).to.equal(0);
      expect(pointToFraction(element, right + 100)).to.equal(1);
      expect(pointToFraction(element, right + 100, false)).to.equal(0);
    });

    it('should return 0 for an element without layout', () => {
      element.style.display = 'none';
      expect(pointToFraction(element, 100)).to.equal(0);
    });
  });

  describe('normalizedTextContent', () => {
    it('should concatenate text across elements and text nodes', async () => {
      const element = await fixture<HTMLDivElement>(
        html`<div>Hello <span> brave new </span> world</div>`
      );

      expect(normalizedTextContent(element.childNodes)).to.equal(
        'Hello brave new world'
      );
    });

    it('should trim and collapse consecutive whitespace', () => {
      const nodes = [
        document.createTextNode('  Hello '),
        document.createTextNode('\n brave\t '),
        document.createTextNode(' new world  '),
      ];

      expect(normalizedTextContent(nodes)).to.equal('Hello brave new world');
    });

    it('should return an empty string for no nodes', () => {
      expect(normalizedTextContent([])).to.equal('');
    });

    it('should return an empty string for whitespace-only content', () => {
      const nodes = [document.createTextNode(' \n \t ')];
      expect(normalizedTextContent(nodes)).to.equal('');
    });
  });

  describe('resolveCssLength', () => {
    let element: HTMLDivElement;

    beforeEach(async () => {
      element = await fixture<HTMLDivElement>(
        html`<div style="font-size: 20px;"></div>`
      );
    });

    it('should pass absolute pixel values through', () => {
      expect(resolveCssLength(element, '42px')).to.equal(42);
      expect(resolveCssLength(element, '0px')).to.equal(0);
      expect(resolveCssLength(element, '12.5px')).to.equal(12.5);
    });

    it('should resolve font-relative units', () => {
      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );

      expect(resolveCssLength(element, '2em')).to.equal(40);
      expect(resolveCssLength(element, '5rem')).to.equal(5 * rootFontSize);
    });

    it('should resolve viewport-relative units', () => {
      expect(resolveCssLength(element, '10vw')).to.equal(
        0.1 * window.innerWidth
      );
    });

    it('should resolve other absolute units', () => {
      expect(resolveCssLength(element, '1in')).to.equal(96);
      expect(resolveCssLength(element, '12pt')).to.equal(16);
    });

    it('should return 0 for percentages, which are not lengths', () => {
      expect(resolveCssLength(element, '50%')).to.equal(0);
    });

    it('should return 0 for values that are not valid lengths', () => {
      expect(resolveCssLength(element, '200')).to.equal(0);
      expect(resolveCssLength(element, 'auto')).to.equal(0);
      expect(resolveCssLength(element, 'nonsense')).to.equal(0);
      expect(resolveCssLength(element, '')).to.equal(0);
    });

    it('should not leave the resolution property behind on the element', () => {
      resolveCssLength(element, '3rem');
      expect(element.getAttribute('style')).to.equal('font-size: 20px;');
    });

    it('should restore a custom property the caller had already set inline', () => {
      element.style.setProperty('--igc-resolved-length', '7px');

      expect(resolveCssLength(element, '3rem')).to.equal(48);
      expect(element.style.getPropertyValue('--igc-resolved-length')).to.equal(
        '7px'
      );
    });

    it('should preserve the priority of a restored custom property', () => {
      element.style.setProperty('--igc-resolved-length', '7px', 'important');

      resolveCssLength(element, '3rem');

      expect(
        element.style.getPropertyPriority('--igc-resolved-length')
      ).to.equal('important');
    });
  });

  describe('resolveCssLength in another bundle instance', () => {
    // Runs at suite collection, before the first `resolveCssLength` call of
    // this page, as a second bundle instance that registered the property
    // earlier would.
    CSS.registerProperty({
      name: '--igc-resolved-length',
      syntax: '<length>',
      inherits: false,
      initialValue: '0px',
    });

    it('resolves lengths when another instance registered the property first', async () => {
      const element = await fixture<HTMLElement>(
        html`<div style="font-size: 10px"></div>`
      );

      expect(resolveCssLength(element, '2em')).to.equal(20);
    });
  });

  describe('iterNodes', () => {
    it('yields every node of the subtree without options', () => {
      const root = document.createElement('div');
      const child = document.createElement('span');
      const text = document.createTextNode('text');
      child.append(text);
      root.append(child, document.createComment('note'));

      expect(Array.from(iterNodes(root)).map((node) => node.nodeType)).to.eql([
        Node.ELEMENT_NODE,
        Node.TEXT_NODE,
        Node.COMMENT_NODE,
      ]);
    });
  });

  describe('normalizedTextContent with nodes without text', () => {
    it('treats a node with null text content as empty', () => {
      const text = document.createTextNode(' a ');

      expect(normalizedTextContent([document, text])).to.equal('a');
    });
  });

  describe('getScaleFactor', () => {
    it('returns the scale of a transformed element', async () => {
      const root = await fixture<HTMLElement>(
        html`<div style="transform: scale(2); transform-origin: 0 0">
          <div style="width: 100px; height: 50px"></div>
        </div>`
      );

      expect(getScaleFactor(root.firstElementChild as HTMLElement)).to.eql({
        x: 0.5,
        y: 0.5,
      });
    });

    it('returns 1 for an element without layout', () => {
      expect(getScaleFactor(document.createElement('div'))).to.eql({
        x: 1,
        y: 1,
      });
    });
  });

  describe('isSameBox, intersectBoxes and isEmptyBox', () => {
    const box = { left: 0, top: 0, right: 10, bottom: 10 };

    it('matches boxes to half a pixel', () => {
      expect(isSameBox(box, { left: 0.4, top: 0, right: 10, bottom: 10.4 })).to
        .be.true;
      expect(isSameBox(box, { left: 0.5, top: 0, right: 10, bottom: 10 })).to.be
        .false;
    });

    it('returns the overlap of two boxes', () => {
      expect(
        intersectBoxes(box, { left: 5, top: -5, right: 20, bottom: 5 })
      ).to.eql({ left: 5, top: 0, right: 10, bottom: 5 });
    });

    it('returns whether a box has no area', () => {
      expect(isEmptyBox(box)).to.be.false;
      expect(isEmptyBox(intersectBoxes(box, { ...box, left: 10, right: 20 })))
        .to.be.true;
    });
  });

  describe('getCSSZoom and getPaddingBox', () => {
    it('returns the zoomed padding box without the borders', async () => {
      const root = await fixture<HTMLElement>(
        html`<div style="zoom: 2">
          <div style="width: 50px; height: 20px; border: 5px solid"></div>
        </div>`
      );
      const element = root.firstElementChild!;
      const rect = element.getBoundingClientRect();
      const left = rect.left + 10;
      const top = rect.top + 10;

      expect(getCSSZoom(element)).to.equal(2);
      expect(getCSSZoom(root.parentElement!)).to.equal(1);
      expect(getPaddingBox(element)).to.eql({
        left,
        top,
        right: left + 100,
        bottom: top + 40,
      });
    });
  });

  describe('getOverflowClip', () => {
    it('clips only the axes that the overflow clips', async () => {
      const element = await fixture<HTMLElement>(
        html`<div style="width: 50px; height: 20px; overflow-x: clip"></div>`
      );
      const box = getPaddingBox(element);

      expect(getOverflowClip(element)).to.eql({
        left: box.left,
        top: -Infinity,
        right: box.right,
        bottom: Infinity,
      });
    });

    it('clips both axes with paint containment', async () => {
      const element = await fixture<HTMLElement>(
        html`<div style="width: 50px; height: 20px; contain: paint"></div>`
      );

      expect(getOverflowClip(element)).to.eql(getPaddingBox(element));
    });

    it('returns null for visible overflow, an inline box and no box', async () => {
      const root = await fixture<HTMLElement>(
        html`<div>
          <div></div>
          <span style="overflow: hidden"></span>
          <div style="display: contents; overflow: hidden"></div>
        </div>`
      );

      for (const child of root.children) {
        expect(getOverflowClip(child)).to.be.null;
      }
    });
  });

  describe('getBorderRadius and getDeepBorderRadius', () => {
    function radiusOf(value: string): string | null {
      const element = document.createElement('div');
      element.style.borderRadius = value;
      document.body.append(element);

      try {
        return getBorderRadius(getComputedStyle(element));
      } finally {
        element.remove();
      }
    }

    it('returns null when every corner is square', () => {
      expect(radiusOf('0')).to.be.null;
      expect(radiusOf('0%')).to.be.null;
      expect(radiusOf('0 4px 0 0')).to.equal('0px 4px 0px 0px');
    });

    it('returns the radius of a nested shadow element that covers the element', async () => {
      const host = await fixture<HTMLElement>(
        html`<div style="width: 40px"></div>`
      );
      host.attachShadow({ mode: 'open' }).innerHTML =
        '<div><div style="height: 40px; border-radius: 50%"></div></div>';

      expect(getDeepBorderRadius(host)).to.equal('50%');
    });

    it('ignores a shadow element that does not cover the element', async () => {
      const host = await fixture<HTMLElement>(
        html`<div style="width: 40px; height: 40px"></div>`
      );
      host.attachShadow({ mode: 'open' }).innerHTML =
        '<div style="height: 20px; border-radius: 50%"></div>';

      expect(getDeepBorderRadius(host)).to.be.null;
    });
  });

  describe('skipsRendering', () => {
    it('skips all content with `content-visibility: hidden`', async () => {
      const element = await fixture<HTMLElement>(
        html`<div style="content-visibility: hidden"><span></span></div>`
      );

      expect(skipsRendering(element, element.firstElementChild!)).to.be.true;
    });

    it('ignores `content-visibility` on an inline box and on no box', async () => {
      const root = await fixture<HTMLElement>(
        html`<div>
          <span style="content-visibility: hidden"><b></b></span>
          <div style="display: contents; content-visibility: hidden">
            <b></b>
          </div>
        </div>`
      );

      for (const element of root.children) {
        expect(skipsRendering(element, element.firstElementChild!)).to.be.false;
      }
    });

    it('follows an author override of the details content', async () => {
      const root = await fixture<HTMLElement>(
        html`<div>
          <style>
            details::details-content {
              content-visibility: visible;
            }
          </style>
          <details>
            <summary>Summary</summary>
            <b></b>
          </details>
        </div>`
      );
      const details = root.querySelector('details')!;

      expect(skipsRendering(details, details.querySelector('b')!)).to.be.false;
    });

    it('skips all but the summary of a closed details element', async () => {
      const details = await fixture<HTMLDetailsElement>(
        html`<details>
          <summary>Summary</summary>
          Text
        </details>`
      );
      const summary = details.querySelector('summary')!;
      const text = summary.nextSibling!;

      expect(skipsRendering(details, summary)).to.be.false;
      expect(skipsRendering(details, text)).to.be.true;

      details.open = true;
      expect(skipsRendering(details, text)).to.be.false;
    });
  });

  describe('roundByDPR', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('rounds to device pixels', () => {
      sinon.stub(window, 'devicePixelRatio').value(2);
      expect(roundByDPR(1.3)).to.equal(1.5);
    });

    it('rounds to CSS pixels without a device pixel ratio', () => {
      sinon.stub(window, 'devicePixelRatio').value(0);
      expect(roundByDPR(1.3)).to.equal(1);
    });
  });

  describe('getDeepActiveElement', () => {
    it('follows the focus into nested shadow roots', async () => {
      const outer = await fixture<HTMLElement>(html`<div></div>`);
      const outerRoot = outer.attachShadow({ mode: 'open' });
      const inner = document.createElement('div');
      outerRoot.append(inner);
      const innerRoot = inner.attachShadow({ mode: 'open' });
      const button = document.createElement('button');
      innerRoot.append(button);

      button.focus();

      expect(getDeepActiveElement()).to.equal(button);
      expect(getDeepActiveElement(outerRoot)).to.equal(button);
    });

    it('starts in the document when the focus is outside the root', async () => {
      const host = await fixture<HTMLElement>(
        html`<div><button>Outside</button></div>`
      );
      const root = host.attachShadow({ mode: 'open' });
      const outside = document.createElement('button');
      document.body.append(outside);

      try {
        outside.focus();
        expect(getDeepActiveElement(root)).to.equal(outside);
      } finally {
        outside.remove();
      }
    });
  });

  describe('getVisibleAncestor', () => {
    it('returns the closest visible ancestor', async () => {
      const root = await fixture<HTMLElement>(
        html`<div>
          <div style="display: contents"><span></span></div>
        </div>`
      );

      expect(getVisibleAncestor(root.querySelector('span')!)).to.equal(root);
    });

    it('returns null without a visible ancestor', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.append(child);

      expect(getVisibleAncestor(child)).to.be.null;
    });
  });
});

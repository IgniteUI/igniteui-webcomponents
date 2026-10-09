import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import {
  getDeepActiveElement,
  getScaleFactor,
  getVisibleAncestor,
  hasNegativeTabIndex,
  iterNodes,
  normalizedTextContent,
  pointToFraction,
  resolveCssLength,
  roundByDPR,
  setOrRemoveAttribute,
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

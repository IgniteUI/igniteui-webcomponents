import { expect, fixture, html } from '@open-wc/testing';
import {
  normalizedTextContent,
  pointToFraction,
  resolveCssLength,
} from './dom.js';

describe('DOM utilities', () => {
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
});

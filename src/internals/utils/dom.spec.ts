import { expect, fixture, html } from '@open-wc/testing';
import { resolveCssLength } from './dom.js';

describe('DOM utilities', () => {
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
  });
});

import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcQrCodeComponent from './qr-code.js';

describe('IgcQrCodeComponent', () => {
  before(() => {
    defineComponents(IgcQrCodeComponent);
  });

  function getSvg(el: IgcQrCodeComponent): SVGElement | null {
    return el.renderRoot.querySelector('svg');
  }

  describe('Accessibility', () => {
    it('passes the a11y audit when a value is set', async () => {
      const el = await fixture(
        html`<igc-qr-code value="https://example.com"></igc-qr-code>`
      );
      await expect(el).shadowDom.to.be.accessible();
    });

    it('renders an SVG with a <title> element for screen readers', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="https://example.com"></igc-qr-code>`
      );
      const title = el.renderRoot.querySelector('svg title');
      expect(title).to.exist;
      expect(title?.textContent).to.include('https://example.com');
    });

    it('uses aria-label as the SVG title content when provided', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code
          value="https://example.com"
          aria-label="Scan me"
        ></igc-qr-code>`
      );
      const title = el.renderRoot.querySelector('svg title');
      expect(title?.textContent).to.equal('Scan me');
    });
  });

  describe('Default property values', () => {
    let el: IgcQrCodeComponent;

    beforeEach(async () => {
      el = await fixture(html`<igc-qr-code></igc-qr-code>`);
    });

    it('size defaults to 128', () => {
      expect(el.size).to.equal(128);
    });

    it('margin defaults to 4', () => {
      expect(el.margin).to.equal(4);
    });

    it('errorLevel defaults to M', () => {
      expect(el.errorLevel).to.equal('M');
    });

    it('dotStyle defaults to square', () => {
      expect(el.dotStyle).to.equal('square');
    });

    it('squareStyle defaults to square', () => {
      expect(el.squareStyle).to.equal('square');
    });

    it('value defaults to undefined', () => {
      expect(el.value).to.be.undefined;
    });
  });

  describe('Rendering', () => {
    it('renders nothing when value is not set', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code></igc-qr-code>`
      );
      expect(getSvg(el)).to.be.null;
    });

    it('renders an SVG element when value is set', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="https://example.com"></igc-qr-code>`
      );
      expect(getSvg(el)).to.exist;
    });

    it('sets SVG width and height to match the size property', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="test" size="256"></igc-qr-code>`
      );
      const svgEl = getSvg(el)!;
      expect(svgEl.getAttribute('width')).to.equal('256');
      expect(svgEl.getAttribute('height')).to.equal('256');
    });

    it('updates SVG dimensions when size changes', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="test" size="128"></igc-qr-code>`
      );

      el.size = 320;
      await elementUpdated(el);

      const svgEl = getSvg(el)!;
      expect(svgEl.getAttribute('width')).to.equal('320');
      expect(svgEl.getAttribute('height')).to.equal('320');
    });

    it('re-renders when value changes', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="initial"></igc-qr-code>`
      );

      const svgBefore = getSvg(el)!.outerHTML;

      el.value = 'https://changed.example.com/with/a/longer/path';
      await elementUpdated(el);

      const svgAfter = getSvg(el)!.outerHTML;
      expect(svgAfter).not.to.equal(svgBefore);
    });

    it('clears the SVG when value is set back to undefined', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="test"></igc-qr-code>`
      );

      el.value = undefined;
      await elementUpdated(el);

      expect(getSvg(el)).to.be.null;
    });

    it('renders a background rect and at least one data path', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="https://example.com"></igc-qr-code>`
      );
      const svgEl = getSvg(el)!;
      expect(svgEl.querySelector('rect')).to.exist;
      expect(svgEl.querySelector('path')).to.exist;
    });

    it('renders three finder-pattern corner groups', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="https://example.com"></igc-qr-code>`
      );
      // Each corner renders a <g> with two <path> children; there are 3 corners
      const cornerGroups = el.renderRoot.querySelectorAll('svg > g > g');
      expect(cornerGroups.length).to.equal(3);
    });
  });

  describe('Attribute reflection', () => {
    it('reflects dot-style attribute to dotStyle property', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code dot-style="circle"></igc-qr-code>`
      );
      expect(el.dotStyle).to.equal('circle');
    });

    it('reflects square-style attribute to squareStyle property', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code square-style="rounded"></igc-qr-code>`
      );
      expect(el.squareStyle).to.equal('rounded');
    });

    it('reflects error-level attribute to errorLevel property', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code error-level="H"></igc-qr-code>`
      );
      expect(el.errorLevel).to.equal('H');
    });

    it('reflects version attribute to version property', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code version="5"></igc-qr-code>`
      );
      expect(el.version).to.equal(5);
    });
  });

  describe('Style variants', () => {
    const dotStyles = ['square', 'circle', 'rounded'] as const;
    const squareStyles = ['square', 'circle', 'rounded'] as const;

    for (const style of dotStyles) {
      it(`renders data path with dot-style="${style}"`, async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test" dot-style=${style}></igc-qr-code>`
        );
        expect(el.renderRoot.querySelector('path')).to.exist;
      });
    }

    for (const style of squareStyles) {
      it(`renders corner groups with square-style="${style}"`, async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test" square-style=${style}></igc-qr-code>`
        );
        const cornerGroups = el.renderRoot.querySelectorAll('svg > g > g');
        expect(cornerGroups.length).to.equal(3);
      });
    }
  });
});

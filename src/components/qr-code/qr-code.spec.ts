import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { restore, stub } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { asNumber } from '#internals/utils/math.js';
import { configureTheme } from '#theming/config.js';
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

  describe('Theming', () => {
    function getPart(el: IgcQrCodeComponent, part: string): SVGElement | null {
      return el.renderRoot.querySelector(`[part~="${part}"]`);
    }

    function fillOf(el: SVGElement | null): string {
      return getComputedStyle(el as unknown as Element).fill;
    }

    it('exposes background, dots, corner-square and corner-dot parts', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="https://example.com"></igc-qr-code>`
      );

      expect(getPart(el, 'background')).to.exist;
      expect(getPart(el, 'dots')).to.exist;
      expect(
        el.renderRoot.querySelectorAll('[part~="corner-square"]').length
      ).to.equal(3);
      expect(
        el.renderRoot.querySelectorAll('[part~="corner-dot"]').length
      ).to.equal(3);
    });

    it('defaults to the schema colors (white background, black modules/corners)', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code value="https://example.com"></igc-qr-code>`
      );

      expect(fillOf(getPart(el, 'background'))).to.equal('rgb(255, 255, 255)');
      expect(fillOf(getPart(el, 'dots'))).to.equal('rgb(0, 0, 0)');
      expect(fillOf(getPart(el, 'corner-square'))).to.equal('rgb(0, 0, 0)');
      expect(fillOf(getPart(el, 'corner-dot'))).to.equal('rgb(0, 0, 0)');
    });

    it('overrides colors via the documented CSS custom properties', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-background: rgb(232, 244, 255); --ig-qr-code-dark-color: rgb(0, 102, 204);"
        ></igc-qr-code>`
      );

      expect(fillOf(getPart(el, 'background'))).to.equal('rgb(232, 244, 255)');
      expect(fillOf(getPart(el, 'dots'))).to.equal('rgb(0, 102, 204)');
    });

    it('cascades --ig-qr-code-dark-color to corner-square and corner-dot when unset', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-dark-color: rgb(204, 51, 0);"
        ></igc-qr-code>`
      );

      expect(fillOf(getPart(el, 'corner-square'))).to.equal('rgb(204, 51, 0)');
      expect(fillOf(getPart(el, 'corner-dot'))).to.equal('rgb(204, 51, 0)');
    });

    it('lets an explicit corner-dot override win over the dark-color cascade', async () => {
      const el = await fixture<IgcQrCodeComponent>(
        html`<igc-qr-code
          value="https://example.com"
          style="--ig-qr-code-dark-color: rgb(204, 51, 0); --ig-qr-code-corner-dot-color: rgb(0, 0, 255);"
        ></igc-qr-code>`
      );

      expect(fillOf(getPart(el, 'corner-square'))).to.equal('rgb(204, 51, 0)');
      expect(fillOf(getPart(el, 'corner-dot'))).to.equal('rgb(0, 0, 255)');
    });

    it('does not invert colors when the global theme switches to dark variant', async () => {
      configureTheme('material', 'dark');

      try {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="https://example.com"></igc-qr-code>`
        );
        await elementUpdated(el);

        expect(fillOf(getPart(el, 'background'))).to.equal(
          'rgb(255, 255, 255)'
        );
        expect(fillOf(getPart(el, 'dots'))).to.equal('rgb(0, 0, 0)');
        expect(fillOf(getPart(el, 'corner-square'))).to.equal('rgb(0, 0, 0)');
        expect(fillOf(getPart(el, 'corner-dot'))).to.equal('rgb(0, 0, 0)');
      } finally {
        configureTheme('material', 'light');
      }
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

  describe('Logo', () => {
    // Minimal 1×1 transparent PNG — loads synchronously in all browsers.
    const VALID_LOGO =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    describe('Default property values', () => {
      let el: IgcQrCodeComponent;

      beforeEach(async () => {
        el = await fixture(html`<igc-qr-code></igc-qr-code>`);
      });

      it('logoSrc defaults to undefined', () => {
        expect(el.logoSrc).to.be.undefined;
      });

      it('logoSize defaults to 0.4', () => {
        expect(el.logoSize).to.equal(0.4);
      });

      it('logoMargin defaults to undefined', () => {
        expect(el.logoMargin).to.be.undefined;
      });
    });

    describe('Attribute reflection', () => {
      it('reflects logo-src to logoSrc', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code
            logo-src="https://example.com/logo.png"
          ></igc-qr-code>`
        );
        expect(el.logoSrc).to.equal('https://example.com/logo.png');
      });

      it('reflects logo-size to logoSize', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code logo-size="0.3"></igc-qr-code>`
        );
        expect(el.logoSize).to.equal(0.3);
      });

      it('reflects logo-margin to logoMargin', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code logo-margin="4"></igc-qr-code>`
        );
        expect(el.logoMargin).to.equal(4);
      });
    });

    describe('URL validation', () => {
      const UNSAFE_URLS = [
        'javascript:alert(1)',
        'JAVASCRIPT:alert(1)',
        'vbscript:msgbox(1)',
        'VBSCRIPT:msgbox(1)',
        'data:text/html,<h1>hi</h1>',
        'data:application/javascript,alert(1)',
      ];

      for (const url of UNSAFE_URLS) {
        it(`blocks unsafe logo URL: "${url.slice(0, 40)}"`, async () => {
          const el = await fixture<IgcQrCodeComponent>(
            html`<igc-qr-code value="test"></igc-qr-code>`
          );
          el.logoSrc = url;
          await elementUpdated(el);

          expect(el.renderRoot.querySelector('image')).to.be.null;
        });
      }

      it('allows a data:image/ URI', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        expect(el.renderRoot.querySelector('image')).to.exist;
      });

      it('allows a regular https:// URL', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code
            value="test"
            logo-src="https://example.com/logo.png"
          ></igc-qr-code>`
        );
        expect(el.renderRoot.querySelector('image')).to.exist;
      });
    });

    describe('Load errors', () => {
      // Well-formed data URI, but not a decodable image.
      const BROKEN_LOGO = 'data:image/png;base64,not-a-real-png';

      it('falls back to no logo when the image fails to load', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test" logo-src=${BROKEN_LOGO}></igc-qr-code>`
        );

        // Wait for the Image's load/error event to settle.
        await new Promise((resolve) => setTimeout(resolve, 50));
        await elementUpdated(el);

        expect(el.renderRoot.querySelector('image')).to.be.null;
        expect(el.renderRoot.querySelector('mask')).to.be.null;
      });

      it('recovers once logoSrc is changed to a valid image', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test" logo-src=${BROKEN_LOGO}></igc-qr-code>`
        );
        await new Promise((resolve) => setTimeout(resolve, 50));
        await elementUpdated(el);

        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        expect(el.renderRoot.querySelector('image')).to.exist;
      });
    });

    describe('SVG structure', () => {
      it('renders no <image> or <mask> when logoSrc is not set', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        expect(el.renderRoot.querySelector('image')).to.be.null;
        expect(el.renderRoot.querySelector('defs')).to.be.null;
      });

      it('renders an <image> and a <mask> when a valid logo is provided', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        expect(el.renderRoot.querySelector('image')).to.exist;
        expect(el.renderRoot.querySelector('mask')).to.exist;
      });

      it('renders the <image> outside the masked <g>', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        const imageEl = el.renderRoot.querySelector('image')!;
        expect(imageEl.closest('g')).to.be.null;
      });

      it('the <g> containing dots and finders has the mask applied', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        const maskId = el.renderRoot.querySelector('mask')!.getAttribute('id');
        const maskedGroup = el.renderRoot.querySelector('g[mask]')!;
        expect(maskedGroup.getAttribute('mask')).to.equal(`url(#${maskId})`);
      });

      it('the mask ID is stable across re-renders', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        const idBefore = el.renderRoot
          .querySelector('mask')!
          .getAttribute('id');

        el.value = 'updated value';
        await elementUpdated(el);

        const idAfter = el.renderRoot.querySelector('mask')!.getAttribute('id');
        expect(idBefore).to.equal(idAfter);
      });

      it('removes <image> and <mask> when logoSrc is cleared', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        el.logoSrc = undefined;
        await elementUpdated(el);

        expect(el.renderRoot.querySelector('image')).to.be.null;
        expect(el.renderRoot.querySelector('defs')).to.be.null;
      });

      it('removes <image> and <mask> when logoSrc is replaced with an unsafe URL', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        el.logoSrc = 'javascript:alert(1)';
        await elementUpdated(el);

        expect(el.renderRoot.querySelector('image')).to.be.null;
        expect(el.renderRoot.querySelector('defs')).to.be.null;
      });
    });

    describe('Error correction level', () => {
      it('a higher error correction level produces a larger QR code', async () => {
        // "testtest" (8 bytes) fits in V1-L (19 codewords) but requires V2 for H (9 codewords).
        const elH = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="testtest" error-level="H"></igc-qr-code>`
        );
        const elL = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="testtest" error-level="L"></igc-qr-code>`
        );

        const viewBoxH = getSvg(elH)!.getAttribute('viewBox')!.split(' ');
        const viewBoxL = getSvg(elL)!.getAttribute('viewBox')!.split(' ');

        expect(Number(viewBoxH[2])).to.be.greaterThan(Number(viewBoxL[2]));
      });

      it('caps the logo area to the safe area of the chosen EC level', async () => {
        // logo-size="1" — requests max area; L caps at 2.25%, H at 9%
        const elL = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code
            value="test"
            error-level="L"
            logo-size="1"
          ></igc-qr-code>`
        );
        const elH = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code
            value="test"
            error-level="H"
            logo-size="1"
          ></igc-qr-code>`
        );

        elL.logoSrc = VALID_LOGO;
        elH.logoSrc = VALID_LOGO;
        await elementUpdated(elL);
        await elementUpdated(elH);

        const widthL = asNumber(
          elL.renderRoot.querySelector('image')!.getAttribute('width')!
        );
        const widthH = asNumber(
          elH.renderRoot.querySelector('image')!.getAttribute('width')!
        );

        expect(widthL).to.be.lessThan(widthH);
      });
    });

    describe('logoMargin', () => {
      it('reduces the visible logo dimensions relative to the cleared area', async () => {
        const elNoMargin = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test"></igc-qr-code>`
        );
        const elWithMargin = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test" logo-margin="10"></igc-qr-code>`
        );

        elNoMargin.logoSrc = VALID_LOGO;
        elWithMargin.logoSrc = VALID_LOGO;
        await elementUpdated(elNoMargin);
        await elementUpdated(elWithMargin);

        const widthNoMargin = asNumber(
          elNoMargin.renderRoot.querySelector('image')!.getAttribute('width')!
        );
        const widthWithMargin = asNumber(
          elWithMargin.renderRoot.querySelector('image')!.getAttribute('width')!
        );

        expect(widthWithMargin).to.be.lessThan(widthNoMargin);
      });

      it('does not render an image when logoMargin consumes the entire logo box', async () => {
        // With logo-size="0" the box collapses to zero; no image should render.
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="test" logo-size="0"></igc-qr-code>`
        );
        el.logoSrc = VALID_LOGO;
        await elementUpdated(el);

        expect(el.renderRoot.querySelector('image')).to.be.null;
      });
    });
  });

  describe('Export', () => {
    const LOGO =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    let logoUrl: string | undefined;

    /** Serves the logo through an object URL so the export has to fetch and inline it. */
    function createLogoUrl(): string {
      const bytes = Uint8Array.from(atob(LOGO.split(',')[1]), (c) =>
        c.charCodeAt(0)
      );
      logoUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      return logoUrl;
    }

    async function parseSvg(blob: Blob): Promise<SVGSVGElement> {
      const doc = new DOMParser().parseFromString(
        await blob.text(),
        'image/svg+xml'
      );
      return doc.documentElement as unknown as SVGSVGElement;
    }

    async function expectRejection(
      promise: Promise<unknown>,
      type: new (...args: never[]) => Error
    ): Promise<void> {
      let error: unknown;
      try {
        await promise;
      } catch (e) {
        error = e;
      }
      expect(error).to.be.instanceOf(type);
    }

    afterEach(() => {
      restore();
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
        logoUrl = undefined;
      }
    });

    describe('toBlob()', () => {
      it('returns an SVG blob', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code value="https://example.com"></igc-qr-code>`
        );

        const blob = await el.toBlob();
        expect(blob.type).to.include('image/svg+xml');

        const svg = await parseSvg(blob);
        expect(svg.tagName).to.equal('svg');
        expect(svg.getAttribute('width')).to.equal('128');
        expect(svg.querySelector('title')?.textContent).to.include(
          'https://example.com'
        );
      });

      it('resolves theme colors to fill attributes and strips parts', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code
            value="https://example.com"
            style="--ig-qr-code-dark-color: rgb(10, 20, 30); --ig-qr-code-background: rgb(200, 210, 220)"
          ></igc-qr-code>`
        );

        const blob = await el.toBlob();
        const markup = await blob.text();
        expect(markup).not.to.include('part=');
        expect(markup).not.to.include('var(');

        const svg = await parseSvg(blob);
        expect(svg.querySelector('rect')?.getAttribute('fill')).to.equal(
          'rgb(200, 210, 220)'
        );
        expect(
          svg.querySelectorAll('path[fill="rgb(10, 20, 30)"]').length
        ).to.be.greaterThan(0);
        for (const shape of svg.querySelectorAll('rect, path')) {
          expect(shape.getAttribute('fill')).to.match(/^rgb/);
        }
      });

      it('keeps a data URI logo as is', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code
            value="https://example.com"
            logo-src=${LOGO}
          ></igc-qr-code>`
        );

        const svg = await parseSvg(await el.toBlob());
        expect(svg.querySelector('image')?.getAttribute('href')).to.equal(LOGO);
        expect(svg.querySelector('mask')).to.exist;
      });

      it('inlines a fetched logo as a data URI', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code
            value="https://example.com"
            logo-src=${createLogoUrl()}
          ></igc-qr-code>`
        );

        const svg = await parseSvg(await el.toBlob());
        const href = svg.querySelector('image')?.getAttribute('href');
        expect(href).to.match(/^data:image\/png/);
        expect(svg.querySelector('g')?.getAttribute('mask')).to.match(
          /^url\(#/
        );
      });

      it('drops the logo and its mask when the logo cannot be fetched', async () => {
        const fetchStub = stub(window, 'fetch').rejects(new TypeError('CORS'));
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code
            value="https://example.com"
            logo-src=${createLogoUrl()}
          ></igc-qr-code>`
        );

        const svg = await parseSvg(await el.toBlob());
        expect(fetchStub.calledOnce).to.be.true;
        expect(svg.querySelector('image')).to.be.null;
        expect(svg.querySelector('mask')).to.be.null;
        expect(svg.querySelector('[mask]')).to.be.null;
      });

      it('rejects when there is no value', async () => {
        const el = await fixture<IgcQrCodeComponent>(
          html`<igc-qr-code></igc-qr-code>`
        );
        await expectRejection(el.toBlob(), Error);
      });
    });

    describe('toImage()', () => {
      let el: IgcQrCodeComponent;

      beforeEach(async () => {
        el = await fixture(
          html`<igc-qr-code
            value="https://example.com"
            size="256"
          ></igc-qr-code>`
        );
      });

      it('exports a PNG file at the component size by default', async () => {
        const file = await el.toImage();
        expect(file).to.be.instanceOf(File);
        expect(file.name).to.equal('qr-code.png');
        expect(file.type).to.equal('image/png');

        const bitmap = await createImageBitmap(file);
        expect(bitmap.width).to.equal(256);
        expect(bitmap.height).to.equal(256);
        bitmap.close();
      });

      it('scales the raster output', async () => {
        const file = await el.toImage({ scale: 2 });
        const bitmap = await createImageBitmap(file);
        expect(bitmap.width).to.equal(512);
        expect(bitmap.height).to.equal(512);
        bitmap.close();
      });

      it('exports an opaque JPEG', async () => {
        const file = await el.toImage({ format: 'jpeg', fileName: 'code' });
        expect(file.name).to.equal('code.jpeg');
        expect(file.type).to.equal('image/jpeg');

        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d')!;
        context.drawImage(bitmap, 0, 0);
        bitmap.close();

        const [, , , alpha] = context.getImageData(0, 0, 1, 1).data;
        expect(alpha).to.equal(255);
      });

      it('exports a WebP file', async () => {
        const file = await el.toImage({ format: 'webp' });
        expect(file.name).to.equal('qr-code.webp');
        expect(file.type).to.equal('image/webp');
      });

      it('exports an SVG file with scaled dimensions', async () => {
        const file = await el.toImage({ format: 'svg', scale: 2 });
        expect(file.name).to.equal('qr-code.svg');
        expect(file.type).to.equal('image/svg+xml');

        const svg = await parseSvg(file);
        expect(svg.getAttribute('width')).to.equal('512');
        expect(svg.getAttribute('height')).to.equal('512');
        expect(svg.getAttribute('viewBox')).to.equal(
          getSvg(el)!.getAttribute('viewBox')
        );
      });

      it('keeps an existing matching extension in the file name', async () => {
        expect((await el.toImage({ fileName: 'My Code.PNG' })).name).to.equal(
          'My Code.PNG'
        );
        expect(
          (await el.toImage({ fileName: 'photo.jpg', format: 'jpeg' })).name
        ).to.equal('photo.jpg');
        expect((await el.toImage({ fileName: 'code.svg' })).name).to.equal(
          'code.svg.png'
        );
        expect((await el.toImage({ fileName: '  ' })).name).to.equal(
          'qr-code.png'
        );
      });

      it('triggers a download when requested', async () => {
        const click = stub(HTMLAnchorElement.prototype, 'click');

        await el.toImage({ fileName: 'ticket', download: true });
        expect(click.calledOnce).to.be.true;

        const anchor = click.thisValues[0] as HTMLAnchorElement;
        expect(anchor.download).to.equal('ticket.png');
        expect(anchor.href).to.match(/^blob:/);
      });

      it('does not trigger a download by default', async () => {
        const click = stub(HTMLAnchorElement.prototype, 'click');

        await el.toImage();
        expect(click.called).to.be.false;
      });

      it('rejects invalid options', async () => {
        await expectRejection(el.toImage({ scale: 0 }), RangeError);
        await expectRejection(el.toImage({ scale: -1 }), RangeError);
        await expectRejection(el.toImage({ scale: Number.NaN }), RangeError);
        await expectRejection(el.toImage({ scale: 1000 }), RangeError);
        await expectRejection(
          el.toImage({ format: 'gif' as unknown as 'png' }),
          TypeError
        );
      });

      it('rejects when there is no value', async () => {
        el.value = undefined;
        await elementUpdated(el);
        await expectRejection(el.toImage(), Error);
      });
    });
  });
});

import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';

import { defineComponents, IgcIconButtonComponent } from '../../index.js';

describe('IconButton component', () => {
  before(() => {
    defineComponents(IgcIconButtonComponent);
  });

  const DIFF_OPTIONS = {
    ignoreChildren: ['a'],
    ignoreAttributes: ['aria-label', 'aria-disabled', 'part', 'role', 'style'],
  };
  let el: IgcIconButtonComponent;

  describe('', () => {
    beforeEach(async () => {
      el = await createIconButtonComponent();
    });

    it('renders a button element internally', async () => {
      await expect(el).shadowDom.to.be.accessible();
      expect(el).shadowDom.to.equal(
        `<button type="button"><slot></slot></button>`,
        {
          ignoreAttributes: [
            'variant',
            'aria-label',
            'aria-disabled',
            'aria-hidden',
            'part',
            'role',
          ],
        }
      );
    });

    it('renders an anchor element internally', async () => {
      el.href = 'https://test.com';
      await elementUpdated(el);

      await expect(el).shadowDom.to.be.accessible();
      expect(el).shadowDom.to.equal('<a><slot></slot></a>', {
        ignoreAttributes: [
          'variant',
          'aria-label',
          'aria-disabled',
          'aria-hidden',
          'part',
          'role',
          'href',
        ],
      });
    });

    it('is created with the proper default values', async () => {
      expect(el.name).to.be.undefined;
      expect(el.collection).to.be.undefined;
      expect(el.mirrored).to.equal(false);
      expect(el.variant).to.equal('contained');
      expect(el.href).to.be.undefined;
      expect(el.download).to.be.undefined;
      expect(el.target).to.be.undefined;
      expect(el.rel).to.be.undefined;
      expect(el.disabled).to.equal(false);
    });

    it('sets name and collection properties successfully', async () => {
      el.name = 'biking';
      el.collection = 'default';
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button type="button">
          <igc-icon name="${el.name}" collection="${el.collection}"></igc-icon>
          <slot></slot>
        </button>`,
        {
          ignoreAttributes: [
            'variant',
            'aria-label',
            'aria-disabled',
            'aria-hidden',
            'part',
            'role',
          ],
        }
      );
    });

    it('sets mirrored property successfully', async () => {
      el.mirrored = true;
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button type="button">
          <igc-icon mirrored></igc-icon>
          <slot></slot>
        </button>`,
        {
          ignoreAttributes: [
            'variant',
            'aria-label',
            'aria-disabled',
            'aria-hidden',
            'part',
            'role',
          ],
        }
      );
    });

    it('sets href property successfully', async () => {
      el.href = 'https://test.com';
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(`<a href="${el.href}" />`, DIFF_OPTIONS);
    });

    it('sets rel property successfully', async () => {
      el.href = 'https://test.com';
      el.rel = 'test';
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<a href="${el.href}" rel="${el.rel}" />`,
        DIFF_OPTIONS
      );
    });

    it('sets target property successfully', async () => {
      el.href = 'https://test.com';
      el.target = '_parent';
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<a href="${el.href}" target="${el.target}" />`,
        DIFF_OPTIONS
      );
    });

    it('sets download property successfully', async () => {
      el.href = 'https://test.com';
      el.download = 'test';
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<a href="${el.href}" download="${el.download}" />`,
        DIFF_OPTIONS
      );
    });

    it('sets the disabled property successfully', async () => {
      el.disabled = true;
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button type="button" disabled>
          <slot>
          </slot>
        </button>`,
        {
          ignoreAttributes: [
            'aria-label',
            'aria-hidden',
            'part',
            'role',
            'variant',
          ],
        }
      );
    });
  });

  it('applies all anchor specific properties to the wrapped base element', async () => {
    el = await createIconButtonComponent(
      `<igc-icon-button
      name="biking"
      collection="default"
      variant="contained"
      href="https://test.com"
      target="_blank"
      download="test"
      rel="test">
      Submit
      </igc-icon-button>`
    );
    expect(el).shadowDom.to.equal(
      `<a href="https://test.com" target="_blank" download="test" rel="test">
        <igc-icon name="biking" collection="default"></igc-icon>
      </a>`,
      DIFF_OPTIONS
    );
  });
  const createIconButtonComponent = (
    template = '<igc-icon-button aria-label="Icon button"/>'
  ) => {
    return fixture<IgcIconButtonComponent>(html`${unsafeStatic(template)}`);
  };
});

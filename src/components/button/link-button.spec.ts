import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import '../../../igniteui-webcomponents'; // Obligatory
import { classValue } from './button-base.spec';
import { IgcLinkButtonComponent } from './link-button';

describe('LinkButton component', () => {
  const DIFF_OPTIONS = {
    ignoreChildren: ['a'],
    ignoreAttributes: ['aria-disabled', 'part', 'role'],
  };
  let el: IgcLinkButtonComponent;

  describe('', () => {
    beforeEach(async () => {
      el = await createLinkButtonComponent();
    });

    it('renders an anchor element successfully', async () => {
      expect(el).shadowDom.to.be.accessible();
      expect(el).shadowDom.to.equal(
        `<a aria-disabled="false" class="${classValue(
          `flat large`
        )}" part="native" role="button"/>`,
        { ignoreChildren: ['a'] }
      );
    });

    it('renders the prefix, content and suffix slots successfully', async () => {
      expect(el).shadowDom.to.equal(`<a aria-disabled="false"
        class="${classValue(`flat large`)}" part="native" role="button">
        <span part="prefix"><slot name="prefix"></slot>
        </span><slot></slot>
        <span part="suffix"><slot name="suffix"></slot></span>
      </a>`);
    });

    it('is created with the proper default values', async () => {
      expect(el.href).to.be.undefined;
      expect(el.rel).to.be.undefined;
      expect(el.target).to.be.undefined;
      expect(el.download).to.be.undefined;
    });

    it('sets href property successfully', async () => {
      el.href = '../test';
      expect(el.href).to.equal('../test');
      await elementUpdated(el);
      expect(el).shadowDom.to.equal(
        `<a class="${classValue(`large flat`)}" href="../test" />`,
        DIFF_OPTIONS
      );

      el.href = '';
      expect(el.href).to.equal('');
    });

    it('sets rel property successfully', async () => {
      el.rel = 'test';
      expect(el.rel).to.equal('test');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<a class="${classValue(`large flat`)}" rel="test" />`,
        DIFF_OPTIONS
      );
    });

    it('sets target property successfully', async () => {
      el.target = '_parent';
      expect(el.target).to.equal('_parent');
      await elementUpdated(el);
      expect(el).shadowDom.to.equal(
        `<a class="${classValue(`large flat`)}" target="_parent" />`,
        DIFF_OPTIONS
      );
      el.target = undefined;
      expect(el.target).to.be.undefined;
    });

    it('sets download property successfully', async () => {
      el.download = 'test';
      expect(el.download).to.equal('test');
      await elementUpdated(el);
      expect(el).shadowDom.to.equal(
        `<a class="${classValue(`large flat`)}" download="test" />`,
        DIFF_OPTIONS
      );
    });
  });

  describe('applies the correct CSS class to the native element for variant', () => {
    const variants = ['flat', 'raised', 'outlined', 'fab'];

    variants.forEach((variant) => {
      it(variant, async () => {
        el = await createLinkButtonComponent(
          `<igc-link-button variant="${variant}"/>`
        );
        expect(el).shadowDom.to.equal(
          `<a class="${classValue(`large ${variant}`)}"/>`,
          DIFF_OPTIONS
        );
      });
    });
  });

  describe('applies the correct CSS class to the native element for size', () => {
    const sizes = ['small', 'medium', 'large'];
    sizes.forEach((size) => {
      it(size, async () => {
        el = await createLinkButtonComponent(
          `<igc-link-button size="${size}" />`
        );
        expect(el).shadowDom.to.equal(
          `<a class="${classValue(`flat ${size}`)}"/>`,
          DIFF_OPTIONS
        );
      });
    });
  });
  it('applies the correct CSS class to the native element when link button is disabled', async () => {
    el = await createLinkButtonComponent(`<igc-link-button disabled="true"/>`);
    expect(el).shadowDom.to.equal(
      `<a class="${classValue(`disabled flat large`)}"/>`,
      DIFF_OPTIONS
    );
  });

  it('applies all anchor specific properties to the wrapped native element', async () => {
    el = await createLinkButtonComponent(
      `<igc-link-button variant="raised" size="medium" href="test" target="_blank" download="test" rel="test">Submit<igc-link-button>`
    );
    expect(el).shadowDom.to.equal(
      `<a class="${classValue(
        `medium raised`
      )}" href="test" target="_blank" download="test" rel="test"/>`,
      DIFF_OPTIONS
    );
  });

  const createLinkButtonComponent = (template = '<igc-link-button/>') => {
    return fixture<IgcLinkButtonComponent>(html`${unsafeStatic(template)}`);
  };
});

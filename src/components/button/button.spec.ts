import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import '../../../igniteui-webcomponents';
import { IgcButtonComponent } from './button';
import { classValue } from './button-base.spec';

describe('Button component', () => {
  const DIFF_OPTIONS = {
    ignoreChildren: ['button'],
    ignoreAttributes: ['part'],
  };
  let el: IgcButtonComponent;

  describe('', () => {
    beforeEach(async () => {
      el = await createButtonComponent();
    });

    it('renders a button element successfully', async () => {
      expect(el).shadowDom.to.be.accessible();
      expect(el).shadowDom.to.equal(`<button/>`, {
        ignoreChildren: ['button'],
        ignoreAttributes: ['class', 'part'],
      });
    });

    it('renders the prefix, content and suffix slots successfully', async () => {
      expect(el).shadowDom.to.equal(`<button class="${classValue(
        'flat large'
      )}" part="native">
      <span part="prefix">
        <slot name="prefix"></slot>
      </span>
      <slot></slot>
      <span part="suffix">
        <slot name="suffix"></slot>
      </span>
      </button>`);
    });

    it('sets type property successfully', async () => {
      el.type = 'reset';
      expect(el.type).to.equal('reset');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue('flat large')}" type="reset"/>`,
        DIFF_OPTIONS
      );

      el.type = 'submit';
      expect(el.type).to.equal('submit');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue('flat large')}" type="submit"/>`,
        DIFF_OPTIONS
      );

      el.type = 'button';
      expect(el.type).to.equal('button');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue('flat large')}" type="button"/>`,
        DIFF_OPTIONS
      );
    });
  });

  describe('applies the correct CSS class to the native element for variant', () => {
    const variants = ['flat', 'raised', 'outlined', 'fab'];

    variants.forEach((variant) => {
      it(variant, async () => {
        el = await createButtonComponent(`<igc-button variant="${variant}"/>`);
        expect(el).shadowDom.to.equal(
          `<button class="${classValue(`large ${variant}`)}"/>`,
          DIFF_OPTIONS
        );
      });
    });
  });

  describe('applies the correct CSS class to the native element for size', () => {
    const sizes = ['small', 'medium', 'large'];
    sizes.forEach((size) => {
      it(size, async () => {
        el = await createButtonComponent(`<igc-button size="${size}" />`);
        expect(el).shadowDom.to.equal(
          `<button class="${classValue(`flat ${size}`)}"/>`,
          DIFF_OPTIONS
        );
      });
    });
  });
  it('applies the correct CSS class to the native element when button is disabled', async () => {
    el = await createButtonComponent(`<igc-button disabled="true"/>`);
    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`disabled flat large`)}" disabled/>`,
      DIFF_OPTIONS
    );
  });

  it('applies all button specific properties to the wrapped native element', async () => {
    el = await createButtonComponent(
      `<igc-button type="submit" variant="raised" size="medium">Submit<igc-button>`
    );
    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`medium raised`)}" type="submit" />`,
      DIFF_OPTIONS
    );
  });

  const createButtonComponent = (template = '<igc-button/>') => {
    return fixture<IgcButtonComponent>(html`${unsafeStatic(template)}`);
  };
});

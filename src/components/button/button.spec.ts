import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import { default as IgcButtonComponent } from './button';

export const DEFAULT_CLASSES = 'native';
export const classValue = (changeableValue: string) => {
  return `${changeableValue} ${DEFAULT_CLASSES}`;
};

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

    it('is initialized with the proper default values', async () => {
      expect(el.disabled).to.equal(false);
      expect(el.variant).to.equal('flat');
      expect(el.dir).to.equal('');

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`large flat`)}"/>`,
        DIFF_OPTIONS
      );
    });

    it('changes size property values successfully', async () => {
      el.size = 'medium';
      expect(el.size).to.equal('medium');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`medium flat`)}"/>`,
        DIFF_OPTIONS
      );

      el.size = 'small';
      expect(el.size).to.equal('small');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`small flat`)}"/>`,
        DIFF_OPTIONS
      );

      el.size = 'large';
      expect(el.size).to.equal('large');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`large flat`)}"/>`,
        DIFF_OPTIONS
      );
    });

    it('sets disabled property successfully', async () => {
      el.disabled = true;
      expect(el.disabled).to.be.true;
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`disabled large flat`)}" disabled/>`,
        DIFF_OPTIONS
      );

      el.disabled = false;
      expect(el.disabled).to.be.false;
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`large flat`)}"/>`,
        DIFF_OPTIONS
      );
    });

    it('sets variant property successfully', async () => {
      el.variant = 'contained';
      expect(el.variant).to.equal('contained');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`large contained`)}"/>`,
        DIFF_OPTIONS
      );

      el.variant = 'outlined';
      expect(el.variant).to.equal('outlined');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`large outlined`)}"/>`,
        DIFF_OPTIONS
      );

      el.variant = 'fab';
      expect(el.variant).to.equal('fab');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`large fab`)}"/>`,
        DIFF_OPTIONS
      );

      el.variant = 'flat';
      expect(el.variant).to.equal('flat');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`large flat`)}"/>`,
        DIFF_OPTIONS
      );
    });

    it('should focus/blur the wrapped base element when the methods are called', () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.focus();

      const btn = el.shadowRoot?.children[0];
      expect(el.shadowRoot?.activeElement).to.equal(btn);
      expect(eventSpy).calledOnceWithExactly('igcFocus');

      el.blur();

      expect(el.shadowRoot?.activeElement).to.be.null;
      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWithExactly('igcBlur');
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
      )}" part="base">
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

  describe('applies the correct CSS class to the base element for variant', () => {
    const variants = ['flat', 'contained', 'outlined', 'fab'];

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

  describe('applies the correct CSS class to the base element for size', () => {
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

  it('applies the correct CSS class to the base element when button is disabled', async () => {
    el = await createButtonComponent(`<igc-button disabled="true"/>`);
    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`disabled flat large`)}" disabled/>`,
      DIFF_OPTIONS
    );
  });

  it('applies all button specific properties to the wrapped base element', async () => {
    el = await createButtonComponent(
      `<igc-button type="submit" variant="contained" size="medium">Submit<igc-button>`
    );
    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`medium contained`)}" type="submit" />`,
      DIFF_OPTIONS
    );
  });

  const createButtonComponent = (template = '<igc-button/>') => {
    return fixture<IgcButtonComponent>(html`${unsafeStatic(template)}`);
  };
});

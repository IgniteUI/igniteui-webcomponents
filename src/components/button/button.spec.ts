import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents, IgcButtonComponent } from '../../index.js';

// export const DEFAULT_CLASSES = 'native';
export const classValue = (changeableValue: string) => {
  return `${changeableValue}`;
};

describe('Button component', () => {
  before(() => {
    defineComponents(IgcButtonComponent);
  });

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
      expect(el.variant).to.equal('contained');
      expect(el.dir).to.equal('');

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`medium contained`)}"/>`,
        DIFF_OPTIONS
      );
    });

    it('changes size property values successfully', async () => {
      el.size = 'medium';
      expect(el.size).to.equal('medium');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`medium contained`)}"/>`,
        DIFF_OPTIONS
      );

      el.size = 'small';
      expect(el.size).to.equal('small');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`small contained`)}"/>`,
        DIFF_OPTIONS
      );

      el.size = 'large';
      expect(el.size).to.equal('large');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`large contained`)}"/>`,
        DIFF_OPTIONS
      );
    });

    it('sets disabled property successfully', async () => {
      el.disabled = true;
      expect(el.disabled).to.be.true;
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`disabled medium contained`)}" disabled/>`,
        DIFF_OPTIONS
      );

      el.disabled = false;
      expect(el.disabled).to.be.false;
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`medium contained`)}"/>`,
        DIFF_OPTIONS
      );
    });

    it('sets variant property successfully', async () => {
      el.variant = 'contained';
      expect(el.variant).to.equal('contained');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`medium contained`)}"/>`,
        DIFF_OPTIONS
      );

      el.variant = 'outlined';
      expect(el.variant).to.equal('outlined');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`medium outlined`)}"/>`,
        DIFF_OPTIONS
      );

      el.variant = 'fab';
      expect(el.variant).to.equal('fab');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`medium fab`)}"/>`,
        DIFF_OPTIONS
      );

      el.variant = 'flat';
      expect(el.variant).to.equal('flat');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue(`medium flat`)}"/>`,
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
      await expect(el).shadowDom.to.be.accessible();
      expect(el).shadowDom.to.equal(`<button/>`, {
        ignoreChildren: ['button'],
        ignoreAttributes: ['class', 'part'],
      });
    });

    it('renders the prefix, content and suffix slots successfully', async () => {
      expect(el).shadowDom.to.equal(
        `<button class="${classValue('contained medium')}" part="base">
      <span part="prefix">
        <slot name="prefix"></slot>
      </span>
      <slot></slot>
      <span part="suffix">
        <slot name="suffix"></slot>
      </span>
      </button>`,
        { ignoreAttributes: ['hidden'] }
      );
    });

    it('sets type property successfully', async () => {
      el.type = 'reset';
      expect(el.type).to.equal('reset');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue('contained medium')}" type="reset"/>`,
        DIFF_OPTIONS
      );

      el.type = 'submit';
      expect(el.type).to.equal('submit');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue('contained medium')}" type="submit"/>`,
        DIFF_OPTIONS
      );

      el.type = 'button';
      expect(el.type).to.equal('button');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<button class="${classValue('contained medium')}" type="button"/>`,
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
          `<button class="${classValue(`medium ${variant}`)}"/>`,
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
          `<button class="${classValue(`contained ${size}`)}"/>`,
          DIFF_OPTIONS
        );
      });
    });
  });

  it('applies the correct CSS class to the base element when button is disabled', async () => {
    el = await createButtonComponent(`<igc-button disabled="true"/>`);
    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`disabled contained medium`)}" disabled/>`,
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

  const createButtonComponent = (
    template = '<igc-button>Click</igc-button>'
  ) => {
    return fixture<IgcButtonComponent>(html`${unsafeStatic(template)}`);
  };
});

describe('LinkButton component', () => {
  const DIFF_OPTIONS = {
    ignoreChildren: ['a'],
    ignoreAttributes: ['aria-disabled', 'part', 'role'],
  };
  let el: IgcButtonComponent;

  describe('', () => {
    beforeEach(async () => {
      el = await createLinkButtonComponent();
    });

    it('renders an anchor element successfully', async () => {
      await expect(el).shadowDom.to.be.accessible();
      expect(el).shadowDom.to.equal(
        `<a aria-disabled="false" class="${classValue(
          `contained medium`
        )}" href="/" part="base" role="button"/>`,
        { ignoreChildren: ['a'] }
      );
    });

    it('renders the prefix, content and suffix slots successfully', async () => {
      expect(el).shadowDom.to.equal(
        `<a aria-disabled="false"
        class="${classValue(
          `contained medium`
        )}" href="/" part="base" role="button">
        <span part="prefix"><slot name="prefix"></slot>
        </span><slot></slot>
        <span part="suffix"><slot name="suffix"></slot></span>
      </a>`,
        { ignoreAttributes: ['hidden'] }
      );
    });

    it('is created with the proper default values', async () => {
      expect(el.rel).to.be.undefined;
      expect(el.target).to.be.undefined;
      expect(el.download).to.be.undefined;
    });

    it('sets href property successfully', async () => {
      el.href = '../test';
      expect(el.href).to.equal('../test');
      await elementUpdated(el);
      expect(el).shadowDom.to.equal(
        `<a class="${classValue(`medium contained`)}" href="../test" />`,
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
        `<a class="${classValue(`medium contained`)}" href="/" rel="test" />`,
        DIFF_OPTIONS
      );
    });

    it('sets target property successfully', async () => {
      el.target = '_parent';
      expect(el.target).to.equal('_parent');
      await elementUpdated(el);
      expect(el).shadowDom.to.equal(
        `<a class="${classValue(
          `medium contained`
        )}" href="/" target="_parent"/>`,
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
        `<a class="${classValue(
          `medium contained`
        )}" href="/" download="test"/>`,
        DIFF_OPTIONS
      );
    });
  });

  describe('applies the correct CSS class to the base element for variant', () => {
    const variants = ['flat', 'contained', 'outlined', 'fab'];

    variants.forEach((variant) => {
      it(variant, async () => {
        el = await createLinkButtonComponent(
          `<igc-button href="/" variant="${variant}"/>`
        );
        expect(el).shadowDom.to.equal(
          `<a class="${classValue(`medium ${variant}`)}" href="/"/>`,
          DIFF_OPTIONS
        );
      });
    });
  });

  describe('applies the correct CSS class to the base element for size', () => {
    const sizes = ['small', 'medium', 'large'];
    sizes.forEach((size) => {
      it(size, async () => {
        el = await createLinkButtonComponent(
          `<igc-button href="/" size="${size}" />`
        );
        expect(el).shadowDom.to.equal(
          `<a class="${classValue(`contained ${size}`)}" href="/"/>`,
          DIFF_OPTIONS
        );
      });
    });
  });
  it('applies the correct CSS class to the base element when link button is disabled', async () => {
    el = await createLinkButtonComponent(
      `<igc-button href="/" disabled="true"/>`
    );
    expect(el).shadowDom.to.equal(
      `<a class="${classValue(`disabled contained medium`)}" href="/"/>`,
      DIFF_OPTIONS
    );
  });

  it('applies all anchor specific properties to the wrapped base element', async () => {
    el = await createLinkButtonComponent(
      `<igc-button variant="contained" size="medium" href="test" target="_blank" download="test" rel="test">Submit<igc-button>`
    );
    expect(el).shadowDom.to.equal(
      `<a class="${classValue(
        `medium contained`
      )}" href="test" target="_blank" download="test" rel="test"/>`,
      DIFF_OPTIONS
    );
  });

  const createLinkButtonComponent = (
    template = '<igc-button href="/">Click</igc-button>'
  ) => {
    return fixture<IgcButtonComponent>(html`${unsafeStatic(template)}`);
  };
});

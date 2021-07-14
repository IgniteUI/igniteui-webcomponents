import { expect, fixture, html, unsafeStatic } from '@open-wc/testing';
import '../../../igniteui-webcomponents'; // Obligatory
import { IgcButtonComponent } from './button';

describe('Button component', () => {
  const DIFF_OPTIONS = {
    ignoreChildren: ['button'],
    ignoreAttributes: ['part'],
  };
  let el: IgcButtonComponent;

  describe('', () => {
    before(async () => {
      el = await createButtonComponent();
    });

    it('renders a button element successfully', async () => {
      console.log(el);
      expect(el).shadowDom.to.be.accessible();
      expect(el).shadowDom.to.equal(`<button/>`, {
        ignoreChildren: ['button'],
        ignoreAttributes: ['class', 'part'],
      });
    });

    it('renders the prefix, content and suffix slots successfully', async () => {
      expect(el).shadowDom.to.equal(`<button class="flat large" part="native">
      <span part="prefix">
        <slot name="prefix"></slot>
      </span>
      <slot></slot>
      <span part="suffix">
        <slot name="suffix"></slot>
      </span>
      </button>`);
    });

    it('sets direction property successfully', async () => {
      el.dir = 'rtl';
      expect(el.dir).to.equal('rtl');
    });
  });

  describe('applies the correct CSS class to the native element for variant', () => {
    const variants = ['flat', 'raised', 'outlined', 'fab'];

    variants.forEach((variant) => {
      it(variant, async () => {
        el = await createButtonComponent(`<igc-button variant="${variant}"/>`);
        expect(el).shadowDom.to.equal(
          `<button class="large ${variant}"/>`,
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
          `<button class="flat ${size}"/>`,
          DIFF_OPTIONS
        );
      });
    });
  });
  it('applies the correct CSS class to the native element when button is disabled', async () => {
    el = await createButtonComponent(`<igc-button disabled="true"/>`);
    expect(el).shadowDom.to.equal(
      `<button class="disabled flat large" disabled/>`,
      DIFF_OPTIONS
    );
    console.log(el.shadowRoot?.children[0]);
  });

  it('applies all button specific properties to the wrapped native element', async () => {
    el = await createButtonComponent(
      `<igc-button type="submit" variant="raised" size="medium">Submit<igc-button>`
    );
    expect(el).shadowDom.to.equal(
      `<button class="medium raised" type="submit" />`,
      DIFF_OPTIONS
    );
  });

  it.skip('should focus/blur the wrapped native element when the methods are called', async () => {
    el = await createButtonComponent(`<igc-button>Submit</igc-button>`);
    el.focus();

    const btn = el.shadowRoot?.children[0];
    expect(el.shadowRoot?.activeElement).to.equal(btn);

    el.blur();
    expect(el.shadowRoot?.activeElement).not.to.equal(btn);
  });

  const createButtonComponent = (template = '<igc-button/>') => {
    return fixture<IgcButtonComponent>(html`${unsafeStatic(template)}`);
  };
});

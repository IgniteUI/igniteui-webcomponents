import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { FormAssociatedTestBed } from '../common/utils.spec.js';
import IgcButtonComponent from './button.js';

const Variants: Array<IgcButtonComponent['variant']> = [
  'contained',
  'fab',
  'flat',
  'outlined',
];
const Types: Array<IgcButtonComponent['type']> = ['button', 'reset', 'submit'];

describe('Button tests', () => {
  let button: IgcButtonComponent;
  before(() => defineComponents(IgcButtonComponent));

  describe('Button component', () => {
    const ignored_DOM_parts = {
      ignoreChildren: ['button'],
      ignoreAttributes: ['part'],
    };

    beforeEach(async () => {
      button = await fixture<IgcButtonComponent>(
        html`<igc-button>Click</igc-button>`
      );
    });

    it('is initialized with sensible default values', async () => {
      expect([button.disabled, button.variant]).to.eql([false, 'contained']);
      expect(button).shadowDom.to.equal(
        `<button type="${button.type}"></button>`,
        ignored_DOM_parts
      );
    });

    it('is accessible', async () => {
      await expect(button).to.be.accessible();
      await expect(button).shadowDom.to.be.accessible();
    });

    it('reflects disabled property', async () => {
      button.disabled = true;
      await elementUpdated(button);

      expect(button).shadowDom.to.equal(
        `<button disabled type="${button.type}"></button>`,
        ignored_DOM_parts
      );
    });

    it('reflects variant property', async () => {
      for (const variant of Variants) {
        button.variant = variant;
        await elementUpdated(button);

        expect(button).attribute('variant').to.equal(variant);
        expect(button).shadowDom.to.equal(
          `<button type="${button.type}"></button>`,
          ignored_DOM_parts
        );
      }
    });

    it('reflects type property', async () => {
      for (const type of Types) {
        button.type = type;
        await elementUpdated(button);

        expect(button).attribute('type').to.equal(type);
        expect(button).shadowDom.to.equal(
          `<button type="${type}"></button>`,
          ignored_DOM_parts
        );
      }
    });

    it('has the correct shadow DOM structure', async () => {
      expect(button).shadowDom.to.equal(
        `<button part="base" type="${button.type}">
          <slot name="prefix"></slot>
          <slot></slot>
          <slot name="suffix"></slot>
        </button>`
      );
    });
  });

  describe('Link button', () => {
    const ignored_DOM_parts = {
      ignoreChildren: ['a'],
      ignoreAttributes: ['part', 'aria-disabled'],
    };

    beforeEach(async () => {
      button = await fixture<IgcButtonComponent>(
        html`<igc-button href="/">Click</igc-button>`
      );
    });

    it('is initialized with sensible default values', async () => {
      const { disabled, download, target, rel, variant } = button;

      expect([disabled, variant, download, target, rel]).to.eql([
        false,
        'contained',
        undefined,
        undefined,
        undefined,
      ]);

      expect(button).shadowDom.to.equal(
        `<a
          role="button"
          href="${button.href}"
        >
        </a>`,
        ignored_DOM_parts
      );
    });

    it('is accessible', async () => {
      await expect(button).to.be.accessible();
      await expect(button).shadowDom.to.be.accessible();
    });

    it('reflects disabled property', async () => {
      button.disabled = true;
      await elementUpdated(button);

      expect(button).shadowDom.to.equal(
        `<a
          aria-disabled="${button.disabled}"
          href="/"
          role="button"
        >
        </a>`,
        ignored_DOM_parts
      );
    });

    it('reflects variant property', async () => {
      for (const variant of Variants) {
        button.variant = variant;
        await elementUpdated(button);

        expect(button).attribute('variant').to.equal(variant);
        expect(button).shadowDom.to.equal(
          `<a
            role="button"
            href="/"
          >
          </a>`,
          ignored_DOM_parts
        );
      }
    });

    it('reflects link properties', async () => {
      const rel = 'dns-prefetch';
      const href = '/downloads/entity';
      const download = 'file.txt';
      const target = '_blank';

      Object.assign(button, { rel, download, target, href });
      await elementUpdated(button);

      expect(button).shadowDom.to.equal(
        `<a
          aria-disabled="${button.disabled}"
          rel="${rel}" download="${download}"
          target="${target}"
          href="${href}"
          role="button"
        >
        </a>`,
        ignored_DOM_parts
      );
    });

    it('has the correct shadow DOM structure', async () => {
      expect(button).shadowDom.to.equal(
        `<a part="base" href="/" role="button">
          <slot name="prefix"></slot>
          <slot></slot>
          <slot name="suffix"></slot>
        </a>`,
        ignored_DOM_parts
      );
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      button = await fixture<IgcButtonComponent>(
        html`<igc-button>Click</igc-button>`
      );
    });

    it('focus/blur events are emitted from corresponding methods', async () => {
      const eventSpy = spy(button, 'emitEvent');

      button.focus();
      expect(eventSpy).calledOnceWithExactly('igcFocus');
      expect(button.shadowRoot?.activeElement).to.equal(
        button.shadowRoot?.querySelector('button')
      );

      eventSpy.resetHistory();

      button.blur();
      expect(eventSpy).calledOnceWithExactly('igcBlur');
      expect(button.shadowRoot?.activeElement).to.be.null;
    });
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed(
      html`<input type="text" name="username" value="John Doe" />
        <igc-button type="submit">Submit</igc-button>`
    );

    beforeEach(async () => await spec.setup(IgcButtonComponent.tagName));

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('submits the associated form', async () => {
      const button = spec.element as unknown as IgcButtonComponent;

      const handler = (event: SubmitEvent) => {
        event.preventDefault();
        expect(
          new FormData(event.target as HTMLFormElement).get('username')
        ).to.equal('John Doe');
      };

      spec.form.addEventListener('submit', handler, { once: true });
      button.click();
    });

    it('resets the associated form', async () => {
      const button = spec.element as unknown as IgcButtonComponent;
      const input = spec.form.querySelector('input') as HTMLInputElement;

      input.value = 'Jane Doe';
      button.type = 'reset';
      await elementUpdated(button);

      button.click();
      expect(input.value).to.equal('John Doe');
    });

    it('reflects disabled ancestor state', async () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });
  });
});

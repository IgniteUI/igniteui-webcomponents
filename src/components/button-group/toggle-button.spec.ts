import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';

import { defineComponents, IgcToggleButtonComponent } from '../../index.js';

describe('Toggle Button', () => {
  before(() => {
    defineComponents(IgcToggleButtonComponent);
  });

  const DIFF_OPTIONS = {
    ignoreChildren: ['button'],
    ignoreAttributes: ['part', 'type', 'aria-pressed', 'aria-disabled'],
  };

  let button: IgcToggleButtonComponent;

  describe('', () => {
    beforeEach(async () => {
      button = await createButtonComponent();
    });

    it('passes the a11y audit', async () => {
      await expect(button).to.be.accessible();
      await expect(button).shadowDom.to.be.accessible();
    });

    it('is correctly rendered', () => {
      expect(button).shadowDom.to.equal(
        '<button><slot></slot></button>',
        DIFF_OPTIONS
      );
    });

    it('is correctly initialized with its default component state', () => {
      expect(button.value).to.be.undefined;
      expect(button.selected).to.be.false;
      expect(button.disabled).to.be.false;
      expect(button.ariaLabel).to.be.null;
      expect(button.dir).to.be.empty;
    });

    it('should render proper attributes', () => {
      const buttonElement = button.shadowRoot?.querySelector('button');

      expect(buttonElement).not.to.be.null;
      expect(buttonElement).to.have.attribute('part', 'toggle');
      expect(buttonElement).to.have.attribute('type', 'button');
      expect(buttonElement).to.have.attribute('aria-pressed', 'false');
      expect(buttonElement).to.have.attribute('aria-disabled', 'false');
    });

    it('sets `value` property successfully', async () => {
      button = await createButtonComponent(`
        <igc-toggle-button value="button-1">Click</igc-toggle-button>`);

      expect(button.value).to.equal('button-1');
    });

    it('sets `selected` property successfully', async () => {
      button = await createButtonComponent(`
        <igc-toggle-button selected>Click</igc-toggle-button>`);

      expect(button.selected).to.be.true;

      button.selected = false;
      await elementUpdated(button);

      expect(button.selected).to.be.false;
      expect(button).dom.to.equal(
        '<igc-toggle-button>Click</igc-toggle-button>'
      );

      button.selected = true;
      await elementUpdated(button);

      expect(button.selected).to.be.true;
      expect(button).dom.to.equal(
        '<igc-toggle-button selected>Click</igc-toggle-button>'
      );
    });

    it('sets `disabled` property successfully', async () => {
      button = await createButtonComponent(`
        <igc-toggle-button disabled>Click</igc-toggle-button>`);

      expect(button.disabled).to.be.true;
      expect(button).shadowDom.to.equal('<button disabled />', DIFF_OPTIONS);

      button.disabled = false;
      await elementUpdated(button);

      expect(button.disabled).to.be.false;
      expect(button).dom.to.equal(
        '<igc-toggle-button>Click</igc-toggle-button>'
      );
      expect(button).shadowDom.to.equal('<button />', DIFF_OPTIONS);

      button.disabled = true;
      await elementUpdated(button);

      expect(button.disabled).to.be.true;
      expect(button).dom.to.equal(
        '<igc-toggle-button disabled>Click</igc-toggle-button>'
      );
      expect(button).shadowDom.to.equal('<button disabled />', DIFF_OPTIONS);
    });

    it('sets `aria-label` successfully', async () => {
      button = await createButtonComponent(`
        <igc-toggle-button aria-label="button-1">Click</igc-toggle-button>`);

      expect(button.ariaLabel).to.equal('button-1');
      expect(button).shadowDom.to.equal(
        `<button aria-label="button-1" />`,
        DIFF_OPTIONS
      );
    });

    it('should focus when the focus method is called', async () => {
      button.focus();
      await elementUpdated(button);

      expect(document.activeElement).to.equal(button);

      const buttonElement = button.shadowRoot?.children[0];
      expect(button.shadowRoot?.activeElement).to.equal(buttonElement);
    });

    it('should blur when the blur method is called', async () => {
      button.focus();
      await elementUpdated(button);

      button.blur();
      await elementUpdated(button);

      expect(document.activeElement).to.not.equal(button);
      expect(button.shadowRoot?.activeElement).to.be.null;
    });

    it('should simulate a mouse click when the click method is called', async () => {
      expect(button.selected).to.be.false;

      button.addEventListener('click', () => {
        button.selected = true;
      });

      button.click();
      await elementUpdated(button);

      expect(button.selected).to.be.true;
    });
  });

  const createButtonComponent = (
    template = '<igc-toggle-button>Click</igc-toggle-button>'
  ) => {
    return fixture<IgcToggleButtonComponent>(html`${unsafeStatic(template)}`);
  };
});

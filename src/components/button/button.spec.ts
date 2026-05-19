import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  isFocused,
} from '../common/utils.spec.js';
import IgcInputComponent from '../input/input.js';
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
  before(() => defineComponents(IgcButtonComponent, IgcInputComponent));

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
    let nativeButton: HTMLButtonElement;

    beforeEach(async () => {
      button = await fixture<IgcButtonComponent>(
        html`<igc-button>Click</igc-button>`
      );
      nativeButton = button.renderRoot.querySelector('button')!;
    });

    it('should have correct focus states between Light/Shadow DOM', async () => {
      button.focus();
      expect(isFocused(button)).to.be.true;
      expect(isFocused(nativeButton)).to.be.true;

      button.blur();
      expect(isFocused(button)).to.be.false;
      expect(isFocused(nativeButton)).to.be.false;
    });
  });

  describe('Invoker Commands API', () => {
    describe('Attribute and property wiring', () => {
      it('reflects the command attribute on the native button', async () => {
        button = await fixture<IgcButtonComponent>(
          html`<igc-button command="toggle-popover">Click</igc-button>`
        );
        const nativeButton = button.renderRoot.querySelector('button')!;

        expect(nativeButton).attribute('command').to.equal('toggle-popover');
      });

      it('updates the command attribute when the property changes', async () => {
        button = await fixture<IgcButtonComponent>(
          html`<igc-button>Click</igc-button>`
        );
        const nativeButton = button.renderRoot.querySelector('button')!;

        button.command = 'show-popover';
        await elementUpdated(button);

        expect(nativeButton).attribute('command').to.equal('show-popover');
      });

      it('resolves commandForElement from a string ID to the referenced element', async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <igc-button commandfor="wiring-target">Click</igc-button>
            <div id="wiring-target" popover></div>
          </div>
        `);

        button = container.querySelector<IgcButtonComponent>('igc-button')!;
        const target = container.querySelector<HTMLElement>('#wiring-target')!;

        expect(button.commandForElement).to.equal(target);
      });

      it('accepts an Element reference for commandForElement', async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <igc-button>Click</igc-button>
            <div popover></div>
          </div>
        `);

        button = container.querySelector<IgcButtonComponent>('igc-button')!;
        const target = container.querySelector<HTMLElement>('[popover]')!;

        button.commandForElement = target;
        await elementUpdated(button);

        expect(button.commandForElement).to.equal(target);
      });
    });

    describe('Popover control', () => {
      let popover: HTMLElement;

      beforeEach(async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <igc-button command="toggle-popover" commandfor="test-popover">
              Toggle
            </igc-button>
            <div id="test-popover" popover>Popover content</div>
          </div>
        `);

        button = container.querySelector<IgcButtonComponent>('igc-button')!;
        popover = container.querySelector<HTMLElement>('[popover]')!;
      });

      it('toggles a native popover on repeated clicks', () => {
        expect(popover.matches(':popover-open')).to.be.false;

        button.click();
        expect(popover.matches(':popover-open')).to.be.true;

        button.click();
        expect(popover.matches(':popover-open')).to.be.false;
      });

      it('shows a closed native popover', async () => {
        button.command = 'show-popover';
        await elementUpdated(button);

        expect(popover.matches(':popover-open')).to.be.false;

        button.click();
        expect(popover.matches(':popover-open')).to.be.true;
      });

      it('hides a visible native popover', async () => {
        button.command = 'hide-popover';
        await elementUpdated(button);

        popover.showPopover();
        expect(popover.matches(':popover-open')).to.be.true;

        button.click();
        expect(popover.matches(':popover-open')).to.be.false;
      });
    });

    describe('Dialog control', () => {
      let dialog: HTMLDialogElement;

      beforeEach(async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <igc-button command="show-modal" commandfor="test-dialog">
              Open
            </igc-button>
            <dialog id="test-dialog">Dialog content</dialog>
          </div>
        `);

        button = container.querySelector<IgcButtonComponent>('igc-button')!;
        dialog = container.querySelector<HTMLDialogElement>('dialog')!;
      });

      afterEach(() => {
        // Ensure dialog is closed between tests to avoid InvalidStateError
        if (dialog.open) {
          dialog.close();
        }
      });

      it('opens a native dialog as modal', () => {
        expect(dialog.open).to.be.false;

        button.click();
        expect(dialog.open).to.be.true;
      });

      it('closes an open native dialog', async () => {
        dialog.showModal();
        expect(dialog.open).to.be.true;

        button.command = 'close';
        await elementUpdated(button);

        button.click();
        expect(dialog.open).to.be.false;
      });
    });
  });

  describe('Form integration', () => {
    let button: IgcButtonComponent;
    const spec = createFormAssociatedTestBed<IgcInputComponent>(html`
      <igc-input type="text" name="username" value="John Doe"></igc-input>
      <igc-button type="submit">Submit</igc-button>
    `);

    beforeEach(async () => {
      await spec.setup(IgcInputComponent.tagName);
      button = spec.form.querySelector(IgcButtonComponent.tagName)!;
    });

    it('is form associated', async () => {
      expect(button.form).to.equal(spec.form);
    });

    it('submits the associated form', async () => {
      const handler = (event: SubmitEvent) => {
        event.preventDefault();
        expect(new FormData(spec.form).get('username')).to.equal('John Doe');
      };

      spec.form.addEventListener('submit', handler, { once: true });
      button.click();
    });

    it('resets the associated form', async () => {
      spec.setProperties({ value: 'Jane Doe' });
      button.type = 'reset';

      button.click();
      expect(spec.element.value).to.equal('John Doe');
    });

    it('reflects disabled ancestor state', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;
      expect(button.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
      expect(button.disabled).to.be.false;
    });
  });
});

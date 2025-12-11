import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import IgcButtonComponent from '../button/button.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  elementUpdated,
  fixture,
  html,
  waitUntil,
} from '../common/helpers.spec.js';
import {
  eventMatch,
  expectCalledWith,
  expectNotCalledWith,
  simulateClick,
} from '../common/utils.spec.js';
import IgcDialogComponent from './dialog.js';

describe('Dialog', () => {
  beforeAll(() => {
    defineComponents(IgcDialogComponent);
  });

  let dialog: IgcDialogComponent;
  let nativeDialog: HTMLDialogElement;

  describe('WAI-ARIA', () => {
    it('is accessible (closed state)', async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );

      await expect(dialog).dom.to.be.accessible();
      await expect(dialog).shadowDom.to.be.accessible();
    });

    it('is accessible (open state)', async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog open></igc-dialog>`
      );

      await expect(dialog).does.to.not.be.accessible();
      await expect(dialog).shadowDom.to.not.be.accessible();

      dialog.title = 'Default dialog';
      await elementUpdated(dialog);

      await expect(dialog).does.to.be.accessible();
      await expect(dialog).shadowDom.to.be.accessible();
    });
  });

  describe('DOM', () => {
    const attributes = [
      'variant',
      'aria-label',
      'aria-disabled',
      'aria-hidden',
      'aria-labelledby',
      'part',
      'role',
      'id',
      'hidden',
      'open',
      'style',
    ];

    it('should render content inside the dialog', async () => {
      dialog = await fixture<IgcDialogComponent>(html`
        <igc-dialog>
          <span>Dialog content</span>
        </igc-dialog>
      `);

      await dialog.show();

      expect(dialog).dom.to.equal(
        `
        <igc-dialog>
          <span>
            Dialog content
          </span>
        </igc-dialog>`,
        { ignoreAttributes: attributes }
      );
    });

    it('`hide-default-action` is correctly applied', async () => {
      dialog = await fixture<IgcDialogComponent>(html`
        <igc-dialog hide-default-action>Message</igc-dialog>
      `);

      const footer = dialog.renderRoot.querySelector('footer')!;
      expect(footer).dom.to.equal(
        `<footer>
          <slot name="footer">
          </slot>
        </footer>`,
        {
          ignoreAttributes: ['part'],
        }
      );
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );
      nativeDialog = dialog.renderRoot.querySelector('dialog')!;
    });

    it('initialized with proper default values', async () => {
      expect(dialog.keepOpenOnEscape).to.equal(false);
      expect(dialog.closeOnOutsideClick).to.equal(false);
      expect(dialog.title).to.be.undefined;
      expect(dialog.open).to.equal(false);
      expect(dialog.returnValue).to.be.undefined;
      expect(nativeDialog.getAttribute('aria-labelledby')).to.equal(
        dialog.renderRoot.querySelector('header')?.id
      );
    });

    it('`show` opens the dialog', async () => {
      await dialog.show();
      expect(dialog.open).to.be.true;
    });

    it('`hide` closes the dialog', async () => {
      dialog.open = true;
      await elementUpdated(dialog);
      expect(dialog.open).to.be.true;

      await dialog.hide();
      expect(dialog.open).to.be.false;
    });

    it('`toggle` switches between open states', async () => {
      await dialog.toggle();
      expect(dialog.open).to.be.true;

      await dialog.toggle();
      expect(dialog.open).to.be.false;
    });

    it('has correct ARIA attributes', async () => {
      dialog.ariaLabel = 'Custom label';
      await dialog.show();

      expect(nativeDialog).attribute('aria-label').to.equal('Custom label');
      expect(nativeDialog).attribute('role').to.equal('dialog');
    });

    it('calling `show/hide` is a no-op for existing state', async () => {
      dialog.open = true;
      await elementUpdated(dialog);
      expect(await dialog.show()).to.be.false;

      dialog.open = false;
      await elementUpdated(dialog);
      expect(await dialog.hide()).to.be.false;
    });

    it('does not emit events through API calls', async () => {
      const spy = vi.spyOn(dialog, 'emitEvent');

      await dialog.show();
      expect(dialog.open).to.be.true;
      expect(spy.mock.calls).to.be.empty;

      await dialog.hide();
      expect(dialog.open).to.be.false;
      expect(spy.mock.calls).to.be.empty;

      dialog.open = false;
      await elementUpdated(dialog);

      expect(dialog.open).to.be.false;
      expect(spy.mock.calls).to.be.empty;
    });
  });

  describe('Events & Behaviors', () => {
    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );
      nativeDialog = dialog.renderRoot.querySelector('dialog')!;
    });

    it('should close the dialog when the user presses Escape', async () => {
      const spy = vi.spyOn(dialog, 'emitEvent');
      await dialog.show();

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(dialog);
      await waitUntil(() => !dialog.open);

      expect(spy.mock.calls).lengthOf(2);
      expect(spy).toHaveBeenNthCalledWith(1, 'igcClosing', {
        cancelable: true,
      });
      expect(spy).toHaveBeenNthCalledWith(2, 'igcClosed');
    });

    it('should not close the dialog when the user presses Escape and `keepOpenOnEscape` is set', async () => {
      const spy = vi.spyOn(dialog, 'emitEvent');

      dialog.keepOpenOnEscape = true;
      await dialog.show();

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
      expect(spy.mock.calls).to.be.empty;
    });

    it('default action button emits closing events', async () => {
      const spy = vi.spyOn(dialog, 'emitEvent');
      await dialog.show();

      simulateClick(
        dialog.renderRoot.querySelector(IgcButtonComponent.tagName)!
      );
      await elementUpdated(dialog);
      await waitUntil(() => !dialog.open);

      expect(spy.mock.calls).lengthOf(2);
      expect(spy).toHaveBeenNthCalledWith(1, 'igcClosing', {
        cancelable: true,
      });
      expect(spy).toHaveBeenNthCalledWith(2, 'igcClosed');
    });

    it('can cancel `igcClosing` events when clicking outside the dialog area', async () => {
      dialog.closeOnOutsideClick = true;
      await dialog.show();

      const spy = vi.spyOn(dialog, 'emitEvent');
      dialog.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      const { x, y } = dialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x - 1, clientY: y - 1 });
      await elementUpdated(dialog);

      expectCalledWith(spy, 'igcClosing');
      expectNotCalledWith(spy, 'igcClosed');
    });

    it('does not close the dialog on clicking outside when `closeOnOutsideClick` is not set', async () => {
      await dialog.show();

      const { x, y } = dialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x - 1, clientY: y - 1 });
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
    });

    it('does close the dialog on clicking outside when `closeOnOutsideClick` is set', async () => {
      dialog.closeOnOutsideClick = true;
      await dialog.show();

      const spy = vi.spyOn(dialog, 'emitEvent');

      const { x, y } = dialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x + 1, clientY: y - 1 });
      await elementUpdated(dialog);

      await waitUntil(() => eventMatch(spy, 'igcClosed'));
      expect(dialog.open).to.be.false;
    });

    it('issue 1983 - does not close the dialog when keepOpenOnEscape is true and a non-cancelable close event is fired', async () => {
      dialog.keepOpenOnEscape = true;
      await dialog.show();

      nativeDialog.dispatchEvent(new Event('close'));
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
      expect(nativeDialog.open).to.be.true;
    });
  });

  describe('Form', () => {
    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(html`
        <igc-dialog>
          <form method="dialog">
            <button value="Done" type="submit">Submit</button>
          </form>
        </igc-dialog>
      `);
    });

    it('closes the dialog when a method="dialog" form is submitted with submitter value', async () => {
      const submitter = dialog.querySelector('button')!;
      await dialog.show();

      submitter.click();
      await elementUpdated(dialog);

      await waitUntil(() => !dialog.open);
      expect(dialog.returnValue).to.equal(submitter.value);

      // No submitter value
      submitter.value = '';
      await dialog.show();

      submitter.click();
      await elementUpdated(dialog);

      await waitUntil(() => !dialog.open);
      expect(dialog.returnValue).to.equal('');
    });
  });
});

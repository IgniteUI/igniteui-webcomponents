import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import { spy } from 'sinon';

import IgcButtonComponent from '../button/button.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulateClick } from '../common/utils.spec.js';
import IgcDialogComponent from './dialog.js';

describe('Dialog', () => {
  before(() => {
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
      'size',
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
      const eventSpy = spy(dialog, 'emitEvent');

      await dialog.show();
      expect(dialog.open).to.be.true;
      expect(eventSpy.getCalls()).is.empty;

      await dialog.hide();
      expect(dialog.open).to.be.false;
      expect(eventSpy.getCalls()).is.empty;

      dialog.open = false;
      await elementUpdated(dialog);

      expect(dialog.open).to.be.false;
      expect(eventSpy.getCalls()).is.empty;
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
      const eventSpy = spy(dialog, 'emitEvent');
      await dialog.show();

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(dialog);
      await waitUntil(() => !dialog.open);

      expect(eventSpy.getCalls()).lengthOf(2);
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).calledWith('igcClosed');
    });

    it('should not close the dialog when the user presses Escape and `keepOpenOnEscape` is set', async () => {
      const eventSpy = spy(dialog, 'emitEvent');

      dialog.keepOpenOnEscape = true;
      await dialog.show();

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
      expect(eventSpy.getCalls()).is.empty;
    });

    it('default action button emits closing events', async () => {
      const eventSpy = spy(dialog, 'emitEvent');
      await dialog.show();

      simulateClick(
        dialog.renderRoot.querySelector(IgcButtonComponent.tagName)!
      );
      await elementUpdated(dialog);
      await waitUntil(() => !dialog.open);

      expect(eventSpy.getCalls()).lengthOf(2);
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).calledWith('igcClosed');
    });

    it('can cancel `igcClosing` events when clicking outside the dialog area', async () => {
      dialog.closeOnOutsideClick = true;
      await dialog.show();

      const eventSpy = spy(dialog, 'emitEvent');
      dialog.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      const { x, y } = dialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x - 1, clientY: y - 1 });
      await elementUpdated(dialog);

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).not.calledWith('igcClosed');
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

      const eventSpy = spy(dialog, 'emitEvent');

      const { x, y } = dialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x + 1, clientY: y - 1 });
      await elementUpdated(dialog);

      await waitUntil(() => eventSpy.calledWith('igcClosed'));
      expect(dialog.open).to.be.false;
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

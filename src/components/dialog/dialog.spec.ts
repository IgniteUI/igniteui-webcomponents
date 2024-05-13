import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
  waitUntil,
} from '@open-wc/testing';
import { spy } from 'sinon';

import { IgcDialogComponent, defineComponents } from '../../index.js';

describe('Dialog component', () => {
  const fireMouseEvent = (type: string, opts: MouseEventInit) =>
    new MouseEvent(type, opts);
  const getBoundingRect = (el: Element) => el.getBoundingClientRect();

  before(() => {
    defineComponents(IgcDialogComponent);
  });

  let dialog: IgcDialogComponent;
  let dialogEl: HTMLDialogElement;

  describe('', () => {
    beforeEach(async () => {
      dialog = await createDialogComponent();
      dialogEl = dialog.shadowRoot!.querySelector(
        'dialog'
      ) as HTMLDialogElement;
    });

    it('passes the a11y audit', async () => {
      const dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );

      await expect(dialog).shadowDom.to.be.accessible();
    });

    it('should render content inside the dialog', async () => {
      const content = 'Dialog content';
      dialog = await createDialogComponent(
        `<igc-dialog><span>${content}</span></igc-dialog>`
      );

      dialog.show();
      await elementUpdated(dialog);

      expect(dialog).dom.to.have.text(content);
      expect(dialog).dom.to.equal(
        `
        <igc-dialog>
          <span>
            Dialog content
          </span>
        </igc-dialog>`,
        {
          ignoreAttributes: [
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
          ],
        }
      );
    });

    it('`hide-default-action` correctly toggles DOM structure', async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog>Message</igc-dialog>`
      );

      const footer = dialog.shadowRoot!.querySelector('footer');

      expect(footer).dom.to.equal(
        `<footer>
          <slot name="footer">
            <igc-button type="button">OK</igc-button>
          </slot>
        </footer>`,
        {
          ignoreAttributes: ['part', 'variant', 'size', 'style'],
        }
      );

      dialog.hideDefaultAction = true;
      await elementUpdated(dialog);

      expect(footer).dom.to.equal(
        `<footer>
          <slot name="footer">
          </slot>
        </footer>`,
        {
          ignoreAttributes: ['part', 'style'],
        }
      );
    });

    it('renders a dialog element internally with default button if no content is provided', async () => {
      await expect(dialog).shadowDom.to.be.accessible();
      expect(dialog).shadowDom.to.equal(
        `
        <div></div>
        <dialog>
          <header>
            <slot name="title"><span></span></slot>
          </header>
          <section>
            <slot></slot>
          </section>
          <footer>
            <slot name="footer">
              <igc-button type="button">
                OK
              </igc-button>
            </slot>
          </footer>
        </dialog>`,
        {
          ignoreAttributes: [
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
            'style',
          ],
        }
      );
    });

    it('show method should open the dialog', async () => {
      dialog.open = false;
      await elementUpdated(dialog);

      dialog.show();
      await elementUpdated(dialog);
      expect(dialog.open).to.eq(true);
    });

    it('hide method should close the dialog', async () => {
      dialog.open = true;
      await elementUpdated(dialog);

      dialog.hide();
      await waitUntil(() => !dialog.open);
      expect(dialog.open).to.eq(false);
    });

    it('toggle method should toggle the dialog', async () => {
      dialog.open = true;
      await elementUpdated(dialog);

      dialog.toggle();
      await waitUntil(() => !dialog.open);
      expect(dialog.open).to.eq(false);

      dialog.open = false;
      await elementUpdated(dialog);

      dialog.toggle();
      await elementUpdated(dialog);
      expect(dialog.open).to.eq(true);
    });

    it('is created with the proper default values', async () => {
      expect(dialog.keepOpenOnEscape).to.equal(false);
      expect(dialog.closeOnOutsideClick).to.equal(false);
      expect(dialog.title).to.be.undefined;
      expect(dialog.open).to.equal(false);
      expect(dialog.returnValue).to.be.undefined;

      const header = dialog.shadowRoot?.querySelector('header') as HTMLElement;
      expect(dialogEl.getAttribute('aria-labelledby')).to.equal(
        header.getAttribute('id')
      );
    });

    it('has correct aria label and role', async () => {
      dialog.ariaLabel = 'ariaLabel';
      dialog.open = true;
      await elementUpdated(dialog);

      expect(dialogEl.getAttribute('aria-label')).to.equal('ariaLabel');
      expect(dialogEl.getAttribute('role')).to.equal('dialog');
    });

    it('does not emit events through API calls', async () => {
      const eventSpy = spy(dialog, 'emitEvent');
      dialog.show();
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
      expect(eventSpy.callCount).to.equal(0);

      dialog.hide();
      await waitUntil(() => !dialog.open);

      expect(dialog.open).to.be.false;
      expect(eventSpy.callCount).to.equal(0);

      dialog.open = true;
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
      expect(eventSpy.callCount).to.equal(0);

      dialog.open = false;
      await elementUpdated(dialog);

      expect(dialog.open).to.be.false;
      expect(eventSpy.callCount).to.equal(0);
    });

    it('default action button emits closing events', async () => {
      const eventSpy = spy(dialog, 'emitEvent');
      dialog.show();
      await elementUpdated(dialog);

      dialog.shadowRoot!.querySelector('igc-button')!.click();
      await waitUntil(() => !dialog.open);

      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).calledWith('igcClosed');
    });

    it('cancels closing event correctly', async () => {
      dialog.toggle();
      await elementUpdated(dialog);
      expect(dialog.open).to.be.true;

      const eventSpy = spy(dialog, 'emitEvent');

      dialog.addEventListener('igcClosing', (ev) => {
        ev.preventDefault();
      });

      dialog.shadowRoot!.querySelector('igc-button')!.click();
      await elementUpdated(dialog);
      expect(eventSpy).calledOnceWith('igcClosing');
    });

    it('can cancel `igcClosing` event when clicking outside', async () => {
      dialog.show();
      await elementUpdated(dialog);

      dialog.closeOnOutsideClick = true;
      await elementUpdated(dialog);

      const eventSpy = spy(dialog, 'emitEvent');
      dialog.addEventListener('igcClosing', (e) => e.preventDefault());

      const { x, y } = getBoundingRect(dialog);
      dialogEl.dispatchEvent(
        fireMouseEvent('click', {
          bubbles: true,
          composed: true,
          clientX: x - 1,
          clientY: y - 1,
        })
      );
      await elementUpdated(dialog);

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).not.calledWith('igcClosed');
    });

    it('does not close the dialog on clicking outside when `closeOnOutsideClick` is false.', async () => {
      dialog.show();
      await elementUpdated(dialog);

      dialog.closeOnOutsideClick = false;
      await elementUpdated(dialog);

      const { x, y } = getBoundingRect(dialog);
      dialogEl.dispatchEvent(
        fireMouseEvent('click', {
          bubbles: true,
          composed: true,
          clientX: x - 1,
          clientY: y - 1,
        })
      );
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
    });

    it('closes the dialog on clicking outside when `closeOnOutsideClick` is true.', async () => {
      dialog.show();
      await elementUpdated(dialog);

      dialog.closeOnOutsideClick = true;
      await elementUpdated(dialog);

      const { x, y } = getBoundingRect(dialog);
      dialogEl.dispatchEvent(
        fireMouseEvent('click', {
          bubbles: true,
          composed: true,
          clientX: x - 1,
          clientY: y - 1,
        })
      );

      const eventSpy = spy(dialog, 'emitEvent');
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      expect(dialog.open).to.be.false;
    });

    it('closes the dialog when form with method=dialog is submitted', async () => {
      dialog = await createDialogComponent(`
        <igc-dialog>
          <igc-form id="form" method="dialog">
            <igc-button type="submit">Confirm</igc-button>
          </igc-form>
        </igc-dialog>
        `);
      await elementUpdated(dialog);

      dialog.show();
      await elementUpdated(dialog);

      const form = document.getElementById('form');
      form?.dispatchEvent(new Event('igcSubmit'));
      await waitUntil(() => !dialog.open);

      expect(dialog.open).to.eq(false);
    });

    const createDialogComponent = (template = '<igc-dialog></igc-dialog>') => {
      return fixture<IgcDialogComponent>(html`${unsafeStatic(template)}`);
    };
  });
});

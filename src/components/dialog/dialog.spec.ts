import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents, IgcDialogComponent } from '../../index.js';

describe('Dialog component', () => {
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
      const dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog>${content}</igc-dialog>`
      );
      expect(dialog).dom.to.have.text(content);
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
      await elementUpdated(dialog);
      expect(dialog.open).to.eq(false);
    });

    it('toggle method should toggle the dialog', async () => {
      dialog.open = true;
      await elementUpdated(dialog);

      dialog.toggle();
      await elementUpdated(dialog);
      expect(dialog.open).to.eq(false);

      dialog.open = false;
      await elementUpdated(dialog);

      dialog.toggle();
      await elementUpdated(dialog);
      expect(dialog.open).to.eq(true);
    });

    it('renders a dialog element internally', async () => {
      await expect(dialog).shadowDom.to.be.accessible();
      expect(dialog).shadowDom.to.equal(
        `
        <div></div>
        <dialog>
          <header>
            <slot name="title"></slot>
            <span></span>
          </header>
          <section>
            <slot></slot>
          </section>
          <footer>
            <slot name="footer"></slot>
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
          ],
        }
      );
    });

    it('is created with the proper default values', async () => {
      expect(dialog.closeOnEscape).to.equal(true);
      expect(dialog.closeOnOutsideClick).to.equal(false);
      expect(dialog.title).to.be.undefined;
      expect(dialog.open).to.equal(false);
      expect(dialog.returnValue).to.be.undefined;
      expect(dialog.role).to.be.undefined;
      expect(dialog.ariaDescribedby).to.be.undefined;
      expect(dialog.ariaLabel).to.be.undefined;
      expect(dialog.ariaLabelledby).to.be.undefined;
      expect(dialogEl.getAttribute('role')).to.equal('dialog');

      const header = dialog.shadowRoot?.querySelector('header') as HTMLElement;
      expect(dialogEl.getAttribute('aria-labelledby')).to.equal(
        header.getAttribute('id')
      );
    });

    it('set aria properties and role', async () => {
      dialog.role = 'alertdialog';
      dialog.ariaLabel = 'ariaLabel';
      dialog.ariaLabelledby = 'ariaLabelledby';
      dialog.ariaDescribedby = 'ariaDescribedby';
      await elementUpdated(dialog);

      expect(dialogEl.getAttribute('role')).to.equal('alertdialog');
      expect(dialogEl.getAttribute('aria-label')).to.equal('ariaLabel');
      expect(dialogEl.getAttribute('aria-labelledby')).to.equal(
        'ariaLabelledby'
      );
      expect(dialogEl.getAttribute('aria-describedby')).to.equal(
        'ariaDescribedby'
      );
      expect(dialog).dom.to.equal('<igc-dialog></igc-dialog>');
    });

    it('emits events correctly', async () => {
      const eventSpy = sinon.spy(dialog, 'emitEvent');
      dialog.toggle();
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith('igcOpening');
      expect(eventSpy.secondCall).calledWith('igcOpened');

      eventSpy.resetHistory();
      dialog.toggle();
      await elementUpdated(dialog);

      expect(dialog.open).to.be.false;
      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).calledWith('igcClosed');
    });

    it('cancels igcOpened correctly', async () => {
      const eventSpy = sinon.spy(dialog, 'emitEvent');

      expect(dialog.open).to.be.false;

      dialog.addEventListener('igcOpening', (ev) => {
        ev.preventDefault();
      });

      dialog.toggle();
      await elementUpdated(dialog);

      expect(dialog.open).to.be.false;
      expect(eventSpy).calledOnceWith('igcOpening');
    });

    it('cancels igcClosed correctly', async () => {
      dialog.toggle();
      await elementUpdated(dialog);
      expect(dialog.open).to.be.true;

      const eventSpy = sinon.spy(dialog, 'emitEvent');

      dialog.addEventListener('igcClosing', (ev) => {
        ev.preventDefault();
      });

      dialog.toggle();
      await elementUpdated(dialog);
      expect(eventSpy).calledOnceWith('igcClosing');
    });

    const createDialogComponent = (template = `<igc-dialog></igc-dialog>`) => {
      return fixture<IgcDialogComponent>(html`${unsafeStatic(template)}`);
    };
  });
});

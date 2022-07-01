import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { defineComponents, IgcDialogComponent } from '../../index.js';

describe('Dialog component', () => {
  before(() => {
    defineComponents(IgcDialogComponent);
  });

  let dialog: IgcDialogComponent;

  describe('', () => {
    beforeEach(async () => {
      dialog = await createDialogComponent();
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
      expect(dialog).shadowDom.to.equal(`<dialog></dialog>`, {
        ignoreAttributes: [
          'variant',
          'aria-label',
          'aria-disabled',
          'aria-hidden',
          'part',
          'role',
          'size',
        ],
      });
    });

    it('is created with the proper default values', async () => {
      expect(dialog.closeOnEscape).to.equal(true);
      expect(dialog.closeOnOutsideClick).to.equal(false);
      expect(dialog.title).to.be.undefined;
      expect(dialog.open).to.equal(false);
      expect(dialog.returnValue).to.be.undefined;
      // expect(dialog.role).to.be.undefined;
      // expect(dialog.ariaDescribedBy).to.be.undefined;
      // expect(dialog.ariaLabel).to.be.undefined;
      // expect(dialog.ariaLabelledBy).to.be.undefined;
    });

    const createDialogComponent = (template = `<igc-dialog></igc-dialog>`) => {
      return fixture<IgcDialogComponent>(html`${unsafeStatic(template)}`);
    };
  });
});

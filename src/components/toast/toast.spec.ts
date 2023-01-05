import {
  html,
  fixture,
  expect,
  elementUpdated,
  unsafeStatic,
} from '@open-wc/testing';
import { IgcToastComponent } from '../../index.js';

describe('Toast', () => {
  before(() => {
    IgcToastComponent.register();
  });

  let toast: IgcToastComponent;

  describe('', () => {
    beforeEach(async () => {
      toast = await createToastComponent();
    });

    it('passes the a11y audit', async () => {
      const toast = await fixture<IgcToastComponent>(
        html`<igc-toast></igc-toast>`
      );

      await expect(toast).shadowDom.to.be.accessible();
    });

    it('should render content inside the toast', async () => {
      const message = 'Toast message';
      const toast = await fixture<IgcToastComponent>(
        html`<igc-toast>${message}</igc-toast>`
      );
      expect(toast).dom.to.have.text(message);
    });

    it('should change the toast display time correctly', async () => {
      toast.setAttribute('display-time', `10000`);
      await elementUpdated(toast);
      expect(toast.displayTime).to.eq(10000);
      expect(toast).dom.to.have.attribute('display-time', '10000');
    });

    it('should change the toast keepOpen option correctly.', async () => {
      toast.keepOpen = true;
      expect(toast.keepOpen).to.be.true;
      await elementUpdated(toast);
      expect(toast).dom.to.have.attribute('keep-open');

      toast.keepOpen = false;
      expect(toast.keepOpen).to.be.false;
      await elementUpdated(toast);
      expect(toast).dom.to.not.have.attribute('keep-open');
    });

    it('show method should open the toast', async () => {
      toast.open = false;
      await elementUpdated(toast);

      toast.show();
      await elementUpdated(toast);
      expect(toast.open).to.eq(true);
    });

    it('hide method should close the toast', async () => {
      toast.open = true;
      await elementUpdated(toast);

      toast.hide();
      await elementUpdated(toast);
      expect(toast.open).to.eq(false);
    });

    it('toggle method should toggle the toast', async () => {
      toast.open = true;
      await elementUpdated(toast);

      toast.toggle();
      await elementUpdated(toast);
      expect(toast.open).to.eq(false);

      toast.open = false;
      await elementUpdated(toast);

      toast.toggle();
      await elementUpdated(toast);
      expect(toast.open).to.eq(true);
    });

    const createToastComponent = (template = `<igc-toast></igc-toast>`) => {
      return fixture<IgcToastComponent>(html`${unsafeStatic(template)}`);
    };
  });
});

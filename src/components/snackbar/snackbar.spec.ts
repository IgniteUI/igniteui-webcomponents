import {
  html,
  fixture,
  expect,
  elementUpdated,
  unsafeStatic,
} from '@open-wc/testing';
import { defineComponents, IgcSnackbarComponent } from '../../index.js';

describe('Snackbar', () => {
  before(() => {
    defineComponents(IgcSnackbarComponent);
  });

  let el: IgcSnackbarComponent;

  describe('', () => {
    beforeEach(async () => {
      el = await createSnackbarComponent();
    });

    it('passes the a11y audit', async () => {
      const el = await fixture<IgcSnackbarComponent>(
        html`<igc-snackbar></igc-snackbar>`
      );

      await expect(el).shadowDom.to.be.accessible();
    });

    it('should render content inside the snackbar', async () => {
      const content = 'Snackbar content';
      const el = await fixture<IgcSnackbarComponent>(
        html`<igc-snackbar>${content}</igc-snackbar>`
      );
      expect(el).dom.to.have.text(content);
    });

    it('should set the snackbar keepOpen property correctly', async () => {
      el.keepOpen = true;
      expect(el.keepOpen).to.be.true;
      await elementUpdated(el);
      expect(el).dom.to.equal(`<igc-snackbar keep-open></igc-snackbar>`);

      el.keepOpen = false;
      expect(el.keepOpen).to.be.false;
      await elementUpdated(el);
      expect(el).dom.to.equal(`<igc-snackbar></igc-snackbar>`);
    });

    it('should set the snackbar displayTime property successfully', async () => {
      expect(el.displayTime).to.be.undefined;
      expect(el).dom.to.equal(`<igc-snackbar></igc-snackbar>`);

      el.setAttribute('display-time', '10000');
      await elementUpdated(el);
      expect(el.displayTime).to.eq(10000);
      expect(el).dom.to.equal(
        `<igc-snackbar display-time='10000'></igc-snackbar>`
      );
    });

    it('should set the snackbar actionText property successfully', async () => {
      expect(el.actionText).to.be.undefined;
      expect(el).dom.to.equal(`<igc-snackbar></igc-snackbar>`);

      el.setAttribute('action-text', 'Dismiss');
      await elementUpdated(el);
      expect(el.actionText).to.eq('Dismiss');
      expect(el).dom.to.equal(
        `<igc-snackbar action-text='Dismiss'></igc-snackbar>`
      );
    });

    const createSnackbarComponent = (
      template = `<igc-snackbar></igc-snackbar>`
    ) => {
      return fixture<IgcSnackbarComponent>(html`${unsafeStatic(template)}`);
    };
  });
});

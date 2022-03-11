import {
  html,
  fixture,
  expect,
  elementUpdated,
  unsafeStatic,
  aTimeout,
} from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents, IgcSnackbarComponent } from '../../index.js';
import IgcButtonComponent from '../button/button.js';

describe('Snackbar', () => {
  before(() => {
    defineComponents(IgcSnackbarComponent);
  });

  let el: IgcSnackbarComponent;
  let button: IgcButtonComponent;

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

    it('should open the snackbar successfully', async () => {
      el.open = false;
      await elementUpdated(el);
      expect(el.open).to.equal(false);
      expect(el).dom.to.equal(`<igc-snackbar></igc-snackbar>`);

      el.show();
      await elementUpdated(el);
      expect(el.open).to.equal(true);
      expect(el).dom.to.equal(`<igc-snackbar open></igc-snackbar>`);
    });

    it('should hide the snackbar successfully', async () => {
      el.open = true;
      await elementUpdated(el);
      expect(el.open).to.equal(true);
      expect(el).dom.to.equal(`<igc-snackbar open></igc-snackbar>`);

      el.hide();
      await elementUpdated(el);
      expect(el.open).to.equal(false);
      expect(el).dom.to.equal(`<igc-snackbar></igc-snackbar>`);
    });

    it('should hide the snackbar automatically after the display time is over', async () => {
      el.open = false;
      el.displayTime = 1000;
      await elementUpdated(el);
      expect(el.open).to.equal(false);

      el.show();
      await elementUpdated(el);
      expect(el.open).to.equal(true);
      await aTimeout(1000);
      expect(el.open).to.equal(false);
    });

    it('should not hide the snackbar automatically when the keepOpen property is set to true', async () => {
      el.open = false;
      el.displayTime = 1000;
      el.keepOpen = true;
      await elementUpdated(el);
      expect(el.open).to.equal(false);

      el.show();
      await elementUpdated(el);
      expect(el.open).to.equal(true);
      expect(el.keepOpen).to.equal(true);
      await aTimeout(1000);
      expect(el.open).to.equal(true);
    });

    it('should emit event when the snackbar action button is clicked', async () => {
      el.setAttribute('action-text', 'Dismiss');
      await elementUpdated(el);

      button = el.shadowRoot?.querySelector('igc-button') as IgcButtonComponent;
      const eventSpy = sinon.spy(el, 'emitEvent');
      button?.click();
      await elementUpdated(el);

      expect(eventSpy).calledOnceWithExactly('igcAction');
    });

    const createSnackbarComponent = (
      template = `<igc-snackbar></igc-snackbar>`
    ) => {
      return fixture<IgcSnackbarComponent>(html`${unsafeStatic(template)}`);
    };
  });
});

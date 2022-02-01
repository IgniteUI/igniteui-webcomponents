import {
  html,
  fixture,
  expect,
  elementUpdated,
  unsafeStatic,
} from '@open-wc/testing';
import { defineComponents, IgcToastComponent } from '../../index.js';

describe('Toast', () => {
  before(() => {
    defineComponents(IgcToastComponent);
  });

  let el: IgcToastComponent;

  describe('', () => {
    beforeEach(async () => {
      el = await createToastComponent();
    });

    it('passes the a11y audit', async () => {
      const el = await fixture<IgcToastComponent>(
        html`<igc-toast></igc-toast>`
      );

      await expect(el).shadowDom.to.be.accessible();
    });

    it('should render content inside the toast', async () => {
      const message = 'Toast message';
      const el = await fixture<IgcToastComponent>(
        html`<igc-toast>${message}</igc-toast>`
      );
      expect(el).dom.to.have.text(message);
    });

    it('should change the toast display time correctly', async () => {
      el.setAttribute('display-time', `10000`);
      await elementUpdated(el);
      expect(el.displayTime).to.eq(10000);
      expect(el).dom.to.equal(`<igc-toast display-time='10000'></igc-toast>`);
    });
  });

  it('should change the toast keepOpen option correctly.', async () => {
    el.keepOpen = true;
    expect(el.keepOpen).to.be.true;
    await elementUpdated(el);
    expect(el).dom.to.equal(`<igc-toast keep-open></igc-toast>`);

    el.keepOpen = false;
    expect(el.keepOpen).to.be.false;
    await elementUpdated(el);
    expect(el).dom.to.equal(`<igc-toast></igc-toast>`);
  });

  const createToastComponent = (template = `<igc-toast></igc-toast>`) => {
    return fixture<IgcToastComponent>(html`${unsafeStatic(template)}`);
  };
});

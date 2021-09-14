import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
// import sinon from "sinon";
import { IgcNavDrawerComponent } from './nav-drawer';
import '../../../igniteui-webcomponents';
import sinon from 'sinon';

describe('Navigation Drawer', () => {
  const DIFF_OPTIONS = {
    ignoreChildren: ['div'],
    ignoreAttributes: ['part'],
  };

  let el: IgcNavDrawerComponent;

  describe('', async () => {
    beforeEach(async () => {
      el = await createNavDrawerElement();
    });

    it('passes the a11y audit', async () => {
      expect(el).shadowDom.to.be.accessible();
    });

    it('renders nav drawer with items', async () => {
      el = await createNavDrawerElement(`<igc-nav-drawer>
              <igc-nav-drawer-item></igc-nav-drawer-item>
              <igc-nav-drawer-item></igc-nav-drawer-item>
            </igc-nav-drawer>`);

      expect(el.children.length).to.equals(2);
    });

    it('renders nav drawer with items and header', async () => {
      el = await createNavDrawerElement(`<igc-nav-drawer>
              <igc-nav-drawer-header-item></igc-nav-drawer-header-item>
              <igc-nav-drawer-item></igc-nav-drawer-item>
              <igc-nav-drawer-item></igc-nav-drawer-item>
            </igc-nav-drawer>`);

      expect(el).to.contain('igc-nav-drawer-header-item');
      expect(el).to.contain('igc-nav-drawer-item');
    });

    it('render nav drawer item slots successfully', async () => {
      expect(el.children[0]).shadowDom.equal(`
        <div part="base">
          <span part="icon">
            <slot name="icon"></slot>
          </span>
          <span part="text">
            <slot></slot>
          </span>
        </div>
      `);
    });

    it('render nav drawer slots successfully', async () => {
      expect(el).shadowDom.equal(`
        <div part="base" class="start">
          <div part="main">
            <slot></slot>
          </div>

          <div part="mini">
            <slot name="mini"></slot>
          </div>
        </div>
      `);
    });

    it('successfully changes nav drawer position', async () => {
      el.position = 'bottom';
      expect(el.position).to.equal('bottom');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `
        <div part="base" class="bottom">`,
        DIFF_OPTIONS
      );
    });

    it('successfully toggles nav drawer', async () => {
      el.toggle();
      expect(el.open).to.equal(true);

      el.toggle();
      expect(el.open).to.equal(false);
    });

    it('successfully pins nav drawer', async () => {
      el.pinned = true;
      expect(el.pinned).to.equal(true);
    });

    it('displays the elements defined in the slots', async () => {
      el = await createNavDrawerElement(`
        <igc-nav-drawer>
          <igc-nav-drawer-header-item>Header</igc-nav-drawer-header-item>

          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="home"></igc-icon>
            <h2>Item Content</h2>
          </igc-nav-drawer-item>

          <div slot="mini" mini="true"">
            <igc-nav-drawer-item>
              <igc-icon slot="icon" name="home"></igc-icon>
            <igc-nav-drawer-item>
          </div>

        </igc-nav-drawer>`);

      el.open = true;

      await elementUpdated(el);

      // TODO finish this test

      //expect(el.children.length).to.equals(3);
      // expect(el.shadowRoot?.querySelector('div[part=mini]')).to.not.be.displayed

      //  const asd = el.shadowRoot?.querySelector('slot[name=mini]');
      //  (asd as Element).setAttribute('style','display: none');
      //  expect(asd).to.be.displayed;
    });

    it('should emit igcOpening event when the drawer is opened', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.toggle();

      expect(eventSpy).calledWith('igcOpening');
      expect(eventSpy).calledWith('igcOpened');

      el.toggle();

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
    });
  });

  const createNavDrawerElement = (
    template = '<igc-nav-drawer/><igc-nav-drawer-item/>'
  ) => {
    return fixture<IgcNavDrawerComponent>(html`${unsafeStatic(template)}`);
  };
});

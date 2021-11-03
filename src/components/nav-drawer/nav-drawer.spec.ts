import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import sinon from 'sinon';
import '../../index.js';
import type IgcNavDrawerComponent from './nav-drawer';
import type IgcNavDrawerItemComponent from './nav-drawer-item';

describe('Navigation Drawer', () => {
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
          <span part="content">
            <slot name="content"></slot>
          </span>
        </div>
      `);
    });

    it('render nav drawer slots successfully', async () => {
      expect(el).shadowDom.equal(`
        <div part="base">
          <div part="main">
            <slot></slot>
          </div>

          <div part="mini hidden">
            <slot name="mini"></slot>
          </div>
        </div>
      `);
    });

    it('successfully changes nav drawer position', async () => {
      expect(el.position).to.equal('start');

      el.position = 'end';
      expect(el.position).to.equal('end');
      await elementUpdated(el);

      el.position = 'top';
      expect(el.position).to.equal('top');
      await elementUpdated(el);

      el.position = 'bottom';
      expect(el.position).to.equal('bottom');
      await elementUpdated(el);
    });

    it('successfully toggles nav drawer', async () => {
      el.toggle();
      expect(el.open).to.equal(true);

      el.toggle();
      expect(el.open).to.equal(false);
    });

    it('successfully sets active to drawer item', async () => {
      const item = el.children[0] as IgcNavDrawerItemComponent;
      item.active = true;
      expect(item.active).to.equal(true);
    });

    it('successfully sets disabled to drawer item', async () => {
      const item = el.children[0] as IgcNavDrawerItemComponent;
      item.disabled = true;
      expect(item.disabled).to.equal(true);
    });

    it('displays the elements defined in the slots', async () => {
      el = await createNavDrawerElement(`
        <igc-nav-drawer>
          <igc-nav-drawer-header-item>Header</igc-nav-drawer-header-item>

          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="home"></igc-icon>
            <h2 name="content">Item Content</h2>
          </igc-nav-drawer-item>

          <div slot="mini">
            <igc-nav-drawer-item>
              <igc-icon slot="icon" name="home"></igc-icon>
            <igc-nav-drawer-item>
          </div>

        </igc-nav-drawer>`);

      el.open = true;

      await elementUpdated(el);

      const mini = el.shadowRoot?.querySelector('div[part=mini]') as Element;
      let computedStyles = window.getComputedStyle(mini);
      expect(computedStyles.getPropertyValue('display')).to.equal('none');

      el.open = false;

      await elementUpdated(el);

      computedStyles = window.getComputedStyle(mini);
      expect(computedStyles.getPropertyValue('display')).to.not.equal('none');
    });

    it('should emit events on drawer toggle', async () => {
      const eventSpy = sinon.spy(el, 'emitEvent');
      el.toggle();

      expect(eventSpy).calledWith('igcOpening');
      expect(eventSpy).calledWith('igcOpened');

      el.toggle();

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
    });

    it('should successfully cancel opening event', async () => {
      el.addEventListener('igcOpening', (ev: CustomEvent) => {
        ev.detail.cancel = true;
      });

      const eventSpy = sinon.spy(el, 'emitEvent');

      el.show();

      await elementUpdated(el);

      expect(eventSpy).calledWith('igcOpening');
      expect(el.open).to.equal(false);
    });

    it('should successfully cancel closing events', async () => {
      el.show();
      el.addEventListener('igcClosing', (ev: CustomEvent) => {
        ev.detail.cancel = true;
      });

      const eventSpy = sinon.spy(el, 'emitEvent');

      el.hide();

      await elementUpdated(el);

      expect(eventSpy).calledWith('igcClosing');
      expect(el.open).to.equal(true);
    });
  });

  const createNavDrawerElement = (
    template = '<igc-nav-drawer/><igc-nav-drawer-item/>'
  ) => {
    return fixture<IgcNavDrawerComponent>(html`${unsafeStatic(template)}`);
  };
});

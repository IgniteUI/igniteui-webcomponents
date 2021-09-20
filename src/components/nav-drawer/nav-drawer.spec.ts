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
import { IgcNavDrawerItemComponent } from './nav-drawer-item';

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
      expect(el).shadowDom.to.equal(
        `<div part="base" class="start">`,
        DIFF_OPTIONS
      );

      el.position = 'end';
      expect(el.position).to.equal('end');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<div part="base" class="end">`,
        DIFF_OPTIONS
      );

      el.position = 'top';
      expect(el.position).to.equal('top');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<div part="base" class="top">`,
        DIFF_OPTIONS
      );

      el.position = 'bottom';
      expect(el.position).to.equal('bottom');
      await elementUpdated(el);

      expect(el).shadowDom.to.equal(
        `<div part="base" class="bottom">`,
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
            <h2>Item Content</h2>
          </igc-nav-drawer-item>

          <div slot="mini">
            <igc-nav-drawer-item>
              <igc-icon slot="icon" name="home"></igc-icon>
            <igc-nav-drawer-item>
          </div>

        </igc-nav-drawer>`);

      el.open = true;

      await elementUpdated(el);

      const asd = el.shadowRoot?.querySelector('div[part=mini]') as Element;
      let computedStyles = window.getComputedStyle(asd);
      expect(computedStyles.getPropertyValue('display')).to.equal('none');

      el.open = false;

      await elementUpdated(el);

      computedStyles = window.getComputedStyle(asd);
      expect(computedStyles.getPropertyValue('display')).to.not.equal('none');
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

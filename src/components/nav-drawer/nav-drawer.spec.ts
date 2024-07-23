import { expect, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcIconComponent from '../icon/icon.js';
import IgcNavDrawerComponent from './nav-drawer.js';

describe('Navigation Drawer', () => {
  before(() => {
    defineComponents(IgcNavDrawerComponent, IgcIconComponent);
  });

  let navDrawer: IgcNavDrawerComponent;

  // Workaround since transitionend is not emitted in the tests
  async function runWithTransition(awaitable: Promise<boolean>) {
    navDrawer.renderRoot.dispatchEvent(new Event('transitionend'));
    return await awaitable;
  }

  describe('Accessibility', () => {
    beforeEach(async () => {
      navDrawer = await createNavDrawer();
    });

    it('passes the a11y audit (closed state)', async () => {
      await expect(navDrawer).dom.to.be.accessible();
      await expect(navDrawer).shadowDom.to.be.accessible();
    });

    it('passes the a11y audit (open state)', async () => {
      await runWithTransition(navDrawer.show());
      expect(navDrawer.open).to.be.true;

      await expect(navDrawer).dom.to.be.accessible();
      await expect(navDrawer).shadowDom.to.be.accessible();
    });
  });

  describe('DOM', () => {
    it('renders navigation items', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer>
          <igc-nav-drawer-item></igc-nav-drawer-item>
          <igc-nav-drawer-item></igc-nav-drawer-item>
        </igc-nav-drawer>
      `);

      expect(navDrawer.children).lengthOf(2);
    });

    it('renders items and header', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer>
          <igc-nav-drawer-header-item></igc-nav-drawer-header-item>
          <igc-nav-drawer-item></igc-nav-drawer-item>
          <igc-nav-drawer-item></igc-nav-drawer-item>
        </igc-nav-drawer>
      `);

      expect(navDrawer.children).lengthOf(3);
      expect(navDrawer).to.contain('igc-nav-drawer-header-item');
      expect(navDrawer).to.contain('igc-nav-drawer-item');
    });

    it('render navigation drawer slots', async () => {
      navDrawer = await createNavDrawer();

      expect(navDrawer).shadowDom.equal(`
        <div part="overlay"></div>
        <div inert part="base">
          <div part="main">
            <slot></slot>
          </div>
        </div>
        <div part="mini hidden">
          <slot name="mini"></slot>
        </div>
      `);
    });

    it('render navigation drawer item slots', async () => {
      navDrawer = await createNavDrawer();

      expect(navDrawer.children.item(0)).shadowDom.equal(
        `
        <div part="base">
          <span hidden part="icon">
            <slot name="icon"></slot>
          </span>
          <span part="content">
            <slot name="content"></slot>
          </span>
        </div>
      `
      );
    });

    it('initial render of a navbar with mini slot', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer>
          <div slot="mini">
            <igc-nav-drawer-item>
              <igc-icon slot="icon" name="home"></igc-icon>
            </igc-nav-drawer-item>

            <igc-nav-drawer-item>
              <igc-icon slot="icon" name="search"></igc-icon>
            </igc-nav-drawer-item>
          </div>
        </igc-nav-drawer>
      `);

      expect(navDrawer.open).to.be.false;
      expect(navDrawer.renderRoot.querySelector<Element>('[part="mini"]')).to
        .exist;
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      navDrawer = await createNavDrawer();
    });

    it('`show`', async () => {
      await runWithTransition(navDrawer.show());
      expect(navDrawer.open).to.be.true;
      expect(await runWithTransition(navDrawer.show())).to.be.false;
    });

    it('`hide`', async () => {
      await runWithTransition(navDrawer.toggle());
      await runWithTransition(navDrawer.hide());
      expect(navDrawer.open).to.be.false;
      expect(await runWithTransition(navDrawer.hide())).to.be.false;
    });

    it('`toggle`', async () => {
      await runWithTransition(navDrawer.toggle());
      expect(navDrawer.open).to.be.true;

      await runWithTransition(navDrawer.toggle());
      expect(navDrawer.open).to.be.false;
    });
  });

  async function createNavDrawer(template?: TemplateResult) {
    return await fixture<IgcNavDrawerComponent>(
      template ??
        html`
          <igc-nav-drawer>
            <igc-nav-drawer-item></igc-nav-drawer-item>
          </igc-nav-drawer>
        `
    );
  }
});

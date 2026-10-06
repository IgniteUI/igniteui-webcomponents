import {
  elementUpdated,
  expect,
  fixture,
  html,
  oneEvent,
  waitUntil,
} from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { spy } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { isFocused } from '#internals/testing/helpers.spec.js';
import { runInvokerCommandsTests } from '#internals/testing/invoker-commands.spec.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import { isPopoverOpen } from '#internals/utils/dom.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconComponent from '../icon/icon.js';
import IgcNavDrawerComponent from './nav-drawer.js';

describe('Navigation Drawer', () => {
  before(() => {
    defineComponents(
      IgcNavDrawerComponent,
      IgcButtonComponent,
      IgcIconComponent
    );
  });

  let navDrawer: IgcNavDrawerComponent;

  describe('Accessibility', () => {
    beforeEach(async () => {
      navDrawer = await createNavDrawer();
    });

    it('passes the a11y audit (closed state)', async () => {
      await expect(navDrawer).dom.to.be.accessible();
      await expect(navDrawer).shadowDom.to.be.accessible();
    });

    it('passes the a11y audit (open state)', async () => {
      await navDrawer.show();
      await elementUpdated(navDrawer);
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

    it('renders dialog-based shadow DOM for non-relative position', async () => {
      navDrawer = await createNavDrawer();

      expect(navDrawer).shadowDom.equal(`
        <dialog aria-modal="true" part="base">
          <div part="main">
            <slot></slot>
          </div>
        </dialog>
        <nav part="mini hidden" popover="manual" inert>
          <slot name="mini"></slot>
        </nav>
      `);
    });

    it('renders nav-based shadow DOM for relative position', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer position="relative">
          <igc-nav-drawer-item></igc-nav-drawer-item>
        </igc-nav-drawer>
      `);

      expect(navDrawer).shadowDom.equal(`
        <nav inert part="base">
          <div part="main">
            <slot></slot>
          </div>
        </nav>
        <nav part="mini hidden" inert>
          <slot name="mini"></slot>
        </nav>
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

    it('correctly binds label to the mini nav for accessibility', async () => {
      const label = 'Main navigation';

      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer label=${label}>
          <div slot="mini">
            <igc-nav-drawer-item></igc-nav-drawer-item>
            <igc-nav-drawer-item></igc-nav-drawer-item>
          </div>
          <igc-nav-drawer-item></igc-nav-drawer-item>
          <igc-nav-drawer-item></igc-nav-drawer-item>
        </igc-nav-drawer>
      `);

      const dialog = navDrawer.renderRoot.querySelector('dialog')!;
      const miniNav =
        navDrawer.renderRoot.querySelector<HTMLElement>('[part="mini"]')!;
      expect(dialog.getAttribute('aria-label')).to.equal(label);
      expect(miniNav.getAttribute('aria-label')).to.equal(label);
    });
  });

  describe('Host ARIA', () => {
    let container: HTMLElement;
    let name: HTMLElement;

    const base = () =>
      navDrawer.renderRoot.querySelector<HTMLElement>('[part~="base"]')!;
    const mini = () =>
      navDrawer.renderRoot.querySelector<HTMLElement>('[part~="mini"]')!;

    beforeEach(async () => {
      container = await fixture<HTMLElement>(html`
        <div>
          <span id="drawer-name">Site navigation</span>
          <span id="drawer-hint">Lists the main pages</span>
          <igc-nav-drawer aria-label="Main">
            <div slot="mini"><igc-nav-drawer-item></igc-nav-drawer-item></div>
            <igc-nav-drawer-item></igc-nav-drawer-item>
          </igc-nav-drawer>
        </div>
      `);
      navDrawer = container.querySelector('igc-nav-drawer')!;
      name = container.querySelector('#drawer-name')!;
    });

    it('is named by the host `aria-label` without a `label`', () => {
      expect(base().getAttribute('aria-label')).to.equal('Main');
      expect(mini().getAttribute('aria-label')).to.equal('Main');
    });

    it('prefers `label` over the host `aria-label`', async () => {
      navDrawer.label = 'Drawer';
      await elementUpdated(navDrawer);

      expect(base().getAttribute('aria-label')).to.equal('Drawer');
    });

    it('prefers the host `aria-labelledby` over `label`', async () => {
      navDrawer.label = 'Drawer';
      navDrawer.setAttribute('aria-labelledby', name.id);
      await elementUpdated(navDrawer);

      expect(base().ariaLabelledByElements).to.eql([name]);
      expect(mini().ariaLabelledByElements).to.eql([name]);
    });

    it('follows a change of the host `aria-label`, also in relative mode', async () => {
      navDrawer.position = 'relative';
      navDrawer.setAttribute('aria-label', 'Sections');
      await elementUpdated(navDrawer);

      expect(base().localName).to.equal('nav');
      expect(base().getAttribute('aria-label')).to.equal('Sections');
    });

    it('follows an `aria-labelledby` target that is added to the drawer later', async () => {
      navDrawer.setAttribute('aria-labelledby', 'drawer-title');
      await elementUpdated(navDrawer);

      const title = document.createElement('h2');
      title.id = 'drawer-title';
      navDrawer.append(title);
      await waitUntil(() => base().ariaLabelledByElements?.[0] === title);
    });

    it('describes only the main element by the host `aria-describedby`', async () => {
      navDrawer.setAttribute('aria-describedby', 'drawer-hint');
      await elementUpdated(navDrawer);

      expect(base().ariaDescribedByElements).to.eql([
        container.querySelector('#drawer-hint'),
      ]);
      expect(mini().hasAttribute('aria-describedby')).to.be.false;
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      navDrawer = await createNavDrawer();
    });

    it('`show`', async () => {
      expect(await navDrawer.show()).to.be.true;
      expect(navDrawer.open).to.be.true;
      expect(await navDrawer.show()).to.be.false;
    });

    it('`hide`', async () => {
      await navDrawer.toggle();
      expect(await navDrawer.hide()).to.be.true;
      expect(navDrawer.open).to.be.false;
      expect(await navDrawer.hide()).to.be.false;
    });

    it('`toggle`', async () => {
      expect(await navDrawer.toggle()).to.be.true;
      expect(navDrawer.open).to.be.true;

      expect(await navDrawer.toggle()).to.be.true;
      expect(navDrawer.open).to.be.false;
    });
  });

  describe('Events & Behaviors', () => {
    let nativeDialog: HTMLDialogElement;

    beforeEach(async () => {
      navDrawer = await createNavDrawer();
      nativeDialog = navDrawer.renderRoot.querySelector('dialog')!;
    });

    it('should correctly render with initial open state', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer open>
          <igc-nav-drawer-item></igc-nav-drawer-item>
        </igc-nav-drawer>
      `);
      nativeDialog = navDrawer.renderRoot.querySelector('dialog')!;

      expect(navDrawer.open).to.be.true;
      expect(nativeDialog.open).to.be.true;
    });

    it('should open dialog when position changes from relative to non-relative while open', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer position="relative" open>
          <igc-nav-drawer-item></igc-nav-drawer-item>
        </igc-nav-drawer>
      `);

      expect(navDrawer.open).to.be.true;
      expect(navDrawer.renderRoot.querySelector('dialog')).to.be.null;

      navDrawer.position = 'start';
      await elementUpdated(navDrawer);

      nativeDialog = navDrawer.renderRoot.querySelector('dialog')!;
      expect(nativeDialog).to.exist;
      expect(nativeDialog.open).to.be.true;
    });

    it('should close the native dialog when position changes to relative while open', async () => {
      await navDrawer.show();
      await elementUpdated(navDrawer);

      expect(nativeDialog.open).to.be.true;

      navDrawer.position = 'relative';
      await elementUpdated(navDrawer);

      expect(navDrawer.open).to.be.true;
      expect(navDrawer.renderRoot.querySelector('dialog')).to.be.null;
    });

    it('should close when the user presses Escape', async () => {
      const eventSpy = spy(navDrawer, 'emitEvent');
      await navDrawer.show();
      await elementUpdated(navDrawer);

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(navDrawer);
      await waitUntil(() => !navDrawer.open);

      expect(eventSpy.getCalls()).lengthOf(2);
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).calledWith('igcClosed');
    });

    it('should not close when Escape is pressed and `keepOpenOnEscape` is set', async () => {
      const eventSpy = spy(navDrawer, 'emitEvent');

      navDrawer.keepOpenOnEscape = true;
      await navDrawer.show();
      await elementUpdated(navDrawer);

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(navDrawer);

      expect(navDrawer.open).to.be.true;
      expect(eventSpy.getCalls()).is.empty;
    });

    it('should close when clicking outside in non-relative position', async () => {
      await navDrawer.show();
      await elementUpdated(navDrawer);

      const eventSpy = spy(navDrawer, 'emitEvent');
      const { x, y } = nativeDialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x + 1, clientY: y - 1 });
      await elementUpdated(navDrawer);

      await waitUntil(() => eventSpy.calledWith('igcClosed'));
      expect(navDrawer.open).to.be.false;
    });

    it('should not close when clicking inside the dialog', async () => {
      await navDrawer.show();
      await elementUpdated(navDrawer);

      const eventSpy = spy(navDrawer, 'emitEvent');
      const { x, y } = nativeDialog.getBoundingClientRect();

      simulateClick(nativeDialog, { clientX: x + 1, clientY: y + 1 });
      await elementUpdated(navDrawer);

      expect(eventSpy).not.calledWith('igcClosed');
      expect(navDrawer.open).to.be.true;
    });

    it('should not close when clicking outside in relative position', async () => {
      const relativeNavDrawer = await createNavDrawer(html`
        <igc-nav-drawer position="relative">
          <igc-nav-drawer-item></igc-nav-drawer-item>
        </igc-nav-drawer>
      `);

      await relativeNavDrawer.show();
      await elementUpdated(relativeNavDrawer);

      const eventSpy = spy(relativeNavDrawer, 'emitEvent');
      const { x, y } = relativeNavDrawer.getBoundingClientRect();
      simulateClick(relativeNavDrawer, { clientX: x + 1, clientY: y - 1 });
      await elementUpdated(relativeNavDrawer);

      expect(eventSpy.calledWith('igcClosed')).to.be.false;
      expect(relativeNavDrawer.open).to.be.true;
    });

    it('can cancel `igcClosing` event', async () => {
      await navDrawer.show();
      await elementUpdated(navDrawer);

      const eventSpy = spy(navDrawer, 'emitEvent');
      navDrawer.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(navDrawer);

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).not.calledWith('igcClosed');
      expect(navDrawer.open).to.be.true;
    });

    it('does not close when keepOpenOnEscape is true and a non-cancelable close event is fired', async () => {
      navDrawer.keepOpenOnEscape = true;
      await navDrawer.show();
      await elementUpdated(navDrawer);

      nativeDialog.dispatchEvent(new Event('close'));
      await elementUpdated(navDrawer);

      expect(navDrawer.open).to.be.true;
    });

    it('opens the dialog again when it closes while `open` stays true', async () => {
      await navDrawer.show();

      // As after a close request that the drawer cannot cancel.
      nativeDialog.close();
      await oneEvent(nativeDialog, 'close');

      expect(navDrawer.open).to.be.true;
      expect(nativeDialog.open).to.be.true;
    });

    it('keeps the focus that the dialog gives back inside a closed shadow root', async () => {
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <div tabindex="0"></div>
          <igc-nav-drawer><a href="#home">Home</a></igc-nav-drawer>
        </div>
      `);
      navDrawer = container.querySelector(IgcNavDrawerComponent.tagName)!;

      const root = container
        .querySelector('div')!
        .attachShadow({ mode: 'closed' });
      const button = document.createElement('button');
      root.append(button);
      button.focus();

      await navDrawer.show();
      await navDrawer.hide();

      expect(root.activeElement).to.equal(button);
    });

    it('programmatic hide does not emit events', async () => {
      const eventSpy = spy(navDrawer, 'emitEvent');
      await navDrawer.show();
      await navDrawer.hide();

      expect(eventSpy.getCalls()).is.empty;
    });
  });

  describe('Mini slot popover', () => {
    function getMiniElement(drawer: IgcNavDrawerComponent): HTMLDivElement {
      return drawer.renderRoot.querySelector<HTMLDivElement>('[part~="mini"]')!;
    }

    it('is shown when the drawer is initially closed with mini content', async () => {
      navDrawer = await createNavDrawerWithMini();
      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.true;
    });

    it('is hidden when the drawer opens', async () => {
      navDrawer = await createNavDrawerWithMini();
      await navDrawer.show();
      await elementUpdated(navDrawer);
      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.false;
    });

    it('is shown again when the drawer closes', async () => {
      navDrawer = await createNavDrawerWithMini();
      await navDrawer.show();
      await elementUpdated(navDrawer);
      await navDrawer.hide();
      await elementUpdated(navDrawer);
      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.true;
    });

    it('is not shown when there is no mini slot content', async () => {
      navDrawer = await createNavDrawer();
      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.false;
    });

    it('is hidden when position changes to relative', async () => {
      navDrawer = await createNavDrawerWithMini();
      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.true;

      navDrawer.position = 'relative';
      await elementUpdated(navDrawer);

      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.false;
    });

    it('is shown when position changes from relative to non-relative while closed', async () => {
      navDrawer = await fixture<IgcNavDrawerComponent>(html`
        <igc-nav-drawer position="relative">
          <igc-nav-drawer-item slot="mini"></igc-nav-drawer-item>
        </igc-nav-drawer>
      `);

      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.false;

      navDrawer.position = 'start';
      await elementUpdated(navDrawer);

      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.true;
    });

    it('is shown when mini content is added in the same task as a change from relative', async () => {
      navDrawer = await fixture<IgcNavDrawerComponent>(
        html`<igc-nav-drawer position="relative"></igc-nav-drawer>`
      );

      const item = document.createElement('igc-nav-drawer-item');
      item.slot = 'mini';
      navDrawer.appendChild(item);
      navDrawer.position = 'start';

      await waitUntil(() => isPopoverOpen(getMiniElement(navDrawer)));
    });

    it('is shown when mini content is dynamically added', async () => {
      navDrawer = await createNavDrawer();
      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.false;

      const item = document.createElement('igc-nav-drawer-item');
      item.slot = 'mini';
      navDrawer.appendChild(item);

      await waitUntil(
        () => isPopoverOpen(getMiniElement(navDrawer)),
        'Expected mini popover to be shown after adding mini content'
      );
    });

    it('returns the focus to the mini variant when the drawer closes', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer>
          <a href="#home">Home</a>
          <button slot="mini">Menu</button>
        </igc-nav-drawer>
      `);

      const button = navDrawer.querySelector('button')!;
      button.focus();

      await navDrawer.show();
      expect(isFocused(button)).to.be.false;

      await navDrawer.hide();
      expect(isFocused(button)).to.be.true;
    });

    it('returns the focus to the mini variant after the dialog opens again', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer>
          <a href="#home">Home</a>
          <button slot="mini">Menu</button>
        </igc-nav-drawer>
      `);

      const dialog = navDrawer.renderRoot.querySelector('dialog')!;
      const button = navDrawer.querySelector('button')!;
      button.focus();

      await navDrawer.show();

      // As after a close request that the drawer cannot cancel.
      dialog.close();
      await oneEvent(dialog, 'close');
      expect(dialog.open).to.be.true;

      await navDrawer.hide();
      expect(isFocused(button)).to.be.true;
    });

    it('returns the focus to the mini variant in a closed shadow root after the dialog opens again', async () => {
      const host = await fixture<HTMLDivElement>(html`<div></div>`);
      const root = host.attachShadow({ mode: 'closed' });
      const button = document.createElement('button');
      button.slot = 'mini';
      navDrawer = document.createElement(IgcNavDrawerComponent.tagName);
      navDrawer.append(button);
      root.append(navDrawer);

      await waitUntil(() => isPopoverOpen(getMiniElement(navDrawer)));
      button.focus();
      await navDrawer.show();

      const dialog = navDrawer.renderRoot.querySelector('dialog')!;
      dialog.close();
      await oneEvent(dialog, 'close');

      await navDrawer.hide();
      expect(root.activeElement).to.equal(button);
    });

    it('hides after the dialog opens when mini content changes in the same task', async () => {
      navDrawer = await createNavDrawerWithMini();
      const dialog = navDrawer.renderRoot.querySelector('dialog')!;
      let dialogOpen: boolean | undefined;

      getMiniElement(navDrawer).addEventListener(
        'beforetoggle',
        () => {
          dialogOpen = dialog.open;
        },
        { once: true }
      );

      const item = document.createElement('igc-nav-drawer-item');
      item.slot = 'mini';
      navDrawer.append(item);
      await navDrawer.show();

      // The dialog records the focus when it opens, and the opener can be in the mini variant.
      expect(dialogOpen).to.be.true;
    });

    it('does not return the focus to the dialog opener after a change to relative', async () => {
      navDrawer = await createNavDrawer(html`
        <igc-nav-drawer>
          <a href="#home">Home</a>
          <button slot="mini">Menu</button>
        </igc-nav-drawer>
      `);

      const button = navDrawer.querySelector('button')!;
      button.focus();

      await navDrawer.show();
      navDrawer.position = 'relative';
      await elementUpdated(navDrawer);

      await navDrawer.hide();
      expect(isFocused(button)).to.be.false;
    });

    it('is hidden when all mini content is removed', async () => {
      navDrawer = await createNavDrawerWithMini();
      expect(isPopoverOpen(getMiniElement(navDrawer))).to.be.true;

      navDrawer.querySelector('[slot="mini"]')!.remove();

      await waitUntil(
        () => !isPopoverOpen(getMiniElement(navDrawer)),
        'Expected mini popover to be hidden after removing mini content'
      );
    });
  });

  runInvokerCommandsTests({
    tagName: IgcNavDrawerComponent.tagName,
    commandFor: 'invoker-nav-drawer',
    template: html`
      <igc-nav-drawer id="invoker-nav-drawer">
        <igc-nav-drawer-item>Home</igc-nav-drawer-item>
      </igc-nav-drawer>
    `,
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

  async function createNavDrawerWithMini() {
    return await fixture<IgcNavDrawerComponent>(html`
      <igc-nav-drawer>
        <igc-nav-drawer-item slot="mini"></igc-nav-drawer-item>
      </igc-nav-drawer>
    `);
  }
});

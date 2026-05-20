import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';
import { type SinonFakeTimers, useFakeTimers } from 'sinon';
import IgcButtonComponent from '../button/button.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { isPopoverOpen } from '../common/util.js';
import { finishAnimationsFor } from '../common/utils.spec.js';
import IgcToastComponent from './toast.js';

describe('Toast', () => {
  before(() => defineComponents(IgcToastComponent, IgcButtonComponent));

  let toast: IgcToastComponent;
  let clock: SinonFakeTimers;

  describe('ARIA', () => {
    beforeEach(async () => {
      toast = await fixture<IgcToastComponent>(
        html`<igc-toast>Hello world</igc-toast>`
      );
    });

    it('is accessible', async () => {
      await expect(toast).dom.to.be.accessible();
      await expect(toast).shadowDom.to.be.accessible();
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout'] });
      toast = await fixture<IgcToastComponent>(
        html`<igc-toast>Hello world</igc-toast>`
      );
    });

    afterEach(() => {
      clock.restore();
    });

    const checkOpenState = (state = false) => {
      if (state) {
        expect(toast).dom.to.have.attribute('open');
        expect(isPopoverOpen(toast)).to.be.true;
        expect(toast).shadowDom.to.equal('<slot></slot>');
      } else {
        expect(toast).dom.not.to.have.attribute('open');
        expect(isPopoverOpen(toast)).to.be.false;
        expect(toast).shadowDom.to.equal('<slot inert></slot>');
      }
    };

    it('`open` property', async () => {
      checkOpenState(false);

      toast.open = true;
      await elementUpdated(toast);
      checkOpenState(true);

      toast.open = false;
      await elementUpdated(toast);
      checkOpenState(false);
    });

    it('`displayTime` property', async () => {
      toast.displayTime = 400;
      await toast.show();
      checkOpenState(true);

      await clock.tickAsync(399);
      expect(toast.open).to.be.true;
      checkOpenState(true);

      await clock.tickAsync(1);
      finishAnimationsFor(toast);
      await nextFrame();

      expect(toast.open).to.be.false;
      checkOpenState(false);
    });

    it('`keepOpen` overrides `displayTime`', async () => {
      toast.displayTime = 200;
      toast.keepOpen = true;

      await toast.show();
      checkOpenState(true);

      await clock.tickAsync(400);
      expect(toast.open).to.be.true;
      checkOpenState(true);
    });

    it('`show()` and `hide()`', async () => {
      await toast.show();
      checkOpenState(true);

      await toast.hide();
      checkOpenState(false);
    });

    it('`show()` and `hide()` are no-op in their respective states', async () => {
      toast.open = true;
      expect(await toast.show()).to.be.false;
      checkOpenState(true);

      toast.open = false;
      expect(await toast.hide()).to.be.false;
      checkOpenState(false);
    });

    it('`toggle()`', async () => {
      // close -> open
      await toast.toggle();
      expect(toast.open).to.be.true;
      checkOpenState(true);

      // open -> close
      await toast.toggle();
      expect(toast.open).to.be.false;
      checkOpenState(false);
    });

    describe('positioning', () => {
      it('defaults to `viewport` with no inline anchor styles', async () => {
        expect(toast.positioning).to.equal('viewport');

        await toast.show();

        expect(isPopoverOpen(toast)).to.be.true;
        expect(toast.style.top).to.equal('');
        expect(toast.style.left).to.equal('');
      });

      it('`container` positioning shows popover when there is a visible ancestor', async () => {
        toast.positioning = 'container';
        await toast.show();

        expect(isPopoverOpen(toast)).to.be.true;
      });

      it('switching `container → viewport` while open maintains open state', async () => {
        toast.positioning = 'container';
        await toast.show();

        toast.positioning = 'viewport';
        await elementUpdated(toast);

        expect(isPopoverOpen(toast)).to.be.true;
      });

      it('switching `viewport → container` while open maintains open state', async () => {
        await toast.show();

        toast.positioning = 'container';
        await elementUpdated(toast);

        expect(isPopoverOpen(toast)).to.be.true;
      });

      it('`position` changes in `viewport` mode do not set inline styles', async () => {
        await toast.show();

        toast.position = 'top';
        await elementUpdated(toast);

        expect(isPopoverOpen(toast)).to.be.true;
        expect(toast.style.top).to.equal('');
        expect(toast.style.left).to.equal('');
      });
    });
  });

  describe('Invoker Commands API', () => {
    afterEach(async () => {
      if (toast.open) {
        await toast.hide();
      }
    });

    describe('with igc-button', () => {
      let invoker: IgcButtonComponent;

      beforeEach(async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <igc-button command="--show" commandfor="invoker-toast"
              >Show</igc-button
            >
            <igc-toast id="invoker-toast" keep-open>Hello world</igc-toast>
          </div>
        `);

        invoker = container.querySelector<IgcButtonComponent>('igc-button')!;
        toast = container.querySelector<IgcToastComponent>('igc-toast')!;
      });

      it('`--show` opens the toast', async () => {
        expect(toast.open).to.be.false;

        invoker.click();
        await waitUntil(() => toast.open);

        expect(toast.open).to.be.true;
      });

      it('`--hide` closes an open toast', async () => {
        await toast.show();
        expect(toast.open).to.be.true;

        invoker.command = '--hide';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => !toast.open);

        expect(toast.open).to.be.false;
      });

      it('`--toggle` opens a closed toast', async () => {
        expect(toast.open).to.be.false;

        invoker.command = '--toggle';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => toast.open);

        expect(toast.open).to.be.true;
      });

      it('`--toggle` closes an open toast', async () => {
        await toast.show();
        expect(toast.open).to.be.true;

        invoker.command = '--toggle';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => !toast.open);

        expect(toast.open).to.be.false;
      });

      it('a disabled igc-button does not invoke commands', async () => {
        invoker.disabled = true;
        await elementUpdated(invoker);

        invoker.click();
        await elementUpdated(toast);

        expect(toast.open).to.be.false;
      });
    });

    describe('with native button', () => {
      let invoker: HTMLButtonElement;

      beforeEach(async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <button>Show</button>
            <igc-toast id="native-invoker-toast" keep-open
              >Hello world</igc-toast
            >
          </div>
        `);

        invoker = container.querySelector<HTMLButtonElement>('button')!;
        toast = container.querySelector<IgcToastComponent>('igc-toast')!;

        invoker.setAttribute('command', '--show');
        invoker.setAttribute('commandfor', 'native-invoker-toast');
      });

      it('`--show` opens the toast', async () => {
        expect(toast.open).to.be.false;

        invoker.click();
        await waitUntil(() => toast.open);

        expect(toast.open).to.be.true;
      });

      it('`--hide` closes an open toast', async () => {
        await toast.show();
        expect(toast.open).to.be.true;

        invoker.setAttribute('command', '--hide');

        invoker.click();
        await waitUntil(() => !toast.open);

        expect(toast.open).to.be.false;
      });

      it('`--toggle` opens a closed toast', async () => {
        expect(toast.open).to.be.false;

        invoker.setAttribute('command', '--toggle');

        invoker.click();
        await waitUntil(() => toast.open);

        expect(toast.open).to.be.true;
      });

      it('`--toggle` closes an open toast', async () => {
        await toast.show();
        expect(toast.open).to.be.true;

        invoker.setAttribute('command', '--toggle');

        invoker.click();
        await waitUntil(() => !toast.open);

        expect(toast.open).to.be.false;
      });

      it('a disabled native button does not invoke commands', async () => {
        invoker.disabled = true;

        invoker.click();
        await elementUpdated(toast);

        expect(toast.open).to.be.false;
      });
    });
  });
});

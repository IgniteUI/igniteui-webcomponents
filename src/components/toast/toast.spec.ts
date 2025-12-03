import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  elementUpdated,
  fixture,
  html,
  nextFrame,
} from '../common/helpers.spec.js';
import { finishAnimationsFor } from '../common/utils.spec.js';
import IgcToastComponent from './toast.js';

describe('Toast', () => {
  beforeAll(() => defineComponents(IgcToastComponent));

  let toast: IgcToastComponent;

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
      vi.useFakeTimers({ toFake: ['setTimeout'] });
      toast = await fixture<IgcToastComponent>(
        html`<igc-toast>Hello world</igc-toast>`
      );
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const checkOpenState = (state = false) => {
      if (state) {
        expect(toast).dom.to.have.attribute('open');
        expect(toast).shadowDom.to.equal('<slot></slot>');
      } else {
        expect(toast).dom.not.to.have.attribute('open');
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

      await vi.advanceTimersByTimeAsync(399);
      expect(toast.open).to.be.true;
      checkOpenState(true);

      await vi.advanceTimersByTimeAsync(1);
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

      await vi.advanceTimersByTimeAsync(400);
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
  });
});

import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { spy } from 'sinon';
import type { Constructor } from '../mixins/constructor.js';
import { EventEmitterMixin } from '../mixins/event-emitter.js';
import {
  addToggleController,
  type ToggleController,
  type ToggleEventMap,
} from './toggle.js';

describe('Toggle controller', () => {
  type ToggleHostElement = LitElement & {
    open: boolean;
    toggleController: ToggleController;
  };

  interface ToggleTestElement extends ToggleHostElement {
    transitionCalls: boolean[];
    transitionResult: boolean;
  }

  const ToggleTestBase = EventEmitterMixin<
    ToggleEventMap,
    Constructor<LitElement>
  >(LitElement);

  let defaultTag: string;
  let customTag: string;
  let supersedeTag: string;
  let instance: ToggleTestElement;

  before(() => {
    defaultTag = defineCE(
      class extends ToggleTestBase {
        public open = false;
        public readonly toggleController = addToggleController(this);
      }
    );

    customTag = defineCE(
      class extends ToggleTestBase {
        public open = false;
        public transitionCalls: boolean[] = [];
        public transitionResult = true;

        public readonly toggleController = addToggleController(this, {
          detail: () => this,
          transition: async (open) => {
            this.transitionCalls.push(open);
            this.open = open;
            await this.updateComplete;
            return this.transitionResult;
          },
        });
      }
    );

    // Mirrors the banner/dialog shape - an exit transition awaits its animation
    // and flips `open` only when nothing interrupted it.
    supersedeTag = defineCE(
      class extends ToggleTestBase {
        public open = false;

        private _exit = 0;

        public readonly toggleController = addToggleController(this, {
          transition: async (open) => {
            const exit = ++this._exit;

            if (open) {
              this.open = true;
              return true;
            }

            await this.updateComplete;

            if (exit !== this._exit) {
              return false;
            }

            this.open = false;
            return true;
          },
        });
      }
    );
  });

  async function createInstance<
    T extends ToggleHostElement = ToggleTestElement,
  >(tag: string): Promise<T> {
    const tagName = unsafeStatic(tag);
    return await fixture<T>(html`<${tagName}></${tagName}>`);
  }

  describe('Default transition', () => {
    beforeEach(async () => {
      instance = await createInstance(defaultTag);
    });

    it('should flip the host `open` property', async () => {
      expect(await instance.toggleController.show()).to.be.true;
      expect(instance.open).to.be.true;

      expect(await instance.toggleController.hide()).to.be.true;
      expect(instance.open).to.be.false;
    });

    it('should return false when the host is already in the requested state', async () => {
      expect(await instance.toggleController.hide()).to.be.false;

      await instance.toggleController.show();
      expect(await instance.toggleController.show()).to.be.false;
    });

    it('should toggle based on the current state', async () => {
      await instance.toggleController.toggle();
      expect(instance.open).to.be.true;

      await instance.toggleController.toggle();
      expect(instance.open).to.be.false;
    });

    it('should flip the state synchronously before the first await', () => {
      instance.toggleController.show();
      expect(instance.open).to.be.true;
    });

    it('should not emit events by default', async () => {
      const eventSpy = spy(instance, 'dispatchEvent');

      await instance.toggleController.show();
      await instance.toggleController.hide();

      expect(eventSpy.called).to.be.false;
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      instance = await createInstance(defaultTag);
    });

    it('should wrap opening in igcOpening/igcOpened', async () => {
      const opening = spy();
      const opened = spy();
      instance.addEventListener('igcOpening', opening);
      instance.addEventListener('igcOpened', opened);

      expect(await instance.toggleController.show(true)).to.be.true;

      expect(opening.calledOnce).to.be.true;
      expect(opened.calledOnce).to.be.true;
      expect(opening.calledBefore(opened)).to.be.true;
      expect(opening.firstCall.firstArg.cancelable).to.be.true;
      expect(opened.firstCall.firstArg.cancelable).to.be.false;
    });

    it('should wrap closing in igcClosing/igcClosed', async () => {
      await instance.toggleController.show();

      const closing = spy();
      const closed = spy();
      instance.addEventListener('igcClosing', closing);
      instance.addEventListener('igcClosed', closed);

      expect(await instance.toggleController.hide(true)).to.be.true;
      expect(closing.calledOnce).to.be.true;
      expect(closed.calledOnce).to.be.true;
    });

    it('should abort when the cancelable event is prevented', async () => {
      instance.addEventListener('igcOpening', (event) =>
        event.preventDefault()
      );
      const opened = spy();
      instance.addEventListener('igcOpened', opened);

      expect(await instance.toggleController.show(true)).to.be.false;
      expect(instance.open).to.be.false;
      expect(opened.called).to.be.false;
    });

    it('should not emit events when the host is already in the requested state', async () => {
      const closing = spy();
      instance.addEventListener('igcClosing', closing);

      expect(await instance.toggleController.hide(true)).to.be.false;
      expect(closing.called).to.be.false;
    });
  });

  describe('Custom transition', () => {
    beforeEach(async () => {
      instance = await createInstance(customTag);
    });

    it('should delegate the state change to the transition', async () => {
      await instance.toggleController.show();
      await instance.toggleController.hide();

      expect(instance.transitionCalls).to.eql([true, false]);
    });

    it('should skip the "-ed" event when the transition reports superseded', async () => {
      instance.transitionResult = false;

      const opened = spy();
      instance.addEventListener('igcOpened', opened);

      expect(await instance.toggleController.show(true)).to.be.false;
      expect(instance.open).to.be.true;
      expect(opened.called).to.be.false;
    });

    it('should pass the detail factory result to the emitted events', async () => {
      const opening = spy();
      instance.addEventListener('igcOpening', opening);

      await instance.toggleController.show(true);
      expect(opening.firstCall.firstArg.detail).to.equal(instance);
    });
  });

  describe('Superseded operations', () => {
    it('should not emit the trailing event of a superseded operation', async () => {
      instance = await createInstance(defaultTag);

      const opened = spy();
      const closed = spy();
      instance.addEventListener('igcOpened', opened);
      instance.addEventListener('igcClosed', closed);

      const opening = instance.toggleController.show(true);
      const closing = instance.toggleController.hide(true);

      expect(await opening).to.be.false;
      expect(await closing).to.be.true;
      expect(instance.open).to.be.false;
      expect(opened.called).to.be.false;
      expect(closed.calledOnce).to.be.true;
    });

    it('should reopen the host while its exit transition is in flight', async () => {
      const host = await createInstance<ToggleHostElement>(supersedeTag);
      await host.toggleController.show();

      const closed = spy();
      const opened = spy();
      host.addEventListener('igcClosed', closed);
      host.addEventListener('igcOpened', opened);

      const closing = host.toggleController.hide(true);
      const reopening = host.toggleController.show(true);

      expect(await closing).to.be.false;
      expect(await reopening).to.be.true;
      expect(host.open).to.be.true;
      expect(closed.called).to.be.false;
      expect(opened.calledOnce).to.be.true;
    });

    it('should clear the pending state after a completed transition', async () => {
      const host = await createInstance<ToggleHostElement>(supersedeTag);

      expect(await host.toggleController.show()).to.be.true;
      expect(await host.toggleController.hide()).to.be.true;
      expect(host.open).to.be.false;
      expect(await host.toggleController.show()).to.be.true;
    });
  });
});

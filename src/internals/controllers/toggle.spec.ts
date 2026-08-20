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
  interface ToggleTestElement extends LitElement {
    open: boolean;
    toggleController: ToggleController;
    transitionCalls: boolean[];
    transitionResult: boolean;
  }

  const ToggleTestBase = EventEmitterMixin<
    ToggleEventMap,
    Constructor<LitElement>
  >(LitElement);

  let defaultTag: string;
  let customTag: string;
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
  });

  async function createInstance(tag: string): Promise<ToggleTestElement> {
    const tagName = unsafeStatic(tag);
    return await fixture(html`<${tagName}></${tagName}>`);
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
});

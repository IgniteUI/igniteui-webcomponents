import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { addWeakEventListener } from './events.js';

describe('Event utilities', () => {
  describe('addWeakEventListener', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('calls a function listener', () => {
      const element = document.createElement('div');
      const listener = sinon.spy();
      const event = new Event('custom');

      addWeakEventListener(element, 'custom', listener);
      element.dispatchEvent(event);

      expect(listener.calledOnceWith(event)).to.be.true;
    });

    it('calls the `handleEvent` method of a listener object', () => {
      const element = document.createElement('div');
      const listener = { handleEvent: sinon.spy() };

      addWeakEventListener(element, 'custom', listener);
      element.dispatchEvent(new Event('custom'));

      expect(listener.handleEvent.calledOnce).to.be.true;
      expect(listener.handleEvent.firstCall.thisValue).to.equal(listener);
    });

    it('removes its wrapper once the listener is collected', () => {
      const element = document.createElement('div');
      const remove = sinon.spy(element, 'removeEventListener');
      const listener = sinon.spy();
      let collected = false;

      // Garbage collection cannot be forced, so the reference reports it.
      sinon.stub(globalThis, 'WeakRef').callsFake(function (target: object) {
        return { deref: () => (collected ? undefined : target) };
      });

      addWeakEventListener(element, 'custom', listener, { capture: true });
      element.dispatchEvent(new Event('custom'));
      expect(listener.calledOnce).to.be.true;

      collected = true;
      element.dispatchEvent(new Event('custom'));
      element.dispatchEvent(new Event('custom'));

      expect(listener.calledOnce).to.be.true;
      expect(remove.calledOnce).to.be.true;
      expect(remove.firstCall.args[0]).to.equal('custom');
      expect(remove.firstCall.args[2]).to.eql({ capture: true });
    });
  });
});

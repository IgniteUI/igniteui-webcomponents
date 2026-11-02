import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { addWeakEventListener, getEventOrigin } from './events.js';

describe('Event utilities', () => {
  describe('getEventOrigin', () => {
    let host: HTMLElement;
    let header: HTMLElement;
    let button: HTMLButtonElement;
    let origins: (Element | undefined)[];

    beforeEach(() => {
      host = document.createElement('div');
      host.attachShadow({ mode: 'open' }).innerHTML =
        '<div part="header"><slot></slot></div>';
      header = host.shadowRoot!.querySelector('[part="header"]')!;
      button = document.createElement('button');
      host.append(button);
      document.body.append(host);

      origins = [];
      host.addEventListener('custom', (event) =>
        origins.push(getEventOrigin('[part~="header"]', event))
      );
    });

    afterEach(() => {
      host.remove();
    });

    it('returns the origin when it matches the selector', () => {
      header.dispatchEvent(
        new Event('custom', { bubbles: true, composed: true })
      );
      expect(origins).to.eql([header]);
    });

    it('ignores a match deeper in the composed path', () => {
      button.dispatchEvent(
        new Event('custom', { bubbles: true, composed: true })
      );
      expect(origins).to.eql([undefined]);
    });

    it('returns undefined for an origin that is not an element', () => {
      expect(getEventOrigin('*', new Event('custom'))).to.be.undefined;
    });
  });

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

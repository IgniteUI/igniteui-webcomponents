import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import {
  addWeakEventListener,
  getEventOrigin,
  linkOpensElsewhere,
} from './events.js';

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

  describe('linkOpensElsewhere', () => {
    const click = (init?: MouseEventInit) => new MouseEvent('click', init);

    it('keeps a link without a target or with `_self` in place', () => {
      expect(linkOpensElsewhere(undefined, document)).to.be.false;
      expect(linkOpensElsewhere(null, document, click())).to.be.false;
      expect(linkOpensElsewhere('', document)).to.be.false;
      expect(linkOpensElsewhere('_SELF', document)).to.be.false;
    });

    it('opens a link with another target elsewhere', () => {
      expect(linkOpensElsewhere('_blank', document)).to.be.true;
      expect(linkOpensElsewhere('preview', document, click())).to.be.true;
    });

    it('keeps `_parent` and `_top` in place in a page that is not in a frame', () => {
      expect(window.top).to.equal(window);
      expect(linkOpensElsewhere('_parent', document)).to.be.false;
      expect(linkOpensElsewhere('_TOP', document)).to.be.false;
    });

    it('does not depend on a replaced `window.parent`', () => {
      const parent = Object.getOwnPropertyDescriptor(window, 'parent')!;
      (window as { parent: unknown }).parent = {};

      try {
        expect(linkOpensElsewhere('_parent', document)).to.be.false;
      } finally {
        Object.defineProperty(window, 'parent', parent);
      }
      expect(window.parent).to.equal(window);
    });

    it('opens `_parent` and `_top` elsewhere in a frame', () => {
      const frame = document.createElement('iframe');
      document.body.append(frame);

      try {
        const framed = frame.contentDocument!;
        expect(linkOpensElsewhere('_parent', framed)).to.be.true;
        expect(linkOpensElsewhere('_top', framed)).to.be.true;
        expect(linkOpensElsewhere('_self', framed)).to.be.false;
      } finally {
        frame.remove();
      }
    });

    it('opens a link elsewhere for another button or a modifier key', () => {
      for (const init of [
        { button: 1 },
        { altKey: true },
        { ctrlKey: true },
        { metaKey: true },
        { shiftKey: true },
      ]) {
        expect(
          linkOpensElsewhere(null, document, click(init)),
          JSON.stringify(init)
        ).to.be.true;
      }
    });

    it('uses the target of the first base element that has one', () => {
      const empty = document.createElement('base');
      const base = document.createElement('base');
      base.target = '_Blank';
      document.head.append(empty, base);

      try {
        expect(linkOpensElsewhere(null, document)).to.be.true;
        expect(linkOpensElsewhere('_self', document)).to.be.false;
      } finally {
        empty.remove();
        base.remove();
      }
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

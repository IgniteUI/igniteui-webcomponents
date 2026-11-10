import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { shiftKey, tabKey } from '../controllers/key-bindings.js';
import { simulateKeyboard } from '../testing/simulate.spec.js';
import {
  addWeakEventListener,
  focusTabStop,
  getEventOrigin,
  linkOpensElsewhere,
  preventDefault,
  runDefaultAction,
  stopPropagation,
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

  describe('runDefaultAction', () => {
    let host: HTMLElement;
    let inner: HTMLElement;
    let calls: string[];

    const dispatch = (init: EventInit): void => {
      const event = new Event('custom', init);
      inner.addEventListener(
        'custom',
        () => runDefaultAction(event, () => calls.push('action')),
        { once: true }
      );
      inner.dispatchEvent(event);
    };

    beforeEach(() => {
      host = document.createElement('div');
      inner = document.createElement('span');
      host.attachShadow({ mode: 'open' }).append(inner);
      document.body.append(host);
      calls = [];
    });

    afterEach(() => {
      host.remove();
    });

    it('runs at once for an event that is not in dispatch', () => {
      runDefaultAction(new Event('custom'), () => calls.push('action'));
      expect(calls).to.eql(['action']);
    });

    it('runs after the listeners of the host and its ancestors, in the same dispatch', async () => {
      host.addEventListener('custom', () => calls.push('host'));
      document.body.addEventListener('custom', () => calls.push('body'), {
        once: true,
      });

      dispatch({ bubbles: true, composed: true });
      expect(calls).to.eql(['host', 'body', 'action']);

      // The fallback timer is a no-op.
      await aTimeout(0);
      expect(calls).to.eql(['host', 'body', 'action']);
    });

    it('does not run when a listener cancels the event', async () => {
      host.addEventListener('custom', preventDefault);

      dispatch({ bubbles: true, composed: true, cancelable: true });
      await aTimeout(0);
      expect(calls).to.be.empty;
    });

    it('runs in the next task when a listener stops the event', async () => {
      host.addEventListener('custom', stopPropagation, { once: true });

      dispatch({ bubbles: true, composed: true });
      expect(calls).to.be.empty;

      // Only the same event runs it at the end of the path.
      inner.dispatchEvent(
        new Event('custom', { bubbles: true, composed: true })
      );
      expect(calls).to.be.empty;

      await aTimeout(0);
      expect(calls).to.eql(['action']);
    });

    it('runs in the next task for an event that does not bubble', async () => {
      dispatch({ composed: true });
      expect(calls).to.be.empty;

      await aTimeout(0);
      expect(calls).to.eql(['action']);
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

  describe('focusTabStop', () => {
    let stops: HTMLButtonElement[];

    const tab = (target: HTMLElement, shift = false) => {
      let moved = false;
      target.addEventListener(
        'keydown',
        (event) => {
          moved = focusTabStop(event, stops);
        },
        { once: true }
      );
      simulateKeyboard(target, shift ? [shiftKey, tabKey] : tabKey);
      return moved;
    };

    beforeEach(async () => {
      const root = await fixture<HTMLElement>(html`
        <div>
          <button id="a">A</button>
          <button id="b">B</button>
          <button id="c" disabled>C</button>
        </div>
      `);
      stops = Array.from(root.querySelectorAll('button'));
    });

    it('focuses the next stop, or the previous one with Shift', () => {
      expect(tab(stops[0])).to.be.true;
      expect(document.activeElement).to.equal(stops[1]);

      expect(tab(stops[1], true)).to.be.true;
      expect(document.activeElement).to.equal(stops[0]);
    });

    it('returns false past either end', () => {
      expect(tab(stops[0], true)).to.be.false;
    });

    it('returns false for a stop that does not take the focus', () => {
      expect(tab(stops[1])).to.be.false;
    });

    it('returns false for an event from outside the stops', async () => {
      const outside = await fixture<HTMLButtonElement>(
        html`<button>Out</button>`
      );
      expect(tab(outside)).to.be.false;
    });
  });
});

import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, render } from 'lit';
import sinon from 'sinon';
import {
  clearTransitionName,
  getActiveScopedViewTransition,
  getActiveViewTransition,
  scopedViewTransition,
  setTransitionName,
  startScopedViewTransition,
  startViewTransition,
} from './view-transition.js';

describe('View Transitions helpers and directive', () => {
  let matchMediaStub: sinon.SinonStub;

  beforeEach(() => {
    matchMediaStub = sinon.stub(window, 'matchMedia');
    matchMediaStub.withArgs('(prefers-reduced-motion: reduce)').returns({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: sinon.stub(),
      removeEventListener: sinon.stub(),
      dispatchEvent: sinon.stub(),
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('startViewTransition', () => {
    it('should start a document view transition', async () => {
      const callback = sinon.spy();
      const transition = startViewTransition(callback);

      expect(transition).to.be.instanceOf(ViewTransition);
      await transition.finished;
    });

    it('should skip the transition if prefers-reduced-motion is enabled', () => {
      matchMediaStub.withArgs('(prefers-reduced-motion: reduce)').returns({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
      });
      const callback = sinon.spy();
      const transition = startViewTransition(callback);

      expect(transition).to.be.instanceOf(ViewTransition);
      transition.ready.catch(() => {});
    });
  });

  describe('startScopedViewTransition', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
    });

    it('should return null if the element does not support scoped view transitions', () => {
      const result = startScopedViewTransition(
        document.createDocumentFragment() as unknown as HTMLElement,
        sinon.spy()
      );
      expect(result).to.be.null;
      expect(
        getActiveScopedViewTransition(document.createDocumentFragment() as any)
      ).to.be.null;
    });

    it('should start a scoped view transition on the target element', async () => {
      const fakeTransition = {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        skipTransition: sinon.spy(),
      } as unknown as ViewTransition;

      (mockElement as any).startViewTransition = sinon
        .stub()
        .returns(fakeTransition);

      const callback = sinon.spy();
      const transition = startScopedViewTransition(mockElement, callback);

      expect(
        (mockElement as any).startViewTransition
      ).to.have.been.calledOnceWith(callback);
      expect(transition).to.equal(fakeTransition);
    });

    it('should skip the transition if prefers-reduced-motion is enabled', () => {
      matchMediaStub.withArgs('(prefers-reduced-motion: reduce)').returns({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
      });

      const fakeTransition = {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        skipTransition: sinon.spy(),
      } as unknown as ViewTransition;

      (mockElement as any).startViewTransition = sinon
        .stub()
        .returns(fakeTransition);

      const callback = sinon.spy();
      const transition = startScopedViewTransition(mockElement, callback);

      expect(
        (mockElement as any).startViewTransition
      ).to.have.been.calledOnceWith(callback);
      expect(transition).to.equal(fakeTransition);
      expect(fakeTransition.skipTransition).to.have.been.calledOnce;
    });
  });

  describe('setTransitionName & clearTransitionName', () => {
    it('should set and clear view transition names correctly', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');

      setTransitionName(el1, 'main-header');
      expect(el1.style.viewTransitionName).to.equal('main-header');

      clearTransitionName(el1, el2);
      expect(el1.style.viewTransitionName).to.equal('');
    });
  });

  describe('getActiveViewTransition & getActiveScopedViewTransition', () => {
    it('should fetch the active document view transition', () => {
      expect(getActiveViewTransition()).to.be.null;

      startViewTransition(sinon.spy());
      expect(getActiveViewTransition()).to.be.instanceOf(ViewTransition);
    });

    it('should fetch scoped active view transitions if supported', () => {
      const mockElement = document.createElement('div') as any;
      const fakeTransition = {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: sinon.spy(),
      } as unknown as ViewTransition;

      mockElement.startViewTransition = sinon.stub().returns(fakeTransition);
      Object.defineProperty(mockElement, 'activeViewTransition', {
        value: fakeTransition,
        writable: true,
        configurable: true,
      });
      startScopedViewTransition(mockElement, sinon.spy());
      expect(getActiveScopedViewTransition(mockElement)).to.equal(
        fakeTransition
      );
    });
  });

  describe('scopedViewTransition directive', () => {
    it('should render the initial template directly without any transitions', async () => {
      const container = await fixture(html`
        <div>${scopedViewTransition(html`<span id="test">Initial</span>`)}</div>
      `);

      expect(getActiveScopedViewTransition(container as any)).to.be.null;
      expect(container.querySelector('#test')?.textContent).to.equal('Initial');
    });

    it('should start a scoped view transition when the template changes', async () => {
      const fakeTransition = {
        skipTransition: sinon.spy(),
        ready: Promise.resolve(),
      };
      const startSpy = sinon.stub().returns(fakeTransition);

      const tagName = unsafeStatic(
        defineCE(
          class extends LitElement {
            public startViewTransition = startSpy;
            constructor() {
              super();
              // Bypasses the read-only prototype getter safely
              Object.defineProperty(this, 'activeViewTransition', {
                value: fakeTransition,
                writable: true,
                enumerable: true,
                configurable: true,
              });
            }
          }
        )
      );

      function renderTemplate(text: string) {
        return html`<${tagName}>${scopedViewTransition(html`<span id="content">${text}</span>`)}</${tagName}>`;
      }

      const container = await fixture<LitElement>(renderTemplate('First'));
      expect(container.querySelector('#content')?.textContent).to.equal(
        'First'
      );
      expect(startSpy.called).to.be.false;

      render(renderTemplate('Second'), container.parentNode as HTMLElement);

      expect(startSpy).to.have.been.calledOnce;
      expect(getActiveScopedViewTransition(container as any)).to.equal(
        fakeTransition
      );
    });
  });
});

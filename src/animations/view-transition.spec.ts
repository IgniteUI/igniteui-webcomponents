import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import {
  getActiveViewTransition,
  startViewTransition,
} from './view-transition.js';

describe('View Transitions helpers', () => {
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

  describe('getActiveViewTransition', () => {
    it('should fetch the active document view transition', () => {
      expect(getActiveViewTransition()).to.be.null;

      startViewTransition(sinon.spy());
      expect(getActiveViewTransition()).to.be.instanceOf(ViewTransition);
    });
  });
});

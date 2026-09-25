import { expect } from '@open-wc/testing';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import { createTimer } from './timing.js';

describe('Timing utilities', () => {
  describe('createTimer', () => {
    let clock: SinonFakeTimers;

    beforeEach(() => {
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => {
      clock.restore();
    });

    it('should invoke the callback after the default delay', () => {
      const callback = spy();
      const timer = createTimer(callback, 100);

      timer.start();
      clock.tick(99);
      expect(callback.called).to.be.false;

      clock.tick(1);
      expect(callback.calledOnce).to.be.true;
    });

    it('should prefer an explicit delay over the default one', () => {
      const callback = spy();
      const timer = createTimer(callback, 100);

      timer.start(500);
      clock.tick(100);
      expect(callback.called).to.be.false;

      clock.tick(400);
      expect(callback.calledOnce).to.be.true;
    });

    it('should supersede a previously armed run on start', () => {
      const callback = spy();
      const timer = createTimer(callback, 100);

      timer.start();
      clock.tick(99);
      timer.start();
      clock.tick(99);
      expect(callback.called).to.be.false;

      clock.tick(1);
      expect(callback.calledOnce).to.be.true;
    });

    it('should cancel the armed run on stop', () => {
      const callback = spy();
      const timer = createTimer(callback, 100);

      timer.start();
      timer.stop();
      clock.tick(1000);

      expect(callback.called).to.be.false;
    });

    it('should report whether it is armed', () => {
      const timer = createTimer(() => {}, 100);
      expect(timer.active).to.be.false;

      timer.start();
      expect(timer.active).to.be.true;

      clock.tick(100);
      expect(timer.active).to.be.false;

      timer.start();
      timer.stop();
      expect(timer.active).to.be.false;
    });
  });
});

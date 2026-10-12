import { expect } from '@open-wc/testing';
import { createAbortHandle } from './abort-handler.js';

describe('Abort handle', () => {
  it('gives the same signal until an abort or a reset', () => {
    const handle = createAbortHandle();
    const signal = handle.signal;

    expect(handle.signal).to.equal(signal);
    expect(signal.aborted).to.be.false;
  });

  it('aborts the current signal with the reason, then gives a new one', () => {
    const handle = createAbortHandle();
    const signal = handle.signal;

    handle.abort('done');

    expect(signal.aborted).to.be.true;
    expect(signal.reason).to.equal('done');
    expect(handle.signal).to.not.equal(signal);
    expect(handle.signal.aborted).to.be.false;
  });

  it('gives a new signal on reset and leaves the previous one running', () => {
    const handle = createAbortHandle();
    const previous = handle.signal;

    handle.reset();
    const next = handle.signal;

    expect(next).to.not.equal(previous);
    expect(previous.aborted).to.be.false;

    handle.abort();
    expect(next.aborted).to.be.true;
    expect(previous.aborted).to.be.false;
  });

  it('does nothing on an abort before a signal read', () => {
    const handle = createAbortHandle();

    expect(() => handle.abort()).to.not.throw();
    expect(handle.signal.aborted).to.be.false;
  });
});

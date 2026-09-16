import { aTimeout, expect } from '@open-wc/testing';
import {
  scrollAndWaitForSettled,
  waitForScrollEnd,
  waitForScrollIdle,
} from './scroll-settle.js';

describe('scroll-settle', () => {
  let target: HTMLDivElement;

  beforeEach(() => {
    target = document.createElement('div');
  });

  it('waitForScrollEnd resolves on scrollend', async () => {
    const settled = waitForScrollEnd(target, new AbortController().signal);

    target.dispatchEvent(new Event('scrollend'));

    await settled;
  });

  it('waitForScrollIdle resolves once scroll events stop', async () => {
    const controller = new AbortController();
    let settled = false;

    waitForScrollIdle(target, controller.signal, 30).then(() => {
      settled = true;
    });

    for (let i = 0; i < 3; i++) {
      await aTimeout(10);
      target.dispatchEvent(new Event('scroll'));
    }

    // Each scroll event restarted the idle timer, so nothing has settled.
    expect(settled).to.be.false;

    await aTimeout(60);
    expect(settled).to.be.true;
  });

  it('waitForScrollIdle resolves without any scroll event', async () => {
    await waitForScrollIdle(target, new AbortController().signal, 10);
  });

  it('scrollAndWaitForSettled attaches its listener before it scrolls', async () => {
    let scrolled = false;

    // A scroll that settles synchronously inside the scroll call is only
    // observed when the listener is already attached.
    await scrollAndWaitForSettled(
      target,
      () => {
        scrolled = true;
        target.dispatchEvent(new Event('scrollend'));
      },
      1000
    );

    expect(scrolled).to.be.true;
  });

  it('scrollAndWaitForSettled resolves at the deadline without scrollend', async () => {
    await scrollAndWaitForSettled(target, () => {}, 10);
  });
});
